import React, { useState, useEffect } from 'react';
import { getShifts, getAuditTrail } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { CalendarBlank, CaretLeft, CaretRight } from '@phosphor-icons/react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const days = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(d);
  return days;
}

export default function ShiftCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [audits, setAudits] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  const days = getMonthDays(year, month);

  useEffect(() => {
    getAuditTrail().then(data => {
      setAudits(data.filter(a => a.action === 'CALCULATION' || a.action === 'BATCH_CALC'));
    }).catch(() => {});
  }, []);

  const shiftsByDate = {};
  audits.forEach(a => {
    if (a.shift_date) {
      if (!shiftsByDate[a.shift_date]) shiftsByDate[a.shift_date] = [];
      shiftsByDate[a.shift_date].push(a);
    }
  });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const selectedDateStr = selectedDay ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}` : '';
  const selectedShifts = selectedDateStr ? (shiftsByDate[selectedDateStr] || []) : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6" data-testid="shift-calendar-page">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2">
          <CalendarBlank size={24} /> Shift Calendar
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Visual overview of all calculated shifts by date.</p>
      </div>

      <Card className="rounded-sm border">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <Button variant="ghost" size="sm" onClick={prevMonth} data-testid="prev-month"><CaretLeft size={16} /></Button>
          <CardTitle className="text-sm font-mono">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</CardTitle>
          <Button variant="ghost" size="sm" onClick={nextMonth} data-testid="next-month"><CaretRight size={16} /></Button>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          {/* Header */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground py-1">{d}</div>
            ))}
          </div>
          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1" data-testid="calendar-grid">
            {days.map((day, i) => {
              if (day === null) return <div key={i} className="h-20" />;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayShifts = shiftsByDate[dateStr] || [];
              const isSelected = selectedDay === day;
              const isToday = new Date().toISOString().slice(0, 10) === dateStr;
              const totalPay = dayShifts.reduce((s, a) => s + (a.total_pay || 0), 0);
              return (
                <div
                  key={i}
                  onClick={() => setSelectedDay(day)}
                  data-testid={`calendar-day-${day}`}
                  className={`h-20 border rounded-sm p-1 cursor-pointer transition-colors ${
                    isSelected ? 'border-foreground bg-secondary' : 'border-border hover:bg-secondary/50'
                  } ${isToday ? 'ring-1 ring-foreground' : ''}`}
                >
                  <span className={`text-xs font-mono ${isToday ? 'font-bold' : 'text-muted-foreground'}`}>{day}</span>
                  {dayShifts.length > 0 && (
                    <div className="mt-0.5">
                      <Badge variant="outline" className="text-[8px] rounded-sm px-1 py-0 border-emerald-400 text-emerald-600">
                        {dayShifts.length} shift{dayShifts.length > 1 ? 's' : ''}
                      </Badge>
                      <p className="text-[9px] font-mono font-bold mt-0.5">${totalPay.toFixed(0)}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected day detail */}
      {selectedDay && (
        <Card className="rounded-sm border" data-testid="day-detail">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm">{selectedDateStr} — {selectedShifts.length} shift(s)</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            {selectedShifts.length === 0 ? (
              <p className="text-xs text-muted-foreground">No shifts calculated for this date.</p>
            ) : (
              <div className="space-y-2">
                {selectedShifts.map((s, i) => (
                  <div key={i} className="border rounded-sm p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{s.employee_id}</span>
                      <span className="text-xs font-mono font-bold">${s.total_pay?.toFixed(2)}</span>
                    </div>
                    <div className="flex gap-3 text-[10px] text-muted-foreground">
                      <span>{s.award_code}</span>
                      <span>{s.components?.length || 0} components</span>
                    </div>
                    {s.components?.map((c, ci) => (
                      <div key={ci} className="flex justify-between text-[10px] border-t pt-0.5">
                        <span>{c.component}</span>
                        <span className="font-mono">${c.amount?.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
