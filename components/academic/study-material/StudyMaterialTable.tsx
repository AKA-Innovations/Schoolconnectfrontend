'use client';

import React, { useMemo } from 'react';
import { Trash2, FolderOpen, Eye, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AcademicTable, type ColumnDef } from '../shared/AcademicTable';
import { formatDate } from '@/lib/dateUtils';
import { DocumentPreviewModal } from '../shared/DocumentPreviewModal';
import { ChapterTopicTag } from '../shared/ChapterTopicTag';
import type { StudyMaterial } from '@/services/academic/types';
import { useAuthStore } from '@/store/authStore';

export interface EnrichedStudyMaterial extends StudyMaterial {
  className?: string;
  sectionName?: string;
  subjectName?: string;
  chapterName?: string;
  topicName?: string;
  teacherName?: string;
  teacherId?: string;
}

interface Props { 
  materials: EnrichedStudyMaterial[]; 
  isLoading: boolean; 
  onDelete: (id: number) => void;
  onEdit?: (item: EnrichedStudyMaterial) => void;
  onView?: (item: EnrichedStudyMaterial) => void;
}

export const StudyMaterialTable = React.memo(function StudyMaterialTable({ materials, isLoading, onDelete, onEdit, onView }: Props) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [previewFilename, setPreviewFilename] = React.useState<string>('');

  const role = useAuthStore((s) => s.role);
  const canManage = role === 'teacher' || role === 'subject_coordinator' || role === 'principal' || role === 'super_admin' || role === 'school_admin';

  const handlePreview = (item: EnrichedStudyMaterial) => {
    const url = item.signedUrl || item.documentPath;
    if (url) {
      setPreviewUrl(url);
      setPreviewFilename((item.documentPath || '').split('/').pop() || item.description || 'Material');
    }
  };

  const columns = useMemo<ColumnDef<EnrichedStudyMaterial>[]>(() => [
    {
      key: 'desc', 
      header: 'Material',
      render: (item) => (
        <div className="max-w-sm space-y-1">
          <p className="font-bold text-slate-900 truncate">{item.description}</p>
          {item.documentPath && (
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight truncate">
              📄 {item.documentPath.split('/').pop()}
            </p>
          )}
          {item.teacherName && (
            <p className="text-[10px] text-slate-400/80 font-medium">
              Uploaded by: <span className="text-slate-600 font-semibold">{item.teacherName}</span>
            </p>
          )}
          <ChapterTopicTag
            subjectId={item.subjectId}
            chapterId={item.chapterId}
            topicId={item.topicId}
            chapterName={item.chapterName}
            topicName={item.topicName}
            className="pt-0.5"
          />
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
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {(item.signedUrl || item.documentPath) && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-xl hover:bg-slate-100 hover:shadow-sm"
              title="View / Download Material"
              onClick={(e) => {
                e.stopPropagation();
                if (onView) onView(item);
                handlePreview(item);
              }}
            >
              <Eye size={16} className="text-teal-600" />
            </Button>
          )}
          {canManage && onEdit && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-xl hover:bg-slate-100 hover:shadow-sm text-slate-500"
              title="Edit Material"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
            >
              <Edit size={16} className="text-slate-500" />
            </Button>
          )}
          {canManage && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-xl hover:bg-rose-50 text-rose-400" 
              title="Delete Material"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      ),
    },
  ], [onDelete, onEdit, onView, canManage]);

  return (
    <>
      <AcademicTable 
        columns={columns} 
        data={materials} 
        isLoading={isLoading} 
        rowKey={(i) => i.id} 
        emptyIcon={<FolderOpen size={48} />} 
        emptyMessage="No Study Materials Found" 
        onRowClick={(item) => {
          if (onView) onView(item);
          handlePreview(item);
        }}
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
