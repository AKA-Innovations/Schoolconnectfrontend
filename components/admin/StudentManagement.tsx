'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, RefreshCw, Phone, UserPlus } from 'lucide-react';
import SearchFilter from '@/components/admin/shared/SearchFilter';
import PaginationControls from '@/components/admin/shared/PaginationControls';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { StudentTableBody } from '@/components/admin/student/StudentTableBody';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { useStudentList } from '@/hooks/useStudents';
import { useClassSectionLists } from '@/hooks/useClasses';
import { StudentListFilters } from '@/services/student.service';

export function StudentManagement() {
  const [searchName, setSearchName] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [mobileFilter, setMobileFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data: allSections = [] } = useClassSectionLists();

  const debouncedName = useDebounce(searchName, 400);
  const debouncedMobile = useDebounce(mobileFilter, 400);

  // Extract first word for backend first name search parameter
  const searchTerms = debouncedName.trim().split(/\s+/);
  const firstNameFilter = searchTerms[0] || undefined;

  // Resolve matching classSectionId if both class and section are selected
  const matchedSection = allSections.find(
    (s: any) => s.className === selectedClass && s.sectionName === selectedSection
  );

  const hasFilters = !!(searchName.trim() || mobileFilter.trim() || selectedClass || selectedSection);

  const filters: StudentListFilters = {
    page: hasFilters ? 1 : page,
    limit: hasFilters ? 1000 : 20, // Fetch all when filtering to ensure precise pagination, otherwise paginate page-by-page
    ...(firstNameFilter && { firstName: firstNameFilter }),
    ...(debouncedMobile && { mobileNumber: debouncedMobile }),
    ...(matchedSection && { classSectionId: Number(matchedSection.masterSectionId || matchedSection.id) }),
  };

  const { data, isLoading, isFetching, refetch } = useStudentList(filters);

  const router = useRouter();

  const classes = React.useMemo(() => {
    const set = new Set(allSections.map((s: any) => s.className));
    return Array.from(set).sort((a: any, b: any) => {
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
  }, [allSections]);

  const sections = React.useMemo(() => {
    const filtered = selectedClass
      ? allSections.filter((s: any) => s.className === selectedClass)
      : allSections;
    const set = new Set(filtered.map((s: any) => s.sectionName));
    return Array.from(set).sort();
  }, [allSections, selectedClass]);

  // Default to the first section when a class is selected
  const handleClassChange = (className: string) => {
    setSelectedClass(className);
    if (className) {
      const firstSection = allSections.find((s: any) => s.className === className)?.sectionName || '';
      setSelectedSection(firstSection);
    } else {
      setSelectedSection('');
    }
    setPage(1);
  };

  const rawStudents = data?.items ?? [];

  // Filter students based on all input criteria client-side to filter out database fuzzy similarity false matches
  const filteredStudents = React.useMemo(() => {
    let list = rawStudents;
    if (searchName) {
      const q = searchName.toLowerCase();
      list = list.filter(s =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(q)
      );
    }
    if (mobileFilter) {
      list = list.filter(s => s.mobileNumber?.includes(mobileFilter));
    }
    if (selectedClass) {
      list = list.filter(s => {
        const acad = s.academics?.[0];
        return acad?.className === selectedClass;
      });
    }
    if (selectedSection) {
      list = list.filter(s => {
        const acad = s.academics?.[0];
        return acad?.sectionName === selectedSection;
      });
    }
    return list;
  }, [rawStudents, searchName, mobileFilter, selectedClass, selectedSection]);

  // Determine pagination variables and list to display
  const { displayStudents, totalPages, totalCount, hasPrev, hasNext } = React.useMemo(() => {
    if (hasFilters) {
      const count = filteredStudents.length;
      const pages = Math.ceil(count / 20) || 1;
      const start = (page - 1) * 20;
      return {
        displayStudents: filteredStudents.slice(start, start + 20),
        totalPages: pages,
        totalCount: count,
        hasPrev: page > 1,
        hasNext: page < pages,
      };
    } else {
      const pagination = data?.pagination;
      return {
        displayStudents: rawStudents,
        totalPages: pagination?.totalPages ?? 1,
        totalCount: pagination?.totalItemsCount ?? 0,
        hasPrev: !!pagination?.hasPrev,
        hasNext: !!pagination?.hasNext,
      };
    }
  }, [hasFilters, filteredStudents, rawStudents, page, data?.pagination]);
  const clearFilters = () => {
    setSearchName('');
    setMobileFilter('');
    setSelectedClass('');
    setSelectedSection('');
    setPage(1);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-[0.3em]">
            <div className="h-1 w-6 bg-indigo-600 rounded-full" />
            Academic Registry
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900/80">Student Corpus</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => refetch()} className="h-11 w-11 rounded-2xl border-slate-200" title="Refresh">
            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
          </Button>
          <Button onClick={() => router.push('/dashboard/admin/student/register')} className="rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs h-11 px-6 shadow-xl shadow-indigo-100 transition-all">
            <UserPlus className="mr-2 h-4 w-4" /> Enroll Student
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-4 shadow-xl shadow-slate-200/40">
        <div className="flex flex-wrap items-center gap-3">
          <SearchFilter value={searchName} onChange={v => { setSearchName(v); setPage(1); }} />
          
          <div className="flex-[1_1_180px]">
            <Select
              value={selectedClass}
              onValueChange={handleClassChange}
            >
              <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="">All Classes</SelectItem>
                {classes.map(c => (
                  <SelectItem key={c} value={c}>
                    Class {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-[1_1_180px]">
            <Select
              value={selectedSection}
              onValueChange={v => { setSelectedSection(v); setPage(1); }}
            >
              <SelectTrigger 
                className="h-11 rounded-2xl border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                disabled={!selectedClass}
              >
                <SelectValue placeholder="All Sections" />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="">All Sections</SelectItem>
                {sections.map(s => (
                  <SelectItem key={s} value={s}>
                    Section {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative flex-[1_1_160px]">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
            <Input
              placeholder="Mobile number"
              value={mobileFilter}
              onChange={e => { setMobileFilter(e.target.value); setPage(1); }}
              className="pl-10 h-11 rounded-2xl border-slate-200 bg-slate-50 text-sm"
            />
          </div>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-colors border border-rose-100"
            >
              <X size={12} /> Clear
            </button>
          )}
          <div className="ml-auto text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total</p>
            <p className="text-xl font-bold text-indigo-600 leading-none">{totalCount}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <Card className="rounded-[2.5rem] border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/30 bg-white">
        <StudentTableBody
          students={displayStudents}
          isLoading={isLoading}
          hasFilters={hasFilters}
          onClearFilters={clearFilters}
        />
        <PaginationControls
          page={page}
          totalPages={totalPages}
          hasPrev={hasPrev}
          hasNext={hasNext}
          onPageChange={setPage}
        />
      </Card>
    </div>
  );
}
