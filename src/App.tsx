
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { isLocalStorageAvailable } from "./hooks/useLocalStoragePersistence";

// Create QueryClient outside component to persist across renders
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false
    },
  },
});

const App = () => {
  // State to track initialization
  const [isInitialized, setIsInitialized] = useState(false);
  const renderCountRef = useRef(0);
  
  // Add a log to track full page loads and check localStorage availability
  useEffect(() => {
    console.log("App mounted - full browser refresh detected");
    
    // Track render counts
    renderCountRef.current += 1;
    console.log(`App render count: ${renderCountRef.current}`);
    
    // Check if localStorage is accessible
    if (isLocalStorageAvailable()) {
      console.log("localStorage is available and will be used for data persistence");
      
      // Log all stored real estate model keys for debugging
      if (typeof window !== 'undefined' && window.localStorage) {
        const modelKeys = Object.keys(localStorage).filter(key => 
          key.startsWith('realEstateModel_')
        );
        
        console.log("Found stored model data keys:", modelKeys);
        
        // Log the size of each key for debugging
        modelKeys.forEach(key => {
          const size = localStorage.getItem(key)?.length || 0;
          console.log(`Key "${key}" size: ${size} bytes`);
        });
      }
      
      // Mark as initialized after localStorage check
      setIsInitialized(true);
    } else {
      console.error("localStorage is not available - data persistence will not work");
      setIsInitialized(true); // Still mark as initialized to prevent blocking the UI
    }
  }, []);

  // Emergency circuit breaker for infinite rendering
  if (renderCountRef.current > 50) {
    console.error("Emergency circuit breaker: Too many renders detected in App component");
    return <div className="p-8 text-red-500">
      Error: Excessive rendering detected. Please reload the page.
    </div>;
  }

  // Show loading state until initialization is complete
  if (!isInitialized) {
    return <div className="flex items-center justify-center h-screen">
      <div className="text-lg">Loading application data...</div>
    </div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
