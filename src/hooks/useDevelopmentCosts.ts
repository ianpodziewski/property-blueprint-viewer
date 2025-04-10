
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
export type PropertyType = "apartments" | "retail" | "r&d" | "common";

export interface HardCost {
  id: string;
  projectId: string;
  propertyType: PropertyType;
  costCategory: string;
  calculationMethod: CalculationMethod;
  rate: number | null;
  total: number | null;
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
  created_at: string;
  updated_at: string;
}

export const useDevelopmentCosts = () => {
  const { currentProjectId } = useProject();
  const { products } = usePropertyState();
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
  
  // Soft Costs
  const [architectureCost, setArchitectureCost] = useState<string>("");
  const [permitFees, setPermitFees] = useState<string>("");
  const [legalFees, setLegalFees] = useState<string>("");
  const [marketingCost, setMarketingCost] = useState<string>("");
  const [developerFee, setDeveloperFee] = useState<string>("");
  const [constructionPropertyTaxes, setConstructionPropertyTaxes] = useState<string>("");
  const [softCustomCosts, setSoftCustomCosts] = useState<CustomCost[]>([
    { id: "soft-cost-1", name: "", amount: "", metric: "psf" }
  ]);
  
  // Other Costs
  const [financingFees, setFinancingFees] = useState<string>("");
  const [interestReserve, setInterestReserve] = useState<string>("");
  const [otherCustomCosts, setOtherCustomCosts] = useState<CustomCost[]>([
    { id: "other-cost-1", name: "", amount: "", metric: "psf" }
  ]);

  // Fetch hard costs from database
  useEffect(() => {
    if (!currentProjectId) return;
    
    const fetchHardCosts = async () => {
      setLoading(true);
      try {
        // Use any type to bypass the TypeScript error until types are updated
        const { data, error } = await supabase
          .from('hard_costs')
          .select('*')
          .eq('project_id', currentProjectId);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          const formattedData: HardCost[] = (data as HardCostRow[]).map(item => ({
            id: item.id,
            projectId: item.project_id,
            propertyType: item.property_type as PropertyType,
            costCategory: item.cost_category,
            calculationMethod: item.calculation_method as CalculationMethod,
            rate: item.rate,
            total: item.total
          }));
          
          setHardCosts(formattedData);
        } else {
          // Initialize with default hard costs for each property type
          const defaultCosts: HardCost[] = [];
          
          // Add default shell and TI costs for each property type
          const propertyTypes: PropertyType[] = ["apartments", "retail", "r&d", "common"];
          propertyTypes.forEach(type => {
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
        }
      } catch (err) {
        console.error("Error fetching hard costs:", err);
        setError("Failed to load hard costs");
      } finally {
        setLoading(false);
      }
    };
    
    fetchHardCosts();
  }, [currentProjectId]);

  // Save hard cost to database
  const saveHardCost = async (hardCost: HardCost) => {
    if (!currentProjectId) return;
    
    try {
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
            total: hardCost.total
          })
          .eq('id', hardCost.id);
          
        if (error) throw error;
        
        // Update local state
        setHardCosts(prevCosts => 
          prevCosts.map(cost => 
            cost.id === hardCost.id ? hardCost : cost
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
            total: hardCost.total
          })
          .select();
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Update local state with new ID from the database
          const newHardCost: HardCost = {
            ...hardCost,
            id: data[0].id,
            projectId: data[0].project_id
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
    return newHardCost;
  };

  // Update hard cost
  const updateHardCost = (id: string, updates: Partial<Omit<HardCost, 'id' | 'projectId'>>) => {
    setHardCosts(prevCosts => 
      prevCosts.map(cost => 
        cost.id === id 
          ? { ...cost, ...updates } 
          : cost
      )
    );
    
    // Find the updated cost to save
    const updatedCost = hardCosts.find(cost => cost.id === id);
    if (updatedCost) {
      saveHardCost({ ...updatedCost, ...updates });
    }
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
