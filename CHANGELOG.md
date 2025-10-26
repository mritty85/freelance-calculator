# Changelog

All notable changes to the Freelance Rate Calculator project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Project Status
- Pre-validation phase
- No code written yet
- Awaiting manual validation with 10 freelancers

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
