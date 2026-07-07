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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

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
  const { data: allSections = [] } = useSchoolSections();
  const selectedSection = classSectionFilter ? allSections.find(s => String(s.id) === classSectionFilter) : undefined;
  const { data: allSubjects = [] } = useSubjectOptions(selectedSection?.classId);
  const { data: teacherAssignments = [] } = useSubjectDetails(
    role === 'teacher' ? user?.id : undefined,
    'all'
  );
  const { data: subjectDetails = [] } = useSubjectDetails(undefined, 'all');

  // Define sectionsMap using raw allSections to prevent dependency loop
  const sectionsMap = useMemo(() => new Map(allSections.map((s) => [s.id, s])), [allSections]);

  const sections = useMemo(() => {
    if (role === 'principal' || role === 'admin') {
      return allSections;
    }
    if (role === 'coordinator' || role === 'subject_coordinator') {
      const coordClasses = (user?.coordinatorClasses ?? []).map(c => 
        String(typeof c === 'object' ? c.className : c)
      ).filter(Boolean);
      return allSections.filter(s => coordClasses.includes(s.className));
    }
    // Teacher: only show classes/sections that match both className and sectionName of their assignments
    return allSections.filter(s => 
      teacherAssignments.some(ta => ta.className === s.className && ta.sectionName === s.sectionName)
    );
  }, [allSections, role, user, teacherAssignments]);

  const subjects = useMemo(() => {
    let filteredSubjects = allSubjects;

    if (role === 'principal' || role === 'admin') {
      filteredSubjects = allSubjects;
    } else if (role === 'coordinator' || role === 'subject_coordinator') {
      const coordClasses = (user?.coordinatorClasses ?? []).map(c => 
        String(typeof c === 'object' ? c.className : c)
      ).filter(Boolean);
      
      const coordinatorSubjects = subjectDetails
        .filter(sd => coordClasses.includes(sd.className))
        .map(sd => sd.subjectName);

      filteredSubjects = allSubjects.filter(sub => coordinatorSubjects.includes(sub.subjectName));
    } else {
      // Teacher: only show subjects assigned to the teacher
      const teacherSubjects = teacherAssignments.map(ta => ta.subjectName);
      filteredSubjects = allSubjects.filter(sub => teacherSubjects.includes(sub.subjectName));
    }

    // Filter by selected class/section if set
    if (classSectionFilter) {
      const selectedSection = sectionsMap.get(Number(classSectionFilter));
      if (selectedSection) {
        if (role === 'teacher') {
          const classSpecificSubjects = teacherAssignments
            .filter(ta => ta.className === selectedSection.className && ta.sectionName === selectedSection.sectionName)
            .map(ta => ta.subjectName);
          filteredSubjects = filteredSubjects.filter(sub => classSpecificSubjects.includes(sub.subjectName));
        } else {
          const classSpecificSubjects = subjectDetails
            .filter(sd => sd.className === selectedSection.className && sd.sectionName === selectedSection.sectionName)
            .map(sd => sd.subjectName);
          filteredSubjects = filteredSubjects.filter(sub => classSpecificSubjects.includes(sub.subjectName));
        }
      }
    }

    // Deduplicate by name to prevent multiple identical listings in dropdown
    const uniqueSubjects: typeof filteredSubjects = [];
    const seenNames = new Set<string>();
    for (const sub of filteredSubjects) {
      if (!seenNames.has(sub.subjectName)) {
        seenNames.add(sub.subjectName);
        uniqueSubjects.push(sub);
      }
    }
    return uniqueSubjects;
  }, [allSubjects, role, user, teacherAssignments, subjectDetails, classSectionFilter, sectionsMap]);

  const deleteMutation = useDeleteStudyMaterial();

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
  }, [data, debouncedSearch, classSectionFilter, subjectFilter, ownerFilter, user, sectionsMap, subjectsMap, teachersMap]);

  const resetFilters = useCallback(() => {
    setSearch('');
    setClassSectionFilter('');
    setSubjectFilter('');
    setOwnerFilter('all');
  }, []);

  const handleDelete = (id: number) => {
    setDeleteTarget(id);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget === null) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget);
      setDeleteTarget(null);
    } catch (err) {
      // handled
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AcademicPageHeader badge="Academic Resources" title="Study" titleAccent="Materials">
        <Button variant="outline" size="icon" onClick={() => refetch()} className="rounded-2xl h-12 w-12 border-slate-200">
          <RefreshCw className={`h-4 w-4 text-slate-500 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
        {canUpload && (
          <Button onClick={() => setUploadOpen(true)} className="h-12 px-6 rounded-2xl">
            <Plus className="mr-2 h-5 w-5" /><span className="font-bold">Upload File</span>
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
        <div className="w-48">
          <Select
            value={classSectionFilter}
            onValueChange={setClassSectionFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Classes</SelectItem>
              {sections.map((cs) => (
                <SelectItem key={cs.id} value={String(cs.id)}>
                  Class {cs.className}-{cs.sectionName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-48">
          <Select
            value={subjectFilter}
            onValueChange={setSubjectFilter}
          >
            <SelectTrigger disabled={!classSectionFilter}>
              <SelectValue placeholder={classSectionFilter ? "All Subjects" : "Select Class First"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Subjects</SelectItem>
              {subjects.map((sub) => (
                <SelectItem key={sub.id} value={String(sub.id)}>
                  {sub.subjectName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-48">
          <Select
            value={ownerFilter}
            onValueChange={(val) => setOwnerFilter(val as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Teachers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teachers</SelectItem>
              <SelectItem value="mine">My Materials</SelectItem>
              <SelectItem value="others">Other Teachers</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </AcademicFilterBar>

      <StudyMaterialTable materials={materials} isLoading={isLoading} onDelete={handleDelete} />

      <StudyMaterialUploadModal open={isUploadOpen} onOpenChange={setUploadOpen} onSuccess={() => setUploadOpen(false)} />

      <DeleteConfirmDialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Material" description="This will permanently delete this study material file." onConfirm={handleDeleteConfirm} loading={deleteMutation.isPending} />
    </div>
  );
}
