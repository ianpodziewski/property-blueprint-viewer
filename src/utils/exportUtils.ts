
/**
 * Convert JSON data to CSV format
 */
export const convertToCSV = (data: any[], headers: Record<string, string>): string => {
  // Extract keys from headers
  const keys = Object.keys(headers);
  
  // Create header row
  const headerRow = Object.values(headers).join(',');
  
  // Create data rows
  const rows = data.map(item => {
    return keys.map(key => {
      const value = item[key];
      // Handle special cases (comma in values, etc.)
      if (value === null || value === undefined) {
        return '';
      }
      const stringValue = String(value);
      // Escape quotes and wrap in quotes if contains comma
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });
  
  // Combine header and rows
  return [headerRow, ...rows].join('\n');
};

/**
 * Download data as CSV file
 */
export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Print the current page
 */
export const printPage = (): void => {
  window.print();
};

/**
 * Export data as Excel file (XLSX)
 * Note: This uses FileSaver.js and XLSX libraries which would need to be installed:
 * npm install file-saver xlsx
 */
export const exportToExcel = async (data: any[], sheetName: string, fileName: string): Promise<void> => {
  try {
    // Dynamically import the required libraries
    const XLSX = await import('xlsx');
    const FileSaver = await import('file-saver');
    
    // Create a worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Create a workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    // Create blob and save file
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(blob, fileName);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    // Fallback to CSV if Excel export fails
    const headers = Object.keys(data[0] || {}).reduce((acc, key) => {
      acc[key] = key;
      return acc;
    }, {} as Record<string, string>);
    
    const csvContent = convertToCSV(data, headers);
    downloadCSV(csvContent, fileName.replace('.xlsx', '.csv'));
  }
};

/**
 * Format date and time for filenames
 */
export const formatDateForFileName = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  return `${year}${month}${day}_${hours}${minutes}`;
};
