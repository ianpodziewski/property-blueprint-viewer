
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
  
  return {
    property: propertyState,
    developmentCosts: developmentCostsState,
    timeline: timelineState,
    expenses: expensesState,
    revenue: revenueState,
    financing: financingState,
    disposition: dispositionState,
    sensitivity: sensitivityState
  };
};
