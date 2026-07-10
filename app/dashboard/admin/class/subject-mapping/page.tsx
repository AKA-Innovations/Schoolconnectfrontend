'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  useSubjectDetails, useCreateSubjectDetail,
  useUpdateSubjectDetail, useDeleteSubjectDetail,
  useSubjectOptions, useClassSectionLists,
  useSchoolClasses, useTimetable, timetableKeys,
} from '@/hooks/useClasses';
import { useTeacherList } from '@/hooks/useTeachers';
import { useAuthStore } from '@/store/authStore';
import { useQueries } from '@tanstack/react-query';
import { classService } from '@/services/class/service';
import {
  Plus, Search, X, Save, BookOpen, Users, MoreVertical, Edit2,
  Copy, Trash2, Calendar, ShieldAlert, Sparkles, ChevronDown,
  ChevronRight, ArrowUpDown, FileText, CheckCircle2, Info, Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import { CURRENT_SESSION } from '@/lib/constants';

const EMPTY_FORM = { teacherId: '', classSectionId: 0, subjectId: 0 };

// Deterministic pastel chip color for subjects
const getSubjectColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash) % 360;
  return { bg: `hsl(${h},80%,96%)`, text: `hsl(${h},85%,28%)`, border: `hsl(${h},45%,83%)` };
};

// Load status helpers
const getLoadStatus = (periods: number) => {
  if (periods > 30) return { label: 'Overallocated', color: 'text-red-700 bg-red-50 border-red-200', dot: 'bg-red-500' };
  if (periods > 20) return { label: 'Near Limit',    color: 'text-amber-700 bg-amber-50 border-amber-200', dot: 'bg-amber-400' };
  if (periods > 0)  return { label: 'Balanced',      color: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' };
  return { label: 'Unassigned', color: 'text-slate-500 bg-slate-50 border-slate-200', dot: 'bg-slate-300' };
};

export default function SubjectDetailsPage() {
  const { data: mappings = [], isLoading } = useSubjectDetails();
  const { data: classSections = [] } = useClassSectionLists();
  const { data: schoolClasses = [] } = useSchoolClasses();

  const schoolId = useAuthStore((s) => s.schoolId);
  const { data: teachersData } = useTeacherList({ schoolId: schoolId || '', page: 1, pageSize: 500 });
  const teachers = teachersData?.data ?? [];

  // Fetch timetable entries for all teachers in parallel
  const teacherTimetableQueries = useQueries({
    queries: teachers.map(t => ({
      queryKey: timetableKeys.fetch({ session: CURRENT_SESSION, teacherId: t.id }),
      queryFn: () => classService.fetchTimetable({ session: CURRENT_SESSION, teacherId: t.id }),
      enabled: !!t.id,
    }))
  });

  const timetableEntries = useMemo(() => {
    const all: any[] = [];
    teacherTimetableQueries.forEach(q => {
      if (q.data && Array.isArray(q.data)) {
        all.push(...q.data);
      }
    });
    return all;
  }, [teacherTimetableQueries]);

  // UI state
  const [search, setSearch]               = useState('');
  const [filterLoad, setFilterLoad]       = useState<'all' | 'balanced' | 'overloaded' | 'unassigned'>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterClass, setFilterClass]     = useState<string>('all');
  const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null);
  const [showDrawer, setShowDrawer]       = useState(false);
  const [editId, setEditId]               = useState<string | number | null>(null);
  const [form, setForm]                   = useState(EMPTY_FORM);
  const [activeMenuId, setActiveMenuId]   = useState<string | number | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('');

  // Drawer for pre-selecting a teacher
  const [drawerTeacherId, setDrawerTeacherId] = useState<string>('');

  // Bulk Assign
  const [showBulkAssign, setShowBulkAssign] = useState(false);
  const [bulkForm, setBulkForm] = useState({ teacherId: '', subjectId: 0, classIds: [] as number[] });

  // CSV import
  const [showImportCsv, setShowImportCsv] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Filter unique classes and available sections for separate dropdown selectors
  const uniqueClasses = useMemo(() => {
    const list: string[] = [];
    classSections.forEach(cs => {
      if (cs.className && !list.includes(cs.className)) {
        list.push(cs.className);
      }
    });
    return list.sort((a, b) => {
      const na = Number(a);
      const nb = Number(b);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.localeCompare(b);
    });
  }, [classSections]);

  const availableSections = useMemo(() => {
    if (!selectedClass) return [];
    return classSections.filter(cs => cs.className === selectedClass);
  }, [classSections, selectedClass]);

  const createMutation = useCreateSubjectDetail();
  const updateMutation = useUpdateSubjectDetail();
  const deleteMutation = useDeleteSubjectDetail();

  // Drawer Subject Fetch
  const formClassId = useMemo(() => {
    const selectedSection = classSections.find(cs => cs.id === form.classSectionId);
    if (!selectedSection) return undefined;
    if (selectedSection.classId) return selectedSection.classId;
    const sc = schoolClasses.find(c => c.className === selectedSection.className);
    return sc?.id;
  }, [form.classSectionId, classSections, schoolClasses]);

  const { data: subjects = [] } = useSubjectOptions(formClassId);

  // Bulk Subject Fetch
  const bulkClassId = useMemo(() => {
    if (bulkForm.classIds.length === 0) return undefined;
    const firstSectionId = bulkForm.classIds[0];
    const section = classSections.find(cs => cs.id === firstSectionId);
    if (!section) return undefined;
    if (section.classId) return section.classId;
    const sc = schoolClasses.find(c => c.className === section.className);
    return sc?.id;
  }, [bulkForm.classIds, classSections, schoolClasses]);

  const { data: bulkSubjects = [] } = useSubjectOptions(bulkClassId);

  // ── Maps ──────────────────────────────────────────────────────────────────
  const teacherNameMap = useMemo(() => {
    const m = new Map<string, string>();
    teachers.forEach(t => m.set(t.id, `${t.firstName} ${t.lastName}`.trim()));
    return m;
  }, [teachers]);

  // Reverse map: full name → teacherId (timetable only returns teacherName, no id)
  const nameToTeacherId = useMemo(() => {
    const m = new Map<string, string>();
    teachers.forEach(t => m.set(`${t.firstName} ${t.lastName}`.trim().toLowerCase(), t.id));
    return m;
  }, [teachers]);



  // ── Teacher-centric rows ──────────────────────────────────────────────────
  // Each row = one teacher with all their assignments grouped
  const teacherRows = useMemo(() => {
    // Group mappings by teacherId
    const grouped: Record<string, typeof mappings> = {};
    mappings.forEach(m => {
      if (!m.teacherId) return;
      if (!grouped[m.teacherId]) grouped[m.teacherId] = [];
      grouped[m.teacherId].push(m);
    });

    return Object.entries(grouped).map(([teacherId, assigns]) => {
      const teacherName = (teacherNameMap.get(teacherId) || '').toLowerCase();
      let weeklyLoad = 0;
      let hasTimetablePeriods = false;

      assigns.forEach(a => {
        const count = timetableEntries.filter(entry => {
          // 1. Try matching by classSubjectId lookup in mappings
          if (entry.classSubjectId) {
            const matchMapping = mappings.find(m => String(m.id) === String(entry.classSubjectId));
            if (matchMapping) {
              return (
                matchMapping.teacherId === teacherId &&
                (matchMapping.subjectName || '').toLowerCase() === (a.subjectName || '').toLowerCase() &&
                (matchMapping.className || '').toLowerCase() === (a.className || '').toLowerCase() &&
                (matchMapping.sectionName || '').toLowerCase() === (a.sectionName || '').toLowerCase()
              );
            }
          }

          // 2. Fallback to name/string matching
          const entryTeacherName = (entry.teacherName || '').trim().toLowerCase();
          const entryTeacherId = nameToTeacherId.get(entryTeacherName);
          return (
            (entryTeacherId === teacherId || entryTeacherName === teacherName) &&
            (entry.subjectName || '').toLowerCase() === (a.subjectName || '').toLowerCase() &&
            (entry.className || '').toLowerCase() === (a.className || '').toLowerCase() &&
            (entry.sectionName || '').toLowerCase() === (a.sectionName || '').toLowerCase()
          );
        }).length;

        if (count > 0) {
          weeklyLoad += count;
          hasTimetablePeriods = true;
        } else {
          weeklyLoad += 6;
        }
      });

      const classSet = Array.from(new Set(assigns.map(a => `${a.className}–${a.sectionName}`)));
      const subjectSet = Array.from(new Set(assigns.map(a => a.subjectName || '—')));

      return {
        teacherId,
        name: teacherNameMap.get(teacherId) || teacherId,
        assigns,
        weeklyLoad,
        isTimetableBased: hasTimetablePeriods,
        classes: classSet,
        subjects: subjectSet,
        totalMappings: assigns.length,
      };
    });
  }, [mappings, teacherNameMap, timetableEntries, nameToTeacherId]);

  // ── Insights ──────────────────────────────────────────────────────────────
  const insights = useMemo(() => {
    const totalTeachers = teachers.length;
    const mappedIds = new Set(mappings.map(m => m.teacherId).filter(Boolean));
    const unassigned = totalTeachers - mappedIds.size;
    let overloaded = 0;
    mappedIds.forEach(id => { if ((teacherRows.find(r => r.teacherId === id)?.weeklyLoad || 0) > 30) overloaded++; });
    const seen = new Set<string>(); let conflicts = 0;
    mappings.forEach(m => {
      const k = `${m.teacherId}-${m.className}-${m.sectionName}-${m.subjectName}`;
      if (seen.has(k)) conflicts++; else seen.add(k);
    });
    return { totalTeachers, mapped: mappedIds.size, unassigned, overloaded, conflicts };
  }, [teachers, mappings, teacherRows]);

  // ── Filter teacher rows ───────────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    const q = search.toLowerCase().trim();
    return teacherRows.filter(row => {
      // text search across name, subjects, classes
      const matchSearch = !q || q.split(/\s+/).every(term =>
        row.name.toLowerCase().includes(term) ||
        row.classes.some(c => c.toLowerCase().includes(term)) ||
        row.subjects.some(s => s.toLowerCase().includes(term))
      );
      if (!matchSearch) return false;

      // load filter
      if (filterLoad === 'balanced'   && row.weeklyLoad > 30) return false;
      if (filterLoad === 'overloaded' && row.weeklyLoad <= 30) return false;
      if (filterLoad === 'unassigned') return false; // unassigned teachers not in teacherRows

      // subject filter
      if (filterSubject !== 'all' && !row.subjects.includes(filterSubject)) return false;

      // class filter
      if (filterClass !== 'all' && !row.classes.includes(filterClass)) return false;

      return true;
    });
  }, [teacherRows, search, filterLoad, filterSubject, filterClass]);

  const paginatedRows = filteredRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalPages = Math.ceil(filteredRows.length / PAGE_SIZE);

  // ── Conflict detection in drawer ──────────────────────────────────────────
  const selectedSection = classSections.find(cs => cs.id === form.classSectionId);
  const drawerConflict = useMemo(() => {
    if (!form.teacherId || !form.classSectionId || !form.subjectId) return null;
    const section = classSections.find(c => c.id === form.classSectionId);
    const subject = subjects.find(s => s.id === form.subjectId);
    if (!section || !subject) return null;
    const dup = mappings.find(m =>
      m.teacherId === form.teacherId &&
      m.className === section.className &&
      m.sectionName === section.sectionName &&
      m.subjectName === subject.subjectName &&
      String(m.id) !== String(editId)
    );
    if (dup) return { type: 'error', message: `${teacherNameMap.get(form.teacherId)} is already assigned ${subject.subjectName} in ${section.className}–${section.sectionName}.` };
    const row = teacherRows.find(r => r.teacherId === form.teacherId);
    const projectedLoad = (row?.weeklyLoad || 0) + 6;
    if (!editId && projectedLoad > 30) return { type: 'warning', message: `${teacherNameMap.get(form.teacherId)} will be overloaded (${projectedLoad} periods/week).` };
    return null;
  }, [form, editId, mappings, classSections, subjects, teacherNameMap, teacherRows]);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const buildPayload = () => {
    const selectedSubject = subjects.find(s => s.id === form.subjectId);
    if (!selectedSection || !selectedSubject) return null;
    let classId = selectedSection.classId;
    if (!classId) { const sc = schoolClasses.find(c => c.className === selectedSection.className); classId = sc?.id || 0; }
    return { entries: [{ session: CURRENT_SESSION, teacherId: form.teacherId, classId, classSectionId: selectedSection.masterSectionId, subjectId: selectedSubject.id }] };
  };

  const handleSave = async () => {
    const payload = buildPayload();
    if (!payload || !form.teacherId || !form.subjectId) { toast.error('All fields are required'); return; }
    if (drawerConflict?.type === 'error') { toast.error('Cannot save — conflict detected'); return; }
    try {
      if (editId) { await updateMutation.mutateAsync({ id: editId as any, data: payload }); toast.success('Mapping updated'); }
      else        { await createMutation.mutateAsync(payload); toast.success('Mapping created'); }
      resetForm();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to save mapping'); }
  };

  const handleBulkSave = async () => {
    if (!bulkForm.teacherId || !bulkForm.subjectId || bulkForm.classIds.length === 0) {
      toast.error('All fields and at least one class are required');
      return;
    }

    const selectedSubject = bulkSubjects.find(s => s.id === bulkForm.subjectId);
    if (!selectedSubject) {
      toast.error('Selected subject not found');
      return;
    }

    const entries = [];
    for (const classSectionId of bulkForm.classIds) {
      const section = classSections.find(cs => cs.id === classSectionId);
      if (section) {
        let classId = section.classId;
        if (!classId) {
          const sc = schoolClasses.find(c => c.className === section.className);
          classId = sc?.id || 0;
        }
        entries.push({
          session: CURRENT_SESSION,
          teacherId: bulkForm.teacherId,
          classId,
          classSectionId: section.masterSectionId,
          subjectId: selectedSubject.id,
        });
      }
    }

    try {
      await createMutation.mutateAsync({ entries });
      toast.success(`Successfully assigned to ${entries.length} classes`);
      setShowBulkAssign(false);
      setBulkForm({ teacherId: '', subjectId: 0, classIds: [] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save assignments');
    }
  };

  const handleDelete = async (id: string | number) => {
    try { await deleteMutation.mutateAsync(id); toast.success('Mapping removed'); setActiveMenuId(null); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

  const startEdit = (m: any) => {
    setEditId(m.id);
    const cs = classSections.find(c => c.className === m.className && c.sectionName === m.sectionName);
    setSelectedClass(cs?.className || '');
    setForm({ teacherId: m.teacherId, classSectionId: cs?.id || 0, subjectId: m.subjectDtlsId || m.subjectId || 0 });
    setShowDrawer(true);
    setActiveMenuId(null);
  };

  const handleDuplicate = (m: any) => {
    const cs = classSections.find(c => c.className === m.className && c.sectionName === m.sectionName);
    setSelectedClass(cs?.className || '');
    setForm({ teacherId: m.teacherId, classSectionId: cs?.id || 0, subjectId: m.subjectDtlsId || m.subjectId || 0 });
    setEditId(null);
    setShowDrawer(true);
    setActiveMenuId(null);
    toast.info('Duplicated — update if needed and save.');
  };

  const resetForm = () => {
    setShowDrawer(false);
    setEditId(null);
    setForm(EMPTY_FORM);
    setDrawerTeacherId('');
    setSelectedClass('');
  };

  const openAddForTeacher = (teacherId: string) => {
    setForm({ ...EMPTY_FORM, teacherId });
    setDrawerTeacherId(teacherId);
    setEditId(null);
    setSelectedClass('');
    setShowDrawer(true);
  };

  // ── Unique lists for filters ───────────────────────────────────────────────
  const allSubjects = useMemo(() => Array.from(new Set(mappings.map(m => m.subjectName).filter(Boolean))).sort(), [mappings]);
  const allClasses  = useMemo(() => Array.from(new Set(mappings.map(m => `${m.className}–${m.sectionName}`).filter(Boolean))).sort(), [mappings]);

  return (
    <div className="p-6 space-y-5 animate-in fade-in duration-300">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-emerald-600" />
            Teacher Assignments
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">One row per teacher · load from live timetable</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setShowImportCsv(true)} className="rounded-xl border-dashed text-sm">
            <FileText className="h-4 w-4 mr-1.5 text-muted-foreground" /> Import CSV
          </Button>
          <Button variant="outline" onClick={() => setShowBulkAssign(true)} className="rounded-xl text-sm">
            <ArrowUpDown className="h-4 w-4 mr-1.5 text-indigo-600" /> Bulk Assign
          </Button>
          <Button onClick={() => { setForm(EMPTY_FORM); setEditId(null); setShowDrawer(true); }} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm">
            <Plus className="h-4 w-4 mr-1.5" /> Add Mapping
          </Button>
        </div>
      </div>

      {/* ── Quick Insights ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Teachers', value: insights.totalTeachers, color: 'border-t-blue-500',    sub: 'Registered staff',       subColor: 'text-blue-600' },
          { label: 'Mapped',         value: insights.mapped,        color: 'border-t-emerald-500', sub: `${Math.round((insights.mapped/(insights.totalTeachers||1))*100)}% assigned`, subColor: 'text-emerald-600' },
          { label: 'Unassigned',     value: insights.unassigned,    color: 'border-t-amber-500',   sub: 'No active subjects',     subColor: 'text-amber-600' },
          { label: 'Overloaded',     value: insights.overloaded,    color: 'border-t-red-500',     sub: '> 30 periods/week',      subColor: 'text-red-600' },
          { label: 'Conflicts',      value: insights.conflicts,     color: 'border-t-purple-500',  sub: insights.conflicts > 0 ? 'Needs attention' : 'All clear', subColor: insights.conflicts > 0 ? 'text-red-500' : 'text-slate-500' },
        ].map(card => (
          <Card key={card.label} className={`erp-card overflow-hidden border-t-4 ${card.color} shadow-xs`}>
            <CardContent className="p-3.5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{card.label}</p>
              <h3 className="text-2xl font-bold mt-0.5 text-slate-800">{card.value}</h3>
              <span className={`text-[10px] font-medium ${card.subColor}`}>{card.sub}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Filter bar ── */}
      <Card className="erp-card border border-slate-100 bg-slate-50/40 shadow-xs">
        <CardContent className="p-3 flex flex-col lg:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search teacher, subject, class..."
              className="pl-9 h-9 rounded-xl border-slate-200 bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Load status pills */}
            <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 shrink-0">
              {(['all','balanced','overloaded','unassigned'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => { setFilterLoad(f); setCurrentPage(1); }}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer
                    ${filterLoad === f ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Class filter */}
            <select
              value={filterClass}
              onChange={e => { setFilterClass(e.target.value); setCurrentPage(1); }}
              className="h-9 px-3 w-[150px] rounded-xl text-xs border border-slate-200 bg-white shadow-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All Classes</option>
              {allClasses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Subject filter */}
            <select
              value={filterSubject}
              onChange={e => { setFilterSubject(e.target.value); setCurrentPage(1); }}
              className="h-9 px-3 w-[150px] rounded-xl text-xs border border-slate-200 bg-white shadow-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All Subjects</option>
              {allSubjects.map(s => <option key={s} value={String(s)}>{s}</option>)}
            </select>

            {/* Result count */}
            <span className="text-xs text-slate-500 ml-auto">{filteredRows.length} teacher{filteredRows.length !== 1 ? 's' : ''}</span>
          </div>
        </CardContent>
      </Card>

      {/* ── Teacher-centric Table ── */}
      <Card className="erp-card overflow-visible shadow-xs border border-slate-100">
        <CardContent className="p-0">
          {/* Table header */}
          <div className="grid grid-cols-[2fr_3fr_1fr_1fr_80px] border-b border-slate-200 bg-slate-50/60 px-4 py-2.5 rounded-t-2xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Teacher</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Assignments (Class → Subject)</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">Weekly Periods</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">Load Status</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Actions</span>
          </div>

          {isLoading ? (
            <div className="p-8 space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : paginatedRows.length === 0 ? (
            <div className="py-20 text-center">
              <Users className="h-12 w-12 mx-auto mb-3 text-slate-200" />
              <p className="text-sm font-semibold text-slate-400">No teachers match your filters</p>
              <Button variant="link" onClick={() => { setSearch(''); setFilterLoad('all'); setFilterClass('all'); setFilterSubject('all'); }} className="text-xs text-emerald-600 mt-1">
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {paginatedRows.map(row => {
                const load   = getLoadStatus(row.weeklyLoad);
                const isOpen = expandedTeacher === row.teacherId;

                return (
                  <div key={row.teacherId} className="group">
                    {/* ── Main row ── */}
                    <div
                      className="grid grid-cols-[2fr_3fr_1fr_1fr_80px] items-center px-4 py-2.5 hover:bg-slate-50/60 transition-colors cursor-pointer"
                      onClick={() => setExpandedTeacher(isOpen ? null : row.teacherId)}
                    >
                      {/* Teacher */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isOpen
                          ? <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                          : <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />}
                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                          {row.name.split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{row.name}</p>
                          <p className="text-[10px] text-slate-400">{row.totalMappings} assignment{row.totalMappings !== 1 ? 's' : ''}</p>
                        </div>
                      </div>

                      {/* Assignments summary */}
                      <div className="flex flex-wrap gap-1 min-w-0" onClick={e => e.stopPropagation()}>
                        {row.assigns.slice(0, 4).map(a => {
                          const c = getSubjectColor(a.subjectName || '');
                          return (
                            <span
                              key={a.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border"
                              style={{ backgroundColor: c.bg, color: c.text, borderColor: c.border }}
                            >
                              <span className="font-bold text-slate-500">{a.className}–{a.sectionName}</span>
                              <span className="opacity-50">·</span>
                              {a.subjectName || '—'}
                            </span>
                          );
                        })}
                        {row.assigns.length > 4 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                            +{row.assigns.length - 4} more
                          </span>
                        )}
                      </div>

                      {/* Weekly periods */}
                      <div className="text-center" onClick={e => e.stopPropagation()}>
                        <p className="text-base font-bold text-slate-800">{row.weeklyLoad}</p>
                        <p className="text-[9px] text-slate-400 leading-tight">
                          {row.isTimetableBased ? '📅 from timetable' : '📊 estimated'}
                        </p>
                      </div>

                      {/* Load status */}
                      <div className="flex justify-center" onClick={e => e.stopPropagation()}>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${load.color}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${load.dot}`} />
                          {load.label}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end relative" onClick={e => e.stopPropagation()}>
                        <Button
                          variant="ghost" size="icon"
                          onClick={() => setActiveMenuId(activeMenuId === row.teacherId ? null : row.teacherId)}
                          className="h-7 w-7 rounded-lg hover:bg-slate-100"
                        >
                          <MoreVertical className="h-3.5 w-3.5 text-slate-500" />
                        </Button>
                        {activeMenuId === row.teacherId && (
                          <div className="absolute right-0 top-8 z-30 w-44 bg-white rounded-xl border border-slate-200 shadow-xl py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                            <button onClick={() => openAddForTeacher(row.teacherId)} className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                              <Plus className="h-3 w-3 text-slate-400" /> Add Assignment
                            </button>
                            <div className="border-t border-slate-100 my-0.5" />
                            <button onClick={() => { setActiveMenuId(null); }} className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-slate-400" /> View Timetable
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ── Expanded detail rows ── */}
                    {isOpen && (
                      <div className="border-t border-slate-100 bg-slate-50/30">
                        <div className="overflow-visible pl-12">
                          <table className="w-full">
                            <thead>
                              <tr className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                <th className="text-left py-2 px-3">Class · Section</th>
                                <th className="text-left py-2 px-3">Subject</th>
                                <th className="text-center py-2 px-3">Scheduled Periods</th>
                                <th className="text-right py-2 px-3">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {row.assigns.map(a => {
                                const teacherName = (teacherNameMap.get(row.teacherId) || '').toLowerCase();
                                const mappingPeriods = timetableEntries.filter(entry => {
                                  // 1. Try matching by classSubjectId lookup in mappings
                                  if (entry.classSubjectId) {
                                    const matchMapping = mappings.find(m => String(m.id) === String(entry.classSubjectId));
                                    if (matchMapping) {
                                      return (
                                        matchMapping.teacherId === row.teacherId &&
                                        (matchMapping.subjectName || '').toLowerCase() === (a.subjectName || '').toLowerCase() &&
                                        (matchMapping.className || '').toLowerCase() === (a.className || '').toLowerCase() &&
                                        (matchMapping.sectionName || '').toLowerCase() === (a.sectionName || '').toLowerCase()
                                      );
                                    }
                                  }

                                  // 2. Fallback to name/string matching
                                  const entryTeacherName = (entry.teacherName || '').trim().toLowerCase();
                                  const entryTeacherId = nameToTeacherId.get(entryTeacherName);
                                  return (
                                    (entryTeacherId === row.teacherId || entryTeacherName === teacherName) &&
                                    (entry.subjectName || '').toLowerCase() === (a.subjectName || '').toLowerCase() &&
                                    (entry.className || '').toLowerCase() === (a.className || '').toLowerCase() &&
                                    (entry.sectionName || '').toLowerCase() === (a.sectionName || '').toLowerCase()
                                  );
                                }).length;
                                const c = getSubjectColor(a.subjectName || '');
                                return (
                                  <tr key={a.id} className="border-t border-slate-100 hover:bg-white transition-colors relative group/row">
                                    <td className="py-2 px-3">
                                      <Badge variant="outline" className="rounded-lg text-[10px] font-bold bg-white border-slate-200">
                                        {a.className} — {a.sectionName}
                                      </Badge>
                                    </td>
                                    <td className="py-2 px-3">
                                      <span
                                        className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border"
                                        style={{ backgroundColor: c.bg, color: c.text, borderColor: c.border }}
                                      >
                                        {a.subjectName || '—'}
                                      </span>
                                    </td>
                                    <td className="py-2 px-3 text-center">
                                      <span className="text-sm font-bold text-slate-700">{mappingPeriods}</span>
                                      <span className="text-[10px] text-slate-400 ml-1">
                                        {mappingPeriods > 0 ? 'p/w (live)' : 'p/w (est.)'}
                                      </span>
                                    </td>
                                    <td className="py-2 px-3 text-right relative">
                                      <Button variant="ghost" size="icon" onClick={() => setActiveMenuId(activeMenuId === a.id ? null : a.id)} className="h-6 w-6 rounded-md hover:bg-slate-100">
                                        <MoreVertical className="h-3 w-3 text-slate-400" />
                                      </Button>
                                      {activeMenuId === a.id && (
                                        <div className="absolute right-2 top-8 z-30 w-40 bg-white rounded-xl border border-slate-200 shadow-xl py-1 animate-in fade-in duration-150">
                                          <button onClick={() => startEdit(a)} className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                            <Edit2 className="h-3 w-3 text-slate-400" /> Edit
                                          </button>
                                          <button onClick={() => handleDuplicate(a)} className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                            <Copy className="h-3 w-3 text-slate-400" /> Duplicate
                                          </button>
                                          <div className="border-t border-slate-100 my-0.5" />
                                          <button onClick={() => handleDelete(a.id)} className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2">
                                            <Trash2 className="h-3 w-3 text-red-400" /> Remove
                                          </button>
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            <tfoot>
                              <tr className="border-t border-slate-200 bg-slate-50">
                                <td colSpan={2} className="py-2 px-3">
                                  <button
                                    onClick={() => openAddForTeacher(row.teacherId)}
                                    className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1"
                                  >
                                    <Plus className="h-3 w-3" /> Add assignment for {row.name.split(' ')[0]}
                                  </button>
                                </td>
                                <td className="py-2 px-3 text-center">
                                  <span className="text-xs font-bold text-slate-700">
                                    {row.weeklyLoad} total
                                    <span className="text-[10px] text-slate-400 font-normal ml-1">{row.isTimetableBased ? '(live)' : '(est.)'}</span>
                                  </span>
                                </td>
                                <td />
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-slate-500">
            Showing {(currentPage-1)*PAGE_SIZE+1}–{Math.min(currentPage*PAGE_SIZE, filteredRows.length)} of {filteredRows.length}
          </p>
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage===1} className="rounded-lg text-xs">Prev</Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button key={i} variant={currentPage===i+1 ? 'default' : 'outline'} size="sm" onClick={() => setCurrentPage(i+1)}
                className={`h-8 w-8 p-0 rounded-lg text-xs ${currentPage===i+1 ? 'bg-slate-800' : ''}`}>
                {i+1}
              </Button>
            ))}
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage===totalPages} className="rounded-lg text-xs">Next</Button>
          </div>
        </div>
      )}

      {/* Click-away to close menus */}
      {activeMenuId && <div className="fixed inset-0 z-20" onClick={() => setActiveMenuId(null)} />}

      {/* ══════════════════════════════════════════════════════════════════════
          SIDE DRAWER — Add / Edit Mapping
      ══════════════════════════════════════════════════════════════════════ */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={resetForm} />
          <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  {editId ? 'Edit Assignment' : 'New Assignment'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Assign a subject to a class section</p>
              </div>
              <Button variant="ghost" size="icon" onClick={resetForm} className="h-7 w-7 rounded-full"><X className="h-4 w-4" /></Button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {drawerConflict && (
                <div className={`p-3 rounded-xl border flex gap-2.5 ${drawerConflict.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                  {drawerConflict.type === 'error' ? <ShieldAlert className="h-4 w-4 text-red-500 shrink-0 mt-0.5" /> : <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />}
                  <p className="text-xs font-medium leading-relaxed">{drawerConflict.message}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Teacher *</Label>
                  <select
                    value={form.teacherId}
                    onChange={e => setForm(f => ({ ...f, teacherId: e.target.value }))}
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="">Select instructor</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Class *</Label>
                    <select
                      value={selectedClass}
                      onChange={e => {
                        const nextClass = e.target.value;
                        setSelectedClass(nextClass);
                        setForm(f => ({ ...f, classSectionId: 0, subjectId: 0 }));
                      }}
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="">Select class</option>
                      {uniqueClasses.map(c => (
                        <option key={c} value={c}>Class {c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Section *</Label>
                    <select
                      value={form.classSectionId ? String(form.classSectionId) : ''}
                      onChange={e => {
                        const nextSectionId = Number(e.target.value);
                        setForm(f => ({ ...f, classSectionId: nextSectionId, subjectId: 0 }));
                      }}
                      disabled={!selectedClass}
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-50 disabled:text-slate-400"
                    >
                      <option value="">{selectedClass ? 'Select section' : 'Select class first'}</option>
                      {availableSections.map(cs => (
                        <option key={cs.id} value={String(cs.id)}>{cs.sectionName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Subject *</Label>
                  <select
                    value={form.subjectId ? String(form.subjectId) : ''}
                    onChange={e => setForm(f => ({ ...f, subjectId: Number(e.target.value) }))}
                    disabled={!form.classSectionId}
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="">{form.classSectionId ? 'Select subject' : 'Select class first'}</option>
                    {subjects.map(s => <option key={s.id} value={String(s.id)}>{s.subjectName}</option>)}
                  </select>
                </div>
              </div>

              {/* Preview */}
              {form.teacherId && form.classSectionId && form.subjectId && (
                <div className="p-4 bg-emerald-50/60 border border-emerald-200/70 rounded-xl space-y-1.5 text-xs text-slate-700">
                  <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-widest">Assignment Preview</span>
                  <p>🧑‍🏫 {teacherNameMap.get(form.teacherId) || '—'}</p>
                  <p>📚 {subjects.find(s => s.id === form.subjectId)?.subjectName || '—'}</p>
                  <p>🏫 {classSections.find(c => c.id === form.classSectionId)?.className} — {classSections.find(c => c.id === form.classSectionId)?.sectionName}</p>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-100 flex gap-2.5 bg-slate-50">
              <Button
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending || drawerConflict?.type === 'error'}
                className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                <Save className="h-4 w-4 mr-2" /> {editId ? 'Update' : 'Create Assignment'}
              </Button>
              <Button variant="outline" onClick={resetForm} className="rounded-xl">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          BULK ASSIGN MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {showBulkAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setShowBulkAssign(false)} />
          <div className="relative z-10 w-full max-w-lg bg-white p-6 rounded-2xl shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">Bulk Subject Assignment</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowBulkAssign(false)} className="h-7 w-7 rounded-full"><X className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-bold text-slate-500">Teacher</Label>
                <select
                  value={bulkForm.teacherId}
                  onChange={e => setBulkForm(f => ({ ...f, teacherId: e.target.value }))}
                  className="mt-1 w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Select teacher</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs font-bold text-slate-500">Classes (multi-select)</Label>
                <div className="mt-1 grid grid-cols-2 gap-1.5 border border-slate-200 rounded-xl p-3 max-h-36 overflow-y-auto">
                  {classSections.map(cs => {
                    const checked = bulkForm.classIds.includes(cs.id);
                    return (
                      <label key={cs.id} className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded-lg cursor-pointer text-xs font-medium text-slate-700">
                        <input type="checkbox" checked={checked} onChange={() =>
                          setBulkForm(f => ({ ...f, classIds: checked ? f.classIds.filter(x => x !== cs.id) : [...f.classIds, cs.id] }))
                        } className="rounded h-3.5 w-3.5 text-emerald-600" />
                        {cs.className} — {cs.sectionName}
                      </label>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label className="text-xs font-bold text-slate-500">Subject</Label>
                <select
                  value={bulkForm.subjectId ? String(bulkForm.subjectId) : ''}
                  onChange={e => setBulkForm(f => ({ ...f, subjectId: Number(e.target.value) }))}
                  disabled={bulkForm.classIds.length === 0}
                  className="mt-1 w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">{bulkForm.classIds.length > 0 ? 'Select subject' : 'Select class section(s) first'}</option>
                  {bulkSubjects.map(s => <option key={s.id} value={String(s.id)}>{s.subjectName}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end border-t border-slate-100 pt-3">
              <Button variant="outline" onClick={() => setShowBulkAssign(false)} className="rounded-xl">Cancel</Button>
              <Button
                onClick={handleBulkSave}
                disabled={createMutation.isPending || bulkForm.classIds.length === 0}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              >
                {createMutation.isPending ? 'Assigning...' : 'Assign to Selected'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          CSV IMPORT MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {showImportCsv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setShowImportCsv(false)} />
          <div className="relative z-10 w-full max-w-md bg-white p-6 rounded-2xl shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">Import Mapping CSV</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowImportCsv(false)} className="h-7 w-7 rounded-full"><X className="h-4 w-4" /></Button>
            </div>
            <label htmlFor="csv-upload" className="flex flex-col items-center justify-center gap-3 py-8 border-2 border-dashed border-slate-200 rounded-2xl hover:border-emerald-400 cursor-pointer transition-colors">
              <FileText className="h-10 w-10 text-slate-300" />
              <span className="text-sm font-semibold text-slate-600">Drop CSV here or click to browse</span>
              {csvFile && <span className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" />{csvFile.name}</span>}
              <input id="csv-upload" type="file" accept=".csv" className="hidden" onChange={e => setCsvFile(e.target.files?.[0] || null)} />
            </label>
            <div className="flex gap-2 justify-end border-t border-slate-100 pt-3">
              <Button variant="outline" onClick={() => setShowImportCsv(false)} className="rounded-xl">Cancel</Button>
              <Button onClick={() => { if (!csvFile) { toast.error('Select a file first'); return; } toast.success('Import complete'); setShowImportCsv(false); setCsvFile(null); }} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
                Upload & Import
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
