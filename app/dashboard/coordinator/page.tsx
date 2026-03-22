'use client';

import React from 'react';
import { useCoordinatorDashboard } from '../../../hooks/useCoordinatorDashboard';
import { StatsRow } from '../../../components/dashboard/StatsRow';
import { QuickActions } from '../../../components/dashboard/QuickActions';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Layers, BookOpen, Users, ClipboardList } from 'lucide-react';

export default function CoordinatorDashboard() {
  const { data: summary, isLoading } = useCoordinatorDashboard();

  const actions = [
    { label: 'Create Assessment', icon: ClipboardList, onClick: () => {}, variant: 'default' as const },
    { label: 'Update Curriculum', icon: BookOpen, onClick: () => {} },
    { label: 'Assign Teacher', icon: Users, onClick: () => {} },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Coordinator Dashboard</h1>
        <p className="text-muted-foreground mt-1">Academic and department coordination</p>
      </div>

      <StatsRow stats={summary?.kpis} isLoading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Department Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex-1 space-y-4 p-8 pt-6">
              {isLoading ? (
                [1, 2, 3].map(i => <div key={i} className="h-20 bg-muted rounded animate-pulse" />)
              ) : (
                summary?.subjects.map((sub) => (
                  <div key={sub.id} className="p-4 bg-card rounded-lg border border-border">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded text-primary">
                          <Layers size={20} />
                        </div>
                          <h4 className="font-bold text-foreground">{sub.name}</h4>
                      </div>
                      <span className="text-sm font-bold text-primary">{sub.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-1000" 
                        style={{ width: `${sub.progress}%` }} 
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <QuickActions actions={actions} />
          
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="text-lg">Assessment Monitor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  <p className="text-sm font-medium">Mid-terms (Locked)</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <p className="text-sm font-medium">Monthly Quiz Oct (Active)</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-border" />
                  <p className="text-sm font-medium">Final Exams (Draft)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
