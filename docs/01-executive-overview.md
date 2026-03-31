# Document 01 — Executive Overview

**Build Pack:** Award Interpreter Tool
**Awards:** MA000002 | MA000038 | MA000039
**Version:** 1.0
**Status:** Draft — Requires Legal Validation

---

## 1. What This Tool Is

The Award Interpreter Tool is a structured Excel-based decision support system designed to help employers correctly apply three Australian modern awards to their workforce.

It does not replace payroll software. It provides the rules engine, logic pathways, and data inputs that underpin correct pay calculations — outputs that feed into payroll systems or inform manual pay decisions.

The tool operates at the intersection of three disciplines:
- **Legal interpretation** — what the award actually requires
- **Payroll calculation** — how entitlements translate to dollar amounts
- **Operational governance** — how decisions are made, recorded and audited

---

## 2. What Problem This Tool Solves

### 2.1 The Scale of Award Non-Compliance in Australia

Wage theft and underpayment remain a systemic risk in Australian workplaces. The Fair Work Ombudsman consistently identifies underpayment as the most common form of non-compliance, with the transport and clerical sectors appearing regularly in enforcement actions.

Common causes of underpayment include:
- Applying the wrong award to an employee
- Classifying employees below their correct level
- Failing to apply penalty rates for overtime, weekends or public holidays
- Missing applicable allowances
- Incorrect or absent casual loading
- Failing to track and pay for break non-compliance
- Using incorrect or outdated pay rates

The consequences of non-compliance include:
- Back-pay liability, potentially over multiple years
- Civil penalties under the Fair Work Act (up to $16,500 per contravention for individuals, $82,500 per contravention for corporations as at current law — confirm current penalty units)
- Director liability in some circumstances
- Reputational damage and media exposure
- Fair Work Ombudsman investigation and enforceable undertakings

### 2.2 The Problem of Award Complexity

Australian modern awards are not simple documents. Each award contains:
- Multiple classification levels with detailed work level descriptors
- Ordinary hours rules, span of hours, and shift definitions
- Penalty rate matrices that vary by day, time and employment type
- Specific allowance schedules, some indexed annually
- Interaction rules where multiple provisions could apply simultaneously
- Override hierarchies where higher entitlements prevail

No single staff member can reliably interpret these awards from memory for every pay scenario. A structured tool removes reliance on individual knowledge and creates a consistent, auditable interpretation pathway.

---

## 3. Why These Three Awards Create Specific Complexity

### 3.1 Clerks—Private Sector Award 2020 [MA000002]

The Clerks Award covers a significant proportion of the private-sector workforce across industries including transport, logistics, retail, professional services, and media.

Key complexity sources:
- **Coverage overlap**: Many roles in transport businesses perform clerical functions. The question of whether a transport award or the Clerks Award applies depends on the primary nature of duties, not title.
- **Classification granularity**: Multiple classification levels require careful analysis of role content, supervision, autonomy and skills used.
- **Span of hours**: The award contains specific span-of-hours provisions that affect when penalties apply, and these differ for general staff, shiftworkers and part-time employees.
- **Part-time complexity**: Guaranteed hours, variation of hours, and the interaction between agreed hours and overtime triggers.
- **Shiftwork provisions**: Different penalty rates apply for different shift types.
- **Casual loading interaction**: Casual loading is applied to base rate but the interaction with specific penalties requires careful construction.

### 3.2 Road Transport and Distribution Award 2020 [MA000038]

The RTD Award applies to drivers, warehousing, dispatch and related functions in the road transport and distribution industry.

Key complexity sources:
- **Vehicle-based classification**: Classification often depends on the class of vehicle driven, not just skill level. GVM thresholds matter.
- **Loading and unloading**: Whether employees are required to load or unload — and whether this is incidental or primary — affects classification and allowances.
- **Industry allowances**: Multiple allowances (vehicle, dangerous goods, tool, first aid, etc.) each have specific trigger conditions.
- **Shiftwork vs. day work**: The penalty rate structure differs significantly.
- **Interaction with RTLDO Award**: An employee who performs both local and long-distance duties creates a hybrid scenario requiring careful allocation.
- **Casual engagement**: Specific minimum engagement rules apply.

### 3.3 Road Transport (Long Distance Operations) Award 2020 [MA000039]

The RTLDO Award introduces a fundamentally different payment model for long-distance operations.

Key complexity sources:
- **Per-kilometre payment structure**: The award provides an alternative payment model based on kilometres travelled rather than time alone — a significant departure from standard hourly rate logic.
- **Definition of "long distance"**: The award has a specific definition that must be applied before the award's provisions engage.
- **Fatigue management interaction**: Federal and state fatigue regulations (Heavy Vehicle National Law) interact with award rest period requirements.
- **Multi-day trip logic**: Payments for overnight stays, rest periods and waiting time require separate tracking.
- **Interaction with RTD Award**: When does a trip qualify for RTLDO treatment? The boundary matters.
- **Driver's licence and vehicle requirements**: Coverage depends in part on the type of operation and vehicle.

### 3.4 Cross-Award Complexity

A significant proportion of workforce scenarios will involve:
- A clerical employee working within a transport business
- A driver who performs some loading/unloading and some local/long-distance runs
- A transport worker who has some administrative duties in their role

These scenarios require the tool to navigate award coverage before any pay logic is applied. Getting coverage wrong invalidates every calculation that follows.

---

## 4. Why "Production-Ready" Matters

A tool that gives wrong answers consistently is more dangerous than no tool at all. It creates false confidence.

"Production-ready" in this context means:

| Criterion | Meaning |
|---|---|
| Legally grounded | Every rule traces to a specific award clause or statutory provision |
| Current | Pay rates and entitlements reflect the current Annual Wage Review |
| Validated | Logic tested against real payroll scenarios before use |
| Auditable | Every output can be traced back to inputs and rules applied |
| Maintainable | Rates and rules can be updated without rebuilding logic |
| Explainable | Outputs are presented in plain English that can be understood by employees and reviewers |
| Governed | Clear ownership, update responsibilities and change approval process |
| Escalation-aware | The tool knows what it cannot reliably decide and flags it |

A tool that lacks any one of these attributes is not production-ready.

---

## 5. Key Controls Required for Compliance

The following controls are non-negotiable for any organisation relying on this tool to support pay decisions:

### 5.1 Legal Validation Before Go-Live
The complete logic specification must be reviewed by a qualified employment lawyer or senior ER practitioner before any employee payments are calculated using the tool. See `/docs/17-validation-points.md` for specific items.

### 5.2 Annual Rate Update Protocol
Pay rates, allowances and junior rates (where applicable) must be updated immediately following the Fair Work Commission Annual Wage Review, typically effective the first full pay period on or after 1 July each year. A documented update sign-off is required.

### 5.3 Version Control
Every change to the tool — whether to rates, logic or structure — must be documented in the change log with date, author, nature of change, and approver. The tool version number must be visible on every output.

### 5.4 Locked Logic Cells
In the Excel implementation, all logic cells, rate tables and rule parameters must be protected with a password known only to the technical owner. Users interact only through the data entry interface.

### 5.5 Audit Trail
Every scenario run through the tool should produce a timestamped output record showing inputs, rules applied and outputs generated. This record should be stored for at least seven years.

### 5.6 Escalation Discipline
When the tool flags a manual review trigger, the calculation output must not be used as a final answer. It must be escalated to the designated reviewer before any payment is made.

### 5.7 Award Variation Monitoring
The Process Owner must monitor the Fair Work Commission website and FWO communications for any variations to the covered awards and initiate a tool update whenever a material change is detected.

---

## 6. Intended Outcome

When correctly implemented, governed and maintained, this tool will:
- Reduce underpayment risk across clerical and transport workforces
- Create a consistent, documented interpretation pathway for pay decisions
- Support payroll officers and HR staff without requiring deep award expertise
- Provide audit-ready output for any Fair Work investigation or internal review
- Enable scalable compliance as workforce size and complexity grows

---

*This document is part of a controlled build pack. See README.md for package overview and update responsibilities.*
