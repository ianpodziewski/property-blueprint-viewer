
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { ModelStateProvider } from './context/ModelStateContext';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from '@/components/ui/sonner';
import './App.css';

// Import your routes
import Routes from './Routes';
import Header from './components/Header';
import UIRecoveryButton from './components/UIRecoveryButton';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ModelStateProvider>
          <BrowserRouter>
            <ErrorBoundary componentName="Application">
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 container mx-auto px-4 py-8">
                  <div className="fixed bottom-4 right-4 z-50">
                    <UIRecoveryButton />
                  </div>
                  <ErrorBoundary componentName="Main Content">
                    <Routes />
                  </ErrorBoundary>
                </main>
              </div>
            </ErrorBoundary>
          </BrowserRouter>
          <Toaster position="top-right" />
        </ModelStateProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
