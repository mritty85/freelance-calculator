# Freelance Rate Calculator - Product Specification

## Product Vision

**Name:** RateRight (working title)

**Core Philosophy:** No CRM, no integrations, no daily data entry - but still contextually intelligent and actionable.

**Primary Value Propositions:**

1. **Accurate Math** - Correct tax calculations, realistic billable hours, all hidden costs
2. **Market Intelligence** - Real-time rate data by skill/experience/location
3. **Negotiation Confidence** - Pre-written scripts customized to user's situation

---

## Product Architecture Overview

### The Two-Part System

**Part 1: Your Rate Target Calculator**
- Calculates minimum/recommended rate based on financial goals
- Date-aware (adapts to time remaining in year)
- Progress-aware (adjusts based on earnings so far)
- Outputs target rate + detailed cost breakdown

**Part 2: Gig Negotiation Coach**
- Analyzes specific client offers using target rate from Part 1
- Considers situation context (desperate vs. selective)
- Provides verdict (accept/counter/walk) + negotiation scripts
- Tracks outcomes over time

---

## Phase-by-Phase Feature Roadmap

### Phase 0: Manual Concierge (Weeks 1-2)
**Goal:** Validate demand with 10 paying customers

**What you deliver:**
- Manual spreadsheet analysis
- Researched market report
- Custom negotiation scripts
- 30-minute consultation

**Success criteria:** 8+ of 10 say "worth way more than $49"

**See:** `/validation/concierge-mvp.md` for complete playbook

---

### Phase 1: Proof of Concept (Weeks 3-8)
**Goal:** Build automated version of most valuable parts

**Technology Stack:**
- Google Apps Script (founder already experienced)
- Google Sheets (data storage, calculations)
- Custom HTML forms (intake, results display)
- Claude API (market research, script generation)
- Web scraping (salary sites, job boards)

#### Feature 1: Rate Calculator Engine

**Multi-Step Intake Form:**

**Step 1: About You**
- Primary service/skill (dropdown: Web Dev, Design, Marketing, Writing, Consulting, etc.)
- Years of experience (0-1, 1-3, 3-5, 5-10, 10+)
- Current rate (optional, for comparison)
- Hours per week you bill (realistic average)

**Step 2: Location & Taxes**
- State (auto-populates state tax rate)
- Filing status (Single, Married filing jointly, Head of household)
- Dependents (yes/no)

**Step 3: Financial Goals**
- Desired annual take-home (after all taxes/expenses)
- Health insurance cost per month (or "estimate for me")
- Retirement savings goal (% or $ amount)

**Step 4: Business Reality**
- Non-billable hours per week (admin, proposals, meetings)
- Monthly business expenses (software, equipment, office, etc.)
- Client payment terms (Net 15/30/60/90)

**Step 5: Market Context** (optional, helps with market report)
- Where you find clients (Upwork, referrals, LinkedIn, cold outreach)
- Have you raised rates in last 12 months? (yes/no)
- Most recent client negotiation outcome (accepted/countered/walked away)

**Processing Logic:**
1. Calculate true costs (see `/calculations/CALCULATIONS.md` for formulas)
2. Determine realistic billable hours (total hours - non-billable)
3. Calculate minimum hourly rate to meet goals
4. Add buffer for market positioning (10-15%)
5. Generate comparison to current rate if provided

**Output: Results Dashboard**

```
YOUR RATE ANALYSIS

Your Minimum Hourly Rate: $87/hour
(or $6,960 for a typical 80-hour project)

Based on your inputs:
✓ Take-home goal: $75,000
✓ Location: California (high tax burden)
✓ 3 years experience in web development
✓ Realistic billable hours: 1,200/year

WHAT THIS MEANS:
─────────────────────────────────────────────
At your current rate of $60/hour:
  • You're SHORT $32,400 annually
  • After taxes & expenses, you net $41k
  • That's equivalent to a $41k salaried job
─────────────────────────────────────────────

YOUR COST BREAKDOWN:
├─ Federal + State + SE Tax: $31,200 (36%)
├─ Health Insurance: $7,200
├─ Business Expenses: $6,000
├─ Retirement Savings: $8,000
├─ Benefits Replacement: $4,500 (PTO equivalent)
├─ Cash Flow Buffer: $14,500
└─ Client Acquisition: $15,000 (15% of revenue)

Total needed: $161,400 ÷ 1,200 hours = $134/hour
But your lifestyle goal only needs: $87/hour minimum

🎯 Recommended Rate: $95-110/hour
(Balances your needs + market realities + room to negotiate)

[View Detailed Breakdown] [Get Market Report] [Generate Negotiation Scripts]
```

**Data Stored:**
```javascript
{
  profileId: "string",
  userId: "string",
  calculatedAt: "timestamp",

  inputs: {
    annualGoal: 75000,
    earnedSoFar: 28000, // if mid-year
    hoursPerWeek: 25,
    weeksPerYear: 48,
    location: "CA",
    healthInsurance: 600,
    businessExpenses: 500,
    retirementGoal: 8000
  },

  outputs: {
    minimumRate: 87,
    recommendedRate: 95,
    targetRate: 110, // with buffer
    hoursRemaining: 550, // if mid-year
    revenueStillNeeded: 65200,
    behindPace: true,
    taxBurden: {
      federal: 18000,
      state: 8200,
      selfEmployment: 11500,
      total: 37700
    }
  }
}
```

#### Feature 2: Market Intelligence Module

**Data Sources to Scrape:**
1. Upwork public rate data (by category)
2. Clockify hourly rate database
3. FreelancerMap annual study
4. PayScale freelancer data
5. Indeed/ZipRecruiter salary conversions
6. Reddit r/freelance (anonymized rate sharing)

**Claude API Integration:**
- Analyze user's skill + experience + location
- Search scraped data for relevant comparisons
- Generate personalized market positioning report
- Identify rate trends (increasing/decreasing)

**Output: Market Intelligence Report**

```
MARKET INTELLIGENCE REPORT
Web Development - California - 3 Years Experience

YOUR MARKET POSITION:

You calculated: $95/hour
Market range: $60-140/hour
Your position: 58th percentile (above average)

RATE BENCHMARKS FOR YOUR PROFILE:

Platform Rates (Lower bound):
├─ Upwork: $35-65/hour
├─ Fiverr: $25-50/hour
└─ Freelancer.com: $30-60/hour

Direct Client Rates (Mid-range):
├─ Referrals: $70-110/hour
├─ Cold outreach: $60-95/hour
└─ Agencies: $80-120/hour

Retained Clients (Upper bound):
├─ Monthly retainer: $90-140/hour
├─ Long-term contracts: $85-130/hour
└─ Enterprise clients: $100-150/hour

EXPERIENCE PREMIUM:
Entry-level (0-1 year): $40-60/hour
Early career (1-3 years): $55-85/hour ← You are here
Mid-career (3-5 years): $75-110/hour
Senior (5-10 years): $95-140/hour
Expert (10+ years): $120-180/hour

SKILL PREMIUM:
Your skills: [Web Development]
Average rate: $75/hour
Premium skills in demand:
├─ + React/Next.js: +25% ($94/hour)
├─ + E-commerce (Shopify): +20% ($90/hour)
└─ + Full-stack: +30% ($98/hour)

LOCATION ADJUSTMENT:
California median: $85/hour
Your target of $95/hour = 12% above median
Justifiable given your experience + skills

RATE INCREASE POTENTIAL:
Current: $60/hour → Target: $95/hour
That's a 58% increase = $42,000 more per year

Realistic approach:
Year 1: Raise to $75/hour (+25%) with existing clients
Year 2: Quote $95/hour to new clients
Year 3: Bring all clients to $95/hour minimum

MARKET TRENDS (2024-2025):
✓ Web development rates increased 8% YoY
✓ Remote work expanded available client base
✓ Demand for [your skills] is high (↑ 12%)
⚠ Platform rates stagnant (focus on direct clients)

BOTTOM LINE:
Your calculated rate of $95/hour is:
✓ Well-supported by market data
✓ Appropriate for your experience level
✓ Achievable with direct clients
⚠ May face resistance on platforms (consider $75-85 there)

[Download Full Report PDF] [Generate Negotiation Scripts]
```

**Data Stored:**
```javascript
{
  marketReportId: "string",
  userId: "string",
  generatedAt: "timestamp",

  userProfile: {
    service: "web development",
    experience: 3,
    location: "CA"
  },

  marketData: {
    range: { low: 60, median: 85, high: 140 },
    percentile: 58,
    platformRates: { upwork: [35, 65], fiverr: [25, 50] },
    directRates: { referrals: [70, 110], agencies: [80, 120] },
    trendDirection: "up",
    trendPercentage: 8
  },

  recommendations: {
    currentGap: 35, // $ per hour
    annualImpact: 42000,
    phaseInPlan: ["$75 year 1", "$95 year 2"]
  }
}
```

#### Feature 3: Negotiation Script Generator

**Claude API Integration:**
- Takes user's target rate, current situation, client context
- Generates customized scripts for multiple scenarios
- Provides objection handling responses
- Identifies red flags for bad clients

**Input Form:**
```
GENERATE YOUR NEGOTIATION SCRIPTS

Situation: [Dropdown]
├─ I need to raise rates with existing clients
├─ I'm quoting a rate to a new client
├─ A client said my rate is too high
├─ I'm not sure if this offer is fair
└─ I need to walk away from a bad client

Client Type: [Dropdown]
├─ Long-term client (1+ years)
├─ New prospect
├─ Past client returning
├─ Agency/middleman
└─ Direct end-client

Project Details:
├─ Estimated hours: [Input]
├─ Timeline: [Input]
├─ Complexity: [Low/Medium/High]
└─ Strategic value: [Portfolio/Referral/Revenue/None]

Their Budget (if known): $[Input]

Additional Context: [Text area]
```

**Output: Customized Scripts**

```
YOUR NEGOTIATION PLAYBOOK

SITUATION: New client said "$95/hour is higher than we expected"

YOUR RESPONSE SCRIPTS:

──────────────────────────────────────────
OPTION 1: Hold Firm (Recommended)
──────────────────────────────────────────

"I understand. My rate of $95/hour reflects my 3 years of
experience building React applications and the results I deliver.

For reference, here's what previous clients have achieved:
• [Example 1]: Increased conversion 34% → $50k additional revenue
• [Example 2]: Reduced page load 60% → Improved SEO rankings
• [Example 3]: Launched in 6 weeks → Met critical deadline

For this project, I estimate 80 hours, so we're looking at $7,600.
That's an investment of about $X per [business outcome they want].

Would you like me to send over a detailed proposal with
milestones and deliverables?"

WHY THIS WORKS:
✓ Doesn't apologize for rate
✓ Reframes cost as investment
✓ Provides social proof
✓ Redirects to value conversation

──────────────────────────────────────────
OPTION 2: Adjust Scope (If Flexible)
──────────────────────────────────────────

"I understand budget is a consideration. Let's talk about what
we can do within your range. A few options:

Option A: Phased Approach
Start with Phase 1 (core features) for $4,500, then expand
after you see results.

Option B: Reduced Deliverables
Focus on [80% scope] for $6,400, you handle [minor tasks].

Option C: Extended Timeline
At my $75/hour rate for slower delivery = $6,000.

Which approach fits your situation best?"

──────────────────────────────────────────
OPTION 3: Strategic Discount (Use Sparingly)
──────────────────────────────────────────

"For this project, I can offer $85/hour (vs. my standard $95)
because [pick one]:
├─ This is exactly the type of work I want more of
├─ You're willing to be a case study/testimonial
├─ You're committing to a 6-month relationship
└─ The project offers strong portfolio value

That brings the project to $6,800. However, this rate is
specific to this project.

Does that work for your budget?"

──────────────────────────────────────────
RED FLAGS - WALK AWAY IF:
──────────────────────────────────────────

🚩 "Can you do a trial project at half rate?"
🚩 "We'll have lots of future work" (but won't commit)
🚩 "Our budget is absolutely fixed at $3,000"
🚩 "We need this done in 2 weeks" (but want discount)

──────────────────────────────────────────
YOUR WALK-AWAY NUMBER: $68/hour
──────────────────────────────────────────

Below this, you're netting less than your stated take-home goal.

[Save These Scripts] [Email to Me] [Generate New Scenario]
```

**Data Stored:**
```javascript
{
  scriptId: "string",
  userId: "string",
  generatedAt: "timestamp",

  situation: "objection_handling",
  clientType: "new_prospect",

  projectDetails: {
    hours: 80,
    timeline: "4 weeks",
    complexity: "medium",
    strategicValue: "none"
  },

  scripts: {
    holdFirm: "string",
    adjustScope: "string",
    strategicDiscount: "string"
  },

  walkAwayNumber: 68,

  outcome: {
    used: false,
    action: null, // "accepted" | "countered" | "walked"
    finalRate: null
  }
}
```

#### Feature 4: Rate Tracking Dashboard

**Simple Progress Visualization:**

```
YOUR RATE JOURNEY

Current Rate: $60/hour
Target Rate: $95/hour
Progress: 0% → Goal: Increase by Q2 2026

PROJECTED ANNUAL IMPACT:
─────────────────────────────────────────
At $60/hour (current):
  Net income: $41,200

At $75/hour (1-year goal):
  Net income: $59,500 (+$18,300)

At $95/hour (2-year goal):
  Net income: $78,400 (+$37,200)
─────────────────────────────────────────

RATE HISTORY:
Jan 2025: $60/hour (Joined RateRight, analyzed rate)
[Future updates tracked here]

UPCOMING ACTIONS:
☐ Raise rate with Client A (use Script #1)
☐ Quote $75/hour to next new client
☐ Request testimonial from Client B

[Add Rate Change] [View Market Updates]
```

---

### Phase 2: Beta Product (Weeks 9-16)
**Goal:** Test with 50 users, measure retention

#### Feature 5: Client Offer Evaluator

Quick analysis tool for specific offers:

```
IS THIS OFFER FAIR?

Client offered: $4,500 for project
Estimated hours: 60 hours
Effective rate: $75/hour

YOUR BENCHMARKS:
├─ Your minimum: $87/hour ❌
├─ Your target: $95/hour ❌
├─ Market mid-range: $70-110/hour ✓
└─ Walk-away number: $68/hour ✓

ANALYSIS:
⚠️ This offer is BELOW your minimum rate but ABOVE walk-away.

RECOMMENDATION: Counter with one of these:
1. Ask for $5,700 (keeps you at $95/hour)
2. Reduce scope to 50 hours (keeps at $90/hour)
3. Accept at $4,500 if strategic value exists

[Generate Counter-Offer Email] [Assess Strategic Value]
```

**Data Stored:**
```javascript
{
  negotiationId: "string",
  userId: "string",
  analyzedAt: "timestamp",

  offer: {
    amount: 4500,
    hours: 60,
    effectiveRate: 75
  },

  userContext: {
    minimumRate: 87,
    targetRate: 95,
    walkAwayNumber: 68,
    desperationLevel: "selective" // or "desperate" or "neutral"
  },

  recommendation: {
    verdict: "counter", // "accept" | "counter" | "walk"
    options: [
      { type: "raise_rate", amount: 5700 },
      { type: "reduce_scope", hours: 50 },
      { type: "strategic_accept", conditions: ["portfolio", "testimonial"] }
    ]
  },

  outcome: {
    action: null, // logged later
    finalAmount: null,
    accepted: null
  }
}
```

#### Feature 6: Quarterly Market Updates

**Retention Hook:**

Every quarter, RateRight:
1. Re-scrapes market data
2. Generates updated market report for each user
3. Sends email: "Market rates increased 5% - time to raise yours?"
4. Updates dashboard with new recommendations

**Email Template:**
```
Subject: Your Q2 2025 Rate Update - Market Up 5%

Hi [Name],

Good news: Market rates for [your service] increased 5% this quarter.

Your current rate: $75/hour
Market median (Q2 2025): $88/hour (+$3 from Q1)
Your updated target: $98/hour

This means you could be earning $27,600 more per year.

[View Your Updated Market Report]
[Generate Rate Increase Scripts]

- RateRight
```

#### Feature 7: Negotiation Win Tracking

Gamification element to drive engagement:

```
NEGOTIATION OUTCOMES

Feb 2025: Raised rate with Client A
├─ Old rate: $60/hour
├─ New rate: $75/hour
├─ Annual impact: +$18,000
└─ Used Script: "Existing Client Rate Increase"

Mar 2025: New client accepted $95/hour
├─ Quoted: $95/hour
├─ They countered: $80/hour
├─ You held firm: $95/hour ✓
└─ Annual impact: +$42,000 (vs old rate)

TOTAL EARNINGS INCREASE: $60,000/year

[Log New Negotiation] [Share Success Story]
```

**Data Stored:**
```javascript
{
  outcomeId: "string",
  userId: "string",
  loggedAt: "timestamp",

  negotiation: {
    scriptUsed: "existing_client_raise",
    oldRate: 60,
    newRate: 75,
    clientType: "long_term",
    outcome: "accepted"
  },

  impact: {
    hourlyIncrease: 15,
    estimatedAnnualImpact: 18000,
    cumulativeEarnings: 60000 // since joining
  }
}
```

---

### Phase 3: Scale Product (Months 5-12)
**Goal:** 1,000 paying users, refine based on data

#### Feature 8: Community Rate Database

Users anonymously contribute actual rates in exchange for more granular data:

**What Users Share:**
- Service type (dropdown)
- Years experience
- Location (state/city)
- Actual rate charged
- Project type (platform vs. direct)
- Client industry

**What They Get:**
- More granular market data
- Niche-specific benchmarks
- Real negotiation outcomes from others
- "X freelancers like you charge $Y-Z"

**Network Effects:** More users = better data = more valuable tool

#### Feature 9: AI Negotiation Coach

Real-time role-play practice:

```
AI NEGOTIATION PRACTICE

AI plays: Difficult client who says "That's too expensive"
You respond: [Type your response]

[AI Feedback]
Confidence: 7/10
Framing: Good use of value language
Improvement: Consider providing specific ROI example

[Continue Practice] [Try Different Scenario]
```

#### Feature 10: Tax Planning Tools

- Quarterly tax calculator (based on YTD earnings)
- Estimated payment schedules
- Deduction tracker integration
- Year-end tax projection
- "Should I make a quarterly payment?" alerts

#### Feature 11: Proposal Templates

Generate full project proposals:
- Scope of work
- Timeline with milestones
- Pricing (based on calculated rate)
- Terms and conditions
- E-signature capability (via DocuSign API or similar)

---

## Technical Architecture

### Google Apps Script Structure

```
/src/
├── Code.gs - Main orchestration, web app routing
├── rateCalculator.gs - Core calculation logic
├── marketData.gs - Scraping and analysis
├── claude.gs - AI integrations (Claude API)
├── sheets.gs - Data persistence layer
├── email.gs - Notifications and reports
└── utils.gs - Helper functions

/forms/ - HTML interfaces
├── intake.html - Multi-step form
├── results.html - Dashboard display
├── market-report.html - Report viewer
├── scripts.html - Script generator
└── styles.html - Shared CSS

/data/ - Google Sheets tables
├── Users
├── RateProfiles
├── MarketData
├── Negotiations
└── Outcomes
```

### Data Models

See detailed schemas in `/calculations/CALCULATIONS.md` for:
- Tax calculation formulas
- Billable hours estimation
- Rate calculation algorithm
- Market positioning logic

**Core Tables:**

**Users:**
```javascript
{
  userId: "string",
  email: "string",
  createdAt: "timestamp",
  subscription: "free|premium|pro",
  profile: {
    service: "string",
    experience: "number",
    location: "string"
  }
}
```

**RateProfiles:**
```javascript
{
  profileId: "string",
  userId: "string",
  calculatedAt: "timestamp",
  inputs: { /* user inputs */ },
  outputs: { /* calculated results */ }
}
```

**Negotiations:**
```javascript
{
  negotiationId: "string",
  userId: "string",
  analyzedAt: "timestamp",
  offer: { /* client offer details */ },
  recommendation: { /* verdict + scripts */ },
  outcome: { /* actual result */ }
}
```

---

## User Experience Flow

### First-Time User Journey

1. **Landing:** Free tier signup (email only)
2. **Intake:** Multi-step form (5-10 minutes)
3. **Results:** See calculated rate + breakdown
4. **Upsell:** "Get full market report + scripts for $29/month"
5. **Convert:** Payment → Full dashboard access
6. **Activate:** Generate first negotiation script
7. **Retain:** Quarterly email with market updates

### Returning User Journey

1. **Login:** Dashboard shows current rate vs. target
2. **New Offer:** Use offer evaluator for specific gig
3. **Generate Script:** Customize for situation
4. **Log Outcome:** Track win/loss
5. **See Progress:** "You've earned $X more since joining"

---

## Key Constraints & Design Principles

**Constraints:**
- No integrations initially (no FreshBooks, QuickBooks, etc.)
- No CRM functionality (not competing with FreshBooks)
- No daily data entry (users update quarterly at most)
- No mobile app (web-only for MVP)

**Design Principles:**
1. **Accuracy First:** Get the math right (see `/calculations/CALCULATIONS.md`)
2. **Context-Aware:** Adapt to user's situation and timing
3. **Actionable Output:** Always provide next steps
4. **Build Trust:** Show your work (transparent breakdowns)
5. **Reduce Friction:** Pre-fill what you can, ask only what matters

---

## Success Criteria

**Phase 1 (POC):**
- ✅ Users spend 15+ minutes in tool
- ✅ 5%+ free-to-paid conversion
- ✅ 30+ NPS score

**Phase 2 (Beta):**
- ✅ 40%+ return within 90 days
- ✅ 60%+ report raising rates
- ✅ <10% monthly churn

**Phase 3 (Scale):**
- ✅ 500+ paying customers
- ✅ <7% monthly churn
- ✅ 3:1 LTV:CAC ratio

---

## Related Documents

- **Business Strategy:** `/docs/BUSINESS_PLAN.md`
- **Calculation Logic:** `/calculations/CALCULATIONS.md`
- **Validation Playbook:** `/validation/concierge-mvp.md`
- **Claude Code Context:** `/CLAUDE.md`

---

## Last Updated

October 26, 2025 - Initial structured product specification

**Next Action:** Perfect calculation logic before building any UI
