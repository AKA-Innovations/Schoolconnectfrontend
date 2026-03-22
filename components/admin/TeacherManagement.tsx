'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { teacherService } from '@/services/teacher.service';
import { adminService } from '@/services/admin.service';
import { Teacher, Class, TeacherFilterParams } from '@/types/roles';
import { Plus, Edit, Trash2, Users, Search, Filter, Eye, ArrowLeft, RefreshCw, MoreVertical, CheckCircle2 } from 'lucide-react';
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
    page: 1,
    pageSize: 10,
    schoolId: schoolId || '',
  });

  useEffect(() => {
    loadTeachers();
  }, [filters, searchTerm]);

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
      console.error('Error loading teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    if (!confirm('Are you sure you want to delete this teacher record? This action cannot be undone.')) return;
    try {
      await teacherService.deleteTeacher(id);
      loadTeachers();
    } catch (error) {
      console.error('Error deleting teacher:', error);
    }
  };

  if (viewMode === 'add') {
    return (
      <TeacherRegistrationForm
        onCancel={() => setViewMode('list')}
        onSuccess={() => {
          setViewMode('list');
          loadTeachers();
        }}
      />
    );
  }

  if (viewMode === 'details' && selectedTeacher) {
    return (
      <TeacherDetailsView
        teacherId={selectedTeacher.id}
        onBack={() => setViewMode('list')}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Faculty Directory</h2>
          <p className="text-muted-foreground mt-1 text-sm">Oversee and manage your academic staff and class assignments.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => loadTeachers()} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          <Button variant="premium" onClick={() => setViewMode('add')}>
            <Plus className="mr-2 h-4 w-4" />
            Onboard Teacher
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-card border border-border rounded-xl px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Name search */}
          <div className="relative flex-[1_1_250px] min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by name, ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 bg-muted/40 border-border focus:bg-background focus:border-primary/40 rounded-lg text-sm placeholder:text-muted-foreground/60 transition-all w-full"
            />
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-7 bg-border shrink-0" />

          {/* Subject */}
          <Select
            value={filters.subjectName || 'all'}
            onValueChange={(v) => setFilters({ ...filters, subjectName: v === 'all' ? undefined : v, page: 1 })}
          >
            <SelectTrigger className="flex-[1_1_140px] max-w-[200px] sm:max-w-none h-10 bg-muted/40 border-border rounded-lg text-sm focus:border-primary/40 transition-all">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              <SelectItem value="Mathematics">Mathematics</SelectItem>
              <SelectItem value="Physics">Physics</SelectItem>
              <SelectItem value="Chemistry">Chemistry</SelectItem>
              <SelectItem value="Biology">Biology</SelectItem>
              <SelectItem value="History">History</SelectItem>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Computer Science">Computer Science</SelectItem>
              <SelectItem value="Geography">Geography</SelectItem>
            </SelectContent>
          </Select>

          {/* Class */}
          <Select
            value={filters.className || 'all'}
            onValueChange={(v) => setFilters({ ...filters, className: v === 'all' ? undefined : v, page: 1 })}
          >
            <SelectTrigger className="flex-[1_1_120px] max-w-[150px] sm:max-w-none h-10 bg-muted/40 border-border rounded-lg text-sm focus:border-primary/40 transition-all">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              <SelectItem value="9">Class 9</SelectItem>
              <SelectItem value="10">Class 10</SelectItem>
              <SelectItem value="11">Class 11</SelectItem>
              <SelectItem value="12">Class 12</SelectItem>
            </SelectContent>
          </Select>

          {/* Section */}
          <Select
            value={filters.sectionName || 'all'}
            onValueChange={(v) => setFilters({ ...filters, sectionName: v === 'all' ? undefined : v, page: 1 })}
          >
            <SelectTrigger className="flex-[1_1_120px] max-w-[150px] sm:max-w-none h-10 bg-muted/40 border-border rounded-lg text-sm focus:border-primary/40 transition-all">
              <SelectValue placeholder="All Sections" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sections</SelectItem>
              <SelectItem value="A">Section A</SelectItem>
              <SelectItem value="B">Section B</SelectItem>
              <SelectItem value="C">Section C</SelectItem>
              <SelectItem value="D">Section D</SelectItem>
            </SelectContent>
          </Select>

          {/* Role */}
          <Select
            value={
              filters.isPrincipal ? 'principal'
              : filters.isCoordinator ? 'coordinator'
              : filters.isClassTeacher ? 'classTeacher'
              : filters.isSubjectTeacher ? 'subjectTeacher'
              : 'all'
            }
            onValueChange={(v) => setFilters({
              ...filters,
              isPrincipal: v === 'principal' ? true : undefined,
              isCoordinator: v === 'coordinator' ? true : undefined,
              isClassTeacher: v === 'classTeacher' ? true : undefined,
              isSubjectTeacher: v === 'subjectTeacher' ? true : undefined,
              page: 1,
            })}
          >
            <SelectTrigger className="flex-[1_1_140px] max-w-[180px] sm:max-w-none h-10 bg-muted/40 border-border rounded-lg text-sm focus:border-primary/40 transition-all">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="principal">Principal</SelectItem>
              <SelectItem value="coordinator">Coordinator</SelectItem>
              <SelectItem value="classTeacher">Class Teacher</SelectItem>
              <SelectItem value="subjectTeacher">Subject Teacher</SelectItem>
            </SelectContent>
          </Select>

          {/* Results + Clear */}
          <div className="flex items-center gap-3 shrink-0 ml-auto pl-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              <span className="font-semibold text-foreground">{teachers.length}</span> results
            </span>
            {(searchTerm || filters.subjectName || filters.className || filters.sectionName ||
              filters.isPrincipal || filters.isCoordinator ||
              filters.isClassTeacher || filters.isSubjectTeacher) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilters({ page: 1, pageSize: 10, schoolId: schoolId || '' });
                }}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <Card className="border-none shadow-card overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[120px] py-4">Employee ID</TableHead>
                <TableHead>Teacher Details</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Assignments</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6 whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6} className="py-8">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-muted rounded animate-pulse w-1/4" />
                          <div className="h-3 bg-muted rounded animate-pulse w-1/3" />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : teachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Users className="h-12 w-12 mb-4 opacity-20" />
                      <p className="text-lg font-medium">No results found</p>
                      <p className="text-sm">Try adjusting your filters or adding a new teacher.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                teachers.map((teacher) => (
                  <TableRow key={teacher.id} className="hover:bg-muted/5 transition-colors group">
                    <TableCell className="font-mono text-xs font-semibold text-muted-foreground py-4">
                      #{teacher.employeeId}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-linear-to-br from-primary/10 to-blue-500/10 flex items-center justify-center text-primary font-bold border border-primary/20 group-hover:scale-105 transition-transform">
                          {teacher.firstName[0]}{teacher.lastName[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground leading-tight">{teacher.firstName} {teacher.lastName}</span>
                          <span className="text-xs text-muted-foreground">{teacher.employeeEmail}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 px-2 py-0">
                        {teacher.classes?.[0]?.subjectName || 'Unassigned'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {teacher.classes?.slice(0, 2).map((cls, idx) => (
                          <div key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded bg-muted border border-border text-muted-foreground">
                            {cls.className}-{cls.sectionName}
                          </div>
                        ))}
                        {(teacher.classes?.length || 0) > 2 && (
                          <div className="text-[10px] font-bold px-2 py-0.5 rounded border border-dashed border-border text-muted-foreground">
                            +{(teacher.classes?.length || 0) - 2}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div className={cn("w-1.5 h-1.5 rounded-full", teacher.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-400')} />
                        <span className="text-xs font-medium capitalize">{teacher.status || 'active'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setSelectedTeacher(teacher);
                            setViewMode('details');
                          }}
                        >
                          <Eye className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setSelectedTeacher(teacher);
                            setViewMode('add');
                          }}
                        >
                          <Edit className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-400 hover:text-red-500 hover:bg-red-50"
                          onClick={() => handleDeleteTeacher(teacher.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between p-4 border-t bg-muted/10">
            <p className="text-xs text-muted-foreground italic">
              Showing <span className="font-semibold text-foreground">{(filters.page || 1) * (filters.pageSize || 10) - (filters.pageSize || 10) + 1}</span> to <span className="font-semibold text-foreground">{Math.min((filters.page || 1) * (filters.pageSize || 10), teachers.length)}</span> of <span className="font-semibold text-foreground">{totalPages * (filters.pageSize || 10)}</span> records
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs bg-background shadow-subtle"
                disabled={filters.page === 1}
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
              >
                Previous
              </Button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(totalPages, 3) }).map((_, i) => (
                  <Button
                    key={i}
                    variant={filters.page === i + 1 ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0 text-xs"
                    onClick={() => setFilters({ ...filters, page: i + 1 })}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs bg-background shadow-subtle"
                disabled={filters.page === totalPages || totalPages === 0}
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
