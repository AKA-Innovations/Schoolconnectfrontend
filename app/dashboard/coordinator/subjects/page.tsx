'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  useClassSectionLists, useSubjectDetails, useSubjectOptions,
  useCreateSubjectDetail, useDeleteSubjectDetail,
  useSchoolClasses,
} from '@/hooks/useClasses';
import { useTeacherList } from '@/hooks/useTeachers';
import { useAuthStore } from '@/store/authStore';
import { CURRENT_SESSION } from '@/lib/constants';
import { toast } from 'sonner';
import { Layers, Plus, Trash2, Save, X, Search } from 'lucide-react';
import type { ClassSectionItem, SubjectOption, SubjectDetail } from '@/types/class.types';

export default function CoordinatorSubjectsPage() {
  const user = useAuthStore((s) => s.user);
  const schoolId = useAuthStore((s) => s.schoolId);

  // Fetch all required data
  const { data: allClassSections = [], isLoading: loadingCs } = useClassSectionLists();
  const { data: subjectDetails = [], isLoading: loadingSd } = useSubjectDetails();
  const { data: subjectOptions = [] } = useSubjectOptions();
  const { data: schoolClasses = [] } = useSchoolClasses();
  const { data: teachersData } = useTeacherList({ schoolId: schoolId || '', page: 1, pageSize: 500 });
  const allTeachers = teachersData?.data ?? [];

  const isLoading = loadingCs || loadingSd;

  const classSections: ClassSectionItem[] = Array.isArray(allClassSections) ? allClassSections : [];

  const [selectedId, setSelectedId] = useState<number>(0);
  const [search, setSearch] = useState('');
  const selectedSection = classSections.find((cs) => cs.id === selectedId);

  const sectionSubjects: SubjectDetail[] = useMemo(() => {
    if (!selectedSection) {
      if (!search) return subjectDetails;
      const q = search.toLowerCase();
      return subjectDetails.filter(
        (sd) => (sd.className ?? '').toLowerCase().includes(q) || (sd.subjectName ?? '').toLowerCase().includes(q),
      );
    }
    return subjectDetails.filter(
      (sd) => sd.className === selectedSection.className && sd.sectionName === selectedSection.sectionName,
    );
  }, [subjectDetails, selectedSection, search]);

  // Available subject options for the selected class
  // Subjects are session-global — show all
  const classSubjectOptions: SubjectOption[] = subjectOptions;

  const [showAdd, setShowAdd] = useState(false);
  const [addSubjectId, setAddSubjectId] = useState('');
  const [addTeacherId, setAddTeacherId] = useState('');

  const createMutation = useCreateSubjectDetail();
  const deleteMutation = useDeleteSubjectDetail();

  const handleAdd = () => {
    const cn = selectedSection?.className ?? '';
    const sn = selectedSection?.sectionName ?? '';
    const opt = classSubjectOptions.find(o => o.id === Number(addSubjectId));
    if (!cn || !sn || !opt || !addTeacherId || !selectedSection) {
      toast.error('Please select a class/section, subject, and teacher');
      return;
    }
    // Ensure classId is present, resolve from schoolClasses if missing
    let classId = selectedSection.classId;
    if (!classId) {
      const sc = schoolClasses.find((c) => c.className === selectedSection.className);
      classId = sc?.id || 0;
    }

    createMutation.mutate(
      {
        entries: [{
          session: CURRENT_SESSION,
          teacherId: addTeacherId,
          classId,
          classSectionId: selectedSection.id,
          subjectId: opt.id
        }]
      },
      {
        onSuccess: () => {
          toast.success('Subject mapping created');
          setAddSubjectId('');
          setAddTeacherId('');
          setShowAdd(false);
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create mapping'),
      },
    );
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success('Mapping removed'),
      onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to delete'),
    });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Subject Assignments</h1>
          <p className="text-muted-foreground mt-1">View and manage teacher–subject–class mappings</p>
        </div>
        {selectedSection && (
          <Button onClick={() => setShowAdd((v) => !v)} className="rounded-xl">
            {showAdd ? <><X className="h-4 w-4 mr-2" />Cancel</> : <><Plus className="h-4 w-4 mr-2" />Add Mapping</>}
          </Button>
        )}
      </div>

      {/* Class section selector */}
      <Card className="erp-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setSelectedId(0); setShowAdd(false); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${selectedId === 0 ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/70 text-foreground'}`}
            >
              All Classes
            </button>
            {isLoading ? (
              <span className="text-xs text-muted-foreground px-3 py-1.5">Loading classes…</span>
            ) : classSections.length === 0 ? (
              <span className="text-xs text-muted-foreground px-3 py-1.5">No classes found. Create classes first.</span>
            ) : (
              classSections.map((cs) => (
                <button
                  key={cs.id}
                  onClick={() => { setSelectedId(cs.id); setShowAdd(false); setAddSubjectId(''); setAddTeacherId(''); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${selectedId === cs.id ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/70 text-foreground'}`}
                >
                  {cs.className} — {cs.sectionName}
                </button>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add mapping form */}
      {showAdd && selectedSection && (
        <Card className="erp-card border-l-4 border-l-blue-500">
          <CardContent className="p-5 space-y-4">
            <p className="text-sm font-semibold">
              Add subject mapping for <span className="text-primary">{selectedSection.className} — {selectedSection.sectionName}</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Subject *</label>
                <select
                  value={addSubjectId}
                  onChange={(e) => setAddSubjectId(e.target.value)}
                  className="w-full h-9 px-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select subject…</option>
                  {classSubjectOptions.map((so) => (
                    <option key={so.id} value={String(so.id)}>{so.subjectName}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Teacher *</label>
                <select
                  value={addTeacherId}
                  onChange={(e) => setAddTeacherId(e.target.value)}
                  className="w-full h-9 px-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select teacher…</option>
                  {allTeachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                  ))}
                </select>
              </div>
            </div>
            <Button onClick={handleAdd} disabled={createMutation.isPending} className="rounded-xl">
              <Save className="h-4 w-4 mr-2" />
              {createMutation.isPending ? 'Saving…' : 'Save Mapping'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Search (when no specific class selected) */}
      {selectedId === 0 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by class or subject…"
            className="w-full h-9 pl-9 pr-4 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      )}

      {/* Mappings table */}
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
                ) : sectionSubjects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <Layers className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p className="text-sm font-bold text-muted-foreground">No mappings found</p>
                      {selectedSection && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Click "Add Mapping" to assign teachers to subjects for this class
                        </p>
                      )}
                    </td>
                  </tr>
                ) : (
                  sectionSubjects.map((sd, i) => (
                    <tr key={sd.id} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                      <td className="py-3 px-6 text-sm text-muted-foreground">{i + 1}</td>
                      <td className="py-3 px-6">
                        <Badge variant="secondary" className="rounded-lg">{sd.className} — {sd.sectionName}</Badge>
                      </td>
                      <td className="py-3 px-6 text-sm font-semibold">{sd.teacherName || sd.teacherId}</td>
                      <td className="py-3 px-6 text-sm">{sd.subjectName || '—'}</td>
                      <td className="py-3 px-6 text-right">
                        <Button
                          variant="ghost" size="icon"
                          onClick={() => handleDelete(sd.id)}
                          disabled={deleteMutation.isPending}
                          className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
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
