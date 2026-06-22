'use client';

import React, { useMemo } from 'react';
import { Edit, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AcademicTable, type ColumnDef } from '../shared/AcademicTable';
import type { SubjectTopic } from '@/services/academic/types';

interface Props {
  topics: SubjectTopic[];
  isLoading: boolean;
  onEdit: (topic: SubjectTopic) => void;
  onDelete: (id: number) => void;
}

export const TopicTable = React.memo(function TopicTable({ topics, isLoading, onEdit, onDelete }: Props) {
  const columns = useMemo<ColumnDef<SubjectTopic>[]>(() => [
    {
      key: 'topic', header: 'Topic',
      render: (item) => (
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-2xl bg-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-cyan-100 group-hover:scale-110 transition-transform">
            {item.sequenceNo}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900">{item.topicName}</span>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">Chapter #{item.chapterId}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'class', header: 'Class',
      render: (item) => <Badge className="bg-slate-100 text-slate-600 border-none px-3 py-1 rounded-lg font-bold text-[10px]">{item.className}</Badge>,
    },
    {
      key: 'session', header: 'Session',
      render: (item) => <span className="text-xs text-slate-500 font-medium">{item.session}</span>,
    },
    {
      key: 'actions', header: 'Actions',
      render: (item) => (
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-md" onClick={() => onEdit(item)}>
            <Edit size={16} className="text-slate-400" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-rose-50 text-rose-400" onClick={() => onDelete(item.id)}>
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ], [onEdit, onDelete]);

  return <AcademicTable columns={columns} data={topics} isLoading={isLoading} rowKey={(i) => i.id} emptyIcon={<FileText size={48} />} emptyMessage="No Topics Found" />;
});
