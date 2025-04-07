
import { Button } from "@/components/ui/button";
import { FileJson, FileCsv, Download } from "lucide-react";
import { useExportData } from "@/hooks/useExportData";

type ExportFormat = "json" | "csv" | "excel";

interface ExportDataButtonProps {
  format: ExportFormat;
  className?: string;
  showLabel?: boolean;
}

const ExportDataButton = ({ format, className, showLabel = true }: ExportDataButtonProps) => {
  const { exportAsJson, exportAsCsv, exportAsExcel } = useExportData();
  
  const handleExport = () => {
    switch (format) {
      case "json":
        exportAsJson();
        break;
      case "csv":
        exportAsCsv();
        break;
      case "excel":
        exportAsExcel();
        break;
    }
  };
  
  const formatLabel = {
    json: "JSON",
    csv: "CSV",
    excel: "Excel"
  };

  const renderIcon = () => {
    switch (format) {
      case "json":
        return <FileJson className="h-4 w-4" />;
      case "csv":
        return <FileCsv className="h-4 w-4" />;
      case "excel":
        return <Download className="h-4 w-4" />;
    }
  };
  
  return (
    <Button 
      onClick={handleExport} 
      variant="outline" 
      className={className}
      size="sm"
      title={`Export full model as ${formatLabel[format]}`}
    >
      {renderIcon()}
      {showLabel && <span className="ml-2">Export {formatLabel[format]}</span>}
    </Button>
  );
};

export default ExportDataButton;
