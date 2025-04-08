
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Edit, Trash } from "lucide-react";
import { FloorConfiguration, FloorPlateTemplate } from "@/types/propertyTypes";
import FloorDetailView from "./FloorDetailView";
import { AnimatePresence, motion } from "framer-motion";

// Add framer-motion dependency
<lov-add-dependency>framer-motion@latest</lov-add-dependency>

interface ExpandableFloorRowProps {
  floor: FloorConfiguration;
  floorTemplates: FloorPlateTemplate[];
  isSelected: boolean;
  onSelect: (floorNumber: number) => void;
  onEdit: (floorNumber: number) => void;
  onDelete: (floorNumber: number) => void;
  reorderFloor: (floorNumber: number, direction: "up" | "down") => void;
  updateFloorConfiguration: (floorNumber: number, field: keyof FloorConfiguration, value: any) => void;
  getTemplateName: (templateId: string | null) => string;
  totalRows: number;
  isExpanded?: boolean;
  onToggleExpand?: (floorNumber: number) => void;
}

const getBadgeColorForUse = (useType: string): string => {
  switch (useType) {
    case "residential": return "bg-blue-50 text-blue-800";
    case "office": return "bg-green-50 text-green-800";
    case "retail": return "bg-amber-50 text-amber-800";
    case "parking": return "bg-gray-50 text-gray-800";
    case "hotel": return "bg-purple-50 text-purple-800";
    case "amenities": return "bg-pink-50 text-pink-800";
    case "storage": return "bg-yellow-50 text-yellow-800";
    case "mechanical": return "bg-slate-50 text-slate-800";
    default: return "bg-gray-50 text-gray-800";
  }
};

const ExpandableFloorRow: React.FC<ExpandableFloorRowProps> = ({
  floor,
  floorTemplates,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  reorderFloor,
  updateFloorConfiguration,
  getTemplateName,
  totalRows,
  isExpanded = false,
  onToggleExpand
}) => {
  const template = floorTemplates.find(t => t.id === floor.templateId);
  const floorArea = floor.customSquareFootage && floor.customSquareFootage !== "" 
    ? floor.customSquareFootage 
    : template?.squareFootage || "0";
  const spacesCount = floor.spaces?.length || 0;
  
  const handleRowClick = useCallback(() => {
    if (onToggleExpand) {
      onToggleExpand(floor.floorNumber);
    }
  }, [floor.floorNumber, onToggleExpand]);

  return (
    <>
      <TableRow 
        className={`${isSelected ? 'bg-blue-50' : ''} ${isExpanded ? 'border-b-0' : ''} hover:bg-slate-50 cursor-pointer transition-colors`}
        onClick={handleRowClick}
      >
        <TableCell className="p-2">
          <Checkbox 
            checked={isSelected} 
            onCheckedChange={() => onSelect(floor.floorNumber)}
            onClick={(e) => e.stopPropagation()}
          />
        </TableCell>
        <TableCell>
          <div className="flex items-center">
            <Badge variant={floor.isUnderground ? "outline" : "default"} className="mr-1">
              {floor.floorNumber}
            </Badge>
            <div className="flex flex-col ml-1">
              <div className="flex gap-1">
                {floor.floorNumber > 1 && !floor.isUnderground && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5"
                    onClick={(e) => {
                      e.stopPropagation();
                      reorderFloor(floor.floorNumber, "down");
                    }}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                )}
                {floor.floorNumber < 0 && floor.isUnderground && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5"
                    onClick={(e) => {
                      e.stopPropagation();
                      reorderFloor(floor.floorNumber, "up");
                    }}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                )}
                {((floor.isUnderground && floor.floorNumber !== -1) || 
                    (!floor.isUnderground && floor.floorNumber !== 1)) && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5"
                    onClick={(e) => {
                      e.stopPropagation();
                      reorderFloor(floor.floorNumber, floor.isUnderground ? "down" : "up");
                    }}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          {floor.templateId ? (
            getTemplateName(floor.templateId)
          ) : (
            <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
              Custom
            </Badge>
          )}
        </TableCell>
        <TableCell className="text-right">
          {parseInt(floorArea).toLocaleString()} sf
        </TableCell>
        <TableCell className="text-center">
          <Badge 
            variant="outline" 
            className={`capitalize ${getBadgeColorForUse(floor.primaryUse || "office")}`}
          >
            {floor.primaryUse || "office"}
          </Badge>
        </TableCell>
        <TableCell className="text-center">
          {spacesCount > 0 ? (
            <Badge variant="outline" className="bg-blue-50 text-blue-800">
              {spacesCount}
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-100 text-gray-600">
              0
            </Badge>
          )}
        </TableCell>
        <TableCell className="text-center">
          <div className="flex justify-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(floor.floorNumber);
              }}
              title="Edit floor"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(floor.floorNumber);
              }}
              title="Delete floor"
            >
              <Trash className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleExpand) onToggleExpand(floor.floorNumber);
              }}
              title={isExpanded ? "Collapse details" : "Expand details"}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </TableCell>
      </TableRow>
      
      <AnimatePresence>
        {isExpanded && (
          <TableRow>
            <TableCell colSpan={7} className="p-0 border-t-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-slate-50 border-t border-dashed">
                  <FloorDetailView 
                    floor={floor}
                    floorTemplates={floorTemplates}
                    updateFloorConfiguration={updateFloorConfiguration}
                  />
                </div>
              </motion.div>
            </TableCell>
          </TableRow>
        )}
      </AnimatePresence>
    </>
  );
};

export default ExpandableFloorRow;
