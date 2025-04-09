
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormValidationError } from "./FormValidationError";
import { ValidationError } from "../types/modelTypes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DynamicFormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: ValidationError | null;
  touched?: boolean;
  required?: boolean;
  className?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  options?: { value: string; label: string }[];
  disabled?: boolean;
  hint?: string;
}

export const DynamicFormField: React.FC<DynamicFormFieldProps> = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  touched = false,
  required = false,
  className = "",
  min,
  max,
  step,
  options,
  disabled = false,
  hint
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSelectChange = (value: string) => {
    onChange(value);
  };

  // Generate a unique ID for the input
  const inputId = `field-${name.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={inputId} className="flex items-center">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {type === "select" && options ? (
        <Select
          value={value}
          onValueChange={handleSelectChange}
          disabled={disabled}
        >
          <SelectTrigger id={inputId} className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={inputId}
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={error && touched ? "border-red-500" : ""}
          required={required}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
        />
      )}
      
      {hint && <p className="text-sm text-gray-500">{hint}</p>}
      <FormValidationError error={error} visible={touched} />
    </div>
  );
};
