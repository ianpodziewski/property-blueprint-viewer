
import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { Plus, RefreshCw, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { 
  Table, 
  TableHeader, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import BulkAddFloorsModal from "./BulkAddFloorsModal";
import FloorDuplicateModal from "./FloorDuplicateModal";
import ApplyFloorToRangeModal from "./ApplyFloorToRangeModal";
import SaveAsTemplateModal from "./SaveAsTemplateModal";
import FloorUsageTemplates from "./FloorUsageTemplates";
import BuildingSummaryPanel from "./BuildingSummaryPanel";
import UnitAllocationModal from "./UnitAllocationModal";
import DraggableFloorRow from "./DraggableFloorRow";
import { Floor, FloorPlateTemplate, Product } from "@/hooks/usePropertyState";

interface BuildingLayoutProps {
  floors: Floor[];
  templates: FloorPlateTemplate[];
  products: Product[];
  onAddFloor: () => Floor;
  onUpdateFloor: (id: string, updates: Partial<Omit<Floor, 'id'>>) => void;
  onDeleteFloor: (id: string) => void;
  onUpdateUnitAllocation: (floorId: string, unitTypeId: string, quantity: number) => Promise<void>;
  getUnitAllocation: (floorId: string, unitTypeId: string) => Promise<number>;
  getFloorTemplateById: (templateId: string) => FloorPlateTemplate | undefined;
  onRefreshData: () => Promise<void>;
}

const BuildingLayout: React.FC<BuildingLayoutProps> = ({
  floors,
  templates,
  products,
  onAddFloor,
  onUpdateFloor,
  onDeleteFloor,
  onUpdateUnitAllocation,
  getUnitAllocation,
  getFloorTemplateById,
  onRefreshData
}) => {
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showApplyRangeModal, setShowApplyRangeModal] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [showUnitAllocationModal, setShowUnitAllocationModal] = useState(false);
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [sortedFloors, setSortedFloors] = useState<Floor[]>([]);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);

  // Sort floors by position
  useEffect(() => {
    const sorted = [...floors].sort((a, b) => b.position - a.position);
    setSortedFloors(sorted);
  }, [floors]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source } = result;

    // If dropped outside the list or no movement
    if (!destination || destination.index === source.index) {
      setIsReordering(false);
      return;
    }

    setIsReordering(true);
    
    try {
      // Create new order of floors
      const newFloorList = Array.from(sortedFloors);
      const [movedFloor] = newFloorList.splice(source.index, 1);
      newFloorList.splice(destination.index, 0, movedFloor);
      
      // Update positions based on new order
      const updatedFloors = newFloorList.map((floor, index) => ({
        ...floor,
        position: newFloorList.length - index // Reverse index for position (highest at top)
      }));
      
      // Update the local state first for immediate feedback
      setSortedFloors(updatedFloors);
      
      // Update each floor's position in the database
      for (const floor of updatedFloors) {
        if (floor.position !== sortedFloors.find(f => f.id === floor.id)?.position) {
          await onUpdateFloor(floor.id, { position: floor.position });
        }
      }
      
      // Refresh data to ensure consistency
      await onRefreshData();
      setLastSavedTime(new Date());
      toast.success("Floor positions updated successfully");
    } catch (error) {
      console.error("Error updating floor positions:", error);
      toast.error("Failed to update floor positions");
      
      // Revert to original order on error
      setSortedFloors([...floors].sort((a, b) => b.position - a.position));
    } finally {
      setIsReordering(false);
    }
  };

  const handleAddFloor = () => {
    const newFloor = onAddFloor();
    setLastSavedTime(new Date());
    toast.success("New floor added");
    return newFloor;
  };

  const handleEditUnits = (floorId: string) => {
    setSelectedFloorId(floorId);
    setShowUnitAllocationModal(true);
  };

  const handleUnitAllocationClose = () => {
    setShowUnitAllocationModal(false);
    setSelectedFloorId(null);
    setLastSavedTime(new Date());
  };

  const handleRefreshData = async () => {
    await onRefreshData();
    setLastSavedTime(new Date());
    toast.success("Data refreshed successfully");
  };

  // Calculate if we have any floors
  const hasFloors = sortedFloors.length > 0;

  // If no floor templates are available, show a warning
  if (templates.length === 0) {
    return (
      <div className="space-y-4">
        <Alert variant="warning">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>No Floor Templates Available</AlertTitle>
          <AlertDescription>
            You need to define at least one floor plate template before you can add floors to your building.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">Building Layout</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefreshData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setShowBulkAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Multiple Floors
            </Button>
            <Button size="sm" onClick={handleAddFloor}>
              <Plus className="h-4 w-4 mr-2" />
              Add Floor
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {hasFloors ? (
            <div className="space-y-6">
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="floor-list">
                  {(provided, snapshot) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-10"></TableHead>
                            <TableHead>Floor</TableHead>
                            <TableHead>Template</TableHead>
                            <TableHead className="text-right">Area (sf)</TableHead>
                            <TableHead>Units</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody isDragging={snapshot.isDraggingOver}>
                          {sortedFloors.map((floor, index) => (
                            <DraggableFloorRow
                              key={floor.id}
                              floor={floor}
                              index={index}
                              templates={templates}
                              onUpdateFloor={onUpdateFloor}
                              onDeleteFloor={onDeleteFloor}
                              onEditUnits={handleEditUnits}
                              getFloorTemplateById={getFloorTemplateById}
                            />
                          ))}
                          {provided.placeholder}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              <BuildingSummaryPanel
                floors={sortedFloors}
                getFloorTemplateById={getFloorTemplateById}
                lastSavedTime={lastSavedTime}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Floor Management</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowDuplicateModal(true)}
                      disabled={sortedFloors.length === 0}
                    >
                      Duplicate Floor
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowApplyRangeModal(true)}
                      disabled={sortedFloors.length < 2}
                    >
                      Apply to Range
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowSaveTemplateModal(true)}
                      disabled={sortedFloors.length === 0}
                    >
                      Save as Template
                    </Button>
                  </div>
                </div>
                <div>
                  <FloorUsageTemplates
                    floors={sortedFloors}
                    templates={templates}
                    onRefreshData={onRefreshData}
                  />
                </div>
              </div>
            </div>
          ) : (
            <Alert className="mt-2">
              <Info className="h-5 w-5" />
              <AlertTitle>No floors added yet</AlertTitle>
              <AlertDescription>
                Click the "Add Floor" button to start building your property layout.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {showBulkAddModal && (
        <BulkAddFloorsModal
          templates={templates}
          onClose={() => setShowBulkAddModal(false)}
          onRefreshData={onRefreshData}
        />
      )}

      {showDuplicateModal && (
        <FloorDuplicateModal
          floors={sortedFloors}
          onClose={() => setShowDuplicateModal(false)}
          onRefreshData={onRefreshData}
        />
      )}

      {showApplyRangeModal && (
        <ApplyFloorToRangeModal
          floors={sortedFloors}
          onClose={() => setShowApplyRangeModal(false)}
          onRefreshData={onRefreshData}
        />
      )}

      {showSaveTemplateModal && (
        <SaveAsTemplateModal
          floors={sortedFloors}
          templates={templates}
          onClose={() => setShowSaveTemplateModal(false)}
          onRefreshData={onRefreshData}
        />
      )}

      {showUnitAllocationModal && selectedFloorId && (
        <UnitAllocationModal
          floorId={selectedFloorId}
          products={products}
          floorTemplate={getFloorTemplateById(sortedFloors.find(f => f.id === selectedFloorId)?.templateId || "")}
          onUpdateUnitAllocation={onUpdateUnitAllocation}
          getUnitAllocation={getUnitAllocation}
          onClose={handleUnitAllocationClose}
        />
      )}
    </div>
  );
};

export default BuildingLayout;
