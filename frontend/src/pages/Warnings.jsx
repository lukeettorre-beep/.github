import React, { useEffect, useState } from 'react';
import { getAuditTrail } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Warning as WarningIcon, ShieldWarning, Info } from '@phosphor-icons/react';

export default function Warnings() {
  const [audits, setAudits] = useState([]);
  const [allWarnings, setAllWarnings] = useState([]);

  useEffect(() => {
    getAuditTrail().then(data => {
      setAudits(data);
      const ws = [];
      data.forEach(a => {
        if (a.plain_english?.section_e && !a.plain_english.section_e.includes('No items require')) {
          ws.push({
            timestamp: a.timestamp,
            employee_id: a.employee_id,
            award_code: a.award_code,
            shift_date: a.shift_date,
            message: a.plain_english.section_e,
          });
        }
      });
      setAllWarnings(ws);
    }).catch(console.error);
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6" data-testid="warnings-page">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight">
          Compliance Warnings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review all compliance warnings from recent calculations.
        </p>
      </div>

      {/* General Compliance Info */}
      <Card className="rounded-sm border border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
        <CardContent className="p-4 flex items-start gap-3">
          <ShieldWarning size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold">Important Compliance Notice</p>
            <p className="text-xs text-muted-foreground mt-1">
              This tool provides estimates based on the Fair Work Act 2009 and the selected Modern Awards.
              Always verify results with a qualified payroll professional. Break provisions, overtime triggers,
              and minimum engagement rules must be checked for each individual circumstance.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Common Compliance Areas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-sm border">
          <CardContent className="p-4">
            <WarningIcon size={20} className="text-red-500 mb-2" />
            <h3 className="text-xs font-semibold mb-1">Break Compliance</h3>
            <p className="text-[10px] text-muted-foreground">
              Meal breaks must be provided within 5 hours (Clerks) or 5.5 hours (RTD).
              Missed breaks trigger penalty rates (200% from breach point).
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-sm border">
          <CardContent className="p-4">
            <WarningIcon size={20} className="text-amber-500 mb-2" />
            <h3 className="text-xs font-semibold mb-1">Minimum Engagement</h3>
            <p className="text-[10px] text-muted-foreground">
              Casual/PT: 4hrs (RTD), 3hrs Saturday (Clerks), 4hrs Sunday/PH.
              RTLDO casual: 500km or 8hrs minimum.
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-sm border">
          <CardContent className="p-4">
            <Info size={20} className="text-blue-500 mb-2" />
            <h3 className="text-xs font-semibold mb-1">RTD Casual OT</h3>
            <p className="text-[10px] text-muted-foreground">
              Under RTD Cl 11.4, casual overtime is calculated at the OT rate + 10% of minimum hourly —
              the standard 25% casual loading does NOT apply during overtime.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Warning History */}
      <Card className="rounded-sm border">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm">Warning History ({allWarnings.length} items)</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          {allWarnings.length === 0 ? (
            <p className="text-xs text-muted-foreground">No compliance warnings recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {allWarnings.map((w, i) => (
                <div key={i} className="border-l-2 border-amber-500 pl-3 py-1">
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-1">
                    <span className="font-mono">{w.employee_id}</span>
                    <span>|</span>
                    <span>{w.award_code}</span>
                    <span>|</span>
                    <span>{w.shift_date}</span>
                  </div>
                  <p className="text-xs whitespace-pre-line">{w.message}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
