# Document 08 — Classification Framework

**Build Pack:** Award Interpreter Tool
**Awards:** MA000002 | MA000038 | MA000039
**Version:** 1.0
**Status:** Draft — Requires Legal Validation

---

## 1. Why Title-Only Classification is Unsafe

Classifying an employee based solely on their job title — without examining actual duties performed — is one of the most common causes of underpayment in Australia.

Award classification levels are defined by the nature and complexity of the work performed, the level of skill and autonomy applied, and the degree of responsibility held. A job title of "Delivery Driver" tells you very little. That employee might be:
- A Grade 1 small vehicle driver making local parcel deliveries
- A Grade 4 heavy rigid driver hauling freight interstate
- A Grade 5 multi-combination operator on a road train

Each of these attracts a different minimum rate under the RTD Award.

Similarly, a "Receptionist" might be performing:
- Basic call routing and mail handling (Level 1 or 2 Clerks Award)
- Complex scheduling, accounts support, and office management (Level 3 or 4)

**The rule:** Classification must be based on an assessment of actual duties performed, not title, contract description, or employer preference.

---

## 2. Classification Methodology

### Step 1: Identify the Award

Determine which of the three awards applies using the coverage engine (doc 03). Classification cannot proceed until award coverage is established.

### Step 2: Obtain the Award Classification Descriptors

Pull the relevant classification schedule from the award:
- **MA000002:** Schedule A — Clerks Award classifications (Levels 1–6, verify)
- **MA000038:** Schedule A — RTD Award classifications (Grades by vehicle class and duties, verify)
- **MA000039:** Schedule A — RTLDO Award classifications (driver classes by vehicle type, verify)

> **VALIDATION FLAG:** Classification schedule structures must be sourced from current award text. Do not build the assessment against assumed descriptors.

### Step 3: Conduct the Duties Assessment

Ask structured questions about the employee's actual work. Record evidence. Do not rely on the employee's own description of their level — assess on duties, not aspiration.

### Step 4: Match to Classification Level

Compare the duties assessed against each classification level descriptor, starting from the lowest level and working up to find the level that best fits the work genuinely performed.

**Conservative rule:** Where the duties are between two levels, apply the higher level as a risk mitigation measure unless there is a clear evidentiary basis for the lower level.

### Step 5: Document and Sign Off

Record the assessment, the evidence used, the level determined, and the authorising manager. Store the record. Review annually or when duties change.

---

## 3. Clerks Award Classification Assessment

### 3.1 Assessment Questions (MA000002)

These questions map to classification level criteria in the Clerks Award. Answers should be rated as Yes/No or scored for complexity.

> **VALIDATION FLAG:** These questions are derived from general principles of Clerks Award classification. They must be validated against actual Schedule A level descriptors in the current award.

| Question ID | Assessment Question | Relevance |
|---|---|---|
| CQ-01 | Does the employee use computer systems, software or databases as a primary work tool? | Levels 1+ |
| CQ-02 | Does the employee communicate directly with external customers or clients as a primary function? | Levels 2+ |
| CQ-03 | Does the employee check and correct the work of others? | Levels 3+ |
| CQ-04 | Does the employee maintain accounts, prepare financial summaries or manage financial records? | Levels 3+ |
| CQ-05 | Does the employee perform work with limited supervision on a regular basis? | Levels 2+ |
| CQ-06 | Does the employee directly supervise or lead a team of clerical employees? | Levels 4+ |
| CQ-07 | Does the employee handle complex queries that require independent judgment? | Levels 3+ |
| CQ-08 | Does the employee prepare reports, presentations or correspondence requiring substantial skill? | Levels 3+ |
| CQ-09 | Does the employee have responsibility for procurement, contracts or significant resources? | Levels 5–6 |
| CQ-10 | Does the employee exercise management functions over a clerical team? | Level 6 |

**Decision matrix (illustrative — validate against award descriptors):**

| Pattern | Likely Level |
|---|---|
| CQ-01=Y, CQ-02=N, all others=N | Level 1 |
| CQ-01=Y, CQ-02=Y, CQ-05=Y, others=N | Level 2 |
| CQ-03=Y or CQ-04=Y or CQ-07=Y, CQ-06=N | Level 3 |
| CQ-06=Y (small team), CQ-07=Y | Level 4 |
| CQ-06=Y (large team) or CQ-08=Y (complex) | Level 5 |
| CQ-09=Y and CQ-10=Y | Level 6 |

---

### 3.2 Worked Examples — Clerks Award

**Example 1: Receptionist**
- Answers phones, routes calls, greets visitors, accepts deliveries, data entry
- CQ-01=Y, CQ-02=Y, CQ-05=N (closely supervised), others=N
- Likely classification: **Level 1 or Level 2** — depends on complexity and supervisory context
- Flag: assess whether independent judgment is exercised regularly

**Example 2: Accounts Payable Officer**
- Processes supplier invoices, reconciles accounts, resolves payment queries
- CQ-01=Y, CQ-02=Y (supplier relations), CQ-04=Y, CQ-05=Y, CQ-07=Y (partial)
- Likely classification: **Level 3**
- Flag: if also managing month-end reporting independently → assess Level 4

**Example 3: Office Manager**
- Manages three admin staff, handles complex scheduling, HR administration, procurement
- CQ-01=Y, CQ-02=Y, CQ-03=Y, CQ-04=Y, CQ-05=Y, CQ-06=Y, CQ-07=Y, CQ-08=Y, CQ-09=Y
- Likely classification: **Level 4 or Level 5**
- Flag: the size of supervised team and financial responsibility should determine exact level

---

## 4. RTD Award Classification Assessment

### 4.1 Assessment Questions (MA000038)

| Question ID | Assessment Question | Relevance |
|---|---|---|
| RQ-01 | What is the GVM of the primary vehicle operated? | All driver grades |
| RQ-02 | What is the driver's current licence class (LR/MR/HR/HC/MC)? | Driver classification |
| RQ-03 | Does the driver regularly operate an articulated vehicle or semi-trailer? | Grade 4+ |
| RQ-04 | Does the driver operate a B-double or multi-combination? | Highest grades |
| RQ-05 | Does the employee operate a forklift as a primary function? | Forklift classification |
| RQ-06 | Does the employee directly supervise other RTD employees? | Leading hand |
| RQ-07 | How many employees does the employee supervise? | Leading hand level |
| RQ-08 | Does the employee handle dangerous goods regularly? | Allowance trigger |
| RQ-09 | Is loading/unloading a substantial part of the employee's duties? | Classification/allowance |
| RQ-10 | Does the employee work primarily in the warehouse rather than driving? | Warehouse/storeperson grades |

**Decision matrix (verify all against award Schedule A):**

| Vehicle/Role | GVM | Licence | Likely Grade |
|---|---|---|---|
| Courier / small van | Up to 4.5t | Car/LR | Grade 1 (verify) |
| Light rigid | 4.5t–8t | LR/MR | Grade 2 (verify) |
| Medium rigid | 8t–15t | MR/HR | Grade 3 (verify) |
| Heavy rigid | 15t–25t | HR | Grade 4 (verify) |
| Articulated / semi | 25t+ | HC/MC | Grade 5 (verify) |
| B-double | High GVM | MC | Grade 5+ (verify) |
| Forklift — primary | N/A forklift | Forklift ticket | Forklift grade (verify) |
| Warehouse/storeperson | N/A | N/A | Warehouse grade (verify) |

### 4.2 Worked Examples — RTD Award

**Example 1: Small parcel delivery driver**
- Drives a 3.5t van, delivers parcels in metro area
- RQ-01: Up to 4.5t, Licence: LR, no forklift, no dangerous goods
- Likely classification: **Grade 1 or Grade 2** — verify exact GVM threshold in award

**Example 2: Heavy rigid driver — grocery distribution**
- Drives 22-tonne HR vehicle, local warehouse to supermarkets, assists with manual unloading
- RQ-01: 15t–25t, Licence: HR, loading/unloading: yes (substantial), no DG
- Likely classification: **Grade 4** — confirm loading/unloading impact
- Check: Is there a higher grade or allowance triggered by loading/unloading obligations?

**Example 3: B-double driver**
- Operates B-double (GVM >60t), MC licence, interstate runs
- RQ-04=Y, MC licence
- Likely classification: **Grade 5 or highest RTD grade** — but note: if interstate overnight, may be RTLDO, not RTD

---

## 5. RTLDO Award Classification Assessment

### 5.1 Assessment Questions (MA000039)

| Question ID | Assessment Question | Relevance |
|---|---|---|
| LDQ-01 | What is the primary vehicle type operated on long-distance runs? | Driver class |
| LDQ-02 | Does the driver operate a rigid vehicle on long-distance runs? | Class 1 (indicative) |
| LDQ-03 | Does the driver operate a semi-trailer on long-distance runs? | Class 2 (indicative) |
| LDQ-04 | Does the driver operate a B-double on long-distance runs? | Class 3 (indicative) |
| LDQ-05 | Does the driver operate a road train / multi-combination? | Class 4 (indicative) |
| LDQ-06 | Does the driver also perform loading/unloading at origin/destination? | Possible allowance or classification impact |

> **VALIDATION FLAG:** RTLDO classification classes must be verified against current award Schedule A. The above mapping is indicative only.

### 5.2 Worked Example — RTLDO Award

**Example: B-double driver, Sydney to Brisbane**
- MC licence, B-double (GVM >60t), regular interstate run, overnights in Brisbane
- Award coverage: MA000039 confirmed
- Classification: Class 3 B-double driver (verify against award Schedule A)
- Per-km rate: Class 3 rate from Rates_Table[RTLDO_PerKm]
- Additional entitlements: overnight accommodation allowance, meal allowances

---

## 6. When to Escalate Classification

Escalate to HR Manager and ER/Legal Advisor when:
- The role genuinely spans two classification levels and cannot clearly be placed in one
- The employee's duties have changed and their classification hasn't been reviewed
- The employee disputes their classification
- The job description doesn't match what the employee actually does
- The employee works across multiple vehicle types and the highest-grade vehicle is only occasionally used
- The employer's classification decision is not supported by a documented assessment
- A union representative or employee has raised a classification challenge

---

## 7. Classification Mapping Table Structure

The following column structure should be implemented in the Classification_Mapper sheet:

| Column | Content |
|---|---|
| AWARD_CODE | MA000002 / MA000038 / MA000039 |
| CLASSIFICATION_ID | Unique ID (e.g. CL-L1, RTD-G3, LD-C2) |
| CLASSIFICATION_NAME | Award classification title (from award) |
| KEY_CRITERIA_1 | Primary indicator (e.g. GVM range) |
| KEY_CRITERIA_2 | Secondary indicator |
| KEY_CRITERIA_3 | Tertiary indicator |
| RATE_CODE | Links to Rates_Table[Code] |
| MINIMUM_WEEKLY | Minimum weekly rate ($) — populate from FWO pay guide |
| MINIMUM_HOURLY | Minimum hourly rate ($) — populate from FWO pay guide |
| RATE_EFFECTIVE_DATE | Date from which rate applies |
| NOTES | Any additional criteria or flags |
| VALIDATE_FLAG | Yes/No — has this been validated against current award? |

---

*This document is part of a controlled build pack. See README.md for package overview and update responsibilities.*
