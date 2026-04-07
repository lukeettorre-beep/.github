import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Export } from '@phosphor-icons/react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function PayrollExport() {
  const [format, setFormat] = useState('xero');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!dateFrom || !dateTo) { toast.error('Select date range.'); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/payroll-export/${format}`, { date_from: dateFrom, date_to: dateTo }, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `payroll_export_${format}_${dateFrom}_${dateTo}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${format.toUpperCase()} export downloaded.`);
    } catch { toast.error('Export failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="payroll-export-page">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2"><Export size={24} /> Payroll Export</h1>
        <p className="text-sm text-muted-foreground mt-1">Export calculated shift data in MYOB, Xero, or KeyPay CSV format for direct import into your payroll system.</p>
      </div>

      <Card className="rounded-sm border">
        <CardHeader className="p-4 pb-2"><CardTitle className="text-sm">Export Settings</CardTitle></CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <Label className="text-xs">Payroll System</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger className="rounded-sm mt-1 text-xs" data-testid="export-format-select"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="myob">MYOB</SelectItem>
                  <SelectItem value="xero">Xero</SelectItem>
                  <SelectItem value="keypay">KeyPay</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Date From</Label><Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="rounded-sm mt-1 text-xs" data-testid="export-date-from" /></div>
            <div><Label className="text-xs">Date To</Label><Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="rounded-sm mt-1 text-xs" data-testid="export-date-to" /></div>
            <Button className="rounded-sm text-xs" onClick={handleExport} disabled={loading} data-testid="export-btn"><Export size={14} className="mr-1.5" />{loading ? 'Exporting...' : 'Export CSV'}</Button>
          </div>
        </CardContent>
      </Card>

      {/* Format Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { name: 'MYOB', fields: 'Co./Last Name, First Name, Pay Date, Hours, Rate, Amount, Pay Item, Notes', desc: 'Compatible with MYOB AccountRight and MYOB Essentials import.' },
          { name: 'Xero', fields: 'EmployeeID, PayRunDate, EarningsType, Hours, Rate, Amount, Description', desc: 'Compatible with Xero Payroll earnings import.' },
          { name: 'KeyPay', fields: 'EmployeeID, Award, Date, Component, Hours, RateMultiplier, UnitRate, Amount, Clause', desc: 'Detailed format compatible with KeyPay / Employment Hero.' },
        ].map(f => (
          <Card key={f.name} className="rounded-sm border">
            <CardContent className="p-4">
              <h3 className="text-xs font-semibold mb-1">{f.name} Format</h3>
              <p className="text-[10px] text-muted-foreground mb-2">{f.desc}</p>
              <p className="text-[10px] font-mono bg-secondary p-2 rounded-sm">{f.fields}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
