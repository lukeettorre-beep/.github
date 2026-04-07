import React, { useEffect, useState } from 'react';
import { getRateTables } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '../components/ui/table';
import { AWARDS } from '../lib/constants';

export default function Classification() {
  const [rateTables, setRateTables] = useState([]);

  useEffect(() => {
    getRateTables().then(setRateTables).catch(console.error);
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6" data-testid="classification-page">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight">
          Classification Reference
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pay rates and classifications for all supported awards. Rates effective 1 July 2025.
        </p>
      </div>

      <Tabs defaultValue="MA000002">
        <TabsList className="rounded-sm">
          {Object.values(AWARDS).map(a => (
            <TabsTrigger key={a.code} value={a.code} className="rounded-sm text-xs" data-testid={`tab-${a.code}`}>
              {a.shortName}
            </TabsTrigger>
          ))}
        </TabsList>

        {rateTables.map(rt => (
          <TabsContent key={rt.award_code} value={rt.award_code}>
            <Card className="rounded-sm border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm">{rt.award_name}</CardTitle>
                <p className="text-[10px] text-muted-foreground font-mono">{rt.award_code}</p>
              </CardHeader>
              <CardContent className="p-0">
                {/* Classifications Table */}
                <div className="overflow-x-auto">
                  <Table data-testid={`classification-table-${rt.award_code}`}>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Code</TableHead>
                        <TableHead className="text-xs">Classification</TableHead>
                        <TableHead className="text-xs text-right">Hourly Rate</TableHead>
                        {rt.award_code === 'MA000039' && (
                          <TableHead className="text-xs text-right">CPK Rate</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rt.classifications.map(c => (
                        <TableRow key={c.code}>
                          <TableCell className="text-xs font-mono font-medium">{c.code}</TableCell>
                          <TableCell className="text-xs">{c.name}</TableCell>
                          <TableCell className="text-xs font-mono text-right">${c.hourly_rate.toFixed(2)}</TableCell>
                          {rt.award_code === 'MA000039' && (
                            <TableCell className="text-xs font-mono text-right">
                              ${c.cpk_rate ? c.cpk_rate.toFixed(3) : '—'}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Penalty Rates */}
                <div className="p-4 border-t">
                  <h4 className="text-xs font-semibold mb-2">Penalty Rates</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(rt.penalty_rates).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-[10px] bg-secondary p-2 rounded-sm">
                        <span className="text-muted-foreground">{key.replace(/_/g, ' ')}</span>
                        <span className="font-mono font-medium">
                          {typeof val === 'number' ? (val < 10 ? `${val}x` : val) : val}
                        </span>
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
