'use client';

import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { useFetchTimetable, usePeriodSlots, useSubjectDetails } from '@/hooks/useClasses';
import { Calendar, Clock, BookOpen, Plus, ClipboardList, BookMarked, BarChart3 } from 'lucide-react';
import { HomeworkFormModal } from '@/components/academic/homework/HomeworkFormModal';
import { ClassworkFormModal } from '@/components/academic/classwork/ClassworkFormModal';
import { ProgressFormModal } from '@/components/academic/teaching-progress/ProgressFormModal';
import { CURRENT_SESSION } from '@/lib/constants';
import { toast } from 'sonner';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TeacherSchedulePage() {
  const user = useAuthStore((s) => s.user);

  // Fetch timetable entries for the logged-in teacher
  const { data: rawEntries = [], isLoading: loadingTT } = useFetchTimetable({ 
    session: CURRENT_SESSION,
    teacherId: user?.id 
  });
  const { data: subjectDetails = [] } = useSubjectDetails();
  const { data: periodSlots = [], isLoading: loadingSlots } = usePeriodSlots();

  // Build a periodId → PeriodSlot lookup for normalization
  const periodSlotMap = useMemo(() => {
    const m = new Map<number, typeof periodSlots[0]>();
    periodSlots.forEach(s => m.set(s.id, s));
    return m;
  }, [periodSlots]);

  // Normalize timetable entries: resolve periodNumber/startTime/endTime from
  // periodSlots (the backend may only return periodId), and resolve classSectionId
  // / subjectDtlsId from the teacher's subject-details mapping.
  const myEntries = useMemo(() => {
    const entries = Array.isArray(rawEntries) ? rawEntries : [];

    if (entries.length === 0 && !loadingTT) {
      console.debug('[TeacherSchedule] No timetable entries returned.', {
        session: CURRENT_SESSION,
        teacherId: user?.id,
        rawEntries,
      });
    }

    return entries.map(e => {
      let classSubjectId = e.classSubjectId;
      let classSectionId = 0;
      let subjectDtlsId = 0;

      // Resolve periodNumber / times from periodSlots if missing
      let periodNumber = e.periodNumber;
      let startTime = e.startTime;
      let endTime = e.endTime;

      if (e.periodId) {
        const slot = periodSlotMap.get(Number(e.periodId));
        if (slot) {
          if (!periodNumber) periodNumber = slot.periodNumber;
          if (!startTime) startTime = slot.startTime;
          if (!endTime) endTime = slot.endTime;
        }
      }
      // Reverse: if we have periodNumber but not periodId, resolve periodId
      if (!e.periodId && periodNumber) {
        const slot = periodSlots.find(s => Number(s.periodNumber) === Number(periodNumber));
        if (slot) {
          e = { ...e, periodId: slot.id };
          if (!startTime) startTime = slot.startTime;
          if (!endTime) endTime = slot.endTime;
        }
      }

      // Find numeric IDs from subjectDetails mapping
      const match = subjectDetails.find(sd => 
        (sd.id === String(e.classSubjectId)) || (
          String(sd.subjectName || '').trim().toLowerCase() === String(e.subjectName || '').trim().toLowerCase() && 
          String(sd.className || '').trim().toLowerCase() === String(e.className || '').trim().toLowerCase() &&
          String(sd.sectionName || '').trim().toLowerCase() === String(e.sectionName || '').trim().toLowerCase()
        )
      );

      if (match) {
        classSubjectId = String(match.id);
        classSectionId = match.classDtlsId || (match as any).classSectionId || 0;
        subjectDtlsId = match.subjectDtlsId || (match as any).subjectId || 0;
      }

      return { ...e, classSubjectId, classSectionId, subjectDtlsId, periodNumber, startTime, endTime };
    });
  }, [rawEntries, subjectDetails, periodSlotMap, periodSlots, loadingTT, user?.id]);

  const isLoading = loadingTT || loadingSlots;

  const [hwModalOpen, setHwModalOpen] = React.useState(false);
  const [cwModalOpen, setCwModalOpen] = React.useState(false);
  const [progressModalOpen, setProgressModalOpen] = React.useState(false);
  const [prefill, setPrefill] = React.useState<{ 
    className: string; 
    sectionName: string; 
    subjectId: string;
    classSectionId: number;
    subjectDtlsId: number;
  } | undefined>();

  const sorted = useMemo(
    () => [...periodSlots].sort((a, b) => a.periodNumber - b.periodNumber),
    [periodSlots],
  );

  // Build grid: day → periodNumber → entry
  const grid = useMemo(() => {
    const map: Record<string, Record<number, any>> = {};
    DAYS.forEach((d) => { map[d] = {}; });
    myEntries.forEach((e) => {
      if (e.periodNumber && map[e.dayOfWeek]) {
        map[e.dayOfWeek][e.periodNumber] = e;
      }
    });
    return map;
  }, [myEntries]);

  // Today's schedule
  const todayName = DAYS[new Date().getDay() - 1] || 'Monday';
  const todayEntries = useMemo(
    () => myEntries.filter((e) => e.dayOfWeek === todayName).sort((a, b) => {
      return (a.periodNumber || 0) - (b.periodNumber || 0);
    }),
    [myEntries, todayName],
  );

  const openHW = (e: any) => {
    setPrefill({ 
      className: e.className, 
      sectionName: e.sectionName, 
      subjectId: e.classSubjectId,
      classSectionId: e.classSectionId,
      subjectDtlsId: e.subjectDtlsId
    });
    setHwModalOpen(true);
  };

  const openCW = (e: any) => {
    setPrefill({ 
      className: e.className, 
      sectionName: e.sectionName, 
      subjectId: e.classSubjectId,
      classSectionId: e.classSectionId,
      subjectDtlsId: e.subjectDtlsId
    });
    setCwModalOpen(true);
  };

  const openProgress = (e: any) => {
    setPrefill({ 
      className: e.className, 
      sectionName: e.sectionName, 
      subjectId: e.classSubjectId,
      classSectionId: e.classSectionId,
      subjectDtlsId: e.subjectDtlsId
    });
    setProgressModalOpen(true);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Schedule</h1>
        <p className="text-muted-foreground mt-1">Your weekly teaching timetable</p>
      </div>

      {/* Today's highlight */}
      <Card className="erp-card border-l-4 border-l-primary">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Today — {todayName}</h2>
            <Badge variant="secondary" className="ml-auto">{todayEntries.length} classes</Badge>
          </div>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-muted rounded animate-pulse" />)}
            </div>
          ) : todayEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No classes scheduled for today</p>
          ) : (
            <div className="space-y-2">
              {todayEntries.map((entry) => {
                return (
                  <div key={`${entry.dayOfWeek}-${entry.periodNumber}`} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="text-xs font-mono text-muted-foreground w-[100px]">
                      {entry.startTime} – {entry.endTime}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-semibold">{entry.subjectName || '—'}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {entry.className} {entry.sectionName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        size="icon" variant="ghost" className="h-8 w-8 text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                        onClick={() => openCW(entry)} title="Add Classwork"
                      >
                        <ClipboardList className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" variant="ghost" className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        onClick={() => openProgress(entry)} title="Update Progress"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" variant="ghost" className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                        onClick={() => openHW(entry)} title="Assign Homework"
                      >
                        <BookMarked className="h-4 w-4" />
                      </Button>
                      <Badge variant="outline" className="text-[10px] ml-2">
                        Period {entry.periodNumber}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full week grid */}
      {isLoading ? (
        <Card className="erp-card animate-pulse">
          <CardContent className="p-6"><div className="h-64 bg-muted rounded" /></CardContent>
        </Card>
      ) : sorted.length === 0 ? (
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
                    <th className="py-3 px-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-r border-border/40 w-[100px]">
                      Period
                    </th>
                    {DAYS.map((d) => (
                      <th key={d} className={`py-3 px-4 text-center text-[10px] font-bold uppercase tracking-widest border-b border-r border-border/40 ${d === todayName ? 'text-primary bg-primary/5' : 'text-muted-foreground'}`}>
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((slot) => (
                    <tr key={slot.id}>
                      <td className="py-2 px-4 border-b border-r border-border/30 text-xs whitespace-nowrap">
                        <div className="font-bold">#{slot.periodNumber}</div>
                        <div className="text-muted-foreground">{slot.startTime}–{slot.endTime}</div>
                      </td>
                      {DAYS.map((day) => {
                        const entry = grid[day]?.[slot.periodNumber];
                        return (
                          <td key={day} className={`py-2 px-3 border-b border-r border-border/30 text-center align-top min-w-[120px] ${day === todayName ? 'bg-primary/[0.02]' : ''}`}>
                            {entry ? (
                              <div>
                                <div className="text-xs font-semibold text-primary">{entry.subjectName || '—'}</div>
                                <div className="text-[10px] text-muted-foreground">{entry.className} {entry.sectionName}</div>
                                <div className="flex items-center justify-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => openCW(entry)}
                                    className="p-1 rounded bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors"
                                    title="Add Classwork"
                                  >
                                    <ClipboardList className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => openProgress(entry)}
                                    className="p-1 rounded bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                                    title="Update Progress"
                                  >
                                    <BarChart3 className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => openHW(entry)}
                                    className="p-1 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                                    title="Assign Homework"
                                  >
                                    <BookMarked className="h-3 w-3" />
                                  </button>
                                </div>
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

      <HomeworkFormModal
        open={hwModalOpen}
        onOpenChange={setHwModalOpen}
        editItem={null}
        prefill={prefill}
        onSuccess={() => {
          setHwModalOpen(false);
          toast.success('Homework assigned successfully');
        }}
      />

      <ClassworkFormModal
        open={cwModalOpen}
        onOpenChange={setCwModalOpen}
        editItem={null}
        prefill={prefill}
        onSuccess={() => {
          setCwModalOpen(false);
          toast.success('Classwork logged successfully');
        }}
      />

      <ProgressFormModal
        open={progressModalOpen}
        onOpenChange={setProgressModalOpen}
        editItem={null}
        prefill={prefill}
        onSuccess={() => {
          setProgressModalOpen(false);
          toast.success('Progress updated successfully');
        }}
      />
    </div>
  );
}
