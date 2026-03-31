# Document 13 — Testing Framework

**Build Pack:** Award Interpreter Tool
**Awards:** MA000002 | MA000038 | MA000039
**Version:** 1.0

---

## 1. Testing Overview

The Award Interpreter Tool must be tested before go-live and after every material change. Testing is not a formality — it is the primary mechanism for detecting logic errors before they cause underpayment or overpayment in real payroll.

### 1.1 Testing Levels

| Level | Purpose | Conducted By | When |
|---|---|---|---|
| Unit Testing | Verify each individual rule/formula works correctly | Technical Owner | During build |
| Integration Testing | Verify rules work correctly together in scenarios | Technical Owner + Payroll Owner | Before go-live |
| Regression Testing | Verify changes haven't broken previously working scenarios | Technical Owner | After every update |
| Exception Testing | Verify edge cases and unusual inputs are handled correctly | Technical Owner + HR | Before go-live |
| User Acceptance Testing | Verify the tool works for real users in realistic scenarios | HR, Payroll staff | Before go-live |
| Payroll Validation Testing | Compare tool outputs against independently confirmed pay calculations | Payroll Owner + ER Reviewer | Before go-live |
| Spot-Check Legal Review | Review a sample of calculations for legal accuracy | Legal/ER Reviewer | Before go-live; annually |

---

## 2. Unit Test Cases

### 2.1 Coverage Engine Tests

| Test ID | Input Combination | Expected Output | Pass/Fail |
|---|---|---|---|
| UT-COV-01 | Industry=Transport, LD=No, Overnight=No | MA000038 | |
| UT-COV-02 | Industry=Transport, LD=Yes, Overnight=Yes | MA000039 | |
| UT-COV-03 | Industry=Clerical-Other, Sector=Private | MA000002 | |
| UT-COV-04 | EA=Yes, Industry=Transport | REVIEW flag | |
| UT-COV-05 | Sector=Government | REVIEW flag | |
| UT-COV-06 | Industry=Mixed, DUTIES_CLERICAL_PCT=50% | REVIEW flag | |
| UT-COV-07 | Industry=Transport, DUTIES_CLERICAL_PCT=80% | REVIEW flag (mixed duties) | |

### 2.2 Rates Table Tests

| Test ID | Input | Expected | Pass/Fail |
|---|---|---|---|
| UT-RATE-01 | Award=MA000002, Classification=L1 | Returns a non-zero hourly rate | |
| UT-RATE-02 | Award=MA000038, Classification=Grade3 | Returns a non-zero hourly rate | |
| UT-RATE-03 | Award=MA000039, Class=C2, lookup=PerKm | Returns a non-zero per-km rate | |
| UT-RATE-04 | Invalid classification code | Returns "NOT FOUND" and flags | |
| UT-RATE-05 | Rates effective date > period start | Returns date warning | |

### 2.3 Break Compliance Tests

| Test ID | Hours Worked | Break Taken (min) | Expected | Pass/Fail |
|---|---|---|---|---|
| UT-BRK-01 | 4.0 hrs | 0 | Compliant (under trigger) | |
| UT-BRK-02 | 5.5 hrs | 30 | Compliant | |
| UT-BRK-03 | 5.5 hrs | 0 | NON-COMPLIANT flag | |
| UT-BRK-04 | 5.5 hrs | 15 | NON-COMPLIANT flag (insufficient) | |
| UT-BRK-05 | 8.0 hrs | 30 | Compliant | |

### 2.4 Public Holiday Tests

| Test ID | Shift Date | State | Expected PH Detection | Pass/Fail |
|---|---|---|---|---|
| UT-PH-01 | 25/12/2025 | NSW | YES — Christmas Day | |
| UT-PH-02 | 26/01/2026 | VIC | YES — Australia Day | |
| UT-PH-03 | 15/03/2026 (random) | NSW | No | |
| UT-PH-04 | State-specific date | QLD | YES for QLD only, No for NSW | |

---

## 3. Scenario Test Library

### Clerks Award Scenarios (MA000002)

#### Scenario CL-01: Standard Full-Time Weekday

**Test ID:** CL-SC-01
**Scenario:** Full-time Level 2 clerical officer, Monday–Friday, 8:00–16:30, 30-min unpaid lunch
**Facts:** ETP001=FT, CLA003=Level2, SHF003=08:00, SHF004=16:30, BRK003=30
**Expected:** 8 hours gross, 7.5 hours net; all within span; ordinary rate × 7.5 hours
**Key Risk:** Correct span-of-hours check (all within)
**Manual Review Trigger:** No

---

#### Scenario CL-02: Part-Time with Additional Hours

**Test ID:** CL-SC-02
**Scenario:** Part-time Level 3, guaranteed 20 hours/week (4 × 5h days), works 6 hours one day
**Facts:** ETP001=PT, ETP004=20, ETP003=4, SHF008=6 (one day), weekly total=22
**Expected:** 20 hours at ordinary rate; 2 additional hours — determine per award whether OT or additional ordinary
**Key Risk:** Part-time overtime threshold treatment
**Manual Review Trigger:** If OT determination is uncertain for this award

---

#### Scenario CL-03: Early Morning Start

**Test ID:** CL-SC-03
**Scenario:** Full-time Level 2, shift starts 6:00 AM (before span)
**Facts:** SHF003=06:00, SHF004=14:30, span_start=07:00
**Expected:** 1 hour at early morning penalty rate; 7 hours at ordinary rate (within span); 0.5 hours unpaid break
**Key Risk:** Correct split of hours at span boundary
**Manual Review Trigger:** No (if span confirmed in award)

---

#### Scenario CL-04: Saturday Work

**Test ID:** CL-SC-04
**Scenario:** Full-time Level 1, Saturday 9:00–13:00 (4 hours), already completed 38 ordinary hours
**Facts:** SHF001=Saturday, SHF008=4, weekly_total=42
**Expected:** 4 hours at Saturday penalty rate PLUS overtime (weekly > 38) — verify which applies or whether they overlap
**Key Risk:** Saturday penalty vs weekly overtime interaction
**Manual Review Trigger:** If overlapping penalty treatment unclear — flag

---

#### Scenario CL-05: Public Holiday Worked

**Test ID:** CL-SC-05
**Scenario:** Full-time Level 3, works 7.5 hours on Christmas Day
**Facts:** SHF002=25/12/2025, SHF008=7.5, PH_Table confirms PH
**Expected:** 7.5 hours at PH worked rate; employee also entitled to public holiday if they hadn't worked
**Key Risk:** Correct PH rate applied; confirm full shift is PH-rated
**Manual Review Trigger:** No

---

#### Scenario CL-06: Public Holiday Not Worked

**Test ID:** CL-SC-06
**Scenario:** Full-time Level 2, Christmas Day falls on a weekday the employee would normally work — employee does not work
**Facts:** PH_Table confirms PH; employee not rostered; ETP001=FT
**Expected:** Employee receives one ordinary day's pay (7.6 hours at base rate); no overtime; NES public holiday entitlement
**Key Risk:** PH entitlement for non-working day
**Manual Review Trigger:** No

---

#### Scenario CL-07: Casual Minimum Engagement

**Test ID:** CL-SC-07
**Scenario:** Casual Level 1, engaged for 2 hours, minimum engagement is 3 hours
**Facts:** ETP001=Casual, actual_hours=2, min_engagement=3 (validate from award)
**Expected:** Pay for 3 hours at casual rate (minimum engagement applies)
**Key Risk:** Minimum engagement rule; casual rate includes loading
**Manual Review Trigger:** No

---

#### Scenario CL-08: Night Shift Loading

**Test ID:** CL-SC-08
**Scenario:** Full-time Level 3 shiftworker, night shift
**Facts:** ETP007=Yes, SHF009=Night, award=MA000002
**Expected:** Night shift loading applied on top of base rate
**Key Risk:** Correct shift loading percentage applied
**Manual Review Trigger:** No (once rates validated)

---

### RTD Award Scenarios (MA000038)

#### Scenario RTD-01: Standard Full-Time Driver

**Test ID:** RTD-SC-01
**Scenario:** Full-time Grade 3 driver, 5-day week, 7:00–15:30, 30 min unpaid break
**Facts:** ETP001=FT, CLA003=Grade3, SHF003=07:00, SHF004=15:30, BRK003=30
**Expected:** 8 hours gross, 7.5 hours net ordinary time; Grade 3 hourly rate × 7.5
**Key Risk:** Correct Grade 3 rate from Rates_Table
**Manual Review Trigger:** No

---

#### Scenario RTD-02: Overtime After 7.6 Hours

**Test ID:** RTD-SC-02
**Scenario:** Full-time Grade 4 driver, works 10 hours (9.5 net after 30-min break)
**Facts:** SHF008=9.5 net, daily_ordinary=7.6 (verify)
**Expected:** 7.6 hours ordinary, 1.9 hours OT (tier 1 at 1.5×)
**Key Risk:** Daily OT trigger at correct threshold; OT Tier 1 vs Tier 2 split
**Manual Review Trigger:** No

---

#### Scenario RTD-03: Sunday Work

**Test ID:** RTD-SC-03
**Scenario:** Full-time Grade 3 driver, Sunday shift 6:00–14:30, 30-min break
**Facts:** SHF001=Sunday, SHF008=8.0
**Expected:** 8 hours at Sunday penalty rate (verify multiplier from award)
**Key Risk:** Correct Sunday rate for RTD award
**Manual Review Trigger:** No

---

#### Scenario RTD-04: Vehicle Allowance Applied

**Test ID:** RTD-SC-04
**Scenario:** Full-time Grade 4 driver, GVM 15t–25t, 5 days worked
**Facts:** ALW002=Yes, CLA006=15t-25t, days=5
**Expected:** Vehicle allowance per day × 5 days added to pay output
**Key Risk:** Correct vehicle allowance amount from Allowances_Table for GVM class
**Manual Review Trigger:** No

---

#### Scenario RTD-05: Dangerous Goods

**Test ID:** RTD-SC-05
**Scenario:** Grade 3 driver with DG licence, transports DG loads regularly
**Facts:** CLA007=Yes, ALW003=Yes
**Expected:** Dangerous goods allowance added
**Key Risk:** Allowance amount correct; verify trigger is met
**Manual Review Trigger:** No

---

#### Scenario RTD-06: Casual Minimum Engagement

**Test ID:** RTD-SC-06
**Scenario:** Casual Grade 2 driver engaged for 3 hours, award minimum engagement is 4 hours (verify)
**Facts:** ETP001=Casual, actual_hours=3, min_engagement=4
**Expected:** Pay for 4 hours at Grade 2 casual rate
**Key Risk:** Correct minimum engagement trigger; casual rate calculation
**Manual Review Trigger:** No

---

#### Scenario RTD-07: Public Holiday — Worked

**Test ID:** RTD-SC-07
**Scenario:** Grade 4 driver works Australia Day (public holiday), 7.5 hours
**Facts:** PH confirmed; SHF008=7.5
**Expected:** 7.5 hours at RTD public holiday rate
**Key Risk:** RTD PH rate (verify multiplier)
**Manual Review Trigger:** No

---

### RTLDO Award Scenarios (MA000039)

#### Scenario LD-01: Standard Long-Distance Trip

**Test ID:** LD-SC-01
**Scenario:** Class 2 long-distance driver, Sydney to Melbourne, 872 km, no waiting time, one overnight
**Facts:** LDT001=Yes, LDT002=Class2, LDT003=872, LDT007=1
**Expected:** Per-km earnings = 872 × Class2 rate; check against minimum weekly floor; add 1× overnight accommodation allowance + meal allowances
**Key Risk:** Per-km rate correct; minimum floor applied if needed
**Manual Review Trigger:** No (if RTLDO definition confirmed for trip)

---

#### Scenario LD-02: Per-Km Below Minimum Floor

**Test ID:** LD-SC-02
**Scenario:** Class 2 driver, short week due to vehicle breakdown, 200 km total
**Facts:** LDT001=Yes, LDT002=Class2, LDT003=200
**Expected:** Per-km = 200 × rate, but minimum_floor > per_km; minimum floor applies
**Key Risk:** Minimum floor logic correctly applied; output shows floor was applied
**Manual Review Trigger:** Flag minimum floor applied in output

---

#### Scenario LD-03: Extended Waiting Time

**Test ID:** LD-SC-03
**Scenario:** Class 3 driver, interstate trip, 5 hours waiting time at destination
**Facts:** LDT004=5, waiting_trigger=[validate from award]
**Expected:** Waiting time payment for hours beyond trigger threshold
**Key Risk:** Correct trigger applied; waiting time rate from Rates_Table
**Manual Review Trigger:** No (once waiting time trigger validated)

---

#### Scenario LD-04: Multiple Nights Away

**Test ID:** LD-SC-04
**Scenario:** Class 4 driver, 3 nights away, 2,400 km
**Facts:** LDT003=2400, LDT007=3
**Expected:** Per-km pay for 2400 km; 3 × overnight accommodation allowance; relevant meal allowances
**Key Risk:** Correct multiplication of nightly allowances
**Manual Review Trigger:** No

---

#### Scenario LD-05: Mixed Trip — RTD + RTLDO Same Period

**Test ID:** LD-SC-05
**Scenario:** Driver performs 2 local RTD runs and 1 RTLDO interstate run in same week
**Facts:** Mix of TRP005=Local and TRP005=Interstate+LDT001=Yes
**Expected:** REVIEW flag — tool cannot auto-calculate mixed-award week
**Key Risk:** Tool must detect and flag without producing incorrect combined output
**Manual Review Trigger:** YES — always

---

## 4. Exception / Edge Case Tests

| Test ID | Scenario | Expected Behaviour |
|---|---|---|
| EX-01 | EA field = Yes | Immediate warning; output labelled as floor only |
| EX-02 | Classification not completed | Warning; classification required before calculating |
| EX-03 | Shift end before start | Entry validation error; cannot proceed |
| EX-04 | Public holiday date in PH_Table but wrong state | No PH flag for employee in different state |
| EX-05 | Rate table effective date in future | Warning: rates not yet applicable for this period |
| EX-06 | Casual employee, 12+ months service | W010 warning re casual conversion |
| EX-07 | Hours entered >24 in a day | Validation error |
| EX-08 | GVM=Over25t with Grade 1 classification | Mismatch warning W007 |
| EX-09 | RTLDO trip but no km entered | Validation error — km required |
| EX-10 | Sector = Government | STOP: different award likely applies |

---

## 5. User Acceptance Testing

UAT sessions should be run with at least one representative from each user group:
- Payroll officer (2 participants minimum)
- HR manager (1 participant)
- Operations manager (1 participant — for transport scenarios)

### UAT Test Protocol

1. Give each participant 5 test scenarios (from the library above) without telling them the expected output
2. Have them run the tool independently
3. Compare their outputs to the expected outputs
4. Record where outputs differ — are differences due to data entry errors, UX confusion, or logic issues?
5. Conduct debrief to identify usability issues
6. Resolve any issues before go-live

### UAT Pass Criteria

- 95% of test scenarios produce the correct output when data is entered correctly
- All manual review flags are correctly triggered on flaggable scenarios
- No scenario produces an incorrect output without raising a flag
- All users report the tool is navigable without assistance after reading the Welcome_Instructions

---

## 6. Payroll Validation Testing

### 6.1 Method

Select 10 real historical pay periods from your payroll records where the correct pay outcome is already known (confirmed by legal review or prior payroll system). Enter these into the tool and compare the outputs.

### 6.2 Acceptable Variance

- Dollar variance: within $0.10 per hour (rounding tolerance)
- Any variance greater than $0.10 per hour must be investigated
- Any variance greater than $1.00 per hour must be escalated to Legal/ER Reviewer before go-live

### 6.3 Documentation

Record all validation tests in the test results document. This document must be retained as evidence that the tool was validated before use.

---

*This document is part of a controlled build pack. See README.md for package overview and update responsibilities.*
