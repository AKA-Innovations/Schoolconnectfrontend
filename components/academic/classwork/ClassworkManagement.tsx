'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import { useClassworks, useDeleteClasswork } from '@/hooks/useAcademic';
import { AcademicPageHeader } from '../shared/AcademicPageHeader';
import { AcademicFilterBar } from '../shared/AcademicFilterBar';
import { ClassworkTable } from './ClassworkTable';
import { ClassworkFormModal } from './ClassworkFormModal';
import { DeleteConfirmDialog } from '../shared/DeleteConfirmDialog';
import type { Classwork } from '@/services/academic/types';

export function ClassworkManagement() {
  const [search, setSearch] = useState('');
  const [classIdFilter, setClassIdFilter] = useState('');
  const [isFormOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Classwork | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const debouncedSearch = useDebounce(search, 400);
  const { data, isLoading, isFetching, refetch } = useClassworks(classIdFilter || undefined);
  const deleteMutation = useDeleteClasswork();

  const classworks = useMemo(() => {
    const items = data ?? [];
    if (!debouncedSearch) return items;
    const q = debouncedSearch.toLowerCase();
    return items.filter((c) => c.description.toLowerCase().includes(q));
  }, [data, debouncedSearch]);

  const handleEdit = useCallback((cw: Classwork) => { setEditItem(cw); setFormOpen(true); }, []);
  const handleDelete = useCallback((id: number) => setDeleteTarget(id), []);
  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget == null) return;
    deleteMutation.mutate(deleteTarget, { onSuccess: () => setDeleteTarget(null) });
  }, [deleteTarget, deleteMutation]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AcademicPageHeader badge="Daily Records" title="Classwork" titleAccent="Log">
        <Button variant="outline" size="icon" onClick={() => refetch()} className="rounded-2xl h-12 w-12 border-slate-200">
          <RefreshCw className={`h-4 w-4 text-slate-500 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
        <Button onClick={() => { setEditItem(null); setFormOpen(true); }} className="h-12 px-6 rounded-2xl">
          <Plus className="mr-2 h-5 w-5" /><span className="font-bold">Add Classwork</span>
        </Button>
      </AcademicPageHeader>

      <AcademicFilterBar searchTerm={search} onSearchChange={setSearch} searchPlaceholder="Search classwork..."
        onClear={() => { setSearch(''); setClassIdFilter(''); }} hasActiveFilters={!!(search || classIdFilter)}>
        <input placeholder="Filter by class ID..." value={classIdFilter} onChange={(e) => setClassIdFilter(e.target.value)}
          className="h-10 pl-4 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-500/20 transition-all w-44" />
      </AcademicFilterBar>

      <ClassworkTable classworks={classworks} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDelete} />

      <ClassworkFormModal open={isFormOpen} onOpenChange={setFormOpen} editItem={editItem}
        onSuccess={() => { setFormOpen(false); setEditItem(null); }} />

      <DeleteConfirmDialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Classwork" description="This will permanently delete this classwork entry." onConfirm={handleDeleteConfirm} loading={deleteMutation.isPending} />
    </div>
  );
}
