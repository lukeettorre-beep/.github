import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { healthCheck, getAuditTrail, getEmployees } from '../lib/api';
import { AWARDS } from '../lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Scales, Users, ClockCounterClockwise, ArrowRight,
  ChartBar, Lightning, ArrowCounterClockwise
} from '@phosphor-icons/react';

export default function Home({ resetWorkflow }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ employees: 0, audits: 0, health: false });

  useEffect(() => {
    Promise.all([
      getEmployees().catch(() => []),
      getAuditTrail().catch(() => []),
      healthCheck().catch(() => null),
    ]).then(([emps, audits, health]) => {
      setStats({
        employees: emps.length,
        audits: audits.length,
        health: !!health,
      });
    });
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8" data-testid="home-page">
      {/* Hero */}
      <div className="space-y-2">
        <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight leading-none">
          Award Interpreter Tool
        </h1>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">
          Australian payroll compliance calculator covering Clerks, Road Transport and Distribution,
          and Long Distance Operations awards. Calculate shift pay, penalties, and overtime accurately.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-sm border" data-testid="stat-employees">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary flex items-center justify-center rounded-sm">
              <Users size={20} weight="bold" />
            </div>
            <div>
              <p className="text-2xl font-mono font-bold">{stats.employees}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Employees</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-sm border" data-testid="stat-calculations">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary flex items-center justify-center rounded-sm">
              <ClockCounterClockwise size={20} weight="bold" />
            </div>
            <div>
              <p className="text-2xl font-mono font-bold">{stats.audits}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Calculations</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-sm border" data-testid="stat-health">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary flex items-center justify-center rounded-sm">
              <Lightning size={20} weight="bold" />
            </div>
            <div>
              <p className={`text-2xl font-mono font-bold ${stats.health ? 'text-emerald-600' : 'text-red-500'}`}>
                {stats.health ? 'Online' : 'Offline'}
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">System Status</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Start */}
      <div>
        <h2 className="text-lg md:text-xl font-heading font-semibold mb-4">Quick Start</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.values(AWARDS).map(award => (
            <Card
              key={award.code}
              className="rounded-sm border cursor-pointer group hover:-translate-y-0.5 transition-all duration-200 hover:shadow-md"
              data-testid={`quickstart-${award.code}`}
              onClick={() => navigate('/award-selector')}
            >
              <CardHeader className="pb-2 p-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">{award.shortName}</CardTitle>
                  <span className="text-[10px] font-mono bg-secondary text-muted-foreground px-1.5 py-0.5 rounded-sm">
                    {award.code}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{award.description}</p>
                <div className="flex items-center text-xs font-medium text-foreground group-hover:gap-2 transition-all">
                  <span>Start Calculation</span>
                  <ArrowRight size={14} className="ml-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex gap-3">
        <Button
          data-testid="start-workflow-btn"
          onClick={() => { resetWorkflow?.(); navigate('/award-selector'); }}
          className="rounded-sm"
        >
          <Scales size={16} className="mr-2" />
          Begin New Calculation
        </Button>
        <Button
          variant="outline"
          data-testid="view-audit-btn"
          onClick={() => navigate('/audit-trail')}
          className="rounded-sm"
        >
          <ChartBar size={16} className="mr-2" />
          View History
        </Button>
      </div>
    </div>
  );
}
