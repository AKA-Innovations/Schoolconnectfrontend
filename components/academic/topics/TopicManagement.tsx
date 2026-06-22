'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import { useSubjectTopics, useDeleteTopic, useSubjectChapters } from '@/hooks/useAcademic';
import { useSubjectOptions } from '@/hooks/useClasses';
import { CURRENT_SESSION } from '@/lib/constants';
import { AcademicPageHeader } from '../shared/AcademicPageHeader';
import { AcademicFilterBar } from '../shared/AcademicFilterBar';
import { TopicTable } from './TopicTable';
import { TopicFormModal } from './TopicFormModal';
import { DeleteConfirmDialog } from '../shared/DeleteConfirmDialog';
import type { SubjectTopic } from '@/services/academic/types';

export function TopicManagement() {
  const [search, setSearch] = useState('');
  const [classNameFilter, setClassNameFilter] = useState('');
  const [subjectIdFilter, setSubjectIdFilter] = useState('');
  const [chapterIdFilter, setChapterIdFilter] = useState('');
  const [isFormOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<SubjectTopic | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  // Subject options for the class filter
  const { data: subjectOptions = [], isLoading: loadingSubjects } = useSubjectOptions(classNameFilter || undefined);

  // Chapter options for the subject filter
  const { data: chapterOptions = [], isLoading: loadingChapters } = useSubjectChapters(
    subjectIdFilter || undefined,
    CURRENT_SESSION
  );

  // Topics for the selected chapter + subject
  const { data, isLoading, isFetching, refetch } = useSubjectTopics(
    chapterIdFilter || undefined,
    subjectIdFilter || undefined,
    CURRENT_SESSION
  );
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
        onClear={() => { setSearch(''); setClassNameFilter(''); setSubjectIdFilter(''); setChapterIdFilter(''); }}
        hasActiveFilters={!!(search || classNameFilter || subjectIdFilter || chapterIdFilter)}>
        <input placeholder="Filter by class..." value={classNameFilter}
          onChange={(e) => { setClassNameFilter(e.target.value); setSubjectIdFilter(''); setChapterIdFilter(''); }}
          className="h-10 pl-4 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-500/20 transition-all w-36" />
        <select value={subjectIdFilter}
          onChange={(e) => { setSubjectIdFilter(e.target.value); setChapterIdFilter(''); }}
          disabled={!classNameFilter || loadingSubjects}
          className="h-10 pl-4 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-500/20 transition-all w-40 disabled:opacity-50">
          <option value="">{loadingSubjects ? 'Loading...' : 'Select Subject'}</option>
          {subjectOptions.map(sub => <option key={sub.id} value={sub.id}>{sub.subjectName}</option>)}
        </select>
        <select value={chapterIdFilter}
          onChange={(e) => setChapterIdFilter(e.target.value)}
          disabled={!subjectIdFilter || loadingChapters}
          className="h-10 pl-4 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-500/20 transition-all w-44 disabled:opacity-50">
          <option value="">{loadingChapters ? 'Loading...' : 'Select Chapter'}</option>
          {chapterOptions.map(ch => <option key={ch.id} value={ch.id}>{ch.sequenceNo}. {ch.chapterName}</option>)}
        </select>
      </AcademicFilterBar>

      <TopicTable topics={topics} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDelete} />

      <TopicFormModal open={isFormOpen} onOpenChange={setFormOpen} editItem={editItem}
        onSuccess={() => { setFormOpen(false); setEditItem(null); }} />

      <DeleteConfirmDialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Topic" description="This will permanently delete this topic." onConfirm={handleDeleteConfirm} loading={deleteMutation.isPending} />
    </div>
  );
}
