
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

// Define the context interface
interface FloorExpansionContextType {
  expandedFloors: Set<number>;
  isFloorExpanded: (floorNumber: number) => boolean;
  toggleFloorExpansion: (floorNumber: number) => void;
  expandFloor: (floorNumber: number) => void;
  collapseFloor: (floorNumber: number) => void;
  isInteracting: boolean;
}

// Create the context with a default value
const FloorExpansionContext = createContext<FloorExpansionContextType>({
  expandedFloors: new Set<number>(),
  isFloorExpanded: () => false,
  toggleFloorExpansion: () => {},
  expandFloor: () => {},
  collapseFloor: () => {},
  isInteracting: false,
});

// Hook for consuming the context
export const useFloorExpansion = () => useContext(FloorExpansionContext);

interface FloorExpansionProviderProps {
  children: React.ReactNode;
}

// Provider component
export const FloorExpansionProvider: React.FC<FloorExpansionProviderProps> = ({ children }) => {
  // Use ref for the set to ensure stability across renders
  const expandedFloorsRef = useRef<Set<number>>(new Set<number>());
  
  // State to trigger re-renders when the set changes
  const [expandedFloors, setExpandedFloors] = useState<Set<number>>(expandedFloorsRef.current);
  
  // Interaction tracking to prevent storage operations
  const [isInteracting, setIsInteracting] = useState(false);
  const interactionTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clear interaction timer on unmount
  useEffect(() => {
    return () => {
      if (interactionTimerRef.current) {
        clearTimeout(interactionTimerRef.current);
      }
    };
  }, []);
  
  // Set interaction flag for a cooldown period
  const startInteractionCooldown = useCallback(() => {
    console.log("🔄 UI Interaction started - blocking persistence operations");
    setIsInteracting(true);
    
    // Clear any existing timer
    if (interactionTimerRef.current) {
      clearTimeout(interactionTimerRef.current);
    }
    
    // Set a new timer
    interactionTimerRef.current = setTimeout(() => {
      console.log("✅ UI Interaction cooldown finished - persistence operations allowed");
      setIsInteracting(false);
    }, 5000); // 5 second cooldown
  }, []);
  
  // Check if a floor is expanded
  const isFloorExpanded = useCallback((floorNumber: number): boolean => {
    return expandedFloorsRef.current.has(floorNumber);
  }, []);
  
  // Toggle floor expansion
  const toggleFloorExpansion = useCallback((floorNumber: number): void => {
    startInteractionCooldown();
    
    const newExpandedFloors = new Set(expandedFloorsRef.current);
    
    if (newExpandedFloors.has(floorNumber)) {
      newExpandedFloors.delete(floorNumber);
      console.log(`📉 Floor ${floorNumber} collapsed`);
    } else {
      newExpandedFloors.add(floorNumber);
      console.log(`📈 Floor ${floorNumber} expanded`);
    }
    
    // Update the ref and state
    expandedFloorsRef.current = newExpandedFloors;
    setExpandedFloors(new Set(newExpandedFloors));
  }, [startInteractionCooldown]);
  
  // Expand a floor
  const expandFloor = useCallback((floorNumber: number): void => {
    if (!expandedFloorsRef.current.has(floorNumber)) {
      startInteractionCooldown();
      const newExpandedFloors = new Set(expandedFloorsRef.current);
      newExpandedFloors.add(floorNumber);
      
      // Update the ref and state
      expandedFloorsRef.current = newExpandedFloors;
      setExpandedFloors(new Set(newExpandedFloors));
      console.log(`📈 Floor ${floorNumber} expanded`);
    }
  }, [startInteractionCooldown]);
  
  // Collapse a floor
  const collapseFloor = useCallback((floorNumber: number): void => {
    if (expandedFloorsRef.current.has(floorNumber)) {
      startInteractionCooldown();
      const newExpandedFloors = new Set(expandedFloorsRef.current);
      newExpandedFloors.delete(floorNumber);
      
      // Update the ref and state
      expandedFloorsRef.current = newExpandedFloors;
      setExpandedFloors(new Set(newExpandedFloors));
      console.log(`📉 Floor ${floorNumber} collapsed`);
    }
  }, [startInteractionCooldown]);
  
  // Create the context value
  const contextValue = {
    expandedFloors,
    isFloorExpanded,
    toggleFloorExpansion,
    expandFloor,
    collapseFloor,
    isInteracting
  };
  
  return (
    <FloorExpansionContext.Provider value={contextValue}>
      {children}
    </FloorExpansionContext.Provider>
  );
};
