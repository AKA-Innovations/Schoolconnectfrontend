'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TeacherManagement } from '@/components/admin/TeacherManagement';
import { StudentManagement } from '@/components/admin/StudentManagement';
import { cn } from '@/lib/utils';
import { Plus, Users, FileText, School as SchoolIcon, GraduationCap, UserCheck, LayoutDashboard, Search, Bell } from 'lucide-react';

export default function AdminDashboard() {
  const { data: summary, isLoading } = useAdminDashboard();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('overview');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'overview') {
      router.push('/dashboard/admin');
    } else {
      router.push(`/dashboard/admin?tab=${tabId}`);
    }
  };

  const actions = [
    { label: 'Add Teacher', icon: Users, onClick: () => handleTabChange('teachers') },
    { label: 'Add Student', icon: GraduationCap, onClick: () => handleTabChange('students') },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Command Center</h1>
          <p className="text-muted-foreground mt-1">Real-time school operations and management overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="hidden sm:flex">
             <FileText className="mr-2 h-4 w-4" />
             Export Reports
          </Button>
          <Button variant="premium">
             <Plus className="mr-2 h-4 w-4" />
             Quick Add
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md mb-8">
          <TabsTrigger value="overview">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="teachers">
            <UserCheck className="mr-2 h-4 w-4" />
            Teachers
          </TabsTrigger>
          <TabsTrigger value="students">
            <GraduationCap className="mr-2 h-4 w-4" />
            Students
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 focus-visible:outline-none">
          <StatsRow stats={summary?.kpis} isLoading={isLoading} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 overflow-hidden border-none shadow-card bg-linear-to-br from-white to-slate-50">
              <CardHeader className="border-b bg-white/50 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">School Profile</CardTitle>
                    <CardDescription>Official institution details and core metrics.</CardDescription>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <SchoolIcon className="h-5 w-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="space-y-4">
                     <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
                     <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
                     <div className="grid grid-cols-3 gap-4 pt-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
                     </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-3xl font-extrabold tracking-tight text-foreground">{summary?.school.name}</h3>
                      <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                        <UserCheck className="h-4 w-4" />
                        <span>Principal: {summary?.school.principal}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 group hover:bg-blue-50 transition-colors">
                        <div className="text-3xl font-bold text-blue-600 mb-1">{summary?.school.totalStudents}</div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-blue-500/80">Total Students</div>
                      </div>
                      <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 group hover:bg-emerald-50 transition-colors">
                        <div className="text-3xl font-bold text-emerald-600 mb-1">{summary?.school.totalTeachers}</div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-500/80">Total Teachers</div>
                      </div>
                      <div className="p-4 rounded-xl bg-violet-50/50 border border-violet-100 group hover:bg-violet-50 transition-colors">
                        <div className="text-3xl font-bold text-violet-600 mb-1">{summary?.school.totalClasses}</div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-violet-500/80">Active Classes</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-8">
              <QuickActions actions={actions} />

              <Card className="border-none shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Key Indicators</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="text-sm text-muted-foreground">Teacher:Student</span>
                      <span className="font-bold text-sm">1:18</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="text-sm text-muted-foreground">Class Average</span>
                      <span className="font-bold text-sm">25 students</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="text-sm text-muted-foreground">Active Subjects</span>
                      <span className="font-bold text-sm">12 subjects</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="teachers" className="focus-visible:outline-none">
          <TeacherManagement />
        </TabsContent>

        <TabsContent value="students" className="focus-visible:outline-none">
          <StudentManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
