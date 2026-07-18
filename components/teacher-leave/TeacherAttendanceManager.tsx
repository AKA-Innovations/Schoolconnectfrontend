'use client';

import React from 'react';
import { useTeacherList } from '../../hooks/useTeachers';
import { useMarkAttendance, useTeacherAttendanceForDay } from '../../hooks/useTeacherLeave';
import { AttendanceStatus } from '../../types/leave.types';
import { Button } from '../ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { DatePicker } from '../ui/datepicker';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { CalendarDays, CheckCircle, Loader2, Users, ClipboardList, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function TeacherAttendanceManager() {
  const [selectedDate, setSelectedDate] = React.useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('ALL');
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  const { data: teacherData, isLoading: loadingTeachers } = useTeacherList({ page: 1, pageSize: 200 });
  const teachers = teacherData?.data || [];

  // Fetch all attendance for the chosen date to see existing marked states
  const { data: dayAttendance = [], isLoading: loadingAttendance } = useTeacherAttendanceForDay(selectedDate);

  const markAttendanceMut = useMarkAttendance();

  // Create a mapping of teacherId -> Attendance Record for the selectedDate
  const currentDayAttendanceMap = React.useMemo(() => {
    const map = new Map<string, { status: AttendanceStatus; recordId: number }>();
    
    dayAttendance.forEach((record) => {
      map.set(record.teacherId, { status: record.status, recordId: record.id });
    });
    return map;
  }, [dayAttendance]);

  const [savingTeacherId, setSavingTeacherId] = React.useState<string | null>(null);

  // Client-side quick filters and search
  const filteredTeachers = React.useMemo(() => {
    return teachers.filter((teacher) => {
      const fullName = `${teacher.firstName} ${teacher.lastName}`.toLowerCase();
      const empId = (teacher.employeeId || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      if (searchQuery && !fullName.includes(query) && !empId.includes(query)) {
        return false;
      }

      if (statusFilter !== 'ALL') {
        const attendance = currentDayAttendanceMap.get(teacher.id);
        const status = attendance?.status;
        
        if (statusFilter === 'UNMARKED') {
          return !status;
        } else {
          return status === statusFilter;
        }
      }

      return true;
    });
  }, [teachers, searchQuery, statusFilter, currentDayAttendanceMap]);

  // Pagination calculations
  const totalItems = filteredTeachers.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedTeachers = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredTeachers.slice(startIndex, startIndex + pageSize);
  }, [filteredTeachers, currentPage]);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('...');
      }
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    return pages;
  };

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
    const unmarkedTeachers = filteredTeachers.filter((t) => {
      const state = currentDayAttendanceMap.get(t.id);
      return !state || (state.status !== AttendanceStatus.PRESENT && state.status !== AttendanceStatus.ON_LEAVE);
    });

    if (unmarkedTeachers.length === 0) {
      toast.info('All filtered teachers are already marked present or on leave.');
      return;
    }

    toast.loading(`Marking ${unmarkedTeachers.length} teachers as Present...`, { id: 'bulk-mark' });

    try {
      await Promise.all(
        unmarkedTeachers.map((t) =>
          markAttendanceMut.mutateAsync({
            teacherId: t.id,
            date: selectedDate,
            status: AttendanceStatus.PRESENT,
          })
        )
      );
      toast.success(`Successfully marked all unmarked filtered teachers present!`, { id: 'bulk-mark' });
    } catch (err) {
      toast.error('Failed to complete bulk attendance marking.', { id: 'bulk-mark' });
    }
  };

  const isLoading = loadingTeachers || loadingAttendance;

  return (
    <div className="space-y-6">
      {/* Date selector, Search, and Bulk Actions Bar */}
      <div className="flex flex-col gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <DatePicker
              value={selectedDate}
              onChange={(val) => {
                setSelectedDate(val);
                setCurrentPage(1);
              }}
              placeholder="Select Date"
              className="w-40 font-semibold"
            />
            <p className="text-xs text-slate-500">
              Marking attendance for <span className="font-bold text-slate-700">{new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </p>
          </div>

          <Button
            onClick={handleMarkAllPresent}
            disabled={isLoading || filteredTeachers.length === 0}
            variant="outline"
            size="sm"
            className="h-9 px-4 text-xs font-bold text-violet-600 border-violet-200 hover:bg-violet-50 hover:border-violet-300 transition-all"
          >
            <CheckCircle size={14} className="mr-1.5" />
            Mark All Present
          </Button>
        </div>

        {/* Quick Search and Status Filter Row */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 border-t border-slate-100 pt-4">
          {/* Quick Search */}
          <div className="relative min-w-[240px] flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search teacher name or Emp ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 pl-9 pr-4 w-full rounded-xl border border-slate-200/80 bg-white text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Attendance Status Filter */}
          <div className="w-44">
            <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}>
              <SelectTrigger className="h-10 rounded-xl border-slate-200 text-xs font-semibold text-slate-600 bg-white">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="PRESENT">Present</SelectItem>
                <SelectItem value="ABSENT">Absent</SelectItem>
                <SelectItem value="HALF_DAY">Half Day</SelectItem>
                <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                <SelectItem value="UNMARKED">Unmarked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-50 border border-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Users size={44} className="mx-auto text-slate-200 mb-3" />
          <p className="text-sm font-semibold text-slate-400">No teachers found matching the criteria</p>
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
            {paginatedTeachers.map((teacher, idx) => {
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

          {/* Premium Pagination Bar */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 px-6 py-4 bg-slate-50/50 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-semibold">
                Showing <span className="font-bold text-slate-700">{Math.min((currentPage - 1) * pageSize + 1, totalItems)}</span> to{' '}
                <span className="font-bold text-slate-700">{Math.min(currentPage * pageSize, totalItems)}</span> of{' '}
                <span className="font-bold text-slate-700">{totalItems}</span> teachers
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="h-8 px-3 text-xs font-bold border-slate-200 text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-50"
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, i) => {
                    if (page === '...') {
                      return (
                        <span key={`dots-${i}`} className="px-2 text-xs text-slate-400 font-bold">
                          ...
                        </span>
                      );
                    }
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setCurrentPage(page as number)}
                        className={cn(
                          "h-8 w-8 text-xs font-bold rounded-lg",
                          currentPage === page
                            ? "bg-violet-600 hover:bg-violet-700 text-white shadow-sm"
                            : "text-slate-600 hover:bg-white hover:shadow-sm"
                        )}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="h-8 px-3 text-xs font-bold border-slate-200 text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
