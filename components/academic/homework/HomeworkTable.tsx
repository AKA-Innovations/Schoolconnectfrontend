'use client';

import React, { useMemo } from 'react';
import { Eye, Edit, Trash2, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AcademicTable, type ColumnDef } from '../shared/AcademicTable';
import { StatusBadge } from '../shared/StatusBadge';
import { formatDate } from '@/lib/dateUtils';
import type { Homework } from '@/services/academic/types';

import { useAuthStore } from '@/store/authStore';

interface Props {
  homeworks: Homework[];
  isLoading: boolean;
  onView: (hw: Homework) => void;
  onEdit: (hw: Homework) => void;
  onDelete: (id: number) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

function getHomeworkStatus(hw: Homework): string {
  const now = new Date();
  const due = new Date(hw.dueDate);
  if (due < now) return 'overdue';
  return 'active';
}

export const HomeworkTable = React.memo(function HomeworkTable({ homeworks, isLoading, onView, onEdit, onDelete, page, totalPages, onPageChange }: Props) {
  const role = useAuthStore((s) => s.role);
  const canManage = role === 'teacher' || role === 'subject_coordinator';

  const columns = useMemo<ColumnDef<Homework>[]>(() => [
    {
      key: 'title', header: 'Homework',
      render: (item) => (
        <div className="flex flex-col gap-0.5 max-w-xs">
          <span className="font-bold text-slate-900 text-sm group-hover:text-teal-600 transition-colors truncate">📘 {item.title}</span>
          <span className="text-[10px] font-medium text-slate-400">
            Assigned by: {item.assignedBy || 'Teacher'}
          </span>
        </div>
      ),
    },
    {
      key: 'class', header: 'Class',
      render: (item) => (
        <Badge className="bg-slate-100 text-slate-600 border-none px-3 py-1 rounded-lg font-bold text-[10px]">
          {item.className} – {item.sectionName}
        </Badge>
      ),
    },
    {
      key: 'due', header: 'Due Date',
      render: (item) => (
        <span className="text-xs text-slate-600 font-medium">{formatDate(new Date(item.dueDate), 'MMM dd, yyyy')}</span>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (item) => {
        const status = getHomeworkStatus(item);
        const due = new Date(item.dueDate);
        const diffDays = Math.ceil((due.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
        const dueLabel = diffDays > 0 ? `Due in ${diffDays} day${diffDays > 1 ? 's' : ''}` : diffDays === 0 ? 'Due today' : 'Overdue';
        return (
          <div className="flex flex-col gap-1 items-start">
            <StatusBadge status={status} />
            {status === 'active' && (
              <span className="text-[9px] font-bold text-slate-400 tracking-tight uppercase">
                {dueLabel}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'actions', header: 'Actions',
      render: (item) => (
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-md" onClick={(e) => { e.stopPropagation(); onView(item); }}>
            <Eye size={16} className="text-slate-400" />
          </Button>
          {canManage && (
            <>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-md" onClick={(e) => { e.stopPropagation(); onEdit(item); }}>
                <Edit size={16} className="text-slate-400" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-rose-50 text-rose-400" onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}>
                <Trash2 size={16} />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ], [onView, onEdit, onDelete, canManage]);

  return <AcademicTable columns={columns} data={homeworks} isLoading={isLoading} rowKey={(i) => i.id} emptyIcon={<ClipboardList size={48} />} emptyMessage="No Homework Found" onRowClick={onView} page={page} totalPages={totalPages} onPageChange={onPageChange} />;
});
