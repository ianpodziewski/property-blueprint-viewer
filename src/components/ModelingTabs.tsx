
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useModel } from "@/context/ModelContext";
import MainNavigation from "./MainNavigation";
import NavigationControls from "./NavigationControls";
import PropertyBreakdown from "./sections/PropertyBreakdown";
import DevelopmentCosts from "./sections/DevelopmentCosts";
import DevelopmentTimeline from "./sections/DevelopmentTimeline";
import OpExAssumptions from "./sections/OpExAssumptions";
import OpRevAssumptions from "./sections/OpRevAssumptions";
import CapExAssumptions from "./sections/CapExAssumptions";
import Financing from "./sections/Financing";
import Disposition from "./sections/Disposition";
import SensitivityAnalysis from "./sections/SensitivityAnalysis";
import { useState, useEffect } from "react";

const ModelingTabs = () => {
  // Add local state as a fallback in case context isn't available right away
  const [localActiveTab, setLocalActiveTab] = useState("property");
  
  try {
    // Get context values
    const { activeTab } = useModel();
    
    // Log successful context access
    useEffect(() => {
      console.log("ModelingTabs: Successfully connected to ModelContext, active tab:", activeTab);
    }, [activeTab]);
    
    return (
      <div className="w-full space-y-4">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
          <div className="flex justify-between items-center">
            <MainNavigation />
            <div className="pr-4">
              <NavigationControls />
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} className="w-full">
          <div className="mt-4 bg-white rounded-md p-6 border border-gray-200">
            <TabsContent value="property" className="space-y-4">
              <PropertyBreakdown />
            </TabsContent>
            
            <TabsContent value="devCosts" className="space-y-4">
              <DevelopmentCosts />
            </TabsContent>
            
            <TabsContent value="timeline" className="space-y-4">
              <DevelopmentTimeline />
            </TabsContent>
            
            <TabsContent value="opex" className="space-y-4">
              <OpExAssumptions />
            </TabsContent>
            
            <TabsContent value="oprev" className="space-y-4">
              <OpRevAssumptions />
            </TabsContent>
            
            <TabsContent value="capex" className="space-y-4">
              <CapExAssumptions />
            </TabsContent>
            
            <TabsContent value="financing" className="space-y-4">
              <Financing />
            </TabsContent>
            
            <TabsContent value="disposition" className="space-y-4">
              <Disposition />
            </TabsContent>
            
            <TabsContent value="sensitivity" className="space-y-4">
              <SensitivityAnalysis />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    );
  } catch (error) {
    // Log error but provide fallback UI
    console.error("Error in ModelingTabs:", error);
    
    return (
      <div className="w-full p-6 text-center">
        <div className="text-red-500 mb-4">
          Error loading modeling tabs. Please check that ModelProvider is properly set up.
        </div>
        <pre className="bg-gray-100 p-4 rounded text-left overflow-x-auto">
          {error instanceof Error ? error.message : "Unknown error"}
        </pre>
      </div>
    );
  }
};

export default ModelingTabs;
