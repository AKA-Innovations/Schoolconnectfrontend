'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClassSectionLists, useSubjectDetails, useTimetable, usePeriodSlots } from '@/hooks/useClasses';
import { useTeacherList } from '@/hooks/useTeachers';
import { Compass, Users, BookOpen, Calendar, GraduationCap, Search } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function CoordinatorWorkspacePage() {
  const { data: classSections = [] } = useClassSectionLists();
  const { data: subjectDetails = [] } = useSubjectDetails();
  const { data: timetableEntries = [] } = useTimetable();
  const { data: periodSlots = [] } = usePeriodSlots();
  const { data: teachersData } = useTeacherList({ page: 1, pageSize: 500 });
  const teachers = teachersData?.items ?? [];

  const [selectedClassId, setSelectedClassId] = useState<number>(0);
  const [teacherSearch, setTeacherSearch] = useState('');

  // For a real coordinator, we'd filter classSections to only their mapped classes.
  // Since we don't have that endpoint in the query layer yet, show all.

  const selectedClassName = classSections.find((c) => c.id === selectedClassId);

  // Teachers filtered by selected class (via subjectDetails)
  const classTeacherIds = useMemo(() => {
    if (!selectedClassId) return new Set<string>();
    return new Set(
      subjectDetails.filter((sd) => sd.classDtlsId === selectedClassId).map((sd) => sd.teacherId)
    );
  }, [subjectDetails, selectedClassId]);

  const filteredTeachers = useMemo(() => {
    let list = teachers;
    if (selectedClassId) {
      list = list.filter((t) => classTeacherIds.has(t.id));
    }
    if (teacherSearch) {
      const q = teacherSearch.toLowerCase();
      list = list.filter((t) =>
        `${t.firstName} ${t.lastName}`.toLowerCase().includes(q)
      );
    }
    return list;
  }, [teachers, classTeacherIds, selectedClassId, teacherSearch]);

  // Subjects for selected class
  const classSubjects = useMemo(
    () => (selectedClassId ? subjectDetails.filter((sd) => sd.classDtlsId === selectedClassId) : subjectDetails),
    [subjectDetails, selectedClassId],
  );

  // Timetable for selected class
  const classTimetable = useMemo(
    () => (selectedClassId ? timetableEntries.filter((e) => e.classDtlsId === selectedClassId) : timetableEntries),
    [timetableEntries, selectedClassId],
  );

  const sortedSlots = useMemo(
    () => [...periodSlots].sort((a, b) => a.periodNumber - b.periodNumber),
    [periodSlots],
  );

  const ttGrid = useMemo(() => {
    const map: Record<string, Record<number, typeof timetableEntries[number]>> = {};
    DAYS.forEach((d) => { map[d] = {}; });
    classTimetable.forEach((e) => {
      if (map[e.dayOfWeek]) map[e.dayOfWeek][e.periodSlotId] = e;
    });
    return map;
  }, [classTimetable]);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Compass className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Coordinator Workspace</h1>
            <p className="text-muted-foreground mt-1">Manage your assigned classes, teachers, and timetable</p>
          </div>
        </div>
        <Select value={selectedClassId ? String(selectedClassId) : ''} onValueChange={(v) => setSelectedClassId(Number(v))}>
          <SelectTrigger className="rounded-xl w-[220px]">
            <SelectValue placeholder="Select a class…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">All Classes</SelectItem>
            {classSections.map((cs) => (
              <SelectItem key={cs.id} value={String(cs.id)}>
                {cs.className} — {cs.sectionName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Classes', value: selectedClassId ? 1 : classSections.length, icon: GraduationCap, color: 'text-blue-500 bg-blue-500/10' },
          { label: 'Teachers', value: filteredTeachers.length, icon: Users, color: 'text-green-500 bg-green-500/10' },
          { label: 'Subject Mappings', value: classSubjects.length, icon: BookOpen, color: 'text-primary bg-primary/10' },
          { label: 'Timetable Entries', value: classTimetable.length, icon: Calendar, color: 'text-purple-500 bg-purple-500/10' },
        ].map((kpi) => (
          <Card key={kpi.label} className="erp-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${kpi.color}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="teachers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="timetable">Timetable</TabsTrigger>
        </TabsList>

        {/* Teachers Tab */}
        <TabsContent value="teachers" className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={teacherSearch} onChange={(e) => setTeacherSearch(e.target.value)}
              placeholder="Search teachers…" className="pl-9 rounded-xl" />
          </div>
          <Card className="erp-card">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/20">
                      {['#', 'Name', 'Employee ID', 'Mobile', 'Roles'].map((h) => (
                        <th key={h} className="text-left py-3 px-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeachers.length === 0 ? (
                      <tr><td colSpan={5} className="py-12 text-center text-sm text-muted-foreground">No teachers found</td></tr>
                    ) : filteredTeachers.map((t, i) => (
                      <tr key={t.id} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                        <td className="py-3 px-6 text-sm text-muted-foreground">{i + 1}</td>
                        <td className="py-3 px-6 text-sm font-semibold">{t.firstName} {t.lastName}</td>
                        <td className="py-3 px-6 text-sm text-muted-foreground">{t.employeeId}</td>
                        <td className="py-3 px-6 text-sm text-muted-foreground">{t.mobileNumber}</td>
                        <td className="py-3 px-6">
                          <div className="flex flex-wrap gap-1">
                            {t.isClassTeacher && <Badge className="text-[9px] bg-blue-100 text-blue-700 border-blue-200">Class Teacher</Badge>}
                            {t.isCoordinator && <Badge className="text-[9px] bg-purple-100 text-purple-700 border-purple-200">Coordinator</Badge>}
                            {t.isSubjectTeacher && <Badge className="text-[9px] bg-green-100 text-green-700 border-green-200">Subject</Badge>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subjects Tab */}
        <TabsContent value="subjects">
          <Card className="erp-card">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/20">
                      {['#', 'Class', 'Subject', 'Teacher'].map((h) => (
                        <th key={h} className="text-left py-3 px-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {classSubjects.length === 0 ? (
                      <tr><td colSpan={4} className="py-12 text-center text-sm text-muted-foreground">No subject mappings</td></tr>
                    ) : classSubjects.map((sd, i) => (
                      <tr key={sd.id} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                        <td className="py-3 px-6 text-sm text-muted-foreground">{i + 1}</td>
                        <td className="py-3 px-6"><Badge variant="secondary" className="rounded-lg">{sd.className} — {sd.sectionName}</Badge></td>
                        <td className="py-3 px-6 text-sm font-semibold">{sd.subjectName}</td>
                        <td className="py-3 px-6 text-sm text-muted-foreground">{sd.teacherName || sd.teacherId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timetable Tab */}
        <TabsContent value="timetable">
          {sortedSlots.length === 0 ? (
            <div className="py-16 text-center">
              <Calendar className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-bold text-muted-foreground">No timetable available</p>
            </div>
          ) : (
            <Card className="erp-card overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-muted/30">
                        <th className="py-3 px-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-r border-border/40 w-[100px]">Period</th>
                        {DAYS.map((d) => (
                          <th key={d} className="py-3 px-4 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-r border-border/40">{d}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedSlots.map((slot) => (
                        <tr key={slot.id}>
                          <td className="py-2 px-4 border-b border-r border-border/30 text-xs">
                            <div className="font-bold">#{slot.periodNumber}</div>
                            <div className="text-muted-foreground">{slot.startTime}–{slot.endTime}</div>
                          </td>
                          {DAYS.map((day) => {
                            const entry = ttGrid[day]?.[slot.id];
                            return (
                              <td key={day} className="py-2 px-3 border-b border-r border-border/30 text-center align-top min-w-[120px]">
                                {entry ? (
                                  <div>
                                    <div className="text-xs font-semibold text-primary">{entry.subjectName || '—'}</div>
                                    {entry.teacherName && <div className="text-[10px] text-muted-foreground">{entry.teacherName}</div>}
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
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
