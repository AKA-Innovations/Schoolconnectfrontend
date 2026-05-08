'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTeachingProgress, useDeleteProgress } from '@/hooks/useAcademic';
import { useAuthStore } from '@/store/authStore';
import { AcademicPageHeader } from '../shared/AcademicPageHeader';
import { AcademicFilterBar } from '../shared/AcademicFilterBar';
import { ProgressTable } from './ProgressTable';
import { ProgressFormModal } from './ProgressFormModal';
import { ProgressAnalytics } from './ProgressAnalytics';
import { DeleteConfirmDialog } from '../shared/DeleteConfirmDialog';
import type { TeachingProgress } from '@/services/academic/types';

interface Props { teacherIdOverride?: string; }

export function ProgressManagement({ teacherIdOverride }: Props) {
  const user = useAuthStore((s) => s.user);
  const teacherId = teacherIdOverride ?? (user?.role === 'teacher' ? user.id : undefined);

  const [isFormOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<TeachingProgress | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, isFetching, refetch } = useTeachingProgress(teacherId);
  const deleteMutation = useDeleteProgress();

  const items = useMemo(() => {
    const list = data ?? [];
    if (!statusFilter) return list;
    return list.filter((p) => p.status === statusFilter);
  }, [data, statusFilter]);

  const handleEdit = useCallback((p: TeachingProgress) => { setEditItem(p); setFormOpen(true); }, []);
  const handleDelete = useCallback((id: number) => setDeleteTarget(id), []);
  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget == null) return;
    deleteMutation.mutate(deleteTarget, { onSuccess: () => setDeleteTarget(null) });
  }, [deleteTarget, deleteMutation]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AcademicPageHeader badge="Syllabus Tracking" title="Teaching" titleAccent="Progress">
        <Button variant="outline" size="icon" onClick={() => refetch()} className="rounded-2xl h-12 w-12 border-slate-200">
          <RefreshCw className={`h-4 w-4 text-slate-500 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
        <Button onClick={() => { setEditItem(null); setFormOpen(true); }} className="h-12 px-6 rounded-2xl">
          <Plus className="mr-2 h-5 w-5" /><span className="font-bold">Log Progress</span>
        </Button>
      </AcademicPageHeader>

      <ProgressAnalytics data={data ?? []} />

      <AcademicFilterBar searchTerm={statusFilter} onSearchChange={setStatusFilter} searchPlaceholder="Filter by status (completed, in_progress, not_started)..."
        onClear={() => setStatusFilter('')} hasActiveFilters={!!statusFilter} />

      <ProgressTable items={items} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDelete} />

      <ProgressFormModal open={isFormOpen} onOpenChange={setFormOpen} editItem={editItem}
        onSuccess={() => { setFormOpen(false); setEditItem(null); }} />

      <DeleteConfirmDialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Progress Entry" description="This will remove this progress record." onConfirm={handleDeleteConfirm} loading={deleteMutation.isPending} />
    </div>
  );
}
