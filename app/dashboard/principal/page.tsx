'use client';

import React from 'react';
import { usePrincipalDashboard } from '../../../hooks/usePrincipalDashboard';
import { StatsRow } from '../../../components/dashboard/StatsRow';
import { QuickActions } from '../../../components/dashboard/QuickActions';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { cn } from '../../../lib/utils';
import { MessageSquare, UserPlus, FileBarChart, CheckSquare } from 'lucide-react';

export default function PrincipalDashboard() {
  const { data: summary, isLoading } = usePrincipalDashboard();

  const actions = [
    { label: 'Post Announcement', icon: MessageSquare, onClick: () => {}, variant: 'default' as const },
    { label: 'Approve Leave', icon: CheckSquare, onClick: () => {} },
    { label: 'Academic Reports', icon: FileBarChart, onClick: () => {} },
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Principal Dashboard</h1>
        <p className="text-muted-foreground mt-1">School-wide performance monitoring</p>
      </div>

      <StatsRow stats={summary?.kpis} isLoading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Teacher Attendance & Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                [1, 2, 3].map(i => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)
              ) : (
                summary?.teachers.map((teacher) => (
                  <div key={teacher.id} className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center text-success font-bold">
                        {teacher.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{teacher.name}</p>
                        <p className="text-xs text-muted-foreground">{teacher.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        teacher.attendance === 'Present' ? "bg-success" : "bg-destructive"
                      )} />
                      <span className="text-sm font-medium">{teacher.attendance}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <QuickActions actions={actions} />
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-4 border-secondary pl-4 py-1">
                <p className="text-xs text-muted-foreground">09:00 AM</p>
                <p className="text-sm font-bold">Assembly &amp; Prayer</p>
              </div>
              <div className="border-l-4 border-secondary pl-4 py-1">
                <p className="text-xs text-muted-foreground">11:00 AM</p>
                <p className="text-sm font-bold">HOD Weekly Meeting</p>
              </div>
              <div className="border-l-4 border-border pl-4 py-1">
                <p className="text-xs text-muted-foreground">02:30 PM</p>
                <p className="text-sm font-bold opacity-60">Parent Orientation</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
