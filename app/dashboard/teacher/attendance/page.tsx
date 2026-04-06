'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardCheck, Save, RefreshCw, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudentList } from '@/hooks/useStudents';
import { useBulkAttendance, useFilterAttendance } from '@/hooks/useStudents';

const statusOptions = ['Present', 'Absent', 'Late', 'HalfDay'] as const;
type AttendanceStatus = typeof statusOptions[number];

const statusStyles: Record<AttendanceStatus, string> = {
  Present: 'bg-success/10 text-success border-success/20',
  Absent: 'bg-destructive/10 text-destructive border-destructive/20',
  Late: 'bg-warning/10 text-warning border-warning/20',
  HalfDay: 'bg-primary/10 text-primary border-primary/20',
};

const statusIcons: Record<AttendanceStatus, React.ReactNode> = {
  Present: <CheckCircle2 size={12} />,
  Absent: <XCircle size={12} />,
  Late: <Clock size={12} />,
  HalfDay: <AlertCircle size={12} />,
};

export default function AttendancePage() {
  const [className, setClassName] = useState('');
  const [sectionName, setSectionName] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>({});
  const [success, setSuccess] = useState(false);

  const { data: studentData, isLoading: studentsLoading } = useStudentList({
    className: className || undefined,
    sectionName: sectionName || undefined,
    limit: 100,
  });

  const { data: existingAttendance } = useFilterAttendance({
    className: className || undefined,
    sectionName: sectionName || undefined,
    date,
  });

  const bulkMutation = useBulkAttendance();
  const students = studentData?.items ?? [];

  // Initialize attendance map when students load
  useMemo(() => {
    if (students.length === 0) return;
    const map: Record<string, { status: AttendanceStatus; remarks: string }> = {};
    students.forEach(s => {
      const existing = existingAttendance?.find((a: any) => a.studentId === s.id);
      map[s.id] = {
        status: existing?.status as AttendanceStatus ?? 'Present',
        remarks: existing?.remarks ?? '',
      };
    });
    setAttendanceMap(map);
  }, [students, existingAttendance]);

  const setStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap(prev => ({ ...prev, [studentId]: { ...prev[studentId], status } }));
  };

  const setStudentRemarks = (studentId: string, remarks: string) => {
    setAttendanceMap(prev => ({ ...prev, [studentId]: { ...prev[studentId], remarks } }));
  };

  const markAll = (status: AttendanceStatus) => {
    const map: Record<string, { status: AttendanceStatus; remarks: string }> = {};
    students.forEach(s => {
      map[s.id] = { status, remarks: attendanceMap[s.id]?.remarks ?? '' };
    });
    setAttendanceMap(map);
  };

  const handleSubmit = () => {
    if (!date || students.length === 0) return;
    const records = Object.entries(attendanceMap).map(([studentId, { status, remarks }]) => ({
      studentId,
      status,
      remarks: remarks || undefined,
    }));
    bulkMutation.mutate({ date, records }, {
      onSuccess: () => { setSuccess(true); setTimeout(() => setSuccess(false), 3000); },
    });
  };

  const summary = useMemo(() => {
    const counts = { Present: 0, Absent: 0, Late: 0, HalfDay: 0 };
    Object.values(attendanceMap).forEach(({ status }) => { counts[status]++; });
    return counts;
  }, [attendanceMap]);

  const hasClass = !!(className && sectionName);

  return (
    <div className="m-4 space-y-6 animate-in fade-in duration-500">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Attendance Management</h1>
        <p className="text-sm text-muted-foreground">Mark and manage daily student attendance</p>
      </div>

      {success && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-success/10 border border-success/20 text-success text-xs font-semibold">
          <CheckCircle2 size={14} /> Attendance saved successfully
        </div>
      )}

      {/* Filters */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground">Class</Label>
              <Input value={className} onChange={e => setClassName(e.target.value)} placeholder="e.g. 10" className="rounded-xl h-10" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground">Section</Label>
              <Input value={sectionName} onChange={e => setSectionName(e.target.value)} placeholder="e.g. A" className="rounded-xl h-10" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground">Date</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="rounded-xl h-10" />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSubmit} disabled={!hasClass || students.length === 0 || bulkMutation.isPending}
                className="w-full rounded-xl h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs">
                <Save size={14} className="mr-2" />{bulkMutation.isPending ? 'Saving...' : 'Save Attendance'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary cards */}
      {hasClass && students.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(Object.entries(summary) as [AttendanceStatus, number][]).map(([status, count]) => (
            <Card key={status} className="border-border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => markAll(status)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{status}</p>
                  <p className="text-2xl font-bold text-foreground">{count}</p>
                </div>
                <Badge className={cn('rounded-full border text-xs font-bold px-3 py-1', statusStyles[status])}>
                  {statusIcons[status]}
                  <span className="ml-1">Mark All</span>
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Student attendance table */}
      {hasClass ? (
        <Card className="border-border shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/10 py-4 px-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Class {className} - {sectionName}</CardTitle>
                <CardDescription className="text-xs mt-0.5">{students.length} students</CardDescription>
              </div>
              <div className="flex gap-2">
                {statusOptions.map(s => (
                  <Button key={s} variant="outline" size="sm" onClick={() => markAll(s)}
                    className="rounded-xl text-[10px] font-bold uppercase tracking-wider h-8 px-3">
                    All {s}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20 hover:bg-muted/20">
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-6 w-12">#</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Student</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Roll No</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pr-6">Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5} className="py-3 pl-6"><div className="h-8 bg-muted/40 rounded-lg animate-pulse" /></TableCell>
                    </TableRow>
                  ))
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <ClipboardCheck size={32} className="opacity-20" />
                        <p className="text-sm font-semibold">No students found for this class</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student, idx) => {
                    const att = attendanceMap[student.id];
                    const currentStatus = att?.status ?? 'Present';
                    return (
                      <TableRow key={student.id} className="hover:bg-muted/10 transition-colors border-b border-border/30">
                        <TableCell className="pl-6 text-xs font-bold text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-muted/40 flex items-center justify-center text-xs font-bold text-muted-foreground">
                              {student.firstName[0]}{student.lastName[0]}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{student.firstName} {student.lastName}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-medium text-muted-foreground">
                          {student.academics?.[0]?.rollNumber ?? '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1.5">
                            {statusOptions.map(s => (
                              <button key={s} onClick={() => setStudentStatus(student.id, s)}
                                className={cn(
                                  'px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border transition-all',
                                  currentStatus === s ? statusStyles[s] : 'border-border text-muted-foreground hover:border-primary/30'
                                )}>
                                {s === 'HalfDay' ? 'Half' : s.charAt(0)}
                              </button>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="pr-6">
                          <Input value={att?.remarks ?? ''} onChange={e => setStudentRemarks(student.id, e.target.value)}
                            placeholder="Optional" className="rounded-lg h-8 text-xs" />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border shadow-sm">
          <CardContent className="py-12 flex flex-col items-center gap-3 text-muted-foreground">
            <ClipboardCheck size={40} className="opacity-20" />
            <p className="text-sm font-semibold">Select a class and section to mark attendance</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
