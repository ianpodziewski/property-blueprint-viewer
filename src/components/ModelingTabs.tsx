
import { useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import MainNavigation from "./MainNavigation";
import PropertyBreakdown from "./sections/PropertyBreakdown";
import DevelopmentCosts from "./sections/DevelopmentCosts";
import DevelopmentTimeline from "./sections/DevelopmentTimeline";
import OpExAssumptions from "./sections/OpExAssumptions";
import OpRevAssumptions from "./sections/OpRevAssumptions";
import CapExAssumptions from "./sections/CapExAssumptions";
import Financing from "./sections/Financing";
import Disposition from "./sections/Disposition";
import SensitivityAnalysis from "./sections/SensitivityAnalysis";
import { useModelNavigation } from "../state/modelContext";
import { SaveButton } from "./SaveButton";

const ModelingTabs = () => {
  const { activeTab, setActiveTab } = useModelNavigation();

  // Listen for hash changes to enable deep linking
  useEffect(() => {
    if (window.location.hash) {
      const hash = window.location.hash.replace('#', '');
      if (hash !== activeTab) {
        setActiveTab(hash);
      }
    }
  }, [window.location.hash, activeTab, setActiveTab]);
  
  return (
    <div className="w-full space-y-4">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-4 py-2">
          <MainNavigation />
          <SaveButton />
        </div>
      </div>
      
      <Tabs value={activeTab} className="w-full" onValueChange={(value) => setActiveTab(value)}>
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
};

export default ModelingTabs;
