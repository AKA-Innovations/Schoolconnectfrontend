'use client';

import React, { useMemo } from 'react';
import { Eye, Edit, Trash2, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AcademicTable, type ColumnDef } from '../shared/AcademicTable';
import { formatDate } from '@/lib/dateUtils';
import type { Classwork } from '@/services/academic/types';

import { useAuthStore } from '@/store/authStore';

interface Props { 
  classworks: Classwork[]; 
  isLoading: boolean; 
  onView: (cw: Classwork) => void; 
  onEdit: (cw: Classwork) => void; 
  onDelete: (id: number) => void; 
  page?: number; 
  totalPages?: number; 
  onPageChange?: (page: number) => void; 
}

export const ClassworkTable = React.memo(function ClassworkTable({ classworks, isLoading, onView, onEdit, onDelete, page, totalPages, onPageChange }: Props) {
  const role = useAuthStore((s) => s.role);
  const canManage = role === 'teacher' || role === 'subject_coordinator';

  const columns = useMemo<ColumnDef<Classwork>[]>(() => [
    {
      key: 'desc', header: 'Description',
      render: (item) => (
        <div className="max-w-sm">
          <p className="font-bold text-slate-900 truncate">
            {item.description?.slice(0, 80) || 'No description'}{(item.description?.length ?? 0) > 80 ? '…' : ''}
          </p>
          <p className="text-[10px] font-bold text-teal-600 uppercase tracking-wide mt-0.5">
            Subject: {(item as any).subjectName || `Subject #${item.subjectId}`}
          </p>
        </div>
      ),
    },
    {
      key: 'class', header: 'Class',
      render: (item) => (
        <Badge className="bg-slate-100 text-slate-600 border-none px-3 py-1 rounded-lg font-bold text-[10px]">
          {(item as any).className || item.classId || 'N/A'} – {(item as any).sectionName || item.sectionId || 'N/A'}
        </Badge>
      ),
    },
    { key: 'date', header: 'Conducted On', render: (item) => <span className="text-xs text-slate-600 font-medium">{formatDate(new Date(item.conductedOn), 'MMM dd, yyyy')}</span> },
    { key: 'teacher', header: 'Teacher', render: (item) => <span className="text-xs text-slate-600 font-medium">{(item as any).teacherName || item.teacherId?.slice(0, 8) || 'N/A'}</span> },
    {
      key: 'actions', header: 'Actions',
      render: (item) => (
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-md" onClick={(e) => { e.stopPropagation(); onView(item); }}>
            <Eye size={16} className="text-slate-400" />
          </Button>
          {canManage ? (
            <>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-md" onClick={(e) => { e.stopPropagation(); onEdit(item); }}><Edit size={16} className="text-slate-400" /></Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-rose-50 text-rose-400" onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}><Trash2 size={16} /></Button>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </div>
      ),
    },
  ], [onView, onEdit, onDelete, canManage]);

  return <AcademicTable columns={columns} data={classworks} isLoading={isLoading} rowKey={(i) => i.id} emptyIcon={<PenLine size={48} />} emptyMessage="No Classwork Records" onRowClick={onView} page={page} totalPages={totalPages} onPageChange={onPageChange} />;
});
