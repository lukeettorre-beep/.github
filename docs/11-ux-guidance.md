# Document 11 — UX and Front-End Logic Guide

**Build Pack:** Award Interpreter Tool
**Awards:** MA000002 | MA000038 | MA000039
**Version:** 1.0

---

## 1. User Flow

### 1.1 Primary User Path

```
[Welcome_Instructions]
    ↓
[Data_Entry: Step 1 — Employer and Industry Details]
    ↓
[Data_Entry: Step 2 — Employee Details and Employment Type]
    ↓
[Coverage Engine runs automatically → Award_Selector updates]
    ↓  (if coverage resolved)
[Data_Entry: Step 3 — Classification]
    ↓
[Data_Entry: Step 4 — Shift/Roster Data]
    ↓
[Data_Entry: Step 5 — Allowances and Flags]
    ↓
[Data_Entry: Step 6 — Long Distance Data (if RTLDO)]
    ↓
[Review Flags: any manual review items?]
    ↓ (if none)
[Scenario_Output: calculated pay result]
    ↓
[Log to Audit_Log]
```

If a manual review flag is raised at any point, the tool displays a warning panel. The user can continue to view a provisional calculation for reference, but the output is clearly marked as **UNCONFIRMED — requires manual review before use**.

### 1.2 Question Sequencing

Questions must be sequenced so that:
1. Coverage-determining questions come first (industry, sector, EA)
2. Once coverage is resolved, only the relevant award's questions appear
3. Long-distance specific fields are hidden until the award is confirmed as MA000039
4. Classification inputs appear after employment type is confirmed
5. Shift data entry begins after classification is confirmed

Presenting all fields simultaneously overwhelms users and leads to incorrect entries in irrelevant fields. Show only what is needed at each step.

---

## 2. Simplifying Legal Language

Every field label and tooltip must be written in plain English that a non-lawyer can understand, without losing legal accuracy.

### 2.1 Translation Examples

| Legal Term | User-Facing Language |
|---|---|
| Ordinary hours | "Standard working hours (up to 38 per week)" |
| Casual loading | "Extra pay percentage for casual employees" |
| Span of hours | "The window of the day when standard rates apply" |
| Penalty rate | "Extra pay rate for working outside standard hours or on weekends/public holidays" |
| Minimum engagement | "Minimum hours paid per shift, even if sent home early" |
| Per-kilometre rate | "Pay rate based on distance driven (long distance operations)" |
| Award coverage | "Which official pay rule document applies to this employee" |
| Classification | "The official level of work the employee performs" |

### 2.2 Tooltip Design

Every data entry field must have a tooltip (cell comment or adjacent help column) that explains:
- What the field means
- Why it matters
- What to enter if you're unsure
- Whether getting it wrong has a material impact on the result

**Example tooltip — CLA006 (Vehicle GVM):**
> *"Enter the gross vehicle mass (GVM) of the vehicle this employee primarily drives. GVM is stamped on the vehicle compliance plate or available from the fleet register. This determines the employee's classification under the Road Transport award and affects their minimum pay rate. If the employee drives multiple vehicle types, enter the GVM of the vehicle they use most frequently. If unsure, contact your fleet manager."*

---

## 3. Manual Review Flags

### 3.1 When a Flag is Raised

A manual review flag appears when:
- The tool cannot resolve a decision automatically (coverage ambiguous, classification unclear)
- The inputs contain conflicting data (e.g., shift hours entered for a public holiday with no PH rate selected)
- An exception field is triggered (EXC001–EXC008)
- An RTLDO trip is identified alongside RTD trips in the same period

### 3.2 How to Display Flags

Flags must be:
- **Visible:** Appear prominently — not in a small cell but in a dedicated flag panel
- **Clear:** State exactly what the issue is in plain English
- **Actionable:** State who should be contacted and what they need to assess
- **Non-blocking (for provisional view):** The user can see a provisional calculation but cannot treat it as final

**Flag panel design:**
```
┌─────────────────────────────────────────────────────────────┐
│  ⚠ MANUAL REVIEW REQUIRED                                   │
│                                                             │
│  Issue: The employee's duties appear to involve both        │
│  clerical and transport functions.                          │
│                                                             │
│  This cannot be automatically resolved.                     │
│                                                             │
│  Action: Refer to HR Manager for award coverage analysis    │
│  before using this calculation.                             │
│                                                             │
│  Reference: Rule ACE-04 — Mixed Duties                      │
└─────────────────────────────────────────────────────────────┘
```

**Conditional formatting:** Flag panel border = amber for review flags, red for critical stops.

### 3.3 Confidence Levels

The tool should output a confidence level for each scenario:

| Level | Meaning | Display |
|---|---|---|
| HIGH | All inputs confirmed, no flags, logic path clear | Green indicator |
| MEDIUM | Some assumptions made or minor unresolved items | Amber indicator |
| LOW | Material flags present, manual review required | Amber/Red indicator |
| STOP | Tool cannot proceed — refer to qualified reviewer | Red indicator |

**Confidence level formula (illustrative):**
```excel
=IFS(
  COUNTIF(Flags_Table, "CRITICAL") > 0, "STOP",
  COUNTIF(Flags_Table, "REVIEW") > 2, "LOW",
  COUNTIF(Flags_Table, "REVIEW") > 0, "MEDIUM",
  TRUE, "HIGH"
)
```

---

## 4. Avoiding Misuse

### 4.1 Common Misuse Scenarios and Prevention

| Misuse | Prevention |
|---|---|
| User changes pay rates directly in formula cells | Lock all formula and rates cells with password |
| User ignores flags and treats provisional output as final | Mark output header with "PROVISIONAL — FLAG PENDING" in red until flags cleared |
| User enters title-based classification without duties assessment | Tool requires CLA004=Yes before classification can be confirmed |
| User copies a previous scenario and forgets to update all fields | Date validation — force entry of period start/end; highlight stale dates |
| User runs tool for employee who has an EA | ORG006 field triggers immediate warning if EA suspected |
| User enters incorrect GVM and underpays driver | Tooltip explains GVM source; cross-validation against licence class |

### 4.2 Entry Confirmation

Before generating output, display a summary of key inputs for the user to confirm:
```
Please confirm before calculating:
• Employee: Jane Smith
• Award: Road Transport and Distribution [MA000038]
• Classification: Grade 4
• Period: 17/03/2026 – 23/03/2026
• Employment Type: Full-time
• Total Hours Entered: 38.5

[CONFIRM AND CALCULATE] [EDIT INPUTS]
```

---

## 5. Output Display

### 5.1 What to Show

The Scenario_Output sheet should display:
1. **Summary card** — Employee, award, period, classification, total pay
2. **Hours breakdown table** — Each hour type (ordinary, OT, Saturday, etc.) with hours and rate
3. **Allowances table** — Each allowance triggered with amount
4. **Grand total** — Gross pay for the period
5. **Minimum pay check** — Confirm gross pay ≥ award minimum
6. **Flags panel** — Any review items
7. **Audit footer** — Tool version, calculation date, calculated by

### 5.2 Plain English Explanation

Under each calculation section, include a one-sentence plain English explanation:
- "7.6 hours on Monday 17/03/2026 were worked at the ordinary time rate of $XX.XX per hour."
- "2 hours of overtime were worked on Tuesday 18/03/2026. These are paid at 1.5 times the ordinary rate."
- "A vehicle allowance of $X.XX per day applies because the employee operates a vehicle in the 15t–25t GVM class."

---

## 6. Colour Scheme

| Element | Colour | Hex (approx) |
|---|---|---|
| Input cells (user editable) | Light yellow | #FFFACD |
| Calculated output cells | Light blue | #E3F2FD |
| Warning / review flags | Amber | #FFF3CD |
| Critical stop flags | Light red | #FFCCCC |
| Confirmed/compliant | Light green | #D4EDDA |
| Section headers | Dark blue text | #003366 |
| Admin/locked sheets tab | Red | (tab colour) |
| User sheets tab | Green | (tab colour) |
| System/logic sheets tab | Orange | (tab colour) |
| Audit/version sheets tab | Yellow | (tab colour) |

---

## 7. Warning and Error Messaging

### Standard Warning Messages

| Code | Trigger | Message |
|---|---|---|
| W001 | EA flag raised | "⚠ An enterprise agreement may apply. Award calculations are minimum floor only." |
| W002 | Classification not confirmed | "⚠ Classification assessment not marked as completed. Output is based on entered level only." |
| W003 | Shift end before start | "⚠ Shift end time is before start time. Check entry." |
| W004 | Hours >24 in a day | "⚠ Hours entered exceed 24. Check entry." |
| W005 | PH detected, no rate applied | "⚠ Public holiday detected for this date. Confirm correct rate is applied." |
| W006 | Rates not current | "⚠ Rates table effective date may be outdated. Contact Admin to update." |
| W007 | GVM vs classification mismatch | "⚠ Vehicle GVM entered appears inconsistent with selected classification. Review." |
| W008 | RTLDO + HVNL warning | "⚠ HVNL fatigue compliance must be separately verified for long-distance drivers." |
| W009 | Mixed duties detected | "⚠ Mixed clerical and transport duties detected. Manual review required for award coverage." |
| W010 | Casual 12-month mark | "⚠ Casual employee with 12+ months service — consider casual conversion assessment." |

### Error Handling

| Code | Trigger | Message |
|---|---|---|
| E001 | Award not resolved | "STOP: Award coverage cannot be automatically determined. Refer to HR." |
| E002 | Rates table lookup fails | "ERROR: Rate not found. Check Rates_Table configuration." |
| E003 | Classification code not found | "ERROR: Classification code not in Classification_Mapper. Contact Admin." |

---

## 8. Help Text Design Principles

1. **Lead with purpose:** Start with "This field determines..." not "Enter the..."
2. **State the consequence:** "Getting this wrong affects the pay rate applied"
3. **Give the source:** "Find this on the vehicle compliance plate or fleet register"
4. **Be brief:** 2–4 sentences maximum per tooltip
5. **Use consistent language:** Use the same term throughout the tool (don't alternate between "GVM" and "vehicle weight")
6. **Flag high-risk fields:** Use a red asterisk * next to fields where errors have high pay impact

---

*This document is part of a controlled build pack. See README.md for package overview and update responsibilities.*
