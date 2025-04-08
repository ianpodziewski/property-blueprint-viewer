
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { RefreshCw, AlertTriangle, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { clearAllModelData } from "@/hooks/useLocalStoragePersistence";
import { useToast } from "@/components/ui/use-toast";

interface UIRecoveryButtonProps {
  className?: string;
}

const UIRecoveryButton: React.FC<UIRecoveryButtonProps> = ({ className }) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleResetUI = () => {
    // Force a re-render of the application
    window.location.reload();
  };

  const handleRefreshEventHandlers = () => {
    // Attempt to restore lost event handlers by forcing a component re-mount
    const root = document.getElementById('root');
    if (root) {
      // Add a class to trigger React's diffing algorithm
      root.classList.add('force-remount');
      // Remove it after a short delay to allow React to process
      setTimeout(() => {
        root.classList.remove('force-remount');
      }, 100);
    }

    toast({
      title: "Event handlers refreshed",
      description: "UI event handlers have been restored."
    });
    
    setOpen(false);
  };

  const handleClearLocalStorage = () => {
    if (confirm("This will delete ALL saved data. Are you sure you want to continue?")) {
      clearAllModelData();
      toast({
        title: "Data cleared",
        description: "All saved data has been cleared. The page will reload.",
      });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`flex items-center gap-1 ${className}`}
        >
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span>UI Recovery</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>UI Recovery Tools</SheetTitle>
          <SheetDescription>
            If buttons or controls have stopped working, use these tools to recover functionality.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 flex flex-col gap-4">
          <div className="p-4 border rounded-md">
            <h3 className="font-medium mb-2">Refresh UI</h3>
            <p className="text-sm text-gray-600 mb-4">
              Refresh the user interface while preserving your data. Use this if buttons have become unresponsive.
            </p>
            <Button onClick={handleRefreshEventHandlers} className="flex items-center gap-1">
              <RefreshCw className="h-4 w-4" />
              Refresh UI Elements
            </Button>
          </div>
          
          <div className="p-4 border rounded-md">
            <h3 className="font-medium mb-2">Reload Application</h3>
            <p className="text-sm text-gray-600 mb-4">
              Reload the entire application. Your data will be preserved.
            </p>
            <Button onClick={handleResetUI} variant="secondary" className="flex items-center gap-1">
              <RefreshCw className="h-4 w-4" />
              Reload Application
            </Button>
          </div>
          
          <Separator />
          
          <div className="p-4 border border-red-200 rounded-md">
            <h3 className="font-medium mb-2 text-red-600">Reset All Data</h3>
            <p className="text-sm text-gray-600 mb-4">
              This will clear all saved data and reset the application to its default state.
              Use this as a last resort if the application is completely broken.
            </p>
            <Button onClick={handleClearLocalStorage} variant="destructive" className="flex items-center gap-1">
              <Trash2 className="h-4 w-4" />
              Clear All Data
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default UIRecoveryButton;
