
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useModel } from "@/context/ModelContext";
import { useEffect } from "react";

const PropertyBreakdown = () => {
  // Use the model context instead of local state
  const { 
    property, 
    setHasUnsavedChanges 
  } = useModel();

  // Debug logging on component mount
  useEffect(() => {
    console.log("PropertyBreakdown mounted, connected to context state", {
      projectName: property.projectName,
      projectLocation: property.projectLocation,
      projectType: property.projectType,
    });
  }, [property]);

  // Debug log when specific fields change
  useEffect(() => {
    console.log("Project name updated:", property.projectName);
  }, [property.projectName]);

  useEffect(() => {
    console.log("Project location updated:", property.projectLocation);
  }, [property.projectLocation]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Property Breakdown</h2>
        <p className="text-gray-600 mb-6">Define the basic characteristics of your development project.</p>
      </div>
      
      <Card className="mb-10">
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
          <CardDescription>Set your project's basic details</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input 
              id="project-name" 
              placeholder="Enter project name" 
              value={property.projectName}
              onChange={(e) => {
                property.setProjectName(e.target.value);
                setHasUnsavedChanges(true);
                console.log("Project name input changed to:", e.target.value);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input 
              id="location" 
              placeholder="City, State" 
              value={property.projectLocation}
              onChange={(e) => {
                property.setProjectLocation(e.target.value);
                setHasUnsavedChanges(true);
                console.log("Location input changed to:", e.target.value);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-type">Project Type</Label>
            <Input 
              id="project-type" 
              placeholder="Mixed-use, Residential, etc." 
              value={property.projectType}
              onChange={(e) => {
                property.setProjectType(e.target.value);
                setHasUnsavedChanges(true);
                console.log("Project type input changed to:", e.target.value);
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyBreakdown;
