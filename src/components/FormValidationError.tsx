
import React from 'react';
import { ValidationError } from '../types/modelTypes';
import { AlertCircle } from 'lucide-react';

interface FormValidationErrorProps {
  error: ValidationError | null;
  visible?: boolean;
}

export const FormValidationError: React.FC<FormValidationErrorProps> = ({ 
  error, 
  visible = true 
}) => {
  if (!error || !visible) return null;
  
  return (
    <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
      <AlertCircle className="h-4 w-4" />
      <span>{error.message}</span>
    </div>
  );
};
