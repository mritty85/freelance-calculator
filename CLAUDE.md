# Freelance Rate Calculator - Claude Code Context

## Current Status

**Phase:** Pre-validation (manual MVP)
**Build Status:** Nothing built yet - validate first
**Decision Point:** Need 8/10 validation success before building anything

---

## Project Mission

Tool that helps freelancers calculate accurate rates, see market data, and get negotiation scripts.

**Problem:** Freelancers are leaving $10k-30k annually on the table due to:
- Inaccurate rate calculations (existing tools get tax math wrong)
- No market validation (don't know what others charge)
- Fear of negotiation (lack confidence to ask for more)

**Solution:** Two-part contextual calculator:
1. Rate Target Calculator (accurate math + date-aware adjustments)
2. Gig Negotiation Coach (offer evaluation + custom scripts)

---

## Tech Stack (When We Build)

**Phase 1 (POC):**
- Google Apps Script (founder experienced with this)
- Google Sheets (data storage)
- HTML forms (multi-step intake)
- Claude API (script generation, market analysis)
- Web scraping (market data collection)

**Why Google Apps Script:**
- Founder already built complex project in this stack
- Fast to prototype (2-4 weeks to MVP)
- Zero hosting costs
- Privacy angle: "Your data stays in your Google account"

**Phase 2+ (if successful):**
- Consider migration to Next.js + Python backend
- Only if GAS limitations become blocking
- Only after revenue justifies investment

---

## Critical Focus: Calculations First

**Before building ANY UI, we must perfect:**

1. **Self-employment tax calculations**
   - 15.3% (12.4% SS + 2.9% Medicare) on 92.35% of net earnings
   - Half is deductible from taxable income
   - Additional 0.9% Medicare tax over $200k/$250k

2. **Realistic billable hours**
   - Reality: 1000-1400 hours/year (NOT 2080)
   - Account for proposals, admin, gaps between projects
   - Use 15% buffer on user estimates

3. **State-specific tax rates**
   - Progressive brackets for CA, NY, NJ
   - Flat rates for MA, IL, PA
   - No income tax for TX, FL, WA, etc.

4. **Benefits replacement costs**
   - Health insurance: $500-800/month individual
   - Retirement: 10-15% of gross
   - PTO equivalent: 2-4 weeks unpaid time

5. **Cash flow buffer requirements**
   - Net 30/60/90 payment terms
   - Seasonal fluctuations
   - Project gaps

**See:** `/calculations/CALCULATIONS.md` for all formulas and examples

---

## Project Structure

```
/Freelance Calculator/
├── docs/
│   ├── BUSINESS_PLAN.md      # Market, GTM, pricing, risks
│   └── PRODUCT_SPEC.md        # Features, architecture, data models
├── validation/
│   └── concierge-mvp.md       # Manual validation playbook
├── calculations/
│   └── CALCULATIONS.md         # All tax/rate formulas (CRITICAL)
├── archive/
│   └── [old docs]              # Original merged documents
└── CLAUDE.md                   # This file
```

---

## Key Differentiators to Emphasize

1. **Accurate calculations** - Existing tools get tax math wrong (30-40% error)
2. **Date-aware** - Adapts to when you run it (mid-year recalculation)
3. **Progress-aware** - Factors in what you've earned so far
4. **Market intelligence** - Shows what others actually charge
5. **Negotiation scripts** - Confidence to ask for higher rates
6. **Outcome tracking** - "You've earned $60k more since joining"

---

## Critical Constraints

**Do NOT build:**
- ❌ Integrations (FreshBooks, QuickBooks, etc.)
- ❌ CRM functionality (not competing with FreshBooks)
- ❌ Daily data entry requirements (quarterly updates max)
- ❌ Mobile app (web-only for MVP)
- ❌ Real-time bank connections
- ❌ Automatic invoice tracking

**Focus ON:**
- ✅ Accurate calculations (see `/calculations/CALCULATIONS.md`)
- ✅ Context-aware intelligence (date, progress, situation)
- ✅ Actionable guidance (scripts, recommendations, walk-away numbers)
- ✅ Market data (scraped + user-contributed)

---

## Validation Plan (Weeks 1-2)

**Do this BEFORE coding anything:**

1. **Recruit 10 freelancers** ($49 each for manual analysis)
2. **Deliver manually:**
   - Rate analysis spreadsheet
   - Market intelligence report
   - Custom negotiation scripts
   - 30-minute consultation

3. **Success criteria (MUST hit these):**
   - ✅ 8+ of 10 say "worth way more than $49"
   - ✅ 6+ would pay $29/month for tool
   - ✅ 5+ actually raise their rates within 30 days

4. **If validation fails → Reassess or pivot**

**See:** `/validation/concierge-mvp.md` for complete playbook

---

## Development Phases

### Phase 0: Validation (Weeks 1-2)
- Manual delivery to 10 customers
- Validate calculations with real data
- Test market data scraping feasibility
- Collect testimonials and feedback

### Phase 1: POC (Weeks 3-8)
- Build rate calculator engine
- Implement market data scraping
- Integrate Claude API for script generation
- Create results dashboard

### Phase 2: Beta (Weeks 9-16)
- Add offer evaluator
- Build rate tracking dashboard
- Implement quarterly market updates
- Test with 50 users

### Phase 3: Scale (Months 5-12)
- Community rate database
- AI negotiation coach
- Tax planning tools
- Proposal templates

---

## Success Metrics

**Validation (Weeks 1-2):**
- 8+ of 10 say "worth it"
- 6+ would pay $29/month
- 5+ raise their rates

**POC (Weeks 3-8):**
- 500+ free signups
- 5%+ conversion to paid
- <10% monthly churn
- 30+ NPS score

**Beta (Weeks 9-16):**
- 50+ paying customers
- 40%+ return within 90 days
- 60%+ report raising rates

**Scale (Months 5-12):**
- 500+ paying customers
- <7% monthly churn
- 3:1 LTV:CAC ratio

---

## Founder Context

**Background:**
- Works at HubSpot Partner Agency as solution architect
- Experienced with Google Apps Script (built complex career coach tool)
- Has friend actively freelancing (built-in beta tester + first case study)
- Personally experienced underpricing problem when freelancing

**Working Style:**
- Prefers working backwards from business goals
- Values validation before building
- Comfortable with Google Apps Script ecosystem
- Focused on practical, actionable tools

---

## Next Actions

**Immediate priorities:**

1. **Perfect calculation logic**
   - Review `/calculations/CALCULATIONS.md`
   - Build spreadsheet prototype
   - Test with 3-5 example scenarios
   - Validate tax math with CPA if possible

2. **Test market data scraping**
   - Can we scrape Upwork, Clockify, etc?
   - What data quality can we achieve?
   - How often do we need to refresh?

3. **Recruit beta testers**
   - Start with friend (built-in tester)
   - Post on Reddit r/freelance
   - Reach out via LinkedIn

4. **Only after validation succeeds:**
   - Begin coding in Google Apps Script
   - Start with Part 1 (rate calculator)
   - Target 4 weeks to shippable POC

---

## Important Reminders

**For Claude Code when working on this project:**

1. **Validate first, build later** - Do not write production code until validation metrics hit
2. **Calculations are critical** - Tax math must be 100% accurate, test extensively
3. **User context matters** - Date-aware and progress-aware are key differentiators
4. **Keep it simple** - No integrations, no CRM, no complexity in Phase 1
5. **Market data is the moat** - Scraping + user-contributed data = competitive advantage

---

## Related Documents

- **Strategy & Market:** `/docs/BUSINESS_PLAN.md`
- **Features & Architecture:** `/docs/PRODUCT_SPEC.md`
- **Calculation Formulas:** `/calculations/CALCULATIONS.md` ⭐ CRITICAL
- **Validation Playbook:** `/validation/concierge-mvp.md`
- **Project History:** `/CHANGELOG.md` 📝

---

## Session Management

**Important:** This file should be read at the START of Claude Code sessions for context, but **updated at the END** of sessions to log progress and decisions.

**At the end of each session:**
1. Update "Last Updated" date below
2. Update "Status" and "Next Milestone" if changed
3. Log significant changes in `/CHANGELOG.md` using the session template
4. Update "Next Actions" section if priorities have shifted

This approach keeps context fresh while avoiding repetitive changelog references that consume token budget.

---

## Last Updated

October 26, 2025 - Initial Claude Code context document

**Status:** Documentation complete, ready for validation phase
**Next Milestone:** Manual validation with 10 freelancers
**Decision Point:** Build vs. pivot based on validation results
