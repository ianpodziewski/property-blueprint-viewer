
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

interface BuildingParametersProps {
  farAllowance: string;
  setFarAllowance: (value: string) => void;
  totalLandArea: string;
  setTotalLandArea: (value: string) => void;
  buildingFootprint: string;
  setBuildingFootprint: (value: string) => void;
  numberOfFloors: string;
  setNumberOfFloors: (value: string) => void;
  totalBuildableArea: number;
  actualFar: number;
}

const BuildingParameters = ({
  farAllowance,
  setFarAllowance,
  totalLandArea,
  setTotalLandArea,
  buildingFootprint,
  setBuildingFootprint,
  numberOfFloors,
  setNumberOfFloors,
  totalBuildableArea,
  actualFar
}: BuildingParametersProps) => {
  const [farUtilization, setFarUtilization] = useState(0);
  
  // Calculate FAR utilization percentage
  useEffect(() => {
    if (parseFloat(farAllowance) > 0) {
      setFarUtilization(Math.min((actualFar / parseFloat(farAllowance)) * 100, 100));
    } else {
      setFarUtilization(0);
    }
  }, [farAllowance, actualFar]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Building Parameters</CardTitle>
        <CardDescription>Define the overall building parameters and FAR calculations</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="zoning-far">Zoning FAR Allowance</Label>
          <Input 
            id="zoning-far" 
            placeholder="0.0" 
            type="number"
            value={farAllowance}
            onChange={(e) => setFarAllowance(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="total-land">Total Land Area (sq ft)</Label>
          <Input 
            id="total-land" 
            placeholder="0" 
            type="number"
            value={totalLandArea}
            onChange={(e) => setTotalLandArea(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="building-footprint">Building Footprint (sq ft)</Label>
          <Input 
            id="building-footprint" 
            placeholder="0" 
            type="number"
            value={buildingFootprint}
            onChange={(e) => setBuildingFootprint(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="number-floors">Number of Floors</Label>
          <Input 
            id="number-floors" 
            placeholder="0" 
            type="number"
            value={numberOfFloors}
            onChange={(e) => setNumberOfFloors(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Total Buildable Area (sq ft)</Label>
          <div className="text-xl font-semibold bg-gray-50 py-2 px-3 rounded-md border border-gray-200">
            {totalBuildableArea.toLocaleString()}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Actual FAR</Label>
            <span className={actualFar > parseFloat(farAllowance) ? "text-red-500 font-medium" : "text-green-600 font-medium"}>
              {actualFar.toFixed(2)}
            </span>
          </div>
          <Progress value={farUtilization} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0</span>
            <span>FAR Utilization: {farUtilization.toFixed(1)}%</span>
            <span>Allowance: {farAllowance}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BuildingParameters;
