'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { adminService } from '@/services/admin.service';
import { Student } from '@/types/roles';
import { Plus, Edit, Trash2, Search, Filter, GraduationCap, Download, UserPlus, Users, ArrowRight, Mail, Phone, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

export function StudentManagement() {
  const { schoolId } = useAuthStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
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

  useEffect(() => {
    loadStudents();
  }, [currentPage, searchTerm, gradeFilter, statusFilter]);

  const loadStudents = async () => {
    try {
      const filters: any = {};
      if (schoolId) filters.schoolId = schoolId;
      if (gradeFilter) filters.grade = gradeFilter;
      if (statusFilter) filters.status = statusFilter;

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
        enrollmentDate: new Date().toISOString().split('T')[0]
      });
      setIsAddDialogOpen(false);
      resetForm();
      loadStudents();
    } catch (error) {
      console.error('Error adding student:', error);
    }
  };

  const handleUpdateStudent = async () => {
    if (!selectedStudent) return;
    try {
      await adminService.updateStudent(selectedStudent.id, formData);
      setIsEditDialogOpen(false);
      resetForm();
      loadStudents();
    } catch (error) {
      console.error('Error updating student:', error);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Are you sure you want to disable this student record?')) return;
    try {
      await adminService.deleteStudent(id);
      loadStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      grade: '',
      class: '',
      phone: '',
      parentName: '',
      parentPhone: '',
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

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
            <GraduationCap className="h-4 w-4" />
             Academic Directory
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Student Corpus</h1>
          <p className="text-muted-foreground text-sm max-w-lg">Manage scholarly records, track enrollment trajectories, and monitor academic performance metrics.</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-2xl h-12 px-6 border-2 font-bold hover:bg-slate-50 transition-all">
             <Download className="mr-2 h-4 w-4" />
             Export Data
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="premium" className="rounded-2xl h-12 px-6 shadow-xl shadow-primary/20">
                <UserPlus className="mr-2 h-4 w-4" />
                Enroll Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white border-none shadow-2xl rounded-[2rem]">
              <DialogHeader className="p-2">
                <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                   <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <UserPlus className="h-5 w-5" />
                   </div>
                   New Academic Enrollment
                </DialogTitle>
                <CardDescription className="p-1">Initialize a new student profile within the institutional framework.</CardDescription>
              </DialogHeader>
              <div className="grid gap-6 py-6 px-2">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest opacity-70">Legal Name</Label>
                    <Input
                      className="rounded-xl h-12 bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="Enter full legal name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest opacity-70">Scholastic Email</Label>
                    <Input
                      className="rounded-xl h-12 bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 transition-all"
                      type="email"
                      placeholder="institutional.email@school.edu"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest opacity-70">Grade Level</Label>
                    <Input
                      className="rounded-xl h-12 bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="e.g. 10"
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest opacity-70">Dynamic Assignment (Class)</Label>
                    <Input
                      className="rounded-xl h-12 bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="e.g. Physics 101"
                      value={formData.class}
                      onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest opacity-70">Contact Node</Label>
                    <Input
                      className="rounded-xl h-12 bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest opacity-70">Guardian Nexus Name</Label>
                    <Input
                      className="rounded-xl h-12 bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="Parent/Guardian Name"
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-4 bg-slate-50 rounded-b-[2rem]">
                <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)} className="rounded-xl h-11 px-6 font-bold">Cancel</Button>
                <Button variant="premium" onClick={handleAddStudent} className="rounded-xl h-11 px-8 font-bold shadow-lg shadow-primary/20">Finalize Enrollment</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-card border border-border rounded-xl px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-[1_1_250px] min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 bg-muted/40 border-border focus:bg-background focus:border-primary/40 rounded-lg text-sm placeholder:text-muted-foreground/60 transition-all w-full"
            />
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-7 bg-border shrink-0" />

          {/* Grade filter */}
          <Select value={gradeFilter} onValueChange={setGradeFilter}>
            <SelectTrigger className="w-full sm:w-36 h-10 bg-muted/40 border-border rounded-lg text-sm text-foreground focus:border-primary/40 transition-all">
              <SelectValue placeholder="All Grades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">All Grades</SelectItem>
              <SelectItem value="9">Grade 9</SelectItem>
              <SelectItem value="10">Grade 10</SelectItem>
              <SelectItem value="11">Grade 11</SelectItem>
              <SelectItem value="12">Grade 12</SelectItem>
            </SelectContent>
          </Select>

          {/* Status filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-36 h-10 bg-muted/40 border-border rounded-lg text-sm text-foreground focus:border-primary/40 transition-all">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear & Results Count */}
          <div className="flex items-center gap-3 shrink-0 ml-auto pl-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              <span className="font-semibold text-foreground">{filteredStudents.length}</span> results
            </span>
            {(searchTerm || gradeFilter || statusFilter) && (
              <button
                onClick={() => { setGradeFilter(''); setSearchTerm(''); setStatusFilter(''); }}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Students Table */}
      <Card className="border-none shadow-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="py-5 font-black uppercase tracking-widest text-[10px] pl-8">Learner Identity</TableHead>
              <TableHead className="py-5 font-black uppercase tracking-widest text-[10px]">Academic Node</TableHead>
              <TableHead className="py-5 font-black uppercase tracking-widest text-[10px]">Contact Matrix</TableHead>
              <TableHead className="py-5 font-black uppercase tracking-widest text-[10px]">Guardian Link</TableHead>
              <TableHead className="py-5 font-black uppercase tracking-widest text-[10px]">Lifecycle State</TableHead>
              <TableHead className="py-5 font-black uppercase tracking-widest text-[10px] text-right pr-8">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-none">
                  <TableCell className="py-6 pl-8"><div className="h-4 w-32 bg-muted rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 w-24 bg-muted rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 w-40 bg-muted rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 w-24 bg-muted rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 w-16 bg-muted rounded animate-pulse" /></TableCell>
                  <TableCell className="text-right pr-8"><div className="h-8 w-8 ml-auto bg-muted rounded animate-pulse" /></TableCell>
                </TableRow>
              ))
            ) : filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-20 text-center">
                   <div className="flex flex-col items-center gap-3 opacity-20">
                     <Users className="h-12 w-12" />
                     <p className="font-black uppercase tracking-tighter text-2xl">No Scholars Detected</p>
                   </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.id} className="group border-b border-border/50 hover:bg-slate-50/50 transition-all">
                  <TableCell className="py-6 pl-8">
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 rounded-xl bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center font-black text-slate-500 shadow-sm border border-white group-hover:scale-110 transition-transform">
                          {student.name.charAt(0)}
                       </div>
                       <div className="space-y-0.5">
                          <p className="font-bold text-slate-900">{student.name}</p>
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest">STD-{student.id.slice(-4).toUpperCase()}</p>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                       <p className="text-sm font-semibold">Grade {student.grade}</p>
                       <p className="text-[10px] font-bold text-muted-foreground uppercase">{student.class}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                       <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                          <Mail className="h-3 w-3 opacity-50" />
                          {student.email}
                       </div>
                       <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                          <Phone className="h-3 w-3 opacity-50" />
                          {student.phone || 'No Primary Contact'}
                       </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                       <p className="text-xs font-bold text-slate-800">{student.parentName}</p>
                       <p className="text-[10px] font-bold text-muted-foreground uppercase">{student.parentPhone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={student.status === 'active' ? 'success' : 'secondary'} className={cn(
                      "text-[10px] font-black tracking-widest px-3 py-1",
                      student.status === 'active' ? "bg-emerald-500/10 text-emerald-600 border-none" : "bg-slate-200/50 text-slate-500 border-none"
                    )}>
                      {student.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <div className="flex items-center justify-end gap-2">
                       <Link href={`/dashboard/admin/student/${student.id}`}>
                         <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-none bg-slate-100 hover:bg-primary hover:text-white transition-all">
                            <ArrowRight className="h-4 w-4" />
                         </Button>
                       </Link>
                       <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-primary hover:bg-slate-100 transition-all" onClick={() => openEditDialog(student)}>
                          <Edit className="h-4 w-4" />
                       </Button>
                       <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all" onClick={() => handleDeleteStudent(student.id)}>
                          <Trash2 className="h-4 w-4" />
                       </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {/* Pagination */}
        <div className="p-4 bg-muted/20 border-t flex items-center justify-between">
           <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-4">
              Showing <span className="text-primary">{filteredStudents.length}</span> Scholars
           </div>
           <div className="flex gap-2 pr-4">
              <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="rounded-xl font-bold h-9">Previous</Button>
              <div className="flex items-center px-4 text-xs font-black">Page {currentPage} of {totalPages}</div>
              <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="rounded-xl font-bold h-9">Next Level</Button>
           </div>
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl bg-white border-none shadow-2xl rounded-[2rem]">
          <DialogHeader className="p-2">
            <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
               <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Edit className="h-5 w-5" />
               </div>
               Modify Academic Profile
            </DialogTitle>
             <CardDescription className="p-1">Update scholarly credentials and institutional metadata for {selectedStudent?.name}.</CardDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6 px-2">
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest opacity-70">Legal Name</Label>
                  <Input
                    className="rounded-xl h-12 bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest opacity-70">Scholastic Email</Label>
                  <Input
                    className="rounded-xl h-12 bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 transition-all"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
          </div>
          <div className="flex justify-end gap-3 p-4 bg-slate-50 rounded-b-[2rem]">
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl h-11 px-6 font-bold">Cancel</Button>
            <Button variant="premium" onClick={handleUpdateStudent} className="rounded-xl h-11 px-8 font-bold shadow-lg shadow-primary/20">
              <Save className="mr-2 h-4 w-4" />
              Commit Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}