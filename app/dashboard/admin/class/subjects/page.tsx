'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
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
    <div className="p-6 lg:p-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subject Management</h1>
          <p className="text-muted-foreground">Manage subjects class-wise</p>
        </div>

        <Button onClick={() => setShowAdd(true)} className="rounded-xl">
          <Plus className="h-4 w-4 mr-2" />
          Add Subjects
        </Button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <Card>
          <CardContent className="p-6 space-y-4">

            {/* Class */}
            <div>
              <Label>Class *</Label>
              <Select
                value={form.className}
                onValueChange={(v) => setForm({ ...form, className: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueclasses?.length ? (
                    uniqueclasses.map((cls: string) => (
                      <SelectItem key={cls} value={cls}>
                        Class {cls}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem disabled value="loading">
                      Loading...
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Subjects */}
            <div>
              <Label>Subjects *</Label>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Input
                    value={subjectInput}
                    onChange={(e) => setSubjectInput(e.target.value)}
                    placeholder="Subject name (e.g. Mathematics)"
                    onKeyDown={(e) => e.key === 'Enter' && addSubject()}
                  />
                </div>
                <div className="w-36">
                  <Input
                    value={subjectCodeInput}
                    onChange={(e) => setSubjectCodeInput(e.target.value)}
                    placeholder="Code (e.g. MATH)"
                    onKeyDown={(e) => e.key === 'Enter' && addSubject()}
                  />
                </div>
                <Button onClick={addSubject} type="button">Add</Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {form.subjects.map((sub) => (
                  <Badge key={sub.subjectName} className="flex items-center gap-1">
                    {sub.subjectName} <span className="opacity-60 text-[10px]">({sub.subjectCode})</span>
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeSubject(sub.subjectName)}
                    />
                  </Badge>
                ))}
              </div>
            </div>


            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={handleSave}>
                Save
              </Button>
              <Button variant="ghost" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-3">

        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subjects..."
            className="pl-9"
          />
        </div>

        {/* Class Filter */}
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Classes</SelectItem>
            {uniqueclasses?.map((cls: string) => (
              <SelectItem key={cls} value={cls}>
                Class {cls}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Reset */}
        <Button
          variant="ghost"
          onClick={() => {
            setSearch('');
            setSelectedClass('');
          }}
        >
          Reset
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Subject</th>
                <th className="p-3 text-left">Code</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-4">Loading...</td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10">
                    <BookOpen className="mx-auto mb-2 opacity-20" />
                    No subjects found
                  </td>
                </tr>
              ) : (
                paginatedData.map((s: any, idx: number) => (
                  <tr key={s.id} className="border-b">
                    <td className="p-3">{idx + 1}</td>
                    <td className="p-3 font-medium">{s.subjectName}</td>
                    <td className="p-3">{s.subjectCode || '—'}</td>
                    <td className="p-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingSubject(s);
                          setEditForm({ subjectName: s.subjectName, subjectCode: s.subjectCode || '' });
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center p-4">
            <p className="text-sm">
              Page {currentPage} of {totalPages || 1}
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Prev
              </Button>

              <Button
                variant="outline"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingSubject} onOpenChange={(open) => !open && setEditingSubject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Subject Name</Label>
              <Input
                value={editForm.subjectName}
                onChange={(e) => setEditForm({ ...editForm, subjectName: e.target.value })}
                placeholder="E.g. Mathematics"
              />
            </div>
            <div className="space-y-2">
              <Label>Subject Code</Label>
              <Input
                value={editForm.subjectCode}
                onChange={(e) => setEditForm({ ...editForm, subjectCode: e.target.value })}
                placeholder="E.g. MATH"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingSubject(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={(updateMutation as any).isPending || (updateMutation as any).isLoading}>
              {((updateMutation as any).isPending || (updateMutation as any).isLoading) ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}