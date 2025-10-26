# Freelance Rate Calculator - Calculation Logic

## Purpose

This document contains ALL calculation formulas, tax tables, and mathematical logic for the rate calculator. This is the single source of truth for accurate rate calculations.

**Critical:** These calculations must be perfected and validated with real freelancers BEFORE any code is written.

---

## Table of Contents

1. [Core Rate Calculation Formula](#core-rate-calculation-formula)
2. [Tax Calculations](#tax-calculations)
3. [Billable Hours Estimation](#billable-hours-estimation)
4. [Benefits Replacement Costs](#benefits-replacement-costs)
5. [Cash Flow Buffer](#cash-flow-buffer)
6. [Date-Aware Adjustments](#date-aware-adjustments)
7. [Walk-Away Number](#walk-away-number)
8. [Validation Examples](#validation-examples)

---

## Core Rate Calculation Formula

### The High-Level Formula

```
Minimum Hourly Rate = Total Annual Costs ÷ Realistic Billable Hours
```

### Total Annual Costs Breakdown

```
Total Annual Costs =
    Desired Take-Home
  + Federal Income Tax
  + State Income Tax
  + Self-Employment Tax (minus deduction)
  + Health Insurance (annual)
  + Retirement Savings
  + Business Expenses (annual)
  + Benefits Replacement (PTO, sick days)
  + Cash Flow Buffer
  + Client Acquisition Costs
```

### Realistic Billable Hours

```
Realistic Billable Hours =
    (Hours Per Week billable)
  × (Weeks Per Year)
  - (Buffer for unexpected non-billable time)
```

**Reality check:** Most freelancers bill 1000-1400 hours per year, NOT 2080.

---

## Tax Calculations

### 1. Self-Employment Tax

**Rate:** 15.3% of net self-employment income
- 12.4% Social Security (on first $168,600 in 2025)
- 2.9% Medicare (no limit)
- Additional 0.9% Medicare tax on income over $200k (single) or $250k (married)

**Important:** Half of SE tax (7.65%) is deductible from gross income.

**Formula:**

```javascript
// Step 1: Calculate SE tax base (92.35% of net earnings)
seTaxBase = netSelfEmploymentIncome * 0.9235;

// Step 2: Calculate SE tax
if (seTaxBase <= 168600) {
  seTax = seTaxBase * 0.153; // Full 15.3%
} else {
  // Social Security capped, Medicare continues
  seTax = (168600 * 0.124) + (seTaxBase * 0.029);
}

// Step 3: Half is deductible
seTaxDeduction = seTax / 2;

// Step 4: Additional Medicare tax if applicable
if (filingStatus === "single" && seTaxBase > 200000) {
  additionalMedicareTax = (seTaxBase - 200000) * 0.009;
  seTax += additionalMedicareTax;
} else if (filingStatus === "married" && seTaxBase > 250000) {
  additionalMedicareTax = (seTaxBase - 250000) * 0.009;
  seTax += additionalMedicareTax;
}
```

**Example:**
- Net self-employment income: $100,000
- SE tax base: $100,000 × 0.9235 = $92,350
- SE tax: $92,350 × 0.153 = $14,130
- Deductible portion: $14,130 ÷ 2 = $7,065
- Net SE tax burden: $14,130 (but $7,065 reduces taxable income)

### 2. Federal Income Tax

**2025 Tax Brackets (Single):**

| Taxable Income | Rate |
|----------------|------|
| $0 - $11,925 | 10% |
| $11,926 - $48,475 | 12% |
| $48,476 - $103,350 | 22% |
| $103,351 - $197,300 | 24% |
| $197,301 - $250,525 | 32% |
| $250,526 - $626,350 | 35% |
| $626,351+ | 37% |

**2025 Tax Brackets (Married Filing Jointly):**

| Taxable Income | Rate |
|----------------|------|
| $0 - $23,850 | 10% |
| $23,851 - $96,950 | 12% |
| $96,951 - $206,700 | 22% |
| $206,701 - $394,600 | 24% |
| $394,601 - $501,050 | 32% |
| $501,051 - $751,600 | 35% |
| $751,601+ | 37% |

**2025 Standard Deduction:**
- Single: $15,000
- Married filing jointly: $30,000
- Head of household: $22,500

**Formula:**

```javascript
// Step 1: Calculate taxable income
taxableIncome =
    grossIncome
  - standardDeduction
  - (seTax / 2) // SE tax deduction
  - otherDeductions; // if any (health insurance, etc.)

// Step 2: Apply progressive brackets
function calculateFederalTax(taxableIncome, filingStatus) {
  const brackets = getBrackets(filingStatus); // from tables above
  let tax = 0;
  let previousBracketMax = 0;

  for (let bracket of brackets) {
    if (taxableIncome > bracket.min) {
      const taxableInBracket = Math.min(
        taxableIncome - previousBracketMax,
        bracket.max - previousBracketMax
      );
      tax += taxableInBracket * bracket.rate;
      previousBracketMax = bracket.max;
    } else {
      break;
    }
  }

  return tax;
}
```

**Example (Single filer):**
- Gross income: $100,000
- SE tax deduction: -$7,065
- Standard deduction: -$15,000
- Taxable income: $77,935

Tax calculation:
- 10% on first $11,925: $1,192.50
- 12% on $11,926-$48,475 ($36,549): $4,385.88
- 22% on $48,476-$77,935 ($29,459): $6,480.98
- **Total federal tax: $12,059**

### 3. State Income Tax

**State tax rates vary widely.** Use these approximations or lookup tables.

**High-tax states:**
- California: 1-13.3% (progressive)
- New York: 4-10.9% (progressive)
- New Jersey: 1.4-10.75% (progressive)

**Mid-tax states:**
- Massachusetts: 5% (flat)
- Illinois: 4.95% (flat)
- Pennsylvania: 3.07% (flat)

**No income tax states:**
- Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington, Wyoming

**California 2025 Example (most complex):**

| Taxable Income (Single) | Rate |
|------------------------|------|
| $0 - $10,412 | 1% |
| $10,413 - $24,684 | 2% |
| $24,685 - $38,959 | 4% |
| $38,960 - $54,081 | 6% |
| $54,082 - $68,350 | 8% |
| $68,351 - $349,137 | 9.3% |
| $349,138 - $418,961 | 10.3% |
| $418,962 - $698,271 | 11.3% |
| $698,272+ | 12.3% |
| $1,000,000+ | 13.3% (additional 1% Mental Health Services Tax) |

**Formula:**

```javascript
function calculateStateTax(taxableIncome, state) {
  if (NO_TAX_STATES.includes(state)) {
    return 0;
  }

  if (FLAT_TAX_STATES[state]) {
    return taxableIncome * FLAT_TAX_STATES[state];
  }

  // Progressive states (CA, NY, etc.)
  const brackets = STATE_BRACKETS[state];
  return calculateProgressiveTax(taxableIncome, brackets);
}
```

**Example (California, $77,935 taxable):**
- 1% on $10,412: $104
- 2% on $14,272: $285
- 4% on $14,275: $571
- 6% on $15,122: $907
- 8% on $14,269: $1,142
- 9.3% on $9,585: $891
- **Total CA state tax: $3,900**

### 4. Combined Tax Burden Example

**Scenario:** Single freelancer in California, $100k gross income

```
Gross Income:              $100,000

Self-Employment Tax:       $14,130
  (deductible portion):    -$7,065

Federal Income Tax:        $12,059
  (on taxable income of $77,935)

State Income Tax (CA):     $3,900

Total Tax Burden:          $30,089
Effective Tax Rate:        30.1%

Net After Taxes:           $69,911
```

---

## Billable Hours Estimation

### The Reality of Freelance Hours

**Common mistake:** Assuming 40 hours/week × 52 weeks = 2080 billable hours

**Reality:** Most freelancers bill 1000-1400 hours per year.

### Why?

**Non-billable time includes:**
- Writing proposals (5-10 hours/week)
- Client meetings (3-5 hours/week)
- Administrative work (invoicing, taxes, bookkeeping: 3-5 hours/week)
- Marketing and business development (2-5 hours/week)
- Learning/skill development (2-4 hours/week)
- Sick days and breaks (equivalent to 2-3 weeks/year)
- Gaps between projects (1-4 weeks/year)

**Total non-billable:** 15-25 hours per week on average

### Formula

```javascript
function calculateBillableHours(hoursPerWeek, weeksPerYear) {
  // User inputs their expected billable hours per week
  // Reality check: Most freelancers overestimate

  const rawAnnualHours = hoursPerWeek * weeksPerYear;

  // Apply reality buffer (10-15% reduction)
  const realityBuffer = 0.15;
  const realisticHours = rawAnnualHours * (1 - realityBuffer);

  return realisticHours;
}
```

**Examples:**

| User Inputs | Raw Hours | Realistic (15% buffer) |
|-------------|-----------|------------------------|
| 40 hrs/week × 48 weeks | 1,920 | 1,632 |
| 30 hrs/week × 50 weeks | 1,500 | 1,275 |
| 25 hrs/week × 48 weeks | 1,200 | 1,020 |
| 20 hrs/week × 45 weeks | 900 | 765 |

**Recommendation:** Use 1,200 hours as the default for full-time freelancers.

---

## Benefits Replacement Costs

Freelancers must self-fund benefits that W-2 employees receive.

### 1. Health Insurance

**Average costs (2025):**
- Individual plan: $500-700/month ($6,000-8,400/year)
- Family plan: $1,400-1,800/month ($16,800-21,600/year)

**Important:** Health insurance premiums for self-employed are 100% deductible (reduces taxable income).

### 2. Retirement Savings

**W-2 equivalent:** Employer 401k match (typically 3-6% of salary)

**Freelance options:**
- Solo 401k: Up to $69,000 (2025)
- SEP IRA: Up to 25% of net earnings
- Traditional/Roth IRA: Up to $7,000 ($8,000 if 50+)

**Recommendation:** Budget 10-15% of gross income for retirement.

### 3. Paid Time Off (PTO)

**W-2 equivalent:** 10-20 days per year (2-4 weeks)

**Freelance reality:** You don't get paid when you don't work.

**Formula:**

```javascript
// Assume 2 weeks PTO
ptoWeeks = 2;
billableHoursPerWeek = 25;

// Lost income from PTO
ptoHours = ptoWeeks * billableHoursPerWeek; // 50 hours
ptoCost = ptoHours * targetHourlyRate;

// This must be baked into your rate
```

**Example:**
- 2 weeks PTO = 50 billable hours lost
- At $95/hour = $4,750 annual cost
- Divide by actual working hours (1,200) = $4/hour PTO premium

### 4. Other Benefits to Consider

- **Life insurance:** $500-1,500/year
- **Disability insurance:** $1,000-3,000/year
- **Professional development:** $1,000-5,000/year
- **Equipment/software:** $2,000-5,000/year

---

## Cash Flow Buffer

### The Problem

Freelancers face:
- **Payment terms:** Net 30, 60, or even 90 days
- **Seasonal fluctuations:** Slow months (holidays, summer)
- **Project gaps:** 1-4 weeks between gigs

**Example:**
- You complete project January 15
- Invoice sent January 16
- Client pays Net 60 = March 17
- **60+ days without income**

### The Solution

Build a cash flow buffer into your rate.

**Formula:**

```javascript
function calculateCashFlowBuffer(annualGoal, paymentTerms) {
  // Payment terms in days (30, 60, 90)
  const monthsOfBuffer = paymentTerms / 30;

  // You need enough savings to cover N months of expenses
  const monthlyExpenses = annualGoal / 12;
  const bufferNeeded = monthlyExpenses * monthsOfBuffer;

  // Spread this cost across the year
  const annualBufferCost = bufferNeeded / 3; // amortize over 3 years

  return annualBufferCost;
}
```

**Example:**
- Annual take-home goal: $75,000 ($6,250/month)
- Payment terms: Net 60 (2 months)
- Buffer needed: $6,250 × 2 = $12,500
- Annual buffer cost: $12,500 ÷ 3 = $4,167/year
- Hourly buffer: $4,167 ÷ 1,200 hours = $3.47/hour

**Recommendation:** Add 10-15% buffer to your minimum rate.

---

## Date-Aware Adjustments

One of our key differentiators: The calculator adapts based on when you run it and how much you've earned.

### Mid-Year Recalculation

**Scenario:** User runs calculator in July, already earned $28k, goal was $75k

**Formula:**

```javascript
function calculateMidYearRate(annualGoal, earnedSoFar, date) {
  // Calculate progress
  const dayOfYear = getDayOfYear(date);
  const percentOfYearComplete = dayOfYear / 365;

  // Calculate remaining
  const revenueRemaining = annualGoal - earnedSoFar;
  const weeksRemaining = (52 * (1 - percentOfYearComplete));

  // Recalculate hourly rate for remaining time
  const hoursPerWeek = 25; // from user input
  const hoursRemaining = weeksRemaining * hoursPerWeek;

  const adjustedHourlyRate = revenueRemaining / hoursRemaining;

  return {
    adjustedRate: adjustedHourlyRate,
    hoursRemaining: hoursRemaining,
    behindPace: earnedSoFar < (annualGoal * percentOfYearComplete)
  };
}
```

**Example:**
- Date: July 15 (54% through year)
- Annual goal: $75,000
- On-pace earnings: $40,500
- Actual earnings: $28,000
- **Behind by:** $12,500

**Recalculation:**
- Remaining goal: $75,000 - $28,000 = $47,000
- Weeks remaining: 24 weeks
- Hours remaining (25/week): 600 hours
- **New rate needed:** $47,000 ÷ 600 = $78/hour (vs. original $65/hour)

**User messaging:**
```
⚠️ You're behind pace.

You've earned $28,000 (37% of goal) but we're 54% through the year.

To still hit your $75k goal, you need to charge $78/hour for the
remaining 600 hours (vs. your original $65/hour).

Options:
1. Raise rates to $78/hour immediately
2. Adjust goal to $52k (realistic at current pace)
3. Increase hours per week from 25 to 32
```

---

## Walk-Away Number

The absolute minimum rate below which you should decline work.

**Formula:**

```javascript
function calculateWalkAwayNumber(desiredTakeHome, location) {
  // Calculate bare minimum costs (no buffer, no extras)
  const minimumTaxes = estimateMinimumTaxes(desiredTakeHome, location);
  const minimumHealthInsurance = 6000; // individual plan
  const minimumExpenses = 3000; // basic business costs

  const bareBonesTotalCosts =
      desiredTakeHome
    + minimumTaxes
    + minimumHealthInsurance
    + minimumExpenses;

  // Divide by MAXIMUM realistic hours (no PTO buffer)
  const maxRealisticHours = 1400;

  const walkAwayRate = bareBonesTotalCosts / maxRealisticHours;

  return walkAwayRate;
}
```

**Example:**
- Take-home goal: $75,000
- Minimum taxes (30%): $22,500
- Health insurance: $6,000
- Basic expenses: $3,000
- **Total:** $106,500
- **Divide by 1,400 hours:** $76/hour
- **Walk-away number:** $76/hour

**Messaging:**
```
Your walk-away number: $76/hour

This is the absolute minimum you should accept.
Below this, you're subsidizing the client (working at a loss).

Only go below this if:
✓ Exceptional portfolio value
✓ Guaranteed long-term retainer at higher rate
✓ Strategic relationship worth short-term loss
```

---

## Complete Example Calculation

### User Profile
- **Service:** Web Development
- **Experience:** 3 years
- **Location:** California (single filer)
- **Desired take-home:** $75,000
- **Hours per week (billable):** 25
- **Weeks per year:** 48
- **Health insurance:** $600/month
- **Business expenses:** $500/month
- **Retirement goal:** 10% of gross

### Step-by-Step Calculation

**Step 1: Calculate realistic billable hours**
```
Raw hours: 25 hrs/week × 48 weeks = 1,200 hours
Reality buffer (15%): 1,200 × 0.85 = 1,020 hours
```

**Step 2: Estimate gross income needed (iterative)**

Starting estimate: $100,000

**Step 3: Calculate self-employment tax**
```
SE tax base: $100,000 × 0.9235 = $92,350
SE tax: $92,350 × 0.153 = $14,130
Deductible portion: $14,130 ÷ 2 = $7,065
```

**Step 4: Calculate federal income tax**
```
Taxable income:
  $100,000 (gross)
  - $15,000 (standard deduction)
  - $7,065 (SE tax deduction)
  - $7,200 (health insurance deduction)
  = $70,735

Federal tax (progressive brackets): $11,340
```

**Step 5: Calculate state income tax (CA)**
```
State taxable income: $70,735
California tax (progressive): $3,400
```

**Step 6: Calculate total costs**
```
Desired take-home:        $75,000
Federal tax:              $11,340
State tax (CA):           $3,400
Self-employment tax:      $14,130
Health insurance:         $7,200
Business expenses:        $6,000
Retirement (10%):         $10,000
PTO cost (2 weeks):       $4,500
Cash flow buffer:         $4,000
──────────────────────────────────
TOTAL NEEDED:             $135,570
```

**Step 7: Calculate hourly rate**
```
Total needed: $135,570
Realistic hours: 1,020
Minimum hourly rate: $135,570 ÷ 1,020 = $132.91

Rounded: $133/hour minimum
```

**Step 8: Add market buffer (10%)**
```
Minimum rate: $133/hour
Recommended rate: $133 × 1.10 = $146/hour
```

**Step 9: Calculate walk-away number**
```
Bare bones (no buffer, max hours):
$75k + $28k taxes + $6k insurance + $3k expenses = $112k
÷ 1,400 hours = $80/hour walk-away
```

### Final Output

```
YOUR RATE ANALYSIS

Your Minimum Hourly Rate: $133/hour
Recommended Rate: $146/hour (includes 10% buffer)
Walk-Away Number: $80/hour

Based on your inputs:
✓ Take-home goal: $75,000
✓ Location: California (high tax burden)
✓ 3 years experience in web development
✓ Realistic billable hours: 1,020/year

YOUR COST BREAKDOWN:
├─ Desired Take-Home:      $75,000
├─ Federal Income Tax:     $11,340  (11.3%)
├─ State Tax (CA):         $3,400   (3.4%)
├─ Self-Employment Tax:    $14,130  (14.1%)
├─ Health Insurance:       $7,200   (7.2%)
├─ Business Expenses:      $6,000   (6.0%)
├─ Retirement Savings:     $10,000  (10.0%)
├─ PTO Replacement:        $4,500   (4.5%)
└─ Cash Flow Buffer:       $4,000   (4.0%)
──────────────────────────────────────────────
TOTAL ANNUAL NEEDED:       $135,570
÷ 1,020 realistic hours    = $133/hour minimum

🎯 Recommended Rate: $146/hour
(Includes 10% negotiation buffer)
```

---

## Validation Examples

### Test Case 1: Entry-Level Designer (Low Cost of Living)

**Inputs:**
- Service: Graphic Design
- Experience: 1 year
- Location: Texas (no state tax)
- Take-home goal: $50,000
- Hours/week: 20
- Weeks/year: 48
- Health: $500/month
- Expenses: $300/month

**Expected Output:**
- Realistic hours: ~800/year
- Total costs: ~$85,000
- Minimum rate: ~$106/hour
- Recommended: ~$117/hour

### Test Case 2: Senior Developer (High Cost of Living)

**Inputs:**
- Service: Software Development
- Experience: 8 years
- Location: New York
- Take-home goal: $150,000
- Hours/week: 30
- Weeks/year: 46
- Health: $800/month
- Expenses: $1,000/month

**Expected Output:**
- Realistic hours: ~1,175/year
- Total costs: ~$265,000
- Minimum rate: ~$225/hour
- Recommended: ~$248/hour

### Test Case 3: Part-Time Consultant

**Inputs:**
- Service: Marketing Consulting
- Experience: 5 years
- Location: Massachusetts
- Take-home goal: $40,000
- Hours/week: 15
- Weeks/year: 50
- Health: $600/month
- Expenses: $400/month

**Expected Output:**
- Realistic hours: ~640/year
- Total costs: ~$70,000
- Minimum rate: ~$109/hour
- Recommended: ~$120/hour

---

## Key Validation Checkpoints

Before implementing these calculations in code:

1. ✅ **Tax math verified by CPA** - Get professional validation
2. ✅ **Test with 10 real freelancers** - Does the output match their reality?
3. ✅ **Compare to existing tools** - Are we more accurate?
4. ✅ **Edge cases handled** - Very high income, very low income, state variations
5. ✅ **Assumptions documented** - Make it clear what we're estimating

---

## Implementation Notes

**For Google Apps Script:**
- Store tax brackets in separate config sheet
- Update annually (brackets change each year)
- Allow manual override of tax rates for edge cases
- Round all currency to 2 decimal places, rates to nearest dollar

**Disclaimer to include:**
```
These calculations provide estimates for planning purposes only.
Actual tax liability may vary based on deductions, credits, and
individual circumstances. Consult a CPA for tax filing.
```

---

## Related Documents

- **Business Strategy:** `/docs/BUSINESS_PLAN.md`
- **Product Features:** `/docs/PRODUCT_SPEC.md`
- **Validation Playbook:** `/validation/concierge-mvp.md`
- **Claude Code Context:** `/CLAUDE.md`

---

## Last Updated

October 26, 2025 - Initial calculation specification

**Status:** Ready for validation with real freelancers
**Next Action:** Test calculations manually with 10 beta users
**Critical:** Do not code until math is validated
