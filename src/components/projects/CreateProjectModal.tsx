
import { useState } from "react";
import { PROJECT_TYPES } from "@/types/project";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
}

const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }: CreateProjectModalProps) => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [projectType, setProjectType] = useState(PROJECT_TYPES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !location || !projectType) {
      toast({
        title: "Missing fields",
        description: "Please fill out all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to create a project.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Insert the new project
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .insert({
          name,
          location,
          project_type: projectType,
          user_id: user.id
        })
        .select();
      
      if (projectError) throw projectError;
      
      if (projectData && projectData.length > 0) {
        const projectId = projectData[0].id;
        
        // For residential and mixed-use projects, create some initial templates
        if (projectType === "Residential" || projectType === "Mixed-Use") {
          await initializeResidentialProject(projectId);
        } else if (projectType === "Commercial" || projectType === "Retail") {
          await initializeCommercialProject(projectId);
        }
      }
      
      toast({
        title: "Project created",
        description: "Your new project has been created successfully."
      });
      
      setName("");
      setLocation("");
      setProjectType(PROJECT_TYPES[0]);
      onProjectCreated();
      onClose();
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "Failed to create the project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize a residential or mixed-use project with common floor plates and unit types
  const initializeResidentialProject = async (projectId: string) => {
    try {
      // Create common floor plate templates
      const { data: templateData, error: templateError } = await supabase
        .from("floor_plate_templates")
        .insert([
          { project_id: projectId, name: "Residential Floor", area: 10000 },
          { project_id: projectId, name: "Ground Floor Retail", area: 8000 },
          { project_id: projectId, name: "Parking Level", area: 12000 }
        ]);

      if (templateError) throw templateError;

      // Create common unit types
      const { error: unitTypesError } = await supabase
        .from("unit_types")
        .insert([
          { project_id: projectId, category: "Residential", name: "Studio", area: 500, units: 0 },
          { project_id: projectId, category: "Residential", name: "1 Bed / 1 Bath", area: 700, units: 0 },
          { project_id: projectId, category: "Residential", name: "2 Bed / 2 Bath", area: 1000, units: 0 },
          { project_id: projectId, category: "Retail", name: "Retail Space", area: 2000, units: 0 }
        ]);

      if (unitTypesError) throw unitTypesError;
    } catch (error) {
      console.error("Error initializing residential project data:", error);
    }
  };

  // Initialize a commercial or retail project with common floor plates and unit types
  const initializeCommercialProject = async (projectId: string) => {
    try {
      // Create common floor plate templates
      const { data: templateData, error: templateError } = await supabase
        .from("floor_plate_templates")
        .insert([
          { project_id: projectId, name: "Office Floor", area: 15000 },
          { project_id: projectId, name: "Lobby Floor", area: 8000 },
          { project_id: projectId, name: "Parking Level", area: 20000 }
        ]);

      if (templateError) throw templateError;

      // Create common unit types
      const { error: unitTypesError } = await supabase
        .from("unit_types")
        .insert([
          { project_id: projectId, category: "Office", name: "Open Office", area: 10000, units: 0 },
          { project_id: projectId, category: "Office", name: "Executive Suite", area: 2000, units: 0 },
          { project_id: projectId, category: "Retail", name: "Ground Floor Retail", area: 5000, units: 0 }
        ]);

      if (unitTypesError) throw unitTypesError;
    } catch (error) {
      console.error("Error initializing commercial project data:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="projectType">Project Type</Label>
              <Select value={projectType} onValueChange={setProjectType}>
                <SelectTrigger id="projectType">
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectModal;
