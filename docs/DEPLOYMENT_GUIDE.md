# Freelance Rate Calculator - Deployment Guide

Complete step-by-step instructions for deploying the Freelance Rate Calculator.

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] Google Account with access to Google Sheets and Apps Script
- [ ] GitHub account (for frontend hosting)
- [ ] Git installed locally
- [ ] Text editor (VS Code, Sublime, etc.)
- [ ] Basic JavaScript knowledge
- [ ] 30-60 minutes for initial setup

## 🗓️ Deployment Timeline

- **Google Sheet Setup:** 5 minutes
- **Apps Script Deployment:** 15-20 minutes
- **Frontend Configuration:** 10 minutes
- **Testing:** 10-15 minutes
- **Total:** ~45-60 minutes

---

## Part 1: Google Sheets Database Setup

### Step 1.1: Create Database Spreadsheet

1. **Go to Google Sheets:**
   - Navigate to [https://sheets.google.com](https://sheets.google.com)
   - Click "Blank" to create new spreadsheet

2. **Name your spreadsheet:**
   - Click "Untitled spreadsheet"
   - Rename to: `Freelance Calculator Database`

3. **Copy Spreadsheet ID:**
   - Look at the URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`
   - Copy the `SPREADSHEET_ID` (long alphanumeric string)
   - Save this ID - you'll need it later

### Step 1.2: Prepare Sheet Structure (Optional)

The app will auto-create sheets, but you can pre-create them:

1. **Rename Sheet1:**
   - Right-click "Sheet1" → Rename → "Users"

2. **Create additional sheets:**
   - Click "+" at bottom
   - Create: "BudgetProfiles", "RateProfiles", "Config"

3. **Add headers** (or let app do this automatically):
   - See `/sheets/*.md` for column headers

---

## Part 2: Google Apps Script Backend Deployment

### Step 2.1: Open Apps Script Editor

1. **From your Google Sheet:**
   - Menu: Extensions → Apps Script
   - This opens the Apps Script editor in new tab

2. **You'll see:**
   - Default `Code.gs` file with placeholder function
   - Project name: probably "Untitled project"

3. **Rename project:**
   - Click "Untitled project"
   - Rename to: `Freelance Calculator API`

### Step 2.2: Upload Backend Files

**Method A: Copy-Paste (Recommended)**

1. **Replace Code.gs:**
   - Delete all content in `Code.gs`
   - Open `/gas/Code.gs` from your local project
   - Copy entire contents
   - Paste into Apps Script `Code.gs`
   - Cmd/Ctrl+S to save

2. **Add remaining files** (repeat for each):
   - Click "+ " next to "Files"
   - Select "Script"
   - Name it exactly: `TaxEngine` (no .gs extension)
   - Copy contents from `/gas/TaxEngine.gs`
   - Paste and save
   - Repeat for:
     - `BudgetEngine`
     - `RateCalculator`
     - `SheetsDB`
     - `Utils`

3. **Your file list should show:**
   ```
   Files
   ├─ Code.gs
   ├─ TaxEngine.gs
   ├─ BudgetEngine.gs
   ├─ RateCalculator.gs
   ├─ SheetsDB.gs
   └─ Utils.gs
   ```

**Method B: Google Clasp CLI (Advanced)**

```bash
# Install clasp globally
npm install -g @google/clasp

# Login to Google
clasp login

# Create new project (from local gas/ directory)
cd gas
clasp create --type sheets --title "Freelance Calculator API"

# Push files to Apps Script
clasp push

# Open in browser
clasp open
```

### Step 2.3: Configure Project Settings

1. **Update appsscript.json:**
   - Click gear icon (⚙️) "Project Settings"
   - Check "Show 'appsscript.json' manifest file"
   - Go back to Editor
   - Click `appsscript.json` in file list
   - Replace contents with `/gas/appsscript.json`
   - Save

2. **Verify scopes:**
   ```json
   {
     "timeZone": "America/New_York",
     "dependencies": {},
     "exceptionLogging": "STACKDRIVER",
     "runtimeVersion": "V8",
     "oauthScopes": [
       "https://www.googleapis.com/auth/spreadsheets",
       "https://www.googleapis.com/auth/script.external_request"
     ]
   }
   ```

### Step 2.4: Test the Backend

1. **Run test function:**
   - Select `testEngines` from function dropdown
   - Click "Run" (▶️ button)

2. **First-time authorization:**
   - Click "Review permissions"
   - Select your Google account
   - Click "Advanced" → "Go to Freelance Calculator API (unsafe)"
   - Click "Allow"
   - **Note:** It shows "unsafe" because it's your own script, this is normal

3. **Check execution log:**
   - Click "Execution log" at bottom
   - Should see: "All engines loaded successfully"
   - If errors appear, review the error message and fix

### Step 2.5: Deploy as Web App

1. **Click "Deploy" → "New deployment"**

2. **Configure deployment:**
   - Type: Select "Web app"
   - Description: `Freelance Calculator API v1.0`
   - Execute as: **"Me (your@email.com)"**
   - Who has access: **"Anyone"**
     - For testing only: Select "Anyone with the link"
     - For production: Select "Anyone"

3. **Click "Deploy"**

4. **Copy Web App URL:**
   - You'll see a URL like: `https://script.google.com/macros/s/AKfycbx...xyz/exec`
   - **CRITICAL:** Copy this URL
   - Save it somewhere safe (TextEdit, Notes, etc.)
   - You'll need this for frontend configuration

5. **Test the Web App:**
   - Open the URL in browser
   - You should see JSON: `{"success":false,"error":"Use POST requests for API calls"}`
   - This is correct! The API only accepts POST requests from the frontend

---

## Part 3: Frontend Deployment

### Step 3.1: Prepare Local Repository

1. **Navigate to project directory:**
   ```bash
   cd ~/Documents/Freelance\ Calculator/Freelance\ Calculator
   ```

2. **Initialize git (if not already):**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Freelance Calculator MVP"
   ```

### Step 3.2: Deploy to GitHub

**Option 1: Using GitHub CLI (gh)**

```bash
# Create repository and push
gh repo create freelance-calculator --public --source=. --remote=origin --push
```

**Option 2: Using GitHub Web Interface**

1. **Create repository:**
   - Go to [github.com/new](https://github.com/new)
   - Repository name: `freelance-calculator`
   - Description: "Budget builder and rate calculator for freelancers"
   - Public
   - Don't initialize with README (you already have one)
   - Click "Create repository"

2. **Push code:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/freelance-calculator.git
   git branch -M main
   git push -u origin main
   ```

### Step 3.3: Enable GitHub Pages

1. **Go to repository settings:**
   - Navigate to your repo on GitHub
   - Click "Settings" tab
   - Scroll to "Pages" in left sidebar

2. **Configure GitHub Pages:**
   - Source: "Deploy from a branch"
   - Branch: `main`
   - Folder: `/public` (IMPORTANT!)
   - Click "Save"

3. **Wait for deployment:**
   - GitHub will build your site (takes 1-2 minutes)
   - Refresh the Settings > Pages page
   - You'll see: "Your site is live at https://YOUR_USERNAME.github.io/freelance-calculator/"

4. **Visit your site:**
   - Click the URL
   - You should see the landing page
   - **Note:** It won't work yet because we haven't configured the API URL

### Step 3.4: Configure API Connection

1. **Edit config.js locally:**
   ```bash
   nano public/js/config.js
   # Or open in your text editor
   ```

2. **Update GAS_WEB_APP_URL:**
   ```javascript
   const CONFIG = {
     // Replace this line:
     GAS_WEB_APP_URL: 'YOUR_GAS_WEB_APP_URL_HERE',

     // With your actual Web App URL from Step 2.5:
     GAS_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbx...xyz/exec',

     // ... rest of config stays the same
   ```

3. **Save and deploy:**
   ```bash
   git add public/js/config.js
   git commit -m "Configure Google Apps Script API URL"
   git push
   ```

4. **Wait for GitHub Pages to rebuild** (1-2 minutes)

---

## Part 4: Testing & Verification

### Test 4.1: API Connection Test

1. **Visit your deployed site:**
   - `https://YOUR_USERNAME.github.io/freelance-calculator/`

2. **Open browser developer tools:**
   - Press F12 (Windows/Linux) or Cmd+Option+I (Mac)
   - Click "Console" tab

3. **Test API connection:**
   ```javascript
   App.testConnection()
   ```

4. **Expected result:**
   - Should return: `true`
   - If `false`, check:
     - Is GAS_WEB_APP_URL correct in config.js?
     - Did GitHub Pages rebuild? (check Settings > Pages)
     - Any CORS errors in console?

### Test 4.2: Complete Budget Builder Flow

1. **Start budget builder:**
   - Click "Start Building Your Budget" button
   - Should navigate to `budget-builder.html`

2. **Fill out Step 1 (Profile):**
   - Service: Web Development
   - Experience: 3-5 years
   - Location: California
   - Filing Status: Single
   - Click "Next Step"

3. **Fill out Step 2 (Expenses):**
   - Keep "Use simplified categories" checked
   - Essential: $4,000
   - Debt/Savings: $800
   - Lifestyle: $700
   - Click "Next Step"

4. **Fill out Step 3 (Overhead):**
   - Check "I need to buy my own health insurance"
   - Type: Individual
   - Premium: $600
   - Retirement: 10% (default)
   - Business Expenses: $500
   - PTO: 2 weeks (default)
   - Professional Dev: $2,000
   - Click "Next Step"

5. **Fill out Step 4 (Cash Flow):**
   - Payment Terms: Net 30
   - Gap: 2 weeks
   - Click "Calculate Budget"

6. **Verify results page:**
   - Should see gross income needed (~$135,000-$140,000)
   - Complete breakdown showing:
     - Personal take-home
     - Business overhead
     - Tax obligations
   - All numbers should be calculated and displayed
   - No errors in console

### Test 4.3: Verify Database

1. **Open your Google Sheet:**
   - Navigate to "Freelance Calculator Database"

2. **Check auto-created sheets:**
   - Should see: Users, BudgetProfiles (at minimum)
   - Click "BudgetProfiles" sheet

3. **Verify data row:**
   - Should see 1 row of data (your test submission)
   - Column H (summaryJSON) should have JSON data
   - If you see data, database is working! ✅

### Test 4.4: Error Scenarios

Test these scenarios to ensure error handling works:

1. **Empty required fields:**
   - Try submitting Step 1 without selecting location
   - Should see error message: "Please fill in all required fields"

2. **Invalid API URL:**
   - Temporarily change GAS_WEB_APP_URL to `'invalid'`
   - Try submitting form
   - Should see error message
   - (Remember to change back!)

---

## Part 5: Optional Enhancements

### 5.1: Custom Domain (GitHub Pages)

1. **Buy domain** (e.g., from Namecheap, GoDaddy)

2. **Configure DNS:**
   - Add CNAME record: `www` → `YOUR_USERNAME.github.io`
   - Add A records for apex domain:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```

3. **Configure GitHub Pages:**
   - Settings > Pages > Custom domain
   - Enter: `yourdomain.com`
   - Check "Enforce HTTPS"

4. **Update config.js** with new domain if needed

### 5.2: Deploy to Netlify (Alternative to GitHub Pages)

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy:**
   ```bash
   cd public
   netlify deploy --prod
   ```

3. **Follow prompts:**
   - Authorize Netlify
   - Create new site
   - Publish directory: current directory

4. **Advantages:**
   - Faster builds
   - Better analytics
   - Form handling
   - Serverless functions (for future features)

### 5.3: Set Up Analytics

**Google Analytics:**

1. Create GA4 property
2. Add tracking code to `<head>` of HTML files:
   ```html
   <!-- Google tag (gtag.js) -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```
3. Commit and push

---

## 🐛 Troubleshooting

### Problem: "GAS_WEB_APP_URL not configured"

**Solution:**
1. Check `public/js/config.js` was updated
2. Verify the URL is wrapped in quotes
3. Confirm changes were committed and pushed
4. Wait for GitHub Pages rebuild (check Settings > Pages for status)

### Problem: API returns "401 Unauthorized" or "403 Forbidden"

**Solution:**
1. In Apps Script, redeploy as Web App
2. Ensure "Who has access" is set to "Anyone"
3. Check that script has been authorized (Step 2.4)

### Problem: Calculation returns wrong results

**Solution:**
1. Check GAS Execution Logs (View > Logs in Script Editor)
2. Verify tax brackets in `TaxEngine.gs` match 2025 IRS data
3. Test calculation function directly in Apps Script (Step 2.4)
4. Compare with examples in `/calculations/CALCULATIONS.md`

### Problem: GitHub Pages shows 404

**Solution:**
1. Verify folder is set to `/public` not `/root`
2. Check that branch is `main` not `master`
3. Ensure `index.html` exists in `/public` directory
4. Wait 2-3 minutes for rebuild

### Problem: Database not saving data

**Solution:**
1. Check Apps Script Execution Log for errors
2. Verify spreadsheet permissions (Script should have edit access)
3. Test `SheetsDB.saveBudgetProfile()` directly in Apps Script
4. Check that sheet column headers match schema

---

## 📊 Post-Deployment Checklist

- [ ] API connection test passes
- [ ] Budget builder form loads
- [ ] All 4 steps navigate correctly
- [ ] Form submission creates budget calculation
- [ ] Results page displays breakdown
- [ ] Data appears in Google Sheet
- [ ] No console errors
- [ ] Mobile responsive (test on phone)
- [ ] Loading states work
- [ ] Error messages display

---

## 🔄 Updating the Deployment

### Update Frontend Only

```bash
# Make changes to files in /public
git add public/
git commit -m "Update frontend: [description]"
git push
```

GitHub Pages will automatically rebuild.

### Update Backend Only

1. Make changes in Apps Script Editor
2. Click "Deploy" → "Manage deployments"
3. Click "Edit" (pencil icon) on latest deployment
4. Version: "New version"
5. Description: "v1.1 - [description]"
6. Click "Deploy"

**Note:** Web App URL stays the same, no frontend change needed.

### Update Both

1. Update backend in Apps Script (deploy new version)
2. Update frontend files locally
3. Git commit and push
4. Wait for GitHub Pages rebuild

---

## 📝 Deployment Notes

### Security Considerations

- **Apps Script Execution:** Runs as you, has access to your Sheets
- **API Endpoint:** Publicly accessible (anyone can call)
- **Data Privacy:** All user data stored in your Google Sheet
- **Authentication:** MVP has no authentication (users are anonymous)
- **Rate Limiting:** Google Apps Script has built-in rate limits (~100 requests/min)

### Performance Expectations

- **API Response Time:** 500ms - 2 seconds (depends on calculation complexity)
- **Frontend Load Time:** <1 second (static files from GitHub CDN)
- **Database:** Google Sheets can handle 10,000+ rows efficiently
- **Concurrent Users:** ~50-100 before hitting rate limits

### Cost Analysis

- **Google Sheets:** Free (up to 5M cells)
- **Apps Script:** Free (20 minutes/day execution time)
- **GitHub Pages:** Free
- **Custom Domain:** $10-15/year (optional)
- **Total:** $0-15/year

---

## 🎉 You're Live!

Congratulations! Your Freelance Rate Calculator is now deployed and ready to use.

**Next Steps:**
1. Test with real data (your own freelance situation)
2. Share with 2-3 trusted friends for feedback
3. Iterate based on feedback
4. Prepare for validation testing with 10 freelancers

**Support:**
- Issues: Create GitHub issue in your repo
- Questions: Review docs in `/docs` and `/calculations`
- Updates: Check `/CLAUDE.md` for project status

---

**Last Updated:** October 26, 2025
**Version:** 1.0.0
**Deployment Time:** ~45-60 minutes
