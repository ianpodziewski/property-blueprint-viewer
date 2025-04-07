
import { useState } from "react";

export const useDispositionState = () => {
  // Exit Strategy
  const [exitStrategy, setExitStrategy] = useState<string>("sale");
  const [exitPeriodType, setExitPeriodType] = useState<string>("year");
  const [exitPeriod, setExitPeriod] = useState<string>("");
  const [exitCapRate, setExitCapRate] = useState<string>("");
  const [salesCostsPercentage, setSalesCostsPercentage] = useState<string>("");
  const [expectedSalePrice, setExpectedSalePrice] = useState<string>("");
  
  // Refinance Scenario
  const [refinanceYear, setRefinanceYear] = useState<string>("");
  const [refinanceLoanToValue, setRefinanceLoanToValue] = useState<string>("");
  const [refinanceInterestRate, setRefinanceInterestRate] = useState<string>("");
  const [refinanceAmortizationYears, setRefinanceAmortizationYears] = useState<string>("");
  const [refinanceTermYears, setRefinanceTermYears] = useState<string>("");
  const [refinanceCostsPercentage, setRefinanceCostsPercentage] = useState<string>("");
  
  // Tax Implications
  const [capitalGainsTaxRate, setCapitalGainsTaxRate] = useState<string>("");
  const [depreciationRecaptureRate, setDepreciationRecaptureRate] = useState<string>("");
  const [costBasis, setCostBasis] = useState<string>("");
  const [accumulatedDepreciation, setAccumulatedDepreciation] = useState<string>("");
  const [taxPlanningNotes, setTaxPlanningNotes] = useState<string>("");
  
  // Returns Analysis (read-only calculated fields)
  const [projectIrr, setProjectIrr] = useState<string>("");
  const [equityIrr, setEquityIrr] = useState<string>("");
  const [equityMultiple, setEquityMultiple] = useState<string>("");
  const [netPresentValue, setNetPresentValue] = useState<string>("");
  const [cashOnCash, setCashOnCash] = useState<string>("");
  const [paybackPeriod, setPaybackPeriod] = useState<string>("");
  
  return {
    // Exit Strategy
    exitStrategy, setExitStrategy,
    exitPeriodType, setExitPeriodType,
    exitPeriod, setExitPeriod,
    exitCapRate, setExitCapRate,
    salesCostsPercentage, setSalesCostsPercentage,
    expectedSalePrice, setExpectedSalePrice,
    
    // Refinance Scenario
    refinanceYear, setRefinanceYear,
    refinanceLoanToValue, setRefinanceLoanToValue,
    refinanceInterestRate, setRefinanceInterestRate,
    refinanceAmortizationYears, setRefinanceAmortizationYears,
    refinanceTermYears, setRefinanceTermYears,
    refinanceCostsPercentage, setRefinanceCostsPercentage,
    
    // Tax Implications
    capitalGainsTaxRate, setCapitalGainsTaxRate,
    depreciationRecaptureRate, setDepreciationRecaptureRate,
    costBasis, setCostBasis,
    accumulatedDepreciation, setAccumulatedDepreciation,
    taxPlanningNotes, setTaxPlanningNotes,
    
    // Returns Analysis
    projectIrr, setProjectIrr,
    equityIrr, setEquityIrr,
    equityMultiple, setEquityMultiple,
    netPresentValue, setNetPresentValue,
    cashOnCash, setCashOnCash,
    paybackPeriod, setPaybackPeriod
  };
};
