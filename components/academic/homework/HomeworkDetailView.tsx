'use client';

import React from 'react';
import { ArrowLeft, Calendar, User, FileText, Download, XCircle, Eye, Check, Loader2, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '../shared/StatusBadge';
import {
  useHomeworkDocuments,
  useHomeworkSubmissions,
  useHomeworkAttachments,
  useDeleteHomeworkAttachment,
  useUploadHomeworkAttachment,
  useCreateSubmission,
  useUpdateSubmission
} from '@/hooks/useAcademic';
import { useClassSectionLists } from '@/hooks/useClasses';
import { useStudentList } from '@/hooks/useStudents';
import { toast } from 'sonner';
import { CURRENT_SESSION } from '@/lib/constants';
import { Plus } from 'lucide-react';
import { formatDate } from '@/lib/dateUtils';
import { DocumentPreviewModal } from '../shared/DocumentPreviewModal';
import { ChapterTopicTag } from '../shared/ChapterTopicTag';
import { HomeworkStatus } from '@/services/academic/types';
import type { Homework } from '@/services/academic/types';

interface Props {
  homework: Homework;
  onBack: () => void;
}

export function HomeworkDetailView({ homework, onBack }: Props) {
  const { data: documents, isLoading: docsLoading } = useHomeworkDocuments(homework.id);
  const { data: submissions, isLoading: subsLoading } = useHomeworkSubmissions(homework.id);
  const { data: attachments, isLoading: attachmentsLoading } = useHomeworkAttachments(homework.id);

  const { data: allSections = [] } = useClassSectionLists();

  const parsedClass = React.useMemo(() => {
    if (!homework.className) return { className: '', sectionName: '' };
    if (homework.className.includes('-')) {
      const parts = homework.className.split('-');
      return {
        className: parts[0].trim(),
        sectionName: parts[1]?.trim() || homework.sectionName || '',
      };
    }
    return {
      className: homework.className.trim(),
      sectionName: homework.sectionName?.trim() || '',
    };
  }, [homework.className, homework.sectionName]);

  const classSection = allSections.find(
    s => s.className === parsedClass.className && s.sectionName === parsedClass.sectionName && s.id > 0
  ) || allSections.find(
    s => s.className === parsedClass.className && s.sectionName === parsedClass.sectionName
  );
  const resolvedClassSectionId = classSection?.masterSectionId && classSection.masterSectionId > 0 ? classSection.masterSectionId : undefined;

  const { data: studentListResponse, isLoading: studentsLoading } = useStudentList({
    classSectionId: resolvedClassSectionId,
    limit: 100,
  }, {
    enabled: !!resolvedClassSectionId,
  });
  const students = studentListResponse?.items ?? [];

  const deleteAttachment = useDeleteHomeworkAttachment();
  const uploadAttachment = useUploadHomeworkAttachment();
  const createSub = useCreateSubmission();
  const updateSub = useUpdateSubmission(homework.id);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [previewFilename, setPreviewFilename] = React.useState<string>('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  // Local state for tracking edits in status and remarks per student
  const [edits, setEdits] = React.useState<Record<string, { status: HomeworkStatus; remarks: string }>>({});

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

  // Helper selectors
  const getStudentSubmission = (studentId: string) => {
    return submissions?.find(s => s.studentId === studentId);
  };

  const getCurrentVal = (studentId: string) => {
    const sub = getStudentSubmission(studentId);
    const rawStatus = (sub?.status || '').toLowerCase();
    let resolvedStatus = HomeworkStatus.PENDING;
    if (rawStatus === 'submitted') resolvedStatus = HomeworkStatus.SUBMITTED;
    else if (rawStatus === 'late') resolvedStatus = HomeworkStatus.LATE;
    else if (rawStatus === 'not_submitted') resolvedStatus = HomeworkStatus.NOT_SUBMITTED;
    return {
      status: resolvedStatus,
      remarks: sub?.remarks || '',
    };
  };

  const handleStatusChange = (studentId: string, status: HomeworkStatus) => {
    setEdits(prev => ({
      ...prev,
      [studentId]: {
        status,
        remarks: prev[studentId]?.remarks ?? getCurrentVal(studentId).remarks
      }
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setEdits(prev => ({
      ...prev,
      [studentId]: {
        status: prev[studentId]?.status ?? getCurrentVal(studentId).status,
        remarks
      }
    }));
  };

  const hasChanges = (studentId: string) => {
    const edit = edits[studentId];
    if (!edit) return false;
    const current = getCurrentVal(studentId);
    return edit.status !== current.status || edit.remarks !== current.remarks;
  };

  const handleSave = (studentId: string) => {
    const edit = edits[studentId] || getCurrentVal(studentId);
    const sub = getStudentSubmission(studentId);

    let submittedAt = sub?.submittedAt || null;
    if (edit.status === HomeworkStatus.SUBMITTED || edit.status === HomeworkStatus.LATE) {
      if (!submittedAt) {
        submittedAt = new Date().toISOString();
      }
    } else {
      submittedAt = null;
    }

    if (sub) {
      updateSub.mutate({
        id: sub.id,
        data: {
          status: edit.status.toUpperCase(),
          remarks: edit.remarks,
          submittedAt: submittedAt || undefined,
        }
      }, {
        onSuccess: () => {
          toast.success('Submission updated successfully');
          setEdits(prev => {
            const next = { ...prev };
            delete next[studentId];
            return next;
          });
        },
        onError: () => {
          toast.error('Failed to update submission');
        }
      });
    } else {
      createSub.mutate({
        session: CURRENT_SESSION,
        homeworkId: homework.id,
        studentId,
        status: edit.status.toUpperCase(),
        remarks: edit.remarks,
        submittedAt: submittedAt || undefined,
      }, {
        onSuccess: () => {
          toast.success('Submission saved successfully');
          setEdits(prev => {
            const next = { ...prev };
            delete next[studentId];
            return next;
          });
        },
        onError: () => {
          toast.error('Failed to save submission');
        }
      });
    }
  };

  const handleSaveAll = async () => {
    const studentIdsWithChanges = Object.keys(edits);
    if (studentIdsWithChanges.length === 0) return;

    let successCount = 0;
    let failCount = 0;

    const promises = studentIdsWithChanges.map(async (studentId) => {
      const edit = edits[studentId];
      const sub = getStudentSubmission(studentId);

      let submittedAt = sub?.submittedAt || null;
      if (edit.status === HomeworkStatus.SUBMITTED || edit.status === HomeworkStatus.LATE) {
        if (!submittedAt) {
          submittedAt = new Date().toISOString();
        }
      } else {
        submittedAt = null;
      }

      try {
        if (sub) {
          await updateSub.mutateAsync({
            id: sub.id,
            data: {
              status: edit.status.toUpperCase(),
              remarks: edit.remarks,
              submittedAt: submittedAt || undefined,
            }
          });
        } else {
          await createSub.mutateAsync({
            session: CURRENT_SESSION,
            homeworkId: homework.id,
            studentId,
            status: edit.status.toUpperCase(),
            remarks: edit.remarks,
            submittedAt: submittedAt || undefined,
          });
        }
        successCount++;
        setEdits(prev => {
          const next = { ...prev };
          delete next[studentId];
          return next;
        });
      } catch (err) {
        failCount++;
      }
    });

    toast.promise(Promise.all(promises), {
      loading: 'Saving all changes...',
      success: () => {
        if (failCount > 0) {
          return `Updated ${successCount} successfully. ${failCount} failed.`;
        }
        return 'All changes saved successfully';
      },
      error: 'Failed to save changes',
    });
  };

  // Filter students based on search and status
  const filteredStudents = React.useMemo(() => {
    return students.filter(student => {
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      const rollNumber = student.academics?.[0]?.rollNumber?.toLowerCase() || '';
      const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || rollNumber.includes(searchQuery.toLowerCase());

      if (statusFilter === 'all') return matchesSearch;

      const current = edits[student.id] || getCurrentVal(student.id);
      return matchesSearch && current.status === statusFilter;
    });
  }, [students, searchQuery, statusFilter, edits, submissions]);

  const getStatusBadgeVariant = (status: HomeworkStatus) => {
    switch (status) {
      case HomeworkStatus.SUBMITTED:
        return 'success';
      case HomeworkStatus.LATE:
        return 'warning';
      case HomeworkStatus.NOT_SUBMITTED:
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: HomeworkStatus) => {
    switch (status) {
      case HomeworkStatus.SUBMITTED:
        return '🟢 Submitted';
      case HomeworkStatus.LATE:
        return '🟡 Late';
      case HomeworkStatus.NOT_SUBMITTED:
        return '🔴 Not Submitted';
      default:
        return '⚪ Pending';
    }
  };

  const STATUS_COLORS: Record<HomeworkStatus, { badge: string }> = {
    [HomeworkStatus.PENDING]: { badge: 'text-slate-700 bg-slate-50 border-slate-200 hover:bg-slate-100/80' },
    [HomeworkStatus.SUBMITTED]: { badge: 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100/80' },
    [HomeworkStatus.LATE]: { badge: 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100/80' },
    [HomeworkStatus.NOT_SUBMITTED]: { badge: 'text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100/80' },
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
                <ChapterTopicTag
                  subjectId={homework.subjectId}
                  chapterId={homework.chapterId}
                  topicId={homework.topicId}
                  chapterName={(homework as any).chapterName}
                  topicName={(homework as any).topicName}
                />
              </div>
            </div>
            <StatusBadge status={new Date(homework.dueDate) < new Date() ? 'overdue' : 'active'} />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{homework.description}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Teacher Attachments */}
        <div className="lg:col-span-1">
          <Card className="rounded-[2rem] border-teal-100 bg-teal-50/10 h-full">
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
        </div>

        {/* Right Col: Student Submissions & Grading */}
        <div className="lg:col-span-2">
          <Card className="rounded-[2rem]">
            <CardHeader className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText size={18} className="text-blue-500" /> Submissions & Grading
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search student..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 w-48 text-xs rounded-xl"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-36 h-9 text-xs rounded-xl">
                      <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value={HomeworkStatus.PENDING}>Pending</SelectItem>
                      <SelectItem value={HomeworkStatus.SUBMITTED}>Submitted</SelectItem>
                      <SelectItem value={HomeworkStatus.LATE}>Late</SelectItem>
                      <SelectItem value={HomeworkStatus.NOT_SUBMITTED}>Not Submitted</SelectItem>
                    </SelectContent>
                  </Select>
                  {Object.keys(edits).length > 0 && (
                    <Button
                      onClick={handleSaveAll}
                      disabled={createSub.isPending || updateSub.isPending}
                      className="h-9 px-4 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:shadow-lg transition-all animate-in zoom-in-95 duration-200 gap-1.5"
                    >
                      {createSub.isPending || updateSub.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      Save All ({Object.keys(edits).length})
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {docsLoading || subsLoading || studentsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-xl" />
                  ))}
                </div>
              ) : !filteredStudents.length ? (
                <p className="text-sm text-slate-400 py-12 text-center">No students found matching filters.</p>
              ) : (
                <div className="overflow-x-auto pb-36 min-h-[260px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs font-bold text-slate-400">
                        <th className="pb-3 pl-2 w-16">Roll</th>
                        <th className="pb-3">Student</th>
                        <th className="pb-3 w-32">Document</th>
                        <th className="pb-3 w-40">Status</th>
                        <th className="pb-3">Remarks</th>
                        <th className="pb-3 pr-2 w-16 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredStudents.map((student) => {
                        const roll = student.academics?.[0]?.rollNumber || '—';
                        const current = edits[student.id] || getCurrentVal(student.id);
                        const isEdited = hasChanges(student.id);
                        const sub = getStudentSubmission(student.id);
                        const doc = documents?.find(d => d.studentId === student.id);

                        const isSaving = (sub && updateSub.isPending && updateSub.variables?.id === sub.id) ||
                          (!sub && createSub.isPending && createSub.variables?.studentId === student.id);

                        return (
                          <tr key={student.id} className="text-xs group hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 pl-2 font-mono text-slate-500">{roll}</td>
                            <td className="py-3 font-semibold text-slate-700">
                              {student.firstName} {student.lastName}
                            </td>
                            <td className="py-3">
                              {doc ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 rounded-lg text-[10px] gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  onClick={() => {
                                    if (doc.signedUrl) {
                                      setPreviewUrl(doc.signedUrl);
                                      setPreviewFilename(doc.documentUrl.split('/').pop() || 'Submission');
                                    } else {
                                      toast.error('No preview URL available');
                                    }
                                  }}
                                >
                                  <Eye size={12} /> View File
                                </Button>
                              ) : (
                                <span className="text-[10px] text-slate-400">No file</span>
                              )}
                            </td>
                            <td className="py-2">
                              <Select
                                value={current.status}
                                onValueChange={(val) => handleStatusChange(student.id, val as HomeworkStatus)}
                              >
                                <SelectTrigger className={`h-8 rounded-lg text-xs w-[140px] font-semibold border ${STATUS_COLORS[current.status]?.badge || STATUS_COLORS[HomeworkStatus.PENDING].badge}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={HomeworkStatus.PENDING}>Pending</SelectItem>
                                  <SelectItem value={HomeworkStatus.SUBMITTED}>Submitted</SelectItem>
                                  <SelectItem value={HomeworkStatus.LATE}>Late</SelectItem>
                                  <SelectItem value={HomeworkStatus.NOT_SUBMITTED}>Not Submitted</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="py-2">
                              <Input
                                value={current.remarks}
                                onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                                placeholder="Add comments..."
                                className="h-8 text-xs rounded-lg w-full max-w-[200px]"
                              />
                            </td>
                            <td className="py-2 pr-2 text-right">
                              {isSaving ? (
                                <Loader2 size={16} className="animate-spin text-teal-600 ml-auto mr-2" />
                              ) : (
                                <Button
                                  variant={isEdited ? "default" : "ghost"}
                                  size="icon"
                                  className={`h-8 w-8 rounded-lg transition-all ${isEdited
                                    ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm'
                                    : 'text-slate-400 opacity-0 group-hover:opacity-100 hover:text-slate-600'
                                    }`}
                                  disabled={!isEdited}
                                  onClick={() => handleSave(student.id)}
                                >
                                  <Check size={14} />
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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
