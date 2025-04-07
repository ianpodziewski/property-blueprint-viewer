
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const OpRevAssumptions = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Operating Revenue Assumptions</h2>
        <p className="text-gray-600 mb-6">Define your revenue projections for the property.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>General Revenue Assumptions</CardTitle>
          <CardDescription>Set general revenue parameters</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="revenue-growth">Annual Revenue Growth Rate (%)</Label>
            <Input id="revenue-growth" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="occupancy-rate">Stabilized Occupancy Rate (%)</Label>
            <Input id="occupancy-rate" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="base-rent">Base Rent</Label>
            <div className="flex gap-2">
              <Input id="base-rent" placeholder="0" type="number" className="flex-1" />
              <Select defaultValue="psf">
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="psf">PSF</SelectItem>
                  <SelectItem value="unit">Per Unit</SelectItem>
                  <SelectItem value="total">Total</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rent-escalation">Rent Escalation (% per year)</Label>
            <Input id="rent-escalation" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vacancy-rate">Vacancy Rate (%)</Label>
            <Input id="vacancy-rate" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="collection-loss">Collection Loss (%)</Label>
            <Input id="collection-loss" placeholder="0" type="number" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Residential Income</CardTitle>
          <CardDescription>Define rental income for residential units</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-2">Studio Units</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studio-count">Number of Units</Label>
                <Input id="studio-count" placeholder="0" type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studio-rent">Monthly Rent ($)</Label>
                <Input id="studio-rent" placeholder="0" type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studio-sf">Square Footage</Label>
                <Input id="studio-sf" placeholder="0" type="number" />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">One Bedroom Units</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="one-bed-count">Number of Units</Label>
                <Input id="one-bed-count" placeholder="0" type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="one-bed-rent">Monthly Rent ($)</Label>
                <Input id="one-bed-rent" placeholder="0" type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="one-bed-sf">Square Footage</Label>
                <Input id="one-bed-sf" placeholder="0" type="number" />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Two Bedroom Units</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="two-bed-count">Number of Units</Label>
                <Input id="two-bed-count" placeholder="0" type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="two-bed-rent">Monthly Rent ($)</Label>
                <Input id="two-bed-rent" placeholder="0" type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="two-bed-sf">Square Footage</Label>
                <Input id="two-bed-sf" placeholder="0" type="number" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Commercial Income</CardTitle>
          <CardDescription>Define rental income for commercial spaces</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="commercial-area">Rentable Area (sq ft)</Label>
            <Input id="commercial-area" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="commercial-rent">Rent per Sq Ft ($ / year)</Label>
            <Input id="commercial-rent" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="commercial-term">Typical Lease Term (years)</Label>
            <Input id="commercial-term" placeholder="0" type="number" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lease-up Schedule</CardTitle>
          <CardDescription>Define the timeline to full occupancy by space type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="residential-lease-up">Residential Lease-up (months)</Label>
              <Input id="residential-lease-up" placeholder="0" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commercial-lease-up">Commercial Lease-up (months)</Label>
              <Input id="commercial-lease-up" placeholder="0" type="number" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lease-up-pattern">Lease-up Pattern</Label>
            <Select defaultValue="linear">
              <SelectTrigger>
                <SelectValue placeholder="Select pattern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linear">Linear</SelectItem>
                <SelectItem value="accelerated">Accelerated</SelectItem>
                <SelectItem value="slow-start">Slow Start</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Lease Terms</CardTitle>
          <CardDescription>Define lease terms and structures</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="residential-lease-length">Residential Lease Length (months)</Label>
              <Input id="residential-lease-length" placeholder="12" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commercial-lease-length">Commercial Lease Length (years)</Label>
              <Input id="commercial-lease-length" placeholder="5" type="number" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="commercial-lease-type">Commercial Lease Type</Label>
            <Select defaultValue="triple-net">
              <SelectTrigger>
                <SelectValue placeholder="Select lease type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="triple-net">Triple Net (NNN)</SelectItem>
                <SelectItem value="modified-gross">Modified Gross</SelectItem>
                <SelectItem value="full-service">Full Service/Gross</SelectItem>
                <SelectItem value="absolute-net">Absolute Net</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="renewal-probability">Renewal Probability (%)</Label>
            <Input id="renewal-probability" placeholder="70" type="number" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Seasonal Variations</CardTitle>
          <CardDescription>Account for seasonal rent and occupancy fluctuations</CardDescription>
        </CardHeader>
        <CardContent>
          <Collapsible className="w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex justify-between w-full">
                <span>Enable seasonal variations</span>
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="peak-season-months">Peak Season Months</Label>
                  <Input id="peak-season-months" placeholder="Jun-Aug" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="peak-rent-premium">Peak Season Rent Premium (%)</Label>
                  <Input id="peak-rent-premium" placeholder="0" type="number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="off-peak-discount">Off-Peak Discount (%)</Label>
                  <Input id="off-peak-discount" placeholder="0" type="number" />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Tenant Incentives</CardTitle>
          <CardDescription>Define incentives offered to attract tenants</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="free-rent-residential">Free Rent - Residential (months)</Label>
              <Input id="free-rent-residential" placeholder="0" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="free-rent-commercial">Free Rent - Commercial (months)</Label>
              <Input id="free-rent-commercial" placeholder="0" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant-improvements">Tenant Improvement Allowance ($ psf)</Label>
              <Input id="tenant-improvements" placeholder="0" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leasing-commission">Leasing Commission (%)</Label>
              <Input id="leasing-commission" placeholder="0" type="number" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Market-Driven Rent Adjustments</CardTitle>
          <CardDescription>Define how market conditions affect your rent assumptions</CardDescription>
        </CardHeader>
        <CardContent>
          <Collapsible className="w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex justify-between w-full">
                <span>Enable market adjustments</span>
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="market-growth-scenario">Market Growth Scenario</Label>
                  <Select defaultValue="base">
                    <SelectTrigger>
                      <SelectValue placeholder="Select scenario" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="base">Base Case</SelectItem>
                      <SelectItem value="upside">Upside Case</SelectItem>
                      <SelectItem value="downside">Downside Case</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="market-rent-delta">Market Rent Delta from Base (%)</Label>
                  <Input id="market-rent-delta" placeholder="0" type="number" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="market-rent-adjustment-timing">Adjustment Timing</Label>
                <Select defaultValue="immediate">
                  <SelectTrigger>
                    <SelectValue placeholder="Select timing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="upon-renewal">Upon Lease Renewal</SelectItem>
                    <SelectItem value="phased">Phased Over Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Other Income</CardTitle>
          <CardDescription>Additional revenue sources</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="parking-income">Parking ($ per year)</Label>
            <Input id="parking-income" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="storage-income">Storage ($ per year)</Label>
            <Input id="storage-income" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="laundry-income">Laundry/Vending ($ per year)</Label>
            <Input id="laundry-income" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="late-fees">Late Fees & Other ($ per year)</Label>
            <Input id="late-fees" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amenity-income">Amenity Fees ($ per year)</Label>
            <Input id="amenity-income" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="retail-percentage">Retail Percentage Rent (%)</Label>
            <Input id="retail-percentage" placeholder="0" type="number" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OpRevAssumptions;
