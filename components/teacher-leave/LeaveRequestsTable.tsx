'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useLeaveList, useCancelLeave } from '../../hooks/useTeacherLeave';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { LeaveStatus, type ListLeaveFilters, type TeacherLeave } from '../../types/leave.types';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { toast } from 'sonner';
import { CalendarDays, X, Check, XCircle, Clock, FileText } from 'lucide-react';

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

  const queryFilters: ListLeaveFilters = {
    ...filters,
    ...(teacherId ? { teacherId } : {}),
    ...(statusFilter ? { status: statusFilter as LeaveStatus } : {}),
  };

  const { data: leaves = [], isLoading } = useLeaveList(queryFilters);
  const cancelLeave = useCancelLeave();

  const handleCancel = async (id: number) => {
    try {
      await cancelLeave.mutateAsync(id);
      toast.success('Leave request cancelled');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to cancel leave');
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
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
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
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
      </div>

      {leaves.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <FileText size={40} className="mx-auto text-slate-200 mb-3" />
          <p className="text-sm font-semibold text-slate-400">No leave requests found</p>
          <p className="text-xs text-slate-300 mt-1">
            {teacherId ? "You haven't applied for any leave yet" : "No leave requests match the filters"}
          </p>
        </motion.div>
      ) : (
        <div className="rounded-2xl border border-slate-100 overflow-hidden bg-white">
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
              {leaves.map((leave, index) => {
                const status = statusBadge[leave.status] || { variant: 'outline' as const, label: leave.status };
                return (
                  <motion.tr
                    key={leave.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b transition-colors hover:bg-slate-50/50"
                  >
                    {isAdmin && (
                      <TableCell className="font-semibold text-slate-700">
                        {leave.teacher
                          ? `${leave.teacher.firstName} ${leave.teacher.lastName}`
                          : leave.teacherId?.slice(0, 8) + '...'
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
                      <span className="text-xs text-slate-500 line-clamp-2 max-w-[200px]">
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
        </div>
      )}
    </div>
  );
}
