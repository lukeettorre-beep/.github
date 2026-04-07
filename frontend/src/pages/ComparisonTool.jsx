import React, { useState } from 'react';
import { compareScenarios, getRateTable } from '../lib/api';
import { AWARDS, EMPLOYMENT_TYPES, DAYS_OF_WEEK } from '../lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { ArrowsLeftRight, Plus, Trash, Play } from '@phosphor-icons/react';
import { toast } from 'sonner';

export default function ComparisonTool() {
  const [baseShift, setBaseShift] = useState({
    award_code: 'MA000002', employment_type: 'full_time', classification: 'L1Y1',
    date: '2025-07-14', day_of_week: 'Monday', start_time: '08:00', finish_time: '16:30',
    unpaid_break_mins: 30, is_public_holiday: 'no', pay_rate: 25.74,
  });
  const [scenarios, setScenarios] = useState([
    { label: 'As Casual', employment_type: 'casual' },
  ]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const updateBase = (k, v) => setBaseShift(s => ({ ...s, [k]: v }));
  const updateScenario = (i, k, v) => setScenarios(s => s.map((sc, idx) => idx === i ? { ...sc, [k]: v } : sc));
  const addScenario = () => setScenarios(s => [...s, { label: `Scenario ${s.length + 1}` }]);
  const removeScenario = (i) => setScenarios(s => s.filter((_, idx) => idx !== i));

  const handleCompare = async () => {
    setLoading(true);
    try {
      const res = await compareScenarios({ base_shift: baseShift, scenarios });
      setResults(res);
      toast.success('Comparison complete.');
    } catch { toast.error('Comparison failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6" data-testid="comparison-tool-page">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2"><ArrowsLeftRight size={24} /> What-If Comparison</h1>
        <p className="text-sm text-muted-foreground mt-1">Compare pay outcomes across different employment types, classifications, awards, or shift patterns.</p>
      </div>

      {/* Base Shift */}
      <Card className="rounded-sm border" data-testid="base-shift-form">
        <CardHeader className="p-4 pb-2"><CardTitle className="text-sm">Base Scenario</CardTitle></CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <div><Label className="text-[10px]">Award</Label><Select value={baseShift.award_code} onValueChange={v => updateBase('award_code', v)}><SelectTrigger className="rounded-sm text-xs mt-0.5"><SelectValue /></SelectTrigger><SelectContent>{Object.values(AWARDS).map(a => <SelectItem key={a.code} value={a.code}>{a.shortName}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="text-[10px]">Type</Label><Select value={baseShift.employment_type} onValueChange={v => updateBase('employment_type', v)}><SelectTrigger className="rounded-sm text-xs mt-0.5"><SelectValue /></SelectTrigger><SelectContent>{EMPLOYMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="text-[10px]">Classification</Label><Input value={baseShift.classification} onChange={e => updateBase('classification', e.target.value)} className="rounded-sm text-xs mt-0.5" /></div>
            <div><Label className="text-[10px]">Rate</Label><Input type="number" step="0.01" value={baseShift.pay_rate} onChange={e => updateBase('pay_rate', parseFloat(e.target.value) || 0)} className="rounded-sm text-xs mt-0.5 font-mono" /></div>
            <div><Label className="text-[10px]">Day</Label><Select value={baseShift.day_of_week} onValueChange={v => updateBase('day_of_week', v)}><SelectTrigger className="rounded-sm text-xs mt-0.5"><SelectValue /></SelectTrigger><SelectContent>{DAYS_OF_WEEK.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="text-[10px]">PH</Label><Select value={baseShift.is_public_holiday} onValueChange={v => updateBase('is_public_holiday', v)}><SelectTrigger className="rounded-sm text-xs mt-0.5"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="no">No</SelectItem><SelectItem value="standard">Standard PH</SelectItem><SelectItem value="special">Good Fri/Xmas</SelectItem></SelectContent></Select></div>
            <div><Label className="text-[10px]">Start</Label><Input type="time" value={baseShift.start_time} onChange={e => updateBase('start_time', e.target.value)} className="rounded-sm text-xs mt-0.5 font-mono" /></div>
            <div><Label className="text-[10px]">Finish</Label><Input type="time" value={baseShift.finish_time} onChange={e => updateBase('finish_time', e.target.value)} className="rounded-sm text-xs mt-0.5 font-mono" /></div>
            <div><Label className="text-[10px]">Break (mins)</Label><Input type="number" value={baseShift.unpaid_break_mins} onChange={e => updateBase('unpaid_break_mins', parseInt(e.target.value) || 0)} className="rounded-sm text-xs mt-0.5 font-mono" /></div>
          </div>
        </CardContent>
      </Card>

      {/* Scenarios */}
      <Card className="rounded-sm border" data-testid="scenarios-section">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Scenarios ({scenarios.length})</CardTitle>
          <Button variant="outline" size="sm" className="rounded-sm text-xs" onClick={addScenario} data-testid="add-scenario-btn"><Plus size={12} className="mr-1" /> Add</Button>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-3">
          <p className="text-[10px] text-muted-foreground">Override any field from the base scenario. Leave blank to use base values.</p>
          {scenarios.map((sc, i) => (
            <div key={i} className="border rounded-sm p-3 space-y-2">
              <div className="flex items-center justify-between">
                <Input value={sc.label || ''} onChange={e => updateScenario(i, 'label', e.target.value)} className="rounded-sm text-xs w-48 font-medium" placeholder="Scenario name" />
                <button onClick={() => removeScenario(i)} className="text-red-500"><Trash size={14} /></button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div><Label className="text-[10px]">Award override</Label><Select value={sc.award_code || ''} onValueChange={v => updateScenario(i, 'award_code', v)}><SelectTrigger className="rounded-sm text-xs mt-0.5"><SelectValue placeholder="Same" /></SelectTrigger><SelectContent>{Object.values(AWARDS).map(a => <SelectItem key={a.code} value={a.code}>{a.shortName}</SelectItem>)}</SelectContent></Select></div>
                <div><Label className="text-[10px]">Type override</Label><Select value={sc.employment_type || ''} onValueChange={v => updateScenario(i, 'employment_type', v)}><SelectTrigger className="rounded-sm text-xs mt-0.5"><SelectValue placeholder="Same" /></SelectTrigger><SelectContent>{EMPLOYMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
                <div><Label className="text-[10px]">Classification</Label><Input value={sc.classification || ''} onChange={e => updateScenario(i, 'classification', e.target.value)} className="rounded-sm text-xs mt-0.5" placeholder="Same" /></div>
                <div><Label className="text-[10px]">Day override</Label><Select value={sc.day_of_week || ''} onValueChange={v => updateScenario(i, 'day_of_week', v)}><SelectTrigger className="rounded-sm text-xs mt-0.5"><SelectValue placeholder="Same" /></SelectTrigger><SelectContent>{DAYS_OF_WEEK.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button className="rounded-sm" onClick={handleCompare} disabled={loading} data-testid="compare-btn">
        <Play size={14} className="mr-2" /> {loading ? 'Comparing...' : 'Run Comparison'}
      </Button>

      {/* Results */}
      {results?.results && (
        <Card className="rounded-sm border" data-testid="comparison-results">
          <CardHeader className="p-4 pb-2"><CardTitle className="text-sm">Comparison Results</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead className="text-xs">Scenario</TableHead><TableHead className="text-xs text-right">Hours</TableHead><TableHead className="text-xs text-right">OT</TableHead><TableHead className="text-xs text-right">Est. Pay</TableHead><TableHead className="text-xs text-right">Diff</TableHead><TableHead className="text-xs text-right">%</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {results.results.map((r, i) => (
                  <TableRow key={i} className={r.is_base ? 'bg-secondary font-bold' : ''}>
                    <TableCell className="text-xs font-medium">{r.label}{r.is_base && ' (base)'}</TableCell>
                    <TableCell className="text-xs font-mono text-right">{r.total_hours}</TableCell>
                    <TableCell className="text-xs font-mono text-right">{r.ot_hours}</TableCell>
                    <TableCell className="text-xs font-mono text-right">${r.estimated_pay?.toFixed(2) || '—'}</TableCell>
                    <TableCell className={`text-xs font-mono text-right ${r.diff > 0 ? 'text-red-500' : r.diff < 0 ? 'text-emerald-600' : ''}`}>
                      {r.is_base ? '—' : `${r.diff > 0 ? '+' : ''}$${r.diff?.toFixed(2) || '0'}`}
                    </TableCell>
                    <TableCell className={`text-xs font-mono text-right ${r.diff_pct > 0 ? 'text-red-500' : r.diff_pct < 0 ? 'text-emerald-600' : ''}`}>
                      {r.is_base ? '—' : `${r.diff_pct > 0 ? '+' : ''}${r.diff_pct?.toFixed(1) || '0'}%`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
