import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save, X, Plus, Trash2, ChevronsUpDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

import {
  FloorPlateTemplate,
  FloorConfiguration,
  SpaceDefinition,
  BuildingSystemsConfig,
} from "@/types/propertyTypes";

interface FloorEditorProps {
  floorNumber: number;
  floorConfiguration: FloorConfiguration;
  floorTemplates: FloorPlateTemplate[];
  updateFloorConfiguration: (
    floorNumber: number,
    field: keyof FloorConfiguration,
    value: any
  ) => void;
  updateFloorSpaces?: (floorNumber: number, spaces: SpaceDefinition[]) => void;
  updateBuildingSystems?: (floorNumber: number, systems: BuildingSystemsConfig) => void;
}

const DEFAULT_SPACES: SpaceDefinition[] = [
  {
    id: "space-1",
    name: "Main Office Area",
    type: "office",
    subType: null,
    squareFootage: "7500",
    dimensions: {
      width: "75",
      depth: "100",
    },
    isRentable: true,
    percentage: 75,
  },
  {
    id: "space-2",
    name: "Core & Circulation",
    type: "core",
    subType: null,
    squareFootage: "1500",
    dimensions: {
      width: "30",
      depth: "50",
    },
    isRentable: false,
    percentage: 15,
  },
];

const USE_TYPE_OPTIONS: Record<string, string[]> = {
  office: ["executive", "open", "conference", "reception"],
  residential: ["studio", "one_bedroom", "two_bedroom", "three_bedroom", "amenity"],
  retail: ["sales_floor", "stockroom", "service", "food_service"],
  industrial: ["production", "warehouse", "shipping", "lab"],
  common: ["corridor", "lobby", "restroom", "mechanical"],
  core: ["elevator", "stair", "shaft", "electrical", "plumbing"],
};

const FloorEditor = ({
  floorNumber,
  floorConfiguration,
  floorTemplates,
  updateFloorConfiguration,
  updateFloorSpaces
}: FloorEditorProps) => {
  const [activeTab, setActiveTab] = useState("basic");
  
  const convertSpaces = (spaces: SpaceDefinition[] | undefined): SpaceDefinition[] => {
    if (!spaces || spaces.length === 0) return DEFAULT_SPACES;
    
    const hasLegacyFormat = spaces.some(space => 'isCore' in space);
    
    if (hasLegacyFormat) {
      return spaces.map(space => {
        const isRentable = !('isCore' in space && (space as any).isCore);
        return {
          ...space,
          isRentable,
        };
      });
    }
    
    return spaces;
  };
  
  const [currentSpaces, setCurrentSpaces] = useState<SpaceDefinition[]>(
    convertSpaces(floorConfiguration.spaces)
  );

  useEffect(() => {
    setCurrentSpaces(convertSpaces(floorConfiguration.spaces));
    setActiveTab("basic");
  }, [floorConfiguration]);

  useEffect(() => {
    return () => {
      console.log("FloorEditor component cleanup");
    };
  }, []);

  const getGrossArea = () => {
    if (floorConfiguration.customSquareFootage) {
      return parseFloat(floorConfiguration.customSquareFootage) || 0;
    }

    if (floorConfiguration.templateId) {
      const template = floorTemplates.find((t) => t.id === floorConfiguration.templateId);
      if (template) {
        return parseFloat(template.squareFootage) || 0;
      }
    }

    return 0;
  };

  const grossArea = getGrossArea();
  const efficiencyFactor = parseFloat(floorConfiguration.efficiencyFactor) || 0;
  const netArea = grossArea * (efficiencyFactor / 100);

  const calculateSpaceAllocation = () => {
    const totalSpaceArea = currentSpaces.reduce((sum, space) => {
      return sum + (parseFloat(space.squareFootage) || 0);
    }, 0);

    const totalPercentage = totalSpaceArea > 0 ? (totalSpaceArea / grossArea) * 100 : 0;
    
    const rentableArea = currentSpaces
      .filter(space => space.isRentable)
      .reduce((sum, space) => sum + (parseFloat(space.squareFootage) || 0), 0);
    
    const nonRentableArea = totalSpaceArea - rentableArea;
    const rentablePercentage = totalSpaceArea > 0 ? (rentableArea / totalSpaceArea) * 100 : 0;
    
    const circulationArea = currentSpaces
      .filter(space => space.type === "core" && space.subType === "corridor")
      .reduce((sum, space) => sum + (parseFloat(space.squareFootage) || 0), 0);

    return {
      totalSpaceArea,
      totalPercentage: Math.min(totalPercentage, 100),
      rentableArea,
      nonRentableArea,
      rentablePercentage,
      circulationArea,
      unallocatedArea: Math.max(0, grossArea - totalSpaceArea)
    };
  };

  const spaceAllocation = calculateSpaceAllocation();

  const handleAddSpace = () => {
    const newSpace: SpaceDefinition = {
      id: `space-${currentSpaces.length + 1}-${Date.now()}`,
      name: `Space ${currentSpaces.length + 1}`,
      type: "office",
      subType: null,
      squareFootage: "0",
      dimensions: {
        width: "0",
        depth: "0",
      },
      isRentable: true,
      percentage: 0,
    };
    
    setCurrentSpaces([...currentSpaces, newSpace]);
  };

  const handleRemoveSpace = (spaceId: string) => {
    setCurrentSpaces(currentSpaces.filter((space) => space.id !== spaceId));
  };

  const handleUpdateSpace = (spaceId: string, field: keyof SpaceDefinition | string, value: any) => {
    setCurrentSpaces(
      currentSpaces.map((space) => {
        if (space.id === spaceId) {
          if (field === "dimensions.width" || field === "dimensions.depth") {
            const [parent, child] = field.split(".");
            const updatedSpace = {
              ...space,
              dimensions: {
                ...space.dimensions,
                [child]: value
              }
            };
            
            const width = parseFloat(updatedSpace.dimensions.width) || 0;
            const depth = parseFloat(updatedSpace.dimensions.depth) || 0;
            
            if (width > 0 && depth > 0) {
              updatedSpace.squareFootage = (width * depth).toString();
            }
            
            return updatedSpace;
          }
          
          if (field === "type" && space.type !== value) {
            return { ...space, [field]: value, subType: null };
          }
          
          return { ...space, [field]: value };
        }
        return space;
      })
    );
  };

  const calculateDimensions = (spaceId: string) => {
    const space = currentSpaces.find((s) => s.id === spaceId);
    if (!space) return;

    const area = parseFloat(space.squareFootage) || 0;
    if (area > 0) {
      const dimension = Math.sqrt(area);
      handleUpdateSpace(spaceId, "dimensions.width", dimension.toFixed(2));
      handleUpdateSpace(spaceId, "dimensions.depth", dimension.toFixed(2));
    }
  };

  const calculateArea = (spaceId: string) => {
    const space = currentSpaces.find((s) => s.id === spaceId);
    if (!space) return;

    const width = parseFloat(space.dimensions.width) || 0;
    const depth = parseFloat(space.dimensions.depth) || 0;
    const area = width * depth;
    
    if (area > 0) {
      handleUpdateSpace(spaceId, "squareFootage", area.toString());
    }
  };

  const validateDimensionsAndArea = (spaceId: string) => {
    const space = currentSpaces.find((s) => s.id === spaceId);
    if (!space) return;
    
    const width = parseFloat(space.dimensions.width) || 0;
    const depth = parseFloat(space.dimensions.depth) || 0;
    const calculatedArea = width * depth;
    const enteredArea = parseFloat(space.squareFootage) || 0;
    
    if (width > 0 && depth > 0 && Math.abs(calculatedArea - enteredArea) > 1) {
      handleUpdateSpace(spaceId, "squareFootage", calculatedArea.toString());
    }
  };
  
  const getSpaceSubtypeOptions = (spaceType: string) => {
    return USE_TYPE_OPTIONS[spaceType] || [];
  };

  const handleSave = () => {
    const sanitizedSpaces = currentSpaces.map(space => ({
      ...space,
      squareFootage: space.squareFootage || "0",
      dimensions: {
        width: space.dimensions.width || "0",
        depth: space.dimensions.depth || "0"
      }
    }));

    if (updateFloorSpaces) {
      updateFloorSpaces(floorNumber, sanitizedSpaces);
    } else {
      updateFloorConfiguration(floorNumber, "spaces", sanitizedSpaces);
    }

    updateFloorConfiguration(
      floorNumber,
      "corePercentage",
      (100 - spaceAllocation.rentablePercentage).toFixed(1)
    );

    if (floorConfiguration.primaryUse) {
      updateFloorConfiguration(
        floorNumber,
        "primaryUse",
        floorConfiguration.primaryUse
      );
    }
    
    if (floorConfiguration.secondaryUse) {
      updateFloorConfiguration(
        floorNumber,
        "secondaryUse",
        floorConfiguration.secondaryUse
      );
      updateFloorConfiguration(
        floorNumber,
        "secondaryUsePercentage",
        floorConfiguration.secondaryUsePercentage
      );
    }
    
    if (window.localStorage) {
      console.log("Saving floor configuration to localStorage...");
      const event = new Event('floorConfigSaved');
      window.dispatchEvent(event);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          Floor {floorNumber < 0 ? `B${Math.abs(floorNumber)}` : floorNumber} Configuration
        </DialogTitle>
      </DialogHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="basic">Basic Configuration</TabsTrigger>
          <TabsTrigger value="spaces">Space Planning</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Floor Template</Label>
              <Select
                value={floorConfiguration.templateId || "null"}
                onValueChange={(value) => {
                  updateFloorConfiguration(
                    floorNumber,
                    "templateId",
                    value === "null" ? null : value
                  );
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">Custom (No Template)</SelectItem>
                  {floorTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-sqft">Custom Square Footage</Label>
              <Input
                id="custom-sqft"
                type="number"
                placeholder="0"
                value={floorConfiguration.customSquareFootage}
                onChange={(e) => {
                  updateFloorConfiguration(
                    floorNumber,
                    "customSquareFootage",
                    e.target.value
                  );
                }}
              />
              <p className="text-xs text-gray-500">
                {floorConfiguration.templateId
                  ? "Overrides template value if set"
                  : "Required when no template is selected"}
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="floor-height">Floor-to-Floor Height (ft)</Label>
              <Input
                id="floor-height"
                type="number"
                placeholder="12"
                value={floorConfiguration.floorToFloorHeight}
                onChange={(e) => {
                  updateFloorConfiguration(
                    floorNumber,
                    "floorToFloorHeight",
                    e.target.value
                  );
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="efficiency">Efficiency Factor (%)</Label>
              <Input
                id="efficiency"
                type="number"
                placeholder="85"
                value={floorConfiguration.efficiencyFactor}
                onChange={(e) => {
                  updateFloorConfiguration(
                    floorNumber,
                    "efficiencyFactor",
                    e.target.value
                  );
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="core-pct">Core & Circulation (%)</Label>
              <Input
                id="core-pct"
                type="number"
                placeholder="15"
                value={floorConfiguration.corePercentage}
                onChange={(e) => {
                  updateFloorConfiguration(
                    floorNumber,
                    "corePercentage",
                    e.target.value
                  );
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="md:col-span-2 space-y-2">
              <Label>Primary Use</Label>
              <Select
                value={floorConfiguration.primaryUse}
                onValueChange={(value) => {
                  updateFloorConfiguration(floorNumber, "primaryUse", value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select primary use" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="parking">Parking</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="amenities">Amenities</SelectItem>
                  <SelectItem value="storage">Storage</SelectItem>
                  <SelectItem value="mechanical">Mechanical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label>Secondary Use</Label>
              <Select
                value={floorConfiguration.secondaryUse || "null"}
                onValueChange={(value) => {
                  updateFloorConfiguration(
                    floorNumber,
                    "secondaryUse",
                    value === "null" ? null : value
                  );
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select secondary use" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">None</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="parking">Parking</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="amenities">Amenities</SelectItem>
                  <SelectItem value="storage">Storage</SelectItem>
                  <SelectItem value="mechanical">Mechanical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary-pct">Secondary (% of floor)</Label>
              <Input
                id="secondary-pct"
                type="number"
                placeholder="0"
                value={floorConfiguration.secondaryUsePercentage}
                disabled={!floorConfiguration.secondaryUse}
                onChange={(e) => {
                  updateFloorConfiguration(
                    floorNumber,
                    "secondaryUsePercentage",
                    e.target.value
                  );
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 bg-gray-50 p-4 rounded-md">
            <div>
              <span className="text-sm text-gray-500">Gross Area</span>
              <p className="text-lg font-medium">{grossArea.toLocaleString()} sq ft</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Net Usable Area</span>
              <p className="text-lg font-medium">{netArea.toLocaleString()} sq ft</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Floor Height</span>
              <p className="text-lg font-medium">{floorConfiguration.floorToFloorHeight} ft</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="spaces" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-medium">Space Planning</h3>
              <p className="text-sm text-gray-500">Define spaces and layouts for this floor</p>
            </div>
            <Button onClick={handleAddSpace}>
              <Plus className="h-4 w-4 mr-2" /> Add Space
            </Button>
          </div>

          <div className="space-y-4">
            <Card className="p-4 bg-muted/30">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Floor Gross Area:</span>
                    <span>{grossArea.toLocaleString()} sq ft</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-sm font-medium">Space Allocation:</span>
                    <span>{spaceAllocation.totalSpaceArea.toLocaleString()} sq ft ({spaceAllocation.totalPercentage.toFixed(1)}%)</span>
                  </div>
                  {spaceAllocation.unallocatedArea > 0 && (
                    <div className="flex justify-between mt-1 text-amber-600">
                      <span className="text-sm font-medium">Unallocated Area:</span>
                      <span>{spaceAllocation.unallocatedArea.toLocaleString()} sq ft</span>
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Rentable Space:</span>
                    <span>{spaceAllocation.rentableArea.toLocaleString()} sq ft ({(spaceAllocation.rentablePercentage).toFixed(1)}%)</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-sm font-medium">Non-Rentable Space:</span>
                    <span>{spaceAllocation.nonRentableArea.toLocaleString()} sq ft</span>
                  </div>
                  {spaceAllocation.circulationArea > 0 && (
                    <div className="flex justify-between mt-1">
                      <span className="text-sm font-medium">Circulation Space:</span>
                      <span>{spaceAllocation.circulationArea.toLocaleString()} sq ft</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{ width: `${spaceAllocation.totalPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>0%</span>
                  <span>{spaceAllocation.totalPercentage.toFixed(1)}% Allocated</span>
                  <span>100%</span>
                </div>
              </div>
            </Card>

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Space Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Subtype</TableHead>
                    <TableHead className="text-right">Dimensions</TableHead>
                    <TableHead className="text-right">Square Footage</TableHead>
                    <TableHead className="text-center">Rentable</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentSpaces.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                        No spaces defined yet. Add a space to begin.
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentSpaces.map((space) => (
                      <TableRow key={space.id}>
                        <TableCell>
                          <Input 
                            value={space.name} 
                            onChange={(e) => handleUpdateSpace(space.id, "name", e.target.value)}
                            className="text-left"
                          />
                        </TableCell>
                        <TableCell>
                          <Select 
                            key={`type-${space.id}`}
                            value={space.type}
                            onValueChange={(value) => {
                              handleUpdateSpace(space.id, "type", value);
                            }}
                          >
                            <SelectTrigger className="h-9 w-full min-w-[140px] text-left">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="bg-white z-50">
                              <SelectItem value="office">Office</SelectItem>
                              <SelectItem value="residential">Residential</SelectItem>
                              <SelectItem value="retail">Retail</SelectItem>
                              <SelectItem value="core">Core & Circulation</SelectItem>
                              <SelectItem value="amenities">Amenities</SelectItem>
                              <SelectItem value="mechanical">Mechanical</SelectItem>
                              <SelectItem value="industrial">Industrial</SelectItem>
                              <SelectItem value="common">Common Areas</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select 
                            key={`subtype-${space.id}-${space.type}`}
                            value={space.subType || "null"}
                            onValueChange={(value) => handleUpdateSpace(space.id, "subType", value === "null" ? null : value)}
                          >
                            <SelectTrigger className="h-9 w-full min-w-[160px] text-left">
                              <SelectValue placeholder="Select subtype" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="bg-white z-50">
                              <SelectItem value="null">None</SelectItem>
                              {space.type && USE_TYPE_OPTIONS[space.type] ? (
                                USE_TYPE_OPTIONS[space.type].map(subType => (
                                  <SelectItem key={subType} value={subType}>
                                    {subType.replace(/_/g, ' ')}
                                  </SelectItem>
                                ))
                              ) : null}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-1">
                            <Input 
                              className="text-right max-w-16"
                              value={space.dimensions.width} 
                              onChange={(e) => handleUpdateSpace(space.id, "dimensions.width", e.target.value)}
                              onBlur={() => calculateArea(space.id)}
                              placeholder="W"
                            />
                            <span className="text-xs">×</span>
                            <Input 
                              className="text-right max-w-16"
                              value={space.dimensions.depth} 
                              onChange={(e) => handleUpdateSpace(space.id, "dimensions.depth", e.target.value)}
                              onBlur={() => calculateArea(space.id)}
                              placeholder="L"
                            />
                            <span className="text-xs whitespace-nowrap">ft</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2">
                            <Input 
                              className="text-right"
                              value={space.squareFootage} 
                              onChange={(e) => handleUpdateSpace(space.id, "squareFootage", e.target.value)}
                              onBlur={() => {
                                const width = parseFloat(space.dimensions.width) || 0;
                                const depth = parseFloat(space.dimensions.depth) || 0;
                                if (width === 0 || depth === 0) {
                                  calculateDimensions(space.id);
                                } else {
                                  validateDimensionsAndArea(space.id);
                                }
                              }}
                            />
                            <span className="text-xs whitespace-nowrap">sq ft</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <Checkbox
                              checked={space.isRentable}
                              onCheckedChange={(checked) => 
                                handleUpdateSpace(space.id, "isRentable", checked === true)
                              }
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleRemoveSpace(space.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="bg-muted/30 p-4 rounded-md">
              <h4 className="text-sm font-medium mb-2">Space Allocation by Type</h4>
              <div className="space-y-2">
                {Object.entries(
                  currentSpaces.reduce((acc, space) => {
                    const type = space.type;
                    if (!acc[type]) acc[type] = 0;
                    acc[type] += parseFloat(space.squareFootage) || 0;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([type, area]) => {
                  const percentage = grossArea > 0 ? (area / grossArea) * 100 : 0;
                  const rentableInType = currentSpaces
                    .filter(space => space.type === type && space.isRentable)
                    .reduce((sum, space) => sum + (parseFloat(space.squareFootage) || 0), 0);
                  
                  const nonRentableInType = area - rentableInType;
                  const rentablePercentage = area > 0 ? (rentableInType / area) * 100 : 0;
                  
                  return (
                    <div key={type} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{type}</span>
                        <span>{area.toLocaleString()} sf ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full" 
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: getUseColor(type)
                          }}
                        />
                      </div>
                      {area > 0 && (
                        <div className="flex text-xs text-gray-500 justify-between">
                          <span>Rentable: {rentablePercentage.toFixed(0)}%</span>
                          <span>Non-rentable: {(100 - rentablePercentage).toFixed(0)}%</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div>
              <h4 className="text-sm font-medium">Interactive Floor Plan</h4>
              <p className="text-xs text-gray-500">Visual space planning coming soon</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">Basic Mode</Badge>
            </div>
          </div>

          <div className="border border-dashed rounded-lg p-4 flex flex-col items-center justify-center h-64 bg-muted/20">
            <ChevronsUpDown className="h-8 w-8 text-gray-300 mb-2" />
            <p className="text-gray-500">Advanced space planning visualizations will be available in a future update.</p>
            <p className="text-sm text-gray-400 mt-1">Use the table above to configure spaces in the meantime.</p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline">
          <X className="h-4 w-4 mr-2" /> Cancel
        </Button>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" /> Save Changes
        </Button>
      </div>
    </>
  );
};

const getUseColor = (spaceType: string) => {
  const colors: Record<string, string> = {
    "residential": "#3B82F6",
    "office": "#10B981",
    "retail": "#F59E0B",
    "parking": "#6B7280",
    "hotel": "#8B5CF6",
    "amenities": "#EC4899",
    "storage": "#78716C",
    "mechanical": "#475569",
    "core": "#94A3B8",
    "industrial": "#6366F1",
    "common": "#8B5CF6",
  };
  
  return colors[spaceType] || "#9CA3AF";
};

export default FloorEditor;
