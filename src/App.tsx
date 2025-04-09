
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ModelProvider } from "@/context/ModelContext";
import AppRoutes from "./AppRoutes";

// Create a query client for React Query
const queryClient = new QueryClient();

const App = () => {
  console.log("App component rendering, initializing providers...");
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <ModelProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </ModelProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
