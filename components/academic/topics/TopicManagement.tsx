'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import { useSubjectTopics, useDeleteTopic } from '@/hooks/useAcademic';
import { AcademicPageHeader } from '../shared/AcademicPageHeader';
import { AcademicFilterBar } from '../shared/AcademicFilterBar';
import { TopicTable } from './TopicTable';
import { TopicFormModal } from './TopicFormModal';
import { DeleteConfirmDialog } from '../shared/DeleteConfirmDialog';
import type { SubjectTopic } from '@/services/academic/types';

export function TopicManagement() {
  const [search, setSearch] = useState('');
  const [chapterIdFilter, setChapterIdFilter] = useState('');
  const [isFormOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<SubjectTopic | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const debouncedSearch = useDebounce(search, 400);
  const { data, isLoading, isFetching, refetch } = useSubjectTopics(chapterIdFilter || undefined);
  const deleteMutation = useDeleteTopic();

  const topics = useMemo(() => {
    const items = data ?? [];
    if (!debouncedSearch) return items;
    const q = debouncedSearch.toLowerCase();
    return items.filter((t) => t.topicName.toLowerCase().includes(q));
  }, [data, debouncedSearch]);

  const handleEdit = useCallback((topic: SubjectTopic) => { setEditItem(topic); setFormOpen(true); }, []);
  const handleDelete = useCallback((id: number) => setDeleteTarget(id), []);
  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget == null) return;
    deleteMutation.mutate(deleteTarget, { onSuccess: () => setDeleteTarget(null) });
  }, [deleteTarget, deleteMutation]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AcademicPageHeader badge="Syllabus Detail" title="Subject" titleAccent="Topics">
        <Button variant="outline" size="icon" onClick={() => refetch()} className="rounded-2xl h-12 w-12 border-slate-200">
          <RefreshCw className={`h-4 w-4 text-slate-500 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
        <Button onClick={() => { setEditItem(null); setFormOpen(true); }} className="h-12 px-6 rounded-2xl">
          <Plus className="mr-2 h-5 w-5" /><span className="font-bold">Add Topic</span>
        </Button>
      </AcademicPageHeader>

      <AcademicFilterBar searchTerm={search} onSearchChange={setSearch} searchPlaceholder="Search topics..."
        onClear={() => { setSearch(''); setChapterIdFilter(''); }} hasActiveFilters={!!(search || chapterIdFilter)}>
        <input placeholder="Filter by chapter ID..." value={chapterIdFilter} onChange={(e) => setChapterIdFilter(e.target.value)}
          className="h-10 pl-4 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-500/20 transition-all w-44" />
      </AcademicFilterBar>

      <TopicTable topics={topics} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDelete} />

      <TopicFormModal open={isFormOpen} onOpenChange={setFormOpen} editItem={editItem}
        onSuccess={() => { setFormOpen(false); setEditItem(null); }} />

      <DeleteConfirmDialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Topic" description="This will permanently delete this topic." onConfirm={handleDeleteConfirm} loading={deleteMutation.isPending} />
    </div>
  );
}
