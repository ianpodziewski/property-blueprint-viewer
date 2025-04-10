
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Percent,
  Square
} from "lucide-react";
import { NonRentableType } from "@/hooks/usePropertyState";

interface NonRentableSpaceProps {
  nonRentableTypes: NonRentableType[];
  onAddNonRentableType: (nonRentable: Omit<NonRentableType, 'id'>) => Promise<NonRentableType | null>;
  onUpdateNonRentableType: (id: string, updates: Partial<Omit<NonRentableType, 'id'>>) => Promise<boolean>;
  onDeleteNonRentableType: (id: string) => Promise<boolean>;
}

// Simplified allocation methods
type AllocationMethod = 'percentage' | 'fixed';

const allocationMethodLabels = {
  'percentage': 'Percentage of Floor Area',
  'fixed': 'Fixed Square Footage'
};

const allocationMethodIcons = {
  'percentage': <Percent className="mr-2 h-4 w-4" />,
  'fixed': <Square className="mr-2 h-4 w-4" />
};

const allocationMethodDescriptions = {
  'percentage': 'Space will be calculated as a percentage of each floor area',
  'fixed': 'Space will use a fixed square footage on each floor'
};

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  allocationMethod: z.enum(["percentage", "fixed"]),
  value: z.number().min(0, "Must be a positive number")
});

type FormValues = z.infer<typeof formSchema>;

const NonRentableSpace: React.FC<NonRentableSpaceProps> = ({
  nonRentableTypes,
  onAddNonRentableType,
  onUpdateNonRentableType,
  onDeleteNonRentableType
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Add console logs to trace the component rendering and data processing
  useEffect(() => {
    console.log("NonRentableSpace component received nonRentableTypes:", nonRentableTypes);
  }, [nonRentableTypes]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      allocationMethod: "fixed",
      value: 0
    }
  });

  const watchAllocationMethod = form.watch("allocationMethod");

  const handleAddClick = () => {
    setIsAdding(true);
    form.reset({
      name: "",
      allocationMethod: "fixed",
      value: 0
    });
  };

  const handleEditClick = (type: NonRentableType) => {
    setEditingId(type.id);
    form.reset({
      name: type.name,
      // Map the old allocation methods to new simplified ones
      allocationMethod: type.isPercentageBased || type.allocationMethod === 'percentage' ? 'percentage' : 'fixed',
      value: type.isPercentageBased || type.allocationMethod === 'percentage' 
        ? (type.percentage || 0) 
        : type.squareFootage
    });
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this non-rentable space type?")) {
      await onDeleteNonRentableType(id);
    }
  };

  const handleCancelClick = () => {
    setIsAdding(false);
    setEditingId(null);
    form.reset();
  };

  const onSubmit = async (values: FormValues) => {
    const isPercentageBased = values.allocationMethod === 'percentage';
    
    if (editingId) {
      // Update existing type
      await onUpdateNonRentableType(editingId, {
        name: values.name,
        squareFootage: isPercentageBased ? 0 : values.value,
        percentage: isPercentageBased ? values.value : undefined,
        allocationMethod: values.allocationMethod,
        isPercentageBased: isPercentageBased
      });
      setEditingId(null);
    } else if (isAdding) {
      // Add new type
      await onAddNonRentableType({
        name: values.name,
        squareFootage: isPercentageBased ? 0 : values.value,
        percentage: isPercentageBased ? values.value : undefined,
        allocationMethod: values.allocationMethod,
        isPercentageBased: isPercentageBased,
        floorConstraints: {}
      });
      setIsAdding(false);
    }
    form.reset();
  };

  // Helper function to display the area or percentage based on allocation method
  const renderAreaInfo = (type: NonRentableType) => {
    if (type.isPercentageBased || type.allocationMethod === 'percentage') {
      return (
        <div className="flex items-center">
          <Percent className="mr-1 h-4 w-4 text-gray-500" />
          <span>{type.percentage}% of floor area</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center">
          <Square className="mr-1 h-4 w-4 text-gray-500" />
          <span>{type.squareFootage.toLocaleString()} sf</span>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Add new type button */}
      {!isAdding && !editingId && (
        <Button onClick={handleAddClick} className="mb-4">
          <Plus className="mr-2 h-4 w-4" /> Add Non-Rentable Type
        </Button>
      )}

      {/* Add/Edit form */}
      {(isAdding || editingId) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">
              {editingId ? "Edit Non-Rentable Space" : "Add Non-Rentable Space"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Core/Circulation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allocationMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allocation Method</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an allocation method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="percentage">
                            <div className="flex items-center">
                              <Percent className="mr-2 h-4 w-4" />
                              Percentage of Floor Area
                            </div>
                          </SelectItem>
                          <SelectItem value="fixed">
                            <div className="flex items-center">
                              <Square className="mr-2 h-4 w-4" />
                              Fixed Square Footage
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">
                        {allocationMethodDescriptions[field.value as 'percentage' | 'fixed']}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {watchAllocationMethod === 'percentage' ? 'Percentage (%)' : 'Square Footage (sf)'}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="number" 
                            placeholder={watchAllocationMethod === 'percentage' ? "5" : "2000"}
                            min="0"
                            step={watchAllocationMethod === 'percentage' ? "0.01" : "1"}
                            {...field}
                            value={field.value.toString()}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            className="pr-8"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-gray-500">
                              {watchAllocationMethod === 'percentage' ? '%' : 'sf'}
                            </span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex space-x-2 pt-2">
                  <Button type="submit">
                    {editingId ? "Update" : "Add"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancelClick}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* List of non-rentable space types */}
      {nonRentableTypes && nonRentableTypes.length > 0 ? (
        <div className="space-y-4">
          {nonRentableTypes.map((type) => (
            <Card key={type.id} className={editingId === type.id ? "border-blue-400" : ""}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">{type.name}</h3>
                    <div className="flex flex-col sm:flex-row sm:gap-8 text-sm text-gray-600 mt-1">
                      <div className="flex items-center">
                        <span className="font-medium mr-2">Type:</span>
                        <div className="flex items-center">
                          {type.isPercentageBased || type.allocationMethod === 'percentage' 
                            ? allocationMethodIcons.percentage 
                            : allocationMethodIcons.fixed}
                          {type.isPercentageBased || type.allocationMethod === 'percentage' 
                            ? allocationMethodLabels.percentage 
                            : allocationMethodLabels.fixed}
                        </div>
                      </div>
                      <div className="flex items-center mt-1 sm:mt-0">
                        <span className="font-medium mr-2">Value:</span>
                        {renderAreaInfo(type)}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Manual allocation required for each floor
                    </p>
                  </div>
                  {editingId !== type.id && (
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditClick(type)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteClick(type.id)}
                        className="h-8 w-8 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {!isAdding && (
            <p>No non-rentable space types defined yet. Click the button above to add one.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default NonRentableSpace;
