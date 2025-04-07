import { useState, useCallback } from "react";

interface CustomCost {
  id: string;
  name: string;
  amount: string;
  metric: string;
}

export const useDevelopmentCosts = () => {
  // Land Costs
  const [purchasePrice, setPurchasePrice] = useState<string>("");
  const [purchasePriceMetric, setPurchasePriceMetric] = useState<string>("psf");
  const [closingCosts, setClosingCosts] = useState<string>("");
  const [closingCostsMetric, setClosingCostsMetric] = useState<string>("psf");
  const [landCustomCosts, setLandCustomCosts] = useState<CustomCost[]>([
    { id: "land-cost-1", name: "", amount: "", metric: "psf" }
  ]);
  
  // Hard Costs
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
  
  // Input handlers
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (value: string) => void) => {
    setter(e.target.value);
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (value: string) => void) => {
    const value = e.target.value;
    if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
      setter(value);
    }
  };
  
  const handleSelectChange = (value: string, setter: (value: string) => void) => {
    setter(value);
  };
  
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
    if (field === "amount" && value !== "") {
      const numValue = Number(value);
      if (isNaN(numValue) || numValue < 0) return;
    }
    
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

  const resetAllData = useCallback(() => {
    setPurchasePrice("");
    setPurchasePriceMetric("psf");
    setClosingCosts("");
    setClosingCostsMetric("psf");
    setLandCustomCosts([{ id: "land-cost-1", name: "", amount: "", metric: "psf" }]);
    
    setShellCost("");
    setShellCostMetric("psf");
    setTenantImprovementCost("");
    setTenantImprovementMetric("psf");
    setSustainabilityCosts("");
    setSustainabilityMetric("psf");
    setLeedCertificationCost("");
    setSolarPanelsCost("");
    setSiteWorkCost("");
    setContingencyPercentage("");
    setHardCustomCosts([{ id: "hard-cost-1", name: "", amount: "", metric: "psf" }]);
    
    setArchitectureCost("");
    setPermitFees("");
    setLegalFees("");
    setMarketingCost("");
    setDeveloperFee("");
    setConstructionPropertyTaxes("");
    setSoftCustomCosts([{ id: "soft-cost-1", name: "", amount: "", metric: "psf" }]);
    
    setFinancingFees("");
    setInterestReserve("");
    setOtherCustomCosts([{ id: "other-cost-1", name: "", amount: "", metric: "psf" }]);
  }, []);

  return {
    // Land Costs
    purchasePrice, setPurchasePrice,
    purchasePriceMetric, setPurchasePriceMetric,
    closingCosts, setClosingCosts,
    closingCostsMetric, setClosingCostsMetric,
    landCustomCosts,
    
    // Hard Costs
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
    resetAllData,
    
    // Event handlers
    handleTextChange,
    handleNumberChange,
    handleSelectChange
  };
};
