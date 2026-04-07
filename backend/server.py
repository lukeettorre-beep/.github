from fastapi import FastAPI, APIRouter, HTTPException, Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import io
import csv
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ─── Pydantic Models ───

class RateTable(BaseModel):
    model_config = ConfigDict(extra="ignore")
    award_code: str
    award_name: str
    classifications: List[Dict[str, Any]]
    penalty_rates: Dict[str, Any]
    allowances: Dict[str, Any]
    updated_at: str = ""

class Employee(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    employee_id: str = ""
    employing_entity: str = ""
    award_code: str = ""
    employment_type: str = "full_time"
    classification: str = ""
    pay_rate: float = 0.0
    pt_agreed_hours: float = 0.0
    is_junior: bool = False
    age: int = 21
    is_trainee: bool = False
    # RTLDO specific
    payment_method: str = "cpk"
    ea_coverage: bool = False
    fatigue_plan: bool = False
    # Clerks specific
    shiftwork: str = "none"
    ifa_annualised: bool = False
    created_at: str = ""

class ShiftInput(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    employee_id: str
    award_code: str
    employment_type: str
    classification: str
    pay_rate: float
    date: str
    day_of_week: str = ""
    is_public_holiday: str = "no"
    is_sa_ph: bool = False
    start_time: str
    finish_time: str
    unpaid_break_mins: int = 0
    meal_break_at: int = 0
    hours_this_week: float = 0.0
    ot_pre_approved: bool = False
    rdo_being_worked: bool = False
    # Allowances
    first_aid: bool = False
    leading_hand: bool = False
    own_vehicle: bool = False
    dangerous_goods: bool = False
    ot_meal: bool = False
    early_morning: bool = False
    travelling: bool = False
    furniture_livestock: bool = False
    excess_dimensions: bool = False
    # RTLDO
    km_driven: float = 0.0
    route: str = ""
    pt_non_agreed_day: bool = False
    loading_unloading: str = "no"
    loading_hours: float = 0.0
    delay_breakdown: bool = False
    delay_hours: float = 0.0
    notes: str = ""
    # Employee extras
    is_junior: bool = False
    age: int = 21
    shiftwork: str = "none"
    payment_method: str = "hourly"
    fatigue_plan: bool = False

class AuditEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: str
    employee_id: str
    award_code: str
    shift_date: str
    action: str
    total_pay: float
    components: List[Dict[str, Any]]
    plain_english: Dict[str, str]


# ─── Default Rate Tables ───

DEFAULT_RATES = {
    "MA000002": {
        "award_code": "MA000002",
        "award_name": "Clerks - Private Sector Award 2020",
        "classifications": [
            {"code": "L1Y1", "name": "Level 1 Year 1", "hourly_rate": 25.74},
            {"code": "L1Y2", "name": "Level 1 Year 2", "hourly_rate": 27.03},
            {"code": "L1Y3", "name": "Level 1 Year 3", "hourly_rate": 27.83},
            {"code": "L2", "name": "Level 2", "hourly_rate": 28.42},
            {"code": "L3", "name": "Level 3", "hourly_rate": 29.47},
            {"code": "L4", "name": "Level 4", "hourly_rate": 30.79},
            {"code": "L5", "name": "Level 5", "hourly_rate": 32.45},
        ],
        "penalty_rates": {
            "saturday_ordinary": 1.25,
            "sunday_ft_pt": 2.00,
            "sunday_casual": 2.25,
            "public_holiday_ft_pt": 2.50,
            "public_holiday_casual": 2.75,
            "ot_first2_ft_pt": 1.50,
            "ot_first2_casual": 1.75,
            "ot_after2_ft_pt": 2.00,
            "ot_after2_casual": 2.25,
            "afternoon_shift": 1.15,
            "night_shift": 1.15,
            "permanent_night": 1.30,
            "missed_break": 2.00,
        },
        "allowances": {
            "first_aid": 16.07,
            "meal_allowance": 18.48,
        },
        "updated_at": ""
    },
    "MA000038": {
        "award_code": "MA000038",
        "award_name": "Road Transport and Distribution Award 2020",
        "classifications": [
            {"code": "G1", "name": "Grade 1", "hourly_rate": 25.43},
            {"code": "G2", "name": "Grade 2", "hourly_rate": 25.93},
            {"code": "G3", "name": "Grade 3", "hourly_rate": 26.32},
            {"code": "G4", "name": "Grade 4", "hourly_rate": 26.94},
            {"code": "G5", "name": "Grade 5", "hourly_rate": 27.53},
            {"code": "G6", "name": "Grade 6", "hourly_rate": 28.12},
            {"code": "G7", "name": "Grade 7", "hourly_rate": 28.71},
            {"code": "G8", "name": "Grade 8", "hourly_rate": 29.23},
            {"code": "G9", "name": "Grade 9", "hourly_rate": 29.75},
            {"code": "G10", "name": "Grade 10", "hourly_rate": 30.78},
            {"code": "DF_L1", "name": "Driver Facilitator L1", "hourly_rate": 26.57},
            {"code": "DF_L2", "name": "Driver Facilitator L2", "hourly_rate": 27.72},
            {"code": "DF_L3", "name": "Driver Facilitator L3", "hourly_rate": 28.57},
            {"code": "DF_L4", "name": "Driver Facilitator L4", "hourly_rate": 29.39},
        ],
        "penalty_rates": {
            "ot_first2_ft_pt": 1.50,
            "ot_after2_ft_pt": 2.00,
            "ot_first2_casual": 1.50,
            "ot_after2_casual": 2.00,
            "saturday_ft_pt": 1.50,
            "saturday_casual": 1.75,
            "sunday_ft_pt": 2.00,
            "sunday_casual": 2.25,
            "public_holiday_ft_pt": 2.50,
            "public_holiday_casual": 2.75,
            "good_fri_xmas_ft_pt": 3.00,
            "good_fri_xmas_casual": 3.25,
            "early_morning": 1.30,
            "missed_break": 2.00,
        },
        "allowances": {
            "first_aid": 16.07,
            "meal_allowance": 18.48,
            "dangerous_goods": 0.54,
            "own_vehicle_per_km": 0.96,
        },
        "updated_at": ""
    },
    "MA000039": {
        "award_code": "MA000039",
        "award_name": "Road Transport (Long Distance Operations) Award 2020",
        "classifications": [
            {"code": "G3", "name": "Grade 3", "hourly_rate": 39.37, "cpk_rate": 0.525},
            {"code": "G4", "name": "Grade 4", "hourly_rate": 39.93, "cpk_rate": 0.532},
            {"code": "G5", "name": "Grade 5", "hourly_rate": 40.52, "cpk_rate": 0.540},
            {"code": "G6", "name": "Grade 6", "hourly_rate": 41.12, "cpk_rate": 0.548},
            {"code": "G7", "name": "Grade 7", "hourly_rate": 41.71, "cpk_rate": 0.556},
            {"code": "G8", "name": "Grade 8", "hourly_rate": 42.42, "cpk_rate": 0.566},
            {"code": "G9", "name": "Grade 9", "hourly_rate": 43.53, "cpk_rate": 0.580},
            {"code": "G10", "name": "Grade 10", "hourly_rate": 44.63, "cpk_rate": 0.595},
        ],
        "penalty_rates": {
            "loading_unloading_multiplier": 1.30,
            "casual_lu_multiplier": 1.25,
            "pt_non_agreed_day": 1.15,
            "delay_breakdown_rate": "weekly_div_40",
            "min_casual_km": 500,
            "min_casual_hours": 8,
        },
        "allowances": {
            "first_aid": 16.07,
            "meal_allowance": 18.48,
            "dangerous_goods": 0.54,
        },
        "updated_at": ""
    }
}

JUNIOR_RATES = {
    15: 0.45, 16: 0.50, 17: 0.60, 18: 0.70, 19: 0.80, 20: 0.90
}


# ─── Seed Rate Tables ───

@api_router.post("/seed-rates")
async def seed_rates():
    for code, data in DEFAULT_RATES.items():
        existing = await db.rate_tables.find_one({"award_code": code}, {"_id": 0})
        if not existing:
            data["updated_at"] = datetime.now(timezone.utc).isoformat()
            await db.rate_tables.insert_one(data)
    return {"status": "seeded"}


# ─── Rate Table Endpoints ───

@api_router.get("/rate-tables")
async def get_rate_tables():
    tables = await db.rate_tables.find({}, {"_id": 0}).to_list(100)
    if not tables:
        await seed_rates()
        tables = await db.rate_tables.find({}, {"_id": 0}).to_list(100)
    return tables

@api_router.get("/rate-tables/{award_code}")
async def get_rate_table(award_code: str):
    table = await db.rate_tables.find_one({"award_code": award_code}, {"_id": 0})
    if not table:
        if award_code in DEFAULT_RATES:
            data = DEFAULT_RATES[award_code].copy()
            data["updated_at"] = datetime.now(timezone.utc).isoformat()
            await db.rate_tables.insert_one(data)
            return {k: v for k, v in data.items() if k != "_id"}
        raise HTTPException(404, "Award not found")
    return table

@api_router.put("/rate-tables/{award_code}")
async def update_rate_table(award_code: str, body: Dict[str, Any]):
    body["updated_at"] = datetime.now(timezone.utc).isoformat()
    body.pop("_id", None)
    result = await db.rate_tables.update_one({"award_code": award_code}, {"$set": body})
    if result.matched_count == 0:
        raise HTTPException(404, "Award not found")
    await log_audit("SYSTEM", award_code, "-", "RATE_UPDATE", 0, [], {})
    return {"status": "updated"}


# ─── Employee Endpoints ───

@api_router.get("/employees")
async def get_employees():
    return await db.employees.find({}, {"_id": 0}).to_list(1000)

@api_router.post("/employees")
async def create_employee(emp: Employee):
    doc = emp.model_dump()
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    doc.pop("_id", None)
    await db.employees.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}

@api_router.put("/employees/{emp_id}")
async def update_employee(emp_id: str, body: Dict[str, Any]):
    body.pop("_id", None)
    body.pop("id", None)
    result = await db.employees.update_one({"id": emp_id}, {"$set": body})
    if result.matched_count == 0:
        raise HTTPException(404, "Employee not found")
    updated = await db.employees.find_one({"id": emp_id}, {"_id": 0})
    return updated

@api_router.get("/employees/{emp_id}")
async def get_employee(emp_id: str):
    emp = await db.employees.find_one({"id": emp_id}, {"_id": 0})
    if not emp:
        raise HTTPException(404, "Employee not found")
    return emp

@api_router.delete("/employees/{emp_id}")
async def delete_employee(emp_id: str):
    result = await db.employees.delete_one({"id": emp_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Employee not found")
    return {"status": "deleted"}


# ─── Calculation Engine ───

def parse_time(t: str) -> float:
    """Convert HH:MM to decimal hours from midnight."""
    parts = t.split(":")
    return int(parts[0]) + int(parts[1]) / 60.0

def calc_shift_hours(start: str, finish: str, unpaid_break: int) -> float:
    s = parse_time(start)
    f = parse_time(finish)
    if f <= s:
        f += 24
    return max(0, f - s - unpaid_break / 60.0)

def get_junior_multiplier(age: int) -> float:
    return JUNIOR_RATES.get(age, 1.0)

def check_break_compliance(total_hours: float, unpaid_break: int, meal_break_at: int):
    warnings = []
    if total_hours > 5 and unpaid_break < 30:
        warnings.append({
            "type": "break_missed",
            "severity": "high",
            "message": "Meal break required after 5 hours of work. No adequate break recorded.",
            "clause": "General break provisions"
        })
    if meal_break_at > 0 and meal_break_at > 330:
        warnings.append({
            "type": "break_late",
            "severity": "medium",
            "message": f"Meal break taken at {meal_break_at} mins — exceeds 5.5hr threshold.",
            "clause": "Break timing provisions"
        })
    return warnings


async def calculate_clerks(shift: dict, rates: dict) -> dict:
    """Calculate pay for Clerks Award MA000002."""
    base_rate = shift["pay_rate"]
    is_casual = shift["employment_type"] == "casual"
    casual_loading = 1.25 if is_casual else 1.0

    if shift.get("is_junior") and shift.get("age", 21) < 21:
        base_rate *= get_junior_multiplier(shift["age"])

    total_hours = calc_shift_hours(shift["start_time"], shift["finish_time"], shift["unpaid_break_mins"])
    penalties = rates.get("penalty_rates", {})
    components = []
    warnings = []
    day = shift.get("day_of_week", "").lower()
    is_ph = shift.get("is_public_holiday", "no") != "no"
    shiftwork = shift.get("shiftwork", "none")

    # Determine shift multiplier for shiftwork
    shift_mult = 1.0
    if shiftwork == "afternoon" or shiftwork == "night":
        shift_mult = penalties.get("afternoon_shift", 1.15)
    elif shiftwork == "permanent_night":
        shift_mult = penalties.get("permanent_night", 1.30)

    ordinary_hours = 0
    ot_hours = 0
    max_daily_ordinary = 10.0

    # Public holiday
    if is_ph:
        ph_mult = penalties.get("public_holiday_casual", 2.75) if is_casual else penalties.get("public_holiday_ft_pt", 2.50)
        min_hours = max(total_hours, 4.0)
        rate = base_rate * ph_mult
        components.append({
            "component": "Public Holiday",
            "quantity": round(min_hours, 2),
            "rate_mult": ph_mult,
            "unit_rate": round(rate, 2),
            "amount": round(min_hours * rate, 2),
            "clause": "Cl 28 - Public holidays"
        })
        ordinary_hours = min_hours
    elif day == "sunday":
        sun_mult = penalties.get("sunday_casual", 2.25) if is_casual else penalties.get("sunday_ft_pt", 2.00)
        min_hours = max(total_hours, 4.0)
        rate = base_rate * sun_mult
        components.append({
            "component": "Sunday Work",
            "quantity": round(min_hours, 2),
            "rate_mult": sun_mult,
            "unit_rate": round(rate, 2),
            "amount": round(min_hours * rate, 2),
            "clause": "Cl 26.2 - Sunday work"
        })
        ordinary_hours = min_hours
    elif day == "saturday":
        sat_mult = penalties.get("saturday_ordinary", 1.25)
        min_hours = max(total_hours, 3.0)
        effective_rate = base_rate * casual_loading * sat_mult
        components.append({
            "component": "Saturday Ordinary",
            "quantity": round(min_hours, 2),
            "rate_mult": sat_mult,
            "unit_rate": round(effective_rate, 2),
            "amount": round(min_hours * effective_rate, 2),
            "clause": "Cl 26.1 - Saturday work"
        })
        ordinary_hours = min_hours
    else:
        # Weekday — check span of hours (7am-7pm)
        start_h = parse_time(shift["start_time"])
        finish_h = parse_time(shift["finish_time"])
        if finish_h <= start_h:
            finish_h += 24

        ordinary_hours = min(total_hours, max_daily_ordinary)
        ot_hours = max(0, total_hours - max_daily_ordinary)

        effective_rate = base_rate * casual_loading * shift_mult
        if ordinary_hours > 0:
            components.append({
                "component": "Ordinary Hours",
                "quantity": round(ordinary_hours, 2),
                "rate_mult": round(casual_loading * shift_mult, 2),
                "unit_rate": round(effective_rate, 2),
                "amount": round(ordinary_hours * effective_rate, 2),
                "clause": "Cl 11 - Ordinary hours"
            })

        # Overtime
        if ot_hours > 0:
            ot_first2 = min(ot_hours, 2.0)
            ot_after2 = max(0, ot_hours - 2.0)
            if ot_first2 > 0:
                mult = penalties.get("ot_first2_casual", 1.75) if is_casual else penalties.get("ot_first2_ft_pt", 1.50)
                rate = base_rate * mult
                components.append({
                    "component": "Overtime (first 2hrs)",
                    "quantity": round(ot_first2, 2),
                    "rate_mult": mult,
                    "unit_rate": round(rate, 2),
                    "amount": round(ot_first2 * rate, 2),
                    "clause": "Cl 22 - Overtime first 2 hours"
                })
            if ot_after2 > 0:
                mult = penalties.get("ot_after2_casual", 2.25) if is_casual else penalties.get("ot_after2_ft_pt", 2.00)
                rate = base_rate * mult
                components.append({
                    "component": "Overtime (after 2hrs)",
                    "quantity": round(ot_after2, 2),
                    "rate_mult": mult,
                    "unit_rate": round(rate, 2),
                    "amount": round(ot_after2 * rate, 2),
                    "clause": "Cl 22 - Overtime after 2 hours"
                })

    # Break compliance
    break_warnings = check_break_compliance(total_hours, shift["unpaid_break_mins"], shift.get("meal_break_at", 0))
    if any(w["type"] == "break_missed" for w in break_warnings):
        breach_hours = max(0, total_hours - 5.0)
        if breach_hours > 0:
            mult = penalties.get("missed_break", 2.00)
            rate = base_rate * mult
            components.append({
                "component": "Missed Break Penalty",
                "quantity": round(breach_hours, 2),
                "rate_mult": mult,
                "unit_rate": round(rate, 2),
                "amount": round(breach_hours * rate, 2),
                "clause": "Break breach — 200% from breach point"
            })
    warnings.extend(break_warnings)

    # Allowances
    allowances = rates.get("allowances", {})
    if shift.get("first_aid"):
        daily = allowances.get("first_aid", 16.07) / 5
        components.append({"component": "First Aid Allowance", "quantity": 1, "rate_mult": 1, "unit_rate": round(daily, 2), "amount": round(daily, 2), "clause": "Schedule B - Allowances"})
    if shift.get("ot_meal") and ot_hours > 0:
        meal = allowances.get("meal_allowance", 18.48)
        components.append({"component": "OT Meal Allowance", "quantity": 1, "rate_mult": 1, "unit_rate": meal, "amount": meal, "clause": "Cl 22.7 - Meal allowance"})

    total_pay = sum(c["amount"] for c in components)
    penalty_rate = round(total_pay / total_hours, 2) if total_hours > 0 else 0

    plain_english = build_plain_english(shift, components, warnings, total_hours, ordinary_hours, ot_hours, total_pay, "MA000002")

    return {
        "total_hours": round(total_hours, 2),
        "ordinary_hours": round(ordinary_hours, 2),
        "ot_hours": round(ot_hours, 2),
        "penalty_rate": penalty_rate,
        "estimated_pay": round(total_pay, 2),
        "break_status": "Compliant" if not break_warnings else "Non-Compliant",
        "components": components,
        "warnings": warnings,
        "plain_english": plain_english,
    }


async def calculate_rtd(shift: dict, rates: dict) -> dict:
    """Calculate pay for RTD Award MA000038."""
    base_rate = shift["pay_rate"]
    is_casual = shift["employment_type"] == "casual"
    casual_loading = 1.25 if is_casual else 1.0

    total_hours = calc_shift_hours(shift["start_time"], shift["finish_time"], shift["unpaid_break_mins"])
    penalties = rates.get("penalty_rates", {})
    components = []
    warnings = []
    day = shift.get("day_of_week", "").lower()
    is_ph = shift.get("is_public_holiday", "no")

    # Min engagement
    if is_casual or shift["employment_type"] == "part_time":
        if total_hours < 4:
            warnings.append({"type": "min_engagement", "severity": "high", "message": "Minimum 4hr engagement for casual/PT.", "clause": "Cl 10.5"})
            total_hours = 4.0

    ordinary_hours = 0
    ot_hours = 0

    # Special PH (Good Friday, Christmas)
    if is_ph == "special":
        mult = penalties.get("good_fri_xmas_casual", 3.25) if is_casual else penalties.get("good_fri_xmas_ft_pt", 3.00)
        min_hours = max(total_hours, 4.0)
        rate = base_rate * mult
        components.append({
            "component": "Special Public Holiday (Good Fri/Xmas)",
            "quantity": round(min_hours, 2),
            "rate_mult": mult,
            "unit_rate": round(rate, 2),
            "amount": round(min_hours * rate, 2),
            "clause": "Cl 30 - Special public holidays"
        })
        ordinary_hours = min_hours
    elif is_ph == "standard":
        mult = penalties.get("public_holiday_casual", 2.75) if is_casual else penalties.get("public_holiday_ft_pt", 2.50)
        min_hours = max(total_hours, 4.0)
        rate = base_rate * mult
        components.append({
            "component": "Public Holiday",
            "quantity": round(min_hours, 2),
            "rate_mult": mult,
            "unit_rate": round(rate, 2),
            "amount": round(min_hours * rate, 2),
            "clause": "Cl 30 - Public holidays"
        })
        ordinary_hours = min_hours
    elif day == "sunday":
        mult = penalties.get("sunday_casual", 2.25) if is_casual else penalties.get("sunday_ft_pt", 2.00)
        min_hours = max(total_hours, 4.0)
        rate = base_rate * mult
        components.append({
            "component": "Sunday Work",
            "quantity": round(min_hours, 2),
            "rate_mult": mult,
            "unit_rate": round(rate, 2),
            "amount": round(min_hours * rate, 2),
            "clause": "Cl 24.3 - Sunday work"
        })
        ordinary_hours = min_hours
    elif day == "saturday":
        mult = penalties.get("saturday_casual", 1.75) if is_casual else penalties.get("saturday_ft_pt", 1.50)
        min_hours = max(total_hours, 4.0)
        rate = base_rate * mult
        components.append({
            "component": "Saturday Work",
            "quantity": round(min_hours, 2),
            "rate_mult": mult,
            "unit_rate": round(rate, 2),
            "amount": round(min_hours * rate, 2),
            "clause": "Cl 24.2 - Saturday work"
        })
        ordinary_hours = min_hours
    else:
        # Weekday — span 5:30am-6:30pm
        max_ordinary = 8.0
        weekly_hours = shift.get("hours_this_week", 0)
        remaining_ordinary = max(0, 38 - weekly_hours)
        daily_ordinary = min(total_hours, max_ordinary, remaining_ordinary)
        ordinary_hours = daily_ordinary
        ot_hours = max(0, total_hours - daily_ordinary)

        if ordinary_hours > 0:
            effective_rate = base_rate * casual_loading
            components.append({
                "component": "Ordinary Hours",
                "quantity": round(ordinary_hours, 2),
                "rate_mult": casual_loading,
                "unit_rate": round(effective_rate, 2),
                "amount": round(ordinary_hours * effective_rate, 2),
                "clause": "Cl 10 - Ordinary hours"
            })

        # RTD OT: Daily reset. Casual OT: OT rate + 10% min hourly — NO 25% casual loading
        if ot_hours > 0:
            ot_first2 = min(ot_hours, 2.0)
            ot_after2 = max(0, ot_hours - 2.0)
            if is_casual:
                # Casual OT: rate multiplier applied to base (no casual loading)
                # Cl 11.4: casual OT = OT rate + 10% of minimum hourly rate
                min_hourly = base_rate
                if ot_first2 > 0:
                    mult = penalties.get("ot_first2_ft_pt", 1.50)
                    rate = base_rate * mult + min_hourly * 0.10
                    components.append({
                        "component": "Casual OT (first 2hrs)",
                        "quantity": round(ot_first2, 2),
                        "rate_mult": mult,
                        "unit_rate": round(rate, 2),
                        "amount": round(ot_first2 * rate, 2),
                        "clause": "Cl 11.4 - Casual OT (no 25% loading)"
                    })
                if ot_after2 > 0:
                    mult = penalties.get("ot_after2_ft_pt", 2.00)
                    rate = base_rate * mult + min_hourly * 0.10
                    components.append({
                        "component": "Casual OT (after 2hrs)",
                        "quantity": round(ot_after2, 2),
                        "rate_mult": mult,
                        "unit_rate": round(rate, 2),
                        "amount": round(ot_after2 * rate, 2),
                        "clause": "Cl 11.4 - Casual OT (no 25% loading)"
                    })
            else:
                if ot_first2 > 0:
                    mult = penalties.get("ot_first2_ft_pt", 1.50)
                    rate = base_rate * mult
                    components.append({
                        "component": "Overtime (first 2hrs)",
                        "quantity": round(ot_first2, 2),
                        "rate_mult": mult,
                        "unit_rate": round(rate, 2),
                        "amount": round(ot_first2 * rate, 2),
                        "clause": "Cl 11 - Overtime first 2 hours"
                    })
                if ot_after2 > 0:
                    mult = penalties.get("ot_after2_ft_pt", 2.00)
                    rate = base_rate * mult
                    components.append({
                        "component": "Overtime (after 2hrs)",
                        "quantity": round(ot_after2, 2),
                        "rate_mult": mult,
                        "unit_rate": round(rate, 2),
                        "amount": round(ot_after2 * rate, 2),
                        "clause": "Cl 11 - Overtime after 2 hours"
                    })

    # Early morning delivery (12:01am-6am) +30%
    if shift.get("early_morning"):
        start_h = parse_time(shift["start_time"])
        if start_h < 6:
            early_hrs = min(6 - start_h, total_hours)
            mult = penalties.get("early_morning", 1.30)
            extra = base_rate * (mult - 1.0)
            components.append({
                "component": "Early Morning Delivery",
                "quantity": round(early_hrs, 2),
                "rate_mult": 0.30,
                "unit_rate": round(extra, 2),
                "amount": round(early_hrs * extra, 2),
                "clause": "Cl 19.3 - Early morning delivery"
            })

    # Break compliance
    break_warnings = check_break_compliance(total_hours, shift["unpaid_break_mins"], shift.get("meal_break_at", 0))
    warnings.extend(break_warnings)
    if any(w["type"] == "break_missed" for w in break_warnings):
        breach_hours = max(0, total_hours - 5.5)
        if breach_hours > 0:
            mult = penalties.get("missed_break", 2.00)
            rate = base_rate * mult
            components.append({
                "component": "Missed Break Penalty",
                "quantity": round(breach_hours, 2),
                "rate_mult": mult,
                "unit_rate": round(rate, 2),
                "amount": round(breach_hours * rate, 2),
                "clause": "Break breach — 200% from breach point"
            })

    # Allowances
    allowances = rates.get("allowances", {})
    if shift.get("first_aid"):
        daily = allowances.get("first_aid", 16.07) / 5
        components.append({"component": "First Aid Allowance", "quantity": 1, "rate_mult": 1, "unit_rate": round(daily, 2), "amount": round(daily, 2), "clause": "Schedule C - Allowances"})
    if shift.get("dangerous_goods"):
        dg = allowances.get("dangerous_goods", 0.54)
        components.append({"component": "Dangerous Goods", "quantity": round(total_hours, 2), "rate_mult": 1, "unit_rate": dg, "amount": round(total_hours * dg, 2), "clause": "Schedule C - Dangerous goods"})
    if shift.get("own_vehicle"):
        # Per km
        km = shift.get("km_driven", 0)
        rate_per_km = allowances.get("own_vehicle_per_km", 0.96)
        if km > 0:
            components.append({"component": "Own Vehicle Allowance", "quantity": km, "rate_mult": 1, "unit_rate": rate_per_km, "amount": round(km * rate_per_km, 2), "clause": "Schedule C - Vehicle allowance"})
    if shift.get("ot_meal") and ot_hours > 0:
        meal = allowances.get("meal_allowance", 18.48)
        components.append({"component": "OT Meal Allowance", "quantity": 1, "rate_mult": 1, "unit_rate": meal, "amount": meal, "clause": "Cl 11.5 - Meal allowance"})

    total_pay = sum(c["amount"] for c in components)
    penalty_rate = round(total_pay / total_hours, 2) if total_hours > 0 else 0

    plain_english = build_plain_english(shift, components, warnings, total_hours, ordinary_hours, ot_hours, total_pay, "MA000038")

    return {
        "total_hours": round(total_hours, 2),
        "ordinary_hours": round(ordinary_hours, 2),
        "ot_hours": round(ot_hours, 2),
        "penalty_rate": penalty_rate,
        "estimated_pay": round(total_pay, 2),
        "break_status": "Compliant" if not break_warnings else "Non-Compliant",
        "components": components,
        "warnings": warnings,
        "plain_english": plain_english,
    }


async def calculate_rtldo(shift: dict, rates: dict) -> dict:
    """Calculate pay for RTLDO Award MA000039."""
    base_rate = shift["pay_rate"]
    is_casual = shift["employment_type"] == "casual"
    payment_method = shift.get("payment_method", "cpk")
    km_driven = shift.get("km_driven", 0)

    total_hours = calc_shift_hours(shift["start_time"], shift["finish_time"], shift["unpaid_break_mins"])
    penalties = rates.get("penalty_rates", {})
    components = []
    warnings = []

    # Find CPK rate from classification
    cpk_rate = 0
    for cls in rates.get("classifications", []):
        if cls["code"] == shift["classification"]:
            cpk_rate = cls.get("cpk_rate", 0)
            break

    # Min engagement: casual 500km or 8hr
    if is_casual:
        min_km = penalties.get("min_casual_km", 500)
        min_hrs = penalties.get("min_casual_hours", 8)
        if payment_method == "cpk" and km_driven < min_km:
            warnings.append({"type": "min_engagement", "severity": "high", "message": f"Casual minimum: {min_km}km per engagement.", "clause": "Cl 10.4"})
            km_driven = min_km
        elif payment_method == "hourly" and total_hours < min_hrs:
            warnings.append({"type": "min_engagement", "severity": "high", "message": f"Casual minimum: {min_hrs}hrs per engagement.", "clause": "Cl 10.4"})
            total_hours = min_hrs

    ordinary_hours = total_hours
    ot_hours = 0

    # Main pay component
    if payment_method == "cpk":
        casual_mult = 1.25 if is_casual else 1.0
        effective_cpk = cpk_rate * casual_mult
        components.append({
            "component": "Cents Per Kilometre",
            "quantity": round(km_driven, 1),
            "rate_mult": casual_mult,
            "unit_rate": round(effective_cpk, 4),
            "amount": round(km_driven * effective_cpk, 2),
            "clause": "Cl 14 - CPK payment"
        })
    else:
        casual_mult = 1.25 if is_casual else 1.0
        effective_rate = base_rate * casual_mult
        components.append({
            "component": "Hourly Rate",
            "quantity": round(total_hours, 2),
            "rate_mult": casual_mult,
            "unit_rate": round(effective_rate, 2),
            "amount": round(total_hours * effective_rate, 2),
            "clause": "Cl 14 - Hourly payment"
        })

    # Loading/Unloading: (weekly/40) x 1.3, min 1hr L + 1hr U per trip
    if shift.get("loading_unloading") == "yes":
        lu_hours = max(shift.get("loading_hours", 0), 2.0)  # min 1hr loading + 1hr unloading
        weekly_rate = base_rate * 38  # approximate
        lu_base = weekly_rate / 40
        lu_mult = penalties.get("loading_unloading_multiplier", 1.30)
        lu_rate = lu_base * lu_mult
        if is_casual:
            lu_rate *= penalties.get("casual_lu_multiplier", 1.25)
        if shift.get("pt_non_agreed_day"):
            lu_rate *= penalties.get("pt_non_agreed_day", 1.15)
        components.append({
            "component": "Loading/Unloading",
            "quantity": round(lu_hours, 2),
            "rate_mult": round(lu_mult, 2),
            "unit_rate": round(lu_rate, 2),
            "amount": round(lu_hours * lu_rate, 2),
            "clause": "Cl 16 - Loading/Unloading (min 1hr each)"
        })

    # Delay/Breakdown: up to 8hr at weekly/40
    if shift.get("delay_breakdown") and shift.get("delay_hours", 0) > 0:
        delay_hrs = min(shift["delay_hours"], 8.0)
        weekly_rate = base_rate * 38
        delay_rate = weekly_rate / 40
        components.append({
            "component": "Delay/Breakdown",
            "quantity": round(delay_hrs, 2),
            "rate_mult": 1.0,
            "unit_rate": round(delay_rate, 2),
            "amount": round(delay_hrs * delay_rate, 2),
            "clause": "Cl 15 - Delay/Breakdown (max 8hrs)"
        })

    # Allowances
    allowances = rates.get("allowances", {})
    if shift.get("first_aid"):
        daily = allowances.get("first_aid", 16.07) / 5
        components.append({"component": "First Aid Allowance", "quantity": 1, "rate_mult": 1, "unit_rate": round(daily, 2), "amount": round(daily, 2), "clause": "Schedule C - Allowances"})
    if shift.get("dangerous_goods"):
        dg = allowances.get("dangerous_goods", 0.54)
        components.append({"component": "Dangerous Goods", "quantity": round(total_hours, 2), "rate_mult": 1, "unit_rate": dg, "amount": round(total_hours * dg, 2), "clause": "Schedule C - Dangerous goods"})

    total_pay = sum(c["amount"] for c in components)
    penalty_rate = round(total_pay / total_hours, 2) if total_hours > 0 else 0

    plain_english = build_plain_english(shift, components, warnings, total_hours, ordinary_hours, ot_hours, total_pay, "MA000039")

    return {
        "total_hours": round(total_hours, 2),
        "ordinary_hours": round(ordinary_hours, 2),
        "ot_hours": round(ot_hours, 2),
        "penalty_rate": penalty_rate,
        "estimated_pay": round(total_pay, 2),
        "break_status": "Compliant",
        "components": components,
        "warnings": warnings,
        "plain_english": plain_english,
    }


def build_plain_english(shift, components, warnings, total_hours, ordinary_hours, ot_hours, total_pay, award_code):
    emp_type_label = {"full_time": "Full-Time", "part_time": "Part-Time", "casual": "Casual"}.get(shift["employment_type"], shift["employment_type"])
    day = shift.get("day_of_week", shift.get("date", ""))
    is_ph = shift.get("is_public_holiday", "no")

    award_names = {
        "MA000002": "Clerks - Private Sector Award 2020",
        "MA000038": "Road Transport and Distribution Award 2020",
        "MA000039": "Road Transport (Long Distance Operations) Award 2020"
    }

    section_a = f"A {emp_type_label} employee ({shift.get('classification', 'N/A')}) worked a {round(total_hours, 2)}-hour shift on {day} ({shift.get('date', 'N/A')}) from {shift['start_time']} to {shift['finish_time']} under {award_names.get(award_code, award_code)}."
    if is_ph != "no":
        section_a += " This was a public holiday."
    if shift.get("km_driven", 0) > 0:
        section_a += f" They drove {shift['km_driven']}km."

    rules = []
    for c in components:
        rules.append(f"- {c['component']}: {c['clause']}")
    section_b = "The following award rules were triggered:\n" + "\n".join(rules) if rules else "No special rules triggered."

    assumptions = ["- Rate table values are from the most recent admin-configured rates."]
    if shift.get("unpaid_break_mins", 0) > 0:
        assumptions.append(f"- {shift['unpaid_break_mins']} minutes unpaid break was taken as recorded.")
    if shift.get("is_junior"):
        assumptions.append(f"- Junior rate applied for age {shift.get('age', 'N/A')}.")
    section_c = "Assumptions:\n" + "\n".join(assumptions)

    section_d = f"Estimated shift entitlement: ${round(total_pay, 2):,.2f} (effective rate: ${round(total_pay / total_hours, 2) if total_hours > 0 else 0}/hr). Ordinary: {round(ordinary_hours, 2)}hrs, Overtime: {round(ot_hours, 2)}hrs."

    review_items = []
    for w in warnings:
        review_items.append(f"- [{w['severity'].upper()}] {w['message']}")
    if not review_items:
        review_items.append("- No items require additional review.")
    section_e = "Items for review:\n" + "\n".join(review_items)

    return {
        "section_a": section_a,
        "section_b": section_b,
        "section_c": section_c,
        "section_d": section_d,
        "section_e": section_e,
    }


# ─── Calculation Endpoint ───

@api_router.post("/calculate")
async def calculate_shift(shift: ShiftInput):
    shift_dict = shift.model_dump()
    award_code = shift_dict["award_code"]

    rates_doc = await db.rate_tables.find_one({"award_code": award_code}, {"_id": 0})
    if not rates_doc:
        if award_code in DEFAULT_RATES:
            rates_doc = DEFAULT_RATES[award_code]
        else:
            raise HTTPException(400, f"Unknown award: {award_code}")

    if award_code == "MA000002":
        result = await calculate_clerks(shift_dict, rates_doc)
    elif award_code == "MA000038":
        result = await calculate_rtd(shift_dict, rates_doc)
    elif award_code == "MA000039":
        result = await calculate_rtldo(shift_dict, rates_doc)
    else:
        raise HTTPException(400, f"Unknown award: {award_code}")

    # Save to audit trail
    await log_audit(
        shift_dict.get("employee_id", "UNKNOWN"),
        award_code,
        shift_dict.get("date", ""),
        "CALCULATION",
        result["estimated_pay"],
        result["components"],
        result["plain_english"]
    )

    return result


# ─── Audit Trail ───

async def log_audit(employee_id, award_code, shift_date, action, total_pay, components, plain_english):
    entry = {
        "id": str(uuid.uuid4()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "employee_id": employee_id,
        "award_code": award_code,
        "shift_date": shift_date,
        "action": action,
        "total_pay": total_pay,
        "components": components,
        "plain_english": plain_english,
    }
    await db.audit_trail.insert_one(entry)

@api_router.get("/audit-trail")
async def get_audit_trail():
    entries = await db.audit_trail.find({}, {"_id": 0}).sort("timestamp", -1).to_list(500)
    return entries

@api_router.get("/audit-trail/csv")
async def export_audit_csv():
    entries = await db.audit_trail.find({}, {"_id": 0}).sort("timestamp", -1).to_list(5000)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Timestamp", "Employee ID", "Award", "Shift Date", "Action", "Total Pay", "Components"])
    for e in entries:
        comp_str = "; ".join([f"{c.get('component','')}: ${c.get('amount',0)}" for c in e.get("components", [])])
        writer.writerow([e.get("timestamp",""), e.get("employee_id",""), e.get("award_code",""), e.get("shift_date",""), e.get("action",""), e.get("total_pay",0), comp_str])
    csv_content = output.getvalue()
    return Response(content=csv_content, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=audit_trail.csv"})

@api_router.delete("/audit-trail")
async def clear_audit_trail():
    await db.audit_trail.delete_many({})
    return {"status": "cleared"}


# ─── Batch Calculation ───

class BatchShiftItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    employee_id: str = ""
    award_code: str = ""
    employment_type: str = "full_time"
    classification: str = ""
    pay_rate: float = 0.0
    date: str = ""
    day_of_week: str = ""
    is_public_holiday: str = "no"
    start_time: str = "08:00"
    finish_time: str = "16:00"
    unpaid_break_mins: int = 0
    meal_break_at: int = 0
    hours_this_week: float = 0.0
    first_aid: bool = False
    dangerous_goods: bool = False
    ot_meal: bool = False
    early_morning: bool = False
    own_vehicle: bool = False
    km_driven: float = 0.0
    loading_unloading: str = "no"
    loading_hours: float = 0.0
    delay_breakdown: bool = False
    delay_hours: float = 0.0
    shiftwork: str = "none"
    payment_method: str = "hourly"
    is_junior: bool = False
    age: int = 21
    pt_non_agreed_day: bool = False
    fatigue_plan: bool = False
    notes: str = ""

class BatchRequest(BaseModel):
    shifts: List[BatchShiftItem]

@api_router.post("/batch-calculate")
async def batch_calculate(batch: BatchRequest):
    results = []
    total_pay = 0
    total_hours = 0
    total_ot = 0
    errors = []

    for idx, shift_item in enumerate(batch.shifts):
        shift_dict = shift_item.model_dump()
        award_code = shift_dict.get("award_code", "")

        # Look up rate if pay_rate is 0
        if shift_dict.get("pay_rate", 0) == 0 and shift_dict.get("classification"):
            rates_doc = await db.rate_tables.find_one({"award_code": award_code}, {"_id": 0})
            if rates_doc:
                for cls in rates_doc.get("classifications", []):
                    if cls["code"] == shift_dict["classification"]:
                        shift_dict["pay_rate"] = cls["hourly_rate"]
                        break

        if not shift_dict.get("pay_rate"):
            errors.append({"row": idx + 1, "error": f"No pay rate found for {shift_dict.get('classification', 'unknown')} under {award_code}"})
            continue

        try:
            rates_doc = await db.rate_tables.find_one({"award_code": award_code}, {"_id": 0})
            if not rates_doc:
                rates_doc = DEFAULT_RATES.get(award_code)
            if not rates_doc:
                errors.append({"row": idx + 1, "error": f"Unknown award: {award_code}"})
                continue

            if award_code == "MA000002":
                result = await calculate_clerks(shift_dict, rates_doc)
            elif award_code == "MA000038":
                result = await calculate_rtd(shift_dict, rates_doc)
            elif award_code == "MA000039":
                result = await calculate_rtldo(shift_dict, rates_doc)
            else:
                errors.append({"row": idx + 1, "error": f"Unsupported award: {award_code}"})
                continue

            result["row"] = idx + 1
            result["employee_id"] = shift_dict.get("employee_id", "")
            result["date"] = shift_dict.get("date", "")
            result["award_code"] = award_code
            results.append(result)

            total_pay += result["estimated_pay"]
            total_hours += result["total_hours"]
            total_ot += result["ot_hours"]

            await log_audit(
                shift_dict.get("employee_id", "BATCH"),
                award_code,
                shift_dict.get("date", ""),
                "BATCH_CALC",
                result["estimated_pay"],
                result["components"],
                result["plain_english"]
            )
        except Exception as e:
            logger.error(f"Batch row {idx+1} error: {e}")
            errors.append({"row": idx + 1, "error": str(e)})

    return {
        "results": results,
        "errors": errors,
        "summary": {
            "total_shifts": len(batch.shifts),
            "successful": len(results),
            "failed": len(errors),
            "total_pay": round(total_pay, 2),
            "total_hours": round(total_hours, 2),
            "total_ot_hours": round(total_ot, 2),
        }
    }

@api_router.get("/batch-template/csv")
async def batch_template_csv():
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "employee_id", "award_code", "employment_type", "classification",
        "pay_rate", "date", "day_of_week", "is_public_holiday",
        "start_time", "finish_time", "unpaid_break_mins",
        "hours_this_week", "first_aid", "dangerous_goods",
        "ot_meal", "early_morning", "shiftwork", "payment_method",
        "km_driven", "loading_unloading", "loading_hours", "notes"
    ])
    # Example rows
    writer.writerow([
        "EMP-001", "MA000002", "full_time", "L1Y1",
        "25.74", "2025-07-14", "Monday", "no",
        "08:00", "16:30", "30",
        "0", "false", "false",
        "false", "false", "none", "hourly",
        "0", "no", "0", "Regular weekday shift"
    ])
    writer.writerow([
        "EMP-002", "MA000038", "casual", "G3",
        "26.32", "2025-07-15", "Tuesday", "no",
        "05:00", "15:00", "30",
        "0", "false", "true",
        "false", "true", "none", "hourly",
        "0", "no", "0", "Early morning casual shift"
    ])
    writer.writerow([
        "EMP-003", "MA000039", "full_time", "G5",
        "40.52", "2025-07-16", "Wednesday", "no",
        "06:00", "18:00", "60",
        "0", "false", "false",
        "false", "false", "none", "cpk",
        "650", "yes", "2.5", "Long haul Sydney-Melbourne"
    ])
    csv_content = output.getvalue()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=batch_shift_template.csv"}
    )


# ─── Health Check ───

@api_router.get("/health")
async def health():
    return {"status": "healthy", "version": "2.0.0"}


# ─── Roster Templates ───

class RosterShift(BaseModel):
    day_of_week: str = "Monday"
    start_time: str = "08:00"
    finish_time: str = "16:30"
    unpaid_break_mins: int = 30
    notes: str = ""

class RosterTemplate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    award_code: str
    employment_type: str = "full_time"
    classification: str = ""
    shifts: List[Dict[str, Any]] = []
    created_at: str = ""

@api_router.get("/roster-templates")
async def get_roster_templates():
    return await db.roster_templates.find({}, {"_id": 0}).to_list(100)

@api_router.post("/roster-templates")
async def create_roster_template(tpl: RosterTemplate):
    doc = tpl.model_dump()
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.roster_templates.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}

@api_router.put("/roster-templates/{tpl_id}")
async def update_roster_template(tpl_id: str, body: Dict[str, Any]):
    body.pop("_id", None)
    body.pop("id", None)
    await db.roster_templates.update_one({"id": tpl_id}, {"$set": body})
    return await db.roster_templates.find_one({"id": tpl_id}, {"_id": 0})

@api_router.delete("/roster-templates/{tpl_id}")
async def delete_roster_template(tpl_id: str):
    await db.roster_templates.delete_one({"id": tpl_id})
    return {"status": "deleted"}

@api_router.post("/roster-templates/{tpl_id}/generate")
async def generate_from_roster(tpl_id: str, body: Dict[str, Any]):
    tpl = await db.roster_templates.find_one({"id": tpl_id}, {"_id": 0})
    if not tpl:
        raise HTTPException(404, "Template not found")
    week_start = body.get("week_start", "")
    employee_id = body.get("employee_id", "")
    if not week_start:
        raise HTTPException(400, "week_start required (YYYY-MM-DD)")
    from datetime import timedelta
    base = datetime.strptime(week_start, "%Y-%m-%d")
    day_map = {"Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3, "Friday": 4, "Saturday": 5, "Sunday": 6}
    # Look up pay rate
    pay_rate = 0
    rates_doc = await db.rate_tables.find_one({"award_code": tpl["award_code"]}, {"_id": 0})
    if rates_doc:
        for cls in rates_doc.get("classifications", []):
            if cls["code"] == tpl.get("classification", ""):
                pay_rate = cls["hourly_rate"]
                break
    generated = []
    for s in tpl.get("shifts", []):
        day_offset = day_map.get(s.get("day_of_week", "Monday"), 0)
        shift_date = base + timedelta(days=day_offset)
        generated.append({
            "employee_id": employee_id or "ROSTER",
            "award_code": tpl["award_code"],
            "employment_type": tpl.get("employment_type", "full_time"),
            "classification": tpl.get("classification", ""),
            "pay_rate": pay_rate,
            "date": shift_date.strftime("%Y-%m-%d"),
            "day_of_week": s.get("day_of_week", "Monday"),
            "start_time": s.get("start_time", "08:00"),
            "finish_time": s.get("finish_time", "16:30"),
            "unpaid_break_mins": s.get("unpaid_break_mins", 30),
            "notes": s.get("notes", ""),
        })
    return {"shifts": generated, "template_name": tpl["name"]}


# ─── Shifts CRUD (for calendar) ───

@api_router.post("/shifts")
async def save_shift(body: Dict[str, Any]):
    body["id"] = body.get("id", str(uuid.uuid4()))
    body["saved_at"] = datetime.now(timezone.utc).isoformat()
    body.pop("_id", None)
    await db.shifts.insert_one(body)
    return {k: v for k, v in body.items() if k != "_id"}

@api_router.get("/shifts")
async def get_shifts(employee_id: str = "", month: str = ""):
    query = {}
    if employee_id:
        query["employee_id"] = employee_id
    if month:
        query["date"] = {"$regex": f"^{month}"}
    return await db.shifts.find(query, {"_id": 0}).sort("date", 1).to_list(1000)

@api_router.delete("/shifts/{shift_id}")
async def delete_shift(shift_id: str):
    await db.shifts.delete_one({"id": shift_id})
    return {"status": "deleted"}


# ─── Weekly OT Tracking ───

@api_router.get("/weekly-ot")
async def get_weekly_ot(employee_id: str = "", week_start: str = ""):
    if not week_start:
        raise HTTPException(400, "week_start required (YYYY-MM-DD)")
    from datetime import timedelta
    base = datetime.strptime(week_start, "%Y-%m-%d")
    week_end = base + timedelta(days=6)
    query = {"shift_date": {"$gte": week_start, "$lte": week_end.strftime("%Y-%m-%d")}, "action": {"$in": ["CALCULATION", "BATCH_CALC"]}}
    if employee_id:
        query["employee_id"] = employee_id
    entries = await db.audit_trail.find(query, {"_id": 0}).sort("shift_date", 1).to_list(500)
    by_employee = {}
    for e in entries:
        eid = e.get("employee_id", "UNKNOWN")
        if eid not in by_employee:
            by_employee[eid] = {"employee_id": eid, "shifts": [], "total_hours": 0, "total_ot": 0, "total_pay": 0, "award_code": e.get("award_code", "")}
        total_hrs = sum(c.get("quantity", 0) for c in e.get("components", []) if "Ordinary" in c.get("component", "") or "Hour" in c.get("component", ""))
        ot_hrs = sum(c.get("quantity", 0) for c in e.get("components", []) if "Overtime" in c.get("component", "") or "OT" in c.get("component", ""))
        if total_hrs == 0:
            total_hrs = sum(c.get("quantity", 0) for c in e.get("components", []))
        by_employee[eid]["shifts"].append({
            "date": e.get("shift_date", ""),
            "total_pay": e.get("total_pay", 0),
            "hours": round(total_hrs, 2),
            "ot_hours": round(ot_hrs, 2),
        })
        by_employee[eid]["total_hours"] += total_hrs
        by_employee[eid]["total_ot"] += ot_hrs
        by_employee[eid]["total_pay"] += e.get("total_pay", 0)
    for eid in by_employee:
        by_employee[eid]["total_hours"] = round(by_employee[eid]["total_hours"], 2)
        by_employee[eid]["total_ot"] = round(by_employee[eid]["total_ot"], 2)
        by_employee[eid]["total_pay"] = round(by_employee[eid]["total_pay"], 2)
        by_employee[eid]["weekly_threshold"] = 38
        by_employee[eid]["ot_triggered"] = by_employee[eid]["total_hours"] > 38
    return {"week_start": week_start, "week_end": week_end.strftime("%Y-%m-%d"), "employees": list(by_employee.values())}


# ─── Annualised Salary Reconciliation ───

class AnnualisedInput(BaseModel):
    employee_id: str
    award_code: str
    classification: str
    annual_salary: float
    hours_per_week: float = 38
    weeks_worked: int = 52
    shifts: List[Dict[str, Any]] = []

@api_router.post("/annualised-reconcile")
async def annualised_reconcile(data: AnnualisedInput):
    d = data.model_dump()
    annual_salary = d["annual_salary"]
    weeks = d["weeks_worked"]
    weekly_salary = annual_salary / weeks
    hourly_equiv = weekly_salary / d["hours_per_week"]
    # Look up award rate
    rates_doc = await db.rate_tables.find_one({"award_code": d["award_code"]}, {"_id": 0})
    award_rate = 0
    if rates_doc:
        for cls in rates_doc.get("classifications", []):
            if cls["code"] == d["classification"]:
                award_rate = cls["hourly_rate"]
                break
    award_annual = award_rate * d["hours_per_week"] * weeks
    # Calculate total entitlement from provided shifts
    total_award_entitlement = 0
    if d.get("shifts"):
        for s in d["shifts"]:
            s["award_code"] = d["award_code"]
            s["employment_type"] = s.get("employment_type", "full_time")
            s["classification"] = d["classification"]
            s["pay_rate"] = award_rate
            try:
                r_doc = rates_doc or DEFAULT_RATES.get(d["award_code"], {})
                if d["award_code"] == "MA000002":
                    res = await calculate_clerks(s, r_doc)
                elif d["award_code"] == "MA000038":
                    res = await calculate_rtd(s, r_doc)
                else:
                    res = await calculate_rtldo(s, r_doc)
                total_award_entitlement += res["estimated_pay"]
            except Exception:
                pass
    shortfall = max(0, award_annual - annual_salary)
    surplus = max(0, annual_salary - award_annual)
    return {
        "annual_salary": annual_salary,
        "hourly_equivalent": round(hourly_equiv, 2),
        "award_base_rate": award_rate,
        "award_base_annual": round(award_annual, 2),
        "difference": round(annual_salary - award_annual, 2),
        "status": "COMPLIANT" if annual_salary >= award_annual else "UNDERPAYMENT_RISK",
        "shortfall": round(shortfall, 2),
        "surplus": round(surplus, 2),
        "total_shift_entitlement": round(total_award_entitlement, 2) if total_award_entitlement > 0 else None,
        "note": "Annualised salary must not result in employee receiving less than award entitlements over the reconciliation period."
    }


# ─── Rate Alerts ───

@api_router.get("/rate-alerts")
async def check_rate_alerts():
    alerts = []
    stored = await db.rate_tables.find({}, {"_id": 0}).to_list(10)
    for table in stored:
        updated = table.get("updated_at", "")
        if updated:
            updated_dt = datetime.fromisoformat(updated.replace("Z", "+00:00")) if updated else None
            if updated_dt:
                age_days = (datetime.now(timezone.utc) - updated_dt).days
                if age_days > 365:
                    alerts.append({
                        "award_code": table["award_code"],
                        "award_name": table.get("award_name", ""),
                        "severity": "high",
                        "message": f"Rate table last updated {age_days} days ago. Fair Work rates update annually (1 July). Review and update rates.",
                        "last_updated": updated,
                        "days_since_update": age_days,
                    })
                elif age_days > 180:
                    alerts.append({
                        "award_code": table["award_code"],
                        "award_name": table.get("award_name", ""),
                        "severity": "medium",
                        "message": f"Rate table is {age_days} days old. Consider checking for updates.",
                        "last_updated": updated,
                        "days_since_update": age_days,
                    })
        # Check against defaults for drift
        default = DEFAULT_RATES.get(table["award_code"])
        if default:
            for cls in table.get("classifications", []):
                default_cls = next((c for c in default["classifications"] if c["code"] == cls["code"]), None)
                if default_cls and abs(cls["hourly_rate"] - default_cls["hourly_rate"]) > 0.01:
                    alerts.append({
                        "award_code": table["award_code"],
                        "severity": "info",
                        "message": f"{cls['code']}: Custom rate ${cls['hourly_rate']:.2f} differs from default ${default_cls['hourly_rate']:.2f}",
                        "classification": cls["code"],
                        "current_rate": cls["hourly_rate"],
                        "default_rate": default_cls["hourly_rate"],
                    })
    return {"alerts": alerts, "total": len(alerts)}

@api_router.post("/rate-alerts/reset-defaults/{award_code}")
async def reset_rate_defaults(award_code: str):
    if award_code not in DEFAULT_RATES:
        raise HTTPException(404, "Award not found")
    default = DEFAULT_RATES[award_code].copy()
    default["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.rate_tables.update_one({"award_code": award_code}, {"$set": default}, upsert=True)
    return {"status": "reset", "award_code": award_code}


# ─── NES Leave Calculator ───

class LeaveInput(BaseModel):
    employment_type: str = "full_time"
    hours_per_week: float = 38
    years_of_service: float = 1.0
    hourly_rate: float = 25.74
    leave_taken_hours: float = 0
    personal_leave_taken: float = 0

@api_router.post("/leave-calculate")
async def calculate_leave(data: LeaveInput):
    d = data.model_dump()
    emp_type = d["employment_type"]
    hrs_week = d["hours_per_week"]
    years = d["years_of_service"]
    rate = d["hourly_rate"]
    # NES: 4 weeks annual leave (FT/PT), 10 days personal leave
    if emp_type == "casual":
        return {
            "annual_leave": {"hours_accrued": 0, "hours_remaining": 0, "value": 0, "note": "Casual employees receive 25% loading in lieu of leave."},
            "personal_leave": {"hours_accrued": 0, "hours_remaining": 0, "value": 0, "note": "Casual employees not entitled to personal leave."},
            "long_service_leave": {"hours_accrued": 0, "value": 0, "note": "LSL varies by state. Typically after 7-10 years."},
        }
    annual_weeks = 4
    annual_hrs_year = annual_weeks * hrs_week
    annual_accrued = annual_hrs_year * years
    annual_remaining = max(0, annual_accrued - d["leave_taken_hours"])
    personal_hrs_year = (10 / 5) * hrs_week  # 10 days = 2 weeks
    personal_accrued = personal_hrs_year * years
    personal_remaining = max(0, personal_accrued - d["personal_leave_taken"])
    # LSL: ~8.67 weeks after 10 years (varies by state, using common)
    lsl_weeks = 0
    if years >= 7:
        lsl_weeks = (years / 10) * 8.67
    lsl_hrs = lsl_weeks * hrs_week
    return {
        "annual_leave": {
            "weeks_per_year": annual_weeks,
            "hours_accrued": round(annual_accrued, 1),
            "hours_remaining": round(annual_remaining, 1),
            "value": round(annual_remaining * rate, 2),
            "note": "4 weeks (FT/PT) per year under NES s87."
        },
        "personal_leave": {
            "days_per_year": 10,
            "hours_accrued": round(personal_accrued, 1),
            "hours_remaining": round(personal_remaining, 1),
            "value": round(personal_remaining * rate, 2),
            "note": "10 days per year (cumulative) under NES s96."
        },
        "long_service_leave": {
            "eligible": years >= 7,
            "years_required": 7,
            "hours_accrued": round(lsl_hrs, 1),
            "value": round(lsl_hrs * rate, 2),
            "note": "LSL varies by state/territory. Typically 8.67 weeks after 10 years of continuous service."
        },
        "summary": {
            "total_leave_value": round(annual_remaining * rate + personal_remaining * rate + lsl_hrs * rate, 2),
            "employment_type": emp_type,
            "years_of_service": years,
        }
    }


# ─── Analytics ───

@api_router.get("/analytics/summary")
async def analytics_summary():
    total_calcs = await db.audit_trail.count_documents({"action": {"$in": ["CALCULATION", "BATCH_CALC"]}})
    total_employees = await db.employees.count_documents({})
    # Pay by award
    pipeline = [
        {"$match": {"action": {"$in": ["CALCULATION", "BATCH_CALC"]}}},
        {"$group": {"_id": "$award_code", "total_pay": {"$sum": "$total_pay"}, "count": {"$sum": 1}}},
    ]
    by_award = await db.audit_trail.aggregate(pipeline).to_list(10)
    # Recent calculations
    recent = await db.audit_trail.find({"action": {"$in": ["CALCULATION", "BATCH_CALC"]}}, {"_id": 0}).sort("timestamp", -1).to_list(10)
    # Top employees by pay
    emp_pipeline = [
        {"$match": {"action": {"$in": ["CALCULATION", "BATCH_CALC"]}}},
        {"$group": {"_id": "$employee_id", "total_pay": {"$sum": "$total_pay"}, "shift_count": {"$sum": 1}}},
        {"$sort": {"total_pay": -1}},
        {"$limit": 10}
    ]
    top_employees = await db.audit_trail.aggregate(emp_pipeline).to_list(10)
    return {
        "total_calculations": total_calcs,
        "total_employees": total_employees,
        "by_award": [{"award_code": a["_id"], "total_pay": round(a["total_pay"], 2), "count": a["count"]} for a in by_award],
        "recent_calculations": recent[:10],
        "top_employees": [{"employee_id": e["_id"], "total_pay": round(e["total_pay"], 2), "shift_count": e["shift_count"]} for e in top_employees],
    }

@api_router.get("/analytics/trends")
async def analytics_trends():
    pipeline = [
        {"$match": {"action": {"$in": ["CALCULATION", "BATCH_CALC"]}}},
        {"$addFields": {"date_part": {"$substr": ["$shift_date", 0, 7]}}},
        {"$group": {"_id": "$date_part", "total_pay": {"$sum": "$total_pay"}, "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}},
        {"$limit": 24}
    ]
    monthly = await db.audit_trail.aggregate(pipeline).to_list(24)
    # By day of week
    dow_pipeline = [
        {"$match": {"action": {"$in": ["CALCULATION", "BATCH_CALC"]}}},
        {"$group": {"_id": "$shift_date", "total_pay": {"$sum": "$total_pay"}, "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    daily = await db.audit_trail.aggregate(dow_pipeline).to_list(100)
    return {
        "monthly": [{"month": m["_id"], "total_pay": round(m["total_pay"], 2), "count": m["count"]} for m in monthly],
        "daily": [{"date": d["_id"], "total_pay": round(d["total_pay"], 2), "count": d["count"]} for d in daily],
    }


# ─── Comparison Tool ───

class ComparisonRequest(BaseModel):
    base_shift: Dict[str, Any]
    scenarios: List[Dict[str, Any]]

@api_router.post("/compare")
async def compare_scenarios(data: ComparisonRequest):
    d = data.model_dump()
    base = d["base_shift"]
    results = []
    # Calculate base
    base["award_code"] = base.get("award_code", "MA000002")
    rates_doc = await db.rate_tables.find_one({"award_code": base["award_code"]}, {"_id": 0})
    if not rates_doc:
        rates_doc = DEFAULT_RATES.get(base["award_code"], {})
    if not base.get("pay_rate") and base.get("classification"):
        for cls in rates_doc.get("classifications", []):
            if cls["code"] == base["classification"]:
                base["pay_rate"] = cls["hourly_rate"]
                break
    try:
        if base["award_code"] == "MA000002":
            base_result = await calculate_clerks(base, rates_doc)
        elif base["award_code"] == "MA000038":
            base_result = await calculate_rtd(base, rates_doc)
        else:
            base_result = await calculate_rtldo(base, rates_doc)
        results.append({"label": "Base Scenario", "is_base": True, **base_result})
    except Exception as e:
        return {"error": f"Base calculation failed: {str(e)}"}
    # Calculate scenarios
    for i, scenario in enumerate(d["scenarios"]):
        merged = {**base, **scenario}
        merged["award_code"] = merged.get("award_code", base["award_code"])
        s_rates = await db.rate_tables.find_one({"award_code": merged["award_code"]}, {"_id": 0})
        if not s_rates:
            s_rates = DEFAULT_RATES.get(merged["award_code"], {})
        if not merged.get("pay_rate") and merged.get("classification"):
            for cls in s_rates.get("classifications", []):
                if cls["code"] == merged["classification"]:
                    merged["pay_rate"] = cls["hourly_rate"]
                    break
        try:
            if merged["award_code"] == "MA000002":
                s_result = await calculate_clerks(merged, s_rates)
            elif merged["award_code"] == "MA000038":
                s_result = await calculate_rtd(merged, s_rates)
            else:
                s_result = await calculate_rtldo(merged, s_rates)
            diff = round(s_result["estimated_pay"] - base_result["estimated_pay"], 2)
            pct = round((diff / base_result["estimated_pay"]) * 100, 1) if base_result["estimated_pay"] > 0 else 0
            results.append({"label": scenario.get("label", f"Scenario {i+1}"), "is_base": False, "diff": diff, "diff_pct": pct, **s_result})
        except Exception as e:
            results.append({"label": scenario.get("label", f"Scenario {i+1}"), "error": str(e)})
    return {"results": results}


# ─── Bulk Employee Import ───

class BulkEmployeeRequest(BaseModel):
    employees: List[Dict[str, Any]]

@api_router.post("/employees/bulk-import")
async def bulk_import_employees(data: BulkEmployeeRequest):
    imported = 0
    errors = []
    for i, emp in enumerate(data.employees):
        try:
            emp["id"] = emp.get("id", str(uuid.uuid4()))
            emp["created_at"] = datetime.now(timezone.utc).isoformat()
            emp.pop("_id", None)
            # Auto look up pay rate
            if not emp.get("pay_rate") and emp.get("classification") and emp.get("award_code"):
                rates_doc = await db.rate_tables.find_one({"award_code": emp["award_code"]}, {"_id": 0})
                if rates_doc:
                    for cls in rates_doc.get("classifications", []):
                        if cls["code"] == emp["classification"]:
                            emp["pay_rate"] = cls["hourly_rate"]
                            break
            await db.employees.insert_one(emp)
            imported += 1
        except Exception as e:
            errors.append({"row": i + 1, "error": str(e)})
    return {"imported": imported, "errors": errors, "total": len(data.employees)}

@api_router.get("/employees/bulk-template/csv")
async def employee_template_csv():
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["employee_id", "employing_entity", "award_code", "employment_type", "classification", "pay_rate", "shiftwork", "payment_method"])
    writer.writerow(["EMP-001", "Acme Pty Ltd", "MA000002", "full_time", "L1Y1", "25.74", "none", "hourly"])
    writer.writerow(["EMP-002", "Acme Pty Ltd", "MA000038", "casual", "G3", "26.32", "none", "hourly"])
    writer.writerow(["EMP-003", "Haulage Co", "MA000039", "full_time", "G5", "40.52", "none", "cpk"])
    return Response(content=output.getvalue(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=employee_template.csv"})


# ─── Payroll Export ───

@api_router.post("/payroll-export/{format_type}")
async def payroll_export(format_type: str, body: Dict[str, Any]):
    shift_ids = body.get("audit_ids", [])
    date_from = body.get("date_from", "")
    date_to = body.get("date_to", "")
    query = {"action": {"$in": ["CALCULATION", "BATCH_CALC"]}}
    if date_from and date_to:
        query["shift_date"] = {"$gte": date_from, "$lte": date_to}
    entries = await db.audit_trail.find(query, {"_id": 0}).sort("shift_date", 1).to_list(5000)
    output = io.StringIO()
    writer = csv.writer(output)
    if format_type == "myob":
        writer.writerow(["Co./Last Name", "First Name", "Pay Date", "Hours", "Rate", "Amount", "Pay Item", "Notes"])
        for e in entries:
            for c in e.get("components", []):
                writer.writerow([e.get("employee_id", ""), "", e.get("shift_date", ""), c.get("quantity", 0), c.get("unit_rate", 0), c.get("amount", 0), c.get("component", ""), c.get("clause", "")])
    elif format_type == "xero":
        writer.writerow(["EmployeeID", "PayRunDate", "EarningsType", "Hours", "Rate", "Amount", "Description"])
        for e in entries:
            for c in e.get("components", []):
                earnings_type = "Ordinary" if "Ordinary" in c.get("component", "") else "Overtime" if "OT" in c.get("component", "") or "Overtime" in c.get("component", "") else "Allowance" if "Allowance" in c.get("component", "") else "Penalty"
                writer.writerow([e.get("employee_id", ""), e.get("shift_date", ""), earnings_type, c.get("quantity", 0), c.get("unit_rate", 0), c.get("amount", 0), c.get("component", "")])
    else:  # keypay / generic
        writer.writerow(["EmployeeID", "Award", "Date", "Component", "Hours", "RateMultiplier", "UnitRate", "Amount", "Clause"])
        for e in entries:
            for c in e.get("components", []):
                writer.writerow([e.get("employee_id", ""), e.get("award_code", ""), e.get("shift_date", ""), c.get("component", ""), c.get("quantity", 0), c.get("rate_mult", 1), c.get("unit_rate", 0), c.get("amount", 0), c.get("clause", "")])
    filename = f"payroll_export_{format_type}_{datetime.now(timezone.utc).strftime('%Y%m%d')}.csv"
    return Response(content=output.getvalue(), media_type="text/csv", headers={"Content-Disposition": f"attachment; filename={filename}"})


# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
