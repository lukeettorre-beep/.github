import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRateTable, createEmployee, getEmployees } from '../lib/api';
import { EMPLOYMENT_TYPES, SHIFTWORK_OPTIONS, JUNIOR_RATES } from '../lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { ArrowRight, ArrowLeft, UserCircle } from '@phosphor-icons/react';
import { toast } from 'sonner';

export default function EmployeeProfile({ selectedAward, onComplete }) {
  const navigate = useNavigate();
  const [rateTable, setRateTable] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedExisting, setSelectedExisting] = useState('');
  const [form, setForm] = useState({
    employee_id: '',
    employing_entity: '',
    award_code: selectedAward || '',
    employment_type: 'full_time',
    classification: '',
    pay_rate: 0,
    pt_agreed_hours: 0,
    is_junior: false,
    age: 21,
    is_trainee: false,
    payment_method: 'cpk',
    ea_coverage: false,
    fatigue_plan: false,
    shiftwork: 'none',
    ifa_annualised: false,
  });

  useEffect(() => {
    if (selectedAward) {
      setForm(f => ({ ...f, award_code: selectedAward }));
      getRateTable(selectedAward).then(setRateTable).catch(console.error);
    }
    getEmployees().then(setEmployees).catch(() => {});
  }, [selectedAward]);

  useEffect(() => {
    if (rateTable && form.classification) {
      const cls = rateTable.classifications.find(c => c.code === form.classification);
      if (cls) {
        let rate = cls.hourly_rate;
        if (form.is_junior && form.age < 21) {
          const mult = JUNIOR_RATES[form.age]?.pct || 100;
          rate = cls.hourly_rate * (mult / 100);
        }
        setForm(f => ({ ...f, pay_rate: Math.round(rate * 100) / 100 }));
      }
    }
  }, [rateTable, form.classification, form.is_junior, form.age]);

  const handleLoadExisting = (empId) => {
    const emp = employees.find(e => e.id === empId);
    if (emp) {
      setForm({ ...form, ...emp, award_code: selectedAward || emp.award_code });
      setSelectedExisting(empId);
    }
  };

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleContinue = async () => {
    if (!form.employee_id || !form.classification) {
      toast.error('Employee ID and Classification are required.');
      return;
    }
    try {
      if (!selectedExisting) {
        await createEmployee(form);
        toast.success('Employee profile saved.');
      }
      onComplete?.(form);
      navigate('/shift-input');
    } catch (err) {
      toast.error('Failed to save employee profile.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="employee-profile-page">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight">
          Step 2: Employee Profile
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter employee details or load an existing profile.
        </p>
      </div>

      {/* Load Existing */}
      {employees.length > 0 && (
        <Card className="rounded-sm border" data-testid="load-existing-employee">
          <CardContent className="p-4">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
              Load Existing Employee
            </Label>
            <Select value={selectedExisting} onValueChange={handleLoadExisting}>
              <SelectTrigger className="w-full max-w-xs rounded-sm" data-testid="existing-employee-select">
                <SelectValue placeholder="Select employee..." />
              </SelectTrigger>
              <SelectContent>
                {employees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.employee_id} — {emp.classification}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Basic Info */}
      <Card className="rounded-sm border">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <UserCircle size={16} /> Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="employee_id" className="text-xs">Employee ID *</Label>
              <Input
                id="employee_id"
                data-testid="employee-id-input"
                value={form.employee_id}
                onChange={e => update('employee_id', e.target.value)}
                className="rounded-sm mt-1"
                placeholder="EMP-001"
              />
            </div>
            <div>
              <Label htmlFor="employing_entity" className="text-xs">Employing Entity</Label>
              <Input
                id="employing_entity"
                data-testid="employing-entity-input"
                value={form.employing_entity}
                onChange={e => update('employing_entity', e.target.value)}
                className="rounded-sm mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Award</Label>
              <Input
                data-testid="award-readonly"
                value={form.award_code}
                readOnly
                className="rounded-sm mt-1 bg-secondary"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employment Details */}
      <Card className="rounded-sm border">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm">Employment Details</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs">Employment Type *</Label>
              <Select value={form.employment_type} onValueChange={v => update('employment_type', v)}>
                <SelectTrigger className="rounded-sm mt-1" data-testid="employment-type-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Classification *</Label>
              <Select value={form.classification} onValueChange={v => update('classification', v)}>
                <SelectTrigger className="rounded-sm mt-1" data-testid="classification-select">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {rateTable?.classifications?.map(c => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.code} — {c.name} (${c.hourly_rate}/hr)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Pay Rate ($/hr)</Label>
              <Input
                data-testid="pay-rate-input"
                type="number"
                step="0.01"
                value={form.pay_rate}
                onChange={e => update('pay_rate', parseFloat(e.target.value) || 0)}
                className="rounded-sm mt-1 font-mono"
              />
            </div>
          </div>

          {form.employment_type === 'part_time' && (
            <div className="mt-4">
              <Label className="text-xs">Part-Time Agreed Hours (per week)</Label>
              <Input
                data-testid="pt-hours-input"
                type="number"
                value={form.pt_agreed_hours}
                onChange={e => update('pt_agreed_hours', parseFloat(e.target.value) || 0)}
                className="rounded-sm mt-1 w-32"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Junior/Trainee */}
      <Card className="rounded-sm border">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm">Junior / Trainee</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-3">
          <div className="flex items-center gap-3">
            <Switch
              data-testid="junior-toggle"
              checked={form.is_junior}
              onCheckedChange={v => update('is_junior', v)}
            />
            <Label className="text-xs">Junior Employee</Label>
          </div>
          {form.is_junior && (
            <div className="ml-10">
              <Label className="text-xs">Age</Label>
              <Select value={String(form.age)} onValueChange={v => update('age', parseInt(v))}>
                <SelectTrigger className="rounded-sm mt-1 w-48" data-testid="age-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(JUNIOR_RATES).map(([age, info]) => (
                    <SelectItem key={age} value={age}>{info.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Switch
              data-testid="trainee-toggle"
              checked={form.is_trainee}
              onCheckedChange={v => update('is_trainee', v)}
            />
            <Label className="text-xs">Trainee / Apprentice</Label>
          </div>
        </CardContent>
      </Card>

      {/* Award-specific fields */}
      {selectedAward === 'MA000039' && (
        <Card className="rounded-sm border" data-testid="rtldo-fields">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm">RTLDO Specific</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-3">
            <div>
              <Label className="text-xs">Payment Method</Label>
              <Select value={form.payment_method} onValueChange={v => update('payment_method', v)}>
                <SelectTrigger className="rounded-sm mt-1 w-48" data-testid="payment-method-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cpk">Cents Per Kilometre (CPK)</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.ea_coverage} onCheckedChange={v => update('ea_coverage', v)} data-testid="ea-toggle" />
              <Label className="text-xs">Enterprise Agreement Coverage</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.fatigue_plan} onCheckedChange={v => update('fatigue_plan', v)} data-testid="fatigue-toggle" />
              <Label className="text-xs">Fatigue Management Plan</Label>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedAward === 'MA000002' && (
        <Card className="rounded-sm border" data-testid="clerks-fields">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm">Clerks Specific</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-3">
            <div>
              <Label className="text-xs">Shiftwork Arrangement</Label>
              <Select value={form.shiftwork} onValueChange={v => update('shiftwork', v)}>
                <SelectTrigger className="rounded-sm mt-1 w-64" data-testid="shiftwork-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SHIFTWORK_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.ifa_annualised} onCheckedChange={v => update('ifa_annualised', v)} data-testid="ifa-toggle" />
              <Label className="text-xs">IFA / Annualised Salary Arrangement</Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => navigate('/award-selector')} className="rounded-sm" data-testid="back-to-award-btn">
          <ArrowLeft size={16} className="mr-2" /> Back to Awards
        </Button>
        <Button onClick={handleContinue} className="rounded-sm" data-testid="continue-to-shift-btn">
          Continue to Shift Input <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  );
}
