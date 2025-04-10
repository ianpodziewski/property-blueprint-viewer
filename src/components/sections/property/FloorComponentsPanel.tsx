
import React from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface FloorComponentsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  floorId: string;
  floorLabel: string;
}

const FloorComponentsPanel: React.FC<FloorComponentsPanelProps> = ({
  isOpen,
  onClose,
  floorId,
  floorLabel
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Floor Components</SheetTitle>
          <SheetDescription>
            Configure components for {floorLabel}
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Components</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <Separator />
          
          <div className="text-sm text-gray-500">
            This functionality will be implemented in the next phase.
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FloorComponentsPanel;
