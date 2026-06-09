'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { TeacherManagement } from '@/components/admin/TeacherManagement';
import { StudentManagement } from '@/components/admin/StudentManagement';
import { SchoolManagement } from '@/components/admin/SchoolManagement';
import { AdminOverviewTab } from '@/components/admin/AdminOverviewTab';
import { Users, GraduationCap, Building2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function AdminDashboardContent() {
  const { data: summary, isLoading, refetch } = useAdminDashboard();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('overview');

  useEffect(() => {
    const tab = searchParams.get('tab');
    setActiveTab(tab ?? 'overview');
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.push(tabId === 'overview' ? '/dashboard/admin' : `/dashboard/admin?tab=${tabId}`);
  };

  const actions = [
    { label: 'Register Teacher', icon: Users, onClick: () => handleTabChange('teachers') },
    { label: 'Enroll Student', icon: GraduationCap, onClick: () => handleTabChange('students') },
  ];

  return (
    <div className="bg-transparent antialiased selection:bg-primary/10 py-8">
      <div className="max-w-7xl mx-auto px-6 space-y-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <AnimatePresence mode="wait">

            {activeTab === 'overview' && (
              <TabsContent key="overview" value="overview" className="space-y-8 outline-none">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <AdminOverviewTab summary={summary} isLoading={isLoading} actions={actions} />
                </motion.div>
              </TabsContent>
            )}

            {activeTab === 'teachers' && (
              <TabsContent key="teachers" value="teachers" className="outline-none">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <TeacherManagement />
                </motion.div>
              </TabsContent>
            )}

            {activeTab === 'students' && (
              <TabsContent key="students" value="students" className="outline-none">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <StudentManagement />
                </motion.div>
              </TabsContent>
            )}

            {activeTab === 'school' && (
              <TabsContent key="school" value="school" className="outline-none">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <SchoolManagement />
                </motion.div>
              </TabsContent>
            )}

          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading dashboard...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
