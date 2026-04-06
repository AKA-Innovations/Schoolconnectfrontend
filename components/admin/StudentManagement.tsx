'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, RefreshCw, Phone, UserPlus } from 'lucide-react';
import SearchFilter from '@/components/admin/shared/SearchFilter';
import PaginationControls from '@/components/admin/shared/PaginationControls';

import { useRouter } from 'next/navigation';
import { StudentTableBody } from '@/components/admin/student/StudentTableBody';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { useStudentList } from '@/hooks/useStudents';
import { StudentListFilters } from '@/services/student.service';

export function StudentManagement() {
  const [searchName, setSearchName] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [mobileFilter, setMobileFilter] = useState('');
  const [page, setPage] = useState(1);

  const debouncedName = useDebounce(searchName, 400);
  const debouncedMobile = useDebounce(mobileFilter, 400);
  const debouncedClass = useDebounce(classFilter, 400);
  const debouncedSection = useDebounce(sectionFilter, 400);

  const filters: StudentListFilters = {
    page,
    limit: 10,
    ...(debouncedName && { firstName: debouncedName }),
    ...(debouncedMobile && { mobileNumber: debouncedMobile }),
    ...(debouncedClass && { className: debouncedClass }),
    ...(debouncedSection && { sectionName: debouncedSection }),
  };

  const { data, isLoading, isFetching, refetch } = useStudentList(filters);

  const router = useRouter();

  const students = data?.items ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const hasFilters = !!(searchName || mobileFilter || classFilter || sectionFilter);

  const clearFilters = () => {
    setSearchName(''); setMobileFilter(''); setClassFilter(''); setSectionFilter(''); setPage(1);
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
          {/* Navigate to the full-page student registration */}
          <Button onClick={() => router.push('/dashboard/admin/student/register')} className="rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs h-11 px-6 shadow-xl shadow-indigo-100 transition-all">
            <UserPlus className="mr-2 h-4 w-4" /> Enroll Student
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-4 shadow-xl shadow-slate-200/40">
        <div className="flex flex-wrap items-center gap-3">
          <SearchFilter value={searchName} onChange={v => { setSearchName(v); setPage(1); }} />
          <Input
            placeholder="Class (e.g. 10)"
            value={classFilter}
            onChange={e => { setClassFilter(e.target.value); setPage(1); }}
            className="flex-[1_1_120px] h-11 rounded-2xl border-slate-200 bg-slate-50 text-sm"
          />
          <Input
            placeholder="Section (e.g. A)"
            value={sectionFilter}
            onChange={e => { setSectionFilter(e.target.value); setPage(1); }}
            className="flex-[1_1_120px] h-11 rounded-2xl border-slate-200 bg-slate-50 text-sm"
          />
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
            <p className="text-xl font-bold text-indigo-600 leading-none">{pagination?.totalItemsCount ?? ''}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <Card className="rounded-[2.5rem] border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/30 bg-white">
        <StudentTableBody
          students={students}
          isLoading={isLoading}
          hasFilters={hasFilters}
          onClearFilters={clearFilters}
        />
        <PaginationControls
          page={page}
          totalPages={totalPages}
          hasPrev={!!pagination?.hasPrev}
          hasNext={!!pagination?.hasNext}
          onPageChange={setPage}
        />
      </Card>
    </div>
  );
}
