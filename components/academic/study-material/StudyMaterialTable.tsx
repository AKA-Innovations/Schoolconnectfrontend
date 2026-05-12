'use client';

import React, { useMemo } from 'react';
import { Download, Trash2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AcademicTable, type ColumnDef } from '../shared/AcademicTable';
import { formatDate } from '@/lib/dateUtils';
import type { StudyMaterial } from '@/services/academic/types';

interface Props { 
  materials: StudyMaterial[]; 
  isLoading: boolean; 
  onDelete: (id: number) => void; 
}

export const StudyMaterialTable = React.memo(function StudyMaterialTable({ materials, isLoading, onDelete }: Props) {
  const columns = useMemo<ColumnDef<StudyMaterial>[]>(() => [
    {
      key: 'desc', 
      header: 'Material',
      render: (item) => (
        <div className="max-w-sm">
          <p className="font-bold text-slate-900 truncate">{item.description}</p>
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">
            {item.documentPath.split('/').pop()}
          </p>
        </div>
      ),
    },
    { 
      key: 'class', 
      header: 'Class', 
      render: (item) => <span className="text-xs text-slate-500 font-medium">Class {item.classId}</span> 
    },
    { 
      key: 'date', 
      header: 'Uploaded', 
      render: (item) => <span className="text-xs text-slate-600 font-medium">{formatDate(new Date(item.createdAt), 'MMM dd, yyyy')}</span> 
    },
    { 
      key: 'session', 
      header: 'Session', 
      render: (item) => <span className="text-xs text-slate-500">{item.session}</span> 
    },
    {
      key: 'actions', 
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
          {item.signedUrl && (
            <a href={item.signedUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-md">
                <Download size={16} className="text-teal-500" />
              </Button>
            </a>
          )}
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-rose-50 text-rose-400" onClick={() => onDelete(item.id)}>
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ], [onDelete]);

  return (
    <AcademicTable 
      columns={columns} 
      data={materials} 
      isLoading={isLoading} 
      rowKey={(i) => i.id} 
      emptyIcon={<FolderOpen size={48} />} 
      emptyMessage="No Study Materials Found" 
    />
  );
});
