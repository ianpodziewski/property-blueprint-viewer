
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SensitivityAnalysis = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Sensitivity Analysis</h2>
        <p className="text-gray-600 mb-6">Test how changing key variables impacts your investment returns.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Sensitivity Variables</CardTitle>
          <CardDescription>Select which variables to analyze</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="variable-1">Variable 1</Label>
            <Select>
              <SelectTrigger id="variable-1">
                <SelectValue placeholder="Select variable" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exit-cap">Exit Cap Rate</SelectItem>
                <SelectItem value="rent-growth">Rent Growth</SelectItem>
                <SelectItem value="construction-costs">Construction Costs</SelectItem>
                <SelectItem value="vacancy">Vacancy Rate</SelectItem>
                <SelectItem value="interest-rate">Interest Rate</SelectItem>
                <SelectItem value="opex">Operating Expenses</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="variable-2">Variable 2</Label>
            <Select>
              <SelectTrigger id="variable-2">
                <SelectValue placeholder="Select variable" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exit-cap">Exit Cap Rate</SelectItem>
                <SelectItem value="rent-growth">Rent Growth</SelectItem>
                <SelectItem value="construction-costs">Construction Costs</SelectItem>
                <SelectItem value="vacancy">Vacancy Rate</SelectItem>
                <SelectItem value="interest-rate">Interest Rate</SelectItem>
                <SelectItem value="opex">Operating Expenses</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="output-metric">Output Metric</Label>
            <Select>
              <SelectTrigger id="output-metric">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equity-irr">Equity IRR</SelectItem>
                <SelectItem value="project-irr">Project IRR</SelectItem>
                <SelectItem value="npv">NPV</SelectItem>
                <SelectItem value="equity-multiple">Equity Multiple</SelectItem>
                <SelectItem value="cash-on-cash">Cash on Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Scenario Analysis</CardTitle>
          <CardDescription>Compare multiple predefined scenarios</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-3">Base Case</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="base-rent-growth">Rent Growth (%)</Label>
                <Input id="base-rent-growth" placeholder="0" type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="base-exit-cap">Exit Cap Rate (%)</Label>
                <Input id="base-exit-cap" placeholder="0" type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="base-equity-irr">Equity IRR (%)</Label>
                <Input id="base-equity-irr" placeholder="0" disabled type="number" />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Upside Case</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="upside-rent-growth">Rent Growth (%)</Label>
                <Input id="upside-rent-growth" placeholder="0" type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="upside-exit-cap">Exit Cap Rate (%)</Label>
                <Input id="upside-exit-cap" placeholder="0" type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="upside-equity-irr">Equity IRR (%)</Label>
                <Input id="upside-equity-irr" placeholder="0" disabled type="number" />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Downside Case</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="downside-rent-growth">Rent Growth (%)</Label>
                <Input id="downside-rent-growth" placeholder="0" type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="downside-exit-cap">Exit Cap Rate (%)</Label>
                <Input id="downside-exit-cap" placeholder="0" type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="downside-equity-irr">Equity IRR (%)</Label>
                <Input id="downside-equity-irr" placeholder="0" disabled type="number" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Monte Carlo Simulation</CardTitle>
          <CardDescription>Run probabilistic analysis</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="simulation-runs">Number of Simulation Runs</Label>
            <Input id="simulation-runs" placeholder="1000" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="simulation-result">Probability of IRR {'>'} 15%</Label>
            <Input id="simulation-result" placeholder="0%" disabled />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SensitivityAnalysis;
