'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminService } from '@/services/admin.service';
import { Student } from '@/types/roles';
import {
  Plus, Edit, Trash2, Search, Filter, GraduationCap,
  Download, UserPlus, Users, ArrowRight, Mail,
  Phone, Save, X, LayoutGrid, CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

export function StudentManagement() {
  const { schoolId } = useAuthStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<'grade' | 'status' | 'class' | null>(null);

  // Pagination & Dialog States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    grade: '',
    class: '',
    phone: '',
    parentName: '',
    parentPhone: '',
    schoolId: schoolId || '1'
  });

  // Mock Options
  const gradeOptions = ['9', '10', '11', '12'];
  const classOptions = ['A', 'B', 'C', 'D'];
  const statusOptions = ['active', 'inactive'];

  useEffect(() => {
    loadStudents();
  }, [currentPage, searchTerm, gradeFilter, statusFilter, classFilter]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const filters: any = {
        schoolId: schoolId || '1',
        grade: gradeFilter,
        status: statusFilter,
        class: classFilter
      };
      const response = await adminService.getStudents(currentPage, 10, filters);
      setStudents(response.students);
      setTotalPages(Math.ceil(response.total / 10));
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async () => {
    try {
      await adminService.addStudent({
        ...formData,
        status: 'active',
        enrollmentDate: new Date().toISOString().split('T')
      });
      setIsAddDialogOpen(false);
      resetForm();
      loadStudents();
    } catch (error) { console.error(error); }
  };

  const handleUpdateStudent = async () => {
    if (!selectedStudent) return;
    try {
      await adminService.updateStudent(selectedStudent.id, formData);
      setIsEditDialogOpen(false);
      resetForm();
      loadStudents();
    } catch (error) { console.error(error); }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Disable this student record?')) return;
    try {
      await adminService.deleteStudent(id);
      loadStudents();
    } catch (error) { console.error(error); }
  };

  const resetForm = () => {
    setFormData({
      name: '', email: '', grade: '', class: '',
      phone: '', parentName: '', parentPhone: '',
      schoolId: schoolId || '1'
    });
    setSelectedStudent(null);
  };

  const openEditDialog = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      grade: student.grade,
      class: student.class,
      phone: student.phone || '',
      parentName: student.parentName || '',
      parentPhone: student.parentPhone || '',
      schoolId: student.schoolId
    });
    setIsEditDialogOpen(true);
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-[0.3em]">
            <div className="h-1 w-6 bg-indigo-600 rounded-full" />
            Academic Registry
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900/80">Student Corpus</h1>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-2xl border-slate-200 hover:bg-slate-50 font-bold text-xs h-11 px-6 shadow-sm transition-all">
            <Download className="mr-2 h-4 w-4 text-slate-500" /> Export CSV
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs h-11 px-8 shadow-xl shadow-indigo-100 transition-all">
                <UserPlus className="mr-2 h-4 w-4" /> Enroll Student
              </Button>
            </DialogTrigger>
            {/* Add Dialog Content - Simplified for brevity but keeps your structure */}
            <DialogContent className="max-w-xl rounded-[2.5rem] border-none shadow-2xl p-8">
              <DialogHeader><DialogTitle className="text-2xl font-bold">New Enrollment</DialogTitle></DialogHeader>
              {/* Form Fields... */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Input placeholder="Full Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                <Input placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                <Input placeholder="Grade" value={formData.grade} onChange={e => setFormData({ ...formData, grade: e.target.value })} />
                <Input placeholder="Class" value={formData.class} onChange={e => setFormData({ ...formData, class: e.target.value })} />
              </div>
              <Button onClick={handleAddStudent} className="w-full mt-6 rounded-xl bg-slate-900 h-12">Confirm Enrollment</Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filter Engine */}
      <div className="bg-white z-10 border border-slate-100 rounded-[2.5rem] p-2 shadow-xl shadow-slate-200/40">
        <div className="flex flex-wrap items-center gap-4">

          {/* Search Box */}
          <div className="relative flex-[1_1_350px] group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 transition-colors" />
            <Input
              placeholder="Search by scholar identity or digital mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-12 bg-slate-50/50 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-500/5 rounded-2xl text-sm font-medium transition-all"
            />
          </div>

          <div className="hidden lg:block w-px h-8 bg-slate-100 mx-2" />

          {/* Custom Dropdown Pills */}
          <div className="flex items-center gap-3">

            {/* Grade Filter */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'grade' ? null : 'grade')}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest border transition-all",
                  gradeFilter ? "bg-indigo-50 border-indigo-100 text-indigo-700" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                )}
              >
                <GraduationCap size={14} className="opacity-60" />
                {gradeFilter ? `Grade ${gradeFilter}` : "Grade Level"}
              </button>
              <AnimatePresence>
                {activeDropdown === 'grade' && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute top-full mt-2 left-0 w-44 bg-white border border-slate-100 shadow-2xl z-20 rounded-2xl overflow-hidden p-2">
                      {gradeOptions.map(g => (
                        <button key={g} onClick={() => { setGradeFilter(g); setActiveDropdown(null) }} className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-50 text-slate-600 hover:text-indigo-600 transition-colors">Grade {g}</button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Class Filter */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'class' ? null : 'class')}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest border transition-all",
                  classFilter ? "bg-purple-50 border-purple-100 text-purple-700" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                )}
              >
                <LayoutGrid size={14} className="opacity-60" />
                {classFilter ? `Class ${classFilter}` : "Section"}
              </button>
              <AnimatePresence>
                {activeDropdown === 'class' && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute top-full mt-2 left-0 w-44 bg-white border border-slate-100 shadow-2xl z-20 rounded-2xl overflow-hidden p-2">
                      {classOptions.map(c => (
                        <button key={c} onClick={() => { setClassFilter(c); setActiveDropdown(null) }} className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-50 text-slate-600 hover:text-purple-600 transition-colors">Section {c}</button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest border transition-all",
                  statusFilter ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                )}
              >
                <div className={cn("w-2 h-2 rounded-full", statusFilter === 'active' ? 'bg-emerald-500' : statusFilter === 'inactive' ? 'bg-rose-500' : 'bg-slate-300')} />
                {statusFilter || "Status"}
              </button>
              <AnimatePresence>
                {activeDropdown === 'status' && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute top-full mt-2 left-0 w-44 bg-white border border-slate-100 shadow-2xl z-20 rounded-2xl overflow-hidden p-2">
                      {statusOptions.map(s => (
                        <button key={s} onClick={() => { setStatusFilter(s); setActiveDropdown(null) }} className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold capitalize hover:bg-slate-50 text-slate-600 transition-colors">{s}</button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Reset & Count */}
          <div className="ml-auto flex items-center gap-6 pr-4">
            {(searchTerm || gradeFilter || statusFilter || classFilter) && (
              <button onClick={() => { setSearchTerm(''); setGradeFilter(''); setStatusFilter(''); setClassFilter('') }} className="text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors">
                Reset All
              </button>
            )}
            <div className="text-right flex flex-col align-center justify-center items-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total Active</p>
              <p className="text-xl font-bold  text-green-600 leading-none">{filteredStudents.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Grid */}
      <Card className="rounded-[2.5rem] border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/30 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-100">
              <TableHead className="h-14 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 pl-8">Learner Identity</TableHead>
              <TableHead className="h-14 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Academic Node</TableHead>
              <TableHead className="h-14 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Contact Matrix</TableHead>
              <TableHead className="h-14 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Status</TableHead>
              <TableHead className="h-14 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 text-right pr-8">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}><TableCell colSpan={5} className="h-24 animate-pulse bg-slate-50/20" /></TableRow>
              ))
            ) : filteredStudents.map((student) => (
              <TableRow key={student.id} className="group hover:bg-slate-50/50 transition-all border-b border-slate-50 last:border-none">
                <TableCell className="py-5 pl-8">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 leading-none mb-1">{student.name}</p>
                      <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter">ID-{student.id.slice(-5).toUpperCase()}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="inline-flex flex-col">
                    <span className="text-sm font-semibold text-slate-700">Grade {student.grade}</span>
                    <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest">Section {student.class}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <Mail size={12} className="text-slate-300" /> {student.email}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                      <Phone size={12} className="text-slate-300" /> {student.phone || "No Contact"}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter",
                    student.status === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                  )}>
                    <div className={cn("w-1 h-1 rounded-full", student.status === 'active' ? "bg-emerald-500" : "bg-slate-400")} />
                    {student.status || 'Active'}
                  </div>
                </TableCell>
                <TableCell className="text-right pr-8">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <Link href={`/dashboard/admin/student/${student.id}`}>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-indigo-50 hover:text-indigo-600"><ArrowRight size={16} /></Button>
                    </Link>
                    <Button onClick={() => openEditDialog(student)} variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-100"><Edit size={16} /></Button>
                    <Button onClick={() => handleDeleteStudent(student.id)} variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-rose-50 hover:text-rose-500"><Trash2 size={16} /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Improved Pagination */}
        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Showing <span className="text-indigo-600">{filteredStudents.length}</span> Scholars</p>
          <div className="flex items-center gap-2">
            <Button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} variant="outline" className="h-9 rounded-xl border-slate-200 text-xs font-bold px-4">Previous</Button>
            <div className="h-9 px-4 flex items-center bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-900">Page {currentPage} of {totalPages}</div>
            <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} variant="outline" className="h-9 rounded-xl border-slate-200 text-xs font-bold px-4">Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}