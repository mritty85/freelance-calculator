/**
 * Freelance Rate Calculator - Configuration
 *
 * Update GAS_WEB_APP_URL with your deployed Google Apps Script URL
 */

const CONFIG = {
  // TODO: Replace with your GAS Web App URL after deployment
  // Example: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec'
  GAS_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbxLkosAY8ZC949qATh-BRDFbKcENBTDKUSnckZP_tSuoWsw_IguLpk4UOoIJPW_TIQS/exec',

  // API timeout (milliseconds)
  API_TIMEOUT: 30000,

  // Local storage keys
  STORAGE_KEYS: {
    USER_ID: 'freelance_calc_user_id',
    DRAFT_BUDGET: 'freelance_calc_draft_budget',
    BUDGET_PROFILE_ID: 'freelance_calc_budget_profile_id',
    RATE_PROFILE_ID: 'freelance_calc_rate_profile_id'
  },

  // Service types (must match BudgetEngine.gs)
  SERVICE_TYPES: [
    { value: 'web-development', label: 'Web Development' },
    { value: 'design', label: 'Design (Graphic/UI/UX)' },
    { value: 'marketing', label: 'Marketing/Social Media' },
    { value: 'writing', label: 'Writing/Content Creation' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'other', label: 'Other' }
  ],

  // Experience levels
  EXPERIENCE_LEVELS: [
    { value: '0-1', label: '0-1 years (Entry level)' },
    { value: '1-3', label: '1-3 years (Early career)' },
    { value: '3-5', label: '3-5 years (Mid-level)' },
    { value: '5-10', label: '5-10 years (Senior)' },
    { value: '10+', label: '10+ years (Expert)' }
  ],

  // Filing status
  FILING_STATUS: [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married filing jointly' },
    { value: 'hoh', label: 'Head of household' }
  ],

  // US States
  US_STATES: [
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' },
    { value: 'DC', label: 'District of Columbia' }
  ],

  // Payment terms options
  PAYMENT_TERMS: [
    { value: 15, label: 'Net 15 (2 weeks)' },
    { value: 30, label: 'Net 30 (1 month)' },
    { value: 60, label: 'Net 60 (2 months)' },
    { value: 90, label: 'Net 90 (3 months)' }
  ]
};

// Freeze config to prevent modifications
Object.freeze(CONFIG);
