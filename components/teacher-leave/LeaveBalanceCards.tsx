'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useLeaveBalances } from '../../hooks/useTeacherLeave';
import { CURRENT_SESSION } from '../../lib/constants';
import { LeaveType } from '../../types/leave.types';
import { CalendarDays, Stethoscope, Award, Zap } from 'lucide-react';

const leaveConfig: Record<string, { label: string; icon: React.ElementType; gradient: string; trackColor: string; barColor: string }> = {
  [LeaveType.CASUAL]: {
    label: 'Casual Leave',
    icon: CalendarDays,
    gradient: 'from-blue-500 to-cyan-500',
    trackColor: 'bg-blue-100',
    barColor: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  },
  [LeaveType.SICK]: {
    label: 'Sick Leave',
    icon: Stethoscope,
    gradient: 'from-rose-500 to-pink-500',
    trackColor: 'bg-rose-100',
    barColor: 'bg-gradient-to-r from-rose-500 to-pink-500',
  },
  [LeaveType.EARNED]: {
    label: 'Earned Leave',
    icon: Award,
    gradient: 'from-emerald-500 to-teal-500',
    trackColor: 'bg-emerald-100',
    barColor: 'bg-gradient-to-r from-emerald-500 to-teal-500',
  },
  [LeaveType.EMERGENCY]: {
    label: 'Emergency Leave',
    icon: Zap,
    gradient: 'from-amber-500 to-orange-500',
    trackColor: 'bg-amber-100',
    barColor: 'bg-gradient-to-r from-amber-500 to-orange-500',
  },
};

interface LeaveBalanceCardsProps {
  session?: string;
}

export function LeaveBalanceCards({ session }: LeaveBalanceCardsProps) {
  const activeSession = session || CURRENT_SESSION;
  const { data: balances = [], isLoading } = useLeaveBalances(activeSession);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (balances.length === 0) {
    return (
      <div className="text-center py-8">
        <CalendarDays size={40} className="mx-auto text-slate-300 mb-3" />
        <p className="text-sm font-semibold text-slate-400">No leave balances found</p>
        <p className="text-xs text-slate-300 mt-1">Leave balances haven&apos;t been initialized for {activeSession}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {balances.map((balance, index) => {
        const config = leaveConfig[balance.leaveType] || {
          label: balance.leaveType,
          icon: CalendarDays,
          gradient: 'from-slate-500 to-slate-600',
          trackColor: 'bg-slate-100',
          barColor: 'bg-gradient-to-r from-slate-500 to-slate-600',
        };
        const Icon = config.icon;
        const percentage = balance.totalAllowed > 0 ? (balance.used / balance.totalAllowed) * 100 : 0;

        return (
          <motion.div
            key={balance.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Icon badge */}
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center mb-3 shadow-lg`}>
              <Icon size={18} className="text-white" />
            </div>

            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{config.label}</p>

            {/* Numbers */}
            <div className="flex items-end gap-1 mt-1.5">
              <span className="text-2xl font-black text-slate-800">{balance.remaining}</span>
              <span className="text-xs font-semibold text-slate-400 mb-1">/ {balance.totalAllowed}</span>
            </div>

            {/* Progress bar */}
            <div className={`w-full h-1.5 rounded-full ${config.trackColor} mt-3`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(percentage, 100)}%` }}
                transition={{ delay: index * 0.1 + 0.3, duration: 0.6, ease: 'easeOut' }}
                className={`h-full rounded-full ${config.barColor}`}
              />
            </div>

            <p className="text-[10px] font-semibold text-slate-400 mt-1.5">
              {balance.used} used • {balance.remaining} remaining
            </p>

            {/* Decorative gradient blob */}
            <div className={`absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br ${config.gradient} rounded-full opacity-5 blur-xl`} />
          </motion.div>
        );
      })}
    </div>
  );
}
