import React, { useEffect, useState } from 'react';
import { getAuditTrail, exportAuditCSV, clearAuditTrail } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '../components/ui/table';
import { DownloadSimple, Trash, ClockCounterClockwise } from '@phosphor-icons/react';
import { toast } from 'sonner';

export default function AuditTrail() {
  const [audits, setAudits] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    loadAudits();
  }, []);

  const loadAudits = () => {
    getAuditTrail().then(setAudits).catch(console.error);
  };

  const handleExportCSV = () => {
    const url = exportAuditCSV();
    window.open(url, '_blank');
    toast.success('CSV download started.');
  };

  const handleClear = async () => {
    if (window.confirm('Clear all audit trail entries? This cannot be undone.')) {
      await clearAuditTrail();
      setAudits([]);
      toast.success('Audit trail cleared.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6" data-testid="audit-trail-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight">
            Audit Trail
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete history of all calculations. {audits.length} entries recorded.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-sm text-xs" onClick={handleExportCSV} data-testid="export-csv-btn">
            <DownloadSimple size={14} className="mr-1" /> Export CSV
          </Button>
          <Button variant="outline" className="rounded-sm text-xs text-red-600 hover:text-red-700" onClick={handleClear} data-testid="clear-audit-btn">
            <Trash size={14} className="mr-1" /> Clear
          </Button>
        </div>
      </div>

      <Card className="rounded-sm border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table data-testid="audit-table">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Timestamp</TableHead>
                  <TableHead className="text-xs">Employee</TableHead>
                  <TableHead className="text-xs">Award</TableHead>
                  <TableHead className="text-xs">Shift Date</TableHead>
                  <TableHead className="text-xs">Action</TableHead>
                  <TableHead className="text-xs text-right">Total Pay</TableHead>
                  <TableHead className="text-xs">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {audits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-xs text-muted-foreground py-8">
                      No audit entries yet. Complete a calculation to see results here.
                    </TableCell>
                  </TableRow>
                ) : (
                  audits.map((a, i) => (
                    <React.Fragment key={a.id || i}>
                      <TableRow className="cursor-pointer hover:bg-secondary/50" onClick={() => setExpanded(expanded === i ? null : i)}>
                        <TableCell className="text-[10px] font-mono">{new Date(a.timestamp).toLocaleString()}</TableCell>
                        <TableCell className="text-xs font-medium">{a.employee_id}</TableCell>
                        <TableCell className="text-xs font-mono">{a.award_code}</TableCell>
                        <TableCell className="text-xs">{a.shift_date}</TableCell>
                        <TableCell className="text-xs">
                          <span className={`px-1.5 py-0.5 text-[10px] rounded-sm ${
                            a.action === 'CALCULATION' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200'
                          }`}>{a.action}</span>
                        </TableCell>
                        <TableCell className="text-xs font-mono text-right font-bold">${a.total_pay?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell className="text-xs">
                          <button className="text-muted-foreground hover:text-foreground" data-testid={`expand-audit-${i}`}>
                            {expanded === i ? '▾' : '▸'}
                          </button>
                        </TableCell>
                      </TableRow>
                      {expanded === i && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-secondary/30 p-4">
                            <div className="space-y-3">
                              <div>
                                <h4 className="text-[10px] font-semibold uppercase tracking-wider mb-1">Components</h4>
                                {a.components?.map((c, ci) => (
                                  <div key={ci} className="flex justify-between text-[10px] py-0.5 border-b border-border last:border-0">
                                    <span>{c.component}</span>
                                    <span className="font-mono">${c.amount?.toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                              {a.plain_english && (
                                <div>
                                  <h4 className="text-[10px] font-semibold uppercase tracking-wider mb-1">Summary</h4>
                                  <p className="text-[10px] text-muted-foreground">{a.plain_english.section_a}</p>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
