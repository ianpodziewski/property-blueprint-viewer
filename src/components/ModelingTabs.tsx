
import { useState, useEffect, useCallback } from "react";
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

const ModelingTabs = () => {
  const [activeTab, setActiveTab] = useState("property");
  const [floorConfigSaved, setFloorConfigSaved] = useState(0);
  const [unitAllocationSaved, setUnitAllocationSaved] = useState(0);
  
  // Create a more robust debounced event handler to prevent infinite loops
  const handleFloorConfigSave = useCallback(() => {
    console.log('Floor configuration save event detected');
    setFloorConfigSaved(prev => prev + 1);
  }, []);
  
  const handleUnitAllocationSave = useCallback(() => {
    console.log('Unit allocation save event detected');
    setUnitAllocationSaved(prev => prev + 1);
  }, []);
  
  // Use separate useEffects with clear dependencies to avoid circular updates
  useEffect(() => {
    let timeoutId: number | undefined;
    const debouncedFloorConfigHandler = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(handleFloorConfigSave, 300);
    };
    
    window.addEventListener('floorConfigSaved', debouncedFloorConfigHandler);
    
    return () => {
      window.removeEventListener('floorConfigSaved', debouncedFloorConfigHandler);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [handleFloorConfigSave]);
  
  // Separate effect for unit allocation changes - no longer triggering floor config saves
  useEffect(() => {
    let timeoutId: number | undefined;
    const debouncedUnitAllocationHandler = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(handleUnitAllocationSave, 300);
    };
    
    window.addEventListener('unitAllocationChanged', debouncedUnitAllocationHandler);
    
    return () => {
      window.removeEventListener('unitAllocationChanged', debouncedUnitAllocationHandler);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [handleUnitAllocationSave]);

  return (
    <div className="w-full space-y-4">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
        <MainNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      
      <Tabs value={activeTab} className="w-full" onValueChange={(value) => setActiveTab(value)}>
        <div className="mt-4 bg-white rounded-md p-6 border border-gray-200">
          <TabsContent value="property" className="space-y-4">
            <PropertyBreakdown 
              key={`property-breakdown-${floorConfigSaved}-${unitAllocationSaved}`}
            />
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
