
import React, { useState } from "react";
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
  Building2, 
  LayoutGrid, 
  Percent 
} from "lucide-react";
import { NonRentableType } from "@/hooks/usePropertyState";

interface NonRentableSpaceProps {
  nonRentableTypes: NonRentableType[];
  onAddNonRentableType: (nonRentable: Omit<NonRentableType, 'id'>) => Promise<NonRentableType | null>;
  onUpdateNonRentableType: (id: string, updates: Partial<Omit<NonRentableType, 'id'>>) => Promise<boolean>;
  onDeleteNonRentableType: (id: string) => Promise<boolean>;
}

const allocationMethodLabels = {
  'uniform': 'Uniform Across Floors',
  'specific': 'Specific Floors',
  'percentage': 'Percentage of Floor Area'
};

const allocationMethodIcons = {
  'uniform': <LayoutGrid className="mr-2 h-4 w-4" />,
  'specific': <Building2 className="mr-2 h-4 w-4" />,
  'percentage': <Percent className="mr-2 h-4 w-4" />
};

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  squareFootage: z.number().min(0, "Must be a positive number"),
  allocationMethod: z.enum(["uniform", "specific", "percentage"])
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      squareFootage: 0,
      allocationMethod: "uniform"
    }
  });

  const handleAddClick = () => {
    setIsAdding(true);
    form.reset({
      name: "",
      squareFootage: 0,
      allocationMethod: "uniform"
    });
  };

  const handleEditClick = (type: NonRentableType) => {
    setEditingId(type.id);
    form.reset({
      name: type.name,
      squareFootage: type.squareFootage,
      allocationMethod: type.allocationMethod
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
    if (editingId) {
      // Make sure all required fields are included
      await onUpdateNonRentableType(editingId, {
        name: values.name,
        squareFootage: values.squareFootage,
        allocationMethod: values.allocationMethod
      });
      setEditingId(null);
    } else if (isAdding) {
      // Make sure all required fields are included
      await onAddNonRentableType({
        name: values.name,
        squareFootage: values.squareFootage,
        allocationMethod: values.allocationMethod
      });
      setIsAdding(false);
    }
    form.reset();
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
                  name="squareFootage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Square Footage</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="2000"
                          min="0"
                          step="1"
                          {...field}
                          value={field.value.toString()}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
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
                          <SelectItem value="uniform">
                            <div className="flex items-center">
                              <LayoutGrid className="mr-2 h-4 w-4" />
                              Uniform Across Floors
                            </div>
                          </SelectItem>
                          <SelectItem value="specific">
                            <div className="flex items-center">
                              <Building2 className="mr-2 h-4 w-4" />
                              Specific Floors
                            </div>
                          </SelectItem>
                          <SelectItem value="percentage">
                            <div className="flex items-center">
                              <Percent className="mr-2 h-4 w-4" />
                              Percentage of Floor Area
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
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
      {nonRentableTypes.length > 0 ? (
        <div className="space-y-4">
          {nonRentableTypes.map((type) => (
            <Card key={type.id} className={editingId === type.id ? "border-blue-400" : ""}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">{type.name}</h3>
                    <div className="flex flex-col sm:flex-row sm:gap-8 text-sm text-gray-600 mt-1">
                      <div className="flex items-center">
                        <span className="font-medium mr-2">Area:</span>
                        {type.squareFootage.toLocaleString()} sf
                      </div>
                      <div className="flex items-center mt-1 sm:mt-0">
                        <span className="font-medium mr-2">Allocation:</span>
                        <div className="flex items-center">
                          {allocationMethodIcons[type.allocationMethod]}
                          {allocationMethodLabels[type.allocationMethod]}
                        </div>
                      </div>
                    </div>
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
