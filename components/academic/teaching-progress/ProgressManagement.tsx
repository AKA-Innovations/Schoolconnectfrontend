'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useDeleteProgress, useSubjectChapters, useSubjectTopics, useSubjectProgress } from '@/hooks/useAcademic';
import { useSubjectDetails } from '@/hooks/useClasses';
import { useAuthStore } from '@/store/authStore';
import { CURRENT_SESSION } from '@/lib/constants';
import { AcademicPageHeader } from '../shared/AcademicPageHeader';
import { AcademicFilterBar } from '../shared/AcademicFilterBar';
import { ProgressAnalytics } from './ProgressAnalytics';
import type { TeachingProgress, SubjectChapter } from '@/services/academic/types';
import { ChapterProgressTable } from './ChapterProgressTable';
import { ProgressFormModal } from './ProgressFormModal';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

import { useTeacherProfile } from '@/hooks/useTeacherProfile';

interface Props { teacherIdOverride?: string; }

export function ProgressManagement({ teacherIdOverride }: Props) {
  const user = useAuthStore((s) => s.user);
  const teacherId = teacherIdOverride ?? (user?.role === 'teacher' ? user.id : undefined);

  const [isFormOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<TeachingProgress | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState('');

  const { data: taughtSubjects = [] } = useSubjectDetails(teacherId, CURRENT_SESSION);
  const { isClassTeacher, assignedClass } = useTeacherProfile();

  // If they are a class teacher, they might want to see all subjects in their class
  // Especially if they don't teach any subjects themselves
  const { data: classWideSubjects = [] } = useSubjectDetails(
    undefined, 
    CURRENT_SESSION, 
    (assignedClass as any)?.classDtlsId
  );

  const mySubjects = useMemo(() => {
    // For Class Teachers, we always want the full class view
    if (isClassTeacher && classWideSubjects.length > 0) return classWideSubjects;
    return taughtSubjects;
  }, [taughtSubjects, classWideSubjects, isClassTeacher]);

  // Derive IDs from selected assignment for API filtering
  const { selectedClassSectionId, selectedSubjectId } = useMemo(() => {
    if (!selectedAssignment) return { selectedClassSectionId: undefined, selectedSubjectId: undefined };
    const sd = mySubjects.find((s) => String(s.id) === selectedAssignment) as any;
    return {
      selectedClassSectionId: sd?.classDtlsId || sd?.classSectionId,
      selectedSubjectId: sd?.subjectDtlsId || sd?.subjectId
    };
  }, [selectedAssignment, mySubjects]);

  // Fetch chapters for the selected subject
  const { data: chapters = [], isLoading: chaptersLoading } = useSubjectChapters(selectedSubjectId, CURRENT_SESSION);

  const deleteMutation = useDeleteProgress();

  // Fetch high-level subject progress summary
  const { data: subjectSummary, refetch, isFetching } = useSubjectProgress(
    selectedSubjectId,
    selectedClassSectionId,
    CURRENT_SESSION
  );

  const items = useMemo(() => {
    if (!statusFilter) return chapters;
    // Note: status filter might not be directly applicable to SubjectChapter unless we have progress for each
    return chapters;
  }, [chapters, statusFilter]);

  // Derive prefill from selected assignment
  const prefill = useMemo(() => {
    if (!selectedAssignment) return undefined;
    const sd = mySubjects.find((s) => String(s.id) === selectedAssignment);
    if (!sd) return undefined;
    return {
      className: sd.className ?? '',
      sectionName: sd.sectionName ?? '',
      subjectName: sd.subjectName ?? '',
      subjectId: String(sd.id),
      classSectionId: sd.classDtlsId || (sd as any).classSectionId,
      subjectDtlsId: sd.subjectDtlsId || (sd as any).subjectId,
    };
  }, [selectedAssignment, mySubjects]);

  // Auto-select first assignment if available and nothing selected
  useEffect(() => {
    if (mySubjects.length > 0 && !selectedAssignment) {
      setSelectedAssignment(String(mySubjects[0].id));
    }
  }, [mySubjects, selectedAssignment]);

  const handleEdit = (ch: SubjectChapter) => {
    setEditItem({
      id: 0,
      chapterId: ch.id,
      subjectId: Number(selectedSubjectId),
      classSectionId: Number(selectedClassSectionId),
      status: 'not_started',
      completionPercentage: 0,
      session: CURRENT_SESSION,
      schoolId: ch.schoolId,
      topicId: 0,
      createdAt: '',
      updatedAt: ''
    } as any);
    setFormOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AcademicPageHeader badge="Syllabus Tracking" title="Teaching" titleAccent="Progress">
        <Button variant="outline" size="icon" onClick={() => refetch()} className="rounded-2xl h-12 w-12 border-slate-200">
          <RefreshCw className={`h-4 w-4 text-slate-500 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
        <Button onClick={() => { setEditItem(null); setFormOpen(true); }} className="h-12 px-6 rounded-2xl"
          disabled={!selectedAssignment}>
          <Plus className="mr-2 h-5 w-5" /><span className="font-bold">Log Progress</span>
        </Button>
      </AcademicPageHeader>

      {/* Assignment selector */}
      {mySubjects.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Assignment:</span>
          <div className="min-w-[280px]">
            <Select
              value={selectedAssignment}
              onValueChange={setSelectedAssignment}
            >
              <SelectTrigger>
                <SelectValue placeholder="— Select Class-Subject —" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">— Select Class-Subject —</SelectItem>
                {mySubjects.map((sd) => (
                  <SelectItem key={sd.id} value={String(sd.id)}>
                    {sd.className} {sd.sectionName} — {sd.subjectName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {subjectSummary && (
        <Card className="rounded-2xl border border-teal-100/30 bg-teal-50/10 dark:bg-teal-950/20 dark:border-teal-900/40 overflow-hidden shadow-sm">
          <CardContent className="p-6">
            {(() => {
              const d = (subjectSummary as any).data ?? subjectSummary;
              const percentage = d.overallPercentage ?? d.completionPercentage ?? 0;
              const chaptersCount = d.chaptersCount ?? d.chapters?.length ?? 0;
              
              return (
                <>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Overall Subject Progress</p>
                      <h3 className="text-xl font-bold text-foreground">
                        {mySubjects.find(s => String(s.id) === selectedAssignment)?.subjectName}
                      </h3>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{percentage}%</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Completion</p>
                      </div>
                      <div className="h-12 w-[1px] bg-border/50 hidden md:block" />
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">{chaptersCount}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Chapters</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 h-2 w-full bg-muted/40 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-1000"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Subject Coverage Analytics */}
      {subjectSummary && (
        <ProgressAnalytics summary={subjectSummary} />
      )}

      <AcademicFilterBar searchTerm={statusFilter} onSearchChange={setStatusFilter} searchPlaceholder="Filter by status (completed, IN_PROGRESS, not_started)..."
        onClear={() => setStatusFilter('')} hasActiveFilters={!!statusFilter} />

      <ChapterProgressTable 
        chapters={items} 
        classSectionId={selectedClassSectionId} 
        isLoading={chaptersLoading} 
        onEdit={handleEdit} 
      />

      <ProgressFormModal open={isFormOpen} onOpenChange={setFormOpen} editItem={editItem}
        prefill={prefill}
        onSuccess={() => { setFormOpen(false); setEditItem(null); refetch(); }} />
    </div>
  );
}
