
import { useEffect, useRef } from 'react';

/**
 * Debug hook to help identify components that render too often
 * @param componentName Name of the component to monitor
 * @param props Props to watch
 * @param threshold Maximum render count before warning
 */
export function useRenderDebugger(
  componentName: string, 
  props: Record<string, any> = {}, 
  threshold: number = 10
): void {
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
    
    // Log first render
    if (renderCount.current === 1) {
      console.log(`[RENDER] ${componentName} mounted`);
    }
    
    // Log when render count exceeds threshold
    if (renderCount.current > threshold) {
      console.warn(
        `[RENDER WARNING] ${componentName} has rendered ${renderCount.current} times.` +
        ` This may indicate an infinite rendering loop.`
      );
    }
    
    // Log detailed information at regular intervals
    if (renderCount.current % 5 === 0) {
      console.log(`[RENDER] ${componentName} rendered ${renderCount.current} times. Current props:`, props);
    }
    
    return () => {
      if (renderCount.current === 0) {
        console.log(`[RENDER] ${componentName} unmounted`);
      }
    };
  });
}
