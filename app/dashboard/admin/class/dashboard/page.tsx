'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ClassSummaryDashboard } from '@/components/admin/class/ClassSummaryDashboard';
import {
  BookOpen,
  Users,
  Grid3x3,
  GraduationCap,
  ChevronRight,
  Plus,
  ArrowUpRight,
} from 'lucide-react';

const MODULES = [
  {
    icon: BookOpen,
    title: 'Grade Levels & Classes',
    description: 'Create and manage academic grade levels, view class-level KPIs, and configure school structure.',
    href: '/dashboard/admin/class',
    tag: 'Core',
    tagColor: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400',
    accentColor: 'group-hover:border-emerald-400/50',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: Grid3x3,
    title: 'Sections & Capacity',
    description: 'Explore sections within each grade, set strength limits, and review section-level academic data.',
    href: '/dashboard/admin/class/explorer',
    tag: 'Structure',
    tagColor: 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-400',
    accentColor: 'group-hover:border-blue-400/50',
    iconBg: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
  },
  {
    icon: GraduationCap,
    title: 'Class Teacher Assignments',
    description: 'View and manage which teacher is responsible for each class section across the school.',
    href: '/dashboard/admin/class/teachers',
    tag: 'Staff',
    tagColor: 'text-violet-700 bg-violet-50 border-violet-200 dark:bg-violet-950/40 dark:border-violet-800 dark:text-violet-400',
    accentColor: 'group-hover:border-violet-400/50',
    iconBg: 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400',
  },
  {
    icon: Users,
    title: 'Student Rosters',
    description: 'Browse students by section, check enrollment numbers, and see today\'s attendance at a glance.',
    href: '/dashboard/admin/class/students',
    tag: 'Students',
    tagColor: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400',
    accentColor: 'group-hover:border-amber-400/50',
    iconBg: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
  },
];

export default function ClassManagementDashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.15em]">
              Administration · Class & Section Management
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Academic Structure
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
              Configure your school's academic hierarchy — grade levels, sections, teacher assignments, and student rosters — all from one place.
            </p>
          </div>
          <div className="shrink-0">
            <Button
              onClick={() => router.push('/dashboard/admin/class/new')}
              className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm h-10 px-4 gap-2 shadow-sm"
            >
              <Plus className="h-4 w-4" /> Add New Class
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <ClassSummaryDashboard />

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Module Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Management Modules</h2>
            <span className="text-xs text-muted-foreground">{MODULES.length} tools available</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MODULES.map((mod) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.href}
                  onClick={() => router.push(mod.href)}
                  className={`group relative flex flex-col justify-between bg-card border border-border rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${mod.accentColor}`}
                >
                  <div className="space-y-4">
                    {/* Icon + Tag row */}
                    <div className="flex items-start justify-between">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${mod.iconBg} transition-transform duration-200 group-hover:scale-105`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${mod.tagColor}`}>
                        {mod.tag}
                      </span>
                    </div>

                    {/* Text */}
                    <div className="space-y-1.5">
                      <h3 className="text-[15px] font-semibold text-foreground leading-snug group-hover:text-primary transition-colors duration-150">
                        {mod.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {mod.description}
                      </p>
                    </div>
                  </div>

                  {/* Footer CTA */}
                  <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Open module</span>
                    <div className="h-7 w-7 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-200">
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}