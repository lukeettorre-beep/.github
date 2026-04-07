import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateShift } from '../lib/api';
import { ALLOWANCE_OPTIONS, PH_OPTIONS, getDayOfWeek } from '../lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Textarea } from '../components/ui/textarea';
import { ArrowRight, ArrowLeft, Clock, Truck, Warning } from '@phosphor-icons/react';
import { toast } from 'sonner';

export default function ShiftInput({ employeeData: propEmpData, selectedAward: propAward, onComplete }) {
  const navigate = useNavigate();
  const selectedAward = propAward || sessionStorage.getItem('ait-award') || '';
  const employeeData = propEmpData || (() => {
    const saved = sessionStorage.getItem('ait-employee');
    return saved ? JSON.parse(saved) : null;
  })();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    date: '',
    day_of_week: '',
    is_public_holiday: 'no',
    is_sa_ph: false,
    start_time: '08:00',
    finish_time: '16:00',
    unpaid_break_mins: 30,
    meal_break_at: 0,
    hours_this_week: 0,
    ot_pre_approved: false,
    rdo_being_worked: false,
    // allowances
    first_aid: false,
    leading_hand: false,
    own_vehicle: false,
    dangerous_goods: false,
    ot_meal: false,
    early_morning: false,
    travelling: false,
    furniture_livestock: false,
    excess_dimensions: false,
    // RTLDO
    km_driven: 0,
    route: '',
    pt_non_agreed_day: false,
    loading_unloading: 'no',
    loading_hours: 0,
    delay_breakdown: false,
    delay_hours: 0,
    notes: '',
  });

  const update = (key, val) => {
    setForm(f => {
      const next = { ...f, [key]: val };
      if (key === 'date') {
        next.day_of_week = getDayOfWeek(val);
      }
      return next;
    });
  };

  const toggleAllowance = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleCalculate = async () => {
    if (!form.date || !form.start_time || !form.finish_time) {
      toast.error('Date, Start Time, and Finish Time are required.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        employee_id: employeeData?.employee_id || 'UNKNOWN',
        award_code: selectedAward || employeeData?.award_code || '',
        employment_type: employeeData?.employment_type || 'full_time',
        classification: employeeData?.classification || '',
        pay_rate: employeeData?.pay_rate || 0,
        is_junior: employeeData?.is_junior || false,
        age: employeeData?.age || 21,
        shiftwork: employeeData?.shiftwork || 'none',
        payment_method: employeeData?.payment_method || 'hourly',
        fatigue_plan: employeeData?.fatigue_plan || false,
      };
      const result = await calculateShift(payload);
      onComplete?.(result);
      navigate('/results');
    } catch (err) {
      toast.error('Calculation failed. Check your inputs.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isRTLDO = selectedAward === 'MA000039';
  const isRTD = selectedAward === 'MA000038';

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="shift-input-page">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight">
          Step 3: Shift Input
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter the shift details to calculate pay entitlements.
        </p>
        {employeeData?.employee_id && (
          <p className="text-xs font-mono text-muted-foreground mt-1">
            Employee: {employeeData.employee_id} | Award: {selectedAward} | Rate: ${employeeData.pay_rate}/hr
          </p>
        )}
      </div>

      {/* Date & Day */}
      <Card className="rounded-sm border">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock size={16} /> Shift Timing
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs">Date *</Label>
              <Input
                type="date"
                data-testid="shift-date-input"
                value={form.date}
                onChange={e => update('date', e.target.value)}
                className="rounded-sm mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Day</Label>
              <Input
                data-testid="day-of-week"
                value={form.day_of_week}
                readOnly
                className="rounded-sm mt-1 bg-secondary"
              />
            </div>
            <div>
              <Label className="text-xs">Public Holiday?</Label>
              <Select value={form.is_public_holiday} onValueChange={v => update('is_public_holiday', v)}>
                <SelectTrigger className="rounded-sm mt-1" data-testid="ph-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PH_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Switch checked={form.is_sa_ph} onCheckedChange={v => update('is_sa_ph', v)} data-testid="sa-ph-toggle" />
            <Label className="text-xs">SA Public Holiday?</Label>
          </div>
        </CardContent>
      </Card>

      {/* Times & Breaks */}
      <Card className="rounded-sm border">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm">Hours & Breaks</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs">Start Time *</Label>
              <Input
                type="time"
                data-testid="start-time-input"
                value={form.start_time}
                onChange={e => update('start_time', e.target.value)}
                className="rounded-sm mt-1 font-mono"
              />
            </div>
            <div>
              <Label className="text-xs">Finish Time *</Label>
              <Input
                type="time"
                data-testid="finish-time-input"
                value={form.finish_time}
                onChange={e => update('finish_time', e.target.value)}
                className="rounded-sm mt-1 font-mono"
              />
            </div>
            <div>
              <Label className="text-xs">Unpaid Break (mins)</Label>
              <Input
                type="number"
                data-testid="break-mins-input"
                value={form.unpaid_break_mins}
                onChange={e => update('unpaid_break_mins', parseInt(e.target.value) || 0)}
                className="rounded-sm mt-1 font-mono"
              />
            </div>
            <div>
              <Label className="text-xs">Meal Break At (mins after start)</Label>
              <Input
                type="number"
                data-testid="meal-break-at-input"
                value={form.meal_break_at}
                onChange={e => update('meal_break_at', parseInt(e.target.value) || 0)}
                className="rounded-sm mt-1 font-mono"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Context */}
      <Card className="rounded-sm border">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm">Weekly Context</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs">Hours This Week (before this shift)</Label>
              <Input
                type="number"
                data-testid="weekly-hours-input"
                value={form.hours_this_week}
                onChange={e => update('hours_this_week', parseFloat(e.target.value) || 0)}
                className="rounded-sm mt-1 font-mono"
              />
            </div>
            <div className="flex items-center gap-3 pt-5">
              <Switch checked={form.ot_pre_approved} onCheckedChange={v => update('ot_pre_approved', v)} data-testid="ot-approved-toggle" />
              <Label className="text-xs">OT Pre-approved?</Label>
            </div>
            <div className="flex items-center gap-3 pt-5">
              <Switch checked={form.rdo_being_worked} onCheckedChange={v => update('rdo_being_worked', v)} data-testid="rdo-toggle" />
              <Label className="text-xs">RDO Being Worked?</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Allowances */}
      <Card className="rounded-sm border">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm">Allowances</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ALLOWANCE_OPTIONS.filter(a => !a.awardFilter || a.awardFilter.includes(selectedAward)).map(a => (
              <div key={a.key} className="flex items-center gap-2">
                <Checkbox
                  id={a.key}
                  data-testid={`allowance-${a.key}`}
                  checked={form[a.key]}
                  onCheckedChange={v => toggleAllowance(a.key, v)}
                />
                <Label htmlFor={a.key} className="text-xs cursor-pointer">{a.label}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* RTLDO Trip Section */}
      {isRTLDO && (
        <Card className="rounded-sm border" data-testid="rtldo-trip-section">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Truck size={16} /> RTLDO Trip Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs">Km Driven</Label>
                <Input
                  type="number"
                  data-testid="km-driven-input"
                  value={form.km_driven}
                  onChange={e => update('km_driven', parseFloat(e.target.value) || 0)}
                  className="rounded-sm mt-1 font-mono"
                />
              </div>
              <div>
                <Label className="text-xs">Route</Label>
                <Input
                  data-testid="route-input"
                  value={form.route}
                  onChange={e => update('route', e.target.value)}
                  className="rounded-sm mt-1"
                  placeholder="e.g. Sydney-Melbourne"
                />
              </div>
              <div className="flex items-center gap-3 pt-5">
                <Switch checked={form.pt_non_agreed_day} onCheckedChange={v => update('pt_non_agreed_day', v)} data-testid="pt-non-agreed-toggle" />
                <Label className="text-xs">PT Non-Agreed Day?</Label>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs">Loading/Unloading</Label>
                <Select value={form.loading_unloading} onValueChange={v => update('loading_unloading', v)}>
                  <SelectTrigger className="rounded-sm mt-1" data-testid="loading-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.loading_unloading === 'yes' && (
                <div>
                  <Label className="text-xs">Loading/Unloading Hours</Label>
                  <Input
                    type="number"
                    data-testid="loading-hours-input"
                    value={form.loading_hours}
                    onChange={e => update('loading_hours', parseFloat(e.target.value) || 0)}
                    className="rounded-sm mt-1 font-mono"
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Switch checked={form.delay_breakdown} onCheckedChange={v => update('delay_breakdown', v)} data-testid="delay-toggle" />
                <Label className="text-xs">Delay/Breakdown?</Label>
              </div>
              {form.delay_breakdown && (
                <div>
                  <Label className="text-xs">Delay Hours</Label>
                  <Input
                    type="number"
                    data-testid="delay-hours-input"
                    value={form.delay_hours}
                    onChange={e => update('delay_hours', parseFloat(e.target.value) || 0)}
                    className="rounded-sm mt-1 font-mono"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      <Card className="rounded-sm border">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm">Notes</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <Textarea
            data-testid="notes-textarea"
            value={form.notes}
            onChange={e => update('notes', e.target.value)}
            placeholder="Additional notes for this shift..."
            className="rounded-sm min-h-[80px]"
          />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => navigate('/employee-profile')} className="rounded-sm" data-testid="back-to-employee-btn">
          <ArrowLeft size={16} className="mr-2" /> Back to Employee
        </Button>
        <Button onClick={handleCalculate} disabled={loading} className="rounded-sm" data-testid="calculate-btn">
          {loading ? 'Calculating...' : 'Calculate Pay'}
          <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  );
}
