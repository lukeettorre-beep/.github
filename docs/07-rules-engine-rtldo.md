# Document 07 — Rules Engine: Road Transport (Long Distance Operations) Award 2020 [MA000039]

**Build Pack:** Award Interpreter Tool
**Award:** Road Transport (Long Distance Operations) Award 2020 [MA000039]
**Version:** 1.0
**Status:** Draft — Requires Legal Validation

> **CRITICAL VALIDATION NOTE:** The RTLDO Award has a materially different pay structure from most other awards, based on per-kilometre rates and specific long-distance conditions. All figures, definitions, trigger conditions and payment structures must be verified against the current consolidated award text on fwc.gov.au and the current FWO pay guide for MA000039 before any implementation. Do not use illustrative figures for any real pay calculation. This award requires specialist transport payroll knowledge for correct application.

---

## 1. Coverage

### Rule RTLDO-COV-01: Award Coverage — Long Distance Operations

**Rule ID:** RTLDO-COV-01
**Rule Name:** RTLDO Award — Industry and Occupation Coverage
**Clause Reference:** MA000039 cl.4 — verify current text
**Legal Basis:** The Road Transport (Long Distance Operations) Award 2020 covers employers and employees in the road transport industry engaged in long distance operations.

> **VALIDATION FLAG — DEFINITION OF LONG DISTANCE:** The definition of "long distance operations" in MA000039 is the threshold coverage question. This must be verified precisely from the current award text. The following is a working description pending validation: Long distance operations generally involve road transport operations where the driver is required to travel and return (or proceed) beyond a specified radius or time from their home base, typically involving overnight or multi-night trips.

**Required Inputs:** TRP005, TRP006, TRP004, EMP_DUTIES_PRIMARY
**Logic:**
```
IF ORG003 = "Transport/Logistics"
AND EMP_DUTIES_PRIMARY = "Driver" or "Transport"
AND TRP005 = "Interstate" OR "Long-Haul"
AND TRP006 = "Yes" (overnight away from base)
THEN → RTLDO coverage test satisfied — proceed to RTLDO rules
ELSE → RTD rules apply
```
**Manual Review Trigger:** Employee performs both local and long-distance runs; short interstate runs that may or may not qualify; unclear whether trips are genuinely "long distance" under award definition

### Rule RTLDO-COV-02: Excluded Employees

**Rule ID:** RTLDO-COV-02
> **VALIDATION FLAG:** Verify exclusions from MA000039 coverage. Clerical employees and employees covered by another more specific award are typically excluded.

---

## 2. Classification Structure

### Rule RTLDO-CLA-01: Long-Distance Driver Classification

**Rule ID:** RTLDO-CLA-01
**Clause Reference:** MA000039 Schedule A — verify current text
**Legal Basis:** Classification in the RTLDO Award is based on the type of vehicle operated, the driver's licence class, and potentially additional duties.

> **VALIDATION FLAG:** The RTLDO Award Schedule A classification structure must be verified. It is understood to include different classes of long-distance drivers based on vehicle type (rigid, articulated, multi-combination, B-double, road train). GVM thresholds and licence class requirements must be confirmed.

**Framework (populate from Schedule A):**

| Class | Vehicle Type | Licence Class | GVM Indicator | Validate |
|---|---|---|---|---|
| Class 1 | Rigid vehicle | [Verify] | Up to [verify] | Required |
| Class 2 | Semi-trailer / articulated | [Verify] | [Verify range] | Required |
| Class 3 | B-double | [Verify] | [Verify] | Required |
| Class 4 | Road train / multi-combination | [Verify] | [Verify] | Required |

**Required Inputs:** CLA006, LDT002, TRP010

---

## 3. The Per-Kilometre Payment Model

### Rule RTLDO-PAY-01: Per-Kilometre Rate Structure

**Rule ID:** RTLDO-PAY-01
**Rule Name:** RTLDO — Primary Pay Model (Per-Km)
**Clause Reference:** MA000039 — per km rate provisions — verify current clauses
**Legal Basis:** The RTLDO Award provides a per-kilometre rate structure as an alternative to a purely time-based rate. Minimum per-kilometre rates are set out in the award and may be structured as all-inclusive rates or rates supplemented by other entitlements.

> **CRITICAL VALIDATION FLAG:** The RTLDO pay model is the most complex element of this build pack. The per-kilometre rates, the conditions under which they apply, how they interact with waiting time, rest periods and other entitlements, and whether they are structured as all-in rates or component rates, must all be verified from the current award text and FWO guidance. The following is structural framework only.

**Per-Km Rate Framework (verify all values):**

| Category | Per-Km Rate | Applicable Conditions | Validate |
|---|---|---|---|
| Class 1 long-distance rate | [Source from award] | [Verify conditions] | Required |
| Class 2 long-distance rate | [Source from award] | [Verify conditions] | Required |
| Class 3 long-distance rate | [Source from award] | [Verify conditions] | Required |
| Class 4 long-distance rate | [Source from award] | [Verify conditions] | Required |

**Logic:**
```
per_km_pay = LDT003 × XLOOKUP(LDT002, RTLDO_Rates[Class], RTLDO_Rates[PerKmRate])
```

**Implementation Note:** Per-km rates must be stored in Rates_Table[RTLDO_PerKm]. Updated at each Annual Wage Review. Formulas reference table, never hard-coded values.

---

## 4. Minimum Ordinary Time Earnings

### Rule RTLDO-PAY-02: Minimum Weekly Earnings Floor

**Rule ID:** RTLDO-PAY-02
**Clause Reference:** MA000039 — minimum rate provisions — verify
**Legal Basis:** RTLDO employees must receive at least the minimum weekly rate for their classification, regardless of the per-km earnings for that week.

> **VALIDATION FLAG:** The RTLDO Award provides a minimum weekly earnings floor. This ensures drivers are not underpaid in low-kilometre weeks. Confirm the structure: is the floor the minimum weekly rate from the classification, or is it calculated differently? Verify from current award.

**Logic:**
```
per_km_total = LDT003 × per_km_rate
minimum_weekly = RTLDO_Rates[Class][MinWeekly]
weekly_pay = MAX(per_km_total, minimum_weekly)
IF per_km_total < minimum_weekly → flag: minimum floor applied
```

---

## 5. Waiting Time

### Rule RTLDO-WT-01: Waiting Time at Destination or Loading Point

**Rule ID:** RTLDO-WT-01
**Clause Reference:** MA000039 — waiting time provision — verify
**Legal Basis:** Where a long-distance driver is required to wait at a destination, loading point or other location for an extended period, the award provides for payment of waiting time at a specified rate.

> **VALIDATION FLAG:** Confirm the trigger for waiting time payment (how many hours before it applies), the rate at which waiting time is paid, and any maximum waiting time provisions in the current award.

**Logic:**
```
IF TRP008 > waiting_time_trigger (verify hours from award)
OR LDT004 > waiting_time_trigger
THEN waiting_time_pay = (TRP008 or LDT004) × waiting_time_rate (from Rates_Table[RTLDO_WT])
```

---

## 6. Meal Allowance (Long Distance)

### Rule RTLDO-MEAL-01: Meal Allowance — Long Distance

**Rule ID:** RTLDO-MEAL-01
**Clause Reference:** MA000039 — meal allowance clause — verify
**Legal Basis:** Long-distance drivers are entitled to meal allowances when meals are not provided by the employer.

> **VALIDATION FLAG:** Confirm the meal allowance structure in MA000039: number of meals, when each meal allowance triggers (time away from base, meal break times), and current amounts. Source from FWO RTLDO pay guide.

**Logic:**
```
IF LDT005 = "Yes" (meal allowance triggered — auto-calculated based on hours away)
THEN meal_allowance = Allowances_Table[RTLDO_Meal][applicable_meal_type]
```

---

## 7. Accommodation Allowance

### Rule RTLDO-ACC-01: Accommodation / Overnight Allowance

**Rule ID:** RTLDO-ACC-01
**Clause Reference:** MA000039 — accommodation/overnight allowance — verify
**Legal Basis:** Where a long-distance driver is required to remain away from home base overnight, an accommodation allowance is payable unless accommodation is provided by the employer.

> **VALIDATION FLAG:** Confirm current accommodation allowance amount, whether it is a set rate or reimbursement, and conditions under which it applies. Source from current award and FWO pay guide.

**Logic:**
```
IF LDT006 = "Yes" (overnight away from base)
AND employer_accommodation_provided = "No"
THEN accommodation_allowance = LDT007 × Allowances_Table[RTLDO_Accommodation]
```

---

## 8. Rest Period Entitlements

### Rule RTLDO-REST-01: Rest Period Between Trips

**Rule ID:** RTLDO-REST-01
**Clause Reference:** MA000039 — rest period provision — verify
**Legal Basis:** Long-distance drivers are entitled to a minimum rest period between trips. Failure to provide minimum rest may affect overtime calculations or create separate entitlements.

> **VALIDATION FLAG:** Confirm the minimum rest period between trips under MA000039. Note the interaction with the Heavy Vehicle National Law (HVNL) fatigue management requirements. Award rest periods and HVNL rest requirements may overlap or differ — both must be observed. HVNL compliance is outside this tool's scope but must be flagged.

**Logic:**
```
IF rest_period_provided < minimum_rest_between_trips (from award)
THEN → flag: rest period non-compliance — manual review required
NOTE: HVNL fatigue compliance is separately required — flag for safety/compliance team
```

### Rule RTLDO-REST-02: Weekly Rest

**Rule ID:** RTLDO-REST-02
**Clause Reference:** MA000039 — verify weekly rest provisions
> **VALIDATION FLAG:** Confirm weekly rest requirements under MA000039.

---

## 9. Overnight Stay — Special Conditions

### Rule RTLDO-OVN-01: Overnight Stays

**Rule ID:** RTLDO-OVN-01
**Clause Reference:** MA000039 — overnight provisions — verify
**Legal Basis:** The award contains provisions governing the conditions of overnight stays for long-distance drivers, including accommodation standards or allowances.

**Logic:**
```
IF LDT006 = "Yes"
THEN:
  apply accommodation_allowance (RTLDO-ACC-01)
  apply meal_allowance for overnight meals (RTLDO-MEAL-01)
  check rest period compliance (RTLDO-REST-01)
  apply any other overnight-specific entitlements from award
```

---

## 10. Ordinary Hours and Overtime (RTLDO Context)

### Rule RTLDO-ORD-01: Ordinary Hours in Long-Distance Context

**Rule ID:** RTLDO-ORD-01
**Clause Reference:** MA000039 — hours provisions — verify
**Legal Basis:** Even in a per-km payment context, the RTLDO Award specifies ordinary hours beyond which overtime rates apply.

> **VALIDATION FLAG:** The RTLDO Award's approach to overtime in the context of per-km payments is complex. Confirm:
> 1. Whether overtime applies on top of per-km rates or replaces them for excess hours
> 2. What the ordinary hours trigger is (weekly, daily, or both)
> 3. How ordinary time and overtime interact in a multi-day trip

**Logic (structural — pending validation):**
```
IF trip hours worked exceed ordinary hours (per award definition)
THEN assess whether overtime rates apply
IF overtime applies in addition to per-km rate → calculate separately and add
IF different arrangement applies → flag for manual review
```

---

## 11. Penalty Rates (RTLDO)

### Rule RTLDO-PEN-01: RTLDO Penalty Rate Matrix

> **CRITICAL VALIDATION FLAG:** All multipliers below are STRUCTURAL PLACEHOLDERS. Source from current MA000039 and FWO pay guide.

| Scenario | Code | Rate Basis | Validate |
|---|---|---|---|
| Weekday ordinary hours on trip | RTLDO-WD | Per-km + ordinary | Verify |
| Saturday trip | RTLDO-SAT | VALIDATE | Award clause |
| Sunday trip | RTLDO-SUN | VALIDATE | Award clause |
| Public holiday trip | RTLDO-PH | VALIDATE | Award clause |
| Overtime hours on trip | RTLDO-OT | VALIDATE | Award clause |
| Waiting time | RTLDO-WT | From award | Verify |

**Note:** RTLDO penalty rates may interact differently with the per-km model than standard time-rate awards. This requires specific legal validation before automated calculation.

---

## 12. Shiftwork and Time-of-Day Provisions

> **VALIDATION FLAG:** Confirm whether the RTLDO Award contains specific shift definitions and loadings. Many long-distance drivers work irregular hours; the award's approach to time-of-day variation should be verified.

---

## 13. Casual Employment (RTLDO)

> **VALIDATION FLAG:** Confirm whether casual employment exists under the RTLDO Award and the applicable loading and minimum engagement provisions.

---

## 14. Interaction with RTD Award

### Rule RTLDO-INT-01: RTLDO and RTD Interaction

**Rule ID:** RTLDO-INT-01
**Legal Basis:** Where a driver performs both local operations and long-distance operations, the applicable award for each trip type must be identified.

**Logic:**
```
FOR each trip:
  IF trip qualifies as long distance (LDT001 = Yes) → apply RTLDO rules
  IF trip is local/regional (TRP005 = Local or Regional) → apply RTD rules
  IF employee regularly does both → flag for manual review
  DO NOT mix rules from both awards for the same period without validation
```

**Manual Review Trigger:** Employee's pay period contains both RTD and RTLDO trips — aggregate pay scenario requires validation.

---

## 15. Interaction with Heavy Vehicle National Law

### Rule RTLDO-HVNL-01: HVNL Fatigue Management

**Rule ID:** RTLDO-HVNL-01
**Legal Basis:** The Heavy Vehicle National Law (HVNL) imposes mandatory fatigue management requirements on operators and drivers of heavy vehicles. These are separate from and additional to the award's rest period provisions.
**Tool Response:** This tool does not assess HVNL compliance. Where RTLDO Award flag is raised, the tool must display:
> **WARNING: Heavy vehicle operators are also subject to Heavy Vehicle National Law (HVNL) fatigue management requirements. These requirements are not assessed by this tool. Ensure HVNL compliance is separately verified with your safety/compliance team.**

---

## 16. Edge Cases

| Edge Case | Rule Response |
|---|---|
| Driver completes trip faster than expected (high km/h average) — per-km pay exceeds minimum | Tool outputs per-km calculation; flag if unusually high average speed (data quality check) |
| Trip cancelled mid-route | Verify whether award provides for partial payment — flag |
| Driver has to wait extended period due to flooding/road closure | Waiting time provisions may apply — flag for review |
| Driver uses company-provided accommodation | Accommodation allowance may not apply — check whether full allowance triggers |
| Multi-driver team operation | Each driver's time tracked separately — verify award treatment |
| Driver also loads at origin | Loading duties may trigger RTD classification considerations — flag |
| Trip straddles two calendar weeks | Ensure weekly hours calculated correctly for each week |

---

*This document is part of a controlled build pack. See README.md for package overview and update responsibilities.*
