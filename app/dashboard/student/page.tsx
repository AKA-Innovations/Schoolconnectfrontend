'use client';

import React from 'react';
import { useStudentDashboard } from '../../../hooks/useStudentDashboard';
import { StatsRow } from '../../../components/dashboard/StatsRow';
import { QuickActions } from '../../../components/dashboard/QuickActions';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { cn } from '../../../lib/utils';
import { BookOpen, FileText, Calendar, CheckCircle, Clock, AlertTriangle, RefreshCw } from 'lucide-react';

export default function StudentDashboard() {
  const { data: summary, isLoading, refetch } = useStudentDashboard();

  const actions = [
    { label: 'View Schedule', icon: Calendar, onClick: () => {}, variant: 'default' as const },
    { label: 'Submit Assignment', icon: FileText, onClick: () => {} },
    { label: 'Check Grades', icon: BookOpen, onClick: () => {} },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-warning" />;
      case 'submitted': return <CheckCircle className="h-4 w-4 text-secondary" />;
      case 'graded': return <CheckCircle className="h-4 w-4 text-success" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="text-warning border-warning">Pending</Badge>;
      case 'submitted': return <Badge variant="outline" className="text-secondary border-secondary">Submitted</Badge>;
      case 'graded': return <Badge className="bg-success/10 text-success">Graded</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Student Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your academic progress and assignments</p>
        </div>
        <div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-100 shadow-sm text-sm font-semibold hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4 text-slate-600" />
            Refresh
          </button>
        </div>
      </div>

      <StatsRow stats={summary?.kpis} isLoading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                [1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center space-x-4 p-4 border border-border rounded-lg">
                    <div className="h-10 w-10 bg-muted rounded animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                ))
              ) : (
                summary?.assignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center space-x-4 p-4 border border-border rounded-lg hover:border-primary-hover transition-colors">
                    <div className="flex-shrink-0">
                      {getStatusIcon(assignment.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground truncate">
                          {assignment.title}
                        </p>
                        {getStatusBadge(assignment.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {assignment.subject} • Due: {assignment.dueDate}
                      </p>
                      {assignment.grade && (
                        <p className="text-sm font-semibold text-success">
                          Grade: {assignment.grade}
                        </p>
                      )}
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
              <CardTitle>Today's Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isLoading ? (
                  [1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
                    </div>
                  ))
                ) : (
                  summary?.attendance.slice(0, 5).map((record, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-900">
                        {record.subject}
                      </span>
                      <Badge
                        variant={record.status === 'present' ? 'default' : record.status === 'late' ? 'secondary' : 'destructive'}
                        className={cn(
                          record.status === 'present' && 'bg-green-100 text-green-800',
                          record.status === 'late' && 'bg-amber-100 text-amber-800',
                          record.status === 'absent' && 'bg-red-100 text-red-800'
                        )}
                      >
                        {record.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}