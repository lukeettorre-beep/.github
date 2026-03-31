# Document 06 — Rules Engine: Road Transport and Distribution Award 2020 [MA000038]

**Build Pack:** Award Interpreter Tool
**Award:** Road Transport and Distribution Award 2020 [MA000038]
**Version:** 1.0
**Status:** Draft — Requires Legal Validation

> **CRITICAL VALIDATION NOTE:** All clause references are indicative. All pay rates, penalty multipliers, allowance amounts and vehicle GVM thresholds must be verified against the current consolidated award text on fwc.gov.au and the current FWO pay guide for this award before implementation. Do not use illustrative figures for any real pay calculation.

---

## 1. Coverage

### Rule RTD-COV-01: Industry Coverage

**Rule ID:** RTD-COV-01
**Rule Name:** RTD Award — Industry Coverage
**Clause Reference:** MA000038 cl.4 — verify current text
**Legal Basis:** The Road Transport and Distribution Award 2020 covers employers and their employees in the road transport and distribution industry.
**Practical Meaning:** Employers primarily engaged in the cartage, collection, or delivery of goods by road, including incidental warehousing, are in this industry.

**Required Inputs:** ORG003, ORG004
**Logic:**
```
IF ORG003 = "Transport/Logistics"
OR ORG004 contains keywords [cartage, courier, freight, transport, distribution, warehousing, logistics]
THEN → RTD coverage test satisfied — proceed to classification test
ELSE → RTD coverage test not satisfied → check Clerks or other award
```

**Manual Review Trigger:** Employer primarily engaged in another industry (e.g., retail, manufacturing) but operates delivery vehicles incidentally to that primary activity — may be covered by a different award

### Rule RTD-COV-02: Occupational Coverage

**Rule ID:** RTD-COV-02
**Clause Reference:** MA000038 cl.4 and Schedule A (Classifications) — verify
**Legal Basis:** The award covers employees employed in the classifications in the award.
**Key Covered Roles:**
- Drivers (all vehicle classes)
- Storepersons / warehouse hands
- Forklift operators
- Despatch workers
- Delivery contractors classified as employees (verify)
- Leading hands in transport/distribution operations

**Key Exclusions:**
- Clerical employees (covered by Clerks Award in most cases)
- Managerial employees above the classifications in the award
- Employees covered by the RTLDO Award [MA000039] for their operations
- Employees covered by a more specific award

> **VALIDATION FLAG:** The RTD Award exclusions clause must be verified. In particular, confirm the treatment of supervisory/managerial employees and the boundary with the RTLDO Award.

---

## 2. Classification Structure

### Rule RTD-CLA-01: Vehicle-Based Classification Framework

**Rule ID:** RTD-CLA-01
**Clause Reference:** MA000038 Schedule A — verify current text
**Legal Basis:** The RTD Award classification structure is primarily based on the gross vehicle mass (GVM) of the vehicle operated, with additional considerations for duties performed (loading/unloading, dangerous goods, etc.) and experience.

> **VALIDATION FLAG:** The exact classification titles, GVM thresholds, and rate relativities in MA000038 Schedule A must be verified against the current award. The following framework is structural.

**Classification Framework (populate from award Schedule A):**

| Classification | Vehicle/Role Indicator | GVM Range | Key Duties | Validate |
|---|---|---|---|---|
| Grade 1 (indicative) | Small vehicle driver / general hand | Up to approx. 4.5t GVM | Local delivery, basic warehouse | Verify |
| Grade 2 (indicative) | Light rigid driver / storeperson | 4.5t–8t GVM range | Deliveries, loading/unloading | Verify |
| Grade 3 (indicative) | Medium rigid driver | 8t–15t GVM range | Medium freight, may operate MHE | Verify |
| Grade 4 (indicative) | Heavy rigid driver | 15t–25t GVM range | Heavy freight operations | Verify |
| Grade 5 (indicative) | Multi-combination / B-double | Over 25t GVM | Articulated, B-double, road train | Verify |
| Leading Hand | Supervisory over other RTD employees | Any | Direct supervision of team | Verify |
| Forklift Operator | Forklift operations | N/A | Forklift-specific duties | Verify |

**Required Inputs:** CLA006 (vehicle GVM), CLA001 (job title), LU001 (loading/unloading), CLA007 (dangerous goods)

**Logic:**
```
step 1: MATCH CLA006 to GVM range → identify base classification band
step 2: CHECK for leading hand indicator (CLA009) → apply leading hand classification if applicable
step 3: CHECK for dangerous goods (CLA007) → verify if this affects classification or only allowance
step 4: CHECK for forklift duties → apply forklift classification if primary function
step 5: Output: RTD_CLASSIFICATION → reference Rates_Table[RTD][Classification] for applicable rate
```

---

## 3. Employment Types

### Rule RTD-ETP-01: Full-Time Employee

**Rule ID:** RTD-ETP-01
**Clause Reference:** MA000038 employment type clause — verify
**Logic:**
```
IF ETP001 = "Full-time"
THEN ordinary hours = 38 per week
THEN daily ordinary hours = 7.6 (standard 5-day)
THEN no casual loading
THEN NES entitlements in full
```

### Rule RTD-ETP-02: Part-Time Employee

**Rule ID:** RTD-ETP-02
**Clause Reference:** MA000038 — verify part-time provision
**Logic:**
```
IF ETP001 = "Part-time"
THEN guaranteed hours = ETP004
THEN additional hours above guarantee → check whether OT or additional ordinary hours
```
> **VALIDATION FLAG:** Part-time provisions for transport workers may differ from Clerks Award. Verify specific part-time conditions in MA000038.

### Rule RTD-ETP-03: Casual Employee

**Rule ID:** RTD-ETP-03
**Clause Reference:** MA000038 — verify casual provision and loading rate
**Logic:**
```
IF ETP001 = "Casual"
THEN casual loading = [VALIDATE: standard 25% in most modern awards — verify for RTD]
THEN minimum engagement = [VALIDATE: check award — typically 4 hours for RTD]
THEN if actual hours < minimum engagement → pay minimum engagement
```
> **VALIDATION FLAG:** Confirm casual minimum engagement for the RTD Award. The transport industry often has a 4-hour casual minimum — verify.

---

## 4. Ordinary Hours

### Rule RTD-ORD-01: Ordinary Hours Definition

**Rule ID:** RTD-ORD-01
**Clause Reference:** MA000038 hours of work clause — verify
**Legal Basis:** Ordinary hours do not exceed 38 per week and must not exceed the daily/weekly limits set out in the award.

> **VALIDATION FLAG:** The RTD Award may have specific provisions about the spread of ordinary hours and when penalty rates apply on weekdays. Many transport operations run across early morning and evening hours. Confirm:
> - Whether there is a defined span of hours for ordinary time
> - Whether shift allowances apply where shifts fall outside certain times
> - Whether a specific daily maximum applies before overtime kicks in

**Logic (structural):**
```
FOR each shift day:
  ordinary_hours_today = MIN(hours_worked_net, daily_ordinary_limit)
  IF hours_worked_net > daily_ordinary_limit THEN daily_overtime = hours_worked_net - daily_ordinary_limit
  APPLY relevant rate for time of day/day of week from Rates_Table[RTD]
```

---

## 5. Shiftwork

### Rule RTD-SHF-01: Shift Worker Classification

**Rule ID:** RTD-SHF-01
**Clause Reference:** MA000038 shiftwork clause — verify
**Legal Basis:** Employees rostered on rotating or fixed afternoon/night shifts are entitled to shift loadings.

> **VALIDATION FLAG:** Confirm the RTD Award shift definitions and applicable loading percentages. Note that transport operations often involve very early morning starts or late night finishes which may attract penalties even for day workers.

**Logic:**
```
IF ETP007 = "Yes" AND SHF009 ∈ ["Afternoon", "Night", "Rotating"]
THEN shift_loading = Rates_Table[RTD][ShiftLoading][SHF009]
THEN shift_pay = base_rate × (1 + shift_loading)
```

---

## 6. Meal Breaks and Rest Breaks

### Rule RTD-BRK-01: Meal Break

**Rule ID:** RTD-BRK-01
**Clause Reference:** MA000038 breaks clause — verify
**Legal Basis:** Drivers and other RTD employees are entitled to meal breaks after working a specified number of hours.

> **VALIDATION FLAG:** Confirm the break trigger, duration, and whether breaks are paid or unpaid under the RTD Award. Note that fatigue management legislation (HVNL) may impose separate and more stringent rest requirements for heavy vehicle drivers, but these are statutory requirements separate from the award.

**Logic:**
```
IF SHF008 >= break_trigger_hours (from award)
AND BRK003 < minimum_break_duration
THEN BRK006 = "Non-compliant" → flag
NOTE: For heavy vehicle drivers, also check HVNL compliance (outside tool scope — flag for compliance team)
```

### Rule RTD-BRK-02: Rest Break Between Shifts

**Rule ID:** RTD-BRK-02
**Clause Reference:** MA000038 — verify minimum rest between shifts
**Legal Basis:** Employees are entitled to a minimum rest period between the end of one shift and the start of the next.
> **VALIDATION FLAG:** Confirm minimum rest period between shifts under MA000038. If employee's rostered rest period is less than the minimum, flag.

---

## 7. Overtime

### Rule RTD-OT-01: Daily Overtime

**Rule ID:** RTD-OT-01
**Clause Reference:** MA000038 overtime clause — verify
**Logic:**
```
daily_ordinary_max = [verify from award — commonly 7.6 hours or 8 hours depending on award]
IF SHF008 > daily_ordinary_max
THEN daily_OT = SHF008 - daily_ordinary_max
THEN OT_pay_tier1 = MIN(daily_OT, 2) × base_rate × [VALIDATE: typically 1.5]
THEN OT_pay_tier2 = MAX(daily_OT - 2, 0) × base_rate × [VALIDATE: typically 2.0]
```

### Rule RTD-OT-02: Weekly Overtime

**Rule ID:** RTD-OT-02
**Clause Reference:** MA000038 overtime clause — verify
**Logic:**
```
weekly_ordinary = 38 hours
IF weekly_hours_total > 38
THEN weekly_OT = weekly_hours_total - 38
Ensure no double-counting with daily OT
```

### Rule RTD-OT-03: Overtime — Recall to Duty

**Rule ID:** RTD-OT-03
**Clause Reference:** MA000038 — verify call-back provision
**Legal Basis:** Where an employee is recalled to work after leaving the workplace, a minimum number of hours payment applies.
> **VALIDATION FLAG:** Confirm call-back minimum payment for RTD employees (typically 3 hours or 4 hours — verify).

---

## 8. Penalty Rates

### Rule RTD-PEN-01: RTD Penalty Rate Matrix

> **CRITICAL VALIDATION FLAG:** All multipliers below are STRUCTURAL PLACEHOLDERS. Source every figure from current MA000038 and FWO pay guide.

| Scenario | Code | Multiplier | Validate |
|---|---|---|---|
| Weekday ordinary time | WD-OT | 1.00 | Confirm base |
| Early morning weekday (before span) | WD-EM | VALIDATE | Award clause |
| Saturday | SAT | VALIDATE | Award clause |
| Sunday | SUN | VALIDATE | Award clause |
| Public holiday — worked | PH-W | VALIDATE | Award clause |
| Public holiday — not worked | PH-NW | Full day | Award/NES |
| Overtime weekday — first 2 hours | OT-1 | VALIDATE (typ. 1.5) | Award OT clause |
| Overtime weekday — after 2 hours | OT-2 | VALIDATE (typ. 2.0) | Award OT clause |
| Afternoon shift loading | SHF-AFT | VALIDATE | Award shift clause |
| Night shift loading | SHF-NGT | VALIDATE | Award shift clause |
| Casual loading | CAS | VALIDATE (typ. 25%) | Award casual clause |

---

## 9. Vehicle and Role-Based Allowances

### Rule RTD-ALW-01: Vehicle Allowance

**Rule ID:** RTD-ALW-01
**Clause Reference:** MA000038 allowances clause / Schedule C — verify
**Legal Basis:** Drivers are entitled to vehicle allowances based on the type and GVM of the vehicle operated.

> **VALIDATION FLAG:** The RTD Award contains specific vehicle allowances. These must be sourced from the current award Schedule (commonly Schedule B or C — verify). Amounts are typically indexed to the Annual Wage Review. Populate Allowances_Table[RTD][Vehicle] from current FWO pay guide.

**Logic:**
```
IF ALW002 = "Yes" (vehicle allowance applicable)
AND CLA006 is populated (vehicle GVM class)
THEN vehicle_allowance = XLOOKUP(CLA006, Allowances_Table[RTD_Vehicle][Class], Allowances_Table[RTD_Vehicle][Amount])
```

### Rule RTD-ALW-02: Dangerous Goods Allowance

**Rule ID:** RTD-ALW-02
**Clause Reference:** MA000038 allowances clause — verify
**Legal Basis:** An additional allowance applies when employees are required to handle or transport dangerous goods.
> **VALIDATION FLAG:** Confirm trigger conditions and current amount for dangerous goods allowance in MA000038.
**Logic:**
```
IF ALW003 = "Yes" (dangerous goods)
AND CLA007 = "Yes" (licensed for dangerous goods)
THEN dangerous_goods_allowance = Allowances_Table[RTD_DG]
```

### Rule RTD-ALW-03: First Aid Allowance

**Rule ID:** RTD-ALW-03
**Clause Reference:** MA000038 allowances clause — verify
> **VALIDATION FLAG:** Confirm first aid allowance trigger and amount.
**Logic:**
```
IF ALW004 = "Yes" AND CLA008 = "Yes"
THEN first_aid_allowance = Allowances_Table[RTD_FA]
```

### Rule RTD-ALW-04: Meal Allowance

**Rule ID:** RTD-ALW-04
**Clause Reference:** MA000038 — verify meal allowance provision
**Logic:**
```
IF overtime worked >= trigger threshold (verify hours from award)
AND employee not provided with meal by employer
THEN meal_allowance = Allowances_Table[RTD_Meal]
```

### Rule RTD-ALW-05: Tool Allowance

**Rule ID:** RTD-ALW-05
> **VALIDATION FLAG:** Confirm whether the RTD Award provides a tool allowance and the trigger conditions.

---

## 10. Loading and Unloading

### Rule RTD-LU-01: Loading/Unloading Duties Impact on Classification

**Rule ID:** RTD-LU-01
**Clause Reference:** MA000038 — verify loading/unloading classification provisions
**Legal Basis:** The RTD Award may provide that employees required to perform loading and unloading duties in addition to driving may be entitled to a higher classification or additional payment.

> **VALIDATION FLAG:** The treatment of loading/unloading under the RTD Award requires specific verification. Key questions:
> 1. Does loading/unloading affect classification level or trigger a separate allowance?
> 2. Is incidental loading/unloading (assisting with delivery) treated differently from primary loading/unloading duties?
> 3. Are there time or weight thresholds?

**Logic (pending validation):**
```
IF LU001 = "Yes"
AND loading/unloading is primary or substantial part of duties
THEN check whether this escalates classification level → compare to CLA003
IF classification should be higher due to LU duties → flag underpayment risk
```

---

## 11. Minimum Engagement

### Rule RTD-MIN-01: Casual Minimum Engagement

**Rule ID:** RTD-MIN-01
> **VALIDATION FLAG:** Confirm minimum casual engagement for RTD Award.
**Logic:**
```
IF ETP001 = "Casual"
AND actual_hours < minimum_casual_engagement (from award)
THEN payable_hours = minimum_casual_engagement
```

---

## 12. Interaction with RTLDO Award

### Rule RTD-INT-01: RTD vs. RTLDO Boundary

**Rule ID:** RTD-INT-01
**Clause Reference:** MA000038 and MA000039 — coverage clauses
**Legal Basis:** The RTLDO Award [MA000039] covers employees engaged in long-distance operations. The RTD Award covers other road transport employees. Where an employee is engaged in long-distance operations, the RTLDO Award applies to those operations.

**Logic:**
```
IF TRP005 = "Long-Haul" OR "Interstate"
AND TRP006 = "Yes" (overnight away)
THEN → RTLDO coverage check (ACE-02)
ELSE → RTD rules apply
```

**Manual Review Trigger:** Employee regularly performs both local RTD and long-distance RTLDO trips. Cannot auto-split; flag for review.

---

## 13. Edge Cases

| Edge Case | Rule Response |
|---|---|
| Driver also performs loading duties without licenced forklift | Check classification — may affect level |
| Employee operates multiple vehicle types in same week | Apply highest applicable classification for week (verify this is award-consistent) |
| Driver uses own vehicle | Check whether allowance structure is different |
| Apprentice driver | Different rate structure — flag |
| Night shift driver whose shift spans midnight (Mon→Tue) | Split shift at midnight and apply appropriate day rates for each portion |
| Driver who returns home same day but road distance exceeds 500 km | Check RTLDO definition — may or may not qualify |

---

*This document is part of a controlled build pack. See README.md for package overview and update responsibilities.*
