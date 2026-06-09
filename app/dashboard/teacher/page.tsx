'use client';

import React, { useState, useMemo } from 'react';
import { useTeacherDashboard } from '../../../hooks/useTeacherDashboard';
import { useFetchTimetable, useSubjectDetails, usePeriodSlots } from '../../../hooks/useClasses';
import { StatsRow } from '../../../components/dashboard/StatsRow';
import { QuickActions } from '../../../components/dashboard/QuickActions';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';
import { ClipboardCheck, FilePlus, PenTool, RefreshCw, BookOpen, PenLine, Clock, BarChart3 } from 'lucide-react';
import { CURRENT_SESSION } from '../../../lib/constants';
import { useAuthStore } from '../../../store/authStore';
import { HomeworkFormModal } from '../../../components/academic/homework/HomeworkFormModal';
import { ClassworkFormModal } from '../../../components/academic/classwork/ClassworkFormModal';
import { ProgressFormModal } from '../../../components/academic/teaching-progress/ProgressFormModal';
import { ProgressDashboardCards } from '../../../components/academic/teaching-progress/ProgressDashboardCards';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { eventService } from '../../../services/event/service';
import { ShieldAlert } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';



export default function TeacherDashboard() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  // Redirect principal to principal dashboard
  React.useEffect(() => {
    if (user?.isPrincipal) {
      router.replace('/dashboard/principal');
    }
  }, [user, router]);

  const { data: summary, isLoading: isSummaryLoading, refetch: refetchSummary } = useTeacherDashboard();
  const { data: subjectDetails = [] } = useSubjectDetails(user?.isPrincipal ? undefined : user?.id);
  
  // Get today's day of week
  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
  
  const { data: rawTimetable = [], isLoading: isTimetableLoading, refetch: refetchTimetable } = useFetchTimetable({
    session: CURRENT_SESSION,
    dayOfWeek: today,
    teacherId: user?.id,
  });

  const { data: periodSlots = [] } = usePeriodSlots();

  // Fetch today's events
  const [todayEvents, setTodayEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const fetchTodayEvents = async () => {
    try {
      setLoadingEvents(true);
      // Format today as YYYY-MM-DD local time
      const d = new Date();
      const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const sessionVal = CURRENT_SESSION;
      const res = await eventService.listEvents({
        session: sessionVal,
      });
      
      const filtered = (res || []).filter((evt: any) => {
        const start = evt.startDate.split('T')[0];
        const end = evt.endDate.split('T')[0];
        const isActiveToday = todayStr >= start && todayStr <= end;
        if (!isActiveToday) return false;
        
        // Filter by target audience and teacher's classes
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
      setTodayEvents(filtered);
    } catch (err) {
      console.error('Failed to fetch today events:', err);
    } finally {
      setLoadingEvents(false);
    }
  };

  React.useEffect(() => {
    if (user?.id && subjectDetails.length > 0) {
      fetchTodayEvents();
    }
  }, [user, subjectDetails]);

  // Build a periodId → PeriodSlot lookup for normalization
  const periodSlotMap = useMemo(() => {
    const m = new Map<number, typeof periodSlots[0]>();
    periodSlots.forEach(s => m.set(s.id, s));
    return m;
  }, [periodSlots]);

  const timetable = useMemo(() => {
    const entries = Array.isArray(rawTimetable) ? rawTimetable : [];
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
      if (!e.periodId && periodNumber) {
        const slot = periodSlots.find(s => Number(s.periodNumber) === Number(periodNumber));
        if (slot) {
          e = { ...e, periodId: slot.id };
          if (!startTime) startTime = slot.startTime;
          if (!endTime) endTime = slot.endTime;
        }
      }

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
    }).sort((a, b) => (a.periodNumber || 0) - (b.periodNumber || 0));
  }, [rawTimetable, subjectDetails, periodSlotMap, periodSlots]);

  // Combine timetable entries with timed events
  const combinedTimeline = useMemo(() => {
    const items: any[] = timetable.map(t => ({ ...t, type: 'class' }));
    
    // Add timed events
    todayEvents.forEach((evt: any) => {
      if (!evt.isFullDay) {
        items.push({
          type: 'event',
          id: evt.id,
          title: evt.title,
          description: evt.description,
          eventType: evt.eventType,
          startTime: evt.startTime,
          endTime: evt.endTime,
          isHoliday: evt.isHoliday,
          location: evt.location,
          targetAudience: evt.targetAudience,
          targetedClasses: evt.targetedClasses,
        });
      }
    });

    // Helper to parse "HH:MM AM/PM" to total minutes
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

    return items.sort((a, b) => {
      const aMin = toMinutes(a.startTime);
      const bMin = toMinutes(b.startTime);
      return aMin - bMin;
    });
  }, [timetable, todayEvents]);

  // Extract full-day events
  const fullDayEvents = useMemo(() => {
    return todayEvents.filter(e => e.isFullDay);
  }, [todayEvents]);

  // Extract holidays
  const isTodayHoliday = useMemo(() => {
    return todayEvents.some(e => e.isHoliday);
  }, [todayEvents]);

  const [isHomeworkModalOpen, setHomeworkModalOpen] = useState(false);
  const [isClassworkModalOpen, setClassworkModalOpen] = useState(false);
  const [isProgressModalOpen, setProgressModalOpen] = useState(false);
  const [selectedScheduleItem, setSelectedScheduleItem] = useState<any>(null);

  const actions = [
    { label: 'Mark Attendance', icon: ClipboardCheck, onClick: () => { }, variant: 'default' as const },
    { label: 'Upload Assignment', icon: FilePlus, onClick: () => setHomeworkModalOpen(true) },
    { label: 'Enter Grades', icon: PenTool, onClick: () => { } },
  ];

  const handleAddHomework = (item: any) => {
    setSelectedScheduleItem({
      className: item.className,
      sectionName: item.sectionName,
      subjectId: item.classSubjectId,
      classSectionId: item.classSectionId,
      subjectDtlsId: item.subjectDtlsId
    });
    setHomeworkModalOpen(true);
  };

  const handleAddClasswork = (item: any) => {
    setSelectedScheduleItem({
      className: item.className,
      sectionName: item.sectionName,
      subjectId: item.classSubjectId,
      classSectionId: item.classSectionId,
      subjectDtlsId: item.subjectDtlsId
    });
    setClassworkModalOpen(true);
  };

  const handleUpdateProgress = (item: any) => {
    setSelectedScheduleItem({
      className: item.className,
      sectionName: item.sectionName,
      subjectId: item.classSubjectId,
      classSectionId: item.classSectionId,
      subjectDtlsId: item.subjectDtlsId
    });
    setProgressModalOpen(true);
  };

  const isLoading = isSummaryLoading || isTimetableLoading || loadingEvents;

  if (user?.isPrincipal) {
    return null;
  }

  // Helper to style event type badges
  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case 'HOLIDAY': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'EXAM': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'MEETING': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'CULTURAL': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'SPORTS': return 'bg-green-50 text-green-700 border-green-200';
      case 'PTM': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-4 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back, {user?.name?.split(' ')[0] || 'Teacher'}!</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening in your classes today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => { refetchSummary(); refetchTimetable(); fetchTodayEvents(); }}
            className="rounded-xl h-11 bg-white/50 backdrop-blur-sm border-slate-200"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2 text-muted-foreground", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {isTodayHoliday && (
        <div className="rounded-2xl border border-rose-300 bg-rose-50/50 p-4 text-rose-800 text-sm font-semibold flex items-center gap-3">
          <ShieldAlert className="h-5 w-5 text-rose-600" />
          Today is marked as a Holiday! Enjoy the break.
        </div>
      )}

      {fullDayEvents.length > 0 && (
        <div className="space-y-2">
          {fullDayEvents.map((fe: any) => (
            <div key={fe.id} className="rounded-2xl border border-purple-200 bg-purple-50/40 p-4 text-purple-900 text-sm flex items-center justify-between">
              <div>
                <span className="font-bold">Full Day Event: {fe.title}</span>
                {fe.location && <span className="text-xs text-purple-700 ml-2">📍 {fe.location}</span>}
              </div>
              <Badge className={cn("rounded-lg", getEventBadgeColor(fe.eventType))}>{fe.eventType}</Badge>
            </div>
          ))}
        </div>
      )}

      <StatsRow stats={summary?.kpis} isLoading={isSummaryLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 erp-card border-none bg-white/40 backdrop-blur-md shadow-xl shadow-slate-200/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Today's Schedule</CardTitle>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">{today}</p>
            </div>
            <Clock className="h-5 w-5 text-muted-foreground/30" />
          </CardHeader>
          <CardContent>
            <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pb-4">
              {isLoading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="relative ml-8">
                    <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-slate-100 border-4 border-white shadow-sm" />
                    <div className="h-32 bg-slate-50/50 rounded-2xl animate-pulse border border-slate-100" />
                  </div>
                ))
              ) : combinedTimeline.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center ml-4">
                  <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-4">
                    <BookOpen className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">No classes scheduled</h3>
                  <p className="text-sm text-slate-500 max-w-[200px]">You have a free day today! Take some rest or plan ahead.</p>
                </div>
              ) : (
                combinedTimeline.map((item, idx) => (
                  <div key={item.type === 'class' ? `class-${item.id}-${idx}` : `event-${item.id}-${idx}`} className="relative ml-8 group">
                    <div className={cn(
                      "absolute -left-[41px] top-1 w-5 h-5 rounded-full border-4 border-white shadow-sm transition-all duration-500 group-hover:scale-125",
                      item.type === 'event' ? "bg-purple-500" : idx === 0 ? "bg-primary animate-pulse" : "bg-slate-300 group-hover:bg-primary/50"
                    )} />
                    
                    {item.type === 'class' ? (
                      <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-500">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                                Period {item.periodNumber}
                              </span>
                              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-tighter">
                                Class {item.className} — {item.sectionName}
                              </span>
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 leading-tight">{item.subjectName}</h4>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="flex-1 sm:flex-none rounded-xl text-[10px] font-bold h-8 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all border-none"
                              onClick={() => handleAddHomework(item)}
                            >
                              <FilePlus className="h-3 w-3 mr-1" />
                              HW
                            </Button>
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="flex-1 sm:flex-none rounded-xl text-[10px] font-bold h-8 bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white transition-all border-none"
                              onClick={() => handleAddClasswork(item)}
                            >
                              <PenLine className="h-3 w-3 mr-1" />
                              CW
                            </Button>
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="flex-1 sm:flex-none rounded-xl text-[10px] font-bold h-8 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-all border-none"
                              onClick={() => handleUpdateProgress(item)}
                            >
                              <BarChart3 className="h-3 w-3 mr-1" />
                              PROG
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 bg-purple-50/20 rounded-3xl border border-purple-100 shadow-sm hover:shadow-xl hover:shadow-purple-500/5 hover:border-purple-300 transition-all duration-500">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold uppercase tracking-wider">
                                Event ({item.startTime} - {item.endTime})
                              </span>
                              <Badge className={cn("text-[9px] rounded-lg", getEventBadgeColor(item.eventType))}>
                                {item.eventType}
                              </Badge>
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 leading-tight">{item.title}</h4>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                            {item.location && <p className="text-[11px] text-purple-600 mt-1 font-semibold">📍 Location: {item.location}</p>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <QuickActions actions={actions} />

          <Card className="erp-card border-none bg-white/40 backdrop-blur-md shadow-xl shadow-slate-200/50">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Syllabus Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ProgressDashboardCards />
            </CardContent>
          </Card>

          <Card className="erp-card border-none bg-white/40 backdrop-blur-md shadow-xl shadow-slate-200/50">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Grading Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="group flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-primary/30 transition-all">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900">Math Mid-term</span>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Class 10-A</span>
                  </div>
                  <span className="text-[11px] bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">12 Left</span>
                </div>
                <div className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-transparent transition-all opacity-60">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900">Algebra Quiz 2</span>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Class 9-B</span>
                  </div>
                  <span className="text-[11px] bg-slate-200 text-slate-600 px-3 py-1 rounded-full font-bold">Completed</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <HomeworkFormModal 
        open={isHomeworkModalOpen} 
        onOpenChange={setHomeworkModalOpen}
        editItem={null}
        prefill={selectedScheduleItem}
        onSuccess={() => {
          setHomeworkModalOpen(false);
          toast.success('Homework assigned successfully!');
        }}
      />

      <ClassworkFormModal
        open={isClassworkModalOpen}
        onOpenChange={setClassworkModalOpen}
        editItem={null}
        prefill={selectedScheduleItem}
        onSuccess={() => {
          setClassworkModalOpen(false);
          toast.success('Classwork logged successfully!');
        }}
      />

      <ProgressFormModal
        open={isProgressModalOpen}
        onOpenChange={setProgressModalOpen}
        editItem={null}
        prefill={selectedScheduleItem}
        onSuccess={() => {
          setProgressModalOpen(false);
          toast.success('Progress updated successfully!');
        }}
      />
    </div>
  );
}


