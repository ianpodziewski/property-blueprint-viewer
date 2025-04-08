import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PropertyProvider } from "./contexts/PropertyContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import React, { createContext, useContext, useEffect, useState, useRef, useCallback, Fragment } from "react";
import { closeAllDialogs } from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  }
});

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

const MAX_PROCESSING_TIME = 5000;

const UIRecoveryProvider = ({ children }: { children: React.ReactNode }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [recoveryCount, setRecoveryCount] = useState(0);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const renderCountRef = useRef<Record<string, number>>({});
  const lastRecoveryTimeRef = useRef(0);
  const emergencyModeRef = useRef(false);
  const recoveryAttemptsRef = useRef(0);
  
  const MAX_RECOVERY_ATTEMPTS = 3;
  const EMERGENCY_COOLDOWN = 8000;
  
  const trackRender = useCallback((componentId: string) => {
    if (!renderCountRef.current[componentId]) {
      renderCountRef.current[componentId] = 0;
    }
    renderCountRef.current[componentId]++;
    
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
  
  const resetRenderCounts = useCallback(() => {
    renderCountRef.current = {};
    console.log("Render count trackers reset");
  }, []);

  const startProcessing = useCallback(() => {
    if (emergencyModeRef.current) {
      console.log("Emergency mode active, ignoring processing request");
      return;
    }
    
    console.log("UI Processing started");
    setIsProcessing(true);
    
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
    
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }
    
    closeAllDialogs();
    
    setRecoveryCount(prev => prev + 1);
    
    setIsProcessing(false);
    
    resetRenderCounts();
    
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
    
    if (recoveryAttemptsRef.current >= MAX_RECOVERY_ATTEMPTS) {
      console.warn("Activating emergency mode after multiple recovery attempts");
      emergencyModeRef.current = true;
      
      toast({
        title: "Emergency Recovery Mode",
        description: "App detected instability. Features temporarily limited to restore stability.",
        variant: "destructive",
        duration: 5000,
      });
      
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

  useEffect(() => {
    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      let highRenderCount = false;
      let problematicComponents: string[] = [];
      
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
      
      renderCountRef.current = {};
    }, 3000);
    
    return () => clearInterval(intervalId);
  }, [forceUIRecovery]);

  useEffect(() => {
    const cleanup = () => {
      document.querySelectorAll('[role="dialog"]').forEach(dialog => {
        if (dialog.getAttribute('data-state') === 'open') {
          dialog.setAttribute('data-state', 'closed');
        }
      });
      
      document.querySelectorAll('input').forEach(input => {
        if (input.getAttribute('aria-invalid') === 'true') {
          input.setAttribute('aria-invalid', 'false');
        }
      });
    };
    
    cleanup();
    
    const interval = setInterval(() => {
      const openDialogs = document.querySelectorAll('[role="dialog"][data-state="open"]');
      if (openDialogs.length > 0) {
        console.log("Found potentially stuck dialogs:", openDialogs.length);
        
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
  }, [recoveryCount]);

  return (
    <UIRecoveryContext.Provider value={{ 
      isProcessing, 
      startProcessing, 
      endProcessing, 
      forceUIRecovery,
      resetRenderCounts
    }}>
      {React.createElement(Fragment, { key: `recovery-${recoveryCount}` }, children)}
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </PropertyProvider>
      </UIRecoveryProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
