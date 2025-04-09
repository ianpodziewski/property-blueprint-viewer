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
    
    // Validate floor plate templates
    if (modelData.property.floorPlateTemplates) {
      if (!Array.isArray(modelData.property.floorPlateTemplates)) {
        result.errors.push('Floor plate templates must be an array');
        result.valid = false;
      } else {
        // Check for duplicate template names
        const templateNames = new Set();
        const templateIds = new Set();
        
        // Check each template has required fields
        modelData.property.floorPlateTemplates.forEach((template: any, index: number) => {
          if (!template.id) {
            result.errors.push(`Template at index ${index} is missing id`);
            result.valid = false;
          } else if (templateIds.has(template.id)) {
            result.errors.push(`Duplicate template id found: ${template.id}`);
            result.valid = false;
          } else {
            templateIds.add(template.id);
          }
          
          if (!template.name) {
            result.errors.push(`Template at index ${index} is missing name`);
            result.valid = false;
          } else if (templateNames.has(template.name.toLowerCase())) {
            result.errors.push(`Duplicate template name found: ${template.name}`);
            result.valid = false;
          } else {
            templateNames.add(template.name.toLowerCase());
          }
          
          if (template.grossArea === undefined) {
            result.errors.push(`Template at index ${index} is missing gross area`);
            result.valid = false;
          }
          
          const grossArea = Number(template.grossArea);
          if (isNaN(grossArea) || grossArea < 0) {
            result.errors.push(`Template at index ${index} has invalid gross area`);
            result.valid = false;
          }
        });
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

// Utility function to safely convert string values to numbers
export const safeNumberConversion = (value: any): number => {
  if (value === undefined || value === null || value === '') return 0;
  
  // Handle case when value is an object with _type and value properties
  if (typeof value === 'object' && value !== null && value._type === 'undefined') {
    return 0;
  }
  
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

// Utility function to parse floor plate templates ensuring type safety
export const parseFloorPlateTemplates = (templates: any[]): any[] => {
  if (!Array.isArray(templates)) return [];
  
  const processedTemplates = templates.map(template => ({
    id: template.id || crypto.randomUUID(),
    name: template.name || '',
    width: safeNumberConversion(template.width),
    length: safeNumberConversion(template.length),
    grossArea: safeNumberConversion(template.grossArea)
  }));
  
  // Remove duplicates based on ID
  const uniqueTemplates = [];
  const templateIds = new Set();
  
  for (const template of processedTemplates) {
    if (!templateIds.has(template.id)) {
      templateIds.add(template.id);
      uniqueTemplates.push(template);
    }
  }
  
  return uniqueTemplates;
};
