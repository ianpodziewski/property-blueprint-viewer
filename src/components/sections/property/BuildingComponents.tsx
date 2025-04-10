import React, { useState, useEffect } from 'react';
import { BuildingComponent, BuildingComponentFormData } from '@/hooks/useBuildingComponents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PlusCircle, Edit, Trash2, Building2, ChevronRight, ChevronDown } from "lucide-react";
import { Floor } from '@/hooks/usePropertyState';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";

interface BuildingComponentsProps {
  components: BuildingComponent[];
  floors: Floor[];
  onAddComponent: (data: BuildingComponentFormData) => Promise<BuildingComponent | null>;
  onUpdateComponent: (id: string, data: Partial<BuildingComponentFormData>) => Promise<boolean>;
  onDeleteComponent: (id: string) => Promise<boolean>;
}

const ComponentContainer: React.FC<{
  container: BuildingComponent;
  childComponents: BuildingComponent[];
  floors: Floor[];
  onEdit: (component: BuildingComponent) => void;
  onDelete: (id: string) => void;
  onAddSubComponent: (parentId: string) => void;
  onEditSubComponent: (component: BuildingComponent) => void;
  onDeleteSubComponent: (id: string) => void;
}> = ({
  container,
  childComponents,
  floors,
  onEdit,
  onDelete,
  onAddSubComponent,
  onEditSubComponent,
  onDeleteSubComponent
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getFloorLabel = (floorId: string | null): string => {
    if (floorId === null) return 'All Floors';
    const floor = floors.find(f => f.id === floorId);
    return floor ? floor.label : 'Unknown Floor';
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the "${container.name}" container and all its components?`)) {
      onDelete(container.id);
    }
  };

  return (
    <Card className="mb-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <CollapsibleTrigger asChild>
              <div className="flex items-center cursor-pointer">
                {isOpen ? (
                  <ChevronDown className="h-5 w-5 text-gray-500 mr-2" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500 mr-2" />
                )}
                <h3 className="text-lg font-semibold">{container.name}</h3>
              </div>
            </CollapsibleTrigger>
            <div className="flex space-x-1">
              <Button variant="ghost" size="icon" onClick={() => onEdit(container)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        </div>
        
        <CollapsibleContent>
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-500">
                {childComponents.length} {childComponents.length === 1 ? 'component' : 'components'} in this section
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onAddSubComponent(container.id)}
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add Component
              </Button>
            </div>
            
            {childComponents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {childComponents.map(component => (
                  <Card key={component.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{component.name}</CardTitle>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => onEditSubComponent(component)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => onDeleteSubComponent(component.id)}>
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
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed rounded-md bg-gray-50">
                <p className="text-gray-500 mb-4">No components added yet</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onAddSubComponent(container.id)}
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add Component
                </Button>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

const BuildingComponents: React.FC<BuildingComponentsProps> = ({
  components,
  floors,
  onAddComponent,
  onUpdateComponent,
  onDeleteComponent
}) => {
  const [isAddContainerDialogOpen, setIsAddContainerDialogOpen] = useState(false);
  const [isAddComponentDialogOpen, setIsAddComponentDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [editingComponent, setEditingComponent] = useState<BuildingComponent | null>(null);
  const [formData, setFormData] = useState<BuildingComponentFormData>({
    name: '',
    isPercentage: true,
    percentage: 0,
    squareFootage: 0,
    floorId: null,
    parentId: null,
    isContainer: false
  });

  const resetForm = () => {
    setFormData({
      name: '',
      isPercentage: true,
      percentage: 0,
      squareFootage: 0,
      floorId: null,
      parentId: null,
      isContainer: false
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
      floorId: component.floorId,
      parentId: component.parentId,
      isContainer: component.isContainer
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

  const handleAddContainerSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a container name');
      return;
    }
    
    const containerData: BuildingComponentFormData = {
      name: formData.name.trim(),
      isPercentage: false,
      percentage: 0,
      squareFootage: 0,
      floorId: null,
      parentId: null,
      isContainer: true
    };
    
    const result = await onAddComponent(containerData);
    if (result) {
      resetForm();
      setIsAddContainerDialogOpen(false);
    }
  };

  const handleAddComponentSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a component name');
      return;
    }
    
    const componentData: BuildingComponentFormData = {
      ...formData,
      name: formData.name.trim(),
      parentId: selectedParentId
    };
    
    const result = await onAddComponent(componentData);
    if (result) {
      resetForm();
      setIsAddComponentDialogOpen(false);
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

  const handleAddSubComponent = (parentId: string) => {
    resetForm();
    setSelectedParentId(parentId);
    setIsAddComponentDialogOpen(true);
  };

  const containerComponents = components.filter(c => c.isContainer);
  
  const getChildComponents = (parentId: string) => 
    components.filter(c => c.parentId === parentId);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-blue-700">Building Components</h3>
          <p className="text-sm text-gray-500">Define non-rentable spaces to ensure complete building allocation</p>
        </div>
        
        <Dialog open={isAddContainerDialogOpen} onOpenChange={setIsAddContainerDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => {
              resetForm();
              setIsAddContainerDialogOpen(true);
            }}>
              <PlusCircle className="h-4 w-4 mr-1" />
              Add Container
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Component Container</DialogTitle>
              <DialogDescription>
                Create a new container to group related building components.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Container Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="e.g., Core Areas, Common Spaces"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddContainerDialogOpen(false)}>Cancel</Button>
              <Button type="submit" onClick={handleAddContainerSubmit}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {containerComponents.length > 0 ? (
        <div className="space-y-4">
          {containerComponents.map(container => (
            <ComponentContainer
              key={container.id}
              container={container}
              childComponents={getChildComponents(container.id)}
              floors={floors}
              onEdit={handleOpenEditDialog}
              onDelete={onDeleteComponent}
              onAddSubComponent={handleAddSubComponent}
              onEditSubComponent={handleOpenEditDialog}
              onDeleteSubComponent={onDeleteComponent}
            />
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2 border-gray-200 bg-gray-50">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Building2 className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 text-center mb-2">No building components defined yet</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsAddContainerDialogOpen(true)}
              className="mt-2"
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Add Component Container
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={isAddComponentDialogOpen} onOpenChange={setIsAddComponentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Building Component</DialogTitle>
            <DialogDescription>
              Add a new component to your building.
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
                placeholder="e.g., Elevator Core, Mechanical Room"
              />
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
            <Button variant="outline" onClick={() => setIsAddComponentDialogOpen(false)}>Cancel</Button>
            <Button type="submit" onClick={handleAddComponentSubmit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Edit {editingComponent?.isContainer ? 'Container' : 'Component'}
            </DialogTitle>
            <DialogDescription>
              Update the {editingComponent?.isContainer ? 'container' : 'component'} details.
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
            
            {!editingComponent?.isContainer && (
              <>
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
              </>
            )}
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
