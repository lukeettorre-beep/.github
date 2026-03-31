# Award Interpreter Tool — Build Pack

**Version:** 1.0 (Initial Release)
**Date:** March 2026
**Status:** Implementation-Ready Draft — Requires Legal and Payroll Validation Before Go-Live
**Awards Covered:** MA000002 | MA000038 | MA000039

---

## Purpose

This build pack provides a complete, implementation-ready specification for an Excel-based Award Interpreter Tool covering three Australian modern awards:

1. **Clerks—Private Sector Award 2020** [MA000002]
2. **Road Transport and Distribution Award 2020** [MA000038]
3. **Road Transport (Long Distance Operations) Award 2020** [MA000039]

The tool is designed to support HR, payroll, and operations teams in correctly applying award entitlements, reducing underpayment risk, and maintaining auditable records of pay decisions.

---

## Awards Covered

| Award | Code | Published By | Primary Users |
|---|---|---|---|
| Clerks—Private Sector Award 2020 | MA000002 | Fair Work Commission | Clerical/admin employers |
| Road Transport and Distribution Award 2020 | MA000038 | Fair Work Commission | Transport/logistics employers |
| Road Transport (Long Distance Operations) Award 2020 | MA000039 | Fair Work Commission | Long-distance road transport operators |

**Legal basis:** All three are modern awards made under the Fair Work Act 2009 (Cth). The consolidated award texts and minimum wage rates are published by the Fair Work Commission (fwc.gov.au) and the Fair Work Ombudsman (fairwork.gov.au).

---

## Intended Users

| Role | Usage |
|---|---|
| Payroll Officers | Determine correct pay rates, penalties and allowances |
| HR Managers | Classify employees, interpret entitlements |
| Operations Managers | Roster design compliance, break management |
| Payroll Systems Analysts | Build automated pay rule logic |
| Excel/Spreadsheet Builders | Implement the tool from this specification |
| Compliance/Audit Teams | Review audit trails and flag anomalies |
| Legal/ER Advisors | Validate logic before go-live and after award variations |

---

## Key Compliance Risks Addressed

- **Underpayment of minimum wages** — incorrect base rate selection
- **Missed penalty rates** — overtime, weekends, public holidays, shift work
- **Incorrect classification** — employees placed below correct classification level
- **Missed allowances** — vehicle, meal, tool, dangerous goods, long distance
- **Incorrect casual loading** — omission or double application
- **Misidentification of award coverage** — applying wrong award or no award
- **Break non-compliance** — incorrect or missed meal and rest breaks
- **Long distance payment errors** — incorrect per-kilometre, waiting time or rest period payments
- **Overtime miscalculation** — incorrect trigger points or averaging arrangements

---

## Package Contents

```
/README.md                          — this file
/docs/
  01-executive-overview.md          — business case and risk context
  02-scope-and-design-principles.md — what the tool does/doesn't do
  03-award-coverage-engine.md       — award selection logic
  04-data-model.md                  — all input fields specified
  05-rules-engine-clerks.md         — MA000002 full rules
  06-rules-engine-rtd.md            — MA000038 full rules
  07-rules-engine-rtldo.md          — MA000039 full rules
  08-classification-framework.md    — classification methodology
  09-pay-logic-model.md             — pay calculation pathway
  10-excel-build-spec.md            — workbook build specification
  11-ux-guidance.md                 — user experience design guide
  12-governance-and-controls.md     — governance framework
  13-testing-framework.md           — test pack and scenarios
  14-escalation-matrix.md           — edge cases and escalation
  15-implementation-roadmap.md      — staged rollout plan
  16-training-guide.md              — user training guide
  17-validation-points.md           — compliance validation register

/templates/
  input-fields.csv                  — all input fields with metadata
  rules-register.csv                — all rules with IDs and references
  classification-mapper.csv         — classification decision support
  decision-tree-table.csv           — award coverage decision tree
  change-log.csv                    — version and change tracking
  test-scenarios.csv                — test case library
  rates-table-structure.csv         — pay rates table template
  allowances-table-structure.csv    — allowances table template
  audit-log-template.csv            — audit trail template
```

---

## Implementation Expectations

This build pack is not a finished tool. It is a complete specification from which a capable Excel builder, payroll analyst or systems analyst can implement a production-ready tool.

**What you receive:** Full logic specification, data model, rules engine, formula guidance, UX design, governance framework, test pack and CSV templates.

**What you must do before go-live:**
1. Source current pay rates from the Fair Work Ombudsman pay guides for each award (rates update annually following the Annual Wage Review).
2. Have the logic validated by a qualified employment lawyer or senior ER practitioner with expertise in these awards.
3. Test the tool against known correct payroll scenarios before any live use.
4. Implement version control and change management processes.
5. Establish an annual update cycle keyed to the Fair Work Commission Annual Wage Review (typically effective first full pay period on or after 1 July each year).

---

## Update Responsibilities

| Item | Trigger | Owner | Frequency |
|---|---|---|---|
| Pay rates | Annual Wage Review (FWC) | Payroll Manager | Annually (July) |
| Award text changes | FWC award variation | ER/Legal Advisor | As issued |
| Classification levels | Award variation | ER/Legal Advisor | As issued |
| Allowance amounts | Annual Wage Review | Payroll Manager | Annually (July) |
| Public holiday dates | Annual state/territory calendar | Payroll Manager | Annually |
| Tool logic/rules | Award variation or system issue | Systems Analyst + ER review | As required |
| Test pack | After any logic change | Payroll/QA | After each update |

---

## Limitations and Escalation Points

This tool is a **decision support aid**, not a substitute for legal advice.

**Do not use this tool as the sole basis for pay decisions where:**
- Employee's award coverage is disputed or unclear
- Mixed duties exist across multiple award classifications
- An enterprise agreement may apply
- The employment relationship has unusual features
- Discrimination or adverse action risk is present
- An employee or representative has raised a formal dispute

**Escalation path:** Payroll Manager → HR Manager → ER/Legal Advisor → External Employment Lawyer

See `/docs/14-escalation-matrix.md` for full escalation logic.

---

## Legal Disclaimer

This build pack is prepared as a compliance decision support resource based on the consolidated text of the relevant modern awards, Fair Work Ombudsman guidance, and the Fair Work Act 2009 (Cth). It does not constitute legal advice. Award interpretation involves judgment. All logic should be validated by a qualified practitioner before operational use. Award rates and entitlements change; the tool must be updated to remain compliant.

---

## Contact and Ownership

| Role | Responsibility |
|---|---|
| Process Owner | [Insert: HR Manager / Payroll Manager] |
| Technical Owner | [Insert: Systems Analyst / Excel Builder] |
| Legal Reviewer | [Insert: Employment Lawyer / ER Advisor] |
| Version Control | [Insert: assigned owner] |

---

*This document is part of a controlled build pack. All changes must be logged in `/templates/change-log.csv` and approved by the Process Owner before implementation.*
