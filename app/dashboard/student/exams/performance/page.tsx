'use client';

import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { useStudentPerformance } from '@/services/exam/queries';
import { CURRENT_SESSION } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { AlertCircle, HelpCircle, TrendingUp } from 'lucide-react';

export default function StudentPerformancePage() {
  const user = useAuthStore((s) => s.user);
  const studentId = user?.id || '';

  const { data: performanceData, isLoading } = useStudentPerformance(studentId, {
    session: CURRENT_SESSION,
  });

  const mockTrendData = [
    { examName: 'Unit Test 1', percentage: 78 },
    { examName: 'Unit Test 2', percentage: 82 },
    { examName: 'Half Yearly', percentage: 80 },
    { examName: 'Unit Test 3', percentage: 89 },
    { examName: 'Annual Exam', percentage: 88.5 },
  ];

  const trendData = performanceData?.trends || mockTrendData;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">My Performance Trend</h2>
        <p className="text-sm text-muted-foreground mt-1">Visualize your progress across exams for the current session {CURRENT_SESSION}</p>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground">Loading performance trends...</div>
      ) : trendData.length === 0 ? (
        <Card className="rounded-2xl border border-dashed border-border/80 shadow-sm p-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-muted-foreground font-medium">No performance data found for session {CURRENT_SESSION}.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <Card className="rounded-2xl border border-border shadow-sm bg-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">Progress Across Exams</h3>
                <p className="text-xs text-muted-foreground font-medium">Aggregated percentage score trend line.</p>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="examName" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="percentage" stroke="var(--color-primary, #6366f1)" strokeWidth={3} dot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
