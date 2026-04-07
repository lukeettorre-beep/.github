import React, { useState, useRef } from 'react';
import { bulkImportEmployees, employeeTemplateCSV } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { UploadSimple, DownloadSimple, Users, CheckCircle, XCircle } from '@phosphor-icons/react';
import { toast } from 'sonner';

function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row = {};
    headers.forEach((h, idx) => { row[h] = vals[idx] || ''; });
    row.pay_rate = parseFloat(row.pay_rate) || 0;
    return row;
  }).filter(r => r.employee_id);
}

export default function BulkEmployeeImport() {
  const [rows, setRows] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseCSV(ev.target.result);
      setRows(parsed);
      setResult(null);
      toast.success(`Parsed ${parsed.length} employees.`);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImport = async () => {
    setLoading(true);
    try {
      const res = await bulkImportEmployees(rows);
      setResult(res);
      toast.success(`Imported ${res.imported} employees.`);
    } catch { toast.error('Import failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6" data-testid="bulk-employee-import-page">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2"><Users size={24} /> Bulk Employee Import</h1>
        <p className="text-sm text-muted-foreground mt-1">Import multiple employee profiles from a CSV file.</p>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="rounded-sm text-xs" onClick={() => window.open(employeeTemplateCSV(), '_blank')} data-testid="download-emp-template"><DownloadSimple size={14} className="mr-1.5" /> Download Template</Button>
        <Button variant="outline" className="rounded-sm text-xs" onClick={() => fileRef.current?.click()} data-testid="upload-emp-csv"><UploadSimple size={14} className="mr-1.5" /> Upload CSV</Button>
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
      </div>

      {rows.length > 0 && !result && (
        <Card className="rounded-sm border">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">{rows.length} Employees Ready</CardTitle>
            <Button className="rounded-sm text-xs" onClick={handleImport} disabled={loading} data-testid="import-employees-btn">{loading ? 'Importing...' : `Import ${rows.length}`}</Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table data-testid="employee-preview-table">
              <TableHeader><TableRow>
                <TableHead className="text-xs">#</TableHead><TableHead className="text-xs">Employee ID</TableHead><TableHead className="text-xs">Entity</TableHead><TableHead className="text-xs">Award</TableHead><TableHead className="text-xs">Type</TableHead><TableHead className="text-xs">Classification</TableHead><TableHead className="text-xs text-right">Rate</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="text-xs font-medium">{r.employee_id}</TableCell>
                    <TableCell className="text-xs">{r.employing_entity}</TableCell>
                    <TableCell className="text-xs font-mono">{r.award_code}</TableCell>
                    <TableCell className="text-xs"><Badge variant="outline" className="text-[10px] rounded-sm">{r.employment_type === 'full_time' ? 'FT' : r.employment_type === 'part_time' ? 'PT' : 'CAS'}</Badge></TableCell>
                    <TableCell className="text-xs font-mono">{r.classification}</TableCell>
                    <TableCell className="text-xs font-mono text-right">${r.pay_rate.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="rounded-sm border" data-testid="import-result">
          <CardContent className="p-6 text-center space-y-2">
            <CheckCircle size={32} weight="fill" className="text-emerald-600 mx-auto" />
            <p className="text-sm font-semibold">{result.imported} of {result.total} employees imported</p>
            {result.errors?.length > 0 && (
              <div className="mt-3 text-left">
                {result.errors.map((e, i) => (
                  <p key={i} className="text-xs text-red-500">Row {e.row}: {e.error}</p>
                ))}
              </div>
            )}
            <Button variant="outline" className="rounded-sm text-xs mt-3" onClick={() => { setRows([]); setResult(null); }}>Import More</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
