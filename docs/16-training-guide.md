# Document 16 — Training Guide

**Build Pack:** Award Interpreter Tool
**Awards:** MA000002 | MA000038 | MA000039
**Version:** 1.0

**Audience:** HR staff, Payroll Officers, Operations Managers

---

## 1. Introduction

This guide explains how to use the Award Interpreter Tool. It is designed for people who need to check whether an employee's pay is correct under one of three Australian modern awards — but who may not be award experts.

The tool will guide you through a series of questions and produce a calculated pay output. It is a decision support tool, not a replacement for legal advice. Read this guide before using the tool.

---

## 2. Who Should Use This Tool

This tool is designed for:
- **Payroll Officers** — to check minimum award entitlements when processing pay
- **HR Managers** — to assess award coverage and classification for new or existing employees
- **Operations Managers** — to check compliance of rostering decisions and shift structures

This tool is **not** designed for:
- Calculating superannuation contributions (use your payroll system)
- Processing annual or personal leave balances (use your payroll system)
- Providing legal advice on employment disputes
- Calculating termination or redundancy pay
- Employees covered by an enterprise agreement (tool output is minimum floor only)

---

## 3. What the Tool Can and Cannot Do

### It CAN:
- Tell you which of the three covered awards likely applies to an employee
- Help determine the correct classification level
- Calculate minimum pay for a work period based on the hours worked and their type
- Identify which allowances should apply
- Check whether break obligations have been met
- Flag situations that need to be reviewed by a qualified person

### It CANNOT:
- Replace legal advice
- Override an enterprise agreement
- Calculate pay for employees in other awards not covered by this tool
- Tell you whether an existing employment contract is compliant
- Make decisions about disputed classifications or employment conditions

---

## 4. How to Use the Tool — Step by Step

### Step 1: Open the Tool

Open the Excel file. You will land on the **Welcome_Instructions** sheet. Read it. It contains the tool version and legal disclaimer. Check the effective date — it should be current.

### Step 2: Start on Data_Entry

Click the **Data_Entry** tab.

Work through the sections from top to bottom:

**Section 1 — Employer and Employee Details**
- Enter the employer industry. If you're in transport/logistics, select "Transport/Logistics". If primarily clerical/admin, select "Clerical-Other".
- Enter the sector. If government or not-for-profit, stop — this tool may not apply. Seek advice.
- Answer the EA question honestly. If you're unsure, select "Unknown" and a flag will appear.

**Section 2 — Employment Type**
- Select Full-time, Part-time, or Casual.
- For Part-time, enter the guaranteed hours per week and the number of days.
- For Casual, the minimum engagement check will apply automatically.
- Tick "Shift Worker?" only if the employee is rostered on rotating, afternoon, or night shifts regularly. This is not the same as someone who starts early occasionally.

**Section 3 — Classification**
- Enter the job title (for reference).
- Select the vehicle GVM class if the employee is a driver.
- Select the classification level. You must have completed a classification assessment first. If you haven't, the tool will flag it.
- **Important:** Do not just guess the level or use whatever is in the contract. Use the classification framework (doc 08) to assess the actual duties.

**Section 4 — Shift Data**
- Enter each shift in the roster table. One row per day.
- Enter the date, start time (24-hour format), finish time, and unpaid break minutes.
- The tool will automatically check whether the date is a public holiday in the employee's state.
- The tool will automatically calculate net hours worked.

**Section 5 — Allowances**
- Check each applicable allowance. Only check it if it genuinely applies.
- Vehicle allowance: check if the employee drives a company vehicle as part of their work.
- Dangerous goods: check if the employee holds the licence and regularly handles DG loads.
- First aid: check if the employee is the designated first aider in their workplace.
- Leading hand: check if the employee supervises other workers.

**Section 6 — Long Distance Data (RTLDO only)**
- This section only applies if the award identified is MA000039.
- Enter the total kilometres for the trip, the number of nights away, and any waiting time at the destination.

### Step 3: Review the Coverage Result

After entering employer and employee details, check the **Award_Selector** area on the Data_Entry sheet. It will show:
- Which award applies (if it can be determined)
- Or: a manual review flag if coverage cannot be automatically determined

If a manual review flag appears, **do not proceed to a pay calculation**. Refer to your HR Manager.

### Step 4: Confirm Classification

After selecting the classification level, look for any warning about GVM vs classification mismatch. If a warning appears, review the classification against the vehicle operated.

### Step 5: View the Output

Once all data is entered, go to the **Scenario_Output** tab.

Check:
- The award applied
- The classification applied
- The hours breakdown (ordinary, overtime, penalty hours)
- The allowances added
- The total gross pay
- Any flags or warnings at the bottom of the output

### Step 6: Log the Calculation

Click "Log This Calculation" to record the scenario in the Audit_Log. **Always log it.** The log is required for compliance recordkeeping.

---

## 5. Common Mistakes

| Mistake | Consequence | Prevention |
|---|---|---|
| Entering job title instead of assessed classification | Wrong pay rate | Always complete classification assessment first |
| Not checking the award coverage result before calculating | Wrong award applied; everything else is wrong | Always check Award_Selector before proceeding |
| Entering scheduled hours instead of hours actually worked | Incorrect overtime calculation | Use actual worked hours; reconcile with timesheets |
| Forgetting to tick Public Holiday | PH rate not applied | The tool auto-checks — but verify it flagged correctly |
| Entering gross hours instead of net (not deducting break) | Inflated ordinary hours | Use net hours field; enter break minutes separately |
| Checking "vehicle allowance" for an employee who doesn't drive | Overpayment | Only check if the role genuinely involves driving a vehicle |
| Selecting "Shift Worker" for someone with an early start occasionally | Wrong shift loading applied | Shiftwork has a specific meaning — recurring rostered shifts |
| Not logging the calculation | No audit record | Always log before closing the tool |
| Using an outdated tool version | Incorrect rates | Check the version date on the Welcome sheet |

---

## 6. How to Document Assumptions

When you use the tool, some inputs are based on judgment (e.g., classification assessment, vehicle GVM). Document your reasoning.

For each calculation, keep a brief note of:
1. What classification was assigned and why
2. What evidence was used (position description reference, classification assessment document)
3. Whether any flags were raised and how they were resolved
4. Whether any matters were referred to HR/legal and what the outcome was

Store this note with the Audit_Log record.

---

## 7. When to Escalate

Stop and escalate to your HR Manager immediately if:
- The tool shows a REVIEW or STOP flag
- The award coverage is unclear
- The employee's duties don't fit neatly into a classification
- You think the employee might be covered by an enterprise agreement
- The employee has disputed their classification or pay
- You are unsure whether a public holiday entitlement applies
- The calculation result looks wrong compared to what the employee has historically been paid

**Never override a flag without written approval from HR Manager.**

---

## 8. How to Interpret the Output

### Output Summary Card

At the top of Scenario_Output:
- **Award Applied:** The MA code of the award used
- **Classification:** The classification level used
- **Period:** The dates calculated
- **Confidence:** HIGH / MEDIUM / LOW / STOP

A HIGH confidence output with no flags can be used with confidence. MEDIUM or LOW output should be reviewed before final pay processing. A STOP flag means you cannot use the output at all — escalate.

### Hours Breakdown

Each row in the hours table shows:
- Hour type (ordinary, overtime, Saturday, etc.)
- Number of hours in that category
- The rate applied (as a multiplier)
- The dollar amount

Add the rows — they should equal the total shown.

### Minimum Pay Check

The output will confirm: "Gross pay of $XXX.XX is [above / at / below] the award minimum of $XXX.XX for this period."

If below: stop, escalate, do not process pay until resolved.

### Flags Panel

Any warnings or escalation triggers are shown in the amber/red box. Read every flag. Do not ignore them. Record how each flag was resolved.

---

## 9. Examples of Good Usage Practice

**Good example:**
> "I am setting up a new full-time driver. I have checked the coverage result (MA000038 confirmed), completed a classification assessment (Grade 4 — documented in file PD-2026-047), selected Grade 4 in the tool, entered the shift data for the week, and confirmed the vehicle allowance applies (22-tonne HR vehicle, fleet register confirms GVM 18.5t). The output shows $1,847.50 for the week. No flags raised. I have logged the calculation and saved the classification assessment."

**Poor example:**
> "I entered 'delivery driver' and picked Grade 3 because that's what his contract says. The tool gave a number so I paid it. Didn't log anything."

The first example creates a defensible, auditable record. The second creates underpayment risk and no evidence trail.

---

## 10. Getting Help

If you are unsure:
1. Read the tooltip on the relevant field
2. Check this guide
3. Refer to the classification framework (doc 08) for classification questions
4. Escalate to your HR Manager for award coverage or classification disputes
5. Escalate to the Legal/ER Advisor for disputes or unusual scenarios

**Never guess and proceed when in doubt.**

---

*This document is part of a controlled build pack. See README.md for package overview and update responsibilities.*
