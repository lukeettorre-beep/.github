# Document 03 — Award Coverage Decision Engine

**Build Pack:** Award Interpreter Tool
**Awards:** MA000002 | MA000038 | MA000039
**Version:** 1.0
**Status:** Draft — Requires Legal Validation

> **VALIDATION FLAG:** Award coverage analysis is the highest-risk step in this tool. Incorrect coverage determination invalidates every subsequent calculation. All decision logic below must be validated by a qualified employment lawyer before implementation. Clause references are indicative based on current award text and should be verified against the current consolidated version on the FWC website.

---

## 1. Coverage Methodology

### 1.1 Guiding Principle

Award coverage is determined by:
1. The **industry** in which the employer is engaged (industry test)
2. The **occupation or classification** into which the employee falls (occupation test)
3. Any **specific exclusions** in the award
4. Whether a **higher-level instrument** (enterprise agreement, contract above high income threshold) applies

An employee is covered by a modern award if EITHER the industry test OR the occupation test is satisfied, unless they are excluded.

### 1.2 Award Interaction Hierarchy

Where multiple awards could theoretically apply, the following hierarchy governs:

1. **Enterprise Agreement** — if one applies and has passed BOOT, it covers the employee and the award is a safety net only
2. **More specific award** — a more specific industry/occupation award prevails over a more general one where both could apply
3. **Specific schedule or clause** — if the award itself specifies which provisions apply in a mixed-duties scenario, follow the award
4. **"Principal purpose" or "majority of time" test** — used to resolve genuine ambiguity when no other rule resolves the question

### 1.3 Step-by-Step Coverage Methodology

**STEP 1:** Is the employee employed by a national system employer?
- Federal system: constitutional corporations, Commonwealth, Territory employers
- State system (non-WA states): all private sector employers (since 2010 referral)
- WA state system: non-constitutional corporations remain in WA state system
→ If not a national system employer: **STOP — this tool does not apply. Refer to WA state system.**

**STEP 2:** Does an enterprise agreement apply to this employee?
→ If YES: **the tool outputs are floor entitlements only. EA applies as the operative instrument. Flag for legal review.**

**STEP 3:** Is the employee award-free?
- Annual guarantee of earnings > high income threshold (currently ~$175,000 — VALIDATE current figure from FWC)
- AND employer and employee have entered a guarantee of annual earnings
→ If YES: **award does not apply. STOP. Flag for legal review.**

**STEP 4:** Identify the employer's industry and the employee's occupation/duties.

**STEP 5:** Apply the coverage decision tree below.

---

## 2. Award Coverage Decision Tree

### Node ACE-01: Is the employer engaged in the road transport and distribution industry?

**Decision ID:** ACE-01
**Legal question:** Does the employer operate in the road transport and distribution industry as defined in MA000038?
**Practical meaning:** Does the employer's primary business involve the collection, cartage, or delivery of goods by road, including warehousing and distribution operations ancillary to that?

**Inputs required:**
- ORG_INDUSTRY (employer industry description)
- ORG_PRIMARY_ACTIVITY (free text)
- ORG_ABN_CATEGORY (optional — ABS industry classification)

**Rule logic:**
```
IF ORG_INDUSTRY contains [road transport, distribution, logistics, courier, cartage, freight, warehousing]
AND employee duties relate to that industry
THEN → proceed to ACE-02 (RTD/RTLDO branch)
ELSE → proceed to ACE-05 (Clerks branch)
```

**Confidence status:** Moderate — "road transport and distribution industry" requires interpretation; warehousing-only employers may or may not be covered
**Manual review trigger:** Employer is in logistics/warehousing but does not operate vehicles; employer is a third-party freight broker

---

### Node ACE-02: Is the employee a driver performing long-distance operations?

**Decision ID:** ACE-02
**Legal question:** Do the employee's duties primarily involve long-distance road transport operations as defined in MA000039?
**Practical meaning:** Does the employee regularly operate heavy vehicles on interstate or intrastate runs that qualify as "long distance operations" under the RTLDO Award?

> **VALIDATION FLAG — RTLDO Definition:** The RTLDO Award [MA000039] covers employees engaged in "long distance operations." The award defines long distance operations. This definition must be verified against current award text. Generally understood to apply where the employee travels overnight or beyond a certain distance/time threshold from their base. Verify exact definition from current consolidated award text on fwc.gov.au.

**Inputs required:**
- EMP_VEHICLE_TYPE (type of vehicle operated)
- EMP_ROUTE_TYPE (local / intercity / interstate / long haul)
- TRIP_AWAY_FROM_BASE (yes/no: does work regularly require overnight stays away from home base?)
- TRIP_TYPICAL_DISTANCE (km per typical trip)

**Rule logic:**
```
IF EMP_ROUTE_TYPE = "long haul" OR "interstate"
AND TRIP_AWAY_FROM_BASE = YES
AND employee is a driver (not warehouse/clerical)
THEN → AWARD = MA000039 (RTLDO) — proceed to RTLDO rules
ELSE → proceed to ACE-03 (RTD coverage)
```

**Confidence status:** Moderate — the boundary between RTD and RTLDO trips requires careful analysis of actual trip patterns
**Manual review trigger:** Employee performs both local and long-distance runs; employer operates on a mixed-fleet basis

---

### Node ACE-03: Does the employee fall within RTD Award coverage?

**Decision ID:** ACE-03
**Legal question:** Is the employee covered by MA000038?
**Practical meaning:** Is the employee a driver, warehouse worker, dispatch worker or other covered employee in the road transport/distribution industry who is NOT performing long-distance operations?

> **VALIDATION FLAG:** The RTD Award coverage clause must be verified. The award covers employees in the road transport and distribution industry in certain classifications. Exclusions include clerical employees (who may be covered by MA000002), managerial employees, and employees covered by a more specific award.

**Inputs required:**
- EMP_DUTIES_PRIMARY (primary duty category: driver / warehouse / dispatch / clerical / management)
- EMP_CLASSIFICATION_CODE (from RTD classification structure)
- ORG_INDUSTRY (confirmed road transport)

**Rule logic:**
```
IF ORG_INDUSTRY = road transport/distribution
AND EMP_DUTIES_PRIMARY ∈ [driver, warehouse, storeperson, dispatch, courier]
AND NOT (EMP_DUTIES_PRIMARY = clerical AND clerical duties are PRIMARY purpose of engagement)
THEN → AWARD = MA000038 (RTD) — proceed to RTD rules
ELSE → proceed to ACE-04 (mixed duties analysis)
```

**Confidence status:** High for primary transport/warehouse duties; Lower for mixed-duty roles
**Manual review trigger:** Employee's duties split between clerical and operational; employee performs supervisory functions

---

### Node ACE-04: Mixed Duties Analysis

**Decision ID:** ACE-04
**Legal question:** Where an employee in the road transport/distribution industry performs both operational transport duties and clerical duties, which award applies?
**Practical meaning:** A transport company employee who drives part-time and does admin part-time — which award governs?

**Inputs required:**
- DUTIES_TRANSPORT_PCT (estimated % of time on transport/operational duties)
- DUTIES_CLERICAL_PCT (estimated % of time on clerical duties)
- DUTIES_PRIMARY_PURPOSE (what is the employee engaged to do?)

**Rule logic:**
```
IF DUTIES_PRIMARY_PURPOSE = transport/operational
AND DUTIES_TRANSPORT_PCT >= 50%
THEN → AWARD = MA000038 (RTD)

IF DUTIES_PRIMARY_PURPOSE = clerical
AND DUTIES_CLERICAL_PCT >= 50%
THEN → AWARD = MA000002 (Clerks)

IF DUTIES_PRIMARY_PURPOSE ambiguous
OR time split approximately equal
THEN → MANUAL REVIEW REQUIRED — do not proceed to automated calculation
```

> **VALIDATION FLAG:** The "principal purpose" test for mixed duties is a legal judgment. It is influenced by the terms of engagement, the parties' understanding, and the actual work performed. This cannot be reliably automated. Flag for ER/legal review.

**Confidence status:** Low — requires legal judgment
**Manual review trigger:** Always trigger manual review when duties split is between 40-60% on each category

---

### Node ACE-05: Does the employee fall within Clerks Award coverage?

**Decision ID:** ACE-05
**Legal question:** Is the employee covered by MA000002?
**Practical meaning:** Is the employee engaged in clerical, administrative or related work in the private sector?

> **VALIDATION FLAG:** The Clerks Award coverage clause must be verified against current award text. The award covers employees employed in the private sector in the classifications described in the award. Key exclusions include: employees covered by a more specific award; employees engaged in industries with their own specific award covering clerical functions.

**Inputs required:**
- ORG_INDUSTRY (must confirm NOT road transport, NOT other industry with specific clerical coverage)
- EMP_DUTIES_PRIMARY (clerical/administrative/reception/data entry/customer service/accounts)
- ORG_SECTOR (private — not government, not community sector)

**Rule logic:**
```
IF EMP_DUTIES_PRIMARY ∈ [clerical, administrative, data entry, customer service, accounts, receptionist, filing, typing, office administration]
AND ORG_SECTOR = private
AND NOT covered by a more specific industry award (check: is employer in a specifically-covered industry with its own clerical provisions?)
THEN → AWARD = MA000002 (Clerks) — proceed to Clerks rules

IF ORG_SECTOR = government or not-for-profit community sector
THEN → STOP — different award likely applies; manual review required
```

**Confidence status:** High for clearly clerical roles in non-industry-specific private sector employers; Lower where the employer is in an industry with its own award
**Manual review trigger:** Clerical employee in banking/finance (separate award applies); clerical employee in specific industry sectors

---

### Node ACE-06: Is the employee covered by any of the three awards?

**Decision ID:** ACE-06
**Legal question:** Has coverage been established under MA000002, MA000038 or MA000039?
**Output:**

| Path | Award | Proceed To |
|---|---|---|
| Confirmed Clerks | MA000002 | doc 05 — Clerks Rules Engine |
| Confirmed RTD | MA000038 | doc 06 — RTD Rules Engine |
| Confirmed RTLDO | MA000039 | doc 07 — RTLDO Rules Engine |
| Unresolved / Manual Review | None | doc 14 — Escalation Matrix |
| No coverage under these awards | None | STOP — identify applicable award |

---

## 3. Treatment of Clerical Roles in Transport Businesses

### 3.1 The Problem

Transport businesses commonly employ:
- Dispatchers (operational, not clerical)
- Traffic controllers (operational scheduling — not clerical in the traditional sense)
- Depot administrators (clerical)
- Accounts staff (clerical)
- Customer service staff in a transport context (potentially clerical)

### 3.2 Decision Framework

| Role | Primary Duties | Likely Award |
|---|---|---|
| Depot administrator (filing, data entry, invoicing) | Clerical | MA000002 |
| Dispatcher (allocating runs, communicating with drivers) | Operational transport | MA000038 (verify) |
| Traffic controller (route planning, compliance monitoring) | Operational transport | MA000038 (verify) |
| Accounts receivable officer in transport company | Clerical | MA000002 |
| Customer service officer (freight enquiries, tracking) | Clerical | MA000002 (verify) |
| Weighbridge operator | May be covered by RTD | Validate |

> **VALIDATION FLAG:** The classification of dispatchers and traffic controllers is a known area of complexity. In some transport businesses these are treated as RTD employees; in others as clerical. This should be verified with legal advice specific to the employer's EA status and actual job content.

### 3.3 Evidence Requirements

For any clerical role in a transport business, the tool must record:
- The specific duties performed (not just the job title)
- The percentage of time spent on each duty category
- The basis on which the employer has determined the award coverage
- Whether this has been reviewed by a qualified practitioner

---

## 4. Long Distance vs. Other Transport Logic

### 4.1 The Boundary Question

The single most important question for transport award application is: **is this a long-distance operation?**

A driver who sometimes does local runs and sometimes does long-distance runs creates complexity. The RTLDO Award applies to employees "engaged in long distance operations" — but what if only some of their trips qualify?

> **VALIDATION FLAG:** This is a documented area of uncertainty. The question of whether an employee who performs mixed local and long-distance runs is covered by MA000039, MA000038, or a combination, must be analysed in the context of the actual terms of engagement and trip patterns. Legal advice is recommended before building automated logic for mixed-distance employees.

### 4.2 Working Framework for the Tool

Until legal validation is complete, the tool should apply the following:

| Trip Pattern | Tool Handling |
|---|---|
| All trips qualify as long distance | Apply MA000039 |
| All trips are local/regional | Apply MA000038 |
| Mixed trips (some local, some long distance) | Flag for manual review — do not auto-calculate |
| Occasional long-distance trip by otherwise RTD employee | Flag — may be an isolated trip rather than a pattern of engagement |

---

## 5. Evidence Required for Each Decision Point

| Decision | Evidence Required |
|---|---|
| Industry coverage | Employer business description, ABN category |
| Occupation coverage | Position description, duty statement |
| Employment type | Written employment contract |
| Classification | Completed classification assessment + evidence |
| Long-distance status | Trip records, payroll records, route logs |
| EA status | Copy of approved enterprise agreement |
| High income threshold | Guaranteed annual earnings statement |
| Mixed duties | Time diary or work allocation records |

---

## 6. Edge Cases

| Edge Case | Risk | Tool Response |
|---|---|---|
| Labour hire employee placed with transport employer | Whose award applies depends on the labour hire employer's registration and the host's industry | Manual review — flag |
| Apprentice or trainee in transport | Training contract overlay | Manual review — flag |
| Employee recently transferred between awards (business sale) | Transfer of business provisions | Manual review — flag |
| Employee working across state lines | Federal award applies in most cases but state-based public holidays and some conditions vary | Note in output |
| Employer not a constitutional corporation | May not be in federal system | Manual review — flag |
| Employee with two separate engagements with related entities | Aggregation rules under Fair Work Act | Manual review — flag |
| Independent contractor classified as employee (sham) | Not award-covered as contractor but may be misclassified | Out of scope — refer legal |

---

*This document is part of a controlled build pack. See README.md for package overview and update responsibilities.*
