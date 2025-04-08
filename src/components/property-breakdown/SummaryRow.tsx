
import React from "react";
import SpaceSummaryDashboard from "@/components/property/SpaceSummaryDashboard";
import PhasingTimeline from "@/components/property/PhasingTimeline";
import { Issue } from "@/types/propertyTypes";

interface SummaryRowProps {
  totalBuildableArea: number;
  totalAllocatedArea: number;
  spaceBreakdown: any[];
  phases: any[];
  issues: Issue[];
  spaceTypeColors: Record<string, string>;
}

const SummaryRow: React.FC<SummaryRowProps> = ({
  totalBuildableArea,
  totalAllocatedArea,
  spaceBreakdown,
  phases,
  issues,
  spaceTypeColors,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SpaceSummaryDashboard
        totalBuildableArea={totalBuildableArea}
        totalAllocatedArea={totalAllocatedArea}
        spaceBreakdown={spaceBreakdown}
        issues={issues}
      />
      
      <PhasingTimeline 
        phases={phases}
        spaceTypeColors={spaceTypeColors}
      />
    </div>
  );
};

export default SummaryRow;
