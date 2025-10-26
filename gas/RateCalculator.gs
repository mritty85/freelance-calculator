/**
 * Freelance Rate Calculator - Rate Calculation Engine
 *
 * Converts budget profile (gross income needed) into hourly/project rates
 * Includes walk-away number, recommended rate, and date-aware adjustments
 */

const RateCalculator = (function() {
  'use strict';

  // ==============================================================================
  // BILLABLE HOURS CALCULATIONS
  // ==============================================================================

  /**
   * Calculate realistic billable hours
   * Applies reality buffer to account for non-billable time
   *
   * @param {number} hoursPerWeek - User's estimated billable hours per week
   * @param {number} weeksPerYear - Working weeks per year
   * @param {number} realityBuffer - Buffer percentage (default 15%)
   * @returns {Object} Hours calculation
   */
  function calculateBillableHours(hoursPerWeek, weeksPerYear, realityBuffer) {
    realityBuffer = realityBuffer || 0.15; // Default 15% buffer

    const rawAnnualHours = hoursPerWeek * weeksPerYear;
    const realisticHours = Math.round(rawAnnualHours * (1 - realityBuffer));

    return {
      rawHours: rawAnnualHours,
      realisticHours: realisticHours,
      bufferApplied: realityBuffer * 100,
      hoursLost: rawAnnualHours - realisticHours,
      explanation: `Reduced from ${rawAnnualHours} to ${realisticHours} hours (${realityBuffer * 100}% buffer for proposals, admin, gaps)`
    };
  }

  // ==============================================================================
  // RATE CALCULATIONS
  // ==============================================================================

  /**
   * Calculate hourly rate from budget profile
   *
   * @param {string} budgetProfileId - ID of budget profile to use
   * @param {Object} workingHours - { hoursPerWeek, weeksPerYear }
   * @returns {Object} Complete rate calculation
   */
  function calculateHourlyRate(budgetProfileId, workingHours) {
    // Get budget profile from database
    const budgetProfile = SheetsDB.getBudgetProfileById(budgetProfileId);

    if (!budgetProfile) {
      throw new Error('Budget profile not found: ' + budgetProfileId);
    }

    const grossIncomeNeeded = budgetProfile.summary.grossIncomeNeeded;
    const desiredTakeHome = budgetProfile.summary.desiredTakeHome;

    // Calculate realistic billable hours
    const billableHours = calculateBillableHours(
      workingHours.hoursPerWeek,
      workingHours.weeksPerYear
    );

    // Calculate minimum rate
    const minimumRate = grossIncomeNeeded / billableHours.realisticHours;

    // Calculate recommended rate (add 10% buffer for negotiation)
    const recommendedRate = minimumRate * 1.10;

    // Calculate walk-away number (bare minimum)
    const walkAwayRate = calculateWalkAwayNumber(
      desiredTakeHome,
      budgetProfile.personalExpenses,
      budgetProfile.businessOverhead,
      budgetProfile.taxCalculation
    );

    // Calculate project rates (assuming typical project hours)
    const projectRates = calculateProjectRates(minimumRate, recommendedRate);

    // Build complete rate profile
    const rateProfile = {
      budgetProfileId: budgetProfileId,
      calculatedAt: new Date().toISOString(),

      grossIncomeNeeded: Math.round(grossIncomeNeeded),
      desiredTakeHome: Math.round(desiredTakeHome),

      workingHours: {
        hoursPerWeek: workingHours.hoursPerWeek,
        weeksPerYear: workingHours.weeksPerYear,
        rawAnnual: billableHours.rawHours,
        realisticAnnual: billableHours.realisticHours,
        bufferApplied: billableHours.bufferApplied
      },

      rates: {
        minimum: Math.round(minimumRate),
        recommended: Math.round(recommendedRate),
        walkAway: Math.round(walkAwayRate),

        projectRates: projectRates
      },

      explanation: {
        minimumRate: `Minimum to hit your ${formatCurrency(grossIncomeNeeded)} gross goal`,
        recommendedRate: `Includes 10% negotiation buffer`,
        walkAwayRate: `Absolute minimum - below this you're working at a loss`
      }
    };

    // Save rate profile to database
    const rateProfileId = SheetsDB.saveRateProfile(rateProfile);
    rateProfile.rateProfileId = rateProfileId;

    return rateProfile;
  }

  /**
   * Calculate walk-away number (absolute minimum rate)
   * Uses bare minimum costs with maximum realistic hours
   *
   * @param {number} desiredTakeHome - Desired take-home
   * @param {Object} personalExpenses - Personal expenses
   * @param {Object} businessOverhead - Business overhead
   * @param {Object} taxCalculation - Tax calculation
   * @returns {number} Walk-away hourly rate
   */
  function calculateWalkAwayNumber(desiredTakeHome, personalExpenses, businessOverhead, taxCalculation) {
    // Bare minimum costs (no buffers, no extras)
    const minimumHealthInsurance = businessOverhead.healthInsurance.annualCost || 6000;
    const minimumBusinessExpenses = businessOverhead.businessExpenses.annualCost * 0.5; // Cut in half
    const minimumTaxes = taxCalculation.totalTaxBurden * 0.9; // Slightly lower estimate

    const bareBonesTotalCosts = desiredTakeHome + minimumTaxes + minimumHealthInsurance + minimumBusinessExpenses;

    // Maximum realistic hours (no PTO buffer, high utilization)
    const maxRealisticHours = 1400;

    const walkAwayRate = bareBonesTotalCosts / maxRealisticHours;

    return walkAwayRate;
  }

  /**
   * Calculate project-based rates for common project sizes
   *
   * @param {number} minimumRate - Minimum hourly rate
   * @param {number} recommendedRate - Recommended hourly rate
   * @returns {Object} Project rate examples
   */
  function calculateProjectRates(minimumRate, recommendedRate) {
    const projectHours = [20, 40, 80, 160]; // Common project sizes

    const rates = projectHours.map(hours => {
      return {
        hours: hours,
        minimumProject: Math.round(minimumRate * hours),
        recommendedProject: Math.round(recommendedRate * hours)
      };
    });

    return rates;
  }

  // ==============================================================================
  // MID-YEAR ADJUSTMENTS
  // ==============================================================================

  /**
   * Calculate mid-year rate adjustment based on progress
   * Date-aware: adjusts target based on time remaining and earnings so far
   *
   * @param {string} rateProfileId - Rate profile to adjust
   * @param {number} earnedSoFar - Revenue earned so far this year
   * @param {Date} currentDate - Current date
   * @returns {Object} Adjusted rate calculation
   */
  function calculateMidYearAdjustment(rateProfileId, earnedSoFar, currentDate) {
    // Get rate profile
    const rateProfile = SheetsDB.getRateProfileById(rateProfileId);

    if (!rateProfile) {
      throw new Error('Rate profile not found: ' + rateProfileId);
    }

    const annualGoal = rateProfile.grossIncomeNeeded;
    const hoursPerWeek = rateProfile.workingHours.hoursPerWeek;

    // Calculate progress through year
    const dayOfYear = getDayOfYear(currentDate);
    const percentOfYearComplete = dayOfYear / 365;

    // Calculate on-pace earnings
    const onPaceEarnings = annualGoal * percentOfYearComplete;
    const behindPace = earnedSoFar < onPaceEarnings;
    const gap = onPaceEarnings - earnedSoFar;

    // Calculate remaining goal
    const revenueRemaining = annualGoal - earnedSoFar;
    const weeksRemaining = 52 * (1 - percentOfYearComplete);
    const hoursRemaining = weeksRemaining * hoursPerWeek;

    // Calculate adjusted rate needed
    const adjustedRate = hoursRemaining > 0 ? revenueRemaining / hoursRemaining : rateProfile.rates.recommended;

    // Build adjustment report
    const adjustment = {
      currentDate: currentDate.toISOString(),
      percentOfYearComplete: Math.round(percentOfYearComplete * 100),

      progress: {
        annualGoal: annualGoal,
        earnedSoFar: earnedSoFar,
        onPaceEarnings: Math.round(onPaceEarnings),
        behindPace: behindPace,
        gap: Math.round(gap),
        percentOfGoal: Math.round((earnedSoFar / annualGoal) * 100)
      },

      remaining: {
        revenueNeeded: Math.round(revenueRemaining),
        weeksRemaining: Math.round(weeksRemaining),
        hoursRemaining: Math.round(hoursRemaining)
      },

      rates: {
        original: rateProfile.rates.recommended,
        adjusted: Math.round(adjustedRate),
        increase: Math.round(adjustedRate - rateProfile.rates.recommended)
      },

      recommendation: behindPace
        ? `You're behind pace by ${formatCurrency(gap)}. Raise your rate to $${Math.round(adjustedRate)}/hour to catch up.`
        : `You're on track! Continue at your current rate of $${rateProfile.rates.recommended}/hour.`
    };

    return adjustment;
  }

  // ==============================================================================
  // UTILITY FUNCTIONS
  // ==============================================================================

  /**
   * Get day of year from date
   */
  function getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

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
    calculateHourlyRate: calculateHourlyRate,
    calculateMidYearAdjustment: calculateMidYearAdjustment,
    calculateBillableHours: calculateBillableHours,
    calculateWalkAwayNumber: calculateWalkAwayNumber
  };

})();
