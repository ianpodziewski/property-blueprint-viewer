
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
  const lastRecoveryTimeRef = useRef(0);
  const emergencyModeRef = useRef(false);
  const recoveryAttemptsRef = useRef(0);
  
  // Max consecutive recovery attempts before emergency mode
  const MAX_RECOVERY_ATTEMPTS = 3;
  // Emergency mode cooldown period (ms)
  const EMERGENCY_COOLDOWN = 8000;
  
  // Track component rendering to detect potential infinite loops
  const trackRender = useCallback((componentId: string) => {
    if (!renderCountRef.current[componentId]) {
      renderCountRef.current[componentId] = 0;
    }
    renderCountRef.current[componentId]++;
    
    // Log if a component is rendering excessively
    if (renderCountRef.current[componentId] > 50) {
      console.warn(`Component ${componentId} has rendered ${renderCountRef.current[componentId]} times. Potential infinite loop detected.`);
      
      if (recoveryAttemptsRef.current < MAX_RECOVERY_ATTEMPTS) {
        console.log("Triggering automatic recovery due to excessive renders");
        setTimeout(() => {
          forceUIRecovery();
        }, 200);
      } else {
        console.error("Multiple recovery attempts failed. Entering emergency mode.");
        emergencyModeRef.current = true;
        setTimeout(() => {
          emergencyModeRef.current = false;
          recoveryAttemptsRef.current = 0;
        }, EMERGENCY_COOLDOWN);
      }
    }
  }, []);
  
  // Reset render counters - useful when navigating
  const resetRenderCounts = useCallback(() => {
    renderCountRef.current = {};
    console.log("Render count trackers reset");
  }, []);

  const startProcessing = useCallback(() => {
    // In emergency mode, don't allow new processing to start
    if (emergencyModeRef.current) {
      console.log("Emergency mode active, ignoring processing request");
      return;
    }
    
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
    const now = Date.now();
    
    // Limit frequency of recovery attempts
    if (now - lastRecoveryTimeRef.current < 3000) {
      console.log("Recovery attempts happening too frequently, adding delay");
      setTimeout(() => forceUIRecovery(), 3000);
      return;
    }
    
    lastRecoveryTimeRef.current = now;
    recoveryAttemptsRef.current++;
    
    console.log("Force UI recovery triggered", { 
      attempt: recoveryAttemptsRef.current,
      emergencyMode: emergencyModeRef.current
    });
    
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
    
    // Clear all React event handlers that might be stuck
    document.querySelectorAll('button, a, input, select').forEach((element) => {
      const clone = element.cloneNode(true);
      if (element.parentNode) {
        element.parentNode.replaceChild(clone, element);
      }
    });
    
    toast({
      title: "UI Recovery",
      description: recoveryAttemptsRef.current > 1 ? 
        "Multiple recoveries required. The application will pause briefly to stabilize." : 
        "The interface has been refreshed.",
      duration: 2000,
    });
    
    // If we're having repeated issues, activate emergency mode
    if (recoveryAttemptsRef.current >= MAX_RECOVERY_ATTEMPTS) {
      console.warn("Activating emergency mode after multiple recovery attempts");
      emergencyModeRef.current = true;
      
      toast({
        title: "Emergency Recovery Mode",
        description: "App detected instability. Features temporarily limited to restore stability.",
        variant: "destructive",
        duration: 5000,
      });
      
      // After cooldown period, exit emergency mode
      setTimeout(() => {
        console.log("Exiting emergency mode");
        emergencyModeRef.current = false;
        recoveryAttemptsRef.current = 0;
        toast({
          title: "Normal Operation Restored",
          description: "The application has stabilized.",
          duration: 3000,
        });
      }, EMERGENCY_COOLDOWN);
    }
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
  
  // Circuit breaker for infinite loops - check every 3 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      let highRenderCount = false;
      let problematicComponents: string[] = [];
      
      // Look for components rendering excessively
      Object.entries(renderCountRef.current).forEach(([componentId, count]) => {
        if (count > 100) {
          highRenderCount = true;
          problematicComponents.push(`${componentId} (${count})`);
        }
      });
      
      if (highRenderCount && !emergencyModeRef.current) {
        console.error("Detected probable render loop in components:", problematicComponents.join(", "));
        forceUIRecovery();
      }
      
      // Reset counters periodically
      renderCountRef.current = {};
    }, 3000);
    
    return () => clearInterval(intervalId);
  }, [forceUIRecovery]);

  // Clean up any stale UI elements on mount and recovery
  useEffect(() => {
    const cleanup = () => {
      document.querySelectorAll('[role="dialog"]').forEach(dialog => {
        if (dialog.getAttribute('data-state') === 'open') {
          dialog.setAttribute('data-state', 'closed');
        }
      });
      
      // Also reset any stuck form elements
      document.querySelectorAll('input').forEach(input => {
        if (input.getAttribute('aria-invalid') === 'true') {
          input.setAttribute('aria-invalid', 'false');
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
      {/* Circuit breaker component to isolate and restart on errors */}
      {React.createElement(React.Fragment, { key: `recovery-${recoveryCount}` }, children)}
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
