
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown, ArrowUpDown, Pencil, Trash } from "lucide-react";
import FloorDetailView from "./FloorDetailView";
import { FloorConfiguration, FloorPlateTemplate } from "@/types/propertyTypes";
import { useUnitAllocations } from "@/hooks/property/useUnitAllocations";

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
          onClick={() => onToggleExpand(floor.floorNumber)}
        >
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 mr-1 -ml-2"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(floor.floorNumber);
              }}
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
        <TableCell onClick={() => onToggleExpand(floor.floorNumber)} className="cursor-pointer">
          {getTemplateName(floor.templateId)}
        </TableCell>
        <TableCell onClick={() => onToggleExpand(floor.floorNumber)} className="text-right cursor-pointer">
          {parseInt(floorArea).toLocaleString()}
        </TableCell>
        <TableCell onClick={() => onToggleExpand(floor.floorNumber)} className="text-center cursor-pointer">
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
              onClick={() => reorderFloor(floor.floorNumber, "up")}
              disabled={floor.isUnderground ? floor.floorNumber <= -10 : floor.floorNumber >= totalRows}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8"
              onClick={() => reorderFloor(floor.floorNumber, "down")}
              disabled={floor.isUnderground ? floor.floorNumber >= -1 : floor.floorNumber <= 1}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8"
              onClick={onEdit}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(floor.floorNumber);
              }}
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
