
import { useState } from "react";
import { Project } from "@/types/project";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, MapPin, Building } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
}

const ProjectCard = ({ project, onDelete }: ProjectCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      setIsLoading(true);
      try {
        const { error } = await supabase
          .from("projects")
          .delete()
          .match({ id: project.id });
        
        if (error) throw error;
        
        toast({
          title: "Project deleted",
          description: "Your project has been successfully deleted."
        });
        
        onDelete(project.id);
      } catch (error) {
        console.error("Error deleting project:", error);
        toast({
          title: "Error",
          description: "Failed to delete the project. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDuplicate = async () => {
    if (!user) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to duplicate a project.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const newProject = {
        name: `${project.name} (Copy)`,
        location: project.location,
        project_type: project.project_type,
        user_id: user.id
      };
      
      const { data, error } = await supabase
        .from("projects")
        .insert(newProject)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Project duplicated",
        description: "A copy of your project has been created."
      });
      
      // Refresh the projects list
      window.location.reload();
    } catch (error) {
      console.error("Error duplicating project:", error);
      toast({
        title: "Error",
        description: "Failed to duplicate the project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = () => {
    navigate(`/model/${project.id}`);
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium">{project.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleOpen}>Open</DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>Duplicate</DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete} 
                className="text-red-600 focus:text-red-600" 
                disabled={isLoading}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-1">
          <MapPin className="h-3.5 w-3.5" />
          <span>{project.location}</span>
        </div>
        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
          <Building className="h-3.5 w-3.5" />
          <span>{project.project_type}</span>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button variant="outline" size="sm" className="w-full" onClick={handleOpen}>
          Open Project
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
