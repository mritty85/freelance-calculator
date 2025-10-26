/**
 * Freelance Rate Calculator - Main API Endpoints
 *
 * Handles HTTP requests from the frontend (GitHub-hosted HTML/JS)
 * Routes to appropriate calculation engines
 */

// ==============================================================================
// API ENDPOINTS
// ==============================================================================

/**
 * Handle POST requests from frontend
 */
function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action;

    Logger.log('API Request: ' + action);

    let response;

    switch(action) {
      case 'calculateBudget':
        response = calculateBudgetAPI(params);
        break;

      case 'saveBudget':
        response = saveBudgetAPI(params);
        break;

      case 'getBudget':
        response = getBudgetAPI(params);
        break;

      case 'calculateRate':
        response = calculateRateAPI(params);
        break;

      case 'getConfig':
        response = getConfigAPI(params);
        break;

      default:
        response = {
          success: false,
          error: 'Unknown action: ' + action
        };
    }

    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());

    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET requests (for testing)
 */
function doGet(e) {
  const params = e.parameter;

  if (params.action === 'test') {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Freelance Rate Calculator API is running',
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      success: false,
      error: 'Use POST requests for API calls'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==============================================================================
// API HANDLERS
// ==============================================================================

/**
 * Calculate complete budget breakdown
 * Takes user inputs, returns gross income needed with full breakdown
 */
function calculateBudgetAPI(params) {
  const inputs = params.inputs;

  // Validate required fields
  const required = ['location', 'filingStatus'];
  for (let field of required) {
    if (!inputs[field]) {
      return {
        success: false,
        error: 'Missing required field: ' + field
      };
    }
  }

  // Calculate personal expenses
  const personalExpenses = BudgetEngine.calculatePersonalExpenses(inputs.personalExpenses);

  // Calculate business overhead
  const businessOverhead = BudgetEngine.calculateBusinessOverhead(inputs.businessOverhead);

  // Calculate cash flow buffer
  const cashFlowBuffer = BudgetEngine.calculateCashFlowBuffer(
    personalExpenses.monthlyTotal,
    inputs.cashFlowBuffer
  );

  // Calculate taxes iteratively (find gross that yields desired net)
  const taxCalculation = TaxEngine.iterativeGrossCalculation(
    personalExpenses.annualTotal,
    businessOverhead,
    inputs.location,
    inputs.filingStatus
  );

  // Build complete summary
  const summary = BudgetEngine.buildBudgetSummary(
    personalExpenses,
    businessOverhead,
    taxCalculation,
    cashFlowBuffer
  );

  return {
    success: true,
    data: {
      personalExpenses: personalExpenses,
      businessOverhead: businessOverhead,
      cashFlowBuffer: cashFlowBuffer,
      taxCalculation: taxCalculation,
      summary: summary,
      calculatedAt: new Date().toISOString()
    }
  };
}

/**
 * Save budget profile to database
 */
function saveBudgetAPI(params) {
  const userId = params.userId || generateUserId();
  const budgetData = params.budgetData;

  const budgetProfileId = SheetsDB.saveBudgetProfile(userId, budgetData);

  return {
    success: true,
    data: {
      budgetProfileId: budgetProfileId,
      userId: userId
    }
  };
}

/**
 * Retrieve budget profile from database
 */
function getBudgetAPI(params) {
  const userId = params.userId;

  if (!userId) {
    return {
      success: false,
      error: 'userId required'
    };
  }

  const budgetData = SheetsDB.getBudgetProfile(userId);

  if (!budgetData) {
    return {
      success: false,
      error: 'Budget profile not found'
    };
  }

  return {
    success: true,
    data: budgetData
  };
}

/**
 * Calculate hourly rate from budget profile
 */
function calculateRateAPI(params) {
  const budgetProfileId = params.budgetProfileId;
  const workingHours = params.workingHours; // { hoursPerWeek, weeksPerYear }

  if (!budgetProfileId || !workingHours) {
    return {
      success: false,
      error: 'budgetProfileId and workingHours required'
    };
  }

  const rateCalculation = RateCalculator.calculateHourlyRate(
    budgetProfileId,
    workingHours
  );

  return {
    success: true,
    data: rateCalculation
  };
}

/**
 * Get configuration data (tax tables, defaults, etc.)
 */
function getConfigAPI(params) {
  const configKey = params.configKey;

  if (!configKey) {
    return {
      success: false,
      error: 'configKey required'
    };
  }

  const configValue = SheetsDB.getConfig(configKey);

  return {
    success: true,
    data: configValue
  };
}

// ==============================================================================
// UTILITY FUNCTIONS
// ==============================================================================

/**
 * Generate a unique user ID
 */
function generateUserId() {
  return 'user_' + Utilities.getUuid();
}

/**
 * Test function to verify all engines are loaded
 */
function testEngines() {
  Logger.log('Testing BudgetEngine: ' + typeof BudgetEngine);
  Logger.log('Testing TaxEngine: ' + typeof TaxEngine);
  Logger.log('Testing RateCalculator: ' + typeof RateCalculator);
  Logger.log('Testing SheetsDB: ' + typeof SheetsDB);

  return 'All engines loaded successfully';
}
