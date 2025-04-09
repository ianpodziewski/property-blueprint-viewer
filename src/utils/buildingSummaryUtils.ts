
import { BuildingSummary, BuildingWarning, Floor, FloorPlateTemplate, Product, UnitType } from "@/hooks/usePropertyState";

/**
 * Calculate building summary statistics
 */
export const calculateBuildingSummary = (
  data: {
    floorPlateTemplates: FloorPlateTemplate[],
    products: Product[],
    floors: Floor[],
    getFloorTemplateById: (templateId: string) => FloorPlateTemplate | undefined
  },
  unitAllocations: Record<string, Record<string, number>> = {}
): BuildingSummary => {
  const { floorPlateTemplates, products, floors, getFloorTemplateById } = data;
  
  // Total floors
  const totalFloors = floors.length;
  
  // Total building area
  let totalBuildingArea = 0;
  let totalAllocatedArea = 0;
  
  // Unit type breakdown
  const unitTypeBreakdown: Record<string, number> = {};
  
  // Template breakdown
  const floorTemplateBreakdown: Record<string, number> = {};
  
  // Collect floors by template for warnings
  const floorsByTemplate: Record<string, Floor[]> = {};
  
  // Floor allocation percentages for warnings
  const floorAllocationPercentages: Record<string, number> = {};
  
  // Process floor data
  floors.forEach(floor => {
    const template = getFloorTemplateById(floor.templateId);
    
    if (template) {
      // Add to total building area
      totalBuildingArea += template.grossArea;
      
      // Count for template breakdown
      floorTemplateBreakdown[template.name] = (floorTemplateBreakdown[template.name] || 0) + 1;
      
      // Collect floors by template
      if (!floorsByTemplate[template.id]) {
        floorsByTemplate[template.id] = [];
      }
      floorsByTemplate[template.id].push(floor);
      
      // Calculate allocated area for this floor
      let floorAllocatedArea = 0;
      
      // If we have unit allocations data
      if (unitAllocations[floor.id]) {
        // Process each unit type allocation
        for (const [unitTypeId, allocation] of Object.entries(unitAllocations[floor.id])) {
          // Find the unit type across all products
          let foundUnitType: UnitType | undefined;
          for (const product of products) {
            foundUnitType = product.unitTypes.find(unit => unit.id === unitTypeId);
            if (foundUnitType) break;
          }
          
          if (foundUnitType) {
            // Add to unit type breakdown
            unitTypeBreakdown[foundUnitType.unitType] = (unitTypeBreakdown[foundUnitType.unitType] || 0) + allocation;
            
            // Add to allocated area
            floorAllocatedArea += foundUnitType.grossArea * allocation;
          }
        }
      }
      
      // Add to total allocated area
      totalAllocatedArea += floorAllocatedArea;
      
      // Calculate floor allocation percentage
      floorAllocationPercentages[floor.id] = template.grossArea > 0 
        ? (floorAllocatedArea / template.grossArea) * 100 
        : 0;
    }
  });
  
  // Calculate allocation percentage
  const allocationPercentage = totalBuildingArea > 0 
    ? (totalAllocatedArea / totalBuildingArea) * 100 
    : 0;
  
  // Generate warnings
  const warnings: BuildingWarning[] = [];
  
  // Check for over-allocated floors (> 100%)
  const overallocatedFloors = Object.entries(floorAllocationPercentages)
    .filter(([_, percentage]) => percentage > 100)
    .map(([floorId]) => floorId);
  
  if (overallocatedFloors.length > 0) {
    warnings.push({
      type: 'overallocated',
      floorIds: overallocatedFloors,
      message: `${overallocatedFloors.length} floor(s) have unit allocations exceeding available area`,
      severity: 'error'
    });
  }
  
  // Check for significantly under-utilized floors (< 70%)
  const underutilizedFloors = Object.entries(floorAllocationPercentages)
    .filter(([_, percentage]) => percentage > 0 && percentage < 70)
    .map(([floorId]) => floorId);
  
  if (underutilizedFloors.length > 0) {
    warnings.push({
      type: 'underutilized',
      floorIds: underutilizedFloors,
      message: `${underutilizedFloors.length} floor(s) have low utilization (< 70% allocated)`,
      severity: 'warning'
    });
  }
  
  // Check for excessive unit counts (compare with average)
  for (const [unitType, count] of Object.entries(unitTypeBreakdown)) {
    // We consider a unit type "excessive" if it accounts for more than 60% of all units
    const totalUnits = Object.values(unitTypeBreakdown).reduce((sum, count) => sum + count, 0);
    if (totalUnits === 0) continue;
    
    const percentage = (count / totalUnits) * 100;
    
    if (percentage > 60) {
      // Find the unitTypeId
      let unitTypeId: string | undefined;
      for (const product of products) {
        const foundUnit = product.unitTypes.find(unit => unit.unitType === unitType);
        if (foundUnit) {
          unitTypeId = foundUnit.id;
          break;
        }
      }
      
      if (unitTypeId) {
        warnings.push({
          type: 'excessiveUnits',
          unitTypeId,
          message: `Unit type "${unitType}" accounts for ${percentage.toFixed(1)}% of all units`,
          severity: 'warning'
        });
      }
    }
  }
  
  return {
    totalFloors,
    totalBuildingArea,
    totalAllocatedArea,
    allocationPercentage,
    unitTypeBreakdown,
    floorTemplateBreakdown,
    warnings
  };
};
