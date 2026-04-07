import React, { useState, useEffect } from 'react';
import { getRateTables, updateRateTable } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '../components/ui/table';
import { GearSix, Lock, FloppyDisk } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { AWARDS } from '../lib/constants';

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [rateTables, setRateTables] = useState([]);
  const [editingTable, setEditingTable] = useState(null);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    if (authenticated) {
      getRateTables().then(setRateTables).catch(console.error);
    }
  }, [authenticated]);

  const handleLogin = () => {
    if (password === 'admin123') {
      setAuthenticated(true);
      toast.success('Admin access granted.');
    } else {
      toast.error('Invalid password.');
    }
  };

  const handleEdit = (table) => {
    setEditingTable(table.award_code);
    setEditData(JSON.parse(JSON.stringify(table)));
  };

  const handleRateChange = (classIdx, field, value) => {
    setEditData(prev => {
      const next = { ...prev };
      next.classifications = [...next.classifications];
      next.classifications[classIdx] = {
        ...next.classifications[classIdx],
        [field]: parseFloat(value) || 0,
      };
      return next;
    });
  };

  const handlePenaltyChange = (key, value) => {
    setEditData(prev => ({
      ...prev,
      penalty_rates: { ...prev.penalty_rates, [key]: parseFloat(value) || value },
    }));
  };

  const handleSave = async () => {
    try {
      await updateRateTable(editingTable, editData);
      toast.success('Rate table updated.');
      setEditingTable(null);
      getRateTables().then(setRateTables);
    } catch {
      toast.error('Failed to save.');
    }
  };

  if (!authenticated) {
    return (
      <div className="max-w-sm mx-auto mt-20 space-y-6" data-testid="admin-login">
        <Card className="rounded-sm border">
          <CardHeader className="p-6 pb-2 text-center">
            <Lock size={32} className="mx-auto mb-2 text-muted-foreground" />
            <CardTitle className="text-lg">Admin Access</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Enter the admin password to manage rate tables.</p>
          </CardHeader>
          <CardContent className="p-6 pt-4 space-y-4">
            <div>
              <Label className="text-xs">Password</Label>
              <Input
                type="password"
                data-testid="admin-password-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="rounded-sm mt-1"
                placeholder="Enter password..."
              />
            </div>
            <Button onClick={handleLogin} className="w-full rounded-sm" data-testid="admin-login-btn">
              <Lock size={14} className="mr-2" /> Unlock
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6" data-testid="admin-page">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2">
          <GearSix size={24} /> Admin Panel
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage pay rate tables for all awards. Changes propagate to calculations immediately.
        </p>
      </div>

      <Tabs defaultValue="MA000002">
        <TabsList className="rounded-sm">
          {Object.values(AWARDS).map(a => (
            <TabsTrigger key={a.code} value={a.code} className="rounded-sm text-xs" data-testid={`admin-tab-${a.code}`}>
              {a.shortName}
            </TabsTrigger>
          ))}
        </TabsList>

        {rateTables.map(rt => (
          <TabsContent key={rt.award_code} value={rt.award_code}>
            <Card className="rounded-sm border">
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm">{rt.award_name}</CardTitle>
                  <p className="text-[10px] text-muted-foreground">
                    Last updated: {rt.updated_at ? new Date(rt.updated_at).toLocaleString() : 'Never'}
                  </p>
                </div>
                {editingTable !== rt.award_code ? (
                  <Button
                    variant="outline"
                    className="rounded-sm text-xs"
                    onClick={() => handleEdit(rt)}
                    data-testid={`edit-${rt.award_code}-btn`}
                  >
                    Edit Rates
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button className="rounded-sm text-xs" onClick={handleSave} data-testid={`save-${rt.award_code}-btn`}>
                      <FloppyDisk size={14} className="mr-1" /> Save
                    </Button>
                    <Button variant="outline" className="rounded-sm text-xs" onClick={() => setEditingTable(null)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table data-testid={`admin-table-${rt.award_code}`}>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Code</TableHead>
                        <TableHead className="text-xs">Name</TableHead>
                        <TableHead className="text-xs text-right">Hourly Rate</TableHead>
                        {rt.award_code === 'MA000039' && <TableHead className="text-xs text-right">CPK Rate</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(editingTable === rt.award_code ? editData.classifications : rt.classifications).map((c, ci) => (
                        <TableRow key={c.code}>
                          <TableCell className="text-xs font-mono">{c.code}</TableCell>
                          <TableCell className="text-xs">{c.name}</TableCell>
                          <TableCell className="text-xs text-right">
                            {editingTable === rt.award_code ? (
                              <Input
                                type="number"
                                step="0.01"
                                value={c.hourly_rate}
                                onChange={e => handleRateChange(ci, 'hourly_rate', e.target.value)}
                                className="rounded-sm w-24 ml-auto font-mono text-right"
                                data-testid={`rate-input-${c.code}`}
                              />
                            ) : (
                              <span className="font-mono">${c.hourly_rate.toFixed(2)}</span>
                            )}
                          </TableCell>
                          {rt.award_code === 'MA000039' && (
                            <TableCell className="text-xs text-right">
                              {editingTable === rt.award_code ? (
                                <Input
                                  type="number"
                                  step="0.001"
                                  value={c.cpk_rate || 0}
                                  onChange={e => handleRateChange(ci, 'cpk_rate', e.target.value)}
                                  className="rounded-sm w-24 ml-auto font-mono text-right"
                                />
                              ) : (
                                <span className="font-mono">${c.cpk_rate ? c.cpk_rate.toFixed(3) : '—'}</span>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Penalty Rates */}
                <div className="p-4 border-t">
                  <h4 className="text-xs font-semibold mb-3">Penalty Rate Multipliers</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(editingTable === rt.award_code ? editData.penalty_rates : rt.penalty_rates).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between bg-secondary p-2 rounded-sm">
                        <span className="text-[10px] text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                        {editingTable === rt.award_code ? (
                          <Input
                            type="text"
                            value={val}
                            onChange={e => handlePenaltyChange(key, e.target.value)}
                            className="rounded-sm w-20 font-mono text-xs text-right"
                          />
                        ) : (
                          <span className="font-mono text-xs font-medium">
                            {typeof val === 'number' ? (val < 10 ? `${val}x` : val) : val}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
