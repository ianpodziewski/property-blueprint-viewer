
import React, { useState, useCallback } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown, ArrowUpDown, Pencil, Trash } from "lucide-react";
import FloorDetailView from "./FloorDetailView";
import { FloorConfiguration, FloorPlateTemplate } from "@/types/propertyTypes";
import { useUnitAllocations } from "@/hooks/property/useUnitAllocations";
import { markUIInteractionInProgress } from "../SaveNotification";

interface ExpandableFloorRowProps {
  floor: FloorConfiguration;
  floorTemplates: FloorPlateTemplate[];
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: (floorNumber: number) => void;
  onEdit: () => void;
  onDelete: (floorNumber: number) => void;
  onToggleExpand: (floorNumber: number) => void;
  reorderFloor: (floorNumber: number, direction: "up" | "down") => void;
  updateFloorConfiguration: (floorNumber: number, field: keyof FloorConfiguration, value: any) => void;
  getTemplateName: (templateId: string | null) => string;
  totalRows: number;
}

const ExpandableFloorRow: React.FC<ExpandableFloorRowProps> = ({
  floor,
  floorTemplates,
  isSelected,
  isExpanded,
  onSelect,
  onEdit,
  onDelete,
  onToggleExpand,
  reorderFloor,
  updateFloorConfiguration,
  getTemplateName,
  totalRows
}) => {
  const { getAllocationsByFloor } = useUnitAllocations();
  
  const template = floorTemplates.find(t => t.id === floor.templateId);
  const floorArea = floor.customSquareFootage && floor.customSquareFootage !== ""
    ? floor.customSquareFootage
    : template?.squareFootage || "0";
  
  const spaceCount = floor.spaces?.length || 0;
  const floorAllocations = getAllocationsByFloor(floor.floorNumber);
  const unitCount = floorAllocations.reduce(
    (sum, allocation) => sum + parseInt(allocation.count as string || "0"), 0
  );
  
  // Use useCallback to stabilize event handlers
  const handleToggleExpand = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Mark that a UI interaction is in progress to suppress notifications
    markUIInteractionInProgress();
    
    console.log(`Toggling expansion for floor ${floor.floorNumber}. Current state: ${isExpanded}, changing to: ${!isExpanded}`);
    onToggleExpand(floor.floorNumber);
  }, [floor.floorNumber, isExpanded, onToggleExpand]);

  const handleSelect = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(floor.floorNumber);
  }, [floor.floorNumber, onSelect]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit();
  }, [onEdit]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(floor.floorNumber);
  }, [floor.floorNumber, onDelete]);

  const handleReorder = useCallback((direction: "up" | "down") => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`Reordering floor ${floor.floorNumber} direction: ${direction}`);
    reorderFloor(floor.floorNumber, direction);
  }, [floor.floorNumber, reorderFloor]);
  
  return (
    <>
      <TableRow className={isExpanded ? "bg-gray-50" : ""}>
        <TableCell>
          <Checkbox 
            checked={isSelected} 
            onCheckedChange={() => onSelect(floor.floorNumber)}
            onClick={(e) => e.stopPropagation()}
          />
        </TableCell>
        <TableCell 
          className="font-medium cursor-pointer"
          onClick={handleToggleExpand}
        >
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 mr-1 -ml-2"
              onClick={handleToggleExpand}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Badge
              variant={floor.isUnderground ? "outline" : "secondary"}
              className={floor.isUnderground ? "bg-gray-100" : ""}
            >
              {floor.floorNumber}
            </Badge>
          </div>
        </TableCell>
        <TableCell onClick={handleToggleExpand} className="cursor-pointer">
          {getTemplateName(floor.templateId)}
        </TableCell>
        <TableCell onClick={handleToggleExpand} className="text-right cursor-pointer">
          {parseInt(floorArea).toLocaleString()}
        </TableCell>
        <TableCell onClick={handleToggleExpand} className="text-center cursor-pointer">
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
        <TableCell>
          <div className="flex items-center justify-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8"
              onClick={handleReorder("up")}
              disabled={floor.isUnderground ? floor.floorNumber <= -10 : floor.floorNumber >= totalRows}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8"
              onClick={handleReorder("down")}
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
      {isExpanded && (
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
};

export default ExpandableFloorRow;
