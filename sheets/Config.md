# Config Sheet Schema

## Purpose
Stores configuration data, tax tables, and default values

## Sheet Name
`Config`

## Columns

| Column | Name | Type | Description | Example |
|--------|------|------|-------------|---------|
| A | configKey | String | Unique configuration key | `taxBrackets2025Single` |
| B | configValue | String/JSON | Configuration value | `{...}` |
| C | lastUpdated | ISO DateTime | When config was last updated | `2025-01-01T00:00:00.000Z` |

## Row 1 (Headers)
```
configKey | configValue | lastUpdated
```

## Sample Configuration Entries

### Tax Brackets (2025)
```
configKey: taxBrackets2025Single
configValue: [
  {"min":0,"max":11925,"rate":0.10},
  {"min":11926,"max":48475,"rate":0.12},
  ...
]
lastUpdated: 2025-01-01T00:00:00.000Z
```

### State Tax Rates
```
configKey: stateTaxRates
configValue: {
  "CA": 0.093,
  "NY": 0.0685,
  "TX": 0,
  ...
}
lastUpdated: 2025-01-01T00:00:00.000Z
```

### Service Defaults
```
configKey: serviceDefaults
configValue: {
  "web-development": {
    "businessExpenses": 500,
    "softwareTools": 200,
    "equipment": 2000,
    "professionalDev": 2000
  },
  ...
}
lastUpdated: 2025-01-01T00:00:00.000Z
```

### Location Cost Multipliers
```
configKey: locationMultipliers
configValue: {
  "CA": 1.3,
  "NY": 1.3,
  "TX": 0.95,
  ...
}
lastUpdated: 2025-01-01T00:00:00.000Z
```

## Standard Config Keys

| Key | Description | Format |
|-----|-------------|--------|
| `taxBrackets2025Single` | Federal tax brackets (single) | JSON Array |
| `taxBrackets2025Married` | Federal tax brackets (married) | JSON Array |
| `taxBrackets2025Hoh` | Federal tax brackets (head of household) | JSON Array |
| `standardDeduction2025` | Standard deduction amounts | JSON Object |
| `stateTaxRates` | State tax rates (flat/median) | JSON Object |
| `serviceDefaults` | Default costs by service type | JSON Object |
| `locationMultipliers` | Cost of living multipliers by state | JSON Object |
| `seTaxRate` | Self-employment tax rate | Number String |
| `ssTaxBase2025` | Social Security wage base | Number String |

## Notes
- Config values can be simple strings or JSON
- Tax brackets should be updated annually (January)
- Service defaults and location multipliers can be tuned based on user data
- This sheet acts as a "database of constants" to avoid hardcoding

## Indexing
- Primary key: configKey (Column A)
- No foreign keys

## Data Retention
- Keep historical values with versioning in key name (e.g., `taxBrackets2025Single`)
- Previous year values retained for historical calculations
- Update current year values annually

## Initial Setup

When deploying, populate with:
1. 2025 federal tax brackets (all filing statuses)
2. 2025 standard deductions
3. Current state tax rates
4. Service type defaults
5. Location cost multipliers
6. SE tax constants

See TaxEngine.gs for current hardcoded values to migrate to this sheet.
