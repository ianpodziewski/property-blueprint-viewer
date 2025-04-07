
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const CapExAssumptions = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Capital Expenditure Assumptions</h2>
        <p className="text-gray-600 mb-6">Plan for future capital expenditures throughout the property lifecycle.</p>
      </div>
      
      {/* Initial CapEx */}
      <Card>
        <CardHeader>
          <CardTitle>Initial Capital Expenditures</CardTitle>
          <CardDescription>Set up costs required at acquisition or development start</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="tenant-improvements">Tenant Improvements ($ psf)</Label>
            <Input id="tenant-improvements" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="leasing-commissions">Leasing Commissions (%)</Label>
            <Input id="leasing-commissions" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="initial-renovations">Initial Renovations ($)</Label>
            <Input id="initial-renovations" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="initial-capex-timing">Timing</Label>
            <Select>
              <SelectTrigger id="initial-capex-timing">
                <SelectValue placeholder="Select timing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="at-close">At Close</SelectItem>
                <SelectItem value="phased">Phased</SelectItem>
                <SelectItem value="upon-lease">Upon Lease Signing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Ongoing CapEx Reserve */}
      <Card>
        <CardHeader>
          <CardTitle>Ongoing CapEx Reserve</CardTitle>
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
          <div className="space-y-2">
            <Label htmlFor="capex-reserve-start">Start Year</Label>
            <Input id="capex-reserve-start" placeholder="1" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="capex-funding">Funding Account</Label>
            <Select>
              <SelectTrigger id="capex-funding">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operating">Operating Account</SelectItem>
                <SelectItem value="escrow">Escrow Account</SelectItem>
                <SelectItem value="separate">Separate Reserve Account</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Planned CapEx Projects */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div className="space-y-2">
                <Label htmlFor="capex1-funding-source">Funding Source</Label>
                <Select>
                  <SelectTrigger id="capex1-funding-source">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reserves">CapEx Reserves</SelectItem>
                    <SelectItem value="new-debt">New Debt</SelectItem>
                    <SelectItem value="equity">Additional Equity</SelectItem>
                    <SelectItem value="cash-flow">Operating Cash Flow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="capex1-timing">Timing</Label>
                <Select>
                  <SelectTrigger id="capex1-timing">
                    <SelectValue placeholder="Select timing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginning">Beginning of Year</SelectItem>
                    <SelectItem value="mid">Mid-Year</SelectItem>
                    <SelectItem value="end">End of Year</SelectItem>
                    <SelectItem value="quarter">Specific Quarter</SelectItem>
                  </SelectContent>
                </Select>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div className="space-y-2">
                <Label htmlFor="capex2-funding-source">Funding Source</Label>
                <Select>
                  <SelectTrigger id="capex2-funding-source">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reserves">CapEx Reserves</SelectItem>
                    <SelectItem value="new-debt">New Debt</SelectItem>
                    <SelectItem value="equity">Additional Equity</SelectItem>
                    <SelectItem value="cash-flow">Operating Cash Flow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="capex2-timing">Timing</Label>
                <Select>
                  <SelectTrigger id="capex2-timing">
                    <SelectValue placeholder="Select timing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginning">Beginning of Year</SelectItem>
                    <SelectItem value="mid">Mid-Year</SelectItem>
                    <SelectItem value="end">End of Year</SelectItem>
                    <SelectItem value="quarter">Specific Quarter</SelectItem>
                  </SelectContent>
                </Select>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div className="space-y-2">
                <Label htmlFor="capex3-funding-source">Funding Source</Label>
                <Select>
                  <SelectTrigger id="capex3-funding-source">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reserves">CapEx Reserves</SelectItem>
                    <SelectItem value="new-debt">New Debt</SelectItem>
                    <SelectItem value="equity">Additional Equity</SelectItem>
                    <SelectItem value="cash-flow">Operating Cash Flow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="capex3-timing">Timing</Label>
                <Select>
                  <SelectTrigger id="capex3-timing">
                    <SelectValue placeholder="Select timing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginning">Beginning of Year</SelectItem>
                    <SelectItem value="mid">Mid-Year</SelectItem>
                    <SelectItem value="end">End of Year</SelectItem>
                    <SelectItem value="quarter">Specific Quarter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Major Repairs */}
      <Card>
        <CardHeader>
          <CardTitle>Major Repairs & Replacements</CardTitle>
          <CardDescription>Plan for significant repairs/replacements by building system</CardDescription>
        </CardHeader>
        <CardContent>
          <Collapsible className="w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex w-full justify-between py-2 font-medium">
                Building Systems Lifecycle Planning
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b pb-4">
                <div className="font-medium">System</div>
                <div className="font-medium">Expected Life (Years)</div>
                <div className="font-medium">Replacement Cost ($)</div>
                <div className="font-medium">Funding Source</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b pb-4">
                <div className="space-y-2">
                  <Label htmlFor="roof-system">Roof</Label>
                  <Input id="roof-system" defaultValue="Roof" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roof-life">Life</Label>
                  <Input id="roof-life" placeholder="20" type="number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roof-cost">Cost</Label>
                  <Input id="roof-cost" placeholder="0" type="number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roof-funding">Funding</Label>
                  <Select>
                    <SelectTrigger id="roof-funding">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reserves">Reserves</SelectItem>
                      <SelectItem value="new-debt">New Debt</SelectItem>
                      <SelectItem value="cash-flow">Cash Flow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b pb-4">
                <div className="space-y-2">
                  <Label htmlFor="hvac-system">HVAC</Label>
                  <Input id="hvac-system" defaultValue="HVAC" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hvac-life">Life</Label>
                  <Input id="hvac-life" placeholder="15" type="number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hvac-cost">Cost</Label>
                  <Input id="hvac-cost" placeholder="0" type="number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hvac-funding">Funding</Label>
                  <Select>
                    <SelectTrigger id="hvac-funding">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reserves">Reserves</SelectItem>
                      <SelectItem value="new-debt">New Debt</SelectItem>
                      <SelectItem value="cash-flow">Cash Flow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="elevator-system">Elevator</Label>
                  <Input id="elevator-system" defaultValue="Elevator" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="elevator-life">Life</Label>
                  <Input id="elevator-life" placeholder="25" type="number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="elevator-cost">Cost</Label>
                  <Input id="elevator-cost" placeholder="0" type="number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="elevator-funding">Funding</Label>
                  <Select>
                    <SelectTrigger id="elevator-funding">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reserves">Reserves</SelectItem>
                      <SelectItem value="new-debt">New Debt</SelectItem>
                      <SelectItem value="cash-flow">Cash Flow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
      
      {/* Unit Renovation Program */}
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
          <div className="space-y-2">
            <Label htmlFor="unit-reno-funding">Funding Source</Label>
            <Select>
              <SelectTrigger id="unit-reno-funding">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="initial-loan">Initial Loan</SelectItem>
                <SelectItem value="capex-reserves">CapEx Reserves</SelectItem>
                <SelectItem value="supplemental-loan">Supplemental Loan</SelectItem>
                <SelectItem value="cash-flow">Operating Cash Flow</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CapExAssumptions;
