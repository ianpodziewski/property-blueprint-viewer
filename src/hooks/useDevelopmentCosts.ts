import { useState, useEffect } from "react";
import { useProject } from "@/context/ProjectContext";
import { supabase } from "@/integrations/supabase/client";
import { usePropertyState } from "@/hooks/usePropertyState";
import { toast } from "sonner";

interface CustomCost {
  id: string;
  name: string;
  amount: string;
  metric: string;
}

export type CalculationMethod = "area_based" | "unit_based" | "custom";
export type PropertyType = string;

export interface HardCost {
  id: string;
  projectId: string;
  propertyType: PropertyType;
  costCategory: string;
  calculationMethod: CalculationMethod;
  rate: number | null;
  total: number | null;
  notes?: string;
}

// Define the hard cost database row structure
interface HardCostRow {
  id: string;
  project_id: string;
  property_type: string;
  cost_category: string;
  calculation_method: string;
  rate: number | null;
  total: number | null;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useDevelopmentCosts = () => {
  const { currentProjectId } = useProject();
  const { products, floorPlateTemplates, floors, nonRentableTypes } = usePropertyState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Land Costs
  const [purchasePrice, setPurchasePrice] = useState<string>("");
  const [purchasePriceMetric, setPurchasePriceMetric] = useState<string>("psf");
  const [closingCosts, setClosingCosts] = useState<string>("");
  const [closingCostsMetric, setClosingCostsMetric] = useState<string>("psf");
  const [landCustomCosts, setLandCustomCosts] = useState<CustomCost[]>([
    { id: "land-cost-1", name: "", amount: "", metric: "psf" }
  ]);
  
  // Hard Costs
  const [hardCosts, setHardCosts] = useState<HardCost[]>([]);
  const [shellCost, setShellCost] = useState<string>("");
  const [shellCostMetric, setShellCostMetric] = useState<string>("psf");
  const [tenantImprovementCost, setTenantImprovementCost] = useState<string>("");
  const [tenantImprovementMetric, setTenantImprovementMetric] = useState<string>("psf");
  const [sustainabilityCosts, setSustainabilityCosts] = useState<string>("");
  const [sustainabilityMetric, setSustainabilityMetric] = useState<string>("psf");
  const [leedCertificationCost, setLeedCertificationCost] = useState<string>("");
  const [solarPanelsCost, setSolarPanelsCost] = useState<string>("");
  const [siteWorkCost, setSiteWorkCost] = useState<string>("");
  const [contingencyPercentage, setContingencyPercentage] = useState<string>("");
  const [hardCustomCosts, setHardCustomCosts] = useState<CustomCost[]>([
    { id: "hard-cost-1", name: "", amount: "", metric: "psf" }
  ]);
  
  // Soft Costs and Other Costs variables
  const [architectureCost, setArchitectureCost] = useState<string>("");
  const [permitFees, setPermitFees] = useState<string>("");
  const [legalFees, setLegalFees] = useState<string>("");
  const [marketingCost, setMarketingCost] = useState<string>("");
  const [developerFee, setDeveloperFee] = useState<string>("");
  const [constructionPropertyTaxes, setConstructionPropertyTaxes] = useState<string>("");
  const [softCustomCosts, setSoftCustomCosts] = useState<CustomCost[]>([
    { id: "soft-cost-1", name: "", amount: "", metric: "psf" }
  ]);
  
  const [financingFees, setFinancingFees] = useState<string>("");
  const [interestReserve, setInterestReserve] = useState<string>("");
  const [otherCustomCosts, setOtherCustomCosts] = useState<CustomCost[]>([
    { id: "other-cost-1", name: "", amount: "", metric: "psf" }
  ]);

  // Store available property types from unit_types table
  const [availablePropertyTypes, setAvailablePropertyTypes] = useState<string[]>([]);

  // Calculate property areas for various property types
  const [propertyAreas, setPropertyAreas] = useState<Record<string, number>>({});
  const [propertyUnits, setPropertyUnits] = useState<Record<string, number>>({});
  
  // Fetch unique categories from unit_types table to use as property types
  useEffect(() => {
    if (!currentProjectId) return;
    
    const fetchPropertyTypes = async () => {
      try {
        // Query the unit_types table to get unique categories
        const { data, error } = await supabase
          .from('unit_types')
          .select('category')
          .eq('project_id', currentProjectId)
          .order('category');
          
        if (error) throw error;
        
        // Extract unique categories
        const categories = Array.from(new Set(data.map(item => item.category)));
        
        // Always include "common" for shared spaces
        if (!categories.includes("common")) {
          categories.push("common");
        }
        
        setAvailablePropertyTypes(categories);
      } catch (err) {
        console.error("Error fetching property types:", err);
        setError("Failed to load property types");
      }
    };
    
    fetchPropertyTypes();
  }, [currentProjectId]);
  
  // Fetch unit types and calculate areas for each property type
  useEffect(() => {
    if (!currentProjectId) return;
    
    const fetchUnitTypes = async () => {
      try {
        const { data, error } = await supabase
          .from('unit_types')
          .select('*')
          .eq('project_id', currentProjectId);
          
        if (error) throw error;
        
        const areas: Record<string, number> = {};
        const units: Record<string, number> = {};
        
        // Initialize with available property types
        availablePropertyTypes.forEach(type => {
          areas[type] = 0;
          units[type] = 0;
        });
        
        // Calculate areas and units for each unit type based on its category
        if (data) {
          data.forEach(unitType => {
            const category = unitType.category.toLowerCase();
            if (areas[category] !== undefined) {
              areas[category] += unitType.area * unitType.units;
              units[category] += unitType.units;
            }
          });
        }
        
        // Calculate common areas (estimate as percentage of total building area)
        let totalBuildingArea = 0;
        for (const floor of floors) {
          const template = floorPlateTemplates.find(t => t.id === floor.templateId);
          if (template) {
            totalBuildingArea += template.grossArea;
          }
        }
        
        // Common areas are roughly 15% of total building area
        areas.common = totalBuildingArea * 0.15;
        
        setPropertyAreas(areas);
        setPropertyUnits(units);
      } catch (err) {
        console.error("Error fetching unit types:", err);
      }
    };
    
    if (availablePropertyTypes.length > 0) {
      fetchUnitTypes();
    }
  }, [currentProjectId, availablePropertyTypes, floorPlateTemplates, floors]);

  // Fetch hard costs from database
  useEffect(() => {
    if (!currentProjectId) return;
    
    const fetchHardCosts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('hard_costs')
          .select('*')
          .eq('project_id', currentProjectId);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          const formattedData: HardCost[] = (data as HardCostRow[]).map(item => ({
            id: item.id,
            projectId: item.project_id,
            propertyType: item.property_type,
            costCategory: item.cost_category,
            calculationMethod: item.calculation_method as CalculationMethod,
            rate: item.rate,
            total: item.total,
            notes: item.notes
          }));
          
          setHardCosts(formattedData);
        } else {
          // Initialize with default hard costs for each property type once we have availablePropertyTypes
          const defaultCosts: HardCost[] = [];
          
          availablePropertyTypes.forEach(type => {
            defaultCosts.push({
              id: crypto.randomUUID(),
              projectId: currentProjectId,
              propertyType: type,
              costCategory: "shell",
              calculationMethod: "area_based",
              rate: null,
              total: null
            });
            
            defaultCosts.push({
              id: crypto.randomUUID(),
              projectId: currentProjectId,
              propertyType: type,
              costCategory: "ti",
              calculationMethod: "area_based",
              rate: null,
              total: null
            });
          });
          
          setHardCosts(defaultCosts);
          
          // Save these default costs to the database
          defaultCosts.forEach(cost => {
            saveHardCost(cost);
          });
        }
      } catch (err) {
        console.error("Error fetching hard costs:", err);
        setError("Failed to load hard costs");
      } finally {
        setLoading(false);
      }
    };
    
    if (availablePropertyTypes.length > 0) {
      fetchHardCosts();
    }
  }, [currentProjectId, availablePropertyTypes]);

  // Calculate total for a hard cost based on calculation method
  const calculateHardCostTotal = (
    propertyType: PropertyType,
    rate: number | null,
    calculationMethod: CalculationMethod
  ): number | null => {
    if (rate === null) return null;
    
    switch (calculationMethod) {
      case "area_based":
        return rate * (propertyAreas[propertyType] || 0);
      case "unit_based":
        return rate * (propertyUnits[propertyType] || 0);
      case "custom":
        return rate; // For custom, we just use the rate as the total
      default:
        return null;
    }
  };

  // Save hard cost to database
  const saveHardCost = async (hardCost: HardCost) => {
    if (!currentProjectId) return;
    
    try {
      // Calculate total based on method and rate
      const calculatedTotal = hardCost.calculationMethod !== 'custom' && hardCost.rate !== null 
        ? calculateHardCostTotal(hardCost.propertyType, hardCost.rate, hardCost.calculationMethod)
        : hardCost.total;
      
      // Check if the hard cost already exists
      const existingIndex = hardCosts.findIndex(cost => cost.id === hardCost.id);
      
      if (existingIndex !== -1) {
        // Update existing hard cost
        const { error } = await supabase
          .from('hard_costs')
          .update({
            property_type: hardCost.propertyType,
            cost_category: hardCost.costCategory,
            calculation_method: hardCost.calculationMethod,
            rate: hardCost.rate,
            total: calculatedTotal,
            notes: hardCost.notes
          })
          .eq('id', hardCost.id);
          
        if (error) throw error;
        
        // Update local state
        setHardCosts(prevCosts => 
          prevCosts.map(cost => 
            cost.id === hardCost.id ? { ...hardCost, total: calculatedTotal } : cost
          )
        );
      } else {
        // Insert new hard cost
        const { data, error } = await supabase
          .from('hard_costs')
          .insert({
            project_id: currentProjectId,
            property_type: hardCost.propertyType,
            cost_category: hardCost.costCategory,
            calculation_method: hardCost.calculationMethod,
            rate: hardCost.rate,
            total: calculatedTotal,
            notes: hardCost.notes
          })
          .select();
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Update local state with new ID from the database
          const newHardCost: HardCost = {
            ...hardCost,
            id: data[0].id,
            projectId: data[0].project_id,
            total: calculatedTotal
          };
          
          setHardCosts(prevCosts => [...prevCosts, newHardCost]);
        }
      }
    } catch (err) {
      console.error("Error saving hard cost:", err);
      toast.error("Failed to save hard cost");
    }
  };

  // Add a new hard cost
  const addHardCost = (propertyType: PropertyType, costCategory: string) => {
    const newHardCost: HardCost = {
      id: crypto.randomUUID(),
      projectId: currentProjectId || "",
      propertyType,
      costCategory,
      calculationMethod: "area_based",
      rate: null,
      total: null
    };
    
    setHardCosts(prevCosts => [...prevCosts, newHardCost]);
    saveHardCost(newHardCost);
    return newHardCost;
  };

  // Update hard cost
  const updateHardCost = (id: string, updates: Partial<Omit<HardCost, 'id' | 'projectId'>>) => {
    const existingCost = hardCosts.find(cost => cost.id === id);
    if (!existingCost) return;
    
    // Calculate new total if rate or calculation method changes
    let newTotal = existingCost.total;
    
    if ('rate' in updates || 'calculationMethod' in updates) {
      const rate = 'rate' in updates ? updates.rate : existingCost.rate;
      const method = 'calculationMethod' in updates 
        ? updates.calculationMethod 
        : existingCost.calculationMethod;
        
      if (method !== 'custom' && rate !== null) {
        newTotal = calculateHardCostTotal(
          existingCost.propertyType, 
          rate, 
          method as CalculationMethod
        );
      }
    }
    
    const updatedCost = { 
      ...existingCost, 
      ...updates,
      total: ('calculationMethod' in updates && updates.calculationMethod === 'custom') 
        ? ('total' in updates ? updates.total : existingCost.total) 
        : newTotal
    };
    
    setHardCosts(prevCosts => 
      prevCosts.map(cost => 
        cost.id === id ? updatedCost : cost
      )
    );
    
    // Save to database
    saveHardCost(updatedCost);
  };

  // Delete hard cost
  const deleteHardCost = async (id: string) => {
    if (!currentProjectId) return;
    
    try {
      const { error } = await supabase
        .from('hard_costs')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setHardCosts(prevCosts => prevCosts.filter(cost => cost.id !== id));
    } catch (err) {
      console.error("Error deleting hard cost:", err);
      toast.error("Failed to delete hard cost");
    }
  };
  
  // Original code for custom costs
  const addCustomCost = (category: string) => {
    switch (category) {
      case "land":
        const landId = `land-cost-${landCustomCosts.length + 1}`;
        setLandCustomCosts([
          ...landCustomCosts,
          { id: landId, name: "", amount: "", metric: "psf" }
        ]);
        break;
      case "hard":
        const hardId = `hard-cost-${hardCustomCosts.length + 1}`;
        setHardCustomCosts([
          ...hardCustomCosts,
          { id: hardId, name: "", amount: "", metric: "psf" }
        ]);
        break;
      case "soft":
        const softId = `soft-cost-${softCustomCosts.length + 1}`;
        setSoftCustomCosts([
          ...softCustomCosts,
          { id: softId, name: "", amount: "", metric: "psf" }
        ]);
        break;
      case "other":
        const otherId = `other-cost-${otherCustomCosts.length + 1}`;
        setOtherCustomCosts([
          ...otherCustomCosts,
          { id: otherId, name: "", amount: "", metric: "psf" }
        ]);
        break;
    }
  };
  
  const updateCustomCost = (category: string, id: string, field: keyof CustomCost, value: string) => {
    switch (category) {
      case "land":
        setLandCustomCosts(
          landCustomCosts.map(cost => 
            cost.id === id ? { ...cost, [field]: value } : cost
          )
        );
        break;
      case "hard":
        setHardCustomCosts(
          hardCustomCosts.map(cost => 
            cost.id === id ? { ...cost, [field]: value } : cost
          )
        );
        break;
      case "soft":
        setSoftCustomCosts(
          softCustomCosts.map(cost => 
            cost.id === id ? { ...cost, [field]: value } : cost
          )
        );
        break;
      case "other":
        setOtherCustomCosts(
          otherCustomCosts.map(cost => 
            cost.id === id ? { ...cost, [field]: value } : cost
          )
        );
        break;
    }
  };
  
  const removeCustomCost = (category: string, id: string) => {
    switch (category) {
      case "land":
        if (landCustomCosts.length > 1) {
          setLandCustomCosts(landCustomCosts.filter(cost => cost.id !== id));
        }
        break;
      case "hard":
        if (hardCustomCosts.length > 1) {
          setHardCustomCosts(hardCustomCosts.filter(cost => cost.id !== id));
        }
        break;
      case "soft":
        if (softCustomCosts.length > 1) {
          setSoftCustomCosts(softCustomCosts.filter(cost => cost.id !== id));
        }
        break;
      case "other":
        if (otherCustomCosts.length > 1) {
          setOtherCustomCosts(otherCustomCosts.filter(cost => cost.id !== id));
        }
        break;
    }
  };
  
  // Get hard costs for a specific property type
  const getHardCostsByPropertyType = (propertyType: PropertyType) => {
    return hardCosts.filter(cost => cost.propertyType === propertyType);
  };
  
  // Calculate subtotal for a property type
  const calculatePropertyTypeSubtotal = (propertyType: PropertyType) => {
    const costs = getHardCostsByPropertyType(propertyType);
    return costs.reduce((sum, cost) => sum + (cost.total || 0), 0);
  };
  
  // Calculate total hard costs across all property types
  const calculateTotalHardCosts = () => {
    return hardCosts.reduce((sum, cost) => sum + (cost.total || 0), 0);
  };
  
  // Calculate cost per gross SF
  const calculateCostPerGrossSF = () => {
    const totalHardCost = calculateTotalHardCosts();
    const totalArea = Object.values(propertyAreas).reduce((sum, area) => sum + area, 0);
    
    return totalArea > 0 ? totalHardCost / totalArea : 0;
  };
  
  // Calculate percentage breakdown by shell vs TI
  const calculateShellVsTI = () => {
    const shellCosts = hardCosts
      .filter(cost => cost.costCategory.toLowerCase() === 'shell')
      .reduce((sum, cost) => sum + (cost.total || 0), 0);
      
    const tiCosts = hardCosts
      .filter(cost => cost.costCategory.toLowerCase() === 'ti')
      .reduce((sum, cost) => sum + (cost.total || 0), 0);
      
    const totalHardCost = calculateTotalHardCosts();
    
    return {
      shell: totalHardCost > 0 ? (shellCosts / totalHardCost) * 100 : 0,
      ti: totalHardCost > 0 ? (tiCosts / totalHardCost) * 100 : 0,
      other: totalHardCost > 0 ? 
        ((totalHardCost - shellCosts - tiCosts) / totalHardCost) * 100 : 0
    };
  };
  
  // Calculate percentage breakdown by property type
  const calculatePropertyTypeBreakdown = () => {
    const totalHardCost = calculateTotalHardCosts();
    const result: Record<string, number> = {};
    
    // Initialize with 0 for all available property types
    availablePropertyTypes.forEach(type => {
      result[type] = 0;
    });
    
    if (totalHardCost > 0) {
      availablePropertyTypes.forEach(type => {
        const subtotal = calculatePropertyTypeSubtotal(type);
        result[type] = (subtotal / totalHardCost) * 100;
      });
    }
    
    return result;
  };
  
  return {
    // Land Costs
    purchasePrice, setPurchasePrice,
    purchasePriceMetric, setPurchasePriceMetric,
    closingCosts, setClosingCosts,
    closingCostsMetric, setClosingCostsMetric,
    landCustomCosts,
    
    // Hard Costs
    hardCosts,
    shellCost, setShellCost,
    shellCostMetric, setShellCostMetric,
    tenantImprovementCost, setTenantImprovementCost,
    tenantImprovementMetric, setTenantImprovementMetric,
    sustainabilityCosts, setSustainabilityCosts,
    sustainabilityMetric, setSustainabilityMetric,
    leedCertificationCost, setLeedCertificationCost,
    solarPanelsCost, setSolarPanelsCost,
    siteWorkCost, setSiteWorkCost,
    contingencyPercentage, setContingencyPercentage,
    hardCustomCosts,
    
    // New Hard Costs functionality
    addHardCost,
    updateHardCost,
    deleteHardCost,
    getHardCostsByPropertyType,
    calculatePropertyTypeSubtotal,
    calculateTotalHardCosts,
    calculateCostPerGrossSF,
    calculateShellVsTI,
    calculatePropertyTypeBreakdown,
    propertyAreas,
    propertyUnits,
    availablePropertyTypes,
    
    // Soft Costs
    architectureCost, setArchitectureCost,
    permitFees, setPermitFees,
    legalFees, setLegalFees,
    marketingCost, setMarketingCost,
    developerFee, setDeveloperFee,
    constructionPropertyTaxes, setConstructionPropertyTaxes,
    softCustomCosts,
    
    // Other Costs
    financingFees, setFinancingFees,
    interestReserve, setInterestReserve,
    otherCustomCosts,
    
    // Functions
    addCustomCost,
    updateCustomCost,
    removeCustomCost,
    
    // Status
    loading,
    error
  };
};
