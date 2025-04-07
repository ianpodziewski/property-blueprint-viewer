import { useState, useCallback } from "react";

interface ContributionScheduleItem {
  id: string;
  milestone: string;
  amount: string;
  percentage: string;
}

export const useFinancingState = () => {
  // Loan Type
  const [loanType, setLoanType] = useState<"construction" | "permanent" | "both">("both");
  
  // Capital Stack
  const [totalProjectCost, setTotalProjectCost] = useState<string>("");
  const [debtAmount, setDebtAmount] = useState<string>("");
  const [equityAmount, setEquityAmount] = useState<string>("");
  const [loanToCostRatio, setLoanToCostRatio] = useState<string>("");
  const [loanToValueRatio, setLoanToValueRatio] = useState<string>("");
  const [debtServiceCoverageRatio, setDebtServiceCoverageRatio] = useState<string>("");
  
  // Construction Loan
  const [constructionLoanAmount, setConstructionLoanAmount] = useState<string>("");
  const [constructionInterestRate, setConstructionInterestRate] = useState<string>("");
  const [constructionLoanTerm, setConstructionLoanTerm] = useState<string>("");
  const [constructionLoanFees, setConstructionLoanFees] = useState<string>("");
  const [constructionDrawdownSchedule, setConstructionDrawdownSchedule] = useState<string>("monthly");
  const [constructionInterestReserve, setConstructionInterestReserve] = useState<string>("");
  const [constructionRecourseType, setConstructionRecourseType] = useState<string>("full");
  
  // Permanent Loan
  const [permanentLoanAmount, setPermanentLoanAmount] = useState<string>("");
  const [permanentInterestRate, setPermanentInterestRate] = useState<string>("");
  const [amortizationYears, setAmortizationYears] = useState<string>("");
  const [permanentLoanTerm, setPermanentLoanTerm] = useState<string>("");
  const [permanentLoanFees, setPermanentLoanFees] = useState<string>("");
  const [prepaymentPenaltyType, setPrepaymentPenaltyType] = useState<string>("none");
  const [interestType, setInterestType] = useState<string>("fixed");
  const [minimumDscr, setMinimumDscr] = useState<string>("");
  
  // Additional Debt Terms
  const [debtServiceReserve, setDebtServiceReserve] = useState<string>("");
  const [reserveDurationMonths, setReserveDurationMonths] = useState<string>("");
  const [additionalCovenants, setAdditionalCovenants] = useState<string>("");
  
  // Equity Structure
  const [generalPartnerPercentage, setGeneralPartnerPercentage] = useState<string>("");
  const [limitedPartnerPercentage, setLimitedPartnerPercentage] = useState<string>("");
  
  // Preferred Return Structure
  const [preferredReturnRate, setPreferredReturnRate] = useState<string>("");
  const [preferredStructureType, setPreferredStructureType] = useState<string>("cumulative");
  const [gpCatchupPercentage, setGpCatchupPercentage] = useState<string>("");
  const [preferredPaymentFrequency, setPreferredPaymentFrequency] = useState<string>("quarterly");
  
  // Promote Structure
  const [tier1IrrThreshold, setTier1IrrThreshold] = useState<string>("");
  const [tier1LpPercentage, setTier1LpPercentage] = useState<string>("");
  const [tier1GpPercentage, setTier1GpPercentage] = useState<string>("");
  const [tier2IrrThreshold, setTier2IrrThreshold] = useState<string>("");
  const [tier2LpPercentage, setTier2LpPercentage] = useState<string>("");
  const [tier2GpPercentage, setTier2GpPercentage] = useState<string>("");
  const [tier3IrrThreshold] = useState<string>("∞"); // Fixed value
  const [tier3LpPercentage, setTier3LpPercentage] = useState<string>("");
  const [tier3GpPercentage, setTier3GpPercentage] = useState<string>("");
  
  // Equity Contribution Timing
  const [contributionMethod, setContributionMethod] = useState<string>("upfront");
  const [initialContributionPercentage, setInitialContributionPercentage] = useState<string>("");
  const [capitalCallNoticeDays, setCapitalCallNoticeDays] = useState<string>("");
  const [contributionSchedule, setContributionSchedule] = useState<ContributionScheduleItem[]>([
    { id: "contrib-1", milestone: "Closing", amount: "", percentage: "" },
    { id: "contrib-2", milestone: "Construction Start", amount: "", percentage: "" }
  ]);
  
  // Additional Equity Terms
  const [minimumInvestment, setMinimumInvestment] = useState<string>("");
  const [targetEquityMultiple, setTargetEquityMultiple] = useState<string>("");
  const [targetIrr, setTargetIrr] = useState<string>("");
  const [targetHoldPeriodYears, setTargetHoldPeriodYears] = useState<string>("");
  
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
  
  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (value: string) => void) {
    const value = e.target.value;
    // Allow empty string or valid percentages (0-100)
    if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0 && Number(value) <= 100)) {
      setter(value);
    }
  };
  
  const handleSelectChange = (value: string, setter: (value: string) => void) => {
    setter(value);
  };
  
  const handleLoanTypeChange = (value: "construction" | "permanent" | "both") => {
    setLoanType(value);
  };
  
  const addContributionScheduleItem = () => {
    const newId = `contrib-${contributionSchedule.length + 1}`;
    setContributionSchedule([
      ...contributionSchedule,
      { id: newId, milestone: "", amount: "", percentage: "" }
    ]);
  };
  
  const updateContributionScheduleItem = (id: string, field: keyof ContributionScheduleItem, value: string) => {
    // Validate number fields
    if ((field === "amount" || field === "percentage") && value !== "") {
      const numValue = Number(value);
      if (isNaN(numValue) || numValue < 0) return;
      
      // Extra validation for percentage
      if (field === "percentage" && numValue > 100) return;
    }
    
    setContributionSchedule(
      contributionSchedule.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };
  
  const removeContributionScheduleItem = (id: string) => {
    if (contributionSchedule.length > 1) {
      setContributionSchedule(contributionSchedule.filter(item => item.id !== id));
    }
  };
  
  const resetAllData = useCallback(() => {
    // Loan Type
    setLoanType("both");
    
    // Capital Stack
    setTotalProjectCost("");
    setDebtAmount("");
    setEquityAmount("");
    setLoanToCostRatio("");
    setLoanToValueRatio("");
    setDebtServiceCoverageRatio("");
    
    // Construction Loan
    setConstructionLoanAmount("");
    setConstructionInterestRate("");
    setConstructionLoanTerm("");
    setConstructionLoanFees("");
    setConstructionDrawdownSchedule("monthly");
    setConstructionInterestReserve("");
    setConstructionRecourseType("full");
    
    // Permanent Loan
    setPermanentLoanAmount("");
    setPermanentInterestRate("");
    setAmortizationYears("");
    setPermanentLoanTerm("");
    setPermanentLoanFees("");
    setPrepaymentPenaltyType("none");
    setInterestType("fixed");
    setMinimumDscr("");
    
    // Additional Debt Terms
    setDebtServiceReserve("");
    setReserveDurationMonths("");
    setAdditionalCovenants("");
    
    // Equity Structure
    setGeneralPartnerPercentage("");
    setLimitedPartnerPercentage("");
    
    // Preferred Return Structure
    setPreferredReturnRate("");
    setPreferredStructureType("cumulative");
    setGpCatchupPercentage("");
    setPreferredPaymentFrequency("quarterly");
    
    // Promote Structure
    setTier1IrrThreshold("");
    setTier1LpPercentage("");
    setTier1GpPercentage("");
    setTier2IrrThreshold("");
    setTier2LpPercentage("");
    setTier2GpPercentage("");
    setTier3LpPercentage("");
    setTier3GpPercentage("");
    
    // Equity Contribution Timing
    setContributionMethod("upfront");
    setInitialContributionPercentage("");
    setCapitalCallNoticeDays("");
    setContributionSchedule([
      { id: "contrib-1", milestone: "Closing", amount: "", percentage: "" },
      { id: "contrib-2", milestone: "Construction Start", amount: "", percentage: "" }
    ]);
    
    // Additional Equity Terms
    setMinimumInvestment("");
    setTargetEquityMultiple("");
    setTargetIrr("");
    setTargetHoldPeriodYears("");
  }, []);
  
  return {
    // Loan Type
    loanType, setLoanType,
    
    // Capital Stack
    totalProjectCost, setTotalProjectCost,
    debtAmount, setDebtAmount,
    equityAmount, setEquityAmount,
    loanToCostRatio, setLoanToCostRatio,
    loanToValueRatio, setLoanToValueRatio,
    debtServiceCoverageRatio, setDebtServiceCoverageRatio,
    
    // Construction Loan
    constructionLoanAmount, setConstructionLoanAmount,
    constructionInterestRate, setConstructionInterestRate,
    constructionLoanTerm, setConstructionLoanTerm,
    constructionLoanFees, setConstructionLoanFees,
    constructionDrawdownSchedule, setConstructionDrawdownSchedule,
    constructionInterestReserve, setConstructionInterestReserve,
    constructionRecourseType, setConstructionRecourseType,
    
    // Permanent Loan
    permanentLoanAmount, setPermanentLoanAmount,
    permanentInterestRate, setPermanentInterestRate,
    amortizationYears, setAmortizationYears,
    permanentLoanTerm, setPermanentLoanTerm,
    permanentLoanFees, setPermanentLoanFees,
    prepaymentPenaltyType, setPrepaymentPenaltyType,
    interestType, setInterestType,
    minimumDscr, setMinimumDscr,
    
    // Additional Debt Terms
    debtServiceReserve, setDebtServiceReserve,
    reserveDurationMonths, setReserveDurationMonths,
    additionalCovenants, setAdditionalCovenants,
    
    // Equity Structure
    generalPartnerPercentage, setGeneralPartnerPercentage,
    limitedPartnerPercentage, setLimitedPartnerPercentage,
    
    // Preferred Return Structure
    preferredReturnRate, setPreferredReturnRate,
    preferredStructureType, setPreferredStructureType,
    gpCatchupPercentage, setGpCatchupPercentage,
    preferredPaymentFrequency, setPreferredPaymentFrequency,
    
    // Promote Structure
    tier1IrrThreshold, setTier1IrrThreshold,
    tier1LpPercentage, setTier1LpPercentage,
    tier1GpPercentage, setTier1GpPercentage,
    tier2IrrThreshold, setTier2IrrThreshold,
    tier2LpPercentage, setTier2LpPercentage,
    tier2GpPercentage, setTier2GpPercentage,
    tier3IrrThreshold,
    tier3LpPercentage, setTier3LpPercentage,
    tier3GpPercentage, setTier3GpPercentage,
    
    // Equity Contribution Timing
    contributionMethod, setContributionMethod,
    initialContributionPercentage, setInitialContributionPercentage,
    capitalCallNoticeDays, setCapitalCallNoticeDays,
    contributionSchedule,
    addContributionScheduleItem,
    updateContributionScheduleItem,
    removeContributionScheduleItem,
    
    // Additional Equity Terms
    minimumInvestment, setMinimumInvestment,
    targetEquityMultiple, setTargetEquityMultiple,
    targetIrr, setTargetIrr,
    targetHoldPeriodYears, setTargetHoldPeriodYears,
    
    // Event handlers
    handleTextChange,
    handleNumberChange,
    handlePercentageChange,
    handleSelectChange,
    handleLoanTypeChange,
    
    // Data persistence
    resetAllData
  };
};
