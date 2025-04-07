
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";
import { useExportData } from "@/hooks/useExportData";

type ExportFormat = "json" | "csv" | "excel";

interface ExportDataButtonProps {
  format: ExportFormat;
  className?: string;
}

const ExportDataButton = ({ format, className }: ExportDataButtonProps) => {
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
  
  return (
    <Button 
      onClick={handleExport} 
      variant="outline" 
      className={className}
      size="sm"
    >
      <DownloadIcon className="mr-2 h-4 w-4" />
      Export as {formatLabel[format]}
    </Button>
  );
};

export default ExportDataButton;
