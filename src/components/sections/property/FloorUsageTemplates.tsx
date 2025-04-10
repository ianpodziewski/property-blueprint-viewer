
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface FloorUsageTemplatesProps {
  projectId: string;
  onRefresh: () => Promise<void>;
  floors: any[];
  templates: any[];
}

const FloorUsageTemplates = ({
  projectId,
  onRefresh,
  floors,
  templates
}: FloorUsageTemplatesProps) => {
  return (
    <Card className="mb-4">
      <CardHeader className="py-3">
        <CardTitle className="text-lg">Floor Usage Templates</CardTitle>
        <CardDescription>Feature temporarily unavailable</CardDescription>
      </CardHeader>
      <CardContent className="py-2 px-3">
        <div className="flex items-center p-4 space-x-3 text-amber-800 bg-amber-50 rounded-md border border-amber-200">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">
            Floor usage templates functionality has been temporarily removed. This feature will be reimplemented in a future update.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FloorUsageTemplates;
