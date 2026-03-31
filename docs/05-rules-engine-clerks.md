# Document 05 — Rules Engine: Clerks—Private Sector Award 2020 [MA000002]

**Build Pack:** Award Interpreter Tool
**Award:** Clerks—Private Sector Award 2020 [MA000002]
**Version:** 1.0
**Status:** Draft — Requires Legal Validation

> **CRITICAL VALIDATION NOTE:** All clause references below are indicative based on the current consolidated award text as understood at the time of this build pack. They must be verified against the current award on the Fair Work Commission website (fwc.gov.au) before implementation. Award variations may alter clause numbering or content. All pay rates are illustrative structural placeholders only — source actual rates from the Fair Work Ombudsman pay guide for this award.

---

## 1. Coverage

### Rule CL-COV-01: Industry and Occupation Coverage

**Rule ID:** CL-COV-01
**Rule Name:** Clerks Award — General Coverage
**Clause Reference:** MA000002 cl.4 (Coverage) — verify current text
**Legal Basis:** The Clerks—Private Sector Award 2020 covers employers throughout Australia in the private sector in relation to their employees employed in the classifications set out in Schedule A of the award.
**Trigger Condition:** Employee is engaged in clerical, administrative or related work in the private sector.
**Required Inputs:** ORG003, ORG005, EMP_DUTIES_PRIMARY, CLA003
**Logic Statement:**
```
IF ORG005 = "Private"
AND EMP duties fall within a classification described in Clerks Award Schedule A
AND employer is not covered by a more specific award excluding these employees
THEN → CL-COV-01 satisfied → apply Clerks Award
```
**Output:** Award coverage confirmed or denied
**Exception Handling:** If employer is in transport industry and employee primarily performs transport duties → refer to ACE-04 (mixed duties)
**Audit Note:** Record basis of coverage determination; note any assumptions
**Common User Mistakes:** Applying the Clerks Award to employees in government or not-for-profit community services — check sector first
**Manual Review Trigger:** Employer in an industry with its own award; employee duties are primarily non-clerical

### Rule CL-COV-02: Exclusions

**Rule ID:** CL-COV-02
**Rule Name:** Clerks Award — Specific Exclusions
**Clause Reference:** MA000002 cl.4.2 — verify current text
**Legal Basis:** Certain employees and employers are excluded from the Clerks Award coverage.
**Key exclusions to implement:**
- Employees in the banking, finance and insurance industry covered by another award
- Employees in the media industry covered by another award
- Employees in the public sector
- Employees covered by a more specific industry award that expressly covers clerical functions in that industry

> **VALIDATION FLAG:** The full list of exclusions in the current Clerks Award must be verified. The above list is illustrative. Confirm by checking cl.4 of the current award.

---

## 2. Classification Structure

### Rule CL-CLA-01: Classification Level Determination

**Rule ID:** CL-CLA-01
**Rule Name:** Classification Level — Assessment Framework
**Clause Reference:** MA000002 Schedule A — verify current text
**Legal Basis:** The Clerks Award prescribes minimum rates for employees classified at Levels 1 through 6 (verify exact level count against current award Schedule A). Classification is based on duties performed, skills applied, degree of supervision, and responsibility.

> **VALIDATION FLAG:** The Clerks Award classification structure is set out in Schedule A. The specific level descriptors, indicative tasks, and salary relativities must be sourced directly from the current award text. The following framework is structural — it must be populated with actual award level descriptors before use.

**Classification Framework (populate from award Schedule A):**

| Level | Key Indicators | Indicative Duties | Typical Experience |
|---|---|---|---|
| Level 1 | Entry level, supervised, routine tasks | Data entry, filing, reception | < 3 months (indicative) |
| Level 2 | Basic operational skills, some autonomy | Accounts basic, customer service | 3–12 months (indicative) |
| Level 3 | Intermediate skills, independent in routine tasks | Payroll support, basic bookkeeping | 1–2 years (indicative) |
| Level 4 | Advanced clerical, may supervise others | Senior administration, team leader | 2–4 years (indicative) |
| Level 5 | Specialist or supervisory | Supervisor, senior accounts | Significant experience |
| Level 6 | Senior specialist or management of clerical teams | Senior manager (clerical) | Extensive |

**Required Inputs:** CLA001, CLA003, duties description
**Logic Statement:**
```
Prompt user to answer classification assessment questions (see doc 08)
Map responses to classification level
Flag if assessed level is below contracted level — underpayment risk
Flag if assessed level is above contracted level — potential misclassification
```
**Manual Review Trigger:** Role spans two classification levels; duties have changed since last assessment

---

## 3. Employment Types

### Rule CL-ETP-01: Full-Time Employee

**Rule ID:** CL-ETP-01
**Clause Reference:** MA000002 cl.10 — verify
**Legal Basis:** A full-time employee works an average of 38 ordinary hours per week.
**Logic:**
```
IF ETP001 = "Full-time"
THEN ordinary hours base = 38 per week
THEN daily ordinary hours = 7.6 hours (standard 5-day week)
THEN no casual loading
THEN NES entitlements apply in full
```

### Rule CL-ETP-02: Part-Time Employee

**Rule ID:** CL-ETP-02
**Clause Reference:** MA000002 cl.11 — verify
**Legal Basis:** A part-time employee works fewer than 38 ordinary hours per week, by agreement, with guaranteed hours specified in writing.

> **VALIDATION FLAG:** The Clerks Award has specific part-time provisions including requirements for agreed hours to be set in writing. The exact requirements must be verified from current award text.

**Logic:**
```
IF ETP001 = "Part-time"
THEN ordinary hours = ETP004 (guaranteed hours)
THEN hours must not exceed 38 per week as ordinary hours
THEN hours above guaranteed (if worked) → check whether overtime triggers OR whether part-time hours variation has been agreed
THEN no casual loading
THEN pro-rata NES entitlements
```
**Manual Review Trigger:** Part-time hours regularly exceed agreed hours; agreed hours not documented in writing

### Rule CL-ETP-03: Casual Employee

**Rule ID:** CL-ETP-03
**Clause Reference:** MA000002 cl.12 — verify
**Legal Basis:** A casual employee is engaged by the hour and paid the appropriate casual loading on top of the minimum rate.

> **VALIDATION FLAG:** Verify current casual loading percentage from award. Standard modern award casual loading is 25% — confirm this applies to the Clerks Award in its current form.

**Logic:**
```
IF ETP001 = "Casual"
THEN base rate = applicable classification minimum rate
THEN casual loading = [VALIDATE: 25%] applied to base rate
THEN casual hourly rate = base rate × (1 + casual_loading)
THEN minimum engagement = [VALIDATE: check award for minimum hours per engagement — typically 2 or 3 hours]
```
**Minimum Engagement:** Check award — flag if engagement is shorter than minimum
**Manual Review Trigger:** Casual employee has been engaged regularly for 12+ months (casual conversion pathway under NES)

---

## 4. Ordinary Hours and Span of Hours

### Rule CL-ORD-01: Ordinary Hours — General

**Rule ID:** CL-ORD-01
**Clause Reference:** MA000002 cl.13 (Hours of Work) — verify
**Legal Basis:** Ordinary hours are 38 per week. The award specifies a span of hours during which ordinary time rates apply.

> **VALIDATION FLAG:** The Clerks Award has specific span-of-hours provisions. The standard span of ordinary hours, extended span for shiftworkers, and conditions for work outside the span must all be verified from the current award. The following is structural — populate from award.

**Standard Span (indicative — verify):** Monday to Friday, 7:00 am to 7:00 pm
**Extended / Later Provisions:** Work between approximately 7:00 pm and midnight on Monday to Friday may attract additional penalties. Work before 7:00 am may also attract penalties. **Confirm exact times and rates from award.**

**Logic:**
```
FOR each shift:
  IDENTIFY day of week (SHF001)
  IDENTIFY start and end time (SHF003, SHF004)
  SPLIT hours into:
    → hours within ordinary span (apply ordinary rate)
    → hours outside ordinary span on a weekday (apply applicable penalty — confirm rate)
    → hours on Saturday (apply Saturday rate)
    → hours on Sunday (apply Sunday rate)
    → hours on public holiday (apply PH rate)
```

### Rule CL-ORD-02: Daily Spread

**Rule ID:** CL-ORD-02
**Clause Reference:** Verify — Clerks Award hours provision
**Legal Basis:** Ordinary hours may be worked across a spread/span. Hours outside the spread attract penalties.
**Logic:** If any shift hours fall outside the ordinary span → apply applicable penalty multiplier from Rates_Table

---

## 5. Shiftwork

### Rule CL-SHF-01: Shiftwork Definition

**Rule ID:** CL-SHF-01
**Clause Reference:** MA000002 shiftwork clause — verify
**Legal Basis:** An employee is a shiftworker if they are required to work rotating, afternoon or night shifts on a regular basis.

> **VALIDATION FLAG:** The Clerks Award shiftwork provisions, including the definition of an afternoon shift, night shift, and the applicable shift loadings, must be verified from the current award text.

**Logic:**
```
IF ETP007 = "Yes" (shiftworker)
AND SHF009 = "Afternoon" or "Night"
THEN apply shift loading as specified in award shift clause
→ Afternoon shift loading = [VALIDATE rate from award]
→ Night shift loading = [VALIDATE rate from award]
→ Rotating shift loading = [VALIDATE rate from award]
```
**Common User Mistakes:** Treating any late-start employee as a shiftworker. Shiftwork has a specific definition — employees must be rostered on a genuine shift basis.

---

## 6. Meal Breaks and Rest Breaks

### Rule CL-BRK-01: Meal Break Entitlement

**Rule ID:** CL-BRK-01
**Clause Reference:** MA000002 breaks clause — verify
**Legal Basis:** An employee must receive an unpaid meal break of not less than [verify duration — typically 30 minutes] after working a specified number of hours.

> **VALIDATION FLAG:** Confirm exact break trigger (hours worked before entitlement arises), break duration, whether break is paid or unpaid, and consequences of break not taken. These must be sourced from the current award.

**Logic:**
```
IF SHF008 >= [verify: hours trigger, e.g. 5 hours]
AND BRK003 = 0 (no break taken or < minimum)
THEN → BRK006 = "Non-compliant" → flag for review
ELSE → BRK006 = "Compliant"
```

### Rule CL-BRK-02: Rest Break Entitlement

**Rule ID:** CL-BRK-02
**Clause Reference:** MA000002 — verify rest break provision
**Legal Basis:** Employees may be entitled to paid rest breaks.
> **VALIDATION FLAG:** Confirm rest break entitlement (typically 10 minutes after specified hours worked) from award.

---

## 7. Overtime

### Rule CL-OT-01: Daily Overtime Trigger

**Rule ID:** CL-OT-01
**Clause Reference:** MA000002 overtime clause — verify
**Legal Basis:** Hours worked in excess of the ordinary daily hours attract overtime rates.

> **VALIDATION FLAG:** The Clerks Award overtime provision specifies when daily overtime triggers. This may differ for full-time and part-time employees. Verify exact trigger (e.g. after 7.6 hours on a standard day, or after agreed hours for part-time). Also verify whether part-time additional hours are overtime or additional ordinary time.

**Logic:**
```
daily_ordinary_hours = 7.6 (full-time) OR ETP004 / ETP003 (part-time daily guaranteed)
IF SHF008 > daily_ordinary_hours
THEN overtime_hours = SHF008 - daily_ordinary_hours
THEN first_2_hours_OT = MIN(overtime_hours, 2) × base_rate × [verify: OT rate 1 — typically 1.5]
THEN subsequent_OT = MAX(overtime_hours - 2, 0) × base_rate × [verify: OT rate 2 — typically 2.0]
```

### Rule CL-OT-02: Weekly Overtime Trigger

**Rule ID:** CL-OT-02
**Clause Reference:** MA000002 overtime clause — verify
**Legal Basis:** Hours worked in excess of 38 ordinary hours in a week attract overtime rates.
**Logic:**
```
weekly_hours_total = SUM of net hours worked each day
IF weekly_hours_total > 38
THEN weekly_overtime = weekly_hours_total - 38
(Ensure no double-counting with daily OT already paid)
```

### Rule CL-OT-03: Saturday Overtime

**Rule ID:** CL-OT-03
**Clause Reference:** Verify
**Legal Basis:** Work performed on a Saturday attracts a penalty rate as specified in the award.
> **VALIDATION FLAG:** Confirm Saturday rate for Clerks Award (ordinary time vs. penalty; whether first hours differ from subsequent hours).

### Rule CL-OT-04: Time Off in Lieu

**Rule ID:** CL-OT-04
**Clause Reference:** Verify TOIL provision
**Legal Basis:** By agreement, overtime may be taken as TOIL at the applicable overtime rate.
**Logic:** If OT004=Yes → record TOIL hours at overtime equivalent rate; note in audit output

---

## 8. Penalty Rates

### Rule CL-PEN-01: Penalty Rate Matrix

> **CRITICAL VALIDATION FLAG:** The penalty rates below are STRUCTURAL PLACEHOLDERS ONLY. Every multiplier must be sourced from the current Clerks Award and FWO pay guide before implementation. Do not use illustrative percentages for any real pay calculation.

| Scenario | Indicator | Multiplier | Source |
|---|---|---|---|
| Ordinary time (weekday, within span) | Standard | 1.00 | Award rate |
| Early morning work (before span start) | Early morning | VALIDATE | Award penalty clause |
| Late evening work (after span end, weekday) | Late evening | VALIDATE | Award penalty clause |
| Saturday — ordinary time | Saturday | VALIDATE | Award clause |
| Saturday — overtime | Saturday OT | VALIDATE | Award clause |
| Sunday | Sunday | VALIDATE | Award clause |
| Public holiday — worked | PH worked | VALIDATE | Award clause |
| Public holiday — not worked (entitlement) | PH not worked | Full day pay | Award/NES |
| Afternoon shift loading | Shift-afternoon | VALIDATE | Award shiftwork clause |
| Night shift loading | Shift-night | VALIDATE | Award shiftwork clause |
| Overtime (weekday, first 2 hours) | OT-1 | VALIDATE (typically 1.5) | Award overtime clause |
| Overtime (weekday, after 2 hours) | OT-2 | VALIDATE (typically 2.0) | Award overtime clause |

**Implementation:** All multipliers stored in Rates_Table sheet. Formulas reference Rates_Table[ClerksMultiplier] by scenario code. Never hard-code multipliers.

---

## 9. Public Holidays

### Rule CL-PH-01: Public Holiday Entitlement

**Rule ID:** CL-PH-01
**Clause Reference:** MA000002 public holiday clause + Fair Work Act s.114–117
**Legal Basis:** Employees are entitled to a day off on a public holiday with pay (or the appropriate rate for work performed). The NES provides the baseline; the award may supplement it.
**Logic:**
```
IF SHF002 is a public holiday date (cross-check PH_TABLE for EMP006)
AND SHF004 - SHF003 > 0 (hours were worked)
THEN apply public holiday rate from Rates_Table[ClerksMultiplier][PH-worked]
IF SHF002 is a public holiday date
AND employee did NOT work
THEN employee receives ordinary pay for that day (no work required)
```
**Manual Review Trigger:** Substitute day scenario; employee works only part of a public holiday; employee on annual leave that spans a public holiday

---

## 10. Allowances

### Rule CL-ALW-01: Meal Allowance

**Rule ID:** CL-ALW-01
**Clause Reference:** MA000002 allowances clause — verify
**Legal Basis:** Employees required to work overtime for a specified period without prior notice may be entitled to a meal allowance.
> **VALIDATION FLAG:** Confirm meal allowance trigger conditions, amount, and whether it is a reimbursement or set amount. Source amount from current award or FWO pay guide.

### Rule CL-ALW-02: Other Allowances

> **VALIDATION FLAG:** Review the Clerks Award allowances clause (Schedule B or equivalent) for all applicable allowances. Common Clerks Award allowances may include:
- First aid allowance (if applicable)
- Leading hand/supervisor allowance
- Clothing/laundry allowance
All amounts must be sourced from the current award and stored in the Allowances_Table.

---

## 11. Annual Leave Loading

### Rule CL-ALL-01: Annual Leave Loading

**Rule ID:** CL-ALL-01
**Clause Reference:** MA000002 — verify annual leave loading provision
**Legal Basis:** Full-time and part-time employees may be entitled to annual leave loading of 17.5% of ordinary time earnings during annual leave.
> **VALIDATION FLAG:** Confirm whether annual leave loading applies under the Clerks Award and whether it applies to all employees or only certain groups. Confirm whether the 17.5% figure is current.
**Note:** Annual leave loading calculation is outside the core scope of this tool's pay scenario output but should be flagged when annual leave is identified.

---

## 12. Minimum Engagement

### Rule CL-MIN-01: Casual Minimum Engagement

**Rule ID:** CL-MIN-01
**Clause Reference:** Clerks Award casual engagement provision — verify
**Legal Basis:** Casual employees are entitled to a minimum payment per engagement.
> **VALIDATION FLAG:** Confirm minimum engagement hours for casual employees under the Clerks Award (commonly 3 hours — verify).
**Logic:**
```
IF ETP001 = "Casual"
AND actual_hours_worked < minimum_engagement
THEN payable_hours = minimum_engagement
(employee paid for minimum even if sent home early)
```

---

## 13. Interaction Rules

### Rule CL-INT-01: NES Interaction

**Rule ID:** CL-INT-01
**Legal Basis:** The NES (Fair Work Act Part 2-2) provides minimum entitlements that cannot be reduced by any award. The award supplements and adds to NES minimums.
**Logic:** Always apply NES minima (maximum weekly hours, annual leave, personal leave, public holidays, notice of termination, etc.) as a floor. Award provisions are in addition.

### Rule CL-INT-02: Better Provision Principle

**Rule ID:** CL-INT-02
**Legal Basis:** The employee is entitled to the benefit of whichever instrument (NES, award, contract) provides the better outcome.
**Logic:** When calculating public holiday entitlements or leave, always confirm the award does not provide a lesser entitlement than the NES. If it does, apply NES.

---

*This document is part of a controlled build pack. See README.md for package overview and update responsibilities.*
