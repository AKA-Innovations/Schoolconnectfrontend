'use client';

import React from 'react';
import { useTeacherList } from '../../hooks/useTeachers';
import { useMarkAttendance, useTeacherAttendance } from '../../hooks/useTeacherLeave';
import { AttendanceStatus } from '../../types/leave.types';
import { Button } from '../ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { CalendarDays, CheckCircle, Loader2, Users, ClipboardList } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function TeacherAttendanceManager() {
  const [selectedDate, setSelectedDate] = React.useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const { data: teacherData, isLoading: loadingTeachers } = useTeacherList({ page: 1, pageSize: 200 });
  const teachers = teacherData?.data || [];

  // Fetch all attendance for the chosen month/year to see existing marked states
  const parsedDate = React.useMemo(() => new Date(selectedDate), [selectedDate]);
  const year = parsedDate.getFullYear();
  const month = parsedDate.getMonth() + 1;

  // We can query all attendance records for this month/year.
  // Then we map them: teacherId -> status for the selectedDate.
  const { data: allAttendance = [], isLoading: loadingAttendance } = useTeacherAttendance(
    undefined, // fetch all teachers
    year,
    month
  );

  const markAttendanceMut = useMarkAttendance();

  // Create a mapping of teacherId -> Attendance Record for the selectedDate
  const currentDayAttendanceMap = React.useMemo(() => {
    const map = new Map<string, { status: AttendanceStatus; recordId: number }>();
    const selectedDateStr = new Date(selectedDate).toDateString();
    
    allAttendance.forEach((record) => {
      if (new Date(record.date).toDateString() === selectedDateStr) {
        map.set(record.teacherId, { status: record.status, recordId: record.id });
      }
    });
    return map;
  }, [allAttendance, selectedDate]);

  const [savingTeacherId, setSavingTeacherId] = React.useState<string | null>(null);

  const handleMarkStatus = async (teacherId: string, status: AttendanceStatus) => {
    const existing = currentDayAttendanceMap.get(teacherId);
    if (existing?.status === AttendanceStatus.ON_LEAVE) {
      toast.info('This teacher is on leave. Status is managed by the leave system.');
      return;
    }

    try {
      setSavingTeacherId(teacherId);
      await markAttendanceMut.mutateAsync({
        teacherId,
        date: selectedDate,
        status,
      });
      toast.success('Attendance updated');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update attendance');
    } finally {
      setSavingTeacherId(null);
    }
  };

  const handleMarkAllPresent = async () => {
    const unmarkedTeachers = teachers.filter((t) => {
      const state = currentDayAttendanceMap.get(t.id);
      return !state || (state.status !== AttendanceStatus.PRESENT && state.status !== AttendanceStatus.ON_LEAVE);
    });

    if (unmarkedTeachers.length === 0) {
      toast.info('All teachers are already marked present or on leave.');
      return;
    }

    toast.loading(`Marking ${unmarkedTeachers.length} teachers as Present...`, { id: 'bulk-mark' });

    try {
      // Loop and mark all as PRESENT in parallel
      await Promise.all(
        unmarkedTeachers.map((t) =>
          markAttendanceMut.mutateAsync({
            teacherId: t.id,
            date: selectedDate,
            status: AttendanceStatus.PRESENT,
          })
        )
      );
      toast.success(`Successfully marked all unmarked teachers present!`, { id: 'bulk-mark' });
    } catch (err) {
      toast.error('Failed to complete bulk attendance marking.', { id: 'bulk-mark' });
    }
  };

  const isLoading = loadingTeachers || loadingAttendance;

  return (
    <div className="space-y-6">
      {/* Date selector and Bulk Actions */}
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
            Marking attendance for <span className="font-bold text-slate-700">{new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </p>
        </div>

        <Button
          onClick={handleMarkAllPresent}
          disabled={isLoading || teachers.length === 0}
          variant="outline"
          size="sm"
          className="h-9 px-4 text-xs font-bold text-violet-600 border-violet-200 hover:bg-violet-50 hover:border-violet-300"
        >
          <CheckCircle size={14} className="mr-1.5" />
          Mark All Present
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-50 border border-slate-100 animate-pulse" />
          ))}
        </div>
      ) : teachers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <Users size={44} className="mx-auto text-slate-200 mb-3" />
          <p className="text-sm font-semibold text-slate-400">No teachers found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
            <div className="col-span-7">Teacher Details</div>
            <div className="col-span-5 text-right">Attendance Status</div>
          </div>

          {/* Teacher Rows */}
          <div className="divide-y divide-slate-100">
            {teachers.map((teacher, idx) => {
              const attendance = currentDayAttendanceMap.get(teacher.id);
              const currentStatus = attendance?.status;
              const isLeave = currentStatus === AttendanceStatus.ON_LEAVE;
              const isSaving = savingTeacherId === teacher.id;

              return (
                <motion.div
                  key={teacher.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50/50 transition-colors"
                >
                  {/* Name and Employee Details */}
                  <div className="col-span-7">
                    <p className="text-xs font-bold text-slate-800">
                      {teacher.firstName} {teacher.lastName}
                    </p>
                    {teacher.employeeId && (
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Emp ID: {teacher.employeeId}</p>
                    )}
                  </div>

                  {/* Radio buttons group status controls */}
                  <div className="col-span-5 flex items-center justify-end">
                    {isSaving ? (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-2">
                        <Loader2 size={13} className="animate-spin" />
                        <span>Updating...</span>
                      </div>
                    ) : isLeave ? (
                      <span className="text-[10px] text-amber-600 font-bold bg-amber-50 border border-amber-100/50 px-2.5 py-1 rounded-xl">
                        On Leave
                      </span>
                    ) : (
                      <div className="flex items-center border border-slate-100 bg-slate-50 p-1.0 rounded-xl overflow-hidden">
                        {/* Present Option */}
                        <button
                          type="button"
                          onClick={() => handleMarkStatus(teacher.id, AttendanceStatus.PRESENT)}
                          className={cn(
                            "px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer",
                            currentStatus === AttendanceStatus.PRESENT
                              ? "bg-white text-emerald-600 shadow-sm border border-slate-100/30"
                              : "text-slate-400 hover:text-slate-600"
                          )}
                        >
                          Present
                        </button>
                        {/* Absent Option */}
                        <button
                          type="button"
                          onClick={() => handleMarkStatus(teacher.id, AttendanceStatus.ABSENT)}
                          className={cn(
                            "px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer",
                            currentStatus === AttendanceStatus.ABSENT
                              ? "bg-white text-red-500 shadow-sm border border-slate-100/30"
                              : "text-slate-400 hover:text-slate-600"
                          )}
                        >
                          Absent
                        </button>
                        {/* Half Day Option */}
                        <button
                          type="button"
                          onClick={() => handleMarkStatus(teacher.id, AttendanceStatus.HALF_DAY)}
                          className={cn(
                            "px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer",
                            currentStatus === AttendanceStatus.HALF_DAY
                              ? "bg-white text-blue-500 shadow-sm border border-slate-100/30"
                              : "text-slate-400 hover:text-slate-600"
                          )}
                        >
                          Half Day
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
