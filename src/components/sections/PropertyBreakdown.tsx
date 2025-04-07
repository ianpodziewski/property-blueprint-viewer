
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PropertyBreakdown = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Property Breakdown</h2>
        <p className="text-gray-600 mb-6">Define the basic characteristics and mix of your development project.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
          <CardDescription>Set your project's basic details</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input id="project-name" placeholder="Enter project name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" placeholder="City, State" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-type">Project Type</Label>
            <Input id="project-type" placeholder="Mixed-use, Residential, etc." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="total-area">Total Land Area (sq ft)</Label>
            <Input id="total-area" placeholder="0" type="number" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Property Mix</CardTitle>
          <CardDescription>Define the mix of property types in your development</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-2">Residential</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="residential-units">Number of Units</Label>
                  <Input id="residential-units" placeholder="0" type="number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="residential-area">Total Area (sq ft)</Label>
                  <Input id="residential-area" placeholder="0" type="number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="residential-percentage">% of Total</Label>
                  <Input id="residential-percentage" placeholder="0" type="number" />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Commercial</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commercial-units">Number of Units</Label>
                  <Input id="commercial-units" placeholder="0" type="number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commercial-area">Total Area (sq ft)</Label>
                  <Input id="commercial-area" placeholder="0" type="number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commercial-percentage">% of Total</Label>
                  <Input id="commercial-percentage" placeholder="0" type="number" />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Retail</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="retail-units">Number of Units</Label>
                  <Input id="retail-units" placeholder="0" type="number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retail-area">Total Area (sq ft)</Label>
                  <Input id="retail-area" placeholder="0" type="number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retail-percentage">% of Total</Label>
                  <Input id="retail-percentage" placeholder="0" type="number" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyBreakdown;
