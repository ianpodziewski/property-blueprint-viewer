
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
import { Floor } from "@/hooks/usePropertyState";
import { Checkbox } from "@/components/ui/checkbox";
import { applyFloorToRange } from "@/utils/floorManagement";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ApplyFloorToRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceFloor: Floor | null;
  floors: Floor[];
  onComplete: () => Promise<void>;
}

const ApplyFloorToRangeModal = ({
  isOpen,
  onClose,
  sourceFloor,
  floors,
  onComplete,
}: ApplyFloorToRangeModalProps) => {
  // Find min and max floor numbers from floor labels
  const getInitialFloorRange = () => {
    const sortedFloors = [...floors].sort((a, b) => {
      const aNum = parseInt(a.label.replace(/[^0-9]/g, '')) || 0;
      const bNum = parseInt(b.label.replace(/[^0-9]/g, '')) || 0;
      return aNum - bNum;
    });
    
    const minFloor = sortedFloors.length > 0 ? parseInt(sortedFloors[0].label.replace(/[^0-9]/g, '')) || 1 : 1;
    const maxFloor = sortedFloors.length > 0 ? parseInt(sortedFloors[sortedFloors.length - 1].label.replace(/[^0-9]/g, '')) || minFloor + 5 : 5;
    
    return { minFloor, maxFloor };
  };
  
  const { minFloor, maxFloor } = getInitialFloorRange();
  
  const [startFloor, setStartFloor] = useState<number>(minFloor);
  const [endFloor, setEndFloor] = useState<number>(maxFloor);
  const [replaceExisting, setReplaceExisting] = useState<boolean>(true);
  const [isApplying, setIsApplying] = useState(false);

  const getTargetFloorIds = (): string[] => {
    return floors
      .filter(floor => {
        const floorNumber = parseInt(floor.label.replace(/[^0-9]/g, '')) || 0;
        return floorNumber >= startFloor && floorNumber <= endFloor && floor.id !== sourceFloor?.id;
      })
      .map(floor => floor.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sourceFloor) {
      toast.error("Source floor not specified");
      return;
    }
    
    const targetFloorIds = getTargetFloorIds();
    
    if (targetFloorIds.length === 0) {
      toast.error("No floors match the selected range");
      return;
    }
    
    setIsApplying(true);
    try {
      await applyFloorToRange(sourceFloor.id, targetFloorIds, replaceExisting);
      
      toast.success(`Applied floor configuration to ${targetFloorIds.length} floors`);
      await onComplete();
      onClose();
    } catch (error) {
      console.error("Error applying floor to range:", error);
      toast.error("Failed to apply floor configuration");
    } finally {
      setIsApplying(false);
    }
  };

  const matchingFloorCount = getTargetFloorIds().length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Apply to Floor Range</DialogTitle>
            <DialogDescription>
              {sourceFloor ? (
                <>Apply configuration from "{sourceFloor.label}" to multiple floors.</>
              ) : (
                <>Select a floor configuration to apply.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-floor">Start Floor Number</Label>
                <Input
                  id="start-floor"
                  type="number"
                  min="1"
                  value={startFloor}
                  onChange={(e) => setStartFloor(parseInt(e.target.value) || 1)}
                  className="mt-1"
                  disabled={isApplying}
                />
              </div>
              <div>
                <Label htmlFor="end-floor">End Floor Number</Label>
                <Input
                  id="end-floor"
                  type="number"
                  min={startFloor}
                  value={endFloor}
                  onChange={(e) => setEndFloor(parseInt(e.target.value) || startFloor)}
                  className="mt-1"
                  disabled={isApplying}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="replace-existing" 
                checked={replaceExisting}
                onCheckedChange={(checked) => setReplaceExisting(checked === true)}
                disabled={isApplying}
              />
              <Label
                htmlFor="replace-existing"
                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Replace existing unit allocations
              </Label>
            </div>
            
            <div className="border rounded-md p-3 mt-2 bg-gray-50">
              <p className="text-sm">
                This will apply the configuration to{" "}
                <strong>{matchingFloorCount}</strong> floors
                {matchingFloorCount > 0 ? " (excluding the source floor)" : ""}.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} type="button" disabled={isApplying}>
              Cancel
            </Button>
            <Button type="submit" disabled={isApplying || !sourceFloor || matchingFloorCount === 0}>
              {isApplying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : (
                "Apply Configuration"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyFloorToRangeModal;
