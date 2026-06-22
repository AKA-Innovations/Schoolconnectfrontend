'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import { useSubjectChapters, useDeleteChapter } from '@/hooks/useAcademic';
import { useSubjectOptions } from '@/hooks/useClasses';
import { CURRENT_SESSION } from '@/lib/constants';
import { AcademicPageHeader } from '../shared/AcademicPageHeader';
import { AcademicFilterBar } from '../shared/AcademicFilterBar';
import { ChapterTable } from './ChapterTable';
import { ChapterFormModal } from './ChapterFormModal';
import { DeleteConfirmDialog } from '../shared/DeleteConfirmDialog';
import type { SubjectChapter } from '@/services/academic/types';

interface Props {
  classFilter?: string;
}

export function ChapterManagement({ classFilter }: Props) {
  const [search, setSearch] = useState('');
  const [classNameFilter, setClassNameFilter] = useState(classFilter ?? '');
  const [subjectIdFilter, setSubjectIdFilter] = useState('');
  const [isFormOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<SubjectChapter | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  // Fetch subject options for the selected class
  const { data: subjectOptions = [], isLoading: loadingSubjects } = useSubjectOptions(classNameFilter || undefined);

  // Fetch chapters by subjectId + session
  const { data, isLoading, isFetching, refetch } = useSubjectChapters(
    subjectIdFilter || undefined,
    CURRENT_SESSION
  );
  const deleteMutation = useDeleteChapter();

  const chapters = useMemo(() => {
    const items = data ?? [];
    if (!debouncedSearch) return items;
    const q = debouncedSearch.toLowerCase();
    return items.filter((c) => c.chapterName.toLowerCase().includes(q));
  }, [data, debouncedSearch]);

  const handleEdit = useCallback((chapter: SubjectChapter) => {
    setEditItem(chapter);
    setFormOpen(true);
  }, []);

  const handleDelete = useCallback((id: number) => setDeleteTarget(id), []);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget == null) return;
    deleteMutation.mutate(deleteTarget, {
      onSuccess: () => setDeleteTarget(null),
    });
  }, [deleteTarget, deleteMutation]);

  const resetFilters = useCallback(() => {
    setSearch('');
    setClassNameFilter('');
    setSubjectIdFilter('');
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AcademicPageHeader badge="Syllabus Structure" title="Subject" titleAccent="Chapters">
        <Button
          variant="outline"
          size="icon"
          onClick={() => refetch()}
          className="rounded-2xl h-12 w-12 border-slate-200"
        >
          <RefreshCw className={`h-4 w-4 text-slate-500 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
        <Button
          onClick={() => { setEditItem(null); setFormOpen(true); }}
          className="h-12 px-6 rounded-2xl"
        >
          <Plus className="mr-2 h-5 w-5" />
          <span className="font-bold">Add Chapter</span>
        </Button>
      </AcademicPageHeader>

      <AcademicFilterBar
        searchTerm={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search chapters..."
        onClear={resetFilters}
        hasActiveFilters={!!(search || classNameFilter || subjectIdFilter)}
      >
        <input
          placeholder="Filter by class..."
          value={classNameFilter}
          onChange={(e) => { setClassNameFilter(e.target.value); setSubjectIdFilter(''); }}
          className="h-10 pl-4 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-500/20 transition-all w-44"
        />
        <select
          value={subjectIdFilter}
          onChange={(e) => setSubjectIdFilter(e.target.value)}
          disabled={!classNameFilter || loadingSubjects}
          className="h-10 pl-4 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-500/20 transition-all w-48 disabled:opacity-50"
        >
          <option value="">{loadingSubjects ? 'Loading...' : 'Select Subject'}</option>
          {subjectOptions.map(sub => (
            <option key={sub.id} value={sub.id}>{sub.subjectName}</option>
          ))}
        </select>
      </AcademicFilterBar>

      <ChapterTable
        chapters={chapters}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ChapterFormModal
        open={isFormOpen}
        onOpenChange={setFormOpen}
        editItem={editItem}
        onSuccess={() => { setFormOpen(false); setEditItem(null); }}
      />

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Chapter"
        description="This will permanently delete this chapter and may affect related topics and progress records."
        onConfirm={handleDeleteConfirm}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
