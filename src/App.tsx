
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PropertyProvider } from "./contexts/PropertyContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { closeAllDialogs } from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";

// Create a more stable QueryClient with retry settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Reduce retries to prevent loop issues
      staleTime: 30000, // Increase stale time to reduce refetches
    },
  }
});

// Create a UI recovery context
export interface UIRecoveryContextType {
  isProcessing: boolean;
  startProcessing: () => void;
  endProcessing: () => void;
  forceUIRecovery: () => void;
  resetRenderCounts: () => void;
}

const UIRecoveryContext = createContext<UIRecoveryContextType>({
  isProcessing: false,
  startProcessing: () => {},
  endProcessing: () => {},
  forceUIRecovery: () => {},
  resetRenderCounts: () => {},
});

export const useUIRecovery = () => useContext(UIRecoveryContext);

const MAX_PROCESSING_TIME = 5000; // Maximum time to allow processing state

const UIRecoveryProvider = ({ children }: { children: React.ReactNode }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [recoveryCount, setRecoveryCount] = useState(0);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const renderCountRef = useRef<Record<string, number>>({});
  
  // Track component rendering to detect potential infinite loops
  const trackRender = useCallback((componentId: string) => {
    if (!renderCountRef.current[componentId]) {
      renderCountRef.current[componentId] = 0;
    }
    renderCountRef.current[componentId]++;
    
    // Log if a component is rendering excessively
    if (renderCountRef.current[componentId] > 50) {
      console.warn(`Component ${componentId} has rendered ${renderCountRef.current[componentId]} times. Potential infinite loop detected.`);
    }
  }, []);
  
  // Reset render counters - useful when navigating
  const resetRenderCounts = useCallback(() => {
    renderCountRef.current = {};
    console.log("Render count trackers reset");
  }, []);

  const startProcessing = useCallback(() => {
    console.log("UI Processing started");
    setIsProcessing(true);
    
    // Safety timeout to prevent stuck processing state
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }
    
    processingTimeoutRef.current = setTimeout(() => {
      console.log("Processing timeout exceeded. Force ending processing state.");
      setIsProcessing(false);
    }, MAX_PROCESSING_TIME);
  }, []);

  const endProcessing = useCallback(() => {
    console.log("UI Processing ended");
    
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }
    
    setIsProcessing(false);
  }, []);

  const forceUIRecovery = useCallback(() => {
    console.log("Force UI recovery triggered");
    
    // Cancel any ongoing processing timeout
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }
    
    // Close any stale dialogs
    closeAllDialogs();
    
    // Force a component re-render by updating the recovery count
    setRecoveryCount(prev => prev + 1);
    
    // Reset processing state
    setIsProcessing(false);
    
    // Reset render counters
    resetRenderCounts();
    
    toast({
      title: "UI Recovery",
      description: "The interface has been refreshed.",
      duration: 2000,
    });
  }, [resetRenderCounts]);

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
  }, [forceUIRecovery]);

  // Cleanup processingTimeout on unmount
  useEffect(() => {
    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);

  // Clean up any stale UI elements on mount and recovery
  useEffect(() => {
    const cleanup = () => {
      document.querySelectorAll('[role="dialog"]').forEach(dialog => {
        if (dialog.getAttribute('data-state') === 'open') {
          dialog.setAttribute('data-state', 'closed');
        }
      });
    };
    
    // Run cleanup on mount and recovery
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
      forceUIRecovery,
      resetRenderCounts
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
