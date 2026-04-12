'use client';

import React, { useState } from 'react';
import { Plus, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Teacher, TeacherFilterParams } from '@/types/roles';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useDebounce } from '@/hooks/useDebounce';
import { useTeacherList, useToggleTeacherStatus } from '@/hooks/useTeachers';
import { TeacherRegistrationForm } from '@/components/admin/TeacherRegistrationForm';
import { TeacherDetailsView } from '@/components/admin/TeacherDetailsView';
import { TeacherFilterBar } from '@/components/admin/teacher/TeacherFilterBar';
import { TeacherTable } from '@/components/admin/teacher/TeacherTable';

export function TeacherManagement() {
  const { schoolId } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'add' | 'details'>('list');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [filters, setFilters] = useState<TeacherFilterParams>({
    page: 1, pageSize: 10, schoolId: schoolId || '',
  });

  const debouncedSearch = useDebounce(searchTerm, 400);
  const queryFilters: TeacherFilterParams = { ...filters, firstName: debouncedSearch || undefined };

  const { data, isLoading, isFetching, refetch } = useTeacherList(queryFilters);
  const toggleMutation = useToggleTeacherStatus(queryFilters);

  const teachers = data?.data ?? [];
  const totalPages = Math.ceil((data?.total ?? 0) / (filters.pageSize || 10));

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({ page: 1, pageSize: 10, schoolId: schoolId || '' });
  };

  const handleToggleStatus = (id: string, isActive: boolean) => {
    const action = isActive ? 'activate' : 'deactivate';
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} this staff member?`)) return;
    toggleMutation.mutate({ id, isActive }, {
      onError: () => alert(`Could not ${action} staff member. Please try again.`),
    });
  };

  if (viewMode === 'add') return (
    <TeacherRegistrationForm
      initialData={selectedTeacher || undefined}
      onCancel={() => { setSelectedTeacher(null); setViewMode('list'); }}
      onSuccess={() => { setSelectedTeacher(null); setViewMode('list'); refetch(); }}
    />
  );

  if (viewMode === 'details' && selectedTeacher) return (
    <TeacherDetailsView teacherId={selectedTeacher.id} onBack={() => setViewMode('list')} />
  );

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 p-2 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600">
            <Sparkles size={14} className="animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Academic Management</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900/80">
            Faculty <span className="text-slate-400 font-light">Directory</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => refetch()} className="rounded-2xl h-12 w-12 border-slate-200">
            <RefreshCw className={cn('h-4 w-4 text-slate-500', isFetching && 'animate-spin')} />
          </Button>
          <Button onClick={() => setViewMode('add')} className="h-12 px-6 rounded-2xl bg-primary hover:bg-primary-hover shadow-xl shadow-indigo-200 transition-all active:scale-95">
            <Plus className="mr-2 h-5 w-5" />
            <span className="font-bold">Onboard Staff</span>
          </Button>
        </div>
      </div>

      <TeacherFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        onFiltersChange={setFilters}
        onClear={resetFilters}
      />

      <TeacherTable
        teachers={teachers}
        isLoading={isLoading}
        page={filters.page ?? 1}
        totalPages={totalPages}
        onView={t => { setSelectedTeacher(t); setViewMode('details'); }}
        onEdit={t => { setSelectedTeacher(t); setViewMode('add'); }}
        onToggleStatus={handleToggleStatus}
        onPageChange={p => setFilters(f => ({ ...f, page: p }))}
      />
    </div>
  );
}
