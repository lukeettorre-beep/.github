import React, { useState, useEffect } from 'react';
import { getAnalyticsSummary, getAnalyticsTrends } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChartBar, Users, CurrencyDollar, TrendUp } from '@phosphor-icons/react';

const COLORS = ['#18181B', '#3F3F46', '#71717A', '#A1A1AA'];

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState(null);

  useEffect(() => {
    getAnalyticsSummary().then(setSummary).catch(() => {});
    getAnalyticsTrends().then(setTrends).catch(() => {});
  }, []);

  if (!summary) return <div className="max-w-6xl mx-auto p-8 text-sm text-muted-foreground">Loading analytics...</div>;

  const totalPay = summary.by_award.reduce((s, a) => s + a.total_pay, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6" data-testid="analytics-page">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2"><ChartBar size={24} /> Analytics Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Payroll costs, trends, and insights across all calculations.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-sm border" data-testid="kpi-total-calcs">
          <CardContent className="p-4"><ChartBar size={20} className="text-muted-foreground mb-1" /><p className="text-2xl font-mono font-bold">{summary.total_calculations}</p><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Calculations</p></CardContent>
        </Card>
        <Card className="rounded-sm border" data-testid="kpi-total-employees">
          <CardContent className="p-4"><Users size={20} className="text-muted-foreground mb-1" /><p className="text-2xl font-mono font-bold">{summary.total_employees}</p><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Employees</p></CardContent>
        </Card>
        <Card className="rounded-sm border" data-testid="kpi-total-pay">
          <CardContent className="p-4"><CurrencyDollar size={20} className="text-muted-foreground mb-1" /><p className="text-2xl font-mono font-bold">${totalPay.toFixed(2)}</p><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Payroll</p></CardContent>
        </Card>
        <Card className="rounded-sm border" data-testid="kpi-avg-shift">
          <CardContent className="p-4"><TrendUp size={20} className="text-muted-foreground mb-1" /><p className="text-2xl font-mono font-bold">${summary.total_calculations > 0 ? (totalPay / summary.total_calculations).toFixed(2) : '0'}</p><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Shift Cost</p></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pay by Award (Pie) */}
        <Card className="rounded-sm border">
          <CardHeader className="p-4 pb-2"><CardTitle className="text-sm">Pay by Award</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0">
            {summary.by_award.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={summary.by_award} dataKey="total_pay" nameKey="award_code" cx="50%" cy="50%" outerRadius={70} label={({ award_code, total_pay }) => `${award_code}: $${total_pay.toFixed(0)}`} labelLine={false}>
                    {summary.by_award.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `$${v.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-xs text-muted-foreground">No data yet.</p>}
          </CardContent>
        </Card>

        {/* Monthly Trend (Bar) */}
        <Card className="rounded-sm border">
          <CardHeader className="p-4 pb-2"><CardTitle className="text-sm">Monthly Payroll Trend</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0">
            {trends?.monthly?.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={trends.monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
                  <Tooltip formatter={(v) => `$${v.toFixed(2)}`} />
                  <Bar dataKey="total_pay" fill="#18181B" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-xs text-muted-foreground">No trend data yet.</p>}
          </CardContent>
        </Card>
      </div>

      {/* Top Employees */}
      <Card className="rounded-sm border">
        <CardHeader className="p-4 pb-2"><CardTitle className="text-sm">Top Employees by Pay</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table data-testid="top-employees-table">
            <TableHeader><TableRow>
              <TableHead className="text-xs">#</TableHead><TableHead className="text-xs">Employee</TableHead><TableHead className="text-xs text-right">Shifts</TableHead><TableHead className="text-xs text-right">Total Pay</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {summary.top_employees.map((e, i) => (
                <TableRow key={i}>
                  <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="text-xs font-medium">{e.employee_id}</TableCell>
                  <TableCell className="text-xs font-mono text-right">{e.shift_count}</TableCell>
                  <TableCell className="text-xs font-mono text-right font-bold">${e.total_pay.toFixed(2)}</TableCell>
                </TableRow>
              ))}
              {summary.top_employees.length === 0 && <TableRow><TableCell colSpan={4} className="text-xs text-muted-foreground text-center py-4">No employee data.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
