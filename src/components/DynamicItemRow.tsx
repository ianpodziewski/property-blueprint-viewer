
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash, Plus } from "lucide-react";

interface DynamicItemRowProps {
  children: React.ReactNode;
  onRemove: () => void;
  showRemoveButton?: boolean;
}

export const DynamicItemRow: React.FC<DynamicItemRowProps> = ({
  children,
  onRemove,
  showRemoveButton = true
}) => {
  return (
    <div className="flex items-center gap-2 p-2 rounded-md border border-gray-200 bg-gray-50">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {children}
      </div>
      {showRemoveButton && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="flex-shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
          type="button"
        >
          <Trash className="h-4 w-4" />
          <span className="sr-only">Remove</span>
        </Button>
      )}
    </div>
  );
};

export const AddItemButton: React.FC<{ onClick: () => void; label: string }> = ({ 
  onClick, 
  label 
}) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      type="button"
      className="mt-2 flex items-center gap-1"
    >
      <Plus className="h-4 w-4" />
      {label}
    </Button>
  );
};
