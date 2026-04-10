'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  usePeriodSlots, useCreatePeriodSlot,
  useUpdatePeriodSlot, useDeletePeriodSlot,
} from '@/hooks/useClasses';
import { Plus, Pencil, Trash2, Clock, X, Save, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function PeriodSlotsPage() {
  const { data: slots = [], isLoading } = usePeriodSlots();
  const createMutation = useCreatePeriodSlot();
  const updateMutation = useUpdatePeriodSlot();
  const deleteMutation = useDeletePeriodSlot();

  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    periodNumber: 1, startTime: '08:00', endTime: '08:45',
  });

  const sorted = [...slots].sort((a, b) => a.periodNumber - b.periodNumber);

  const handleSave = async () => {
    if (!form.startTime || !form.endTime) {
      toast.error('Start time and end time are required');
      return;
    }
    try {
      if (editId) {
        await updateMutation.mutateAsync({ id: editId, data: form });
        toast.success('Period slot updated');
      } else {
        await createMutation.mutateAsync(form);
        toast.success('Period slot created');
      }
      resetForm();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save period slot');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Period slot deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const startEdit = (s: any) => {
    setEditId(s.id);
    setForm({
      periodNumber: s.periodNumber,
      startTime: s.startTime,
      endTime: s.endTime,
    });
    setShowAdd(true);
  };

  const resetForm = () => {
    setShowAdd(false);
    setEditId(null);
    setForm({ periodNumber: (slots.length || 0) + 1, startTime: '08:00', endTime: '08:45' });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Period Slots</h1>
          <p className="text-muted-foreground mt-1">Define the daily period/break schedule for your school</p>
        </div>
        <Button onClick={() => { setShowAdd(true); setEditId(null); setForm({ periodNumber: (slots.length || 0) + 1, startTime: '', endTime: '' }); }} className="rounded-xl">
          <Plus className="h-4 w-4 mr-2" /> Add Slot
        </Button>
      </div>

      {/* Add/Edit form */}
      {showAdd && (
        <Card className="erp-card border-l-4 border-l-amber-500">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Period # *</Label>
                <Input type="number" min={1} value={form.periodNumber}
                  onChange={(e) => setForm({ ...form, periodNumber: Number(e.target.value) })}
                  className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Start Time *</Label>
                <Input type="time" value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">End Time *</Label>
                <Input type="time" value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  className="rounded-xl" />
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

      {/* Period slots visual timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          [1, 2, 3, 4].map((i) => (
            <Card key={i} className="erp-card animate-pulse">
              <CardContent className="p-4"><div className="h-16 bg-muted rounded" /></CardContent>
            </Card>
          ))
        ) : sorted.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <Clock className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-bold text-muted-foreground">No period slots defined</p>
            <p className="text-xs text-muted-foreground mt-1">Add your first slot to get started</p>
          </div>
        ) : (
          sorted.map((slot) => (
            <Card key={slot.id} className="erp-card transition-all hover:shadow-md border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">Period {slot.periodNumber}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(slot)} className="h-7 w-7 rounded-lg">
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(slot.id)}
                      disabled={deleteMutation.isPending}
                      className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm font-semibold">
                  {slot.startTime} — {slot.endTime}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
