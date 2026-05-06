'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { useClassSectionLists } from '@/hooks/useClasses';
import { useFilterAttendance, useStudentList, useBulkAttendance, useUpdateAttendance } from '@/hooks/useStudents';
import {
  ShieldCheck, LayoutGrid, Search, Users, Save, ArrowLeft,
  Filter, CheckCircle, XCircle, Clock, AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const STATUS_CFG: Record<string, { style: string }> = {
  Present: { style: 'bg-success/10 text-success border-success/20' },
  Absent: { style: 'bg-destructive/10 text-destructive border-destructive/20' },
  Late: { style: 'bg-warning/10 text-warning border-warning/20' },
  HalfDay: { style: 'bg-primary/10 text-primary border-primary/20' },
};

const statusOptions = ['Present', 'Absent', 'Late', 'HalfDay'] as const;
type AttendanceStatus = typeof statusOptions[number];

export default function AdminAttendancePage() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.setAuth);

  const [viewMode, setViewMode] = useState<'overview' | 'detail'>('overview');
  const [selectedSection, setSelectedSection] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [search, setSearch] = useState('');
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>({});

  const { data: allSections = [] } = useClassSectionLists();
  
  const selClass = allSections.find((s) => `${s.className}|${s.sectionName}` === selectedSection);
  const className = selClass?.className ?? '';
  const sectionName = selClass?.sectionName ?? '';
  const session = selClass?.session || '';

  const { data: attendance = [], isLoading: loadingAtt } = useFilterAttendance({
    className,
    sectionName,
    session,
    date,
  });

  const { data: studentList } = useStudentList({
    className,
    sectionName,
    limit: 500,
  });
  const students = (studentList as any)?.items ?? [];

  const bulkMutation = useBulkAttendance();
  const updateMutation = useUpdateAttendance();

  // Stabilize initialization
  const serializedAttendance = JSON.stringify(attendance);
  const serializedStudents = JSON.stringify(students);

  useEffect(() => {
    if (viewMode === 'detail' && students.length > 0) {
      const newMap: Record<string, { status: AttendanceStatus; remarks: string }> = {};
      students.forEach((s: any) => {
        const existing = attendance.find((a: any) => a.studentId === s.id);
        newMap[s.id] = {
          status: (existing?.status as AttendanceStatus) ?? 'Present',
          remarks: existing?.remarks ?? '',
        };
      });
      setAttendanceMap(newMap);
    }
  }, [viewMode, serializedAttendance, serializedStudents]);

  const isMarked = attendance.length > 0;

  const handleSave = async () => {
    if (!students.length || loadingAtt) return;
    
    const toAdd: any[] = [];
    const toUpdate: { recordId: number; status: string }[] = [];

    students.forEach((s: any) => {
      const existing = attendance.find((a: any) => String(a.studentId) === String(s.id));
      const newStatus = attendanceMap[s.id]?.status ?? 'Present';

      if (existing) {
        if (existing.status !== newStatus) {
          toUpdate.push({ recordId: existing.id, status: newStatus });
        }
      } else {
        toAdd.push({ studentId: s.id, attendanceStatus: newStatus });
      }
    });

    if (toAdd.length === 0 && toUpdate.length === 0) {
      toast.info('No changes detected');
      return;
    }

    try {
      if (toAdd.length > 0) {
        await bulkMutation.mutateAsync({ date, attendance: toAdd });
      }
      
      if (toUpdate.length > 0) {
        await Promise.all(toUpdate.map(u => 
          updateMutation.mutateAsync({ recordId: u.recordId, data: { status: u.status } as any })
        ));
      }

      toast.success(
        toAdd.length > 0 && toUpdate.length > 0 
          ? 'Attendance synchronized successfully' 
          : toAdd.length > 0 
            ? 'Initial attendance submitted' 
            : 'Attendance updates saved'
      );
    } catch (err: any) {
      console.error('Admin Sync Error:', err);
      toast.error(err.response?.data?.message || 'Failed to synchronize attendance');
    }
  };

  const filteredSections = useMemo(() => {
    if (!search) return allSections;
    const q = search.toLowerCase();
    return allSections.filter(s => 
      s.className.toLowerCase().includes(q) || 
      s.sectionName.toLowerCase().includes(q)
    );
  }, [allSections, search]);

  if (viewMode === 'overview') {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">School Attendance Center</h1>
              <p className="text-sm text-muted-foreground">Global administrative access for all {allSections.length} classes</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  placeholder="Search class or section..." 
                  className="pl-10 h-10 w-64 rounded-xl border-border/50 shadow-xs focus:ring-primary/20 transition-all"
                />
             </div>
             <Input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              className="h-10 w-40 rounded-xl font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredSections.map((s) => {
            const sectionKey = `${s.className}|${s.sectionName}`;
            return (
              <Card 
                key={sectionKey} 
                className="group border-border/50 hover:border-primary/40 hover:shadow-xl transition-all cursor-pointer rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm"
                onClick={() => {
                  setSelectedSection(sectionKey);
                  setViewMode('detail');
                }}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 rounded-lg px-2 text-[10px] font-bold">
                       CLASSROOM
                    </Badge>
                    <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-foreground">{s.className}</h3>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Section {s.sectionName}</p>
                  </div>
                  <div className="pt-2 border-t border-border/10 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground">CLICK TO MANAGE</span>
                    <ArrowLeft className="h-4 w-4 text-primary rotate-180 opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setViewMode('overview')} className="rounded-xl pl-2 font-bold hover:bg-muted/50">
          <ArrowLeft size={16} className="mr-2" /> School Overview
        </Button>
        <div className="flex items-center gap-2">
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold">
            Administrative Override
          </Badge>
          <Input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            className="h-10 w-44 rounded-xl font-bold"
          />
        </div>
      </div>

      <Card className="border-border/50 shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-muted/10 pb-8 pt-8 px-8">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-4xl font-black tracking-tighter">Class {className} — {sectionName}</h2>
                </div>
                <p className="text-muted-foreground font-medium flex items-center gap-2">
                  <Users size={18} /> {students.length} Total Students
                </p>
              </div>
              <Button 
                onClick={handleSave} 
                disabled={bulkMutation.isPending || updateMutation.isPending || students.length === 0}
                className={cn(
                  "rounded-2xl text-white font-black h-14 px-10 shadow-xl transition-all",
                  isMarked ? "bg-amber-600 hover:bg-amber-700 shadow-amber-200/20" : "bg-blue-600 hover:bg-blue-700 shadow-blue-200/20"
                )}
              >
                {isMarked ? <Save size={20} className="mr-3" /> : <ClipboardCheck size={20} className="mr-3" />}
                {bulkMutation.isPending || updateMutation.isPending 
                  ? 'Saving...' 
                  : isMarked 
                    ? 'Save Attendance Updates' 
                    : 'Submit Initial Attendance'}
              </Button>
           </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="border rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full">
               <thead className="bg-muted/30">
                 <tr>
                    <th className="p-5 text-left text-[11px] font-black uppercase tracking-widest text-muted-foreground w-16 text-center">#</th>
                    <th className="p-5 text-left text-[11px] font-black uppercase tracking-widest text-muted-foreground">Student Identity</th>
                    <th className="p-5 text-left text-[11px] font-black uppercase tracking-widest text-muted-foreground">Roll No.</th>
                    <th className="p-5 text-left text-[11px] font-black uppercase tracking-widest text-muted-foreground">Current Status</th>
                    <th className="p-5 text-left text-[11px] font-black uppercase tracking-widest text-muted-foreground">Override Actions</th>
                 </tr>
               </thead>
               <tbody>
                 {students.map((s: any, i: number) => {
                   const att = attendanceMap[s.id];
                   return (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-muted/5 transition-all">
                      <td className="p-5 text-center font-bold text-muted-foreground">{i + 1}</td>
                      <td className="p-5">
                         <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-xs">
                               {s.firstName[0]}{s.lastName[0]}
                            </div>
                            <span className="font-bold text-lg">{s.firstName} {s.lastName}</span>
                         </div>
                      </td>
                      <td className="p-5 font-mono font-bold text-muted-foreground">
                        {s.academics?.[0]?.rollNumber || '---'}
                      </td>
                      <td className="p-5">
                        {att?.status ? (
                          <Badge className={cn("rounded-xl border-none font-bold py-1 px-3", STATUS_CFG[att.status]?.style)}>
                             {att.status}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="rounded-xl font-bold py-1 px-3 opacity-30">NOT RECORDED</Badge>
                        )}
                      </td>
                      <td className="p-5">
                         <div className="flex gap-2">
                            {statusOptions.map(st => (
                              <button 
                                key={st} 
                                onClick={() => setStudentStatus(s.id, st as AttendanceStatus)}
                                className={cn(
                                  "h-10 w-10 flex items-center justify-center rounded-xl text-xs font-black border-2 transition-all",
                                  att?.status === st 
                                    ? "border-primary bg-primary text-primary-foreground shadow-lg scale-110" 
                                    : "border-border hover:border-primary/50 text-muted-foreground"
                                )}
                              >
                                {st.charAt(0)}
                              </button>
                            ))}
                         </div>
                      </td>
                    </tr>
                 )})}
               </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  function setStudentStatus(studentId: string, status: AttendanceStatus) {
    setAttendanceMap(prev => ({ ...prev, [studentId]: { ...prev[studentId], status } }));
  }
}
