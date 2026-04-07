import React, { useState, useEffect } from 'react';
import { annualisedReconcile, getRateTable } from '../lib/api';
import { AWARDS } from '../lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Scales, CheckCircle, XCircle } from '@phosphor-icons/react';
import { toast } from 'sonner';

export default function AnnualisedSalary() {
  const [form, setForm] = useState({ employee_id: '', award_code: 'MA000002', classification: 'L1Y1', annual_salary: 55000, hours_per_week: 38, weeks_worked: 52 });
  const [result, setResult] = useState(null);
  const [rateTable, setRateTable] = useState(null);
  const [loading, setLoading] = useState(false);
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => { if (form.award_code) getRateTable(form.award_code).then(setRateTable).catch(() => {}); }, [form.award_code]);

  const handleReconcile = async () => {
    setLoading(true);
    try {
      const res = await annualisedReconcile(form);
      setResult(res);
    } catch { toast.error('Reconciliation failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="annualised-salary-page">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2"><Scales size={24} /> Annualised Salary Reconciliation</h1>
        <p className="text-sm text-muted-foreground mt-1">Compare an annualised salary against award entitlements to detect underpayment risk.</p>
      </div>

      <Card className="rounded-sm border">
        <CardHeader className="p-4 pb-2"><CardTitle className="text-sm">Employee Details</CardTitle></CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><Label className="text-xs">Employee ID</Label><Input value={form.employee_id} onChange={e => update('employee_id', e.target.value)} className="rounded-sm mt-1 text-xs" data-testid="ann-emp-id" /></div>
            <div><Label className="text-xs">Award</Label>
              <Select value={form.award_code} onValueChange={v => update('award_code', v)}><SelectTrigger className="rounded-sm mt-1 text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.values(AWARDS).map(a => <SelectItem key={a.code} value={a.code}>{a.shortName} ({a.code})</SelectItem>)}</SelectContent></Select>
            </div>
            <div><Label className="text-xs">Classification</Label>
              <Select value={form.classification} onValueChange={v => update('classification', v)}><SelectTrigger className="rounded-sm mt-1 text-xs"><SelectValue /></SelectTrigger><SelectContent>{rateTable?.classifications?.map(c => <SelectItem key={c.code} value={c.code}>{c.code} — ${c.hourly_rate}/hr</SelectItem>)}</SelectContent></Select>
            </div>
            <div><Label className="text-xs">Annual Salary ($)</Label><Input type="number" value={form.annual_salary} onChange={e => update('annual_salary', parseFloat(e.target.value) || 0)} className="rounded-sm mt-1 text-xs font-mono" data-testid="ann-salary-input" /></div>
            <div><Label className="text-xs">Hours/Week</Label><Input type="number" value={form.hours_per_week} onChange={e => update('hours_per_week', parseFloat(e.target.value) || 38)} className="rounded-sm mt-1 text-xs font-mono" /></div>
            <div><Label className="text-xs">Weeks Worked/Year</Label><Input type="number" value={form.weeks_worked} onChange={e => update('weeks_worked', parseInt(e.target.value) || 52)} className="rounded-sm mt-1 text-xs font-mono" /></div>
          </div>
          <Button className="rounded-sm text-xs mt-4" onClick={handleReconcile} disabled={loading} data-testid="reconcile-btn">{loading ? 'Reconciling...' : 'Run Reconciliation'}</Button>
        </CardContent>
      </Card>

      {result && (
        <Card className={`rounded-sm border ${result.status === 'COMPLIANT' ? 'border-emerald-400' : 'border-red-400'}`} data-testid="reconciliation-result">
          <CardHeader className="p-4 pb-2 flex flex-row items-center gap-2">
            {result.status === 'COMPLIANT' ? <CheckCircle size={20} weight="fill" className="text-emerald-600" /> : <XCircle size={20} weight="fill" className="text-red-500" />}
            <CardTitle className={`text-sm ${result.status === 'COMPLIANT' ? 'text-emerald-700' : 'text-red-600'}`}>
              {result.status === 'COMPLIANT' ? 'Compliant — Salary exceeds award minimum' : 'Underpayment Risk — Salary below award entitlement'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-secondary p-3 rounded-sm"><p className="text-[10px] text-muted-foreground uppercase">Annual Salary</p><p className="text-sm font-mono font-bold">${result.annual_salary.toLocaleString()}</p></div>
              <div className="bg-secondary p-3 rounded-sm"><p className="text-[10px] text-muted-foreground uppercase">Hourly Equivalent</p><p className="text-sm font-mono font-bold">${result.hourly_equivalent}/hr</p></div>
              <div className="bg-secondary p-3 rounded-sm"><p className="text-[10px] text-muted-foreground uppercase">Award Base Rate</p><p className="text-sm font-mono font-bold">${result.award_base_rate}/hr</p></div>
              <div className="bg-secondary p-3 rounded-sm"><p className="text-[10px] text-muted-foreground uppercase">Award Base Annual</p><p className="text-sm font-mono font-bold">${result.award_base_annual.toLocaleString()}</p></div>
            </div>
            <div className={`p-3 rounded-sm ${result.difference >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/20' : 'bg-red-50 dark:bg-red-950/20'}`}>
              <p className="text-xs font-semibold">Difference: <span className="font-mono">${result.difference.toLocaleString()}</span> {result.difference >= 0 ? '(surplus)' : '(shortfall)'}</p>
              {result.shortfall > 0 && <p className="text-xs text-red-600 mt-1">Potential shortfall of ${result.shortfall.toLocaleString()} per year. Review OT, penalties, and allowances.</p>}
            </div>
            <p className="text-[10px] text-muted-foreground mt-3">{result.note}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
