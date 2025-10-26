/**
 * Freelance Rate Calculator - Budget Builder Form Logic
 *
 * Handles multi-step budget intake form
 * Progressive disclosure, smart defaults, real-time preview
 */

const BudgetForm = (function() {
  'use strict';

  // Form state
  let currentStep = 1;
  const totalSteps = 4;
  let formData = {};
  let smartDefaults = {};

  // ==============================================================================
  // INITIALIZATION
  // ==============================================================================

  function init() {
    loadDraftIfExists();
    renderStep(currentStep);
    attachEventListeners();
    updateProgressBar();
  }

  function loadDraftIfExists() {
    const draft = App.loadDraft();
    if (draft) {
      formData = draft;
      if (confirm('We found a saved draft. Would you like to continue where you left off?')) {
        currentStep = draft.lastStep || 1;
      }
    }
  }

  // ==============================================================================
  // STEP NAVIGATION
  // ==============================================================================

  function nextStep() {
    saveCurrentStep(); // Save BEFORE validating
    if (validateCurrentStep()) {
      currentStep++;

      if (currentStep > totalSteps) {
        submitForm();
      } else {
        renderStep(currentStep);
        updateProgressBar();
        saveDraft();
      }
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      saveCurrentStep();
      currentStep--;
      renderStep(currentStep);
      updateProgressBar();
    }
  }

  function goToStep(step) {
    if (step >= 1 && step <= totalSteps) {
      saveCurrentStep();
      currentStep = step;
      renderStep(currentStep);
      updateProgressBar();
    }
  }

  // ==============================================================================
  // STEP RENDERING
  // ==============================================================================

  function renderStep(step) {
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(el => {
      el.style.display = 'none';
    });

    // Show current step
    const stepEl = document.getElementById(`step-${step}`);
    if (stepEl) {
      stepEl.style.display = 'block';
    }

    // Update navigation buttons
    document.getElementById('btn-prev').style.display = step > 1 ? 'inline-block' : 'none';
    document.getElementById('btn-next').textContent = step === totalSteps ? 'Calculate Budget' : 'Next Step';

    // Populate fields with existing data
    populateStepFields(step);

    // Scroll to top
    window.scrollTo(0, 0);
  }

  function populateStepFields(step) {
    const stepEl = document.getElementById(`step-${step}`);
    if (!stepEl) return;

    // Find all form inputs in this step
    stepEl.querySelectorAll('input, select, textarea').forEach(input => {
      const name = input.name;
      if (formData[name] !== undefined) {
        if (input.type === 'checkbox') {
          input.checked = formData[name];
        } else if (input.type === 'radio') {
          if (input.value === formData[name]) {
            input.checked = true;
          }
        } else {
          input.value = formData[name];
        }
      }
    });

    // Trigger any conditional displays
    if (step === 1) {
      onLocationChange();
    } else if (step === 2) {
      toggleExpenseDetail();
    } else if (step === 3) {
      toggleHealthInsurance();
      toggleBusinessExpenseDetail();
    }
  }

  function saveCurrentStep() {
    const stepEl = document.getElementById(`step-${currentStep}`);
    if (!stepEl) return;

    // Save all form inputs from current step
    stepEl.querySelectorAll('input, select, textarea').forEach(input => {
      const name = input.name;
      if (name) {
        if (input.type === 'checkbox') {
          formData[name] = input.checked;
        } else if (input.type === 'radio') {
          if (input.checked) {
            formData[name] = input.value;
          }
        } else if (input.type === 'number') {
          formData[name] = parseFloat(input.value) || 0;
        } else {
          formData[name] = input.value;
        }
      }
    });

    formData.lastStep = currentStep;
  }

  // ==============================================================================
  // VALIDATION
  // ==============================================================================

  function validateCurrentStep() {
    const stepEl = document.getElementById(`step-${currentStep}`);
    if (!stepEl) return false;

    let isValid = true;
    let errorMessage = '';

    // Find required fields
    stepEl.querySelectorAll('[required]').forEach(input => {
      if (!input.value || (input.type === 'number' && input.value < 0)) {
        isValid = false;
        input.classList.add('error');

        if (!errorMessage) {
          errorMessage = 'Please fill in all required fields';
        }
      } else {
        input.classList.remove('error');
      }
    });

    // Step-specific validation
    if (currentStep === 1) {
      if (!formData.location || !formData['filing-status']) {
        isValid = false;
        errorMessage = 'Please select your location and filing status';
      }
    }

    if (!isValid) {
      App.showError(errorMessage);
    }

    return isValid;
  }

  // ==============================================================================
  // SMART DEFAULTS & CONDITIONAL DISPLAY
  // ==============================================================================

  function onLocationChange() {
    const location = document.getElementById('location').value;
    const service = document.getElementById('service').value;

    if (location && service) {
      // Note: We'd call API here to get smart defaults, but for simplicity:
      // Using local calculation for now
      updateSmartDefaults(service, location);
    }
  }

  function updateSmartDefaults(service, location) {
    // Simple default multipliers (production would call API)
    const baseExpenses = {
      'web-development': 500,
      'design': 400,
      'marketing': 300,
      'writing': 200,
      'consulting': 300
    };

    const locationMultipliers = {
      'CA': 1.3, 'NY': 1.3, 'MA': 1.2,
      'TX': 0.95, 'FL': 1.0, 'IL': 1.05
    };

    const base = baseExpenses[service] || 400;
    const multiplier = locationMultipliers[location] || 1.0;

    smartDefaults = {
      businessExpenses: Math.round(base * multiplier),
      essentialExpenses: Math.round(3500 * multiplier),
      healthInsuranceIndividual: Math.round(600 * multiplier),
      healthInsuranceFamily: Math.round(1600 * multiplier)
    };

    // Update suggestion text
    updateSuggestionText();
  }

  function updateSuggestionText() {
    const suggestionEl = document.getElementById('expense-suggestion');
    if (suggestionEl && smartDefaults.essentialExpenses) {
      suggestionEl.textContent = `Suggested for your location: $${smartDefaults.essentialExpenses}/month`;
    }

    const bizExpenseSuggestion = document.getElementById('biz-expense-suggestion');
    if (bizExpenseSuggestion && smartDefaults.businessExpenses) {
      bizExpenseSuggestion.textContent = `Typical for your service: $${smartDefaults.businessExpenses}/month`;
    }
  }

  function toggleExpenseDetail() {
    const useSimplified = document.getElementById('use-simplified').checked;
    document.getElementById('simplified-expenses').style.display = useSimplified ? 'block' : 'none';
    document.getElementById('detailed-expenses').style.display = useSimplified ? 'none' : 'block';
  }

  function toggleHealthInsurance() {
    const needsInsurance = document.getElementById('needs-health-insurance').checked;
    document.getElementById('health-insurance-details').style.display = needsInsurance ? 'block' : 'none';
  }

  function toggleBusinessExpenseDetail() {
    const customize = document.getElementById('customize-biz-expenses').checked;
    document.getElementById('biz-expense-detail').style.display = customize ? 'block' : 'none';
  }

  // ==============================================================================
  // FORM SUBMISSION
  // ==============================================================================

  async function submitForm() {
    try {
      App.showLoading('Calculating your budget...');

      // Build API request from form data
      const inputs = buildBudgetInputs();

      // Call API
      const result = await App.calculateBudget(inputs);

      // Save budget profile
      const saved = await App.saveBudget(result);
      App.saveBudgetProfileId(saved.budgetProfileId);

      // Clear draft
      App.clearDraft();

      // Redirect to results page with data
      sessionStorage.setItem('budgetResult', JSON.stringify(result));
      window.location.href = 'budget-results.html';

    } catch (error) {
      console.error('Form submission error:', error);
      App.hideLoading();
      App.showError('Failed to calculate budget: ' + error.message);
    }
  }

  function buildBudgetInputs() {
    // Build personal expenses
    const personalExpenses = {
      useSimplified: formData['use-simplified'] || true
    };

    if (personalExpenses.useSimplified) {
      personalExpenses.essential = formData['essential-expenses'] || 0;
      personalExpenses.debtSavings = formData['debt-savings'] || 0;
      personalExpenses.lifestyle = formData['lifestyle-spending'] || 0;
    } else {
      personalExpenses.housing = formData['housing'] || 0;
      personalExpenses.utilities = formData['utilities'] || 0;
      personalExpenses.transportation = formData['transportation'] || 0;
      personalExpenses.food = formData['food'] || 0;
      // ... add other detailed fields
    }

    // Build business overhead
    const businessOverhead = {
      healthInsurance: {
        needed: formData['needs-health-insurance'] || false,
        type: formData['health-insurance-type'] || 'individual',
        monthlyPremium: formData['health-insurance-premium'] || 0
      },
      retirement: {
        type: formData['retirement-type'] || 'percentage',
        percentage: formData['retirement-percentage'] || 10,
        annualAmount: formData['retirement-amount'] || 0
      },
      businessExpenses: {
        monthly: formData['business-expenses-monthly'] || 0,
        detailed: {}
      },
      professionalDevelopment: formData['professional-dev'] || 0,
      ptoWeeks: formData['pto-weeks'] || 2
    };

    // Build cash flow buffer
    const cashFlowBuffer = {
      paymentTerms: formData['payment-terms'] || 30,
      gapWeeks: formData['gap-weeks'] || 2
    };

    return {
      location: formData['location'],
      filingStatus: formData['filing-status'],
      personalExpenses: personalExpenses,
      businessOverhead: businessOverhead,
      cashFlowBuffer: cashFlowBuffer
    };
  }

  // ==============================================================================
  // DRAFT MANAGEMENT
  // ==============================================================================

  function saveDraft() {
    App.saveDraft(formData);
    App.showSuccess('Progress saved');
  }

  // ==============================================================================
  // EVENT LISTENERS
  // ==============================================================================

  function attachEventListeners() {
    // Navigation buttons
    document.getElementById('btn-next')?.addEventListener('click', nextStep);
    document.getElementById('btn-prev')?.addEventListener('click', prevStep);

    // Location/Service changes
    document.getElementById('location')?.addEventListener('change', onLocationChange);
    document.getElementById('service')?.addEventListener('change', onLocationChange);

    // Toggle switches
    document.getElementById('use-simplified')?.addEventListener('change', toggleExpenseDetail);
    document.getElementById('needs-health-insurance')?.addEventListener('change', toggleHealthInsurance);
    document.getElementById('customize-biz-expenses')?.addEventListener('change', toggleBusinessExpenseDetail);

    // Save draft button
    document.getElementById('btn-save-draft')?.addEventListener('click', saveDraft);

    // Progress bar step clicks
    document.querySelectorAll('.progress-step').forEach((el, index) => {
      el.addEventListener('click', () => goToStep(index + 1));
    });
  }

  // ==============================================================================
  // PROGRESS BAR
  // ==============================================================================

  function updateProgressBar() {
    const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;
    document.getElementById('progress-bar-fill').style.width = progressPercent + '%';

    document.querySelectorAll('.progress-step').forEach((el, index) => {
      if (index + 1 < currentStep) {
        el.classList.add('completed');
        el.classList.remove('active');
      } else if (index + 1 === currentStep) {
        el.classList.add('active');
        el.classList.remove('completed');
      } else {
        el.classList.remove('active', 'completed');
      }
    });
  }

  // ==============================================================================
  // PUBLIC API
  // ==============================================================================

  return {
    init: init,
    nextStep: nextStep,
    prevStep: prevStep,
    goToStep: goToStep,
    saveDraft: saveDraft
  };

})();

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  BudgetForm.init();
});
