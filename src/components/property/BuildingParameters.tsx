
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { FloorPlateTemplate } from '@/types/propertyTypes';

interface BuildingParametersProps {
  farAllowance: string;
  setFarAllowance: (value: string) => void;
  totalLandArea: string;
  setTotalLandArea: (value: string) => void;
  buildingFootprint: string;
  setBuildingFootprint: (value: string) => void;
  totalBuildableArea: number;
  totalAboveGroundArea: number;
  totalBelowGroundArea: number;
  actualFar: number;
  floorTemplates: FloorPlateTemplate[];
  addFloorTemplate: () => void;
  updateFloorTemplate: (id: string, field: keyof FloorPlateTemplate, value: string) => void;
  removeFloorTemplate: (id: string) => void;
}

const BuildingParameters: React.FC<BuildingParametersProps> = ({
  farAllowance,
  setFarAllowance,
  totalLandArea,
  setTotalLandArea,
  buildingFootprint,
  setBuildingFootprint,
  totalBuildableArea,
  totalAboveGroundArea,
  totalBelowGroundArea,
  actualFar,
  floorTemplates,
  addFloorTemplate,
  updateFloorTemplate,
  removeFloorTemplate
}) => {
  // Format numbers for display
  const formatNumber = (num: number): string => {
    return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Building Parameters</CardTitle>
        <CardDescription>Define the key metrics for your development</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Zoning Row */}
          <div>
            <h3 className="text-sm font-medium mb-2">Zoning Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="far-allowance">FAR Allowance</Label>
                <Input 
                  id="far-allowance" 
                  placeholder="0.0" 
                  type="number" 
                  step="0.1" 
                  min="0"
                  value={farAllowance}
                  onChange={(e) => setFarAllowance(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Floor Area Ratio permitted by zoning
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="total-land-area">Total Land Area (sq ft)</Label>
                <Input 
                  id="total-land-area" 
                  placeholder="0" 
                  type="number"
                  min="0" 
                  value={totalLandArea}
                  onChange={(e) => setTotalLandArea(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {/* Building Metrics Row */}
          <div>
            <h3 className="text-sm font-medium mb-2">Building Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="building-footprint">Building Footprint (sq ft)</Label>
                <Input 
                  id="building-footprint" 
                  placeholder="0" 
                  type="number" 
                  min="0"
                  value={buildingFootprint}
                  onChange={(e) => setBuildingFootprint(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Area of the ground floor
                </p>
              </div>
              
              <div className="col-span-2 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                  <div className="text-sm text-gray-500 mb-1">Above Ground Area</div>
                  <div className="text-lg font-semibold">{formatNumber(totalAboveGroundArea)} sq ft</div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                  <div className="text-sm text-gray-500 mb-1">Below Ground Area</div>
                  <div className="text-lg font-semibold">{formatNumber(totalBelowGroundArea)} sq ft</div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                  <div className="text-sm text-gray-500 mb-1">Total Buildable Area</div>
                  <div className="text-lg font-semibold">{formatNumber(totalBuildableArea)} sq ft</div>
                </div>
                
                <div className={`p-3 rounded-md border ${
                  actualFar > parseFloat(farAllowance) 
                    ? "bg-red-50 border-red-100" 
                    : "bg-green-50 border-green-100"
                }`}>
                  <div className="text-sm text-gray-500 mb-1">Actual FAR</div>
                  <div className="text-lg font-semibold flex items-center">
                    {actualFar.toFixed(2)}
                    <span className="text-xs ml-1">
                      ({formatNumber(Math.round(parseFloat(totalLandArea) * parseFloat(farAllowance)))} sq ft max)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BuildingParameters;
