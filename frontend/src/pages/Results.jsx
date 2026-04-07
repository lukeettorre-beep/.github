import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '../components/ui/table';
import {
  Clock, CurrencyDollar, Timer, TrendUp, Coffee, ArrowLeft, Printer
} from '@phosphor-icons/react';

export default function Results({ calculationResult: propResult }) {
  const navigate = useNavigate();
  const r = propResult || (() => {
    const saved = sessionStorage.getItem('ait-result');
    return saved ? JSON.parse(saved) : null;
  })();

  if (!r) {
    return (
      <div className="max-w-4xl mx-auto space-y-6" data-testid="results-page">
        <h1 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight">
          Step 4: Results
        </h1>
        <Card className="rounded-sm border">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground text-sm">No calculation results yet. Complete Steps 1-3 first.</p>
            <Button className="rounded-sm mt-4" onClick={() => navigate('/award-selector')} data-testid="go-to-step1-btn">
              Start from Step 1
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Hours', value: r.total_hours, icon: Clock, suffix: 'hrs' },
    { label: 'Ordinary Hours', value: r.ordinary_hours, icon: Timer, suffix: 'hrs' },
    { label: 'OT Hours', value: r.ot_hours, icon: TrendUp, suffix: 'hrs' },
    { label: 'Penalty Rate', value: `$${r.penalty_rate}`, icon: CurrencyDollar, suffix: '/hr' },
    { label: 'Est. Shift Pay', value: `$${r.estimated_pay.toFixed(2)}`, icon: CurrencyDollar, suffix: '', highlight: true },
    { label: 'Break Status', value: r.break_status, icon: Coffee, suffix: '', isStatus: true },
  ];

  const pe = r.plain_english || {};

  return (
    <div className="max-w-5xl mx-auto space-y-6" data-testid="results-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight">
            Step 4: Results
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Shift pay calculation breakdown.</p>
        </div>
        <Button variant="outline" className="rounded-sm" onClick={() => window.print()} data-testid="print-btn">
          <Printer size={16} className="mr-2" /> Print
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3" data-testid="kpi-row">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <Card key={i} className={`rounded-sm border ${kpi.highlight ? 'border-foreground bg-foreground text-background' : ''}`} data-testid={`kpi-${kpi.label.toLowerCase().replace(/\s/g, '-')}`}>
              <CardContent className="p-3 text-center">
                <Icon size={18} className={`mx-auto mb-1 ${kpi.highlight ? 'text-background' : 'text-muted-foreground'}`} />
                <p className={`text-lg font-mono font-bold ${kpi.isStatus ? (r.break_status === 'Compliant' ? 'text-emerald-600' : 'text-red-500') : ''}`}>
                  {kpi.value}{kpi.suffix && !String(kpi.value).includes('$') ? ` ${kpi.suffix}` : ''}
                </p>
                <p className={`text-[10px] uppercase tracking-wider ${kpi.highlight ? 'text-background/70' : 'text-muted-foreground'}`}>
                  {kpi.label}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pay Component Breakdown */}
      <Card className="rounded-sm border">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm">Pay Component Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table data-testid="component-table">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Component</TableHead>
                  <TableHead className="text-xs text-right">Qty</TableHead>
                  <TableHead className="text-xs text-right">Rate Mult.</TableHead>
                  <TableHead className="text-xs text-right">Unit Rate</TableHead>
                  <TableHead className="text-xs text-right">Amount</TableHead>
                  <TableHead className="text-xs">Clause</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {r.components.map((c, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs font-medium">{c.component}</TableCell>
                    <TableCell className="text-xs font-mono text-right">{c.quantity}</TableCell>
                    <TableCell className="text-xs font-mono text-right">{c.rate_mult}x</TableCell>
                    <TableCell className="text-xs font-mono text-right">${c.unit_rate}</TableCell>
                    <TableCell className="text-xs font-mono text-right font-bold">${c.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-[10px] text-muted-foreground">{c.clause}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-secondary">
                  <TableCell className="text-xs font-bold" colSpan={4}>TOTAL</TableCell>
                  <TableCell className="text-xs font-mono text-right font-bold">${r.estimated_pay.toFixed(2)}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Plain English Sections */}
      <Card className="rounded-sm border" data-testid="plain-english">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm">Plain English Explanation</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          {[
            { key: 'section_a', title: 'A — What the employee did', color: 'border-l-blue-500' },
            { key: 'section_b', title: 'B — Rules triggered', color: 'border-l-amber-500' },
            { key: 'section_c', title: 'C — Assumptions used', color: 'border-l-zinc-400' },
            { key: 'section_d', title: 'D — Likely entitlement', color: 'border-l-emerald-500' },
            { key: 'section_e', title: 'E — Items needing review', color: 'border-l-red-500' },
          ].map(sec => (
            <div key={sec.key} className={`border-l-4 ${sec.color} pl-4 py-2`} data-testid={`plain-${sec.key}`}>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-1">{sec.title}</h3>
              <p className="text-xs text-muted-foreground whitespace-pre-line">{pe[sec.key] || 'N/A'}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Warnings if any */}
      {r.warnings && r.warnings.length > 0 && (
        <Card className="rounded-sm border border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800" data-testid="result-warnings">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm text-red-700 dark:text-red-400">Compliance Warnings</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {r.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 mb-2">
                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-sm ${
                  w.severity === 'high' ? 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                }`}>{w.severity}</span>
                <p className="text-xs">{w.message} <span className="text-muted-foreground">({w.clause})</span></p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => navigate('/shift-input')} className="rounded-sm" data-testid="back-to-shift-btn">
          <ArrowLeft size={16} className="mr-2" /> Modify Shift
        </Button>
        <Button onClick={() => navigate('/audit-trail')} className="rounded-sm" data-testid="view-audit-btn">
          View Audit Trail
        </Button>
      </div>
    </div>
  );
}
