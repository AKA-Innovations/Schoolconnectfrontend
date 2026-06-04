'use client';

import React, { useMemo } from 'react';
import { Trash2, FolderOpen, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AcademicTable, type ColumnDef } from '../shared/AcademicTable';
import { formatDate } from '@/lib/dateUtils';
import { DocumentPreviewModal } from '../shared/DocumentPreviewModal';
import type { StudyMaterial } from '@/services/academic/types';

export interface EnrichedStudyMaterial extends StudyMaterial {
  className?: string;
  sectionName?: string;
  subjectName?: string;
  teacherName?: string;
  teacherId?: string;
}

interface Props { 
  materials: EnrichedStudyMaterial[]; 
  isLoading: boolean; 
  onDelete: (id: number) => void; 
}

export const StudyMaterialTable = React.memo(function StudyMaterialTable({ materials, isLoading, onDelete }: Props) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [previewFilename, setPreviewFilename] = React.useState<string>('');

  const columns = useMemo<ColumnDef<EnrichedStudyMaterial>[]>(() => [
    {
      key: 'desc', 
      header: 'Material',
      render: (item) => (
        <div className="max-w-sm">
          <p className="font-bold text-slate-900 truncate">{item.description}</p>
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight truncate">
            {(item.documentPath || '').split('/').pop()}
          </p>
          {item.teacherName && (
            <p className="text-[10px] text-slate-400/80 font-medium mt-0.5">
              Uploaded by: <span className="text-slate-600 font-semibold">{item.teacherName}</span>
            </p>
          )}
        </div>
      ),
    },
    { 
      key: 'class', 
      header: 'Class', 
      render: (item) => (
        <span className="text-xs text-slate-500 font-medium">
          {item.className ? `Class ${item.className}-${item.sectionName || ''}` : `Class ${item.classId}`}
        </span>
      ) 
    },
    { 
      key: 'subject', 
      header: 'Subject', 
      render: (item) => (
        <span className="text-xs text-slate-500 font-medium">
          {item.subjectName || `Subject ${item.subjectId}`}
        </span>
      ) 
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
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-md"
              onClick={() => {
                setPreviewUrl(item.signedUrl!);
                setPreviewFilename((item.documentPath || '').split('/').pop() || 'Material');
              }}
            >
              <Eye size={16} className="text-teal-500" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-rose-50 text-rose-400" onClick={() => onDelete(item.id)}>
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ], [onDelete]);

  return (
    <>
      <AcademicTable 
        columns={columns} 
        data={materials} 
        isLoading={isLoading} 
        rowKey={(i) => i.id} 
        emptyIcon={<FolderOpen size={48} />} 
        emptyMessage="No Study Materials Found" 
      />

      <DocumentPreviewModal
        open={previewUrl !== null}
        onOpenChange={(open) => !open && setPreviewUrl(null)}
        url={previewUrl}
        filename={previewFilename}
      />
    </>
  );
});
