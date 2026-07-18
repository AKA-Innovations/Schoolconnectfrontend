'use client';

import React, { useMemo, useState } from 'react';
import { useClassSectionLists } from '@/hooks/useClasses';
import { useStudentList } from '@/hooks/useStudents';
import { CURRENT_SESSION } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Users, AlertTriangle, CheckCircle2, Search, TrendingUp } from 'lucide-react';

function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={`w-full bg-muted dark:bg-muted/20 rounded-full h-1.5 overflow-hidden ${className || ''}`}>
      <div
        className="bg-primary h-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function ClassCapacityAnalytics() {
  const { data: classSectionsData, isLoading: loadingClasses } = useClassSectionLists();
  const { data: studentData, isLoading: loadingStudents } = useStudentList({ limit: 10000 });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  const classSections = useMemo(() => {
    return Array.isArray(classSectionsData) ? classSectionsData : [];
  }, [classSectionsData]);

  // Unique sorted class names for dropdown selection
  const classNames = useMemo(() => {
    const names = new Set<string>();
    classSections.forEach((sec) => {
      if (sec.className) names.add(sec.className);
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [classSections]);

  // Aggregate student counts per section
  const sectionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const students = studentData?.items || [];
    students.forEach((student: any) => {
      if (student.status && student.status.toUpperCase() !== 'ACTIVE') {
        return;
      }
      const acad = student.academics?.find((a: any) => a.session === CURRENT_SESSION) || student.academics?.[0];
      if (acad) {
        const sectId = acad.classSectionId || acad.classSectionsId;
        if (sectId) {
          counts[sectId] = (counts[sectId] || 0) + 1;
        }
        if (acad.className && acad.sectionName) {
          const key = `${acad.className}_${acad.sectionName}`.toLowerCase();
          counts[key] = (counts[key] || 0) + 1;
        }
      }
    });
    return counts;
  }, [studentData]);

  // Calculate detailed items
  const capacityItems = useMemo(() => {
    return classSections.map((sec) => {
      const nameKey = `${sec.className}_${sec.sectionName}`.toLowerCase();
      const filled =
        sectionCounts[sec.masterSectionId] ||
        (sec.mappingId && sectionCounts[sec.mappingId]) ||
        sectionCounts[sec.id] ||
        sectionCounts[nameKey] ||
        0;

      const capacity = sec.maxLimit || 40; // Default capacity to 40 if unmarked
      const empty = Math.max(0, capacity - filled);
      const ratio = capacity > 0 ? (filled / capacity) * 100 : 0;

      let status: 'full' | 'optimal' | 'low' = 'optimal';
      if (ratio >= 95) status = 'full';
      else if (ratio < 30) status = 'low';

      return {
        ...sec,
        filled,
        capacity,
        empty,
        ratio,
        status,
      };
    });
  }, [classSections, sectionCounts]);

  // Overall Statistics
  const overallStats = useMemo(() => {
    let totalCapacity = 0;
    let totalFilled = 0;
    let fullSections = 0;
    let lowSections = 0;

    capacityItems.forEach((item) => {
      totalCapacity += item.capacity;
      totalFilled += item.filled;
      if (item.status === 'full') fullSections++;
      else if (item.status === 'low') lowSections++;
    });

    const totalEmpty = Math.max(0, totalCapacity - totalFilled);
    const overallRatio = totalCapacity > 0 ? (totalFilled / totalCapacity) * 100 : 0;

    return {
      totalCapacity,
      totalFilled,
      totalEmpty,
      overallRatio,
      fullSections,
      lowSections,
      totalSections: capacityItems.length,
    };
  }, [capacityItems]);

  // Chart Data preparation
  const chartData = useMemo(() => {
    // Group by class name for graph aggregation
    const classGroup: Record<string, { className: string; filled: number; empty: number; capacity: number }> = {};
    
    capacityItems.forEach((item) => {
      const cls = item.className;
      if (!classGroup[cls]) {
        classGroup[cls] = { className: `Class ${cls}`, filled: 0, empty: 0, capacity: 0 };
      }
      classGroup[cls].filled += item.filled;
      classGroup[cls].capacity += item.capacity;
      classGroup[cls].empty += item.empty;
    });

    return Object.values(classGroup).sort((a, b) => a.className.localeCompare(b.className, undefined, { numeric: true }));
  }, [capacityItems]);

  // Filtered list for detailed view
  const filteredItems = useMemo(() => {
    if (!selectedClass) {
      return [];
    }
    return capacityItems.filter((item) => {
      if (selectedClass !== 'all' && item.className !== selectedClass) {
        return false;
      }
      const search = searchTerm.toLowerCase();
      return (
        item.className.toLowerCase().includes(search) ||
        item.sectionName.toLowerCase().includes(search) ||
        (item.classTeacherName || '').toLowerCase().includes(search)
      );
    });
  }, [capacityItems, searchTerm, selectedClass]);

  if (loadingClasses || loadingStudents) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground animate-pulse">Analyzing capacity metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <Card className="rounded-2xl border-border bg-card">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Strength</span>
              <p className="text-3xl font-black tracking-tight">{overallStats.totalFilled} / {overallStats.totalCapacity}</p>
              <span className="text-xs text-muted-foreground/60 font-medium">Students enrolled vs seats</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/10">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Empty Seats</span>
              <p className="text-3xl font-black tracking-tight">{overallStats.totalEmpty}</p>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Seats available to fill</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-gradient-to-br from-rose-50/50 to-transparent dark:from-rose-950/10">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Full Sections</span>
              <p className="text-3xl font-black tracking-tight">{overallStats.fullSections} / {overallStats.totalSections}</p>
              <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">Sections at &ge; 95% capacity</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-950/10">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Occupancy Rate</span>
              <p className="text-3xl font-black tracking-tight">{overallStats.overallRatio.toFixed(1)}%</p>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Overall space utilization</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <TrendingUp className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main capacity chart */}
      <Card className="rounded-2xl border-border shadow-sm">
        <CardHeader className="py-6 px-8 border-b border-border/50 bg-muted/5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold tracking-tight">Class-wise Capacity Utilization</CardTitle>
              <CardDescription className="text-xs mt-1">Stacked strength chart comparing filled vs. empty seats according to grade configurations</CardDescription>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-primary" /> Enrolled Students</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-muted-foreground/20" /> Empty Capacity</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="className" tickLine={false} axisLine={false} style={{ fontSize: '11px', fontWeight: 600 }} />
                <YAxis tickLine={false} axisLine={false} style={{ fontSize: '11px', fontWeight: 600 }} />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  contentStyle={{ 
                    background: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ color: 'hsl(var(--foreground))', fontSize: '12px' }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}
                />
                <Bar dataKey="filled" stackId="a" fill="#10b981" name="Filled Seats" radius={[0, 0, 4, 4]} />
                <Bar dataKey="empty" stackId="a" fill="#e2e8f0" name="Empty Seats" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detail list controls & table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-sm font-bold tracking-wide uppercase text-foreground">Section Breakdowns</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Class filter dropdown */}
            <div className="w-40">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="h-10 rounded-xl border-border bg-card">
                  <SelectValue placeholder="Select Class..." />
                </SelectTrigger>
                <SelectContent>
                  {classNames.map((cName) => (
                    <SelectItem key={cName} value={cName}>
                      Class {cName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quick search input */}
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search teacher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl h-10 border-border bg-card"
              />
            </div>
          </div>
        </div>

        <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/10">
                    <th className="px-6 py-4 text-left font-bold text-xs uppercase tracking-widest text-muted-foreground">Class & Section</th>
                    <th className="px-6 py-4 text-left font-bold text-xs uppercase tracking-widest text-muted-foreground">Class Teacher</th>
                    <th className="px-6 py-4 text-left font-bold text-xs uppercase tracking-widest text-muted-foreground">Enrolled</th>
                    <th className="px-6 py-4 text-left font-bold text-xs uppercase tracking-widest text-muted-foreground">Capacity</th>
                    <th className="px-6 py-4 text-left font-bold text-xs uppercase tracking-widest text-muted-foreground">Space Utilization</th>
                    <th className="px-6 py-4 text-right font-bold text-xs uppercase tracking-widest text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {!selectedClass ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground font-semibold">
                        Please select a class from the dropdown to view its sections capacity breakdown.
                      </td>
                    </tr>
                  ) : filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        No sections found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr key={`${item.className}-${item.sectionName}`} className="hover:bg-muted/2 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary font-bold text-xs">
                              {item.className}
                            </div>
                            <span className="font-bold text-foreground">Section {item.sectionName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {item.classTeacherName ? (
                            <span className="font-semibold text-foreground/80">{item.classTeacherName}</span>
                          ) : (
                            <span className="text-muted-foreground/60 italic text-xs">Not Assigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-foreground">{item.filled} students</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-muted-foreground">{item.capacity} max</span>
                        </td>
                        <td className="px-6 py-4 w-1/4 min-w-[200px]">
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold">
                              <span>{item.ratio.toFixed(0)}% Filled</span>
                              <span className="text-muted-foreground">{item.empty} free</span>
                            </div>
                            <Progress value={item.ratio} className="h-1.5 rounded-full" />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {item.status === 'full' ? (
                            <Badge className="bg-rose-500/10 text-rose-600 border-0 shadow-none">Full</Badge>
                          ) : item.status === 'low' ? (
                            <Badge className="bg-amber-500/10 text-amber-600 border-0 shadow-none">Underfilled</Badge>
                          ) : (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-0 shadow-none">Optimal</Badge>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
