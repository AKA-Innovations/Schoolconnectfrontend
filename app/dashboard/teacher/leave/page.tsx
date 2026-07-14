'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { LeaveBalanceCards } from '@/components/teacher-leave/LeaveBalanceCards';
import { LeaveRequestsTable } from '@/components/teacher-leave/LeaveRequestsTable';
import { LeaveRequestForm } from '@/components/teacher-leave/LeaveRequestForm';
import { SubstitutePeriodManager } from '@/components/teacher-leave/SubstitutePeriodManager';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Plus, ArrowRightLeft, FileText, BarChart3 } from 'lucide-react';

export default function TeacherLeavePage() {
  const user = useAuthStore((s) => s.user);
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="bg-transparent antialiased selection:bg-primary/10 py-8">
      <div className="max-w-7xl mx-auto px-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">My Leave</h1>
            <p className="text-xs text-slate-400 mt-1">View your leave balances, apply for leave, and check substitute duties</p>
          </div>
          <Button
            size="sm"
            className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold"
            onClick={() => setFormOpen(true)}
          >
            <Plus size={14} className="mr-1.5" />
            Apply for Leave
          </Button>
        </div>

        {/* Leave Balances */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <BarChart3 size={16} className="text-white" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Leave Balance</h2>
          </div>
          <LeaveBalanceCards />
        </motion.section>

        {/* Leave Requests */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <FileText size={16} className="text-white" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">My Leave Requests</h2>
          </div>
          <LeaveRequestsTable teacherId={user?.id} />
        </motion.section>

        {/* Substitute Duties */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
              <ArrowRightLeft size={16} className="text-white" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Substitute Duties</h2>
            <span className="text-xs text-slate-400">Periods assigned to you as substitute</span>
          </div>
          <SubstitutePeriodManager />
        </motion.section>
      </div>

      {/* Apply Leave Modal */}
      <LeaveRequestForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
