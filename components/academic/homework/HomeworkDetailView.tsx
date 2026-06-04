'use client';

import React from 'react';
import { ArrowLeft, Calendar, User, FileText, Download, XCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '../shared/StatusBadge';
import { useHomeworkDocuments, useHomeworkSubmissions, useHomeworkAttachments, useDeleteHomeworkAttachment, useUploadHomeworkAttachment } from '@/hooks/useAcademic';
import { toast } from 'sonner';
import { CURRENT_SESSION } from '@/lib/constants';
import { Plus } from 'lucide-react';
import { formatDate } from '@/lib/dateUtils';
import { DocumentPreviewModal } from '../shared/DocumentPreviewModal';
import type { Homework } from '@/services/academic/types';

interface Props {
  homework: Homework;
  onBack: () => void;
}

export function HomeworkDetailView({ homework, onBack }: Props) {
  const { data: documents, isLoading: docsLoading } = useHomeworkDocuments(homework.id);
  const { data: submissions, isLoading: subsLoading } = useHomeworkSubmissions(homework.id);
  const { data: attachments, isLoading: attachmentsLoading } = useHomeworkAttachments(homework.id);
  const deleteAttachment = useDeleteHomeworkAttachment();
  const uploadAttachment = useUploadHomeworkAttachment();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [previewFilename, setPreviewFilename] = React.useState<string>('');

  const handleDeleteAttachment = (id: number) => {
    if (confirm('Are you sure you want to delete this attachment?')) {
      deleteAttachment.mutate({ id, homeworkId: homework.id }, {
        onSuccess: () => toast.success('Attachment deleted successfully')
      });
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadAttachment.mutate({
      session: CURRENT_SESSION,
      homeworkId: homework.id,
      file,
    }, {
      onSuccess: () => {
        toast.success('File uploaded successfully');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Back button */}
      <Button variant="ghost" onClick={onBack} className="gap-2 text-slate-500 hover:text-slate-800">
        <ArrowLeft size={18} /> Back to Homework List
      </Button>

      {/* Header card */}
      <Card className="rounded-[2rem]">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <CardTitle className="text-xl">{homework.title}</CardTitle>
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="bg-slate-100 text-slate-600 border-none px-3 py-1 rounded-lg font-bold text-[10px]">
                  {homework.className} – {homework.sectionName}
                </Badge>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar size={14} />{formatDate(new Date(homework.dueDate), 'MMM dd, yyyy')}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <User size={14} />{homework.assignedBy?.slice(0, 8) || 'Teacher'}…
                </div>
              </div>
            </div>
            <StatusBadge status={new Date(homework.dueDate) < new Date() ? 'overdue' : 'active'} />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{homework.description}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Teacher Attachments */}
        <Card className="rounded-[2rem] border-teal-100 bg-teal-50/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Download size={18} className="text-teal-600" /> Teacher Attachments ({attachments?.length ?? 0})
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl h-8 text-xs gap-1 border-teal-200 text-teal-700 hover:bg-teal-50"
              onClick={handleUploadClick}
              disabled={uploadAttachment.isPending}
            >
              <Plus size={14} /> {uploadAttachment.isPending ? 'Uploading...' : 'Add'}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
          </CardHeader>
          <CardContent>
            {attachmentsLoading ? (
              <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
            ) : !attachments?.length ? (
              <p className="text-sm text-slate-400 py-8 text-center">No teacher attachments</p>
            ) : (
              <div className="space-y-3">
                {attachments.map((att) => (
                  <div key={att.id} className="flex items-center gap-3 p-3 bg-white border border-teal-50 rounded-xl hover:shadow-sm transition-all group">
                    <Download size={18} className="text-teal-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate">{(att.documentPath || '').split('/').pop() || 'Attachment'}</p>
                      <p className="text-[10px] text-slate-400">{formatDate(new Date(att.createdAt), 'MMM dd, yyyy')}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {att.signedUrl && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-teal-50 text-teal-600"
                          onClick={() => {
                            setPreviewUrl(att.signedUrl!);
                            setPreviewFilename((att.documentPath || '').split('/').pop() || 'Attachment');
                          }}
                        >
                          <Eye size={14} />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-red-50 text-red-600"
                        onClick={() => handleDeleteAttachment(att.id)}
                        disabled={deleteAttachment.isPending}
                      >
                        <XCircle size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student Documents (Submissions) */}
        <Card className="rounded-[2rem]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText size={18} className="text-blue-500" /> Student Submissions ({documents?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {docsLoading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
            ) : !documents?.length ? (
              <p className="text-sm text-slate-400 py-8 text-center">No student documents yet</p>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <FileText size={18} className="text-blue-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate">{(doc.documentUrl || '').split('/').pop() || 'Submission'}</p>
                      <p className="text-[10px] text-slate-400">Student: {doc.studentId?.slice(0, 8) || 'N/A'}…</p>
                    </div>
                    {doc.signedUrl && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={() => {
                          setPreviewUrl(doc.signedUrl!);
                          setPreviewFilename((doc.documentUrl || '').split('/').pop() || 'Submission');
                        }}
                      >
                        <Eye size={14} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <DocumentPreviewModal
        open={previewUrl !== null}
        onOpenChange={(open) => !open && setPreviewUrl(null)}
        url={previewUrl}
        filename={previewFilename}
      />
    </div>
  );
}
