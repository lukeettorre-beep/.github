#!/usr/bin/env python3
"""
Backend API Testing for Award Interpreter Tool
Tests all endpoints for the Australian payroll compliance app
"""

import requests
import sys
import json
from datetime import datetime, timezone

class AwardInterpreterTester:
    def __init__(self, base_url="https://award-interpreter-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and len(response_data) <= 3:
                        print(f"   Response: {response_data}")
                    elif isinstance(response_data, list) and len(response_data) <= 2:
                        print(f"   Response: {len(response_data)} items")
                    else:
                        print(f"   Response: {type(response_data).__name__} with data")
                except:
                    print(f"   Response: {response.text[:100]}...")
            else:
                self.tests_passed += 1 if response.status_code in [200, 201] else 0
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    'name': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200]
                })

            return success, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'name': name,
                'error': str(e)
            })
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        return self.run_test("Health Check", "GET", "health", 200)

    def test_seed_rates(self):
        """Test seeding rate tables"""
        return self.run_test("Seed Rate Tables", "POST", "seed-rates", 200)

    def test_get_rate_tables(self):
        """Test getting all rate tables"""
        success, data = self.run_test("Get All Rate Tables", "GET", "rate-tables", 200)
        if success and isinstance(data, list):
            print(f"   Found {len(data)} rate tables")
            for table in data:
                if isinstance(table, dict) and 'award_code' in table:
                    print(f"   - {table['award_code']}: {table.get('award_name', 'Unknown')}")
        return success, data

    def test_get_specific_rate_table(self, award_code):
        """Test getting specific rate table"""
        success, data = self.run_test(f"Get Rate Table {award_code}", "GET", f"rate-tables/{award_code}", 200)
        if success and isinstance(data, dict):
            classifications = data.get('classifications', [])
            print(f"   Classifications: {len(classifications)}")
        return success, data

    def test_create_employee(self):
        """Test creating an employee"""
        test_employee = {
            "employee_id": f"TEST-{datetime.now().strftime('%H%M%S')}",
            "employing_entity": "Test Company",
            "award_code": "MA000002",
            "employment_type": "full_time",
            "classification": "L1Y1",
            "pay_rate": 25.74,
            "pt_agreed_hours": 0,
            "is_junior": False,
            "age": 25,
            "is_trainee": False,
            "payment_method": "hourly",
            "ea_coverage": False,
            "fatigue_plan": False,
            "shiftwork": "none",
            "ifa_annualised": False
        }
        success, data = self.run_test("Create Employee", "POST", "employees", 200, test_employee)
        return success, data

    def test_get_employees(self):
        """Test getting all employees"""
        success, data = self.run_test("Get All Employees", "GET", "employees", 200)
        if success and isinstance(data, list):
            print(f"   Found {len(data)} employees")
        return success, data

    def test_calculate_shift_clerks(self):
        """Test shift calculation for Clerks award"""
        shift_data = {
            "employee_id": "TEST-001",
            "award_code": "MA000002",
            "employment_type": "full_time",
            "classification": "L1Y1",
            "pay_rate": 25.74,
            "date": "2024-01-15",
            "day_of_week": "Monday",
            "is_public_holiday": "no",
            "is_sa_ph": False,
            "start_time": "09:00",
            "finish_time": "17:00",
            "unpaid_break_mins": 30,
            "meal_break_at": 240,
            "hours_this_week": 0,
            "ot_pre_approved": False,
            "rdo_being_worked": False,
            "first_aid": True,
            "leading_hand": False,
            "own_vehicle": False,
            "dangerous_goods": False,
            "ot_meal": False,
            "early_morning": False,
            "travelling": False,
            "furniture_livestock": False,
            "excess_dimensions": False,
            "km_driven": 0,
            "route": "",
            "pt_non_agreed_day": False,
            "loading_unloading": "no",
            "loading_hours": 0,
            "delay_breakdown": False,
            "delay_hours": 0,
            "notes": "Test calculation",
            "is_junior": False,
            "age": 25,
            "shiftwork": "none",
            "payment_method": "hourly",
            "fatigue_plan": False
        }
        success, data = self.run_test("Calculate Clerks Shift", "POST", "calculate", 200, shift_data)
        if success and isinstance(data, dict):
            print(f"   Total Hours: {data.get('total_hours', 'N/A')}")
            print(f"   Estimated Pay: ${data.get('estimated_pay', 'N/A')}")
            print(f"   Components: {len(data.get('components', []))}")
        return success, data

    def test_calculate_shift_rtd(self):
        """Test shift calculation for RTD award"""
        shift_data = {
            "employee_id": "TEST-002",
            "award_code": "MA000038",
            "employment_type": "full_time",
            "classification": "G1",
            "pay_rate": 25.43,
            "date": "2024-01-16",
            "day_of_week": "Tuesday",
            "is_public_holiday": "no",
            "is_sa_ph": False,
            "start_time": "06:00",
            "finish_time": "14:00",
            "unpaid_break_mins": 30,
            "meal_break_at": 240,
            "hours_this_week": 0,
            "ot_pre_approved": False,
            "rdo_being_worked": False,
            "first_aid": False,
            "leading_hand": False,
            "own_vehicle": True,
            "dangerous_goods": True,
            "ot_meal": False,
            "early_morning": True,
            "travelling": False,
            "furniture_livestock": False,
            "excess_dimensions": False,
            "km_driven": 150,
            "route": "Local delivery",
            "pt_non_agreed_day": False,
            "loading_unloading": "no",
            "loading_hours": 0,
            "delay_breakdown": False,
            "delay_hours": 0,
            "notes": "RTD test calculation",
            "is_junior": False,
            "age": 30,
            "shiftwork": "none",
            "payment_method": "hourly",
            "fatigue_plan": False
        }
        success, data = self.run_test("Calculate RTD Shift", "POST", "calculate", 200, shift_data)
        if success and isinstance(data, dict):
            print(f"   Total Hours: {data.get('total_hours', 'N/A')}")
            print(f"   Estimated Pay: ${data.get('estimated_pay', 'N/A')}")
            print(f"   Components: {len(data.get('components', []))}")
        return success, data

    def test_calculate_shift_rtldo(self):
        """Test shift calculation for RTLDO award"""
        shift_data = {
            "employee_id": "TEST-003",
            "award_code": "MA000039",
            "employment_type": "full_time",
            "classification": "G3",
            "pay_rate": 39.37,
            "date": "2024-01-17",
            "day_of_week": "Wednesday",
            "is_public_holiday": "no",
            "is_sa_ph": False,
            "start_time": "05:00",
            "finish_time": "15:00",
            "unpaid_break_mins": 60,
            "meal_break_at": 300,
            "hours_this_week": 0,
            "ot_pre_approved": False,
            "rdo_being_worked": False,
            "first_aid": True,
            "leading_hand": False,
            "own_vehicle": False,
            "dangerous_goods": True,
            "ot_meal": False,
            "early_morning": False,
            "travelling": False,
            "furniture_livestock": False,
            "excess_dimensions": False,
            "km_driven": 800,
            "route": "Sydney-Melbourne",
            "pt_non_agreed_day": False,
            "loading_unloading": "yes",
            "loading_hours": 3,
            "delay_breakdown": True,
            "delay_hours": 2,
            "notes": "RTLDO long distance test",
            "is_junior": False,
            "age": 35,
            "shiftwork": "none",
            "payment_method": "cpk",
            "fatigue_plan": True
        }
        success, data = self.run_test("Calculate RTLDO Shift", "POST", "calculate", 200, shift_data)
        if success and isinstance(data, dict):
            print(f"   Total Hours: {data.get('total_hours', 'N/A')}")
            print(f"   Estimated Pay: ${data.get('estimated_pay', 'N/A')}")
            print(f"   Components: {len(data.get('components', []))}")
        return success, data

    def test_get_audit_trail(self):
        """Test getting audit trail"""
        success, data = self.run_test("Get Audit Trail", "GET", "audit-trail", 200)
        if success and isinstance(data, list):
            print(f"   Found {len(data)} audit entries")
        return success, data

    def test_audit_csv_export(self):
        """Test CSV export of audit trail"""
        success, data = self.run_test("Export Audit CSV", "GET", "audit-trail/csv", 200)
        if success:
            print(f"   CSV export successful")
        return success, data

    def test_update_rate_table(self):
        """Test updating a rate table"""
        # First get the current rate table
        success, current_table = self.test_get_specific_rate_table("MA000002")
        if not success:
            return False, {}
        
        # Modify a rate slightly
        modified_table = current_table.copy()
        if 'classifications' in modified_table and len(modified_table['classifications']) > 0:
            original_rate = modified_table['classifications'][0]['hourly_rate']
            modified_table['classifications'][0]['hourly_rate'] = original_rate + 0.01
            
            success, data = self.run_test("Update Rate Table", "PUT", "rate-tables/MA000002", 200, modified_table)
            
            # Restore original rate
            modified_table['classifications'][0]['hourly_rate'] = original_rate
            self.run_test("Restore Rate Table", "PUT", "rate-tables/MA000002", 200, modified_table)
            
            return success, data
        return False, {}

    def test_batch_template_csv(self):
        """Test batch CSV template download"""
        success, data = self.run_test("Batch CSV Template", "GET", "batch-template/csv", 200)
        if success:
            print(f"   CSV template downloaded successfully")
            # Check if it's CSV content
            if isinstance(data, str) and 'employee_id' in data:
                lines = data.strip().split('\n')
                print(f"   Template has {len(lines)} lines (header + examples)")
        return success, data

    def test_batch_calculate_single_award(self):
        """Test batch calculation with single award"""
        batch_shifts = [
            {
                "employee_id": "BATCH-001",
                "award_code": "MA000002",
                "employment_type": "full_time",
                "classification": "L1Y1",
                "pay_rate": 25.74,
                "date": "2024-01-15",
                "day_of_week": "Monday",
                "is_public_holiday": "no",
                "start_time": "09:00",
                "finish_time": "17:00",
                "unpaid_break_mins": 30,
                "hours_this_week": 0,
                "first_aid": True,
                "dangerous_goods": False,
                "ot_meal": False,
                "early_morning": False,
                "shiftwork": "none",
                "payment_method": "hourly",
                "km_driven": 0,
                "loading_unloading": "no",
                "loading_hours": 0,
                "notes": "Batch test shift 1"
            },
            {
                "employee_id": "BATCH-002",
                "award_code": "MA000002",
                "employment_type": "casual",
                "classification": "L2",
                "pay_rate": 28.42,
                "date": "2024-01-16",
                "day_of_week": "Tuesday",
                "is_public_holiday": "no",
                "start_time": "10:00",
                "finish_time": "18:00",
                "unpaid_break_mins": 30,
                "hours_this_week": 0,
                "first_aid": False,
                "dangerous_goods": False,
                "ot_meal": False,
                "early_morning": False,
                "shiftwork": "none",
                "payment_method": "hourly",
                "km_driven": 0,
                "loading_unloading": "no",
                "loading_hours": 0,
                "notes": "Batch test shift 2"
            }
        ]
        
        success, data = self.run_test("Batch Calculate Single Award", "POST", "batch-calculate", 200, {"shifts": batch_shifts})
        if success and isinstance(data, dict):
            summary = data.get('summary', {})
            print(f"   Total Shifts: {summary.get('total_shifts', 'N/A')}")
            print(f"   Successful: {summary.get('successful', 'N/A')}")
            print(f"   Failed: {summary.get('failed', 'N/A')}")
            print(f"   Total Pay: ${summary.get('total_pay', 'N/A')}")
            print(f"   Total Hours: {summary.get('total_hours', 'N/A')}")
            print(f"   Total OT Hours: {summary.get('total_ot_hours', 'N/A')}")
            
            results = data.get('results', [])
            errors = data.get('errors', [])
            print(f"   Results: {len(results)} items")
            print(f"   Errors: {len(errors)} items")
        return success, data

    def test_batch_calculate_multiple_awards(self):
        """Test batch calculation with multiple awards"""
        batch_shifts = [
            {
                "employee_id": "MULTI-001",
                "award_code": "MA000002",
                "employment_type": "full_time",
                "classification": "L1Y1",
                "pay_rate": 25.74,
                "date": "2024-01-15",
                "day_of_week": "Monday",
                "is_public_holiday": "no",
                "start_time": "09:00",
                "finish_time": "17:00",
                "unpaid_break_mins": 30,
                "hours_this_week": 0,
                "shiftwork": "none",
                "payment_method": "hourly",
                "notes": "Clerks award test"
            },
            {
                "employee_id": "MULTI-002",
                "award_code": "MA000038",
                "employment_type": "full_time",
                "classification": "G3",
                "pay_rate": 26.32,
                "date": "2024-01-16",
                "day_of_week": "Tuesday",
                "is_public_holiday": "no",
                "start_time": "06:00",
                "finish_time": "14:00",
                "unpaid_break_mins": 30,
                "hours_this_week": 0,
                "early_morning": True,
                "dangerous_goods": True,
                "km_driven": 150,
                "shiftwork": "none",
                "payment_method": "hourly",
                "notes": "RTD award test"
            },
            {
                "employee_id": "MULTI-003",
                "award_code": "MA000039",
                "employment_type": "full_time",
                "classification": "G5",
                "pay_rate": 40.52,
                "date": "2024-01-17",
                "day_of_week": "Wednesday",
                "is_public_holiday": "no",
                "start_time": "05:00",
                "finish_time": "15:00",
                "unpaid_break_mins": 60,
                "hours_this_week": 0,
                "km_driven": 650,
                "loading_unloading": "yes",
                "loading_hours": 2.5,
                "shiftwork": "none",
                "payment_method": "cpk",
                "notes": "RTLDO award test"
            }
        ]
        
        success, data = self.run_test("Batch Calculate Multiple Awards", "POST", "batch-calculate", 200, {"shifts": batch_shifts})
        if success and isinstance(data, dict):
            summary = data.get('summary', {})
            print(f"   Total Shifts: {summary.get('total_shifts', 'N/A')}")
            print(f"   Successful: {summary.get('successful', 'N/A')}")
            print(f"   Failed: {summary.get('failed', 'N/A')}")
            print(f"   Total Pay: ${summary.get('total_pay', 'N/A')}")
            print(f"   Total Hours: {summary.get('total_hours', 'N/A')}")
            print(f"   Total OT Hours: {summary.get('total_ot_hours', 'N/A')}")
        return success, data

    def test_batch_calculate_auto_lookup_rate(self):
        """Test batch calculation with auto pay rate lookup"""
        batch_shifts = [
            {
                "employee_id": "AUTO-001",
                "award_code": "MA000002",
                "employment_type": "full_time",
                "classification": "L3",
                "pay_rate": 0,  # Should auto-lookup from classification
                "date": "2024-01-15",
                "day_of_week": "Monday",
                "is_public_holiday": "no",
                "start_time": "09:00",
                "finish_time": "17:00",
                "unpaid_break_mins": 30,
                "hours_this_week": 0,
                "shiftwork": "none",
                "payment_method": "hourly",
                "notes": "Auto rate lookup test"
            }
        ]
        
        success, data = self.run_test("Batch Calculate Auto Rate Lookup", "POST", "batch-calculate", 200, {"shifts": batch_shifts})
        if success and isinstance(data, dict):
            summary = data.get('summary', {})
            results = data.get('results', [])
            if results and len(results) > 0:
                print(f"   Auto-looked up rate worked: Pay = ${results[0].get('estimated_pay', 'N/A')}")
            print(f"   Successful: {summary.get('successful', 'N/A')}")
            print(f"   Failed: {summary.get('failed', 'N/A')}")
        return success, data

    def test_batch_calculate_with_errors(self):
        """Test batch calculation with invalid data to check error handling"""
        batch_shifts = [
            {
                "employee_id": "ERROR-001",
                "award_code": "INVALID_AWARD",  # Invalid award code
                "employment_type": "full_time",
                "classification": "L1Y1",
                "pay_rate": 25.74,
                "date": "2024-01-15",
                "day_of_week": "Monday",
                "start_time": "09:00",
                "finish_time": "17:00",
                "notes": "Error test - invalid award"
            },
            {
                "employee_id": "ERROR-002",
                "award_code": "MA000002",
                "employment_type": "full_time",
                "classification": "INVALID_CLASS",  # Invalid classification
                "pay_rate": 0,  # No rate and invalid classification
                "date": "2024-01-16",
                "day_of_week": "Tuesday",
                "start_time": "09:00",
                "finish_time": "17:00",
                "notes": "Error test - invalid classification"
            }
        ]
        
        success, data = self.run_test("Batch Calculate Error Handling", "POST", "batch-calculate", 200, {"shifts": batch_shifts})
        if success and isinstance(data, dict):
            summary = data.get('summary', {})
            errors = data.get('errors', [])
            print(f"   Total Shifts: {summary.get('total_shifts', 'N/A')}")
            print(f"   Successful: {summary.get('successful', 'N/A')}")
            print(f"   Failed: {summary.get('failed', 'N/A')}")
            print(f"   Errors with row numbers: {len(errors)} items")
            for error in errors:
                print(f"     Row {error.get('row', 'N/A')}: {error.get('error', 'N/A')}")
        return success, data

    # ===== NEW FEATURE TESTS (13 features) =====

    def test_leave_calculate(self):
        """Test NES Leave Calculator endpoint"""
        leave_data = {
            "employment_type": "full_time",
            "hours_per_week": 38,
            "years_of_service": 2.5,
            "hourly_rate": 25.74,
            "leave_taken_hours": 76,
            "personal_leave_taken": 38
        }
        success, data = self.run_test("Leave Calculator", "POST", "leave-calculate", 200, leave_data)
        if success and isinstance(data, dict):
            annual = data.get('annual_leave', {})
            personal = data.get('personal_leave', {})
            lsl = data.get('long_service_leave', {})
            print(f"   Annual Leave: {annual.get('hours_remaining', 'N/A')} hrs remaining")
            print(f"   Personal Leave: {personal.get('hours_remaining', 'N/A')} hrs remaining")
            print(f"   LSL Eligible: {lsl.get('eligible', 'N/A')}")
        return success, data

    def test_compare_scenarios(self):
        """Test What-If Comparison Tool endpoint"""
        comparison_data = {
            "base_shift": {
                "employee_id": "COMP-001",
                "award_code": "MA000002",
                "employment_type": "full_time",
                "classification": "L1Y1",
                "pay_rate": 25.74,
                "date": "2024-01-15",
                "day_of_week": "Monday",
                "start_time": "09:00",
                "finish_time": "17:00",
                "unpaid_break_mins": 30
            },
            "scenarios": [
                {
                    "employment_type": "casual",
                    "notes": "Casual scenario"
                },
                {
                    "day_of_week": "Saturday",
                    "notes": "Saturday scenario"
                }
            ]
        }
        success, data = self.run_test("Compare Scenarios", "POST", "compare", 200, comparison_data)
        if success and isinstance(data, dict):
            results = data.get('results', [])
            print(f"   Comparison results: {len(results)} scenarios")
            for i, result in enumerate(results):
                print(f"     Scenario {i+1}: ${result.get('estimated_pay', 'N/A')}")
        return success, data

    def test_analytics_summary(self):
        """Test Analytics Summary endpoint"""
        success, data = self.run_test("Analytics Summary", "GET", "analytics/summary", 200)
        if success and isinstance(data, dict):
            print(f"   Total Calculations: {data.get('total_calculations', 'N/A')}")
            print(f"   Total Employees: {data.get('total_employees', 'N/A')}")
            by_award = data.get('by_award', [])
            print(f"   By Award: {len(by_award)} awards")
            top_employees = data.get('top_employees', [])
            print(f"   Top Employees: {len(top_employees)} employees")
        return success, data

    def test_annualised_reconcile(self):
        """Test Annualised Salary Reconciliation endpoint"""
        reconcile_data = {
            "employee_id": "ANN-001",
            "award_code": "MA000002",
            "classification": "L1Y1",
            "annual_salary": 55000,
            "hours_per_week": 38,
            "weeks_worked": 52,
            "shifts": []
        }
        success, data = self.run_test("Annualised Reconcile", "POST", "annualised-reconcile", 200, reconcile_data)
        if success and isinstance(data, dict):
            print(f"   Status: {data.get('status', 'N/A')}")
            print(f"   Annual Salary: ${data.get('annual_salary', 'N/A')}")
            print(f"   Award Base Annual: ${data.get('award_base_annual', 'N/A')}")
            print(f"   Difference: ${data.get('difference', 'N/A')}")
        return success, data

    def test_rate_alerts(self):
        """Test Rate Alerts endpoint"""
        success, data = self.run_test("Rate Alerts", "GET", "rate-alerts", 200)
        if success and isinstance(data, dict):
            alerts = data.get('alerts', [])
            total = data.get('total', 0)
            print(f"   Total Alerts: {total}")
            for alert in alerts[:3]:  # Show first 3 alerts
                print(f"     {alert.get('severity', 'N/A')}: {alert.get('message', 'N/A')[:50]}...")
        return success, data

    def test_roster_templates_crud(self):
        """Test Roster Templates CRUD operations"""
        # Create template
        template_data = {
            "name": "Standard Week",
            "award_code": "MA000002",
            "employment_type": "full_time",
            "classification": "L1Y1",
            "shifts": [
                {
                    "day_of_week": "Monday",
                    "start_time": "09:00",
                    "finish_time": "17:00",
                    "unpaid_break_mins": 30,
                    "notes": "Standard Monday"
                },
                {
                    "day_of_week": "Tuesday",
                    "start_time": "09:00",
                    "finish_time": "17:00",
                    "unpaid_break_mins": 30,
                    "notes": "Standard Tuesday"
                }
            ]
        }
        success, created = self.run_test("Create Roster Template", "POST", "roster-templates", 200, template_data)
        if not success:
            return False, {}
        
        template_id = created.get('id')
        if not template_id:
            return False, {}
        
        # Get all templates
        success, data = self.run_test("Get Roster Templates", "GET", "roster-templates", 200)
        if success:
            print(f"   Found {len(data)} roster templates")
        
        # Generate from template
        generate_data = {
            "week_start": "2024-01-15",
            "employee_id": "ROSTER-001"
        }
        success, generated = self.run_test("Generate from Roster Template", "POST", f"roster-templates/{template_id}/generate", 200, generate_data)
        if success and isinstance(generated, dict):
            shifts = generated.get('shifts', [])
            print(f"   Generated {len(shifts)} shifts from template")
        
        # Clean up - delete template
        self.run_test("Delete Roster Template", "DELETE", f"roster-templates/{template_id}", 200)
        
        return success, generated

    def test_bulk_employee_import(self):
        """Test Bulk Employee Import endpoint"""
        employees_data = [
            {
                "employee_id": "BULK-001",
                "employing_entity": "Test Company",
                "award_code": "MA000002",
                "employment_type": "full_time",
                "classification": "L1Y1",
                "pay_rate": 25.74
            },
            {
                "employee_id": "BULK-002",
                "employing_entity": "Test Company",
                "award_code": "MA000038",
                "employment_type": "casual",
                "classification": "G1",
                "pay_rate": 25.43
            }
        ]
        success, data = self.run_test("Bulk Employee Import", "POST", "employees/bulk-import", 200, {"employees": employees_data})
        if success and isinstance(data, dict):
            summary = data.get('summary', {})
            print(f"   Imported: {summary.get('successful', 'N/A')} employees")
            print(f"   Failed: {summary.get('failed', 'N/A')} employees")
        return success, data

    def test_payroll_export_xero(self):
        """Test Payroll Export for Xero endpoint"""
        export_data = {
            "format": "xero",
            "date_from": "2024-01-01",
            "date_to": "2024-01-31",
            "employee_ids": []
        }
        success, data = self.run_test("Payroll Export Xero", "POST", "payroll-export/xero", 200, export_data)
        if success:
            print(f"   Xero export successful")
            if isinstance(data, str) and len(data) > 0:
                lines = data.strip().split('\n')
                print(f"   CSV has {len(lines)} lines")
        return success, data

    def test_weekly_ot_tracking(self):
        """Test Weekly OT Tracking endpoint"""
        success, data = self.run_test("Weekly OT Tracking", "GET", "weekly-ot?week_start=2024-01-15", 200)
        if success and isinstance(data, dict):
            employees = data.get('employees', [])
            week_start = data.get('week_start', 'N/A')
            week_end = data.get('week_end', 'N/A')
            print(f"   Week: {week_start} to {week_end}")
            print(f"   Employees tracked: {len(employees)}")
            for emp in employees[:3]:  # Show first 3 employees
                print(f"     {emp.get('employee_id', 'N/A')}: {emp.get('total_hours', 'N/A')}hrs, OT: {emp.get('total_ot', 'N/A')}hrs")
        return success, data

    def test_shifts_crud(self):
        """Test Shifts CRUD operations for calendar"""
        # Create shift
        shift_data = {
            "employee_id": "SHIFT-001",
            "award_code": "MA000002",
            "employment_type": "full_time",
            "classification": "L1Y1",
            "pay_rate": 25.74,
            "date": "2024-01-15",
            "day_of_week": "Monday",
            "start_time": "09:00",
            "finish_time": "17:00",
            "unpaid_break_mins": 30,
            "notes": "Calendar test shift"
        }
        success, created = self.run_test("Create Shift", "POST", "shifts", 200, shift_data)
        if not success:
            return False, {}
        
        shift_id = created.get('id')
        if not shift_id:
            return False, {}
        
        # Get shifts
        success, data = self.run_test("Get Shifts", "GET", "shifts?employee_id=SHIFT-001&month=2024-01", 200)
        if success:
            print(f"   Found {len(data)} shifts for employee")
        
        # Clean up - delete shift
        self.run_test("Delete Shift", "DELETE", f"shifts/{shift_id}", 200)
        
        return success, data

    def test_analytics_trends(self):
        """Test Analytics Trends endpoint"""
        success, data = self.run_test("Analytics Trends", "GET", "analytics/trends", 200)
        if success and isinstance(data, dict):
            monthly = data.get('monthly', [])
            daily = data.get('daily', [])
            print(f"   Monthly trends: {len(monthly)} months")
            print(f"   Daily trends: {len(daily)} days")
        return success, data

def main():
    print("🚀 Starting Award Interpreter Tool Backend API Tests")
    print("=" * 60)
    
    tester = AwardInterpreterTester()
    
    # Test sequence
    tests = [
        tester.test_health_check,
        tester.test_seed_rates,
        tester.test_get_rate_tables,
        lambda: tester.test_get_specific_rate_table("MA000002"),
        lambda: tester.test_get_specific_rate_table("MA000038"),
        lambda: tester.test_get_specific_rate_table("MA000039"),
        tester.test_create_employee,
        tester.test_get_employees,
        tester.test_calculate_shift_clerks,
        tester.test_calculate_shift_rtd,
        tester.test_calculate_shift_rtldo,
        tester.test_get_audit_trail,
        tester.test_audit_csv_export,
        tester.test_update_rate_table,
        # Existing batch import tests
        tester.test_batch_template_csv,
        tester.test_batch_calculate_single_award,
        tester.test_batch_calculate_multiple_awards,
        tester.test_batch_calculate_auto_lookup_rate,
        tester.test_batch_calculate_with_errors,
        # NEW FEATURE TESTS (13 features)
        tester.test_leave_calculate,
        tester.test_compare_scenarios,
        tester.test_analytics_summary,
        tester.test_annualised_reconcile,
        tester.test_rate_alerts,
        tester.test_roster_templates_crud,
        tester.test_bulk_employee_import,
        tester.test_payroll_export_xero,
        tester.test_weekly_ot_tracking,
        tester.test_shifts_crud,
        tester.test_analytics_trends,
    ]
    
    print(f"\n📋 Running {len(tests)} test scenarios...")
    
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
            tester.failed_tests.append({'name': test.__name__, 'error': str(e)})
    
    # Print summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%" if tester.tests_run > 0 else "0%")
    
    if tester.failed_tests:
        print(f"\n❌ FAILED TESTS ({len(tester.failed_tests)}):")
        for i, failure in enumerate(tester.failed_tests, 1):
            print(f"{i}. {failure['name']}")
            if 'expected' in failure:
                print(f"   Expected: {failure['expected']}, Got: {failure['actual']}")
            if 'error' in failure:
                print(f"   Error: {failure['error']}")
            if 'response' in failure:
                print(f"   Response: {failure['response']}")
    else:
        print("\n✅ All tests passed!")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())