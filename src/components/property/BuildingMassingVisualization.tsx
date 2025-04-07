
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef } from "react";

interface SpaceBreakdown {
  type: string;
  squareFootage: number;
  color: string;
  floorAllocation: Record<number, number>;
}

interface BuildingMassingVisualizationProps {
  buildingFootprint: number;
  numberOfFloors: number;
  spaceBreakdown: SpaceBreakdown[];
}

const BuildingMassingVisualization = ({ 
  buildingFootprint, 
  numberOfFloors, 
  spaceBreakdown 
}: BuildingMassingVisualizationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Draw the building massing diagram
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Calculate building dimensions based on square footage
    // Using a simple square for representation
    const footprintArea = buildingFootprint;
    const sideLength = Math.sqrt(footprintArea);
    const floorCount = Number(numberOfFloors) || 1;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate scale to fit within canvas
    const maxDimension = Math.max(sideLength, floorCount * 20);
    const scale = Math.min(canvas.width * 0.8 / maxDimension, canvas.height * 0.8 / maxDimension);
    
    // Calculate building dimensions after scaling
    const buildingWidth = sideLength * scale;
    const floorHeight = 20 * scale;
    const buildingHeight = floorCount * floorHeight;
    
    // Center the building in canvas
    const offsetX = (canvas.width - buildingWidth) / 2;
    const offsetY = canvas.height - 20 - buildingHeight; // 20px padding from bottom
    
    // Draw each floor with appropriate colors
    for (let floor = 0; floor < floorCount; floor++) {
      const y = offsetY + buildingHeight - ((floor + 1) * floorHeight);
      
      // Determine space allocations for this floor
      const floorSpaces: {type: string, percentage: number, color: string}[] = [];
      
      spaceBreakdown.forEach(space => {
        const allocation = space.floorAllocation[floor + 1] || 0;
        if (allocation > 0) {
          floorSpaces.push({
            type: space.type,
            percentage: allocation / 100,
            color: space.color
          });
        }
      });
      
      // If no spaces allocated to this floor, use gray
      if (floorSpaces.length === 0) {
        ctx.fillStyle = '#E5E7EB';
        ctx.fillRect(offsetX, y, buildingWidth, floorHeight);
        ctx.strokeStyle = '#9CA3AF';
        ctx.strokeRect(offsetX, y, buildingWidth, floorHeight);
      } else {
        // Draw segmented floor
        let startX = 0;
        floorSpaces.forEach(space => {
          const spaceWidth = buildingWidth * space.percentage;
          ctx.fillStyle = space.color;
          ctx.fillRect(offsetX + startX, y, spaceWidth, floorHeight);
          ctx.strokeStyle = '#9CA3AF';
          ctx.strokeRect(offsetX + startX, y, spaceWidth, floorHeight);
          startX += spaceWidth;
        });
      }
      
      // Draw floor number
      ctx.fillStyle = '#000';
      ctx.font = `${Math.max(10, scale * 8)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`${floor + 1}`, offsetX - 15, y + floorHeight / 2 + 5);
    }
    
    // Draw ground
    ctx.fillStyle = '#D1D5DB';
    ctx.fillRect(offsetX - 20, offsetY + buildingHeight, buildingWidth + 40, 5);
    
  }, [buildingFootprint, numberOfFloors, spaceBreakdown]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Building Massing</CardTitle>
        <CardDescription>Visual representation of building form and space usage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
          <canvas ref={canvasRef} width={400} height={300} className="w-full" />
        </div>
      </CardContent>
    </Card>
  );
};

export default BuildingMassingVisualization;
