# Freelance Rate Calculator

A comprehensive budget builder and rate calculator that helps freelancers understand their true income needs and calculate accurate hourly rates.

## 🎯 What This Tool Does

**Problem:** Freelancers leave $10k-30k annually on the table due to inaccurate rate calculations, overlooked costs, and fear of negotiation.

**Solution:**
1. **Budget Builder** - Calculates true income needs including personal expenses, business overhead, and all taxes
2. **Rate Calculator** - Converts income needs into hourly/project rates with walk-away numbers

## ✨ Key Features

- ✅ **Accurate Tax Math** - Self-employment, federal, and state taxes with proper deductions
- ✅ **Complete Picture** - Health insurance, retirement, business expenses, cash flow buffer
- ✅ **Smart Defaults** - Location and service-based suggestions
- ✅ **Transparent** - See exactly where every dollar goes
- ✅ **Date-Aware** - Mid-year recalculation (coming soon)

## 🏗️ Architecture

**Hybrid Stack:**
- **Google Apps Script (GAS)** - Backend API, calculations, database operations
- **Google Sheets** - Database (tables with JSON columns)
- **Static HTML/CSS/JS** - Frontend (hosted on GitHub/Netlify/Vercel)

**Why This Stack:**
- Fast development (2-4 weeks to MVP)
- Zero hosting costs
- No external database needed
- Privacy: "Your data stays in your Google account"
- Scalable to thousands of users

## 📁 Project Structure

```
/Freelance Calculator/
├── gas/                          # Google Apps Script backend
│   ├── Code.gs                   # API endpoints
│   ├── BudgetEngine.gs           # Budget calculations
│   ├── TaxEngine.gs              # Tax calculations
│   ├── RateCalculator.gs         # Rate calculations
│   ├── SheetsDB.gs               # Database layer
│   ├── Utils.gs                  # Utilities
│   └── appsscript.json           # GAS configuration
│
├── public/                       # Static frontend (GitHub Pages)
│   ├── index.html                # Landing page
│   ├── budget-builder.html       # Multi-step intake form
│   ├── budget-results.html       # Breakdown display
│   ├── js/
│   │   ├── config.js             # Configuration
│   │   ├── app.js                # API client
│   │   └── budget-form.js        # Form logic
│   └── css/
│       └── styles.css            # Styling
│
├── sheets/                       # Database schema docs
│   ├── Users.md
│   ├── BudgetProfiles.md
│   ├── RateProfiles.md
│   └── Config.md
│
├── docs/                         # Business docs
│   ├── BUSINESS_PLAN.md
│   ├── PRODUCT_SPEC.md
│   └── BUDGET_BUILDER_SPEC.md
│
├── calculations/                 # Calculation specifications
│   └── CALCULATIONS.md           # Tax formulas (critical!)
│
├── validation/                   # Validation phase docs
└── README.md                     # This file
```

## 🚀 Getting Started

### Prerequisites

- Google Account (for Google Sheets + Apps Script)
- GitHub account (for hosting frontend)
- Basic knowledge of JavaScript

### Step 1: Set Up Google Sheet Database

1. **Create a new Google Sheet:**
   - Go to [sheets.google.com](https://sheets.google.com)
   - Create a new blank spreadsheet
   - Name it: "Freelance Calculator Database"

2. **Note your Spreadsheet ID:**
   - Copy the ID from the URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`
   - You'll need this later

3. **Sheets will be auto-created** when first accessed by the app

### Step 2: Deploy Google Apps Script

1. **Open Script Editor:**
   - In your Google Sheet, go to Extensions → Apps Script
   - This opens the Script Editor

2. **Copy GAS Files:**
   - Delete the default `Code.gs` content
   - Copy contents from `/gas/Code.gs` and paste
   - Click the "+" button to add new files:
     - Add `TaxEngine.gs` (copy from `/gas/TaxEngine.gs`)
     - Add `BudgetEngine.gs` (copy from `/gas/BudgetEngine.gs`)
     - Add `RateCalculator.gs` (copy from `/gas/RateCalculator.gs`)
     - Add `SheetsDB.gs` (copy from `/gas/SheetsDB.gs`)
     - Add `Utils.gs` (copy from `/gas/Utils.gs`)
   - Update `appsscript.json` in Project Settings

3. **Test the Backend:**
   - In Script Editor, select `testEngines` function from dropdown
   - Click Run
   - Authorize the script when prompted
   - Check Logs - should see "All engines loaded successfully"

4. **Deploy as Web App:**
   - Click "Deploy" → "New deployment"
   - Type: "Web app"
   - Description: "Freelance Calculator API v1"
   - Execute as: "Me"
   - Who has access: "Anyone" (or "Anyone with the link" for testing)
   - Click "Deploy"
   - **Copy the Web App URL** - you'll need this for the frontend

### Step 3: Deploy Frontend

**Option A: GitHub Pages (Recommended)**

1. **Create GitHub Repository:**
   ```bash
   cd "Freelance Calculator"
   git init
   git add .
   git commit -m "Initial commit - Freelance Calculator"
   gh repo create freelance-calculator --public --source=. --remote=origin --push
   ```

2. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: Deploy from branch
   - Branch: `main`, Folder: `/public`
   - Save

3. **Your site will be live at:**
   `https://YOUR_USERNAME.github.io/freelance-calculator/`

**Option B: Netlify (Alternative)**

1. **Deploy to Netlify:**
   ```bash
   cd public
   netlify deploy
   ```

2. **Follow prompts**, set build directory to current folder

### Step 4: Configure Frontend

1. **Update API URL:**
   - Edit `/public/js/config.js`
   - Replace `YOUR_GAS_WEB_APP_URL_HERE` with your Web App URL from Step 2
   - Example: `'https://script.google.com/macros/s/AKfycbx.../exec'`

2. **Commit and push:**
   ```bash
   git add public/js/config.js
   git commit -m "Configure GAS API URL"
   git push
   ```

3. **Test the connection:**
   - Visit your deployed site
   - Open browser console (F12)
   - Type: `App.testConnection()`
   - Should return `true`

### Step 5: Initialize Database (Optional)

The database sheets will be automatically created on first use. However, you can pre-populate the Config sheet:

1. **Open your Google Sheet**
2. **Manually create a "Config" sheet**
3. **Add headers:** `configKey | configValue | lastUpdated`
4. **Add rows for tax brackets, state rates, etc.** (see `/sheets/Config.md`)

Or let the app create sheets automatically on first API call.

## 🧪 Testing

### Test Backend (GAS)

1. **Test calculation functions:**
   ```javascript
   // In GAS Script Editor, create a test function:
   function testCalculations() {
     const inputs = {
       location: 'CA',
       filingStatus: 'single',
       personalExpenses: {
         useSimplified: true,
         essential: 4000,
         debtSavings: 800,
         lifestyle: 700
       },
       businessOverhead: {
         healthInsurance: { needed: true, type: 'individual', monthlyPremium: 600 },
         retirement: { type: 'percentage', percentage: 10 },
         businessExpenses: { monthly: 500 },
         professionalDevelopment: 2000,
         ptoWeeks: 2
       },
       cashFlowBuffer: { paymentTerms: 30, gapWeeks: 2 }
     };

     const result = calculateBudgetAPI({ inputs: inputs });
     Logger.log(JSON.stringify(result, null, 2));
   }
   ```

2. **Run the test function**
3. **Check logs for budget calculation output**

### Test Frontend

1. **Open your deployed site**
2. **Complete the budget builder:**
   - Step 1: Fill in profile (CA, single, web development)
   - Step 2: Enter expenses ($4000, $800, $700)
   - Step 3: Check health insurance, enter $600/month
   - Step 4: Set payment terms Net 30, 2 weeks gap
   - Click "Calculate Budget"

3. **Verify results page displays:**
   - Gross income needed (~$135k)
   - Complete breakdown
   - Tax calculations

4. **Check browser console** for any errors

### Test with Example Scenarios

See `/calculations/CALCULATIONS.md` for test cases:
- Entry-level designer (low cost of living)
- Senior developer (high cost of living)
- Part-time consultant

## 📊 Database Schema

See `/sheets/` directory for complete schema documentation:
- **Users** - User profiles
- **BudgetProfiles** - Budget calculations (JSON columns)
- **RateProfiles** - Rate calculations
- **Config** - Tax tables, defaults

## 🔧 Configuration

### Update Tax Brackets (Annual Task)

1. **Edit `TaxEngine.gs`**
2. **Update `FEDERAL_BRACKETS_2025`** with new IRS brackets
3. **Update `STANDARD_DEDUCTION_2025`**
4. **Update `SS_WAGE_BASE_2025`**
5. **Deploy new version** of Web App

### Update State Tax Rates

1. **Edit `STATE_TAX_RATES`** in `TaxEngine.gs`
2. **Or populate Config sheet** for dynamic updates

### Update Smart Defaults

1. **Edit `SERVICE_DEFAULTS`** in `BudgetEngine.gs`
2. **Or populate Config sheet** for dynamic updates

## 🚦 Current Status

**Phase:** MVP Development Complete
**Next:** Manual validation with 10 freelancers

**What's Built:**
- ✅ Complete backend calculation engines
- ✅ Budget builder multi-step form
- ✅ Results breakdown display
- ✅ Google Sheets database layer
- ✅ API endpoints and frontend integration

**What's Next:**
- ⏳ Rate calculator page (converts budget to hourly rate)
- ⏳ Mid-year recalculation feature
- ⏳ Market intelligence module
- ⏳ Negotiation script generator

## 📝 Important Notes

### Tax Calculations
- Based on 2025 IRS tax brackets
- Includes self-employment tax (15.3%)
- Accounts for SE tax deduction and health insurance deduction
- State tax uses flat/median rates (simplified for MVP)
- **Disclaimer: For planning purposes only, consult CPA for filing**

### Data Privacy & User IDs
- **No authentication in MVP** - Users are anonymous
- **User IDs**: Random UUIDs generated in browser (e.g., `user_27e2cc21-359f...`)
- **Stored in localStorage** - Same browser = same user ID for draft resume
- **BudgetProfiles table only** - No Users table created in MVP
- **No personal data collected** - No email, no login required
- **Privacy-friendly** - Calculate rates without giving up any information

**Why no Users table?**
- Zero friction for validation testing
- Users can calculate immediately
- No signup barrier
- Perfect for MVP validation phase

**Future:** After validation, add optional email collection for quarterly updates

### Performance
- GAS Web App can handle ~100 req/min
- Response time: 500ms-2s for complex calculations
- Sheets database: tested to 10,000+ rows
- Consider caching for high traffic

## 🐛 Troubleshooting

### "GAS_WEB_APP_URL not configured"
→ Update `/public/js/config.js` with your Web App URL

### "Failed to calculate budget" error
→ Check GAS logs (View → Logs in Script Editor)
→ Verify all calculation engines are loaded

### Frontend not loading
→ Check GitHub Pages is enabled
→ Verify files are in `/public` directory
→ Check browser console for CORS errors

### Tax calculations seem wrong
→ Verify state code matches (two-letter uppercase)
→ Check filing status is correct
→ Review TaxEngine.gs constants

## 📚 Related Documents

- **Strategy:** `/docs/BUSINESS_PLAN.md`
- **Features:** `/docs/PRODUCT_SPEC.md`
- **Calculations:** `/calculations/CALCULATIONS.md` ⭐ CRITICAL
- **Context:** `/CLAUDE.md`

## 🤝 Contributing

This is a personal project in validation phase. Contributions welcome after MVP validation succeeds.

## 📄 License

Copyright © 2025. All rights reserved.

## 🙏 Acknowledgments

Built to help freelancers know their worth and stop leaving money on the table.

---

**Last Updated:** October 26, 2025
**Version:** 1.0.0 (MVP)
**Status:** Ready for validation testing
