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
import { eventService } from '@/services/event/service';
import { cn } from '@/lib/utils';

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

  // Fetch weekly events
  const [weeklyEvents, setWeeklyEvents] = React.useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = React.useState(false);

  const fetchWeeklyEvents = async () => {
    try {
      setLoadingEvents(true);
      const res = await eventService.listEvents({
        session: CURRENT_SESSION,
      });
      setWeeklyEvents(res || []);
    } catch (err) {
      console.error('Failed to fetch weekly events:', err);
    } finally {
      setLoadingEvents(false);
    }
  };

  React.useEffect(() => {
    if (user?.id) {
      fetchWeeklyEvents();
    }
  }, [user]);

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

  const isLoading = loadingTT || loadingSlots || loadingEvents;

  const [hwModalOpen, setHwModalOpen] = React.useState(false);
  const [cwModalOpen, setCwModalOpen] = React.useState(false);
  const [progressModalOpen, setProgressModalOpen] = React.useState(false);
  const [prefill, setPrefill] = React.useState<{ 
    className: string; 
    sectionName: string; 
    subjectName: string;
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
        map[e.dayOfWeek][e.periodNumber] = { ...e, type: 'class' };
      }
    });
    return map;
  }, [myEntries]);

  // Today's schedule
  const todayName = DAYS[new Date().getDay() - 1] || 'Monday';
  
  // Filter events relevant to this teacher
  const myWeeklyEvents = useMemo(() => {
    return weeklyEvents.filter((evt: any) => {
      if (evt.targetAudience === 'ALL' || evt.targetAudience === 'TEACHERS') return true;
      if (evt.targetAudience === 'SPECIFIC_CLASS') {
        return evt.targetedClasses?.some((tc: any) => {
          return subjectDetails.some(sd => 
            Number(sd.classDtlsId || (sd as any).classSectionId) === Number(tc.sectionId) ||
            Number((sd as any).classId) === Number(tc.classId)
          );
        });
      }
      return false;
    });
  }, [weeklyEvents, subjectDetails]);

  // Get today's date formatted as YYYY-MM-DD local time
  const todayDateStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  // Filter events active today
  const todayEvents = useMemo(() => {
    return myWeeklyEvents.filter((evt: any) => {
      const start = evt.startDate.split('T')[0];
      const end = evt.endDate.split('T')[0];
      return todayDateStr >= start && todayDateStr <= end;
    });
  }, [myWeeklyEvents, todayDateStr]);

  const todayEntries = useMemo(() => {
    const classes = myEntries.filter((e) => e.dayOfWeek === todayName).map(c => ({ ...c, type: 'class' }));
    const events = todayEvents.map(e => ({
      ...e,
      type: 'event',
      startTime: e.startTime || '09:00 AM',
      endTime: e.endTime || '05:00 PM',
    }));

    const all = [...classes, ...events];

    const toMinutes = (timeStr: string) => {
      if (!timeStr) return 0;
      const match = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)?$/i);
      if (!match) return 0;
      let hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const ampm = match[3];
      if (ampm) {
        if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
      }
      return hours * 60 + minutes;
    };

    return all.sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
  }, [myEntries, todayEvents, todayName]);


  const openHW = (e: any) => {
    setPrefill({ 
      className: e.className, 
      sectionName: e.sectionName, 
      subjectName: e.subjectName || '',
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
      subjectName: e.subjectName || '',
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
      subjectName: e.subjectName || '',
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
            <Badge variant="secondary" className="ml-auto">{todayEntries.length} items</Badge>
          </div>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-muted rounded animate-pulse" />)}
            </div>
          ) : todayEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items scheduled for today</p>
          ) : (
            <div className="space-y-2">
              {todayEntries.map((entry, eIdx) => {
                if (entry.type === 'class') {
                  return (
                    <div key={`class-${entry.id || eIdx}`} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
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
                } else {
                  return (
                    <div key={`event-${entry.id || eIdx}`} className="flex items-center gap-4 p-3 rounded-xl bg-purple-50/20 border border-purple-100/50 hover:bg-purple-50/40 transition-colors">
                      <div className="text-xs font-mono text-purple-700 w-[100px]">
                        {entry.startTime} – {entry.endTime}
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-purple-900">{entry.title}</span>
                        {entry.location && <span className="text-[10px] text-purple-600 ml-2">📍 {entry.location}</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge className="text-[9px] bg-purple-100 text-purple-700 border-none rounded-lg">
                          {entry.eventType}
                        </Badge>
                      </div>
                    </div>
                  );
                }
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
                        
                        // Find events overlapping with this period times on this day of the week
                         const getEventsForDay = () => {
                           const DAYS_LIST = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                           const dayIndex = DAYS_LIST.indexOf(day);
                           if (dayIndex === -1) return [];
                           
                           const today = new Date();
                           const currentDay = today.getDay();
                           const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
                           const targetDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + mondayOffset + dayIndex);
                           const targetDateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;

                           return myWeeklyEvents.filter((evt: any) => {
                             const start = evt.startDate.split('T')[0];
                             const end = evt.endDate.split('T')[0];
                             const isActiveOnDay = targetDateStr >= start && targetDateStr <= end;
                             if (!isActiveOnDay) return false;

                             if (evt.isFullDay || evt.isHoliday) return true;
                             
                             // Check if event overlaps with this period slot times
                             const toMinutes = (timeStr: string) => {
                               if (!timeStr) return 0;
                               const match = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)?$/i);
                               if (!match) return 0;
                               let hours = parseInt(match[1]);
                               const minutes = parseInt(match[2]);
                               const ampm = match[3];
                               if (ampm) {
                                 if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
                                 if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
                               }
                               return hours * 60 + minutes;
                             };

                             const evtStart = toMinutes(evt.startTime);
                             const evtEnd = toMinutes(evt.endTime);
                             const slotStart = toMinutes(slot.startTime);
                             const slotEnd = toMinutes(slot.endTime);

                             // Simple overlap check
                             return (evtStart < slotEnd && evtEnd > slotStart);
                           });
                         };

                        const dayEvents = getEventsForDay();
                        const isHoliday = dayEvents.some(e => e.isHoliday);
                        const hasEvent = dayEvents.length > 0;
                        const hasClass = !!entry;

                        return (
                          <td key={day} className={cn(
                            'py-2 px-3 border-b border-r border-border/30 text-center align-top min-w-[120px] h-16 relative group',
                            day === todayName && 'bg-primary/[0.02]',
                            isHoliday && 'bg-rose-50/50'
                          )}>
                            {hasEvent && hasClass ? (
                              /* 3D Flip Card Container */
                              <div className="w-full h-full min-h-[50px] [perspective:1000px] cursor-pointer">
                                <div className="relative w-full h-full duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] transition-all">
                                  {/* FRONT SIDE (Event / Holiday) */}
                                  <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] flex items-center justify-center">
                                    {isHoliday ? (
                                      <div className="rounded-lg bg-rose-50 border border-rose-200/60 p-1 w-full h-full flex flex-col justify-center items-center">
                                        <div className="text-[10px] font-black text-rose-600 uppercase">Holiday</div>
                                        <div className="text-[8px] text-rose-500 font-bold truncate max-w-full">
                                          {dayEvents.find(e => e.isHoliday)?.title || 'School Holiday'}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="rounded-lg bg-purple-50 border border-purple-200 p-1 w-full h-full flex flex-col justify-center items-center">
                                        <div className="text-[10px] font-bold text-purple-700 truncate w-full" title={dayEvents[0].title}>
                                          {dayEvents[0].title}
                                        </div>
                                        <div className="text-[8px] text-purple-500 font-semibold uppercase">{dayEvents[0].eventType}</div>
                                      </div>
                                    )}
                                  </div>
                                  {/* BACK SIDE (Suspended Scheduled Class) */}
                                  <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] flex items-center justify-center bg-background">
                                    <div className="rounded-lg bg-muted/40 border border-dashed border-rose-300 p-1 w-full h-full flex flex-col justify-center items-center">
                                      <div className="text-[8px] font-bold text-rose-500 uppercase tracking-widest leading-none mb-0.5">Suspended</div>
                                      <div className="text-xs font-semibold text-muted-foreground line-clamp-1">{entry.subjectName || '—'}</div>
                                      <div className="text-[9px] text-muted-foreground/70">{entry.className} {entry.sectionName}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : hasEvent ? (
                              isHoliday ? (
                                <div className="rounded-lg bg-rose-50 border border-rose-200/60 p-1.5 flex flex-col justify-center items-center">
                                  <div className="text-[10px] font-black text-rose-600 uppercase">Holiday</div>
                                  <div className="text-[8px] text-rose-500 font-bold truncate max-w-full">
                                    {dayEvents.find(e => e.isHoliday)?.title || 'School Holiday'}
                                  </div>
                                </div>
                              ) : (
                                <div className="rounded-lg bg-purple-50 p-1 border border-purple-100">
                                  <div className="text-[10px] font-bold text-purple-700 truncate" title={dayEvents[0].title}>
                                    {dayEvents[0].title}
                                  </div>
                                  <div className="text-[8px] text-purple-500 font-semibold">{dayEvents[0].eventType}</div>
                                </div>
                              )
                            ) : hasClass ? (
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
