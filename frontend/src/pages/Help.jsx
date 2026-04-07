import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Question, Scales, Clock, CurrencyDollar, ShieldWarning } from '@phosphor-icons/react';

export default function Help() {
  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="help-page">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2">
          <Question size={24} /> Help & Documentation
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Guide to using the Award Interpreter Tool for Australian payroll compliance.
        </p>
      </div>

      {/* Quick Start Guide */}
      <Card className="rounded-sm border">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm">Quick Start Guide</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-3">
          <div className="flex gap-3 items-start">
            <span className="w-6 h-6 bg-foreground text-background rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
            <div>
              <p className="text-xs font-semibold">Select Award</p>
              <p className="text-[10px] text-muted-foreground">Choose the applicable Modern Award (Clerks, RTD, or RTLDO) based on the type of work.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <span className="w-6 h-6 bg-foreground text-background rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
            <div>
              <p className="text-xs font-semibold">Employee Profile</p>
              <p className="text-[10px] text-muted-foreground">Enter or select employee details, classification, and employment type. Pay rate auto-populates.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <span className="w-6 h-6 bg-foreground text-background rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
            <div>
              <p className="text-xs font-semibold">Shift Input</p>
              <p className="text-[10px] text-muted-foreground">Enter shift date, times, breaks, allowances, and any special conditions.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <span className="w-6 h-6 bg-foreground text-background rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
            <div>
              <p className="text-xs font-semibold">View Results</p>
              <p className="text-[10px] text-muted-foreground">Review KPIs, component breakdown, plain English explanation, and compliance warnings.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card className="rounded-sm border">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <Accordion type="single" collapsible>
            <AccordionItem value="q1">
              <AccordionTrigger className="text-xs" data-testid="faq-q1">
                Which awards are supported?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground">
                The tool supports three Modern Awards: Clerks - Private Sector Award 2020 (MA000002),
                Road Transport and Distribution Award 2020 (MA000038), and Road Transport
                (Long Distance Operations) Award 2020 (MA000039).
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q2">
              <AccordionTrigger className="text-xs" data-testid="faq-q2">
                How are overtime rates calculated?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground">
                <p className="mb-2"><strong>Clerks:</strong> First 2 hours at 150% (FT/PT) or 175% (casual), after 2 hours at 200% (FT/PT) or 225% (casual).</p>
                <p className="mb-2"><strong>RTD:</strong> Daily reset — first 2 hours at 150%, after 2 hours at 200%. Casual OT per Cl 11.4: OT rate + 10% of minimum hourly, NO 25% casual loading during OT.</p>
                <p><strong>RTLDO:</strong> Primarily trip-based (CPK or hourly). Loading/unloading and delay provisions apply separately.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q3">
              <AccordionTrigger className="text-xs" data-testid="faq-q3">
                What about junior employee rates?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground">
                Junior rates are age-based percentages of the adult rate: Under 16 (45%), 16 (50%),
                17 (60%), 18 (70%), 19 (80%), 20 (90%). Toggle the "Junior Employee" switch and select
                the age on the Employee Profile page.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q4">
              <AccordionTrigger className="text-xs" data-testid="faq-q4">
                How does the RTD casual overtime work?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground">
                Under the RTD Award clause 11.4, casual employees working overtime are paid at the
                overtime rate plus 10% of the minimum hourly rate. Importantly, the standard 25% casual
                loading does NOT apply during overtime hours. This is a common payroll compliance trap.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q5">
              <AccordionTrigger className="text-xs" data-testid="faq-q5">
                Can I edit the pay rates?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground">
                Yes. Navigate to Admin (password: admin123) to edit all pay rates, penalty multipliers,
                and allowance values. Changes are saved to the database and propagate to all future calculations.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q6">
              <AccordionTrigger className="text-xs" data-testid="faq-q6">
                What is loading/unloading under RTLDO?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground">
                Under the RTLDO Award, loading/unloading is paid at (weekly rate / 40) x 1.3 multiplier.
                There is a minimum of 1 hour loading + 1 hour unloading per trip. Physical engagement only
                (per FWC Full Bench 2020: excludes waiting, paperwork, restraints). Casuals get an additional
                1.25x multiplier, and PT employees on non-agreed days get 1.15x.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Award References */}
      <Card className="rounded-sm border">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm">Award References</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <Scales size={14} />
              <a href="https://www.fwc.gov.au/documents/awards/transitional/ma000002/default.htm" target="_blank" rel="noopener noreferrer" className="underline text-blue-600 dark:text-blue-400">
                Clerks — Private Sector Award 2020 (MA000002)
              </a>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Scales size={14} />
              <a href="https://www.fwc.gov.au/documents/awards/transitional/ma000038/default.htm" target="_blank" rel="noopener noreferrer" className="underline text-blue-600 dark:text-blue-400">
                Road Transport and Distribution Award 2020 (MA000038)
              </a>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Scales size={14} />
              <a href="https://www.fwc.gov.au/documents/awards/transitional/ma000039/default.htm" target="_blank" rel="noopener noreferrer" className="underline text-blue-600 dark:text-blue-400">
                Road Transport (Long Distance Operations) Award 2020 (MA000039)
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="rounded-sm border border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
        <CardContent className="p-4 flex items-start gap-3">
          <ShieldWarning size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold">Disclaimer</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              This tool is for estimation purposes only and does not constitute legal or payroll advice.
              Employers must verify all calculations against the relevant Modern Award and the Fair Work Act 2009.
              The National Employment Standards (NES) may apply additional requirements not covered by this tool.
              Always consult a qualified payroll professional or the Fair Work Ombudsman for definitive guidance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
