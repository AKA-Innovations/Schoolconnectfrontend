'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TeacherFilterBar } from '@/components/admin/teacher/TeacherFilterBar';
import { TeacherTable } from '@/components/admin/teacher/TeacherTable';
import { TeacherFilterParams } from '@/types/roles';

interface TeachersTabProps {
  filteredTeachers: any[];
  allTeachers: any[];
  loadingTeachers: boolean;
  teacherSearch: string;
  setTeacherSearch: (val: string) => void;
  subjectDetails: any[];
  TableSkeleton: React.ComponentType<any>;
}

export function TeachersTab({
  allTeachers,
  loadingTeachers,
  subjectDetails,
}: TeachersTabProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<TeacherFilterParams>({});
  const itemsPerPage = 10;

  // Sync classes from subjectDetails into each teacher
  const teachersWithMappedClasses = useMemo(() => {
    return allTeachers.map((t) => {
      const tSubjects = subjectDetails.filter((sd) => sd.teacherId === t.id);
      const classes = tSubjects.map((sd) => ({
        className: String(sd.className),
        sectionName: String(sd.sectionName),
        subjectName: sd.subjectName,
      }));
      return {
        ...t,
        classes,
      };
    });
  }, [allTeachers, subjectDetails]);

  // Apply filters client-side
  const filtered = useMemo(() => {
    let result = teachersWithMappedClasses;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          `${t.firstName} ${t.lastName}`.toLowerCase().includes(q) ||
          t.employeeId?.toLowerCase().includes(q) ||
          t.emailId?.toLowerCase().includes(q)
      );
    }

    if (filters.subjectName) {
      const sub = filters.subjectName.toLowerCase();
      result = result.filter((t) =>
        t.classes.some((c: any) => c.subjectName?.toLowerCase().includes(sub))
      );
    }

    if (filters.className) {
      const cls = filters.className.toLowerCase();
      result = result.filter((t) =>
        t.classes.some((c: any) => c.className?.toLowerCase().includes(cls))
      );
    }

    if (filters.isPrincipal) {
      result = result.filter((t) => t.isPrincipal);
    }
    if (filters.isCoordinator) {
      result = result.filter((t) => t.isCoordinator);
    }
    if (filters.isSubjectTeacher) {
      result = result.filter((t) => t.isSubjectTeacher);
    }

    return result;
  }, [teachersWithMappedClasses, searchTerm, filters]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedTeachers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({});
  };

  return (
    <div className="space-y-6">
      <TeacherFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        onFiltersChange={setFilters}
        onClear={handleClearFilters}
      />

      <TeacherTable
        teachers={paginatedTeachers}
        isLoading={loadingTeachers}
        page={currentPage}
        totalPages={totalPages}
        onView={(t) => router.push(`/dashboard/teacher/teachers/${t.id}`)}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
