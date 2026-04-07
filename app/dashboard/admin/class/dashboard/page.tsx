'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClassSummaryDashboard } from '@/components/admin/class/ClassSummaryDashboard';
import {
  BookOpen,
  Users,
  Grid3x3,
  Users2,
  ChevronRight,
  BarChart3,
} from 'lucide-react';

const FEATURE_CARDS = [
  {
    icon: BookOpen,
    title: 'Classes Overview',
    description: 'Browse, manage, and organize all classes in your school',
    href: '/dashboard/admin/class',
    color: 'bg-blue-50 text-blue-600 border-blue-200/50',
    bgIcon: 'bg-blue-500/10',
  },
  {
    icon: Grid3x3,
    title: 'Class & Section Explorer',
    description: 'View all sections under each class in a master-detail layout',
    href: '/dashboard/admin/class/explorer',
    color: 'bg-purple-50 text-purple-600 border-purple-200/50',
    bgIcon: 'bg-purple-500/10',
  },
  {
    icon: Users2,
    title: 'Class Teacher Mapping',
    description: 'View and manage teacher assignments across classes',
    href: '/dashboard/admin/class/teachers',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200/50',
    bgIcon: 'bg-emerald-500/10',
  },
  {
    icon: BarChart3,
    title: 'Class Analytics',
    description: 'View detailed statistics and performance metrics',
    href: '#',
    color: 'bg-orange-50 text-orange-600 border-orange-200/50',
    bgIcon: 'bg-orange-500/10',
    disabled: true,
  },
];

export default function ClassManagementDashboard() {
  const router = useRouter();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Class Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage classes, sections, and teacher assignments for your school
        </p>
      </div>

      {/* Summary Dashboard */}
      <ClassSummaryDashboard />

      {/* Feature Cards */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground mb-4">Available Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURE_CARDS.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className={`rounded-2xl border-2 ${feature.color} cursor-pointer transition-all hover:shadow-md hover:-translate-y-1 ${
                  feature.disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => !feature.disabled && router.push(feature.href)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${feature.bgIcon} p-3 rounded-xl`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    {!feature.disabled && <ChevronRight className="h-5 w-5 opacity-40" />}
                  </div>
                  <h3 className="text-lg font-bold tracking-tight">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{feature.description}</p>
                  {feature.disabled && (
                    <p className="text-xs text-muted-foreground mt-3 font-semibold">Coming Soon</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="rounded-2xl border-border shadow-sm">
        <CardHeader className="border-b border-border/50 bg-muted/10 py-6 px-8">
          <CardTitle className="text-lg font-bold tracking-tight">Quick Actions</CardTitle>
          <CardDescription className="text-xs font-medium mt-1">
            Common tasks to get started quickly
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="rounded-xl h-12 flex flex-col items-center justify-center gap-1"
              onClick={() => router.push('/dashboard/admin/class')}
            >
              <BookOpen className="h-5 w-5" />
              <span className="text-xs font-semibold">View All Classes</span>
            </Button>
            <Button
              variant="outline"
              className="rounded-xl h-12 flex flex-col items-center justify-center gap-1"
              onClick={() => router.push('/dashboard/admin/class/new')}
            >
              <Users className="h-5 w-5" />
              <span className="text-xs font-semibold">Add New Class</span>
            </Button>
            <Button
              variant="outline"
              className="rounded-xl h-12 flex flex-col items-center justify-center gap-1"
              onClick={() => router.push('/dashboard/admin/class/teachers')}
            >
              <Users2 className="h-5 w-5" />
              <span className="text-xs font-semibold">Teacher Mapping</span>
            </Button>
            <Button
              variant="outline"
              className="rounded-xl h-12 flex flex-col items-center justify-center gap-1"
              onClick={() => router.push('/dashboard/admin/class/explorer')}
            >
              <Grid3x3 className="h-5 w-5" />
              <span className="text-xs font-semibold">Browse Sections</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="rounded-2xl border-border shadow-sm bg-blue-50/50">
          <CardContent className="p-6">
            <h3 className="font-bold text-foreground mb-2">About Classes</h3>
            <p className="text-sm text-muted-foreground">
              Classes represent grade levels or year groups in your school. Each class can have multiple sections
              (A, B, C, etc.) and be assigned a class teacher.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border shadow-sm bg-emerald-50/50">
          <CardContent className="p-6">
            <h3 className="font-bold text-foreground mb-2">About Sections</h3>
            <p className="text-sm text-muted-foreground">
              Sections divide students within a class. Each section has its own strength (number of students) and can
              have a dedicated section teacher.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
