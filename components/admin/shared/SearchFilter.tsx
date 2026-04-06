'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
};

export default function SearchFilter({ value, onChange, placeholder, className }: Props) {
  return (
    <div className={`relative ${className ?? 'flex-[2_1_200px]'}`}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
      <Input
        placeholder={placeholder ?? 'Search by name...'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 h-11 rounded-2xl border-slate-200 bg-slate-50 text-sm"
      />
    </div>
  );
}
