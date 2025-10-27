# Changelog

All notable changes to the Freelance Rate Calculator project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Project Status
- ✅ Budget Builder MVP complete and deployed
- ⏳ Rate Calculator page (next to build)
- ⏳ Testing phase with 3-5 freelancers
- ⏳ Manual validation with 10 freelancers ($49 each)

---

## [2025-10-26] - Session: Budget Builder MVP - Complete Build & Deployment 🎉

### Added
**Complete Backend (Google Apps Script):**
- `gas/Code.gs` - API endpoints with routing (calculateBudget, saveBudget, getBudget, calculateRate)
- `gas/TaxEngine.gs` - Tax calculation engine with 2025 IRS brackets
  - Self-employment tax (15.3% with SS wage base cap)
  - Federal progressive tax brackets (Single, Married, HOH)
  - State tax rates for all 50 states + DC
  - Iterative gross income calculation accounting for circular deductions
- `gas/BudgetEngine.gs` - Budget calculation engine
  - Personal expenses (simplified & detailed modes)
  - Business overhead (health insurance, retirement, expenses, PTO)
  - Cash flow buffer (payment terms + project gaps)
  - Smart defaults by service type and location
- `gas/RateCalculator.gs` - Rate calculation from budget
  - Minimum, recommended, and walk-away rates
  - Realistic billable hours with 15% buffer
  - Project rate examples (20, 40, 80, 160 hours)
  - Mid-year recalculation logic (date-aware)
- `gas/SheetsDB.gs` - Database layer for Google Sheets
  - Auto-creates sheets on first use
  - JSON column storage for complex data
  - CRUD operations for all tables
- `gas/Utils.gs` - Helper functions (formatting, validation, logging)
- `gas/appsscript.json` - GAS configuration with OAuth scopes

**Complete Frontend (Static HTML/CSS/JS):**
- `public/index.html` - Landing page with value proposition
- `public/budget-builder.html` - Multi-step intake form (4 steps)
  - Step 1: Profile (service, location, filing status)
  - Step 2: Personal expenses (simplified with "expand for detail")
  - Step 3: Business overhead (insurance, retirement, expenses, PTO)
  - Step 4: Cash flow buffer (payment terms, project gaps)
  - Progress bar with step navigation
  - Save draft functionality
- `public/budget-results.html` - Comprehensive breakdown display
  - "The Big Reveal" - gross income needed
  - Complete breakdown (personal, overhead, taxes)
  - Tax calculation details
  - Key insights and next steps
- `public/js/config.js` - Configuration (API URL, constants, dropdowns)
- `public/js/app.js` - API client with localStorage management
  - Fetch calls to GAS Web App (CORS-friendly)
  - User ID generation (random UUID)
  - Draft save/load
  - Error handling and loading states
- `public/js/budget-form.js` - Form logic and state management
  - Multi-step navigation with validation
  - Smart defaults based on location/service
  - Progressive disclosure (simplified → detailed)
  - Form data persistence
- `public/css/styles.css` - Complete styling
  - Clean, professional design
  - Mobile responsive
  - Progress bar components
  - Alert/message boxes

**Documentation:**
- `README.md` - Complete project overview with quick start guide
- `docs/DEPLOYMENT_GUIDE.md` - Step-by-step deployment instructions (45-60 min)
- `docs/BUDGET_BUILDER_SPEC.md` - Detailed feature specification
- `PROJECT_SUMMARY.md` - Session summary and architecture overview
- `sheets/Users.md` - Users table schema (not created in MVP - intentional)
- `sheets/BudgetProfiles.md` - Budget profiles table schema with JSON columns
- `sheets/RateProfiles.md` - Rate profiles table schema
- `sheets/Config.md` - Configuration data schema

**Deployment Infrastructure:**
- `.github/workflows/deploy.yml` - GitHub Actions workflow for Pages deployment
- Deployed to: https://mritty85.github.io/freelance-calculator/
- Google Apps Script deployed as Web App (public access)

### Changed
- Updated form validation to save data before validating (fixed step 1 error)
- Removed Content-Type header from API calls to avoid CORS preflight
- Added null checks to all toggle functions (prevent JavaScript errors)
- Updated README with MVP user ID approach documentation

### Fixed
- Step 1 validation error ("Please select your location and filing status")
  - Fixed field name mismatch: `filing-status` vs `filingStatus`
  - Fixed validation order: save form data BEFORE validating
- CORS error blocking API calls from GitHub Pages
  - Removed `Content-Type: application/json` header (triggers preflight)
  - Used `redirect: follow` mode instead of `mode: cors`
- JavaScript null reference errors on Step 3
  - Added null checks for missing form elements
  - Gracefully handle missing checkboxes

### Technical Decisions
1. **No Users table in MVP** - Anonymous users with browser-generated UUIDs
   - Zero friction for validation testing
   - Privacy-friendly (no personal data collected)
   - Can add email collection in Phase 2
2. **Hybrid architecture** - GAS backend + GitHub Pages frontend
   - Fast deployment (~1 hour)
   - Zero hosting costs
   - Scales to 10,000+ users
3. **JSON columns in Sheets** - Store complex nested data
   - Avoids 50+ columns per table
   - Query on top-level fields, details in JSON
4. **Progressive disclosure** - Start simple, expand if needed
   - Simplified expenses (3 categories) by default
   - "Want to get more precise?" reveals detailed breakdown
5. **Smart defaults** - Location and service-based suggestions
   - Pre-fill suggestions reduce form friction
   - User can always override

### Database Structure
**BudgetProfiles Sheet** (auto-created):
- budgetProfileId: `budget_x1y2z3w4`
- userId: `user_27e2cc21-359f-4...` (browser-generated UUID)
- personalExpensesJSON: Complete expense breakdown
- overheadJSON: Business overhead details
- cashFlowJSON: Buffer calculations
- taxesJSON: Tax breakdown with all deductions
- summaryJSON: Final budget summary

### Testing Results
✅ Complete budget flow works end-to-end:
1. User fills 4-step form
2. API calculates budget with accurate taxes
3. Results display comprehensive breakdown
4. Data saves to BudgetProfiles sheet
5. Draft state persists across sessions

**Test Case:**
- Location: California (Single)
- Service: Web Development
- Expenses: $4,000 essential + $800 debt + $700 lifestyle = $5,500/month
- Overhead: $600 health insurance, 10% retirement, $500 business expenses
- Result: ~$135,000-$140,000 gross income needed
- Data successfully saved to Google Sheets ✅

### Notes
- **Deployment time:** Approximately 6 hours from zero to fully working app
- **Lines of code:** 11,079 insertions across 32 files
- **GitHub repo:** https://github.com/mritty85/freelance-calculator
- **Live site:** https://mritty85.github.io/freelance-calculator/
- **GAS deployment:** Public Web App with "Anyone" access
- **Key insight:** CORS with GAS requires avoiding custom headers in fetch()
- **MVP is LIVE and functional** - Ready for testing with real users

### What's Working
✅ Multi-step form with validation
✅ Smart defaults and progressive disclosure
✅ Accurate 2025 tax calculations (federal, state, SE tax)
✅ Iterative gross income calculation
✅ Complete budget breakdown display
✅ Data persistence to Google Sheets
✅ Draft save/resume functionality
✅ Mobile responsive design
✅ Error handling and loading states

### What's Next
- Build Rate Calculator page (convert budget → hourly rate)
- Test with 3-5 freelancers
- Fix any bugs or UX issues
- Prepare for paid validation ($49 × 10 users)

---

## [2025-10-26] - Initial Project Documentation

### Added
- Created organized project structure with separate folders:
  - `/docs/` - Strategic and technical documentation
  - `/validation/` - Validation playbooks and research
  - `/calculations/` - Mathematical formulas and tax logic
  - `/archive/` - Historical documents
- **CLAUDE.md** - Quick reference context for Claude Code sessions
- **docs/BUSINESS_PLAN.md** - Market analysis, business model, GTM strategy, risk analysis
- **docs/PRODUCT_SPEC.md** - Feature specifications, technical architecture, UX flows
- **calculations/CALCULATIONS.md** - Complete tax calculation formulas, rate logic, worked examples
- **CHANGELOG.md** - This file for tracking project changes over time

### Changed
- Reorganized documentation from two overlapping files into four purpose-specific documents
- Moved `freelance-rate-concierge-mvp.md` to `/validation/` folder

### Archived
- `FREELANCE_RATE_CALCULATOR.md` - Original strategic overview (moved to `/archive/`)
- `freelance-rate-blueprint.md` - Original product blueprint (moved to `/archive/`)

### Notes
- Documentation structure designed for long-term maintenance
- Separation of concerns: Business strategy, product features, and calculations isolated
- All calculation logic centralized in `/calculations/CALCULATIONS.md` for easy validation

---

## Session Log Template

**Use this format to log significant changes at the end of each Claude Code session:**

```markdown
## [YYYY-MM-DD] - Session: [Brief Description]

### Added
- New features, files, or functionality

### Changed
- Modifications to existing features or documentation

### Fixed
- Bug fixes or corrections

### Removed
- Deprecated features or cleaned up code

### Notes
- Important context, decisions made, or blockers encountered
```

---

## Future Milestones

### Phase 0: Validation (Weeks 1-2)
- [ ] Manual validation with 10 freelancers
- [ ] Test calculation accuracy with real data
- [ ] Validate market data scraping approach
- [ ] Collect testimonials and feedback

### Phase 1: POC (Weeks 3-8)
- [ ] Build rate calculator engine (Google Apps Script)
- [ ] Implement market data scraping
- [ ] Integrate Claude API for script generation
- [ ] Create results dashboard

### Phase 2: Beta (Weeks 9-16)
- [ ] Add offer evaluator feature
- [ ] Build rate tracking dashboard
- [ ] Implement quarterly market updates
- [ ] Test with 50 users

### Phase 3: Scale (Months 5-12)
- [ ] Launch community rate database
- [ ] Add AI negotiation coach
- [ ] Implement tax planning tools
- [ ] Build proposal templates

---

## Decision Log

**Important decisions and their rationale:**

### 2025-10-26: Google Apps Script for MVP
- **Decision:** Use Google Apps Script instead of Next.js/Python
- **Rationale:** Founder has experience, zero hosting costs, fast prototyping (2-4 weeks to MVP)
- **Trade-off:** May need to migrate later if GAS limitations become blocking

### 2025-10-26: Validate Before Building
- **Decision:** Manual concierge MVP with 10 customers before writing any code
- **Rationale:** Avoid building the wrong thing, validate willingness to pay, understand what users value most
- **Success criteria:** 8+ say "worth it", 6+ would pay $29/month, 5+ raise rates

### 2025-10-26: No Integrations in Phase 1
- **Decision:** No FreshBooks, QuickBooks, or CRM integrations initially
- **Rationale:** Reduces complexity, faster to ship, keeps focus on core value (calculations + market data + scripts)
- **Future:** Can add integrations in Phase 2+ if validated

---

## Last Updated

October 26, 2025 - Initial changelog created
