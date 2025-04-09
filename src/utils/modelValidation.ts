export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// Validate model data before saving
export const validateModelData = (modelData: any): ValidationResult => {
  const result: ValidationResult = {
    valid: true,
    errors: []
  };

  // Check meta section
  if (!modelData.meta || !modelData.meta.lastSaved) {
    result.errors.push('Missing metadata in model');
    result.valid = false;
  }

  // Check required sections exist
  const requiredSections = ['property', 'financing', 'expenses', 'sensitivity'];
  for (const section of requiredSections) {
    if (!modelData[section]) {
      result.errors.push(`Missing required section: ${section}`);
      result.valid = false;
    }
  }

  // Check property section has required fields
  if (modelData.property) {
    const propertyFields = ['projectName', 'projectType', 'projectLocation'];
    for (const field of propertyFields) {
      if (modelData.property[field] === undefined) {
        result.errors.push(`Missing required property field: ${field}`);
        result.valid = false;
      }
    }
    
    // Validate numeric building parameters
    if (modelData.property.farAllowance !== undefined) {
      const far = Number(modelData.property.farAllowance);
      if (isNaN(far) || far < 0) {
        result.errors.push('FAR Allowance must be a positive number');
        result.valid = false;
      }
    }
    
    if (modelData.property.lotSize !== undefined) {
      const lotSize = Number(modelData.property.lotSize);
      if (isNaN(lotSize) || lotSize < 0) {
        result.errors.push('Lot Size must be a positive number');
        result.valid = false;
      }
    }
  }

  // Check financing section has required fields
  if (modelData.financing) {
    const financingFields = ['totalProjectCost', 'debtAmount', 'equityAmount'];
    for (const field of financingFields) {
      if (modelData.financing[field] === undefined) {
        result.errors.push(`Missing required financing field: ${field}`);
        result.valid = false;
      }
    }
  }

  // Add more section-specific validations as needed

  return result;
};

// Function to deep verify object structure to check for undefined or null values
export const findInvalidValues = (obj: any, path: string = ''): string[] => {
  const issues: string[] = [];
  
  if (!obj || typeof obj !== 'object') {
    return issues;
  }
  
  for (const key in obj) {
    const currentPath = path ? `${path}.${key}` : key;
    const value = obj[key];
    
    if (value === null) {
      issues.push(`Null value detected at ${currentPath}`);
    } else if (value === undefined) {
      issues.push(`Undefined value detected at ${currentPath}`);
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      // Recursively check nested objects
      const nestedIssues = findInvalidValues(value, currentPath);
      issues.push(...nestedIssues);
    }
  }
  
  return issues;
};
