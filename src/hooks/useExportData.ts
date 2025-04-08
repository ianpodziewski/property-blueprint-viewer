
import { useModelState } from "./useModelState";
import { prepareDataForExport, convertToCSVFormat } from "@/utils/exportUtils";

export const useExportData = () => {
  const modelState = useModelState();
  
  // Export data as JSON
  const exportAsJson = () => {
    const data = prepareDataForExport();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `${modelState.property.projectName || 'real-estate-model'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Export data as CSV
  const exportAsCsv = () => {
    const data = prepareDataForExport();
    const csvRows = convertToCSVFormat(data);
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create download link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `${modelState.property.projectName || 'real-estate-model'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Export data as Excel (XLSX)
  const exportAsExcel = () => {
    // Since we can't directly create Excel files in the browser,
    // we'll use CSV as a fallback which Excel can open
    exportAsCsv();
    
    // Note: For actual Excel (.xlsx) export, you would typically need
    // a library like SheetJS/xlsx or exceljs, which would require
    // additional package installation
  };
  
  return {
    exportAsJson,
    exportAsCsv,
    exportAsExcel
  };
};
