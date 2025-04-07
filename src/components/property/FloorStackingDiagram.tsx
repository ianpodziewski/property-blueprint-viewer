
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Floor {
  floorNumber: number;
  spaces: SpaceAllocation[];
}

interface SpaceAllocation {
  id: string;
  type: string;
  squareFootage: number;
  percentage: number;
}

interface FloorStackingDiagramProps {
  floors: Floor[];
  spaceTypeColors: Record<string, string>;
}

const FloorStackingDiagram = ({ floors, spaceTypeColors }: FloorStackingDiagramProps) => {
  // Sort floors in descending order (higher floors on top)
  const sortedFloors = [...floors].sort((a, b) => b.floorNumber - a.floorNumber);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Floor Stacking Diagram</CardTitle>
        <CardDescription>Visual representation of space allocation by floor</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sortedFloors.map((floor) => (
            <div key={floor.floorNumber} className="border border-gray-200 rounded-md">
              <div className="bg-gray-100 px-3 py-1 border-b border-gray-200 font-medium">
                Floor {floor.floorNumber}
              </div>
              <div className="flex h-12">
                {floor.spaces.map((space, idx) => (
                  <div 
                    key={`${floor.floorNumber}-${space.id}-${idx}`}
                    className="h-full flex items-center justify-center text-xs text-white overflow-hidden"
                    style={{ 
                      width: `${space.percentage}%`, 
                      backgroundColor: spaceTypeColors[space.type] || "#9CA3AF"
                    }}
                    title={`${space.type}: ${space.squareFootage} sq ft (${space.percentage.toFixed(1)}%)`}
                  >
                    {space.percentage > 10 ? `${space.type}` : ""}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(spaceTypeColors).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }}></div>
              <span className="text-xs">{type}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FloorStackingDiagram;
