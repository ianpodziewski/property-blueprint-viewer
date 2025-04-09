
import { useModel } from "@/context/ModelContext";
import { Button } from "../ui/button";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Eye, EyeOff } from "lucide-react";

// Function to format property state for display
const formatPropertyState = (property: any) => {
  const formatted = { ...property };
  
  // Format numeric values
  if (formatted.maxBuildableArea !== undefined) {
    formatted.maxBuildableArea = formatted.maxBuildableArea.toLocaleString() + " sf";
  }
  
  if (formatted.farAllowance !== undefined) {
    formatted.farAllowance = formatted.farAllowance.toLocaleString() + "%";
  }
  
  if (formatted.lotSize !== undefined) {
    formatted.lotSize = formatted.lotSize.toLocaleString() + " sf";
  }
  
  // Format floor plate templates if they exist
  if (Array.isArray(formatted.floorPlateTemplates)) {
    formatted.floorPlateTemplates = formatted.floorPlateTemplates.map((template: any) => ({
      ...template,
      grossArea: template.grossArea ? template.grossArea.toLocaleString() + " sf" : "0 sf",
      width: template.width ? template.width.toLocaleString() + "'" : "N/A",
      length: template.length ? template.length.toLocaleString() + "'" : "N/A"
    }));
  }
  
  return formatted;
};

// Component to display the current model state for debugging
const StateInspector = () => {
  const model = useModel();
  const [isVisible, setIsVisible] = useState(false);
  const [section, setSection] = useState<string>("all");
  
  if (!isVisible) {
    return (
      <Button 
        variant="outline" 
        size="sm"
        className="fixed bottom-4 right-4 z-50 opacity-60 hover:opacity-100"
        onClick={() => setIsVisible(true)}
      >
        <Eye className="h-4 w-4 mr-2" /> Debug State
      </Button>
    );
  }
  
  // Create formatted property state for display
  const formattedPropertyState = formatPropertyState(model.property);
  
  const renderStateSection = (sectionName: string) => {
    if (section !== "all" && section !== sectionName) return null;
    
    // Use formatted property state for the property section
    const displayData = sectionName === "property" ? 
      formattedPropertyState : model[sectionName];
    
    return (
      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-2">{sectionName}</h3>
        <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
          {JSON.stringify(displayData, null, 2)}
        </pre>
      </div>
    );
  };
  
  return (
    <Card className="fixed bottom-4 right-4 z-50 w-96 max-w-[90vw] max-h-[80vh] overflow-auto shadow-xl">
      <CardHeader className="py-2 px-4 flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Model State Inspector</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
          <EyeOff className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="py-2">
        <div className="grid grid-cols-4 gap-2 mb-4">
          <Button 
            size="sm" 
            variant={section === "all" ? "default" : "outline"}
            className="text-xs"
            onClick={() => setSection("all")}
          >
            All
          </Button>
          <Button 
            size="sm" 
            variant={section === "property" ? "default" : "outline"}
            className="text-xs"
            onClick={() => setSection("property")}
          >
            Property
          </Button>
          <Button 
            size="sm" 
            variant={section === "financing" ? "default" : "outline"}
            className="text-xs"
            onClick={() => setSection("financing")}
          >
            Financing
          </Button>
          <Button 
            size="sm" 
            variant={section === "expenses" ? "default" : "outline"}
            className="text-xs"
            onClick={() => setSection("expenses")}
          >
            Expenses
          </Button>
        </div>
        
        {renderStateSection("property")}
        {renderStateSection("financing")}
        {renderStateSection("expenses")}
        {renderStateSection("timeline")}
        {renderStateSection("revenue")}
        {renderStateSection("disposition")}
        {renderStateSection("sensitivity")}
        
        <div className="text-xs text-gray-500 mt-4">
          Last saved: {model.meta?.version && `v${model.meta.version} - `}
          {model.lastSaved ? new Date(model.lastSaved).toLocaleString() : 'Never'}
        </div>
      </CardContent>
    </Card>
  );
};

export default StateInspector;
