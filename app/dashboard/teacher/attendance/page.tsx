'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardCheck, Save, CheckCircle2, XCircle, Clock, AlertCircle, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudentList, useBulkAttendance, useFilterAttendance, useUpdateAttendance } from '@/hooks/useStudents';
import { useClassSectionLists } from '@/hooks/useClasses';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { CURRENT_SESSION } from '@/lib/constants';
import { DatePicker } from '@/components/ui/datepicker';
import { RefreshCw } from 'lucide-react';

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
  const user = useAuthStore((s) => s.user);
  const assignedClass = (user?.classTeacherClass as any) ?? null;

  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>({});

  const { data: allSections = [] } = useClassSectionLists();
  
  // Resolve assignedClass names if they are missing but ID is present (lookup from allSections)
  const resolvedAssignedClass = useMemo(() => {
    if (!assignedClass) return null;
    if (assignedClass.className && assignedClass.sectionName && assignedClass.classDtlsId) return assignedClass;

    // Try to find names/IDs in allSections list by ID (string-safe) or by name matching
    const match = allSections.find(s => 
      (assignedClass.classDtlsId && String(s.id) === String(assignedClass.classDtlsId)) || 
      (assignedClass.classDtlsId && String(s.masterSectionId) === String(assignedClass.classDtlsId)) || 
      (assignedClass.classDtlsId && String(s.mappingId) === String(assignedClass.classDtlsId)) || 
      (assignedClass.id && String(s.id) === String(assignedClass.id)) ||
      (assignedClass.id && String(s.masterSectionId) === String(assignedClass.id)) ||
      (assignedClass.id && String(s.mappingId) === String(assignedClass.id)) ||
      (s.className && s.sectionName && 
       String(s.className).toLowerCase().replace('class ', '').trim() === String(assignedClass.className).toLowerCase().replace('class ', '').trim() && 
       String(s.sectionName).toLowerCase() === String(assignedClass.sectionName).toLowerCase())
    );
    if (match) {
      return {
        ...assignedClass,
        classDtlsId: match.masterSectionId || match.id || match.mappingId,
        className: match.className,
        sectionName: match.sectionName
      };
    }
    return assignedClass;
  }, [assignedClass, allSections]);

  const className = resolvedAssignedClass?.className || '';
  const sectionName = resolvedAssignedClass?.sectionName || '';
  const targetId = resolvedAssignedClass?.classDtlsId;
  const isResolved = !!(className && sectionName && targetId);

  const { data: studentData, isLoading: studentsLoading } = useStudentList({
    classSectionId: targetId,
    limit: 100,
  }, { enabled: isResolved });

  const { data: existingAttendance } = useFilterAttendance({
    classSectionId: targetId,
    date,
  }, { enabled: isResolved });

  const bulkMutation = useBulkAttendance();
  const updateMutation = useUpdateAttendance();
  const students = studentData?.items ?? [];
  const existingAttendanceRecords = useMemo(() => {
    if (Array.isArray(existingAttendance)) return existingAttendance;
    if (Array.isArray((existingAttendance as any)?.items)) return (existingAttendance as any).items;
    if (Array.isArray((existingAttendance as any)?.data)) return (existingAttendance as any).data;
    return [];
  }, [existingAttendance]);

  // Initialize attendance map when students load
  useEffect(() => {
    if (students.length === 0) return;
    
    const newMap: Record<string, { status: AttendanceStatus; remarks: string }> = {};
    let hasChanges = false;
    
    students.forEach(s => {
      const studentRoll = s.academics?.[0]?.rollNumber;
      const existing = existingAttendanceRecords.find((a: any) => 
        (a.studentId && a.studentId === s.id) || 
        (studentRoll && (a.studentRollNumber === studentRoll || a.rollNumber === studentRoll))
      );
      
      const status = (existing?.attendanceStatus || existing?.status || 'Present') as AttendanceStatus;
      const remarks = existing?.remarks ?? '';
      
      newMap[s.id] = { status, remarks };
      
      const current = attendanceMap[s.id];
      if (!current || current.status !== status || current.remarks !== remarks) {
        hasChanges = true;
      }
    });

    if (hasChanges || Object.keys(attendanceMap).length !== students.length) {
      setAttendanceMap(newMap);
    }
  }, [students, existingAttendanceRecords]);

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
    
    // The bulk API strictly expects only studentId and attendanceStatus
    const attendance = Object.entries(attendanceMap).map(([studentId, { status }]) => ({
      studentId,
      attendanceStatus: status,
    }));

    bulkMutation.mutate(
      { 
        date, 
        session: CURRENT_SESSION,
        attendance 
      }, 
      {
        onSuccess: () => {
          toast.success('Attendance marked successfully for the class');
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || 'Failed to submit attendance');
        }
      }
    );
  };

  const handleIndividualUpdate = (studentId: string) => {
    const att = attendanceMap[studentId];
    const studentRoll = students.find(s => s.id === studentId)?.academics?.[0]?.rollNumber;
    
    const existing = existingAttendanceRecords.find((a: any) => 
      (a.studentId && a.studentId === studentId) || 
      (studentRoll && (a.studentRollNumber === studentRoll || a.rollNumber === studentRoll))
    );

    const recordId = existing?.recordId || existing?.id;
    
    if (!recordId) {
      toast.error('No existing record found to update. Use bulk save instead.');
      return;
    }

    updateMutation.mutate(
      { 
        recordId, 
        data: { 
          status: att.status as any,
          attendanceStatus: att.status 
        } 
      },
      {
        onSuccess: () => {
          toast.success('Record updated successfully');
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || 'Failed to update record');
        }
      }
    );
  };

  const summary = useMemo(() => {
    const counts = { Present: 0, Absent: 0, Late: 0, HalfDay: 0 };
    Object.values(attendanceMap).forEach(({ status }) => { counts[status]++; });
    return counts;
  }, [attendanceMap]);

  const hasClass = !!(className && sectionName);

  // ── Access Check ──────────────────────────────────────────────────────────
  // Allow entry if they have a resolved assigned class from profile
  const canAccess = !!resolvedAssignedClass;

  if (!canAccess) {
    return (
      <div className="m-4 space-y-6 animate-in fade-in duration-500">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Attendance Management</h1>
          <p className="text-sm text-muted-foreground">Mark and manage daily student attendance</p>
        </div>
        <Card className="border-border shadow-sm">
          <CardContent className="py-16 flex flex-col items-center gap-4 text-muted-foreground">
            <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <ShieldAlert size={32} className="text-destructive" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-base font-bold text-foreground">Access Restricted</p>
              <p className="text-sm max-w-md">
                Attendance management is only available for class teachers. You are not currently assigned as a class teacher for any class.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="m-4 space-y-6 animate-in fade-in duration-500">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Attendance Management</h1>
        <p className="text-sm text-muted-foreground">Mark and manage daily student attendance</p>
      </div>
      {/* Filters — class/section locked to assigned class */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground">Class</Label>
              <Input
                value={className}
                readOnly
                disabled
                className="rounded-xl h-10 bg-muted/30 cursor-not-allowed"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground">Section</Label>
              <Input
                value={sectionName}
                readOnly
                disabled
                className="rounded-xl h-10 bg-muted/30 cursor-not-allowed"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground block">Date</Label>
              <DatePicker value={date} onChange={setDate} className="w-full sm:w-full" buttonClassName="h-10 rounded-xl" />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleSubmit} 
                disabled={!hasClass || students.length === 0 || bulkMutation.isPending || existingAttendanceRecords.length > 0}
                className="w-full rounded-xl h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs"
              >
                <Save size={14} className="mr-2" />
                {existingAttendanceRecords.length > 0 ? 'Attendance Already Marked' : (bulkMutation.isPending ? 'Saving...' : 'Save Attendance')}
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
                          <div className="flex items-center gap-2">
                            <Input 
                              value={att?.remarks ?? ''} 
                              onChange={e => setStudentRemarks(student.id, e.target.value)}
                              placeholder="Optional" 
                              className="rounded-lg h-8 text-xs flex-1" 
                            />
                            {(() => {
                              const studentRoll = student.academics?.[0]?.rollNumber;
                              const existing = existingAttendanceRecords.find((a: any) => 
                                (a.studentId && a.studentId === student.id) || 
                                (studentRoll && (a.studentRollNumber === studentRoll || a.rollNumber === studentRoll))
                              );
                              
                              if (existing) {
                                return (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleIndividualUpdate(student.id)}
                                    disabled={updateMutation.isPending}
                                    className="h-8 w-8 rounded-lg p-0 border-slate-200 hover:bg-primary/5 hover:text-primary transition-all"
                                    title="Update this record only"
                                  >
                                    {updateMutation.isPending ? (
                                      <RefreshCw size={12} className="animate-spin" />
                                    ) : (
                                      <Save size={12} />
                                    )}
                                  </Button>
                                );
                              }
                              return null;
                            })()}
                          </div>
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
