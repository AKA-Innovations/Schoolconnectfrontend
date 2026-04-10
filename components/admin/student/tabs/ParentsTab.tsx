'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User, Plus, Edit2, Save, X, Trash2 } from 'lucide-react';
import { useStudent, useAddParent, useUpdateParent, useDeleteParent } from '@/hooks/useStudents';
import type { CreateParentPayload } from '@/services/student.service';

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value || '—'}</p>
    </div>
  );
}

const emptyParent = (): CreateParentPayload => ({ relation: '', firstName: '', lastName: '', mobileNumber: '', emailId: '', address: '' });
const relOptions = ['Father', 'Mother', 'Guardian', 'Sibling', 'Other'];
const pFields: { label: string; key: keyof CreateParentPayload }[] = [
  { label: 'First Name *', key: 'firstName' }, { label: 'Last Name *', key: 'lastName' },
  { label: 'Mobile *', key: 'mobileNumber' }, { label: 'Email', key: 'emailId' },
];

export function ParentsTab({ studentId }: { studentId: string }) {
  const { data: student } = useStudent(studentId);
  const addMutation = useAddParent(studentId);
  const updateMutation = useUpdateParent(studentId);
  const deleteMutation = useDeleteParent(studentId);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<CreateParentPayload>(emptyParent());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<CreateParentPayload>>({});
  const [error, setError] = useState('');

  const handleAdd = () => {
    setError('');
    if (!form.relation || !form.firstName || !form.lastName || !form.mobileNumber) {
      setError('Relation, name, and mobile are required'); return;
    }
    addMutation.mutate(form, {
      onSuccess: () => { setAddOpen(false); setForm(emptyParent()); },
      onError: (err: any) => setError(err?.response?.data?.message ?? 'Failed to add parent'),
    });
  };

  const handleUpdate = (id: number) => {
    updateMutation.mutate({ parentId: id, data: editForm }, { onSuccess: () => setEditingId(null) });
  };

  const parents = student?.parents ?? [];

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Dialog open={addOpen} onOpenChange={open => { setAddOpen(open); if (!open) { setForm(emptyParent()); setError(''); } }}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl h-9 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus size={13} className="mr-2" /> Add Parent / Guardian
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg rounded-[2rem] border-none shadow-2xl p-8">
            <DialogHeader className="mb-4"><DialogTitle className="text-xl font-bold">Add Parent / Guardian</DialogTitle></DialogHeader>
            {error && <div className="mb-3 px-4 py-3 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold">{error}</div>}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground">Relation *</Label>
                <Select value={form.relation} onValueChange={v => setForm(p => ({ ...p, relation: v }))}>
                  <SelectTrigger className="rounded-xl h-9"><SelectValue placeholder="Select relation" /></SelectTrigger>
                  <SelectContent>{relOptions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {pFields.map(({ label, key }) => (
                <div key={key} className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground">{label}</Label>
                  <Input value={form[key] ?? ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} className="rounded-xl h-9" />
                </div>
              ))}
              <div className="col-span-2 space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground">Address</Label>
                <Input value={form.address ?? ''} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} className="rounded-xl h-9" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setAddOpen(false)} className="flex-1 rounded-xl h-10">Cancel</Button>
              <Button onClick={handleAdd} disabled={addMutation.isPending} className="flex-1 rounded-xl h-10 bg-primary hover:bg-primary/90 text-primary-foreground">
                {addMutation.isPending ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {parents.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-36 gap-2 text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border">
          <User size={32} className="opacity-20" /><p className="text-sm font-semibold">No parent records yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {parents.map(p => (
            <Card key={p.id} className="rounded-2xl border-border shadow-sm overflow-hidden">
              <CardContent className="p-5">
                {editingId === p.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs font-semibold text-muted-foreground">Relation</Label>
                        <Select value={editForm.relation ?? p.relation} onValueChange={v => setEditForm(prev => ({ ...prev, relation: v }))}>
                          <SelectTrigger className="rounded-xl h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>{relOptions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      {pFields.map(({ label, key }) => (
                        <div key={key} className="space-y-1">
                          <Label className="text-xs font-semibold text-muted-foreground">{label.replace(' *', '')}</Label>
                          <Input value={(editForm[key] as string) ?? ''} onChange={e => setEditForm(prev => ({ ...prev, [key]: e.target.value }))} className="rounded-xl h-9" />
                        </div>
                      ))}
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs font-semibold text-muted-foreground">Address</Label>
                        <Input value={editForm.address ?? ''} onChange={e => setEditForm(prev => ({ ...prev, address: e.target.value }))} className="rounded-xl h-9" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingId(null)} className="rounded-xl"><X size={13} /></Button>
                      <Button size="sm" onClick={() => handleUpdate(p.id)} disabled={updateMutation.isPending} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                        <Save size={13} className="mr-1.5" /> Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1">
                      <InfoRow label="Relation" value={p.relation} />
                      <InfoRow label="Name" value={`${p.firstName} ${p.lastName}`} />
                      <InfoRow label="Mobile" value={p.mobileNumber} />
                      {p.emailId && <InfoRow label="Email" value={p.emailId} />}
                      {p.address && <InfoRow label="Address" value={p.address} />}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => {
                        setEditingId(p.id);
                        setEditForm({ relation: p.relation, firstName: p.firstName, lastName: p.lastName, mobileNumber: p.mobileNumber, emailId: p.emailId, address: p.address });
                      }} className="h-8 w-8 rounded-xl hover:bg-muted"><Edit2 size={13} /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { if (confirm('Remove this parent record?')) deleteMutation.mutate(p.id); }} className="h-8 w-8 rounded-xl hover:bg-destructive/10 hover:text-destructive"><Trash2 size={13} /></Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
