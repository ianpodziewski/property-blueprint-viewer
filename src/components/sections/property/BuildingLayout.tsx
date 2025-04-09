
import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow
} from "@/components/ui/table";
import { 
  Trash, 
  ArrowUp, 
  ArrowDown, 
  PlusCircle, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  Copy, 
  MoreVertical,
  LayoutList,
  Save,
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ArrowUpDown
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Floor, FloorPlateTemplate, Product } from "@/hooks/usePropertyState";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { duplicateFloor } from "@/utils/floorManagement";
import FloorDuplicateModal from "./FloorDuplicateModal";
import ApplyFloorToRangeModal from "./ApplyFloorToRangeModal";
import SaveAsTemplateModal from "./SaveAsTemplateModal";
import BulkAddFloorsModal from "./BulkAddFloorsModal";
import FloorUsageTemplates from "./FloorUsageTemplates";
import { toast } from "sonner";

const formatNumber = (num: number | undefined): string => {
  return num === undefined || isNaN(num) ? "0" : num.toLocaleString('en-US');
};

interface BuildingLayoutProps {
  floors: Floor[];
  templates: FloorPlateTemplate[];
  products: Product[];
  onAddFloor: () => Promise<Floor | null>;
  onUpdateFloor: (id: string, updates: Partial<Omit<Floor, 'id'>>) => Promise<boolean>;
  onDeleteFloor: (id: string) => Promise<boolean>;
  onUpdateUnitAllocation: (floorId: string, unitTypeId: string, quantity: number) => Promise<boolean>;
  getUnitAllocation: (floorId: string, unitTypeId: string) => number;
  getFloorTemplateById: (templateId: string) => FloorPlateTemplate | undefined;
  onRefreshData?: () => Promise<void>;
}

const BuildingLayout = ({
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
}: BuildingLayoutProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedFloors, setExpandedFloors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingAllocationUpdates, setPendingAllocationUpdates] = useState<Record<string, boolean>>({});
  
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [selectedFloorForDuplicate, setSelectedFloorForDuplicate] = useState<Floor | null>(null);
  const [isDuplicating, setIsDuplicating] = useState(false);
  
  const [applyToRangeModalOpen, setApplyToRangeModalOpen] = useState(false);
  const [selectedFloorForRange, setSelectedFloorForRange] = useState<Floor | null>(null);
  
  const [saveTemplateModalOpen, setSaveTemplateModalOpen] = useState(false);
  const [selectedFloorForTemplate, setSelectedFloorForTemplate] = useState<Floor | null>(null);
  
  const [bulkAddModalOpen, setBulkAddModalOpen] = useState(false);

  // Sorting state
  const [sortField, setSortField] = useState<string>("position");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  useEffect(() => {
    console.log("BuildingLayout: Current floors data:", floors);
  }, [floors]);
  
  const projectId = floors.length > 0 && floors[0].projectId ? 
    floors[0].projectId : 
    "";
  
  const handleAddFloor = async () => {
    setIsSubmitting(true);
    await onAddFloor();
    setIsSubmitting(false);
  };
  
  const handleDeleteFloor = async (id: string) => {
    setIsSubmitting(true);
    const success = await onDeleteFloor(id);
    setIsSubmitting(false);
    
    if (success) {
      setExpandedFloors(prev => prev.filter(floorId => floorId !== id));
    }
  };
  
  const handleMoveFloor = async (id: string, direction: 'up' | 'down') => {
    const floorIndex = floors.findIndex(f => f.id === id);
    if (floorIndex === -1) return;
    
    const currentPosition = floors[floorIndex].position;
    
    if (direction === 'up' && floorIndex < floors.length - 1) {
      const nextFloorIndex = floorIndex + 1;
      const nextPosition = floors[nextFloorIndex].position;
      
      setIsSubmitting(true);
      await Promise.all([
        onUpdateFloor(id, { position: nextPosition }),
        onUpdateFloor(floors[nextFloorIndex].id, { position: currentPosition })
      ]);
      setIsSubmitting(false);
    } else if (direction === 'down' && floorIndex > 0) {
      const prevFloorIndex = floorIndex - 1;
      const prevPosition = floors[prevFloorIndex].position;
      
      setIsSubmitting(true);
      await Promise.all([
        onUpdateFloor(id, { position: prevPosition }),
        onUpdateFloor(floors[prevFloorIndex].id, { position: currentPosition })
      ]);
      setIsSubmitting(false);
    }
  };
  
  const handleTemplateChange = async (floorId: string, templateId: string) => {
    setIsSubmitting(true);
    await onUpdateFloor(floorId, { templateId });
    setIsSubmitting(false);
  };
  
  const handleLabelChange = async (floorId: string, label: string) => {
    setIsSubmitting(true);
    await onUpdateFloor(floorId, { label });
    setIsSubmitting(false);
  };
  
  const toggleFloorExpansion = (floorId: string) => {
    setExpandedFloors(prev => {
      const isExpanded = prev.includes(floorId);
      return isExpanded 
        ? prev.filter(id => id !== floorId) 
        : [...prev, floorId];
    });
  };
  
  const handleUnitAllocationChange = async (floorId: string, unitTypeId: string, quantity: number) => {
    const allocationKey = `${floorId}-${unitTypeId}`;
    setPendingAllocationUpdates(prev => ({
      ...prev,
      [allocationKey]: true
    }));
    
    await onUpdateUnitAllocation(floorId, unitTypeId, quantity);
    
    setPendingAllocationUpdates(prev => ({
      ...prev,
      [allocationKey]: false
    }));
  };

  const handleOpenDuplicateModal = (floor: Floor) => {
    setSelectedFloorForDuplicate(floor);
    setDuplicateModalOpen(true);
  };
  
  const handleOpenApplyToRangeModal = (floor: Floor) => {
    setSelectedFloorForRange(floor);
    setApplyToRangeModalOpen(true);
  };
  
  const handleOpenSaveTemplateModal = (floor: Floor) => {
    setSelectedFloorForTemplate(floor);
    setSaveTemplateModalOpen(true);
  };

  const handleDuplicateFloor = async (newLabel: string, positionType: "above" | "below") => {
    if (!selectedFloorForDuplicate) return;

    setIsDuplicating(true);
    try {
      const sortedFloors = [...floors].sort((a, b) => b.position - a.position);
      const floorIndex = sortedFloors.findIndex(f => f.id === selectedFloorForDuplicate.id);
      
      let newPosition: number;
      if (positionType === "above") {
        newPosition = sortedFloors[floorIndex].position + 1;
        
        if (floorIndex > 0) {
          newPosition = (sortedFloors[floorIndex].position + sortedFloors[floorIndex - 1].position) / 2;
        }
      } else {
        newPosition = sortedFloors[floorIndex].position - 1;
        
        if (floorIndex < sortedFloors.length - 1) {
          newPosition = (sortedFloors[floorIndex].position + sortedFloors[floorIndex + 1].position) / 2;
        }
      }
      
      const newFloorId = await duplicateFloor(
        selectedFloorForDuplicate.id,
        newLabel,
        newPosition
      );
      
      if (newFloorId) {
        toast.success(`Floor "${newLabel}" created successfully`);
        setExpandedFloors(prev => [...prev, newFloorId]);
      } else {
        toast.error("Failed to duplicate floor");
      }
    } catch (error) {
      console.error("Error duplicating floor:", error);
      toast.error("An error occurred while duplicating the floor");
    } finally {
      setIsDuplicating(false);
      setDuplicateModalOpen(false);
    }
  };
  
  const handleRefreshData = async () => {
    console.log("BuildingLayout: Requesting data refresh");
    try {
      if (floors.length > 0) {
        toast.info("Refreshing floor data...");
      }
      
      if (onRefreshData) {
        await onRefreshData();
        console.log("BuildingLayout: Data refresh completed via prop");
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };
  
  const calculateRemainingSpace = (floorId: string): number => {
    const floor = floors.find(f => f.id === floorId);
    if (!floor) return 0;
    
    const template = getFloorTemplateById(floor.templateId);
    const totalFloorArea = template?.grossArea || 0;
    
    let allocatedSpace = 0;
    
    products.forEach(product => {
      product.unitTypes.forEach(unitType => {
        const allocation = getUnitAllocation(floorId, unitType.id);
        allocatedSpace += (unitType.grossArea || 0) * allocation;
      });
    });
    
    return totalFloorArea - allocatedSpace;
  };

  const calculateAllocatedSpace = (floorId: string): number => {
    let allocatedSpace = 0;
    
    products.forEach(product => {
      product.unitTypes.forEach(unitType => {
        const allocation = getUnitAllocation(floorId, unitType.id);
        allocatedSpace += (unitType.grossArea || 0) * allocation;
      });
    });
    
    return allocatedSpace;
  };

  const calculateAllocationPercentage = (floorId: string): number => {
    const floor = floors.find(f => f.id === floorId);
    if (!floor) return 0;
    
    const template = getFloorTemplateById(floor.templateId);
    const totalFloorArea = template?.grossArea || 0;
    
    if (totalFloorArea === 0) return 0;
    
    const allocatedSpace = calculateAllocatedSpace(floorId);
    return (allocatedSpace / totalFloorArea) * 100;
  };

  const getStatusInfo = (floorId: string) => {
    const floor = floors.find(f => f.id === floorId);
    if (!floor) return { status: "empty", color: "bg-gray-300", text: "Empty" };
    
    const template = getFloorTemplateById(floor.templateId);
    const totalFloorArea = template?.grossArea || 0;
    
    if (totalFloorArea === 0) return { status: "empty", color: "bg-gray-300", text: "Empty" };
    
    const allocatedSpace = calculateAllocatedSpace(floorId);
    const remainingSpace = totalFloorArea - allocatedSpace;
    const percentage = (allocatedSpace / totalFloorArea) * 100;
    
    // Over-allocated: More than 100% of space used
    if (remainingSpace < 0) {
      return { 
        status: "over-allocated", 
        color: "bg-red-500", 
        text: "Over-allocated",
        tip: `This floor is over-allocated by ${formatNumber(Math.abs(remainingSpace))} sf (${Math.abs(percentage - 100).toFixed(1)}% excess)`
      };
    }
    
    // Properly allocated: 95-100% of space used
    if (percentage >= 95 && percentage <= 100) {
      return { 
        status: "full", 
        color: "bg-green-500", 
        text: "Properly allocated",
        tip: `This floor is well-allocated with ${formatNumber(remainingSpace)} sf remaining (${(100 - percentage).toFixed(1)}% free)`
      };
    }
    
    // Underutilized: Less than 95% of space used
    return { 
      status: "underutilized", 
      color: "bg-yellow-500", 
      text: "Underutilized",
      tip: `This floor has ${formatNumber(remainingSpace)} sf unused space (${(100 - percentage).toFixed(1)}% free)`
    };
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to descending
      setSortField(field);
      setSortDirection("desc");
    }
  };
  
  const sortedFloors = useMemo(() => {
    let sortableFloors = [...floors];
    
    // Custom sorting logic based on field
    if (sortField === "position") {
      sortableFloors.sort((a, b) => {
        return sortDirection === "desc" 
          ? b.position - a.position 
          : a.position - b.position;
      });
    } else if (sortField === "label") {
      sortableFloors.sort((a, b) => {
        return sortDirection === "desc"
          ? b.label.localeCompare(a.label)
          : a.label.localeCompare(b.label);
      });
    } else if (sortField === "remaining") {
      sortableFloors.sort((a, b) => {
        const aRemaining = calculateRemainingSpace(a.id);
        const bRemaining = calculateRemainingSpace(b.id);
        return sortDirection === "desc"
          ? bRemaining - aRemaining
          : aRemaining - bRemaining;
      });
    } else if (sortField === "allocated") {
      sortableFloors.sort((a, b) => {
        const aAllocated = calculateAllocatedSpace(a.id);
        const bAllocated = calculateAllocatedSpace(b.id);
        return sortDirection === "desc"
          ? bAllocated - aAllocated
          : aAllocated - bAllocated;
      });
    } else if (sortField === "totalArea") {
      sortableFloors.sort((a, b) => {
        const aTemplate = getFloorTemplateById(a.templateId);
        const bTemplate = getFloorTemplateById(b.templateId);
        const aArea = aTemplate?.grossArea || 0;
        const bArea = bTemplate?.grossArea || 0;
        return sortDirection === "desc"
          ? bArea - aArea
          : aArea - bArea;
      });
    }
    
    return sortableFloors;
  }, [floors, sortField, sortDirection, getFloorTemplateById]);
  
  const totalUnitsByType = useMemo(() => {
    const totals = new Map<string, number>();
    
    products.forEach(product => {
      product.unitTypes.forEach(unitType => {
        let total = 0;
        
        floors.forEach(floor => {
          total += getUnitAllocation(floor.id, unitType.id);
        });
        
        if (total > 0) {
          totals.set(unitType.id, total);
        }
      });
    });
    
    return totals;
  }, [floors, products, getUnitAllocation]);
  
  const buildingTotals = useMemo(() => {
    let area = 0;
    let units = 0;
    
    sortedFloors.forEach(floor => {
      const template = getFloorTemplateById(floor.templateId);
      area += template?.grossArea || 0;
    });
    
    products.forEach(product => {
      product.unitTypes.forEach(unitType => {
        floors.forEach(floor => {
          units += getUnitAllocation(floor.id, unitType.id);
        });
      });
    });
    
    return { totalArea: area, totalUnits: units };
  }, [sortedFloors, products, floors, getFloorTemplateById, getUnitAllocation]);
  
  const { totalArea, totalUnits } = buildingTotals;
  
  const groupedProducts = useMemo(() => {
    return products.map(product => ({
      ...product,
      unitTypes: [...product.unitTypes].sort((a, b) => 
        a.unitType.localeCompare(b.unitType)
      )
    }));
  }, [products]);
  
  const findUnitTypeById = (unitTypeId: string) => {
    for (const product of products) {
      const unitType = product.unitTypes.find(ut => ut.id === unitTypeId);
      if (unitType) return unitType;
    }
    return undefined;
  };
  
  // Render the sortable column header
  const renderSortableHeader = (label: string, field: string) => (
    <div 
      className="flex items-center cursor-pointer" 
      onClick={() => handleSort(field)}
    >
      {label}
      {sortField === field ? (
        sortDirection === "asc" ? (
          <ArrowUp className="h-4 w-4 ml-1" />
        ) : (
          <ArrowDown className="h-4 w-4 ml-1" />
        )
      ) : (
        <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />
      )}
    </div>
  );
  
  return (
    <>
      <Collapsible
        open={!isCollapsed}
        onOpenChange={setIsCollapsed}
        className="w-full space-y-2 mt-8"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Building Layout</h3>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
              {isCollapsed ? "+" : "-"}
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent className="pt-2">
          <div className="text-sm text-gray-500 mb-4">
            Configure your building's floors and assign units
          </div>
          
          <FloorUsageTemplates 
            floors={floors}
            templates={templates}
            projectId={projectId}
            onRefresh={handleRefreshData}
          />
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setBulkAddModalOpen(true)}
              disabled={templates.length === 0}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Multiple Floors
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                if (sortedFloors.length === 0) {
                  toast.error("No floors available to save as template");
                  return;
                }
                setSelectedFloorForTemplate(sortedFloors[0]);
                setSaveTemplateModalOpen(true);
              }}
              disabled={sortedFloors.length === 0}
            >
              <Save className="h-4 w-4 mr-1" /> Save as Template
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshData}
              title="Manually refresh floor data"
            >
              <RefreshCw className="h-4 w-4 mr-1" /> Refresh Data
            </Button>
          </div>
          
          {sortedFloors.length === 0 ? (
            <Card className="bg-gray-50 border border-dashed border-gray-200">
              <CardContent className="py-6 flex flex-col items-center justify-center text-center">
                <p className="text-gray-500 mb-4">No floors added yet</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddFloor} 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Adding...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="h-4 w-4 mr-1" /> Add your first floor
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 mb-4">
              {/* Excel-like grid structure */}
              <Card className="bg-white">
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead>{renderSortableHeader("Floor", "label")}</TableHead>
                        <TableHead>Template</TableHead>
                        <TableHead className="text-right">{renderSortableHeader("Total Area (sf)", "totalArea")}</TableHead>
                        <TableHead className="text-right">{renderSortableHeader("Allocated (sf)", "allocated")}</TableHead>
                        <TableHead className="text-right">{renderSortableHeader("Remaining (sf)", "remaining")}</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[180px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedFloors.map((floor, index) => {
                        const template = getFloorTemplateById(floor.templateId);
                        const totalFloorArea = template?.grossArea || 0;
                        const allocatedSpace = calculateAllocatedSpace(floor.id);
                        const remainingSpace = calculateRemainingSpace(floor.id);
                        const isOverAllocated = remainingSpace < 0;
                        const allocationPercentage = calculateAllocationPercentage(floor.id);
                        const statusInfo = getStatusInfo(floor.id);
                        
                        return (
                          <TableRow 
                            key={floor.id} 
                            className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                          >
                            <TableCell>
                              <Input
                                value={floor.label}
                                onChange={(e) => handleLabelChange(floor.id, e.target.value)}
                                placeholder="Enter floor label"
                                className="h-8"
                                disabled={isSubmitting}
                              />
                            </TableCell>
                            <TableCell>
                              <Select 
                                value={floor.templateId} 
                                onValueChange={(value) => handleTemplateChange(floor.id, value)}
                                disabled={isSubmitting}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue placeholder="Select a template" />
                                </SelectTrigger>
                                <SelectContent>
                                  {templates.map((template) => (
                                    <SelectItem key={template.id} value={template.id}>
                                      {template.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-right">
                              {formatNumber(totalFloorArea)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatNumber(allocatedSpace)}
                            </TableCell>
                            <TableCell className={`text-right ${isOverAllocated ? "text-red-600 font-medium" : ""}`}>
                              {formatNumber(remainingSpace)}
                            </TableCell>
                            <TableCell>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="w-full">
                                      <div className="flex items-center mb-1">
                                        {isOverAllocated ? (
                                          <div className="flex items-center">
                                            <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                                            <span className="text-xs text-red-500">Over-allocated</span>
                                          </div>
                                        ) : allocatedSpace === 0 ? (
                                          <div className="flex items-center">
                                            <div className="h-3 w-3 bg-gray-300 rounded-full mr-1"></div>
                                            <span className="text-xs text-gray-500">Empty</span>
                                          </div>
                                        ) : allocatedSpace === totalFloorArea ? (
                                          <div className="flex items-center">
                                            <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                                            <span className="text-xs text-green-500">Full</span>
                                          </div>
                                        ) : (
                                          <div className="flex items-center">
                                            <div className="h-3 w-3 bg-blue-400 rounded-full mr-1"></div>
                                            <span className="text-xs text-blue-500">Partial</span>
                                          </div>
                                        )}
                                      </div>
                                      <Progress 
                                        value={Math.min(allocationPercentage, 100)} 
                                        className={`h-2 ${
                                          isOverAllocated ? "bg-red-100" : 
                                          allocatedSpace === 0 ? "bg-gray-100" : 
                                          "bg-blue-100"
                                        }`}
                                      />
                                      <div className="flex justify-between mt-1">
                                        <span className="text-xs text-gray-500">
                                          {allocationPercentage.toFixed(0)}%
                                        </span>
                                      </div>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom">
                                    <div className="space-y-1 max-w-xs">
                                      <p className="font-medium">{statusInfo.text}</p>
                                      <p className="text-sm">{statusInfo.tip || "No units allocated to this floor yet"}</p>
                                      {isOverAllocated && (
                                        <p className="text-sm text-red-500">
                                          Suggestion: Reduce the number of units or switch to a larger floor template
                                        </p>
                                      )}
                                      {!isOverAllocated && allocatedSpace === 0 && (
                                        <p className="text-sm text-gray-500">
                                          Suggestion: Add some units to utilize this floor space
                                        </p>
                                      )}
                                      {!isOverAllocated && allocatedSpace > 0 && allocatedSpace < totalFloorArea && (
                                        <p className="text-sm text-blue-500">
                                          Suggestion: Add more units to utilize the remaining space
                                        </p>
                                      )}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => toggleFloorExpansion(floor.id)}
                                >
                                  {expandedFloors.includes(floor.id) ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => handleMoveFloor(floor.id, 'up')}
                                  disabled={isSubmitting || floor.position === Math.max(...floors.map(f => f.position))}
                                >
                                  <ArrowUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => handleMoveFloor(floor.id, 'down')}
                                  disabled={isSubmitting || floor.position === Math.min(...floors.map(f => f.position))}
                                >
                                  <ArrowDown className="h-4 w-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-7 w-7 p-0"
                                      disabled={isSubmitting}
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleOpenDuplicateModal(floor)}>
                                      <Copy className="h-4 w-4 mr-2" /> Duplicate Floor
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleOpenApplyToRangeModal(floor)}>
                                      <LayoutList className="h-4 w-4 mr-2" /> Apply to Range...
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleOpenSaveTemplateModal(floor)}>
                                      <Save className="h-4 w-4 mr-2" /> Save as Template
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                                  onClick={() => handleDeleteFloor(floor.id)}
                                  disabled={isSubmitting}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              {/* Expanded floor details section (when a floor is expanded) */}
              {expandedFloors.length > 0 && (
                <div className="space-y-3 mt-4">
                  {expandedFloors.map(floorId => {
                    const floor = floors.find(f => f.id === floorId);
                    if (!floor) return null;
                    
                    const remainingSpace = calculateRemainingSpace(floor.id);
                    const isOverAllocated = remainingSpace < 0;
                    
                    return (
                      <Card key={`expanded-${floorId}`} className="bg-white border-blue-200 border-2">
                        <CardContent className="py-4 px-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-semibold">
                              Unit Allocation for Floor: {floor.label}
                            </h4>
                            <div className={`text-sm font-medium ${isOverAllocated ? 'text-red-500' : 'text-blue-600'}`}>
                              Remaining: {formatNumber(remainingSpace)} sf
                            </div>
                          </div>
                          
                          {groupedProducts.length === 0 ? (
                            <p className="text-sm text-gray-500">No product units available. Add products in the Unit Mix section.</p>
                          ) : (
                            <div className="space-y-4">
                              {groupedProducts.map((product) => (
                                <div key={product.id} className="space-y-2">
                                  <h5 className="text-sm font-medium">{product.name}</h5>
                                  
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-[180px]">Unit Type</TableHead>
                                        <TableHead className="w-[100px]">Size (sf)</TableHead>
                                        <TableHead className="w-[120px]">Quantity</TableHead>
                                        <TableHead className="w-[120px] text-right">Total Area (sf)</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {product.unitTypes.map((unitType) => {
                                        const quantity = getUnitAllocation(floor.id, unitType.id);
                                        const totalArea = unitType.grossArea * quantity;
                                        const allocationKey = `${floor.id}-${unitType.id}`;
                                        const isPending = pendingAllocationUpdates[allocationKey];
                                        
                                        return (
                                          <TableRow key={unitType.id}>
                                            <TableCell>{unitType.unitType}</TableCell>
                                            <TableCell>{formatNumber(unitType.grossArea)}</TableCell>
                                            <TableCell>
                                              <div className="flex items-center">
                                                <Input
                                                  type="number"
                                                  min="0"
                                                  value={quantity || 0}
                                                  onChange={(e) => {
                                                    const value = parseInt(e.target.value) || 0;
                                                    if (value >= 0) {
                                                      handleUnitAllocationChange(floor.id, unitType.id, value);
                                                    }
                                                  }}
                                                  className="w-20 h-8 mr-2"
                                                  disabled={isPending}
                                                />
                                                {isPending && (
                                                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                                )}
                                              </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                              {formatNumber(totalArea)}
                                            </TableCell>
                                          </TableRow>
                                        );
                                      })}
                                    </TableBody>
                                  </Table>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddFloor}
            className="mt-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Adding...
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4 mr-1" /> Add Floor
              </>
            )}
          </Button>
          
          {sortedFloors.length > 0 && (
            <Card className="mt-4 bg-blue-50">
              <CardContent className="py-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Total Floors</Label>
                    <p className="mt-1">{sortedFloors.length}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Total Units</Label>
                    <p className="mt-1">{totalUnits}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Total Building Area</Label>
                    <p className="mt-1">{formatNumber(totalArea)} sf</p>
                  </div>
                </div>
                
                {Array.from(totalUnitsByType.entries()).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-blue-100">
                    <Label className="text-sm font-medium">Units by Type</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                      {Array.from(totalUnitsByType.entries()).map(([unitTypeId, count]) => {
                        const unitType = findUnitTypeById(unitTypeId);
                        if (!unitType) return null;
                        
                        return (
                          <div key={unitTypeId} className="text-sm">
                            <span className="font-medium">{unitType.unitType}:</span> {count}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CollapsibleContent>
      </Collapsible>

      <FloorDuplicateModal
        isOpen={duplicateModalOpen}
        onClose={() => setDuplicateModalOpen(false)}
        onDuplicate={handleDuplicateFloor}
        currentFloorLabel={selectedFloorForDuplicate?.label || ""}
        isLoading={isDuplicating}
      />
      
      <ApplyFloorToRangeModal
        isOpen={applyToRangeModalOpen}
        onClose={() => setApplyToRangeModalOpen(false)}
        sourceFloor={selectedFloorForRange}
        floors={floors}
        onComplete={handleRefreshData}
      />
      
      <SaveAsTemplateModal
        isOpen={saveTemplateModalOpen}
        onClose={() => setSaveTemplateModalOpen(false)}
        sourceFloor={selectedFloorForTemplate}
        projectId={projectId}
        onComplete={handleRefreshData}
      />
      
      <BulkAddFloorsModal
        isOpen={bulkAddModalOpen}
        onClose={() => setBulkAddModalOpen(false)}
        templates={templates}
        projectId={projectId}
        onComplete={handleRefreshData}
      />
    </>
  );
};

export default BuildingLayout;
