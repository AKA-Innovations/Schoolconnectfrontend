'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { LeaveType } from '../../types/leave.types';
import { useApplyLeave } from '../../hooks/useTeacherLeave';
import { CURRENT_SESSION } from '../../lib/constants';
import { toast } from 'sonner';
import { CalendarDays, FileText, Send } from 'lucide-react';

interface LeaveRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeaveRequestForm({ open, onOpenChange }: LeaveRequestFormProps) {
  const [leaveType, setLeaveType] = React.useState<string>('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const applyLeave = useApplyLeave();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!leaveType) errs.leaveType = 'Leave type is required';
    if (!startDate) errs.startDate = 'Start date is required';
    if (!endDate) errs.endDate = 'End date is required';
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      errs.endDate = 'End date cannot be before start date';
    }
    if (!reason.trim()) errs.reason = 'Reason is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await applyLeave.mutateAsync({
        session: CURRENT_SESSION,
        leaveType: leaveType as LeaveType,
        startDate,
        endDate,
        reason: reason.trim(),
      });
      toast.success('Leave application submitted successfully');
      onOpenChange(false);
      resetForm();
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to submit leave application';
      toast.error(message);
    }
  };

  const resetForm = () => {
    setLeaveType('');
    setStartDate('');
    setEndDate('');
    setReason('');
    setErrors({});
  };

  const leaveTypeOptions = [
    { value: LeaveType.CASUAL, label: 'Casual Leave' },
    { value: LeaveType.SICK, label: 'Sick Leave' },
    { value: LeaveType.EARNED, label: 'Earned Leave' },
    { value: LeaveType.HALF_DAY, label: 'Half Day' },
    { value: LeaveType.EMERGENCY, label: 'Emergency Leave' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <FileText size={16} className="text-white" />
            </div>
            Apply for Leave
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Leave Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Leave Type</label>
            <Select value={leaveType} onValueChange={setLeaveType}>
              <SelectTrigger>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                {leaveTypeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.leaveType && <p className="text-xs text-red-500 mt-1">{errors.leaveType}</p>}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Start Date</label>
              <div className="relative">
                <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200/80 bg-white text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                />
              </div>
              {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">End Date</label>
              <div className="relative">
                <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || undefined}
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200/80 bg-white text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                />
              </div>
              {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Describe the reason for your leave..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white text-xs font-semibold text-slate-600 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-none"
            />
            {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason}</p>}
          </div>

          {/* Session info */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
            <CalendarDays size={14} className="text-slate-400" />
            <span className="text-xs text-slate-500">Session: <span className="font-bold text-slate-700">{CURRENT_SESSION}</span></span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => { onOpenChange(false); resetForm(); }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
              disabled={applyLeave.isPending}
            >
              {applyLeave.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send size={14} />
                  Submit
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
