# Budget Builder - Detailed Specification

## Overview

The Budget Builder is the core intake system that calculates a freelancer's complete monthly/annual income needs by building up from personal expenses, business overhead, cash flow buffer, and tax obligations.

## User Experience Philosophy

**Primary Path:** Build budget from expenses → System calculates take-home needed
**Secondary Path:** "I know I need $X/month" quick override (future enhancement)

**Key Principles:**
1. **Start simple, expand if needed** - Simplified categories with "Want to get more precise?" option
2. **Smart defaults** - Pre-fill suggestions based on location and service type
3. **Progressive disclosure** - Show complexity only when user requests it
4. **Transparent calculations** - Always show the math and assumptions
5. **Save progress** - Draft state persists in localStorage

---

## Multi-Step Form Flow

### Step 1: Profile Setup

**Purpose:** Gather basic information that drives smart defaults and tax calculations

**Fields:**

| Field | Type | Required | Options | Default | Purpose |
|-------|------|----------|---------|---------|---------|
| Primary Service | Dropdown | Yes | Web Dev, Design, Marketing, Writing, Consulting, Other | - | Smart expense defaults |
| Experience | Dropdown | No | 0-1, 1-3, 3-5, 5-10, 10+ years | 3-5 | Context (not used in MVP) |
| State | Dropdown | Yes | All 50 states + DC | - | State tax calculation |
| Filing Status | Dropdown | Yes | Single, Married, Head of Household | Single | Federal tax brackets |

**Validation:**
- Service and State are required
- If State or Service changes, recalculate smart defaults
- Update suggestion text in later steps

**Smart Defaults Triggered:**
- Business expense suggestions (based on service type)
- Essential expense suggestions (based on location cost of living)
- Health insurance cost estimates (based on location)

---

### Step 2: Personal Living Expenses

**Purpose:** Calculate desired annual take-home (what user needs in their pocket)

**Default Mode: Simplified (3 Categories)**

| Field | Type | Required | Placeholder | Help Text |
|-------|------|----------|-------------|-----------|
| Use Simplified | Checkbox | No | Checked | Use simplified categories (recommended) |
| Monthly Essential | Number | Yes | 4000 | Housing, utilities, food, transportation, insurance |
| Monthly Debt/Savings | Number | No | 800 | Student loans, credit cards, emergency fund |
| Monthly Lifestyle | Number | No | 500 | Entertainment, hobbies, travel, discretionary |

**Alternative Mode: Detailed (15+ Line Items)**

Revealed when user unchecks "Use Simplified":

- Housing (rent/mortgage)
- Utilities (electric, gas, water, internet)
- Transportation (car payment, insurance, gas, public transit)
- Food (groceries, dining out)
- Insurance (health if covered by spouse, life, disability)
- Debt Payments (itemized)
- Savings Goals (emergency fund, investment)
- Childcare
- Entertainment
- Subscriptions
- Other

**Calculation:**
```
Annual Take-Home = (Essential + Debt/Savings + Lifestyle) × 12
```

**Display:**
- Real-time calculation preview: "That's $X,XXX/year take-home"
- Location-based suggestion: "Typical for [State]: $X,XXX/month"

**Validation:**
- Essential expenses must be > 0
- All values must be non-negative
- Warn if total < $2,000/month (unrealistically low)
- Warn if total > $15,000/month (very high, confirm intentional)

---

### Step 3: Business Overhead

**Purpose:** Calculate the cost of being a freelancer (health insurance, retirement, expenses, PTO)

**Health Insurance Section**

| Field | Type | Required | Options | Default | Help Text |
|-------|------|----------|---------|---------|-----------|
| Need Insurance | Checkbox | No | Unchecked | - | I need to buy my own health insurance |
| Insurance Type | Dropdown | Conditional | Individual, Family | Individual | Reveals when "Need Insurance" checked |
| Monthly Premium | Number | Conditional | 600 | Smart default | Actual monthly premium you pay |

**Smart Defaults:**
- Individual: $600/month (adjusted by location multiplier)
- Family: $1,600/month (adjusted by location multiplier)
- Pre-fill with adjusted default, user can override

**Tax Note:** "Premiums are 100% tax deductible"

**Retirement Savings Section**

| Field | Type | Required | Options | Default |
|-------|------|----------|---------|---------|
| Retirement Type | Dropdown | No | Percentage, Fixed Amount, None | Percentage |
| Percentage | Number | Conditional | 0-50 | 10 |
| Fixed Amount | Number | Conditional | - | - |

**Help Text:** "Replaces typical employer 401k match (3-6%)"

**Calculation:**
- Percentage: Calculated as % of gross income (after iteration)
- Fixed: Used as-is in overhead calculation

**Business Expenses Section**

| Field | Type | Required | Placeholder | Help Text |
|-------|------|----------|-------------|-----------|
| Monthly Amount | Number | No | Smart default | Software, equipment, office, marketing |
| Customize | Checkbox | No | Unchecked | Break down into detail |

**Smart Default:**
- Web Development: $500/month
- Design: $400/month
- Marketing: $300/month
- Writing: $200/month
- Consulting: $300/month
- Adjusted by location multiplier

**Detailed Breakdown (if Customize checked):**
- Software/Tools
- Equipment/Hardware
- Office/Coworking
- Marketing/Ads
- Professional Services
- Other

**PTO/Unpaid Time Section**

| Field | Type | Required | Default | Help Text |
|-------|------|----------|---------|-----------|
| Weeks of PTO | Number | No | 2 | Vacation, sick days, holidays you won't bill |

**Calculation:**
```
PTO Cost = (Weeks × Hours/Week × Target Rate)
// Note: Calculated AFTER rate is determined (circular dependency)
// For budget, estimate based on average freelance rate for service type
```

**Professional Development Section**

| Field | Type | Required | Placeholder | Help Text |
|-------|------|----------|-------------|-----------|
| Annual Budget | Number | No | Smart default | Courses, conferences, certifications |

**Smart Default:** $2,000/year (varies by service type)

**Total Overhead Preview:**
- Real-time sum of all overhead components
- Display: "Total annual business overhead: $X,XXX"

---

### Step 4: Cash Flow Buffer

**Purpose:** Account for payment delays and project gaps (often overlooked cost)

**Explanation Box:**
"Freelancers face payment delays (Net 30-90) and gaps between projects. You need cash reserves to cover living expenses during these periods."

| Field | Type | Required | Options | Default |
|-------|------|----------|---------|---------|
| Payment Terms | Dropdown | No | Net 15, 30, 60, 90 | Net 30 |
| Gap Weeks | Number | No | 0-12 | 2 |

**Calculation:**
```
Buffer Months = (Payment Terms / 30) + (Gap Weeks / 4)
Buffer Needed = Monthly Expenses × Buffer Months
Annualized Cost = Buffer Needed / 3  // Amortize over 3 years
```

**Example Display:**
"You need 1.5 months of expenses ($8,250) as buffer. We'll spread this cost over 3 years = $2,750/year."

**Warning Box:**
"Cash Flow Example: If clients pay Net 60 and you have 2 weeks between projects, you need ~2.5 months of expenses as buffer."

---

## Calculation Flow

### Backend Processing

When user clicks "Calculate Budget":

1. **Validate all inputs**
   - Required fields filled
   - Values are reasonable

2. **Calculate Personal Expenses**
   ```javascript
   personalExpenses = {
     monthlyTotal: essential + debtSavings + lifestyle,
     annualTotal: monthlyTotal × 12,
     detailed: { ... }
   }
   ```

3. **Calculate Business Overhead**
   ```javascript
   overhead = {
     healthInsurance: { annualCost: premium × 12 },
     retirement: { annualCost: TBD },  // Calculated after gross
     businessExpenses: { annualCost: monthly × 12 },
     professionalDev: { annualCost: annual },
     pto: { annualCost: TBD },  // Calculated after rate
     totalAnnualCost: sum(above)
   }
   ```

4. **Calculate Cash Flow Buffer**
   ```javascript
   cashFlow = {
     bufferNeeded: monthlyExpenses × bufferMonths,
     annualizedCost: bufferNeeded / 3
   }
   ```

5. **Iterative Gross Income Calculation**
   ```javascript
   // Start with estimate
   grossEstimate = desiredNet × 1.5

   // Iterate until converged
   while (not converged) {
     // Calculate SE tax (15.3% on 92.35% of gross)
     seTax = grossEstimate × 0.9235 × 0.153
     seTaxDeduction = seTax / 2

     // Calculate taxable income
     taxableIncome = grossEstimate
       - standardDeduction
       - seTaxDeduction
       - healthInsuranceDeduction

     // Calculate federal tax (progressive brackets)
     federalTax = applyBrackets(taxableIncome, filingStatus)

     // Calculate state tax
     stateTax = taxableIncome × stateRate

     // Total taxes
     totalTaxes = seTax + federalTax + stateTax

     // Total needed
     totalNeeded = desiredNet + totalTaxes + overhead + cashFlow

     // Adjust estimate
     grossEstimate = totalNeeded
   }
   ```

6. **Build Complete Summary**
   ```javascript
   summary = {
     desiredTakeHome: personalExpenses.annualTotal,
     totalOverhead: overhead + cashFlow,
     totalTaxes: seTax + federalTax + stateTax,
     grossIncomeNeeded: convergedGross,
     breakdown: { ... }
   }
   ```

7. **Save to Database**
   - budgetProfileId generated
   - Data stored in BudgetProfiles sheet
   - Associated with userId

8. **Return Result to Frontend**
   - Complete breakdown
   - Ready for results page display

---

## Results Display

### The Big Reveal

**Hero Section:**
```
To meet all your financial goals as a freelancer, you need to earn:

$135,570
GROSS ANNUAL INCOME

That's $11,298/month
```

**Key Insight Alert:**
"💡 To take home $66,000 in your pocket, you need to earn 105% MORE ($135,570). Your tax + overhead burden is 51.3% of gross income.

This is why your W-2 salary ≠ your freelance rate! A $66k salary = needing $135k as a freelancer."

### Complete Breakdown

**Personal Take-Home** (what you live on)
- Annual Take-Home: $66,000 (48.7%)
- Monthly Take-Home: $5,500

**Business Overhead** (cost of being freelance)
- Health Insurance: $7,200
- Retirement Savings: $13,557
- Business Expenses: $6,000
- Professional Development: $2,000
- Cash Flow Buffer: $2,750
- **Subtotal Overhead:** $31,507 (23.2%)

**Tax Obligations** (unavoidable)
- Federal Income Tax: $11,340
- State Income Tax (CA): $3,400
- Self-Employment Tax: $14,130
- **Subtotal Taxes:** $28,870 (21.3%)

**TOTAL GROSS NEEDED:** $135,570 (100%)

### Tax Details Accordion

Click to expand:
- Estimated Gross Income: $135,570
- Total Deductions: $29,265
  - Standard Deduction: $15,000
  - SE Tax Deduction: $7,065
  - Health Insurance Deduction: $7,200
- Taxable Income: $70,735
- Effective Tax Rate: 21.3%

### Next Steps

"Now that you know your gross income need ($135,570), let's convert this into hourly and project rates."

**Three-step preview:**
1. Tell us your working hours (billable hours per week)
2. We'll calculate your minimum hourly rate
3. Get your recommended rate, walk-away number, and project pricing

**CTA Button:** "Continue to Rate Calculator →"

### Actions

- **Download as PDF** (future: generate PDF)
- **Email to Me** (future: send email)
- **Recalculate Budget** (clear and restart)

---

## Data Storage

### LocalStorage (Draft State)

```javascript
{
  lastStep: 3,
  service: "web-development",
  experience: "3-5",
  location: "CA",
  "filing-status": "single",
  "use-simplified": true,
  "essential-expenses": 4000,
  "debt-savings": 800,
  "lifestyle-spending": 700,
  // ... all other form fields
}
```

**Lifecycle:**
- Saved on every step navigation
- Loaded on page load if exists
- Cleared on successful submission
- Persists across browser sessions

### Google Sheets (BudgetProfiles)

```javascript
{
  budgetProfileId: "budget_x1y2z3w4",
  userId: "user_a1b2c3d4",
  createdAt: "2025-01-15T10:35:00.000Z",
  personalExpensesJSON: "{...}",
  overheadJSON: "{...}",
  cashFlowJSON: "{...}",
  taxesJSON: "{...}",
  summaryJSON: "{...}"
}
```

**See:** `/sheets/BudgetProfiles.md` for complete schema

---

## Edge Cases & Error Handling

### Input Validation

| Scenario | Validation | Error Message |
|----------|------------|---------------|
| Required field empty | Block submission | "Please fill in all required fields" |
| Negative number | Prevent entry | "Values must be positive" |
| Expenses < $1000/month | Warn | "This seems low. Is this correct?" |
| Expenses > $20,000/month | Warn | "This is very high. Double-check your numbers." |
| Invalid state code | Block | "Please select a valid state" |

### Calculation Edge Cases

| Scenario | Handling |
|----------|----------|
| Iterative calculation doesn't converge | Use max iterations (20), warn in logs |
| Gross income > $1M | Works, but note that state taxes may be wrong (progressive) |
| Gross income < $15k | Works, but warn that this may not be sustainable |
| State tax rate not found | Default to 0%, log warning |
| Zero working hours | Prevent in rate calculator (not budget builder) |

### API Error Handling

| Error | User Message | Recovery |
|-------|--------------|----------|
| Network failure | "Unable to connect. Please check your internet." | Retry button |
| GAS timeout | "Calculation taking too long. Please try again." | Retry button |
| Invalid response | "Something went wrong. Our team has been notified." | Log error, show support link |
| CORS error | "API connection failed. Please contact support." | Technical error (deployment issue) |

---

## Performance Considerations

### Frontend

- **Form State:** Managed in memory, synced to localStorage on changes
- **Validation:** Real-time for individual fields, comprehensive on step nav
- **Progressive Disclosure:** Hide detailed sections until requested
- **Loading States:** Show spinner during API calls (2-3 second response time)

### Backend

- **Calculation Time:** 500ms - 2 seconds (depends on iteration convergence)
- **Iteration Limit:** 20 iterations (typically converges in 5-10)
- **Database Write:** 100-500ms (Google Sheets API)
- **Total Response Time:** <3 seconds for complete budget calculation

### Optimization Opportunities

- Cache smart defaults in Config sheet (reduce hardcoding)
- Pre-calculate common scenarios (cache results)
- Optimize tax bracket lookups (use binary search)
- Batch database writes (combine operations)

---

## Future Enhancements

### Phase 2 Features

1. **Quick Override Path**
   - "I already know I need $X/month" button on landing
   - Skip directly to rate calculator with manual input

2. **Budget Templates**
   - Save multiple budget scenarios
   - Compare side-by-side
   - "Comfortable" vs "Minimum" lifestyle

3. **Detailed Expense Tracking**
   - Import from Mint/YNAB
   - Bank transaction analysis
   - Spending pattern insights

4. **Tax Scenario Modeling**
   - "What if I moved to Texas?" (no state tax)
   - "What if I was married?" (different brackets)
   - Deduction maximization tips

5. **Progress Tracking**
   - Quarterly budget reviews
   - "You're on track" vs "Behind pace" alerts
   - Historical budget comparisons

### Phase 3 Features

1. **AI-Powered Suggestions**
   - "Your expenses are 30% higher than similar freelancers"
   - "Consider increasing retirement savings"
   - "You could save $X by switching health insurance"

2. **Advanced Tax Planning**
   - Quarterly tax payment calculator
   - Deduction tracker
   - Year-end tax projection
   - S-Corp vs 1099 analysis

3. **Family Planning**
   - Dependent care expenses
   - College savings goals
   - Family health insurance optimization

---

## Related Documents

- **Tax Calculations:** `/calculations/CALCULATIONS.md`
- **Product Spec:** `/docs/PRODUCT_SPEC.md`
- **Database Schema:** `/sheets/BudgetProfiles.md`
- **Deployment:** `/docs/DEPLOYMENT_GUIDE.md`

---

**Last Updated:** October 26, 2025
**Version:** 1.0.0 (MVP)
**Status:** Specification complete, implementation ready for testing
