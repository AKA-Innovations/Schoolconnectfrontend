'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
  page: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPageChange: (p: number) => void;
};

export default function PaginationControls({ page, totalPages, hasPrev, hasNext, onPageChange }: Props) {
  return (
    <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
        Page <span className="text-indigo-600">{page}</span> of <span className="text-indigo-600">{totalPages}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          disabled={!hasPrev}
          onClick={() => onPageChange(page - 1)}
          variant="outline"
          size="sm"
          className="h-9 rounded-xl border-slate-200 text-xs font-bold px-4"
        >
          <ChevronLeft size={14} className="mr-1" /> Prev
        </Button>
        <Button
          disabled={!hasNext}
          onClick={() => onPageChange(page + 1)}
          variant="outline"
          size="sm"
          className="h-9 rounded-xl border-slate-200 text-xs font-bold px-4"
        >
          Next <ChevronRight size={14} className="ml-1" />
        </Button>
      </div>
    </div>
  );
}
