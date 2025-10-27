/**
 * Freelance Rate Calculator - Gig Evaluator Form Logic
 *
 * Handles multi-step form navigation, validation, and API submission
 */

(function() {
  'use strict';

  // ==============================================================================
  // STATE
  // ==============================================================================

  let currentStep = 1;
  const totalSteps = 3;

  let formData = {
    pricingModel: 'project',
    budgetProfileId: null,
    manualTargetRate: null,
    gigDetails: {},
    context: {}
  };

  // ==============================================================================
  // INITIALIZATION
  // ==============================================================================

  document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    attachEventListeners();

    // Check for budget profile ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const budgetProfileId = urlParams.get('budgetProfileId');
    if (budgetProfileId) {
      document.getElementById('budget-profile-id').value = budgetProfileId;
    }
  });

  // ==============================================================================
  // FORM INITIALIZATION
  // ==============================================================================

  function initializeForm() {
    // Set default pricing model display
    updatePricingModelDisplay();
  }

  // ==============================================================================
  // EVENT LISTENERS
  // ==============================================================================

  function attachEventListeners() {
    // Pricing model radio buttons
    const pricingRadios = document.querySelectorAll('input[name="pricing-model"]');
    pricingRadios.forEach(radio => {
      radio.addEventListener('change', function() {
        formData.pricingModel = this.value;
        updatePricingModelDisplay();
      });
    });

    // Navigation buttons
    document.getElementById('btn-next').addEventListener('click', handleNext);
    document.getElementById('btn-prev').addEventListener('click', handlePrevious);

    // Form submission
    document.getElementById('gig-form').addEventListener('submit', handleSubmit);
  }

  // ==============================================================================
  // PRICING MODEL DISPLAY
  // ==============================================================================

  function updatePricingModelDisplay() {
    const hourlyDetails = document.getElementById('hourly-details');
    const projectDetails = document.getElementById('project-details');

    if (formData.pricingModel === 'hourly') {
      hourlyDetails.style.display = 'block';
      projectDetails.style.display = 'none';

      // Mark hourly fields as required
      document.getElementById('hourly-rate').required = true;
      document.getElementById('hours-per-week').required = true;
      document.getElementById('contract-weeks').required = true;

      // Remove required from project fields
      document.getElementById('project-fee').required = false;
      document.getElementById('estimated-hours').required = false;
    } else {
      hourlyDetails.style.display = 'none';
      projectDetails.style.display = 'block';

      // Remove required from hourly fields
      document.getElementById('hourly-rate').required = false;
      document.getElementById('hours-per-week').required = false;
      document.getElementById('contract-weeks').required = false;

      // Mark project fields as required
      document.getElementById('project-fee').required = true;
      document.getElementById('estimated-hours').required = true;
    }
  }

  // ==============================================================================
  // STEP NAVIGATION
  // ==============================================================================

  function handleNext(e) {
    e.preventDefault();

    // Validate current step
    if (!validateStep(currentStep)) {
      return;
    }

    // Save current step data
    saveStepData(currentStep);

    // Move to next step
    if (currentStep < totalSteps) {
      currentStep++;
      showStep(currentStep);
    }
  }

  function handlePrevious(e) {
    e.preventDefault();

    if (currentStep > 1) {
      currentStep--;
      showStep(currentStep);
    }
  }

  function showStep(stepNum) {
    // Hide all steps
    for (let i = 1; i <= totalSteps; i++) {
      document.getElementById(`step-${i}`).style.display = 'none';
    }

    // Show current step
    document.getElementById(`step-${stepNum}`).style.display = 'block';

    // Update progress bar
    updateProgressBar(stepNum);

    // Update button visibility
    updateButtons(stepNum);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateProgressBar(stepNum) {
    const percentage = ((stepNum - 1) / (totalSteps - 1)) * 100;
    document.getElementById('progress-bar-fill').style.width = percentage + '%';

    // Update step indicators
    const steps = document.querySelectorAll('.progress-step');
    steps.forEach((step, index) => {
      const stepNumber = index + 1;
      if (stepNumber < stepNum) {
        step.classList.add('completed');
        step.classList.remove('active');
      } else if (stepNumber === stepNum) {
        step.classList.add('active');
        step.classList.remove('completed');
      } else {
        step.classList.remove('active', 'completed');
      }
    });
  }

  function updateButtons(stepNum) {
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const btnSubmit = document.getElementById('btn-submit');

    if (stepNum === 1) {
      btnPrev.style.display = 'none';
      btnNext.style.display = 'inline-block';
      btnSubmit.style.display = 'none';
    } else if (stepNum === totalSteps) {
      btnPrev.style.display = 'inline-block';
      btnNext.style.display = 'none';
      btnSubmit.style.display = 'inline-block';
    } else {
      btnPrev.style.display = 'inline-block';
      btnNext.style.display = 'inline-block';
      btnSubmit.style.display = 'none';
    }
  }

  // ==============================================================================
  // VALIDATION
  // ==============================================================================

  function validateStep(stepNum) {
    const step = document.getElementById(`step-${stepNum}`);
    const requiredFields = step.querySelectorAll('[required]');

    let isValid = true;

    requiredFields.forEach(field => {
      if (!field.value || field.value.trim() === '') {
        field.classList.add('is-invalid');
        isValid = false;
      } else {
        field.classList.remove('is-invalid');
      }
    });

    if (!isValid) {
      showError('Please fill in all required fields');
    }

    // Additional validation for step 1
    if (stepNum === 1) {
      const budgetProfileId = document.getElementById('budget-profile-id').value;
      const manualTargetRate = document.getElementById('manual-target-rate').value;

      if (!budgetProfileId && !manualTargetRate) {
        showError('Please provide either a Budget Profile ID or enter your target rate manually');
        return false;
      }
    }

    return isValid;
  }

  // ==============================================================================
  // SAVE STEP DATA
  // ==============================================================================

  function saveStepData(stepNum) {
    if (stepNum === 1) {
      // Save pricing model and target rate
      formData.budgetProfileId = document.getElementById('budget-profile-id').value || null;
      formData.manualTargetRate = parseFloat(document.getElementById('manual-target-rate').value) || null;
    } else if (stepNum === 2) {
      // Save gig details based on pricing model
      if (formData.pricingModel === 'hourly') {
        formData.gigDetails = {
          hourlyRate: parseFloat(document.getElementById('hourly-rate').value),
          hoursPerWeek: parseInt(document.getElementById('hours-per-week').value),
          contractWeeks: parseInt(document.getElementById('contract-weeks').value)
        };
      } else {
        formData.gigDetails = {
          projectFee: parseFloat(document.getElementById('project-fee').value),
          estimatedHours: parseInt(document.getElementById('estimated-hours').value),
          timelineWeeks: parseInt(document.getElementById('timeline-weeks').value) || 4
        };
      }
    } else if (stepNum === 3) {
      // Save context
      formData.context = {
        clientType: document.getElementById('client-type').value,
        urgency: document.getElementById('urgency').value,
        paymentTerms: document.getElementById('payment-terms').value,
        deliverables: document.getElementById('deliverables').value
      };
    }
  }

  // ==============================================================================
  // FORM SUBMISSION
  // ==============================================================================

  async function handleSubmit(e) {
    e.preventDefault();

    // Validate final step
    if (!validateStep(currentStep)) {
      return;
    }

    // Save final step data
    saveStepData(currentStep);

    // Show loading
    showLoading('Evaluating your gig...');

    try {
      // Submit to API
      const result = await submitGigEvaluation(formData);

      if (result.success) {
        // Redirect to results page
        const gigEvaluationId = result.data.gigEvaluationId;
        window.location.href = `gig-results.html?gigEvaluationId=${gigEvaluationId}`;
      } else {
        throw new Error(result.error || 'Evaluation failed');
      }

    } catch (error) {
      console.error('Error evaluating gig:', error);
      showError('Failed to evaluate gig: ' + error.message);
    } finally {
      hideLoading();
    }
  }

  // ==============================================================================
  // API CALLS
  // ==============================================================================

  async function submitGigEvaluation(gigData) {
    const response = await fetch(CONFIG.GAS_WEB_APP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: JSON.stringify({
        action: 'evaluateGig',
        gigData: gigData
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // ==============================================================================
  // UI HELPERS
  // ==============================================================================

  function showLoading(message) {
    const overlay = document.getElementById('loading-overlay');
    const messageEl = overlay.querySelector('.loading-message');
    messageEl.textContent = message || 'Processing...';
    overlay.style.display = 'flex';
  }

  function hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
  }

  function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';

    setTimeout(() => {
      errorDiv.style.display = 'none';
    }, 5000);
  }

  function showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    successDiv.textContent = message;
    successDiv.style.display = 'block';

    setTimeout(() => {
      successDiv.style.display = 'none';
    }, 5000);
  }

})();
