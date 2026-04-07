# Award Interpreter Tool — PRD

## Original Problem Statement
Build a production-ready "Award Interpreter Tool" web application for HR/payroll/operations staff to calculate Australian payroll compliance across three Modern Awards:
- Clerks - Private Sector Award 2020 (MA000002)
- Road Transport and Distribution Award 2020 (MA000038)
- Road Transport (Long Distance Operations) Award 2020 (MA000039)

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn UI + Phosphor Icons
- **Backend**: FastAPI (Python)
- **Database**: MongoDB (rate tables, employees, audit trail)
- **Auth**: Simple frontend password for admin (admin123)

## User Personas
1. **HR/Payroll Staff** — Primary users calculating shift pay entitlements
2. **Operations Managers** — Reviewing compliance and managing rate tables
3. **Admin** — Managing editable rate tables

## Core Requirements
- 10-page application with 4-step workflow
- Rules engine for all 3 awards (OT, penalties, breaks, allowances)
- Editable rate tables stored in MongoDB
- Audit trail with CSV export
- Light/dark mode toggle
- Responsive design

## What's Been Implemented (Feb 2026)
- [x] Full 4-step workflow: Award Selector → Employee Profile → Shift Input → Results
- [x] All 10 pages: Home, AwardSelector, EmployeeProfile, ShiftInput, Results, Warnings, Classification, AuditTrail, Admin, Help
- [x] Complete rules engine for all 3 awards (Clerks, RTD, RTLDO)
- [x] Clerks: OT (first 2hr 150%, after 2hr 200%), Saturday (125%), Sunday (200%), PH (250%), shiftwork premiums, break compliance
- [x] RTD: OT daily reset, casual OT (Cl 11.4 - no 25% loading), Saturday (150%), Sunday (200%), Good Fri/Xmas (300%), early morning (+30%)
- [x] RTLDO: CPK and hourly payment, loading/unloading (min 1hr each), delay/breakdown (max 8hr), casual/PT multipliers
- [x] Junior employee rates (age-based %)
- [x] Admin editable rate tables (password: admin123)
- [x] Audit trail with CSV export
- [x] MongoDB persistence for all data
- [x] Light/dark mode toggle
- [x] Responsive design with sidebar + top nav
- [x] Compliance banner (non-dismissible)
- [x] Session persistence for workflow state
- [x] Plain English explanation sections A-E
- [x] KPI cards on results page
- [x] **Batch Import** — CSV upload with drag & drop, preview table, batch calculation across all 3 awards, summary KPIs, results table with export, auto rate lookup, error handling with row numbers

## Prioritized Backlog
### P0 (Critical)
- All core features implemented

### P1 (Important)
- Mobile responsive testing (375px viewport)
- Batch calculation support (multiple shifts)
- Employee profile editing/updating
- Weekly overtime threshold tracking across shifts

### P2 (Nice to Have)
- PDF export of results
- Multi-user support with proper authentication
- Historical rate table versioning
- Email/notification for compliance warnings
- Integration with payroll systems (MYOB, Xero)

## Next Tasks
1. Mobile responsiveness fine-tuning
2. Batch shift calculation feature
3. PDF report generation
4. Weekly OT accumulation tracking
