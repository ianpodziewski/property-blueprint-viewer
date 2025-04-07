
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PhaseDelivery {
  phase: string;
  name: string;
  squareFootage: number;
  percentage: number;
  timeline: {
    start: string;
    end: string;
  };
  spaceTypes: {
    type: string;
    squareFootage: number;
  }[];
}

interface PhasingTimelineProps {
  phases: PhaseDelivery[];
  spaceTypeColors: Record<string, string>;
}

const PhasingTimeline = ({ phases, spaceTypeColors }: PhasingTimelineProps) => {
  // Sort phases by start date
  const sortedPhases = [...phases].sort((a, b) => {
    return new Date(a.timeline.start).getTime() - new Date(b.timeline.start).getTime();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phasing Timeline</CardTitle>
        <CardDescription>Delivery timeline for project phases</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sortedPhases.map((phase) => (
            <div key={phase.phase} className="border border-gray-200 rounded-md overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                <div className="flex justify-between">
                  <h3 className="font-medium">{phase.name}</h3>
                  <span className="text-sm text-gray-600">
                    {new Date(phase.timeline.start).toLocaleDateString()} - {new Date(phase.timeline.end).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">{phase.squareFootage.toLocaleString()} sq ft</span>
                  <span className="text-xs text-gray-600">({phase.percentage.toFixed(1)}% of project)</span>
                </div>
                
                <div className="h-6 flex rounded-md overflow-hidden">
                  {phase.spaceTypes.map((space, idx) => {
                    const spacePercentage = (space.squareFootage / phase.squareFootage) * 100;
                    return (
                      <div
                        key={`${phase.phase}-${space.type}-${idx}`}
                        className="h-full"
                        style={{
                          width: `${spacePercentage}%`,
                          backgroundColor: spaceTypeColors[space.type] || "#9CA3AF",
                        }}
                        title={`${space.type}: ${space.squareFootage.toLocaleString()} sq ft`}
                      />
                    );
                  })}
                </div>
                
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  {phase.spaceTypes.map((space, idx) => {
                    const spacePercentage = (space.squareFootage / phase.squareFootage) * 100;
                    return (
                      <div key={`${phase.phase}-${space.type}-label-${idx}`} className="flex items-center gap-1.5 text-xs">
                        <div 
                          className="w-2 h-2 rounded-sm" 
                          style={{ backgroundColor: spaceTypeColors[space.type] || "#9CA3AF" }}
                        />
                        <span>{space.type}: {spacePercentage.toFixed(1)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PhasingTimeline;
