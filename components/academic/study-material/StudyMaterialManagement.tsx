'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import { useStudyMaterials, useDeleteStudyMaterial } from '@/hooks/useAcademic';
import { AcademicPageHeader } from '../shared/AcademicPageHeader';
import { AcademicFilterBar } from '../shared/AcademicFilterBar';
import { StudyMaterialTable } from './StudyMaterialTable';
import { StudyMaterialUploadModal } from './StudyMaterialUploadModal';
import { DeleteConfirmDialog } from '../shared/DeleteConfirmDialog';
import type { TeacherStudyMaterial } from '@/services/academic/types';

export function StudyMaterialManagement() {
  const [search, setSearch] = useState('');
  const [classIdFilter, setClassIdFilter] = useState('');
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const debouncedSearch = useDebounce(search, 400);
  const { data, isLoading, isFetching, refetch } = useStudyMaterials(classIdFilter || undefined);
  const deleteMutation = useDeleteStudyMaterial();

  const materials = useMemo(() => {
    const items = data ?? [];
    if (!debouncedSearch) return items;
    const q = debouncedSearch.toLowerCase();
    return items.filter((m) => m.description.toLowerCase().includes(q));
  }, [data, debouncedSearch]);

  const handleDelete = useCallback((id: number) => setDeleteTarget(id), []);
  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget == null) return;
    deleteMutation.mutate(deleteTarget, { onSuccess: () => setDeleteTarget(null) });
  }, [deleteTarget, deleteMutation]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AcademicPageHeader badge="Resources" title="Study" titleAccent="Materials">
        <Button variant="outline" size="icon" onClick={() => refetch()} className="rounded-2xl h-12 w-12 border-slate-200">
          <RefreshCw className={`h-4 w-4 text-slate-500 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
        <Button onClick={() => setUploadOpen(true)} className="h-12 px-6 rounded-2xl">
          <Plus className="mr-2 h-5 w-5" /><span className="font-bold">Upload Material</span>
        </Button>
      </AcademicPageHeader>

      <AcademicFilterBar searchTerm={search} onSearchChange={setSearch} searchPlaceholder="Search materials..."
        onClear={() => { setSearch(''); setClassIdFilter(''); }} hasActiveFilters={!!(search || classIdFilter)}>
        <input placeholder="Filter by class ID..." value={classIdFilter} onChange={(e) => setClassIdFilter(e.target.value)}
          className="h-10 pl-4 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-500/20 transition-all w-44" />
      </AcademicFilterBar>

      <StudyMaterialTable materials={materials} isLoading={isLoading} onDelete={handleDelete} />

      <StudyMaterialUploadModal open={isUploadOpen} onOpenChange={setUploadOpen} onSuccess={() => setUploadOpen(false)} />

      <DeleteConfirmDialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Material" description="This will permanently delete this study material file." onConfirm={handleDeleteConfirm} loading={deleteMutation.isPending} />
    </div>
  );
}
