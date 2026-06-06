'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';
import SearchFilter from '@/components/admin/shared/SearchFilter';
import { StudentTableBody } from '@/components/admin/student/StudentTableBody';
import PaginationControls from '@/components/admin/shared/PaginationControls';

interface StudentsTabProps {
  allStudents: any[];
  classSections: any[];
  totalStudents: number;
  loadingStudents: boolean;
  TableSkeleton: React.ComponentType<any>;
}

export function StudentsTab({
  allStudents,
  classSections,
  totalStudents,
  loadingStudents,
}: StudentsTabProps) {
  const router = useRouter();
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [studentSearch, selectedClass, selectedSection]);

  // 1. Get unique classes list
  const classesList = useMemo(() => {
    return [...new Set(classSections.map((cs) => cs.className))].sort();
  }, [classSections]);

  // 2. Get unique sections of selected class
  const sectionsList = useMemo(() => {
    if (!selectedClass) return [];
    return [
      ...new Set(
        classSections
          .filter((cs) => cs.className === selectedClass)
          .map((cs) => cs.sectionName)
      ),
    ].sort();
  }, [classSections, selectedClass]);

  // 3. Resolve student's class and section using academics or classSectionId
  const getStudentClassSection = (s: any) => {
    const academic = s.academics?.[0];
    if (academic?.className && academic?.sectionName) {
      return {
        className: String(academic.className),
        sectionName: String(academic.sectionName),
        text: `${academic.className} - ${academic.sectionName}`,
      };
    }

    const csId = s.classSectionId || academic?.classSectionId;
    if (csId) {
      const match = classSections.find(
        (cs) => (cs.id && cs.id === csId) || (cs.mappingId && cs.mappingId === csId)
      );
      if (match) {
        return {
          className: String(match.className),
          sectionName: String(match.sectionName),
          text: `${match.className} - ${match.sectionName}`,
        };
      }
    }
    return null;
  };

  // 4. Transform and enrich students for StudentTableBody structure
  const mappedStudents = useMemo(() => {
    return allStudents.map((s) => {
      const classSec = getStudentClassSection(s);
      const rollNumber = s.academics?.[0]?.rollNumber;
      return {
        ...s,
        status: s.status === 'active' || s.status === 'Active' ? 'Active' : 'Inactive',
        academics: classSec ? [{
          className: `Class ${classSec.className}`,
          sectionName: `Section ${classSec.sectionName}`,
          rollNumber: rollNumber || '—',
        }] : undefined,
      };
    });
  }, [allStudents, classSections]);

  // 5. Apply filters client-side
  const filteredStudents = useMemo(() => {
    let result = mappedStudents;

    // Search query
    if (studentSearch) {
      const q = studentSearch.toLowerCase();
      result = result.filter(
        (s: any) =>
          `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
          s.emailId?.toLowerCase().includes(q)
      );
    }

    // Class selection filter
    if (selectedClass) {
      result = result.filter((s: any) => {
        const academic = s.academics?.[0];
        return academic?.className === `Class ${selectedClass}`;
      });
    }

    // Section selection filter
    if (selectedSection) {
      result = result.filter((s: any) => {
        const academic = s.academics?.[0];
        return academic?.sectionName === `Section ${selectedSection}`;
      });
    }

    return result;
  }, [mappedStudents, studentSearch, selectedClass, selectedSection]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage));
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, currentPage]);

  const hasFilters = !!(studentSearch || selectedClass || selectedSection);

  const clearFilters = () => {
    setStudentSearch('');
    setSelectedClass('');
    setSelectedSection('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Filter bar styled like Admin StudentManagement */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-4 shadow-xl shadow-slate-200/40">
        <div className="flex flex-wrap items-center gap-3">
          <SearchFilter
            value={studentSearch}
            onChange={(v) => {
              setStudentSearch(v);
              setCurrentPage(1);
            }}
            placeholder="Search by name or email..."
          />

          {/* Class Filter Dropdown */}
          <div className="flex-[1_1_160px]">
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedSection('');
                setCurrentPage(1);
              }}
              className="w-full h-11 px-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            >
              <option value="">All Classes</option>
              {classesList.map((cls) => (
                <option key={cls} value={cls}>
                  Class {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Section Filter Dropdown */}
          <div className="flex-[1_1_160px]">
            <select
              value={selectedSection}
              onChange={(e) => {
                setSelectedSection(e.target.value);
                setCurrentPage(1);
              }}
              disabled={!selectedClass}
              className="w-full h-11 px-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50"
            >
              <option value="">All Sections</option>
              {sectionsList.map((sec) => (
                <option key={sec} value={sec}>
                  Section {sec}
                </option>
              ))}
            </select>
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-colors border border-rose-100"
            >
              <X size={12} /> Clear
            </button>
          )}

          <div className="ml-auto text-right pr-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Matches</p>
            <p className="text-xl font-bold text-indigo-600 leading-none">{filteredStudents.length}</p>
          </div>
        </div>
      </div>

      <Card className="rounded-[2.5rem] border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/30 bg-white">
        <StudentTableBody
          students={paginatedStudents}
          isLoading={loadingStudents}
          hasFilters={hasFilters}
          onClearFilters={clearFilters}
          onRowClick={(student) => router.push(`/dashboard/teacher/students/${student.id}`)}
          customViewUrl={(id) => `/dashboard/teacher/students/${id}`}
        />
        <PaginationControls
          page={currentPage}
          totalPages={totalPages}
          hasPrev={currentPage > 1}
          hasNext={currentPage < totalPages}
          onPageChange={setCurrentPage}
        />
      </Card>
    </div>
  );
}
