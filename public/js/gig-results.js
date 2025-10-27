/**
 * Freelance Rate Calculator - Gig Results Display Logic
 *
 * Fetches and displays gig evaluation results, market intel, and negotiation scripts
 */

(function() {
  'use strict';

  // ==============================================================================
  // STATE
  // ==============================================================================

  let gigEvaluationId = null;
  let evaluationData = null;
  let marketIntel = null;
  let scripts = null;

  // ==============================================================================
  // INITIALIZATION
  // ==============================================================================

  document.addEventListener('DOMContentLoaded', async function() {
    // Get gig evaluation ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    gigEvaluationId = urlParams.get('gigEvaluationId');

    if (!gigEvaluationId) {
      showError('No gig evaluation ID provided');
      return;
    }

    // Load evaluation data
    await loadEvaluationData();

    // Render results
    renderResults();

    // Load AI-powered features asynchronously
    loadMarketIntelligence();
    loadNegotiationScripts();

    // Attach event listeners
    attachEventListeners();
  });

  // ==============================================================================
  // DATA LOADING
  // ==============================================================================

  async function loadEvaluationData() {
    showLoading('Loading evaluation results...');

    try {
      const response = await fetch(CONFIG.GAS_WEB_APP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify({
          action: 'getGigEvaluation',
          gigEvaluationId: gigEvaluationId
        })
      });

      const result = await response.json();

      if (result.success) {
        evaluationData = result.data;
      } else {
        throw new Error(result.error || 'Failed to load evaluation');
      }

    } catch (error) {
      console.error('Error loading evaluation:', error);
      showError('Failed to load evaluation: ' + error.message);
    } finally {
      hideLoading();
    }
  }

  async function loadMarketIntelligence() {
    if (!evaluationData || !evaluationData.context) return;

    try {
      // Build context for market intelligence
      const context = {
        serviceType: evaluationData.context.serviceType || 'general',
        experience: evaluationData.context.experience || '3-5 years',
        location: evaluationData.context.location || 'US',
        pricingModel: evaluationData.pricingModel,
        deliverables: evaluationData.context.deliverables,
        clientType: evaluationData.context.clientType,
        estimatedHours: evaluationData.gigDetails.estimatedHours || evaluationData.gigDetails.hoursPerWeek,
        currentOffer: evaluationData.gigDetails.projectFee || evaluationData.gigDetails.hourlyRate,
        targetRate: evaluationData.evaluation.targetRate
      };

      const response = await fetch(CONFIG.GAS_WEB_APP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify({
          action: 'getMarketIntel',
          gigEvaluationId: gigEvaluationId,
          context: context
        })
      });

      const result = await response.json();

      if (result.success) {
        marketIntel = result.data;
        renderMarketIntelligence();
      }

    } catch (error) {
      console.error('Error loading market intelligence:', error);
    }
  }

  async function loadNegotiationScripts() {
    if (!evaluationData || !evaluationData.evaluation) return;

    // Only load scripts if verdict is not "excellent" or "good"
    const verdict = evaluationData.evaluation.comparison.verdict;
    if (verdict === 'excellent' || verdict === 'good') {
      return;
    }

    try {
      // Build context for script generation
      const context = {
        currentOffer: evaluationData.gigDetails.projectFee || evaluationData.gigDetails.hourlyRate,
        targetRate: evaluationData.evaluation.targetRate,
        projectHours: evaluationData.gigDetails.estimatedHours || (evaluationData.gigDetails.hoursPerWeek * evaluationData.gigDetails.contractWeeks),
        pricingModel: evaluationData.pricingModel,
        clientType: evaluationData.context.clientType,
        relationship: evaluationData.context.clientType === 'repeat' ? 'repeat' : 'new',
        urgency: evaluationData.context.urgency,
        deliverables: evaluationData.context.deliverables,
        percentBelow: Math.abs(evaluationData.evaluation.comparison.percentageDiff),
        verdict: verdict
      };

      const response = await fetch(CONFIG.GAS_WEB_APP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify({
          action: 'generateScripts',
          gigEvaluationId: gigEvaluationId,
          context: context
        })
      });

      const result = await response.json();

      if (result.success) {
        scripts = result.data;
        renderNegotiationScripts();
      }

    } catch (error) {
      console.error('Error loading negotiation scripts:', error);
    }
  }

  // ==============================================================================
  // RENDERING
  // ==============================================================================

  function renderResults() {
    if (!evaluationData) return;

    renderVerdict();
    renderStats();
    renderWarnings();
    renderBreakdown();
    renderCapacity();
    renderCounterOffers();
  }

  function renderVerdict() {
    const verdict = evaluationData.evaluation.comparison.verdict;
    const message = evaluationData.evaluation.recommendation.message;
    const action = evaluationData.evaluation.recommendation.action;

    const verdictSection = document.getElementById('verdict-section');

    let icon = '';
    let verdictClass = '';

    switch(verdict) {
      case 'excellent':
      case 'good':
        icon = '✅';
        verdictClass = `verdict-${verdict}`;
        break;
      case 'acceptable':
        icon = '⚠️';
        verdictClass = 'verdict-acceptable';
        break;
      case 'walk-away':
        icon = '❌';
        verdictClass = 'verdict-walk-away';
        break;
    }

    verdictSection.innerHTML = `
      <div class="verdict-card ${verdictClass}">
        <div class="verdict-icon">${icon}</div>
        <div class="verdict-message">${message}</div>
        <div class="verdict-action">Recommendation: ${action.toUpperCase()}</div>
      </div>
    `;
  }

  function renderStats() {
    const evaluation = evaluationData.evaluation;
    const breakdown = evaluation.breakdown;

    const statsGrid = document.getElementById('stats-grid');

    const effectiveRate = formatCurrency(evaluation.effectiveRate, 0);
    const targetRate = formatCurrency(evaluation.targetRate, 0);
    const totalRevenue = formatCurrency(breakdown.totalRevenue);
    const totalHours = breakdown.totalHours;

    const comparison = evaluation.comparison;
    const diffClass = comparison.difference >= 0 ? 'positive' : 'negative';
    const diffPrefix = comparison.difference >= 0 ? '+' : '';

    statsGrid.innerHTML = `
      <div class="stat-card">
        <div class="stat-label">Effective Hourly Rate</div>
        <div class="stat-value">${effectiveRate}/hr</div>
        <div class="stat-comparison ${diffClass}">
          ${diffPrefix}${formatCurrency(comparison.difference, 0)}/hr vs. target
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-label">Your Target Rate</div>
        <div class="stat-value">${targetRate}/hr</div>
        <div class="stat-comparison">From Budget Builder</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">Total Revenue</div>
        <div class="stat-value">${totalRevenue}</div>
        <div class="stat-comparison">For ${totalHours} hours of work</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">Opportunity Cost</div>
        <div class="stat-value ${diffClass}">${formatCurrency(Math.abs(evaluation.opportunityCost.totalShortfall))}</div>
        <div class="stat-comparison ${diffClass}">
          ${evaluation.opportunityCost.message}
        </div>
      </div>
    `;
  }

  function renderWarnings() {
    const warnings = evaluationData.evaluation.warnings;
    const warningsSection = document.getElementById('warnings-section');

    if (!warnings || warnings.length === 0) {
      warningsSection.style.display = 'none';
      return;
    }

    let warningsHTML = '<div class="card"><div class="card-header"><h3>⚠️ Warnings & Considerations</h3></div><div class="card-body">';

    warnings.forEach(warning => {
      const severityClass = warning.severity === 'high' ? 'high' : '';
      warningsHTML += `
        <div class="warning-box ${severityClass}">
          <strong>${warning.message}</strong>
          <p class="text-small" style="margin-top: 0.5rem; margin-bottom: 0.5rem;">${warning.detail}</p>
          <p class="text-small" style="color: #059669; margin: 0;"><strong>Suggestion:</strong> ${warning.suggestion}</p>
        </div>
      `;
    });

    warningsHTML += '</div></div>';
    warningsSection.innerHTML = warningsHTML;
  }

  function renderBreakdown() {
    const breakdown = evaluationData.evaluation.breakdown;
    const breakdownContent = document.getElementById('breakdown-content');

    let detailsHTML = '<div class="card-body">';

    if (breakdown.pricingModel === 'hourly') {
      detailsHTML += `
        <p><strong>Pricing Model:</strong> Hourly / Time & Materials</p>
        <p><strong>Hourly Rate:</strong> ${formatCurrency(breakdown.gigDetails.hourlyRate, 0)}/hr</p>
        <p><strong>Hours per Week:</strong> ${breakdown.gigDetails.hoursPerWeek}</p>
        <p><strong>Contract Length:</strong> ${breakdown.gigDetails.contractWeeks} weeks</p>
        <p><strong>Total Hours:</strong> ${breakdown.totalHours} hours</p>
        <p><strong>Total Revenue:</strong> ${formatCurrency(breakdown.totalRevenue)}</p>
      `;
    } else {
      detailsHTML += `
        <p><strong>Pricing Model:</strong> Project-based / Fixed Fee</p>
        <p><strong>Project Fee:</strong> ${formatCurrency(breakdown.gigDetails.projectFee)}</p>
        <p><strong>Estimated Hours:</strong> ${breakdown.gigDetails.estimatedHours} hours</p>
        <p><strong>Effective Hourly Rate:</strong> ${formatCurrency(breakdown.effectiveRate, 0)}/hr</p>
        <p><strong>Timeline:</strong> ${breakdown.gigDetails.timelineWeeks} weeks</p>
      `;
    }

    const diff = breakdown.totalRevenue - breakdown.targetRevenue;
    const diffClass = diff >= 0 ? 'positive' : 'negative';

    detailsHTML += `
      <hr style="margin: 1.5rem 0;">
      <p><strong>Target Revenue (at target rate):</strong> ${formatCurrency(breakdown.targetRevenue)}</p>
      <p class="stat-comparison ${diffClass}"><strong>Difference:</strong> ${formatCurrency(Math.abs(diff))} ${diff >= 0 ? 'above' : 'below'} target</p>
    `;

    detailsHTML += '</div>';
    breakdownContent.innerHTML = detailsHTML;
  }

  function renderCapacity() {
    const capacity = evaluationData.evaluation.capacityImpact;
    const capacityContent = document.getElementById('capacity-content');

    capacityContent.innerHTML = `
      <div class="card-body">
        <p>${capacity.message}</p>
        <div class="grid grid-cols-3" style="margin-top: 1rem;">
          <div class="stat-card">
            <div class="stat-label">Hours / Week</div>
            <div class="stat-value">${capacity.hoursPerWeek}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Duration</div>
            <div class="stat-value">${capacity.durationWeeks} weeks</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">% of Workweek</div>
            <div class="stat-value">${capacity.percentageOfWeek}%</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderCounterOffers() {
    // Counter-offers are generated by GigEvaluator during initial evaluation
    // For now, we'll show them only if verdict is not excellent/good
    const verdict = evaluationData.evaluation.comparison.verdict;

    if (verdict === 'excellent' || verdict === 'good') {
      return;
    }

    const counterOffersSection = document.getElementById('counter-offers-section');
    counterOffersSection.style.display = 'block';

    // This would be populated from evaluationData.counterOffers if we passed it from backend
    // For MVP, we can display the recommendation reasoning
    const reasoning = evaluationData.evaluation.recommendation.reasoning;

    let counterOffersHTML = '<div class="card-body"><ul>';
    reasoning.forEach(reason => {
      counterOffersHTML += `<li>${reason}</li>`;
    });
    counterOffersHTML += '</ul></div>';

    document.getElementById('counter-offers-content').innerHTML = counterOffersHTML;
  }

  function renderMarketIntelligence() {
    if (!marketIntel) return;

    const marketSection = document.getElementById('market-intel-section');
    marketSection.style.display = 'block';

    const marketContent = document.getElementById('market-intel-content');

    const range = marketIntel.marketRange;

    let marketHTML = '<div class="card-body">';
    marketHTML += `<p><strong>Summary:</strong> ${marketIntel.summary}</p>`;
    marketHTML += `<div class="grid grid-cols-3" style="margin-top: 1.5rem;">`;
    marketHTML += `
      <div class="stat-card">
        <div class="stat-label">Low</div>
        <div class="stat-value">${formatCurrency(range.low, 0)}/hr</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Median</div>
        <div class="stat-value">${formatCurrency(range.median, 0)}/hr</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">High</div>
        <div class="stat-value">${formatCurrency(range.high, 0)}/hr</div>
      </div>
    `;
    marketHTML += '</div>';

    if (marketIntel.factors && marketIntel.factors.length > 0) {
      marketHTML += '<p style="margin-top: 1.5rem;"><strong>Key Factors:</strong></p><ul>';
      marketIntel.factors.forEach(factor => {
        marketHTML += `<li>${factor}</li>`;
      });
      marketHTML += '</ul>';
    }

    marketHTML += '</div>';
    marketContent.innerHTML = marketHTML;
  }

  function renderNegotiationScripts() {
    if (!scripts) return;

    const scriptsSection = document.getElementById('scripts-section');
    scriptsSection.style.display = 'block';

    const scriptsContent = document.getElementById('scripts-content');

    let scriptsHTML = '<div class="card-body">';

    // Render each script
    if (scripts.assertive) {
      scriptsHTML += renderScriptCard('assertive', scripts.assertive.title, scripts.assertive.script);
    }

    if (scripts.collaborative) {
      scriptsHTML += renderScriptCard('collaborative', scripts.collaborative.title, scripts.collaborative.script);
    }

    if (scripts.alternative) {
      scriptsHTML += renderScriptCard('alternative', scripts.alternative.title, scripts.alternative.script);
    }

    scriptsHTML += '</div>';
    scriptsContent.innerHTML = scriptsHTML;

    // Attach toggle listeners
    attachScriptToggleListeners();
  }

  function renderScriptCard(id, title, script) {
    return `
      <div class="script-section">
        <div class="script-header" data-script="${id}">
          <strong>${title}</strong>
          <span>▼</span>
        </div>
        <div class="script-content" id="script-${id}">
          <div class="script-text">${script}</div>
          <button class="copy-btn" data-copy="${id}">Copy to Clipboard</button>
        </div>
      </div>
    `;
  }

  // ==============================================================================
  // EVENT LISTENERS
  // ==============================================================================

  function attachEventListeners() {
    // Export button
    document.getElementById('btn-export').addEventListener('click', handleExport);

    // New evaluation button
    document.getElementById('btn-new-evaluation').addEventListener('click', function() {
      window.location.href = 'gig-evaluator.html';
    });
  }

  function attachScriptToggleListeners() {
    const headers = document.querySelectorAll('.script-header');
    headers.forEach(header => {
      header.addEventListener('click', function() {
        const scriptId = this.getAttribute('data-script');
        const content = document.getElementById(`script-${scriptId}`);
        content.classList.toggle('show');
      });
    });

    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        const scriptId = this.getAttribute('data-copy');
        const scriptText = document.querySelector(`#script-${scriptId} .script-text`).textContent;
        copyToClipboard(scriptText);
        showSuccess('Script copied to clipboard!');
      });
    });
  }

  // ==============================================================================
  // ACTIONS
  // ==============================================================================

  function handleExport() {
    // For MVP, this could be a window.print()
    // In production, generate PDF via API
    window.print();
  }

  function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
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
    }, 3000);
  }

  function formatCurrency(amount, decimals = 2) {
    if (decimals === 0) {
      return '$' + Math.round(amount).toLocaleString();
    }
    return '$' + amount.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

})();
