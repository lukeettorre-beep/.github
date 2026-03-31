# Document 02 — Scope and Design Principles

**Build Pack:** Award Interpreter Tool
**Awards:** MA000002 | MA000038 | MA000039
**Version:** 1.0
**Status:** Draft — Requires Legal Validation

---

## 1. Scope: What the Tool Will Do

### 1.1 Award Coverage Determination
The tool will determine whether an employee is award-covered and, if so, which of the three covered awards applies. It will follow a structured decision tree based on industry, duties, and employment characteristics.

### 1.2 Classification Support
For employees within scope, the tool will assist in identifying the correct classification level by presenting classification criteria drawn from each award's classification structure, prompting the user to make evidence-based inputs.

### 1.3 Employment Type Confirmation
The tool will confirm whether the employee is full-time, part-time or casual, and apply the correct baseline entitlement rules for that employment type.

### 1.4 Ordinary Hours Calculation
The tool will determine the correct ordinary hours structure applicable to the employee, including any relevant span of hours, roster pattern or averaging arrangement.

### 1.5 Penalty Rate Identification
The tool will identify applicable penalty rates for:
- Overtime (daily and weekly triggers)
- Early morning and late night work within span of hours
- Saturday and Sunday work
- Public holiday work
- Shift work (where applicable)
- Call-back and recall (where applicable)

### 1.6 Allowance Identification
The tool will identify which allowances apply based on the duties performed, the type of vehicle (where relevant), the conditions of work, and the route characteristics (for transport awards).

### 1.7 Break Compliance
The tool will check whether the rostered or worked break pattern complies with award requirements and flag non-compliance.

### 1.8 Long Distance Logic (MA000039)
For RTLDO-covered employees, the tool will apply long-distance pay logic, including per-kilometre calculations, rest period entitlements and overnight stay conditions.

### 1.9 Pay Scenario Output
The tool will produce a pay scenario output showing:
- Base rate applied
- Employment type adjustment
- Ordinary time pay calculation
- Penalty and loading calculations
- Allowance calculations
- Total calculated remuneration for the scenario
- Audit notes and flags

### 1.10 Audit Trail
The tool will record every calculation with the inputs used, rules applied, outputs produced, tool version and date/time.

---

## 2. Scope: What the Tool Will NOT Do

The following are explicitly outside scope and must be handled by payroll systems or qualified practitioners:

| Out of Scope Item | Reason |
|---|---|
| Superannuation guarantee calculations | Governed by SGA legislation, separate system |
| Annual leave, personal leave and long service leave accruals | Require running balance tracking, not scenario logic |
| Termination pay calculations | Highly fact-specific, redundancy interaction, legal review required |
| Workers compensation and return-to-work | Jurisdiction-specific, outside award scope |
| Payroll tax | State-based, separate from award compliance |
| Enterprise agreement application | EA terms supersede award; separate analysis required |
| Industrial action or dispute resolution | Outside award interpreter function |
| Contractor status determination | Sham contracting analysis requires separate legal analysis |
| JobKeeper or wage subsidy programs | Government program logic, separate rules |
| Tax withholding (PAYG) | ATO rules, separate system |
| Award coverage where employee is clearly award-free | Senior employee/high income threshold analysis required |
| Multi-employer scenarios | Complex coverage analysis required |
| Greenfields agreements | Outside award interpreter scope |

---

## 3. Automated Decisions vs. Human Review Points

### 3.1 Automated Decisions (Built-in Logic)

The following decisions are sufficiently rule-bound that the tool can make them automatically with high confidence when sufficient input data is provided:

| Decision | Basis |
|---|---|
| Whether employee falls within an award's industry/occupation coverage based on stated inputs | Award coverage clauses |
| Whether employee is full-time, part-time or casual based on stated contract type | Award definitions |
| Daily and weekly overtime trigger points | Award ordinary hours provisions |
| Saturday/Sunday/PH penalty rate applicable based on day of work | Award penalty rate clauses |
| Whether a break has been taken within the required window | Award break provisions |
| Whether a vehicle type triggers a specific vehicle allowance | Award allowance schedule |
| Whether a meal allowance condition has been met | Award meal allowance clause |
| Whether per-km rate applies based on route type and distance | RTLDO provisions |

### 3.2 Human Review Points (Cannot Be Automated)

The following decisions require human judgment and the tool must flag them for manual review rather than attempting an automated determination:

| Decision | Why It Cannot Be Automated |
|---|---|
| Whether the employee's primary duties align with a specific award | Requires examination of actual duties performed, not just contract title |
| Whether mixed duties result in application of a single award | Award coverage depends on principal purpose of engagement |
| Correct classification level where role content spans multiple levels | Judgment required about the level at which the employee is "generally employed" |
| Whether an enterprise agreement applies and whether it passes the better-off-overall test | EA analysis is a separate and complex exercise |
| Whether an employee is award-free due to income threshold | Requires analysis of guaranteed annual earnings vs high income threshold |
| Whether a particular allowance is triggered by specific working conditions | Some allowances require on-site verification |
| Whether a long-distance trip qualifies under RTLDO vs RTD | Requires route analysis and trip records |
| Whether fatigue management arrangements affect award rest period entitlements | Interaction with HVNL requires specialist analysis |
| Classification where skills or duties are disputed | Industrial dispute; legal review required |

---

## 4. Design Principles

### 4.1 Legal Compliance First

Every rule in the tool must trace to a specific clause in the relevant award or a provision of the Fair Work Act 2009 (Cth) or its Regulations. Where a rule cannot be traced to a specific legal source, it must be flagged as an assumption or implementation choice, not treated as law.

The tool does not import common practice, industry norms or employer preference as legal rules. What the law requires is what the tool implements.

### 4.2 Explainability

Every output must be accompanied by a plain-language explanation of which rule was applied and why. A payroll officer who uses this tool must be able to explain to an employee, a union delegate or a Fair Work Inspector why that pay result was reached.

"The tool said so" is not an explanation. The tool must produce one.

### 4.3 Auditability

Every scenario run must be recorded. Inputs must be preserved alongside outputs. The tool version used must be recorded. Date and time of calculation must be recorded. This audit record must survive any update to the tool — old calculations must remain traceable to the version that produced them.

### 4.4 Maintainability

The tool is designed around a hard separation between:
- **Logic** (rules, formulas, decision trees) — changes only when the award changes
- **Rate tables** (dollar amounts, percentages) — changes annually at minimum

This means annual rate updates do not require rebuilding the tool. Rates are entered in dedicated tables. Logic references those tables. An Excel builder who follows this specification will implement this architecture from the outset.

### 4.5 Version Control

The tool carries a version number. Every change to rates, logic or structure creates a new version. The change is logged. The previous version is archived, not deleted. A user running a historical query can identify which version was in use at the time.

### 4.6 Segregation of Logic and Rates

Rate tables are never embedded in formula logic as hard-coded values. All rates (minimum wages, penalty multipliers, allowance amounts) are stored in named, protected tables. Formulas reference those tables by name. This is a non-negotiable architecture requirement.

**Wrong (do not do this):**
```excel
=IF(A1="Saturday", B1*1.5, B1)
```

**Correct:**
```excel
=IF(A1="Saturday", B1*XLOOKUP("Saturday_Multiplier", RateTable[Code], RateTable[Value]), B1)
```

### 4.7 Escalation Discipline

When the tool cannot produce a reliable output, it must say so clearly. The tool must not produce a number when it is unable to reliably determine the correct answer. A false answer is more dangerous than no answer.

Escalation flags must:
- State what the issue is in plain English
- Specify who should receive the escalation
- Prevent the output from being treated as a confirmed figure until resolved

### 4.8 No Substitution for Legal Advice

The tool supports compliance decisions. It does not make them. Any output labelled as requiring legal review must be reviewed by a qualified practitioner before being relied upon. This principle must be embedded in the tool's user interface and user training.

---

## 5. Implementation Assumptions

### 5.1 Assumptions That Can Safely Be Built In

The following assumptions are sufficiently stable that they can be encoded as default logic without individual review:

| Assumption | Basis |
|---|---|
| Ordinary hours for award-covered employees = 38 per week | Fair Work Act s.147 and award ordinary hours provisions |
| Overtime attracts minimum 1.5x for the first 2 hours and 2x thereafter (where award so provides) | Standard award overtime penalty structure |
| Public holidays attract the payment rate specified in the award for work performed on that day | Award public holiday clauses |
| Casual employees receive the casual loading as specified in the award on every casual engagement | Award casual loading provisions |
| Annual leave loading of 17.5% applies where relevant under the relevant award | Award annual leave provisions (note: verify by award) |
| The Annual Wage Review effective date for pay rates is the first full pay period on or after 1 July | FWC standard practice |

### 5.2 Assumptions That Cannot Be Built In Without Validation

| Assumption | Status |
|---|---|
| All employees described as "full-time" in the tool inputs are genuinely full-time under the award | User-entered data; requires employment contract review |
| The roster pattern entered reflects the actual hours worked | User-entered data; requires timesheet verification |
| The classification level entered reflects the duties actually performed | Requires documented classification assessment |
| The business is not covered by an enterprise agreement | Must be confirmed as a pre-condition to tool use |
| The employment arrangement is not subject to a transitional instrument | Must be confirmed as a pre-condition |
| The vehicle GVM entered is accurate | Requires fleet register confirmation |

---

## 6. Relationship to Other Systems

This tool is intended to sit upstream of payroll processing, not inside it.

```
[Award Interpreter Tool] → [Payroll System] → [Payments]
         ↑
   [HR Records / Classification Assessments]
         ↑
   [Employment Contracts / Rosters]
```

The tool produces:
- Applicable award confirmed
- Applicable classification confirmed
- Applicable rates and entitlements confirmed
- Calculated pay scenario for the period

This output then feeds into the payroll system for actual payment processing.

---

*This document is part of a controlled build pack. See README.md for package overview and update responsibilities.*
