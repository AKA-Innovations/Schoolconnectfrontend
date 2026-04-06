'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heart, Plus, Edit2, Save, X, Trash2 } from 'lucide-react';
import { useStudent, useAddMedical, useUpdateMedical, useDeleteMedical } from '@/hooks/useStudents';

export function MedicalTab({ studentId }: { studentId: string }) {
  const { data: student } = useStudent(studentId);
  const addMutation = useAddMedical(studentId);
  const updateMutation = useUpdateMedical(studentId);
  const deleteMutation = useDeleteMedical(studentId);
  const [addOpen, setAddOpen] = useState(false);
  const [addText, setAddText] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    setError('');
    if (!addText.trim()) { setError('Medical history text is required'); return; }
    addMutation.mutate({ medicalHistory: addText.trim() }, {
      onSuccess: () => { setAddOpen(false); setAddText(''); },
      onError: (err: any) => setError(err?.response?.data?.message ?? 'Failed to add record'),
    });
  };

  const handleUpdate = (id: number) => {
    updateMutation.mutate({ medicalId: id, data: { medicalHistory: editText } }, { onSuccess: () => setEditingId(null) });
  };

  const records = student?.medicalHistories ?? [];

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Dialog open={addOpen} onOpenChange={open => { setAddOpen(open); if (!open) { setAddText(''); setError(''); } }}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl h-9 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus size={13} className="mr-2" /> Add Medical Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-[2rem] border-none shadow-2xl p-8">
            <DialogHeader className="mb-4"><DialogTitle className="text-xl font-bold">Add Medical Record</DialogTitle></DialogHeader>
            {error && <div className="mb-3 px-4 py-3 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold">{error}</div>}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground">Medical History *</Label>
              <textarea value={addText} onChange={e => setAddText(e.target.value)} rows={4}
                placeholder="Describe medical history, allergies, conditions..."
                className="w-full rounded-xl border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
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

      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-36 gap-2 text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border">
          <Heart size={32} className="opacity-20" /><p className="text-sm font-semibold">No medical records yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map(rec => (
            <Card key={rec.id} className="rounded-2xl border-border shadow-sm">
              <CardContent className="p-5">
                {editingId === rec.id ? (
                  <div className="space-y-3">
                    <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={3}
                      className="w-full rounded-xl border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingId(null)} className="rounded-xl"><X size={13} /></Button>
                      <Button size="sm" onClick={() => handleUpdate(rec.id)} disabled={updateMutation.isPending} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                        <Save size={13} className="mr-1.5" /> Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm text-foreground flex-1">{rec.medicalHistory}</p>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingId(rec.id); setEditText(rec.medicalHistory); }} className="h-8 w-8 rounded-xl hover:bg-muted"><Edit2 size={13} /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { if (confirm('Delete this record?')) deleteMutation.mutate(rec.id); }} className="h-8 w-8 rounded-xl hover:bg-destructive/10 hover:text-destructive"><Trash2 size={13} /></Button>
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
