import React, { useState, useEffect } from 'react';
import { getRateAlerts, resetRateDefaults } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Bell, Warning, Info, ArrowCounterClockwise } from '@phosphor-icons/react';
import { toast } from 'sonner';

export default function RateAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = () => {
    setLoading(true);
    getRateAlerts().then(data => { setAlerts(data.alerts || []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { loadAlerts(); }, []);

  const handleReset = async (code) => {
    if (!window.confirm(`Reset ${code} to default rates?`)) return;
    await resetRateDefaults(code);
    toast.success(`${code} reset to defaults.`);
    loadAlerts();
  };

  const highAlerts = alerts.filter(a => a.severity === 'high');
  const medAlerts = alerts.filter(a => a.severity === 'medium');
  const infoAlerts = alerts.filter(a => a.severity === 'info');

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="rate-alerts-page">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2"><Bell size={24} /> Rate Update Alerts</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor rate table freshness and detect custom rate deviations. Fair Work rates update annually (1 July).</p>
      </div>

      {loading ? <p className="text-xs text-muted-foreground">Checking rates...</p> : (
        <>
          {alerts.length === 0 ? (
            <Card className="rounded-sm border border-emerald-400">
              <CardContent className="p-6 text-center"><p className="text-sm text-emerald-600 font-medium">All rate tables are up to date. No alerts.</p></CardContent>
            </Card>
          ) : (
            <>
              <div className="flex gap-3">
                <Badge variant="outline" className="rounded-sm text-xs border-red-400 text-red-600">{highAlerts.length} Critical</Badge>
                <Badge variant="outline" className="rounded-sm text-xs border-amber-400 text-amber-600">{medAlerts.length} Warning</Badge>
                <Badge variant="outline" className="rounded-sm text-xs border-blue-400 text-blue-600">{infoAlerts.length} Info</Badge>
              </div>

              {highAlerts.length > 0 && (
                <Card className="rounded-sm border border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
                  <CardHeader className="p-4 pb-2"><CardTitle className="text-sm text-red-700 dark:text-red-400 flex items-center gap-2"><Warning size={16} /> Critical Alerts</CardTitle></CardHeader>
                  <CardContent className="p-4 pt-0 space-y-2">
                    {highAlerts.map((a, i) => (
                      <div key={i} className="flex items-start justify-between gap-3">
                        <div><p className="text-xs font-medium">{a.award_name || a.award_code}</p><p className="text-[10px] text-muted-foreground">{a.message}</p></div>
                        <Button size="sm" variant="outline" className="rounded-sm text-[10px] flex-shrink-0" onClick={() => handleReset(a.award_code)} data-testid={`reset-${a.award_code}`}><ArrowCounterClockwise size={10} className="mr-1" /> Reset</Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {medAlerts.length > 0 && (
                <Card className="rounded-sm border border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
                  <CardHeader className="p-4 pb-2"><CardTitle className="text-sm text-amber-700 dark:text-amber-400">Warnings</CardTitle></CardHeader>
                  <CardContent className="p-4 pt-0 space-y-2">
                    {medAlerts.map((a, i) => (<div key={i}><p className="text-xs">{a.message}</p><p className="text-[10px] text-muted-foreground">Last updated: {a.last_updated ? new Date(a.last_updated).toLocaleDateString() : 'Unknown'}</p></div>))}
                  </CardContent>
                </Card>
              )}

              {infoAlerts.length > 0 && (
                <Card className="rounded-sm border">
                  <CardHeader className="p-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><Info size={16} /> Custom Rate Deviations</CardTitle></CardHeader>
                  <CardContent className="p-4 pt-0 space-y-1">
                    {infoAlerts.map((a, i) => (
                      <div key={i} className="flex items-center justify-between text-xs bg-secondary p-2 rounded-sm">
                        <span>{a.award_code} / {a.classification}: <span className="font-mono">${a.current_rate?.toFixed(2)}</span></span>
                        <span className="text-muted-foreground">Default: <span className="font-mono">${a.default_rate?.toFixed(2)}</span></span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
