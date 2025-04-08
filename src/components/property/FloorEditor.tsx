import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save, X, Plus, Trash2, ChevronsUpDown, Move } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

interface FloorPlateTemplate {
  id: string;
  name: string;
  squareFootage: string;
  floorToFloorHeight: string;
  efficiencyFactor: string;
  corePercentage: string;
}

interface FloorConfiguration {
  floorNumber: number;
  isUnderground: boolean;
  templateId: string | null;
  customSquareFootage: string;
  floorToFloorHeight: string;
  efficiencyFactor: string;
  corePercentage: string;
  primaryUse: string;
  secondaryUse: string | null;
  secondaryUsePercentage: string;
  spaces?: SpaceDefinition[];
  buildingSystems?: BuildingSystemsConfig;
}

interface SpaceDefinition {
  id: string;
  name: string;
  type: string;
  subType: string | null;
  squareFootage: string;
  dimensions: {
    width: string;
    depth: string;
  };
  isRentable: boolean;
}

interface BuildingSystemsConfig {
  elevators: {
    passenger: string;
    service: string;
    freight: string;
  };
  hvacSystem: string;
  hvacZones: string;
  floorLoadCapacity: string;
  ceilingHeight: string;
  plenumHeight: string;
}

interface FloorEditorProps {
  isOpen: boolean;
  onClose: () => void;
  floorConfig: FloorConfiguration;
  floorTemplates: FloorPlateTemplate[];
  updateFloorConfiguration: (
    floorNumber: number,
    field: keyof FloorConfiguration,
    value: any
  ) => void;
  updateSpaces?: (floorNumber: number, spaces: SpaceDefinition[]) => void;
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
  },
];

const DEFAULT_BUILDING_SYSTEMS: BuildingSystemsConfig = {
  elevators: {
    passenger: "2",
    service: "1",
    freight: "0",
  },
  hvacSystem: "VAV",
  hvacZones: "4",
  floorLoadCapacity: "100",
  ceilingHeight: "9",
  plenumHeight: "3",
};

const USE_TYPE_OPTIONS: Record<string, string[]> = {
  office: ["executive", "open", "conference", "reception"],
  residential: ["studio", "one_bedroom", "two_bedroom", "three_bedroom", "amenity"],
  retail: ["sales_floor", "stockroom", "service", "food_service"],
  industrial: ["production", "warehouse", "shipping", "lab"],
  common: ["corridor", "lobby", "restroom", "mechanical"],
  core: ["elevator", "stair", "shaft", "electrical", "plumbing"],
};

const FloorEditor = ({
  isOpen,
  onClose,
  floorConfig,
  floorTemplates,
  updateFloorConfiguration,
  updateSpaces,
  updateBuildingSystems,
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
    convertSpaces(floorConfig.spaces)
  );
  
  const [currentSystems, setCurrentSystems] = useState<BuildingSystemsConfig>(
    floorConfig.buildingSystems || DEFAULT_BUILDING_SYSTEMS
  );

  const getGrossArea = () => {
    if (floorConfig.customSquareFootage) {
      return parseFloat(floorConfig.customSquareFootage) || 0;
    }

    if (floorConfig.templateId) {
      const template = floorTemplates.find((t) => t.id === floorConfig.templateId);
      if (template) {
        return parseFloat(template.squareFootage) || 0;
      }
    }

    return 0;
  };

  const grossArea = getGrossArea();
  const efficiencyFactor = parseFloat(floorConfig.efficiencyFactor) || 0;
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
          return { ...space, [field]: value };
        }
        return space;
      })
    );
  };

  const handleUpdateBuildingSystems = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setCurrentSystems({
        ...currentSystems,
        [parent]: {
          ...currentSystems[parent as keyof BuildingSystemsConfig] as Record<string, string>,
          [child]: value
        }
      });
    } else {
      setCurrentSystems({
        ...currentSystems,
        [field]: value
      });
    }
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

  const handleSave = () => {
    if (updateSpaces) {
      updateSpaces(floorConfig.floorNumber, currentSpaces);
    } else {
      updateFloorConfiguration(floorConfig.floorNumber, "spaces", currentSpaces);
    }

    if (updateBuildingSystems) {
      updateBuildingSystems(floorConfig.floorNumber, currentSystems);
    } else {
      updateFloorConfiguration(floorConfig.floorNumber, "buildingSystems", currentSystems);
    }

    updateFloorConfiguration(
      floorConfig.floorNumber,
      "corePercentage",
      (100 - spaceAllocation.rentablePercentage).toFixed(1)
    );

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Floor {floorConfig.floorNumber < 0 ? `B${Math.abs(floorConfig.floorNumber)}` : floorConfig.floorNumber} Configuration
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="basic">Basic Configuration</TabsTrigger>
            <TabsTrigger value="spaces">Space Planning</TabsTrigger>
            <TabsTrigger value="systems">Building Systems</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Floor Template</Label>
                <Select
                  value={floorConfig.templateId || "null"}
                  onValueChange={(value) => {
                    updateFloorConfiguration(
                      floorConfig.floorNumber,
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
                  value={floorConfig.customSquareFootage}
                  onChange={(e) => {
                    updateFloorConfiguration(
                      floorConfig.floorNumber,
                      "customSquareFootage",
                      e.target.value
                    );
                  }}
                />
                <p className="text-xs text-gray-500">
                  {floorConfig.templateId
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
                  value={floorConfig.floorToFloorHeight}
                  onChange={(e) => {
                    updateFloorConfiguration(
                      floorConfig.floorNumber,
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
                  value={floorConfig.efficiencyFactor}
                  onChange={(e) => {
                    updateFloorConfiguration(
                      floorConfig.floorNumber,
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
                  value={floorConfig.corePercentage}
                  onChange={(e) => {
                    updateFloorConfiguration(
                      floorConfig.floorNumber,
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
                  value={floorConfig.primaryUse}
                  onValueChange={(value) => {
                    updateFloorConfiguration(floorConfig.floorNumber, "primaryUse", value);
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
                  value={floorConfig.secondaryUse || "null"}
                  onValueChange={(value) => {
                    updateFloorConfiguration(
                      floorConfig.floorNumber,
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
                  value={floorConfig.secondaryUsePercentage}
                  disabled={!floorConfig.secondaryUse}
                  onChange={(e) => {
                    updateFloorConfiguration(
                      floorConfig.floorNumber,
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
                <p className="text-lg font-medium">{floorConfig.floorToFloorHeight} ft</p>
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
                              value={space.type}
                              onValueChange={(value) => {
                                handleUpdateSpace(space.id, "type", value);
                                handleUpdateSpace(space.id, "subType", null);
                              }}
                            >
                              <SelectTrigger className="h-9 text-left">
                                <SelectValue placeholder="Type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="office">Office</SelectItem>
                                <SelectItem value="residential">Residential</SelectItem>
                                <SelectItem value="retail">Retail</SelectItem>
                                <SelectItem value="core">Core & Circulation</SelectItem>
                                <SelectItem value="amenities">Amenities</SelectItem>
                                <SelectItem value="mechanical">Mechanical</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select 
                              value={space.subType || "null"}
                              onValueChange={(value) => handleUpdateSpace(space.id, "subType", value === "null" ? null : value)}
                            >
                              <SelectTrigger className="h-9 text-left">
                                <SelectValue placeholder="Select subtype" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="null">None</SelectItem>
                                {space.type && USE_TYPE_OPTIONS[space.type] ? (
                                  USE_TYPE_OPTIONS[space.type].map(subType => (
                                    <SelectItem key={subType} value={subType}>
                                      {subType.replace('_', ' ')}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="null">No subtypes available</SelectItem>
                                )}
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

          <TabsContent value="systems" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-medium">Building Systems</h3>
                <p className="text-sm text-gray-500">Configure systems and infrastructure for this floor</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Vertical Transportation</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="passenger-elevators">Passenger Elevators</Label>
                    <Input
                      id="passenger-elevators"
                      type="number"
                      value={currentSystems.elevators.passenger}
                      onChange={(e) => handleUpdateBuildingSystems("elevators.passenger", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service-elevators">Service Elevators</Label>
                    <Input
                      id="service-elevators"
                      type="number"
                      value={currentSystems.elevators.service}
                      onChange={(e) => handleUpdateBuildingSystems("elevators.service", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="freight-elevators">Freight Elevators</Label>
                    <Input
                      id="freight-elevators"
                      type="number"
                      value={currentSystems.elevators.freight}
                      onChange={(e) => handleUpdateBuildingSystems("elevators.freight", e.target.value)}
                    />
                  </div>
                </div>
  
                <Separator className="my-4" />
  
                <h4 className="font-medium">HVAC Systems</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hvac-system">System Type</Label>
                    <Select
                      value={currentSystems.hvacSystem}
                      onValueChange={(value) => handleUpdateBuildingSystems("hvacSystem", value)}
                    >
                      <SelectTrigger id="hvac-system">
                        <SelectValue placeholder="Select HVAC type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VAV">VAV (Variable Air Volume)</SelectItem>
                        <SelectItem value="VRF">VRF (Variable Refrigerant Flow)</SelectItem>
                        <SelectItem value="FCU">FCU (Fan Coil Units)</SelectItem>
                        <SelectItem value="Chilled_Beam">Chilled Beam</SelectItem>
                        <SelectItem value="Radiant">Radiant Heating/Cooling</SelectItem>
                        <SelectItem value="Heat_Pump">Heat Pump</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hvac-zones">Number of Zones</Label>
                    <Input
                      id="hvac-zones"
                      type="number"
                      value={currentSystems.hvacZones}
                      onChange={(e) => handleUpdateBuildingSystems("hvacZones", e.target.value)}
                    />
                  </div>
                </div>
              </div>
  
              <div className="space-y-4">
                <h4 className="font-medium">Structure & Load</h4>
                <div className="space-y-2">
                  <Label htmlFor="floor-load">Floor Load Capacity (lbs/sq ft)</Label>
                  <Input
                    id="floor-load"
                    type="number"
                    value={currentSystems.floorLoadCapacity}
                    onChange={(e) => handleUpdateBuildingSystems("floorLoadCapacity", e.target.value)}
                  />
                </div>
  
                <Separator className="my-4" />
  
                <h4 className="font-medium">Ceiling Heights</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ceiling-height">Finished Ceiling Height (ft)</Label>
                    <Input
                      id="ceiling-height"
                      type="number"
                      value={currentSystems.ceilingHeight}
                      onChange={(e) => handleUpdateBuildingSystems("ceilingHeight", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plenum-height">Plenum Space (ft)</Label>
                    <Input
                      id="plenum-height"
                      type="number"
                      value={currentSystems.plenumHeight}
                      onChange={(e) => handleUpdateBuildingSystems("plenumHeight", e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      Floor-to-Floor: {parseFloat(floorConfig.floorToFloorHeight) || 0} ft
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" /> Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" /> Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
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
  };
  
  return colors[spaceType] || "#9CA3AF";
};

export default FloorEditor;
