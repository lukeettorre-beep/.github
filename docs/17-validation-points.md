# Document 17 — Validation Points

**Build Pack:** Award Interpreter Tool
**Awards:** MA000002 | MA000038 | MA000039
**Version:** 1.0
**Status:** Required Reading Before Go-Live

---

## 1. Purpose

This document is the definitive list of items requiring verification before the tool is used in a production environment. It categorises each item by risk and required action.

**No item in Section 3 (legal/payroll validation required) may be left unresolved before go-live.**

---

## 2. Confirmed Logic: Suitable for Build

The following logic points are well-established and can be built in without further validation. They reflect settled law and/or standard modern award structure.

| Item | Basis | Notes |
|---|---|---|
| Ordinary hours = 38 per week maximum | Fair Work Act s.147 — maximum ordinary hours for full-time employees | Applies to all three awards |
| Casual loading is applied to base rate | Standard modern award structure | Amount must be validated per award |
| Overtime applies after ordinary hours are exceeded | Universal modern award principle | Specific trigger points must be validated per award |
| Public holidays: employee entitled to day off with pay if they would normally work that day | Fair Work Act NES, s.114 | Applies to all awards |
| Annual Wage Review effective date: first full pay period on or after 1 July | FWC standard practice | Applies to all three awards |
| Minimum engagement rule applies to casual employees | Standard modern award casual provision | Amount must be validated per award |
| Penalty rates apply for Saturday, Sunday and public holiday work | Standard modern award structure | Specific rates must be validated per award |
| HVNL applies separately and in addition to award rest provisions for heavy vehicle operators | Heavy Vehicle National Law — separate Commonwealth/state legislation | Note in tool; outside scope |
| The award is the minimum standard — an EA providing better conditions overrides it | Fair Work Act s.57 — EA displaces award for covered employees | Tool output = floor only when EA applies |
| NES entitlements cannot be reduced by any award or agreement | Fair Work Act Part 2-2 | Applies throughout |

---

## 3. Legal/Payroll Validation Required Before Go-Live

Every item below is flagged as VALIDATION REQUIRED in the rules documents. **None may be assumed correct without verification from the current award text (fwc.gov.au) and current FWO pay guides.**

### 3.1 Clerks Award [MA000002]

| Item | What to Verify | Risk if Wrong | Source |
|---|---|---|---|
| Classification level descriptors | Full text of Schedule A levels — duties, skills, experience | Wrong rate applied to all employees at affected levels | Current MA000002 Schedule A |
| Number of classification levels | Is it 6 levels? Confirm exact count and names | Structure error in Classification_Mapper | MA000002 Schedule A |
| Ordinary time span of hours | Exact start and end time of ordinary span on weekdays | All early/late penalty calculations wrong | MA000002 hours clause |
| Extended span provisions | Are there provisions for additional shifts or extended hours? | Missed or wrong penalties | MA000002 hours clause |
| Penalty rate multipliers — Saturday, Sunday, PH | Exact multipliers for each scenario and employment type | Systematic underpayment | FWO pay guide MA000002 |
| Overtime triggers — daily and weekly | Exact trigger point (7.6 hours? 8 hours? After agreed hours?) | Incorrect overtime calculation | MA000002 overtime clause |
| Shift loading percentages | Afternoon, night, rotating shift loadings | Wrong shift rates for shiftworkers | MA000002 shiftwork clause |
| Casual loading percentage | Currently 25%? Confirm | Wrong casual rate | MA000002 casual clause |
| Casual minimum engagement | 3 hours? Confirm | Under-minimum payment risk | MA000002 casual clause |
| Meal allowance trigger and amount | Hours trigger + dollar amount | Allowance missed or wrong | MA000002 allowances; FWO pay guide |
| Annual leave loading confirmation | Does 17.5% apply? Does it apply to all employees? | Incorrect leave loading | MA000002 annual leave clause |
| Part-time additional hours treatment | Are hours above agreed but below 38 overtime or ordinary? | Incorrect OT calculation for PT employees | MA000002 part-time clause |
| TOIL provisions | Are they available? What conditions? | Incorrect TOIL recording | MA000002 overtime clause |

### 3.2 RTD Award [MA000038]

| Item | What to Verify | Risk if Wrong | Source |
|---|---|---|---|
| Classification structure — full Schedule A | All grade titles, GVM thresholds, duties criteria | Wrong rate for every driver class | MA000038 Schedule A |
| GVM thresholds between grades | Exact tonnage cutoffs | Driver misclassified | MA000038 Schedule A |
| Overtime triggers — daily and weekly | Exact triggers; differ from Clerks? | Incorrect OT | MA000038 overtime clause |
| Penalty rate multipliers — Saturday, Sunday, PH | Exact multipliers | Systematic underpayment | FWO pay guide MA000038 |
| Casual loading | 25%? Confirm | Wrong casual rate | MA000038 casual clause |
| Casual minimum engagement | 4 hours? 3 hours? Confirm | Under-minimum | MA000038 casual clause |
| Vehicle allowances — amounts per GVM class | Current amounts per vehicle class | Missed or wrong allowance | MA000038 allowances; FWO pay guide |
| Dangerous goods allowance — trigger and amount | When does it apply? What is the amount? | Missed allowance | MA000038 allowances |
| First aid allowance — trigger and amount | When does it apply? | Missed allowance | MA000038 allowances |
| Leading hand allowance — trigger and amount | Number of employees supervised? | Missed allowance | MA000038 allowances |
| Meal allowance — trigger, conditions and amount | Hours trigger; conditions | Missed allowance | MA000038 allowances |
| Loading/unloading impact on classification | Does it escalate class? Or trigger allowance only? | Underpayment risk | MA000038 Schedule A + allowances |
| Recall/call-back minimum payment | Hours and rate | Underpayment on call-back | MA000038 overtime clause |
| Break trigger hours | After how many hours is meal break required? | Break non-compliance | MA000038 breaks clause |
| Minimum rest between shifts | How many hours? | Rest period non-compliance | MA000038 rest clause |
| Shift loading — afternoon and night | Percentages | Wrong shift rates | MA000038 shiftwork clause |

### 3.3 RTLDO Award [MA000039]

| Item | What to Verify | Risk if Wrong | Source |
|---|---|---|---|
| Definition of "long distance operations" | Exact award definition — distance? Time? Overnight? | Entire award coverage wrong | MA000039 cl.4 + definitions |
| Classification structure — Schedule A | Driver classes, vehicle types, associated rates | Wrong per-km rate applied | MA000039 Schedule A |
| Per-kilometre rates by class | Current rates per km | Systematic underpayment or overpayment | FWO pay guide MA000039 |
| Minimum weekly floor | Is there a minimum? What is it by class? | Underpayment in low-km weeks | MA000039 minimum rate clause |
| Waiting time trigger and rate | How many hours before WT payment? What rate? | Missed waiting time pay | MA000039 waiting time clause |
| Meal allowance conditions and amounts | When do meal allowances trigger on long distance trips? | Missed allowances | MA000039 allowances |
| Accommodation/overnight allowance | Amount; conditions; does it apply if employer provides accommodation? | Missed or double-counted allowance | MA000039 allowances |
| Overtime in per-km context | Does OT apply on top of per-km? Or replace it? | Fundamental pay model error | MA000039 overtime clause |
| Rest period between trips | Minimum hours; consequences of breach | Rest non-compliance | MA000039 rest clause |
| Saturday/Sunday/PH treatment | Do penalty multipliers apply to per-km rate or to time component? | Wrong weekend/PH rate | MA000039 penalty clause |
| Casual employment under RTLDO | Do casual provisions exist? Minimum engagement? | Wrong rate if casual | MA000039 casual provisions |
| Interaction clause with MA000038 | Does the award specify how to treat mixed-distance employees? | Wrong award split | MA000039 coverage + MA000038 |

---

## 4. Assumptions Used for Architecture

The following architectural assumptions are embedded in the tool design. They are based on standard modern award structure and general legal principles. They should be reviewed but are lower risk than Section 3 items.

| Assumption | Basis | Review Priority |
|---|---|---|
| Rate table structure supports all three awards | Standard table architecture | Medium — confirm during Stage 3 |
| Single award applies per employee per period | Standard coverage principle | Medium — flag for mixed periods |
| Overtime is not double-counted with penalty rates for same hours | Standard modern award principle | High — verify per award |
| Casual loading applies to base rate only (not to penalty rates separately) | Standard modern award structure | High — verify per award |
| The "better of" principle applies when NES and award provide different outcomes | Fair Work Act s.55 | Confirmed — low risk |
| Classification_Mapper rate codes correctly link to Rates_Table | Tool architecture assumption | Medium — verify during testing |

---

## 5. Matters Requiring Annual Review

These items must be reviewed at minimum once per year, or whenever a relevant FWC decision is published:

| Item | Review Trigger | Owner |
|---|---|---|
| All minimum hourly rates | Annual Wage Review (July) | Payroll Manager |
| All penalty rate multipliers (if changed) | FWC AWR or award variation | Payroll Manager + ER Reviewer |
| All allowance amounts | Annual Wage Review | Payroll Manager |
| Public holiday table | Year change | Payroll Manager |
| High income threshold | Annual indexation | HR Manager |
| Casual conversion assessment | 12-month casual anniversary for each employee | HR Manager |
| Classification structure | Any award variation to Schedule A | ER Reviewer |
| RTLDO per-km rates | Annual Wage Review | Payroll Manager |

---

## 6. Items That Must Never Be Automated Without Further Review

The following decisions must always involve human judgment. Automating them without specific legal validation would create unacceptable compliance risk:

| Item | Why It Cannot Be Automated |
|---|---|
| Award coverage where duties are genuinely mixed | Principal purpose test requires legal judgment |
| Classification where role spans two levels | "Generally employed at" analysis requires judgment |
| Whether a casual has converted to permanent | Casual conversion analysis requires engagement history review |
| Whether an enterprise agreement applies | Requires checking EA coverage clause and BOOT |
| Whether an employee is award-free | Guarantee of annual earnings analysis + income threshold check |
| Termination pay calculations | Fact-specific; interacts with long service leave, notice, redundancy |
| Remediation of prior underpayment | Requires separate legal-quality review |
| Identification of sham contracting | Requires legal analysis |

---

*This document concludes the core documentation set. Proceed to `/templates/` for CSV templates.*

*This document is part of a controlled build pack. See README.md for package overview and update responsibilities.*
