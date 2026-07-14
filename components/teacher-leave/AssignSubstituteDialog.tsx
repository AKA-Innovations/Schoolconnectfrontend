'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { useAvailableTeachers, useAssignSubstitute } from '../../hooks/useTeacherLeave';
import { CURRENT_SESSION } from '../../lib/constants';
import type { SubstitutePeriod } from '../../types/leave.types';
import { toast } from 'sonner';
import { UserCheck, Users, Loader2 } from 'lucide-react';

interface AssignSubstituteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  period: SubstitutePeriod | null;
}

export function AssignSubstituteDialog({ open, onOpenChange, period }: AssignSubstituteDialogProps) {
  const [selectedTeacherId, setSelectedTeacherId] = React.useState('');
  const [notes, setNotes] = React.useState('');

  const dateStr = period?.date ? new Date(period.date).toISOString().split('T')[0] : '';
  const session = period?.session || CURRENT_SESSION;

  const { data: availableTeachers = [], isLoading: loadingTeachers } = useAvailableTeachers(
    dateStr,
    period?.periodId || 0,
    session,
  );

  const assignSub = useAssignSubstitute();

  const handleAssign = async () => {
    if (!period || !selectedTeacherId) {
      toast.error('Please select a teacher');
      return;
    }

    try {
      await assignSub.mutateAsync({
        id: period.id,
        dto: {
          substituteTeacherId: selectedTeacherId,
          notes: notes.trim() || undefined,
        },
      });
      toast.success('Substitute teacher assigned successfully');
      onOpenChange(false);
      setSelectedTeacherId('');
      setNotes('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to assign substitute');
    }
  };

  if (!period) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
              <UserCheck size={16} className="text-white" />
            </div>
            Assign Substitute Teacher
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Period info */}
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-1.5">
            <p className="text-xs font-semibold text-slate-500">
              Period: <span className="text-slate-700">#{period.periodId}</span>
            </p>
            <p className="text-xs font-semibold text-slate-500">
              Date: <span className="text-slate-700">{new Date(period.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </p>
            <p className="text-xs font-semibold text-slate-500">
              Class Section: <span className="text-slate-700">#{period.classSectionId}</span>
            </p>
            <p className="text-xs font-semibold text-slate-500">
              Subject: <span className="text-slate-700">#{period.subjectId}</span>
            </p>
          </div>

          {/* Available teachers */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              <Users size={13} className="inline mr-1" />
              Available Teachers {loadingTeachers && <Loader2 size={12} className="inline ml-1 animate-spin" />}
            </label>

            {!loadingTeachers && availableTeachers.length === 0 ? (
              <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-center">
                <p className="text-xs font-semibold text-amber-600">No available teachers for this slot</p>
                <p className="text-[10px] text-amber-500 mt-0.5">All teachers are busy, absent, or already assigned</p>
              </div>
            ) : (
              <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingTeachers ? 'Loading teachers...' : 'Select a teacher'} />
                </SelectTrigger>
                <SelectContent>
                  {availableTeachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.firstName} {t.lastName} ({t.employeeId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="E.g., Assigned to cover Math slot"
              className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white text-xs font-semibold text-slate-600 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
            />
          </div>

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
              className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white"
              onClick={handleAssign}
              disabled={assignSub.isPending || !selectedTeacherId}
            >
              {assignSub.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                  Assigning...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserCheck size={14} />
                  Assign
                </span>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
