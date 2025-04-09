
import { useState } from "react";

export const useFinancingState = () => {
  // Capital Stack
  const [totalProjectCost, setTotalProjectCost] = useState<string>("");
  const [debtAmount, setDebtAmount] = useState<string>("");
  const [equityAmount, setEquityAmount] = useState<string>("");
  const [loanToCost, setLoanToCost] = useState<string>("");
  const [loanToValue, setLoanToValue] = useState<string>("");
  const [dscr, setDscr] = useState<string>("");
  
  // Construction Loan
  const [constructionLoanAmount, setConstructionLoanAmount] = useState<string>("");
  const [constructionInterestRate, setConstructionInterestRate] = useState<string>("");
  const [constructionTerm, setConstructionTerm] = useState<string>("");
  const [constructionLoanFees, setConstructionLoanFees] = useState<string>("");
  const [constructionDrawdownSchedule, setConstructionDrawdownSchedule] = useState<string>("");
  const [constructionInterestReserve, setConstructionInterestReserve] = useState<string>("");
  const [constructionRecourse, setConstructionRecourse] = useState<string>("");
  
  // Permanent Loan
  const [permanentLoanAmount, setPermanentLoanAmount] = useState<string>("");
  const [permanentInterestRate, setPermanentInterestRate] = useState<string>("");
  const [permanentTerm, setPermanentTerm] = useState<string>("");
  const [permanentAmortization, setPermanentAmortization] = useState<string>("");
  const [permanentLoanFees, setPermanentLoanFees] = useState<string>("");
  
  // Equity Structure
  const [equityStructure, setEquityStructure] = useState<string>("simple");
  const [promoterEquity, setPromoterEquity] = useState<string>("");
  const [investorEquity, setInvestorEquity] = useState<string>("");
  const [preferredReturn, setPreferredReturn] = useState<string>("");
  
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
