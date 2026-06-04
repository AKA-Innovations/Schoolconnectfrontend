'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  useSubjectDetails, useCreateSubjectDetail,
  useUpdateSubjectDetail, useDeleteSubjectDetail,
  useSubjectOptions, useClassSectionLists, useSchoolClasses,
} from '@/hooks/useClasses';
import { useTeacherList } from '@/hooks/useTeachers';
import { useAuthStore } from '@/store/authStore';
import { Plus, Pencil, Trash2, Search, X, Save, Users, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { CURRENT_SESSION } from '@/lib/constants';

const EMPTY_FORM = { teacherId: '', classSectionId: 0, subjectId: 0 };

export default function CoordinatorSubjectMappingPage() {
  const user = useAuthStore((s) => s.user);
  const schoolId = useAuthStore((s) => s.schoolId);
  const coordinatorClasses = user?.coordinatorClasses ?? [];

  const { data: allMappings = [], isLoading } = useSubjectDetails();
  const { data: allSubjects = [] } = useSubjectOptions();
  const { data: allClassSections = [] } = useClassSectionLists();
  const { data: schoolClasses = [] } = useSchoolClasses();
  
  const { data: teachersData } = useTeacherList({ schoolId: schoolId || '', page: 1, pageSize: 500 });
  const teachers = teachersData?.data ?? [];

  // Normalize coordinator classes to strings for robust filtering
  const coordClassNames = useMemo(() => 
    coordinatorClasses.map(c => String(typeof c === 'object' ? c.className : c)).filter(Boolean),
    [coordinatorClasses]
  );

  // Filter lists based on what coordinator is allowed to manage
  const classSections = useMemo(
    () => coordClassNames.length > 0 
      ? allClassSections.filter((cs) => coordClassNames.includes(String(cs.className)))
      : allClassSections,
    [allClassSections, coordClassNames]
  );
  
  // Subjects are session-global (not class-scoped) — show all
  const subjects = allSubjects;

  const mappings = useMemo(
    () => coordClassNames.length > 0
      ? allMappings.filter((m) => coordClassNames.includes(String(m.className)))
      : allMappings,
    [allMappings, coordClassNames]
  );

  // id → display name lookup used in the table
  const teacherNameMap = useMemo(() => {
    const m = new Map<string, string>();
    teachers.forEach((t) => m.set(t.id, `${t.firstName} ${t.lastName}`.trim()));
    return m;
  }, [teachers]);

  const createMutation = useCreateSubjectDetail();
  const updateMutation = useUpdateSubjectDetail();
  const deleteMutation = useDeleteSubjectDetail();

  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  // Available subjects filtered to the selected class-section
  const selectedSection = classSections.find((cs) => cs.id === form.classSectionId);
  // Subjects are session-global — show all available subjects
  const availableSubjects = allSubjects;

  const filtered = mappings.filter((m) => {
    const q = search.toLowerCase();
    const resolvedName = teacherNameMap.get(m.teacherId) || m.teacherName || m.teacherId;
    return (
      (m.className ?? '').toLowerCase().includes(q) ||
      (m.sectionName ?? '').toLowerCase().includes(q) ||
      resolvedName.toLowerCase().includes(q) ||
      (m.subjectName ?? '').toLowerCase().includes(q)
    );
  });

  const buildPayload = () => {
    const selectedSubject = allSubjects.find(s => s.id === form.subjectId);
    if (!selectedSection || !selectedSubject) return null;

    // Ensure classId is present, resolve from schoolClasses if missing
    let classId = selectedSection.classId;
    if (!classId) {
      const sc = schoolClasses.find((c) => c.className === selectedSection.className);
      classId = sc?.id || 0;
    }

    return {
      entries: [{
        session: CURRENT_SESSION,
        teacherId: form.teacherId,
        classId,
        classSectionId: selectedSection.masterSectionId,
        subjectId: selectedSubject.id,
      }]
    };
  };

  const handleSave = async () => {
    const payload = buildPayload();
    if (!payload || !form.teacherId || !form.subjectId) {
      toast.error('All fields are required');
      return;
    }
    try {
      if (editId) {
        await updateMutation.mutateAsync({ id: editId as any, data: payload });
        toast.success('Mapping updated');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Mapping created');
      }
      resetForm();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save mapping');
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Mapping deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const startEdit = (m: any) => {
    setEditId(m.id);
    // Find classSectionId by matching className and sectionName
    const cs = allClassSections.find(
      (c) => c.className === m.className && c.sectionName === m.sectionName
    );
    setForm({ 
      teacherId: m.teacherId, 
      classSectionId: cs?.id || 0, 
      subjectId: m.subjectId 
    });
    setShowAdd(true);
  };

  const resetForm = () => {
    setShowAdd(false);
    setEditId(null);
    setForm(EMPTY_FORM);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Layers className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Teacher-Subject Mapping</h1>
            <p className="text-muted-foreground mt-1">Assign teachers to subjects for {coordinatorClasses.join(', ')}</p>
          </div>
        </div>
        <Button onClick={() => { setShowAdd(true); setEditId(null); setForm(EMPTY_FORM); }} className="rounded-xl">
          <Plus className="h-4 w-4 mr-2" /> Add Mapping
        </Button>
      </div>

      {/* Add/Edit form */}
      {showAdd && (
        <Card className="erp-card border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Class / Section *</Label>
                <Select value={form.classSectionId ? String(form.classSectionId) : ''} onValueChange={(v) => setForm({ ...form, classSectionId: Number(v) })}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {classSections.map((cs) => (
                      <SelectItem key={cs.id} value={String(cs.id)}>
                        {cs.className} — {cs.sectionName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Teacher *</Label>
                <Select value={form.teacherId} onValueChange={(v) => setForm({ ...form, teacherId: v })}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select teacher" /></SelectTrigger>
                  <SelectContent>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.firstName} {t.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Subject *</Label>
                <Select value={form.subjectId ? String(form.subjectId) : ''} onValueChange={(v) => setForm({ ...form, subjectId: Number(v) })} disabled={!form.classSectionId}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder={form.classSectionId ? 'Select subject' : 'Select class first'} /></SelectTrigger>
                  <SelectContent>
                    {availableSubjects.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.subjectName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending} className="rounded-xl">
                <Save className="h-4 w-4 mr-2" /> {editId ? 'Update' : 'Create'}
              </Button>
              <Button variant="ghost" onClick={resetForm} className="rounded-xl">
                <X className="h-4 w-4 mr-2" /> Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by class, teacher, or subject..." className="pl-9 rounded-xl" />
      </div>

      {/* Table */}
      <Card className="erp-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20">
                  <th className="text-left py-3 px-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">#</th>
                  <th className="text-left py-3 px-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Class</th>
                  <th className="text-left py-3 px-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Teacher</th>
                  <th className="text-left py-3 px-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Subject</th>
                  <th className="text-right py-3 px-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i} className="border-b border-border/30">
                      <td colSpan={5} className="py-4 px-6"><div className="h-5 bg-muted rounded animate-pulse" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p className="text-sm font-bold text-muted-foreground">No mappings found</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((m, idx) => (
                    <tr key={m.id} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                      <td className="py-3 px-6 text-sm text-muted-foreground">{idx + 1}</td>
                      <td className="py-3 px-6">
                        <Badge variant="secondary" className="rounded-lg">{m.className} — {m.sectionName}</Badge>
                      </td>
                      <td className="py-3 px-6 text-sm font-semibold">{teacherNameMap.get(m.teacherId) || m.teacherName || m.teacherId}</td>
                      <td className="py-3 px-6 text-sm">{m.subjectName || '—'}</td>
                      <td className="py-3 px-6 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => startEdit(m)} className="h-8 w-8 rounded-lg">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)}
                            disabled={deleteMutation.isPending}
                            className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
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
  );
}
