
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CapExAssumptions = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Capital Expenditure Assumptions</h2>
        <p className="text-gray-600 mb-6">Plan for future capital expenditures throughout the property lifecycle.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>CapEx Reserve</CardTitle>
          <CardDescription>Set aside funds for future capital expenditures</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="capex-percentage">Annual CapEx Reserve (% of Revenue)</Label>
            <Input id="capex-percentage" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="capex-perunit">Annual CapEx Reserve ($ per Unit)</Label>
            <Input id="capex-perunit" placeholder="0" type="number" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Planned CapEx Projects</CardTitle>
          <CardDescription>Schedule future capital improvement projects</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-2">Project 1</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capex1-description">Description</Label>
                <Input id="capex1-description" placeholder="e.g., Roof Replacement" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capex1-year">Year</Label>
                <Input id="capex1-year" placeholder="0" type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capex1-cost">Cost ($)</Label>
                <Input id="capex1-cost" placeholder="0" type="number" />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Project 2</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capex2-description">Description</Label>
                <Input id="capex2-description" placeholder="e.g., HVAC Upgrade" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capex2-year">Year</Label>
                <Input id="capex2-year" placeholder="0" type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capex2-cost">Cost ($)</Label>
                <Input id="capex2-cost" placeholder="0" type="number" />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Project 3</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capex3-description">Description</Label>
                <Input id="capex3-description" placeholder="e.g., Common Area Renovation" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capex3-year">Year</Label>
                <Input id="capex3-year" placeholder="0" type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capex3-cost">Cost ($)</Label>
                <Input id="capex3-cost" placeholder="0" type="number" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Unit Renovation Program</CardTitle>
          <CardDescription>Define unit renovation budgets and schedule</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="unit-reno-cost">Cost per Unit ($)</Label>
            <Input id="unit-reno-cost" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit-reno-premium">Expected Rent Premium (%)</Label>
            <Input id="unit-reno-premium" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit-reno-count">Number of Units to Renovate</Label>
            <Input id="unit-reno-count" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit-reno-pace">Pace (units per month)</Label>
            <Input id="unit-reno-pace" placeholder="0" type="number" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CapExAssumptions;
