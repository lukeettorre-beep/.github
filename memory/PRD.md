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
### Core (v1.0)
- [x] Full 4-step workflow: Award Selector → Employee Profile → Shift Input → Results
- [x] All 10 pages + 11 new feature pages (21 total)
- [x] Complete rules engine for all 3 awards (Clerks, RTD, RTLDO)
- [x] Admin editable rate tables (password: admin123)
- [x] Audit trail with CSV export, MongoDB persistence, Light/dark mode, Responsive design

### Revenue / Efficiency (v2.0)
- [x] **Roster Templates** — Define standard weekly rosters, auto-generate batch shifts for pay periods
- [x] **Payroll System Integration** — Export to MYOB, Xero, KeyPay CSV formats
- [x] **PDF Report Generation** — Printable/saveable shift pay reports
- [x] **Batch Import** — CSV upload with drag & drop for bulk shift calculation

### Compliance & Accuracy (v2.0)
- [x] **Weekly OT Tracking** — Cumulative hours per employee/week with 38hr threshold alerts
- [x] **Annualised Salary Reconciliation** — Compare salary vs award entitlements, detect underpayment risk
- [x] **Rate Update Alerts** — Monitor rate table freshness, detect custom deviations from defaults
- [x] **NES Leave Calculator** — Annual leave, personal/carer's leave, long service leave calculations

### User Experience (v2.0)
- [x] **Shift Calendar View** — Visual monthly calendar with shift data overlay
- [x] **Real-Time Validation** — Inline warnings for OT threshold, break violations, weekly hours

### Data & Reporting (v2.0)
- [x] **Analytics Dashboard** — KPI cards, pie chart by award, monthly trend, top employees
- [x] **What-If Comparison Tool** — Compare pay outcomes across employment types, days, awards
- [x] **Bulk Employee Import** — CSV upload for employee profiles with auto rate lookup

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
