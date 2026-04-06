'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit2, Save, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useStudent, useUpdateStudentDetails } from '@/hooks/useStudents';
import type { UpdateStudentPayload } from '@/services/student.service';

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value || '—'}</p>
    </div>
  );
}

export function PersonalTab({ studentId }: { studentId: string }) {
  const { data: student, isLoading } = useStudent(studentId);
  const updateMutation = useUpdateStudentDetails(studentId);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<UpdateStudentPayload>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const startEdit = () => {
    if (!student) return;
    setForm({
      firstName: student.firstName, lastName: student.lastName, dateOfBirth: student.dateOfBirth,
      gender: student.gender, bloodGroup: student.bloodGroup, mobileNumber: student.mobileNumber,
      alternateMobileNumber: student.alternateMobileNumber, emailId: student.emailId,
      caste: student.caste, religion: student.religion, nationality: student.nationality,
    });
    setEditing(true); setError(''); setSuccess(false);
  };

  const handleSave = () => {
    setError('');
    updateMutation.mutate(form, {
      onSuccess: () => { setEditing(false); setSuccess(true); setTimeout(() => setSuccess(false), 3000); },
      onError: (err: any) => setError(err?.response?.data?.message ?? 'Update failed'),
    });
  };

  if (isLoading) return <div className="h-48 rounded-2xl bg-muted/40 animate-pulse" />;
  if (!student) return null;

  if (editing) {
    return (
      <div className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
            <AlertCircle size={14} />{error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          {([
            { label: 'First Name', key: 'firstName' }, { label: 'Last Name', key: 'lastName' },
            { label: 'Date of Birth', key: 'dateOfBirth', type: 'date' }, { label: 'Mobile Number', key: 'mobileNumber' },
            { label: 'Alternate Mobile', key: 'alternateMobileNumber' }, { label: 'Email', key: 'emailId', type: 'email' },
            { label: 'Caste', key: 'caste' }, { label: 'Religion', key: 'religion' }, { label: 'Nationality', key: 'nationality' },
          ] as { label: string; key: keyof UpdateStudentPayload; type?: string }[]).map(({ label, key, type }) => (
            <div key={key} className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground">{label}</Label>
              <Input type={type ?? 'text'} value={(form[key] as string) ?? ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} className="rounded-xl h-10" />
            </div>
          ))}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-muted-foreground">Gender</Label>
            <Select value={form.gender ?? ''} onValueChange={v => setForm(p => ({ ...p, gender: v }))}>
              <SelectTrigger className="rounded-xl h-10"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-muted-foreground">Blood Group</Label>
            <Select value={form.bloodGroup ?? ''} onValueChange={v => setForm(p => ({ ...p, bloodGroup: v }))}>
              <SelectTrigger className="rounded-xl h-10"><SelectValue /></SelectTrigger>
              <SelectContent>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setEditing(false)} className="flex-1 rounded-xl h-10"><X size={14} className="mr-2" /> Cancel</Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending} className="flex-1 rounded-xl h-10 bg-primary hover:bg-primary/90 text-primary-foreground transition-all">
            <Save size={14} className="mr-2" />{updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {success && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-success/10 border border-success/20 text-success text-xs font-semibold">
          <CheckCircle2 size={14} /> Personal details updated successfully
        </div>
      )}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={startEdit} className="rounded-xl h-9 text-xs font-bold"><Edit2 size={13} className="mr-2" /> Edit</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <InfoRow label="First Name" value={student.firstName} />
        <InfoRow label="Last Name" value={student.lastName} />
        <InfoRow label="Date of Birth" value={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString(undefined, { dateStyle: 'medium' }) : undefined} />
        <InfoRow label="Gender" value={student.gender} />
        <InfoRow label="Blood Group" value={student.bloodGroup} />
        <InfoRow label="Mobile Number" value={student.mobileNumber} />
        <InfoRow label="Alternate Mobile" value={student.alternateMobileNumber} />
        <InfoRow label="Email" value={student.emailId} />
        <InfoRow label="Caste" value={student.caste} />
        <InfoRow label="Religion" value={student.religion} />
        <InfoRow label="Nationality" value={student.nationality} />
      </div>
    </div>
  );
}
