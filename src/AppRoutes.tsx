
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useModel } from "@/context/ModelContext";

const AppRoutes = () => {
  // This is a good place to verify the context is working
  const { activeTab } = useModel();
  console.log("AppRoutes rendering with active tab:", activeTab);
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
