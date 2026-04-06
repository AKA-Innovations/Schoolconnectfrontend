'use client';

import React from 'react';
import { Label } from '@/components/ui/label';

/** Shared field-group helper for form layouts */
export function FieldGroup({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
        {label}
      </Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
