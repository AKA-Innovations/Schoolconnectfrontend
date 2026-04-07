'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useClassSummary } from '@/hooks/useClasses';
import { BookOpen, Users, Users2, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ClassSummaryDashboard() {
  const { data, isLoading } = useClassSummary();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse erp-card">
            <CardContent className="p-6">
              <div className="h-12 bg-muted rounded mb-2" />
              <div className="h-8 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Classes',
      value: data?.totalClasses || 0,
      icon: BookOpen,
    },
    {
      label: 'Total Sections',
      value: data?.totalSections || 0,
      icon: Users,
    },
    {
      label: 'Class Teachers',
      value: data?.totalClassTeachersAssigned || 0,
      icon: Users2,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="erp-card overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">{stat.label}</p>
              </div>
              <div>
                <h3 className="text-3xl font-extrabold text-foreground leading-snug">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
