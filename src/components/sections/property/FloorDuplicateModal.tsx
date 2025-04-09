
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface FloorDuplicateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDuplicate: (newLabel: string, positionType: "above" | "below") => Promise<void>;
  currentFloorLabel: string;
  isLoading: boolean;
}

const FloorDuplicateModal = ({
  isOpen,
  onClose,
  onDuplicate,
  currentFloorLabel,
  isLoading,
}: FloorDuplicateModalProps) => {
  const suggestedLabel = generateSuggestedLabel(currentFloorLabel);
  const [newLabel, setNewLabel] = useState(suggestedLabel);
  const [positionType, setPositionType] = useState<"above" | "below">("below");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onDuplicate(newLabel, positionType);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Duplicate Floor</DialogTitle>
            <DialogDescription>
              Create a copy of "{currentFloorLabel}" with the same template and unit allocations.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-floor-label" className="col-span-4">
                New Floor Label
              </Label>
              <Input
                id="new-floor-label"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="col-span-4"
                autoFocus
                required
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="col-span-4">Position</Label>
              <RadioGroup
                value={positionType}
                onValueChange={(v) => setPositionType(v as "above" | "below")}
                className="col-span-4 space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="above" id="above" />
                  <Label htmlFor="above">Above current floor</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="below" id="below" />
                  <Label htmlFor="below">Below current floor</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} type="button" disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Duplicating
                </>
              ) : (
                "Duplicate Floor"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Helper function to generate a suggested label for the new floor
function generateSuggestedLabel(currentLabel: string): string {
  // Try to find a number pattern in the label (e.g., "Floor 5" -> "Floor 6")
  const numberMatch = currentLabel.match(/(\d+)/);
  
  if (numberMatch && numberMatch[1]) {
    const currentNumber = parseInt(numberMatch[1], 10);
    const newNumber = currentNumber + 1;
    return currentLabel.replace(/\d+/, newNumber.toString());
  }
  
  // If no number pattern found, just append "Copy" to the label
  return `${currentLabel} Copy`;
}

export default FloorDuplicateModal;
