
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ModelProvider } from "@/context/ModelContext";
import { AuthProvider } from "@/context/AuthContext";
import AppRoutes from "./AppRoutes";
import StateInspector from "./components/debug/StateInspector";

// Create a query client for React Query
const queryClient = new QueryClient();

// Enable debug mode for development
const isDebugMode = process.env.NODE_ENV === 'development';

const App = () => {
  console.log("App component rendering, initializing providers...");
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <ModelProvider>
              <Toaster />
              <Sonner />
              <AppRoutes />
              {isDebugMode && <StateInspector />}
            </ModelProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
