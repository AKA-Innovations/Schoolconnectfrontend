'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Edit2, Save, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useStudent, useAddAcademic, useUpdateAcademic } from '@/hooks/useStudents';
import { CURRENT_SESSION } from '@/lib/constants';
import { useClassList, useSectionsByClassName, useClassSectionLists } from '@/hooks/useClasses';
import { useAuthStore } from '@/store/authStore';
import { classService } from '@/services/class.service';
import { useQuery } from '@tanstack/react-query';
import type { CreateAcademicPayload } from '@/services/student.service';

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value || '—'}</p>
    </div>
  );
}

const emptyAcademic = (): CreateAcademicPayload => ({
  session: CURRENT_SESSION,
  className: '', sectionName: '', rollNumber: '', admissionNumber: '',
  admissionDate: '', convenceMode: '', convenceModeNumber: '',
});

const fields: { label: string; key: keyof CreateAcademicPayload }[] = [
  { label: 'Class', key: 'className' }, { label: 'Section', key: 'sectionName' },
  { label: 'Roll Number', key: 'rollNumber' }, { label: 'Admission Number', key: 'admissionNumber' },
  { label: 'Conveyance Mode', key: 'convenceMode' }, { label: 'Conveyance Number', key: 'convenceModeNumber' },
];

export function AcademicTab({ studentId }: { studentId: string }) {
  const { data: student } = useStudent(studentId);
  const { data: classNames = [] } = useClassList();
  const schoolId = useAuthStore((s) => s.schoolId);
  const { data: allSections = [] } = useClassSectionLists();
  const addMutation = useAddAcademic(studentId);
  const updateMutation = useUpdateAcademic(studentId);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<CreateAcademicPayload>(emptyAcademic());
  const [selectedClassName, setSelectedClassName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { data: sectionNames = [] } = useSectionsByClassName(selectedClassName);

  const record = student?.academics?.[0] ?? null;
  const hasRecord = !!record;
  console.log("record", record)
  const resolvedClassName = record?.className || ((record as any)?.classSectionId ? allSections.find(s => (s.masterSectionId || s.id) === (record as any).classSectionId)?.className : '');
  const resolvedSectionName = record?.sectionName || ((record as any)?.classSectionId ? allSections.find(s => (s.masterSectionId || s.id) === (record as any).classSectionId)?.sectionName : '');

  const startEdit = () => {
    if (record) {
      setSelectedClassName(resolvedClassName || '');
      setForm({
        session: (record as any).session ?? CURRENT_SESSION,
        className: resolvedClassName || '',
        sectionName: resolvedSectionName || '',
        rollNumber: record.rollNumber,
        admissionNumber: record.admissionNumber,
        admissionDate: record.admissionDate,
        convenceMode: record.convenceMode || (record as any).convenceMode || '',
        convenceModeNumber: record.convenceModeNumber ?? '',
      });
    } else {
      setSelectedClassName('');
      setForm(emptyAcademic());
    }
    setEditing(true); setError(''); setSuccess(false);
  };

  useEffect(() => {
    if (!selectedClassName) {
      setForm((prev) => ({ ...prev, className: '', sectionName: '' }));
    }
  }, [selectedClassName]);

  const handleSave = () => {
    setError('');
    if (!form.className || !form.sectionName || !form.rollNumber || !form.admissionNumber || !form.admissionDate || !form.convenceMode) {
      setError('Class, section, roll number, admission number, admission date, and conveyance mode are required.');
      return;
    }

    const selectedSectionItem = allSections.find(
      (s) => s.className === selectedClassName && s.sectionName === form.sectionName
    );
    console.log("Selected sectons items", selectedSectionItem)
    const classSectionId = selectedSectionItem?.masterSectionId || selectedSectionItem?.id;

    if (!classSectionId || classSectionId < 0) {
      setError('Selected Class/Section mapping not found in the active list.');
      return;
    }

    const payload = {
      session: form.session,
      classSectionId: classSectionId,
      rollNumber: form.rollNumber,
      admissionNumber: form.admissionNumber,
      admissionDate: form.admissionDate,
      convenceMode: form.convenceMode,
      convenceModeNumber: form.convenceModeNumber,
    };

    if (hasRecord) {
      updateMutation.mutate({ academicId: record.id, data: payload as any }, {
        onSuccess: () => { setEditing(false); setSuccess(true); setTimeout(() => setSuccess(false), 3000); },
        onError: (err: any) => setError(err?.response?.data?.message ?? 'Update failed'),
      });
    } else {
      addMutation.mutate(payload as any, {
        onSuccess: () => { setEditing(false); setSuccess(true); setTimeout(() => setSuccess(false), 3000); },
        onError: (err: any) => setError(err?.response?.data?.message ?? 'Failed to add academic record'),
      });
    }
  };

  const isSaving = addMutation.isPending || updateMutation.isPending;

  if (editing) {
    return (
      <div className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
            <AlertCircle size={14} />{error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Class
              </Label>
              <div className="relative">
                <select
                  value={selectedClassName}
                  onChange={(e) => {
                    const nextClass = e.target.value;
                    setSelectedClassName(nextClass);
                    setForm((prev) => ({
                      ...prev,
                      className: nextClass,
                      sectionName: '',
                    }));
                  }}
                  className="w-full appearance-none rounded-2xl border border-border bg-background px-4 pr-10 h-11 text-sm font-medium text-foreground shadow-sm transition-all outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/40"
                >
                  <option value="">Select class</option>
                  {classNames.map((className) => (
                    <option key={className} value={className}>
                      {className}
                    </option>
                  ))}
                </select>

                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Section
              </Label>
              <div className="relative">
                <select
                  value={form.sectionName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, sectionName: e.target.value }))
                  }
                  className="w-full appearance-none rounded-2xl border border-border bg-background px-4 pr-10 h-11 text-sm font-medium text-foreground shadow-sm transition-all outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/40 disabled:cursor-not-allowed disabled:bg-muted/40 disabled:text-muted-foreground disabled:border-border/60"
                  disabled={!selectedClassName}
                >
                  <option value="">
                    {selectedClassName ? 'Select section' : 'Select class first'}
                  </option>
                  {sectionNames.map((sectionName) => (
                    <option key={sectionName} value={sectionName}>
                      {sectionName}
                    </option>
                  ))}
                </select>

                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>




          {fields.slice(2).map(({ label, key }) => (
            <div key={key} className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground">{label}</Label>
              <Input value={form[key] ?? ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} className="rounded-xl h-10" />
            </div>
          ))}
          <div className="col-span-2 space-y-1">
            <Label className="text-xs font-semibold text-muted-foreground">Admission Date</Label>
            <Input type="date" value={form.admissionDate} onChange={e => setForm(p => ({ ...p, admissionDate: e.target.value }))} className="rounded-xl h-10" />
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setEditing(false)} className="flex-1 rounded-xl h-10"><X size={14} className="mr-2" /> Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving} className="flex-1 rounded-xl h-10 bg-primary hover:bg-primary/90 text-primary-foreground transition-all">
            <Save size={14} className="mr-2" />{isSaving ? 'Saving...' : (hasRecord ? 'Update Record' : 'Add Record')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {success && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-success/10 border border-success/20 text-success text-xs font-semibold">
          <CheckCircle2 size={14} /> Academic record {hasRecord ? 'updated' : 'added'} successfully
        </div>
      )}

      {!hasRecord ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border">
          <BookOpen size={36} className="opacity-30" />
          <p className="text-sm font-semibold">No academic record found</p>
          <Button size="sm" onClick={startEdit} className="rounded-xl h-9 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground mt-1">
            Add Academic Record
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={startEdit} className="rounded-xl h-9 text-xs font-bold">
              <Edit2 size={13} className="mr-2" /> Edit
            </Button>
          </div>
          <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <InfoRow label="Class" value={resolvedClassName} />
                <InfoRow label="Section" value={resolvedSectionName} />
                <InfoRow label="Roll No" value={record.rollNumber} />
                <InfoRow label="Admission No" value={record.admissionNumber} />
                <InfoRow label="Admission Date" value={record.admissionDate ? new Date(record.admissionDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : undefined} />
                <InfoRow label="Conveyance" value={record.convenceMode} />
                {record.convenceModeNumber && <InfoRow label="Conveyance No" value={record.convenceModeNumber} />}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
