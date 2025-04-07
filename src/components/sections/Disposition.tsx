
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

const Disposition = () => {
  const [exitStrategy, setExitStrategy] = useState<"sale" | "refinance" | "hold">("sale");
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Disposition</h2>
        <p className="text-gray-600 mb-6">Plan your exit strategy and calculate returns.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Exit Strategy</CardTitle>
          <CardDescription>Choose your preferred exit strategy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup 
            defaultValue="sale" 
            className="flex space-x-8"
            value={exitStrategy}
            onValueChange={(value) => setExitStrategy(value as "sale" | "refinance" | "hold")}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sale" id="sale" />
              <Label htmlFor="sale">Sale</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="refinance" id="refinance" />
              <Label htmlFor="refinance">Refinance</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hold" id="hold" />
              <Label htmlFor="hold">Hold Long-Term</Label>
            </div>
          </RadioGroup>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="exit-period-type">Sale Period Type</Label>
              <Select defaultValue="year">
                <SelectTrigger>
                  <SelectValue placeholder="Select period type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="year">Year</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="exit-period">Sale Period</Label>
              <Input id="exit-period" placeholder="0" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exit-cap-rate">Exit Cap Rate (%)</Label>
              <Input id="exit-cap-rate" placeholder="0" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sales-costs">Sales Costs (%)</Label>
              <Input id="sales-costs" placeholder="0" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sale-price">Expected Sale Price ($)</Label>
              <Input id="sale-price" placeholder="0" type="number" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {exitStrategy === "refinance" && (
        <Card>
          <CardHeader>
            <CardTitle>Refinance Scenario</CardTitle>
            <CardDescription>Alternative to sale - refinancing the property</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="refinance-year">Refinance Year</Label>
              <Input id="refinance-year" placeholder="0" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="refinance-ltv">Refinance Loan-to-Value (%)</Label>
              <Input id="refinance-ltv" placeholder="0" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="refinance-interest">Interest Rate (%)</Label>
              <Input id="refinance-interest" placeholder="0" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="refinance-amortization">Amortization (years)</Label>
              <Input id="refinance-amortization" placeholder="0" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="refinance-term">Term (years)</Label>
              <Input id="refinance-term" placeholder="0" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="refinance-costs">Refinance Costs (%)</Label>
              <Input id="refinance-costs" placeholder="0" type="number" />
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Tax Implications</CardTitle>
          <CardDescription>Calculate tax effects on disposition</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="capital-gains-rate">Capital Gains Tax Rate (%)</Label>
            <Input id="capital-gains-rate" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="depreciation-recapture">Depreciation Recapture Rate (%)</Label>
            <Input id="depreciation-recapture" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cost-basis">Cost Basis ($)</Label>
            <Input id="cost-basis" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accumulated-depreciation">Accumulated Depreciation ($)</Label>
            <Input id="accumulated-depreciation" placeholder="0" type="number" />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="tax-notes">Tax Planning Notes</Label>
            <Textarea id="tax-notes" placeholder="Enter any tax planning considerations..." />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Returns Analysis</CardTitle>
          <CardDescription>View projected returns on your investment</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="project-irr">Project IRR (%)</Label>
            <Input id="project-irr" placeholder="0" disabled type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="equity-irr">Equity IRR (%)</Label>
            <Input id="equity-irr" placeholder="0" disabled type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="equity-multiple">Equity Multiple (x)</Label>
            <Input id="equity-multiple" placeholder="0" disabled type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="npv">NPV ($)</Label>
            <Input id="npv" placeholder="0" disabled type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cash-on-cash">Cash on Cash (%)</Label>
            <Input id="cash-on-cash" placeholder="0" disabled type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payback-period">Payback Period (years)</Label>
            <Input id="payback-period" placeholder="0" disabled type="number" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Disposition;
