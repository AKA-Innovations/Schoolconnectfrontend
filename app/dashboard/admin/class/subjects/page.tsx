'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useSubjectOptions,
  useCreateSubjectOption,
  useUpdateSubjectOption,
  useClassList,
} from '@/hooks/useClasses';
import { Plus, Edit2, BookOpen, Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CURRENT_SESSION } from '@/lib/constants';

export default function SubjectsPage() {
  const { data: subjects = [], isLoading } = useSubjectOptions();
  const { data: uniqueclasses = [] } = useClassList();

  const createMutation = useCreateSubjectOption();
  const updateMutation = useUpdateSubjectOption();

  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [editForm, setEditForm] = useState({ subjectName: '', subjectCode: '' });

  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  const [form, setForm] = useState({
    className: '',
    session: CURRENT_SESSION,
    subjects: [] as { subjectName: string; subjectCode: string }[],
  });

  const [subjectInput, setSubjectInput] = useState('');
  const [subjectCodeInput, setSubjectCodeInput] = useState('');

  // 🔍 Filter
  const filtered = subjects.filter((s: any) => {
    const q = search.toLowerCase();
    return s.subjectName?.toLowerCase().includes(q) ||
      (s.subjectCode ?? '').toLowerCase().includes(q);
  });

  // 📄 Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const paginatedData = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedClass]);

  // ➕ Add subject
  const addSubject = () => {
    const name = subjectInput.trim();
    const code = subjectCodeInput.trim();
    if (!name || !code) { toast.error('Both subject name and code are required'); return; }
    if (form.subjects.some((s) => s.subjectName === name)) {
      toast.error('Subject already added'); return;
    }
    setForm({ ...form, subjects: [...form.subjects, { subjectName: name, subjectCode: code }] });
    setSubjectInput('');
    setSubjectCodeInput('');
  };

  // ❌ Remove subject
  const removeSubject = (name: string) => {
    setForm({ ...form, subjects: form.subjects.filter((s) => s.subjectName !== name) });
  };

  // 💾 Save
  const handleSave = async () => {
    if (!form.className.trim() || form.subjects.length === 0) {
      toast.error('Class and at least one subject are required');
      return;
    }

    try {
      await createMutation.mutateAsync({
        session: form.session,
        subjects: form.subjects,
      });

      toast.success('Subjects created');

      setForm({
        className: '',
        session: CURRENT_SESSION,
        subjects: [],
      });
      setSubjectInput('');
      setSubjectCodeInput('');
      setShowAdd(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save subjects');
    }
  };

  // ✏️ Edit
  const handleEditSave = async () => {
    if (!editingSubject) return;
    if (!editForm.subjectName.trim() || !editForm.subjectCode.trim()) {
      toast.error('Both subject name and code are required');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: editingSubject.id,
        data: {
          subjectName: editForm.subjectName.trim(),
          subjectCode: editForm.subjectCode.trim(),
        },
      });
      toast.success('Subject updated successfully');
      setEditingSubject(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update subject');
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-emerald-600" />
            Subject Management
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage and categorize school subjects class-wise</p>
        </div>

        <Button onClick={() => setShowAdd(true)} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Subjects
        </Button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <Card className="erp-card overflow-hidden border border-slate-100 shadow-xs animate-in slide-in-from-top duration-300">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800">Add New Subjects</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Class */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Class *</Label>
                <select
                  value={form.className}
                  onChange={(e) => setForm({ ...form, className: e.target.value })}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Select class</option>
                  {uniqueclasses?.length ? (
                    uniqueclasses.map((cls: string) => (
                      <option key={cls} value={cls}>Class {cls}</option>
                    ))
                  ) : (
                    <option disabled value="loading">Loading...</option>
                  )}
                </select>
              </div>

              {/* Subjects */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Add Subject Entries *</Label>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input
                      value={subjectInput}
                      onChange={(e) => setSubjectInput(e.target.value)}
                      placeholder="Subject name (e.g. Mathematics)"
                      className="rounded-xl border-slate-200 h-10"
                      onKeyDown={(e) => e.key === 'Enter' && addSubject()}
                    />
                  </div>
                  <div className="w-36">
                    <Input
                      value={subjectCodeInput}
                      onChange={(e) => setSubjectCodeInput(e.target.value)}
                      placeholder="Code (e.g. MATH)"
                      className="rounded-xl border-slate-200 h-10"
                      onKeyDown={(e) => e.key === 'Enter' && addSubject()}
                    />
                  </div>
                  <Button onClick={addSubject} type="button" className="rounded-xl bg-slate-800 hover:bg-slate-900 text-white h-10 px-4 font-semibold text-xs">Add</Button>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {form.subjects.map((sub) => (
                    <Badge key={sub.subjectName} variant="outline" className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 text-slate-700 border-slate-200 text-xs">
                      {sub.subjectName} <span className="opacity-60 text-[10px] font-bold">({sub.subjectCode})</span>
                      <X
                        className="h-3.5 w-3.5 cursor-pointer text-slate-400 hover:text-red-500 transition-colors"
                        onClick={() => removeSubject(sub.subjectName)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end border-t border-slate-100 pt-4 mt-2">
              <Button variant="outline" onClick={() => setShowAdd(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button onClick={handleSave} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-6">
                Save Subjects
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search + Filters */}
      <Card className="erp-card border border-slate-100 bg-slate-50/40 shadow-xs">
        <CardContent className="p-3 flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subjects or codes..."
              className="pl-9 h-9 rounded-xl border-slate-200 bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto ml-auto">
            {/* Class Filter */}
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="h-9 px-3 w-[180px] rounded-xl text-xs border border-slate-200 bg-white shadow-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Filter by class</option>
              {uniqueclasses?.map((cls: string) => (
                <option key={cls} value={cls}>Class {cls}</option>
              ))}
            </select>

            {/* Reset */}
            {(search || selectedClass) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setSelectedClass('');
                }}
                className="rounded-xl text-xs hover:bg-slate-100 text-slate-500 hover:text-slate-800"
              >
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="erp-card overflow-hidden shadow-xs border border-slate-100">
        <CardContent className="p-0">
          <div className="grid grid-cols-[80px_2fr_1fr_100px] border-b border-slate-200 bg-slate-50/60 px-4 py-2.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">#</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Subject</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Code</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Actions</span>
          </div>

          {isLoading ? (
            <div className="p-8 space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : paginatedData.length === 0 ? (
            <div className="py-20 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-3 text-slate-200" />
              <p className="text-sm font-semibold text-slate-400">No subjects found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {paginatedData.map((s: any, idx: number) => {
                const serialNum = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                return (
                  <div key={s.id} className="grid grid-cols-[80px_2fr_1fr_100px] items-center px-4 py-3 hover:bg-slate-50/60 transition-colors">
                    <span className="text-sm text-slate-500 font-medium">#{serialNum}</span>
                    <span className="text-sm font-semibold text-slate-800">{s.subjectName}</span>
                    <div>
                      {s.subjectCode ? (
                        <Badge variant="outline" className="rounded-lg bg-emerald-50/50 text-emerald-700 border-emerald-100 text-xs font-semibold px-2 py-0.5">
                          {s.subjectCode}
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </div>
                    <div className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingSubject(s);
                          setEditForm({ subjectName: s.subjectName, subjectCode: s.subjectCode || '' });
                        }}
                        className="h-8 w-8 rounded-lg hover:bg-slate-100"
                      >
                        <Edit2 className="h-4 w-4 text-slate-500 hover:text-slate-800" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/40">
              <p className="text-xs text-slate-500">
                Page {currentPage} of {totalPages}
              </p>

              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="rounded-lg text-xs"
                >
                  Prev
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="rounded-lg text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingSubject} onOpenChange={(open) => !open && setEditingSubject(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl border-slate-100 p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-800">Edit Subject Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Subject Name</Label>
              <Input
                value={editForm.subjectName}
                onChange={(e) => setEditForm({ ...editForm, subjectName: e.target.value })}
                placeholder="E.g. Mathematics"
                className="rounded-xl border-slate-200"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Subject Code</Label>
              <Input
                value={editForm.subjectCode}
                onChange={(e) => setEditForm({ ...editForm, subjectCode: e.target.value })}
                placeholder="E.g. MATH"
                className="rounded-xl border-slate-200"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button variant="outline" onClick={() => setEditingSubject(null)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={(updateMutation as any).isPending || (updateMutation as any).isLoading} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5">
              {((updateMutation as any).isPending || (updateMutation as any).isLoading) ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}