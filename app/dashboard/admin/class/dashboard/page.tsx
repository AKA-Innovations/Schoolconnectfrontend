'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClassSummaryDashboard } from '@/components/admin/class/ClassSummaryDashboard';
import {
  BookOpen,
  Users,
  Grid3x3,
  Users2,
  ChevronRight,
  BarChart3,
  UserSquare2,
} from 'lucide-react';

const FEATURE_CARDS = [
  {
    icon: BookOpen,
    title: 'Classes Overview',
    description: 'Browse, manage, and organize all classes in your school',
    href: '/dashboard/admin/class',
  },
  {
    icon: Grid3x3,
    title: 'Class & Section Explorer',
    description: 'View all sections under each class in a master-detail layout',
    href: '/dashboard/admin/class/explorer',
  },
  {
    icon: Users2,
    title: 'Class Teacher Mapping',
    description: 'View and manage teacher assignments across classes',
    href: '/dashboard/admin/class/teachers',
  },
  {
    icon: UserSquare2,
    title: 'Class Students',
    description: 'View students section-wise with their today\'s attendance status',
    href: '/dashboard/admin/class/students',
  },
  {
    icon: BarChart3,
    title: 'Class Analytics',
    description: 'View detailed statistics and performance metrics',
    href: '#',
    disabled: true,
  },
];

export default function ClassManagementDashboard() {
  const router = useRouter();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink">Class Management</h1>
        <p className="text-ink-light mt-2">
          Manage classes, sections, and teacher assignments for your school
        </p>
      </div>

      {/* Summary */}
      <ClassSummaryDashboard />

      {/* Feature Cards */}
      <div>
        <h2 className="text-xl font-bold text-ink mb-4">Available Tools</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURE_CARDS.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card
                key={feature.title}
                className={`rounded-2xl border border-border shadow-card hover:shadow-card-hover transition-all cursor-pointer hover:-translate-y-1 ${
                  feature.disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => !feature.disabled && router.push(feature.href)}
              >
                <CardContent className="p-6">

                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-primary/10 text-primary p-3 rounded-xl">
                      <Icon className="h-6 w-6" />
                    </div>

                    {!feature.disabled && (
                      <ChevronRight className="h-5 w-5 text-ink-light" />
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-ink">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-ink-light mt-2">
                    {feature.description}
                  </p>

                  {feature.disabled && (
                    <p className="text-xs text-ink-light mt-3 font-semibold">
                      Coming Soon
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="rounded-2xl border border-border shadow-card">
        <CardHeader className="border-b border-border py-6 px-8 bg-surface/50">
          <CardTitle className="text-lg font-bold text-ink">
            Quick Actions
          </CardTitle>
          <CardDescription className="text-xs text-ink-light mt-1">
            Common tasks to get started quickly
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

            <Button
              variant="outline"
              className="rounded-xl h-12 flex flex-col gap-1 border-border"
              onClick={() => router.push('/dashboard/admin/class')}
            >
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-xs font-semibold">View Classes</span>
            </Button>

            <Button
              variant="outline"
              className="rounded-xl h-12 flex flex-col gap-1 border-border"
              onClick={() => router.push('/dashboard/admin/class/new')}
            >
              <Users className="h-5 w-5 text-primary" />
              <span className="text-xs font-semibold">Add Class</span>
            </Button>

            <Button
              variant="outline"
              className="rounded-xl h-12 flex flex-col gap-1 border-border"
              onClick={() => router.push('/dashboard/admin/class/teachers')}
            >
              <Users2 className="h-5 w-5 text-primary" />
              <span className="text-xs font-semibold">Teacher Mapping</span>
            </Button>

            <Button
              variant="outline"
              className="rounded-xl h-12 flex flex-col gap-1 border-border"
              onClick={() => router.push('/dashboard/admin/class/explorer')}
            >
              <Grid3x3 className="h-5 w-5 text-primary" />
              <span className="text-xs font-semibold">Browse Sections</span>
            </Button>

          </div>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <Card className="rounded-2xl border border-border shadow-card bg-primary/5">
          <CardContent className="p-6">
            <h3 className="font-semibold text-ink mb-2">About Classes</h3>
            <p className="text-sm text-ink-light">
              Classes represent grade levels or year groups in your school.
              Each class can have multiple sections and assigned teachers.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-card bg-accent/5">
          <CardContent className="p-6">
            <h3 className="font-semibold text-ink mb-2">About Sections</h3>
            <p className="text-sm text-ink-light">
              Sections divide students within a class and help manage capacity,
              teachers, and subject allocations efficiently.
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}