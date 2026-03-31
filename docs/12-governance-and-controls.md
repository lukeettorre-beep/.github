# Document 12 — Governance and Controls

**Build Pack:** Award Interpreter Tool
**Awards:** MA000002 | MA000038 | MA000039
**Version:** 1.0

---

## 1. Governance Framework Overview

The Award Interpreter Tool is a compliance instrument. It requires formal ownership, defined update processes, version control, and ongoing monitoring. A tool without governance is a liability — it will become outdated and produce incorrect results without anyone noticing.

This document defines the governance structure required for the tool to remain fit for purpose.

---

## 2. Roles and Responsibilities

| Role | Title | Responsibilities |
|---|---|---|
| Process Owner | HR Manager | Overall accountability for tool fitness; approves changes; signs off go-live |
| Technical Owner | Systems Analyst / Senior Payroll Officer | Maintains tool architecture; implements changes; manages version control |
| Legal/ER Reviewer | Employment Lawyer / Senior ER Advisor | Validates legal logic before go-live and after award variations; approves classification logic |
| Payroll Owner | Payroll Manager | Manages rate updates; confirms correct rates against FWO pay guides; approves rate changes |
| Update Monitor | Designated HR/Payroll officer | Monitors FWC and FWO for award variations and wage review announcements |
| Compliance Reviewer | Internal Audit / Compliance | Reviews audit logs periodically; escalates anomalies; spot-checks calculations |

### 2.1 Segregation of Duties Requirement

The following tasks must NOT be performed by the same person:
- Entering pay rates AND approving rate changes
- Building/changing logic AND approving logic changes
- Running payroll AND auditing payroll outputs

The Technical Owner may implement changes. The Process Owner (or Legal/ER Reviewer for legal logic) must approve them.

---

## 3. Version Control

### 3.1 Version Numbering

Format: `MAJOR.MINOR`

| Change Type | Version Increment | Example |
|---|---|---|
| Award variation (material logic change) | MAJOR +1 | 1.0 → 2.0 |
| Annual rate update (rates only, no logic change) | MINOR +1 | 1.0 → 1.1 |
| Minor fix or non-material change | MINOR +0.1 | 1.0 → 1.01 |

### 3.2 Version Control Process

1. Technical Owner creates a copy of the current workbook before making any change
2. Changes are made to the copy
3. Changes are tested (see Testing Framework — doc 13)
4. Legal/ER Reviewer or Payroll Owner (depending on nature of change) reviews and approves
5. Process Owner signs off
6. New version is named and distributed to users; old version is archived (not deleted)
7. Change is logged in Version_Control sheet and `/templates/change-log.csv`

### 3.3 Archive Policy

All previous versions of the tool must be retained for at least seven years. This supports audit trail requirements — if a payroll calculation is challenged, the version of the tool used at that time must be available.

---

## 4. Change Approval

No change to the tool may be implemented without:
- Documentation of what is changing and why
- Reference to the award clause, FWC decision or FWO guidance that triggers the change
- Testing completed and documented
- Sign-off from the appropriate approver

**Change approval matrix:**

| Change Type | Approver |
|---|---|
| Pay rate update | Payroll Manager + Process Owner |
| Allowance amount update | Payroll Manager + Process Owner |
| Award logic change | Legal/ER Reviewer + Process Owner |
| Classification structure change | Legal/ER Reviewer + Process Owner |
| Tool structure / UX change | Technical Owner + Process Owner |
| New award addition | Legal/ER Reviewer + Process Owner + Legal sign-off |
| Emergency fix (minor) | Technical Owner + Process Owner (retrospective ER review) |

---

## 5. Update Cadence

### 5.1 Mandatory Annual Update

Every year, the following update must occur:
1. Source updated pay rates from FWO pay guides for all three awards (typically published post-Annual Wage Review, effective first full pay period on or after 1 July)
2. Update Rates_Table with new rates and correct effective dates
3. Update Allowances_Table with any changed allowance amounts
4. Update PH_Table with the coming year's public holiday dates for all states/territories
5. Test the updated tool (see testing framework)
6. Sign off and distribute new version

**Deadline:** All updates must be in production by the first payroll period affected by the new rates.

### 5.2 Award Variation Monitoring

The Update Monitor must:
- Subscribe to FWC award variation alerts for MA000002, MA000038, and MA000039 (available via the FWC website)
- Subscribe to FWO communications for pay guide updates
- Check for variations after each National Minimum Wage decision
- Initiate a change review whenever a variation to a covered award is published

**Response time:** Any material variation must be assessed and, if required, a tool update initiated within 10 business days of publication.

---

## 6. Annual Wage Review Process

The Annual Wage Review (AWR) is conducted by the Fair Work Commission Expert Panel. It typically results in an increase to minimum wages, effective the first full pay period on or after 1 July.

### AWR Update Procedure

| Step | Action | Owner | Timing |
|---|---|---|---|
| 1 | Monitor FWC for AWR decision | Update Monitor | Annually — FWC typically announces March–June |
| 2 | Once decision issued, obtain new FWO pay guides for all three awards | Payroll Owner | Within 5 business days of guides being published |
| 3 | Technical Owner updates Rates_Table (with new effective date) | Technical Owner | Before go-live date |
| 4 | Payroll Owner validates rates against FWO pay guides | Payroll Owner | Before go-live |
| 5 | Run regression test pack (see doc 13) | Technical Owner | Before go-live |
| 6 | Process Owner signs off | Process Owner | Before go-live |
| 7 | Distribute new version to all users | Technical Owner | Before effective date |
| 8 | Retire previous version (archive it) | Technical Owner | After go-live |
| 9 | Log change in Version_Control and change-log.csv | Technical Owner | On go-live |

---

## 7. Locked Logic Protection

### 7.1 What is Locked

All sheets except Data_Entry are protected with a password:
- Coverage_Engine — full lock
- Award_Selector — full lock
- Clerks_Rules, RTD_Rules, RTLDO_Rules — full lock
- Rates_Table — full lock (Admin only)
- Allowances_Table — full lock (Admin only)
- PH_Table — full lock (Admin only)
- Admin_Config — full lock (Admin only)
- Classification_Mapper — editable by Admin only

### 7.2 Password Management

- Tool protection password is known to Technical Owner and Process Owner only
- Password is stored in the organisation's secure credential management system
- Password is changed when either password holder leaves the organisation
- No password is stored in the Excel file itself in an accessible way

---

## 8. Manual Override Controls

Users must not be able to override calculated outputs. However, there may be situations where a manual override is legitimately required (e.g., a legal advice determination that differs from the tool's logic).

### 8.1 Manual Override Process

1. Payroll officer identifies need for a manual override
2. Documents reason for override in writing
3. Obtains written approval from HR Manager
4. Documents the override in the Audit_Log (including reason and approver)
5. Retains supporting documentation (e.g., legal advice, escalation response)

**Rule:** A manual override that changes a calculated output by more than 5% must be reviewed by the Legal/ER Reviewer.

---

## 9. Recordkeeping

### 9.1 Audit Trail Requirements

Under the Fair Work Act and Fair Work Regulations, employers are required to maintain employment records. The tool's Audit_Log supports this.

Minimum records to retain:
- All calculation outputs (Audit_Log)
- Classification assessment records (external document, referenced in CLA005)
- Award coverage assessments (referenced in COV005/COV006)
- Evidence used for allowance triggers
- Change logs and version history

**Retention period:** At least seven years (in line with general payroll record requirements).

### 9.2 Record Storage

- Audit_Log exports should be saved monthly and stored in a secured HR/payroll drive
- Historical tool versions are archived in a nominated folder with version numbers in filenames

---

## 10. Testing After Updates

After every update, the following minimum testing must be completed before go-live:

1. **Rate check:** Spot-check 3 classification levels per award against FWO pay guide
2. **Regression test:** Run full test pack (doc 13) and confirm results match expected outputs
3. **Boundary test:** Test for edge cases that have previously been encountered
4. **Public holiday test:** Confirm new PH dates are correctly loaded and returning correct flags

If any test fails, the update must not go to production until the issue is resolved.

---

## 11. Sign-Off Process

### 11.1 Initial Go-Live Sign-Off

Before the tool is used for any real payroll decision, the following sign-offs must be obtained and documented:

| Sign-Off | By | Documentation |
|---|---|---|
| Legal logic validated | Employment Lawyer / Senior ER Advisor | Written legal opinion or sign-off document |
| Rates verified | Payroll Manager | Signed rates verification checklist |
| Test pack completed | Technical Owner | Test results document |
| Governance framework in place | Process Owner | Governance policy document |
| User training completed | Process Owner | Training attendance records |
| Final go-live approval | Process Owner | Signed go-live authorisation |

### 11.2 Post-Change Sign-Off

After every material change:
- Technical Owner certifies change implemented correctly
- Appropriate approver (see section 4) signs off
- Test results documented
- Version_Control updated

---

## 12. Escalation Path

When a compliance issue is identified through tool use or audit:

```
User flags issue → Payroll Manager assesses → HR Manager reviews →
Legal/ER Advisor advises → Process Owner authorises remediation →
Payroll correction made → Audit record updated
```

For systemic underpayment:
- Refer to Fair Work Ombudsman self-disclosure process
- Engage external employment lawyer
- Do not use this tool as the basis for remediation calculations — commission a dedicated review

---

*This document is part of a controlled build pack. See README.md for package overview and update responsibilities.*
