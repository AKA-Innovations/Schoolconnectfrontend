'use client';
 
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { LeaveType } from '../../types/leave.types';
import { useApplyLeave, useLeaveList } from '../../hooks/useTeacherLeave';
import { useTeacherList } from '../../hooks/useTeachers';
import { useAuthStore } from '../../store/authStore';
import { CURRENT_SESSION } from '../../lib/constants';
import { toast } from 'sonner';
import { CalendarDays, FileText, Send, ChevronLeft, ChevronRight } from 'lucide-react';
 
interface LeaveRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin?: boolean;
}
 
export function LeaveRequestForm({ open, onOpenChange, isAdmin }: LeaveRequestFormProps) {
  const user = useAuthStore((s) => s.user);
  const [selectedTeacherId, setSelectedTeacherId] = React.useState<string>('');
  const [leaveType, setLeaveType] = React.useState<string>('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});
 
  // Calendar navigation state
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
 
  const applyLeave = useApplyLeave();

  // Fetch teachers list for Admin dropdown
  const { data: teacherData } = useTeacherList(
    { page: 1, pageSize: 200 },
    { enabled: !!isAdmin && open }
  );
  const teachersList = teacherData?.data || [];
  
  // Fetch existing leaves to show on the calendar
  const { data: leaves = [] } = useLeaveList(
    { teacherId: isAdmin ? selectedTeacherId : user?.id },
    { enabled: isAdmin ? !!selectedTeacherId && open : !!user?.id && open }
  );
 
  const takenDates = React.useMemo(() => {
    const dates = new Set<string>();
    leaves.forEach((leave) => {
      if (leave.status === 'APPROVED' || leave.status === 'PENDING') {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        const curr = new Date(start);
        while (curr <= end) {
          dates.add(curr.toISOString().split('T')[0]);
          curr.setDate(curr.getDate() + 1);
        }
      }
    });
    return dates;
  }, [leaves]);
 
  const validate = () => {
    const errs: Record<string, string> = {};
    if (isAdmin && !selectedTeacherId) errs.teacherId = 'Staff member is required';
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
        teacherId: isAdmin ? selectedTeacherId : undefined,
      });
      toast.success(isAdmin ? 'Leave recorded successfully' : 'Leave application submitted successfully');
      onOpenChange(false);
      resetForm();
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to submit leave application';
      toast.error(message);
    }
  };
 
  const resetForm = () => {
    setSelectedTeacherId('');
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

  // Calendar generation helpers
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const daysInMonth = React.useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [currentMonth]);

  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cellDate = new Date(date);
    cellDate.setHours(0, 0, 0, 0);
    if (cellDate < today) {
      return;
    }

    // Check if the clicked date itself is already taken
    if (takenDates.has(dateStr)) {
      toast.error('This date is already taken by another leave request.');
      return;
    }

    if (!startDate || (startDate && endDate)) {
      // First click
      setStartDate(dateStr);
      setEndDate('');
    } else {
      // Second click
      const start = new Date(startDate);
      if (date < start) {
        setStartDate(dateStr);
        setEndDate('');
      } else {
        // Check if any taken dates are in the range [startDate, clickedDate]
        let hasConflict = false;
        const curr = new Date(start);
        while (curr <= date) {
          if (takenDates.has(curr.toISOString().split('T')[0])) {
            hasConflict = true;
            break;
          }
          curr.setDate(curr.getDate() + 1);
        }

        if (hasConflict) {
          toast.error('The selected range overlaps with existing leaves.');
          setStartDate(dateStr);
          setEndDate('');
        } else {
          setEndDate(dateStr);
        }
      }
    }
  };

  const getDayClass = (date: Date | null) => {
    if (!date) return 'invisible';
    const dateStr = date.toISOString().split('T')[0];
    const isToday = new Date().toISOString().split('T')[0] === dateStr;
    const isTaken = takenDates.has(dateStr);
    const isStart = startDate === dateStr;
    const isEnd = endDate === dateStr;
    const isInRange = startDate && endDate && dateStr > startDate && dateStr < endDate;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cellDate = new Date(date);
    cellDate.setHours(0, 0, 0, 0);
    const isPast = cellDate < today;

    let base = "h-8 w-8 text-xs font-bold rounded-full flex items-center justify-center transition-all cursor-pointer select-none ";

    if (isPast) {
      base += "text-slate-300 cursor-not-allowed opacity-50";
    } else if (isTaken) {
      base += "bg-rose-50 text-rose-400 line-through cursor-not-allowed";
    } else if (isStart || isEnd) {
      base += "bg-violet-600 text-white shadow-sm";
    } else if (isInRange) {
      base += "bg-violet-100 text-violet-700 rounded-none";
    } else if (isToday) {
      base += "border border-violet-500 text-violet-600";
    } else {
      base += "hover:bg-slate-100 text-slate-700";
    }

    return base;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <FileText size={16} className="text-white" />
            </div>
            Apply for Leave
          </DialogTitle>
        </DialogHeader>
 
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Select Staff Member (Admin Only) */}
          {isAdmin && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Select Staff Member</label>
              <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {teachersList.map((t: any) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.firstName} {t.lastName} {t.isPrincipal ? '(Principal)' : t.isCoordinator ? '(Coordinator)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.teacherId && <p className="text-xs text-red-500 mt-1">{errors.teacherId}</p>}
            </div>
          )}

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

          {/* Interactive Date Range Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-500">Select Date Range</label>
              {startDate && (
                <span className="text-[10px] bg-violet-50 text-violet-600 px-2 py-0.5 rounded-md font-bold">
                  {startDate} {endDate ? `to ${endDate}` : '(Choose end date)'}
                </span>
              )}
            </div>

            <div className="border border-slate-100 rounded-2xl p-3 bg-slate-50/50">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold text-slate-700">
                  {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6 rounded-lg" onClick={handlePrevMonth}>
                    <ChevronLeft size={14} />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6 rounded-lg" onClick={handleNextMonth}>
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-400 mb-1">
                <span>Su</span>
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
              </div>

              <div className="grid grid-cols-7 gap-y-1 justify-items-center">
                {daysInMonth.map((day, idx) => (
                  <div
                    key={idx}
                    className={getDayClass(day)}
                    onClick={() => day && handleDateClick(day)}
                  >
                    {day ? day.getDate() : ''}
                  </div>
                ))}
              </div>
            </div>
            {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="Describe the reason for your leave..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white text-xs font-semibold text-slate-600 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-none"
            />
            {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason}</p>}
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
              className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold rounded-xl"
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
