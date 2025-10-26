/**
 * Freelance Rate Calculator - Google Sheets Database Layer
 *
 * Handles all read/write operations to Google Sheets
 * Treats sheets as database tables with structured data
 */

const SheetsDB = (function() {
  'use strict';

  // ==============================================================================
  // CONFIGURATION
  // ==============================================================================

  // Get the active spreadsheet (must be bound to the script)
  function getSpreadsheet() {
    return SpreadsheetApp.getActiveSpreadsheet();
  }

  // Sheet names
  const SHEET_NAMES = {
    USERS: 'Users',
    BUDGET_PROFILES: 'BudgetProfiles',
    RATE_PROFILES: 'RateProfiles',
    CONFIG: 'Config'
  };

  // ==============================================================================
  // USERS SHEET
  // ==============================================================================

  /**
   * Save or update user profile
   * @param {Object} userData - User data to save
   * @returns {string} userId
   */
  function saveUser(userData) {
    const sheet = getOrCreateSheet(SHEET_NAMES.USERS);

    // Check if user exists
    const userId = userData.userId || generateId('user');
    const existingRow = findRowByColumn(sheet, 1, userId); // Column A = userId

    const row = [
      userId,
      userData.email || '',
      userData.createdAt || new Date().toISOString(),
      userData.service || '',
      userData.experience || '',
      userData.location || '',
      userData.filingStatus || ''
    ];

    if (existingRow) {
      // Update existing user
      sheet.getRange(existingRow, 1, 1, row.length).setValues([row]);
    } else {
      // Add new user
      sheet.appendRow(row);
    }

    return userId;
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Object|null} User data
   */
  function getUser(userId) {
    const sheet = getOrCreateSheet(SHEET_NAMES.USERS);
    const row = findRowByColumn(sheet, 1, userId);

    if (!row) return null;

    const data = sheet.getRange(row, 1, 1, 7).getValues()[0];

    return {
      userId: data[0],
      email: data[1],
      createdAt: data[2],
      service: data[3],
      experience: data[4],
      location: data[5],
      filingStatus: data[6]
    };
  }

  // ==============================================================================
  // BUDGET PROFILES SHEET
  // ==============================================================================

  /**
   * Save budget profile
   * @param {string} userId - User ID
   * @param {Object} budgetData - Complete budget calculation
   * @returns {string} budgetProfileId
   */
  function saveBudgetProfile(userId, budgetData) {
    const sheet = getOrCreateSheet(SHEET_NAMES.BUDGET_PROFILES);

    const budgetProfileId = generateId('budget');

    const row = [
      budgetProfileId,
      userId,
      new Date().toISOString(),
      JSON.stringify(budgetData.personalExpenses || {}),
      JSON.stringify(budgetData.businessOverhead || {}),
      JSON.stringify(budgetData.cashFlowBuffer || {}),
      JSON.stringify(budgetData.taxCalculation || {}),
      JSON.stringify(budgetData.summary || {})
    ];

    sheet.appendRow(row);

    return budgetProfileId;
  }

  /**
   * Get budget profile by ID
   * @param {string} budgetProfileId - Budget profile ID
   * @returns {Object|null} Budget data
   */
  function getBudgetProfileById(budgetProfileId) {
    const sheet = getOrCreateSheet(SHEET_NAMES.BUDGET_PROFILES);
    const row = findRowByColumn(sheet, 1, budgetProfileId);

    if (!row) return null;

    const data = sheet.getRange(row, 1, 1, 8).getValues()[0];

    return {
      budgetProfileId: data[0],
      userId: data[1],
      createdAt: data[2],
      personalExpenses: JSON.parse(data[3] || '{}'),
      businessOverhead: JSON.parse(data[4] || '{}'),
      cashFlowBuffer: JSON.parse(data[5] || '{}'),
      taxCalculation: JSON.parse(data[6] || '{}'),
      summary: JSON.parse(data[7] || '{}')
    };
  }

  /**
   * Get budget profile by user ID (most recent)
   * @param {string} userId - User ID
   * @returns {Object|null} Budget data
   */
  function getBudgetProfile(userId) {
    const sheet = getOrCreateSheet(SHEET_NAMES.BUDGET_PROFILES);
    const rows = findAllRowsByColumn(sheet, 2, userId); // Column B = userId

    if (rows.length === 0) return null;

    // Get most recent (last row)
    const lastRow = rows[rows.length - 1];
    const data = sheet.getRange(lastRow, 1, 1, 8).getValues()[0];

    return {
      budgetProfileId: data[0],
      userId: data[1],
      createdAt: data[2],
      personalExpenses: JSON.parse(data[3] || '{}'),
      businessOverhead: JSON.parse(data[4] || '{}'),
      cashFlowBuffer: JSON.parse(data[5] || '{}'),
      taxCalculation: JSON.parse(data[6] || '{}'),
      summary: JSON.parse(data[7] || '{}')
    };
  }

  // ==============================================================================
  // RATE PROFILES SHEET
  // ==============================================================================

  /**
   * Save rate profile
   * @param {Object} rateData - Rate calculation data
   * @returns {string} rateProfileId
   */
  function saveRateProfile(rateData) {
    const sheet = getOrCreateSheet(SHEET_NAMES.RATE_PROFILES);

    const rateProfileId = generateId('rate');

    const row = [
      rateProfileId,
      rateData.budgetProfileId,
      new Date().toISOString(),
      rateData.workingHours.hoursPerWeek,
      rateData.workingHours.weeksPerYear,
      rateData.workingHours.realisticAnnual,
      rateData.rates.minimum,
      rateData.rates.recommended,
      rateData.rates.walkAway,
      JSON.stringify(rateData)
    ];

    sheet.appendRow(row);

    return rateProfileId;
  }

  /**
   * Get rate profile by ID
   * @param {string} rateProfileId - Rate profile ID
   * @returns {Object|null} Rate data
   */
  function getRateProfileById(rateProfileId) {
    const sheet = getOrCreateSheet(SHEET_NAMES.RATE_PROFILES);
    const row = findRowByColumn(sheet, 1, rateProfileId);

    if (!row) return null;

    const data = sheet.getRange(row, 1, 1, 10).getValues()[0];

    return JSON.parse(data[9] || '{}');
  }

  // ==============================================================================
  // CONFIG SHEET
  // ==============================================================================

  /**
   * Get configuration value
   * @param {string} configKey - Configuration key
   * @returns {any} Configuration value
   */
  function getConfig(configKey) {
    const sheet = getOrCreateSheet(SHEET_NAMES.CONFIG);
    const row = findRowByColumn(sheet, 1, configKey);

    if (!row) return null;

    const data = sheet.getRange(row, 2).getValue();

    // Try to parse as JSON, otherwise return as string
    try {
      return JSON.parse(data);
    } catch (e) {
      return data;
    }
  }

  /**
   * Set configuration value
   * @param {string} configKey - Configuration key
   * @param {any} configValue - Configuration value
   */
  function setConfig(configKey, configValue) {
    const sheet = getOrCreateSheet(SHEET_NAMES.CONFIG);
    const existingRow = findRowByColumn(sheet, 1, configKey);

    const valueString = typeof configValue === 'object'
      ? JSON.stringify(configValue)
      : String(configValue);

    const row = [
      configKey,
      valueString,
      new Date().toISOString()
    ];

    if (existingRow) {
      sheet.getRange(existingRow, 1, 1, 3).setValues([row]);
    } else {
      sheet.appendRow(row);
    }
  }

  // ==============================================================================
  // UTILITY FUNCTIONS
  // ==============================================================================

  /**
   * Get or create a sheet by name
   * @param {string} sheetName - Name of sheet
   * @returns {Sheet} Sheet object
   */
  function getOrCreateSheet(sheetName) {
    const ss = getSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      initializeSheet(sheet, sheetName);
    }

    return sheet;
  }

  /**
   * Initialize sheet with headers
   * @param {Sheet} sheet - Sheet object
   * @param {string} sheetName - Name of sheet
   */
  function initializeSheet(sheet, sheetName) {
    let headers = [];

    switch (sheetName) {
      case SHEET_NAMES.USERS:
        headers = ['userId', 'email', 'createdAt', 'service', 'experience', 'location', 'filingStatus'];
        break;

      case SHEET_NAMES.BUDGET_PROFILES:
        headers = ['budgetProfileId', 'userId', 'createdAt', 'personalExpensesJSON', 'overheadJSON', 'cashFlowJSON', 'taxesJSON', 'summaryJSON'];
        break;

      case SHEET_NAMES.RATE_PROFILES:
        headers = ['rateProfileId', 'budgetProfileId', 'calculatedAt', 'hoursPerWeek', 'weeksPerYear', 'realisticHours', 'minimumRate', 'recommendedRate', 'walkAwayRate', 'fullDataJSON'];
        break;

      case SHEET_NAMES.CONFIG:
        headers = ['configKey', 'configValue', 'lastUpdated'];
        break;
    }

    if (headers.length > 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  }

  /**
   * Find row number by value in specific column
   * @param {Sheet} sheet - Sheet object
   * @param {number} column - Column number (1-indexed)
   * @param {string} value - Value to search for
   * @returns {number|null} Row number or null
   */
  function findRowByColumn(sheet, column, value) {
    const data = sheet.getDataRange().getValues();

    for (let i = 0; i < data.length; i++) {
      if (data[i][column - 1] === value) {
        return i + 1; // Return 1-indexed row number
      }
    }

    return null;
  }

  /**
   * Find all rows by value in specific column
   * @param {Sheet} sheet - Sheet object
   * @param {number} column - Column number (1-indexed)
   * @param {string} value - Value to search for
   * @returns {Array} Array of row numbers
   */
  function findAllRowsByColumn(sheet, column, value) {
    const data = sheet.getDataRange().getValues();
    const rows = [];

    for (let i = 0; i < data.length; i++) {
      if (data[i][column - 1] === value) {
        rows.push(i + 1); // 1-indexed row numbers
      }
    }

    return rows;
  }

  /**
   * Generate unique ID
   * @param {string} prefix - Prefix for ID
   * @returns {string} Unique ID
   */
  function generateId(prefix) {
    const uuid = Utilities.getUuid().substring(0, 8);
    return prefix + '_' + uuid;
  }

  // ==============================================================================
  // PUBLIC API
  // ==============================================================================

  return {
    // Users
    saveUser: saveUser,
    getUser: getUser,

    // Budget Profiles
    saveBudgetProfile: saveBudgetProfile,
    getBudgetProfile: getBudgetProfile,
    getBudgetProfileById: getBudgetProfileById,

    // Rate Profiles
    saveRateProfile: saveRateProfile,
    getRateProfileById: getRateProfileById,

    // Config
    getConfig: getConfig,
    setConfig: setConfig,

    // Utility
    getOrCreateSheet: getOrCreateSheet,
    initializeSheet: initializeSheet
  };

})();
