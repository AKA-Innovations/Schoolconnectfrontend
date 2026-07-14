'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ClassSummaryDashboard } from '@/components/admin/class/ClassSummaryDashboard';
import { ClassCapacityAnalytics } from '@/components/admin/class/ClassCapacityAnalytics';
import { Plus } from 'lucide-react';

export default function ClassManagementDashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-border/60 pb-6">
          <div className="space-y-2">
            <p className="text-xs font-bold text-primary uppercase tracking-[0.2em]">
              Administration &middot; Academic Hub
            </p>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              Capacity Management
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
              Monitor classroom capacities and occupancy statistics drawing directly from live backend database configurations.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/admin/school?tab=structure')}
              className="rounded-xl border-border hover:bg-muted text-foreground font-semibold text-xs h-10 px-4"
            >
              Add Classes & Sections
            </Button>
            <Button
              onClick={() => router.push('/dashboard/admin/class/new')}
              className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-10 px-4 gap-2 shadow-sm"
            >
              <Plus className="h-4 w-4" /> Assign Class Teacher
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        {/* <ClassSummaryDashboard /> */}

        {/* Live capacity view */}
        <div className="pt-2">
          <ClassCapacityAnalytics />
        </div>

      </div>
    </div>
  );
}