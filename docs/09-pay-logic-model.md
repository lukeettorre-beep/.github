# Document 09 — Pay Logic Model

**Build Pack:** Award Interpreter Tool
**Awards:** MA000002 | MA000038 | MA000039
**Version:** 1.0
**Status:** Draft — Requires Legal Validation

> **VALIDATION NOTE:** This document defines the pay logic pathway — the sequence of decisions and calculations the tool must execute to produce a pay output. All rate values must be sourced from current award text and FWO pay guides. The logic structure below is legally grounded; the values must be separately populated and validated.

---

## 1. Pay Logic Overview

The pay calculation pathway follows this sequence for every scenario:

```
[1. Award Confirmed] → [2. Classification Confirmed] → [3. Base Rate Selected]
→ [4. Employment Type Applied] → [5. Hours Classified by Type]
→ [6. Ordinary Hours Calculated] → [7. Overtime Identified]
→ [8. Penalty Rates Applied] → [9. Allowances Applied]
→ [10. Total Period Pay Calculated] → [11. Minimum Pay Check]
→ [12. Output + Audit Record]
```

If any step cannot be completed automatically, the tool stops at that step and flags for manual review. It does not proceed to a final dollar figure when upstream decisions are unresolved.

---

## 2. Step 1: Base Rate Pathway

### 2.1 Select Minimum Hourly Rate

The base rate is the minimum hourly rate for the employee's classification under the applicable award.

**Inputs:** COV001 (award), CLA003 (classification level)
**Source:** Rates_Table[Award][Classification][HourlyRate]

**Formula (pseudo):**
```excel
=XLOOKUP(CLA003, Rates_Table[Classification_ID], Rates_Table[Hourly_Rate], "NOT FOUND")
```

**Validation:** If result = "NOT FOUND" → flag: classification code not in rates table → manual review
**Rate table note:** Rates_Table must be updated each Annual Wage Review. Always check: effective date in table matches or precedes calculation period.

### 2.2 Check Rate Effective Date

```excel
=IF(PHD001 >= Rates_Table[Effective_Date], "Rate Current", "RATE DATE ERROR — check Rates_Table")
```

If rate effective date is later than the calculation period start date → flag: wrong rate period may be in use.

---

## 3. Step 2: Employment Type Pathway

### 3.1 Full-Time Pathway

- Base rate = ordinary hourly rate as selected above
- No adjustment for employment type
- Ordinary hours = 38 per week (or daily equivalent)

### 3.2 Part-Time Pathway

- Base rate = same as full-time for classification
- Ordinary hours = guaranteed hours per week (ETP004)
- Hours between guaranteed hours and 38: verify whether these are overtime or additional ordinary hours under the specific award
- Hours above 38: overtime

> **VALIDATION FLAG:** Part-time hour treatment varies by award. For Clerks Award, additional hours above agreed hours but below 38 may or may not be overtime depending on the arrangement. For RTD, similar nuance applies. Validate by award before implementing.

### 3.3 Casual Pathway

```excel
casual_base_rate = ordinary_rate × (1 + XLOOKUP("CasualLoading", Rates_Table[Code], Rates_Table[Value]))
```

All hours (up to ordinary hours trigger) paid at casual base rate.
Overtime: casual rate PLUS overtime loading — validate whether casual loading and overtime penalty are cumulative or whether a different formula applies under each award.

> **VALIDATION FLAG:** The interaction between casual loading and overtime is a known complexity. Verify for each award whether overtime is calculated on the base rate (then casual loading added separately) or whether it is calculated on the casual base rate.

---

## 4. Step 3: Hours Classification

For each shift, classify every hour into one of the following categories:

| Hour Type | Code | Description |
|---|---|---|
| Ordinary time | OT | Within ordinary hours, within span, weekday |
| Early morning penalty | EM | Before span start, weekday |
| Late evening penalty | LE | After span end, weekday |
| Saturday ordinary | SAT-O | Saturday within ordinary hours |
| Saturday overtime | SAT-OT | Saturday beyond ordinary hours |
| Sunday | SUN | All Sunday hours |
| Public holiday | PH | All hours on a public holiday |
| Daily overtime 1 | DOT1 | First hours of daily overtime |
| Daily overtime 2 | DOT2 | Subsequent hours of daily overtime |
| Shift loading — afternoon | SHF-A | Afternoon shift |
| Shift loading — night | SHF-N | Night shift |

**Logic for classifying hours:**

```excel
=LET(
  shift_date, SHF002,
  start_time, SHF003,
  end_time, SHF004,
  net_hours, SHF008,
  day_of_week, WEEKDAY(shift_date, 2),  // 1=Mon, 7=Sun
  is_PH, IF(COUNTIF(PH_Table[Date], shift_date) > 0, TRUE, FALSE),

  // Apply classification in order of priority
  IF(is_PH = TRUE, "PH",
  IF(day_of_week = 7, "SUN",
  IF(day_of_week = 6, "SAT-O",  // Saturday handling — further split by hours
  IF(start_time < span_start OR end_time > span_end, "EM/LE",  // further split
  "OT"))))  // ordinary time
)
```

Note: Hours may span multiple categories within a single shift. The formula must calculate hours in each category separately and apply the correct rate to each segment.

---

## 5. Step 4: Ordinary Hours Calculation

```excel
daily_ordinary_limit = IF(ETP001="Full-time", 7.6,
                        IF(ETP001="Part-time", ETP004/ETP003,
                        IF(ETP001="Casual", 7.6, "ERROR")))

ordinary_hours_today = MIN(SHF008, daily_ordinary_limit)
```

Weekly ordinary hours accumulator:
```excel
weekly_ordinary = SUMIF(SHF_Table[Week], current_week, SHF_Table[Ordinary_Hours])
```

---

## 6. Step 5: Overtime Identification and Calculation

### 6.1 Daily Overtime

```excel
daily_overtime = MAX(0, SHF008 - daily_ordinary_limit)

daily_OT_tier1 = MIN(daily_overtime, 2)
daily_OT_tier2 = MAX(0, daily_overtime - 2)

daily_OT_pay =
  (daily_OT_tier1 × base_rate × XLOOKUP("OT_Tier1_Multiplier", Rates_Table[Award_Code & "_OT1"], Rates_Table[Value])) +
  (daily_OT_tier2 × base_rate × XLOOKUP("OT_Tier2_Multiplier", Rates_Table[Award_Code & "_OT2"], Rates_Table[Value]))
```

### 6.2 Weekly Overtime

```excel
weekly_total_hours = SUM(SHF_Table[Net_Hours_Worked])
weekly_OT_excess = MAX(0, weekly_total_hours - 38)
// Ensure no double-counting with daily OT already paid:
weekly_OT_additional = MAX(0, weekly_OT_excess - SUM(SHF_Table[Daily_OT_Hours]))
```

> **VALIDATION FLAG:** The interaction between daily overtime already paid and weekly overtime must be confirmed for each award. The general principle is that you do not pay twice for the same hours of overtime.

---

## 7. Step 6: Penalty Rate Application

### 7.1 Apply Rate Multiplier by Hour Type

For each hour type identified in Step 3:

```excel
period_pay = SUM(
  hours_ordinary × base_rate × 1.0,
  hours_EM × base_rate × XLOOKUP(award & "_EM", Rates_Table[Code], Rates_Table[Multiplier]),
  hours_LE × base_rate × XLOOKUP(award & "_LE", Rates_Table[Code], Rates_Table[Multiplier]),
  hours_SAT × base_rate × XLOOKUP(award & "_SAT", Rates_Table[Code], Rates_Table[Multiplier]),
  hours_SUN × base_rate × XLOOKUP(award & "_SUN", Rates_Table[Code], Rates_Table[Multiplier]),
  hours_PH × base_rate × XLOOKUP(award & "_PH", Rates_Table[Code], Rates_Table[Multiplier]),
  // plus overtime as calculated in Step 5
)
```

All multipliers stored in Rates_Table. No hard-coded values.

---

## 8. Step 7: Allowance Pathway

Apply each triggered allowance from the Allowances_Table:

```excel
total_allowances =
  IF(ALW001="Yes", XLOOKUP(award & "_Meal", Allowances_Table[Code], Allowances_Table[Amount]), 0) +
  IF(ALW002="Yes", XLOOKUP(CLA006, Allowances_Table[Vehicle_Class], Allowances_Table[Amount]), 0) +
  IF(ALW003="Yes", XLOOKUP(award & "_DG", Allowances_Table[Code], Allowances_Table[Amount]), 0) +
  IF(ALW004="Yes", XLOOKUP(award & "_FA", Allowances_Table[Code], Allowances_Table[Amount]), 0) +
  IF(ALW005="Yes", XLOOKUP(award & "_LH", Allowances_Table[Code], Allowances_Table[Amount]), 0)
```

For RTLDO:
```excel
rtldo_allowances =
  IF(LDT005="Yes", XLOOKUP("RTLDO_Meal", Allowances_Table[Code], Allowances_Table[Amount]), 0) +
  IF(LDT006="Yes", LDT007 × XLOOKUP("RTLDO_Accommodation", Allowances_Table[Code], Allowances_Table[Amount]), 0)
```

---

## 9. Step 8: Public Holiday Treatment

### 9.1 Day Not Worked

If a public holiday falls on a day the employee would ordinarily work, and they do not work:
- Full-time: pay for the ordinary hours they would have worked
- Part-time: pay for the hours they were rostered to work (if any)
- Casual: generally not entitled to payment for public holidays not worked (verify)

### 9.2 Day Worked

Pay at the public holiday rate for all hours worked:
```excel
PH_pay = hours_worked_on_PH × base_rate × XLOOKUP(award & "_PH", Rates_Table[Code], Rates_Table[Multiplier])
```

### 9.3 Substitute Day

> **VALIDATION FLAG:** Where a public holiday falls on a weekend and a substitute day is gazetted, confirm the employee is entitled to the substitute day. The tool must check the PH_Table for substitute day entries.

---

## 10. RTLDO Pay Logic — Per-Kilometre Model

### 10.1 Calculate Per-Km Earnings

```excel
per_km_earnings = LDT003 × XLOOKUP(LDT002, RTLDO_Rates[Class], RTLDO_Rates[PerKmRate])
```

### 10.2 Apply Minimum Weekly Floor

```excel
min_weekly = XLOOKUP(LDT002, RTLDO_Rates[Class], RTLDO_Rates[MinWeeklyRate])
trip_week_pay = MAX(per_km_earnings, min_weekly)
```

### 10.3 Add Allowances

```excel
total_RTLDO_pay = trip_week_pay + rtldo_allowances + waiting_time_pay
```

### 10.4 Overtime Component

```excel
// If trip hours exceed ordinary hours limit:
RTLDO_overtime_pay = [calculate per award OT provisions — VALIDATE BEFORE IMPLEMENTING]
```

---

## 11. Overlapping Entitlement Treatment

Where multiple rules could apply simultaneously (e.g., Saturday AND overtime AND shift loading), the award may specify:
- Cumulative application (add the loadings together)
- Non-cumulative application (apply only the highest)
- A specific combined rate

> **VALIDATION FLAG:** For each award, confirm how overlapping entitlements are treated. This is a documented area of complexity. General principles:
> - Under many modern awards, penalties are not cumulative — the employee receives the higher of applicable penalties
> - Some allowances are separate and always apply in addition to penalties
> - Casual loading may or may not be cumulated with shift loadings depending on the award

**Implementation rule:** Until validated, flag any scenario where two or more penalty triggers apply simultaneously and require manual review before finalising pay.

---

## 12. Minimum Payment Logic

### 12.1 Minimum Engagement

```excel
IF ETP001 = "Casual" AND actual_hours < min_engagement
THEN payable_hours = min_engagement
// Employee receives minimum engagement pay regardless of hours worked
```

### 12.2 Call-Back Minimum

```excel
IF recall_to_duty = TRUE AND hours_after_recall < min_callback
THEN callback_pay = min_callback × applicable_rate
```

### 12.3 RTLDO Minimum Weekly Floor

As described at 10.2 above.

---

## 13. Pay Scenario Output Structure

The tool must produce the following structured output for every scenario:

| Output Field | Description | Formula Source |
|---|---|---|
| AWARD | Award applied | COV001 |
| CLASSIFICATION | Classification level | CLA003 |
| BASE_RATE | Hourly base rate | Rates_Table |
| EMPLOYMENT_TYPE | FT / PT / Casual | ETP001 |
| ORDINARY_HOURS | Hours at ordinary time rate | Step 4 |
| ORDINARY_PAY | $ for ordinary hours | Step 4 |
| OVERTIME_HOURS | Total overtime hours | Step 5 |
| OVERTIME_PAY | $ for overtime | Step 5 |
| PENALTY_PAY | $ for penalty rates (non-OT) | Step 6 |
| TOTAL_ALLOWANCES | $ total allowances | Step 7 |
| GROSS_PAY | Total period pay | SUM of above |
| MINIMUM_PAY_CHECK | Is gross_pay >= minimum? | Step 11 |
| RULES_APPLIED | List of rule IDs used | Audit log |
| FLAGS | Any manual review flags | Step 12 |
| TOOL_VERSION | Version of tool | Admin_Config |
| CALC_DATE | Date of calculation | System date |

---

*This document is part of a controlled build pack. See README.md for package overview and update responsibilities.*
