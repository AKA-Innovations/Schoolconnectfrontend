'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  useSubjectOptions, useCreateSubjectOption,
  useUpdateSubjectOption, useDeleteSubjectOption,
  useClassSectionLists,
} from '@/hooks/useClasses';
import { Plus, Pencil, Trash2, BookOpen, Search, X, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CURRENT_SESSION } from '@/lib/constants';

export default function SubjectsPage() {
  const { data: subjects = [], isLoading } = useSubjectOptions();
  const { data: classSections = [] } = useClassSectionLists();
  const createMutation = useCreateSubjectOption();
  const updateMutation = useUpdateSubjectOption();
  const deleteMutation = useDeleteSubjectOption();

  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ subjectName: '', className: '', session: CURRENT_SESSION });

  const filtered = subjects.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.subjectName.toLowerCase().includes(q) ||
      (s.className ?? '').toLowerCase().includes(q)
    );
  });

  const handleSave = async () => {
    if (!form.subjectName.trim() || !form.className.trim()) {
      toast.error('Subject name and class are required');
      return;
    }
    try {
      if (editId) {
        await updateMutation.mutateAsync({ id: editId, data: form });
        toast.success('Subject updated');
      } else {
        await createMutation.mutateAsync(form);
        toast.success('Subject created');
      }
      setForm({ subjectName: '', className: '', session: CURRENT_SESSION });
      setShowAdd(false);
      setEditId(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save subject');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Subject deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete subject');
    }
  };

  const startEdit = (s: any) => {
    setEditId(s.id);
    setForm({ subjectName: s.subjectName, className: s.className ?? '', session: s.session ?? CURRENT_SESSION });
    setShowAdd(true);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Subject Management</h1>
          <p className="text-muted-foreground mt-1">Manage available subjects for your school</p>
        </div>
        <Button onClick={() => { setShowAdd(true); setEditId(null); setForm({ subjectName: '', className: '', session: CURRENT_SESSION }); }} className="rounded-xl">
          <Plus className="h-4 w-4 mr-2" /> Add Subject
        </Button>
      </div>

      {/* Add/Edit form */}
      {showAdd && (
        <Card className="erp-card border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px] space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Subject Name *</Label>
                <Input value={form.subjectName} onChange={(e) => setForm({ ...form, subjectName: e.target.value })}
                  placeholder="e.g. Mathematics" className="rounded-xl" />
              </div>
              <div className="flex-1 min-w-[150px] space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Class — Section *</Label>
                <Select value={form.className} onValueChange={(v) => setForm({ ...form, className: v })}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select class-section" /></SelectTrigger>
                  <SelectContent>
                    {classSections.map((cs) => (
                      <SelectItem key={cs.id} value={`${cs.className}-${cs.sectionName}`}>
                        {cs.className} — {cs.sectionName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending} className="rounded-xl">
                  <Save className="h-4 w-4 mr-2" /> {editId ? 'Update' : 'Create'}
                </Button>
                <Button variant="ghost" onClick={() => { setShowAdd(false); setEditId(null); }} className="rounded-xl">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search subjects..." className="pl-9 rounded-xl" />
      </div>

      {/* Table */}
      <Card className="erp-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20">
                  <th className="text-left py-3 px-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">#</th>
                  <th className="text-left py-3 px-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Subject Name</th>
                  <th className="text-left py-3 px-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Class</th>
                  <th className="text-right py-3 px-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i} className="border-b border-border/30">
                      <td colSpan={4} className="py-4 px-6"><div className="h-5 bg-muted rounded animate-pulse" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p className="text-sm font-bold text-muted-foreground">No subjects found</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((s, idx) => (
                    <tr key={s.id} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                      <td className="py-3 px-6 text-sm text-muted-foreground">{idx + 1}</td>
                      <td className="py-3 px-6 text-sm font-semibold">{s.subjectName}</td>
                      <td className="py-3 px-6 text-sm"><Badge variant="secondary" className="rounded-lg">{s.className || '—'}</Badge></td>
                      <td className="py-3 px-6 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => startEdit(s)} className="h-8 w-8 rounded-lg">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}
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
