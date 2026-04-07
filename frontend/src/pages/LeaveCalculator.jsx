import React, { useState } from 'react';
import { calculateLeave } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { EMPLOYMENT_TYPES } from '../lib/constants';
import { CalendarCheck, Sun, FirstAid, Timer } from '@phosphor-icons/react';
import { toast } from 'sonner';

export default function LeaveCalculator() {
  const [form, setForm] = useState({ employment_type: 'full_time', hours_per_week: 38, years_of_service: 1, hourly_rate: 25.74, leave_taken_hours: 0, personal_leave_taken: 0 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCalc = async () => {
    setLoading(true);
    try { setResult(await calculateLeave(form)); } catch { toast.error('Calculation failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="leave-calculator-page">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2"><CalendarCheck size={24} /> NES Leave Calculator</h1>
        <p className="text-sm text-muted-foreground mt-1">Calculate annual leave, personal/carer's leave, and long service leave entitlements under the National Employment Standards.</p>
      </div>

      <Card className="rounded-sm border">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><Label className="text-xs">Employment Type</Label><Select value={form.employment_type} onValueChange={v => update('employment_type', v)}><SelectTrigger className="rounded-sm mt-1 text-xs" data-testid="leave-emp-type"><SelectValue /></SelectTrigger><SelectContent>{EMPLOYMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="text-xs">Hours/Week</Label><Input type="number" value={form.hours_per_week} onChange={e => update('hours_per_week', parseFloat(e.target.value) || 0)} className="rounded-sm mt-1 text-xs font-mono" /></div>
            <div><Label className="text-xs">Years of Service</Label><Input type="number" step="0.5" value={form.years_of_service} onChange={e => update('years_of_service', parseFloat(e.target.value) || 0)} className="rounded-sm mt-1 text-xs font-mono" data-testid="leave-years-input" /></div>
            <div><Label className="text-xs">Hourly Rate ($)</Label><Input type="number" step="0.01" value={form.hourly_rate} onChange={e => update('hourly_rate', parseFloat(e.target.value) || 0)} className="rounded-sm mt-1 text-xs font-mono" /></div>
            <div><Label className="text-xs">Annual Leave Taken (hrs)</Label><Input type="number" value={form.leave_taken_hours} onChange={e => update('leave_taken_hours', parseFloat(e.target.value) || 0)} className="rounded-sm mt-1 text-xs font-mono" /></div>
            <div><Label className="text-xs">Personal Leave Taken (hrs)</Label><Input type="number" value={form.personal_leave_taken} onChange={e => update('personal_leave_taken', parseFloat(e.target.value) || 0)} className="rounded-sm mt-1 text-xs font-mono" /></div>
          </div>
          <Button className="rounded-sm text-xs mt-4" onClick={handleCalc} disabled={loading} data-testid="calc-leave-btn">{loading ? 'Calculating...' : 'Calculate Leave'}</Button>
        </CardContent>
      </Card>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="leave-results">
          <Card className="rounded-sm border">
            <CardHeader className="p-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><Sun size={16} /> Annual Leave</CardTitle></CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-2xl font-mono font-bold">{result.annual_leave.hours_remaining}hrs</p>
              <p className="text-xs text-muted-foreground">remaining of {result.annual_leave.hours_accrued}hrs accrued</p>
              <p className="text-sm font-mono font-bold mt-2">${result.annual_leave.value.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{result.annual_leave.note}</p>
            </CardContent>
          </Card>
          <Card className="rounded-sm border">
            <CardHeader className="p-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><FirstAid size={16} /> Personal/Carer's</CardTitle></CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-2xl font-mono font-bold">{result.personal_leave.hours_remaining}hrs</p>
              <p className="text-xs text-muted-foreground">remaining of {result.personal_leave.hours_accrued}hrs accrued</p>
              <p className="text-sm font-mono font-bold mt-2">${result.personal_leave.value.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{result.personal_leave.note}</p>
            </CardContent>
          </Card>
          <Card className="rounded-sm border">
            <CardHeader className="p-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><Timer size={16} /> Long Service Leave</CardTitle></CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-2xl font-mono font-bold">{result.long_service_leave.hours_accrued}hrs</p>
              <p className="text-xs text-muted-foreground">{result.long_service_leave.eligible ? 'Eligible' : `Not yet eligible (need ${result.long_service_leave.years_required} years)`}</p>
              <p className="text-sm font-mono font-bold mt-2">${result.long_service_leave.value.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{result.long_service_leave.note}</p>
            </CardContent>
          </Card>
          {result.summary && (
            <Card className="rounded-sm border border-foreground bg-foreground text-background md:col-span-3" data-testid="leave-total">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-mono font-bold">${result.summary.total_leave_value.toLocaleString()}</p>
                <p className="text-xs opacity-70 uppercase tracking-wider">Total Leave Liability</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
