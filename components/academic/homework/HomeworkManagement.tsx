'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import { useHomeworks, useDeleteHomework } from '@/hooks/useAcademic';
import { useClassSectionLists, useSubjectDetails } from '@/hooks/useClasses';
import { useAuthStore } from '@/store/authStore';
import { AcademicPageHeader } from '../shared/AcademicPageHeader';
import { AcademicFilterBar } from '../shared/AcademicFilterBar';
import { HomeworkTable } from './HomeworkTable';
import { HomeworkFormModal } from './HomeworkFormModal';
import { HomeworkDetailView } from './HomeworkDetailView';
import { DeleteConfirmDialog } from '../shared/DeleteConfirmDialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/datepicker';
import type { Homework } from '@/services/academic/types';
import { useSearchParams, useRouter } from 'next/navigation';

const getDateRange = (preset: string) => {
  const start = new Date();
  const end = new Date();
  switch (preset) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    case 'week': {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(start.setDate(diff));
      monday.setHours(0, 0, 0, 0);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      return { start: monday, end: sunday };
    }
    case 'month': {
      const firstDay = new Date(start.getFullYear(), start.getMonth(), 1);
      const lastDay = new Date(start.getFullYear(), start.getMonth() + 1, 0);
      lastDay.setHours(23, 59, 59, 999);
      return { start: firstDay, end: lastDay };
    }
    default:
      return { start: null, end: null };
  }
};

const getHomeworkStatus = (hw: Homework): 'active' | 'overdue' => {
  const now = new Date();
  const due = new Date(hw.dueDate);
  if (due < now) return 'overdue';
  return 'active';
};

export function HomeworkManagement() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const homeworkIdParam = searchParams?.get('homeworkId');

  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'overdue'>('all');
  const [dateRangePreset, setDateRangePreset] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'dueDate' | 'title' | 'createdAt'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const limit = 10;

  const [isFormOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Homework | null>(null);
  const [viewItem, setViewItem] = useState<Homework | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const user = useAuthStore((s) => s.role === 'teacher' ? s.user : null);
  const role = useAuthStore((s) => s.role);
  const canUpload = role === 'teacher' || role === 'subject_coordinator';

  const debouncedSearch = useDebounce(search, 400);

  // Extract class name filter if classFilter is set to pass to backend query
  const backendClassName = useMemo(() => {
    if (!classFilter) return undefined;
    return classFilter.split('-')[0];
  }, [classFilter]);

  // Query parameters for backend pagination
  const { data, isLoading, isFetching, refetch } = useHomeworks({
    className: backendClassName,
    page,
    limit,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    sortBy,
    sortOrder,
  });

  const { data: allSections = [] } = useClassSectionLists();
  const { data: teacherAssignments = [] } = useSubjectDetails(
    role === 'teacher' ? user?.id : undefined,
    'all'
  );
  const deleteMutation = useDeleteHomework();

  // Filter sections options to only show teacher-assigned classes/sections
  const filteredSections = useMemo(() => {
    if (role === 'principal' || role === 'super_admin' || role === 'school_admin') {
      return allSections.filter(s => s.id > 0);
    }
    if (role === 'subject_coordinator') {
      const coordClasses = (user?.coordinatorClasses ?? []).map(c => 
        String(typeof c === 'object' ? c.className : c)
      ).filter(Boolean);
      return allSections.filter(s => s.id > 0 && coordClasses.includes(s.className));
    }
    // Teacher: only show classes they are assigned to
    return allSections.filter(s => 
      s.id > 0 && teacherAssignments.some(ta => ta.className === s.className && ta.sectionName === s.sectionName)
    );
  }, [allSections, role, user, teacherAssignments]);

  // Metrics summary
  const counts = useMemo(() => {
    const items = data ?? [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    let active = 0;
    let overdue = 0;
    let dueToday = 0;

    items.forEach(h => {
      const status = getHomeworkStatus(h);
      if (status === 'overdue') {
        overdue++;
      } else {
        active++;
      }
      if (h.dueDate.startsWith(todayStr)) {
        dueToday++;
      }
    });

    return {
      total: items.length,
      active,
      overdue,
      dueToday,
    };
  }, [data]);

  const filteredAndSortedHomeworks = useMemo(() => {
    let items = data ?? [];

    // Filter by class/section format "className-sectionName"
    if (classFilter) {
      const [cls, sec] = classFilter.split('-');
      items = items.filter(h => h.className === cls && h.sectionName === sec);
    }

    // Filter by date range preset or custom
    if (dateRangePreset !== 'all' && dateRangePreset !== 'custom') {
      const { start, end } = getDateRange(dateRangePreset);
      if (start && end) {
        items = items.filter(h => {
          const dt = new Date(h.dueDate);
          return dt >= start && dt <= end;
        });
      }
    } else if (dateRangePreset === 'custom') {
      if (startDate) {
        const start = new Date(startDate);
        items = items.filter(h => new Date(h.dueDate) >= start);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        items = items.filter(h => new Date(h.dueDate) <= end);
      }
    }

    // Filter by active/overdue status
    if (statusFilter !== 'all') {
      items = items.filter(h => getHomeworkStatus(h) === statusFilter);
    }

    // Filter by search query
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      items = items.filter((h) => h.title.toLowerCase().includes(q) || h.description.toLowerCase().includes(q));
    }

    // Client-side sorting enforcement
    return [...items].sort((a, b) => {
      let valA: any = a[sortBy] || '';
      let valB: any = b[sortBy] || '';

      if (sortBy === 'dueDate' || sortBy === 'createdAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, debouncedSearch, classFilter, dateRangePreset, startDate, endDate, statusFilter, sortBy, sortOrder]);

  // Paginated chunk for safe display
  const paginatedHomeworks = useMemo(() => {
    const startIdx = (page - 1) * limit;
    return filteredAndSortedHomeworks.slice(startIdx, startIdx + limit);
  }, [filteredAndSortedHomeworks, page]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredAndSortedHomeworks.length / limit));
  }, [filteredAndSortedHomeworks]);

  useEffect(() => {
    if (homeworkIdParam && data && data.length > 0) {
      const match = data.find(h => String(h.id) === homeworkIdParam);
      if (match) {
        setViewItem(match);
      }
    }
  }, [homeworkIdParam, data]);

  const handleEdit = useCallback((hw: Homework) => { setEditItem(hw); setFormOpen(true); }, []);
  const handleView = useCallback((hw: Homework) => {
    setViewItem(hw);
    const params = new URLSearchParams(window.location.search);
    params.set('homeworkId', String(hw.id));
    router.replace(`${window.location.pathname}?${params.toString()}`);
  }, [router]);
  const handleDelete = useCallback((id: number) => setDeleteTarget(id), []);
  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget == null) return;
    deleteMutation.mutate(deleteTarget, { onSuccess: () => setDeleteTarget(null) });
  }, [deleteTarget, deleteMutation]);

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setClassFilter('');
    setStatusFilter('all');
    setDateRangePreset('all');
    setStartDate('');
    setEndDate('');
    setSortBy('dueDate');
    setSortOrder('desc');
    setPage(1);
  }, []);

  const handleBack = useCallback(() => {
    setViewItem(null);
    const params = new URLSearchParams(window.location.search);
    params.delete('homeworkId');
    router.replace(`${window.location.pathname}?${params.toString()}`);
  }, [router]);

  if (viewItem) {
    return <HomeworkDetailView homework={viewItem} onBack={handleBack} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AcademicPageHeader badge="Assignments" title="Homework" titleAccent="Manager">
        <Button variant="outline" size="icon" onClick={() => refetch()} className="rounded-2xl h-12 w-12 border-slate-200">
          <RefreshCw className={`h-4 w-4 text-slate-500 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
        {canUpload && (
          <Button onClick={() => { setEditItem(null); setFormOpen(true); }} className="h-12 px-6 rounded-2xl">
            <Plus className="mr-2 h-5 w-5" /><span className="font-bold">Create Homework</span>
          </Button>
        )}
      </AcademicPageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Homework', value: counts.total, textColor: 'text-slate-500', valueColor: 'text-slate-900', borderColor: 'border-slate-100' },
          { label: 'Active', value: counts.active, textColor: 'text-emerald-600', valueColor: 'text-emerald-600', borderColor: 'border-slate-100' },
          { label: 'Due Today', value: counts.dueToday, textColor: 'text-amber-600', valueColor: 'text-amber-600', borderColor: 'border-slate-100' },
          { label: 'Overdue', value: counts.overdue, textColor: 'text-rose-600', valueColor: 'text-rose-600', borderColor: 'border-slate-100' },
        ].map((c) => (
          <div key={c.label} className={`p-4 rounded-2xl border ${c.borderColor} bg-white flex flex-col justify-between h-20 shadow-sm`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${c.textColor}`}>{c.label}</span>
            <span className={`text-2xl font-black leading-none ${c.valueColor}`}>{c.value}</span>
          </div>
        ))}
      </div>

      <AcademicFilterBar searchTerm={search} onSearchChange={setSearch} searchPlaceholder="Search homework..."
        onClear={handleClearFilters} hasActiveFilters={!!(search || classFilter || statusFilter !== 'all' || dateRangePreset !== 'all' || startDate || endDate || sortBy !== 'dueDate' || sortOrder !== 'desc')}>
        <div className="w-40">
          <Select
            value={classFilter}
            onValueChange={(val) => { setClassFilter(val); setPage(1); }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Classes</SelectItem>
              {filteredSections.map((cs) => (
                <SelectItem key={cs.id} value={`${cs.className}-${cs.sectionName}`}>
                  Class {cs.className}-{cs.sectionName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-36">
          <Select
            value={statusFilter}
            onValueChange={(val) => { setStatusFilter(val as any); setPage(1); }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-36">
          <Select
            value={dateRangePreset}
            onValueChange={(val) => { setDateRangePreset(val as any); setPage(1); }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="custom">Custom Date...</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {dateRangePreset === 'custom' && (
          <>
            <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 bg-white h-10">
              <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">From</span>
              <DatePicker
                value={startDate}
                onChange={(val) => { setStartDate(val); setPage(1); }}
                placeholder="From Date"
                className="w-32 border-none focus:ring-0 sm:w-32"
                buttonClassName="border-none h-8 px-1 shadow-none"
              />
            </div>

            <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 bg-white h-10">
              <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">To</span>
              <DatePicker
                value={endDate}
                onChange={(val) => { setEndDate(val); setPage(1); }}
                placeholder="To Date"
                className="w-32 border-none focus:ring-0 sm:w-32"
                buttonClassName="border-none h-8 px-1 shadow-none"
              />
            </div>
          </>
        )}

        <div className="w-44">
          <Select
            value={`${sortBy}-${sortOrder}`}
            onValueChange={(val) => {
              const [field, order] = val.split('-');
              setSortBy(field as any);
              setSortOrder(order as any);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Due Date (Newest)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate-desc">Due Date (Newest)</SelectItem>
              <SelectItem value="dueDate-asc">Due Date (Oldest)</SelectItem>
              <SelectItem value="title-asc">Title (A-Z)</SelectItem>
              <SelectItem value="title-desc">Title (Z-A)</SelectItem>
              <SelectItem value="createdAt-desc">Created (Newest)</SelectItem>
              <SelectItem value="createdAt-asc">Created (Oldest)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </AcademicFilterBar>

      <HomeworkTable homeworks={paginatedHomeworks} isLoading={isLoading} onView={handleView} onEdit={handleEdit} onDelete={handleDelete}
        page={page} totalPages={totalPages} onPageChange={setPage} />

      <HomeworkFormModal open={isFormOpen} onOpenChange={setFormOpen} editItem={editItem}
        onSuccess={() => { setFormOpen(false); setEditItem(null); }} />

      <DeleteConfirmDialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Homework" description="This will permanently delete this homework and all related submissions and documents." onConfirm={handleDeleteConfirm} loading={deleteMutation.isPending} />
    </div>
  );
}
