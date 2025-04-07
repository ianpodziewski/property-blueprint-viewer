
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

const Financing = () => {
  const [loanType, setLoanType] = useState<"construction" | "permanent" | "both">("both");
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Financing</h2>
        <p className="text-gray-600 mb-6">Set up your project's debt and equity structure.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Capital Stack</CardTitle>
          <CardDescription>Define your project's capital structure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="total-project-cost">Total Project Cost ($)</Label>
              <Input id="total-project-cost" placeholder="0" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="debt-amount">Debt Amount ($)</Label>
              <Input id="debt-amount" placeholder="0" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="equity-amount">Equity Amount ($)</Label>
              <Input id="equity-amount" placeholder="0" type="number" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="loan-to-cost">Loan to Cost (%)</Label>
              <Input id="loan-to-cost" placeholder="0" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loan-to-value">Loan to Value (%)</Label>
              <Input id="loan-to-value" placeholder="0" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dscr">Debt Service Coverage Ratio</Label>
              <Input id="dscr" placeholder="0" type="number" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debt Section */}
      <Card>
        <CardHeader>
          <CardTitle>Debt Financing</CardTitle>
          <CardDescription>Configure your debt structure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Loan Type</Label>
            <RadioGroup defaultValue="both" className="flex space-x-4" onValueChange={(value) => setLoanType(value as "construction" | "permanent" | "both")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="construction" id="construction" />
                <Label htmlFor="construction">Construction Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="permanent" id="permanent" />
                <Label htmlFor="permanent">Permanent Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both">Construction to Permanent</Label>
              </div>
            </RadioGroup>
          </div>
          
          {(loanType === "construction" || loanType === "both") && (
            <Accordion type="single" collapsible className="w-full" defaultValue="construction">
              <AccordionItem value="construction">
                <AccordionTrigger className="text-lg font-semibold">Construction Loan</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="construction-loan-amount">Loan Amount ($)</Label>
                      <Input id="construction-loan-amount" placeholder="0" type="number" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="construction-interest">Interest Rate (%)</Label>
                      <Input id="construction-interest" placeholder="0" type="number" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="construction-term">Term (months)</Label>
                      <Input id="construction-term" placeholder="0" type="number" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="construction-fees">Loan Fees (%)</Label>
                      <Input id="construction-fees" placeholder="0" type="number" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="construction-drawdown">Drawdown Schedule</Label>
                      <Select>
                        <SelectTrigger id="construction-drawdown">
                          <SelectValue placeholder="Select schedule" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="milestone">Milestone Based</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="construction-interest-reserve">Interest Reserve ($)</Label>
                      <Input id="construction-interest-reserve" placeholder="0" type="number" />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="construction-recourse">Recourse</Label>
                      <Select>
                        <SelectTrigger id="construction-recourse">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">Full Recourse</SelectItem>
                          <SelectItem value="partial">Partial Recourse</SelectItem>
                          <SelectItem value="non">Non-Recourse</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
          
          {(loanType === "permanent" || loanType === "both") && (
            <Accordion type="single" collapsible className="w-full" defaultValue="permanent">
              <AccordionItem value="permanent">
                <AccordionTrigger className="text-lg font-semibold">Permanent Financing</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="permanent-loan-amount">Loan Amount ($)</Label>
                      <Input id="permanent-loan-amount" placeholder="0" type="number" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="permanent-interest">Interest Rate (%)</Label>
                      <Input id="permanent-interest" placeholder="0" type="number" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amortization">Amortization (years)</Label>
                      <Input id="amortization" placeholder="0" type="number" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="permanent-term">Term (years)</Label>
                      <Input id="permanent-term" placeholder="0" type="number" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="permanent-fees">Loan Fees (%)</Label>
                      <Input id="permanent-fees" placeholder="0" type="number" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prepayment-penalty">Prepayment Penalty</Label>
                      <Select>
                        <SelectTrigger id="prepayment-penalty">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="yield-maintenance">Yield Maintenance</SelectItem>
                          <SelectItem value="stepdown">Step Down</SelectItem>
                          <SelectItem value="fixed">Fixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="interest-type">Interest Type</Label>
                      <Select>
                        <SelectTrigger id="interest-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Fixed</SelectItem>
                          <SelectItem value="variable">Variable</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="min-dscr">Minimum DSCR Covenant</Label>
                      <Input id="min-dscr" placeholder="0" type="number" />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="additional">
              <AccordionTrigger>Additional Debt Terms</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="debt-service-reserve">Debt Service Reserve ($)</Label>
                    <Input id="debt-service-reserve" placeholder="0" type="number" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reserve-months">Reserve Duration (months)</Label>
                    <Input id="reserve-months" placeholder="0" type="number" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="additional-covenants">Additional Lender Covenants</Label>
                    <Input id="additional-covenants" placeholder="Enter any additional covenants" />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
      
      {/* Equity Section */}
      <Card>
        <CardHeader>
          <CardTitle>Equity Structure</CardTitle>
          <CardDescription>Configure equity investment terms</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="gp-percentage">GP Percentage (%)</Label>
              <Input id="gp-percentage" placeholder="0" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lp-percentage">LP Percentage (%)</Label>
              <Input id="lp-percentage" placeholder="0" type="number" />
            </div>
          </div>
          
          <Accordion type="single" collapsible className="w-full" defaultValue="preferred">
            <AccordionItem value="preferred">
              <AccordionTrigger className="text-lg font-semibold">Preferred Return Structure</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="pref-return">Preferred Return (%)</Label>
                    <Input id="pref-return" placeholder="0" type="number" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pref-structure">Structure</Label>
                    <Select>
                      <SelectTrigger id="pref-structure">
                        <SelectValue placeholder="Select structure" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cumulative">Cumulative</SelectItem>
                        <SelectItem value="non-cumulative">Non-Cumulative</SelectItem>
                        <SelectItem value="compounding">Compounding</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="catchup">GP Catch-up (%)</Label>
                    <Input id="catchup" placeholder="0" type="number" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment-frequency">Payment Frequency</Label>
                    <Select>
                      <SelectTrigger id="payment-frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                        <SelectItem value="exit">At Exit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <Accordion type="single" collapsible className="w-full" defaultValue="promote">
            <AccordionItem value="promote">
              <AccordionTrigger className="text-lg font-semibold">Promote Structure</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 mt-4">
                  <Alert variant="default" className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Performance-Based Equity Distribution</AlertTitle>
                    <AlertDescription>
                      Define how profits are split after preferred returns are paid, based on project performance tiers.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-6 mt-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="font-medium">IRR Threshold</div>
                      <div className="font-medium">LP Split (%)</div>
                      <div className="font-medium">GP Split (%)</div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="tier1">Tier 1 (up to)</Label>
                        <Input id="tier1" placeholder="0" type="number" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="tier1-lp">LP %</Label>
                        <Input id="tier1-lp" placeholder="0" type="number" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="tier1-gp">GP %</Label>
                        <Input id="tier1-gp" placeholder="0" type="number" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="tier2">Tier 2 (up to)</Label>
                        <Input id="tier2" placeholder="0" type="number" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="tier2-lp">LP %</Label>
                        <Input id="tier2-lp" placeholder="0" type="number" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="tier2-gp">GP %</Label>
                        <Input id="tier2-gp" placeholder="0" type="number" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="tier3">Tier 3 (above)</Label>
                        <Input id="tier3" placeholder="0" type="number" disabled />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="tier3-lp">LP %</Label>
                        <Input id="tier3-lp" placeholder="0" type="number" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="tier3-gp">GP %</Label>
                        <Input id="tier3-gp" placeholder="0" type="number" />
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm" className="mt-2">
                      Add Tier
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <Accordion type="single" collapsible className="w-full" defaultValue="funding">
            <AccordionItem value="funding">
              <AccordionTrigger className="text-lg font-semibold">Equity Contribution Timing</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="contribution-type">Contribution Method</Label>
                    <Select>
                      <SelectTrigger id="contribution-type">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upfront">Upfront (100%)</SelectItem>
                        <SelectItem value="phased">Phased</SelectItem>
                        <SelectItem value="milestone">Milestone-Based</SelectItem>
                        <SelectItem value="capital-call">Capital Call</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-1">
                      <Label htmlFor="initial-contribution">Initial Contribution (%)</Label>
                      <Input id="initial-contribution" placeholder="0" type="number" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="capital-call-notice">Capital Call Notice (days)</Label>
                      <Input id="capital-call-notice" placeholder="0" type="number" />
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <Label>Contribution Schedule</Label>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div className="font-medium">Milestone/Date</div>
                      <div className="font-medium">Amount ($)</div>
                      <div className="font-medium">Percentage</div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-1">
                      <div className="space-y-1">
                        <Input placeholder="E.g., Closing" />
                      </div>
                      <div className="space-y-1">
                        <Input placeholder="0" type="number" />
                      </div>
                      <div className="space-y-1">
                        <Input placeholder="0" type="number" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-1">
                      <div className="space-y-1">
                        <Input placeholder="E.g., Construction Start" />
                      </div>
                      <div className="space-y-1">
                        <Input placeholder="0" type="number" />
                      </div>
                      <div className="space-y-1">
                        <Input placeholder="0" type="number" />
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm" className="mt-2">
                      Add Contribution
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="additional-equity">
              <AccordionTrigger>Additional Equity Terms</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="minimum-investment">Minimum Investment ($)</Label>
                    <Input id="minimum-investment" placeholder="0" type="number" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target-multiple">Target Equity Multiple</Label>
                    <Input id="target-multiple" placeholder="0" type="number" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target-irr">Target IRR (%)</Label>
                    <Input id="target-irr" placeholder="0" type="number" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target-hold">Target Hold Period (years)</Label>
                    <Input id="target-hold" placeholder="0" type="number" />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default Financing;
