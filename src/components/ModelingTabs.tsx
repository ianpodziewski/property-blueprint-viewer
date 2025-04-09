
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

// Create a stronger event tracker with much longer expiry and detailed logging
const eventTracker = {
  recentEvents: new Map<string, { timestamp: number, count: number }>(),
  EVENT_DEBOUNCE_TIME: 10000, // Increased to 10 seconds
  processingEvent: false,
  lastEventTime: 0,
  MIN_EVENT_INTERVAL: 2000, // Minimum 2 seconds between events
  
  // Check if event should be skipped (it's a duplicate or too frequent)
  shouldSkipEvent(eventType: string, options: { suppressNotification?: boolean } = {}): boolean {
    // If explicitly suppressing notifications, always skip
    if (options.suppressNotification) {
      console.log(`Event ${eventType} skipped due to suppressNotification flag`);
      return true;
    }
    
    if (this.processingEvent) {
      console.log(`Event ${eventType} skipped because another event is processing`);
      return true;
    }
    
    const now = Date.now();
    
    // Enforce minimum interval between any events
    if (now - this.lastEventTime < this.MIN_EVENT_INTERVAL) {
      console.log(`Event ${eventType} skipped due to minimum interval requirement`);
      return true;
    }
    
    const eventData = this.recentEvents.get(eventType);
    
    // If we've seen this event recently
    if (eventData && now - eventData.timestamp < this.EVENT_DEBOUNCE_TIME) {
      // Track consecutive occurrences
      eventData.count++;
      this.recentEvents.set(eventType, { timestamp: now, count: eventData.count });
      
      // If we've seen this event too many times, skip it
      if (eventData.count > 3) {
        console.log(`Event ${eventType} skipped after ${eventData.count} occurrences in ${this.EVENT_DEBOUNCE_TIME}ms`);
        return true;
      }
    }
    
    return false;
  },
  
  // Record an event with detailed logging
  trackEvent(eventType: string): void {
    const now = Date.now();
    this.lastEventTime = now;
    
    // Record or update this event
    const existingEvent = this.recentEvents.get(eventType);
    this.recentEvents.set(eventType, { 
      timestamp: now, 
      count: existingEvent ? existingEvent.count + 1 : 1 
    });
    
    console.log(`Event tracked: ${eventType} at ${new Date(now).toISOString()}`);
    
    // Clean up old events
    for (const [key, data] of this.recentEvents.entries()) {
      if (now - data.timestamp > this.EVENT_DEBOUNCE_TIME) {
        this.recentEvents.delete(key);
      }
    }
  }
};

// Global lock for localStorage operations
const storageOperationLock = {
  locked: false,
  lastOperation: 0,
  MIN_OPERATION_INTERVAL: 2000, // 2 seconds
  
  canPerformOperation(): boolean {
    if (this.locked) return false;
    
    const now = Date.now();
    if (now - this.lastOperation < this.MIN_OPERATION_INTERVAL) return false;
    
    return true;
  },
  
  acquireLock(): boolean {
    if (!this.canPerformOperation()) return false;
    
    this.locked = true;
    this.lastOperation = Date.now();
    return true;
  },
  
  releaseLock(): void {
    this.locked = false;
  }
};

const ModelingTabs = () => {
  const [activeTab, setActiveTab] = useState("property");
  const [floorConfigSaved, setFloorConfigSaved] = useState(0);
  const { toast } = useToast();
  const renderCountRef = useRef(0);
  const expandedFloorsRef = useRef(new Set<number>());
  
  // Improved event handling with stronger deduplication and suppressNotification flag
  const handleEvent = useCallback((
    eventType: string, 
    toastMessage: string, 
    toastDescription?: string,
    options: { suppressNotification?: boolean } = {}
  ) => {
    // Skip if this event should be suppressed
    if (eventTracker.shouldSkipEvent(eventType, options)) {
      return;
    }
    
    // Acquire storage operation lock
    if (!storageOperationLock.acquireLock()) {
      console.log(`Event ${eventType} skipped due to storage operation lock`);
      return;
    }
    
    try {
      // Mark event as being processed
      eventTracker.processingEvent = true;
      
      // Track this event to prevent duplicates
      eventTracker.trackEvent(eventType);
      
      // If not suppressing notifications
      if (!options.suppressNotification) {
        // Show toast
        toast({
          title: toastMessage,
          description: toastDescription,
          duration: 3000,
        });
      }
      
      // If this is a floor config event, update state
      if (eventType === 'floorConfigSaved') {
        setFloorConfigSaved(prev => prev + 1);
      }
    } finally {
      // Release storage operation lock and reset processing flag after delay
      setTimeout(() => {
        eventTracker.processingEvent = false;
        storageOperationLock.releaseLock();
      }, 1000);
    }
  }, [toast]);
  
  // Listen for floor config saved event with improved debounce
  useEffect(() => {
    const debounceTimeoutRef = { current: null as number | null };
    
    const handleFloorConfigSaved = (event: Event) => {
      // Check if event has suppressNotification flag
      const customEvent = event as CustomEvent<{suppressNotification?: boolean}>;
      const options = {
        suppressNotification: !!customEvent.detail?.suppressNotification
      };
      
      // Clear previous timeout if exists
      if (debounceTimeoutRef.current) {
        window.clearTimeout(debounceTimeoutRef.current);
      }
      
      // Set new debounced handler with much longer debounce
      debounceTimeoutRef.current = window.setTimeout(() => {
        console.log('Floor config saved event handler executing', options);
        handleEvent(
          'floorConfigSaved', 
          "Floor configuration saved", 
          "Changes have been saved successfully",
          options
        );
        debounceTimeoutRef.current = null;
      }, 1500); // Even longer debounce for better stability
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
      const customEvent = event as CustomEvent<{suppressNotification?: boolean}>;
      const options = {
        suppressNotification: !!customEvent.detail?.suppressNotification
      };
      
      // Clear previous timeout if exists
      if (debounceTimeoutRef.current) {
        window.clearTimeout(debounceTimeoutRef.current);
      }
      
      // Set new debounced handler with much longer debounce
      debounceTimeoutRef.current = window.setTimeout(() => {
        console.log('Unit types changed event handler executing', options);
        handleEvent(
          'unitTypesChanged', 
          "Unit types updated", 
          "Changes have been saved successfully",
          options
        );
        debounceTimeoutRef.current = null;
      }, 1500); // Even longer debounce for better stability
    };
    
    window.addEventListener('unitTypesChanged', handleUnitTypesChanged);
    
    return () => {
      window.removeEventListener('unitTypesChanged', handleUnitTypesChanged);
      if (debounceTimeoutRef.current) {
        window.clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [handleEvent]);
  
  // Track and limit renders with console logging
  useEffect(() => {
    renderCountRef.current += 1;
    const renderCount = renderCountRef.current;
    
    // Log renders
    if (renderCount % 5 === 0 || renderCount <= 5) {
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
