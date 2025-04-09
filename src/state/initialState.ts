
import { ModelState } from "../types/modelTypes";

// Initial state values for each section
const initialPropertyState: ModelState['property'] = {
  projectName: "",
  projectLocation: "",
  projectType: "",
  totalLandArea: "",
  spaceTypes: [{ id: "space-1", type: "", squareFootage: "", units: "", phase: "" }],
  unitMixes: [{ id: "unit-1", type: "Studio", count: "", squareFootage: "" }]
};

const initialDevelopmentCostsState: ModelState['developmentCosts'] = {
  purchasePrice: "",
  purchasePriceMetric: "psf",
  closingCosts: "",
  closingCostsMetric: "psf",
  landCustomCosts: [{ id: "land-cost-1", name: "", amount: "", metric: "psf" }],
  shellCost: "",
  shellCostMetric: "psf",
  tenantImprovementCost: "",
  tenantImprovementMetric: "psf",
  sustainabilityCosts: "",
  sustainabilityMetric: "psf",
  leedCertificationCost: "",
  solarPanelsCost: "",
  siteWorkCost: "",
  contingencyPercentage: "",
  hardCustomCosts: [{ id: "hard-cost-1", name: "", amount: "", metric: "psf" }],
  architectureCost: "",
  permitFees: "",
  legalFees: "",
  marketingCost: "",
  developerFee: "",
  constructionPropertyTaxes: "",
  softCustomCosts: [{ id: "soft-cost-1", name: "", amount: "", metric: "psf" }],
  financingFees: "",
  interestReserve: "",
  otherCustomCosts: [{ id: "other-cost-1", name: "", amount: "", metric: "psf" }]
};

const initialTimelineState: ModelState['timeline'] = {
  startDate: null,
  completionDate: null,
  preDevelopmentPeriod: "",
  leaseUpPeriod: "",
  stabilizationPeriod: "",
  constructionPhases: [{ 
    id: "phase-1", 
    name: "Phase 1", 
    startDate: null, 
    endDate: null 
  }],
  costCategories: [
    { id: "cost-1", name: "Land Acquisition", startMonth: "", endMonth: "" },
    { id: "cost-2", name: "Hard Costs", startMonth: "", endMonth: "" },
    { id: "cost-3", name: "Soft Costs", startMonth: "", endMonth: "" }
  ],
  equityContributionType: "upfront",
  equityMilestones: [
    { id: "milestone-1", description: "Initial Investment", date: null, percentage: "25" }
  ],
  phasedStartMonth: "",
  phasedEndMonth: "",
  distributionPattern: "even"
};

const initialExpensesState: ModelState['expenses'] = {
  expenseGrowthRate: "",
  operatingExpenseRatio: "",
  fixedExpensePercentage: "",
  variableExpensePercentage: "",
  expenseCategories: [
    { id: "expense-1", name: "Property Management", amount: "", unit: "percentage" },
    { id: "expense-2", name: "Repairs & Maintenance", amount: "", unit: "psf" },
    { id: "expense-3", name: "Utilities", amount: "", unit: "psf" },
    { id: "expense-4", name: "Property Taxes", amount: "", unit: "psf" },
    { id: "expense-5", name: "Insurance", amount: "", unit: "psf" }
  ],
  replacementReserves: "",
  reservesUnit: "psf",
  expenseStartDate: null,
  expensesBeforeStabilization: ""
};

const initialRevenueState: ModelState['revenue'] = {
  annualRevenueGrowthRate: "",
  stabilizedOccupancyRate: "",
  baseRent: "",
  baseRentUnit: "psf",
  rentEscalationPercentage: "",
  vacancyRate: "",
  collectionLossPercentage: "",
  residentialUnits: [
    { id: "unit-1", type: "Studio", count: "", rent: "", squareFootage: "" },
    { id: "unit-2", type: "One Bedroom", count: "", rent: "", squareFootage: "" },
    { id: "unit-3", type: "Two Bedroom", count: "", rent: "", squareFootage: "" }
  ],
  commercialRentableArea: "",
  commercialRentPerSqFt: "",
  commercialLeaseTermYears: "",
  residentialLeaseUpMonths: "",
  commercialLeaseUpMonths: "",
  leaseUpPattern: "linear",
  residentialLeaseLength: "12",
  commercialLeaseLength: "5",
  commercialLeaseType: "triple-net",
  renewalProbability: "70",
  enableSeasonalVariations: false,
  peakSeasonMonths: "Jun-Aug",
  peakRentPremiumPercentage: "",
  offPeakDiscountPercentage: "",
  freeRentResidentialMonths: "",
  freeRentCommercialMonths: "",
  tenantImprovementAllowance: "",
  leasingCommissionPercentage: "",
  enableMarketAdjustments: false,
  marketGrowthScenario: "base",
  marketRentDeltaPercentage: "",
  marketRentAdjustmentTiming: "immediate",
  parkingIncomePerYear: "",
  storageIncomePerYear: "",
  laundryIncomePerYear: "",
  lateFeeIncomePerYear: "",
  amenityFeesPerYear: "",
  retailPercentageRent: ""
};

const initialFinancingState: ModelState['financing'] = {
  loanType: "both",
  totalProjectCost: "",
  debtAmount: "",
  equityAmount: "",
  loanToCostRatio: "",
  loanToValueRatio: "",
  debtServiceCoverageRatio: "",
  constructionLoanAmount: "",
  constructionInterestRate: "",
  constructionLoanTerm: "",
  constructionLoanFees: "",
  constructionDrawdownSchedule: "monthly",
  constructionInterestReserve: "",
  constructionRecourseType: "full",
  permanentLoanAmount: "",
  permanentInterestRate: "",
  amortizationYears: "",
  permanentLoanTerm: "",
  permanentLoanFees: "",
  prepaymentPenaltyType: "none",
  interestType: "fixed",
  minimumDscr: "",
  debtServiceReserve: "",
  reserveDurationMonths: "",
  additionalCovenants: "",
  generalPartnerPercentage: "",
  limitedPartnerPercentage: "",
  preferredReturnRate: "",
  preferredStructureType: "cumulative",
  gpCatchupPercentage: "",
  preferredPaymentFrequency: "quarterly",
  tier1IrrThreshold: "",
  tier1LpPercentage: "",
  tier1GpPercentage: "",
  tier2IrrThreshold: "",
  tier2LpPercentage: "",
  tier2GpPercentage: "",
  tier3LpPercentage: "",
  tier3GpPercentage: "",
  contributionMethod: "upfront",
  initialContributionPercentage: "",
  capitalCallNoticeDays: "",
  contributionSchedule: [
    { id: "contrib-1", milestone: "Closing", amount: "", percentage: "" },
    { id: "contrib-2", milestone: "Construction Start", amount: "", percentage: "" }
  ],
  minimumInvestment: "",
  targetEquityMultiple: "",
  targetIrr: "",
  targetHoldPeriodYears: ""
};

const initialDispositionState: ModelState['disposition'] = {
  exitStrategy: "sale",
  exitPeriodType: "year",
  exitPeriod: "",
  exitCapRate: "",
  salesCostsPercentage: "",
  expectedSalePrice: "",
  refinanceYear: "",
  refinanceLoanToValue: "",
  refinanceInterestRate: "",
  refinanceAmortizationYears: "",
  refinanceTermYears: "",
  refinanceCostsPercentage: "",
  capitalGainsTaxRate: "",
  depreciationRecaptureRate: "",
  costBasis: "",
  accumulatedDepreciation: "",
  taxPlanningNotes: "",
  projectIrr: "",
  equityIrr: "",
  equityMultiple: "",
  netPresentValue: "",
  cashOnCash: "",
  paybackPeriod: ""
};

const initialSensitivityState: ModelState['sensitivity'] = {
  sensitivityVariable1: "exit-cap",
  variable1MinRange: "",
  variable1MaxRange: "",
  sensitivityVariable2: "rent-growth",
  variable2MinRange: "",
  variable2MaxRange: "",
  outputMetric: "equity-irr",
  baseScenarioRentGrowth: "",
  baseScenarioExitCap: "",
  upsideScenarioRentGrowth: "",
  upsideScenarioExitCap: "",
  downsideScenarioRentGrowth: "",
  downsideScenarioExitCap: "",
  monteCarloSimulationRuns: "",
  targetIrrThreshold: [15]
};

const initialValidationState: ModelState['validation'] = {
  property: [],
  developmentCosts: [],
  timeline: [],
  expenses: [],
  revenue: [],
  financing: [],
  disposition: [],
  sensitivity: []
};

const initialNavigationState: ModelState['navigation'] = {
  activeTab: "property",
  dirtyFields: {
    property: false,
    developmentCosts: false,
    timeline: false,
    expenses: false,
    revenue: false,
    financing: false,
    disposition: false,
    sensitivity: false
  }
};

// Combined initial state
export const initialModelState: ModelState = {
  property: initialPropertyState,
  developmentCosts: initialDevelopmentCostsState,
  timeline: initialTimelineState,
  expenses: initialExpensesState,
  revenue: initialRevenueState,
  financing: initialFinancingState,
  disposition: initialDispositionState,
  sensitivity: initialSensitivityState,
  validation: initialValidationState,
  navigation: initialNavigationState,
  lastSaved: null
};
