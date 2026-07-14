'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTeacherList } from '@/hooks/useTeachers';
import { useMarkAttendance, useTeacherAttendanceForDay } from '@/hooks/useTeacherLeave';
import { AttendanceStatus } from '@/types/leave.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CalendarDays, CheckCircle, Search, Users, UserCheck, UserX, Clock, Calendar } from 'lucide-react';

const COLORS = {
  PRESENT: '#10b981', // emerald-500
  ABSENT: '#f43f5e',  // rose-500
  HALF_DAY: '#f59e0b',    // amber-500
  ON_LEAVE: '#3b82f6', // blue-500
  UNMARKED: '#94a3b8', // slate-400
};

export function TeacherAttendanceAnalytics() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const { data: teacherData, isLoading: loadingTeachers } = useTeacherList({ page: 1, pageSize: 200 });
  const teachers = useMemo(() => teacherData?.data || [], [teacherData]);

  // Fetch all attendance for the chosen date
  const { data: dayAttendance = [], isLoading: loadingAttendance } = useTeacherAttendanceForDay(selectedDate);
  const markAttendanceMut = useMarkAttendance();

  // Create a mapping of teacherId -> Attendance Record
  const currentDayAttendanceMap = useMemo(() => {
    const map = new Map<string, { status: AttendanceStatus; recordId: number }>();
    dayAttendance.forEach((record) => {
      map.set(record.teacherId, { status: record.status, recordId: record.id });
    });
    return map;
  }, [dayAttendance]);

  const [savingTeacherId, setSavingTeacherId] = useState<string | null>(null);

  // Compute analytics based on actual fetched data
  const stats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let halfDay = 0;
    let onLeave = 0;
    let unmarked = 0;

    teachers.forEach((t) => {
      const record = currentDayAttendanceMap.get(t.id);
      if (!record) {
        unmarked++;
      } else {
        switch (record.status) {
          case AttendanceStatus.PRESENT:
            present++;
            break;
          case AttendanceStatus.ABSENT:
            absent++;
            break;
          case AttendanceStatus.HALF_DAY:
            halfDay++;
            break;
          case AttendanceStatus.ON_LEAVE:
            onLeave++;
            break;
          default:
            unmarked++;
        }
      }
    });

    const total = teachers.length;
    const marked = total - unmarked;
    const rate = marked > 0 ? ((present + halfDay) / marked) * 100 : 0;

    return { total, present, absent, halfDay, onLeave, unmarked, rate };
  }, [teachers, currentDayAttendanceMap]);

  // Chart data for Recharts Pie
  const chartData = useMemo(() => {
    return [
      { name: 'Present', value: stats.present, color: COLORS.PRESENT },
      { name: 'Half Day', value: stats.halfDay, color: COLORS.HALF_DAY },
      { name: 'Absent', value: stats.absent, color: COLORS.ABSENT },
      { name: 'On Leave', value: stats.onLeave, color: COLORS.ON_LEAVE },
      { name: 'Unmarked', value: stats.unmarked, color: COLORS.UNMARKED },
    ].filter(item => item.value > 0);
  }, [stats]);

  // Client-side quick filters and search
  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const fullName = `${teacher.firstName} ${teacher.lastName}`.toLowerCase();
      const empId = (teacher.employeeId || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      
      if (searchQuery && !fullName.includes(query) && !empId.includes(query)) {
        return false;
      }

      if (statusFilter !== 'ALL') {
        const record = currentDayAttendanceMap.get(teacher.id);
        const status = record?.status;
        
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

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedTeachers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredTeachers.slice(startIndex, startIndex + pageSize);
  }, [filteredTeachers, currentPage]);

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
      toast.success('Attendance updated successfully');
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

    const tId = toast.loading(`Marking ${unmarkedTeachers.length} teachers as Present...`);

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
      toast.success(`Marked all unmarked filtered teachers present!`, { id: tId });
    } catch (err) {
      toast.error('Failed to complete bulk attendance marking.', { id: tId });
    }
  };

  const isLoading = loadingTeachers || loadingAttendance;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Attendance Stats Dashboard Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI panel */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <Card className="rounded-2xl border-border bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/10">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Present Today</span>
                <p className="text-3xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                  {stats.present + stats.halfDay}
                </p>
                <span className="text-xs text-muted-foreground">Incl. {stats.halfDay} half days</span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <UserCheck className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border bg-gradient-to-br from-rose-50/50 to-transparent dark:from-rose-950/10">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Absent Today</span>
                <p className="text-3xl font-black tracking-tight text-rose-600 dark:text-rose-400">
                  {stats.absent}
                </p>
                <span className="text-xs text-muted-foreground">{stats.onLeave} on approved leaves</span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <UserX className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Staff</span>
                <p className="text-3xl font-black tracking-tight">{stats.total}</p>
                <span className="text-xs text-muted-foreground">Active faculty registry</span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                <Users className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Attendance Rate</span>
                <p className="text-3xl font-black tracking-tight">{stats.rate.toFixed(0)}%</p>
                <span className="text-xs text-muted-foreground">{stats.unmarked} unmarked staff</span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                <Clock className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pie Chart Card */}
        <Card className="rounded-2xl border-border">
          <CardHeader className="p-5 pb-0">
            <CardTitle className="text-sm font-bold">Faculty Attendance Ratio</CardTitle>
            <CardDescription className="text-[10px]">Today's distribution summary</CardDescription>
          </CardHeader>
          <CardContent className="p-5 flex items-center justify-center">
            {chartData.length === 0 ? (
              <div className="h-[140px] flex items-center justify-center text-xs text-muted-foreground">
                No attendance data logged yet.
              </div>
            ) : (
              <div className="h-[140px] w-full flex items-center">
                <div className="h-[140px] w-1/2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={55}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-1 text-[10px] font-semibold pl-2">
                  {chartData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}:</span>
                      <span className="text-foreground ml-auto">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Date selector, Search, and Bulk Actions Bar */}
      <div className="flex flex-col gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 pl-9 pr-4 rounded-xl border border-border bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Logging attendance for <span className="font-bold text-foreground">{new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </p>
          </div>

          <Button
            onClick={handleMarkAllPresent}
            disabled={isLoading || filteredTeachers.length === 0}
            variant="outline"
            className="h-10 px-4 text-xs font-bold text-primary border-primary/20 hover:bg-primary/5 transition-all rounded-xl"
          >
            <CheckCircle size={14} className="mr-1.5" />
            Mark All Present
          </Button>
        </div>

        {/* Quick Search and Status Filter Row */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 border-t border-border pt-4">
          <div className="relative min-w-[240px] flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search teacher name or Emp ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 pl-9 pr-4 w-full rounded-xl border border-border bg-background text-xs font-semibold text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="w-44">
            <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}>
              <SelectTrigger className="h-10 rounded-xl border-border text-xs font-semibold text-foreground bg-background">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="PRESENT">Present</SelectItem>
                <SelectItem value="HALF_DAY">Half Day</SelectItem>
                <SelectItem value="ABSENT">Absent</SelectItem>
                <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                <SelectItem value="UNMARKED">Unmarked Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table list */}
        <Card className="rounded-2xl border-border shadow-none overflow-hidden mt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/50 bg-muted/10">
                  <th className="px-6 py-3.5 text-left font-bold text-muted-foreground uppercase tracking-widest">Teacher ID & Name</th>
                  <th className="px-6 py-3.5 text-left font-bold text-muted-foreground uppercase tracking-widest">Mobile Number</th>
                  <th className="px-6 py-3.5 text-left font-bold text-muted-foreground uppercase tracking-widest">Current Status</th>
                  <th className="px-6 py-3.5 text-right font-bold text-muted-foreground uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      Refreshing teacher records...
                    </td>
                  </tr>
                ) : paginatedTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      No teachers found.
                    </td>
                  </tr>
                ) : (
                  paginatedTeachers.map((t) => {
                    const record = currentDayAttendanceMap.get(t.id);
                    const status = record?.status;
                    const isSaving = savingTeacherId === t.id;

                    return (
                      <tr key={t.id} className="hover:bg-muted/2 transition-colors">
                        <td className="px-6 py-3.5">
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground text-sm">
                              {t.firstName} {t.lastName}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              ID: {t.employeeId || t.id.slice(0, 8)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-muted-foreground font-medium">
                          {t.mobileNumber || '—'}
                        </td>
                        <td className="px-6 py-3.5">
                          {status === AttendanceStatus.PRESENT ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-0 shadow-none">Present</Badge>
                          ) : status === AttendanceStatus.ABSENT ? (
                            <Badge className="bg-rose-500/10 text-rose-600 border-0 shadow-none">Absent</Badge>
                          ) : status === AttendanceStatus.HALF_DAY ? (
                            <Badge className="bg-amber-500/10 text-amber-600 border-0 shadow-none">Half Day</Badge>
                          ) : status === AttendanceStatus.ON_LEAVE ? (
                            <Badge className="bg-blue-500/10 text-blue-600 border-0 shadow-none">On Leave</Badge>
                          ) : (
                            <Badge className="bg-slate-500/10 text-slate-500 border-0 shadow-none">Not Logged</Badge>
                          )}
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              disabled={isSaving || status === AttendanceStatus.ON_LEAVE}
                              onClick={() => handleMarkStatus(t.id, AttendanceStatus.PRESENT)}
                              className="h-8 px-2.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 text-[10px] font-bold"
                            >
                              Present
                            </Button>
                            <Button
                              variant="ghost"
                              disabled={isSaving || status === AttendanceStatus.ON_LEAVE}
                              onClick={() => handleMarkStatus(t.id, AttendanceStatus.HALF_DAY)}
                              className="h-8 px-2.5 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50 text-[10px] font-bold"
                            >
                              Half Day
                            </Button>
                            <Button
                              variant="ghost"
                              disabled={isSaving || status === AttendanceStatus.ON_LEAVE}
                              onClick={() => handleMarkStatus(t.id, AttendanceStatus.ABSENT)}
                              className="h-8 px-2.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-[10px] font-bold"
                            >
                              Absent
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-2">
            <span className="text-[10px] text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalItems)} of {totalItems} teachers
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-8 text-[10px] font-bold rounded-lg"
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="h-8 text-[10px] font-bold rounded-lg"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
