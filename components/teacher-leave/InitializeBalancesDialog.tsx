'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { useInitializeBalances } from '../../hooks/useTeacherLeave';
import { CURRENT_SESSION } from '../../lib/constants';
import { toast } from 'sonner';
import { Settings, Users } from 'lucide-react';

interface InitializeBalancesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InitializeBalancesDialog({ open, onOpenChange }: InitializeBalancesDialogProps) {
  const [session, setSession] = React.useState(CURRENT_SESSION);
  const [casualLeaves, setCasualLeaves] = React.useState(12);
  const [sickLeaves, setSickLeaves] = React.useState(10);
  const [earnedLeaves, setEarnedLeaves] = React.useState(15);

  const initBalances = useInitializeBalances();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await initBalances.mutateAsync({
        session,
        casualLeaves,
        sickLeaves,
        earnedLeaves,
      });
      toast.success(`Leave balances initialized for session ${session}`);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to initialize balances');
    }
  };

  const inputClasses =
    'w-full h-10 px-4 rounded-xl border border-slate-200/80 bg-white text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
              <Settings size={16} className="text-white" />
            </div>
            Initialize Leave Balances
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100">
            <Users size={14} className="text-amber-500" />
            <span className="text-xs font-semibold text-amber-700">
              This will set leave balances for <strong>all teachers</strong> in the school
            </span>
          </div>

          {/* Session */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Session</label>
            <input type="text" value={session} onChange={(e) => setSession(e.target.value)} className={inputClasses} />
          </div>

          {/* Leave counts */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Casual</label>
              <input
                type="number"
                min={0}
                value={casualLeaves}
                onChange={(e) => setCasualLeaves(Number(e.target.value))}
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Sick</label>
              <input
                type="number"
                min={0}
                value={sickLeaves}
                onChange={(e) => setSickLeaves(Number(e.target.value))}
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Earned</label>
              <input
                type="number"
                min={0}
                value={earnedLeaves}
                onChange={(e) => setEarnedLeaves(Number(e.target.value))}
                className={inputClasses}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white"
              disabled={initBalances.isPending}
            >
              {initBalances.isPending ? 'Initializing...' : 'Initialize Balances'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
