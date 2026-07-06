'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useLeaveList, useCancelLeave, useRevokeLeave } from '../../hooks/useTeacherLeave';
import { useTeacherList } from '../../hooks/useTeachers';
import { useAuthStore } from '../../store/authStore';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { LeaveStatus, type ListLeaveFilters, type TeacherLeave } from '../../types/leave.types';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { toast } from 'sonner';
import { CalendarDays, X, Check, XCircle, Clock, FileText, Search, RotateCcw } from 'lucide-react';
import { cn } from '../../lib/utils';

const statusBadge: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'; label: string }> = {
  PENDING: { variant: 'warning', label: 'Pending' },
  APPROVED: { variant: 'success', label: 'Approved' },
  REJECTED: { variant: 'destructive', label: 'Rejected' },
  CANCELLED: { variant: 'secondary', label: 'Cancelled' },
};

const leaveTypeLabel: Record<string, string> = {
  CASUAL: 'Casual',
  SICK: 'Sick',
  EARNED: 'Earned',
  HALF_DAY: 'Half Day',
  EMERGENCY: 'Emergency',
};

interface LeaveRequestsTableProps {
  /** If provided, restricts to this teacher's leaves only */
  teacherId?: string;
  /** Admin mode: shows teacher name column + approve/reject actions */
  isAdmin?: boolean;
  /** Called when admin clicks approve on a leave */
  onApprove?: (leave: TeacherLeave) => void;
  /** Called when admin clicks reject on a leave */
  onReject?: (leave: TeacherLeave) => void;
  /** Filters */
  filters?: ListLeaveFilters;
}

export function LeaveRequestsTable({ teacherId, isAdmin, onApprove, onReject, filters }: LeaveRequestsTableProps) {
  const [statusFilter, setStatusFilter] = React.useState<string>('');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [startDateFilter, setStartDateFilter] = React.useState<string>('');
  const [endDateFilter, setEndDateFilter] = React.useState<string>('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  const queryFilters: ListLeaveFilters = {
    ...filters,
    ...(teacherId ? { teacherId } : {}),
    ...(statusFilter ? { status: statusFilter as LeaveStatus } : {}),
    ...(startDateFilter ? { startDate: startDateFilter } : {}),
    ...(endDateFilter ? { endDate: endDateFilter } : {}),
  };

  const schoolId = useAuthStore((s) => s.schoolId);
  const { data: teachersData } = useTeacherList(
    { schoolId: schoolId || '', page: 1, pageSize: 500 },
    { enabled: !!isAdmin }
  );
  const teachers = teachersData?.data || [];

  const teacherMap = React.useMemo(() => {
    const map = new Map<string, string>();
    teachers.forEach((t) => {
      map.set(t.id, `${t.firstName} ${t.lastName}`);
    });
    return map;
  }, [teachers]);

  const { data: leaves = [], isLoading } = useLeaveList(queryFilters);
  const cancelLeave = useCancelLeave();
  const revokeLeave = useRevokeLeave();

  const handleCancel = async (id: number) => {
    try {
      await cancelLeave.mutateAsync(id);
      toast.success('Leave request cancelled');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to cancel leave');
    }
  };

  const handleRevoke = async (id: number) => {
    try {
      await revokeLeave.mutateAsync(id);
      toast.success('Leave request revoked successfully');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to revoke leave');
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Client-side quick filter search
  const filteredLeaves = React.useMemo(() => {
    return leaves.filter((leave) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const teacherName = leave.teacher
          ? `${leave.teacher.firstName} ${leave.teacher.lastName}`.toLowerCase()
          : (teacherMap.get(leave.teacherId) || '').toLowerCase();
        const reason = (leave.reason || '').toLowerCase();
        const leaveType = (leaveTypeLabel[leave.leaveType] || leave.leaveType || '').toLowerCase();
        if (!teacherName.includes(query) && !reason.includes(query) && !leaveType.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [leaves, searchQuery, teacherMap]);

  // Pagination calculations
  const totalItems = filteredLeaves.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedLeaves = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredLeaves.slice(startIndex, startIndex + pageSize);
  }, [filteredLeaves, currentPage, pageSize]);

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

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 rounded-xl bg-slate-50 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Quick Search */}
          <div className="relative min-w-[240px] flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search teacher, reason, type..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 pl-9 pr-4 w-full rounded-xl border border-slate-200/80 bg-white text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Status Filter */}
          <div className="w-40">
            <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}>
              <SelectTrigger className="h-10 rounded-xl border-slate-200 text-xs font-semibold text-slate-600">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date range filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => {
                  setStartDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 pl-9 pr-4 rounded-xl border border-slate-200/80 bg-white text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
              />
            </div>
            <span className="text-xs text-slate-400 font-semibold">to</span>
            <div className="relative">
              <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => {
                  setEndDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 pl-9 pr-4 rounded-xl border border-slate-200/80 bg-white text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
              />
            </div>
            {(startDateFilter || endDateFilter) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStartDateFilter('');
                  setEndDateFilter('');
                  setCurrentPage(1);
                }}
                className="h-8 px-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg"
              >
                Clear Dates
              </Button>
            )}
          </div>
        </div>
      </div>

      {filteredLeaves.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm"
        >
          <FileText size={40} className="mx-auto text-slate-200 mb-3" />
          <p className="text-sm font-semibold text-slate-400">No leave requests found</p>
          <p className="text-xs text-slate-300 mt-1">
            {teacherId ? "You haven't applied for any leave yet" : "No leave requests match the filters"}
          </p>
        </motion.div>
      ) : (
        <div className="rounded-2xl border border-slate-100 overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80">
                {isAdmin && <TableHead>Teacher</TableHead>}
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLeaves.map((leave, index) => {
                const status = statusBadge[leave.status] || { variant: 'outline' as const, label: leave.status };
                return (
                  <motion.tr
                    key={leave.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b transition-colors hover:bg-slate-50/50"
                  >
                    {isAdmin && (
                      <TableCell className="font-semibold text-slate-700">
                        {leave.teacher
                          ? `${leave.teacher.firstName} ${leave.teacher.lastName}`
                          : (teacherMap.get(leave.teacherId) || leave.teacherId?.slice(0, 8) + '...')
                        }
                      </TableCell>
                    )}
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600">
                        <CalendarDays size={13} className="text-slate-400" />
                        {leaveTypeLabel[leave.leaveType] || leave.leaveType}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-semibold text-slate-600">
                        {formatDate(leave.startDate)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        to {formatDate(leave.endDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-500 line-clamp-2 max-w-[200px]" title={leave.reason}>
                        {leave.reason}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isAdmin && leave.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2.5 text-[10px] font-bold text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                              onClick={() => onApprove?.(leave)}
                            >
                              <Check size={12} className="mr-1" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2.5 text-[10px] font-bold text-red-500 border-red-200 hover:bg-red-50"
                              onClick={() => onReject?.(leave)}
                            >
                              <XCircle size={12} className="mr-1" /> Reject
                            </Button>
                          </>
                        )}
                        {!isAdmin && leave.status === 'PENDING' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2.5 text-[10px] font-bold text-slate-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50"
                            onClick={() => handleCancel(leave.id)}
                            disabled={cancelLeave.isPending}
                          >
                            <X size={12} className="mr-1" /> Cancel
                          </Button>
                        )}
                        {!isAdmin && leave.status === 'APPROVED' && new Date(leave.endDate).setHours(0,0,0,0) >= new Date().setHours(0,0,0,0) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2.5 text-[10px] font-bold text-slate-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50"
                            onClick={() => handleRevoke(leave.id)}
                            disabled={revokeLeave.isPending}
                          >
                            <RotateCcw size={12} className="mr-1" /> Revoke
                          </Button>
                        )}
                        {leave.status === 'REJECTED' && leave.rejectionReason && (
                          <span className="text-[10px] text-red-400 italic max-w-[120px] truncate" title={leave.rejectionReason}>
                            {leave.rejectionReason}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>

          {/* Premium Pagination Bar */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 px-6 py-4 bg-slate-50/50 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-semibold">
                Showing <span className="font-bold text-slate-700">{Math.min((currentPage - 1) * pageSize + 1, totalItems)}</span> to{' '}
                <span className="font-bold text-slate-700">{Math.min(currentPage * pageSize, totalItems)}</span> of{' '}
                <span className="font-bold text-slate-700">{totalItems}</span> leaves
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
