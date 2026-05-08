'use client';

import React, { useState, useMemo } from 'react';
import { useTeacherDashboard } from '../../../hooks/useTeacherDashboard';
import { useFetchTimetable } from '../../../hooks/useClasses';
import { StatsRow } from '../../../components/dashboard/StatsRow';
import { QuickActions } from '../../../components/dashboard/QuickActions';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';
import { ClipboardCheck, FilePlus, PenTool, RefreshCw, BookOpen, PenLine, Clock } from 'lucide-react';
import { CURRENT_SESSION } from '../../../lib/constants';
import { useAuthStore } from '../../../store/authStore';
import { HomeworkFormModal } from '../../../components/academic/homework/HomeworkFormModal';
import { ClassworkFormModal } from '../../../components/academic/classwork/ClassworkFormModal';
import { toast } from 'sonner';

export default function TeacherDashboard() {
  const user = useAuthStore((s) => s.user);
  const { data: summary, isLoading: isSummaryLoading, refetch: refetchSummary } = useTeacherDashboard();
  
  // Get today's day of week
  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
  
  const { data: timetable = [], isLoading: isTimetableLoading, refetch: refetchTimetable } = useFetchTimetable({
    session: CURRENT_SESSION,
    dayOfWeek: today,
  });

  const [isHomeworkModalOpen, setHomeworkModalOpen] = useState(false);
  const [isClassworkModalOpen, setClassworkModalOpen] = useState(false);
  const [selectedScheduleItem, setSelectedScheduleItem] = useState<any>(null);

  const actions = [
    { label: 'Mark Attendance', icon: ClipboardCheck, onClick: () => { }, variant: 'default' as const },
    { label: 'Upload Assignment', icon: FilePlus, onClick: () => setHomeworkModalOpen(true) },
    { label: 'Enter Grades', icon: PenTool, onClick: () => { } },
  ];

  const handleAddHomework = (item: any) => {
    setSelectedScheduleItem(item);
    setHomeworkModalOpen(true);
  };

  const handleAddClasswork = (item: any) => {
    setSelectedScheduleItem(item);
    setClassworkModalOpen(true);
  };

  const isLoading = isSummaryLoading || isTimetableLoading;

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
            onClick={() => { refetchSummary(); refetchTimetable(); }}
            className="rounded-xl h-11 bg-white/50 backdrop-blur-sm border-slate-200"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2 text-muted-foreground", (isSummaryLoading || isTimetableLoading) && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

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
              ) : timetable.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center ml-4">
                  <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-4">
                    <BookOpen className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">No classes scheduled</h3>
                  <p className="text-sm text-slate-500 max-w-[200px]">You have a free day today! Take some rest or plan ahead.</p>
                </div>
              ) : (
                timetable.map((cls, idx) => (
                  <div key={cls.id} className="relative ml-8 group">
                    <div className={cn(
                      "absolute -left-[41px] top-1 w-5 h-5 rounded-full border-4 border-white shadow-sm transition-all duration-500 group-hover:scale-125",
                      idx === 0 ? "bg-primary animate-pulse" : "bg-slate-300 group-hover:bg-primary/50"
                    )} />
                    
                    <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-500">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                              Period {cls.periodNumber}
                            </span>
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-tighter">
                              Class {cls.className} — {cls.sectionName}
                            </span>
                          </div>
                          <h4 className="text-xl font-bold text-slate-900 leading-tight">{cls.subjectName}</h4>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="flex-1 sm:flex-none rounded-xl text-[11px] font-bold h-9 bg-slate-50 hover:bg-primary hover:text-white transition-all border-none"
                            onClick={() => handleAddHomework(cls)}
                          >
                            <FilePlus className="h-3.5 w-3.5 mr-1.5" />
                            HOMEWORK
                          </Button>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="flex-1 sm:flex-none rounded-xl text-[11px] font-bold h-9 bg-slate-50 hover:bg-accent hover:text-white transition-all border-none"
                            onClick={() => handleAddClasswork(cls)}
                          >
                            <PenLine className="h-3.5 w-3.5 mr-1.5" />
                            CLASSWORK
                          </Button>
                        </div>
                      </div>
                    </div>
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
        prefill={selectedScheduleItem ? {
          className: selectedScheduleItem.className,
          sectionName: selectedScheduleItem.sectionName,
          subjectId: selectedScheduleItem.teacherClassId,
        } : undefined}
        onSuccess={() => {
          setHomeworkModalOpen(false);
          toast.success('Homework assigned successfully!');
        }}
      />

      <ClassworkFormModal
        open={isClassworkModalOpen}
        onOpenChange={setClassworkModalOpen}
        editItem={null}
        prefill={selectedScheduleItem ? {
          className: selectedScheduleItem.className,
          sectionName: selectedScheduleItem.sectionName,
          subjectId: selectedScheduleItem.teacherClassId,
        } : undefined}
        onSuccess={() => {
          setClassworkModalOpen(false);
          toast.success('Classwork logged successfully!');
        }}
      />
    </div>
  );
}

