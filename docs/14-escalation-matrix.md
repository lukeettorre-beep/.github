# Document 14 — Edge Cases and Escalation Matrix

**Build Pack:** Award Interpreter Tool
**Awards:** MA000002 | MA000038 | MA000039
**Version:** 1.0

---

## 1. Overview

This document catalogues known edge cases, ambiguous scenarios and situations that should trigger manual review or legal escalation. For each case, it specifies: why it matters, how the tool should detect it, what message is displayed, whether the calculation can continue (provisionally), and who should receive the escalation.

The tool must implement detection logic for each case below. Where a detection rule is included, it must be implemented in the Coverage_Engine, Rules sheets, or Data_Entry validation.

---

## 2. Escalation Matrix

### ESC-01: Mixed Duties (Clerical + Transport)

**Why It Matters:** Award coverage depends on the principal purpose of engagement. A clerical employee in a transport company covered by MA000002 receives different pay than a transport employee covered by MA000038. Getting this wrong means applying the wrong award entirely.

**Detection Rule:**
```
IF DUTIES_TRANSPORT_PCT >= 30% AND DUTIES_CLERICAL_PCT >= 30%
THEN flag ESC-01
```

**System Message:**
> "The employee's duties include a significant mix of clerical and transport work. Award coverage cannot be automatically determined. Refer to HR Manager for a formal duties assessment before proceeding."

**Calculation Continue?** Provisional only — output must be labelled UNCONFIRMED
**Referred To:** HR Manager → Legal/ER Advisor if not resolved
**Precedents:** This is a documented area of complexity in Australian industrial law. Refer to legal advice.

---

### ESC-02: Enterprise Agreement Possibility

**Why It Matters:** If an EA applies to the employee, the tool calculates minimum floor entitlements only. The actual payable amount may be higher under the EA. Using the tool output as the pay figure may underpay the employee if the EA provides better conditions.

**Detection Rule:**
```
IF ORG006 = "Yes" OR ORG006 = "Unknown"
THEN flag ESC-02
```

**System Message:**
> "An enterprise agreement may apply to this employee. This tool calculates award minimum entitlements only. These are the legal floor — not necessarily the actual pay obligation. Confirm whether an EA applies and compare the EA rate to the tool output. The employee is entitled to whichever is higher."

**Calculation Continue?** Yes — but output labelled "MINIMUM AWARD ENTITLEMENT ONLY"
**Referred To:** HR Manager

---

### ESC-03: Unclear Long-Distance Status

**Why It Matters:** The boundary between RTD (MA000038) and RTLDO (MA000039) determines which pay structure applies. If misclassified, the entire pay model may be wrong — particularly the per-kilometre structure.

**Detection Rule:**
```
IF TRP005 = "Interstate" AND TRP006 = "No" (no overnight)
THEN flag ESC-03 (trip is interstate but no overnight — may or may not be RTLDO)

IF employee performs BOTH local and long-distance trips in same pay period
THEN flag ESC-03
```

**System Message:**
> "This employee's trip pattern is near the boundary between Road Transport and Distribution (MA000038) and Road Transport Long Distance Operations (MA000039). The applicable award cannot be automatically determined. Review the award coverage analysis with your HR/legal advisor before calculating pay."

**Calculation Continue?** No — stop until resolved
**Referred To:** HR Manager → Legal/ER Advisor

---

### ESC-04: Classification Level Disputed

**Why It Matters:** If the employee's classification is below the level their duties require, they are being underpaid. Underpayment, if systematic, creates significant back-pay liability.

**Detection Rule:**
```
IF CLA004 = "No" (no assessment completed)
OR EXC005 = "Yes" (disputed)
THEN flag ESC-04
```

**System Message:**
> "The classification assessment for this employee has not been completed or is disputed. The tool is using the entered classification level, which may be incorrect. Do not use this output for payroll until the classification has been formally assessed and documented."

**Calculation Continue?** Provisional only
**Referred To:** HR Manager → Legal/ER Advisor if dispute

---

### ESC-05: Unusual Roster Patterns

**Why It Matters:** Non-standard rosters (irregular hours, compressed weeks, averaging arrangements) may produce different overtime triggers than standard weekly calculations.

**Detection Rule:**
```
IF RST006 = "Yes" (averaging arrangement)
OR EXC008 = "Yes" (non-standard roster)
THEN flag ESC-05
```

**System Message:**
> "This employee is on a non-standard roster or averaging arrangement. Ordinary hours and overtime must be calculated across the averaging period, not just the current week. Confirm the averaging arrangement is correctly documented and applies under the award."

**Calculation Continue?** Provisional — tool calculates on standard weekly basis; flag that averaging may differ
**Referred To:** Payroll Manager → HR Manager

---

### ESC-06: Trainee or Apprentice

**Why It Matters:** Apprentices and trainees have different rate structures under award apprenticeship/traineeship provisions. The standard classification rates do not apply.

**Detection Rule:**
```
IF EXC004 = "Yes"
THEN flag ESC-06
```

**System Message:**
> "This employee is identified as a trainee or apprentice. Standard classification rates do not apply. Training contract rates must be separately determined from the applicable training wage provisions or national training wage schedule. This tool does not calculate trainee/apprentice pay."

**Calculation Continue?** No — stop
**Referred To:** HR Manager; confirm applicable training wage instrument

---

### ESC-07: Employee Active Dispute or Complaint

**Why It Matters:** Any pay calculation during an active dispute must be treated with extra care. Errors during a dispute period attract heightened scrutiny.

**Detection Rule:**
```
IF EXC006 = "Yes"
THEN flag ESC-07
```

**System Message:**
> "An active dispute or complaint is flagged for this employee. Do not use this tool output as the final determination without first consulting your HR Manager and legal advisor."

**Calculation Continue?** Provisional — flag prominently
**Referred To:** HR Manager + Legal/ER Advisor immediately

---

### ESC-08: Prior Underpayment Risk

**Why It Matters:** If a prior underpayment is suspected, the current period calculation may also be incorrect. A review of prior periods should be conducted.

**Detection Rule:**
```
IF EXC007 = "Yes"
THEN flag ESC-08
```

**System Message:**
> "Prior underpayment risk has been flagged for this employee. Review prior pay periods and consider whether a broader payroll audit is required before finalising current pay."

**Calculation Continue?** Yes with flag
**Referred To:** Payroll Manager + Legal/ER Advisor

---

### ESC-09: Conflicting Inputs

**Why It Matters:** Conflicting input data (e.g., full-time hours entered but guaranteed hours = 0; RTLDO trip but no km entered; vehicle allowance claimed but GVM = N/A) produce unreliable outputs.

**Detection Rule:**
```
IF (ETP001="Part-time" AND ETP004=0)
OR (LDT001="Yes" AND LDT003=0)
OR (ALW002="Yes" AND CLA006="N/A")
THEN flag ESC-09 (specific conflict message for each case)
```

**System Message:**
> "Conflicting inputs detected: [specific description]. Review and correct the data before calculating."

**Calculation Continue?** No — stop until conflict resolved
**Referred To:** User to fix inputs; Payroll Manager if unclear

---

### ESC-10: Public Holiday Anomalies

**Why It Matters:** Public holiday entitlements are per-employee based on their ordinary working pattern. An employee who doesn't normally work on Mondays is not entitled to a substitute day for Easter Monday. Errors are common.

**Detection Rule:**
```
IF SHF010 = "YES" (PH detected)
AND the employee is NOT rostered to work that day in their normal pattern
THEN flag ESC-10 (PH entitlement assessment needed)
```

**System Message:**
> "A public holiday falls during this period. Confirm whether the employee would normally work on this day. Entitlements differ depending on whether the employee would normally have worked."

**Calculation Continue?** Yes — but user must confirm PH entitlement before output treated as final
**Referred To:** Payroll Manager to assess PH entitlement

---

### ESC-11: Possible Award-Free Employee (High Income)

**Why It Matters:** Employees earning above the high income threshold with a guarantee of annual earnings in place may be award-free. Applying award minimum rates to an award-free employee is not incorrect (they still set the floor for a portion of earnings), but using the tool as the primary pay determinant for such an employee is likely misleading.

**Detection Rule:**
```
IF annual_salary_estimate > HIGH_INCOME_THRESHOLD (from Admin_Config)
THEN flag ESC-11
```

**System Message:**
> "The annualised salary for this employee appears to approach or exceed the high income threshold. Confirm whether a guarantee of annual earnings is in place. If so, the award may not apply as the operative pay instrument. Seek legal advice."

**Calculation Continue?** Yes — but output is minimum floor only
**Referred To:** HR Manager + Legal/ER Advisor

---

### ESC-12: Labour Hire Placement

**Why It Matters:** A labour hire worker placed with a transport or clerical employer may be covered by the host's award or the labour hire company's award, depending on the labour hire licensing framework and the specifics of the engagement.

**Detection Rule:** Manual flag option — user checks "labour hire placement?" checkbox

**System Message:**
> "Labour hire arrangements may affect award coverage. Confirm which employer's award applies before proceeding."

**Calculation Continue?** Provisional
**Referred To:** HR Manager + Legal/ER Advisor

---

### ESC-13: Business Transfer / Transmission of Business

**Why It Matters:** The Fair Work Act contains provisions about the transfer of instruments when a business is transferred. Employees who transferred from a previous employer may retain their previous award or EA for a period.

**Detection Rule:** User flags business transfer in exceptional fields

**System Message:**
> "A business transfer may affect which award or agreement applies to this employee. Confirm instrument coverage has been assessed following the business transfer."

**Calculation Continue?** No — stop; legal advice required
**Referred To:** Legal/ER Advisor

---

### ESC-14: Vehicle GVM vs Classification Mismatch

**Why It Matters:** Under the RTD Award, driving a higher-class vehicle than the classification reflects means the employee is likely underpaid.

**Detection Rule:**
```
IF CLA006 GVM classification is higher than what CLA003 covers
THEN flag ESC-14 — possible underpayment
```

**System Message:**
> "The vehicle GVM entered appears higher than the vehicle class covered by the selected classification. The employee may be entitled to a higher classification. Review classification against GVM and duties performed."

**Calculation Continue?** No — pause until classification resolved
**Referred To:** HR Manager

---

### ESC-15: HVNL Fatigue Compliance (RTLDO)

**Why It Matters:** Heavy vehicle operators are legally required to comply with HVNL fatigue management. Non-compliance can result in criminal penalties. The award's rest requirements and HVNL requirements may differ — both must be met.

**Detection Rule:**
```
IF ActiveAward = "MA000039"
THEN always display HVNL warning (Rule RTLDO-HVNL-01)
```

**System Message:** (as defined in Rule RTLDO-HVNL-01)

**Calculation Continue?** Yes — but HVNL warning always displayed
**Referred To:** Safety/compliance team for HVNL matters

---

## 3. Escalation Recipients Summary

| Scenario | First Recipient | Second Recipient |
|---|---|---|
| Award coverage unclear | HR Manager | Legal/ER Advisor |
| EA may apply | HR Manager | — |
| Classification disputed | HR Manager | Legal/ER Advisor |
| Active dispute | HR Manager + Legal/ER Advisor | External lawyer if needed |
| Underpayment risk | Payroll Manager | Legal/ER Advisor |
| Trainee/apprentice | HR Manager | — |
| RTLDO/RTD boundary | HR Manager | Legal/ER Advisor |
| Business transfer | Legal/ER Advisor | External lawyer |
| HVNL compliance | Safety/Compliance Team | — |

---

*This document is part of a controlled build pack. See README.md for package overview and update responsibilities.*
