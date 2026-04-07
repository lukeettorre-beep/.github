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


# ─── Health Check ───

@api_router.get("/health")
async def health():
    return {"status": "healthy", "version": "1.0.0"}


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
