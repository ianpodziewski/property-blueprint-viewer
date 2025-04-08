
import React, { useRef, useEffect, useState, useCallback } from "react";
import Header from "@/components/Header";
import ModelingTabs from "@/components/ModelingTabs";
import SaveNotification from "@/components/SaveNotification";
import { useModelState } from "@/hooks/useModelState";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Save, Upload } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { isLocalStorageAvailable } from "@/hooks/useLocalStoragePersistence";
import { Toaster } from "@/components/ui/toaster";

// Maximum render count before warning
const MAX_RENDERS = 100;

const Index = () => {
  // Track render count for debugging
  const renderCount = useRef(0);
  
  // Track if the component is mounted
  const isMounted = useRef(false);
  
  // Get model state
  const { saveStatus, clearSaveStatus, resetAllData, exportAllData, importAllData } = useModelState();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Check localStorage availability once
  const [isStorageAvailable, setIsStorageAvailable] = useState<boolean | null>(null);
  
  // Track scroll position
  const scrollPositionRef = useRef(0);
  
  useEffect(() => {
    // Save scroll position before updates
    const saveScrollPosition = () => {
      scrollPositionRef.current = window.scrollY;
    };
    
    // Restore scroll position after updates
    const restoreScrollPosition = () => {
      if (scrollPositionRef.current > 0) {
        window.scrollTo(0, scrollPositionRef.current);
      }
    };
    
    window.addEventListener('beforeunload', saveScrollPosition);
    window.addEventListener('load', restoreScrollPosition);
    
    return () => {
      window.removeEventListener('beforeunload', saveScrollPosition);
      window.removeEventListener('load', restoreScrollPosition);
    };
  }, []);
  
  useEffect(() => {
    // Only check localStorage once
    if (isStorageAvailable === null) {
      setIsStorageAvailable(isLocalStorageAvailable());
    }
    
    // Mark component as mounted
    isMounted.current = true;
    
    // Count render and warn if excessive
    renderCount.current += 1;
    if (renderCount.current % 10 === 0) {
      console.log(`Index render count: ${renderCount.current}`);
    }
    
    if (renderCount.current > MAX_RENDERS) {
      console.warn(`Excessive renders detected: ${renderCount.current} renders in Index component`);
    }
    
    // Cleanup on unmount
    return () => {
      isMounted.current = false;
    };
  }, [isStorageAvailable]);

  const handleImportClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      importAllData(files[0]);
    }
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [importAllData]);

  // Show fallback while checking localStorage
  if (isStorageAvailable === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <p className="text-lg text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  // Show warning if localStorage is not available
  if (isStorageAvailable === false) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-4 rounded mb-6">
            <h3 className="font-bold">Local Storage Not Available</h3>
            <p>Your browser does not support or has disabled localStorage, which is required for saving data between sessions.</p>
            <p className="mt-2">Please enable localStorage in your browser settings or try a different browser.</p>
          </div>
          <ModelingTabs />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Header />
      <main className="container mx-auto px-4 py-6 relative overflow-visible">
        <div className="flex justify-end mb-4 gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={exportAllData}
          >
            <Save className="h-4 w-4" />
            Export Data
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleImportClick}
          >
            <Upload className="h-4 w-4" />
            Import Data
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Reset All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset all model data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All saved data will be permanently removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={resetAllData}>
                  Reset All Data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="overflow-visible">
          <ModelingTabs />
        </div>
      </main>
      {/* Save notification */}
      <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
        <SaveNotification status={saveStatus} onClose={clearSaveStatus} />
      </div>
      {/* Global toast provider */}
      <Toaster />
    </div>
  );
};

export default Index;
