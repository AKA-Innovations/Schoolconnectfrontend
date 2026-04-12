'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { useClassSectionLists } from '@/hooks/useClasses';
import { useFilterAttendance, useStudentList } from '@/hooks/useStudents';
import {
  CheckCircle, XCircle, Clock, AlertTriangle, ClipboardCheck, Search, Users,
} from 'lucide-react';

const STATUS_CFG: Record<string, { color: string; icon: React.ElementType }> = {
  Present: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
  Absent: { color: 'bg-red-100 text-red-700', icon: XCircle },
  Late: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  HalfDay: { color: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
};

export default function CoordinatorAttendancePage() {
  const user = useAuthStore((s) => s.user);
  const coordClasses = user?.coordinatorClasses ?? [];

  const { data: sections = [] } = useClassSectionLists();
  const scopedSections = useMemo(
    () => (coordClasses.length > 0 ? sections.filter((s) => coordClasses.includes(s.className)) : sections),
    [sections, coordClasses],
  );

  const [selectedSection, setSelectedSection] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const selClass = scopedSections.find((s) => `${s.className}|${s.sectionName}` === selectedSection);
  const className = selClass?.className ?? '';
  const sectionName = selClass?.sectionName ?? '';

  const { data: attendance = [], isLoading: loadingAtt } = useFilterAttendance({
    className,
    sectionName,
    date,
  });

  const { data: studentList } = useStudentList({
    className,
    sectionName,
    limit: 500,
  });
  const students = studentList?.students ?? [];

  // Merge student list with attendance records
  const merged = useMemo(() => {
    if (!className) return [];
    const attMap = new Map(attendance.map((a) => [a.studentId, a]));
    return students.map((st) => {
      const att = attMap.get(st.id);
      return {
        id: st.id,
        firstName: st.firstName,
        lastName: st.lastName,
        rollNumber: st.academics?.[0]?.rollNumber ?? '',
        status: att?.status ?? null,
        remarks: att?.remarks ?? '',
      };
    });
  }, [students, attendance, className]);

  const filtered = useMemo(() => {
    let list = merged;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
          s.rollNumber?.toLowerCase().includes(q),
      );
    }
    if (statusFilter) {
      list = list.filter((s) => (statusFilter === 'Unmarked' ? !s.status : s.status === statusFilter));
    }
    return list;
  }, [merged, search, statusFilter]);

  // Stats
  const total = merged.length;
  const present = merged.filter((s) => s.status === 'Present').length;
  const absent = merged.filter((s) => s.status === 'Absent').length;
  const late = merged.filter((s) => s.status === 'Late').length;
  const unmarked = merged.filter((s) => !s.status).length;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <ClipboardCheck className="h-7 w-7 text-indigo-500" />
        <h1 className="text-2xl font-bold">Attendance Overview</h1>
      </div>

      {/* Filters row */}
      <Card className="erp-card">
        <CardContent className="p-4 flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Class — Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="h-9 rounded-lg border border-border/50 bg-background px-3 text-sm min-w-50"
            >
              <option value="">Select section</option>
              {scopedSections.map((s) => (
                <option key={`${s.className}|${s.sectionName}`} value={`${s.className}|${s.sectionName}`}>
                  {s.className} — {s.sectionName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Date</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-9 rounded-lg w-44"
            />
          </div>
          <div className="flex flex-col gap-1.5 flex-1 min-w-50">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name or roll number …"
                className="pl-9 h-9 rounded-lg"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI row */}
      {className && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Total', value: total, cls: 'text-foreground' },
            { label: 'Present', value: present, cls: 'text-green-600' },
            { label: 'Absent', value: absent, cls: 'text-red-600' },
            { label: 'Late', value: late, cls: 'text-yellow-600' },
            { label: 'Unmarked', value: unmarked, cls: 'text-muted-foreground' },
          ].map((k) => (
            <Card key={k.label} className="erp-card">
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-bold ${k.cls}`}>{k.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">{k.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Status filter chips */}
      {className && (
        <div className="flex flex-wrap gap-2">
          {['', 'Present', 'Absent', 'Late', 'HalfDay', 'Unmarked'].map((s) => (
            <Button
              key={s}
              size="sm"
              variant={statusFilter === s ? 'default' : 'outline'}
              className="rounded-lg text-xs h-7"
              onClick={() => setStatusFilter(s)}
            >
              {s || 'All'}
            </Button>
          ))}
        </div>
      )}

      {/* Table */}
      {!className ? (
        <Card className="erp-card">
          <CardContent className="p-12 text-center text-sm text-muted-foreground">
            <ClipboardCheck className="h-10 w-10 mx-auto mb-3 opacity-20" />
            Select a section and date to view attendance
          </CardContent>
        </Card>
      ) : loadingAtt ? (
        <div className="space-y-2 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="erp-card">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-20" />
            No students found
          </CardContent>
        </Card>
      ) : (
        <Card className="erp-card overflow-hidden">
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-muted/10">
                  {['#', 'Roll', 'Student Name', 'Status', 'Remarks'].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => {
                  const cfg = s.status ? STATUS_CFG[s.status] : null;
                  return (
                    <tr key={s.id} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                      <td className="py-3 px-4 text-sm text-muted-foreground">{i + 1}</td>
                      <td className="py-3 px-4 text-sm font-mono">{s.rollNumber || '—'}</td>
                      <td className="py-3 px-4 text-sm font-semibold">{s.firstName} {s.lastName}</td>
                      <td className="py-3 px-4">
                        {cfg ? (
                          <Badge className={`rounded-lg border-0 text-[9px] gap-1 ${cfg.color}`}>
                            <cfg.icon className="h-3 w-3" />
                            {s.status}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{s.remarks || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
