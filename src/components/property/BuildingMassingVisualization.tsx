
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SpaceBreakdown {
  type: string;
  squareFootage: number;
  color: string;
  floorAllocation: Record<number, number>;
}

interface FloorConfiguration {
  floorNumber: number;
  isUnderground: boolean;
  templateId: string | null;
  customSquareFootage: string;
  floorToFloorHeight: string;
  primaryUse: string;
  secondaryUse: string | null;
  secondaryUsePercentage: string;
}

interface FloorTemplate {
  id: string;
  name: string;
  squareFootage: string;
}

interface BuildingMassingVisualizationProps {
  buildingFootprint: number;
  numberOfFloors: number;
  numberOfUndergroundFloors: number;
  spaceBreakdown: SpaceBreakdown[];
  floorConfigurations: FloorConfiguration[];
  floorTemplates: FloorTemplate[];
}

const BuildingMassingVisualization = ({ 
  buildingFootprint, 
  numberOfFloors,
  numberOfUndergroundFloors,
  spaceBreakdown,
  floorConfigurations,
  floorTemplates
}: BuildingMassingVisualizationProps) => {
  const massingCanvasRef = useRef<HTMLCanvasElement>(null);
  const elevationCanvasRef = useRef<HTMLCanvasElement>(null);
  const [view, setView] = useState<'massing' | 'elevation'>('massing');
  
  // Draw the building massing diagram
  useEffect(() => {
    if (!massingCanvasRef.current) return;
    
    const canvas = massingCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Calculate building dimensions based on square footage
    const footprintArea = buildingFootprint;
    const baseSideLength = Math.sqrt(footprintArea);
    const floorCount = Number(numberOfFloors) || 1;
    const undergroundFloorCount = Number(numberOfUndergroundFloors) || 0;
    const totalFloorCount = floorCount + undergroundFloorCount;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate scale to fit within canvas
    const maxDimension = Math.max(baseSideLength * 1.2, totalFloorCount * 20);
    const scale = Math.min(canvas.width * 0.7 / maxDimension, canvas.height * 0.7 / maxDimension);
    
    // Calculate building dimensions after scaling
    const baseWidth = baseSideLength * scale;
    const floorHeight = 20 * scale;
    const aboveGroundHeight = floorCount * floorHeight;
    const belowGroundHeight = undergroundFloorCount * floorHeight;
    const totalHeight = aboveGroundHeight + belowGroundHeight;
    
    // Center the building in canvas
    const offsetX = (canvas.width - baseWidth) / 2;
    const groundLevel = canvas.height - 30 - belowGroundHeight;
    
    // Draw ground level
    ctx.fillStyle = '#D1D5DB';
    ctx.fillRect(offsetX - 50, groundLevel, baseWidth + 100, 5);
    
    // Helper to get floor area
    const getFloorArea = (floorNumber: number) => {
      const config = floorConfigurations.find(f => f.floorNumber === floorNumber);
      if (!config) return buildingFootprint;
      
      if (config.customSquareFootage && parseFloat(config.customSquareFootage) > 0) {
        return parseFloat(config.customSquareFootage);
      }
      
      if (config.templateId) {
        const template = floorTemplates.find(t => t.id === config.templateId);
        if (template && parseFloat(template.squareFootage) > 0) {
          return parseFloat(template.squareFootage);
        }
      }
      
      return buildingFootprint;
    };
    
    // Helper to determine floor width based on area
    const getFloorWidth = (floorArea: number) => {
      const ratio = floorArea / buildingFootprint;
      return baseWidth * Math.sqrt(ratio);
    };
    
    // Draw underground floors
    for (let floor = 1; floor <= undergroundFloorCount; floor++) {
      const floorNumber = -floor;
      const y = groundLevel + ((floor - 1) * floorHeight);
      
      const floorArea = getFloorArea(floorNumber);
      const floorWidth = getFloorWidth(floorArea);
      
      // Determine space allocations for this floor
      const config = floorConfigurations.find(f => f.floorNumber === floorNumber);
      
      if (config) {
        // Primary use
        const primaryPct = 100 - (parseFloat(config.secondaryUsePercentage) || 0);
        const primaryWidth = floorWidth * (primaryPct / 100);
        
        ctx.fillStyle = getSpaceColor(config.primaryUse);
        ctx.fillRect(offsetX + (baseWidth - floorWidth)/2, y, primaryWidth, floorHeight);
        ctx.strokeStyle = '#9CA3AF';
        ctx.strokeRect(offsetX + (baseWidth - floorWidth)/2, y, primaryWidth, floorHeight);
        
        // Secondary use if any
        if (config.secondaryUse && parseFloat(config.secondaryUsePercentage) > 0) {
          const secondaryPct = parseFloat(config.secondaryUsePercentage);
          const secondaryWidth = floorWidth * (secondaryPct / 100);
          
          ctx.fillStyle = getSpaceColor(config.secondaryUse);
          ctx.fillRect(
            offsetX + (baseWidth - floorWidth)/2 + primaryWidth, 
            y, 
            secondaryWidth, 
            floorHeight
          );
          ctx.strokeStyle = '#9CA3AF';
          ctx.strokeRect(
            offsetX + (baseWidth - floorWidth)/2 + primaryWidth, 
            y, 
            secondaryWidth, 
            floorHeight
          );
        }
      } else {
        // Default gray if no configuration
        ctx.fillStyle = '#E5E7EB';
        ctx.fillRect(offsetX + (baseWidth - floorWidth)/2, y, floorWidth, floorHeight);
        ctx.strokeStyle = '#9CA3AF';
        ctx.strokeRect(offsetX + (baseWidth - floorWidth)/2, y, floorWidth, floorHeight);
      }
      
      // Floor number
      ctx.fillStyle = '#000';
      ctx.font = `${Math.max(10, scale * 7)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`B${floor}`, offsetX - 15, y + floorHeight / 2 + 5);
    }
    
    // Draw above-ground floors
    for (let floor = 0; floor < floorCount; floor++) {
      const floorNumber = floor + 1;
      const y = groundLevel - ((floor + 1) * floorHeight);
      
      const floorArea = getFloorArea(floorNumber);
      const floorWidth = getFloorWidth(floorArea);
      
      // Determine space allocations for this floor
      const config = floorConfigurations.find(f => f.floorNumber === floorNumber);
      
      if (config) {
        // Primary use
        const primaryPct = 100 - (parseFloat(config.secondaryUsePercentage) || 0);
        const primaryWidth = floorWidth * (primaryPct / 100);
        
        ctx.fillStyle = getSpaceColor(config.primaryUse);
        ctx.fillRect(offsetX + (baseWidth - floorWidth)/2, y, primaryWidth, floorHeight);
        ctx.strokeStyle = '#9CA3AF';
        ctx.strokeRect(offsetX + (baseWidth - floorWidth)/2, y, primaryWidth, floorHeight);
        
        // Secondary use if any
        if (config.secondaryUse && parseFloat(config.secondaryUsePercentage) > 0) {
          const secondaryPct = parseFloat(config.secondaryUsePercentage);
          const secondaryWidth = floorWidth * (secondaryPct / 100);
          
          ctx.fillStyle = getSpaceColor(config.secondaryUse);
          ctx.fillRect(
            offsetX + (baseWidth - floorWidth)/2 + primaryWidth, 
            y, 
            secondaryWidth, 
            floorHeight
          );
          ctx.strokeStyle = '#9CA3AF';
          ctx.strokeRect(
            offsetX + (baseWidth - floorWidth)/2 + primaryWidth, 
            y, 
            secondaryWidth, 
            floorHeight
          );
        }
      } else {
        // Default gray if no configuration
        ctx.fillStyle = '#E5E7EB';
        ctx.fillRect(offsetX + (baseWidth - floorWidth)/2, y, floorWidth, floorHeight);
        ctx.strokeStyle = '#9CA3AF';
        ctx.strokeRect(offsetX + (baseWidth - floorWidth)/2, y, floorWidth, floorHeight);
      }
      
      // Floor number
      ctx.fillStyle = '#000';
      ctx.font = `${Math.max(10, scale * 7)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`${floorNumber}`, offsetX - 15, y + floorHeight / 2 + 5);
    }
    
  }, [buildingFootprint, numberOfFloors, numberOfUndergroundFloors, spaceBreakdown, floorConfigurations, floorTemplates]);

  // Draw side elevation view
  useEffect(() => {
    if (!elevationCanvasRef.current) return;
    
    const canvas = elevationCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Sort floor configurations
    const sortedConfigs = [...floorConfigurations].sort((a, b) => b.floorNumber - a.floorNumber);
    const aboveGroundConfigs = sortedConfigs.filter(c => !c.isUnderground);
    const belowGroundConfigs = sortedConfigs.filter(c => c.isUnderground).sort((a, b) => a.floorNumber - b.floorNumber);
    
    // Calculate dimensions
    const width = 150;
    const padding = 30;
    const offsetX = (canvas.width - width) / 2;
    
    // Calculate total height by summing all floor heights
    let totalAboveHeight = 0;
    let totalBelowHeight = 0;
    
    aboveGroundConfigs.forEach(config => {
      totalAboveHeight += parseFloat(config.floorToFloorHeight) || 12;
    });
    
    belowGroundConfigs.forEach(config => {
      totalBelowHeight += parseFloat(config.floorToFloorHeight) || 12;
    });
    
    // Scale to fit
    const totalHeight = totalAboveHeight + totalBelowHeight;
    const availableHeight = canvas.height - (padding * 2);
    const scale = totalHeight > 0 ? availableHeight / totalHeight : 1;
    
    // Draw ground level
    const groundY = padding + (totalAboveHeight * scale);
    ctx.fillStyle = '#D1D5DB';
    ctx.fillRect(offsetX - 20, groundY, width + 40, 3);
    
    // Draw building label
    ctx.fillStyle = '#000';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Side Elevation', canvas.width / 2, canvas.height - 10);
    
    // Draw above-ground floors
    let currentY = groundY;
    aboveGroundConfigs.forEach((config, index) => {
      const floorHeight = (parseFloat(config.floorToFloorHeight) || 12) * scale;
      currentY -= floorHeight;
      
      // Draw floor
      ctx.fillStyle = getSpaceColor(config.primaryUse);
      ctx.fillRect(offsetX, currentY, width, floorHeight);
      ctx.strokeStyle = '#9CA3AF';
      ctx.strokeRect(offsetX, currentY, width, floorHeight);
      
      // Draw floor number and height
      ctx.fillStyle = '#000';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${config.floorNumber}`, offsetX - 25, currentY + (floorHeight / 2) + 3);
      
      // Draw height label
      ctx.textAlign = 'right';
      ctx.fillText(`${config.floorToFloorHeight}'`, offsetX + width + 25, currentY + (floorHeight / 2) + 3);
    });
    
    // Draw below-ground floors
    currentY = groundY;
    belowGroundConfigs.forEach((config, index) => {
      const floorHeight = (parseFloat(config.floorToFloorHeight) || 12) * scale;
      
      // Draw floor
      ctx.fillStyle = getSpaceColor(config.primaryUse);
      ctx.fillRect(offsetX, currentY, width, floorHeight);
      ctx.strokeStyle = '#9CA3AF';
      ctx.strokeRect(offsetX, currentY, width, floorHeight);
      
      // Draw floor number and height
      ctx.fillStyle = '#000';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`B${Math.abs(config.floorNumber)}`, offsetX - 25, currentY + (floorHeight / 2) + 3);
      
      // Draw height label
      ctx.textAlign = 'right';
      ctx.fillText(`${config.floorToFloorHeight}'`, offsetX + width + 25, currentY + (floorHeight / 2) + 3);
      
      currentY += floorHeight;
    });
    
  }, [floorConfigurations]);
  
  // Helper to get color for a space type
  const getSpaceColor = (spaceType: string) => {
    const matchedSpace = spaceBreakdown.find(space => space.type === spaceType);
    return matchedSpace?.color || '#9CA3AF';
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Building Visualization</CardTitle>
        <CardDescription>Visual representation of building massing and space usage</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={view} onValueChange={(v) => setView(v as 'massing' | 'elevation')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="massing">3D Massing</TabsTrigger>
            <TabsTrigger value="elevation">Side Elevation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="massing" className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
            <canvas ref={massingCanvasRef} width={400} height={300} className="w-full" />
          </TabsContent>
          
          <TabsContent value="elevation" className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
            <canvas ref={elevationCanvasRef} width={400} height={300} className="w-full" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BuildingMassingVisualization;
