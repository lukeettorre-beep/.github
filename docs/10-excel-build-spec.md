# Document 10 — Excel Build Specification

**Build Pack:** Award Interpreter Tool
**Awards:** MA000002 | MA000038 | MA000039
**Version:** 1.0
**Status:** Implementation Specification

---

## 1. Workbook Overview

**File name:** `AwardInterpreterTool_v1.0.xlsx`
**Format:** Excel (.xlsx), compatible with Excel 2019, Microsoft 365, Excel Online
**Protection model:** Logic sheets locked (password protected). Data Entry sheet unlocked for users. Admin sheets locked for admin only.
**Named ranges:** All key tables and cells use defined named ranges for formula readability and maintainability.
**Colour coding:** Consistent colour scheme applied throughout (see UX document — doc 11).

---

## 2. Sheet Inventory

| Sheet Name | Tab Colour | User Access | Purpose |
|---|---|---|---|
| Welcome_Instructions | Blue | All users | Entry point and instructions |
| Data_Entry | Green | All users | User inputs for each scenario |
| Coverage_Engine | Orange | System (locked) | Award coverage decision logic |
| Award_Selector | Orange | System (locked) | Output of coverage decision |
| Clerks_Rules | Orange | System (locked) | MA000002 rules logic |
| RTD_Rules | Orange | System (locked) | MA000038 rules logic |
| RTLDO_Rules | Orange | System (locked) | MA000039 rules logic |
| Classification_Mapper | Orange | Admin | Classification reference table |
| Rates_Table | Red | Admin only | All pay rates — maintainable |
| Allowances_Table | Red | Admin only | All allowances — maintainable |
| PH_Table | Red | Admin only | Public holidays by state/year |
| Break_Rules | Orange | System (locked) | Break compliance logic |
| Overtime_Rules | Orange | System (locked) | Overtime calculation logic |
| Scenario_Output | Green | All users (read) | Calculated pay output |
| Audit_Log | Yellow | Admin/Compliance | Timestamped calculation records |
| Admin_Config | Red | Admin only | Tool settings and parameters |
| Version_Control | Yellow | Admin/Compliance | Change log and version history |

---

## 3. Sheet 1: Welcome_Instructions

**Purpose:** Entry point. Explains tool purpose, scope, limitations and how to navigate.
**Primary Users:** All users
**Content:**
- Tool title, version number, effective date (sourced from Admin_Config)
- Brief description of what the tool does
- Awards covered (with MA codes)
- How to use: step-by-step navigation guide
- Key limitations and escalation notes
- Legal disclaimer
- Link to Scenario_Output and Data_Entry

**Cells:**
- A1: Tool title (formula: `=Admin_Config!B2`)
- A2: Version (formula: `=Admin_Config!B3`)
- A3: Effective date (formula: `=Admin_Config!B4`)
- B10:B30: Navigation instructions (static text)
- B35:B50: Legal disclaimer (static text, highlighted in amber box)

**Locking:** Entire sheet locked. Only Admin can edit.
**Conditional Formatting:** Amber highlight on disclaimer section.

---

## 4. Sheet 2: Data_Entry

**Purpose:** Primary user input interface. User enters employee and scenario details here.
**Primary Users:** HR staff, payroll officers
**Layout:** Organised in sections matching the data model categories (doc 04).

### 4.1 Columns and Fields

**Section A: Employee and Employer Details**

| Cell | Field ID | Field Label | Input Type | Validation |
|---|---|---|---|---|
| B3 | EMP001 | Employee ID | Free text | Not blank |
| B4 | EMP002 | Employee Name | Free text | Not blank |
| B5 | EMP003 | Employment Start Date | Date | Valid date |
| B6 | EMP006 | State/Territory | Dropdown | NSW/VIC/QLD/SA/WA/TAS/NT/ACT |
| B8 | ORG003 | Employer Industry | Dropdown | Transport-Logistics / Clerical-Other / Mixed / Other |
| B9 | ORG005 | Sector | Dropdown | Private / Government / Not-for-profit |
| B10 | ORG006 | EA Applicable? | Dropdown | Yes / No / Unknown |

**Section B: Employment Type**

| Cell | Field ID | Label | Input Type | Validation |
|---|---|---|---|---|
| B14 | ETP001 | Employment Type | Dropdown | Full-time / Part-time / Casual |
| B15 | ETP002 | Contracted Hours/Week | Number | 0–38 |
| B16 | ETP004 | Guaranteed Hours/Week (PT) | Number | 0–38, blank if FT/Casual |
| B17 | ETP007 | Shift Worker? | Dropdown | Yes / No |

**Section C: Classification**

| Cell | Field ID | Label | Input Type | Validation |
|---|---|---|---|---|
| B21 | CLA001 | Job Title | Free text | Not blank |
| B22 | CLA006 | Vehicle GVM Class (if driver) | Dropdown | Up to 4.5t / 4.5t-8t / 8t-15t / 15t-25t / Over 25t / N/A |
| B23 | CLA003 | Classification Level (assessed) | Dropdown | Dynamic — sourced from Classification_Mapper filtered by award |
| B24 | CLA004 | Classification Assessed? | Dropdown | Yes / No |

**Section D: Shift Data (repeating rows — up to 14 days)**

| Column | Field ID | Label |
|---|---|---|
| A | SHF001 | Day of week (auto from date) |
| B | SHF002 | Shift Date |
| C | SHF003 | Shift Start Time |
| D | SHF004 | Shift End Time |
| E | SHF005 | Unpaid Break (minutes) |
| F | SHF006 | Paid Rest Break (minutes) |
| G | SHF008 | Net Hours Worked (calculated) |
| H | SHF009 | Shift Type |
| I | SHF010 | Public Holiday? (auto-checked) |

**Section E: Allowance Triggers (checkboxes or dropdowns)**

| Cell | Field ID | Label |
|---|---|---|
| B50 | ALW002 | Vehicle Allowance Applies? |
| B51 | ALW003 | Dangerous Goods Allowance? |
| B52 | ALW004 | First Aid Allowance? |
| B53 | ALW005 | Leading Hand Allowance? |
| B54 | ALW001 | Meal Allowance (auto or manual)? |

**Section F: Long Distance Data (RTLDO only — shown/hidden based on award)**

| Cell | Field ID | Label |
|---|---|---|
| B58 | LDT001 | RTLDO Trip? |
| B59 | LDT002 | Per-Km Rate Category |
| B60 | LDT003 | Total Km This Trip |
| B61 | LDT004 | Waiting Time (hours) |
| B62 | LDT007 | Nights Away |

### 4.2 Key Formulas

**Auto-calculate day of week:**
```excel
=IF(SHF002="","",TEXT(SHF002,"dddd"))
```

**Auto-calculate net hours worked:**
```excel
=IF(OR(SHF003="",SHF004=""),"",
  ((SHF004-SHF003)*24) - (SHF005/60))
```

**Auto-check public holiday:**
```excel
=IF(COUNTIF(PH_Table[Date],SHF002)>0,"YES","No")
```

**Dynamic classification dropdown (using named range filtered by award):**
```excel
// Use data validation with INDIRECT referencing named range by award
// Named ranges: ClerksClassList, RTDClassList, RTLDOClassList
// Data_Entry B23 validation: =INDIRECT(Award_Selector!B2 & "ClassList")
```

**Validation notes:**
- All date cells: use Excel date validation (reject non-dates)
- All time cells: custom format HH:MM; validate >0
- All number cells: restrict to non-negative values
- Shift End before Start: display warning `=IF(SHF004<=SHF003,"⚠ END BEFORE START","")`

**Locked cells:** Header rows, labels, formula cells. Unlock only input cells.
**Colours:** Input cells in light yellow; calculated cells in light blue; warning cells in amber.

---

## 5. Sheet 3: Coverage_Engine

**Purpose:** Executes the award coverage decision tree (doc 03) based on Data_Entry inputs.
**Primary Users:** System (locked — no user input)

### 5.1 Logic Cells

| Cell | Purpose | Formula |
|---|---|---|
| B2 | Industry test | `=IF(Data_Entry!B8="Transport-Logistics","RTD/RTLDO branch","Clerks branch")` |
| B3 | EA flag | `=IF(Data_Entry!B10="Yes","EA_POSSIBLE","No_EA")` |
| B4 | Sector test | `=IF(Data_Entry!B9="Private","Private_OK","NOT_PRIVATE_SECTOR")` |
| B5 | Long distance test | `=IF(AND(Data_Entry!B58="Yes",Data_Entry!LDT006="Yes"),"RTLDO","RTD_Check")` |
| B6 | Mixed duties flag | `=IF(DUTIES_CLERICAL_PCT>=40,"MIXED_REVIEW","Clear")` |
| B10 | Coverage result | IFS logic across B2:B6 (see below) |

**Coverage Result Formula:**
```excel
=LET(
  ea_flag, B3,
  sector, B4,
  industry, B2,
  ld_test, B5,
  mixed_flag, B6,

  IF(ea_flag="EA_POSSIBLE", "REVIEW: EA may apply — do not proceed",
  IF(sector<>"Private_OK", "REVIEW: Non-private sector — check applicable award",
  IF(industry="RTD/RTLDO branch",
    IF(ld_test="RTLDO", "AWARD: MA000039",
    IF(mixed_flag="MIXED_REVIEW", "REVIEW: Mixed duties — manual review required",
    "AWARD: MA000038")),
  "AWARD: MA000002")))
)
```

**Named Range:** `CoverageResult` = Coverage_Engine!B10
**Locking:** Entire sheet locked.

---

## 6. Sheet 4: Award_Selector

**Purpose:** Single source of truth for which award applies. Other sheets reference this.
**Primary Users:** System
**Key cell:** B2 = award code (feeds Classification_Mapper filter, Rates_Table lookup key, Rules engine routing)

```excel
=LET(
  raw, Coverage_Engine!B10,
  IF(ISNUMBER(SEARCH("MA000002",raw)), "MA000002",
  IF(ISNUMBER(SEARCH("MA000039",raw)), "MA000039",
  IF(ISNUMBER(SEARCH("MA000038",raw)), "MA000038",
  "REVIEW")))
)
```

**Named Range:** `ActiveAward` = Award_Selector!B2

---

## 7. Sheet 5: Clerks_Rules

**Purpose:** MA000002-specific rules engine. Referenced when ActiveAward = MA000002.
**Primary Users:** System

### Key calculation areas:

**A: Ordinary hours determination**
```excel
=IF(ActiveAward<>"MA000002","N/A",
  IF(Data_Entry!ETP001="Full-time",7.6,
  IF(Data_Entry!ETP001="Part-time",Data_Entry!ETP004/Data_Entry!ETP003,
  7.6)))  // Casual also uses 7.6 as ordinary hour base
```

**B: Span of hours check per shift**
```excel
=LET(
  span_start, XLOOKUP("ClerksSpanStart", Admin_Config[Setting], Admin_Config[Value]),
  span_end, XLOOKUP("ClerksSpanEnd", Admin_Config[Setting], Admin_Config[Value]),
  IF(SHF003 < span_start, "EARLY_MORNING_FLAG",
  IF(SHF004 > span_end, "LATE_EVENING_FLAG",
  "WITHIN_SPAN"))
)
```

**C: Penalty multiplier lookup**
```excel
=XLOOKUP("MA000002_" & hour_type, Rates_Table[Code], Rates_Table[Multiplier], 0, 0)
```

**D: Shift loading (if shiftworker)**
```excel
=IF(Data_Entry!ETP007="Yes",
  XLOOKUP("MA000002_SHF_" & Data_Entry!SHF009, Rates_Table[Code], Rates_Table[Multiplier], 0),
  0)
```

---

## 8. Sheet 6: RTD_Rules

**Purpose:** MA000038-specific rules engine. Referenced when ActiveAward = MA000038.
**Structure mirrors Clerks_Rules with RTD-specific logic.**

**Vehicle allowance calculation:**
```excel
=IF(Data_Entry!ALW002="Yes",
  XLOOKUP(Data_Entry!CLA006, Allowances_Table[RTD_Vehicle_Class], Allowances_Table[Daily_Amount], 0),
  0)
```

**GVM-based classification validation:**
```excel
=IF(XLOOKUP(Data_Entry!CLA003, Classification_Mapper[ID], Classification_Mapper[GVM_Min])
   <= XLOOKUP(Data_Entry!CLA006, VehicleGVM_Table[Class], VehicleGVM_Table[GVM]),
   "Classification consistent with vehicle",
   "⚠ REVIEW: GVM may require higher classification")
```

---

## 9. Sheet 7: RTLDO_Rules

**Purpose:** MA000039-specific rules engine. Referenced when ActiveAward = MA000039.

**Per-km calculation:**
```excel
=IF(ActiveAward<>"MA000039","N/A",
  LET(
    km_total, Data_Entry!LDT003,
    rate_class, Data_Entry!LDT002,
    per_km_rate, XLOOKUP(rate_class, Rates_Table[RTLDO_Class], Rates_Table[RTLDO_PerKm]),
    min_weekly, XLOOKUP(rate_class, Rates_Table[RTLDO_Class], Rates_Table[RTLDO_MinWeekly]),
    gross_km_pay, km_total * per_km_rate,
    MAX(gross_km_pay, min_weekly)
  ))
```

**Waiting time:**
```excel
=LET(
  wt_hours, Data_Entry!LDT004,
  wt_trigger, XLOOKUP("RTLDO_WT_Trigger", Admin_Config[Setting], Admin_Config[Value]),
  wt_rate, XLOOKUP("RTLDO_WT_Rate", Rates_Table[Code], Rates_Table[Value]),
  IF(wt_hours > wt_trigger, (wt_hours - wt_trigger) * wt_rate, 0)
)
```

**HVNL warning flag:**
```excel
=IF(ActiveAward="MA000039",
  "⚠ IMPORTANT: Heavy Vehicle National Law fatigue compliance must be separately verified",
  "")
```

---

## 10. Sheet 8: Classification_Mapper

**Purpose:** Reference table linking classification names to rate codes.
**Primary Users:** Admin (maintenance), Coverage_Engine (reference)

**Columns:**
| Column | Header | Notes |
|---|---|---|
| A | Award_Code | MA000002 / MA000038 / MA000039 |
| B | Classification_ID | Unique code (e.g. MA2_L1) |
| C | Classification_Name | Full name from award |
| D | GVM_Min | For RTD/RTLDO: minimum GVM |
| E | GVM_Max | For RTD/RTLDO: maximum GVM |
| F | Rate_Code | Links to Rates_Table |
| G | Effective_Date | When this entry became current |
| H | Notes | Any caveats |

**Data validation:** Award_Code must be in {MA000002, MA000038, MA000039}
**Locking:** Locked for users; editable by Admin.

---

## 11. Sheet 9: Rates_Table

**Purpose:** Master pay rates table. All formulas reference this table. Never hard-code rates.
**Primary Users:** Admin only (update annually after Annual Wage Review)
**Critical:** This sheet is password-locked. Only the Admin (technical owner) may edit it.

**Columns:**
| Column | Header | Example |
|---|---|---|
| A | Rate_Code | MA000002_L1_Hourly |
| B | Award | MA000002 |
| C | Classification | Level 1 |
| D | Rate_Type | Base / Multiplier / PerKm / Weekly |
| E | Value | [numeric rate — populate from FWO] |
| F | Unit | Per_Hour / Multiplier / Per_Km / Per_Week |
| G | Effective_Date | 01/07/2025 |
| H | Expiry_Date | 30/06/2026 |
| I | Source | FWO Pay Guide MA000002 July 2025 |
| J | Validated_By | [Name] |
| K | Validated_Date | [Date] |

**Named ranges:**
- `Rates_Table` = entire table (A:K)
- `ClerksRates` = filtered view MA000002
- `RTDRates` = filtered view MA000038
- `RTLDORates` = filtered view MA000039

**Conditional formatting:** Highlight rows where Expiry_Date < TODAY() in red — rate may be outdated.

---

## 12. Sheet 10: Allowances_Table

**Purpose:** All allowances for all three awards.
**Primary Users:** Admin only

**Columns:**
| Column | Header |
|---|---|
| A | Allowance_Code |
| B | Award |
| C | Allowance_Name |
| D | Trigger_Condition (plain English) |
| E | Amount |
| F | Unit (per_day / per_shift / per_km / per_week) |
| G | Effective_Date |
| H | Source |
| I | Validated_Flag |

**Named range:** `Allowances_Table`

---

## 13. Sheet 11: PH_Table

**Purpose:** Public holidays by state and year. Used to auto-check if a shift date is a public holiday.
**Primary Users:** Admin (annual update)

**Columns:**
| Column | Header |
|---|---|
| A | PH_Date |
| B | State |
| C | PH_Name |
| D | Year |
| E | Substitute_Day |
| F | Notes |

**Named range:** `PH_Table`

**Lookup formula (Data_Entry SHF010):**
```excel
=IF(COUNTIFS(PH_Table[PH_Date],SHF002,PH_Table[State],Data_Entry!B6)>0,"YES","No")
```

---

## 14. Sheet 12: Break_Rules

**Purpose:** Validate break compliance per award.
**Primary Users:** System

**Break compliance check:**
```excel
=LET(
  hours_worked, SHF008,
  break_taken_min, BRK003,
  award, ActiveAward,
  break_trigger, XLOOKUP(award & "_BreakTrigger", Admin_Config[Setting], Admin_Config[Value]),
  break_minimum, XLOOKUP(award & "_BreakMin", Admin_Config[Setting], Admin_Config[Value]),

  IF(hours_worked < break_trigger, "Break not yet required",
  IF(break_taken_min >= break_minimum, "Compliant",
  "⚠ NON-COMPLIANT: Break required but not taken or insufficient"))
)
```

---

## 15. Sheet 13: Overtime_Rules

**Purpose:** Calculate overtime hours and pay per award.
**Key formulas covered in doc 09 — this sheet implements them.**

**Weekly overtime accumulator:**
```excel
=SUMPRODUCT(
  (SHF_Table[Week_Number]=current_week) *
  MAX(0, SHF_Table[Net_Hours] - daily_ordinary_limit_per_day)
)
```

---

## 16. Sheet 14: Scenario_Output

**Purpose:** Presents the calculated pay scenario in a user-readable format.
**Primary Users:** HR, payroll — read-only output

**Layout:**
- Header: Employee, award, period, classification, tool version
- Section A: Hours breakdown (ordinary / OT / penalty hours by type)
- Section B: Pay calculation (rates × hours)
- Section C: Allowances breakdown
- Section D: Total period pay
- Section E: Audit flags and manual review items (highlighted in amber/red)
- Footer: Disclaimer text; legal review required note

**Auto-log trigger:** When the output is first generated (or regenerated), write a timestamped record to Audit_Log.

---

## 17. Sheet 15: Audit_Log

**Purpose:** Timestamped log of every calculation run.
**Primary Users:** Admin, compliance

**Columns:**
| Column | Header |
|---|---|
| A | Log_Timestamp |
| B | Employee_ID |
| C | Employee_Name |
| D | Period_Start |
| E | Period_End |
| F | Award_Applied |
| G | Classification_Applied |
| H | Gross_Pay_Calculated |
| I | Flags_Raised |
| J | Tool_Version |
| K | Calculated_By |
| L | Scenario_Hash (optional uniqueness check) |

**Auto-populate trigger (VBA or manual):**
Every time Scenario_Output is finalised, the user confirms calculation and data is written to Audit_Log.

> **Note:** If VBA is not available (web Excel), implement a manual "Log This Calculation" button with instructions.

---

## 18. Sheet 16: Admin_Config

**Purpose:** Central configuration — tool settings, span-of-hours values, break triggers, TOIL settings.
**Primary Users:** Admin only (locked)

**Key settings:**

| Setting | Award | Value | Description |
|---|---|---|---|
| ClerksSpanStart | MA000002 | [validate: e.g. 0.291667 = 7:00 AM] | Start of ordinary time span |
| ClerksSpanEnd | MA000002 | [validate: e.g. 0.791667 = 7:00 PM] | End of ordinary time span |
| RTD_BreakTrigger | MA000038 | [validate hours] | Hours before meal break required |
| RTD_BreakMin | MA000038 | [validate minutes] | Minimum break duration |
| RTLDO_WT_Trigger | MA000039 | [validate hours] | Waiting time trigger |
| CasualLoading | ALL | [validate: 0.25] | Casual loading factor |
| ToolVersion | ALL | 1.0 | Current version |
| EffectiveDate | ALL | [date] | Rates effective date |
| AdminPassword | ALL | [set by admin] | Workbook protection password |

---

## 19. Sheet 17: Version_Control

**Purpose:** Tracks all changes to the workbook.
**Columns:** Version | Date | Changed_By | Change_Description | Approved_By | Impact

---

## 20. General Build Notes

### Named Ranges (minimum required)
- `ActiveAward` — current award code
- `Rates_Table` — full rates matrix
- `Allowances_Table` — full allowances matrix
- `PH_Table` — public holidays
- `Classification_Mapper` — classification reference
- `CoverageResult` — coverage engine output
- `ClerksClassList`, `RTDClassList`, `RTLDOClassList` — dropdown lists for Data_Entry

### Error Handling
Wrap all XLOOKUP calls in IFERROR:
```excel
=IFERROR(XLOOKUP(lookup, range, result), "⚠ NOT FOUND — check table")
```

### Performance
- Avoid volatile functions (INDIRECT, OFFSET) where possible — use structured table references
- For large datasets, consider disabling automatic recalculation during bulk data entry

### Accessibility
- Use descriptive cell comments for every input cell
- Provide help text in a side column (column visible or togglable)
- Use consistent colour coding as per UX document

---

*This document is part of a controlled build pack. See README.md for package overview and update responsibilities.*
