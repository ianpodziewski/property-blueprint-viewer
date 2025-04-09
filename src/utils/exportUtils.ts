
import { saveAs } from 'file-saver';
import { Floor, FloorPlateTemplate, Product } from '@/hooks/usePropertyState';

// Helper to format date for filenames
const formatDateForFilename = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
};

// Export building layout to CSV
export const exportToCsv = (
  projectName: string,
  floors: Floor[],
  templates: FloorPlateTemplate[],
  products: Product[],
  unitAllocations: Record<string, Record<string, number>>
) => {
  // Get all unit types for reference
  const allUnitTypes = products.flatMap(p => p.unitTypes);
  
  // Create CSV header
  let csvContent = "Floor,Position,Template,Template Area (sf),";
  
  // Add unit type columns
  const uniqueUnitTypes = [...new Set(allUnitTypes.map(u => u.unitType))];
  csvContent += uniqueUnitTypes.join(',');
  csvContent += ",Total Units,Total Allocated Area (sf),Allocation Percentage\n";
  
  // Add rows for each floor
  floors
    .sort((a, b) => b.position - a.position) // Sort by position (descending)
    .forEach(floor => {
      const template = templates.find(t => t.id === floor.templateId);
      const floorArea = template?.grossArea || 0;
      const floorAllocations = unitAllocations[floor.id] || {};
      
      // Start with floor basics
      csvContent += `"${floor.label}",${floor.position},"${template?.name || 'Unknown'}",${floorArea},`;
      
      // Calculate totals for this floor
      let totalUnits = 0;
      let totalAllocatedArea = 0;
      
      // Add unit counts by type
      uniqueUnitTypes.forEach(unitType => {
        let unitCount = 0;
        
        // Find all unit types with this name and sum their counts
        allUnitTypes
          .filter(u => u.unitType === unitType)
          .forEach(unit => {
            const count = floorAllocations[unit.id] || 0;
            unitCount += count;
            totalUnits += count;
            totalAllocatedArea += unit.grossArea * count;
          });
        
        csvContent += `${unitCount},`;
      });
      
      // Add totals
      const allocationPercentage = floorArea > 0 ? (totalAllocatedArea / floorArea) * 100 : 0;
      csvContent += `${totalUnits},${totalAllocatedArea},${allocationPercentage.toFixed(1)}%\n`;
    });
  
  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${projectName.replace(/\s+/g, '_')}_Building_Layout_${formatDateForFilename()}.csv`);
};

// Export building layout to Excel
export const exportToExcel = (
  projectName: string,
  floors: Floor[],
  templates: FloorPlateTemplate[],
  products: Product[],
  unitAllocations: Record<string, Record<string, number>>
) => {
  // For simplicity, we'll just create a CSV file
  // In a real application, you would use a library like xlsx to create a proper Excel file
  exportToCsv(projectName, floors, templates, products, unitAllocations);
};
