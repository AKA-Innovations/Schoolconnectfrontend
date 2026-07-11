'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useClassTeachers } from '@/hooks/useClasses';
import { useTeacherList, useAddClassTeacher, useRemoveClassTeacher } from '@/hooks/useTeachers';
import { useAuthStore } from '@/store/authStore';
import { useQueryClient } from '@tanstack/react-query';
import {
  Phone, Search, RefreshCw, AlertCircle, Pencil, X,
  CheckCircle2, UserRound, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Mapping {
  className: string;
  sectionName: string;
  maxLimit?: number | null;
  classTeacherId?: string | null;
  teacherName?: string | null;
  teacherMobile?: string | null;
}

// ─── Edit Drawer ──────────────────────────────────────────────────────────────

function EditMappingDrawer({
  mapping,
  onClose,
}: {
  mapping: Mapping;
  onClose: () => void;
}) {
  const schoolId = useAuthStore((s) => s.schoolId) ?? '';
  const qc = useQueryClient();

  const { data: teacherData } = useTeacherList({ pageSize: 200 }, { enabled: true });
  const teachers: any[] = (teacherData as any)?.data ?? (Array.isArray(teacherData) ? teacherData : []);

  const [newTeacherId, setNewTeacherId] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const addMutation    = useAddClassTeacher();
  const removeMutation = useRemoveClassTeacher();

  const handleSave = useCallback(async () => {
    if (!newTeacherId) return;
    setStatus('saving');
    setErrorMsg('');
    try {
      // 1. Remove the existing class teacher assignment if there is one
      if (mapping.classTeacherId) {
        await removeMutation.mutateAsync({
          classTeacherId: mapping.classTeacherId,
          className: mapping.className,
          sectionName: mapping.sectionName,
          schoolId,
        });
      }
      // 2. Add the new assignment
      await addMutation.mutateAsync({
        classTeacherId: newTeacherId,
        className: mapping.className,
        sectionName: mapping.sectionName,
        schoolId,
      });
      qc.invalidateQueries({ queryKey: ['teachers'] });
      qc.invalidateQueries({ queryKey: ['classes'] });
      setStatus('success');
      setTimeout(onClose, 900);
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err?.response?.data?.message ?? 'Failed to update assignment.');
    }
  }, [newTeacherId, mapping, schoolId, addMutation, removeMutation, qc, onClose]);

  const normalizedTeachers: { id: string; firstName: string; lastName: string }[] =
    Array.isArray(teachers)
      ? teachers.map((t: any) => ({
          id: t.id ?? t.teacherId ?? '',
          firstName: t.firstName ?? '',
          lastName: t.lastName ?? '',
        }))
      : [];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full z-50 w-full max-w-sm bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border">
          <div>
            <h3 className="text-base font-semibold text-foreground">Edit Class Teacher</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Reassign teacher for{' '}
              <span className="font-medium text-foreground">
                Class {mapping.className} — Section {mapping.sectionName}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Current teacher */}
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Current Assignment</p>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <UserRound className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{mapping.teacherName ?? 'Unassigned'}</p>
                {mapping.teacherMobile && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {mapping.teacherMobile}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* New teacher picker */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Assign New Teacher
            </label>
            <select
              value={newTeacherId}
              onChange={(e) => { setNewTeacherId(e.target.value); setStatus('idle'); }}
              className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select a teacher…</option>
              {normalizedTeachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.firstName} {t.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Error */}
          {status === 'error' && (
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 p-3 text-sm text-rose-700 dark:text-rose-400">
              {errorMsg}
            </div>
          )}

          {/* Success */}
          {status === 'success' && (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3 flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" /> Assignment updated successfully!
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex items-center gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl" disabled={status === 'saving'}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!newTeacherId || status === 'saving' || status === 'success'}
            className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {status === 'saving' ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving…</>
            ) : (
              'Save Assignment'
            )}
          </Button>
        </div>
      </div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ClassTeacherMapping() {
  const [searchTeacher, setSearchTeacher] = useState('');
  const [searchClass, setSearchClass]     = useState('');
  const [page, setPage]                   = useState(1);
  const [editMapping, setEditMapping]     = useState<Mapping | null>(null);

  const { data, isLoading, isFetching, refetch } = useClassTeachers({
    page,
    limit: 10,
    teacherName: searchTeacher || undefined,
    className:   searchClass   || undefined,
  });

  const teacherMappings = data?.items || [];
  const pagination      = data?.pagination;
  const total           = pagination?.totalPages || 1;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 animate-in fade-in duration-500">

      {/* Edit Drawer */}
      {editMapping && (
        <EditMappingDrawer
          mapping={editMapping}
          onClose={() => { setEditMapping(null); refetch(); }}
        />
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Class Teacher Mapping</h2>
        <p className="text-sm text-muted-foreground mt-1">View and edit teacher assignments across classes and sections</p>
      </div>

      {/* Search Controls */}
      <Card className="rounded-2xl border-border shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                Search by Class
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Class name..."
                  value={searchClass}
                  onChange={(e) => { setSearchClass(e.target.value); setPage(1); }}
                  className="pl-10 rounded-xl h-10"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                Search by Teacher
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Teacher name..."
                  value={searchTeacher}
                  onChange={(e) => { setSearchTeacher(e.target.value); setPage(1); }}
                  className="pl-10 rounded-xl h-10"
                />
              </div>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              className="rounded-xl h-10 w-10"
              title="Refresh"
            >
              <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Teacher Mappings Table */}
      <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/10 py-6 px-8">
          <CardTitle className="text-lg font-bold tracking-tight">Teacher Assignments</CardTitle>
          <CardDescription className="text-xs font-medium mt-1">
            {pagination?.totalItemsCount || 0} assignments found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="h-8 w-8 mx-auto mb-3 text-muted-foreground/40 animate-spin" />
              <p className="text-sm text-muted-foreground">Loading assignments…</p>
            </div>
          ) : teacherMappings.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
              <p className="text-muted-foreground">No teacher assignments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/5">
                    <th className="px-8 py-4 text-left font-bold text-xs uppercase tracking-widest text-muted-foreground">Class</th>
                    <th className="px-8 py-4 text-left font-bold text-xs uppercase tracking-widest text-muted-foreground">Section</th>
                    <th className="px-8 py-4 text-left font-bold text-xs uppercase tracking-widest text-muted-foreground">Teacher Name</th>
                    <th className="px-8 py-4 text-left font-bold text-xs uppercase tracking-widest text-muted-foreground">Mobile</th>
                    <th className="px-8 py-4 text-left font-bold text-xs uppercase tracking-widest text-muted-foreground">Max Limit</th>
                    <th className="px-8 py-4 text-right font-bold text-xs uppercase tracking-widest text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teacherMappings.map((mapping, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-8 py-4">
                        <Badge className="bg-blue-500/10 text-blue-600 border-0">{mapping.className}</Badge>
                      </td>
                      <td className="px-8 py-4">
                        <Badge className="bg-purple-500/10 text-purple-600 border-0">{mapping.sectionName}</Badge>
                      </td>
                      <td className="px-8 py-4 font-semibold">{mapping.teacherName ?? '—'}</td>
                      <td className="px-8 py-4">
                        {mapping.teacherMobile ? (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" /> {mapping.teacherMobile}
                          </div>
                        ) : '—'}
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-sm text-foreground">{mapping.maxLimit ?? '—'}</span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <button
                          onClick={() => setEditMapping(mapping)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 bg-primary/8 hover:bg-primary/15 border border-primary/20 hover:border-primary/40 px-3 py-1.5 rounded-lg transition-all duration-150"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {total > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline" size="sm"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="rounded-lg"
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(total, 5) }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={page === p ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPage(p)}
                className="rounded-lg w-8 h-8 p-0"
              >
                {p}
              </Button>
            ))}
          </div>
          <Button
            variant="outline" size="sm"
            onClick={() => setPage(Math.min(total, page + 1))}
            disabled={page === total}
            className="rounded-lg"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
