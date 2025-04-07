
import { useState } from "react";

interface ConstructionPhase {
  id: string;
  name: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

interface CostCategory {
  id: string;
  name: string;
  startMonth: string;
  endMonth: string;
}

interface EquityMilestone {
  id: string;
  description: string;
  date: Date | undefined;
  percentage: string;
}

export const useDevelopmentTimeline = () => {
  // Project Schedule
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [completionDate, setCompletionDate] = useState<Date | undefined>(undefined);
  
  // Development Periods
  const [preDevelopmentPeriod, setPreDevelopmentPeriod] = useState<string>("");
  const [leaseUpPeriod, setLeaseUpPeriod] = useState<string>("");
  const [stabilizationPeriod, setStabilizationPeriod] = useState<string>("");
  
  // Construction Phases
  const [constructionPhases, setConstructionPhases] = useState<ConstructionPhase[]>([
    { id: "phase-1", name: "Phase 1", startDate: undefined, endDate: undefined }
  ]);
  
  // Cost Timing
  const [costCategories, setCostCategories] = useState<CostCategory[]>([
    { id: "cost-1", name: "Land Acquisition", startMonth: "", endMonth: "" },
    { id: "cost-2", name: "Hard Costs", startMonth: "", endMonth: "" },
    { id: "cost-3", name: "Soft Costs", startMonth: "", endMonth: "" }
  ]);
  
  // Equity Contribution Timing
  const [equityContributionType, setEquityContributionType] = useState<string>("upfront");
  const [equityMilestones, setEquityMilestones] = useState<EquityMilestone[]>([
    { id: "milestone-1", description: "Initial Investment", date: undefined, percentage: "25" }
  ]);
  
  const [phasedStartMonth, setPhasedStartMonth] = useState<string>("");
  const [phasedEndMonth, setPhasedEndMonth] = useState<string>("");
  const [distributionPattern, setDistributionPattern] = useState<string>("even");
  
  // Input handlers
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (value: string) => void) => {
    setter(e.target.value);
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (value: string) => void) => {
    const value = e.target.value;
    // Allow empty string or valid non-negative numbers
    if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
      setter(value);
    }
  };
  
  const handleSelectChange = (value: string, setter: (value: string) => void) => {
    setter(value);
  };
  
  const handleDateChange = (date: Date | undefined, setter: (date: Date | undefined) => void) => {
    setter(date);
  };
  
  const addConstructionPhase = () => {
    const newId = `phase-${constructionPhases.length + 1}`;
    setConstructionPhases([
      ...constructionPhases,
      { id: newId, name: `Phase ${constructionPhases.length + 1}`, startDate: undefined, endDate: undefined }
    ]);
  };
  
  const updateConstructionPhase = (id: string, field: keyof ConstructionPhase, value: any) => {
    setConstructionPhases(
      constructionPhases.map(phase => 
        phase.id === id ? { ...phase, [field]: value } : phase
      )
    );
  };
  
  const addCostCategory = () => {
    const newId = `cost-${costCategories.length + 1}`;
    setCostCategories([
      ...costCategories,
      { id: newId, name: "", startMonth: "", endMonth: "" }
    ]);
  };
  
  const updateCostCategory = (id: string, field: keyof CostCategory, value: string) => {
    // Validate number fields
    if ((field === "startMonth" || field === "endMonth") && value !== "") {
      const numValue = Number(value);
      if (isNaN(numValue) || numValue < 0) return;
    }
    
    setCostCategories(
      costCategories.map(category => 
        category.id === id ? { ...category, [field]: value } : category
      )
    );
  };
  
  const addEquityMilestone = () => {
    const newId = `milestone-${equityMilestones.length + 1}`;
    setEquityMilestones([
      ...equityMilestones,
      { id: newId, description: "", date: undefined, percentage: "" }
    ]);
  };
  
  const updateEquityMilestone = (id: string, field: keyof EquityMilestone, value: any) => {
    // Validate percentage field if being updated
    if (field === "percentage" && typeof value === "string" && value !== "") {
      const numValue = Number(value);
      if (isNaN(numValue) || numValue < 0 || numValue > 100) return;
    }
    
    setEquityMilestones(
      equityMilestones.map(milestone => 
        milestone.id === id ? { ...milestone, [field]: value } : milestone
      )
    );
  };
  
  return {
    // Project Schedule
    startDate, setStartDate,
    completionDate, setCompletionDate,
    
    // Development Periods
    preDevelopmentPeriod, setPreDevelopmentPeriod,
    leaseUpPeriod, setLeaseUpPeriod,
    stabilizationPeriod, setStabilizationPeriod,
    
    // Construction Phases
    constructionPhases,
    addConstructionPhase,
    updateConstructionPhase,
    
    // Cost Timing
    costCategories,
    addCostCategory,
    updateCostCategory,
    
    // Equity Contribution Timing
    equityContributionType, setEquityContributionType,
    equityMilestones,
    addEquityMilestone,
    updateEquityMilestone,
    
    // Phased Contribution
    phasedStartMonth, setPhasedStartMonth,
    phasedEndMonth, setPhasedEndMonth,
    distributionPattern, setDistributionPattern,
    
    // Event handlers
    handleTextChange,
    handleNumberChange,
    handleSelectChange,
    handleDateChange
  };
};
