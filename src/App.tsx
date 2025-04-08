
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PropertyProvider } from "./contexts/PropertyContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { createContext, useContext, useEffect, useState } from "react";
import { closeAllDialogs } from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";

const queryClient = new QueryClient();

// Create a UI recovery context
export interface UIRecoveryContextType {
  isProcessing: boolean;
  startProcessing: () => void;
  endProcessing: () => void;
  forceUIRecovery: () => void;
}

const UIRecoveryContext = createContext<UIRecoveryContextType>({
  isProcessing: false,
  startProcessing: () => {},
  endProcessing: () => {},
  forceUIRecovery: () => {},
});

export const useUIRecovery = () => useContext(UIRecoveryContext);

const UIRecoveryProvider = ({ children }: { children: React.ReactNode }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [recoveryCount, setRecoveryCount] = useState(0);

  const startProcessing = () => {
    console.log("UI Processing started");
    setIsProcessing(true);
  };

  const endProcessing = () => {
    console.log("UI Processing ended");
    setIsProcessing(false);
  };

  const forceUIRecovery = () => {
    console.log("Force UI recovery triggered");
    
    // Close any stale dialogs
    closeAllDialogs();
    
    // Force a component re-render by updating the recovery count
    setRecoveryCount(prev => prev + 1);
    
    // Reset processing state
    setIsProcessing(false);
    
    toast({
      title: "UI Recovery",
      description: "The interface has been refreshed.",
      duration: 2000,
    });
  };

  // Set up a keyboard shortcut for emergency UI recovery (Ctrl+Alt+R)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key === 'r') {
        e.preventDefault();
        forceUIRecovery();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Clean up any stale UI elements on mount
  useEffect(() => {
    const cleanup = () => {
      document.querySelectorAll('[role="dialog"]').forEach(dialog => {
        if (dialog.getAttribute('data-state') === 'open') {
          dialog.setAttribute('data-state', 'closed');
        }
      });
    };
    
    // Run cleanup on mount
    cleanup();
    
    // Set up interval to check for stuck dialogs
    const interval = setInterval(() => {
      const openDialogs = document.querySelectorAll('[role="dialog"][data-state="open"]');
      if (openDialogs.length > 0) {
        console.log("Found potentially stuck dialogs:", openDialogs.length);
        
        // Check if these dialogs are actually visible
        const visibleDialogs = Array.from(openDialogs).filter(dialog => {
          const rect = dialog.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });
        
        if (visibleDialogs.length === 0) {
          console.log("Cleaning up invisible dialogs");
          cleanup();
        }
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [recoveryCount]); // Re-run when recovery is triggered

  return (
    <UIRecoveryContext.Provider value={{ 
      isProcessing, 
      startProcessing, 
      endProcessing, 
      forceUIRecovery 
    }}>
      {children}
    </UIRecoveryContext.Provider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <UIRecoveryProvider>
        <PropertyProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </PropertyProvider>
      </UIRecoveryProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
