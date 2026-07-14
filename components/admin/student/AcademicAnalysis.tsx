'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, BookOpen, Award } from 'lucide-react';

interface AcademicAnalysisProps {
  studentId: string;
  student: any;
}

export default function AcademicAnalysis({ studentId, student }: AcademicAnalysisProps) {
  // Mock performance data for demonstration
  const performanceData = [
    { month: 'Jan', percentage: 72 },
    { month: 'Feb', percentage: 75 },
    { month: 'Mar', percentage: 78 },
    { month: 'Apr', percentage: 81 },
    { month: 'May', percentage: 79 },
    { month: 'Jun', percentage: 85 },
  ];

  const subjectData = [
    { name: 'Mathematics', score: 88 },
    { name: 'English', score: 82 },
    { name: 'Science', score: 90 },
    { name: 'Social Studies', score: 78 },
    { name: 'Hindi', score: 85 },
  ];

  const colours = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const avgPercentage = Math.round(
    performanceData.reduce((sum, d) => sum + d.percentage, 0) / performanceData.length
  );

  const overallGrade = avgPercentage >= 80 ? 'A' : avgPercentage >= 70 ? 'B' : avgPercentage >= 60 ? 'C' : 'D';

  const bestSubject = subjectData.reduce((max, s) => (s.score > max.score ? s : max));
  const weakSubject = subjectData.reduce((min, s) => (s.score < min.score ? s : min));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50/50 border-blue-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Overall Grade</p>
                <Badge className="bg-blue-500/10 text-blue-600 text-lg px-3 py-1">{overallGrade}</Badge>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500/40" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50/50 border-emerald-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Average Score</p>
                <h3 className="text-3xl font-bold text-foreground">{avgPercentage}%</h3>
              </div>
              <BookOpen className="h-8 w-8 text-emerald-500/40" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50/50 border-purple-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Subjects</p>
                <h3 className="text-3xl font-bold text-foreground">{subjectData.length}</h3>
              </div>
              <Award className="h-8 w-8 text-purple-500/40" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trend */}
      <Card className="border-border shadow-sm rounded-4xl overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/10 py-6 px-8">
          <CardTitle className="text-lg font-bold tracking-tight">Performance Trend</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="month" style={{ fontSize: '12px' }} />
              <YAxis style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: 'white' }} />
              <Legend />
              <Line
                type="monotone"
                dataKey="percentage"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 5 }}
                name="Percentage (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Performance */}
        <Card className="border-border shadow-sm rounded-4xl overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/10 py-6 px-8">
            <CardTitle className="text-lg font-bold tracking-tight">Subject Performance</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectData} margin={{ bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} style={{ fontSize: '11px' }} />
                <YAxis style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: 'white' }} />
                <Bar dataKey="score" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-6 space-y-3">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200/50">
                <p className="text-[10px] font-bold uppercase text-emerald-600 mb-1">Best Subject</p>
                <p className="text-sm font-bold text-emerald-900">{bestSubject.name} - {bestSubject.score}%</p>
              </div>
              <div className="p-4 bg-red-50 rounded-xl border border-red-200/50">
                <p className="text-[10px] font-bold uppercase text-red-600 mb-1">Needs Improvement</p>
                <p className="text-sm font-bold text-red-900">{weakSubject.name} - {weakSubject.score}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <Card className="border-border shadow-sm rounded-4xl overflow-hidden">
          <CardHeader className="border-b border-border/50  bg-muted/10 py-6 px-8">
            <CardTitle className="text-lg font-bold tracking-tight">Subject Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-8 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={subjectData} dataKey="score" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {subjectData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colours[index % colours.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.2)', border: 'none', borderRadius: '8px', color: 'white' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <Card className="border-border shadow-sm rounded-4xl overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/10 py-6 px-8">
          <CardTitle className="text-lg font-bold tracking-tight">Statistics</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Highest</p>
              <h3 className="text-3xl font-bold">{Math.max(...subjectData.map(s => s.score))}</h3>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Average</p>
              <h3 className="text-3xl font-bold">{Math.round(subjectData.reduce((sum, s) => sum + s.score, 0) / subjectData.length)}</h3>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Lowest</p>
              <h3 className="text-3xl font-bold">{Math.min(...subjectData.map(s => s.score))}</h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
