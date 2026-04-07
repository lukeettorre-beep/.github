import React from 'react';
import { ShieldWarning } from '@phosphor-icons/react';

export default function ComplianceBanner() {
  return (
    <div
      data-testid="compliance-banner"
      className="w-full bg-amber-600 text-white px-4 py-2 flex items-center gap-2 text-xs font-semibold tracking-wide uppercase z-50"
      role="alert"
    >
      <ShieldWarning size={16} weight="bold" className="flex-shrink-0" />
      <span>
        Compliance Tool — Not Legal Advice. Verify all calculations with a qualified payroll professional before processing pay.
      </span>
    </div>
  );
}
