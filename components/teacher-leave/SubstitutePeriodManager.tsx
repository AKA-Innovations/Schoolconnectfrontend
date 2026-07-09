'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useSubstitutePeriods } from '../../hooks/useTeacherLeave';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { AssignSubstituteDialog } from './AssignSubstituteDialog';
import type { SubstitutePeriod } from '../../types/leave.types';
import { CalendarDays, UserCheck, ArrowRightLeft, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'; label: string }> = {
  UNASSIGNED: { variant: 'warning', label: 'Unassigned' },
  ASSIGNED: { variant: 'success', label: 'Assigned' },
  COMPLETED: { variant: 'default', label: 'Completed' },
  CANCELLED: { variant: 'secondary', label: 'Cancelled' },
};

interface SubstitutePeriodManagerProps {
  /** If true, allows assigning substitutes */
  isAdmin?: boolean;
}

import { useClassSectionLists, usePeriodSlots, useSubjectDetails } from '../../hooks/useClasses';
import { useTeacherList } from '../../hooks/useTeachers';
import { useAuthStore } from '../../store/authStore';

export function SubstitutePeriodManager({ isAdmin }: SubstitutePeriodManagerProps) {
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const schoolId = useAuthStore((s) => s.schoolId);

  const [selectedDate, setSelectedDate] = React.useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [assignDialogOpen, setAssignDialogOpen] = React.useState(false);
  const [selectedPeriod, setSelectedPeriod] = React.useState<SubstitutePeriod | null>(null);

  const { data: periods = [], isLoading } = useSubstitutePeriods(selectedDate);
  const { data: classSections = [] } = useClassSectionLists();
  const { data: teachersData } = useTeacherList(
    { schoolId: schoolId || '', page: 1, pageSize: 500 },
    { enabled: !!isAdmin }
  );
  const { data: periodSlots = [] } = usePeriodSlots();
  const { data: subjectDetails = [] } = useSubjectDetails();

  const teachers = teachersData?.data || [];

  const displayPeriods = React.useMemo(() => {
    if (isAdmin || role !== 'teacher') {
      return periods;
    }
    // Only show substitute duties assigned to the current teacher
    return periods.filter((p) => p.substituteTeacherId === user?.id);
  }, [periods, isAdmin, role, user]);

  const handleAssignClick = (period: SubstitutePeriod) => {
    setSelectedPeriod(period);
    setAssignDialogOpen(true);
  };

  // Build lookup maps for IDs to Names
  const classSectionMap = React.useMemo(() => {
    const map = new Map<number, string>();
    classSections.forEach((cs) => {
      // Map all possible ID variants returned in period.classSectionId
      const id = cs.mappingId || cs.masterSectionId || cs.id;
      if (id) {
        map.set(id, `${cs.className} - ${cs.sectionName}`);
      }
      if (cs.id) {
        map.set(cs.id, `${cs.className} - ${cs.sectionName}`);
      }
      if (cs.masterSectionId) {
        map.set(cs.masterSectionId, `${cs.className} - ${cs.sectionName}`);
      }
    });
    return map;
  }, [classSections]);

  const teacherMap = React.useMemo(() => {
    const map = new Map<string, string>();
    teachers.forEach((t) => {
      map.set(t.id, `${t.firstName} ${t.lastName}`);
    });
    return map;
  }, [teachers]);

  const periodMap = React.useMemo(() => {
    const map = new Map<number, number>();
    periodSlots.forEach((slot) => {
      map.set(slot.id, slot.periodNumber);
    });
    return map;
  }, [periodSlots]);

  const subjectMap = React.useMemo(() => {
    const map = new Map<number, string>();
    subjectDetails.forEach((sd) => {
      if (sd.subjectDtlsId && sd.subjectName) {
        map.set(Number(sd.subjectDtlsId), sd.subjectName);
      }
    });
    return map;
  }, [subjectDetails]);

  // Group periods by original teacher so they form a "Timetable" for that absent teacher
  const groupedPeriods = React.useMemo(() => {
    const groups: Record<string, { teacherName: string; employeeId?: string; periods: SubstitutePeriod[] }> = {};
    
    displayPeriods.forEach((p) => {
      const teacherId = p.originalTeacherId;
      if (!groups[teacherId]) {
        const name = p.originalTeacher 
          ? `${p.originalTeacher.firstName} ${p.originalTeacher.lastName}` 
          : (teacherMap.get(teacherId) || `Teacher (ID: ${teacherId.slice(0, 8)})`);
        groups[teacherId] = {
          teacherName: name,
          employeeId: p.originalTeacher?.employeeId,
          periods: []
        };
      }
      groups[teacherId].periods.push(p);
    });

    // Sort periods inside each group by periodId
    Object.values(groups).forEach((g) => {
      g.periods.sort((a, b) => a.periodId - b.periodId);
    });

    return groups;
  }, [displayPeriods, teacherMap]);

  return (
    <div className="space-y-6">
      {/* Date Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="relative">
            <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-10 pl-9 pr-4 rounded-xl border border-slate-200/80 bg-white text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
            />
          </div>
          <p className="text-xs text-slate-500">
            Timetables for <span className="font-bold text-slate-700">{new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </p>
        </div>

        {/* Summary Indicators using default secondary/outline colors */}
        {!isLoading && displayPeriods.length > 0 && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
              <AlertCircle size={13} className="text-slate-400" />
              <span className="font-bold text-slate-700">{displayPeriods.filter(p => p.status === 'UNASSIGNED').length}</span>
              <span className="text-slate-500 font-medium">Unassigned</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
              <UserCheck size={13} className="text-slate-400" />
              <span className="font-bold text-slate-700">{displayPeriods.filter(p => p.status === 'ASSIGNED').length}</span>
              <span className="text-slate-500 font-medium">Assigned</span>
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-slate-50 animate-pulse border border-slate-100" />
          ))}
        </div>
      ) : displayPeriods.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <ArrowRightLeft size={44} className="mx-auto text-slate-200 mb-3" />
          <p className="text-sm font-semibold text-slate-400">No absent teachers or substitute slots for this date</p>
          <p className="text-xs text-slate-300 mt-1">Substitute timetables generate automatically when a leave is approved or marked absent</p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedPeriods).map(([teacherId, group], idx) => (
            <motion.div
              key={teacherId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            >
              {/* Absent Teacher Timetable Header */}
              <div className="bg-slate-50 border-b border-slate-100 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    {group.teacherName}
                  </h3>
                  {group.employeeId && (
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Emp ID: {group.employeeId}</p>
                  )}
                </div>
                <Badge variant="outline" className="w-fit text-[10px] py-0.5 px-2 font-bold text-slate-500 border-slate-200 bg-white">
                  On Leave / Absent
                </Badge>
              </div>

              {/* Timetable slots */}
              <div className="p-5">
                <p className="text-[10px] font-bold text-slate-400 mb-4 uppercase tracking-wider">Scheduled Periods</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.periods.map((period) => {
                    const status = statusConfig[period.status] || { variant: 'outline' as const, label: period.status };
                    return (
                      <div
                        key={period.id}
                        className="p-4 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-all flex flex-col justify-between min-h-[140px]"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg">
                              Period {periodMap.get(period.periodId) ?? (period as any).periodNumber ?? period.periodId}
                            </span>
                            <Badge variant={status.variant === 'warning' ? 'outline' : 'secondary'} className="text-[9px] py-0.5 px-2 font-bold">
                              {status.label}
                            </Badge>
                          </div>

                          <div className="space-y-1 mt-3">
                            <div className="text-xs font-bold text-slate-500">
                               Subject: <span className="text-slate-700 font-semibold">{(period as any).subjectName ?? subjectMap.get(period.subjectId) ?? `Subject #${period.subjectId}`}</span>
                            </div>
                            <div className="text-xs font-bold text-slate-500">
                              Class-Section: <span className="text-slate-700 font-semibold">{classSectionMap.get(period.classSectionId) || `Section #${period.classSectionId}`}</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between gap-2">
                          {period.status === 'UNASSIGNED' ? (
                            <>
                              <span className="text-[10px] text-slate-400 font-semibold italic">Unassigned</span>
                              {isAdmin && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2.5 text-[10px] font-bold text-violet-600 border-violet-200 hover:bg-violet-50 hover:border-violet-300"
                                  onClick={() => handleAssignClick(period)}
                                >
                                  <UserCheck size={12} className="mr-1" /> Assign Sub
                                </Button>
                              )}
                            </>
                          ) : (
                            <div className="text-xs font-semibold text-slate-500 w-full">
                              <p className="text-[10px] text-slate-400">Assigned Substitute:</p>
                              <p className="text-slate-800 font-bold mt-0.5 truncate">
                                {period.substituteTeacher 
                                  ? `${period.substituteTeacher.firstName} ${period.substituteTeacher.lastName}`
                                  : (period.substituteTeacherId ? (teacherMap.get(period.substituteTeacherId) || `ID: ${period.substituteTeacherId.slice(0, 8)}...`) : <span className="text-slate-300 italic">—</span>)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AssignSubstituteDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        period={selectedPeriod}
      />
    </div>
  );
}
