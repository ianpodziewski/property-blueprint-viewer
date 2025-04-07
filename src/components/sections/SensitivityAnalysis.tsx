
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

const SensitivityAnalysis = () => {
  const [variable1, setVariable1] = useState<string>("");
  const [variable2, setVariable2] = useState<string>("");
  const [outputMetric, setOutputMetric] = useState<string>("");
  
  // Variable ranges
  const [rangeMin1, setRangeMin1] = useState<number>(0);
  const [rangeMax1, setRangeMax1] = useState<number>(0);
  const [rangeMin2, setRangeMin2] = useState<number>(0);
  const [rangeMax2, setRangeMax2] = useState<number>(0);
  
  // Scenario values
  const [baseRentGrowth, setBaseRentGrowth] = useState<number>(3);
  const [baseExitCap, setBaseExitCap] = useState<number>(5.5);
  const [upsideRentGrowth, setUpsideRentGrowth] = useState<number>(5);
  const [upsideExitCap, setUpsideExitCap] = useState<number>(5);
  const [downsideRentGrowth, setDownsideRentGrowth] = useState<number>(1);
  const [downsideExitCap, setDownsideExitCap] = useState<number>(6);
  
  // Mock data for chart
  const sensitivityData = [
    { name: '-20%', irr: 10.2, npv: 1800000 },
    { name: '-10%', irr: 12.5, npv: 2200000 },
    { name: 'Base', irr: 15.0, npv: 2600000 },
    { name: '+10%', irr: 17.3, npv: 3000000 },
    { name: '+20%', irr: 19.8, npv: 3400000 },
  ];
  
  const handleRunAnalysis = () => {
    console.log("Running sensitivity analysis with:", { 
      variable1, variable2, outputMetric, 
      ranges: { variable1: [rangeMin1, rangeMax1], variable2: [rangeMin2, rangeMax2] } 
    });
    // In a real implementation, this would calculate and update results
  };
  
  const handleApplyScenario = (scenario: 'base' | 'upside' | 'downside') => {
    console.log(`Applying ${scenario} scenario`);
    // In a real implementation, this would apply the scenario values and update results
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Sensitivity Analysis</h2>
        <p className="text-gray-600 mb-6">Test how changing key variables impacts your investment returns.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Sensitivity Variables</CardTitle>
          <CardDescription>Select which variables to analyze and their ranges</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="variable-1">Variable 1</Label>
                <Select value={variable1} onValueChange={setVariable1}>
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
              
              {variable1 && (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label>Range</Label>
                    <div className="text-sm text-gray-500">
                      {rangeMin1}% - {rangeMax1}%
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="range-min-1">Minimum</Label>
                      <Input 
                        id="range-min-1" 
                        type="number" 
                        value={rangeMin1} 
                        onChange={(e) => setRangeMin1(Number(e.target.value))}
                        placeholder="Min value" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="range-max-1">Maximum</Label>
                      <Input 
                        id="range-max-1" 
                        type="number" 
                        value={rangeMax1} 
                        onChange={(e) => setRangeMax1(Number(e.target.value))}
                        placeholder="Max value" 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="variable-2">Variable 2 (Optional)</Label>
                <Select value={variable2} onValueChange={setVariable2}>
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
              
              {variable2 && (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label>Range</Label>
                    <div className="text-sm text-gray-500">
                      {rangeMin2}% - {rangeMax2}%
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="range-min-2">Minimum</Label>
                      <Input 
                        id="range-min-2" 
                        type="number" 
                        value={rangeMin2} 
                        onChange={(e) => setRangeMin2(Number(e.target.value))}
                        placeholder="Min value" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="range-max-2">Maximum</Label>
                      <Input 
                        id="range-max-2" 
                        type="number" 
                        value={rangeMax2} 
                        onChange={(e) => setRangeMax2(Number(e.target.value))}
                        placeholder="Max value" 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="output-metric">Output Metric</Label>
              <Select value={outputMetric} onValueChange={setOutputMetric}>
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
            
            <div className="flex items-end">
              <Button 
                onClick={handleRunAnalysis}
                className="bg-blue-600 hover:bg-blue-700 w-full"
              >
                Run Analysis
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {(variable1 || variable2) && outputMetric && (
        <Card>
          <CardHeader>
            <CardTitle>Sensitivity Results</CardTitle>
            <CardDescription>
              How {outputMetric === 'equity-irr' ? 'Equity IRR' : 
                outputMetric === 'project-irr' ? 'Project IRR' : 
                outputMetric === 'npv' ? 'NPV' : 
                outputMetric === 'equity-multiple' ? 'Equity Multiple' : 'Cash on Cash'} 
              changes with {variable1 && variable2 ? `${variable1} and ${variable2}` : (variable1 || variable2)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ChartContainer
                className="h-full"
                config={{
                  irr: {
                    label: "IRR (%)",
                    color: "#2563eb",
                  },
                  npv: {
                    label: "NPV ($)",
                    color: "#16a34a",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={sensitivityData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      label={{ value: 'Variable Change', position: 'insideBottom', offset: -5 }} 
                    />
                    <YAxis 
                      yAxisId="left"
                      orientation="left"
                      stroke="#2563eb"
                      label={{ value: 'IRR (%)', angle: -90, position: 'insideLeft' }} 
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      stroke="#16a34a"
                      label={{ value: 'NPV ($)', angle: -90, position: 'insideRight' }} 
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="irr"
                      stroke="#2563eb"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="npv"
                      stroke="#16a34a"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Scenario Analysis</CardTitle>
          <CardDescription>Compare multiple predefined scenarios</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Base Case</h4>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleApplyScenario('base')}
              >
                Apply Scenario
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="base-rent-growth">Rent Growth (%)</Label>
                <Input 
                  id="base-rent-growth" 
                  value={baseRentGrowth} 
                  onChange={(e) => setBaseRentGrowth(Number(e.target.value))}
                  type="number" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="base-exit-cap">Exit Cap Rate (%)</Label>
                <Input 
                  id="base-exit-cap" 
                  value={baseExitCap} 
                  onChange={(e) => setBaseExitCap(Number(e.target.value))}
                  type="number" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="base-equity-irr">Equity IRR (%)</Label>
                <Input id="base-equity-irr" placeholder="15.0" disabled type="number" />
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Upside Case</h4>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleApplyScenario('upside')}
              >
                Apply Scenario
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="upside-rent-growth">Rent Growth (%)</Label>
                <Input 
                  id="upside-rent-growth" 
                  value={upsideRentGrowth} 
                  onChange={(e) => setUpsideRentGrowth(Number(e.target.value))}
                  type="number" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="upside-exit-cap">Exit Cap Rate (%)</Label>
                <Input 
                  id="upside-exit-cap" 
                  value={upsideExitCap} 
                  onChange={(e) => setUpsideExitCap(Number(e.target.value))}
                  type="number" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="upside-equity-irr">Equity IRR (%)</Label>
                <Input id="upside-equity-irr" placeholder="19.8" disabled type="number" />
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Downside Case</h4>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleApplyScenario('downside')}
              >
                Apply Scenario
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="downside-rent-growth">Rent Growth (%)</Label>
                <Input 
                  id="downside-rent-growth" 
                  value={downsideRentGrowth} 
                  onChange={(e) => setDownsideRentGrowth(Number(e.target.value))}
                  type="number" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="downside-exit-cap">Exit Cap Rate (%)</Label>
                <Input 
                  id="downside-exit-cap" 
                  value={downsideExitCap} 
                  onChange={(e) => setDownsideExitCap(Number(e.target.value))}
                  type="number" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="downside-equity-irr">Equity IRR (%)</Label>
                <Input id="downside-equity-irr" placeholder="10.2" disabled type="number" />
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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="simulation-runs">Number of Simulation Runs</Label>
              <Input id="simulation-runs" placeholder="1000" type="number" />
            </div>
            <div className="space-y-2">
              <Label>Target IRR Threshold (%)</Label>
              <Slider defaultValue={[15]} max={30} step={0.5} />
              <div className="text-right text-sm text-gray-500">15%</div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="simulation-result">Probability of IRR {'>'} 15%</Label>
            <div className="h-20 flex items-center justify-center bg-gray-50 rounded-md border border-gray-200">
              <span className="text-3xl font-semibold">68%</span>
            </div>
            <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
              Run Monte Carlo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SensitivityAnalysis;
