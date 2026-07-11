'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useClassSectionLists, useSubjectDetails, useTimetable, usePeriodSlots,
  useCreateTimetableEntry, useUpdateTimetableEntry, useDeleteTimetableEntry,
  useCreateSubjectDetail, useDeleteSubjectDetail, useSubjectOptions,
  useSchoolClasses,
} from '@/hooks/useClasses';
import { useTeacherList, useAddClassTeacher, useRemoveClassTeacher } from '@/hooks/useTeachers';
import { useStudentList, useFilterAttendance } from '@/hooks/useStudents';
import { useAuthStore } from '@/store/authStore';
import { CURRENT_SESSION } from '@/lib/constants';
import { toast } from 'sonner';
import {
  Compass, Users, BookOpen, Calendar, GraduationCap,
  Search, UserCheck, Plus, Trash2, Save, X,
  CheckCircle, XCircle, Clock, AlertTriangle,
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

const STATUS_CFG: Record<string, { color: string; icon: React.ElementType }> = {
  Present:  { color: 'bg-green-100 text-green-700', icon: CheckCircle },
  Absent:   { color: 'bg-red-100 text-red-700', icon: XCircle },
  Late:     { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  HalfDay:  { color: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
};

export default function CoordinatorWorkspacePage() {
  const user             = useAuthStore((s) => s.user);
  const schoolId         = useAuthStore((s) => s.schoolId) ?? '';
  const coordinatorClasses = user?.coordinatorClasses ?? [];

  const { data: allClassSections = [] } = useClassSectionLists();
  const { data: subjectDetails   = [] } = useSubjectDetails();
  const { data: periodSlots      = [] } = usePeriodSlots();
  const { data: schoolClasses    = [] } = useSchoolClasses();
  const { data: teachersData }          = useTeacherList({ schoolId, page: 1, pageSize: 500 });
  const allTeachers: any[] = (teachersData as any)?.items ?? (teachersData as any)?.data ?? [];

  // Normalize coordinator classes to strings for filtering
  const coordClassNames = useMemo(() => 
    coordinatorClasses.map(c => String(typeof c === 'object' ? c.className : c)).filter(Boolean),
    [coordinatorClasses]
  );

  const classSections = useMemo(
    () => coordClassNames.length > 0
      ? allClassSections.filter((cs) => coordClassNames.includes(String(cs.className)))
      : allClassSections,
    [allClassSections, coordClassNames],
  );

  const createSubjectDetail  = useCreateSubjectDetail();
  const deleteSubjectDetail  = useDeleteSubjectDetail();
  const createTimetable      = useCreateTimetableEntry();
  const updateTimetable      = useUpdateTimetableEntry();
  const deleteTimetable      = useDeleteTimetableEntry();
  const addClassTeacher      = useAddClassTeacher();
  const removeClassTeacher   = useRemoveClassTeacher();

  const [selectedId, setSelectedId]           = useState<number>(0);
  const [teacherSearch, setTeacherSearch]     = useState('');
  const [studentSearch, setStudentSearch]     = useState('');
  const [newSubjectOptionId, setNewSubjectOptionId] = useState('');
  const [newTeacherId, setNewTeacherId]        = useState('');
  const [newCtTeacherId, setNewCtTeacherId]    = useState('');
  const [editingCell, setEditingCell]          = useState<string | null>(null);
  const [editingSubjectId, setEditingSubjectId] = useState<string>('');

  const selectedSection = classSections.find((c) => c.id === selectedId);
  const className   = selectedSection?.className ?? '';
  const sectionName = selectedSection?.sectionName ?? '';

  // Resolve classId from schoolClasses if missing in section object
  const resolvedClassId = useMemo(() => {
    if (selectedSection?.classId) return selectedSection.classId;
    if (!selectedSection || !className) return undefined;
    const cls = schoolClasses.find(c => c.className === className);
    return cls?.id;
  }, [selectedSection, className, schoolClasses]);

  const { data: timetableEntries = [] } = useTimetable({
    session: CURRENT_SESSION,
    classId: resolvedClassId,
    classSectionId: selectedId || undefined,
  });

  const { data: subjectOptions = [] } = useSubjectOptions(resolvedClassId);

  const sectionSubjects = useMemo(
    () => subjectDetails.filter((sd) => sd.className === className && sd.sectionName === sectionName),
    [subjectDetails, className, sectionName],
  );

  const sectionSdIds = useMemo(() => new Set(sectionSubjects.map((sd) => String(sd.id))), [sectionSubjects]);

  const sectionTimetable = useMemo(
    () => timetableEntries.filter((e) => sectionSdIds.has(String(e.classSubjectId))),
    [timetableEntries, sectionSdIds],
  );

  const sectionTeacherIds = useMemo(() => new Set(sectionSubjects.map((sd) => sd.teacherId)), [sectionSubjects]);
  const sectionTeachers   = useMemo(
    () => allTeachers.filter((t: any) => sectionTeacherIds.has(t.id)),
    [allTeachers, sectionTeacherIds],
  );

  const filteredTeachers = useMemo(() => {
    let list: any[] = selectedId ? sectionTeachers : allTeachers;
    if (teacherSearch) {
      const q = teacherSearch.toLowerCase();
      list = list.filter((t: any) => `${t.firstName} ${t.lastName}`.toLowerCase().includes(q));
    }
    return list;
  }, [sectionTeachers, allTeachers, selectedId, teacherSearch]);

  // Subjects are session-global — show all
  const classSubjectOptions = subjectOptions;

  const sortedSlots = useMemo(
    () => [...periodSlots].sort((a, b) => a.periodNumber - b.periodNumber),
    [periodSlots],
  );

  const ttGrid = useMemo(() => {
    const map: Record<string, Record<number, typeof timetableEntries[number]>> = {};
    DAYS.forEach((d) => { map[d] = {}; });
    sectionTimetable.forEach((e) => { if (map[e.dayOfWeek]) map[e.dayOfWeek][e.periodId] = e; });
    return map;
  }, [sectionTimetable]);

  const sdMap = useMemo(() => {
    const m = new Map<string, typeof subjectDetails[number]>();
    subjectDetails.forEach((sd) => m.set(String(sd.id), sd));
    return m;
  }, [subjectDetails]);

  const today = new Date().toISOString().split('T')[0];
  const { data: studentsData, isLoading: loadingStudents } = useStudentList({
    classSectionId: selectedId || undefined,
    limit: 200,
  });
  const students = studentsData?.items ?? [];

  const { data: attendanceData } = useFilterAttendance({
    classSectionId: selectedId || undefined,
    date: today,
  });
  const attendanceRecords: any[] = Array.isArray(attendanceData) ? attendanceData : [];
  const attendanceMap = useMemo(() => {
    const m: Record<string, string> = {};
    attendanceRecords.forEach((r: any) => { m[r.studentId] = r.attendanceStatus ?? r.status; });
    return m;
  }, [attendanceRecords]);

  const filteredStudents = useMemo(() => {
    if (!studentSearch) return students;
    const q = studentSearch.toLowerCase();
    return students.filter((s) =>
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
      s.academics?.[0]?.rollNumber?.toLowerCase().includes(q),
    );
  }, [students, studentSearch]);

  const currentCT = allTeachers.find((t: any) => t.id === (selectedSection as any)?.classTeacherId);

  const allCoordSubjects = coordClassNames.length > 0
    ? subjectDetails.filter((sd) => coordClassNames.includes(String(sd.className)))
    : subjectDetails;
  const allCoordSdIds    = new Set(allCoordSubjects.map((sd) => sd.id));
  const allCoordTT       = timetableEntries.filter((e) => allCoordSdIds.has(e.classSubjectId));
  const allCoordTeachers = new Set(allCoordSubjects.map((sd) => sd.teacherId));

  async function handleAddSubject() {
    if (!selectedSection || !newSubjectOptionId || !newTeacherId || !className || !sectionName) {
      toast.error('Select a subject and teacher first');
      return;
    }
    const opt = subjectOptions.find((o) => o.id === Number(newSubjectOptionId));
    if (!opt) return;
    // Ensure classId is present, resolve from schoolClasses if missing
    let classId = (selectedSection as any).classId;
    if (!classId) {
      const sc = schoolClasses.find((c) => c.className === selectedSection.className);
      classId = sc?.id || 0;
    }

    try {
      await createSubjectDetail.mutateAsync({
        entries: [{
          session: CURRENT_SESSION,
          teacherId: newTeacherId,
          classId,
          classSectionId: selectedSection.masterSectionId,
          subjectId: opt.id,
        }]
      });
      toast.success('Subject assigned');
      setNewSubjectOptionId('');
      setNewTeacherId('');
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed — admin permission may be required');
    }
  }

  async function handleDeleteSubject(id: number | string) {
    try {
      await deleteSubjectDetail.mutateAsync(id);
      toast.success('Subject removed');
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed — admin permission may be required');
    }
  }

  async function handleSaveTimetableCell(day: string, periodId: number) {
    const existingEntry = ttGrid[day]?.[periodId];
    if (!editingSubjectId) {
      if (existingEntry) {
        const entryId = existingEntry.id ?? (existingEntry as any).timetableId ?? (existingEntry as any).timetable_id;
        try {
          await deleteTimetable.mutateAsync(entryId);
          toast.success('Slot cleared');
        } catch (e: any) {
          toast.error(e?.response?.data?.message ?? 'Failed — admin permission may be required');
        }
      }
      setEditingCell(null);
      return;
    }
    try {
      if (existingEntry) {
        const entryId = existingEntry.id ?? (existingEntry as any).timetableId ?? (existingEntry as any).timetable_id;
        await updateTimetable.mutateAsync({ id: entryId, data: { classSubjectId: String(editingSubjectId) } });
      } else {
        await createTimetable.mutateAsync({
          classSubjectId: String(editingSubjectId),
          periodId,
          dayOfWeek: day,
          session: CURRENT_SESSION,
        });
      }
      toast.success('Timetable updated');
      setEditingCell(null);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed — admin permission may be required');
    }
  }

  async function handleAssignClassTeacher() {
    if (!newCtTeacherId || !selectedId || !selectedSection) return;
    try {
      await addClassTeacher.mutateAsync({
        classTeacherId: newCtTeacherId,
        className: selectedSection.className,
        sectionName: selectedSection.sectionName,
        schoolId,
      });
      toast.success('Class teacher assigned');
      setNewCtTeacherId('');
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed — admin permission may be required');
    }
  }

  async function handleRemoveClassTeacher() {
    if (!currentCT || !selectedId || !selectedSection) return;
    try {
      await removeClassTeacher.mutateAsync({
        classTeacherId: currentCT.id,
        className: selectedSection.className,
        sectionName: selectedSection.sectionName,
        schoolId,
      });
      toast.success('Class teacher removed');
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed — admin permission may be required');
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Compass className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Coordinator Workspace</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              {coordClassNames.length > 0
                ? `Managing: ${coordClassNames.join(', ')}`
                : 'Academic coordination overview'}
            </p>
          </div>
        </div>
        <select
          value={selectedId || ''}
          onChange={(e) => { setSelectedId(Number(e.target.value)); setEditingCell(null); }}
          className="h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-52"
        >
          <option value="">Select class-section</option>
          {classSections.map((cs) => (
            <option key={cs.id} value={cs.id}>{cs.className} — {cs.sectionName}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Sections',    value: selectedId ? 1 : classSections.length,  icon: GraduationCap, color: 'text-blue-500 bg-blue-500/10' },
          { label: 'Teachers',   value: selectedId ? sectionTeachers.length : allCoordTeachers.size, icon: Users, color: 'text-green-500 bg-green-500/10' },
          { label: 'Subjects',   value: selectedId ? sectionSubjects.length : allCoordSubjects.length, icon: BookOpen, color: 'text-primary bg-primary/10' },
          { label: 'TT Entries', value: selectedId ? sectionTimetable.length : allCoordTT.length, icon: Calendar, color: 'text-purple-500 bg-purple-500/10' },
        ].map((k) => (
          <Card key={k.label} className="erp-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${k.color}`}>
                <k.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{k.value}</p>
                <p className="text-xs text-muted-foreground">{k.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="students" className="space-y-4">
        <TabsList className="rounded-xl flex-wrap h-auto gap-1">
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="subjects">Subjects &amp; Teachers</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="classteacher">Class Teacher</TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          {!selectedId ? (
            <Card className="erp-card"><CardContent className="p-8 text-center text-sm text-muted-foreground">Select a class-section to view students</CardContent></Card>
          ) : (
            <Card className="erp-card overflow-hidden">
              <CardContent className="p-4 border-b border-border/50">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search students..." className="pl-9 rounded-xl h-9" />
                </div>
              </CardContent>
              <CardContent className="p-0">
                {loadingStudents ? (
                  <div className="p-4 space-y-2">{[1,2,3].map((i) => <div key={i} className="h-10 bg-muted rounded animate-pulse" />)}</div>
                ) : filteredStudents.length === 0 ? (
                  <div className="py-12 text-center text-sm text-muted-foreground">No students</div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50 bg-muted/10">
                        {['#', 'Name', 'Roll', 'Status', ''].map((h) => (
                          <th key={h} className="text-left py-3 px-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((s, i) => {
                        const status = attendanceMap[s.id] ?? null;
                        const cfg = status ? STATUS_CFG[status] : null;
                        return (
                          <tr key={s.id} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                            <td className="py-3 px-5 text-sm text-muted-foreground">{i + 1}</td>
                            <td className="py-3 px-5 text-sm font-semibold">{s.firstName} {s.lastName}</td>
                            <td className="py-3 px-5 text-sm text-muted-foreground">{s.academics?.[0]?.rollNumber ?? '-'}</td>
                            <td className="py-3 px-5">
                              {cfg ? (
                                <Badge className={`rounded-lg border-0 text-[9px] gap-1 ${cfg.color}`}>
                                  <cfg.icon className="h-3 w-3" />{status}
                                </Badge>
                              ) : <span className="text-xs text-muted-foreground">-</span>}
                            </td>
                            <td className="py-3 px-5">
                              <Link href={`/dashboard/teacher/students/${s.id}`}>
                                <Button variant="ghost" size="sm" className="rounded-xl h-7 px-3 text-xs font-bold hover:bg-primary/10 hover:text-primary">Profile</Button>
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="teachers">
          <Card className="erp-card overflow-hidden">
            <CardContent className="p-4 border-b border-border/50">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input value={teacherSearch} onChange={(e) => setTeacherSearch(e.target.value)}
                  placeholder="Search teachers..." className="pl-9 rounded-xl h-9" />
              </div>
            </CardContent>
            <CardContent className="p-0">
              {filteredTeachers.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">No teachers found</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/10">
                      {['#', 'Name', 'Employee ID', 'Roles', ''].map((h) => (
                        <th key={h} className="text-left py-3 px-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeachers.map((t: any, i: number) => (
                      <tr key={t.id} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                        <td className="py-3 px-5 text-sm text-muted-foreground">{i + 1}</td>
                        <td className="py-3 px-5 text-sm font-semibold">{t.firstName} {t.lastName}</td>
                        <td className="py-3 px-5 text-sm text-muted-foreground">{t.employeeId}</td>
                        <td className="py-3 px-5">
                          <div className="flex flex-wrap gap-1">
                            {t.isClassTeacher   && <Badge className="text-[9px] bg-blue-100   text-blue-700   border-0">Class Teacher</Badge>}
                            {t.isCoordinator    && <Badge className="text-[9px] bg-purple-100 text-purple-700 border-0">Coordinator</Badge>}
                            {t.isSubjectTeacher && <Badge className="text-[9px] bg-green-100  text-green-700  border-0">Subject</Badge>}
                          </div>
                        </td>
                        <td className="py-3 px-5">
                          <Link href={`/dashboard/teacher/teachers/${t.id}`}>
                            <Button variant="ghost" size="sm" className="rounded-xl h-7 px-3 text-xs font-bold hover:bg-primary/10 hover:text-primary">Profile</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects">
          {!selectedId ? (
            <Card className="erp-card"><CardContent className="p-8 text-center text-sm text-muted-foreground">Select a class-section to manage subject assignments</CardContent></Card>
          ) : (
            <div className="space-y-4">
              <Card className="erp-card">
                <CardContent className="p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Assign Subject to Teacher</p>
                  <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-semibold text-muted-foreground">Subject</label>
                      <select value={newSubjectOptionId} onChange={(e) => setNewSubjectOptionId(e.target.value)}
                        className="h-9 rounded-lg border border-border/50 bg-background px-3 text-sm min-w-40">
                        <option value="">Select subject</option>
                        {classSubjectOptions.map((o) => (
                          <option key={o.id} value={o.id}>{o.subjectName}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-semibold text-muted-foreground">Teacher</label>
                      <select value={newTeacherId} onChange={(e) => setNewTeacherId(e.target.value)}
                        className="h-9 rounded-lg border border-border/50 bg-background px-3 text-sm min-w-44">
                        <option value="">Select teacher</option>
                        {allTeachers.map((t: any) => (
                          <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                        ))}
                      </select>
                    </div>
                    <Button onClick={handleAddSubject} disabled={createSubjectDetail.isPending} className="rounded-lg h-9 gap-1.5">
                      <Plus className="h-4 w-4" /> Assign
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card className="erp-card overflow-hidden">
                <CardContent className="p-0">
                  {sectionSubjects.length === 0 ? (
                    <div className="py-10 text-center text-sm text-muted-foreground">No subjects assigned yet</div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/50 bg-muted/10">
                          {['Subject', 'Teacher', 'Session', ''].map((h) => (
                            <th key={h} className="text-left py-3 px-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sectionSubjects.map((sd) => (
                          <tr key={sd.id} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                            <td className="py-3 px-5 text-sm font-semibold">{sd.subjectName}</td>
                            <td className="py-3 px-5 text-sm text-muted-foreground">{(sd as any).teacherName ?? sd.teacherId}</td>
                            <td className="py-3 px-5 text-sm text-muted-foreground">{sd.session}</td>
                            <td className="py-3 px-5">
                              <Button variant="ghost" size="icon"
                                className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteSubject(sd.id)}
                                disabled={deleteSubjectDetail.isPending}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="schedule">
          {!selectedId ? (
            <Card className="erp-card"><CardContent className="p-8 text-center text-sm text-muted-foreground">Select a class-section to edit its timetable</CardContent></Card>
          ) : sortedSlots.length === 0 ? (
            <Card className="erp-card"><CardContent className="p-8 text-center text-sm text-muted-foreground">No period slots defined. Ask admin to add period slots first.</CardContent></Card>
          ) : (
            <Card className="erp-card overflow-hidden">
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full border-collapse min-w-175">
                  <thead>
                    <tr className="bg-muted/30">
                      <th className="py-3 px-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-r border-border/40 w-24">Period</th>
                      {DAYS.map((d) => (
                        <th key={d} className="py-3 px-4 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-r border-border/40">{d}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSlots.map((slot) => (
                      <tr key={slot.id}>
                        <td className="py-2 px-4 border-b border-r border-border/30 text-xs whitespace-nowrap">
                          <div className="font-bold">#{slot.periodNumber}</div>
                          <div className="text-muted-foreground">{slot.startTime}-{slot.endTime}</div>
                        </td>
                        {DAYS.map((day) => {
                          const entry    = ttGrid[day]?.[slot.id];
                          const sd       = entry ? sdMap.get(String(entry.classSubjectId)) : undefined;
                          const cellKey  = `${day}|${slot.id}`;
                          const isEditing = editingCell === cellKey;
                          return (
                            <td key={day} className="py-2 px-3 border-b border-r border-border/30 text-center align-middle min-w-28">
                              {isEditing ? (
                                <div className="flex flex-col gap-1.5 items-center">
                                  <select
                                    value={editingSubjectId}
                                    onChange={(e) => setEditingSubjectId(e.target.value)}
                                    autoFocus
                                    className="w-full text-xs rounded border border-border/50 bg-background px-1.5 py-1"
                                  >
                                    <option value="">- Clear -</option>
                                    {sectionSubjects.map((s) => (
                                      <option key={s.id} value={s.id}>{s.subjectName}</option>
                                    ))}
                                  </select>
                                  <div className="flex gap-1">
                                    <Button size="icon" className="h-6 w-6 rounded bg-primary/90 hover:bg-primary"
                                      onClick={() => handleSaveTimetableCell(day, slot.id)}
                                      disabled={createTimetable.isPending || updateTimetable.isPending || deleteTimetable.isPending}>
                                      <Save className="h-3 w-3" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-6 w-6 rounded hover:bg-muted"
                                      onClick={() => setEditingCell(null)}>
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  className="cursor-pointer rounded p-1.5 hover:bg-primary/10 transition-colors group min-h-10 flex flex-col items-center justify-center"
                                  onClick={() => { setEditingCell(cellKey); setEditingSubjectId(entry ? String(entry.classSubjectId) : ''); }}
                                >
                                  {sd ? (
                                    <>
                                      <div className="text-xs font-semibold text-primary">{sd.subjectName}</div>
                                      {(sd as any).teacherName && <div className="text-[10px] text-muted-foreground">{(sd as any).teacherName}</div>}
                                    </>
                                  ) : (
                                    <span className="text-muted-foreground/30 text-xs group-hover:text-muted-foreground/60">+</span>
                                  )}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="classteacher">
          {!selectedId ? (
            <Card className="erp-card"><CardContent className="p-8 text-center text-sm text-muted-foreground">Select a class-section to manage the class teacher</CardContent></Card>
          ) : (
            <div className="space-y-4 max-w-lg">
              <Card className="erp-card">
                <CardContent className="p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Current Class Teacher</p>
                  {currentCT ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                          <UserCheck className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{currentCT.firstName} {currentCT.lastName}</p>
                          <p className="text-xs text-muted-foreground">{currentCT.employeeId}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm"
                        className="rounded-lg text-destructive hover:bg-destructive/10 text-xs"
                        onClick={handleRemoveClassTeacher} disabled={removeClassTeacher.isPending}>
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No class teacher assigned</p>
                  )}
                </CardContent>
              </Card>
              <Card className="erp-card">
                <CardContent className="p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Assign Class Teacher</p>
                  <div className="flex gap-3">
                    <select value={newCtTeacherId} onChange={(e) => setNewCtTeacherId(e.target.value)}
                      className="flex-1 h-9 rounded-lg border border-border/50 bg-background px-3 text-sm">
                      <option value="">Select teacher</option>
                      {allTeachers.map((t: any) => (
                        <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                      ))}
                    </select>
                    <Button onClick={handleAssignClassTeacher}
                      disabled={!newCtTeacherId || addClassTeacher.isPending}
                      className="rounded-lg h-9 gap-1.5">
                      <UserCheck className="h-4 w-4" /> Assign
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
