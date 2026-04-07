import React, { useState, useRef, useCallback } from 'react';
import { batchCalculate, batchTemplateCSV } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import {
  UploadSimple, DownloadSimple, Play, Trash,
  FileText, CheckCircle, XCircle, Warning, Export
} from '@phosphor-icons/react';
import { toast } from 'sonner';

const BOOL_TRUTHY = new Set(['true', '1', 'yes', 'y']);

function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    if (vals.length < 4 || !vals[0]) continue;
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = vals[idx] || '';
    });
    // Type coercions
    row.pay_rate = parseFloat(row.pay_rate) || 0;
    row.unpaid_break_mins = parseInt(row.unpaid_break_mins) || 0;
    row.hours_this_week = parseFloat(row.hours_this_week) || 0;
    row.km_driven = parseFloat(row.km_driven) || 0;
    row.loading_hours = parseFloat(row.loading_hours) || 0;
    row.meal_break_at = parseInt(row.meal_break_at) || 0;
    row.delay_hours = parseFloat(row.delay_hours) || 0;
    row.age = parseInt(row.age) || 21;
    row.first_aid = BOOL_TRUTHY.has((row.first_aid || '').toLowerCase());
    row.dangerous_goods = BOOL_TRUTHY.has((row.dangerous_goods || '').toLowerCase());
    row.ot_meal = BOOL_TRUTHY.has((row.ot_meal || '').toLowerCase());
    row.early_morning = BOOL_TRUTHY.has((row.early_morning || '').toLowerCase());
    row.own_vehicle = BOOL_TRUTHY.has((row.own_vehicle || '').toLowerCase());
    row.delay_breakdown = BOOL_TRUTHY.has((row.delay_breakdown || '').toLowerCase());
    row.is_junior = BOOL_TRUTHY.has((row.is_junior || '').toLowerCase());
    row.pt_non_agreed_day = BOOL_TRUTHY.has((row.pt_non_agreed_day || '').toLowerCase());
    row.fatigue_plan = BOOL_TRUTHY.has((row.fatigue_plan || '').toLowerCase());
    row.is_public_holiday = row.is_public_holiday || 'no';
    row.employment_type = row.employment_type || 'full_time';
    row.shiftwork = row.shiftwork || 'none';
    row.payment_method = row.payment_method || 'hourly';
    row.loading_unloading = row.loading_unloading || 'no';
    rows.push(row);
  }
  return rows;
}

function exportResultsCSV(results, summary) {
  const lines = [];
  lines.push(['Row', 'Employee', 'Award', 'Date', 'Total Hours', 'Ordinary', 'OT', 'Est Pay', 'Break Status', 'Warnings'].join(','));
  results.forEach(r => {
    const warningCount = (r.warnings || []).length;
    lines.push([
      r.row, r.employee_id, r.award_code, r.date,
      r.total_hours, r.ordinary_hours, r.ot_hours,
      r.estimated_pay.toFixed(2), r.break_status, warningCount
    ].join(','));
  });
  lines.push('');
  lines.push(`SUMMARY,Shifts:${summary.successful}/${summary.total_shifts},Total Pay:$${summary.total_pay.toFixed(2)},Total Hours:${summary.total_hours},OT Hours:${summary.total_ot_hours}`);
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `batch_results_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function BatchImport() {
  const [parsedRows, setParsedRows] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = useCallback((file) => {
    if (!file || !file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const rows = parseCSV(e.target.result);
      if (rows.length === 0) {
        toast.error('No valid rows found in CSV.');
        return;
      }
      setParsedRows(rows);
      setResults(null);
      toast.success(`Parsed ${rows.length} shifts from CSV.`);
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    handleFile(file);
  }, [handleFile]);

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleCalculateAll = async () => {
    if (parsedRows.length === 0) return;
    setLoading(true);
    try {
      const resp = await batchCalculate(parsedRows);
      setResults(resp);
      if (resp.errors?.length > 0) {
        toast.warning(`${resp.summary.successful} succeeded, ${resp.summary.failed} failed.`);
      } else {
        toast.success(`All ${resp.summary.successful} shifts calculated. Total: $${resp.summary.total_pay.toFixed(2)}`);
      }
    } catch (err) {
      toast.error('Batch calculation failed.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setParsedRows([]);
    setResults(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6" data-testid="batch-import-page">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight">
          Batch Import
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload a CSV file of shifts to calculate pay for an entire week or pay run at once.
        </p>
      </div>

      {/* Template Download + Upload */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          className="rounded-sm text-xs"
          onClick={() => window.open(batchTemplateCSV(), '_blank')}
          data-testid="download-template-btn"
        >
          <DownloadSimple size={14} className="mr-1.5" />
          Download CSV Template
        </Button>
        {parsedRows.length > 0 && (
          <Button
            variant="outline"
            className="rounded-sm text-xs text-red-600 hover:text-red-700"
            onClick={handleClear}
            data-testid="clear-import-btn"
          >
            <Trash size={14} className="mr-1.5" />
            Clear
          </Button>
        )}
      </div>

      {/* Drop Zone */}
      {parsedRows.length === 0 && (
        <Card
          className={`rounded-sm border-2 border-dashed cursor-pointer transition-colors ${
            dragOver ? 'border-foreground bg-secondary' : 'border-border hover:border-foreground/50'
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          data-testid="csv-dropzone"
        >
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <UploadSimple size={40} className="text-muted-foreground mb-3" />
            <p className="text-sm font-medium mb-1">
              {dragOver ? 'Drop CSV file here' : 'Click or drag CSV file to upload'}
            </p>
            <p className="text-[10px] text-muted-foreground">
              CSV format: employee_id, award_code, employment_type, classification, pay_rate, date, start_time, finish_time, ...
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileInput}
              data-testid="csv-file-input"
            />
          </CardContent>
        </Card>
      )}

      {/* Preview Table */}
      {parsedRows.length > 0 && !results && (
        <Card className="rounded-sm border">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText size={16} />
              Preview — {parsedRows.length} shifts loaded
            </CardTitle>
            <Button
              onClick={handleCalculateAll}
              disabled={loading}
              className="rounded-sm text-xs"
              data-testid="batch-calculate-btn"
            >
              {loading ? (
                <>Calculating...</>
              ) : (
                <>
                  <Play size={14} className="mr-1.5" />
                  Calculate All ({parsedRows.length})
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table data-testid="preview-table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">#</TableHead>
                    <TableHead className="text-xs">Employee</TableHead>
                    <TableHead className="text-xs">Award</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Class.</TableHead>
                    <TableHead className="text-xs text-right">Rate</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Day</TableHead>
                    <TableHead className="text-xs">Start</TableHead>
                    <TableHead className="text-xs">Finish</TableHead>
                    <TableHead className="text-xs text-right">Break</TableHead>
                    <TableHead className="text-xs">PH</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedRows.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs font-mono text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="text-xs font-medium">{row.employee_id}</TableCell>
                      <TableCell className="text-xs font-mono">{row.award_code}</TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="outline" className="text-[10px] rounded-sm">
                          {row.employment_type === 'full_time' ? 'FT' : row.employment_type === 'part_time' ? 'PT' : 'CAS'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono">{row.classification}</TableCell>
                      <TableCell className="text-xs font-mono text-right">${row.pay_rate.toFixed(2)}</TableCell>
                      <TableCell className="text-xs">{row.date}</TableCell>
                      <TableCell className="text-xs">{row.day_of_week}</TableCell>
                      <TableCell className="text-xs font-mono">{row.start_time}</TableCell>
                      <TableCell className="text-xs font-mono">{row.finish_time}</TableCell>
                      <TableCell className="text-xs font-mono text-right">{row.unpaid_break_mins}m</TableCell>
                      <TableCell className="text-xs">{row.is_public_holiday !== 'no' ? 'Yes' : ''}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results && (
        <>
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3" data-testid="batch-summary">
            <Card className="rounded-sm border">
              <CardContent className="p-3 text-center">
                <p className="text-lg font-mono font-bold">{results.summary.total_shifts}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Shifts</p>
              </CardContent>
            </Card>
            <Card className="rounded-sm border">
              <CardContent className="p-3 text-center">
                <p className="text-lg font-mono font-bold text-emerald-600">{results.summary.successful}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Successful</p>
              </CardContent>
            </Card>
            <Card className="rounded-sm border">
              <CardContent className="p-3 text-center">
                <p className={`text-lg font-mono font-bold ${results.summary.failed > 0 ? 'text-red-500' : ''}`}>
                  {results.summary.failed}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Failed</p>
              </CardContent>
            </Card>
            <Card className="rounded-sm border">
              <CardContent className="p-3 text-center">
                <p className="text-lg font-mono font-bold">{results.summary.total_hours}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Hours</p>
              </CardContent>
            </Card>
            <Card className="rounded-sm border">
              <CardContent className="p-3 text-center">
                <p className="text-lg font-mono font-bold">{results.summary.total_ot_hours}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">OT Hours</p>
              </CardContent>
            </Card>
            <Card className="rounded-sm border border-foreground bg-foreground text-background">
              <CardContent className="p-3 text-center">
                <p className="text-lg font-mono font-bold">${results.summary.total_pay.toFixed(2)}</p>
                <p className="text-[10px] uppercase tracking-wider opacity-70">Total Pay</p>
              </CardContent>
            </Card>
          </div>

          {/* Errors */}
          {results.errors?.length > 0 && (
            <Card className="rounded-sm border border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800" data-testid="batch-errors">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
                  <XCircle size={16} /> {results.errors.length} Error(s)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {results.errors.map((err, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs mb-1">
                    <span className="font-mono text-muted-foreground">Row {err.row}:</span>
                    <span className="text-red-600 dark:text-red-400">{err.error}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Results Table */}
          <Card className="rounded-sm border">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Calculation Results</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="rounded-sm text-xs"
                  onClick={() => exportResultsCSV(results.results, results.summary)}
                  data-testid="export-batch-results-btn"
                >
                  <Export size={14} className="mr-1.5" />
                  Export Results CSV
                </Button>
                <Button
                  variant="outline"
                  className="rounded-sm text-xs"
                  onClick={() => { setParsedRows([]); setResults(null); }}
                  data-testid="new-batch-btn"
                >
                  <UploadSimple size={14} className="mr-1.5" />
                  New Batch
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table data-testid="batch-results-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">#</TableHead>
                      <TableHead className="text-xs">Employee</TableHead>
                      <TableHead className="text-xs">Award</TableHead>
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs text-right">Total Hrs</TableHead>
                      <TableHead className="text-xs text-right">Ordinary</TableHead>
                      <TableHead className="text-xs text-right">OT</TableHead>
                      <TableHead className="text-xs text-right">Eff. Rate</TableHead>
                      <TableHead className="text-xs text-right">Est. Pay</TableHead>
                      <TableHead className="text-xs">Break</TableHead>
                      <TableHead className="text-xs">Alerts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.results.map((r, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs font-mono text-muted-foreground">{r.row}</TableCell>
                        <TableCell className="text-xs font-medium">{r.employee_id}</TableCell>
                        <TableCell className="text-xs font-mono">{r.award_code}</TableCell>
                        <TableCell className="text-xs">{r.date}</TableCell>
                        <TableCell className="text-xs font-mono text-right">{r.total_hours}</TableCell>
                        <TableCell className="text-xs font-mono text-right">{r.ordinary_hours}</TableCell>
                        <TableCell className="text-xs font-mono text-right">{r.ot_hours > 0 ? r.ot_hours : '-'}</TableCell>
                        <TableCell className="text-xs font-mono text-right">${r.penalty_rate}</TableCell>
                        <TableCell className="text-xs font-mono text-right font-bold">${r.estimated_pay.toFixed(2)}</TableCell>
                        <TableCell className="text-xs">
                          {r.break_status === 'Compliant' ? (
                            <CheckCircle size={14} className="text-emerald-600" />
                          ) : (
                            <XCircle size={14} className="text-red-500" />
                          )}
                        </TableCell>
                        <TableCell className="text-xs">
                          {(r.warnings || []).length > 0 && (
                            <Badge variant="outline" className="text-[10px] rounded-sm border-amber-400 text-amber-600">
                              <Warning size={10} className="mr-0.5" />
                              {r.warnings.length}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Totals row */}
                    <TableRow className="bg-secondary font-bold">
                      <TableCell className="text-xs" colSpan={4}>TOTALS</TableCell>
                      <TableCell className="text-xs font-mono text-right">{results.summary.total_hours}</TableCell>
                      <TableCell className="text-xs font-mono text-right">
                        {results.results.reduce((s, r) => s + r.ordinary_hours, 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-right">{results.summary.total_ot_hours}</TableCell>
                      <TableCell className="text-xs text-right">—</TableCell>
                      <TableCell className="text-xs font-mono text-right">${results.summary.total_pay.toFixed(2)}</TableCell>
                      <TableCell colSpan={2}></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
