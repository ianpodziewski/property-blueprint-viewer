import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type CostMetricType = "psf" | "per_unit" | "lump_sum";
type CustomCostItem = {
  id: string;
  name: string;
  amount: string;
  metric: CostMetricType;
};

const DevelopmentCosts = () => {
  const [landCustomCosts, setLandCustomCosts] = useState<CustomCostItem[]>([]);
  const [hardCustomCosts, setHardCustomCosts] = useState<CustomCostItem[]>([]);
  const [softCustomCosts, setSoftCustomCosts] = useState<CustomCostItem[]>([]);
  const [otherCustomCosts, setOtherCustomCosts] = useState<CustomCostItem[]>([]);
  
  const addCustomCost = (section: string) => {
    const newCost: CustomCostItem = {
      id: crypto.randomUUID(),
      name: "",
      amount: "",
      metric: "lump_sum"
    };
    
    switch(section) {
      case "land":
        setLandCustomCosts([...landCustomCosts, newCost]);
        break;
      case "hard":
        setHardCustomCosts([...hardCustomCosts, newCost]);
        break;
      case "soft":
        setSoftCustomCosts([...softCustomCosts, newCost]);
        break;
      case "other":
        setOtherCustomCosts([...otherCustomCosts, newCost]);
        break;
    }
  };
  
  const removeCustomCost = (id: string, section: string) => {
    switch(section) {
      case "land":
        setLandCustomCosts(landCustomCosts.filter(cost => cost.id !== id));
        break;
      case "hard":
        setHardCustomCosts(hardCustomCosts.filter(cost => cost.id !== id));
        break;
      case "soft":
        setSoftCustomCosts(softCustomCosts.filter(cost => cost.id !== id));
        break;
      case "other":
        setOtherCustomCosts(otherCustomCosts.filter(cost => cost.id !== id));
        break;
    }
  };
  
  const handleCustomCostChange = (
    id: string, 
    field: keyof CustomCostItem, 
    value: string, 
    section: string
  ) => {
    switch(section) {
      case "land":
        setLandCustomCosts(landCustomCosts.map(cost => 
          cost.id === id ? { ...cost, [field]: value } : cost
        ));
        break;
      case "hard":
        setHardCustomCosts(hardCustomCosts.map(cost => 
          cost.id === id ? { ...cost, [field]: value } : cost
        ));
        break;
      case "soft":
        setSoftCustomCosts(softCustomCosts.map(cost => 
          cost.id === id ? { ...cost, [field]: value } : cost
        ));
        break;
      case "other":
        setOtherCustomCosts(otherCustomCosts.map(cost => 
          cost.id === id ? { ...cost, [field]: value } : cost
        ));
        break;
    }
  };
  
  const renderCustomCostFields = (
    items: CustomCostItem[], 
    section: string
  ) => {
    return items.map((item) => (
      <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4 items-end">
        <div className="space-y-2 md:col-span-5">
          <Label htmlFor={`${item.id}-name`}>Cost Name</Label>
          <Input 
            id={`${item.id}-name`} 
            value={item.name} 
            onChange={(e) => handleCustomCostChange(item.id, "name", e.target.value, section)}
            placeholder="Enter cost name"
          />
        </div>
        <div className="space-y-2 md:col-span-3">
          <Label htmlFor={`${item.id}-amount`}>Amount</Label>
          <Input 
            id={`${item.id}-amount`} 
            value={item.amount} 
            onChange={(e) => handleCustomCostChange(item.id, "amount", e.target.value, section)}
            type="number" 
            placeholder="0"
          />
        </div>
        <div className="space-y-2 md:col-span-3">
          <Label htmlFor={`${item.id}-metric`}>Metric</Label>
          <Select 
            value={item.metric} 
            onValueChange={(value) => handleCustomCostChange(item.id, "metric", value as CostMetricType, section)}
          >
            <SelectTrigger id={`${item.id}-metric`}>
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="psf">Per Square Foot</SelectItem>
              <SelectItem value="per_unit">Per Unit</SelectItem>
              <SelectItem value="lump_sum">Lump Sum</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-1 flex justify-end">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => removeCustomCost(item.id, section)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-5 w-5" />
            <span className="sr-only">Remove</span>
          </Button>
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Development Costs</h2>
        <p className="text-gray-600 mb-6">Track all development costs for your project.</p>
      </div>
      
      {/* Land Costs Section */}
      <Card>
        <CardHeader>
          <CardTitle>Land Costs</CardTitle>
          <CardDescription>Acquisition and related expenses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="purchase-price">Purchase Price ($)</Label>
              <Input id="purchase-price" placeholder="0" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price-metric">Metric</Label>
              <Select defaultValue="lump_sum">
                <SelectTrigger id="price-metric">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="psf">Per Square Foot</SelectItem>
                  <SelectItem value="per_unit">Per Unit</SelectItem>
                  <SelectItem value="lump_sum">Lump Sum</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="closing-costs">Closing Costs ($)</Label>
              <Input id="closing-costs" placeholder="0" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="closing-metric">Metric</Label>
              <Select defaultValue="lump_sum">
                <SelectTrigger id="closing-metric">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="psf">Per Square Foot</SelectItem>
                  <SelectItem value="per_unit">Per Unit</SelectItem>
                  <SelectItem value="lump_sum">Lump Sum</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {renderCustomCostFields(landCustomCosts, "land")}
          
          <Button 
            variant="outline" 
            onClick={() => addCustomCost("land")} 
            className="mt-4"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Custom Land Cost
          </Button>
        </CardContent>
      </Card>
      
      {/* Hard Costs Section */}
      <Card>
        <CardHeader>
          <CardTitle>Hard Costs</CardTitle>
          <CardDescription>Construction and materials costs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="shell-cost">Shell Cost</Label>
              <Input id="shell-cost" placeholder="0" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shell-metric">Metric</Label>
              <Select defaultValue="psf">
                <SelectTrigger id="shell-metric">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="psf">Per Square Foot</SelectItem>
                  <SelectItem value="per_unit">Per Unit</SelectItem>
                  <SelectItem value="lump_sum">Lump Sum</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="ti-cost">Tenant Improvement (TI) Cost</Label>
              <Input id="ti-cost" placeholder="0" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ti-metric">Metric</Label>
              <Select defaultValue="psf">
                <SelectTrigger id="ti-metric">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="psf">Per Square Foot</SelectItem>
                  <SelectItem value="per_unit">Per Unit</SelectItem>
                  <SelectItem value="lump_sum">Lump Sum</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="sustainability-costs">Sustainability Costs</Label>
              <Input id="sustainability-costs" placeholder="0" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sustainability-metric">Metric</Label>
              <Select defaultValue="psf">
                <SelectTrigger id="sustainability-metric">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="psf">Per Square Foot</SelectItem>
                  <SelectItem value="per_unit">Per Unit</SelectItem>
                  <SelectItem value="lump_sum">Lump Sum</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex items-center text-blue-600 p-0 hover:bg-transparent">
                <span className="underline">Show sustainability details</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 pl-4 border-l-2 border-blue-100">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="leed-certification">LEED Certification</Label>
                    <Input id="leed-certification" placeholder="0" type="number" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="solar-panels">Solar Panels</Label>
                    <Input id="solar-panels" placeholder="0" type="number" />
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="site-work">Site Work</Label>
              <Input id="site-work" placeholder="0" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contingency">Contingency (%)</Label>
              <Input id="contingency" placeholder="0" type="number" />
            </div>
          </div>
          
          {renderCustomCostFields(hardCustomCosts, "hard")}
          
          <Button 
            variant="outline" 
            onClick={() => addCustomCost("hard")} 
            className="mt-4"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Custom Hard Cost
          </Button>
        </CardContent>
      </Card>
      
      {/* Soft Costs Section */}
      <Card>
        <CardHeader>
          <CardTitle>Soft Costs</CardTitle>
          <CardDescription>Non-construction expenses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          </div>
          
          {renderCustomCostFields(softCustomCosts, "soft")}
          
          <Button 
            variant="outline" 
            onClick={() => addCustomCost("soft")} 
            className="mt-4"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Custom Soft Cost
          </Button>
        </CardContent>
      </Card>
      
      {/* Other Costs Section */}
      <Card>
        <CardHeader>
          <CardTitle>Other Costs</CardTitle>
          <CardDescription>Additional project expenses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="financing-fees">Financing Fees</Label>
              <Input id="financing-fees" placeholder="0" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interest-reserve">Interest Reserve</Label>
              <Input id="interest-reserve" placeholder="0" type="number" />
            </div>
          </div>
          
          {renderCustomCostFields(otherCustomCosts, "other")}
          
          <Button 
            variant="outline" 
            onClick={() => addCustomCost("other")} 
            className="mt-4"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Custom Other Cost
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DevelopmentCosts;
