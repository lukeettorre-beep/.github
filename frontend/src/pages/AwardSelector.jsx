import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AWARDS } from '../lib/constants';
import { getRateTables, seedRates } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '../components/ui/table';
import { ArrowRight, Scales, CheckCircle } from '@phosphor-icons/react';

export default function AwardSelector({ onComplete }) {
  const navigate = useNavigate();
  const [workType, setWorkType] = useState('');
  const [selectedAward, setSelectedAward] = useState('');
  const [rateTables, setRateTables] = useState([]);

  useEffect(() => {
    seedRates().then(() => getRateTables()).then(setRateTables).catch(console.error);
  }, []);

  const filteredAwards = workType
    ? Object.values(AWARDS).filter(a => a.workType === workType)
    : Object.values(AWARDS);

  const handleContinue = () => {
    if (selectedAward) {
      onComplete?.(selectedAward);
      navigate('/employee-profile');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6" data-testid="award-selector-page">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight">
          Step 1: Select Award
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Choose the applicable Modern Award based on the type of work performed.
        </p>
      </div>

      {/* Guided Question */}
      <Card className="rounded-sm border" data-testid="guided-question">
        <CardContent className="p-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
            What type of work?
          </label>
          <Select value={workType} onValueChange={setWorkType}>
            <SelectTrigger className="w-full max-w-xs rounded-sm" data-testid="work-type-select">
              <SelectValue placeholder="Select work type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Admin">Administrative / Clerical</SelectItem>
              <SelectItem value="Local Transport">Local Transport / Distribution</SelectItem>
              <SelectItem value="Long Distance">Long Distance Operations</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Award Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredAwards.map(award => (
          <Card
            key={award.code}
            data-testid={`award-card-${award.code}`}
            onClick={() => setSelectedAward(award.code)}
            className={`rounded-sm cursor-pointer transition-all duration-200 hover:-translate-y-0.5 ${
              selectedAward === award.code
                ? 'border-2 border-foreground shadow-md'
                : 'border hover:shadow-sm'
            }`}
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold">{award.shortName}</CardTitle>
                {selectedAward === award.code && (
                  <CheckCircle size={20} weight="fill" className="text-emerald-600" />
                )}
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">{award.code}</span>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              <p className="text-xs text-muted-foreground">{award.description}</p>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">Span:</span>
                  <span className="font-medium">{award.span}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">Max Daily:</span>
                  <span className="font-medium">{award.maxDaily}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Coverage Scope */}
      {selectedAward && (
        <Card className="rounded-sm border" data-testid="coverage-scope">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm">Coverage Scope — {AWARDS[selectedAward]?.shortName}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Attribute</TableHead>
                  <TableHead className="text-xs">Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="text-xs font-medium">Award</TableCell>
                  <TableCell className="text-xs font-mono">{AWARDS[selectedAward]?.name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-xs font-medium">Scope</TableCell>
                  <TableCell className="text-xs">{AWARDS[selectedAward]?.scope}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-xs font-medium">Ordinary Span</TableCell>
                  <TableCell className="text-xs">{AWARDS[selectedAward]?.span}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-xs font-medium">Max Daily Ordinary</TableCell>
                  <TableCell className="text-xs">{AWARDS[selectedAward]?.maxDaily}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Continue Button */}
      <div className="flex justify-end">
        <Button
          data-testid="continue-to-employee-btn"
          disabled={!selectedAward}
          onClick={handleContinue}
          className="rounded-sm"
        >
          Continue to Employee Profile
          <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  );
}
