
import { Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AuthLayout from "./pages/auth/AuthLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { useModel } from "@/context/ModelContext";
import { useAuth } from "@/context/AuthContext";
import { useProject } from "@/context/ProjectContext";
import { useEffect } from "react";

const AppRoutes = () => {
  // This is a good place to verify the contexts are working
  const { activeTab } = useModel();
  const { user, isLoading } = useAuth();
  const { currentProjectId } = useProject();
  
  console.log("AppRoutes rendering with active tab:", activeTab);
  console.log("Authentication status:", { user: user?.email, isLoading });
  console.log("Current project ID:", currentProjectId);
  
  // Log current route information
  useEffect(() => {
    console.log("Current route information:", {
      pathname: window.location.pathname,
      projectId: currentProjectId,
    });
  }, [currentProjectId]);
  
  return (
    <Routes>
      {/* Redirect from root to projects page */}
      <Route path="/" element={<Navigate to="/projects" replace />} />
      
      {/* Projects page (landing page after login) */}
      <Route path="/projects" element={
        <ProtectedRoute>
          <Projects />
        </ProtectedRoute>
      } />
      
      {/* Model editor page with project ID param */}
      <Route path="/model/:projectId" element={
        <ProtectedRoute>
          <Index />
        </ProtectedRoute>
      } />
      
      {/* Auth Routes */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route index element={<Navigate to="/auth/login" replace />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>
      
      {/* Catch-all route - 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
