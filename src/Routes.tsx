
import { Routes as RouterRoutes, Route } from 'react-router-dom';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';

const Routes = () => {
  return (
    <RouterRoutes>
      <Route 
        path="/" 
        element={
          <ErrorBoundary componentName="Home Page">
            <Index />
          </ErrorBoundary>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </RouterRoutes>
  );
};

export default Routes;
