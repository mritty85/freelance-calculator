/**
 * Freelance Rate Calculator - Budget Calculation Engine
 *
 * Handles calculation of personal expenses, business overhead, and cash flow buffer
 * Combines all components into comprehensive budget summary
 */

const BudgetEngine = (function() {
  'use strict';

  // ==============================================================================
  // DEFAULT VALUES BY SERVICE TYPE
  // ==============================================================================

  const SERVICE_DEFAULTS = {
    'web-development': {
      businessExpenses: 500,  // Monthly
      softwareTools: 200,
      equipment: 2000,        // Annual
      professionalDev: 2000   // Annual
    },
    'design': {
      businessExpenses: 400,
      softwareTools: 100,     // Adobe, Figma, etc.
      equipment: 1500,
      professionalDev: 1500
    },
    'marketing': {
      businessExpenses: 300,
      softwareTools: 150,
      equipment: 1000,
      professionalDev: 2000
    },
    'writing': {
      businessExpenses: 200,
      softwareTools: 50,
      equipment: 800,
      professionalDev: 1000
    },
    'consulting': {
      businessExpenses: 300,
      softwareTools: 100,
      equipment: 1200,
      professionalDev: 3000
    },
    'default': {
      businessExpenses: 400,
      softwareTools: 150,
      equipment: 1500,
      professionalDev: 2000
    }
  };

  const LOCATION_COST_MULTIPLIERS = {
    // High cost of living states
    'CA': 1.3, 'NY': 1.3, 'MA': 1.2, 'WA': 1.2, 'DC': 1.25,
    'HI': 1.35, 'NJ': 1.2, 'CT': 1.15, 'OR': 1.1, 'CO': 1.15,

    // Medium cost of living
    'IL': 1.05, 'PA': 1.0, 'FL': 1.0, 'TX': 0.95, 'AZ': 0.95,
    'NC': 0.9, 'GA': 0.9, 'VA': 1.05, 'MN': 1.0, 'WI': 0.9,

    // Lower cost of living
    'OH': 0.85, 'IN': 0.8, 'MI': 0.85, 'TN': 0.85, 'KY': 0.8,
    'OK': 0.8, 'AR': 0.75, 'MS': 0.75, 'AL': 0.8, 'WV': 0.75
  };

  // ==============================================================================
  // PERSONAL EXPENSES
  // ==============================================================================

  /**
   * Calculate personal living expenses
   * @param {Object} inputs - User inputs for expenses
   * @returns {Object} Calculated personal expenses
   */
  function calculatePersonalExpenses(inputs) {
    let monthlyTotal = 0;
    let detailed = {};

    if (inputs.useSimplified) {
      // Simplified mode: 3 categories
      const essential = inputs.essential || 0;
      const debtSavings = inputs.debtSavings || 0;
      const lifestyle = inputs.lifestyle || 0;

      monthlyTotal = essential + debtSavings + lifestyle;

      detailed = {
        essential: essential,
        debtSavings: debtSavings,
        lifestyle: lifestyle
      };

    } else {
      // Detailed mode: line items
      detailed = {
        housing: inputs.housing || 0,
        utilities: inputs.utilities || 0,
        transportation: inputs.transportation || 0,
        food: inputs.food || 0,
        healthInsurance: inputs.healthInsurance || 0, // If covered by spouse
        otherInsurance: inputs.otherInsurance || 0,
        debtPayments: inputs.debtPayments || 0,
        savingsGoals: inputs.savingsGoals || 0,
        childcare: inputs.childcare || 0,
        entertainment: inputs.entertainment || 0,
        subscriptions: inputs.subscriptions || 0,
        other: inputs.other || 0
      };

      monthlyTotal = Object.values(detailed).reduce((sum, val) => sum + val, 0);
    }

    const annualTotal = monthlyTotal * 12;

    return {
      monthlyTotal: Math.round(monthlyTotal),
      annualTotal: Math.round(annualTotal),
      detailed: detailed,
      useSimplified: inputs.useSimplified || false
    };
  }

  // ==============================================================================
  // BUSINESS OVERHEAD
  // ==============================================================================

  /**
   * Calculate business overhead costs
   * @param {Object} inputs - Business overhead inputs
   * @returns {Object} Calculated overhead breakdown
   */
  function calculateBusinessOverhead(inputs) {
    const overhead = {};

    // Health Insurance
    if (inputs.healthInsurance && inputs.healthInsurance.needed) {
      const monthlyPremium = inputs.healthInsurance.monthlyPremium || 0;
      overhead.healthInsurance = {
        needed: true,
        type: inputs.healthInsurance.type || 'individual',
        monthlyPremium: monthlyPremium,
        annualCost: monthlyPremium * 12,
        taxDeductible: true
      };
    } else {
      overhead.healthInsurance = {
        needed: false,
        annualCost: 0
      };
    }

    // Retirement Savings
    if (inputs.retirement) {
      let retirementAmount = 0;

      if (inputs.retirement.type === 'percentage') {
        // Will be calculated as percentage of gross later
        // For now, store the percentage
        overhead.retirement = {
          type: 'percentage',
          percentage: inputs.retirement.percentage || 10,
          annualCost: 0  // Calculated later based on gross
        };
      } else {
        // Fixed dollar amount
        retirementAmount = inputs.retirement.annualAmount || 0;
        overhead.retirement = {
          type: 'fixed',
          annualCost: retirementAmount
        };
      }
    } else {
      overhead.retirement = {
        type: 'none',
        annualCost: 0
      };
    }

    // Business Expenses
    if (inputs.businessExpenses) {
      const monthly = inputs.businessExpenses.monthly || 0;
      overhead.businessExpenses = {
        monthly: monthly,
        annualCost: monthly * 12,
        detailed: inputs.businessExpenses.detailed || {}
      };
    } else {
      overhead.businessExpenses = {
        monthly: 0,
        annualCost: 0
      };
    }

    // Professional Development
    const profDevAnnual = inputs.professionalDevelopment || 0;
    overhead.professionalDevelopment = {
      annualCost: profDevAnnual
    };

    // PTO/Unpaid Time Cost (calculated separately as it depends on rate)
    const ptoWeeks = inputs.ptoWeeks || 2;
    overhead.pto = {
      weeks: ptoWeeks,
      // Will be calculated later: ptoWeeks * hoursPerWeek * hourlyRate
      annualCost: 0  // Placeholder
    };

    // Calculate total overhead (excluding retirement if percentage-based)
    let totalAnnualCost = 0;
    for (let key in overhead) {
      if (overhead[key].annualCost) {
        totalAnnualCost += overhead[key].annualCost;
      }
    }

    overhead.totalAnnualCost = Math.round(totalAnnualCost);

    return overhead;
  }

  // ==============================================================================
  // CASH FLOW BUFFER
  // ==============================================================================

  /**
   * Calculate cash flow buffer needs
   * @param {number} monthlyExpenses - Total monthly expenses
   * @param {Object} inputs - Cash flow inputs
   * @returns {Object} Cash flow buffer calculation
   */
  function calculateCashFlowBuffer(monthlyExpenses, inputs) {
    const paymentTerms = inputs.paymentTerms || 30; // Days
    const gapWeeks = inputs.gapWeeks || 2;          // Weeks between projects

    // Calculate buffer needed
    const monthsOfBuffer = paymentTerms / 30;
    const weeksOfBuffer = gapWeeks;

    // Total buffer = payment delay + project gaps
    const bufferMonths = monthsOfBuffer + (weeksOfBuffer / 4);
    const bufferNeeded = monthlyExpenses * bufferMonths;

    // Amortize over 3 years
    const annualizedCost = bufferNeeded / 3;

    return {
      paymentTerms: paymentTerms,
      gapWeeks: gapWeeks,
      bufferMonths: Math.round(bufferMonths * 100) / 100,
      bufferNeeded: Math.round(bufferNeeded),
      annualizedCost: Math.round(annualizedCost),
      explanation: `You need ${Math.round(bufferMonths)} months of expenses (${formatCurrency(bufferNeeded)}) as buffer. We spread this cost over 3 years = ${formatCurrency(annualizedCost)}/year.`
    };
  }

  // ==============================================================================
  // BUDGET SUMMARY
  // ==============================================================================

  /**
   * Build comprehensive budget summary
   * @param {Object} personalExpenses - Personal expenses calculation
   * @param {Object} businessOverhead - Business overhead calculation
   * @param {Object} taxCalculation - Tax calculation from TaxEngine
   * @param {Object} cashFlowBuffer - Cash flow buffer calculation
   * @returns {Object} Complete budget summary
   */
  function buildBudgetSummary(personalExpenses, businessOverhead, taxCalculation, cashFlowBuffer) {
    const desiredTakeHome = personalExpenses.annualTotal;
    const totalOverhead = businessOverhead.totalAnnualCost + cashFlowBuffer.annualizedCost;
    const totalTaxes = taxCalculation.totalTaxBurden;
    const grossIncomeNeeded = taxCalculation.estimatedGross;

    // Calculate percentage breakdown
    const takeHomePercent = (desiredTakeHome / grossIncomeNeeded) * 100;
    const overheadPercent = (totalOverhead / grossIncomeNeeded) * 100;
    const taxPercent = (totalTaxes / grossIncomeNeeded) * 100;

    // Calculate monthly equivalents
    const monthlyTakeHome = desiredTakeHome / 12;
    const monthlyGrossNeeded = grossIncomeNeeded / 12;

    // Build detailed breakdown for display
    const breakdown = {
      personalTakeHome: {
        amount: desiredTakeHome,
        percent: Math.round(takeHomePercent * 100) / 100,
        monthly: Math.round(monthlyTakeHome)
      },

      businessOverhead: {
        amount: totalOverhead,
        percent: Math.round(overheadPercent * 100) / 100,
        components: {
          healthInsurance: businessOverhead.healthInsurance.annualCost,
          retirement: businessOverhead.retirement.annualCost,
          businessExpenses: businessOverhead.businessExpenses.annualCost,
          professionalDev: businessOverhead.professionalDevelopment.annualCost,
          cashFlowBuffer: cashFlowBuffer.annualizedCost
        }
      },

      taxes: {
        amount: totalTaxes,
        percent: Math.round(taxPercent * 100) / 100,
        components: {
          federal: taxCalculation.federalTax.tax,
          state: taxCalculation.stateTax.tax,
          selfEmployment: taxCalculation.selfEmploymentTax.tax
        }
      },

      total: {
        grossNeeded: grossIncomeNeeded,
        monthlyGross: Math.round(monthlyGrossNeeded),
        monthlyTakeHome: Math.round(monthlyTakeHome)
      }
    };

    return {
      desiredTakeHome: desiredTakeHome,
      totalOverhead: totalOverhead,
      totalTaxes: totalTaxes,
      grossIncomeNeeded: grossIncomeNeeded,
      monthlyTakeHome: Math.round(monthlyTakeHome),
      monthlyGrossNeeded: Math.round(monthlyGrossNeeded),
      breakdown: breakdown
    };
  }

  // ==============================================================================
  // SMART DEFAULTS
  // ==============================================================================

  /**
   * Get smart defaults based on service type and location
   * @param {string} serviceType - Type of service
   * @param {string} location - State code
   * @returns {Object} Suggested defaults
   */
  function getSmartDefaults(serviceType, location) {
    const serviceDefaults = SERVICE_DEFAULTS[serviceType] || SERVICE_DEFAULTS.default;
    const locationMultiplier = LOCATION_COST_MULTIPLIERS[location] || 1.0;

    // Adjust for location
    const adjustedDefaults = {
      businessExpenses: Math.round(serviceDefaults.businessExpenses * locationMultiplier),
      softwareTools: serviceDefaults.softwareTools,
      equipment: serviceDefaults.equipment,
      professionalDev: serviceDefaults.professionalDev,
      healthInsurance: {
        individual: Math.round(600 * locationMultiplier),
        family: Math.round(1600 * locationMultiplier)
      },
      essentialExpenses: Math.round(3500 * locationMultiplier)
    };

    return adjustedDefaults;
  }

  // ==============================================================================
  // UTILITY FUNCTIONS
  // ==============================================================================

  /**
   * Format number as currency
   */
  function formatCurrency(amount) {
    return '$' + Math.round(amount).toLocaleString();
  }

  // ==============================================================================
  // PUBLIC API
  // ==============================================================================

  return {
    calculatePersonalExpenses: calculatePersonalExpenses,
    calculateBusinessOverhead: calculateBusinessOverhead,
    calculateCashFlowBuffer: calculateCashFlowBuffer,
    buildBudgetSummary: buildBudgetSummary,
    getSmartDefaults: getSmartDefaults,

    // Export constants for testing
    SERVICE_DEFAULTS: SERVICE_DEFAULTS,
    LOCATION_COST_MULTIPLIERS: LOCATION_COST_MULTIPLIERS
  };

})();
