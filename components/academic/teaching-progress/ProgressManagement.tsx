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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

import { useTeacherProfile } from '@/hooks/useTeacherProfile';

interface Props { teacherIdOverride?: string; }

export function ProgressManagement({ teacherIdOverride }: Props) {
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const teacherId = teacherIdOverride ?? user?.id;

  const canLogProgress = role === 'teacher' || role === 'subject_coordinator';

  const [statusFilter, setStatusFilter] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState('');

  // Admin cascading filter state
  const [adminClass, setAdminClass] = useState('');
  const [adminSection, setAdminSection] = useState('');
  const [adminSubject, setAdminSubject] = useState('');

  const { data: taughtSubjects = [] } = useSubjectDetails(teacherId, CURRENT_SESSION);
  const { isClassTeacher, assignedClass } = useTeacherProfile();

  // If they are a class teacher, they might want to see all subjects in their class
  // Especially if they don't teach any subjects themselves
  const { data: classWideSubjects = [] } = useSubjectDetails(
    undefined, 
    CURRENT_SESSION, 
    (assignedClass as any)?.classDtlsId || (assignedClass as any)?.classSectionId || (assignedClass as any)?.id
  );

  const mySubjects = useMemo(() => {
    const map = new Map<string, (typeof taughtSubjects)[0]>();

    // 1. Always add all subjects taught by the teacher
    taughtSubjects.forEach((s) => {
      map.set(String(s.id), s);
    });

    // 2. If class teacher, also include subjects of their class teacher class for viewing progress
    if (isClassTeacher && classWideSubjects.length > 0) {
      classWideSubjects.forEach((s) => {
        const classId = s.classDtlsId || (s as any).classSectionId;
        const subId = s.subjectDtlsId || (s as any).subjectId;

        const alreadyInTaught = taughtSubjects.some((ts) => {
          const tsClassId = ts.classDtlsId || (ts as any).classSectionId;
          const tsSubId = ts.subjectDtlsId || (ts as any).subjectId;
          return tsClassId === classId && tsSubId === subId;
        });

        if (!alreadyInTaught && !map.has(String(s.id))) {
          map.set(String(s.id), s);
        }
      });
    }

    return Array.from(map.values());
  }, [taughtSubjects, classWideSubjects, isClassTeacher]);

  const isSubjectTaughtByMe = useMemo(() => {
    if (!canLogProgress) return true;
    if (!selectedAssignment) return false;

    const active = mySubjects.find((s) => String(s.id) === selectedAssignment);
    if (!active) return false;

    const activeClassId = active.classDtlsId || (active as any).classSectionId;
    const activeSubId = active.subjectDtlsId || (active as any).subjectId;

    return taughtSubjects.some((ts) => {
      if (String(ts.id) === String(active.id)) return true;
      const tsClassId = ts.classDtlsId || (ts as any).classSectionId;
      const tsSubId = ts.subjectDtlsId || (ts as any).subjectId;
      return tsClassId === activeClassId && tsSubId === activeSubId;
    });
  }, [canLogProgress, selectedAssignment, mySubjects, taughtSubjects]);

  const uniqueClasses = useMemo(() => {
    const set = new Set(mySubjects.map((s) => s.className).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [mySubjects]);

  const uniqueSections = useMemo(() => {
    if (!adminClass) return [];
    const set = new Set(
      mySubjects
        .filter((s) => s.className === adminClass)
        .map((s) => s.sectionName)
        .filter(Boolean) as string[]
    );
    return Array.from(set).sort();
  }, [mySubjects, adminClass]);

  const uniqueSubjects = useMemo(() => {
    if (!adminClass || !adminSection) return [];
    const set = new Set(
      mySubjects
        .filter((s) => s.className === adminClass && s.sectionName === adminSection)
        .map((s) => s.subjectName)
        .filter(Boolean) as string[]
    );
    return Array.from(set).sort();
  }, [mySubjects, adminClass, adminSection]);

  const handleClassChange = (newClass: string) => {
    setAdminClass(newClass);
    setAdminSection('');
    setAdminSubject('');
    setSelectedAssignment('');
  };

  const handleSectionChange = (newSection: string) => {
    setAdminSection(newSection);
    setAdminSubject('');
    setSelectedAssignment('');
  };

  const handleSubjectChange = (newSubject: string) => {
    setAdminSubject(newSubject);
    const active = mySubjects.find(
      (s) =>
        (s.className ?? '') === adminClass &&
        (s.sectionName ?? '') === adminSection &&
        (s.subjectName ?? '') === newSubject
    );
    if (active) {
      setSelectedAssignment(String(active.id));
    } else {
      setSelectedAssignment('');
    }
  };

  // Sync state if selectedAssignment changes from outside/initial load
  useEffect(() => {
    if (selectedAssignment && mySubjects.length > 0) {
      const active = mySubjects.find((s) => String(s.id) === selectedAssignment);
      if (active) {
        setAdminClass(active.className ?? '');
        setAdminSection(active.sectionName ?? '');
        setAdminSubject(active.subjectName ?? '');
      }
    }
  }, [selectedAssignment, mySubjects]);

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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AcademicPageHeader badge="Syllabus Tracking" title="Teaching" titleAccent="Progress">
        <Button variant="outline" size="icon" onClick={() => refetch()} className="rounded-2xl h-12 w-12 border-slate-200">
          <RefreshCw className={`h-4 w-4 text-slate-500 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </AcademicPageHeader>

      {/* Assignment selector */}
      {mySubjects.length > 0 && (
        <div className="flex items-center gap-4 flex-wrap">
          {!canLogProgress ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Class:</span>
                <div className="min-w-[150px]">
                  <Select value={adminClass} onValueChange={handleClassChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueClasses.map((c) => (
                        <SelectItem key={c} value={c}>{`Class ${c}`}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Section:</span>
                <div className="min-w-[120px]">
                  <Select 
                    value={adminSection} 
                    onValueChange={handleSectionChange}
                    disabled={!adminClass}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Section" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueSections.map((s) => (
                        <SelectItem key={s} value={s}>{`Section ${s}`}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Subject:</span>
                <div className="min-w-[200px]">
                  <Select 
                    value={adminSubject} 
                    onValueChange={handleSubjectChange}
                    disabled={!adminSection}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueSubjects.map((sub) => (
                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
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
                    {mySubjects.map((sd) => {
                      const sdClassId = sd.classDtlsId || (sd as any).classSectionId;
                      const sdSubId = sd.subjectDtlsId || (sd as any).subjectId;
                      const isTaught = taughtSubjects.some((ts) => {
                        if (String(ts.id) === String(sd.id)) return true;
                        const tsClassId = ts.classDtlsId || (ts as any).classSectionId;
                        const tsSubId = ts.subjectDtlsId || (ts as any).subjectId;
                        return tsClassId === sdClassId && tsSubId === sdSubId;
                      });

                      return (
                        <SelectItem key={sd.id} value={String(sd.id)}>
                          {`${sd.className || ''} ${sd.sectionName || ''} — ${sd.subjectName || ''}${
                            !isTaught ? ' (Class Teacher View)' : ''
                          }`}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      )}

      {subjectSummary && (
        <Card className="rounded-2xl border border-teal-100/30 bg-teal-50/10 dark:bg-teal-950/20 dark:border-teal-900/40 overflow-hidden shadow-sm">
          <CardContent className="p-6">
            {(() => {
              const d = (subjectSummary as any).data ?? subjectSummary;
              const percentage = d.overallPercentage ?? d.completionPercentage ?? 0;
              const chaptersCount = d.chaptersCount ?? d.chapters?.length ?? 0;
              const activeSd = mySubjects.find(s => String(s.id) === selectedAssignment);
              
              return (
                <>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Overall Subject Progress</p>
                        {!isSubjectTaughtByMe && (
                          <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-full border border-amber-500/20">
                            Class Teacher View (Read Only)
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                        {activeSd?.subjectName}
                        {activeSd?.teacherName && !isSubjectTaughtByMe && (
                          <span className="text-xs font-medium text-muted-foreground">
                            (Teacher: {activeSd.teacherName})
                          </span>
                        )}
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
        canEdit={isSubjectTaughtByMe}
      />
    </div>
  );
}
