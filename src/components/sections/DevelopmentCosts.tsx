
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DevelopmentCosts = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Development Costs</h2>
        <p className="text-gray-600 mb-6">Track all development costs for your project.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Land Acquisition</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="land-cost">Land Cost ($)</Label>
            <Input id="land-cost" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="closing-costs">Closing Costs ($)</Label>
            <Input id="closing-costs" placeholder="0" type="number" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Hard Costs</CardTitle>
          <CardDescription>Construction and materials costs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="construction-costs">Construction Costs ($)</Label>
              <Input id="construction-costs" placeholder="0" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost-per-sqft">Cost Per Sq Ft ($)</Label>
              <Input id="cost-per-sqft" placeholder="0" type="number" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="site-work">Site Work ($)</Label>
              <Input id="site-work" placeholder="0" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contingency">Contingency (%)</Label>
              <Input id="contingency" placeholder="0" type="number" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Soft Costs</CardTitle>
          <CardDescription>Non-construction expenses</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="architecture">Architecture & Engineering ($)</Label>
            <Input id="architecture" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="permit-fees">Permit Fees ($)</Label>
            <Input id="permit-fees" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="legal-fees">Legal & Accounting ($)</Label>
            <Input id="legal-fees" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="marketing">Marketing & Leasing ($)</Label>
            <Input id="marketing" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="developer-fee">Developer Fee ($)</Label>
            <Input id="developer-fee" placeholder="0" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="property-taxes">Property Taxes During Construction ($)</Label>
            <Input id="property-taxes" placeholder="0" type="number" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DevelopmentCosts;
