
import { useState } from "react";

interface ResidentialUnit {
  id: string;
  type: string;
  count: string;
  rent: string;
  squareFootage: string;
}

export const useRevenueState = () => {
  // General Revenue Assumptions
  const [annualRevenueGrowthRate, setAnnualRevenueGrowthRate] = useState<string>("");
  const [stabilizedOccupancyRate, setStabilizedOccupancyRate] = useState<string>("");
  const [baseRent, setBaseRent] = useState<string>("");
  const [baseRentUnit, setBaseRentUnit] = useState<string>("psf");
  const [rentEscalationPercentage, setRentEscalationPercentage] = useState<string>("");
  const [vacancyRate, setVacancyRate] = useState<string>("");
  const [collectionLossPercentage, setCollectionLossPercentage] = useState<string>("");
  
  // Residential Income
  const [residentialUnits, setResidentialUnits] = useState<ResidentialUnit[]>([
    { id: "unit-1", type: "Studio", count: "", rent: "", squareFootage: "" },
    { id: "unit-2", type: "One Bedroom", count: "", rent: "", squareFootage: "" },
    { id: "unit-3", type: "Two Bedroom", count: "", rent: "", squareFootage: "" }
  ]);
  
  // Commercial Income
  const [commercialRentableArea, setCommercialRentableArea] = useState<string>("");
  const [commercialRentPerSqFt, setCommercialRentPerSqFt] = useState<string>("");
  const [commercialLeaseTermYears, setCommercialLeaseTermYears] = useState<string>("");
  
  // Lease-up Schedule
  const [residentialLeaseUpMonths, setResidentialLeaseUpMonths] = useState<string>("");
  const [commercialLeaseUpMonths, setCommercialLeaseUpMonths] = useState<string>("");
  const [leaseUpPattern, setLeaseUpPattern] = useState<string>("linear");
  
  // Lease Terms
  const [residentialLeaseLength, setResidentialLeaseLength] = useState<string>("12");
  const [commercialLeaseLength, setCommercialLeaseLength] = useState<string>("5");
  const [commercialLeaseType, setCommercialLeaseType] = useState<string>("triple-net");
  const [renewalProbability, setRenewalProbability] = useState<string>("70");
  
  // Seasonal Variations
  const [enableSeasonalVariations, setEnableSeasonalVariations] = useState<boolean>(false);
  const [peakSeasonMonths, setPeakSeasonMonths] = useState<string>("Jun-Aug");
  const [peakRentPremiumPercentage, setPeakRentPremiumPercentage] = useState<string>("");
  const [offPeakDiscountPercentage, setOffPeakDiscountPercentage] = useState<string>("");
  
  // Tenant Incentives
  const [freeRentResidentialMonths, setFreeRentResidentialMonths] = useState<string>("");
  const [freeRentCommercialMonths, setFreeRentCommercialMonths] = useState<string>("");
  const [tenantImprovementAllowance, setTenantImprovementAllowance] = useState<string>("");
  const [leasingCommissionPercentage, setLeasingCommissionPercentage] = useState<string>("");
  
  // Market-Driven Rent Adjustments
  const [enableMarketAdjustments, setEnableMarketAdjustments] = useState<boolean>(false);
  const [marketGrowthScenario, setMarketGrowthScenario] = useState<string>("base");
  const [marketRentDeltaPercentage, setMarketRentDeltaPercentage] = useState<string>("");
  const [marketRentAdjustmentTiming, setMarketRentAdjustmentTiming] = useState<string>("immediate");
  
  // Other Income
  const [parkingIncomePerYear, setParkingIncomePerYear] = useState<string>("");
  const [storageIncomePerYear, setStorageIncomePerYear] = useState<string>("");
  const [laundryIncomePerYear, setLaundryIncomePerYear] = useState<string>("");
  const [lateFeeIncomePerYear, setLateFeeIncomePerYear] = useState<string>("");
  const [amenityFeesPerYear, setAmenityFeesPerYear] = useState<string>("");
  const [retailPercentageRent, setRetailPercentageRent] = useState<string>("");
  
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
  
  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (value: string) => void) => {
    const value = e.target.value;
    // Allow empty string or valid percentages (0-100)
    if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0 && Number(value) <= 100)) {
      setter(value);
    }
  };
  
  const handleSelectChange = (value: string, setter: (value: string) => void) => {
    setter(value);
  };
  
  const handleBooleanChange = (value: boolean, setter: (value: boolean) => void) => {
    setter(value);
  };
  
  const updateResidentialUnit = (id: string, field: keyof ResidentialUnit, value: string) => {
    // Validate number fields
    if ((field === "count" || field === "rent" || field === "squareFootage") && value !== "") {
      const numValue = Number(value);
      if (isNaN(numValue) || numValue < 0) return;
    }
    
    setResidentialUnits(
      residentialUnits.map(unit => 
        unit.id === id ? { ...unit, [field]: value } : unit
      )
    );
  };
  
  const addResidentialUnit = () => {
    const newId = `unit-${residentialUnits.length + 1}`;
    setResidentialUnits([
      ...residentialUnits,
      { id: newId, type: "", count: "", rent: "", squareFootage: "" }
    ]);
  };
  
  const removeResidentialUnit = (id: string) => {
    if (residentialUnits.length > 1) {
      setResidentialUnits(residentialUnits.filter(unit => unit.id !== id));
    }
  };
  
  return {
    // General Revenue Assumptions
    annualRevenueGrowthRate, setAnnualRevenueGrowthRate,
    stabilizedOccupancyRate, setStabilizedOccupancyRate,
    baseRent, setBaseRent,
    baseRentUnit, setBaseRentUnit,
    rentEscalationPercentage, setRentEscalationPercentage,
    vacancyRate, setVacancyRate,
    collectionLossPercentage, setCollectionLossPercentage,
    
    // Residential Income
    residentialUnits,
    addResidentialUnit,
    removeResidentialUnit,
    updateResidentialUnit,
    
    // Commercial Income
    commercialRentableArea, setCommercialRentableArea,
    commercialRentPerSqFt, setCommercialRentPerSqFt,
    commercialLeaseTermYears, setCommercialLeaseTermYears,
    
    // Lease-up Schedule
    residentialLeaseUpMonths, setResidentialLeaseUpMonths,
    commercialLeaseUpMonths, setCommercialLeaseUpMonths,
    leaseUpPattern, setLeaseUpPattern,
    
    // Lease Terms
    residentialLeaseLength, setResidentialLeaseLength,
    commercialLeaseLength, setCommercialLeaseLength,
    commercialLeaseType, setCommercialLeaseType,
    renewalProbability, setRenewalProbability,
    
    // Seasonal Variations
    enableSeasonalVariations, setEnableSeasonalVariations,
    peakSeasonMonths, setPeakSeasonMonths,
    peakRentPremiumPercentage, setPeakRentPremiumPercentage,
    offPeakDiscountPercentage, setOffPeakDiscountPercentage,
    
    // Tenant Incentives
    freeRentResidentialMonths, setFreeRentResidentialMonths,
    freeRentCommercialMonths, setFreeRentCommercialMonths,
    tenantImprovementAllowance, setTenantImprovementAllowance,
    leasingCommissionPercentage, setLeasingCommissionPercentage,
    
    // Market-Driven Rent Adjustments
    enableMarketAdjustments, setEnableMarketAdjustments,
    marketGrowthScenario, setMarketGrowthScenario,
    marketRentDeltaPercentage, setMarketRentDeltaPercentage,
    marketRentAdjustmentTiming, setMarketRentAdjustmentTiming,
    
    // Other Income
    parkingIncomePerYear, setParkingIncomePerYear,
    storageIncomePerYear, setStorageIncomePerYear,
    laundryIncomePerYear, setLaundryIncomePerYear,
    lateFeeIncomePerYear, setLateFeeIncomePerYear,
    amenityFeesPerYear, setAmenityFeesPerYear,
    retailPercentageRent, setRetailPercentageRent,
    
    // Event handlers
    handleTextChange,
    handleNumberChange,
    handlePercentageChange,
    handleSelectChange,
    handleBooleanChange
  };
};
