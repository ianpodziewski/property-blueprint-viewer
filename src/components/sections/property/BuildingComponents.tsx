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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface BuildingComponentsProps {
  components: BuildingComponent[];
  floors: Floor[];
  onAddComponent: (componentData: BuildingComponentFormData) => Promise<BuildingComponent | null>;
  onUpdateComponent: (id: string, componentData: Partial<BuildingComponentFormData>) => Promise<boolean>;
  onDeleteComponent: (id: string) => Promise<boolean>;
}

const BuildingComponents: React.FC<BuildingComponentsProps> = ({
  components,
  floors,
  onAddComponent,
  onUpdateComponent,
  onDeleteComponent,
}) => {
  const [open, setOpen] = useState(false);
  const [editComponentId, setEditComponentId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BuildingComponentFormData>({
    name: '',
    isPercentage: false,
    percentage: 0,
    squareFootage: 0,
    floorId: null,
    parentId: null,
    isContainer: false
  });

  useEffect(() => {
    if (editComponentId) {
      const componentToEdit = components.find(c => c.id === editComponentId);
      if (componentToEdit) {
        setFormData({
          name: componentToEdit.name,
          componentType: componentToEdit.componentType,
          isPercentage: componentToEdit.isPercentage,
          percentage: componentToEdit.percentage,
          squareFootage: componentToEdit.squareFootage,
          floorId: componentToEdit.floorId,
          parentId: componentToEdit.parentId,
          isContainer: componentToEdit.isContainer
        });
      }
    } else {
      setFormData({
        name: '',
        isPercentage: false,
        percentage: 0,
        squareFootage: 0,
        floorId: null,
        parentId: null,
        isContainer: false
      });
    }
  }, [editComponentId, components]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (e.target instanceof HTMLInputElement && e.target.type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: e.target.checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleRadioChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      isPercentage: value === 'percentage',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('Please enter a component name');
      return;
    }

    if (formData.isPercentage && (!formData.percentage && formData.percentage !== 0)) {
      toast.error('Please enter a percentage value');
      return;
    }

    if (!formData.isPercentage && (!formData.squareFootage && formData.squareFootage !== 0)) {
      toast.error('Please enter a square footage value');
      return;
    }

    if (editComponentId) {
      await onUpdateComponent(editComponentId, formData);
      setEditComponentId(null);
    } else {
      await onAddComponent(formData);
    }

    setOpen(false);
  };

  const handleDelete = async (id: string) => {
    await onDeleteComponent(id);
  };

  const containerComponents = components.filter(comp => comp.isContainer);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Building Components</CardTitle>
        <CardDescription>
          Define the various components of your building, such as core, mechanical, and common areas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex justify-end">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button type="button">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Component
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editComponentId ? 'Edit Component' : 'Add Component'}</DialogTitle>
                  <DialogDescription>
                    {editComponentId ? 'Edit the details of your component.' : 'Add a new component to your building.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="componentType" className="text-right">
                      Component Type
                    </Label>
                    <Select value={formData.componentType} onValueChange={(value) => setFormData(prev => ({ ...prev, componentType: value }))} >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Core">Core</SelectItem>
                        <SelectItem value="Mechanical">Mechanical</SelectItem>
                        <SelectItem value="Common Area">Common Area</SelectItem>
                        <SelectItem value="Parking">Parking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="isContainer" className="text-right">
                      Is Container
                    </Label>
                    <Input
                      type="checkbox"
                      id="isContainer"
                      name="isContainer"
                      checked={formData.isContainer}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  {formData.isContainer && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="parentId" className="text-right">
                        Parent Container
                      </Label>
                      <Select value={formData.parentId || ""} onValueChange={(value) => setFormData(prev => ({ ...prev, parentId: value }))} >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a container" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {containerComponents.map(container => (
                            <SelectItem key={container.id} value={container.id}>{container.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {!formData.isContainer && (
                    <>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="floorId" className="text-right">
                          Floor
                        </Label>
                        <Select value={formData.floorId || ""} onValueChange={(value) => setFormData(prev => ({ ...prev, floorId: value }))} >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a floor" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {floors.map(floor => (
                              <SelectItem key={floor.id} value={floor.id}>{floor.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <RadioGroup onValueChange={handleRadioChange} defaultValue={formData.isPercentage ? 'percentage' : 'squareFootage'}>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="percentage" className="text-right">
                            Percentage
                          </Label>
                          <RadioGroupItem value="percentage" id="percentage" className="col-span-1" />
                          <Input
                            type="number"
                            id="percentage"
                            name="percentage"
                            value={formData.percentage}
                            onChange={handleInputChange}
                            className="col-span-2"
                            disabled={!formData.isPercentage}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="squareFootage" className="text-right">
                            Square Footage
                          </Label>
                          <RadioGroupItem value="squareFootage" id="squareFootage" className="col-span-1" />
                          <Input
                            type="number"
                            id="squareFootage"
                            name="squareFootage"
                            value={formData.squareFootage}
                            onChange={handleInputChange}
                            className="col-span-2"
                            disabled={formData.isPercentage}
                          />
                        </div>
                      </RadioGroup>
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" onClick={handleSubmit}>
                    {editComponentId ? 'Update' : 'Save'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Square Footage</TableHead>
                  <TableHead>Floor</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {components.map((component) => (
                  <TableRow key={component.id}>
                    <TableCell>
                      <div className="font-medium">{component.name}</div>
                      {component.isContainer && <div className="text-sm text-gray-500">Container</div>}
                    </TableCell>
                    <TableCell>{component.componentType}</TableCell>
                    <TableCell>{component.isPercentage ? `${component.percentage}%` : 'N/A'}</TableCell>
                    <TableCell>{!component.isPercentage ? `${component.squareFootage} sf` : 'N/A'}</TableCell>
                    <TableCell>{floors.find(floor => floor.id === component.floorId)?.label || 'None'}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => {
                          setEditComponentId(component.id);
                          setOpen(true);
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(component.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { BuildingComponents };
