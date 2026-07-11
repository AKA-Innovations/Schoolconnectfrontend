'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useClassSectionLists } from '@/hooks/useClasses';
import { useStudentList, useFilterAttendance } from '@/hooks/useStudents';
import { StudentListItem, AttendanceRecord } from '@/types/student.types';
import { Users, GraduationCap, CalendarCheck2, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

const STATUS_STYLES: Record<string, string> = {
  Present:  'bg-emerald-100 text-emerald-700 border-emerald-200',
  Absent:   'bg-rose-100   text-rose-700   border-rose-200',
  Late:     'bg-amber-100  text-amber-700  border-amber-200',
  HalfDay:  'bg-sky-100    text-sky-700    border-sky-200',
};

const ATTENDANCE_FILTER_OPTIONS = ['All', 'Present', 'Absent', 'Late', 'HalfDay', 'Not Marked'] as const;
type AttendanceFilter = typeof ATTENDANCE_FILTER_OPTIONS[number];

// ─── Root Component ───────────────────────────────────────────────────────────

export function ClassStudentsView() {
  const { data: classSectionsData, isLoading: loadingClasses } = useClassSectionLists();

  const classSections: { className: string; sectionName: string }[] =
    (classSectionsData as any)?.classSections ?? (Array.isArray(classSectionsData) ? classSectionsData : []);

  const classNames: string[] = Array.from(new Set(classSections.map((s) => s.className))).sort();

  const [selectedClass, setSelectedClass]     = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [search, setSearch]                   = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState<AttendanceFilter>('All');
  const [genderFilter, setGenderFilter]       = useState('');

  const sectionsForClass = useMemo(
    () => classSections.filter((s) => s.className === selectedClass).map((s) => s.sectionName).sort(),
    [classSections, selectedClass]
  );

  const today = todayIso();

  // Find the selected section record to get its ID
  const selSectionRecord = classSectionsData?.find(
    (s: any) => s.className === selectedClass && s.sectionName === selectedSection
  );

  // Only fetch when BOTH class AND section are selected.
  // The backend student/attendance APIs reject className as a query param (400).
  const canFetch = !!selectedClass && !!selectedSection && !!selSectionRecord?.masterSectionId;

  // Student fetch — filtered by masterSectionId only
  const { data: studentData, isLoading: loadingStudents } = useStudentList(
    { classSectionId: selSectionRecord?.masterSectionId, limit: 200 },
    { enabled: canFetch }
  );

  // Attendance fetch — filtered by masterSectionId + today
  const { data: rawAttendance, isLoading: loadingAttendance } = useFilterAttendance(
    { classSectionId: selSectionRecord?.masterSectionId, date: today },
  );

  const attendanceRecords: AttendanceRecord[] = Array.isArray(rawAttendance) ? rawAttendance : [];

  const students: StudentListItem[] = studentData?.items ?? [];

  // Build attendance map: studentId -> status
  const attendanceMap = useMemo(() => {
    const map: Record<string, string> = {};
    attendanceRecords.forEach((r) => {
      if (r.studentId) map[r.studentId] = r.status;
    });
    return map;
  }, [attendanceRecords]);

  // Apply search + attendance + gender filters
  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      if (q) {
        const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
        const roll     = (s.academics?.[0]?.rollNumber ?? '').toLowerCase();
        if (!fullName.includes(q) && !roll.includes(q)) return false;
      }
      if (genderFilter && (s.gender ?? '').toLowerCase() !== genderFilter.toLowerCase()) return false;
      if (attendanceFilter !== 'All') {
        const status = attendanceMap[s.id];
        if (attendanceFilter === 'Not Marked' && status) return false;
        if (attendanceFilter !== 'Not Marked' && status !== attendanceFilter) return false;
      }
      return true;
    });
  }, [students, search, genderFilter, attendanceFilter, attendanceMap]);

  // Group filtered students by section
  const grouped = useMemo(() => {
    const map: Record<string, StudentListItem[]> = {};
    filteredStudents.forEach((s) => {
      const section = s.academics?.[0]?.sectionName ?? 'Unknown';
      if (!map[section]) map[section] = [];
      map[section].push(s);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredStudents]);

  // Stats
  const totalStudents   = students.length;
  const presentCount    = students.filter((s) => attendanceMap[s.id] === 'Present').length;
  const absentCount     = students.filter((s) => attendanceMap[s.id] === 'Absent').length;
  const lateCount       = students.filter((s) => attendanceMap[s.id] === 'Late').length;
  const notMarkedCount  = students.filter((s) => !attendanceMap[s.id]).length;

  const isLoading = loadingStudents || loadingAttendance;
  const hasActiveFilter = search || attendanceFilter !== 'All' || genderFilter;

  const clearFilters = () => { setSearch(''); setAttendanceFilter('All'); setGenderFilter(''); };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Class Students</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Section-wise student list with today&apos;s attendance ({today})
        </p>
      </div>

      {/* Class / Section pickers */}
      <Card className="erp-card">
        <CardContent className="p-6 flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1.5 min-w-45">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => { setSelectedClass(e.target.value); setSelectedSection(''); clearFilters(); }}
              className="h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={loadingClasses}
            >
              <option value="">Select class…</option>
              {classNames.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 min-w-40">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={!selectedClass}
            >
              <option value="">All sections</option>
              {sectionsForClass.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {selectedClass && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold mt-5">
              <CalendarCheck2 className="h-4 w-4 opacity-60" />
              Attendance date: {today}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats bar */}
      {selectedClass && !isLoading && totalStudents > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: totalStudents, color: 'text-foreground' },
            { label: 'Present', value: presentCount, color: 'text-emerald-600' },
            { label: 'Absent',  value: absentCount,  color: 'text-rose-600'   },
            { label: 'Late',    value: lateCount,    color: 'text-amber-600'  },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
              <p className={cn('text-2xl font-black mt-1', color)}>{value}</p>
              {totalStudents > 0 && label !== 'Total' && (
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                  {Math.round((value / totalStudents) * 100)}% of class
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Search + filters row */}
      {selectedClass && (
        <Card className="erp-card">
          <CardContent className="p-5 flex flex-wrap gap-3 items-end">
            {/* Name / roll search */}
            <div className="flex flex-col gap-1.5 flex-1 min-w-48">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Name or roll number…"
                  className="pl-9 rounded-xl h-10"
                />
              </div>
            </div>
            {/* Attendance status filter */}
            <div className="flex flex-col gap-1.5 min-w-40">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Attendance</label>
              <select
                value={attendanceFilter}
                onChange={(e) => setAttendanceFilter(e.target.value as AttendanceFilter)}
                className="h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {ATTENDANCE_FILTER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            {/* Gender filter */}
            <div className="flex flex-col gap-1.5 min-w-36">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Gender</label>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {/* Clear filters */}
            {hasActiveFilter && (
              <button
                onClick={clearFilters}
                className="mb-0.5 flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors h-10 px-3 rounded-xl border border-border/50 hover:bg-muted/30"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            )}
            {hasActiveFilter && (
              <p className="text-xs text-muted-foreground/70 font-semibold mt-5">
                Showing {filteredStudents.length} of {totalStudents}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Content */}
      {!selectedClass ? (
        <div className="py-24 text-center text-muted-foreground/40 bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
          <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="text-[11px] font-bold uppercase tracking-widest">Select a class to view students</p>
        </div>
      ) : !selectedSection ? (
        <div className="py-24 text-center text-muted-foreground/40 bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="text-[11px] font-bold uppercase tracking-widest">Select a section to load students</p>
          <p className="text-xs text-muted-foreground/30 mt-2">{sectionsForClass.length} section{sectionsForClass.length !== 1 ? 's' : ''} available for Class {selectedClass}</p>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <div className="py-24 text-center text-muted-foreground/40 bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="text-[11px] font-bold uppercase tracking-widest">
            {hasActiveFilter ? 'No students match the current filters' : 'No students found for this class'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([section, sectionStudents]) => (
            <SectionCard
              key={section}
              section={section}
              students={sectionStudents}
              attendanceMap={attendanceMap}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({
  section,
  students,
  attendanceMap,
}: {
  section: string;
  students: StudentListItem[];
  attendanceMap: Record<string, string>;
}) {
  const presentCount = students.filter((s) => attendanceMap[s.id] === 'Present').length;
  const markedCount = students.filter((s) => !!attendanceMap[s.id]).length;

  return (
    <Card className="erp-card overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-muted/10 py-5 px-8 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-bold tracking-tight">Section {section}</CardTitle>
          <CardDescription className="text-xs opacity-70 mt-0.5">
            {students.length} student{students.length !== 1 ? 's' : ''} &nbsp;·&nbsp;{' '}
            {markedCount === 0
              ? 'Attendance not marked yet'
              : `${presentCount} / ${markedCount} present`}
          </CardDescription>
        </div>
        <div className="text-3xl font-black text-primary/20">{section}</div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/5">
                <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Roll No.</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Admission No.</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Gender</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Today&apos;s Attendance</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => {
                const attendanceStatus = attendanceMap[student.id];
                return (
                  <tr
                    key={student.id}
                    className={cn(
                      'border-b border-border/30 hover:bg-muted/10 transition-colors',
                      idx % 2 === 0 ? 'bg-transparent' : 'bg-muted/5'
                    )}
                  >
                    <td className="px-6 py-4 font-semibold text-foreground">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground font-mono text-xs">
                      {student.academics?.[0]?.rollNumber ?? '—'}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground font-mono text-xs">
                      {(student as any).academics?.[0]?.admissionNumber ?? '—'}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground text-xs capitalize">
                      {student.gender ?? '—'}
                    </td>
                    <td className="px-4 py-4">
                      {attendanceStatus ? (
                        <span className={cn(
                          'px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border',
                          STATUS_STYLES[attendanceStatus] ?? 'bg-muted text-muted-foreground border-border'
                        )}>
                          {attendanceStatus}
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-wider">
                          Not marked
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
