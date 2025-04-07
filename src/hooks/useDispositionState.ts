
import { useState, useCallback } from "react";

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
  
  // Input handlers
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, setter: (value: string) => void) => {
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
  
  const handleExitStrategyChange = (value: string) => {
    setExitStrategy(value);
  };
  
  // Reset all data
  const resetAllData = useCallback(() => {
    // Exit Strategy
    setExitStrategy("sale");
    setExitPeriodType("year");
    setExitPeriod("");
    setExitCapRate("");
    setSalesCostsPercentage("");
    setExpectedSalePrice("");
    
    // Refinance Scenario
    setRefinanceYear("");
    setRefinanceLoanToValue("");
    setRefinanceInterestRate("");
    setRefinanceAmortizationYears("");
    setRefinanceTermYears("");
    setRefinanceCostsPercentage("");
    
    // Tax Implications
    setCapitalGainsTaxRate("");
    setDepreciationRecaptureRate("");
    setCostBasis("");
    setAccumulatedDepreciation("");
    setTaxPlanningNotes("");
    
    // Returns Analysis (read-only calculated fields)
    setProjectIrr("");
    setEquityIrr("");
    setEquityMultiple("");
    setNetPresentValue("");
    setCashOnCash("");
    setPaybackPeriod("");
  }, []);
  
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
    paybackPeriod, setPaybackPeriod,
    
    // Event handlers
    handleTextChange,
    handleNumberChange,
    handlePercentageChange,
    handleSelectChange,
    handleExitStrategyChange,
    
    // Data persistence
    resetAllData
  };
};
