'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useApproveLeave, useRejectLeave } from '../../hooks/useTeacherLeave';
import type { TeacherLeave } from '../../types/leave.types';
import { toast } from 'sonner';
import { Check, XCircle, CalendarDays, User, FileText } from 'lucide-react';

interface LeaveApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leave: TeacherLeave | null;
  mode: 'approve' | 'reject';
}

const leaveTypeLabel: Record<string, string> = {
  CASUAL: 'Casual Leave',
  SICK: 'Sick Leave',
  EARNED: 'Earned Leave',
  HALF_DAY: 'Half Day',
  EMERGENCY: 'Emergency Leave',
};

export function LeaveApprovalDialog({ open, onOpenChange, leave, mode }: LeaveApprovalDialogProps) {
  const [notes, setNotes] = React.useState('');
  const [rejectionReason, setRejectionReason] = React.useState('');

  const approveLeave = useApproveLeave();
  const rejectLeave = useRejectLeave();

  const isPending = approveLeave.isPending || rejectLeave.isPending;

  const handleSubmit = async () => {
    if (!leave) return;

    try {
      if (mode === 'approve') {
        await approveLeave.mutateAsync({ id: leave.id, dto: notes ? { notes } : undefined });
        toast.success('Leave approved — substitute periods generated');
      } else {
        if (!rejectionReason.trim()) {
          toast.error('Please provide a rejection reason');
          return;
        }
        await rejectLeave.mutateAsync({ id: leave.id, dto: { rejectionReason: rejectionReason.trim() } });
        toast.success('Leave rejected');
      }
      onOpenChange(false);
      setNotes('');
      setRejectionReason('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || `Failed to ${mode} leave`);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  if (!leave) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              mode === 'approve'
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                : 'bg-gradient-to-br from-red-500 to-rose-600'
            }`}>
              {mode === 'approve' ? <Check size={16} className="text-white" /> : <XCircle size={16} className="text-white" />}
            </div>
            {mode === 'approve' ? 'Approve Leave' : 'Reject Leave'}
          </DialogTitle>
        </DialogHeader>

        {/* Leave Summary */}
        <div className="space-y-3 mt-2">
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-xs">
              <User size={13} className="text-slate-400" />
              <span className="font-semibold text-slate-600">
                {leave.teacher
                  ? `${leave.teacher.firstName} ${leave.teacher.lastName}`
                  : 'Teacher'
                }
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <FileText size={13} className="text-slate-400" />
              <span className="font-semibold text-slate-600">{leaveTypeLabel[leave.leaveType] || leave.leaveType}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <CalendarDays size={13} className="text-slate-400" />
              <span className="font-semibold text-slate-600">
                {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
              </span>
            </div>
            <div className="text-xs text-slate-500 pt-1 border-t border-slate-100">
              <span className="font-semibold text-slate-400">Reason:</span> {leave.reason}
            </div>
          </div>

          {/* Approve: optional notes */}
          {mode === 'approve' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Any notes for this approval..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white text-xs font-semibold text-slate-600 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
              />
              <p className="text-[10px] text-amber-500 mt-2 font-medium">
                ⚡ Approving will deduct leave balance, mark attendance as ON_LEAVE, and generate substitute period slots.
              </p>
            </div>
          )}

          {/* Reject: required reason */}
          {mode === 'reject' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Rejection Reason *</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="Provide a reason for rejection..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white text-xs font-semibold text-slate-600 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className={`flex-1 text-white ${
                mode === 'approve'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
                  : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700'
              }`}
              onClick={handleSubmit}
              disabled={isPending}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                  Processing...
                </span>
              ) : (
                mode === 'approve' ? 'Approve Leave' : 'Reject Leave'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
