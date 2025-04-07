
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";

interface SpaceType {
  id: string;
  type: string;
  squareFootage: string;
  units: string;
  phase: string;
}

interface UnitMix {
  id: string;
  type: string;
  count: string;
  squareFootage: string;
}

const PropertyBreakdown = () => {
  const [spaceTypes, setSpaceTypes] = useState<SpaceType[]>([
    { id: "space-1", type: "", squareFootage: "", units: "", phase: "" }
  ]);

  const [unitMixes, setUnitMixes] = useState<UnitMix[]>([
    { id: "unit-1", type: "Studio", count: "", squareFootage: "" }
  ]);

  const addSpaceType = () => {
    const newId = `space-${spaceTypes.length + 1}`;
    setSpaceTypes([
      ...spaceTypes,
      { id: newId, type: "", squareFootage: "", units: "", phase: "" }
    ]);
  };

  const removeSpaceType = (id: string) => {
    if (spaceTypes.length > 1) {
      setSpaceTypes(spaceTypes.filter(space => space.id !== id));
    }
  };

  const updateSpaceType = (id: string, field: keyof SpaceType, value: string) => {
    setSpaceTypes(
      spaceTypes.map(space => 
        space.id === id ? { ...space, [field]: value } : space
      )
    );
  };

  const addUnitMix = () => {
    const newId = `unit-${unitMixes.length + 1}`;
    setUnitMixes([
      ...unitMixes,
      { id: newId, type: "", count: "", squareFootage: "" }
    ]);
  };

  const removeUnitMix = (id: string) => {
    if (unitMixes.length > 1) {
      setUnitMixes(unitMixes.filter(unit => unit.id !== id));
    }
  };

  const updateUnitMix = (id: string, field: keyof UnitMix, value: string) => {
    setUnitMixes(
      unitMixes.map(unit => 
        unit.id === id ? { ...unit, [field]: value } : unit
      )
    );
  };

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
          <CardTitle>Space Types</CardTitle>
          <CardDescription>Define the different space types in your development</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {spaceTypes.map((space, index) => (
              <div 
                key={space.id} 
                className="grid grid-cols-1 md:grid-cols-5 gap-4 pb-6 border-b border-gray-200 last:border-0"
              >
                <div className="space-y-2">
                  <Label htmlFor={`space-type-${space.id}`}>Space Type</Label>
                  <Select 
                    onValueChange={(value) => updateSpaceType(space.id, "type", value)}
                    value={space.type}
                  >
                    <SelectTrigger id={`space-type-${space.id}`}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="parking">Parking</SelectItem>
                      <SelectItem value="hotel">Hotel</SelectItem>
                      <SelectItem value="amenities">Amenities</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`square-footage-${space.id}`}>Square Footage</Label>
                  <Input 
                    id={`square-footage-${space.id}`} 
                    placeholder="0" 
                    type="number" 
                    value={space.squareFootage}
                    onChange={(e) => updateSpaceType(space.id, "squareFootage", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`units-${space.id}`}>Number of Units (optional)</Label>
                  <Input 
                    id={`units-${space.id}`} 
                    placeholder="0" 
                    type="number"
                    value={space.units}
                    onChange={(e) => updateSpaceType(space.id, "units", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`phase-${space.id}`}>Phasing</Label>
                  <Select 
                    onValueChange={(value) => updateSpaceType(space.id, "phase", value)}
                    value={space.phase}
                  >
                    <SelectTrigger id={`phase-${space.id}`}>
                      <SelectValue placeholder="Select phase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phase1">Phase 1</SelectItem>
                      <SelectItem value="phase2">Phase 2</SelectItem>
                      <SelectItem value="phase3">Phase 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end justify-end">
                  {spaceTypes.length > 1 && (
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => removeSpaceType(space.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            <div className="pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={addSpaceType}
                className="flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" /> Add Another Space Type
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Unit Mix</CardTitle>
          <CardDescription>Define the mix of unit types in your residential spaces</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {unitMixes.map((unit, index) => (
              <div 
                key={unit.id} 
                className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-6 border-b border-gray-200 last:border-0"
              >
                <div className="space-y-2">
                  <Label htmlFor={`unit-type-${unit.id}`}>Unit Type</Label>
                  <Select 
                    onValueChange={(value) => updateUnitMix(unit.id, "type", value)}
                    value={unit.type}
                  >
                    <SelectTrigger id={`unit-type-${unit.id}`}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Studio">Studio</SelectItem>
                      <SelectItem value="1-bed">1 Bedroom</SelectItem>
                      <SelectItem value="2-bed">2 Bedroom</SelectItem>
                      <SelectItem value="3-bed">3 Bedroom</SelectItem>
                      <SelectItem value="penthouse">Penthouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`unit-count-${unit.id}`}>Number of Units</Label>
                  <Input 
                    id={`unit-count-${unit.id}`} 
                    placeholder="0" 
                    type="number"
                    value={unit.count}
                    onChange={(e) => updateUnitMix(unit.id, "count", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`unit-sqft-${unit.id}`}>Avg. Square Footage</Label>
                  <Input 
                    id={`unit-sqft-${unit.id}`} 
                    placeholder="0" 
                    type="number"
                    value={unit.squareFootage}
                    onChange={(e) => updateUnitMix(unit.id, "squareFootage", e.target.value)}
                  />
                </div>

                <div className="flex items-end justify-end">
                  {unitMixes.length > 1 && (
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => removeUnitMix(unit.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            <div className="pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={addUnitMix}
                className="flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" /> Add Another Unit Type
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyBreakdown;
