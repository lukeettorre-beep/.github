import React, { useState } from 'react';
import { getWeeklyOT } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Clock, Warning } from '@phosphor-icons/react';
import { toast } from 'sonner';

export default function WeeklyOT() {
  const [weekStart, setWeekStart] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!weekStart) { toast.error('Select a week start date.'); return; }
    setLoading(true);
    try {
      const res = await getWeeklyOT({ week_start: weekStart, employee_id: employeeFilter });
      setData(res);
    } catch { toast.error('Failed to load weekly OT data.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6" data-testid="weekly-ot-page">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2"><Clock size={24} /> Weekly OT Tracking</h1>
        <p className="text-sm text-muted-foreground mt-1">Track cumulative hours per employee per week. OT triggers when total exceeds 38 hours.</p>
      </div>

      <Card className="rounded-sm border">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div><Label className="text-xs">Week Starting (Monday)</Label><Input type="date" value={weekStart} onChange={e => setWeekStart(e.target.value)} className="rounded-sm mt-1 text-xs" data-testid="week-start-input" /></div>
            <div><Label className="text-xs">Employee ID (optional)</Label><Input value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)} className="rounded-sm mt-1 text-xs" placeholder="All employees" data-testid="employee-filter-input" /></div>
            <Button className="rounded-sm text-xs" onClick={handleSearch} disabled={loading} data-testid="search-weekly-ot-btn">{loading ? 'Loading...' : 'Search'}</Button>
          </div>
        </CardContent>
      </Card>

      {data && (
        <>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Week: {data.week_start} — {data.week_end}</span>
            <span>|</span>
            <span>{data.employees?.length || 0} employee(s)</span>
          </div>

          {data.employees?.map((emp, i) => (
            <Card key={i} className={`rounded-sm border ${emp.ot_triggered ? 'border-amber-400' : ''}`} data-testid={`employee-ot-${emp.employee_id}`}>
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm">{emp.employee_id}</CardTitle>
                  <p className="text-[10px] text-muted-foreground font-mono">{emp.award_code}</p>
                </div>
                <div className="flex items-center gap-2">
                  {emp.ot_triggered && (
                    <Badge variant="outline" className="text-[10px] rounded-sm border-amber-400 text-amber-600">
                      <Warning size={10} className="mr-0.5" /> OT TRIGGERED
                    </Badge>
                  )}
                  <span className="text-lg font-mono font-bold">{emp.total_hours}hrs</span>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {/* Progress bar */}
                <div className="h-3 bg-secondary rounded-full overflow-hidden mb-3">
                  <div className={`h-full rounded-full transition-all ${emp.ot_triggered ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, (emp.total_hours / 38) * 100)}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mb-3">
                  <span>0hrs</span>
                  <span className={emp.ot_triggered ? 'font-bold text-amber-600' : ''}>38hrs (threshold)</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="bg-secondary p-2 rounded-sm text-center"><p className="text-xs font-mono font-bold">{emp.total_hours}hrs</p><p className="text-[10px] text-muted-foreground">Total</p></div>
                  <div className="bg-secondary p-2 rounded-sm text-center"><p className="text-xs font-mono font-bold">{emp.total_ot}hrs</p><p className="text-[10px] text-muted-foreground">OT Hours</p></div>
                  <div className="bg-secondary p-2 rounded-sm text-center"><p className="text-xs font-mono font-bold">${emp.total_pay.toFixed(2)}</p><p className="text-[10px] text-muted-foreground">Total Pay</p></div>
                </div>
                <Table>
                  <TableHeader><TableRow><TableHead className="text-xs">Date</TableHead><TableHead className="text-xs text-right">Hours</TableHead><TableHead className="text-xs text-right">OT</TableHead><TableHead className="text-xs text-right">Pay</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {emp.shifts.map((s, si) => (
                      <TableRow key={si}><TableCell className="text-xs">{s.date}</TableCell><TableCell className="text-xs font-mono text-right">{s.hours}</TableCell><TableCell className="text-xs font-mono text-right">{s.ot_hours > 0 ? s.ot_hours : '-'}</TableCell><TableCell className="text-xs font-mono text-right">${s.total_pay.toFixed(2)}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
          {data.employees?.length === 0 && <p className="text-xs text-muted-foreground">No shift data found for this week.</p>}
        </>
      )}
    </div>
  );
}
