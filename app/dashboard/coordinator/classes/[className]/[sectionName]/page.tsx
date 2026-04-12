'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
} from '@/hooks/useClasses';
import { useTeacherList, useAddClassTeacher, useRemoveClassTeacher } from '@/hooks/useTeachers';
import { useStudentList, useFilterAttendance } from '@/hooks/useStudents';
import { useAuthStore } from '@/store/authStore';
import { CURRENT_SESSION } from '@/lib/constants';
import { toast } from 'sonner';
import {
  ArrowLeft, BookOpen, Users, Calendar, GraduationCap,
  Search, UserCheck, Plus, Trash2, Edit2, Save, X,
  ClipboardCheck,
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

export default function CoordinatorClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const className = decodeURIComponent(params.className as string);
  const sectionName = decodeURIComponent(params.sectionName as string);
  const schoolId = useAuthStore((s) => s.schoolId) ?? '';

  const { data: classSections = [] } = useClassSectionLists();
  const { data: subjectDetails = [] } = useSubjectDetails();
  const { data: timetableEntries = [] } = useTimetable();
  const { data: periodSlots = [] } = usePeriodSlots();
  const { data: subjectOptions = [] } = useSubjectOptions();
  const { data: teachersData } = useTeacherList({ schoolId, page: 1, pageSize: 500 });
  const allTeachers: any[] = (teachersData as any)?.items ?? (teachersData as any)?.data ?? [];
  const { data: studentsData, isLoading: loadingStudents } = useStudentList({ className, sectionName, limit: 200 });
  const students = studentsData?.items ?? [];

  const today = new Date().toISOString().split('T')[0];
  const { data: attendanceData } = useFilterAttendance({ className, sectionName, date: today });
  const attendanceRecords: any[] = Array.isArray(attendanceData) ? attendanceData : (attendanceData as any)?.data ?? [];

  // Find class section record
  const classSection = classSections.find((cs) => cs.className === className && cs.sectionName === sectionName);

  // Subject details for this section
  const sectionSubjects = useMemo(
    () => subjectDetails.filter((sd) => sd.className === className && sd.sectionName === sectionName),
    [subjectDetails, className, sectionName],
  );

  // Timetable for this section
  const sectionSdIds = useMemo(() => new Set(sectionSubjects.map((sd) => sd.id)), [sectionSubjects]);
  const sectionTimetable = useMemo(
    () => timetableEntries.filter((e) => sectionSdIds.has(e.teacherClassId)),
    [timetableEntries, sectionSdIds],
  );

  // Unique teacher IDs teaching this section
  const sectionTeacherIds = useMemo(() => new Set(sectionSubjects.map((sd) => sd.teacherId)), [sectionSubjects]);
  const sectionTeachers = useMemo(
    () => allTeachers.filter((t) => sectionTeacherIds.has(t.id)),
    [allTeachers, sectionTeacherIds],
  );

  // Available subjects for this class from subject options
  const classSubjectOptions = useMemo(
    () => subjectOptions.filter((so) => so.className === className),
    [subjectOptions, className],
  );

  // Attendance map
  const attendanceMap = useMemo(() => {
    const map: Record<string, string> = {};
    attendanceRecords.forEach((r: any) => { map[r.studentId] = r.attendanceStatus ?? r.status; });
    return map;
  }, [attendanceRecords]);

  // KPI
  const presentCount = Object.values(attendanceMap).filter((s) => s === 'Present').length;
  const absentCount = Object.values(attendanceMap).filter((s) => s === 'Absent').length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => router.push('/dashboard/coordinator/classes')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {className} — Section {sectionName}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Class Teacher: {(classSection as any)?.classTeacherName ?? 'Not assigned'}
          </p>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Students', value: students.length, color: 'text-blue-500 bg-blue-500/10', icon: GraduationCap },
          { label: 'Subjects', value: sectionSubjects.length, color: 'text-primary bg-primary/10', icon: BookOpen },
          { label: 'Teachers', value: sectionTeachers.length, color: 'text-green-500 bg-green-500/10', icon: Users },
          { label: 'Present Today', value: presentCount, color: 'text-emerald-500 bg-emerald-500/10', icon: ClipboardCheck },
          { label: 'Absent Today', value: absentCount, color: 'text-red-500 bg-red-500/10', icon: ClipboardCheck },
        ].map((kpi) => (
          <Card key={kpi.label} className="erp-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${kpi.color}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="students">
        <TabsList className="rounded-xl">
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="subjects">Subjects & Teachers</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="classTeacher">Class Teacher</TabsTrigger>
        </TabsList>

        {/* Students Tab */}
        <TabsContent value="students" className="mt-4">
          <StudentsTab
            students={students}
            attendanceMap={attendanceMap}
            isLoading={loadingStudents}
            className={className}
            sectionName={sectionName}
          />
        </TabsContent>

        {/* Subjects Tab */}
        <TabsContent value="subjects" className="mt-4">
          <SubjectsTab
            sectionSubjects={sectionSubjects}
            classSubjectOptions={classSubjectOptions}
            allTeachers={allTeachers}
            className={className}
            sectionName={sectionName}
          />
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="mt-4">
          <ScheduleTab
            sectionSubjects={sectionSubjects}
            sectionTimetable={sectionTimetable}
            periodSlots={periodSlots}
            className={className}
            sectionName={sectionName}
          />
        </TabsContent>

        {/* Class Teacher Tab */}
        <TabsContent value="classTeacher" className="mt-4">
          <ClassTeacherTab
            classSection={classSection}
            allTeachers={allTeachers}
            className={className}
            sectionName={sectionName}
            schoolId={schoolId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Students Tab
   ═══════════════════════════════════════════════════════════════════════════════ */
function StudentsTab({
  students,
  attendanceMap,
  isLoading,
  className: cls,
  sectionName,
}: {
  students: any[];
  attendanceMap: Record<string, string>;
  isLoading: boolean;
  className: string;
  sectionName: string;
}) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return students;
    const q = search.toLowerCase();
    return students.filter((s) =>
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
      s.academics?.[0]?.rollNumber?.toLowerCase().includes(q),
    );
  }, [students, search]);

  const statusColor: Record<string, string> = {
    Present: 'bg-emerald-100 text-emerald-700',
    Absent: 'bg-red-100 text-red-700',
    Late: 'bg-amber-100 text-amber-700',
    HalfDay: 'bg-blue-100 text-blue-700',
  };

  if (isLoading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students..." className="pl-9 rounded-xl" />
        </div>
        <Badge variant="secondary" className="rounded-lg">{filtered.length} students</Badge>
      </div>

      <Card className="erp-card overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-muted/10">
                  {['#', 'Roll No', 'Name', 'Gender', 'Today', 'Action'].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">No students found</td></tr>
                ) : filtered.map((s, i) => {
                  const status = attendanceMap[s.id];
                  const rollNo = s.academics?.[0]?.rollNumber ?? '—';
                  return (
                    <tr key={s.id} className={`border-b border-border/30 hover:bg-muted/10 transition-colors ${status === 'Absent' ? 'bg-red-50/50' : ''}`}>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{i + 1}</td>
                      <td className="py-3 px-4 text-sm font-mono">{rollNo}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-sm">{s.firstName} {s.lastName}</div>
                        <div className="text-xs text-muted-foreground">{s.emailId}</div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{s.gender}</td>
                      <td className="py-3 px-4">
                        {status ? (
                          <Badge className={`text-[9px] border-0 rounded-md ${statusColor[status] ?? 'bg-muted text-muted-foreground'}`}>{status}</Badge>
                        ) : (
                          <span className="text-muted-foreground/40 text-xs">Not marked</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Button asChild variant="ghost" size="sm" className="rounded-lg text-xs h-7">
                          <Link href={`/dashboard/coordinator/students/${s.id}`}>View Profile</Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Subjects & Teachers Tab
   ═══════════════════════════════════════════════════════════════════════════════ */
function SubjectsTab({
  sectionSubjects,
  classSubjectOptions,
  allTeachers,
  className: cls,
  sectionName,
}: {
  sectionSubjects: any[];
  classSubjectOptions: any[];
  allTeachers: any[];
  className: string;
  sectionName: string;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newTeacherId, setNewTeacherId] = useState('');

  const createMutation = useCreateSubjectDetail();
  const deleteMutation = useDeleteSubjectDetail();

  // Available subjects not yet mapped
  const mappedSubjects = new Set(sectionSubjects.map((sd) => sd.subjectName));
  const availableSubjects = classSubjectOptions.filter((so) => !mappedSubjects.has(so.subjectName));

  const handleAdd = () => {
    if (!newSubject || !newTeacherId) return;
    createMutation.mutate(
      { session: CURRENT_SESSION, teacherId: newTeacherId, className: cls, sectionName, subjectName: newSubject },
      {
        onSuccess: () => { toast.success('Subject teacher assigned'); setShowAdd(false); setNewSubject(''); setNewTeacherId(''); },
        onError: () => toast.error('Failed to assign'),
      },
    );
  };

  const handleDelete = (id: number) => {
    if (!confirm('Remove this subject-teacher mapping?')) return;
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success('Mapping removed'),
      onError: () => toast.error('Failed to remove'),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Subject-Teacher Mappings</h3>
        <Button size="sm" className="rounded-lg text-xs h-8" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? <><X className="h-3 w-3 mr-1" /> Cancel</> : <><Plus className="h-3 w-3 mr-1" /> Assign Subject</>}
        </Button>
      </div>

      {showAdd && (
        <Card className="erp-card border-primary/20">
          <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
            <select value={newSubject} onChange={(e) => setNewSubject(e.target.value)}
              className="h-9 px-3 bg-background border border-input rounded-lg text-sm flex-1">
              <option value="">Select subject...</option>
              {availableSubjects.map((so) => (
                <option key={so.id} value={so.subjectName}>{so.subjectName}</option>
              ))}
            </select>
            <select value={newTeacherId} onChange={(e) => setNewTeacherId(e.target.value)}
              className="h-9 px-3 bg-background border border-input rounded-lg text-sm flex-1">
              <option value="">Select teacher...</option>
              {allTeachers.filter((t) => t.isSubjectTeacher).map((t) => (
                <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
              ))}
            </select>
            <Button size="sm" className="rounded-lg h-9" onClick={handleAdd} disabled={createMutation.isPending}>
              <Save className="h-3 w-3 mr-1" /> Assign
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="erp-card overflow-hidden">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/10">
                {['#', 'Subject', 'Teacher', 'Actions'].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sectionSubjects.length === 0 ? (
                <tr><td colSpan={4} className="py-12 text-center text-sm text-muted-foreground">No subjects mapped</td></tr>
              ) : sectionSubjects.map((sd, i) => (
                <tr key={sd.id} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                  <td className="py-3 px-4 text-sm text-muted-foreground">{i + 1}</td>
                  <td className="py-3 px-4 text-sm font-semibold">{sd.subjectName}</td>
                  <td className="py-3 px-4">
                    <div className="text-sm">{sd.teacherName || 'Unknown'}</div>
                    <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
                      <Link href={`/dashboard/coordinator/teachers/${sd.teacherId}`}>View Profile</Link>
                    </Button>
                  </td>
                  <td className="py-3 px-4">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(sd.id)} disabled={deleteMutation.isPending}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Schedule Tab (Timetable)
   ═══════════════════════════════════════════════════════════════════════════════ */
function ScheduleTab({
  sectionSubjects,
  sectionTimetable,
  periodSlots,
  className: cls,
  sectionName,
}: {
  sectionSubjects: any[];
  sectionTimetable: any[];
  periodSlots: any[];
  className: string;
  sectionName: string;
}) {
  const [editingCell, setEditingCell] = useState<{ day: string; slotId: number } | null>(null);
  const [selectedSdId, setSelectedSdId] = useState<number>(0);

  const createMutation = useCreateTimetableEntry();
  const updateMutation = useUpdateTimetableEntry();
  const deleteMutation = useDeleteTimetableEntry();

  const sortedSlots = useMemo(
    () => [...periodSlots].sort((a, b) => a.periodNumber - b.periodNumber),
    [periodSlots],
  );

  const sdMap = useMemo(() => {
    const m = new Map<number, (typeof sectionSubjects)[number]>();
    sectionSubjects.forEach((sd) => m.set(sd.id, sd));
    return m;
  }, [sectionSubjects]);

  const ttGrid = useMemo(() => {
    const map: Record<string, Record<number, (typeof sectionTimetable)[number]>> = {};
    DAYS.forEach((d) => { map[d] = {}; });
    sectionTimetable.forEach((e) => { if (map[e.dayOfWeek]) map[e.dayOfWeek][e.periodId] = e; });
    return map;
  }, [sectionTimetable]);

  const handleCellClick = (day: string, slotId: number) => {
    const existing = ttGrid[day]?.[slotId];
    if (existing) {
      setSelectedSdId(existing.teacherClassId);
    } else {
      setSelectedSdId(0);
    }
    setEditingCell({ day, slotId });
  };

  const handleSaveCell = () => {
    if (!editingCell) return;
    const { day, slotId } = editingCell;
    const existing = ttGrid[day]?.[slotId];

    if (selectedSdId === 0 && existing) {
      // Delete
      deleteMutation.mutate(existing.id, {
        onSuccess: () => { toast.success('Slot cleared'); setEditingCell(null); },
        onError: () => toast.error('Failed to clear slot'),
      });
    } else if (selectedSdId && existing) {
      // Update
      updateMutation.mutate(
        { id: existing.id, data: { teacherClassId: selectedSdId } },
        {
          onSuccess: () => { toast.success('Slot updated'); setEditingCell(null); },
          onError: () => toast.error('Failed to update slot'),
        },
      );
    } else if (selectedSdId && !existing) {
      // Create
      createMutation.mutate(
        { session: CURRENT_SESSION, teacherClassId: selectedSdId, periodId: slotId, dayOfWeek: day },
        {
          onSuccess: () => { toast.success('Slot assigned'); setEditingCell(null); },
          onError: () => toast.error('Failed to assign slot'),
        },
      );
    } else {
      setEditingCell(null);
    }
  };

  if (sortedSlots.length === 0) {
    return (
      <Card className="erp-card">
        <CardContent className="p-12 text-center">
          <Calendar className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-bold text-muted-foreground">No period slots defined</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Contact admin to set up period slots</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Weekly Timetable</h3>
        <p className="text-xs text-muted-foreground">Click a cell to edit</p>
      </div>
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
                    <div className="text-muted-foreground">{slot.startTime}–{slot.endTime}</div>
                  </td>
                  {DAYS.map((day) => {
                    const entry = ttGrid[day]?.[slot.id];
                    const sd = entry ? sdMap.get(entry.teacherClassId) : undefined;
                    const isEditing = editingCell?.day === day && editingCell?.slotId === slot.id;

                    return (
                      <td key={day} className="py-2 px-2 border-b border-r border-border/30 text-center align-top min-w-28 cursor-pointer hover:bg-muted/20 transition-colors"
                        onClick={() => !isEditing && handleCellClick(day, slot.id)}>
                        {isEditing ? (
                          <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
                            <select value={selectedSdId} onChange={(e) => setSelectedSdId(Number(e.target.value))}
                              className="w-full h-7 px-1 text-[10px] bg-background border border-input rounded text-center">
                              <option value={0}>— Empty —</option>
                              {sectionSubjects.map((sd) => (
                                <option key={sd.id} value={sd.id}>{sd.subjectName}</option>
                              ))}
                            </select>
                            <div className="flex gap-1 justify-center">
                              <Button size="icon" className="h-5 w-5 rounded" onClick={handleSaveCell}
                                disabled={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending}>
                                <Save className="h-3 w-3" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-5 w-5 rounded" onClick={() => setEditingCell(null)}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ) : sd ? (
                          <div className="text-xs">
                            <div className="font-semibold text-primary">{sd.subjectName}</div>
                            {sd.teacherName && <div className="text-muted-foreground text-[10px]">{sd.teacherName}</div>}
                          </div>
                        ) : (
                          <span className="text-muted-foreground/30 text-xs">—</span>
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
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Class Teacher Tab
   ═══════════════════════════════════════════════════════════════════════════════ */
function ClassTeacherTab({
  classSection,
  allTeachers,
  className: cls,
  sectionName,
  schoolId,
}: {
  classSection: any;
  allTeachers: any[];
  className: string;
  sectionName: string;
  schoolId: string;
}) {
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const addMutation = useAddClassTeacher();
  const removeMutation = useRemoveClassTeacher();

  const currentCT = allTeachers.find((t) => t.id === classSection?.classTeacherId);

  const handleAssign = () => {
    if (!selectedTeacherId) return;
    addMutation.mutate(
      { classTeacherId: selectedTeacherId, className: cls, sectionName, schoolId },
      {
        onSuccess: () => { toast.success('Class teacher assigned'); setSelectedTeacherId(''); },
        onError: () => toast.error('Failed to assign class teacher'),
      },
    );
  };

  const handleRemove = () => {
    if (!currentCT || !confirm('Remove class teacher assignment?')) return;
    removeMutation.mutate(
      { classTeacherId: currentCT.id, className: cls, sectionName, schoolId },
      {
        onSuccess: () => toast.success('Class teacher removed'),
        onError: () => toast.error('Failed to remove'),
      },
    );
  };

  return (
    <div className="space-y-6">
      {/* Current class teacher */}
      <Card className="erp-card">
        <CardContent className="p-6">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Current Class Teacher</h3>
          {currentCT ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="font-bold text-lg">{currentCT.firstName} {currentCT.lastName}</p>
                  <p className="text-sm text-muted-foreground">{currentCT.employeeId} · {currentCT.mobileNumber}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm" className="rounded-lg text-xs h-8">
                  <Link href={`/dashboard/coordinator/teachers/${currentCT.id}`}>View Profile</Link>
                </Button>
                <Button variant="destructive" size="sm" className="rounded-lg text-xs h-8" onClick={handleRemove} disabled={removeMutation.isPending}>
                  <Trash2 className="h-3 w-3 mr-1" /> Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground/50">
              <UserCheck className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No class teacher assigned</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign new */}
      <Card className="erp-card">
        <CardContent className="p-6">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Assign Class Teacher</h3>
          <div className="flex gap-3">
            <select value={selectedTeacherId} onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="h-10 px-3 bg-background border border-input rounded-xl text-sm flex-1">
              <option value="">Select a teacher...</option>
              {allTeachers.map((t) => (
                <option key={t.id} value={t.id}>{t.firstName} {t.lastName} ({t.employeeId})</option>
              ))}
            </select>
            <Button className="rounded-xl" onClick={handleAssign} disabled={!selectedTeacherId || addMutation.isPending}>
              <UserCheck className="h-4 w-4 mr-2" /> Assign
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
