'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LeaveRequestsTable } from '@/components/teacher-leave/LeaveRequestsTable';
import { LeaveApprovalDialog } from '@/components/teacher-leave/LeaveApprovalDialog';
import { SubstitutePeriodManager } from '@/components/teacher-leave/SubstitutePeriodManager';
import { TeacherAttendanceManager } from '@/components/teacher-leave/TeacherAttendanceManager';
import { InitializeBalancesDialog } from '@/components/teacher-leave/InitializeBalancesDialog';
import { LeaveRequestForm } from '@/components/teacher-leave/LeaveRequestForm';
import type { TeacherLeave } from '@/types/leave.types';
import { useSubstitutePeriods } from '@/hooks/useTeacherLeave';
import { useTeacherRoles } from '@/lib/permissions';
import { FileText, ArrowRightLeft, ClipboardCheck, Settings, CalendarDays, AlertCircle, Plus } from 'lucide-react';

function AdminTeacherLeaveContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'requests');
  const [approvalLeave, setApprovalLeave] = useState<TeacherLeave | null>(null);
  const [approvalMode, setApprovalMode] = useState<'approve' | 'reject'>('approve');
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [initDialogOpen, setInitDialogOpen] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const { isPrincipal } = useTeacherRoles();

  const todayStr = React.useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);
  const { data: periods = [] } = useSubstitutePeriods(todayStr);
  const unassignedCount = React.useMemo(() => periods.filter(p => p.status === 'UNASSIGNED').length, [periods]);

  React.useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/dashboard/admin/teacher-leave?tab=${tab}`);
  };

  const handleApprove = (leave: TeacherLeave) => {
    setApprovalLeave(leave);
    setApprovalMode('approve');
    setApprovalDialogOpen(true);
  };

  const handleReject = (leave: TeacherLeave) => {
    setApprovalLeave(leave);
    setApprovalMode('reject');
    setApprovalDialogOpen(true);
  };

  return (
    <div className="bg-transparent antialiased selection:bg-primary/10 py-8">
      <div className="max-w-7xl mx-auto px-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Leave & Substitution</h1>
            <p className="text-xs text-slate-400 mt-1">Manage teacher leaves, attendance, and substitute assignments</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-bold"
              onClick={() => setInitDialogOpen(true)}
            >
              <Settings size={14} className="mr-1.5" />
              Initialize Balances
            </Button>
            {isPrincipal && (
              <Button
                size="sm"
                className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold text-xs"
                onClick={() => setApplyDialogOpen(true)}
              >
                <Plus size={14} className="mr-1.5" />
                Apply Leave (Self)
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <AnimatePresence mode="wait">
            {activeTab === 'requests' && (
              <TabsContent key="requests" value="requests" className="outline-none">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="space-y-4">
                    {unassignedCount > 0 && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 py-3 rounded-xl bg-rose-50 border border-rose-100 shadow-sm animate-pulse">
                        <div className="flex items-center gap-2">
                          <AlertCircle size={15} className="text-rose-500 shrink-0" />
                          <span className="text-xs font-bold text-rose-700">
                            Attention: There are {unassignedCount} unassigned substitute period slots today! Please allocate substitute teachers.
                          </span>
                        </div>
                        <Button
                          size="sm"
                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] h-7 px-3.5 rounded-lg w-fit shrink-0 transition-all shadow-sm"
                          onClick={() => handleTabChange('substitutes')}
                        >
                          Assign Substitute
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-100">
                      <CalendarDays size={14} className="text-blue-500" />
                      <span className="text-xs font-semibold text-blue-700">
                        Review and approve/reject teacher leave requests. Approving generates substitute period slots automatically.
                      </span>
                    </div>
                    <LeaveRequestsTable
                      isAdmin
                      onApprove={handleApprove}
                      onReject={handleReject}
                    />
                  </div>
                </motion.div>
              </TabsContent>
            )}

            {activeTab === 'substitutes' && (
              <TabsContent key="substitutes" value="substitutes" className="outline-none">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <SubstitutePeriodManager isAdmin />
                </motion.div>
              </TabsContent>
            )}

            {activeTab === 'attendance' && (
              <TabsContent key="attendance" value="attendance" className="outline-none">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <TeacherAttendanceManager />
                </motion.div>
              </TabsContent>
            )}
          </AnimatePresence>
        </Tabs>
      </div>

      {/* Dialogs */}
      <LeaveApprovalDialog
        open={approvalDialogOpen}
        onOpenChange={setApprovalDialogOpen}
        leave={approvalLeave}
        mode={approvalMode}
      />
      <InitializeBalancesDialog
        open={initDialogOpen}
        onOpenChange={setInitDialogOpen}
      />
      {isPrincipal && (
        <LeaveRequestForm
          open={applyDialogOpen}
          onOpenChange={setApplyDialogOpen}
          isAdmin={false}
        />
      )}
    </div>
  );
}

export default function AdminTeacherLeavePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading leave management...</div>}>
      <AdminTeacherLeaveContent />
    </Suspense>
  );
}
