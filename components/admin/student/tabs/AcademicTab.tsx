'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Edit2, Save, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useStudent, useAddAcademic, useUpdateAcademic } from '@/hooks/useStudents';
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
  const addMutation = useAddAcademic(studentId);
  const updateMutation = useUpdateAcademic(studentId);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<CreateAcademicPayload>(emptyAcademic());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const record = student?.academics?.[0] ?? null;
  const hasRecord = !!record;

  const startEdit = () => {
    if (record) {
      setForm({
        className: record.className, sectionName: record.sectionName,
        rollNumber: record.rollNumber, admissionNumber: record.admissionNumber,
        admissionDate: record.admissionDate, convenceMode: record.convenceMode,
        convenceModeNumber: record.convenceModeNumber ?? '',
      });
    } else {
      setForm(emptyAcademic());
    }
    setEditing(true); setError(''); setSuccess(false);
  };

  const handleSave = () => {
    setError('');
    if (!form.className || !form.sectionName || !form.rollNumber || !form.admissionNumber || !form.admissionDate || !form.convenceMode) {
      setError('Class, section, roll number, admission number, admission date, and conveyance mode are required.');
      return;
    }

    if (hasRecord) {
      updateMutation.mutate({ academicId: record.id, data: form }, {
        onSuccess: () => { setEditing(false); setSuccess(true); setTimeout(() => setSuccess(false), 3000); },
        onError: (err: any) => setError(err?.response?.data?.message ?? 'Update failed'),
      });
    } else {
      addMutation.mutate(form, {
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
          {fields.map(({ label, key }) => (
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
                <InfoRow label="Class" value={record.className} />
                <InfoRow label="Section" value={record.sectionName} />
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
