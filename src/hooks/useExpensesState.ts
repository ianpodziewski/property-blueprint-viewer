
import { useState } from "react";

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
  
  const addExpenseCategory = () => {
    const newId = `expense-${expenseCategories.length + 1}`;
    setExpenseCategories([
      ...expenseCategories,
      { id: newId, name: "", amount: "", unit: "psf" }
    ]);
  };
  
  const updateExpenseCategory = (id: string, field: keyof ExpenseCategory, value: string) => {
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
    expensesBeforeStabilization, setExpensesBeforeStabilization
  };
};
