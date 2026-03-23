'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Users, Search, Eye, RefreshCw,
  Sparkles, X, LayoutGrid, List, MoreVertical,
  GraduationCap, ShieldCheck, Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

import { teacherService } from '@/services/teacher.service';
import { Teacher, TeacherFilterParams } from '@/types/roles';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { TeacherRegistrationForm } from '@/components/admin/TeacherRegistrationForm';
import { TeacherDetailsView } from '@/components/admin/TeacherDetailsView';

export function TeacherManagement() {
  const { schoolId } = useAuthStore();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'add' | 'details'>('list');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [filters, setFilters] = useState<TeacherFilterParams>({
    page: 1, pageSize: 10, schoolId: schoolId || '',
  });
  const [activeDropdown, setActiveDropdown] = useState<'class' | 'subject' | null>(null);

  // Mock data - in a real app, these would come from your schoolService or props
  const classOptions = ['Grade 10', 'Grade 11', 'Grade 12', 'Year 1', 'Year 2'];
  const subjectOptions = ['Mathematics', 'Physics', 'English', 'History', 'Computer Science'];
  const roles = [
    { label: 'All Staff', key: 'all', icon: Users },
    { label: 'Principals', key: 'isPrincipal', icon: ShieldCheck },
    { label: 'Coordinators', key: 'isCoordinator', icon: Briefcase },
    { label: 'Subject Teachers', key: 'isSubjectTeacher', icon: GraduationCap },
  ];

  useEffect(() => { loadTeachers(); }, [filters, searchTerm]);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const response = await teacherService.listTeachers({
        ...filters,
        firstName: searchTerm || undefined,
      });
      setTeachers(response.data || []);
      setTotalPages(Math.ceil((response.total || 0) / (filters.pageSize || 10)));
    } catch (error) {
      console.error(error);
    } finally { setLoading(false); }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({ page: 1, pageSize: 10, schoolId: schoolId || '' });
  };

  if (viewMode === 'add') return <TeacherRegistrationForm onCancel={() => setViewMode('list')} onSuccess={() => { setViewMode('list'); loadTeachers(); }} />;
  if (viewMode === 'details' && selectedTeacher) return <TeacherDetailsView teacherId={selectedTeacher.id} onBack={() => setViewMode('list')} />;

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 p-2 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600">
            <Sparkles size={14} className="animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Academic Management</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900/80">Faculty <span className="text-slate-400 font-light">Directory</span></h1>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => loadTeachers()} className="rounded-2xl h-12 w-12 border-slate-200">
            <RefreshCw className={cn("h-4 w-4 text-slate-500", loading && "animate-spin")} />
          </Button>
          <Button onClick={() => setViewMode('add')} className="h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-95">
            <Plus className="mr-2 h-5 w-5" />
            <span className="font-bold">Onboard Staff</span>
          </Button>
        </div>
      </div>

      {/* Modern Filter Card */}
      {/*  */}
      {/* Custom Filter Engine */}
      {/* Custom Filter Engine */}
      <div className="bg-white/80 backdrop-blur-2xl border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40 space-y-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">

          {/* Search Bar */}
          <div className="relative w-full lg:max-w-xs group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-11 pr-4 bg-slate-50/50 border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
            />
          </div>

          <div className="hidden lg:block w-px h-8 bg-slate-100" />

          {/* Custom Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-4">

            {/* Subject Dropdown */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'subject' ? null : 'subject')}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border transition-all",
                  filters.subjectId ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                )}
              >
                <GraduationCap size={14} />
                {filters.subjectId || "All Subjects"}
                <MoreVertical size={12} className="rotate-90 ml-1 opacity-40" />
              </button>

              <AnimatePresence>
                {activeDropdown === 'subject' && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full mt-2 left-0 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 overflow-hidden p-2"
                    >
                      {subjectOptions.map((sub) => (
                        <button
                          key={sub}
                          onClick={() => { setFilters({ ...filters, subjectId: sub }); setActiveDropdown(null); }}
                          className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-medium hover:bg-slate-50 text-slate-600 hover:text-indigo-600 transition-colors"
                        >
                          {sub}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Class Dropdown */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'class' ? null : 'class')}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border transition-all",
                  filters.classId ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                )}
              >
                <LayoutGrid size={14} />
                {filters.classId || "All Classes"}
                <MoreVertical size={12} className="rotate-90 ml-1 opacity-40" />
              </button>

              <AnimatePresence>
                {activeDropdown === 'class' && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full mt-2 left-0 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 overflow-hidden p-2"
                    >
                      {classOptions.map((cls) => (
                        <button
                          key={cls}
                          onClick={() => { setFilters({ ...filters, classId: cls }); setActiveDropdown(null); }}
                          className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-medium hover:bg-slate-50 text-slate-600 hover:text-purple-600 transition-colors"
                        >
                          {cls}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* Role Chips (Compact Version) */}
          <div className="flex flex-wrap gap-2 lg:ml-auto">
            {roles.filter(r => r.key !== 'all').map((role) => {
              const isActive = filters[role.key as keyof TeacherFilterParams];
              return (
                <button
                  key={role.key}
                  onClick={() => setFilters({ ...filters, [role.key]: !isActive })}
                  className={cn(
                    "p-2.5 rounded-xl transition-all border",
                    isActive ? "bg-slate-900 border-slate-900 text-white shadow-lg" : "bg-white border-slate-100 text-slate-400 hover:border-indigo-200 hover:text-indigo-600"
                  )}
                  title={role.label}
                >
                  <role.icon size={16} />
                </button>
              );
            })}
          </div>

          {/* Clear All Button */}
          <AnimatePresence>
            {(searchTerm || filters.subjectId || filters.classId) && (
              <motion.button
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-rose-500 font-bold text-[10px] uppercase hover:bg-rose-50 rounded-lg transition-colors"
              >
                <X size={14} /> Clear
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* Results Table */}
      <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/40 overflow-hidden bg-white">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-slate-50 bg-slate-50/50">
                <TableHead className="py-5 pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Identity</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Department</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Load</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
                <TableHead className="text-right pr-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Manage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={5} className="p-8"><Skeleton className="h-12 w-full rounded-2xl" /></TableCell></TableRow>
                ))
              ) : teachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-30">
                      <Users size={48} />
                      <p className="font-bold">No Staff Found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                teachers.map((teacher) => (
                  <TableRow key={teacher.id} className="group transition-colors hover:bg-indigo-50/30 border-b border-slate-50">
                    <TableCell className="py-5 pl-8">
                      <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
                          {teacher.firstName}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{teacher.firstName} {teacher.lastName}</span>
                          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">{teacher.employeeEmail}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-slate-100 text-slate-600 border-none px-3 py-1 rounded-lg font-bold text-[10px]">
                        {teacher.classes?.subjectName || 'General'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex -space-x-2">
                        {teacher.classes?.slice(0, 3).map((c, i) => (
                          <div key={i} className="h-7 px-2 flex items-center bg-white border border-slate-100 rounded-md text-[9px] font-black text-slate-500 shadow-sm">
                            {c.className}-{c.sectionName}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                        teacher.status === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
                      )}>
                        <div className={cn("h-1 w-1 rounded-full", teacher.status === 'active' ? "bg-emerald-600" : "bg-slate-400")} />
                        {teacher.status || 'Active'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-md" onClick={() => { setSelectedTeacher(teacher); setViewMode('details'); }}>
                          <Eye size={16} className="text-slate-400" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-md" onClick={() => { setSelectedTeacher(teacher); setViewMode('add'); }}>
                          <Edit size={16} className="text-slate-400" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-rose-50 text-rose-500" onClick={() => handleDeleteTeacher(teacher.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between p-6 bg-slate-50/50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Page {filters.page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="rounded-xl border-slate-200"
                disabled={filters.page === 1}
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                className="rounded-xl border-slate-200"
                disabled={filters.page === totalPages}
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}