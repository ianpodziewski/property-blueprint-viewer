import React, { useState, useMemo, useEffect, useCallback, MouseEvent, KeyboardEvent } from "react";
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
  ArrowUpDown,
  Check,
  ClipboardCopy,
  ClipboardPaste,
  Trash2,
  ListFilter,
  MoveVertical,
  RotateCcw,
  Shield
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Floor, FloorPlateTemplate, Product } from "@/hooks/usePropertyState";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
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

interface BulkApplyTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFloors: Floor[];
  templates: FloorPlateTemplate[];
  onApply: (templateId: string, applyUnitAllocations: boolean) => Promise<void>;
}

const BulkApplyTemplateModal: React.FC<BulkApplyTemplateModalProps> = ({
  isOpen,
  onClose,
  selectedFloors,
  templates,
  onApply
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [applyUnitAllocations, setApplyUnitAllocations] = useState<boolean>(false);
  const [isApplying, setIsApplying] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && templates.length > 0) {
      setSelectedTemplateId(templates[0].id);
    }
  }, [isOpen, templates]);

  const handleApply = async () => {
    if (!selectedTemplateId) {
      toast.error("Please select a template");
      return;
    }

    setIsApplying(true);
    try {
      await onApply(selectedTemplateId, applyUnitAllocations);
      onClose();
      toast.success(`Template applied to ${selectedFloors.length} floors`);
    } catch (error) {
      console.error("Error applying template:", error);
      toast.error("Failed to apply template to floors");
    } finally {
      setIsApplying(false);
    }
  };

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Apply Template to Selected Floors</DialogTitle>
          <DialogDescription>
            Apply a floor template to {selectedFloors.length} selected floor{selectedFloors.length !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="template-select">Select Template</Label>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger id="template-select">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} ({formatNumber(template.grossArea)} sf)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTemplate && (
            <div className="bg-blue-50 p-3 rounded-md">
              <div className="text-sm font-medium mb-1">Template Info:</div>
              <div className="text-sm">
                <span className="font-medium">Name:</span> {selectedTemplate.name}
              </div>
              <div className="text-sm">
                <span className="font-medium">Area:</span> {formatNumber(selectedTemplate.grossArea)} sf
              </div>
              {selectedTemplate.width && selectedTemplate.length && (
                <div className="text-sm">
                  <span className="font-medium">Dimensions:</span> {selectedTemplate.width}' x {selectedTemplate.length}'
                </div>
              )}
            </div>
          )}

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="apply-allocations" 
              checked={applyUnitAllocations} 
              onCheckedChange={(checked) => setApplyUnitAllocations(checked === true)}
            />
            <Label htmlFor="apply-allocations" className="text-sm cursor-pointer">
              Also apply default unit allocations from template
            </Label>
          </div>

          <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
              <div className="text-sm text-amber-800">
                This will replace the floor template for all selected floors. 
                {applyUnitAllocations && " Unit allocations will be reset based on the template."}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isApplying}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={!selectedTemplateId || isApplying}>
            {isApplying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : (
              "Apply Template"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface BulkActionsMenuProps {
  selectedCount: number;
  onApplyTemplate: () => void;
  onClearAllocations: () => void;
  onDeleteSelected: () => void;
  onCopySelected: () => void;
  onPasteToSelected: () => void;
  canPaste: boolean;
}

const BulkActionsMenu: React.FC<BulkActionsMenuProps> = ({
  selectedCount,
  onApplyTemplate,
  onClearAllocations,
  onDeleteSelected,
  onCopySelected,
  onPasteToSelected,
  canPaste
}) => {
  return (
    <div className="flex items-center space-x-2 py-2 px-3 bg-blue-100 rounded-md mb-3">
      <div className="text-blue-700 font-medium mr-2">
        {selectedCount} floor{selectedCount !== 1 ? 's' : ''} selected
      </div>
      
      <Button 
        size="sm" 
        variant="outline" 
        className="bg-white"
        onClick={onApplyTemplate}
      >
        <LayoutList className="h-4 w-4 mr-1" /> Apply Template
      </Button>
      
      <Button 
        size="sm" 
        variant="outline" 
        className="bg-white"
        onClick={onClearAllocations}
      >
        <RotateCcw className="h-4 w-4 mr-1" /> Clear Allocations
      </Button>
      
      <Button 
        size="sm" 
        variant="outline" 
        className="bg-white"
        onClick={onCopySelected}
      >
        <ClipboardCopy className="h-4 w-4 mr-1" /> Copy
      </Button>
      
      <Button 
        size="sm" 
        variant="outline" 
        className="bg-white"
        onClick={onPasteToSelected}
        disabled={!canPaste}
      >
        <ClipboardPaste className="h-4 w-4 mr-1" /> Paste
      </Button>
      
      <Button 
        size="sm" 
        variant="outline" 
        className="bg-white text-red-600 hover:text-red-700"
        onClick={onDeleteSelected}
      >
        <Trash2 className="h-4 w-4 mr-1" /> Delete
      </Button>
    </div>
  );
};

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
    
    if (remainingSpace < 0) {
      return { 
        status: "over-allocated", 
        color: "bg-red-500", 
        text: "Over-allocated",
        tip: `This floor is over-allocated by ${formatNumber(Math.abs(remainingSpace))} sf (${Math.abs(percentage - 100).toFixed(1)}% excess)`
      };
    }
    
    if (percentage >= 95 && percentage <= 100) {
      return { 
        status: "full", 
        color: "bg-green-500", 
        text: "Properly allocated",
        tip: `This floor is well-allocated with ${formatNumber(remainingSpace)} sf remaining (${(100 - percentage).toFixed(1)}% free)`
      };
    }
    
    return { 
      status: "underutilized", 
      color: "bg-yellow-500", 
      text: "Underutilized",
      tip: `This floor has ${formatNumber(remainingSpace)} sf unused space (${(100 - percentage).toFixed(1)}% free)`
    };
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };
  
  const sortedFloors = useMemo(() => {
    let sortableFloors = [...floors];
    
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
  
  const handleExpandAll = () => {
    setExpandedFloors(floors.map(floor => floor.id));
  };
  
  const handleCollapseAll = () => {
    setExpandedFloors([]);
  };
  
  const [selectedFloorIds, setSelectedFloorIds] = useState<Set<string>>(new Set());
  const [lastSelectedFloorId, setLastSelectedFloorId] = useState<string | null>(null);
  const [clipboardData, setClipboardData] = useState<{floorId: string, templateId: string, allocations: {unitTypeId: string, quantity: number}[]} | null>(null);
  const [bulkApplyTemplateModalOpen, setBulkApplyTemplateModalOpen] = useState(false);
  
  useEffect(() => {
    setSelectedFloorIds(new Set());
    setLastSelectedFloorId(null);
  }, [floors]);
  
  const isSelected = useCallback((floorId: string) => {
    return selectedFloorIds.has(floorId);
  }, [selectedFloorIds]);
  
  const toggleSelection = useCallback((floorId: string, multiSelect = false, rangeSelect = false) => {
    setSelectedFloorIds(prev => {
      const newSelection = new Set(prev);
      
      if (rangeSelect && lastSelectedFloorId) {
        const sortedFloors = [...floors].sort((a, b) => b.position - a.position);
        const currentIndex = sortedFloors.findIndex(f => f.id === floorId);
        const lastIndex = sortedFloors.findIndex(f => f.id === lastSelectedFloorId);
        
        if (currentIndex !== -1 && lastIndex !== -1) {
          const start = Math.min(currentIndex, lastIndex);
          const end = Math.max(currentIndex, lastIndex);
          
          for (let i = start; i <= end; i++) {
            newSelection.add(sortedFloors[i].id);
          }
        }
      } else if (multiSelect) {
        if (newSelection.has(floorId)) {
          newSelection.delete(floorId);
          if (lastSelectedFloorId === floorId) {
            setLastSelectedFloorId(null);
          }
        } else {
          newSelection.add(floorId);
          setLastSelectedFloorId(floorId);
        }
      } else {
        newSelection.clear();
        newSelection.add(floorId);
        setLastSelectedFloorId(floorId);
      }
      
      return newSelection;
    });
  }, [floors, lastSelectedFloorId]);
  
  const selectAll = useCallback((selected: boolean) => {
    if (selected) {
      const allIds = new Set(floors.map(floor => floor.id));
      setSelectedFloorIds(allIds);
    } else {
      setSelectedFloorIds(new Set());
    }
    setLastSelectedFloorId(null);
  }, [floors]);
  
  const handleRowClick = useCallback((floorId: string, event: MouseEvent) => {
    const isCtrlPressed = event.ctrlKey || event.metaKey;
    const isShiftPressed = event.shiftKey;
    
    toggleSelection(floorId, isCtrlPressed, isShiftPressed);
  }, [toggleSelection]);
  
  const handleDeleteSelected = useCallback(async () => {
    if (selectedFloorIds.size === 0) return;
    
    const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedFloorIds.size} floor${selectedFloorIds.size !== 1 ? 's' : ''}?`);
    if (!confirmDelete) return;
    
    setIsSubmitting(true);
    
    try {
      let successCount = 0;
      
      for (const floorId of selectedFloorIds) {
        const success = await onDeleteFloor(floorId);
        if (success) {
          successCount++;
          setExpandedFloors(prev => prev.filter(id => id !== floorId));
        }
      }
      
      if (successCount > 0) {
        toast.success(`Deleted ${successCount} floor${successCount !== 1 ? 's' : ''}`);
      }
      
      setSelectedFloorIds(new Set());
    } catch (error) {
      console.error("Error deleting floors:", error);
      toast.error("Failed to delete some floors");
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedFloorIds, onDeleteFloor]);
  
  const handleCopySelected = useCallback(() => {
    if (selectedFloorIds.size === 0) return;
    
    const floorId = Array.from(selectedFloorIds)[0];
    const floor = floors.find(f => f.id === floorId);
    
    if (!floor) return;
    
    const allocations: {unitTypeId: string, quantity: number}[] = [];
    
    products.forEach(product => {
      product.unitTypes.forEach(unitType => {
        const quantity = getUnitAllocation(floorId, unitType.id);
        if (quantity > 0) {
          allocations.push({
            unitTypeId: unitType.id,
            quantity
          });
        }
      });
    });
    
    setClipboardData({
      floorId,
      templateId: floor.templateId,
      allocations
    });
    
    toast.success(selectedFloorIds.size > 1 
      ? `Copied configuration from first selected floor (${floor.label})` 
      : `Copied configuration from ${floor.label}`
    );
  }, [selectedFloorIds, floors, products, getUnitAllocation]);
  
  const handlePasteToSelected = useCallback(async () => {
    if (selectedFloorIds.size === 0 || !clipboardData) return;
    
    const confirmPaste = window.confirm(
      `Paste configuration to ${selectedFloorIds.size} selected floor${selectedFloorIds.size !== 1 ? 's' : ''}?`
    );
    
    if (!confirmPaste) return;
    
    setIsSubmitting(true);
    
    try {
      let successCount = 0;
      const sourceFloor = floors.find(f => f.id === clipboardData.floorId);
      
      for (const floorId of selectedFloorIds) {
        if (floorId === clipboardData.floorId) continue;
        
        const templateSuccess = await onUpdateFloor(floorId, { 
          templateId: clipboardData.templateId 
        });
        
        if (templateSuccess) {
          for (const allocation of clipboardData.allocations) {
            await onUpdateUnitAllocation(
              floorId, 
              allocation.unitTypeId, 
              allocation.quantity
            );
          }
          
          successCount++;
        }
      }
      
      if (successCount > 0) {
        toast.success(`Applied configuration to ${successCount} floor${successCount !== 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error("Error pasting configuration:", error);
      toast.error("Failed to paste configuration to some floors");
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedFloorIds, clipboardData, floors, onUpdateFloor, onUpdateUnitAllocation]);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Building Layout</h3>
        <div className="flex space-x-2">
          {floors.length > 0 && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExpandAll} 
                className="text-xs"
              >
                <ChevronDown className="h-3.5 w-3.5 mr-1" />
                Expand All
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCollapseAll} 
                className="text-xs"
              >
                <ChevronUp className="h-3.5 w-3.5 mr-1" />
                Collapse All
              </Button>
            </>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshData}
            className="text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setBulkAddModalOpen(true)}
            className="text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Multiple Floors
          </Button>
          <Button 
            onClick={handleAddFloor} 
            disabled={isSubmitting} 
            size="sm"
            className="text-xs"
          >
            <PlusCircle className="h-3.5 w-3.5 mr-1" />
            Add Floor
          </Button>
        </div>
      </div>
      
      {selectedFloorIds.size > 0 && (
        <BulkActionsMenu
          selectedCount={selectedFloorIds.size}
          onApplyTemplate={() => setBulkApplyTemplateModalOpen(true)}
          onClearAllocations={() => {
            alert("Clear allocations functionality coming soon");
          }}
          onDeleteSelected={handleDeleteSelected}
          onCopySelected={handleCopySelected}
          onPasteToSelected={handlePasteToSelected}
          canPaste={clipboardData !== null}
        />
      )}
      
      {floors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium mb-1">No Floors Added Yet</h3>
              <p className="text-sm text-gray-500">
                Start by adding floors to your building
              </p>
            </div>
            <Button 
              onClick={handleAddFloor} 
              disabled={isSubmitting}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add First Floor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox 
                        checked={selectedFloorIds.size === floors.length && floors.length > 0}
                        onCheckedChange={selectAll}
                        aria-label="Select all floors"
                      />
                    </TableHead>
                    <TableHead className="w-14">Floor</TableHead>
                    <TableHead>{renderSortableHeader("Label", "label")}</TableHead>
                    <TableHead>{renderSortableHeader("Area (sf)", "totalArea")}</TableHead>
                    <TableHead>{renderSortableHeader("Allocated (sf)", "allocated")}</TableHead>
                    <TableHead>{renderSortableHeader("Remaining (sf)", "remaining")}</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead className="w-28">Template</TableHead>
                    <TableHead className="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedFloors.map((floor) => {
                    const isExpanded = expandedFloors.includes(floor.id);
                    const template = getFloorTemplateById(floor.templateId);
                    const totalArea = template?.grossArea || 0;
                    const allocatedSpace = calculateAllocatedSpace(floor.id);
                    const remainingSpace = totalArea - allocatedSpace;
                    const allocationPercentage = calculateAllocationPercentage(floor.id);
                    const statusInfo = getStatusInfo(floor.id);
                    
                    return (
                      <React.Fragment key={floor.id}>
                        <TableRow
                          selected={isSelected(floor.id)}
                          onClick={(e) => handleRowClick(floor.id, e)}
                          className="cursor-pointer"
                        >
                          <TableCell className="p-0 pl-4">
                            <Checkbox 
                              checked={isSelected(floor.id)}
                              onCheckedChange={(checked) => {
                                if (checked !== undefined) {
                                  toggleSelection(floor.id, true, false);
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`Select floor ${floor.label}`}
                            />
                          </TableCell>
                          <TableCell 
                            className="font-medium"
                          >
                            {floor.position}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-0 h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFloorExpansion(floor.id);
                                }}
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                              <Input 
                                value={floor.label}
                                onChange={(e) => handleLabelChange(floor.id, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="h-8 w-40"
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatNumber(totalArea)}
                          </TableCell>
                          <TableCell>
                            {formatNumber(allocatedSpace)}
                          </TableCell>
                          <TableCell className={remainingSpace < 0 ? "text-red-600 font-medium" : ""}>
                            {formatNumber(remainingSpace)}
                          </TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center">
                                    <div className={`h-2.5 w-2.5 rounded-full mr-2 ${statusInfo.color}`}></div>
                                    <span className="text-xs">{statusInfo.text}</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                  <p className="text-xs max-w-xs">{statusInfo.tip}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell>
                            <Select 
                              value={floor.templateId} 
                              onValueChange={(value) => handleTemplateChange(floor.id, value)}
                              onOpenChange={(open) => {
                                if (open) {
                                  const selectEvent = new Event("selectopen", { bubbles: true });
                                  document.dispatchEvent(selectEvent);
                                }
                              }}
                            >
                              <SelectTrigger 
                                className="h-8 w-full" 
                                onClick={(e) => e.stopPropagation()}
                              >
                                <SelectValue placeholder="Select template" />
                              </SelectTrigger>
                              <SelectContent>
                                {templates.map(template => (
                                  <SelectItem key={template.id} value={template.id}>
                                    {template.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMoveFloor(floor.id, 'up');
                                      }}
                                      disabled={floors.indexOf(floor) === floors.length - 1 || isSubmitting}
                                    >
                                      <ArrowUp className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Move floor up</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMoveFloor(floor.id, 'down');
                                      }}
                                      disabled={floors.indexOf(floor) === 0 || isSubmitting}
                                    >
                                      <ArrowDown className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Move floor down</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleOpenDuplicateModal(floor)}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleOpenApplyToRangeModal(floor)}>
                                    <MoveVertical className="h-4 w-4 mr-2" />
                                    Apply to Range
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleOpenSaveTemplateModal(floor)}>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save as Template
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteFloor(floor.id)}
                                    className="text-red-600 hover:text-red-700 focus:text-red-700"
                                  >
                                    <Trash className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                        
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={9} className="p-0 border-t-0">
                              <div className="bg-gray-50 px-4 py-3">
                                <div className="mb-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="text-sm font-medium">Unit Allocation</div>
                                    <div className="text-xs text-gray-500">
                                      {formatNumber(allocatedSpace)} / {formatNumber(totalArea)} sf allocated ({allocationPercentage.toFixed(1)}%)
                                    </div>
                                  </div>
                                  <Progress value={Math.min(allocationPercentage, 100)} className="h-2" />
                                </div>
                                
                                <div className="grid grid-cols-1 gap-4">
                                  {groupedProducts.map(product => {
                                    const productUnitTypes = product.unitTypes;
                                    const hasAllocations = productUnitTypes.some(
                                      ut => getUnitAllocation(floor.id, ut.id) > 0
                                    );
                                    
                                    if (productUnitTypes.length === 0) return null;
                                    
                                    return (
                                      <Collapsible 
                                        key={product.id} 
                                        open={true}
                                        defaultOpen={true}
                                      >
                                        <CollapsibleTrigger className="flex items-center w-full text-left mb-2">
                                          <div className="text-sm font-medium">{product.name}</div>
                                          <ChevronDown className="h-4 w-4 ml-1" />
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                          <div className="border rounded-md overflow-hidden">
                                            <table className="w-full text-sm">
                                              <thead className="bg-gray-100">
                                                <tr>
                                                  <th className="py-2 px-3 text-left font-medium">Unit Type</th>
                                                  <th className="py-2 px-3 text-left font-medium">Size (sf)</th>
                                                  <th className="py-2 px-3 text-center font-medium">Quantity</th>
                                                  <th className="py-2 px-3 text-right font-medium">Total Area (sf)</th>
                                                </tr>
                                              </thead>
                                              <tbody className="bg-white">
                                                {productUnitTypes.map(unitType => {
                                                  const currentAllocation = getUnitAllocation(floor.id, unitType.id);
                                                  const allocationKey = `${floor.id}-${unitType.id}`;
                                                  const isUpdating = pendingAllocationUpdates[allocationKey];
                                                  
                                                  return (
                                                    <tr key={unitType.id} className="border-t">
                                                      <td className="py-2 px-3">{unitType.unitType}</td>
                                                      <td className="py-2 px-3">{formatNumber(unitType.grossArea)}</td>
                                                      <td className="py-2 px-3">
                                                        <div className="flex items-center justify-center">
                                                          <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-7 w-7 rounded-r-none border-r-0"
                                                            onClick={() => {
                                                              const newValue = Math.max(0, currentAllocation - 1);
                                                              handleUnitAllocationChange(floor.id, unitType.id, newValue);
                                                            }}
                                                            disabled={currentAllocation <= 0 || isUpdating}
                                                          >
                                                            <span className="text-lg font-normal">-</span>
                                                          </Button>
                                                          <Input
                                                            type="number"
                                                            value={currentAllocation}
                                                            onChange={(e) => {
                                                              const newValue = parseInt(e.target.value) || 0;
                                                              handleUnitAllocationChange(floor.id, unitType.id, Math.max(0, newValue));
                                                            }}
                                                            className="h-7 w-16 rounded-none text-center"
                                                            min={0}
                                                          />
                                                          <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-7 w-7 rounded-l-none border-l-0"
                                                            onClick={() => {
                                                              const newValue = currentAllocation + 1;
                                                              handleUnitAllocationChange(floor.id, unitType.id, newValue);
                                                            }}
                                                            disabled={isUpdating}
                                                          >
                                                            <span className="text-lg font-normal">+</span>
                                                          </Button>
                                                          {isUpdating && (
                                                            <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                                          )}
                                                        </div>
                                                      </td>
                                                      <td className="py-2 px-3 text-right font-medium">
                                                        {formatNumber(unitType.grossArea * currentAllocation)}
                                                      </td>
                                                    </tr>
                                                  );
                                                })}
                                                
                                                <tr className="border-t bg-gray-50">
                                                  <td colSpan={2} className="py-2 px-3 font-medium">
                                                    Subtotal
                                                  </td>
                                                  <td className="py-2 px-3 text-center font-medium">
                                                    {formatNumber(productUnitTypes.reduce(
                                                      (sum, unitType) => sum + getUnitAllocation(floor.id, unitType.id),
                                                      0
                                                    ))}
                                                  </td>
                                                  <td className="py-2 px-3 text-right font-medium">
                                                    {formatNumber(productUnitTypes.reduce(
                                                      (sum, unitType) => sum + (unitType.grossArea * getUnitAllocation(floor.id, unitType.id)),
                                                      0
                                                    ))}
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </div>
                                        </CollapsibleContent>
                                      </Collapsible>
                                    );
                                  })}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
      
      {floors.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Total Building Area</div>
                <div className="text-2xl font-semibold">{formatNumber(totalArea)} sf</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Total Units</div>
                <div className="text-2xl font-semibold">{formatNumber(totalUnits)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Unit Types</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {Array.from(totalUnitsByType.entries()).map(([unitTypeId, count]) => {
                    const unitType = findUnitTypeById(unitTypeId);
                    if (!unitType) return null;
                    
                    return (
                      <div key={unitTypeId} className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                        {unitType.unitType}: {count}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {selectedFloorForDuplicate && (
        <FloorDuplicateModal
          isOpen={duplicateModalOpen}
          onClose={() => setDuplicateModalOpen(false)}
          onDuplicate={handleDuplicateFloor}
          sourceFloor={selectedFloorForDuplicate}
          isSubmitting={isDuplicating}
        />
      )}
      
      {selectedFloorForRange && (
        <ApplyFloorToRangeModal
          isOpen={applyToRangeModalOpen}
          onClose={() => setApplyToRangeModalOpen(false)}
          floorPosition={selectedFloorForRange.position}
          floorCount={floors.length}
          onApply={(start, end) => {
            console.log(`Apply floor ${selectedFloorForRange.id} to range: ${start}-${end}`);
            setApplyToRangeModalOpen(false);
          }}
        />
      )}
      
      {selectedFloorForTemplate && (
        <SaveAsTemplateModal
          isOpen={saveTemplateModalOpen}
          onClose={() => setSaveTemplateModalOpen(false)}
          floor={selectedFloorForTemplate}
          getFloorTemplate={getFloorTemplateById}
          projectId={projectId}
          getUnitAllocation={getUnitAllocation}
          products={products}
        />
      )}
      
      <BulkAddFloorsModal
        isOpen={bulkAddModalOpen}
        onClose={() => setBulkAddModalOpen(false)}
        templates={templates}
        floorCount={floors.length}
        onAddFloors={(count, startPosition, startLabel, templateId) => {
          console.log(`Add ${count} floors starting at position ${startPosition} with template ${templateId}`);
          setBulkAddModalOpen(false);
        }}
      />
      
      <BulkApplyTemplateModal
        isOpen={bulkApplyTemplateModalOpen}
        onClose={() => setBulkApplyTemplateModalOpen(false)}
        selectedFloors={Array.from(selectedFloorIds).map(id => 
          floors.find(f => f.id === id)
        ).filter(Boolean) as Floor[]}
        templates={templates}
        onApply={async (templateId, applyUnitAllocations) => {
          setIsSubmitting(true);
          
          try {
            let successCount = 0;
            
            for (const floorId of selectedFloorIds) {
              const templateSuccess = await onUpdateFloor(floorId, { templateId });
              
              if (templateSuccess && applyUnitAllocations) {
                for (const product of products) {
                  for (const unitType of product.unitTypes) {
                    const currentAllocation = getUnitAllocation(floorId, unitType.id);
                    if (currentAllocation > 0) {
                      await onUpdateUnitAllocation(floorId, unitType.id, 0);
                    }
                  }
                }
                
                successCount++;
              } else if (templateSuccess) {
                successCount++;
              }
            }
            
            if (successCount > 0) {
              const action = applyUnitAllocations ? "template and default allocations" : "template";
              toast.success(`Applied ${action} to ${successCount} floor${successCount !== 1 ? 's' : ''}`);
            }
          } catch (error) {
            console.error("Error applying template:", error);
            toast.error("Failed to apply template to some floors");
          } finally {
            setIsSubmitting(false);
            setBulkApplyTemplateModalOpen(false);
          }
        }}
      />
    </div>
  );
};

export default BuildingLayout;
