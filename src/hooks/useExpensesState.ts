import { useState, useCallback } from "react";

interface ExpenseCategory {
  id: string;
  name: string;
  amount: string;
  unit: string;
}

export const useExpensesState = () => {
  // General Operating Expenses
  const [expenseGrowthRate, setExpenseGrowthRate] = useState<string>("");
  const [operatingExpenseRatio, setOperatingExpenseRatio] = useState<string>("");
  const [fixedExpensePercentage, setFixedExpensePercentage] = useState<string>("");
  const [variableExpensePercentage, setVariableExpensePercentage] = useState<string>("");
  
  // Expense Categories
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([
    { id: "expense-1", name: "Property Management", amount: "", unit: "percentage" },
    { id: "expense-2", name: "Repairs & Maintenance", amount: "", unit: "psf" },
    { id: "expense-3", name: "Utilities", amount: "", unit: "psf" },
    { id: "expense-4", name: "Property Taxes", amount: "", unit: "psf" },
    { id: "expense-5", name: "Insurance", amount: "", unit: "psf" }
  ]);
  
  // Reserves
  const [replacementReserves, setReplacementReserves] = useState<string>("");
  const [reservesUnit, setReservesUnit] = useState<string>("psf");
  
  // Expense Timing
  const [expenseStartDate, setExpenseStartDate] = useState<Date | undefined>(undefined);
  const [expensesBeforeStabilization, setExpensesBeforeStabilization] = useState<string>("");
  
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
  
  const handleDateChange = (date: Date | undefined, setter: (date: Date | undefined) => void) => {
    setter(date);
  };
  
  const addExpenseCategory = () => {
    const newId = `expense-${expenseCategories.length + 1}`;
    setExpenseCategories([
      ...expenseCategories,
      { id: newId, name: "", amount: "", unit: "psf" }
    ]);
  };
  
  const updateExpenseCategory = (id: string, field: keyof ExpenseCategory, value: string) => {
    // Validate amount field if being updated
    if (field === "amount" && value !== "") {
      const numValue = Number(value);
      if (isNaN(numValue) || numValue < 0) return;
      
      // Extra validation for percentages
      if (expenseCategories.find(cat => cat.id === id)?.unit === "percentage") {
        if (numValue > 100) return;
      }
    }
    
    setExpenseCategories(
      expenseCategories.map(expense => 
        expense.id === id ? { ...expense, [field]: value } : expense
      )
    );
  };
  
  const removeExpenseCategory = (id: string) => {
    if (expenseCategories.length > 1) {
      setExpenseCategories(expenseCategories.filter(expense => expense.id !== id));
    }
  };
  
  // Reset all data
  const resetAllData = useCallback(() => {
    // General Operating Expenses
    setExpenseGrowthRate("");
    setOperatingExpenseRatio("");
    setFixedExpensePercentage("");
    setVariableExpensePercentage("");
    
    // Expense Categories
    setExpenseCategories([
      { id: "expense-1", name: "Property Management", amount: "", unit: "percentage" },
      { id: "expense-2", name: "Repairs & Maintenance", amount: "", unit: "psf" },
      { id: "expense-3", name: "Utilities", amount: "", unit: "psf" },
      { id: "expense-4", name: "Property Taxes", amount: "", unit: "psf" },
      { id: "expense-5", name: "Insurance", amount: "", unit: "psf" }
    ]);
    
    // Reserves
    setReplacementReserves("");
    setReservesUnit("psf");
    
    // Expense Timing
    setExpenseStartDate(undefined);
    setExpensesBeforeStabilization("");
  }, []);
  
  return {
    // General Operating Expenses
    expenseGrowthRate, setExpenseGrowthRate,
    operatingExpenseRatio, setOperatingExpenseRatio,
    fixedExpensePercentage, setFixedExpensePercentage,
    variableExpensePercentage, setVariableExpensePercentage,
    
    // Expense Categories
    expenseCategories,
    addExpenseCategory,
    updateExpenseCategory,
    removeExpenseCategory,
    
    // Reserves
    replacementReserves, setReplacementReserves,
    reservesUnit, setReservesUnit,
    
    // Expense Timing
    expenseStartDate, setExpenseStartDate,
    expensesBeforeStabilization, setExpensesBeforeStabilization,
    
    // Event handlers
    handleTextChange,
    handleNumberChange,
    handlePercentageChange,
    handleSelectChange,
    handleDateChange,
    
    // Data persistence
    resetAllData
  };
};
