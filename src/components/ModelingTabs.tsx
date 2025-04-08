
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
  const eventTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Define callbacks outside of useEffect to prevent dependency issues
  const handleFloorConfigSave = useCallback(() => {
    console.log('Floor configuration save event detected');
    
    // Clear any existing timeout
    if (eventTimeoutRef.current) {
      clearTimeout(eventTimeoutRef.current);
    }
    
    // Set a timeout to update the state after a delay
    eventTimeoutRef.current = setTimeout(() => {
      setFloorConfigSaved(prev => prev + 1);
      eventTimeoutRef.current = null;
    }, 300); // 300ms debounce
  }, []);
  
  const handleUnitAllocationSave = useCallback(() => {
    console.log('Unit allocation save event detected');
    
    // Clear any existing timeout
    if (eventTimeoutRef.current) {
      clearTimeout(eventTimeoutRef.current);
    }
    
    // Set a timeout to update the state after a delay
    eventTimeoutRef.current = setTimeout(() => {
      setUnitAllocationSaved(prev => prev + 1);
      eventTimeoutRef.current = null;
    }, 300); // 300ms debounce
  }, []);
  
  // Register event handlers only once
  useEffect(() => {
    // Skip if handlers are already registered or if not in browser
    if (handlersRegistered.current || typeof window === 'undefined') return;
    
    // Set flag to indicate handlers are registered
    handlersRegistered.current = true;
    
    console.log('Registering event handlers for floor config and unit allocation');
    
    // Add event listeners
    window.addEventListener('floorConfigSaved', handleFloorConfigSave);
    window.addEventListener('unitAllocationChanged', handleUnitAllocationSave);
    
    // Cleanup function
    return () => {
      console.log('Cleaning up event handlers');
      
      // Clean up timeouts to prevent memory leaks
      if (eventTimeoutRef.current) {
        clearTimeout(eventTimeoutRef.current);
      }
      
      // Remove event listeners if window exists
      if (typeof window !== 'undefined') {
        window.removeEventListener('floorConfigSaved', handleFloorConfigSave);
        window.removeEventListener('unitAllocationChanged', handleUnitAllocationSave);
      }
    };
  }, []); // Empty dependency array since callbacks are stable

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
