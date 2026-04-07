import React, { useState, useEffect } from 'react';
import { getRosterTemplates, createRosterTemplate, deleteRosterTemplate, generateFromRoster, batchCalculate } from '../lib/api';
import { AWARDS, EMPLOYMENT_TYPES, DAYS_OF_WEEK } from '../lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { CalendarBlank, Plus, Trash, Play, Copy } from '@phosphor-icons/react';
import { toast } from 'sonner';

export default function RosterTemplates() {
  const [templates, setTemplates] = useState([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', award_code: 'MA000002', employment_type: 'full_time', classification: '', shifts: [] });
  const [newShift, setNewShift] = useState({ day_of_week: 'Monday', start_time: '08:00', finish_time: '16:30', unpaid_break_mins: 30 });
  const [genForm, setGenForm] = useState({ template_id: '', week_start: '', employee_id: '' });
  const [genResult, setGenResult] = useState(null);

  useEffect(() => { getRosterTemplates().then(setTemplates).catch(() => {}); }, []);

  const addShiftToTemplate = () => {
    setForm(f => ({ ...f, shifts: [...f.shifts, { ...newShift }] }));
    setNewShift({ day_of_week: 'Monday', start_time: '08:00', finish_time: '16:30', unpaid_break_mins: 30 });
  };

  const removeShift = (idx) => setForm(f => ({ ...f, shifts: f.shifts.filter((_, i) => i !== idx) }));

  const handleCreate = async () => {
    if (!form.name || form.shifts.length === 0) { toast.error('Name and at least one shift required.'); return; }
    try {
      await createRosterTemplate(form);
      toast.success('Roster template created.');
      setCreating(false);
      setForm({ name: '', award_code: 'MA000002', employment_type: 'full_time', classification: '', shifts: [] });
      getRosterTemplates().then(setTemplates);
    } catch { toast.error('Failed to create template.'); }
  };

  const handleDelete = async (id) => {
    await deleteRosterTemplate(id);
    setTemplates(t => t.filter(x => x.id !== id));
    toast.success('Template deleted.');
  };

  const handleGenerate = async () => {
    if (!genForm.template_id || !genForm.week_start) { toast.error('Select template and week start.'); return; }
    try {
      const res = await generateFromRoster(genForm.template_id, { week_start: genForm.week_start, employee_id: genForm.employee_id });
      setGenResult(res);
      toast.success(`Generated ${res.shifts.length} shifts.`);
    } catch { toast.error('Generation failed.'); }
  };

  const handleBatchCalc = async () => {
    if (!genResult?.shifts) return;
    try {
      const res = await batchCalculate(genResult.shifts);
      toast.success(`Batch calculated: ${res.summary.successful} shifts, $${res.summary.total_pay.toFixed(2)} total.`);
    } catch { toast.error('Batch calculation failed.'); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6" data-testid="roster-templates-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight">Roster Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">Define standard weekly rosters and auto-generate batch shifts for pay runs.</p>
        </div>
        <Button className="rounded-sm text-xs" onClick={() => setCreating(!creating)} data-testid="create-template-btn">
          <Plus size={14} className="mr-1.5" /> New Template
        </Button>
      </div>

      {creating && (
        <Card className="rounded-sm border" data-testid="create-template-form">
          <CardHeader className="p-4 pb-2"><CardTitle className="text-sm">New Roster Template</CardTitle></CardHeader>
          <CardContent className="p-4 pt-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div><Label className="text-xs">Template Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="rounded-sm mt-1 text-xs" data-testid="template-name-input" /></div>
              <div><Label className="text-xs">Award</Label>
                <Select value={form.award_code} onValueChange={v => setForm(f => ({ ...f, award_code: v }))}><SelectTrigger className="rounded-sm mt-1 text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.values(AWARDS).map(a => <SelectItem key={a.code} value={a.code}>{a.shortName}</SelectItem>)}</SelectContent></Select>
              </div>
              <div><Label className="text-xs">Employment Type</Label>
                <Select value={form.employment_type} onValueChange={v => setForm(f => ({ ...f, employment_type: v }))}><SelectTrigger className="rounded-sm mt-1 text-xs"><SelectValue /></SelectTrigger><SelectContent>{EMPLOYMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select>
              </div>
              <div><Label className="text-xs">Classification</Label><Input value={form.classification} onChange={e => setForm(f => ({ ...f, classification: e.target.value }))} className="rounded-sm mt-1 text-xs" placeholder="e.g. L1Y1" data-testid="template-class-input" /></div>
            </div>
            <div className="border-t pt-3">
              <Label className="text-xs font-semibold">Shifts in Template</Label>
              <div className="flex items-end gap-2 mt-2">
                <div><Label className="text-[10px]">Day</Label><Select value={newShift.day_of_week} onValueChange={v => setNewShift(s => ({ ...s, day_of_week: v }))}><SelectTrigger className="rounded-sm text-xs w-28"><SelectValue /></SelectTrigger><SelectContent>{DAYS_OF_WEEK.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
                <div><Label className="text-[10px]">Start</Label><Input type="time" value={newShift.start_time} onChange={e => setNewShift(s => ({ ...s, start_time: e.target.value }))} className="rounded-sm text-xs w-24 font-mono" /></div>
                <div><Label className="text-[10px]">Finish</Label><Input type="time" value={newShift.finish_time} onChange={e => setNewShift(s => ({ ...s, finish_time: e.target.value }))} className="rounded-sm text-xs w-24 font-mono" /></div>
                <div><Label className="text-[10px]">Break</Label><Input type="number" value={newShift.unpaid_break_mins} onChange={e => setNewShift(s => ({ ...s, unpaid_break_mins: parseInt(e.target.value) || 0 }))} className="rounded-sm text-xs w-16 font-mono" /></div>
                <Button size="sm" variant="outline" className="rounded-sm text-xs" onClick={addShiftToTemplate} data-testid="add-shift-to-template"><Plus size={12} /></Button>
              </div>
              {form.shifts.length > 0 && (
                <div className="mt-2 space-y-1">
                  {form.shifts.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs bg-secondary p-1.5 rounded-sm">
                      <span className="font-medium w-20">{s.day_of_week}</span>
                      <span className="font-mono">{s.start_time}–{s.finish_time}</span>
                      <span className="text-muted-foreground">{s.unpaid_break_mins}m break</span>
                      <button onClick={() => removeShift(i)} className="ml-auto text-red-500"><Trash size={12} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button className="rounded-sm text-xs" onClick={handleCreate} data-testid="save-template-btn">Save Template</Button>
          </CardContent>
        </Card>
      )}

      {/* Existing Templates */}
      {templates.length > 0 && (
        <Card className="rounded-sm border">
          <CardHeader className="p-4 pb-2"><CardTitle className="text-sm">Saved Templates ({templates.length})</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table data-testid="templates-table">
              <TableHeader><TableRow>
                <TableHead className="text-xs">Name</TableHead><TableHead className="text-xs">Award</TableHead><TableHead className="text-xs">Type</TableHead><TableHead className="text-xs">Shifts</TableHead><TableHead className="text-xs">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {templates.map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="text-xs font-medium">{t.name}</TableCell>
                    <TableCell className="text-xs font-mono">{t.award_code}</TableCell>
                    <TableCell className="text-xs">{t.employment_type}</TableCell>
                    <TableCell className="text-xs">{t.shifts?.length || 0} shifts/week</TableCell>
                    <TableCell className="text-xs">
                      <button onClick={() => { setGenForm(f => ({ ...f, template_id: t.id })); }} className="text-blue-600 hover:underline mr-3" data-testid={`use-template-${t.id}`}>Use</button>
                      <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:underline" data-testid={`delete-template-${t.id}`}>Delete</button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Generate from Template */}
      <Card className="rounded-sm border" data-testid="generate-section">
        <CardHeader className="p-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><CalendarBlank size={16} /> Generate Batch from Template</CardTitle></CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div><Label className="text-xs">Template</Label>
              <Select value={genForm.template_id} onValueChange={v => setGenForm(f => ({ ...f, template_id: v }))}><SelectTrigger className="rounded-sm mt-1 text-xs" data-testid="gen-template-select"><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent>{templates.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select>
            </div>
            <div><Label className="text-xs">Week Starting</Label><Input type="date" value={genForm.week_start} onChange={e => setGenForm(f => ({ ...f, week_start: e.target.value }))} className="rounded-sm mt-1 text-xs" data-testid="gen-week-start" /></div>
            <div><Label className="text-xs">Employee ID</Label><Input value={genForm.employee_id} onChange={e => setGenForm(f => ({ ...f, employee_id: e.target.value }))} className="rounded-sm mt-1 text-xs" data-testid="gen-employee-id" /></div>
            <Button className="rounded-sm text-xs" onClick={handleGenerate} data-testid="generate-btn"><Play size={14} className="mr-1" /> Generate</Button>
          </div>
          {genResult && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium">Generated {genResult.shifts.length} shifts from "{genResult.template_name}"</p>
                <Button size="sm" className="rounded-sm text-xs" onClick={handleBatchCalc} data-testid="gen-batch-calc-btn">Calculate All</Button>
              </div>
              <div className="space-y-1">
                {genResult.shifts.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs bg-secondary p-2 rounded-sm">
                    <span className="font-mono">{s.date}</span><span className="font-medium w-20">{s.day_of_week}</span>
                    <span className="font-mono">{s.start_time}–{s.finish_time}</span><span className="text-muted-foreground">{s.classification} @ ${s.pay_rate}/hr</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
