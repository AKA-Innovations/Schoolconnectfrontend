'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import { useHomeworks, useDeleteHomework } from '@/hooks/useAcademic';
import { useAuthStore } from '@/store/authStore';
import { AcademicPageHeader } from '../shared/AcademicPageHeader';
import { AcademicFilterBar } from '../shared/AcademicFilterBar';
import { HomeworkTable } from './HomeworkTable';
import { HomeworkFormModal } from './HomeworkFormModal';
import { HomeworkDetailView } from './HomeworkDetailView';
import { DeleteConfirmDialog } from '../shared/DeleteConfirmDialog';
import type { Homework } from '@/services/academic/types';

export function HomeworkManagement() {
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [isFormOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Homework | null>(null);
  const [viewItem, setViewItem] = useState<Homework | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const role = useAuthStore((s) => s.role);
  const canUpload = role === 'teacher' || role === 'subject_coordinator';

  const debouncedSearch = useDebounce(search, 400);
  const { data, isLoading, isFetching, refetch } = useHomeworks(classFilter || undefined);
  const deleteMutation = useDeleteHomework();

  const homeworks = useMemo(() => {
    const items = data ?? [];
    if (!debouncedSearch) return items;
    const q = debouncedSearch.toLowerCase();
    return items.filter((h) => h.title.toLowerCase().includes(q) || h.description.toLowerCase().includes(q));
  }, [data, debouncedSearch]);

  const handleEdit = useCallback((hw: Homework) => { setEditItem(hw); setFormOpen(true); }, []);
  const handleView = useCallback((hw: Homework) => setViewItem(hw), []);
  const handleDelete = useCallback((id: number) => setDeleteTarget(id), []);
  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget == null) return;
    deleteMutation.mutate(deleteTarget, { onSuccess: () => setDeleteTarget(null) });
  }, [deleteTarget, deleteMutation]);

  if (viewItem) {
    return <HomeworkDetailView homework={viewItem} onBack={() => setViewItem(null)} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AcademicPageHeader badge="Assignments" title="Homework" titleAccent="Manager">
        <Button variant="outline" size="icon" onClick={() => refetch()} className="rounded-2xl h-12 w-12 border-slate-200">
          <RefreshCw className={`h-4 w-4 text-slate-500 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
        {canUpload && (
          <Button onClick={() => { setEditItem(null); setFormOpen(true); }} className="h-12 px-6 rounded-2xl">
            <Plus className="mr-2 h-5 w-5" /><span className="font-bold">Create Homework</span>
          </Button>
        )}
      </AcademicPageHeader>

      <AcademicFilterBar searchTerm={search} onSearchChange={setSearch} searchPlaceholder="Search homework..."
        onClear={() => { setSearch(''); setClassFilter(''); }} hasActiveFilters={!!(search || classFilter)}>
        <input placeholder="Filter by class..." value={classFilter} onChange={(e) => setClassFilter(e.target.value)}
          className="h-10 pl-4 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-500/20 transition-all w-44" />
      </AcademicFilterBar>

      <HomeworkTable homeworks={homeworks} isLoading={isLoading} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />

      <HomeworkFormModal open={isFormOpen} onOpenChange={setFormOpen} editItem={editItem}
        onSuccess={() => { setFormOpen(false); setEditItem(null); }} />

      <DeleteConfirmDialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Homework" description="This will permanently delete this homework and all related submissions and documents." onConfirm={handleDeleteConfirm} loading={deleteMutation.isPending} />
    </div>
  );
}
