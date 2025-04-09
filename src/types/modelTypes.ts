
// Common types for the modeling application

// Property Types
export interface SpaceType {
  id: string;
  type: string;
  squareFootage: string;
  units: string;
  phase: string;
}

export interface UnitMix {
  id: string;
  type: string;
  count: string;
  squareFootage: string;
}

export interface PropertyState {
  projectName: string;
  projectLocation: string;
  projectType: string;
  totalLandArea: string;
  spaceTypes: SpaceType[];
  unitMixes: UnitMix[];
}

// Development Costs Types
export interface CustomCost {
  id: string;
  name: string;
  amount: string;
  metric: string;
}

export interface DevelopmentCostsState {
  purchasePrice: string;
  purchasePriceMetric: string;
  closingCosts: string;
  closingCostsMetric: string;
  landCustomCosts: CustomCost[];
  shellCost: string;
  shellCostMetric: string;
  tenantImprovementCost: string;
  tenantImprovementMetric: string;
  sustainabilityCosts: string;
  sustainabilityMetric: string;
  leedCertificationCost: string;
  solarPanelsCost: string;
  siteWorkCost: string;
  contingencyPercentage: string;
  hardCustomCosts: CustomCost[];
  architectureCost: string;
  permitFees: string;
  legalFees: string;
  marketingCost: string;
  developerFee: string;
  constructionPropertyTaxes: string;
  softCustomCosts: CustomCost[];
  financingFees: string;
  interestReserve: string;
  otherCustomCosts: CustomCost[];
}

// Development Timeline Types
export interface ConstructionPhase {
  id: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
}

export interface CostCategory {
  id: string;
  name: string;
  startMonth: string;
  endMonth: string;
}

export interface EquityMilestone {
  id: string;
  description: string;
  date: string | null;
  percentage: string;
}

export interface DevelopmentTimelineState {
  startDate: string | null;
  completionDate: string | null;
  preDevelopmentPeriod: string;
  leaseUpPeriod: string;
  stabilizationPeriod: string;
  constructionPhases: ConstructionPhase[];
  costCategories: CostCategory[];
  equityContributionType: string;
  equityMilestones: EquityMilestone[];
  phasedStartMonth: string;
  phasedEndMonth: string;
  distributionPattern: string;
}

// Operating Expenses Types
export interface ExpenseCategory {
  id: string;
  name: string;
  amount: string;
  unit: string;
}

export interface ExpensesState {
  expenseGrowthRate: string;
  operatingExpenseRatio: string;
  fixedExpensePercentage: string;
  variableExpensePercentage: string;
  expenseCategories: ExpenseCategory[];
  replacementReserves: string;
  reservesUnit: string;
  expenseStartDate: string | null;
  expensesBeforeStabilization: string;
}

// Revenue Types
export interface ResidentialUnit {
  id: string;
  type: string;
  count: string;
  rent: string;
  squareFootage: string;
}

export interface RevenueState {
  annualRevenueGrowthRate: string;
  stabilizedOccupancyRate: string;
  baseRent: string;
  baseRentUnit: string;
  rentEscalationPercentage: string;
  vacancyRate: string;
  collectionLossPercentage: string;
  residentialUnits: ResidentialUnit[];
  commercialRentableArea: string;
  commercialRentPerSqFt: string;
  commercialLeaseTermYears: string;
  residentialLeaseUpMonths: string;
  commercialLeaseUpMonths: string;
  leaseUpPattern: string;
  residentialLeaseLength: string;
  commercialLeaseLength: string;
  commercialLeaseType: string;
  renewalProbability: string;
  enableSeasonalVariations: boolean;
  peakSeasonMonths: string;
  peakRentPremiumPercentage: string;
  offPeakDiscountPercentage: string;
  freeRentResidentialMonths: string;
  freeRentCommercialMonths: string;
  tenantImprovementAllowance: string;
  leasingCommissionPercentage: string;
  enableMarketAdjustments: boolean;
  marketGrowthScenario: string;
  marketRentDeltaPercentage: string;
  marketRentAdjustmentTiming: string;
  parkingIncomePerYear: string;
  storageIncomePerYear: string;
  laundryIncomePerYear: string;
  lateFeeIncomePerYear: string;
  amenityFeesPerYear: string;
  retailPercentageRent: string;
}

// Financing Types
export interface ContributionScheduleItem {
  id: string;
  milestone: string;
  amount: string;
  percentage: string;
}

export interface FinancingState {
  loanType: "construction" | "permanent" | "both";
  totalProjectCost: string;
  debtAmount: string;
  equityAmount: string;
  loanToCostRatio: string;
  loanToValueRatio: string;
  debtServiceCoverageRatio: string;
  constructionLoanAmount: string;
  constructionInterestRate: string;
  constructionLoanTerm: string;
  constructionLoanFees: string;
  constructionDrawdownSchedule: string;
  constructionInterestReserve: string;
  constructionRecourseType: string;
  permanentLoanAmount: string;
  permanentInterestRate: string;
  amortizationYears: string;
  permanentLoanTerm: string;
  permanentLoanFees: string;
  prepaymentPenaltyType: string;
  interestType: string;
  minimumDscr: string;
  debtServiceReserve: string;
  reserveDurationMonths: string;
  additionalCovenants: string;
  generalPartnerPercentage: string;
  limitedPartnerPercentage: string;
  preferredReturnRate: string;
  preferredStructureType: string;
  gpCatchupPercentage: string;
  preferredPaymentFrequency: string;
  tier1IrrThreshold: string;
  tier1LpPercentage: string;
  tier1GpPercentage: string;
  tier2IrrThreshold: string;
  tier2LpPercentage: string;
  tier2GpPercentage: string;
  tier3LpPercentage: string;
  tier3GpPercentage: string;
  contributionMethod: string;
  initialContributionPercentage: string;
  capitalCallNoticeDays: string;
  contributionSchedule: ContributionScheduleItem[];
  minimumInvestment: string;
  targetEquityMultiple: string;
  targetIrr: string;
  targetHoldPeriodYears: string;
}

// Disposition Types
export interface DispositionState {
  exitStrategy: string;
  exitPeriodType: string;
  exitPeriod: string;
  exitCapRate: string;
  salesCostsPercentage: string;
  expectedSalePrice: string;
  refinanceYear: string;
  refinanceLoanToValue: string;
  refinanceInterestRate: string;
  refinanceAmortizationYears: string;
  refinanceTermYears: string;
  refinanceCostsPercentage: string;
  capitalGainsTaxRate: string;
  depreciationRecaptureRate: string;
  costBasis: string;
  accumulatedDepreciation: string;
  taxPlanningNotes: string;
  projectIrr: string;
  equityIrr: string;
  equityMultiple: string;
  netPresentValue: string;
  cashOnCash: string;
  paybackPeriod: string;
}

// Sensitivity Types
export interface SensitivityState {
  sensitivityVariable1: string;
  variable1MinRange: string;
  variable1MaxRange: string;
  sensitivityVariable2: string;
  variable2MinRange: string;
  variable2MaxRange: string;
  outputMetric: string;
  baseScenarioRentGrowth: string;
  baseScenarioExitCap: string;
  upsideScenarioRentGrowth: string;
  upsideScenarioExitCap: string;
  downsideScenarioRentGrowth: string;
  downsideScenarioExitCap: string;
  monteCarloSimulationRuns: string;
  targetIrrThreshold: number[];
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationState {
  property: ValidationError[];
  developmentCosts: ValidationError[];
  timeline: ValidationError[];
  expenses: ValidationError[];
  revenue: ValidationError[];
  financing: ValidationError[];
  disposition: ValidationError[];
  sensitivity: ValidationError[];
}

// Navigation State
export interface NavigationState {
  activeTab: string;
  dirtyFields: {
    property: boolean;
    developmentCosts: boolean;
    timeline: boolean;
    expenses: boolean;
    revenue: boolean;
    financing: boolean;
    disposition: boolean;
    sensitivity: boolean;
  };
}

// Application State
export interface ModelState {
  property: PropertyState;
  developmentCosts: DevelopmentCostsState;
  timeline: DevelopmentTimelineState;
  expenses: ExpensesState;
  revenue: RevenueState;
  financing: FinancingState;
  disposition: DispositionState;
  sensitivity: SensitivityState;
  validation: ValidationState;
  navigation: NavigationState;
  lastSaved: string | null;
}

// Generic Action Types
export type Action<T extends string, P = void> = P extends void
  ? { type: T }
  : { type: T; payload: P };

export type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? { type: Key }
    : { type: Key; payload: M[Key] };
};

// Generic Validation Function Type
export type ValidateFunction<T> = (state: T) => ValidationError[];
