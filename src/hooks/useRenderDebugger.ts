
import { useEffect, useRef, useState } from 'react';

// Global render tracking to detect system-wide render storms
const globalRenderCounts: Record<string, number> = {};
const mountedComponents: Set<string> = new Set();
let lastResetTime = Date.now();
const GLOBAL_RESET_INTERVAL = 10000; // Reset counters every 10 seconds

// Circuit breaker to stop infinite loops
const MAX_GLOBAL_RENDERS = 100; // Max renders across all components before warning
const MAX_COMPONENT_RENDERS = 25; // Max renders for a single component
let globalRenderCount = 0;
let loopDetected = false;

/**
 * Debug hook to help identify components that render too often and prevent infinite loops
 * @param componentName Name of the component to monitor
 * @param props Props to watch
 * @param threshold Maximum render count before warning
 * @param breakLoop Whether to break render loops after threshold is exceeded
 */
export function useRenderDebugger(
  componentName: string, 
  props: Record<string, any> = {}, 
  threshold: number = MAX_COMPONENT_RENDERS,
  breakLoop: boolean = true
): { resetCount: () => void; isLoopDetected: boolean } {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());
  const [isLoopDetected, setIsLoopDetected] = useState(false);
  const uniqueId = useRef(`${componentName}_${Math.random().toString(36).substr(2, 9)}`);
  const isMounted = useRef(true);
  
  // Check if we need to reset global counters
  if (Date.now() - lastResetTime > GLOBAL_RESET_INTERVAL) {
    for (const key in globalRenderCounts) {
      globalRenderCounts[key] = 0;
    }
    globalRenderCount = 0;
    lastResetTime = Date.now();
    loopDetected = false;
  }
  
  // Reset this component's render count
  const resetCount = () => {
    renderCount.current = 0;
    if (globalRenderCounts[componentName]) {
      globalRenderCounts[componentName] = 0;
    }
    setIsLoopDetected(false);
  };
  
  useEffect(() => {
    isMounted.current = true;
    mountedComponents.add(uniqueId.current);
    
    console.log(`[MOUNT] ${componentName} mounted at ${new Date().toISOString()}`);
    
    return () => {
      isMounted.current = false;
      mountedComponents.delete(uniqueId.current);
      console.log(`[UNMOUNT] ${componentName} unmounted at ${new Date().toISOString()}`);
    };
  }, []);
  
  useEffect(() => {
    // If loop already detected and this component is part of it, stop renders
    if (loopDetected && isLoopDetected && breakLoop) {
      return;
    }
    
    renderCount.current += 1;
    globalRenderCount += 1;
    
    // Update component-specific counter
    if (!globalRenderCounts[componentName]) {
      globalRenderCounts[componentName] = 0;
    }
    globalRenderCounts[componentName] += 1;
    
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    lastRenderTime.current = now;
    
    // Log first render
    if (renderCount.current === 1) {
      console.log(`[RENDER] ${componentName} mounted, first render`);
    }
    
    // Detect suspiciously fast re-renders
    if (timeSinceLastRender < 50 && renderCount.current > 3) {
      console.warn(
        `[RENDER WARNING] ${componentName} rendered too quickly (${timeSinceLastRender}ms). ` +
        `This may indicate an infinite rendering loop.`
      );
    }
    
    // Log when render count exceeds threshold
    if (renderCount.current > threshold) {
      console.warn(
        `[RENDER WARNING] ${componentName} has rendered ${renderCount.current} times. ` +
        `This may indicate an infinite rendering loop. Breaking render cycle.`
      );
      
      if (breakLoop && isMounted.current) {
        setIsLoopDetected(true);
        loopDetected = true;
      }
    }
    
    // Global render storm detection
    if (globalRenderCount > MAX_GLOBAL_RENDERS) {
      console.error(
        `[CRITICAL] Detected global render storm! Total renders across all components: ${globalRenderCount}. ` +
        `Active components: ${Array.from(mountedComponents).join(', ')}`
      );
      
      // Get the top 5 most rendered components
      const topRendered = Object.entries(globalRenderCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);
      
      console.error(`Most rendered components: ${
        topRendered.map(([name, count]) => `${name} (${count})`).join(', ')
      }`);
      
      loopDetected = true;
    }
    
    // Log detailed information at regular intervals
    if (renderCount.current % 5 === 0) {
      console.log(`[RENDER] ${componentName} rendered ${renderCount.current} times. Current props:`, props);
    }
  });
  
  return { resetCount, isLoopDetected };
}

/**
 * Helper to track render times for performance monitoring
 */
export const startRenderTimer = (componentName: string): () => void => {
  const startTime = performance.now();
  return () => {
    const duration = performance.now() - startTime;
    if (duration > 15) { // Only log slow renders
      console.log(`[RENDER TIME] ${componentName}: ${duration.toFixed(1)}ms`);
    }
  };
};
