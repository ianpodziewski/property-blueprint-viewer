
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useModelState } from "@/hooks/useModelState";

interface ProjectInformationProps {
  projectName: string;
  setProjectName: (value: string) => void;
  projectLocation: string;
  setProjectLocation: (value: string) => void;
  projectType: string;
  setProjectType: (value: string) => void;
}

const ProjectInformation: React.FC<ProjectInformationProps> = ({
  projectName,
  setProjectName,
  projectLocation,
  setProjectLocation,
  projectType,
  setProjectType,
}) => {
  // Get common handlers from the model state to ensure persistence
  const { handleTextChange } = useModelState();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Information</CardTitle>
        <CardDescription>Set your project's basic details</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="project-name">Project Name</Label>
          <Input 
            id="project-name" 
            placeholder="Enter project name" 
            value={projectName}
            onChange={(e) => handleTextChange(e, setProjectName)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input 
            id="location" 
            placeholder="City, State" 
            value={projectLocation}
            onChange={(e) => handleTextChange(e, setProjectLocation)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="project-type">Project Type</Label>
          <Input 
            id="project-type" 
            placeholder="Mixed-use, Residential, etc." 
            value={projectType}
            onChange={(e) => handleTextChange(e, setProjectType)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectInformation;
