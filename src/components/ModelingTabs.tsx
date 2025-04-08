
import { useState, useEffect, useCallback, useRef } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import { useToast } from "@/hooks/use-toast";

// Track recent events to prevent duplicates
const recentEvents = new Map<string, number>();
const EVENT_DEBOUNCE_TIME = 5000; // 5 seconds

const ModelingTabs = () => {
  const [activeTab, setActiveTab] = useState("property");
  const [floorConfigSaved, setFloorConfigSaved] = useState(0);
  const { toast } = useToast();
  const renderCountRef = useRef(0);
  const processingEventRef = useRef(false);
  
  // Improved event handling with deduplication
  const handleEvent = useCallback((eventType: string, toastMessage: string, toastDescription?: string) => {
    // Skip if already processing an event
    if (processingEventRef.current) {
      return;
    }
    
    // Skip duplicate events
    const now = Date.now();
    const lastEvent = recentEvents.get(eventType);
    if (lastEvent && now - lastEvent < EVENT_DEBOUNCE_TIME) {
      return;
    }
    
    // Track this event
    recentEvents.set(eventType, now);
    
    // Clean up old events
    for (const [key, timestamp] of recentEvents.entries()) {
      if (now - timestamp > EVENT_DEBOUNCE_TIME) {
        recentEvents.delete(key);
      }
    }
    
    // Set processing flag
    processingEventRef.current = true;
    
    // Show toast
    toast({
      title: toastMessage,
      description: toastDescription,
      duration: 3000,
    });
    
    // If this is a floor config event, update state
    if (eventType === 'floorConfigSaved') {
      setFloorConfigSaved(prev => prev + 1);
    }
    
    // Reset processing flag after a short delay
    setTimeout(() => {
      processingEventRef.current = false;
    }, 500);
  }, [toast]);
  
  // Listen for floor config saved event
  useEffect(() => {
    let timeoutId: number | undefined;
    
    const debouncedHandler = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = window.setTimeout(() => {
        handleEvent('floorConfigSaved', "Floor configuration saved", "Changes have been saved successfully");
      }, 500);
    };
    
    window.addEventListener('floorConfigSaved', debouncedHandler);
    
    return () => {
      window.removeEventListener('floorConfigSaved', debouncedHandler);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [handleEvent]);

  // Listen for unit types changed event
  useEffect(() => {
    const handleUnitTypesChanged = (event: Event) => {
      // Skip if we have a custom detail with skipNotification flag
      const customEvent = event as CustomEvent<{skipNotification?: boolean}>;
      if (customEvent.detail?.skipNotification) {
        return;
      }
      
      handleEvent('unitTypesChanged', "Unit types updated", "Changes have been saved successfully");
    };
    
    window.addEventListener('unitTypesChanged', handleUnitTypesChanged);
    
    return () => {
      window.removeEventListener('unitTypesChanged', handleUnitTypesChanged);
    };
  }, [handleEvent]);
  
  // Track and limit renders
  useEffect(() => {
    renderCountRef.current += 1;
    const renderCount = renderCountRef.current;
    
    // Log excessive renders
    if (renderCount % 10 === 0) {
      console.log(`ModelingTabs render count: ${renderCount}`);
    }
    
    // Emergency circuit breaker for infinite loops
    if (renderCount > 100) {
      console.error('Excessive rendering detected in ModelingTabs');
    }
  });

  return (
    <div className="w-full space-y-4 overflow-visible">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
        <MainNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      
      <Tabs value={activeTab} className="w-full" onValueChange={(value) => setActiveTab(value)}>
        <div className="mt-4 bg-white rounded-md p-6 border border-gray-200 overflow-visible">
          <TabsContent value="property" className="space-y-4 overflow-visible">
            <TooltipProvider>
              <PropertyBreakdown key={`property-breakdown-${floorConfigSaved}`} />
            </TooltipProvider>
          </TabsContent>
          
          <TabsContent value="devCosts" className="space-y-4 overflow-visible">
            <DevelopmentCosts />
          </TabsContent>
          
          <TabsContent value="timeline" className="space-y-4 overflow-visible">
            <DevelopmentTimeline />
          </TabsContent>
          
          <TabsContent value="opex" className="space-y-4 overflow-visible">
            <OpExAssumptions />
          </TabsContent>
          
          <TabsContent value="oprev" className="space-y-4 overflow-visible">
            <OpRevAssumptions />
          </TabsContent>
          
          <TabsContent value="capex" className="space-y-4 overflow-visible">
            <CapExAssumptions />
          </TabsContent>
          
          <TabsContent value="financing" className="space-y-4 overflow-visible">
            <Financing />
          </TabsContent>
          
          <TabsContent value="disposition" className="space-y-4 overflow-visible">
            <Disposition />
          </TabsContent>
          
          <TabsContent value="sensitivity" className="space-y-4 overflow-visible">
            <SensitivityAnalysis />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default ModelingTabs;
