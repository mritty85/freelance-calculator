/**
 * Freelance Rate Calculator - API Client
 *
 * Handles all communication with Google Apps Script backend
 * Provides local storage for draft state
 */

const App = (function() {
  'use strict';

  // ==============================================================================
  // API CALLS
  // ==============================================================================

  /**
   * Make API call to GAS backend
   */
  async function apiCall(action, data) {
    if (CONFIG.GAS_WEB_APP_URL === 'YOUR_GAS_WEB_APP_URL_HERE') {
      throw new Error('Please configure GAS_WEB_APP_URL in config.js');
    }

    const payload = {
      action: action,
      ...data
    };

    try {
      const response = await fetch(CONFIG.GAS_WEB_APP_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Unknown error');
      }

      return result.data;

    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  /**
   * Test API connection
   */
  async function testConnection() {
    try {
      const response = await fetch(CONFIG.GAS_WEB_APP_URL + '?action=test', {
        method: 'GET'
      });

      const result = await response.json();
      return result.success;

    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  // ==============================================================================
  // BUDGET API
  // ==============================================================================

  /**
   * Calculate budget from user inputs
   */
  async function calculateBudget(inputs) {
    return await apiCall('calculateBudget', { inputs });
  }

  /**
   * Save budget profile to database
   */
  async function saveBudget(budgetData) {
    const userId = getUserId();
    return await apiCall('saveBudget', { userId, budgetData });
  }

  /**
   * Get budget profile from database
   */
  async function getBudget() {
    const userId = getUserId();
    return await apiCall('getBudget', { userId });
  }

  // ==============================================================================
  // RATE API
  // ==============================================================================

  /**
   * Calculate hourly rate from budget profile
   */
  async function calculateRate(budgetProfileId, workingHours) {
    return await apiCall('calculateRate', { budgetProfileId, workingHours });
  }

  // ==============================================================================
  // LOCAL STORAGE
  // ==============================================================================

  /**
   * Get or generate user ID
   */
  function getUserId() {
    let userId = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_ID);

    if (!userId) {
      userId = 'user_' + generateUUID();
      localStorage.setItem(CONFIG.STORAGE_KEYS.USER_ID, userId);
    }

    return userId;
  }

  /**
   * Save draft budget data
   */
  function saveDraft(draftData) {
    localStorage.setItem(
      CONFIG.STORAGE_KEYS.DRAFT_BUDGET,
      JSON.stringify(draftData)
    );
  }

  /**
   * Load draft budget data
   */
  function loadDraft() {
    const draft = localStorage.getItem(CONFIG.STORAGE_KEYS.DRAFT_BUDGET);
    return draft ? JSON.parse(draft) : null;
  }

  /**
   * Clear draft budget data
   */
  function clearDraft() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.DRAFT_BUDGET);
  }

  /**
   * Save budget profile ID
   */
  function saveBudgetProfileId(budgetProfileId) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.BUDGET_PROFILE_ID, budgetProfileId);
  }

  /**
   * Get budget profile ID
   */
  function getBudgetProfileId() {
    return localStorage.getItem(CONFIG.STORAGE_KEYS.BUDGET_PROFILE_ID);
  }

  /**
   * Save rate profile ID
   */
  function saveRateProfileId(rateProfileId) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.RATE_PROFILE_ID, rateProfileId);
  }

  /**
   * Get rate profile ID
   */
  function getRateProfileId() {
    return localStorage.getItem(CONFIG.STORAGE_KEYS.RATE_PROFILE_ID);
  }

  // ==============================================================================
  // UTILITY FUNCTIONS
  // ==============================================================================

  /**
   * Generate UUID
   */
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Format currency
   */
  function formatCurrency(amount, includeCents = false) {
    const rounded = includeCents ? amount : Math.round(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: includeCents ? 2 : 0,
      maximumFractionDigits: includeCents ? 2 : 0
    }).format(rounded);
  }

  /**
   * Format percentage
   */
  function formatPercent(decimal, decimals = 1) {
    const percent = decimal * 100;
    return percent.toFixed(decimals) + '%';
  }

  /**
   * Show loading state
   */
  function showLoading(message = 'Loading...') {
    const loader = document.getElementById('loading-overlay');
    if (loader) {
      const messageEl = loader.querySelector('.loading-message');
      if (messageEl) {
        messageEl.textContent = message;
      }
      loader.style.display = 'flex';
    }
  }

  /**
   * Hide loading state
   */
  function hideLoading() {
    const loader = document.getElementById('loading-overlay');
    if (loader) {
      loader.style.display = 'none';
    }
  }

  /**
   * Show error message
   */
  function showError(message) {
    const errorEl = document.getElementById('error-message');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';

      setTimeout(() => {
        errorEl.style.display = 'none';
      }, 5000);
    } else {
      alert('Error: ' + message);
    }
  }

  /**
   * Show success message
   */
  function showSuccess(message) {
    const successEl = document.getElementById('success-message');
    if (successEl) {
      successEl.textContent = message;
      successEl.style.display = 'block';

      setTimeout(() => {
        successEl.style.display = 'none';
      }, 3000);
    }
  }

  // ==============================================================================
  // PUBLIC API
  // ==============================================================================

  return {
    // API
    testConnection: testConnection,
    calculateBudget: calculateBudget,
    saveBudget: saveBudget,
    getBudget: getBudget,
    calculateRate: calculateRate,

    // Storage
    getUserId: getUserId,
    saveDraft: saveDraft,
    loadDraft: loadDraft,
    clearDraft: clearDraft,
    saveBudgetProfileId: saveBudgetProfileId,
    getBudgetProfileId: getBudgetProfileId,
    saveRateProfileId: saveRateProfileId,
    getRateProfileId: getRateProfileId,

    // Utilities
    formatCurrency: formatCurrency,
    formatPercent: formatPercent,
    showLoading: showLoading,
    hideLoading: hideLoading,
    showError: showError,
    showSuccess: showSuccess
  };

})();
