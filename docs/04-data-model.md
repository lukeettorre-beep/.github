# Document 04 — Data Model

**Build Pack:** Award Interpreter Tool
**Awards:** MA000002 | MA000038 | MA000039
**Version:** 1.0
**Status:** Draft — Requires Legal Validation

---

## 1. Overview

This document specifies every input field required by the Award Interpreter Tool. Fields are organised by category. Each field has a unique ID that is referenced across all other documents.

Fields are tagged for which purpose they serve:
- **COV** = Coverage determination
- **CLA** = Classification
- **PAY** = Pay calculation
- **AUD** = Audit trail
- **ESC** = Escalation trigger

---

## 2. Category 1: Employee Details

| Field ID | Field Name | Purpose | Data Type | M/O | Allowed Values | Validation | Sample Entry |
|---|---|---|---|---|---|---|---|
| EMP001 | Employee ID | Unique identifier | Text/Numeric | M | Free text | Must not be blank | E00247 |
| EMP002 | Employee Full Name | Identification | Text | M | Free text | Must not be blank | Jane Smith |
| EMP003 | Employment Start Date | Tenure, entitlements | Date | M | DD/MM/YYYY | Valid date, not future | 15/03/2022 |
| EMP004 | Date of Birth | Junior rates, entitlements | Date | O | DD/MM/YYYY | Valid date | 12/06/1998 |
| EMP005 | Age at Calculation Date | Junior rate trigger | Numeric (integer) | Calculated | 15–70 | Auto-calc from EMP004 | 26 |
| EMP006 | State/Territory of Employment | PH dates, state conditions | List | M | NSW/VIC/QLD/SA/WA/TAS/NT/ACT | Select list | NSW |
| EMP007 | Employment Location (suburb/postcode) | Geographic allowances | Text | O | Free text | — | Parramatta 2150 |

**Dependent fields:** EMP005 depends on EMP004. EMP006 drives PH_TABLE lookup.

---

## 3. Category 2: Employer / Business Profile

| Field ID | Field Name | Purpose | Data Type | M/O | Allowed Values | Validation | Sample Entry |
|---|---|---|---|---|---|---|---|
| ORG001 | Employer Name | Identification | Text | M | Free text | Must not be blank | ABC Transport Pty Ltd |
| ORG002 | ABN | Identification | Numeric | O | 11-digit ABN | Validate format | 51 123 456 789 |
| ORG003 | Primary Industry | Coverage | List | M | Transport/Logistics/Clerical-Other/Mixed/Other | Select list | Transport/Logistics |
| ORG004 | Industry Description | Coverage | Text | O | Free text | — | Road freight and distribution |
| ORG005 | Sector | Coverage | List | M | Private/Government/Not-for-profit | Select list | Private |
| ORG006 | EA Applicable? | Coverage | Boolean | M | Yes/No/Unknown | — | No |
| ORG007 | EA Reference (if applicable) | Coverage | Text | O | Free text | Required if ORG006=Yes | — |
| ORG008 | State Registered Employer? | Coverage | Boolean | M | Yes/No | — | No |

**COV fields:** ORG003, ORG005, ORG006, ORG008
**AUD fields:** All

---

## 4. Category 3: Award Coverage Indicators

| Field ID | Field Name | Purpose | Data Type | M/O | Allowed Values | Validation | Sample Entry |
|---|---|---|---|---|---|---|---|
| COV001 | Award Coverage Confirmed? | Coverage | List | M | Yes-MA000002/Yes-MA000038/Yes-MA000039/Unresolved | Set by coverage engine | Yes-MA000038 |
| COV002 | Coverage Basis | Coverage/AUD | Text | M | Free text (auto-populated from decision tree) | — | RTD industry + driver duties |
| COV003 | Manual Coverage Override | Coverage/ESC | Boolean | M | Yes/No | If Yes, require COV004 | No |
| COV004 | Manual Coverage Justification | ESC | Text | O | Free text | Required if COV003=Yes | — |
| COV005 | Coverage Reviewed By | AUD | Text | O | Free text | — | HR Manager |
| COV006 | Coverage Review Date | AUD | Date | O | DD/MM/YYYY | Valid date | 01/02/2026 |

---

## 5. Category 4: Employment Type

| Field ID | Field Name | Purpose | Data Type | M/O | Allowed Values | Validation | Sample Entry |
|---|---|---|---|---|---|---|---|
| ETP001 | Employment Type | PAY | List | M | Full-time/Part-time/Casual | Select list | Full-time |
| ETP002 | Contracted Hours Per Week (FT/PT) | PAY | Numeric (decimal) | M if FT or PT | 0–76 | Must not exceed award max ordinary hours | 38 |
| ETP003 | Contracted Days Per Week | PAY | Numeric (integer) | O | 1–6 | — | 5 |
| ETP004 | Guaranteed Hours (PT only) | PAY | Numeric (decimal) | M if PT | 0–38 | Must not exceed ETP002 | 20 |
| ETP005 | Hours Variation Agreed (PT)? | PAY | Boolean | O | Yes/No | — | No |
| ETP006 | Regular Roster Pattern? | PAY | Boolean | M | Yes/No | — | Yes |
| ETP007 | Shift Worker? | PAY | Boolean | M | Yes/No | — | No |

---

## 6. Category 5: Classification Inputs

| Field ID | Field Name | Purpose | Data Type | M/O | Allowed Values | Validation | Sample Entry |
|---|---|---|---|---|---|---|---|
| CLA001 | Job Title | CLA | Text | M | Free text | Must not be blank | Delivery Driver |
| CLA002 | Award | CLA | List | M | MA000002/MA000038/MA000039 | Auto from COV001 | MA000038 |
| CLA003 | Classification Level (as assessed) | PAY/CLA | List | M | Award-specific — see classification tables | Validated against CLA002 | RTD Grade 3 |
| CLA004 | Classification Assessment Completed? | CLA/AUD | Boolean | M | Yes/No | — | Yes |
| CLA005 | Classification Evidence Ref | CLA/AUD | Text | O | Free text (document reference) | — | PD-247-v2 |
| CLA006 | Vehicle GVM (if driver role) | CLA/PAY | List | M if driver | Up to 4.5t/4.5t–8t/8t–15t/15t–25t/Over 25t | Required for RTD/RTLDO | 15t–25t |
| CLA007 | Dangerous Goods Licensed? | PAY | Boolean | O | Yes/No | — | Yes |
| CLA008 | First Aid Qualified? | PAY | Boolean | O | Yes/No | — | No |
| CLA009 | Leading Hand / Supervisor? | PAY | Boolean | O | Yes/No | — | No |
| CLA010 | Number of Employees Supervised | PAY | Numeric | O | 0–999 | Required if CLA009=Yes | 0 |

---

## 7. Category 6: Roster Pattern

| Field ID | Field Name | Purpose | Data Type | M/O | Allowed Values | Validation | Sample Entry |
|---|---|---|---|---|---|---|---|
| RST001 | Roster Start Date (week) | PAY | Date | M | DD/MM/YYYY | Valid date | 17/03/2026 |
| RST002 | Roster End Date (week) | PAY | Date | M | DD/MM/YYYY | Valid date, after RST001 | 23/03/2026 |
| RST003 | Roster Days Worked | PAY | Multi-select | M | Mon/Tue/Wed/Thu/Fri/Sat/Sun | At least one required | Mon,Tue,Wed,Thu,Fri |
| RST004 | Regular Start Time | PAY | Time | M | HH:MM (24hr) | Valid time | 07:00 |
| RST005 | Regular Finish Time | PAY | Time | M | HH:MM (24hr) | Valid time, after RST004 | 15:30 |
| RST006 | Averaging Arrangement? | PAY | Boolean | O | Yes/No | — | No |
| RST007 | Averaging Period (weeks) | PAY | Numeric | O | 1–52 | Required if RST006=Yes | — |
| RST008 | RDO Pattern | PAY | Text | O | Free text | — | — |

---

## 8. Category 7: Shift Data

| Field ID | Field Name | Purpose | Data Type | M/O | Allowed Values | Validation | Sample Entry |
|---|---|---|---|---|---|---|---|
| SHF001 | Shift Day | PAY | List | M | Mon/Tue/Wed/Thu/Fri/Sat/Sun/PH | Select list | Monday |
| SHF002 | Shift Date | PAY/AUD | Date | M | DD/MM/YYYY | Valid date, within roster period | 17/03/2026 |
| SHF003 | Shift Start Time | PAY | Time | M | HH:MM (24hr) | Valid time | 06:00 |
| SHF004 | Shift End Time | PAY | Time | M | HH:MM (24hr) | Valid time | 14:00 |
| SHF005 | Unpaid Break Duration (minutes) | PAY | Numeric | M | 0–120 | Non-negative integer | 30 |
| SHF006 | Paid Rest Break Duration (minutes) | PAY | Numeric | M | 0–60 | Non-negative integer | 10 |
| SHF007 | Total Hours Worked (gross) | Calculated | Numeric (decimal) | Calculated | — | Auto-calc: (SHF004-SHF003) | 8.00 |
| SHF008 | Total Hours Worked (net) | Calculated | Numeric (decimal) | Calculated | — | Auto-calc: SHF007 minus SHF005/60 | 7.50 |
| SHF009 | Shift Type | PAY | List | M | Day/Afternoon/Night/Rotating | Select list | Day |
| SHF010 | Public Holiday? | PAY | Boolean | M | Yes/No | Cross-check against PH_TABLE | No |

**Multiple shift rows can be entered per period (one row per worked day).**

---

## 9. Category 8: Date / Day / Public Holiday Data

| Field ID | Field Name | Purpose | Data Type | M/O | Allowed Values | Validation | Sample Entry |
|---|---|---|---|---|---|---|---|
| PHD001 | Calculation Period Start | PAY | Date | M | DD/MM/YYYY | Valid date | 17/03/2026 |
| PHD002 | Calculation Period End | PAY | Date | M | DD/MM/YYYY | Valid date | 23/03/2026 |
| PHD003 | Public Holidays in Period | PAY | Auto-list | Calculated | From PH_TABLE by state | Auto-lookup from EMP006 + date range | [None] |
| PHD004 | Public Holiday Confirmation Override | PAY/ESC | Boolean | O | Yes/No | — | No |
| PHD005 | Substitute Day Applicable? | PAY | Boolean | O | Yes/No | — | No |

---

## 10. Category 9: Travel and Route Data (RTD / RTLDO)

| Field ID | Field Name | Purpose | Data Type | M/O | Allowed Values | Validation | Sample Entry |
|---|---|---|---|---|---|---|---|
| TRP001 | Trip Date | PAY | Date | M if transport | DD/MM/YYYY | Valid date | 18/03/2026 |
| TRP002 | Departure Location | PAY/CLA | Text | M if transport | Free text | Must not be blank | Sydney Depot |
| TRP003 | Destination Location | PAY/CLA | Text | M if transport | Free text | Must not be blank | Melbourne DC |
| TRP004 | Total Distance (km) | PAY | Numeric | M if transport | 0–9999 | Non-negative | 872 |
| TRP005 | Route Type | COV | List | M if transport | Local/Regional/Interstate/Long-Haul | Select list | Interstate |
| TRP006 | Overnight Stay Required? | COV/PAY | Boolean | M if transport | Yes/No | — | Yes |
| TRP007 | Nights Away from Base | PAY | Numeric (integer) | O | 0–30 | Non-negative | 1 |
| TRP008 | Waiting Time (hours) | PAY | Numeric (decimal) | O | 0–48 | Non-negative | 2.5 |
| TRP009 | Vehicle Registration | AUD | Text | O | Free text | — | ABC123 |
| TRP010 | Vehicle GVM Class | CLA/PAY | List | M if driver | Up to 4.5t/4.5t–8t/8t–15t/15t–25t/Over 25t | Match CLA006 | 15t–25t |

---

## 11. Category 10: Loading / Unloading Data

| Field ID | Field Name | Purpose | Data Type | M/O | Allowed Values | Validation | Sample Entry |
|---|---|---|---|---|---|---|---|
| LU001 | Loading/Unloading Performed? | PAY/CLA | Boolean | M if RTD | Yes/No | — | Yes |
| LU002 | Loading Time (hours) | PAY | Numeric (decimal) | O | 0–12 | Non-negative | 1.5 |
| LU003 | Unloading Time (hours) | PAY | Numeric (decimal) | O | 0–12 | Non-negative | 1.0 |
| LU004 | Loading Type | PAY | List | O | Manual/Forklift/Assisted/Tail-lift | Select list | Manual |
| LU005 | Dangerous Goods Loaded? | PAY | Boolean | O | Yes/No | — | No |

---

## 12. Category 11: Long Distance Trip Data (RTLDO)

| Field ID | Field Name | Purpose | Data Type | M/O | Allowed Values | Validation | Sample Entry |
|---|---|---|---|---|---|---|---|
| LDT001 | RTLDO Trip? | COV/PAY | Boolean | M if RTLDO | Yes/No | — | Yes |
| LDT002 | Per-Km Rate Category | PAY | List | M if LDT001=Yes | From RTLDO rates table | Validate against CLA003 | Class 2 |
| LDT003 | Total Km This Trip | PAY | Numeric | M if LDT001=Yes | 0–9999 | Non-negative | 872 |
| LDT004 | Waiting Time at Destination (hours) | PAY | Numeric (decimal) | O | 0–48 | — | 3.0 |
| LDT005 | Meal Allowance Triggered? | PAY | Boolean | Calculated | Yes/No | Auto-based on hours away | Yes |
| LDT006 | Accommodation Allowance Triggered? | PAY | Boolean | Calculated | Yes/No | Auto-based on overnight | Yes |
| LDT007 | Rest Period Taken? | PAY/ESC | Boolean | M if RTLDO | Yes/No | — | Yes |
| LDT008 | Rest Period Duration (hours) | PAY | Numeric (decimal) | O | 0–12 | Non-negative | 8.0 |

> **VALIDATION FLAG:** RTLDO per-kilometre rate categories and the exact conditions triggering waiting time payments must be verified against current MA000039 text and FWO pay guide.

---

## 13. Category 12: Break Data

| Field ID | Field Name | Purpose | Data Type | M/O | Allowed Values | Validation | Sample Entry |
|---|---|---|---|---|---|---|---|
| BRK001 | Hours Worked Before First Break | PAY/ESC | Numeric (decimal) | Calculated | — | Auto-calc from shift data | 5.0 |
| BRK002 | First Unpaid Break Start Time | PAY | Time | O | HH:MM | Valid time | 12:00 |
| BRK003 | First Unpaid Break Duration (min) | PAY | Numeric | M | 0–60 | Non-negative integer | 30 |
| BRK004 | Rest Break Taken? | PAY/ESC | Boolean | M | Yes/No | — | Yes |
| BRK005 | Rest Break Duration (min) | PAY | Numeric | O | 0–30 | Non-negative | 10 |
| BRK006 | Break Compliance Flag | ESC | Calculated | Calculated | Compliant/Non-compliant/Review | Auto-set | Compliant |

---

## 14. Category 13: Overtime Data

| Field ID | Field Name | Purpose | Data Type | M/O | Allowed Values | Validation | Sample Entry |
|---|---|---|---|---|---|---|---|
| OT001 | Overtime Hours (daily) | PAY | Numeric (decimal) | Calculated | — | Auto-calc from shift vs ordinary hours | 2.0 |
| OT002 | Overtime Hours (weekly total) | PAY | Numeric (decimal) | Calculated | — | Auto-calc from weekly total | 2.0 |
| OT003 | Overtime Basis | PAY | List | Calculated | Daily trigger/Weekly trigger | Auto-set | Daily trigger |
| OT004 | Time Off in Lieu Arrangement? | PAY | Boolean | O | Yes/No | — | No |
| OT005 | TOIL Hours Accrued | PAY | Numeric (decimal) | O | 0–99 | Non-negative | — |

---

## 15. Category 14: Allowance Data

| Field ID | Field Name | Purpose | Data Type | M/O | Allowed Values | Validation | Sample Entry |
|---|---|---|---|---|---|---|---|
| ALW001 | Meal Allowance Applicable? | PAY | Boolean | Calculated | Yes/No | Auto-based on hours and breaks | No |
| ALW002 | Vehicle Allowance Applicable? | PAY | Boolean | M if driver | Yes/No | — | Yes |
| ALW003 | Dangerous Goods Allowance? | PAY | Boolean | O | Yes/No | Requires LU005=Yes or CLA007=Yes | Yes |
| ALW004 | First Aid Allowance? | PAY | Boolean | O | Yes/No | Requires CLA008=Yes | No |
| ALW005 | Leading Hand Allowance? | PAY | Boolean | O | Yes/No | Requires CLA009=Yes | No |
| ALW006 | Tool Allowance? | PAY | Boolean | O | Yes/No | — | No |
| ALW007 | Other Allowance Description | PAY | Text | O | Free text | — | — |
| ALW008 | Other Allowance Amount | PAY | Numeric (decimal) | O | 0–9999 | Non-negative | — |

---

## 16. Category 15: Higher Duties / Special Duties

| Field ID | Field Name | Purpose | Data Type | M/O | Allowed Values | Validation | Sample Entry |
|---|---|---|---|---|---|---|---|
| HD001 | Higher Duties Performed? | PAY | Boolean | O | Yes/No | — | No |
| HD002 | Higher Duties Classification | PAY | List | O | Award classification levels | Required if HD001=Yes | — |
| HD003 | Higher Duties Duration | PAY | Numeric (decimal) | O | Hours 0–99 | Non-negative | — |
| HD004 | Higher Duties Trigger (hours) | PAY | Numeric | Reference | From award | Cross-check against award provision | — |

---

## 17. Category 16: Exception Flags

| Field ID | Field Name | Purpose | Data Type | M/O | Allowed Values |
|---|---|---|---|---|---|
| EXC001 | EA Possible? | ESC | Boolean | M | Yes/No/Unknown |
| EXC002 | Seniority / Long Service Consideration? | ESC | Boolean | O | Yes/No |
| EXC003 | Junior Employee (under 21)? | PAY | Boolean | Calculated | Yes/No |
| EXC004 | Trainee/Apprentice? | ESC | Boolean | M | Yes/No |
| EXC005 | Disputed Classification? | ESC | Boolean | M | Yes/No |
| EXC006 | Dispute or Complaint Active? | ESC | Boolean | M | Yes/No |
| EXC007 | Prior Underpayment Risk Identified? | ESC | Boolean | M | Yes/No |
| EXC008 | Non-Standard Roster? | PAY/ESC | Boolean | M | Yes/No |

Any EXC field = Yes triggers an escalation flag on the output.

---

## 18. Field Summary — Usage Tags

| Category | Fields | COV | CLA | PAY | AUD | ESC |
|---|---|---|---|---|---|---|
| Employee Details | EMP001–007 | - | - | ✓ | ✓ | - |
| Employer Profile | ORG001–008 | ✓ | - | - | ✓ | ✓ |
| Coverage Indicators | COV001–006 | ✓ | - | - | ✓ | ✓ |
| Employment Type | ETP001–007 | - | - | ✓ | ✓ | - |
| Classification | CLA001–010 | - | ✓ | ✓ | ✓ | ✓ |
| Roster Pattern | RST001–008 | - | - | ✓ | ✓ | - |
| Shift Data | SHF001–010 | - | - | ✓ | ✓ | - |
| Date/Day/PH | PHD001–005 | - | - | ✓ | ✓ | - |
| Travel/Route | TRP001–010 | ✓ | ✓ | ✓ | ✓ | - |
| Loading/Unloading | LU001–005 | - | ✓ | ✓ | ✓ | - |
| Long Distance | LDT001–008 | ✓ | - | ✓ | ✓ | - |
| Break Data | BRK001–006 | - | - | ✓ | ✓ | ✓ |
| Overtime | OT001–005 | - | - | ✓ | ✓ | - |
| Allowances | ALW001–008 | - | - | ✓ | ✓ | - |
| Higher Duties | HD001–004 | - | ✓ | ✓ | ✓ | - |
| Exception Flags | EXC001–008 | ✓ | ✓ | - | ✓ | ✓ |

---

*This document is part of a controlled build pack. See README.md for package overview and update responsibilities.*
