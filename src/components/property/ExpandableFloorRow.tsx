
import React, { memo, useCallback } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown, Pencil, Trash } from "lucide-react";
import FloorDetailView from "./FloorDetailView";
import { FloorConfiguration, FloorPlateTemplate } from "@/types/propertyTypes";
import { useUnitAllocations } from "@/hooks/property/useUnitAllocations";
import { useFloorExpansion } from "@/contexts/FloorExpansionContext";

interface ExpandableFloorRowProps {
  floor: FloorConfiguration;
  floorTemplates: FloorPlateTemplate[];
  isSelected: boolean;
  onSelect: (floorNumber: number) => void;
  onEdit: () => void;
  onDelete: (floorNumber: number) => void;
  reorderFloor: (floorNumber: number, direction: "up" | "down") => void;
  updateFloorConfiguration: (floorNumber: number, field: keyof FloorConfiguration, value: any) => void;
  getTemplateName: (templateId: string | null) => string;
  totalRows: number;
}

// Use React.memo with custom equality check to prevent unnecessary re-renders
const ExpandableFloorRow: React.FC<ExpandableFloorRowProps> = memo(({
  floor,
  floorTemplates,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  reorderFloor,
  updateFloorConfiguration,
  getTemplateName,
  totalRows
}) => {
  // Use the floor expansion context instead of local state or parent state
  const { isFloorExpanded, toggleFloorExpansion } = useFloorExpansion();
  
  // Check if this floor is expanded from the context
  const effectiveIsExpanded = isFloorExpanded(floor.floorNumber);
  
  const { getAllocationsByFloor } = useUnitAllocations();
  
  // Create memoized event handlers with explicit useCallback to prevent rerenders
  const handleSelect = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(floor.floorNumber);
  }, [onSelect, floor.floorNumber]);
  
  const handleToggleExpand = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Use the context function directly
    toggleFloorExpansion(floor.floorNumber);
  }, [toggleFloorExpansion, floor.floorNumber]);
  
  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit();
  }, [onEdit]);
  
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(floor.floorNumber);
  }, [onDelete, floor.floorNumber]);
  
  const handleReorderUp = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    reorderFloor(floor.floorNumber, "up");
  }, [reorderFloor, floor.floorNumber]);
  
  const handleReorderDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    reorderFloor(floor.floorNumber, "down");
  }, [reorderFloor, floor.floorNumber]);
  
  const handleRowClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleToggleExpand(e);
  }, [handleToggleExpand]);
  
  const template = floorTemplates.find(t => t.id === floor.templateId);
  const floorArea = floor.customSquareFootage && floor.customSquareFootage !== ""
    ? floor.customSquareFootage
    : template?.squareFootage || "0";
  
  const spaceCount = floor.spaces?.length || 0;
  const floorAllocations = getAllocationsByFloor(floor.floorNumber);
  const unitCount = floorAllocations.reduce(
    (sum, allocation) => {
      // Safely parse the count or return 0
      const count = allocation.count ? parseInt(allocation.count.toString()) : 0;
      return sum + (isNaN(count) ? 0 : count);
    }, 0
  );
  
  // Safe parsing to prevent toLocaleString errors
  const safeParseInt = (value: string): number => {
    try {
      const parsed = parseInt(value);
      return isNaN(parsed) ? 0 : parsed;
    } catch (e) {
      return 0;
    }
  };
  
  const floorAreaFormatted = safeParseInt(floorArea).toLocaleString();
  
  return (
    <>
      <TableRow 
        className={effectiveIsExpanded ? "bg-gray-50" : ""}
        onClick={handleRowClick} // Main row click expands
      >
        <TableCell className="relative" onClick={(e) => e.stopPropagation()}>
          <Checkbox 
            checked={isSelected} 
            onCheckedChange={() => onSelect(floor.floorNumber)}
          />
        </TableCell>
        <TableCell className="font-medium">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 mr-1 -ml-2"
              onClick={handleToggleExpand}
            >
              {effectiveIsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Badge
              variant={floor.isUnderground ? "outline" : "secondary"}
              className={floor.isUnderground ? "bg-gray-100" : ""}
            >
              {floor.floorNumber}
            </Badge>
          </div>
        </TableCell>
        <TableCell>
          {getTemplateName(floor.templateId)}
        </TableCell>
        <TableCell className="text-right">
          {floorAreaFormatted}
        </TableCell>
        <TableCell className="text-center">
          <Badge variant="outline" className="capitalize">
            {floor.primaryUse}
          </Badge>
        </TableCell>
        <TableCell className="text-center">
          <div className="flex items-center justify-center space-x-1">
            {spaceCount > 0 && (
              <Badge variant="outline" className="bg-blue-50">
                {spaceCount} spaces
              </Badge>
            )}
            {unitCount > 0 && (
              <Badge variant="outline" className="bg-green-50">
                {unitCount} units
              </Badge>
            )}
          </div>
        </TableCell>
        <TableCell onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8"
              onClick={handleReorderUp}
              disabled={floor.isUnderground ? floor.floorNumber <= -10 : floor.floorNumber >= totalRows}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8"
              onClick={handleReorderDown}
              disabled={floor.isUnderground ? floor.floorNumber >= -1 : floor.floorNumber <= 1}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8"
              onClick={handleEdit}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={handleDelete}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {effectiveIsExpanded && (
        <TableRow>
          <TableCell colSpan={7} className="p-4 bg-gray-50">
            <FloorDetailView
              floor={floor}
              floorTemplates={floorTemplates}
              updateFloorConfiguration={updateFloorConfiguration}
            />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}, (prevProps, nextProps) => {
  // Custom equality check to prevent unnecessary renders
  return (
    prevProps.floor.floorNumber === nextProps.floor.floorNumber &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.floor.templateId === nextProps.floor.templateId &&
    prevProps.floor.primaryUse === nextProps.floor.primaryUse &&
    prevProps.totalRows === nextProps.totalRows
    // Intentionally not comparing complete floor objects to avoid deep equality checks
  );
});

ExpandableFloorRow.displayName = "ExpandableFloorRow";

export default ExpandableFloorRow;
