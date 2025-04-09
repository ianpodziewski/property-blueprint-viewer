
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

// Create a stronger event tracker with longer expiry
const eventTracker = {
  recentEvents: new Map<string, number>(),
  EVENT_DEBOUNCE_TIME: 5000, // Increased to 5 seconds
  processingEvent: false,
  
  // Check if event should be skipped (it's a duplicate)
  shouldSkipEvent(eventType: string): boolean {
    if (this.processingEvent) return true;
    
    const now = Date.now();
    const lastEvent = this.recentEvents.get(eventType);
    return !!lastEvent && now - lastEvent < this.EVENT_DEBOUNCE_TIME;
  },
  
  // Record an event
  trackEvent(eventType: string): void {
    this.recentEvents.set(eventType, Date.now());
    
    // Clean up old events
    const now = Date.now();
    for (const [key, timestamp] of this.recentEvents.entries()) {
      if (now - timestamp > this.EVENT_DEBOUNCE_TIME) {
        this.recentEvents.delete(key);
      }
    }
  }
};

const ModelingTabs = () => {
  const [activeTab, setActiveTab] = useState("property");
  const [floorConfigSaved, setFloorConfigSaved] = useState(0);
  const { toast } = useToast();
  const renderCountRef = useRef(0);
  
  // Improved event handling with stronger deduplication
  const handleEvent = useCallback((eventType: string, toastMessage: string, toastDescription?: string) => {
    // Skip if this event was recently processed
    if (eventTracker.shouldSkipEvent(eventType)) {
      return;
    }
    
    // Mark event as being processed
    eventTracker.processingEvent = true;
    
    // Track this event to prevent duplicates
    eventTracker.trackEvent(eventType);
    
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
    
    // Reset processing flag after a delay
    setTimeout(() => {
      eventTracker.processingEvent = false;
    }, 1000);
  }, [toast]);
  
  // Listen for floor config saved event with improved debounce
  useEffect(() => {
    const debounceTimeoutRef = { current: null as number | null };
    
    const handleFloorConfigSaved = () => {
      // Clear previous timeout if exists
      if (debounceTimeoutRef.current) {
        window.clearTimeout(debounceTimeoutRef.current);
      }
      
      // Set new debounced handler
      debounceTimeoutRef.current = window.setTimeout(() => {
        handleEvent('floorConfigSaved', "Floor configuration saved", "Changes have been saved successfully");
        debounceTimeoutRef.current = null;
      }, 800); // Longer debounce for better stability
    };
    
    window.addEventListener('floorConfigSaved', handleFloorConfigSaved);
    
    return () => {
      window.removeEventListener('floorConfigSaved', handleFloorConfigSaved);
      if (debounceTimeoutRef.current) {
        window.clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [handleEvent]);

  // Listen for unit types changed event with improved handling
  useEffect(() => {
    const debounceTimeoutRef = { current: null as number | null };
    
    const handleUnitTypesChanged = (event: Event) => {
      // Skip if we have a custom detail with skipNotification flag
      const customEvent = event as CustomEvent<{skipNotification?: boolean}>;
      if (customEvent.detail?.skipNotification) {
        return;
      }
      
      // Clear previous timeout if exists
      if (debounceTimeoutRef.current) {
        window.clearTimeout(debounceTimeoutRef.current);
      }
      
      // Set new debounced handler
      debounceTimeoutRef.current = window.setTimeout(() => {
        handleEvent('unitTypesChanged', "Unit types updated", "Changes have been saved successfully");
        debounceTimeoutRef.current = null;
      }, 800); // Longer debounce for better stability
    };
    
    window.addEventListener('unitTypesChanged', handleUnitTypesChanged);
    
    return () => {
      window.removeEventListener('unitTypesChanged', handleUnitTypesChanged);
      if (debounceTimeoutRef.current) {
        window.clearTimeout(debounceTimeoutRef.current);
      }
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
