
/**
 * Utility functions for exporting model data
 */

import { useModelState } from "@/hooks/useModelState";

// Format currency values for export
export const formatCurrency = (value: string | number): string => {
  if (value === '' || value === undefined || value === null) return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';
  return num.toLocaleString('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2 
  });
};

// Format percentage values for export
export const formatPercentage = (value: string | number): string => {
  if (value === '' || value === undefined || value === null) return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';
  return `${num}%`;
};

// Format number values for export
export const formatNumber = (value: string | number): string => {
  if (value === '' || value === undefined || value === null) return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';
  return num.toLocaleString('en-US');
};

// Structure data for Excel export
export const prepareDataForExport = (): Record<string, any> => {
  const modelState = useModelState();
  
  return {
    projectInformation: {
      projectName: modelState.property.projectName,
      projectLocation: modelState.property.projectLocation,
      projectType: modelState.property.projectType,
      totalLandArea: modelState.property.totalLandArea,
    },
    
    spaceTypes: modelState.property.spaceTypes.map(space => ({
      type: space.type,
      squareFootage: formatNumber(space.squareFootage),
      units: formatNumber(space.units),
      phase: space.phase
    })),
    
    unitMix: modelState.property.unitMixes.map(unit => ({
      type: unit.type,
      count: formatNumber(unit.count),
      squareFootage: formatNumber(unit.squareFootage)
    })),
    
    developmentCosts: {
      land: {
        purchasePrice: formatCurrency(modelState.developmentCosts.purchasePrice),
        purchasePriceMetric: modelState.developmentCosts.purchasePriceMetric,
        closingCosts: formatCurrency(modelState.developmentCosts.closingCosts),
        closingCostsMetric: modelState.developmentCosts.closingCostsMetric,
        customCosts: modelState.developmentCosts.landCustomCosts.map(cost => ({
          name: cost.name,
          amount: formatCurrency(cost.amount),
          metric: cost.metric
        }))
      },
      
      hardCosts: {
        shellCost: formatCurrency(modelState.developmentCosts.shellCost),
        shellCostMetric: modelState.developmentCosts.shellCostMetric,
        tenantImprovementCost: formatCurrency(modelState.developmentCosts.tenantImprovementCost),
        tenantImprovementMetric: modelState.developmentCosts.tenantImprovementMetric,
        sustainabilityCosts: formatCurrency(modelState.developmentCosts.sustainabilityCosts),
        sustainabilityMetric: modelState.developmentCosts.sustainabilityMetric,
        leedCertificationCost: formatCurrency(modelState.developmentCosts.leedCertificationCost),
        solarPanelsCost: formatCurrency(modelState.developmentCosts.solarPanelsCost),
        siteWorkCost: formatCurrency(modelState.developmentCosts.siteWorkCost),
        contingencyPercentage: formatPercentage(modelState.developmentCosts.contingencyPercentage),
        customCosts: modelState.developmentCosts.hardCustomCosts.map(cost => ({
          name: cost.name,
          amount: formatCurrency(cost.amount),
          metric: cost.metric
        }))
      },
      
      softCosts: {
        architectureCost: formatCurrency(modelState.developmentCosts.architectureCost),
        permitFees: formatCurrency(modelState.developmentCosts.permitFees),
        legalFees: formatCurrency(modelState.developmentCosts.legalFees),
        marketingCost: formatCurrency(modelState.developmentCosts.marketingCost),
        developerFee: formatCurrency(modelState.developmentCosts.developerFee),
        constructionPropertyTaxes: formatCurrency(modelState.developmentCosts.constructionPropertyTaxes),
        customCosts: modelState.developmentCosts.softCustomCosts.map(cost => ({
          name: cost.name,
          amount: formatCurrency(cost.amount),
          metric: cost.metric
        }))
      },
      
      otherCosts: {
        financingFees: formatCurrency(modelState.developmentCosts.financingFees),
        interestReserve: formatCurrency(modelState.developmentCosts.interestReserve),
        customCosts: modelState.developmentCosts.otherCustomCosts.map(cost => ({
          name: cost.name,
          amount: formatCurrency(cost.amount),
          metric: cost.metric
        }))
      }
    },
    
    timeline: {
      projectSchedule: {
        startDate: modelState.timeline.startDate?.toLocaleDateString(),
        completionDate: modelState.timeline.completionDate?.toLocaleDateString(),
        preDevelopmentPeriod: formatNumber(modelState.timeline.preDevelopmentPeriod),
        leaseUpPeriod: formatNumber(modelState.timeline.leaseUpPeriod),
        stabilizationPeriod: formatNumber(modelState.timeline.stabilizationPeriod)
      },
      
      constructionPhases: modelState.timeline.constructionPhases.map(phase => ({
        name: phase.name,
        startDate: phase.startDate?.toLocaleDateString(),
        endDate: phase.endDate?.toLocaleDateString()
      })),
      
      costTiming: modelState.timeline.costCategories.map(category => ({
        name: category.name,
        startMonth: formatNumber(category.startMonth),
        endMonth: formatNumber(category.endMonth)
      })),
      
      equityContribution: {
        type: modelState.timeline.equityContributionType,
        milestones: modelState.timeline.equityMilestones.map(milestone => ({
          description: milestone.description,
          date: milestone.date?.toLocaleDateString(),
          percentage: formatPercentage(milestone.percentage)
        })),
        phasedDetails: {
          startMonth: formatNumber(modelState.timeline.phasedStartMonth),
          endMonth: formatNumber(modelState.timeline.phasedEndMonth),
          distributionPattern: modelState.timeline.distributionPattern
        }
      }
    },
    
    expenses: {
      generalOperatingExpenses: {
        expenseGrowthRate: formatPercentage(modelState.expenses.expenseGrowthRate),
        operatingExpenseRatio: formatPercentage(modelState.expenses.operatingExpenseRatio),
        fixedExpensePercentage: formatPercentage(modelState.expenses.fixedExpensePercentage),
        variableExpensePercentage: formatPercentage(modelState.expenses.variableExpensePercentage)
      },
      
      expenseCategories: modelState.expenses.expenseCategories.map(category => ({
        name: category.name,
        amount: formatCurrency(category.amount),
        unit: category.unit
      })),
      
      reserves: {
        replacementReserves: formatCurrency(modelState.expenses.replacementReserves),
        reservesUnit: modelState.expenses.reservesUnit
      },
      
      timing: {
        expenseStartDate: modelState.expenses.expenseStartDate?.toLocaleDateString(),
        expensesBeforeStabilization: formatPercentage(modelState.expenses.expensesBeforeStabilization)
      }
    },
    
    revenue: {
      generalAssumptions: {
        annualRevenueGrowthRate: formatPercentage(modelState.revenue.annualRevenueGrowthRate),
        stabilizedOccupancyRate: formatPercentage(modelState.revenue.stabilizedOccupancyRate),
        baseRent: formatCurrency(modelState.revenue.baseRent),
        baseRentUnit: modelState.revenue.baseRentUnit,
        rentEscalationPercentage: formatPercentage(modelState.revenue.rentEscalationPercentage),
        vacancyRate: formatPercentage(modelState.revenue.vacancyRate),
        collectionLossPercentage: formatPercentage(modelState.revenue.collectionLossPercentage)
      },
      
      residentialIncome: {
        units: modelState.revenue.residentialUnits.map(unit => ({
          type: unit.type,
          count: formatNumber(unit.count),
          rent: formatCurrency(unit.rent),
          squareFootage: formatNumber(unit.squareFootage)
        }))
      },
      
      commercialIncome: {
        rentableArea: formatNumber(modelState.revenue.commercialRentableArea),
        rentPerSqFt: formatCurrency(modelState.revenue.commercialRentPerSqFt),
        leaseTermYears: formatNumber(modelState.revenue.commercialLeaseTermYears)
      },
      
      leaseUpSchedule: {
        residentialLeaseUpMonths: formatNumber(modelState.revenue.residentialLeaseUpMonths),
        commercialLeaseUpMonths: formatNumber(modelState.revenue.commercialLeaseUpMonths),
        leaseUpPattern: modelState.revenue.leaseUpPattern
      },
      
      leaseTerms: {
        residentialLeaseLength: formatNumber(modelState.revenue.residentialLeaseLength),
        commercialLeaseLength: formatNumber(modelState.revenue.commercialLeaseLength),
        commercialLeaseType: modelState.revenue.commercialLeaseType,
        renewalProbability: formatPercentage(modelState.revenue.renewalProbability)
      },
      
      seasonalVariations: {
        enabled: modelState.revenue.enableSeasonalVariations,
        peakSeasonMonths: modelState.revenue.peakSeasonMonths,
        peakRentPremiumPercentage: formatPercentage(modelState.revenue.peakRentPremiumPercentage),
        offPeakDiscountPercentage: formatPercentage(modelState.revenue.offPeakDiscountPercentage)
      },
      
      tenantIncentives: {
        freeRentResidentialMonths: formatNumber(modelState.revenue.freeRentResidentialMonths),
        freeRentCommercialMonths: formatNumber(modelState.revenue.freeRentCommercialMonths),
        tenantImprovementAllowance: formatCurrency(modelState.revenue.tenantImprovementAllowance),
        leasingCommissionPercentage: formatPercentage(modelState.revenue.leasingCommissionPercentage)
      },
      
      marketAdjustments: {
        enabled: modelState.revenue.enableMarketAdjustments,
        growthScenario: modelState.revenue.marketGrowthScenario,
        rentDeltaPercentage: formatPercentage(modelState.revenue.marketRentDeltaPercentage),
        adjustmentTiming: modelState.revenue.marketRentAdjustmentTiming
      },
      
      otherIncome: {
        parkingIncomePerYear: formatCurrency(modelState.revenue.parkingIncomePerYear),
        storageIncomePerYear: formatCurrency(modelState.revenue.storageIncomePerYear),
        laundryIncomePerYear: formatCurrency(modelState.revenue.laundryIncomePerYear),
        lateFeeIncomePerYear: formatCurrency(modelState.revenue.lateFeeIncomePerYear),
        amenityFeesPerYear: formatCurrency(modelState.revenue.amenityFeesPerYear),
        retailPercentageRent: formatPercentage(modelState.revenue.retailPercentageRent)
      }
    },
    
    financing: {
      loanType: modelState.financing.loanType,
      
      capitalStack: {
        totalProjectCost: formatCurrency(modelState.financing.totalProjectCost),
        debtAmount: formatCurrency(modelState.financing.debtAmount),
        equityAmount: formatCurrency(modelState.financing.equityAmount),
        loanToCostRatio: formatPercentage(modelState.financing.loanToCostRatio),
        loanToValueRatio: formatPercentage(modelState.financing.loanToValueRatio),
        debtServiceCoverageRatio: formatNumber(modelState.financing.debtServiceCoverageRatio)
      },
      
      constructionLoan: {
        loanAmount: formatCurrency(modelState.financing.constructionLoanAmount),
        interestRate: formatPercentage(modelState.financing.constructionInterestRate),
        loanTerm: formatNumber(modelState.financing.constructionLoanTerm),
        loanFees: formatPercentage(modelState.financing.constructionLoanFees),
        drawdownSchedule: modelState.financing.constructionDrawdownSchedule,
        interestReserve: formatCurrency(modelState.financing.constructionInterestReserve),
        recourseType: modelState.financing.constructionRecourseType
      },
      
      permanentLoan: {
        loanAmount: formatCurrency(modelState.financing.permanentLoanAmount),
        interestRate: formatPercentage(modelState.financing.permanentInterestRate),
        amortizationYears: formatNumber(modelState.financing.amortizationYears),
        loanTerm: formatNumber(modelState.financing.permanentLoanTerm),
        loanFees: formatPercentage(modelState.financing.permanentLoanFees),
        prepaymentPenaltyType: modelState.financing.prepaymentPenaltyType,
        interestType: modelState.financing.interestType,
        minimumDscr: formatNumber(modelState.financing.minimumDscr)
      },
      
      additionalDebtTerms: {
        debtServiceReserve: formatCurrency(modelState.financing.debtServiceReserve),
        reserveDurationMonths: formatNumber(modelState.financing.reserveDurationMonths),
        additionalCovenants: modelState.financing.additionalCovenants
      },
      
      equityStructure: {
        generalPartnerPercentage: formatPercentage(modelState.financing.generalPartnerPercentage),
        limitedPartnerPercentage: formatPercentage(modelState.financing.limitedPartnerPercentage)
      },
      
      preferredReturn: {
        preferredReturnRate: formatPercentage(modelState.financing.preferredReturnRate),
        structureType: modelState.financing.preferredStructureType,
        gpCatchupPercentage: formatPercentage(modelState.financing.gpCatchupPercentage),
        paymentFrequency: modelState.financing.preferredPaymentFrequency
      },
      
      promoteStructure: {
        tier1: {
          irrThreshold: formatPercentage(modelState.financing.tier1IrrThreshold),
          lpPercentage: formatPercentage(modelState.financing.tier1LpPercentage),
          gpPercentage: formatPercentage(modelState.financing.tier1GpPercentage)
        },
        tier2: {
          irrThreshold: formatPercentage(modelState.financing.tier2IrrThreshold),
          lpPercentage: formatPercentage(modelState.financing.tier2LpPercentage),
          gpPercentage: formatPercentage(modelState.financing.tier2GpPercentage)
        },
        tier3: {
          irrThreshold: modelState.financing.tier3IrrThreshold,
          lpPercentage: formatPercentage(modelState.financing.tier3LpPercentage),
          gpPercentage: formatPercentage(modelState.financing.tier3GpPercentage)
        }
      },
      
      equityContribution: {
        method: modelState.financing.contributionMethod,
        initialContributionPercentage: formatPercentage(modelState.financing.initialContributionPercentage),
        capitalCallNoticeDays: formatNumber(modelState.financing.capitalCallNoticeDays),
        schedule: modelState.financing.contributionSchedule.map(item => ({
          milestone: item.milestone,
          amount: formatCurrency(item.amount),
          percentage: formatPercentage(item.percentage)
        }))
      },
      
      additionalEquityTerms: {
        minimumInvestment: formatCurrency(modelState.financing.minimumInvestment),
        targetEquityMultiple: formatNumber(modelState.financing.targetEquityMultiple),
        targetIrr: formatPercentage(modelState.financing.targetIrr),
        targetHoldPeriodYears: formatNumber(modelState.financing.targetHoldPeriodYears)
      }
    },
    
    disposition: {
      exitStrategy: {
        strategy: modelState.disposition.exitStrategy,
        periodType: modelState.disposition.exitPeriodType,
        period: formatNumber(modelState.disposition.exitPeriod),
        capRate: formatPercentage(modelState.disposition.exitCapRate),
        salesCostsPercentage: formatPercentage(modelState.disposition.salesCostsPercentage),
        expectedSalePrice: formatCurrency(modelState.disposition.expectedSalePrice)
      },
      
      refinanceScenario: {
        year: formatNumber(modelState.disposition.refinanceYear),
        loanToValue: formatPercentage(modelState.disposition.refinanceLoanToValue),
        interestRate: formatPercentage(modelState.disposition.refinanceInterestRate),
        amortizationYears: formatNumber(modelState.disposition.refinanceAmortizationYears),
        termYears: formatNumber(modelState.disposition.refinanceTermYears),
        costsPercentage: formatPercentage(modelState.disposition.refinanceCostsPercentage)
      },
      
      taxImplications: {
        capitalGainsTaxRate: formatPercentage(modelState.disposition.capitalGainsTaxRate),
        depreciationRecaptureRate: formatPercentage(modelState.disposition.depreciationRecaptureRate),
        costBasis: formatCurrency(modelState.disposition.costBasis),
        accumulatedDepreciation: formatCurrency(modelState.disposition.accumulatedDepreciation),
        taxPlanningNotes: modelState.disposition.taxPlanningNotes
      },
      
      returnsAnalysis: {
        projectIrr: formatPercentage(modelState.disposition.projectIrr),
        equityIrr: formatPercentage(modelState.disposition.equityIrr),
        equityMultiple: formatNumber(modelState.disposition.equityMultiple),
        netPresentValue: formatCurrency(modelState.disposition.netPresentValue),
        cashOnCash: formatPercentage(modelState.disposition.cashOnCash),
        paybackPeriod: formatNumber(modelState.disposition.paybackPeriod)
      }
    },
    
    sensitivity: {
      sensitivityVariables: {
        variable1: {
          name: modelState.sensitivity.sensitivityVariable1,
          minRange: formatNumber(modelState.sensitivity.variable1MinRange),
          maxRange: formatNumber(modelState.sensitivity.variable1MaxRange)
        },
        variable2: {
          name: modelState.sensitivity.sensitivityVariable2,
          minRange: formatNumber(modelState.sensitivity.variable2MinRange),
          maxRange: formatNumber(modelState.sensitivity.variable2MaxRange)
        },
        outputMetric: modelState.sensitivity.outputMetric
      },
      
      scenarioAnalysis: {
        baseScenario: {
          rentGrowth: formatPercentage(modelState.sensitivity.baseScenarioRentGrowth),
          exitCap: formatPercentage(modelState.sensitivity.baseScenarioExitCap)
        },
        upsideScenario: {
          rentGrowth: formatPercentage(modelState.sensitivity.upsideScenarioRentGrowth),
          exitCap: formatPercentage(modelState.sensitivity.upsideScenarioExitCap)
        },
        downsideScenario: {
          rentGrowth: formatPercentage(modelState.sensitivity.downsideScenarioRentGrowth),
          exitCap: formatPercentage(modelState.sensitivity.downsideScenarioExitCap)
        }
      },
      
      monteCarloSimulation: {
        simulationRuns: formatNumber(modelState.sensitivity.monteCarloSimulationRuns),
        targetIrrThreshold: formatPercentage(modelState.sensitivity.targetIrrThreshold[0])
      }
    }
  };
};

// Function to convert the data to CSV format
export const convertToCSVFormat = (data: Record<string, any>): string[] => {
  // Initialize CSV rows
  const csvRows: string[] = [];
  
  // Helper function to flatten nested object structure
  const flattenObject = (obj: Record<string, any>, prefix = ''): Record<string, string> => {
    const flattened: Record<string, string> = {};
    
    for (const key in obj) {
      if (obj[key] === null || obj[key] === undefined) {
        flattened[`${prefix}${key}`] = '';
      } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        const nested = flattenObject(obj[key], `${prefix}${key}.`);
        Object.assign(flattened, nested);
      } else if (Array.isArray(obj[key])) {
        // Handle arrays by creating indexed entries
        obj[key].forEach((item: any, index: number) => {
          if (typeof item === 'object') {
            const nested = flattenObject(item, `${prefix}${key}[${index}].`);
            Object.assign(flattened, nested);
          } else {
            flattened[`${prefix}${key}[${index}]`] = String(item);
          }
        });
      } else {
        flattened[`${prefix}${key}`] = String(obj[key]);
      }
    }
    
    return flattened;
  };
  
  // Flatten the data structure
  const flattenedData = flattenObject(data);
  
  // Create CSV header row
  csvRows.push(Object.keys(flattenedData).join(','));
  
  // Create CSV data row
  csvRows.push(Object.values(flattenedData).map(value => `"${value}"`).join(','));
  
  return csvRows;
};
