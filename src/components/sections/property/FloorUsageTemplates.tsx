
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Floor, FloorPlateTemplate } from "@/hooks/usePropertyState";
import { toast } from "sonner";

// Simplified component that doesn't rely on removed database tables
export interface FloorUsageTemplate {
  id: string;
  name: string;
  templateId: string;
  projectId: string;
  createdAt: string;
}

interface FloorUsageTemplatesProps {
  floors: Floor[];
  templates: FloorPlateTemplate[];
  projectId: string;
  onRefresh: () => Promise<void>;
}

const FloorUsageTemplates = ({
  floors,
  templates,
  projectId,
  onRefresh
}: FloorUsageTemplatesProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [usageTemplates, setUsageTemplates] = useState<FloorUsageTemplate[]>([]);

  return (
    <div>
      {usageTemplates.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="py-3">
            <CardTitle className="text-lg">Floor Usage Templates</CardTitle>
            <CardDescription>Apply saved floor configurations to multiple floors</CardDescription>
          </CardHeader>
          <CardContent className="py-2 px-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template Name</TableHead>
                  <TableHead>Base Floor Template</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                    No templates available
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FloorUsageTemplates;
