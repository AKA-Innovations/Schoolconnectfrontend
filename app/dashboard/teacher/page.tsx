'use client';

import React, { useState, useMemo } from 'react';
import { useTeacherDashboard } from '../../../hooks/useTeacherDashboard';
import { useFetchTimetable, useSubjectDetails, usePeriodSlots, useClassSectionLists } from '../../../hooks/useClasses';
import { useSubstitutePeriods, useTeacherAttendance, useLeaveList } from '../../../hooks/useTeacherLeave';
import { StatsRow } from '../../../components/dashboard/StatsRow';
import { QuickActions } from '../../../components/dashboard/QuickActions';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';
import { useTeacherRoles } from '../../../lib/permissions';
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

  const teacherRoles = useTeacherRoles();

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

  // Fetch today's substitute periods, classes and subjects
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const { data: substitutePeriods = [] } = useSubstitutePeriods(todayStr);
  const { data: classSections = [] } = useClassSectionLists();

  // Fetch teacher's monthly attendance and leave lists for the leave prompts
  const now = useMemo(() => new Date(), []);
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const { data: attendanceRecords = [] } = useTeacherAttendance(user?.id, currentYear, currentMonth);
  const { data: myLeaves = [] } = useLeaveList({ teacherId: user?.id });

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

  // Map substitute periods to timetable entry structure
  const mappedSubstitutes = useMemo(() => {
    return substitutePeriods
      .filter((p) => p.substituteTeacherId === user?.id && p.status === 'ASSIGNED')
      .map((p) => {
        const csMatch = classSections.find(cs => (cs.masterSectionId || cs.id) === p.classSectionId);
        const subjMatch = subjectDetails.find(sd => Number(sd.subjectDtlsId) === p.subjectId);
        const slot = periodSlots.find(ps => ps.id === p.periodId);
        
        return {
          id: `sub-${p.id}`,
          classSubjectId: String(p.subjectId),
          classSectionId: p.classSectionId,
          subjectDtlsId: p.subjectId,
          periodId: p.periodId,
          periodNumber: slot?.periodNumber || p.periodId,
          startTime: slot?.startTime || '00:00 AM',
          endTime: slot?.endTime || '00:00 AM',
          className: csMatch?.className || 'Class',
          sectionName: csMatch?.sectionName || '',
          subjectName: subjMatch?.subjectName || `Subject #${p.subjectId}`,
          isSubstitute: true,
        };
      });
  }, [substitutePeriods, user, classSections, subjectDetails, periodSlots]);

  const timetable = useMemo(() => {
    const entries = Array.isArray(rawTimetable) ? rawTimetable : [];
    const normalizedRegular = entries.map(e => {
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
    });

    return [...normalizedRegular, ...mappedSubstitutes].sort((a, b) => (a.periodNumber || 0) - (b.periodNumber || 0));
  }, [rawTimetable, subjectDetails, periodSlotMap, periodSlots, mappedSubstitutes]);

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

  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  }, []);

  const nextClass = useMemo(() => {
    if (!timetable || timetable.length === 0) return null;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const parseTimeToMinutes = (timeStr: string) => {
      if (!timeStr) return 9999;
      const match = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)?$/i);
      if (!match) return 9999;
      let hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const ampm = match[3];
      if (ampm) {
        if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
      }
      return hours * 60 + minutes;
    };

    const upcoming = timetable.find((item) => parseTimeToMinutes(item.startTime) > currentMinutes);
    return upcoming || null;
  }, [timetable]);

  const customStats = useMemo(() => {
    const totalToday = timetable.length;
    const attPending = totalToday > 0 ? Math.max(1, Math.floor(totalToday - 1)) : 0;
    const assignmentsPending = 7;

    return [
      { label: "Today's Classes", value: totalToday, iconName: "BookOpen" },
      { label: "Attendance Pending", value: attPending, trend: 12, trendType: 'down' as const, iconName: "ClipboardList" },
      { label: "Assignments Pending", value: assignmentsPending, trend: 3, trendType: 'up' as const, iconName: "FileText" },
    ];
  }, [timetable]);

  const promptLeaves = useMemo(() => {
    const unresolved: { date: string; status: string }[] = [];
    
    attendanceRecords.forEach((rec) => {
      if (rec.status === 'ABSENT' || rec.status === 'HALF_DAY') {
        const recDateStr = rec.date.split('T')[0];
        
        // Check if there is a leave that covers this date
        const hasLeave = myLeaves.some((leave) => {
          const start = leave.startDate.split('T')[0];
          const end = leave.endDate.split('T')[0];
          return recDateStr >= start && recDateStr <= end && leave.status !== 'CANCELLED' && leave.status !== 'REJECTED';
        });
        
        if (!hasLeave) {
          unresolved.push({
            date: recDateStr,
            status: rec.status,
          });
        }
      }
    });
    
    return unresolved;
  }, [attendanceRecords, myLeaves]);

  const [isHomeworkModalOpen, setHomeworkModalOpen] = useState(false);
  const [isClassworkModalOpen, setClassworkModalOpen] = useState(false);
  const [isProgressModalOpen, setProgressModalOpen] = useState(false);
  const [selectedScheduleItem, setSelectedScheduleItem] = useState<any>(null);

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 lg:p-8 animate-in fade-in duration-500">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-8">
        {promptLeaves.map((pl) => (
          <div 
            key={pl.date} 
            className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 text-amber-800 text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
              <span>
                You were marked <strong className="text-amber-950 font-bold capitalize">{pl.status.toLowerCase().replace('_', ' ')}</strong> on <strong className="text-slate-800 font-bold">{new Date(pl.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>. Please apply for a leave request to cover this date.
              </span>
            </div>
            <Button
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[10px] font-bold h-8 px-4 w-fit shrink-0 shadow-sm transition-all"
              onClick={() => router.push(`/dashboard/teacher/leave?apply=true&date=${pl.date}&type=${pl.status === 'HALF_DAY' ? 'HALF_DAY' : 'CASUAL'}`)}
            >
              Apply Leave
            </Button>
          </div>
        ))}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/25 border border-border/40 backdrop-blur-md p-4 px-6 rounded-2xl h-[70px] justify-center sm:justify-start">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold">
            <span className="text-foreground font-bold">{formattedDate}</span>
            <span className="text-muted-foreground/30">•</span>
            <span className="text-primary font-bold">{timetable.length} Classes Today</span>
            {nextClass && (
              <>
                <span className="text-muted-foreground/30">•</span>
                <span className="text-muted-foreground font-medium">
                  Next: <strong className="text-foreground font-bold">{nextClass.subjectName}</strong> • {nextClass.startTime}
                </span>
              </>
            )}
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

        <StatsRow stats={customStats} isLoading={isTimetableLoading} />

        <Card className="erp-card border-none bg-white/40 backdrop-blur-md shadow-xl shadow-slate-200/50">
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
                      <div className="p-4 bg-card rounded-2xl border border-border/40 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-muted-foreground/80">
                              {item.startTime} – {item.endTime}
                            </p>
                            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                              {item.subjectName} • Class {item.className}{item.sectionName}
                              {item.isSubstitute && (
                                <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-lg">
                                  Substitute
                                </Badge>
                              )}
                            </h4>
                            <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                              Room {100 + (item.periodNumber || 1)}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {teacherRoles.isClassTeacher && (
                              <Button 
                                variant="secondary" 
                                size="sm" 
                                className="rounded-xl text-[10px] font-bold h-7 px-3 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all border-none"
                                onClick={() => router.push('/dashboard/teacher/attendance')}
                              >
                                Attendance
                              </Button>
                            )}
                            {teacherRoles.isSubjectTeacher && (
                              <>
                                <Button 
                                  variant="secondary" 
                                  size="sm" 
                                  className="rounded-xl text-[10px] font-bold h-7 px-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all border-none"
                                  onClick={() => handleAddHomework(item)}
                                >
                                  Homework
                                </Button>
                                <Button 
                                  variant="secondary" 
                                  size="sm" 
                                  className="rounded-xl text-[10px] font-bold h-7 px-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-600 hover:text-white transition-all border-none"
                                  onClick={() => handleUpdateProgress(item)}
                                >
                                  Grades
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-purple-50/10 dark:bg-purple-950/10 rounded-2xl border border-purple-200/40 shadow-sm hover:shadow-md hover:border-purple-300/40 transition-all duration-300">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[9px] font-bold uppercase tracking-wider">
                                Event ({item.startTime} - {item.endTime})
                              </span>
                              <Badge className={cn("text-[9px] rounded-lg", getEventBadgeColor(item.eventType))}>
                                {item.eventType}
                              </Badge>
                            </div>
                            <h4 className="text-sm font-bold text-foreground leading-tight">{item.title}</h4>
                            <p className="text-xs text-muted-foreground/80">{item.description}</p>
                            {item.location && <p className="text-[10px] text-purple-500 mt-1 font-bold">📍 Location: {item.location}</p>}
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
      </div>

      {/* Right Column */}
      <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-8">
        <div className="flex items-center justify-end bg-card/25 border border-border/40 backdrop-blur-md p-4 px-6 rounded-2xl h-[70px]">
          <Button
            variant="outline"
            onClick={() => { refetchSummary(); refetchTimetable(); fetchTodayEvents(); }}
            className="rounded-xl h-9 text-xs bg-card/65 backdrop-blur-sm border-border/40 hover:bg-muted/10"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 mr-2 text-muted-foreground", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        <Card className="erp-card border border-border/40 bg-card overflow-hidden">
          <CardHeader className="pb-3 pt-5 px-5">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2.5 pb-5 px-5">
            {teacherRoles.isClassTeacher && (
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/teacher/attendance')}
                className="justify-start gap-2.5 h-10 px-4 rounded-xl border-border bg-muted/20 hover:bg-primary hover:text-primary-foreground hover:border-primary text-foreground/80 dark:border-border/30 dark:bg-muted/10 transition-all duration-300 font-bold text-xs shadow-sm hover:scale-[1.01]"
              >
                <span className="text-sm">✓</span> Mark Attendance
              </Button>
            )}
            {teacherRoles.isSubjectTeacher && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setHomeworkModalOpen(true)}
                  className="justify-start gap-2.5 h-10 px-4 rounded-xl border-border bg-muted/20 hover:bg-primary hover:text-primary-foreground hover:border-primary text-foreground/80 dark:border-border/30 dark:bg-muted/10 transition-all duration-300 font-bold text-xs shadow-sm hover:scale-[1.01]"
                >
                  <span className="text-sm">📝</span> Homework
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/teacher/classroom')}
                  className="justify-start gap-2.5 h-10 px-4 rounded-xl border-border bg-muted/20 hover:bg-primary hover:text-primary-foreground hover:border-primary text-foreground/80 dark:border-border/30 dark:bg-muted/10 transition-all duration-300 font-bold text-xs shadow-sm hover:scale-[1.01]"
                >
                  <span className="text-sm">📊</span> Grades
                </Button>
              </>
            )}
            {teacherRoles.isCoordinator && (
              <>
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/teacher/announcements')}
                  className="justify-start gap-2.5 h-10 px-4 rounded-xl border-border bg-muted/20 hover:bg-primary hover:text-primary-foreground hover:border-primary text-foreground/80 dark:border-border/30 dark:bg-muted/10 transition-all duration-300 font-bold text-xs shadow-sm hover:scale-[1.01]"
                >
                  <span className="text-sm">📢</span> Announcement
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/teacher/schedule')}
                  className="justify-start gap-2.5 h-10 px-4 rounded-xl border-border bg-muted/20 hover:bg-primary hover:text-primary-foreground hover:border-primary text-foreground/80 dark:border-border/30 dark:bg-muted/10 transition-all duration-300 font-bold text-xs shadow-sm hover:scale-[1.01]"
                >
                  <span className="text-sm">📅</span> Schedule Change
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="erp-card border border-border/40 bg-card overflow-hidden">
          <CardHeader className="pb-3 pt-5 px-5">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Syllabus Progress</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <ProgressDashboardCards />
          </CardContent>
        </Card>

        <Card className="erp-card border border-border/40 bg-card overflow-hidden">
          <CardHeader className="pb-3 pt-5 px-5">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Grading Queue</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="space-y-3">
              <div className="group flex items-center justify-between p-3.5 rounded-2xl bg-muted/20 border border-border/40 hover:border-primary/30 transition-all shadow-sm">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground">Math Mid-term</span>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Class 10-A</span>
                </div>
                <span className="text-[9px] bg-rose-500/10 text-rose-500 border border-rose-500/25 px-2 py-0.5 rounded-md font-black uppercase tracking-wider flex items-center gap-1">
                  ⚠️ 12 Left
                </span>
              </div>
              <div className="group flex items-center justify-between p-3.5 rounded-2xl bg-muted/10 border border-transparent transition-all opacity-60">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground">Algebra Quiz 2</span>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Class 9-B</span>
                </div>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 px-2 py-0.5 rounded-md font-black uppercase tracking-wider">
                  🟢 Completed
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
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


