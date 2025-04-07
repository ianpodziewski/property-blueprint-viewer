
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
        </CardContent>
      </Card>
    </div>
  );
};

export default OpRevAssumptions;
