'use client';

import React, { useMemo } from 'react';
import { Edit, Trash2, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AcademicTable, type ColumnDef } from '../shared/AcademicTable';
import { StatusBadge } from '../shared/StatusBadge';
import type { TeachingProgress } from '@/services/academic/types';

interface Props { items: TeachingProgress[]; isLoading: boolean; onEdit: (p: TeachingProgress) => void; onDelete: (id: number) => void; }

export const ProgressTable = React.memo(function ProgressTable({ items, isLoading, onEdit, onDelete }: Props) {
  const columns = useMemo<ColumnDef<TeachingProgress>[]>(() => [
    {
      key: 'topic', header: 'Topic / Chapter',
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">Topic #{item.topicId}</span>
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">Chapter #{item.chapterId}</span>
        </div>
      ),
    },
    { key: 'class', header: 'Class', render: (item) => <Badge className="bg-slate-100 text-slate-600 border-none px-3 py-1 rounded-lg font-bold text-[10px]">{(item as any).className} – {(item as any).sectionName}</Badge> },
    { key: 'status', header: 'Status', render: (item) => <StatusBadge status={item.status} /> },
    { key: 'completed', header: 'Completed On', render: (item) => <span className="text-xs text-slate-500">{(item as any).completedOn ? new Date((item as any).completedOn).toLocaleDateString() : '—'}</span> },
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

  return <AcademicTable columns={columns} data={items} isLoading={isLoading} rowKey={(i) => i.id} emptyIcon={<BarChart3 size={48} />} emptyMessage="No Progress Records" />;
});
