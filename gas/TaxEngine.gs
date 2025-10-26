/**
 * Freelance Rate Calculator - Tax Calculation Engine
 *
 * All tax calculations based on /calculations/CALCULATIONS.md
 * Handles: Self-Employment Tax, Federal Income Tax, State Income Tax
 */

const TaxEngine = (function() {
  'use strict';

  // ==============================================================================
  // TAX BRACKET DATA (2025)
  // ==============================================================================

  const FEDERAL_BRACKETS_2025 = {
    single: [
      { min: 0, max: 11925, rate: 0.10 },
      { min: 11926, max: 48475, rate: 0.12 },
      { min: 48476, max: 103350, rate: 0.22 },
      { min: 103351, max: 197300, rate: 0.24 },
      { min: 197301, max: 250525, rate: 0.32 },
      { min: 250526, max: 626350, rate: 0.35 },
      { min: 626351, max: Infinity, rate: 0.37 }
    ],
    married: [
      { min: 0, max: 23850, rate: 0.10 },
      { min: 23851, max: 96950, rate: 0.12 },
      { min: 96951, max: 206700, rate: 0.22 },
      { min: 206701, max: 394600, rate: 0.24 },
      { min: 394601, max: 501050, rate: 0.32 },
      { min: 501051, max: 751600, rate: 0.35 },
      { min: 751601, max: Infinity, rate: 0.37 }
    ],
    hoh: [
      { min: 0, max: 17000, rate: 0.10 },
      { min: 17001, max: 64850, rate: 0.12 },
      { min: 64851, max: 103350, rate: 0.22 },
      { min: 103351, max: 197300, rate: 0.24 },
      { min: 197301, max: 250500, rate: 0.32 },
      { min: 250501, max: 626350, rate: 0.35 },
      { min: 626351, max: Infinity, rate: 0.37 }
    ]
  };

  const STANDARD_DEDUCTION_2025 = {
    single: 15000,
    married: 30000,
    hoh: 22500
  };

  const SE_TAX_RATE = 0.153; // 12.4% SS + 2.9% Medicare
  const SE_TAX_BASE_RATE = 0.9235; // 92.35% of net earnings
  const SS_WAGE_BASE_2025 = 168600;
  const ADDITIONAL_MEDICARE_THRESHOLD = {
    single: 200000,
    married: 250000,
    hoh: 200000
  };

  // State tax rates (flat rates and progressive states)
  const STATE_TAX_RATES = {
    // No income tax states
    'AK': 0, 'FL': 0, 'NV': 0, 'NH': 0, 'SD': 0, 'TN': 0, 'TX': 0, 'WA': 0, 'WY': 0,

    // Flat rate states
    'CO': 0.044, 'IL': 0.0495, 'IN': 0.0315, 'KY': 0.045, 'MA': 0.05,
    'MI': 0.0425, 'NC': 0.0475, 'PA': 0.0307, 'UT': 0.0485,

    // Progressive states (simplified - use median rates for MVP)
    'CA': 0.0930, // California - complex progressive
    'NY': 0.0685, // New York - progressive
    'NJ': 0.0637, // New Jersey - progressive
    'OR': 0.0899, // Oregon - progressive
    'MN': 0.0798, // Minnesota - progressive
    'DC': 0.0850, // District of Columbia - progressive
    'HI': 0.08,   // Hawaii - progressive
    'VT': 0.0775, // Vermont - progressive
    'IA': 0.06,   // Iowa - progressive
    'WI': 0.0627  // Wisconsin - progressive
  };

  // ==============================================================================
  // SELF-EMPLOYMENT TAX
  // ==============================================================================

  /**
   * Calculate self-employment tax
   * @param {number} netSelfEmploymentIncome - Net earnings from self-employment
   * @param {string} filingStatus - 'single', 'married', or 'hoh'
   * @returns {Object} { tax, deduction, additionalMedicare }
   */
  function calculateSelfEmploymentTax(netSelfEmploymentIncome, filingStatus) {
    // Step 1: Calculate SE tax base (92.35% of net earnings)
    const seTaxBase = netSelfEmploymentIncome * SE_TAX_BASE_RATE;

    // Step 2: Calculate SE tax
    let seTax;
    if (seTaxBase <= SS_WAGE_BASE_2025) {
      // Full SE tax rate
      seTax = seTaxBase * SE_TAX_RATE;
    } else {
      // Social Security capped, Medicare continues
      const ssTax = SS_WAGE_BASE_2025 * 0.124; // 12.4% on wage base
      const medicareTax = seTaxBase * 0.029;   // 2.9% on all earnings
      seTax = ssTax + medicareTax;
    }

    // Step 3: Additional Medicare tax if over threshold
    let additionalMedicareTax = 0;
    const threshold = ADDITIONAL_MEDICARE_THRESHOLD[filingStatus] || ADDITIONAL_MEDICARE_THRESHOLD.single;

    if (seTaxBase > threshold) {
      additionalMedicareTax = (seTaxBase - threshold) * 0.009; // 0.9%
      seTax += additionalMedicareTax;
    }

    // Step 4: Half of SE tax is deductible
    const seTaxDeduction = seTax / 2;

    return {
      tax: Math.round(seTax),
      deduction: Math.round(seTaxDeduction),
      additionalMedicare: Math.round(additionalMedicareTax),
      taxBase: Math.round(seTaxBase)
    };
  }

  // ==============================================================================
  // FEDERAL INCOME TAX
  // ==============================================================================

  /**
   * Calculate federal income tax using progressive brackets
   * @param {number} taxableIncome - Income after deductions
   * @param {string} filingStatus - 'single', 'married', or 'hoh'
   * @returns {Object} { tax, effectiveRate, breakdown }
   */
  function calculateFederalTax(taxableIncome, filingStatus) {
    if (taxableIncome <= 0) {
      return { tax: 0, effectiveRate: 0, breakdown: [] };
    }

    const brackets = FEDERAL_BRACKETS_2025[filingStatus] || FEDERAL_BRACKETS_2025.single;
    let totalTax = 0;
    let breakdown = [];

    for (let i = 0; i < brackets.length; i++) {
      const bracket = brackets[i];
      const prevMax = i > 0 ? brackets[i - 1].max : 0;

      if (taxableIncome > prevMax) {
        const taxableInBracket = Math.min(
          taxableIncome - prevMax,
          bracket.max - prevMax
        );

        const taxInBracket = taxableInBracket * bracket.rate;
        totalTax += taxInBracket;

        breakdown.push({
          rate: bracket.rate,
          income: Math.round(taxableInBracket),
          tax: Math.round(taxInBracket)
        });

        if (taxableIncome <= bracket.max) {
          break;
        }
      }
    }

    const effectiveRate = taxableIncome > 0 ? (totalTax / taxableIncome) : 0;

    return {
      tax: Math.round(totalTax),
      effectiveRate: Math.round(effectiveRate * 10000) / 100, // Percentage with 2 decimals
      breakdown: breakdown
    };
  }

  // ==============================================================================
  // STATE INCOME TAX
  // ==============================================================================

  /**
   * Calculate state income tax
   * @param {number} taxableIncome - Income after federal deductions
   * @param {string} state - Two-letter state code
   * @param {string} filingStatus - 'single', 'married', or 'hoh'
   * @returns {Object} { tax, effectiveRate, state }
   */
  function calculateStateTax(taxableIncome, state, filingStatus) {
    if (!state || taxableIncome <= 0) {
      return { tax: 0, effectiveRate: 0, state: state };
    }

    const stateUpper = state.toUpperCase();
    const rate = STATE_TAX_RATES[stateUpper];

    if (rate === undefined) {
      // Unknown state, return 0
      Logger.log('Warning: Unknown state code: ' + state);
      return { tax: 0, effectiveRate: 0, state: state };
    }

    if (rate === 0) {
      // No income tax state
      return { tax: 0, effectiveRate: 0, state: state };
    }

    // For MVP, using flat/median rates
    // TODO: Implement detailed progressive brackets for CA, NY, etc.
    const stateTax = taxableIncome * rate;
    const effectiveRate = rate * 100;

    return {
      tax: Math.round(stateTax),
      effectiveRate: Math.round(effectiveRate * 100) / 100,
      state: state
    };
  }

  // ==============================================================================
  // ITERATIVE GROSS CALCULATION
  // ==============================================================================

  /**
   * Iteratively calculate gross income needed to achieve desired net
   * Accounts for SE tax deduction and health insurance deduction
   *
   * @param {number} desiredNet - Desired take-home after all costs
   * @param {Object} businessOverhead - Overhead costs (health insurance, etc.)
   * @param {string} location - State code
   * @param {string} filingStatus - Filing status
   * @returns {Object} Complete tax calculation
   */
  function iterativeGrossCalculation(desiredNet, businessOverhead, location, filingStatus) {
    // Start with initial estimate
    let grossEstimate = desiredNet * 1.5; // Start 50% higher
    let previousGross = 0;
    let iterations = 0;
    const maxIterations = 20;
    const tolerance = 100; // $100 tolerance

    let result;

    while (Math.abs(grossEstimate - previousGross) > tolerance && iterations < maxIterations) {
      previousGross = grossEstimate;

      // Calculate SE tax
      const seTax = calculateSelfEmploymentTax(grossEstimate, filingStatus);

      // Calculate taxable income
      const standardDeduction = STANDARD_DEDUCTION_2025[filingStatus] || STANDARD_DEDUCTION_2025.single;
      const healthInsuranceDeduction = businessOverhead.healthInsurance ? businessOverhead.healthInsurance.annualCost : 0;

      const taxableIncome = grossEstimate
        - standardDeduction
        - seTax.deduction
        - healthInsuranceDeduction;

      // Calculate federal tax
      const federalTax = calculateFederalTax(Math.max(0, taxableIncome), filingStatus);

      // Calculate state tax
      const stateTax = calculateStateTax(Math.max(0, taxableIncome), location, filingStatus);

      // Calculate total costs
      const totalTaxes = seTax.tax + federalTax.tax + stateTax.tax;
      const totalOverhead = Object.values(businessOverhead).reduce((sum, item) => {
        if (typeof item === 'object' && item.annualCost) {
          return sum + item.annualCost;
        } else if (typeof item === 'number') {
          return sum + item;
        }
        return sum;
      }, 0);

      const totalNeeded = desiredNet + totalTaxes + totalOverhead;

      // Adjust estimate
      grossEstimate = totalNeeded;
      iterations++;
    }

    // Final calculation with converged gross
    const finalSeTax = calculateSelfEmploymentTax(grossEstimate, filingStatus);
    const standardDeduction = STANDARD_DEDUCTION_2025[filingStatus] || STANDARD_DEDUCTION_2025.single;
    const healthInsuranceDeduction = businessOverhead.healthInsurance ? businessOverhead.healthInsurance.annualCost : 0;

    const finalTaxableIncome = grossEstimate
      - standardDeduction
      - finalSeTax.deduction
      - healthInsuranceDeduction;

    const finalFederalTax = calculateFederalTax(Math.max(0, finalTaxableIncome), filingStatus);
    const finalStateTax = calculateStateTax(Math.max(0, finalTaxableIncome), location, filingStatus);

    const totalTaxBurden = finalSeTax.tax + finalFederalTax.tax + finalStateTax.tax;
    const effectiveTaxRate = (totalTaxBurden / grossEstimate) * 100;

    return {
      estimatedGross: Math.round(grossEstimate),
      taxableIncome: Math.round(Math.max(0, finalTaxableIncome)),

      selfEmploymentTax: {
        tax: finalSeTax.tax,
        deduction: finalSeTax.deduction,
        additionalMedicare: finalSeTax.additionalMedicare,
        rate: ((finalSeTax.tax / grossEstimate) * 100).toFixed(2)
      },

      federalTax: {
        tax: finalFederalTax.tax,
        effectiveRate: finalFederalTax.effectiveRate,
        breakdown: finalFederalTax.breakdown
      },

      stateTax: {
        tax: finalStateTax.tax,
        effectiveRate: finalStateTax.effectiveRate,
        state: location
      },

      totalTaxBurden: Math.round(totalTaxBurden),
      effectiveTaxRate: Math.round(effectiveTaxRate * 100) / 100,

      deductions: {
        standardDeduction: standardDeduction,
        seTaxDeduction: finalSeTax.deduction,
        healthInsuranceDeduction: healthInsuranceDeduction,
        totalDeductions: standardDeduction + finalSeTax.deduction + healthInsuranceDeduction
      },

      iterations: iterations,
      converged: iterations < maxIterations
    };
  }

  // ==============================================================================
  // PUBLIC API
  // ==============================================================================

  return {
    calculateSelfEmploymentTax: calculateSelfEmploymentTax,
    calculateFederalTax: calculateFederalTax,
    calculateStateTax: calculateStateTax,
    iterativeGrossCalculation: iterativeGrossCalculation,

    // Export constants for testing
    FEDERAL_BRACKETS_2025: FEDERAL_BRACKETS_2025,
    STANDARD_DEDUCTION_2025: STANDARD_DEDUCTION_2025,
    STATE_TAX_RATES: STATE_TAX_RATES
  };

})();
