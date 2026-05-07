'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  useClassSectionLists, useSubjectDetails, useSubjectOptions,
  useCreateSubjectDetail, useDeleteSubjectDetail,
} from '@/hooks/useClasses';
import { useTeacherList } from '@/hooks/useTeachers';
import { useAuthStore } from '@/store/authStore';
import { CURRENT_SESSION } from '@/lib/constants';
import { toast } from 'sonner';
import { Layers, Plus, Trash2, Save, X } from 'lucide-react';

export default function CoordinatorSubjectsPage() {
  const user = useAuthStore((s) => s.user);
  // Normalize coordinator classes to strings for filtering
  const coordClassNames = useMemo(() => 
    coordinatorClasses.map(c => String(typeof c === 'object' ? c.className : c)).filter(Boolean),
    [coordinatorClasses]
  );

  const classSections = useMemo(
    () => coordClassNames.length > 0
      ? allClassSections.filter((cs) => coordClassNames.includes(String(cs.className)))
      : allClassSections,
    [allClassSections, coordClassNames],
  );

  const [selectedId, setSelectedId] = useState<number>(0);
  const selectedSection = classSections.find((cs) => cs.id === selectedId);

  const sectionSubjects = useMemo(() => {
    if (!selectedSection) {
      return coordClassNames.length > 0
        ? subjectDetails.filter((sd) => coordClassNames.includes(String(sd.className)))
        : subjectDetails;
    }
    return subjectDetails.filter(
      (sd) => sd.className === selectedSection.className && sd.sectionName === selectedSection.sectionName,
    );
  }, [subjectDetails, selectedSection, coordinatorClasses]);

  // Available subject options for the class
  const classSubjectOptions = useMemo(
    () => selectedSection ? subjectOptions.filter((so) => so.className === selectedSection.className) : subjectOptions,
    [subjectOptions, selectedSection],
  );

  const [showAdd, setShowAdd] = useState(false);
  const [addClassName, setAddClassName] = useState('');
  const [addSectionName, setAddSectionName] = useState('');
  const [addSubject, setAddSubject] = useState('');
  const [addTeacherId, setAddTeacherId] = useState('');

  const createMutation = useCreateSubjectDetail();
  const deleteMutation = useDeleteSubjectDetail();

  const handleAdd = () => {
    const cn = selectedSection?.className ?? addClassName;
    const sn = selectedSection?.sectionName ?? addSectionName;
    if (!cn || !sn || !addSubject || !addTeacherId) {
      toast.error('All fields are required');
      return;
    }
    createMutation.mutate(
      { session: CURRENT_SESSION, teacherId: addTeacherId, className: cn, sectionName: sn, subjectName: addSubject },
      {
        onSuccess: () => { toast.success('Subject teacher assigned'); setShowAdd(false); setAddSubject(''); setAddTeacherId(''); },
        onError: () => toast.error('Failed to assign'),
      },
    );
  };

  const handleDelete = (id: number) => {
    if (!confirm('Remove this subject-teacher mapping?')) return;
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success('Removed'),
      onError: () => toast.error('Failed to remove'),
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Layers className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Subject Mapping</h1>
            <p className="text-muted-foreground mt-1 text-sm">Assign subject teachers to class-sections</p>
          </div>
        </div>
        <div className="flex gap-3">
          <select value={selectedId || ''} onChange={(e) => setSelectedId(Number(e.target.value))}
            className="h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring w-52">
            <option value="">All sections</option>
            {classSections.map((cs) => (
              <option key={cs.id} value={cs.id}>{cs.className} — {cs.sectionName}</option>
            ))}
          </select>
          <Button size="sm" className="rounded-xl h-10" onClick={() => setShowAdd(!showAdd)}>
            {showAdd ? <><X className="h-4 w-4 mr-1" /> Cancel</> : <><Plus className="h-4 w-4 mr-1" /> Assign</>}
          </Button>
        </div>
      </div>

      {showAdd && (
        <Card className="erp-card border-primary/20">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {!selectedSection && (
                <>
                  <select value={addClassName} onChange={(e) => setAddClassName(e.target.value)}
                    className="h-9 px-3 bg-background border border-input rounded-lg text-sm">
                    <option value="">Class...</option>
                    {[...new Set(classSections.map((cs) => cs.className))].map((cn) => (
                      <option key={cn} value={cn}>{cn}</option>
                    ))}
                  </select>
                  <select value={addSectionName} onChange={(e) => setAddSectionName(e.target.value)}
                    className="h-9 px-3 bg-background border border-input rounded-lg text-sm">
                    <option value="">Section...</option>
                    {classSections.filter((cs) => cs.className === addClassName).map((cs) => (
                      <option key={cs.id} value={cs.sectionName}>{cs.sectionName}</option>
                    ))}
                  </select>
                </>
              )}
              <select value={addSubject} onChange={(e) => setAddSubject(e.target.value)}
                className="h-9 px-3 bg-background border border-input rounded-lg text-sm">
                <option value="">Subject...</option>
                {classSubjectOptions.map((so) => (
                  <option key={so.id} value={so.subjectName}>{so.subjectName}</option>
                ))}
              </select>
              <select value={addTeacherId} onChange={(e) => setAddTeacherId(e.target.value)}
                className="h-9 px-3 bg-background border border-input rounded-lg text-sm">
                <option value="">Teacher...</option>
                {allTeachers.filter((t) => t.isSubjectTeacher).map((t) => (
                  <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                ))}
              </select>
              <Button size="sm" className="rounded-lg h-9" onClick={handleAdd} disabled={createMutation.isPending}>
                <Save className="h-3 w-3 mr-1" /> Assign
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : (
        <Card className="erp-card overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/10">
                    {['#', 'Class', 'Subject', 'Teacher', 'Actions'].map((h) => (
                      <th key={h} className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sectionSubjects.length === 0 ? (
                    <tr><td colSpan={5} className="py-12 text-center text-sm text-muted-foreground">No subject mappings</td></tr>
                  ) : sectionSubjects.map((sd, i) => (
                    <tr key={sd.id} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                      <td className="py-3 px-4 text-sm text-muted-foreground">{i + 1}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="rounded-lg">{sd.className} — {sd.sectionName}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold">{sd.subjectName}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{sd.teacherName || sd.teacherId}</td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(sd.id)} disabled={deleteMutation.isPending}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
