
import { ValidationError } from "../types/modelTypes";

/**
 * Validates a required field
 */
export const validateRequired = (
  value: string | undefined | null,
  fieldName: string
): ValidationError | null => {
  if (!value || value.trim() === "") {
    return {
      field: fieldName,
      message: `${fieldName} is required.`
    };
  }
  return null;
};

/**
 * Validates that a number is greater than a minimum value
 */
export const validateMinValue = (
  value: string | undefined | null,
  fieldName: string,
  min: number
): ValidationError | null => {
  if (!value) return null;
  
  const numVal = parseFloat(value);
  if (isNaN(numVal)) return null;
  
  if (numVal < min) {
    return {
      field: fieldName,
      message: `${fieldName} must be at least ${min}.`
    };
  }
  return null;
};

/**
 * Validates that a number is less than a maximum value
 */
export const validateMaxValue = (
  value: string | undefined | null,
  fieldName: string,
  max: number
): ValidationError | null => {
  if (!value) return null;
  
  const numVal = parseFloat(value);
  if (isNaN(numVal)) return null;
  
  if (numVal > max) {
    return {
      field: fieldName,
      message: `${fieldName} must not exceed ${max}.`
    };
  }
  return null;
};

/**
 * Validates that a number is between min and max values
 */
export const validateRange = (
  value: string | undefined | null,
  fieldName: string,
  min: number,
  max: number
): ValidationError | null => {
  if (!value) return null;
  
  const numVal = parseFloat(value);
  if (isNaN(numVal)) return null;
  
  if (numVal < min || numVal > max) {
    return {
      field: fieldName,
      message: `${fieldName} must be between ${min} and ${max}.`
    };
  }
  return null;
};

/**
 * Validates that a percentage is between 0 and 100
 */
export const validatePercentage = (
  value: string | undefined | null,
  fieldName: string
): ValidationError | null => {
  return validateRange(value, fieldName, 0, 100);
};

/**
 * Validates that a string matches a pattern
 */
export const validatePattern = (
  value: string | undefined | null,
  fieldName: string,
  pattern: RegExp,
  message: string
): ValidationError | null => {
  if (!value) return null;
  
  if (!pattern.test(value)) {
    return {
      field: fieldName,
      message: message
    };
  }
  return null;
};

/**
 * Collect all validation errors
 */
export const collectValidationErrors = (validations: (ValidationError | null)[]): ValidationError[] => {
  return validations.filter((validation): validation is ValidationError => validation !== null);
};
