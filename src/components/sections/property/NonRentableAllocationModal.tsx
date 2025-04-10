import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NonRentableType, Floor } from '@/hooks/usePropertyState';

interface NonRentableAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nonRentableTypeId: string, squareFootage: number) => Promise<void>;
  nonRentableTypes: NonRentableType[];
  floor: Floor;
  floorArea: number;
  existingAllocationIds?: string[];
  editingAllocation?: {
    id: string;
    typeId: string;
    squareFootage: number;
  };
}

const NonRentableAllocationModal = ({
  isOpen,
  onClose,
  onSave,
  nonRentableTypes,
  floor,
  floorArea,
  existingAllocationIds = [],
  editingAllocation
}: NonRentableAllocationModalProps) => {
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [squareFootage, setSquareFootage] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Filter out non-rentable types that are already allocated to this floor
  const availableTypes = nonRentableTypes.filter(type => 
    !existingAllocationIds.includes(type.id) || (editingAllocation && type.id === editingAllocation.typeId)
  );

  useEffect(() => {
    // If we're editing an existing allocation, populate the form with its values
    if (editingAllocation) {
      setSelectedTypeId(editingAllocation.typeId);
      setSquareFootage(editingAllocation.squareFootage.toString());
      return;
    }
    
    // Otherwise start with empty values
    setSelectedTypeId('');
    setSquareFootage('');
  }, [editingAllocation, isOpen]);

  useEffect(() => {
    if (selectedTypeId) {
      const selectedType = nonRentableTypes.find(type => type.id === selectedTypeId);
      if (selectedType) {
        let suggestedArea = 0;
        
        if (selectedType.isPercentageBased && selectedType.percentage) {
          // Calculate based on percentage
          suggestedArea = (selectedType.percentage / 100) * floorArea;
        } else {
          // Use the defined square footage
          suggestedArea = selectedType.squareFootage;
        }
        
        setSquareFootage(suggestedArea.toString());
      }
    }
  }, [selectedTypeId, nonRentableTypes, floorArea]);

  const handleSave = async () => {
    if (!selectedTypeId || !squareFootage) return;
    
    const parsedFootage = parseFloat(squareFootage);
    if (isNaN(parsedFootage) || parsedFootage <= 0) return;
    
    setIsSaving(true);
    try {
      await onSave(selectedTypeId, parsedFootage);
      setSelectedTypeId('');
      setSquareFootage('');
      onClose();
    } catch (error) {
      console.error('Error saving non-rentable allocation:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingAllocation 
              ? `Edit Non-Rentable Space on ${floor.label}` 
              : `Add Non-Rentable Space to ${floor.label}`}
          </DialogTitle>
          <DialogDescription>
            Allocate non-rentable space to this floor.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="non-rentable-type">Non-Rentable Space Type</Label>
            <Select
              value={selectedTypeId}
              onValueChange={setSelectedTypeId}
              disabled={!!editingAllocation}
            >
              <SelectTrigger id="non-rentable-type">
                <SelectValue placeholder="Select a non-rentable space type" />
              </SelectTrigger>
              <SelectContent>
                {availableTypes.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No available non-rentable space types
                  </SelectItem>
                ) : (
                  availableTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name} ({type.allocationMethod})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="square-footage">Square Footage</Label>
            <Input
              id="square-footage"
              type="number"
              min="0"
              value={squareFootage}
              onChange={(e) => setSquareFootage(e.target.value)}
              placeholder="Enter square footage"
            />
            {selectedTypeId && (
              <p className="text-xs text-gray-500 mt-1">
                {nonRentableTypes.find(t => t.id === selectedTypeId)?.isPercentageBased 
                  ? 'Calculated from percentage of floor area'
                  : 'Suggested value from non-rentable space definition'}
              </p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            disabled={!selectedTypeId || !squareFootage || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NonRentableAllocationModal;
