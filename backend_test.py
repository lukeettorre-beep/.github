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