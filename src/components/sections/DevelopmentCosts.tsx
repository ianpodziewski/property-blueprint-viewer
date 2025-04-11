import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { PlusCircle, Trash2 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useModel } from "@/context/ModelContext";
import { PropertyTypeHardCosts } from "./costs/PropertyTypeHardCosts";
import { CalculationMethod, PropertyType } from "@/hooks/useDevelopmentCosts";

type CostMetricType = "psf" | "per_unit" | "lump_sum";
type CustomCostItem = {
  id: string;
  name: string;
  amount: string;
  metric: CostMetricType;
};

const DevelopmentCosts = () => {
  const { developmentCosts } = useModel();
  const [landCustomCosts, setLandCustomCosts] = useState<CustomCostItem[]>([]);
  const [hardCustomCosts, setHardCustomCosts] = useState<CustomCostItem[]>([]);
  const [softCustomCosts, setSoftCustomCosts] = useState<CustomCostItem[]>([]);
  const [otherCustomCosts, setOtherCustomCosts] = useState<CustomCostItem[]>([]);
  
  const propertyTypes = developmentCosts.availablePropertyTypes;
  
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  };

  const totalHardCosts = developmentCosts.calculateTotalHardCosts();
  const costPerGrossSF = developmentCosts.calculateCostPerGrossSF();
  const shellVsTI = developmentCosts.calculateShellVsTI();
  const propertyTypeBreakdown = developmentCosts.calculatePropertyTypeBreakdown();

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
              <Input 
                id="purchase-price" 
                placeholder="0" 
                type="number" 
                value={developmentCosts.purchasePrice}
                onChange={(e) => developmentCosts.setPurchasePrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price-metric">Metric</Label>
              <Select 
                value={developmentCosts.purchasePriceMetric}
                onValueChange={developmentCosts.setPurchasePriceMetric}
              >
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
              <Input 
                id="closing-costs" 
                placeholder="0" 
                type="number"
                value={developmentCosts.closingCosts}
                onChange={(e) => developmentCosts.setClosingCosts(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="closing-metric">Metric</Label>
              <Select 
                value={developmentCosts.closingCostsMetric}
                onValueChange={developmentCosts.setClosingCostsMetric}
              >
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
            onClick={() => developmentCosts.addCustomCost("land")} 
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
          <CardDescription>Construction and materials costs by property type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="bg-gray-50">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Hard Costs</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalHardCosts)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Cost per Gross SF</p>
                  <p className="text-2xl font-bold">{formatCurrency(costPerGrossSF)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Shell vs. TI</p>
                  <p className="text-lg">
                    <span className="font-medium text-blue-700">{formatPercentage(shellVsTI.shell)}</span> / 
                    <span className="font-medium text-green-600"> {formatPercentage(shellVsTI.ti)}</span>
                    {shellVsTI.other > 0 && (
                      <span className="font-medium text-gray-500"> / {formatPercentage(shellVsTI.other)} other</span>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-500 mb-2">Cost Breakdown by Property Type</p>
                <div className="space-y-2">
                  {propertyTypes.map(type => (
                    <div key={type} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                        <span>{formatPercentage(propertyTypeBreakdown[type] || 0)}</span>
                      </div>
                      <Progress value={propertyTypeBreakdown[type] || 0} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {developmentCosts.loading ? (
            <div className="text-center py-8">Loading property types...</div>
          ) : (
            propertyTypes.map((propertyType) => (
              <PropertyTypeHardCosts
                key={propertyType}
                propertyType={propertyType}
                costs={developmentCosts.getHardCostsByPropertyType(propertyType)}
                propertyArea={developmentCosts.propertyAreas[propertyType] || 0}
                propertyUnits={developmentCosts.propertyUnits[propertyType] || 0}
                onAddCost={developmentCosts.addHardCost}
                onUpdateCost={developmentCosts.updateHardCost}
                onDeleteCost={developmentCosts.deleteHardCost}
                subtotal={developmentCosts.calculatePropertyTypeSubtotal(propertyType)}
                byUnitType={developmentCosts.isByUnitType(propertyType)}
                onToggleByUnitType={(value) => developmentCosts.toggleByUnitType(propertyType, value)}
              />
            ))
          )}
          
          <div className="mt-8">
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
                      <Input 
                        id="leed-certification" 
                        placeholder="0" 
                        type="number"
                        value={developmentCosts.leedCertificationCost}
                        onChange={(e) => developmentCosts.setLeedCertificationCost(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="solar-panels">Solar Panels</Label>
                      <Input 
                        id="solar-panels" 
                        placeholder="0" 
                        type="number"
                        value={developmentCosts.solarPanelsCost}
                        onChange={(e) => developmentCosts.setSolarPanelsCost(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-6">
            <div className="space-y-2">
              <Label htmlFor="contingency">Contingency (%)</Label>
              <Input 
                id="contingency" 
                placeholder="0" 
                type="number"
                max="100"
                value={developmentCosts.contingencyPercentage}
                onChange={(e) => developmentCosts.setContingencyPercentage(e.target.value)}
              />
            </div>
          </div>
          
          <div className="mt-8 flex justify-between items-center pt-6 border-t border-t-2">
            <span className="text-lg font-semibold">Total Hard Costs</span>
            <span className="text-lg font-bold">
              {formatCurrency(developmentCosts.calculateTotalHardCosts())}
            </span>
          </div>
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
              <Input 
                id="architecture" 
                placeholder="0" 
                type="number"
                value={developmentCosts.architectureCost}
                onChange={(e) => developmentCosts.setArchitectureCost(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="permit-fees">Permit Fees ($)</Label>
              <Input 
                id="permit-fees" 
                placeholder="0" 
                type="number"
                value={developmentCosts.permitFees}
                onChange={(e) => developmentCosts.setPermitFees(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="legal-fees">Legal & Accounting ($)</Label>
              <Input 
                id="legal-fees" 
                placeholder="0" 
                type="number"
                value={developmentCosts.legalFees}
                onChange={(e) => developmentCosts.setLegalFees(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="marketing">Marketing & Leasing ($)</Label>
              <Input 
                id="marketing" 
                placeholder="0" 
                type="number"
                value={developmentCosts.marketingCost}
                onChange={(e) => developmentCosts.setMarketingCost(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="developer-fee">Developer Fee ($)</Label>
              <Input 
                id="developer-fee" 
                placeholder="0" 
                type="number"
                value={developmentCosts.developerFee}
                onChange={(e) => developmentCosts.setDeveloperFee(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="property-taxes">Property Taxes During Construction ($)</Label>
              <Input 
                id="property-taxes" 
                placeholder="0" 
                type="number"
                value={developmentCosts.constructionPropertyTaxes}
                onChange={(e) => developmentCosts.setConstructionPropertyTaxes(e.target.value)}
              />
            </div>
          </div>
          
          {renderCustomCostFields(softCustomCosts, "soft")}
          
          <Button 
            variant="outline" 
            onClick={() => developmentCosts.addCustomCost("soft")} 
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
              <Input 
                id="financing-fees" 
                placeholder="0" 
                type="number"
                value={developmentCosts.financingFees}
                onChange={(e) => developmentCosts.setFinancingFees(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interest-reserve">Interest Reserve</Label>
              <Input 
                id="interest-reserve" 
                placeholder="0" 
                type="number"
                value={developmentCosts.interestReserve}
                onChange={(e) => developmentCosts.setInterestReserve(e.target.value)}
              />
            </div>
          </div>
          
          {renderCustomCostFields(otherCustomCosts, "other")}
          
          <Button 
            variant="outline" 
            onClick={() => developmentCosts.addCustomCost("other")} 
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
