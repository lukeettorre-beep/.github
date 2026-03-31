# Document 15 — Implementation Roadmap

**Build Pack:** Award Interpreter Tool
**Awards:** MA000002 | MA000038 | MA000039
**Version:** 1.0

---

## 1. Overview

This roadmap defines a staged implementation from design finalisation through to production go-live and ongoing maintenance. The stages are sequential. No stage may be skipped.

**Minimum evidence required before any stage can close:** documented confirmation that the stage criteria have been met, signed by the accountable role.

---

## 2. Stakeholder Register

| Stakeholder | Role in Implementation |
|---|---|
| Process Owner (HR Manager) | Overall accountable; approves go-live; chairs stage reviews |
| Technical Owner (Systems Analyst) | Leads build; implements logic; manages version control |
| Legal/ER Reviewer | Reviews and validates legal logic; approves rule changes |
| Payroll Manager | Validates rates; confirms payroll integration requirements; signs off rate changes |
| Update Monitor | Monitors award variations; triggers update process |
| Payroll Officers (2–3) | User acceptance testing; ongoing operational use |
| HR Officers (2+) | User acceptance testing; classification assessments |
| Operations Manager | Transport scenario testing; RTLDO input |
| IT/Systems Administrator | Workbook security, storage, distribution |
| Internal Audit/Compliance | Post-go-live audit reviews |

---

## 3. Stage 1: Design Finalisation

**Owner:** Technical Owner + Legal/ER Reviewer
**Duration:** 2–3 weeks

### Activities

1. Review and validate all rule documents (docs 03–09) against current award texts on fwc.gov.au
2. Confirm all clause references are current
3. Identify any items flagged as VALIDATION required and resolve or carry forward as documented assumptions
4. Confirm Rates_Table structure is appropriate for all three awards
5. Confirm Allowances_Table structure covers all identified allowances
6. Define all named ranges and table structures in the build spec
7. Confirm Admin_Config settings (span of hours, break triggers, etc.) for each award

### Stakeholders

| Role | Responsibility |
|---|---|
| Legal/ER Reviewer | Primary validator of legal logic in docs 03–09 |
| Payroll Manager | Validates data model and output structure |
| Technical Owner | Translates validated rules into build spec |

### Exit Criteria

- [ ] All rules validated by Legal/ER Reviewer or documented as pending with risk rating
- [ ] Rates_Table and Allowances_Table structures approved by Payroll Manager
- [ ] Build spec (doc 10) signed off by Technical Owner
- [ ] Design finalisation sign-off document completed

---

## 4. Stage 2: Build

**Owner:** Technical Owner
**Duration:** 3–5 weeks

### Activities

1. Create workbook with all required sheets (per doc 10)
2. Build Coverage_Engine logic
3. Build Clerks_Rules, RTD_Rules, RTLDO_Rules logic sheets
4. Build Break_Rules and Overtime_Rules sheets
5. Populate Rates_Table with placeholder structure (rates to be inserted by Payroll Manager in Stage 3)
6. Populate Allowances_Table with placeholder structure
7. Populate PH_Table with current year dates for all states
8. Build Classification_Mapper with structure (classifications to be validated in Stage 3)
9. Build Scenario_Output sheet
10. Build Audit_Log sheet
11. Build Data_Entry sheet with all validation, dropdowns, and help text
12. Implement named ranges
13. Apply cell locking and password protection
14. Build Welcome_Instructions sheet
15. Implement conditional formatting and colour coding (per doc 11)

### Stakeholders

| Role | Responsibility |
|---|---|
| Technical Owner | Primary build responsibility |
| Payroll Manager | Advises on Rates_Table format |
| Process Owner | Available for questions during build |

### Exit Criteria

- [ ] All sheets present and structured per doc 10
- [ ] All named ranges implemented
- [ ] All validation rules applied to Data_Entry
- [ ] Cell locking applied throughout
- [ ] Technical Owner certifies build is ready for testing

---

## 5. Stage 3: Legal/Payroll Review

**Owner:** Legal/ER Reviewer + Payroll Manager
**Duration:** 2–3 weeks (concurrent activities)

### Activity 3A: Legal Logic Validation

Legal/ER Reviewer reviews:
1. Coverage_Engine logic against award coverage clauses
2. Classification logic against award classification schedules
3. Penalty rate matrix structure against award penalty clauses
4. Allowance trigger logic against award allowance provisions
5. RTLDO pay model structure against award long-distance provisions
6. Break rules against award break provisions
7. Overtime triggers against award overtime clauses
8. All manual review triggers and escalation flags

**Output:** Legal validation report — confirming each rule with clause reference, or flagging for further review.

### Activity 3B: Rates and Allowances Population

Payroll Manager:
1. Sources current FWO pay guides for all three awards
2. Populates Rates_Table with current minimum rates (all classifications)
3. Populates Allowances_Table with current allowance amounts
4. Cross-checks every rate against the FWO pay guide
5. Signs off rates verification checklist

### Activity 3C: Classification Mapper Population

HR Manager / ER Reviewer:
1. Populates Classification_Mapper with all classification levels from award Schedule A
2. Confirms mapping between classification names and rate codes
3. Validates GVM ranges for RTD/RTLDO classifications

### Stakeholders

| Role | Responsibility |
|---|---|
| Legal/ER Reviewer | Legal validation report |
| Payroll Manager | Rates verification |
| HR Manager | Classification mapper |

### Exit Criteria

- [ ] Legal validation report completed (all rules confirmed or risk-rated)
- [ ] Rates_Table populated and signed off by Payroll Manager
- [ ] Allowances_Table populated and signed off
- [ ] Classification_Mapper completed and validated
- [ ] All VALIDATION FLAG items from docs 05–09 resolved or documented with risk rating

---

## 6. Stage 4: Testing

**Owner:** Technical Owner (leads); all stakeholders participate
**Duration:** 2–3 weeks

### Activities

1. Run full unit test suite (doc 13, Section 2)
2. Run full scenario test library (doc 13, Section 3)
3. Run exception test cases (doc 13, Section 4)
4. Resolve any failures and re-test
5. Conduct payroll validation testing (doc 13, Section 6) — compare against 10 known-correct payroll scenarios
6. Conduct UAT with HR/payroll officers (doc 13, Section 5)
7. UAT debrief; resolve UX issues

### Stakeholders

| Role | Responsibility |
|---|---|
| Technical Owner | Runs unit and integration tests; fixes issues |
| Payroll Officers | UAT participants; payroll validation |
| HR Officers | UAT participants |
| Payroll Manager | Reviews payroll validation results |
| Legal/ER Reviewer | Spot-check legal accuracy of sample outputs |

### Exit Criteria

- [ ] Unit test pass rate: 100%
- [ ] Scenario test pass rate: 95%+ (all failures investigated and documented)
- [ ] Exception test: all flagged scenarios correctly trigger manual review
- [ ] Payroll validation: all variances within $0.10/hr
- [ ] UAT pass criteria met
- [ ] Test results document completed and signed by Technical Owner

---

## 7. Stage 5: User Training

**Owner:** Process Owner (HR Manager)
**Duration:** 1–2 weeks

### Activities

1. Deliver training sessions to all user groups (per doc 16)
2. Distribute training guide
3. Ensure all users understand:
   - Tool scope and limitations
   - How to navigate the tool
   - What manual review flags mean and how to respond
   - Escalation path
   - How NOT to misuse the tool
4. Record attendance

### Exit Criteria

- [ ] Training delivered to all user groups
- [ ] Training attendance recorded
- [ ] User guide (doc 16) distributed
- [ ] At least 90% of trained users can successfully complete a test scenario without assistance

---

## 8. Stage 6: Go-Live

**Owner:** Process Owner
**Duration:** 1 week

### Activities

1. Obtain final go-live sign-off (see governance doc 12, Section 11.1)
2. Distribute finalised version to all users
3. Archive development version
4. Update Version_Control sheet
5. Log initial entry in change-log.csv
6. Notify all users of go-live date
7. Confirm Admin/IT have correct file permissions and storage location

### Exit Criteria

- [ ] All Stage 1–5 exit criteria documented
- [ ] Go-live authorisation signed by Process Owner
- [ ] Tool distributed to all users
- [ ] Previous versions archived

---

## 9. Stage 7: First Review (60 Days Post Go-Live)

**Owner:** Process Owner + Technical Owner
**Duration:** 1 week (review); fixes as needed

### Activities

1. Collect feedback from payroll officers, HR and operations
2. Review Audit_Log for flags and patterns
3. Identify any calculation inconsistencies or user errors
4. Determine whether any logic issues have been discovered
5. Determine whether any rates changes have occurred since go-live
6. Issue any required updates (following change process in doc 12)

### Exit Criteria

- [ ] 60-day review completed
- [ ] Issues documented and resolved (or tracked)
- [ ] Review report completed and filed

---

## 10. Stage 8: Ongoing Maintenance

**Owner:** Process Owner + Technical Owner + Update Monitor

### Annual Maintenance Cycle

| Month | Activity |
|---|---|
| January–March | Monitor FWC for AWR announcements |
| April–June | Source updated FWO pay guides; prepare rate update |
| June/July | Implement rate update; test; distribute new version |
| August | Post-AWR spot check and Audit_Log review |
| October–November | Review public holiday table for next year |
| December | Annual review of award variation history; confirm no missed changes |

### Triggered Maintenance

Whenever an award variation is published by the FWC:
1. Assess impact on tool logic within 10 business days
2. If impact confirmed: initiate change process (doc 12)
3. Implement, test, and distribute update before impact date

---

*This document is part of a controlled build pack. See README.md for package overview and update responsibilities.*
