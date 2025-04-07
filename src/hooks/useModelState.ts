
import { usePropertyState } from "./usePropertyState";
import { useDevelopmentCosts } from "./useDevelopmentCosts";
import { useDevelopmentTimeline } from "./useDevelopmentTimeline";
import { useExpensesState } from "./useExpensesState";
import { useRevenueState } from "./useRevenueState";
import { useFinancingState } from "./useFinancingState";
import { useDispositionState } from "./useDispositionState";
import { useSensitivityState } from "./useSensitivityState";

// This is a master hook that combines all the section hooks
export const useModelState = () => {
  const propertyState = usePropertyState();
  const developmentCostsState = useDevelopmentCosts();
  const timelineState = useDevelopmentTimeline();
  const expensesState = useExpensesState();
  const revenueState = useRevenueState();
  const financingState = useFinancingState();
  const dispositionState = useDispositionState();
  const sensitivityState = useSensitivityState();
  
  // Master handlers
  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, 
    setter: (value: string) => void
  ) => {
    setter(e.target.value);
  };
  
  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    setter: (value: string) => void, 
    min: number = 0, 
    max?: number
  ) => {
    const value = e.target.value;
    // Allow empty string or valid numbers within range
    if (value === '') {
      setter(value);
    } else {
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue >= min && (max === undefined || numValue <= max)) {
        setter(value);
      }
    }
  };
  
  const handlePercentageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void
  ) => {
    handleNumberChange(e, setter, 0, 100);
  };
  
  const handleSelectChange = (
    value: string, 
    setter: (value: string) => void
  ) => {
    setter(value);
  };
  
  const handleBooleanChange = (
    value: boolean,
    setter: (value: boolean) => void
  ) => {
    setter(value);
  };
  
  const handleDateChange = (
    date: Date | undefined,
    setter: (date: Date | undefined) => void
  ) => {
    setter(date);
  };
  
  return {
    property: propertyState,
    developmentCosts: developmentCostsState,
    timeline: timelineState,
    expenses: expensesState,
    revenue: revenueState,
    financing: financingState,
    disposition: dispositionState,
    sensitivity: sensitivityState,
    
    // Common handlers
    handleTextChange,
    handleNumberChange,
    handlePercentageChange,
    handleSelectChange,
    handleBooleanChange,
    handleDateChange
  };
};
