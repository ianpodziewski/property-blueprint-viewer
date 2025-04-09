
import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { GripVertical } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Floor, FloorPlateTemplate } from "@/hooks/usePropertyState";

interface DraggableFloorRowProps {
  floor: Floor;
  index: number;
  templates: FloorPlateTemplate[];
  onUpdateFloor: (id: string, updates: Partial<Omit<Floor, 'id'>>) => void;
  onDeleteFloor: (id: string) => void;
  onEditUnits: (floorId: string) => void;
  getFloorTemplateById: (templateId: string) => FloorPlateTemplate | undefined;
}

const DraggableFloorRow: React.FC<DraggableFloorRowProps> = ({
  floor,
  index,
  templates,
  onUpdateFloor,
  onDeleteFloor,
  onEditUnits,
  getFloorTemplateById
}) => {
  const template = getFloorTemplateById(floor.templateId);
  
  return (
    <Draggable draggableId={floor.id} index={index}>
      {(provided, snapshot) => (
        <TableRow 
          ref={provided.innerRef}
          {...provided.draggableProps}
          isDragging={snapshot.isDragging}
        >
          <TableCell className="w-10">
            <div 
              {...provided.dragHandleProps} 
              className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100"
            >
              <GripVertical className="h-5 w-5 text-gray-500" />
            </div>
          </TableCell>
          <TableCell>
            <input
              type="text"
              value={floor.label}
              onChange={(e) => onUpdateFloor(floor.id, { label: e.target.value })}
              className="w-full bg-transparent px-2 py-1 border-0 focus:ring-1 focus:ring-blue-500 rounded"
            />
          </TableCell>
          <TableCell>
            <Select
              value={floor.templateId}
              onValueChange={(value) => onUpdateFloor(floor.id, { templateId: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} ({template.grossArea.toLocaleString()} sf)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TableCell>
          <TableCell className="text-right">
            {template ? template.grossArea.toLocaleString() : "N/A"} sf
          </TableCell>
          <TableCell>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditUnits(floor.id)}
              className="h-8 px-2"
            >
              Edit Units
            </Button>
          </TableCell>
          <TableCell className="text-right">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteFloor(floor.id)}
              className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              Delete
            </Button>
          </TableCell>
        </TableRow>
      )}
    </Draggable>
  );
};

export default DraggableFloorRow;
