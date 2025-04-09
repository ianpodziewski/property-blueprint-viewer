
import { Button } from "@/components/ui/button";
import { useModel } from "@/context/ModelContext";
import { Save } from "lucide-react";

const SaveButton = () => {
  const { saveModel, hasUnsavedChanges } = useModel();
  
  return (
    <Button 
      onClick={saveModel}
      variant={hasUnsavedChanges ? "default" : "outline"}
      size="sm"
      className="flex items-center gap-1"
    >
      <Save className="h-4 w-4" />
      Save
      {hasUnsavedChanges && <span className="ml-1 h-2 w-2 rounded-full bg-red-500"></span>}
    </Button>
  );
};

export default SaveButton;
