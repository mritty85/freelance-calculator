/**
 * Freelance Rate Calculator - Utility Functions
 *
 * Common helper functions used across the application
 */

const Utils = (function() {
  'use strict';

  // ==============================================================================
  // FORMATTING
  // ==============================================================================

  /**
   * Format number as currency
   */
  function formatCurrency(amount, includeCents) {
    includeCents = includeCents || false;

    const rounded = includeCents ? amount : Math.round(amount);
    const formatted = rounded.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: includeCents ? 2 : 0,
      maximumFractionDigits: includeCents ? 2 : 0
    });

    return formatted;
  }

  /**
   * Format number as percentage
   */
  function formatPercent(decimal, decimals) {
    decimals = decimals || 1;
    const percent = decimal * 100;
    return percent.toFixed(decimals) + '%';
  }

  /**
   * Format number with commas
   */
  function formatNumber(num, decimals) {
    decimals = decimals || 0;
    return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // ==============================================================================
  // VALIDATION
  // ==============================================================================

  /**
   * Validate required fields
   */
  function validateRequired(obj, requiredFields) {
    const missing = [];

    for (let field of requiredFields) {
      if (!obj[field] && obj[field] !== 0) {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      throw new Error('Missing required fields: ' + missing.join(', '));
    }

    return true;
  }

  /**
   * Validate email format
   */
  function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Validate state code
   */
  function validateStateCode(state) {
    const validStates = [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
      'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
      'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
      'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
      'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
    ];

    return validStates.includes(state.toUpperCase());
  }

  // ==============================================================================
  // DATE UTILITIES
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
   * Get percent of year complete
   */
  function getPercentOfYearComplete(date) {
    const dayOfYear = getDayOfYear(date);
    return dayOfYear / 365;
  }

  /**
   * Format date as ISO string
   */
  function formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  // ==============================================================================
  // CALCULATION HELPERS
  // ==============================================================================

  /**
   * Calculate percentage
   */
  function calculatePercent(part, whole) {
    if (whole === 0) return 0;
    return (part / whole) * 100;
  }

  /**
   * Round to nearest multiple
   */
  function roundToNearest(num, nearest) {
    return Math.round(num / nearest) * nearest;
  }

  /**
   * Clamp number between min and max
   */
  function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
  }

  // ==============================================================================
  // OBJECT HELPERS
  // ==============================================================================

  /**
   * Deep clone object
   */
  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Merge objects (shallow)
   */
  function merge(target, source) {
    return Object.assign({}, target, source);
  }

  /**
   * Get nested property safely
   */
  function getNestedProperty(obj, path) {
    const keys = path.split('.');
    let current = obj;

    for (let key of keys) {
      if (current && current.hasOwnProperty(key)) {
        current = current[key];
      } else {
        return undefined;
      }
    }

    return current;
  }

  // ==============================================================================
  // LOGGING
  // ==============================================================================

  /**
   * Log with timestamp
   */
  function log(message, data) {
    const timestamp = new Date().toISOString();
    Logger.log(timestamp + ' - ' + message);

    if (data) {
      Logger.log(JSON.stringify(data, null, 2));
    }
  }

  /**
   * Log error with stack trace
   */
  function logError(error, context) {
    const timestamp = new Date().toISOString();
    Logger.log(timestamp + ' - ERROR: ' + error.toString());

    if (context) {
      Logger.log('Context: ' + JSON.stringify(context, null, 2));
    }

    if (error.stack) {
      Logger.log('Stack: ' + error.stack);
    }
  }

  // ==============================================================================
  // PUBLIC API
  // ==============================================================================

  return {
    // Formatting
    formatCurrency: formatCurrency,
    formatPercent: formatPercent,
    formatNumber: formatNumber,

    // Validation
    validateRequired: validateRequired,
    validateEmail: validateEmail,
    validateStateCode: validateStateCode,

    // Date
    getDayOfYear: getDayOfYear,
    getPercentOfYearComplete: getPercentOfYearComplete,
    formatDate: formatDate,

    // Calculations
    calculatePercent: calculatePercent,
    roundToNearest: roundToNearest,
    clamp: clamp,

    // Objects
    deepClone: deepClone,
    merge: merge,
    getNestedProperty: getNestedProperty,

    // Logging
    log: log,
    logError: logError
  };

})();
