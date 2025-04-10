
import React, { useState } from 'react';
import { BuildingComponent, BuildingComponentFormData, componentTypes } from '@/hooks/useBuildingComponents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PlusCircle, Edit, Trash2, Building2 } from "lucide-react";
import { Floor } from '@/hooks/usePropertyState';

interface BuildingComponentsProps {
  components: BuildingComponent[];
  floors: Floor[];
  onAddComponent: (data: BuildingComponentFormData) => Promise<BuildingComponent | null>;
  onUpdateComponent: (id: string, data: Partial<BuildingComponentFormData>) => Promise<boolean>;
  onDeleteComponent: (id: string) => Promise<boolean>;
}

const BuildingComponents: React.FC<BuildingComponentsProps> = ({
  components,
  floors,
  onAddComponent,
  onUpdateComponent,
  onDeleteComponent
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<BuildingComponent | null>(null);
  const [formData, setFormData] = useState<BuildingComponentFormData>({
    name: '',
    componentType: 'Core',
    isPercentage: true,
    percentage: 0,
    squareFootage: 0,
    floorId: null
  });

  const resetForm = () => {
    setFormData({
      name: '',
      componentType: 'Core',
      isPercentage: true,
      percentage: 0,
      squareFootage: 0,
      floorId: null
    });
  };

  const handleOpenEditDialog = (component: BuildingComponent) => {
    setEditingComponent(component);
    setFormData({
      name: component.name,
      componentType: component.componentType,
      isPercentage: component.isPercentage,
      percentage: component.percentage,
      squareFootage: component.squareFootage,
      floorId: component.floorId
    });
    setIsEditDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = value === '' ? 0 : parseFloat(value);
    setFormData(prev => ({
      ...prev,
      [name]: numericValue
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value === 'null' ? null : value
    }));
  };

  const handleRadioChange = (value: string) => {
    const isPercentage = value === 'percentage';
    setFormData(prev => ({
      ...prev,
      isPercentage
    }));
  };

  const handleAddSubmit = async () => {
    const result = await onAddComponent(formData);
    if (result) {
      resetForm();
      setIsAddDialogOpen(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!editingComponent) return;
    
    const result = await onUpdateComponent(editingComponent.id, formData);
    if (result) {
      setIsEditDialogOpen(false);
      setEditingComponent(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this building component?')) {
      await onDeleteComponent(id);
    }
  };

  const getFloorLabel = (floorId: string | null): string => {
    if (floorId === null) return 'All Floors';
    const floor = floors.find(f => f.id === floorId);
    return floor ? floor.label : 'Unknown Floor';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-blue-700">Building Components</h3>
          <p className="text-sm text-gray-500">Define non-rentable spaces to ensure complete building allocation</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => {
              resetForm();
              setIsAddDialogOpen(true);
            }}>
              <PlusCircle className="h-4 w-4 mr-1" />
              Add Component
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Building Component</DialogTitle>
              <DialogDescription>
                Add a new non-rentable space component to your building.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="e.g., Core/Circulation, Mechanical"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="componentType" className="text-right">
                  Type
                </Label>
                <Select 
                  value={formData.componentType} 
                  onValueChange={(value) => handleSelectChange('componentType', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select component type" />
                  </SelectTrigger>
                  <SelectContent>
                    {componentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  Allocation
                </Label>
                <RadioGroup 
                  className="col-span-3"
                  value={formData.isPercentage ? 'percentage' : 'fixed'}
                  onValueChange={handleRadioChange}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="percentage" id="percentage" />
                    <Label htmlFor="percentage">Percentage of Floor</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixed" id="fixed" />
                    <Label htmlFor="fixed">Fixed Square Footage</Label>
                  </div>
                </RadioGroup>
              </div>
              {formData.isPercentage ? (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="percentage" className="text-right">
                    Percentage
                  </Label>
                  <div className="col-span-3 relative">
                    <Input
                      id="percentage"
                      name="percentage"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.percentage || ''}
                      onChange={handleNumberInputChange}
                      className="pr-8"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500">%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="squareFootage" className="text-right">
                    Square Feet
                  </Label>
                  <Input
                    id="squareFootage"
                    name="squareFootage"
                    type="number"
                    min="0"
                    value={formData.squareFootage || ''}
                    onChange={handleNumberInputChange}
                    className="col-span-3"
                  />
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="floorId" className="text-right">
                  Apply To
                </Label>
                <Select 
                  value={formData.floorId !== null ? formData.floorId : 'null'} 
                  onValueChange={(value) => handleSelectChange('floorId', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select floor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">All Floors</SelectItem>
                    {floors.map((floor) => (
                      <SelectItem key={floor.id} value={floor.id}>
                        {floor.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button type="submit" onClick={handleAddSubmit}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {components.map((component) => (
          <Card key={component.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">{component.name}</CardTitle>
                  <CardDescription>{component.componentType}</CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(component)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(component.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Allocation:</span>
                  <span>{component.isPercentage ? `${component.percentage}%` : `${component.squareFootage.toLocaleString()} sf`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Applied to:</span>
                  <span>{getFloorLabel(component.floorId)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {components.length === 0 && (
          <Card className="col-span-full border-dashed border-2 border-gray-200 bg-gray-50">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Building2 className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500 text-center mb-2">No building components defined yet</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsAddDialogOpen(true)}
                className="mt-2"
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add Component
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Building Component</DialogTitle>
            <DialogDescription>
              Update the building component details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-componentType" className="text-right">
                Type
              </Label>
              <Select 
                value={formData.componentType} 
                onValueChange={(value) => handleSelectChange('componentType', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select component type" />
                </SelectTrigger>
                <SelectContent>
                  {componentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Allocation
              </Label>
              <RadioGroup 
                className="col-span-3"
                value={formData.isPercentage ? 'percentage' : 'fixed'}
                onValueChange={handleRadioChange}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="percentage" id="edit-percentage" />
                  <Label htmlFor="edit-percentage">Percentage of Floor</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fixed" id="edit-fixed" />
                  <Label htmlFor="edit-fixed">Fixed Square Footage</Label>
                </div>
              </RadioGroup>
            </div>
            {formData.isPercentage ? (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-percentage-value" className="text-right">
                  Percentage
                </Label>
                <div className="col-span-3 relative">
                  <Input
                    id="edit-percentage-value"
                    name="percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.percentage || ''}
                    onChange={handleNumberInputChange}
                    className="pr-8"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500">%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-squareFootage" className="text-right">
                  Square Feet
                </Label>
                <Input
                  id="edit-squareFootage"
                  name="squareFootage"
                  type="number"
                  min="0"
                  value={formData.squareFootage || ''}
                  onChange={handleNumberInputChange}
                  className="col-span-3"
                />
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-floorId" className="text-right">
                Apply To
              </Label>
              <Select 
                value={formData.floorId !== null ? formData.floorId : 'null'} 
                onValueChange={(value) => handleSelectChange('floorId', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select floor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">All Floors</SelectItem>
                  {floors.map((floor) => (
                    <SelectItem key={floor.id} value={floor.id}>
                      {floor.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button type="submit" onClick={handleEditSubmit}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BuildingComponents;
