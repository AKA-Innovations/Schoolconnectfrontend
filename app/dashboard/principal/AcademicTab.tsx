'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, PenLine, BarChart3, List, LayoutGrid, CalendarDays, BookOpen, Search, ChevronLeft, ChevronRight, FolderOpen, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudyMaterials, useSubjectProgress, useHomeworks, useClassworks } from '@/hooks/useAcademic';
import { useClassSectionLists, useSubjectOptions, useSubjectDetails } from '@/hooks/useClasses';
import { StudyMaterialTable } from '@/components/academic/study-material/StudyMaterialTable';
import { CURRENT_SESSION } from '@/lib/constants';

interface AcademicTabProps {
  sub: string;
  allHomeworks: any[];
  allClassworks: any[];
  allProgress: any[];
  loadingHomework: boolean;
  loadingClasswork: boolean;
  loadingProgress: boolean;
  filteredHomeworks: any[];
  filteredClassworks: any[];
  hwDayFilter: string;
  setHwDayFilter: (val: string) => void;
  cwDayFilter: string;
  setCwDayFilter: (val: string) => void;
  hwView: 'grid' | 'list';
  setHwView: (val: 'grid' | 'list') => void;
  cwView: 'grid' | 'list';
  setCwView: (val: 'grid' | 'list') => void;
  progressView: 'grid' | 'list';
  setProgressView: (val: 'grid' | 'list') => void;
  DAY_OPTIONS: Array<{ label: string; value: string }>;
  TableSkeleton: React.ComponentType<any>;
}

// Sub-component to fetch and display progress for each subject mapping
function SubjectProgressCell({
  subjectId,
  classSectionId,
}: {
  subjectId: number | string;
  classSectionId: number | string;
}) {
  const { data: progress, isLoading } = useSubjectProgress(subjectId, classSectionId, CURRENT_SESSION);

  const normalized = useMemo(() => {
    if (!progress) return null;
    const d = (progress as any).data ?? progress;
    return {
      percentage: d.overallPercentage ?? d.completionPercentage ?? 0,
      chaptersCount: d.chaptersCount ?? d.chapters?.length ?? 0,
    };
  }, [progress]);

  if (isLoading) {
    return <div className="h-4 bg-slate-100 animate-pulse rounded w-24" />;
  }

  if (!normalized) {
    return (
      <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
        <Clock className="h-3 w-3 text-slate-400" /> No progress logged
      </span>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-[100px] max-w-[150px]">
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: `${normalized.percentage}%` }} />
        </div>
      </div>
      <span className="text-xs font-bold text-foreground shrink-0">{normalized.percentage}%</span>
      <Badge variant="outline" className="text-[9px] rounded-md font-semibold text-emerald-600 bg-emerald-50/50 border-emerald-100 py-0 h-4 flex items-center gap-0.5">
        <CheckCircle2 className="h-2.5 w-2.5" /> {normalized.chaptersCount} Chapters
      </Badge>
    </div>
  );
}

export function AcademicTab({
  sub,
  allHomeworks,
  allClassworks,
  allProgress,
  loadingHomework,
  loadingClasswork,
  loadingProgress,
  filteredHomeworks,
  filteredClassworks,
  hwDayFilter,
  setHwDayFilter,
  cwDayFilter,
  setCwDayFilter,
  hwView,
  setHwView,
  cwView,
  setCwView,
  progressView,
  setProgressView,
  DAY_OPTIONS,
  TableSkeleton,
}: AcademicTabProps) {
  // Determine which sub-tab to show: default is homework
  const activeSub = sub || 'homework';

  // State & Hooks for Study Materials
  const [materialSearch, setMaterialSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [materialPage, setMaterialPage] = useState(1);
  const itemsPerPage = 10;

  const { data: rawMaterials = [], isLoading: loadingMaterials } = useStudyMaterials();
  const { data: classSections = [] } = useClassSectionLists();
  const { data: subjectOptions = [] } = useSubjectOptions();

  // State & Hooks for Syllabus Progress
  const [selectedProgressClass, setSelectedProgressClass] = useState('');
  const [selectedProgressSection, setSelectedProgressSection] = useState('');
  const { data: subjectDetails = [], isLoading: loadingSubjectDetails } = useSubjectDetails(undefined, CURRENT_SESSION);

  // State & Hooks for Homework
  const [selectedHwClass, setSelectedHwClass] = useState('');
  const [selectedHwSection, setSelectedHwSection] = useState('');
  const { data: rawHomeworks = [], isLoading: loadingHwData } = useHomeworks(selectedHwClass || undefined);

  // State & Hooks for Classwork
  const [selectedCwClass, setSelectedCwClass] = useState('');
  const [selectedCwSection, setSelectedCwSection] = useState('');
  const { data: rawClassworks = [], isLoading: loadingCwData } = useClassworks(selectedCwClass || undefined);

  const isWithinDaysLocal = useCallback((dateStr: string, days: string): boolean => {
    if (days === 'all') return true;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return true;
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    if (days === 'today') {
      const todayStr = now.toISOString().split('T')[0];
      return dateStr.startsWith(todayStr);
    }
    const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= parseInt(days);
  }, []);

  const filteredHomeworksLocal = useMemo(() => {
    if (!selectedHwClass || !selectedHwSection) return [];
    return rawHomeworks.filter(
      (hw: any) =>
        hw.className === selectedHwClass &&
        hw.sectionName === selectedHwSection &&
        isWithinDaysLocal(hw.assignedDate || hw.createdAt || '', hwDayFilter)
    );
  }, [rawHomeworks, selectedHwClass, selectedHwSection, hwDayFilter, isWithinDaysLocal]);

  const filteredClassworksLocal = useMemo(() => {
    if (!selectedCwClass || !selectedCwSection) return [];
    return rawClassworks.filter((cw: any) => {
      const matchClass = cw.classId === selectedCwClass || cw.className === selectedCwClass;
      const matchSection = cw.sectionId === selectedCwSection || cw.sectionName === selectedCwSection;
      return matchClass && matchSection && isWithinDaysLocal(cw.conductedOn || cw.createdAt || '', cwDayFilter);
    });
  }, [rawClassworks, selectedCwClass, selectedCwSection, cwDayFilter, isWithinDaysLocal]);

  // Auto-select first class & section if not set
  useEffect(() => {
    if (classSections.length > 0) {
      const firstClass = classSections[0]?.className;
      const firstSection = classSections.filter(cs => cs.className === firstClass)[0]?.sectionName;

      if (activeSub === 'progress' && !selectedProgressClass) {
        setSelectedProgressClass(firstClass);
        if (firstSection) setSelectedProgressSection(firstSection);
      }
      if (activeSub === 'homework' && !selectedHwClass) {
        setSelectedHwClass(firstClass);
        if (firstSection) setSelectedHwSection(firstSection);
      }
      if (activeSub === 'classwork' && !selectedCwClass) {
        setSelectedCwClass(firstClass);
        if (firstSection) setSelectedCwSection(firstSection);
      }
    }
  }, [activeSub, classSections, selectedProgressClass, selectedHwClass, selectedCwClass]);

  // Homework Filter Options
  const hwClassesList = useMemo(() => {
    return [...new Set(classSections.map((cs) => cs.className))].sort();
  }, [classSections]);

  const hwSectionsList = useMemo(() => {
    if (!selectedHwClass) return [];
    return [
      ...new Set(
        classSections
          .filter((cs) => cs.className === selectedHwClass)
          .map((cs) => cs.sectionName)
      ),
    ].sort();
  }, [classSections, selectedHwClass]);

  // Classwork Filter Options
  const cwClassesList = useMemo(() => {
    return [...new Set(classSections.map((cs) => cs.className))].sort();
  }, [classSections]);

  const cwSectionsList = useMemo(() => {
    if (!selectedCwClass) return [];
    return [
      ...new Set(
        classSections
          .filter((cs) => cs.className === selectedCwClass)
          .map((cs) => cs.sectionName)
      ),
    ].sort();
  }, [classSections, selectedCwClass]);

  // Unique classes list for Syllabus Progress dropdown
  const progressClassesList = useMemo(() => {
    return [...new Set(classSections.map((cs) => cs.className))].sort();
  }, [classSections]);

  // Unique sections list for selected class
  const progressSectionsList = useMemo(() => {
    if (!selectedProgressClass) return [];
    return [
      ...new Set(
        classSections
          .filter((cs) => cs.className === selectedProgressClass)
          .map((cs) => cs.sectionName)
      ),
    ].sort();
  }, [classSections, selectedProgressClass]);

  // Filter subject mappings for the selected class and section
  const progressSubjects = useMemo(() => {
    if (!selectedProgressClass || !selectedProgressSection) return [];
    return subjectDetails.filter(
      (sd: any) =>
        sd.className === selectedProgressClass &&
        sd.sectionName === selectedProgressSection
    );
  }, [subjectDetails, selectedProgressClass, selectedProgressSection]);

  // Reset page when filters change
  useEffect(() => {
    setMaterialPage(1);
  }, [materialSearch, selectedClass, selectedSection]);

  // Unique classes list for Study Materials dropdown
  const classesList = useMemo(() => {
    return [...new Set(classSections.map((cs) => cs.className))].sort();
  }, [classSections]);

  // Unique sections list for selected class
  const sectionsList = useMemo(() => {
    if (!selectedClass) return [];
    return [
      ...new Set(
        classSections
          .filter((cs) => cs.className === selectedClass)
          .map((cs) => cs.sectionName)
      ),
    ].sort();
  }, [classSections, selectedClass]);

  // Enrich & filter materials
  const filteredMaterials = useMemo(() => {
    const classSectionsMap = new Map(classSections.map((cs) => [cs.id, cs]));
    const subjectsMap = new Map(subjectOptions.map((s) => [s.id, s]));

    const enriched = rawMaterials.map((m: any) => {
      const section = classSectionsMap.get(m.classSectionId);
      const subject = subjectsMap.get(m.subjectId);
      return {
        ...m,
        className: section?.className,
        sectionName: section?.sectionName,
        subjectName: subject?.subjectName,
      };
    });

    return enriched.filter((m: any) => {
      if (materialSearch) {
        const q = materialSearch.toLowerCase();
        const descMatch = (m.description || '').toLowerCase().includes(q);
        const fileMatch = (m.documentPath || '').split('/').pop()?.toLowerCase().includes(q);
        if (!descMatch && !fileMatch) return false;
      }
      if (selectedClass && String(m.className) !== selectedClass) return false;
      if (selectedSection && String(m.sectionName) !== selectedSection) return false;
      return true;
    });
  }, [rawMaterials, classSections, subjectOptions, materialSearch, selectedClass, selectedSection]);

  const totalMaterialPages = Math.ceil(filteredMaterials.length / itemsPerPage);
  const paginatedMaterials = useMemo(() => {
    const start = (materialPage - 1) * itemsPerPage;
    return filteredMaterials.slice(start, start + itemsPerPage);
  }, [filteredMaterials, materialPage]);

  return (
    <div className="space-y-6">
      {/* ── Homework Section ─────────────────────────────────────────── */}
      {activeSub === 'homework' && (
        <Card className="erp-card border-none bg-white/40 backdrop-blur-md shadow-xl shadow-slate-200/50">
          <CardHeader className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-500" /> Homework
                </CardTitle>
                <CardDescription className="text-xs mt-1">Read-only overview of homework assigned across the school</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {DAY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setHwDayFilter(opt.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all',
                      hwDayFilter === opt.value
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
                <div className="h-5 w-px bg-slate-200 mx-1" />
                <button
                  onClick={() => setHwView('list')}
                  className={cn('p-1.5 rounded-lg', hwView === 'list' ? 'bg-primary/10 text-primary' : 'text-slate-400')}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setHwView('grid')}
                  className={cn('p-1.5 rounded-lg', hwView === 'grid' ? 'bg-primary/10 text-primary' : 'text-slate-400')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-4 border-t border-slate-100/50 pt-4">
              {/* Class Select */}
              <div className="w-full sm:w-40">
                <select
                  value={selectedHwClass}
                  onChange={(e) => {
                    setSelectedHwClass(e.target.value);
                    setSelectedHwSection('');
                  }}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select Class</option>
                  {hwClassesList.map((cls) => (
                    <option key={cls} value={cls}>
                      Class {cls}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section Select */}
              <div className="w-full sm:w-40">
                <select
                  value={selectedHwSection}
                  onChange={(e) => setSelectedHwSection(e.target.value)}
                  disabled={!selectedHwClass}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                >
                  <option value="">Select Section</option>
                  {hwSectionsList.map((sec) => (
                    <option key={sec} value={sec}>
                      Section {sec}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingHwData ? (
              <TableSkeleton />
            ) : !selectedHwClass || !selectedHwSection ? (
              <div className="text-center py-10 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold">Please select a class and section to view homework</p>
              </div>
            ) : filteredHomeworksLocal.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold">No homework found for Class {selectedHwClass} - {selectedHwSection} in the selected period</p>
              </div>
            ) : hwView === 'list' ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['Title', 'Class - Section', 'Assigned Date', 'Due Date', 'Description'].map((h) => (
                        <th
                          key={h}
                          className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredHomeworksLocal.map((hw: any) => (
                      <tr key={hw.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 text-sm font-bold text-foreground">{hw.title || '—'}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-[10px] rounded-md font-bold">
                            {hw.className || '?'} - {hw.sectionName || '?'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground font-medium">
                          {hw.assignedDate?.split('T')[0] || '—'}
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground font-medium">
                          {hw.dueDate?.split('T')[0] || '—'}
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground max-w-[200px] truncate">
                          {hw.description || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredHomeworksLocal.map((hw: any) => (
                  <div
                    key={hw.id}
                    className="p-4 rounded-2xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-bold text-sm text-foreground leading-snug">{hw.title || 'Untitled'}</h4>
                      <Badge variant="outline" className="text-[9px] rounded-md shrink-0">
                        {hw.className}-{hw.sectionName}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{hw.description || 'No description'}</p>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                      <span>Assigned: {hw.assignedDate?.split('T')[0]}</span>
                      <span>Due: {hw.dueDate?.split('T')[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {selectedHwClass && selectedHwSection && (
              <p className="text-[10px] text-muted-foreground mt-3 font-bold">
                {filteredHomeworksLocal.length} homework item{filteredHomeworksLocal.length !== 1 ? 's' : ''} shown
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Classwork Section ────────────────────────────────────────── */}
      {activeSub === 'classwork' && (
        <Card className="erp-card border-none bg-white/40 backdrop-blur-md shadow-xl shadow-slate-200/50">
          <CardHeader className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <PenLine className="h-5 w-5 text-teal-500" /> Classwork
                </CardTitle>
                <CardDescription className="text-xs mt-1">Daily classwork logs across all sections</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {DAY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setCwDayFilter(opt.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all',
                      cwDayFilter === opt.value
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
                <div className="h-5 w-px bg-slate-200 mx-1" />
                <button
                  onClick={() => setCwView('list')}
                  className={cn('p-1.5 rounded-lg', cwView === 'list' ? 'bg-primary/10 text-primary' : 'text-slate-400')}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCwView('grid')}
                  className={cn('p-1.5 rounded-lg', cwView === 'grid' ? 'bg-primary/10 text-primary' : 'text-slate-400')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-4 border-t border-slate-100/50 pt-4">
              {/* Class Select */}
              <div className="w-full sm:w-40">
                <select
                  value={selectedCwClass}
                  onChange={(e) => {
                    setSelectedCwClass(e.target.value);
                    setSelectedCwSection('');
                  }}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select Class</option>
                  {cwClassesList.map((cls) => (
                    <option key={cls} value={cls}>
                      Class {cls}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section Select */}
              <div className="w-full sm:w-40">
                <select
                  value={selectedCwSection}
                  onChange={(e) => setSelectedCwSection(e.target.value)}
                  disabled={!selectedCwClass}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                >
                  <option value="">Select Section</option>
                  {cwSectionsList.map((sec) => (
                    <option key={sec} value={sec}>
                      Section {sec}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingCwData ? (
              <TableSkeleton />
            ) : !selectedCwClass || !selectedCwSection ? (
              <div className="text-center py-10 text-muted-foreground">
                <PenLine className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold">Please select a class and section to view classwork</p>
              </div>
            ) : filteredClassworksLocal.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <PenLine className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold">No classwork found for Class {selectedCwClass} - {selectedCwSection} in the selected period</p>
              </div>
            ) : cwView === 'list' ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['Description', 'Conducted On', 'Teacher', 'Created'].map((h) => (
                        <th
                          key={h}
                          className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredClassworksLocal.map((cw: any) => (
                      <tr key={cw.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 text-sm font-semibold text-foreground max-w-[300px] truncate">
                          {cw.description || '—'}
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground font-medium">
                          {cw.conductedOn?.split('T')[0] || '—'}
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">{cw.teacherId?.slice(0, 8) || '—'}</td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">{cw.createdAt?.split('T')[0] || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClassworksLocal.map((cw: any) => (
                  <div
                    key={cw.id}
                    className="p-4 rounded-2xl border border-slate-100 bg-white hover:border-teal-200 hover:shadow-lg hover:shadow-teal-50 transition-all"
                  >
                    <p className="text-sm font-semibold text-foreground line-clamp-3 mb-3">{cw.description || 'No description'}</p>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" /> {cw.conductedOn?.split('T')[0] || '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {selectedCwClass && selectedCwSection && (
              <p className="text-[10px] text-muted-foreground mt-3 font-bold">
                {filteredClassworksLocal.length} classwork item{filteredClassworksLocal.length !== 1 ? 's' : ''} shown
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Teaching Progress Section ────────────────────────────────── */}
      {activeSub === 'progress' && (
        <Card className="erp-card border-none bg-white/40 backdrop-blur-md shadow-xl shadow-slate-200/50">
          <CardHeader className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-amber-500" /> Syllabus Progress — Class-wide
                </CardTitle>
                <CardDescription className="text-xs mt-1">Syllabus completion percentage for selected class and section</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setProgressView('grid')}
                  className={cn('p-1.5 rounded-lg', progressView === 'grid' ? 'bg-primary/10 text-primary' : 'text-slate-400')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setProgressView('list')}
                  className={cn('p-1.5 rounded-lg', progressView === 'list' ? 'bg-primary/10 text-primary' : 'text-slate-400')}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-4 border-t border-slate-100/50 pt-4">
              {/* Class Select */}
              <div className="w-full sm:w-40">
                <select
                  value={selectedProgressClass}
                  onChange={(e) => {
                    setSelectedProgressClass(e.target.value);
                    setSelectedProgressSection('');
                  }}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select Class</option>
                  {progressClassesList.map((cls) => (
                    <option key={cls} value={cls}>
                      Class {cls}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section Select */}
              <div className="w-full sm:w-40">
                <select
                  value={selectedProgressSection}
                  onChange={(e) => setSelectedProgressSection(e.target.value)}
                  disabled={!selectedProgressClass}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                >
                  <option value="">Select Section</option>
                  {progressSectionsList.map((sec) => (
                    <option key={sec} value={sec}>
                      Section {sec}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingSubjectDetails ? (
              <TableSkeleton />
            ) : !selectedProgressClass || !selectedProgressSection ? (
              <div className="text-center py-10 text-muted-foreground">
                <BarChart3 className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold">Please select a class and section to view progress</p>
              </div>
            ) : progressSubjects.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <BarChart3 className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold">No subjects mapped to Class {selectedProgressClass} - {selectedProgressSection}</p>
              </div>
            ) : progressView === 'list' ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/10">
                      {['Subject', 'Assigned Teacher', 'Syllabus Progress'].map((h) => (
                        <th
                          key={h}
                          className="text-left py-3.5 px-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {progressSubjects.map((mapping: any) => {
                      const csId = mapping.classDtlsId || mapping.classSectionId;
                      const sId = mapping.subjectDtlsId || mapping.subjectId;

                      return (
                        <tr key={mapping.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-6">
                            <span className="font-bold text-sm text-foreground">
                              {mapping.subjectName}
                            </span>
                          </td>
                          <td className="py-3.5 px-6">
                            <span className="text-xs text-foreground font-semibold">
                              {mapping.teacherName || 'Unassigned'}
                            </span>
                          </td>
                          <td className="py-3.5 px-6">
                            {sId && csId ? (
                              <SubjectProgressCell
                                subjectId={sId}
                                classSectionId={csId}
                              />
                            ) : (
                              <span className="text-xs text-muted-foreground/50">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {progressSubjects.map((mapping: any) => {
                  const csId = mapping.classDtlsId || mapping.classSectionId;
                  const sId = mapping.subjectDtlsId || mapping.subjectId;

                  return (
                    <div
                      key={mapping.id}
                      className="p-5 rounded-2xl border border-slate-100 bg-white hover:border-amber-200 hover:shadow-lg hover:shadow-amber-50 transition-all space-y-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-sm text-foreground leading-snug">{mapping.subjectName}</h4>
                          <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                            Teacher: <span className="text-foreground font-semibold">{mapping.teacherName || 'Unassigned'}</span>
                          </p>
                        </div>
                        <Badge variant="secondary" className="rounded-lg text-[9px]">
                          {selectedProgressClass}-{selectedProgressSection}
                        </Badge>
                      </div>

                      {sId && csId ? (
                        <SubjectProgressCell
                          subjectId={sId}
                          classSectionId={csId}
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground/50">Progress unmapped</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <p className="text-[10px] text-muted-foreground mt-4 font-bold">
              {progressSubjects.length} subject{progressSubjects.length !== 1 ? 's' : ''} listed
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Study Materials Section ───────────────────────────────────── */}
      {activeSub === 'materials' && (
        <Card className="erp-card border-none bg-white/40 backdrop-blur-md shadow-xl shadow-slate-200/50">
          <CardHeader className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-emerald-500" /> Study Materials — All Classes
                </CardTitle>
                <CardDescription className="text-xs mt-1">Syllabus materials and files uploaded by teachers</CardDescription>
              </div>
            </div>

            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row items-center gap-4 border-t border-slate-100/50 pt-4">
              {/* Search */}
              <div className="relative flex-1 w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search materials..."
                  value={materialSearch}
                  onChange={(e) => setMaterialSearch(e.target.value)}
                  className="pl-9 text-xs rounded-xl h-10 bg-white/50"
                />
              </div>

              {/* Class Select */}
              <div className="w-full sm:w-40">
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setSelectedSection('');
                  }}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">All Classes</option>
                  {classesList.map((cls) => (
                    <option key={cls} value={cls}>
                      Class {cls}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section Select */}
              <div className="w-full sm:w-40">
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  disabled={!selectedClass}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                >
                  <option value="">All Sections</option>
                  {sectionsList.map((sec) => (
                    <option key={sec} value={sec}>
                      Section {sec}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loadingMaterials ? (
              <TableSkeleton rows={8} cols={5} />
            ) : paginatedMaterials.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FolderOpen className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold">No study materials found</p>
              </div>
            ) : (
              <div>
                <StudyMaterialTable
                  materials={paginatedMaterials}
                  isLoading={loadingMaterials}
                  onDelete={() => {}}
                />
                
                {/* Pagination Footer */}
                {totalMaterialPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100/80 px-6 py-4 bg-slate-50/20 gap-4">
                    <div className="text-xs text-muted-foreground font-medium">
                      Showing <span className="font-bold text-foreground">{((materialPage - 1) * itemsPerPage) + 1}</span> to{' '}
                      <span className="font-bold text-foreground">
                        {Math.min(materialPage * itemsPerPage, filteredMaterials.length)}
                      </span>{' '}
                      of <span className="font-bold text-foreground">{filteredMaterials.length}</span> materials
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={materialPage === 1}
                        onClick={() => setMaterialPage((p) => Math.max(p - 1, 1))}
                        className="h-8 w-8 rounded-lg border-slate-200 bg-white/50 disabled:opacity-40"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalMaterialPages }).map((_, idx) => {
                          const pageNum = idx + 1;
                          if (
                            pageNum === 1 ||
                            pageNum === totalMaterialPages ||
                            Math.abs(pageNum - materialPage) <= 1
                          ) {
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setMaterialPage(pageNum)}
                                className={cn(
                                  "h-8 min-w-[32px] px-2.5 rounded-lg text-xs font-bold transition-all",
                                  materialPage === pageNum
                                    ? "bg-primary text-white shadow-sm"
                                    : "bg-white/50 border border-slate-100 text-muted-foreground hover:bg-white hover:text-foreground"
                                )}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                          if (
                            (pageNum === 2 && materialPage > 3) ||
                            (pageNum === totalMaterialPages - 1 && materialPage < totalMaterialPages - 2)
                          ) {
                            return (
                              <span key={pageNum} className="text-xs text-muted-foreground/50 px-1 select-none">
                                ...
                              </span>
                            );
                          }
                          return null;
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={materialPage === totalMaterialPages}
                        onClick={() => setMaterialPage((p) => Math.min(p + 1, totalMaterialPages))}
                        className="h-8 w-8 rounded-lg border-slate-200 bg-white/50 disabled:opacity-40"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
