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
          <Card key={i} className="animate-pulse">
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
      color: 'bg-blue-50 text-blue-600 border-blue-200/50',
      bgIcon: 'bg-blue-500/10',
    },
    {
      label: 'Total Sections',
      value: data?.totalSections || 0,
      icon: Users,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200/50',
      bgIcon: 'bg-emerald-500/10',
    },
    {
      label: 'Class Teachers',
      value: data?.totalClassTeachersAssigned || 0,
      icon: Users2,
      color: 'bg-purple-50 text-purple-600 border-purple-200/50',
      bgIcon: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className={`${stat.color} border-2`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                    {stat.label}
                  </p>
                  <h3 className="text-3xl font-bold">{stat.value}</h3>
                </div>
                <div className={`${stat.bgIcon} p-3 rounded-xl`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
