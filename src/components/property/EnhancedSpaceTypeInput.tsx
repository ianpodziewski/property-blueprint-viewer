
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SpaceTypeProps {
  id: string;
  type: string;
  squareFootage: string;
  units: string;
  phase: string;
  floorAllocation: Record<number, string>;
  onUpdate: (id: string, field: string, value: string) => void;
  onUpdateFloorAllocation: (id: string, floor: number, value: string) => void;
  onRemove: (id: string) => void;
  availableFloors: number;
}

const EnhancedSpaceTypeInput = ({
  id,
  type,
  squareFootage,
  units,
  phase,
  floorAllocation,
  onUpdate,
  onUpdateFloorAllocation,
  onRemove,
  availableFloors
}: SpaceTypeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Generate floor numbers array
  const floorNumbers = Array.from({ length: availableFloors }, (_, i) => i + 1);
  
  // Calculate total allocation percentage
  const totalAllocation = Object.values(floorAllocation)
    .reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    
  const isAllocationComplete = Math.abs(totalAllocation - 100) < 0.01;
  
  return (
    <div className="border border-gray-200 rounded-md p-4">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor={`space-type-${id}`}>Space Type</Label>
          <Select 
            value={type} 
            onValueChange={(value) => onUpdate(id, "type", value)}
          >
            <SelectTrigger id={`space-type-${id}`}>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="office">Office</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="parking">Parking</SelectItem>
              <SelectItem value="hotel">Hotel</SelectItem>
              <SelectItem value="amenities">Amenities</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`square-footage-${id}`}>Gross Area (sq ft)</Label>
          <Input 
            id={`square-footage-${id}`} 
            placeholder="0" 
            type="number" 
            value={squareFootage}
            onChange={(e) => onUpdate(id, "squareFootage", e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`phase-${id}`}>Phasing</Label>
          <Select 
            value={phase}
            onValueChange={(value) => onUpdate(id, "phase", value)}
          >
            <SelectTrigger id={`phase-${id}`}>
              <SelectValue placeholder="Select phase" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="phase1">Phase 1</SelectItem>
              <SelectItem value="phase2">Phase 2</SelectItem>
              <SelectItem value="phase3">Phase 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-end justify-end md:col-span-1">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => onRemove(id)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex justify-between items-center text-sm text-gray-600 mt-2">
        <div>
          <span>Total Area: </span>
          <span className="font-medium">{parseInt(squareFootage || "0").toLocaleString()} sq ft</span>
        </div>
        
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full md:w-auto">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-1 h-7">
              Floor Allocation
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 bg-gray-50 rounded-md p-3">
            <div className="space-y-3">
              <div className="text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span>Allocation by Floor</span>
                  <span className={`font-medium ${isAllocationComplete ? 'text-green-600' : 'text-amber-600'}`}>
                    {totalAllocation.toFixed(1)}%
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {floorNumbers.map(floor => (
                    <div key={floor} className="flex flex-col items-center">
                      <Label htmlFor={`floor-${id}-${floor}`} className="text-xs mb-1">Floor {floor}</Label>
                      <Input 
                        id={`floor-${id}-${floor}`} 
                        value={floorAllocation[floor] || "0"}
                        onChange={(e) => onUpdateFloorAllocation(id, floor, e.target.value)}
                        className="w-16 text-sm h-8"
                        type="number"
                        min="0"
                        max="100"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default EnhancedSpaceTypeInput;
