'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TeacherManagement } from '@/components/admin/TeacherManagement';
import { StudentManagement } from '@/components/admin/StudentManagement';
import { SchoolManagement } from '@/components/admin/SchoolManagement';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Plus, Users, School, GraduationCap,
  Search, Bell, ArrowRight, LayoutDashboard,
  Settings2, Download, Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SlidingTabs from '@/components/admin/tabs';

export default function AdminDashboard() {
  const { data: summary, isLoading } = useAdminDashboard();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const tabOptions = [
    { label: 'Teachers', value: 'teachers', icon: School },
    { label: 'Admin', value: 'overview', icon: Settings2 },
    { label: 'Student', value: 'students', icon: GraduationCap },
    { label: 'School', value: 'school', icon: Building2 },
  ];
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
    // bg-background uses your hsl(210 30% 97%) which is perfect for contrast
    <div className="min-h-screen bg-background antialiased selection:bg-primary/10">
      <div className="max-w-7xl mx-auto px-6 py-0 space-y-6">

        {/* NAVIGATION: Using your 'muted' background for the rail */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          {/* <SlidingTabs activeTab={activeTab} onChange={handleTabChange} /> */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <TabsContent key="overview" value="overview" className="space-y-8 outline-none">
                {/* KPIs: Use your existing StatsRow */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <StatsRow stats={summary?.kpis} isLoading={isLoading} />
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                  {/* MAIN PROFILE: Using your .erp-card class */}
                  <div className="lg:col-span-8">
                    <div className="erp-card p-4 bg-card">
                      <div className="flex flex-row items-start justify-between mb-10">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                            <School size={14} /> School Profile
                          </div>
                          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                            {isLoading ? "Loading..." : summary?.school.name}
                          </h2>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-lg border-border text-xs font-bold px-4">
                          <Download size={14} className="mr-2" /> Report
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {[
                          { label: 'Active Students', value: summary?.school.totalStudents, icon: GraduationCap, color: 'text-blue-600' },
                          { label: 'Faculty Members', value: summary?.school.totalTeachers, icon: Users, color: 'text-indigo-600' },
                          { label: 'Total Classrooms', value: summary?.school.totalClasses, icon: School, color: 'text-teal-600' },
                        ].map((item, i) => (
                          <div key={i} className="p-6 rounded-xl border border-border bg-background/30 hover:bg-card hover:border-primary/20 transition-all group">
                            <item.icon className={cn("mb-4", item.color)} size={20} />
                            <div className="text-3xl font-bold text-foreground tabular-nums tracking-tight">{item.value ?? '0'}</div>
                            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">{item.label}</div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-10 pt-8 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center font-bold text-primary">
                            {summary?.school.principal?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Principal</p>
                            <p className="text-sm font-semibold text-foreground">{summary?.school.principal}</p>
                          </div>
                        </div>
                        <Button variant="link" className="text-primary font-bold text-sm">
                          View Management Details <ArrowRight size={16} className="ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* SIDEBAR: Utility Cards */}
                  <aside className="lg:col-span-4 space-y-8">
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Control Panel</p>
                      <QuickActions actions={actions} />
                    </div>

                    <div className="erp-card p-6 bg-card">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <Settings2 size={16} className="text-primary" />
                          <span className="text-sm font-bold text-foreground uppercase tracking-tight">System Health</span>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {[
                          { label: 'Faculty Load', value: '1:18', status: 'Optimal' },
                          { label: 'Daily Attendance', value: '94%', status: 'Healthy' }
                        ].map((metric, i) => (
                          <div key={metric.label} className="group">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-muted-foreground">{metric.label}</span>
                              <span className="text-sm font-bold text-foreground">{metric.value}</span>
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary w-[70%] rounded-full" />
                            </div>
                            <p className="text-[10px] text-success font-bold mt-2 uppercase tracking-wide">{metric.status}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </aside>
                </div>
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
