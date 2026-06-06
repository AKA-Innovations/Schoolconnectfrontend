'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import { useStudyMaterials, useDeleteStudyMaterial } from '@/hooks/useAcademic';
import { useSchoolSections, useSubjectOptions, useSubjectDetails } from '@/hooks/useClasses';
import { useAuthStore } from '@/store/authStore';
import { AcademicPageHeader } from '../shared/AcademicPageHeader';
import { AcademicFilterBar } from '../shared/AcademicFilterBar';
import { StudyMaterialTable } from './StudyMaterialTable';
import { StudyMaterialUploadModal } from './StudyMaterialUploadModal';
import { DeleteConfirmDialog } from '../shared/DeleteConfirmDialog';
import type { StudyMaterial } from '@/services/academic/types';

export function StudyMaterialManagement() {
  const [search, setSearch] = useState('');
  const [classSectionFilter, setClassSectionFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState<'all' | 'mine' | 'others'>('all');
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const canUpload = role === 'teacher' || role === 'subject_coordinator';
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading, isFetching, refetch } = useStudyMaterials();
  const { data: sections = [] } = useSchoolSections();
  const { data: subjects = [] } = useSubjectOptions();
  const { data: subjectDetails = [] } = useSubjectDetails(undefined, 'all');

  const deleteMutation = useDeleteStudyMaterial();

  // Create fast-lookup maps for O(1) search performance
  const sectionsMap = useMemo(() => new Map(sections.map((s) => [s.id, s])), [sections]);
  const subjectsMap = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects]);
  const teachersMap = useMemo(() => new Map(subjectDetails.map((sd) => [sd.teacherId, sd.teacherName])), [subjectDetails]);

  const materials = useMemo(() => {
    const items = data ?? [];

    const enriched = items.map((m) => {
      // Find class section details from pre-computed Map
      const section = sectionsMap.get(m.classSectionId);
      // Find subject details from pre-computed Map
      const subject = subjectsMap.get(m.subjectId);
      
      // Find teacher name from pre-computed Map
      let teacherName = '';
      if (m.teacherId === user?.id) {
        teacherName = user?.name || 'Me';
      } else {
        teacherName = (m.teacherId ? teachersMap.get(m.teacherId) : '') || 'Other Teacher';
      }

      return {
        ...m,
        className: section?.className,
        sectionName: section?.sectionName,
        subjectName: subject?.subjectName,
        teacherName,
      };
    });

    return enriched.filter((m) => {
      // Search term
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const descMatch = m.description.toLowerCase().includes(q);
        const fileNameMatch = (m.documentPath || '').split('/').pop()?.toLowerCase().includes(q);
        if (!descMatch && !fileNameMatch) return false;
      }

      // Class / Section
      if (classSectionFilter && String(m.classSectionId) !== classSectionFilter) {
        return false;
      }

      // Subject
      if (subjectFilter && String(m.subjectId) !== subjectFilter) {
        return false;
      }

      // Owner filter
      if (ownerFilter === 'mine') {
        if (m.teacherId !== user?.id) return false;
      } else if (ownerFilter === 'others') {
        if (m.teacherId === user?.id) return false;
      }

      return true;
    });
  }, [data, debouncedSearch, classSectionFilter, subjectFilter, ownerFilter, sectionsMap, subjectsMap, teachersMap, user]);

  const handleDelete = useCallback((id: number) => setDeleteTarget(id), []);
  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget == null) return;
    deleteMutation.mutate(deleteTarget, { onSuccess: () => setDeleteTarget(null) });
  }, [deleteTarget, deleteMutation]);

  const resetFilters = useCallback(() => {
    setSearch('');
    setClassSectionFilter('');
    setSubjectFilter('');
    setOwnerFilter('all');
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AcademicPageHeader badge="Resources" title="Study" titleAccent="Materials">
        <Button variant="outline" size="icon" onClick={() => refetch()} className="rounded-2xl h-12 w-12 border-slate-200">
          <RefreshCw className={`h-4 w-4 text-slate-500 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
        {canUpload && (
          <Button onClick={() => setUploadOpen(true)} className="h-12 px-6 rounded-2xl">
            <Plus className="mr-2 h-5 w-5" /><span className="font-bold">Upload Material</span>
          </Button>
        )}
      </AcademicPageHeader>

      <AcademicFilterBar 
        searchTerm={search} 
        onSearchChange={setSearch} 
        searchPlaceholder="Search materials..."
        onClear={resetFilters} 
        hasActiveFilters={!!(search || classSectionFilter || subjectFilter || ownerFilter !== 'all')}
      >
        <select
          value={classSectionFilter}
          onChange={(e) => setClassSectionFilter(e.target.value)}
          className="h-10 pl-4 pr-8 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all w-48 appearance-none cursor-pointer hover:border-slate-300"
          style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em', backgroundRepeat: 'no-repeat' }}
        >
          <option value="">All Classes</option>
          {sections.map((cs) => (
            <option key={cs.id} value={cs.id}>
              Class {cs.className}-{cs.sectionName}
            </option>
          ))}
        </select>

        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="h-10 pl-4 pr-8 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all w-48 appearance-none cursor-pointer hover:border-slate-300"
          style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em', backgroundRepeat: 'no-repeat' }}
        >
          <option value="">All Subjects</option>
          {subjects.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.subjectName}
            </option>
          ))}
        </select>

        <select
          value={ownerFilter}
          onChange={(e) => setOwnerFilter(e.target.value as any)}
          className="h-10 pl-4 pr-8 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all w-48 appearance-none cursor-pointer hover:border-slate-300"
          style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em', backgroundRepeat: 'no-repeat' }}
        >
          <option value="all">All Teachers</option>
          <option value="mine">My Materials</option>
          <option value="others">Other Teachers</option>
        </select>
      </AcademicFilterBar>

      <StudyMaterialTable materials={materials} isLoading={isLoading} onDelete={handleDelete} />

      <StudyMaterialUploadModal open={isUploadOpen} onOpenChange={setUploadOpen} onSuccess={() => setUploadOpen(false)} />

      <DeleteConfirmDialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Material" description="This will permanently delete this study material file." onConfirm={handleDeleteConfirm} loading={deleteMutation.isPending} />
    </div>
  );
}
