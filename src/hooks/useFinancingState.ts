
import { useState, useEffect } from "react";

// Helper to safely parse stored values
const getSavedValue = (key: string, defaultValue: string): string => {
  try {
    const savedModel = localStorage.getItem('realEstateModel');
    if (savedModel) {
      const parsedModel = JSON.parse(savedModel);
      if (parsedModel.financing && parsedModel.financing[key] !== undefined) {
        return parsedModel.financing[key];
      }
    }
  } catch (error) {
    console.error(`Error retrieving saved value for ${key}:`, error);
  }
  return defaultValue;
};

export const useFinancingState = () => {
  // Capital Stack with initial values from localStorage if available
  const [totalProjectCost, setTotalProjectCost] = useState<string>(getSavedValue('totalProjectCost', ""));
  const [debtAmount, setDebtAmount] = useState<string>(getSavedValue('debtAmount', ""));
  const [equityAmount, setEquityAmount] = useState<string>(getSavedValue('equityAmount', ""));
  const [loanToCost, setLoanToCost] = useState<string>(getSavedValue('loanToCost', ""));
  const [loanToValue, setLoanToValue] = useState<string>(getSavedValue('loanToValue', ""));
  const [dscr, setDscr] = useState<string>(getSavedValue('dscr', ""));
  
  // Construction Loan
  const [constructionLoanAmount, setConstructionLoanAmount] = useState<string>(getSavedValue('constructionLoanAmount', ""));
  const [constructionInterestRate, setConstructionInterestRate] = useState<string>(getSavedValue('constructionInterestRate', ""));
  const [constructionTerm, setConstructionTerm] = useState<string>(getSavedValue('constructionTerm', ""));
  const [constructionLoanFees, setConstructionLoanFees] = useState<string>(getSavedValue('constructionLoanFees', ""));
  const [constructionDrawdownSchedule, setConstructionDrawdownSchedule] = useState<string>(getSavedValue('constructionDrawdownSchedule', ""));
  const [constructionInterestReserve, setConstructionInterestReserve] = useState<string>(getSavedValue('constructionInterestReserve', ""));
  const [constructionRecourse, setConstructionRecourse] = useState<string>(getSavedValue('constructionRecourse', ""));
  
  // Permanent Loan
  const [permanentLoanAmount, setPermanentLoanAmount] = useState<string>(getSavedValue('permanentLoanAmount', ""));
  const [permanentInterestRate, setPermanentInterestRate] = useState<string>(getSavedValue('permanentInterestRate', ""));
  const [permanentTerm, setPermanentTerm] = useState<string>(getSavedValue('permanentTerm', ""));
  const [permanentAmortization, setPermanentAmortization] = useState<string>(getSavedValue('permanentAmortization', ""));
  const [permanentLoanFees, setPermanentLoanFees] = useState<string>(getSavedValue('permanentLoanFees', ""));
  
  // Equity Structure
  const [equityStructure, setEquityStructure] = useState<string>(getSavedValue('equityStructure', "simple"));
  const [promoterEquity, setPromoterEquity] = useState<string>(getSavedValue('promoterEquity', ""));
  const [investorEquity, setInvestorEquity] = useState<string>(getSavedValue('investorEquity', ""));
  const [preferredReturn, setPreferredReturn] = useState<string>(getSavedValue('preferredReturn', ""));
  
  // Debug log when values change
  useEffect(() => {
    console.log("Financing state values updated:", {
      totalProjectCost, debtAmount, equityAmount, loanToCost, loanToValue, dscr,
      constructionLoanAmount, constructionInterestRate, constructionTerm,
      permanentLoanAmount, permanentInterestRate, permanentTerm,
      equityStructure, promoterEquity, investorEquity
    });
  }, [
    totalProjectCost, debtAmount, equityAmount, loanToCost, loanToValue, dscr,
    constructionLoanAmount, constructionInterestRate, constructionTerm,
    permanentLoanAmount, permanentInterestRate, permanentTerm,
    equityStructure, promoterEquity, investorEquity
  ]);

  return {
    // Capital Stack
    totalProjectCost, setTotalProjectCost,
    debtAmount, setDebtAmount,
    equityAmount, setEquityAmount,
    loanToCost, setLoanToCost,
    loanToValue, setLoanToValue,
    dscr, setDscr,
    
    // Construction Loan
    constructionLoanAmount, setConstructionLoanAmount,
    constructionInterestRate, setConstructionInterestRate,
    constructionTerm, setConstructionTerm,
    constructionLoanFees, setConstructionLoanFees,
    constructionDrawdownSchedule, setConstructionDrawdownSchedule,
    constructionInterestReserve, setConstructionInterestReserve,
    constructionRecourse, setConstructionRecourse,
    
    // Permanent Loan
    permanentLoanAmount, setPermanentLoanAmount,
    permanentInterestRate, setPermanentInterestRate,
    permanentTerm, setPermanentTerm,
    permanentAmortization, setPermanentAmortization,
    permanentLoanFees, setPermanentLoanFees,
    
    // Equity Structure
    equityStructure, setEquityStructure,
    promoterEquity, setPromoterEquity,
    investorEquity, setInvestorEquity,
    preferredReturn, setPreferredReturn
  };
};
