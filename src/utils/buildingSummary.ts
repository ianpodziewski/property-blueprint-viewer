import { Floor, FloorPlateTemplate, Product } from '@/hooks/usePropertyState';
import { BuildingSummary } from '@/components/sections/property/BuildingSummaryPanel';

// Calculate the building summary data based on floors, templates, products, and allocations
export const calculateBuildingSummary = (
  floors: Floor[],
  templates: FloorPlateTemplate[],
  products: Product[],
  unitAllocations: Record<string, Record<string, number>>,
  lastSaved: Date | null,
  hasUnsavedChanges: boolean
): BuildingSummary => {
  // Get all unit types for easier reference
  const allUnitTypes = products.flatMap(p => p.unitTypes);
  
  // Calculate total building area
  const totalBuildingArea = floors.reduce((sum, floor) => {
    const template = templates.find(t => t.id === floor.templateId);
    return sum + (template?.grossArea || 0);
  }, 0);
  
  // Calculate allocated area and units by type
  let totalAllocatedArea = 0;
  const unitsByType: Record<string, number> = {};
  let totalUnits = 0;
  
  // Count units by type and calculate allocated area
  floors.forEach(floor => {
    const floorAllocations = unitAllocations[floor.id] || {};
    
    Object.entries(floorAllocations).forEach(([unitTypeId, count]) => {
      const unitType = allUnitTypes.find(u => u.id === unitTypeId);
      if (!unitType) return;
      
      // Add to allocated area
      totalAllocatedArea += unitType.grossArea * count;
      
      // Add to units by type
      const unitTypeName = unitType.unitType;
      unitsByType[unitTypeName] = (unitsByType[unitTypeName] || 0) + count;
      totalUnits += count;
    });
  });
  
  // Calculate allocation percentage
  const allocationPercentage = totalBuildingArea > 0 
    ? (totalAllocatedArea / totalBuildingArea) * 100 
    : 0;
  
  // Calculate template usage
  const templateUsage: BuildingSummary['templateUsage'] = [];
  const templateStats: Record<string, { count: number; area: number }> = {};
  
  floors.forEach(floor => {
    const template = templates.find(t => t.id === floor.templateId);
    if (!template) return;
    
    if (!templateStats[template.name]) {
      templateStats[template.name] = { count: 0, area: 0 };
    }
    
    templateStats[template.name].count += 1;
    templateStats[template.name].area += template.grossArea;
  });
  
  // Convert template stats to array with percentages
  Object.entries(templateStats).forEach(([name, stats]) => {
    templateUsage.push({
      name,
      count: stats.count,
      area: stats.area,
      percentage: totalBuildingArea > 0 ? (stats.area / totalBuildingArea) * 100 : 0
    });
  });
  
  // Sort template usage by area (descending)
  templateUsage.sort((a, b) => b.area - a.area);
  
  // Find over-allocated floors (>100% allocated)
  const overAllocatedFloors: BuildingSummary['overAllocatedFloors'] = [];
  
  // Find under-utilized floors (<50% allocated)
  const underUtilizedFloors: BuildingSummary['underUtilizedFloors'] = [];
  
  floors.forEach(floor => {
    const template = templates.find(t => t.id === floor.templateId);
    if (!template) return;
    
    const floorArea = template.grossArea;
    
    // Calculate allocated area for this floor
    let allocatedArea = 0;
    const floorAllocations = unitAllocations[floor.id] || {};
    
    Object.entries(floorAllocations).forEach(([unitTypeId, count]) => {
      const unitType = allUnitTypes.find(u => u.id === unitTypeId);
      if (!unitType) return;
      
      allocatedArea += unitType.grossArea * count;
    });
    
    // Calculate allocation percentage for this floor
    const floorAllocationPercentage = floorArea > 0 ? (allocatedArea / floorArea) * 100 : 0;
    
    // Check if over-allocated
    if (floorAllocationPercentage > 100) {
      overAllocatedFloors.push({
        floorId: floor.id,
        label: floor.label,
        percentage: floorAllocationPercentage
      });
    }
    
    // Check if under-utilized (less than 50% allocated)
    if (floorAllocationPercentage < 50 && floorAllocationPercentage > 0) {
      underUtilizedFloors.push({
        floorId: floor.id,
        label: floor.label,
        percentage: floorAllocationPercentage
      });
    }
  });
  
  // Sort warnings by percentage (descending for over-allocated, ascending for under-utilized)
  overAllocatedFloors.sort((a, b) => b.percentage - a.percentage);
  underUtilizedFloors.sort((a, b) => a.percentage - b.percentage);
  
  // Find excessive unit counts (any unit type that makes up >30% of total units)
  const excessiveUnitTypes: BuildingSummary['excessiveUnitTypes'] = [];
  
  if (totalUnits > 0) {
    Object.entries(unitsByType).forEach(([unitType, count]) => {
      const percentage = (count / totalUnits) * 100;
      
      if (percentage > 30) {
        excessiveUnitTypes.push({
          unitType,
          count,
          percentage
        });
      }
    });
  }
  
  // Sort excessive unit types by percentage (descending)
  excessiveUnitTypes.sort((a, b) => b.percentage - a.percentage);
  
  return {
    totalFloors: floors.length,
    totalBuildingArea,
    totalAllocatedArea,
    allocationPercentage,
    unitsByType,
    totalUnits,
    templateUsage,
    overAllocatedFloors,
    underUtilizedFloors,
    excessiveUnitTypes,
    lastSaved,
    hasUnsavedChanges
  };
};
