'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useSubjectOptions,
  useCreateSubjectOption,
  useUpdateSubjectOption,
  useDeleteSubjectOption,
  useSchoolClasses,
} from '@/hooks/useClasses';
import { Plus, Edit2, BookOpen, Search, X, Trash2, AlertTriangle } from 'lucide-react';
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
  const { data: classes = [] } = useSchoolClasses();
  const [selectedClassId, setSelectedClassId] = useState<number | 'all' | ''>('all');

  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId('all');
    }
  }, [classes, selectedClassId]);

  const { data: subjects = [], isLoading } = useSubjectOptions(selectedClassId);

  const createMutation = useCreateSubjectOption();
  const updateMutation = useUpdateSubjectOption();
  const deleteMutation = useDeleteSubjectOption();

  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    subjectName: '',
    classIds: [] as number[],
    classCodes: {} as Record<number, { id: number; subjectCode: string }>,
  });

  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Bulk creation states
  const [subjectNameInput, setSubjectNameInput] = useState('');
  const [subjectCodeInput, setSubjectCodeInput] = useState('');
  const [selectedClassIds, setSelectedClassIds] = useState<number[]>([]);
  const [reviewList, setReviewList] = useState<Array<{
    tempId: string;
    subjectName: string;
    subjectCode: string;
    classIds: number[];
  }>>([]);

  // Group subjects by subjectName so that they appear in a single row
  const groupedSubjects = useMemo(() => {
    const groups: Record<string, {
      subjectName: string;
      subjectCodes: string[];
      ids: number[];
      classIds: number[];
      classNames: string[];
    }> = {};

    subjects.forEach((s: any) => {
      const name = (s.subjectName || '').trim();
      const key = name.toLowerCase();
      
      if (!groups[key]) {
        groups[key] = {
          subjectName: name,
          subjectCodes: [],
          ids: [],
          classIds: [],
          classNames: [],
        };
      }
      groups[key].ids.push(s.id);
      
      if (s.subjectCode && !groups[key].subjectCodes.includes(s.subjectCode)) {
        groups[key].subjectCodes.push(s.subjectCode);
      }

      if (s.classId) {
        const clsMatch = classes.find(c => c.id === s.classId);
        if (clsMatch) {
          if (!groups[key].classIds.includes(s.classId)) {
            groups[key].classIds.push(s.classId);
            groups[key].classNames.push(clsMatch.className);
          }
        }
      }
    });

    return Object.values(groups);
  }, [subjects, classes]);

  // 🔍 Filter
  const filtered = groupedSubjects.filter((s: any) => {
    const q = search.toLowerCase();
    return s.subjectName?.toLowerCase().includes(q) ||
      (s.subjectCodes || []).some((code: string) => code.toLowerCase().includes(q));
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
  }, [search, selectedClassId]);

  // ➕ Auto-generate subject code
  const handleSubjectNameChange = (val: string) => {
    setSubjectNameInput(val);
    const clean = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (clean) {
      setSubjectCodeInput(`${clean.slice(0, 4)}1001`);
    } else {
      setSubjectCodeInput('');
    }
  };

  // ➕ Add to review list
  const handleAddToReview = () => {
    const name = subjectNameInput.trim();
    if (!name) {
      toast.error('Subject name is required');
      return;
    }
    if (selectedClassIds.length === 0) {
      toast.error('Please select at least one class');
      return;
    }

    const newItems: any[] = [];
    const cleanPrefix = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4);

    for (const classId of selectedClassIds) {
      const cls = classes.find(c => c.id === classId);
      const className = cls ? cls.className : '';
      
      const cleanClassName = className.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const generatedCode = `${cleanPrefix}${cleanClassName}1001`;

      if (reviewList.some(item => item.subjectCode.toLowerCase() === generatedCode.toLowerCase())) {
        toast.error(`Subject code "${generatedCode}" is already in the review list`);
        return;
      }

      newItems.push({
        tempId: Math.random().toString(),
        subjectName: name,
        subjectCode: generatedCode,
        classIds: [classId],
      });
    }

    setReviewList(prev => [...prev, ...newItems]);

    setSubjectNameInput('');
    setSubjectCodeInput('');
    setSelectedClassIds([]);
  };

  // ❌ Remove from review list
  const handleRemoveFromReview = (tempId: string) => {
    setReviewList(prev => prev.filter(item => item.tempId !== tempId));
  };

  // 💾 Bulk save
  const handleBulkSubmit = async () => {
    if (reviewList.length === 0) {
      toast.error('No subjects in the review list to save');
      return;
    }

    const payload: { subjectName: string; subjectCode: string; classId: number }[] = [];
    reviewList.forEach(item => {
      item.classIds.forEach(classId => {
        payload.push({
          subjectName: item.subjectName,
          subjectCode: item.subjectCode,
          classId,
        });
      });
    });

    try {
      await createMutation.mutateAsync({
        session: CURRENT_SESSION,
        subjects: payload,
      });

      toast.success('Subjects created successfully');
      setReviewList([]);
      setShowAdd(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save subjects');
    }
  };

  // ✏️ Edit
  const startEdit = (s: any) => {
    setEditingSubject(s);
    
    // Find all matching subjects to get their classId -> subjectCode & backendId mappings
    const classCodeMap: Record<number, { id: number; subjectCode: string }> = {};
    subjects.forEach((subj: any) => {
      if (subj.subjectName.toLowerCase() === s.subjectName.toLowerCase() && subj.classId) {
        classCodeMap[subj.classId] = {
          id: subj.id,
          subjectCode: subj.subjectCode || '',
        };
      }
    });

    setEditForm({
      subjectName: s.subjectName,
      classIds: [...s.classIds],
      classCodes: classCodeMap,
    });
  };

  const handleEditSave = async () => {
    if (!editingSubject) return;
    const name = editForm.subjectName.trim();
    if (!name) {
      toast.error('Subject name is required');
      return;
    }
    if (editForm.classIds.length === 0) {
      toast.error('At least one class must be selected');
      return;
    }

    // Validate that all assigned classes have a subject code
    for (const cid of editForm.classIds) {
      const code = (editForm.classCodes[cid]?.subjectCode || '').trim();
      if (!code) {
        const cls = classes.find(c => c.id === cid);
        toast.error(`Subject code for Class ${cls?.className || cid} is required`);
        return;
      }
    }

    try {
      // 1. Identify deleted classes & delete them
      const deletedClassIds = editingSubject.classIds.filter((cid: number) => !editForm.classIds.includes(cid));
      for (const cid of deletedClassIds) {
        const idx = editingSubject.classIds.indexOf(cid);
        if (idx !== -1) {
          const backendId = editingSubject.ids[idx];
          await deleteMutation.mutateAsync(backendId);
        }
      }

      // 2. Identify new classes & create them
      const newClassIds = editForm.classIds.filter((cid: number) => !editingSubject.classIds.includes(cid));
      if (newClassIds.length > 0) {
        const newSubjectsPayload = newClassIds.map(classId => {
          const codeInfo = editForm.classCodes[classId];
          return {
            subjectName: name,
            subjectCode: codeInfo ? codeInfo.subjectCode : '',
            classId,
          };
        });

        await createMutation.mutateAsync({
          session: CURRENT_SESSION,
          subjects: newSubjectsPayload,
        });
      }

      // 3. Identify updated classes (classes kept) & update name/code
      const keptClassIds = editingSubject.classIds.filter((cid: number) => editForm.classIds.includes(cid));
      for (const cid of keptClassIds) {
        const codeInfo = editForm.classCodes[cid];
        const idx = editingSubject.classIds.indexOf(cid);
        if (idx !== -1 && codeInfo) {
          const backendId = editingSubject.ids[idx];
          await updateMutation.mutateAsync({
            id: backendId,
            data: {
              subjectName: name,
              subjectCode: codeInfo.subjectCode,
            },
          });
        }
      }

      toast.success('Subject details updated successfully');
      setEditingSubject(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update subject details');
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              {/* Subject Name */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Subject Name *</Label>
                <Input
                  value={subjectNameInput}
                  onChange={(e) => handleSubjectNameChange(e.target.value)}
                  placeholder="Subject name (e.g. Physics)"
                  className="rounded-xl border-slate-200 h-10"
                />
              </div>

              {/* Subject Code */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Subject Code *</Label>
                <Input
                  value={subjectCodeInput}
                  onChange={(e) => setSubjectCodeInput(e.target.value.toUpperCase())}
                  placeholder="Code (e.g. PHYS1001)"
                  className="rounded-xl border-slate-200 h-10"
                />
              </div>

              {/* Add Button */}
              <div>
                <Button onClick={handleAddToReview} type="button" className="w-full rounded-xl bg-slate-800 hover:bg-slate-900 text-white h-10 font-bold text-xs">
                  Add to Review List
                </Button>
              </div>
            </div>

            {/* Classes Checklist */}
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Assign to Classes *</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 border border-slate-100 rounded-xl p-3.5 max-h-32 overflow-y-auto bg-slate-50/50">
                {classes.length ? (
                  classes.map((cls) => {
                    const checked = selectedClassIds.includes(cls.id);
                    return (
                      <label key={cls.id} className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:bg-white p-1.5 rounded-lg cursor-pointer transition-all border border-transparent hover:border-slate-100">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setSelectedClassIds(prev =>
                              checked ? prev.filter(id => id !== cls.id) : [...prev, cls.id]
                            );
                          }}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                        />
                        Class {cls.className}
                      </label>
                    );
                  })
                ) : (
                  <span className="text-xs text-slate-400">Loading classes...</span>
                )}
              </div>
            </div>

            {/* Review List */}
            {reviewList.length > 0 && (
              <div className="border-t border-slate-100 pt-4 mt-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span>Subjects to Create</span>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 rounded-full text-[10px] font-bold px-2 py-0.5">{reviewList.length}</Badge>
                </h4>
                <div className="border border-slate-200/60 rounded-xl overflow-hidden bg-white shadow-xs">
                  <div className="grid grid-cols-[2fr_1fr_2fr_50px] bg-slate-50/80 py-2.5 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-100">
                    <span>Subject</span>
                    <span>Code</span>
                    <span>Classes</span>
                    <span className="text-center">Remove</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-40 overflow-y-auto">
                    {reviewList.map((item) => (
                      <div key={item.tempId} className="grid grid-cols-[2fr_1fr_2fr_50px] items-center py-2.5 px-4 text-xs hover:bg-slate-50/40">
                        <span className="font-semibold text-slate-800">{item.subjectName}</span>
                        <span className="font-mono text-slate-600 font-bold">{item.subjectCode}</span>
                        <div className="flex flex-wrap gap-1">
                          {item.classIds.map(cid => {
                            const match = classes.find(c => c.id === cid);
                            return (
                              <Badge key={cid} variant="secondary" className="text-[9px] bg-slate-100 text-slate-600 border-slate-200 rounded-md px-1.5 py-0.5">
                                Class {match?.className}
                              </Badge>
                            );
                          })}
                        </div>
                        <div className="text-center">
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveFromReview(item.tempId)} className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 justify-end border-t border-slate-100 pt-4 mt-2">
              <Button variant="outline" onClick={() => { setShowAdd(false); setReviewList([]); }} className="rounded-xl">
                Cancel
              </Button>
              <Button
                onClick={handleBulkSubmit}
                disabled={reviewList.length === 0}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-6 disabled:opacity-50"
              >
                Save & Submit
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
              value={selectedClassId}
              onChange={e => {
                const val = e.target.value;
                if (val === 'all') {
                  setSelectedClassId('all');
                } else {
                  setSelectedClassId(val ? Number(val) : '');
                }
              }}
              className="h-9 px-3 w-[180px] rounded-xl text-xs border border-slate-200 bg-white shadow-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All Classes</option>
              {classes?.map((cls) => (
                <option key={cls.id} value={cls.id}>Class {cls.className}</option>
              ))}
            </select>

            {/* Reset */}
            {(search || (selectedClassId && selectedClassId !== 'all')) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setSelectedClassId('all');
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
          <div className="grid grid-cols-[80px_2fr_2fr_100px] border-b border-slate-200 bg-slate-50/60 px-4 py-2.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">#</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Subject</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Classes</span>
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
                  <div key={s.subjectName} className="grid grid-cols-[80px_2fr_2fr_100px] items-center px-4 py-3 hover:bg-slate-50/60 transition-colors">
                    <span className="text-sm text-slate-500 font-medium">#{serialNum}</span>
                    <span className="text-sm font-semibold text-slate-800">{s.subjectName}</span>
                    <div className="flex flex-wrap gap-1">
                      {s.classNames && s.classNames.length > 0 ? (
                        s.classNames.map((name: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 border-slate-200">
                            Class {name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </div>
                    <div className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(s)}
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
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Assigned Classes</Label>
              <div className="grid grid-cols-2 gap-2 border border-slate-100 rounded-xl p-3 max-h-36 overflow-y-auto bg-slate-50/50">
                {classes.map((cls) => {
                  const checked = editForm.classIds.includes(cls.id);
                  return (
                    <label key={cls.id} className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:bg-white p-1 rounded-lg cursor-pointer transition-all border border-transparent hover:border-slate-100">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setEditForm(prev => {
                            const isChecked = prev.classIds.includes(cls.id);
                            const nextClassIds = isChecked
                              ? prev.classIds.filter(id => id !== cls.id)
                              : [...prev.classIds, cls.id];
                            
                            const nextClassCodes = { ...prev.classCodes };
                            if (!isChecked) {
                              if (!nextClassCodes[cls.id]) {
                                const cleanPrefix = prev.subjectName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4);
                                const cleanClassName = cls.className.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                                nextClassCodes[cls.id] = {
                                  id: 0,
                                  subjectCode: `${cleanPrefix}${cleanClassName}1001`,
                                };
                              }
                            }
                            return {
                              ...prev,
                              classIds: nextClassIds,
                              classCodes: nextClassCodes,
                            };
                          });
                        }}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                      />
                      Class {cls.className}
                    </label>
                  );
                })}
              </div>
            </div>
            {editForm.classIds.length > 0 && (
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Subject Codes Class-wise</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                  {editForm.classIds.map((cid) => {
                    const cls = classes.find(c => c.id === cid);
                    const codeInfo = editForm.classCodes[cid] || { id: 0, subjectCode: '' };
                    return (
                      <div key={cid} className="flex items-center justify-between gap-3 bg-white p-2 rounded-lg border border-slate-100">
                        <span className="text-xs font-bold text-slate-700">Class {cls?.className}</span>
                        <Input
                          value={codeInfo.subjectCode}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase();
                            setEditForm(prev => ({
                              ...prev,
                              classCodes: {
                                ...prev.classCodes,
                                [cid]: {
                                  ...prev.classCodes[cid],
                                  subjectCode: val,
                                }
                              }
                            }));
                          }}
                          placeholder="Subject Code"
                          className="h-8 w-40 text-xs rounded-lg border-slate-200 text-right font-mono"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button variant="outline" onClick={() => setEditingSubject(null)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleEditSave}
              disabled={
                (updateMutation as any).isPending ||
                (updateMutation as any).isLoading ||
                (createMutation as any).isPending ||
                (createMutation as any).isLoading ||
                (deleteMutation as any).isPending ||
                (deleteMutation as any).isLoading
              }
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5"
            >
              {((updateMutation as any).isPending ||
                (updateMutation as any).isLoading ||
                (createMutation as any).isPending ||
                (createMutation as any).isLoading ||
                (deleteMutation as any).isPending ||
                (deleteMutation as any).isLoading) ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}