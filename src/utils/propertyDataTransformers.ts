
import { 
  FloorPlateTemplate, 
  UnitType, 
  Product, 
  Floor 
} from '@/hooks/usePropertyState';
import { 
  FloorPlateTemplateData, 
  UnitTypeData, 
  FloorData 
} from '@/types/propertyData';

export const transformFloorPlateTemplate = (template: FloorPlateTemplateData): FloorPlateTemplate => ({
  id: template.id,
  name: template.name,
  grossArea: Number(template.area),
  width: template.width ? Number(template.width) : undefined,
  length: template.length ? Number(template.length) : undefined
});

export const transformFloorPlateTemplates = (templateData: FloorPlateTemplateData[] | null): FloorPlateTemplate[] => {
  return (templateData || []).map(transformFloorPlateTemplate);
};

export const transformUnitTypes = (unitTypesData: UnitTypeData[] | null): Product[] => {
  const productMap = new Map<string, Product>();
  
  (unitTypesData || []).forEach((unitType: UnitTypeData) => {
    const category = unitType.category;
    
    if (!productMap.has(category)) {
      productMap.set(category, {
        id: crypto.randomUUID(),
        name: category,
        unitTypes: [],
      });
    }
    
    const product = productMap.get(category)!;
    product.unitTypes.push({
      id: unitType.id,
      unitType: unitType.name,
      numberOfUnits: unitType.units,
      grossArea: Number(unitType.area),
      width: unitType.width ? Number(unitType.width) : undefined,
      length: unitType.length ? Number(unitType.length) : undefined
    });
  });
  
  return Array.from(productMap.values());
};

export const transformFloors = (floorData: FloorData[] | null): Floor[] => {
  return (floorData || []).map((floor: FloorData) => ({
    id: floor.id,
    label: floor.label,
    position: floor.position,
    templateId: floor.template_id || '',
    projectId: floor.project_id,
    floorType: (floor.floor_type === 'underground' ? 'underground' : 'aboveground') as 'aboveground' | 'underground'
  }));
};
