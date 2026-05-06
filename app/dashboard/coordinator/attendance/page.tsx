'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { useClassSectionLists } from '@/hooks/useClasses';
import { useFilterAttendance, useStudentList, useBulkAttendance, useUpdateAttendance } from '@/hooks/useStudents';
import { teacherService } from '@/services/teacher.service';
import {
  CheckCircle, XCircle, Clock, AlertTriangle, ClipboardCheck, Search, Users,
  LayoutGrid, List, Save, ArrowLeft, AlertCircle, RefreshCw, ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const STATUS_CFG: Record<string, { color: string; icon: React.ElementType; style: string }> = {
  Present: { color: 'bg-green-100 text-green-700', icon: CheckCircle, style: 'bg-success/10 text-success border-success/20' },
  Absent: { color: 'bg-red-100 text-red-700', icon: XCircle, style: 'bg-destructive/10 text-destructive border-destructive/20' },
  Late: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, style: 'bg-warning/10 text-warning border-warning/20' },
  HalfDay: { color: 'bg-orange-100 text-orange-700', icon: AlertTriangle, style: 'bg-primary/10 text-primary border-primary/20' },
};

const statusOptions = ['Present', 'Absent', 'Late', 'HalfDay'] as const;
type AttendanceStatus = typeof statusOptions[number];

export default function CoordinatorAttendancePage() {
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);
  const coordClasses = user?.coordinatorClasses ?? [];

  const [viewMode, setViewMode] = useState<'grid' | 'detail'>('grid');
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedSection, setSelectedSection] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>({});

  // Background Sync: Refresh coordinator classes on mount
  useEffect(() => {
    if (user?.id && token) {
      const syncProfile = async () => {
        setIsSyncing(true);
        try {
          const details = await teacherService.getTeacherById(user.id);
          const newMappings = details.coordinatorMappings ?? [];
          
          // Only update if data actually changed (handle mixed types during transition)
          const currentIds = coordClasses.map(c => (typeof c === 'object' ? c.id : c)).sort();
          const newIds = newMappings.map(m => m.id).sort();

          if (JSON.stringify(currentIds) !== JSON.stringify(newIds)) {
            setAuth({
              user: { ...user, coordinatorClasses: newMappings },
              token: token
            });
            toast.info('Supervised classes updated');
          }
        } catch (err) {
          console.error('Failed to sync coordinator profile:', err);
        } finally {
          setIsSyncing(false);
        }
      };
      syncProfile();
    }
  }, [user?.id, token, setAuth]);

  const { data: allSections = [], isLoading: loadingSections } = useClassSectionLists();
  
  // Strict Filtering: Only show classes that match coordClasses.
  const scopedSections = useMemo(() => {
    if (coordClasses.length === 0) return [];
    
    // Safety: Handle both legacy string array and new object array formats
    const coordClassNames = coordClasses.map(c => 
      typeof c === 'object' ? c.className : c
    ).filter(Boolean);

    return allSections.filter((s) => coordClassNames.includes(s.className));
  }, [allSections, coordClasses]);

  const selSection = scopedSections.find((s) => `${s.className}|${s.sectionName}` === selectedSection);
  const className = selSection?.className ?? '';
  const sectionName = selSection?.sectionName ?? '';

  // Find corresponding session from profile mappings
  const session = useMemo(() => {
    const mapping = coordClasses.find(c => c.className === className);
    return mapping?.session ?? '';
  }, [coordClasses, className]);

  const { data: attendance = [], isLoading: loadingAtt } = useFilterAttendance({
    className,
    sectionName,
    session,
    date,
  });

  // DIAGNOSTIC LOGGING - To debug why "Update" button might be missing
  useEffect(() => {
    if (className && sectionName) {
      console.log('--- Coordinator Attendance Filter Debug ---');
      console.log('Params:', { className, sectionName, date, session });
      console.log('Result Count:', attendance.length);
      console.log('Results:', attendance);
    }
  }, [attendance, className, sectionName, date, session]);

  const { data: studentList } = useStudentList({
    className,
    sectionName,
    limit: 500,
  });
  const students = (studentList as any)?.items ?? [];

  const bulkMutation = useBulkAttendance();
  const updateMutation = useUpdateAttendance();

  // Initialize attendanceMap when viewing a specific class
  const serializedAttendance = JSON.stringify(attendance);
  const serializedStudents = JSON.stringify(students);

  useEffect(() => {
    if (viewMode === 'detail' && students.length > 0) {
      setAttendanceMap(prev => {
        const newMap: Record<string, { status: AttendanceStatus; remarks: string }> = { ...prev };
        const isNewDate = date !== lastSyncedKey.split('-')[0];

        students.forEach((s: any) => {
          const roll = s.academics?.[0]?.rollNumber;
          const fullName = `${s.firstName} ${s.lastName}`.toLowerCase().trim();
          
          const existing = attendance.find((a: any) => 
            (roll && String(a.studentRollNumber || a.rollNumber).trim() === String(roll).trim()) || 
            (a.studentId && String(a.studentId) === String(s.id)) ||
            (a.studentName && a.studentName.toLowerCase().trim() === fullName)
          );

          const currentLocal = newMap[s.id];
          
          // Sync Logic:
          // 1. First time init
          // 2. Date changed (reset)
          // 3. Fresh data arrived and local is still default 'Present'
          if (!currentLocal || isNewDate || (currentLocal.status === 'Present' && existing && existing.status !== 'Present')) {
            newMap[s.id] = {
              status: (existing?.status as AttendanceStatus) || 'Present',
              remarks: existing?.remarks ?? '',
            };
          }
        });
        return newMap;
      });
      setLastSyncedKey(`${date}-${students.length}-${attendance.length}`);
    }
  }, [viewMode, date, serializedAttendance, serializedStudents]);

  const setStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap(prev => ({ ...prev, [studentId]: { ...prev[studentId], status } }));
  };

  const isMarked = attendance.length > 0;

  const handleSave = async () => {
    if (!students.length || loadingAtt) return;
    
    const toAdd: any[] = [];
    const toUpdate: { recordId: number; status: string }[] = [];
    const currentSession = session || '2024-2025';

    students.forEach((s: any) => {
      const roll = s.academics?.[0]?.rollNumber;
      const fullName = `${s.firstName} ${s.lastName}`.toLowerCase().trim();
      
      const existing = attendance.find((a: any) => 
        (roll && String(a.studentRollNumber || a.rollNumber).trim() === String(roll).trim()) || 
        (a.studentId && String(a.studentId) === String(s.id)) ||
        (a.studentName && a.studentName.toLowerCase().trim() === fullName)
      );
      
      const newStatus = attendanceMap[s.id]?.status ?? 'Present';

      if (existing) {
        if (existing.status !== newStatus) {
          toUpdate.push({ recordId: Number(existing.recordId || existing.id), status: newStatus });
        }
      } else {
        toAdd.push({ 
          studentId: s.id, 
          attendanceStatus: newStatus,
          session: currentSession
        });
      }
    });

    if (toAdd.length === 0 && toUpdate.length === 0) {
      toast.info('No changes detected');
      return;
    }

    try {
      if (toAdd.length > 0) {
        await bulkMutation.mutateAsync({ 
          date, 
          session: currentSession,
          attendance: toAdd 
        });
      }
      
      if (toUpdate.length > 0) {
        await Promise.all(toUpdate.map(u => 
          updateMutation.mutateAsync({ 
            recordId: u.recordId, 
            data: { status: u.status } as any 
          })
        ));
      }

      toast.success(
        toAdd.length > 0 && toUpdate.length > 0 
          ? 'Attendance synchronized (new & updates)' 
          : toAdd.length > 0 
            ? 'Attendance submitted successfully' 
            : 'Attendance updates saved'
      );
    } catch (err: any) {
      console.error('Coordinator Sync Error:', err);
      toast.error(err.response?.data?.message || 'Failed to synchronize attendance');
    }
  };

  const handleSaveSingle = async (studentId: string) => {
    const s = students.find((st: any) => st.id === studentId);
    if (!s) return;

    const roll = s.academics?.[0]?.rollNumber;
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase().trim();
    
    const existing = attendance.find((a: any) => 
      (roll && String(a.studentRollNumber || a.rollNumber).trim() === String(roll).trim()) || 
      (a.studentId && String(a.studentId) === String(s.id)) ||
      (a.studentName && a.studentName.toLowerCase().trim() === fullName)
    );

    const newStatus = attendanceMap[studentId]?.status ?? 'Present';
    const currentSession = session || '2024-2025';

    try {
      if (existing) {
        if (existing.status !== newStatus) {
          await updateMutation.mutateAsync({ 
            recordId: Number(existing.recordId || existing.id), 
            data: { status: newStatus } as any 
          });
          toast.success(`Attendance updated for ${s.firstName}`);
        }
      } else {
        await bulkMutation.mutateAsync({
          date,
          session: currentSession,
          attendance: [{ studentId, attendanceStatus: newStatus, session: currentSession }]
        });
        toast.success(`Attendance marked for ${s.firstName}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save attendance');
    }
  };

  const stats = useMemo(() => {
    if (!className) return null;
    const total = students.length;
    const present = students.filter((s: any) => attendanceMap[s.id]?.status === 'Present').length;
    const absent = students.filter((s: any) => attendanceMap[s.id]?.status === 'Absent').length;
    const unMarked = students.length - (attendance?.length || 0);
    return { total, present, absent, unMarked };
  }, [students, attendanceMap, className, attendance]);

  const filtered = useMemo(() => {
    if (viewMode !== 'detail') return [];
    let list = students.map((st: any) => {
      const att = attendanceMap[st.id];
      return {
        ...st,
        currentStatus: att?.status ?? null,
        currentRemarks: att?.remarks ?? '',
      };
    });

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) => 
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) || 
        s.academics?.[0]?.rollNumber?.toLowerCase().includes(q)
      );
    }

    if (statusFilter) {
      list = list.filter((s) => (statusFilter === 'Unmarked' ? !s.currentStatus : s.currentStatus === statusFilter));
    }
    return list;
  }, [students, attendanceMap, search, statusFilter, viewMode]);

  // View Class Detail
  const openDetail = (sectionKey: string) => {
    setSelectedSection(sectionKey);
    setViewMode('detail');
  };

  if (viewMode === 'grid') {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LayoutGrid className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Coordinator Dashboard</h1>
              <p className="text-sm text-muted-foreground">Monitor and manage attendance across your {scopedSections.length} supervised classes</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-xl border">
            {isSyncing && (
              <div className="flex items-center gap-2 px-3 animate-pulse">
                <RefreshCw size={12} className="animate-spin text-primary" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Syncing Profile</span>
              </div>
            )}
            <Button variant="ghost" size="sm" className="rounded-lg bg-background shadow-xs h-8 text-xs font-bold">
              <LayoutGrid size={14} className="mr-2" /> Grid View
            </Button>
            <Input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              className="h-8 w-40 text-xs border-none bg-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(loadingSections || isSyncing) ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center space-y-4">
              <RefreshCw className="h-10 w-10 text-primary animate-spin" />
              <p className="text-sm font-bold text-muted-foreground animate-pulse">Synchronizing Class Permissions...</p>
            </div>
          ) : scopedSections.length === 0 ? (
            <Card className="col-span-full py-12 border-dashed bg-muted/20">
              <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <ShieldAlert className="text-muted-foreground h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">No Classes Assigned</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">You are not currently assigned to supervise any classes. Please contact the administrator.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            scopedSections.map((s) => {
              const sectionKey = `${s.className}|${s.sectionName}`;
              return (
                <Card 
                  key={sectionKey} 
                  className="group border-border hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg rounded-2xl overflow-hidden"
                  onClick={() => openDetail(sectionKey)}
                >
                  <div className="h-2 w-full bg-muted group-hover:bg-primary/20 transition-colors" />
                  <CardContent className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-foreground">Class {s.className}</h3>
                        <p className="text-sm font-semibold text-muted-foreground">Section {s.sectionName}</p>
                      </div>
                      <Badge variant="outline" className="rounded-lg border-border/50 text-[10px] font-bold uppercase tracking-wider">
                        Live Status
                      </Badge>
                    </div>
                    
                    <div className="pt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users size={16} />
                        <span className="text-xs font-semibold">Multiple Students</span>
                      </div>
                      <Button variant="secondary" size="sm" className="rounded-xl h-8 text-[10px] font-bold uppercase transition-transform group-hover:scale-105">
                        {/* Note: This is a static card in grid, actual status depends on data which is handled in detail view */}
                        Open Class Dashboard
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setViewMode('grid')} className="rounded-xl pl-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} className="mr-2" /> Back to Overview
        </Button>
        <div className="flex items-center gap-2">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 rounded-full text-xs font-bold">
            Coordinator View
          </Badge>
          <Input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            className="h-9 w-40 rounded-xl"
          />
        </div>
      </div>

      <Card className="border-border shadow-sm overflow-hidden rounded-2xl">
        <CardHeader className="border-b border-border/50 bg-muted/10 py-5 px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl font-bold">Class {className} — {sectionName}</CardTitle>
                {attendance.length > 0 ? (
                  <Badge className="bg-success/10 text-success border-success/20 font-bold">Marked</Badge>
                ) : (
                  <Badge className="bg-warning/10 text-warning border-warning/20 font-bold">Pending</Badge>
                )}
              </div>
              <CardDescription>{students.length} students enrolled in this section</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleSave} 
                disabled={bulkMutation.isPending || updateMutation.isPending || students.length === 0}
                className={cn(
                  "rounded-xl font-bold h-10 px-6 shadow-sm transition-all",
                  isMarked ? "bg-amber-600 hover:bg-amber-700 shadow-amber-200" : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                )}
              >
                {isMarked ? <Save size={16} className="mr-2" /> : <ClipboardCheck size={16} className="mr-2" />}
                {bulkMutation.isPending || updateMutation.isPending 
                  ? 'Saving...' 
                  : isMarked 
                    ? 'Save Attendance Updates' 
                    : 'Submit Initial Attendance'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-muted/30 border-none">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <span className="text-2xl font-black text-foreground">{stats?.total ?? 0}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Students</span>
              </CardContent>
            </Card>
            <Card className="bg-success/5 border-none">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <span className="text-2xl font-black text-success">{stats?.present ?? 0}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-success/60">Present</span>
              </CardContent>
            </Card>
            <Card className="bg-destructive/5 border-none">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <span className="text-2xl font-black text-destructive">{stats?.absent ?? 0}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-destructive/60">Absent</span>
              </CardContent>
            </Card>
            <Card className="bg-warning/5 border-none">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <span className="text-2xl font-black text-warning">{stats?.unMarked ?? 0}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-warning/60">Unmarked</span>
              </CardContent>
            </Card>
          </div>

          {/* Table Filters */}
          <div className="flex items-center gap-4 mb-4">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  placeholder="Filter by student name or roll number..." 
                  className="pl-10 h-10 rounded-xl"
                />
             </div>
             <div className="flex gap-2">
               {['', 'Present', 'Absent', 'Unmarked'].map(s => (
                 <Button 
                   key={s} 
                   variant={statusFilter === s ? 'default' : 'outline'} 
                   size="sm" 
                   onClick={() => setStatusFilter(s)}
                   className="rounded-lg h-10 px-4 text-xs font-bold"
                 >
                   {s || 'All'}
                 </Button>
               ))}
             </div>
          </div>

          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-4 font-bold text-muted-foreground text-[10px] uppercase tracking-widest w-12 text-center">#</th>
                  <th className="text-left p-4 font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Student</th>
                  <th className="text-left p-4 font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Roll</th>
                  <th className="text-left p-4 font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Status</th>
                  <th className="text-left p-4 font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                  {filtered.map((s, i) => {
                    const roll = s.academics?.[0]?.rollNumber;
                    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase().trim();
                    const existingVal = attendance.find((a: any) => 
                      (roll && String(a.studentRollNumber || a.rollNumber).trim() === String(roll).trim()) || 
                      (a.studentId && String(a.studentId) === String(s.id)) ||
                      (a.studentName && a.studentName.toLowerCase().trim() === fullName)
                    );
                    const att = attendanceMap[s.id];

                    return (
                      <tr key={s.id} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                        <td className="p-4 text-center font-bold text-muted-foreground">{i + 1}</td>
                        <td className="p-4 font-bold">{s.firstName} {s.lastName}</td>
                        <td className="p-4 font-mono text-muted-foreground">
                          {s.academics?.[0]?.rollNumber || '—'}
                        </td>
                        <td className="p-4">
                          {existingVal ? (
                            <Badge className={cn("rounded-lg border-0 text-[10px]", STATUS_CFG[existingVal.status]?.style)}>
                              {existingVal.status}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="rounded-lg text-[10px] opacity-40">Unmarked</Badge>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                              {statusOptions.map(st => (
                                <button
                                  key={st}
                                  onClick={() => setStudentStatus(s.id, st)}
                                  className={cn(
                                    "px-2 py-1 rounded text-[10px] font-bold border transition-all",
                                    att?.status === st 
                                      ? STATUS_CFG[st].style 
                                      : "bg-transparent text-muted-foreground hover:border-primary/50"
                                  )}
                                >
                                  {st === 'HalfDay' ? 'Half' : st.charAt(0)}
                                </button>
                              ))}
                            </div>
                            {(att?.status !== existingVal?.status) && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleSaveSingle(s.id)}
                                className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10 rounded-lg group"
                                title="Update student attendance"
                              >
                                <Save size={14} className="transition-transform group-hover:scale-110" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
