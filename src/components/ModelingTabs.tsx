import { useState, useEffect, useCallback, useRef } from "react";
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
  
  const handlersRegistered = useRef(false);
  
  const handleFloorConfigSave = useCallback(() => {
    console.log('Floor configuration save event detected');
    window.requestAnimationFrame(() => {
      setFloorConfigSaved(prev => prev + 1);
    });
  }, []);
  
  const handleUnitAllocationSave = useCallback(() => {
    console.log('Unit allocation save event detected');
    window.requestAnimationFrame(() => {
      setUnitAllocationSaved(prev => prev + 1);
    });
  }, []);
  
  useEffect(() => {
    if (handlersRegistered.current) return;
    handlersRegistered.current = true;
    
    const floorConfigHandler = (event: Event) => {
      handleFloorConfigSave();
    };
    
    const unitAllocationHandler = (event: Event) => {
      handleUnitAllocationSave();
    };
    
    window.addEventListener('floorConfigSaved', floorConfigHandler);
    window.addEventListener('unitAllocationChanged', unitAllocationHandler);
    
    return () => {
      window.removeEventListener('floorConfigSaved', floorConfigHandler);
      window.removeEventListener('unitAllocationChanged', unitAllocationHandler);
    };
  }, [handleFloorConfigSave, handleUnitAllocationSave]);

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
