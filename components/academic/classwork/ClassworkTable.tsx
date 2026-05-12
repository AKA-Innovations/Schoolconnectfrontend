'use client';

import React, { useMemo } from 'react';
import { Edit, Trash2, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AcademicTable, type ColumnDef } from '../shared/AcademicTable';
import { formatDate } from '@/lib/dateUtils';
import type { Classwork } from '@/services/academic/types';

interface Props { classworks: Classwork[]; isLoading: boolean; onEdit: (cw: Classwork) => void; onDelete: (id: number) => void; }

export const ClassworkTable = React.memo(function ClassworkTable({ classworks, isLoading, onEdit, onDelete }: Props) {
  const columns = useMemo<ColumnDef<Classwork>[]>(() => [
    {
      key: 'desc', header: 'Description',
      render: (item) => (
        <div className="max-w-sm">
          <p className="font-bold text-slate-900 truncate">
            {item.description?.slice(0, 80) || 'No description'}{(item.description?.length ?? 0) > 80 ? '…' : ''}
          </p>
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">
            Subject: {item.subjectId?.slice(0, 8) || 'N/A'}…
          </p>
        </div>
      ),
    },
    { key: 'date', header: 'Conducted On', render: (item) => <span className="text-xs text-slate-600 font-medium">{formatDate(new Date(item.conductedOn), 'MMM dd, yyyy')}</span> },
    { key: 'teacher', header: 'Teacher', render: (item) => <span className="text-xs text-slate-500">{item.teacherId?.slice(0, 8) || 'N/A'}…</span> },
    { key: 'session', header: 'Session', render: (item) => <span className="text-xs text-slate-500">{item.session}</span> },
    {
      key: 'actions', header: 'Actions',
      render: (item) => (
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-md" onClick={() => onEdit(item)}><Edit size={16} className="text-slate-400" /></Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-rose-50 text-rose-400" onClick={() => onDelete(item.id)}><Trash2 size={16} /></Button>
        </div>
      ),
    },
  ], [onEdit, onDelete]);

  return <AcademicTable columns={columns} data={classworks} isLoading={isLoading} rowKey={(i) => i.id} emptyIcon={<PenLine size={48} />} emptyMessage="No Classwork Records" />;
});
