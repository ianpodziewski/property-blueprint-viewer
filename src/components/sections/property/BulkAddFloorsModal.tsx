
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FloorPlateTemplate } from "@/hooks/usePropertyState";
import { createBulkFloors } from "@/utils/floorManagement";
import { Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface BulkAddFloorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: FloorPlateTemplate[];
  projectId: string;
  onComplete: () => Promise<void>;
}

// Form validation schema
const formSchema = z.object({
  templateId: z.string().min(1, "Please select a floor template"),
  startFloor: z.number().min(1, "Start floor must be at least 1"),
  endFloor: z.number().min(1, "End floor must be at least 1")
    .refine(val => val >= 0, "End floor must be a positive number"),
  labelPrefix: z.string().min(1, "Label prefix is required"),
}).refine(data => data.endFloor >= data.startFloor, {
  message: "End floor must be greater than or equal to start floor",
  path: ["endFloor"], 
}).refine(data => (data.endFloor - data.startFloor) <= 100, {
  message: "Cannot create more than 100 floors at once",
  path: ["endFloor"],
});

const BulkAddFloorsModal = ({
  isOpen,
  onClose,
  templates,
  projectId,
  onComplete,
}: BulkAddFloorsModalProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Initialize form with react-hook-form and zod validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      templateId: templates.length > 0 ? templates[0].id : "",
      startFloor: 1,
      endFloor: 5,
      labelPrefix: "Floor",
    },
  });

  // Update form values when templates change
  useEffect(() => {
    if (templates.length > 0 && !form.getValues("templateId")) {
      form.setValue("templateId", templates[0].id);
    }
  }, [templates, form]);

  // Generate preview of floors to be created
  const previewFloors = () => {
    const floors = [];
    const startFloor = form.getValues("startFloor");
    const endFloor = form.getValues("endFloor");
    const labelPrefix = form.getValues("labelPrefix");
    
    if (startFloor <= endFloor) {
      for (let i = startFloor; i <= endFloor; i++) {
        floors.push(`${labelPrefix} ${i}`);
      }
    }
    return floors;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setErrorMessage(null);
    
    // Double-check projectId
    if (!projectId || projectId.trim() === '') {
      setErrorMessage("Project ID is missing. Please reload the page and try again.");
      return;
    }
    
    console.log("Creating floors with values:", values);
    console.log("Project ID:", projectId);
    
    setIsCreating(true);
    try {
      await createBulkFloors(
        projectId,
        values.templateId,
        values.startFloor,
        values.endFloor,
        values.labelPrefix
      );
      
      toast.success(`Created ${values.endFloor - values.startFloor + 1} floors successfully`);
      await onComplete();
      onClose();
    } catch (error) {
      console.error("Error creating bulk floors:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to create floors");
      toast.error("Failed to create floors");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Multiple Floors</DialogTitle>
          <DialogDescription>
            Create multiple floors with the same template in one operation.
          </DialogDescription>
        </DialogHeader>
        
        {errorMessage && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="templateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Floor Template</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isCreating || templates.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {templates.length > 0 ? (
                        templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No templates available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startFloor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Floor Number</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        disabled={isCreating}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endFloor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Floor Number</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={form.getValues("startFloor")}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || form.getValues("startFloor"))}
                        disabled={isCreating}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="labelPrefix"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Floor Label Prefix</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isCreating} />
                  </FormControl>
                  <p className="text-xs text-gray-500 mt-1">
                    Example: "{field.value} 1", "{field.value} 2", etc.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {projectId && (
              <div className="text-xs text-gray-500">
                Floors will be created for project ID: {projectId.substring(0, 8)}...
              </div>
            )}
            
            {previewFloors().length > 0 && (
              <div className="border rounded-md p-3 mt-2 bg-gray-50">
                <Label className="mb-2 block">Preview ({previewFloors().length} floors)</Label>
                <div className="text-sm text-gray-600 max-h-24 overflow-y-auto">
                  {previewFloors().map((floor, index) => (
                    <div key={index} className="mb-1">
                      {floor}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <DialogFooter className="pt-4">
              <Button 
                variant="outline" 
                onClick={(e) => {
                  e.preventDefault();
                  onClose();
                }} 
                type="button" 
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isCreating || templates.length === 0 || !projectId}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Floors"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BulkAddFloorsModal;
