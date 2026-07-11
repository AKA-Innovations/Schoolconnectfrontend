'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  useTimetable, useCreateTimetableBulk, useDeleteTimetableEntry, useUpdateTimetableEntry,
  usePeriodSlots, useSubjectDetails, useClassSectionLists,
  useSchoolClasses,
} from '@/hooks/useClasses';
import { useAuthStore } from '@/store/authStore';
import { CURRENT_SESSION } from '@/lib/constants';
import { SubjectDetail, PeriodSlot, TimetableEntry, CreateTimetablePayload, ClassSectionItem } from '@/types/class.types';
import { Plus, Trash2, Calendar, Save, AlertTriangle, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

/** Key for a grid cell: "day|periodId" */
function cellKey(day: string, periodId: number) { return `${day}|${periodId}`; }

type DraftCell = { classSubjectId: string };

export default function CoordinatorTimetablePage() {
  const user = useAuthStore((s) => s.user);
  const coordinatorClasses = user?.coordinatorClasses ?? [];

  const { data: periodSlots = [] } = usePeriodSlots();
  const { data: subjectDetails = [] } = useSubjectDetails();
  const { data: rawClassSections = [] } = useClassSectionLists();
  const { data: schoolClasses = [] } = useSchoolClasses();

  const allClassSections: ClassSectionItem[] =
    (rawClassSections as any)?.classSections ?? (Array.isArray(rawClassSections) ? rawClassSections : []);

  const bulkCreateMut = useCreateTimetableBulk();
  const deleteMut = useDeleteTimetableEntry();

  // ── Local state ──
  const [selectedClassName, setSelectedClassName] = useState('');
  const [selectedSectionName, setSelectedSectionName] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, DraftCell>>({});

  // Derive currently selected section object
  const currentSection = useMemo(
    () => allClassSections.find(cs => cs.className === selectedClassName && cs.sectionName === selectedSectionName),
    [allClassSections, selectedClassName, selectedSectionName]
  );

  // Resolve classId from schoolClasses if missing in section object
  const resolvedClassId = useMemo(() => {
    if (currentSection?.classId) return currentSection.classId;
    if (!currentSection || !selectedClassName) return undefined;
    const cls = schoolClasses.find(c => c.className === selectedClassName);
    return cls?.id;
  }, [currentSection, selectedClassName, schoolClasses]);

  // ── Data fetching ──
  const { data: allEntries = [], isLoading: loadingTimetable } = useTimetable({
    session: CURRENT_SESSION,
    classId: resolvedClassId,
    classSectionId: currentSection?.masterSectionId,
  });

  // Normalize coordinator classes to strings for robust filtering
  const coordClassNames = useMemo(() =>
    coordinatorClasses.map(c => String(typeof c === 'object' ? c.className : c)).filter(Boolean),
    [coordinatorClasses]
  );

  // Filter class sections to only the ones they coordinate
  const classSections = useMemo(
    () => coordClassNames.length > 0
      ? allClassSections.filter((cs) => coordClassNames.includes(String(cs.className)))
      : allClassSections,
    [allClassSections, coordClassNames]
  );

  const updateMut = useUpdateTimetableEntry();
  // ── Derived data ──
  const sorted = useMemo(
    () => [...periodSlots].sort((a: PeriodSlot, b: PeriodSlot) => a.periodNumber - b.periodNumber),
    [periodSlots],
  );

  const classNames = useMemo(
    () => Array.from(new Set(classSections.map((c) => c.className))).sort(),
    [classSections],
  );

  const sectionsForClass = useMemo(
    () => classSections.filter((c) => c.className === selectedClassName).map((c) => c.sectionName).sort(),
    [classSections, selectedClassName],
  );

  // Subject-detail mappings for the selected class+section
  const mappingsForSection: SubjectDetail[] = useMemo(
    () => subjectDetails.filter(
      (sd: SubjectDetail) => sd.className === selectedClassName && sd.sectionName === selectedSectionName
    ),
    [subjectDetails, selectedClassName, selectedSectionName],
  );

  // Lookup: classSubjectId → SubjectDetail
  const sdMap = useMemo(() => {
    const m = new Map<string, SubjectDetail>();
    (subjectDetails as SubjectDetail[]).forEach((sd) => m.set(String(sd.id), sd));
    return m;
  }, [subjectDetails]);

  const allEntriesArr: TimetableEntry[] = useMemo(
    () => (Array.isArray(allEntries) ? allEntries : []),
    [allEntries],
  );

  // ── Data Normalization ──
  const normalizedEntries = useMemo(() => {
    return allEntriesArr.map(e => {
      let classSubjectId = e.classSubjectId;
      if (!classSubjectId && e.subjectName) {
        const match = subjectDetails.find(sd => 
          sd.subjectName === e.subjectName && 
          (sd.teacherName === e.teacherName || !e.teacherName) &&
          sd.className === (e.className || selectedClassName) &&
          sd.sectionName === (e.sectionName || selectedSectionName)
        );
        if (match) classSubjectId = String(match.id);
      }

      let periodId = e.periodId;
      if (!periodId && e.periodNumber) {
        const slot = periodSlots.find(s => s.periodNumber === e.periodNumber);
        periodId = slot?.id ?? 0;
      }

      return { ...e, classSubjectId, periodId };
    });
  }, [allEntriesArr, subjectDetails, periodSlots, selectedClassName, selectedSectionName]);

  // classSubjectIds belonging to selected class+section
  const sectionTcIds = useMemo(
    () => new Set(mappingsForSection.map((m) => String(m.id))),
    [mappingsForSection],
  );

  // Timetable entries for this section
  const sectionEntries: TimetableEntry[] = useMemo(
    () => normalizedEntries.filter((e) => {
      if (e.classSubjectId) return sectionTcIds.has(String(e.classSubjectId));
      return e.className === selectedClassName && e.sectionName === selectedSectionName;
    }),
    [normalizedEntries, sectionTcIds, selectedClassName, selectedSectionName],
  );

  // "day|periodId" → existing TimetableEntry
  const existingGrid = useMemo(() => {
    const m: Record<string, TimetableEntry> = {};
    sectionEntries.forEach((e) => { 
      if (e.periodId) {
        m[cellKey(e.dayOfWeek, e.periodId as number)] = e; 
      }
    });
    return m;
  }, [sectionEntries]);

  // ── Conflict checker ──
  // Checks if the teacher behind classSubjectId is already occupied at day+periodId
  const teacherConflict = useCallback(
    (classSubjectId: string, day: string, periodId: number): string | null => {
      const sd = sdMap.get(classSubjectId);
      if (!sd) return null;
      const teacherId = sd.teacherId;

      for (const entry of allEntriesArr) {
        if (entry.dayOfWeek !== day || entry.periodId !== periodId) continue;
        if (sectionTcIds.has(String(entry.classSubjectId))) continue;
        const entrySd = sdMap.get(String(entry.classSubjectId));
        if (entrySd && entrySd.teacherId === teacherId) {
          return `${entrySd.teacherName || 'Teacher'} already teaches ${entrySd.subjectName} in ${entrySd.className}-${entrySd.sectionName}`;
        }
      }

      const thisKey = cellKey(day, periodId);
      for (const [key, draft] of Object.entries(drafts)) {
        if (key === thisKey) continue;
        const [dDay, dPeriod] = key.split('|');
        if (dDay !== day || Number(dPeriod) !== periodId) continue;
        const dSd = sdMap.get(draft.classSubjectId);
        if (dSd && dSd.teacherId === teacherId) {
          return `${dSd.teacherName || 'Teacher'} already assigned at this period (draft)`;
        }
      }
      return null;
    },
    [allEntriesArr, sdMap, sectionTcIds, drafts],
  );

  // ── Handlers ──
  const handleDraftChange = (day: string, periodId: number, classSubjectId: string) => {
    const key = cellKey(day, periodId);
    setDrafts((prev) => {
      if (!classSubjectId) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: { classSubjectId } };
    });
  };

  const handleBulkSave = async () => {
    const entries = Object.entries(drafts);
    if (entries.length === 0) { toast.info('No changes to save'); return; }

    const toCreate: any[] = [];
    const toUpdate: { id: number | string; data: any }[] = [];

    // Validate conflicts and identify operations
    for (const [key, draft] of entries) {
      const [day, periodId] = key.split('|');
      const conflict = teacherConflict(draft.classSubjectId, day, Number(periodId));
      if (conflict) { toast.error(conflict); return; }

      const existing = existingGrid[key];
      if (existing) {
        if (String(existing.classSubjectId) === draft.classSubjectId) continue;
        toUpdate.push({
          id: existing.id ?? (existing as any).timetableId ?? (existing as any).timetable_id,
          data: {
            session: CURRENT_SESSION,
            classSubjectId: draft.classSubjectId,
            periodId: Number(periodId),
            dayOfWeek: day,
          }
        });
      } else {
        toCreate.push({
          session: CURRENT_SESSION,
          classSubjectId: draft.classSubjectId,
          periodId: Number(periodId),
          dayOfWeek: day,
        });
      }
    }

    if (toCreate.length === 0 && toUpdate.length === 0) {
      toast.info('No changes detected');
      setEditMode(false);
      return;
    }

    try {
      const promises = [];
      if (toCreate.length > 0) promises.push(bulkCreateMut.mutateAsync(toCreate));
      toUpdate.forEach(upd => promises.push(updateMut.mutateAsync({ id: upd.id, data: upd.data })));

      await Promise.all(promises);
      toast.success('Timetable updated successfully');
      setDrafts({});
      setEditMode(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save changes');
    }
  };

  const handleDelete = async (id: number | string) => {
    try {
      await deleteMut.mutateAsync(id as any);
      toast.success('Entry removed');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const discardDrafts = () => { setDrafts({}); setEditMode(false); };

  const hasClass = selectedClassName && selectedSectionName;
  const draftCount = Object.keys(drafts).length;

  // Conflict summary for UI
  const conflictMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const [key, draft] of Object.entries(drafts)) {
      const [day, periodId] = key.split('|');
      const c = teacherConflict(draft.classSubjectId, day, Number(periodId));
      if (c) m[key] = c;
    }
    return m;
  }, [drafts, teacherConflict]);

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Class Schedule</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Weekly timetable for {coordClassNames.length > 0 ? coordClassNames.join(', ') : 'managed classes'}
        </p>
      </div>

      {/* Class + Section selectors */}
      <Card className="erp-card">
        <CardContent className="p-6 flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1.5 min-w-44">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Class</Label>
            <select
              value={selectedClassName}
              onChange={(e) => { setSelectedClassName(e.target.value); setSelectedSectionName(''); setEditMode(false); setDrafts({}); }}
              className="h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select class…</option>
              {classNames.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 min-w-40">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Section</Label>
            <select
              value={selectedSectionName}
              onChange={(e) => { setSelectedSectionName(e.target.value); setEditMode(false); setDrafts({}); }}
              className="h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={!selectedClassName}
            >
              <option value="">Select section…</option>
              {sectionsForClass.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {hasClass && (
            <div className="flex items-center gap-2 ml-auto">
              {editMode ? (
                <>
                  <Button
                    onClick={handleBulkSave}
                    disabled={draftCount === 0 || bulkCreateMut.isPending || Object.keys(conflictMap).length > 0}
                    className="rounded-xl"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {bulkCreateMut.isPending ? 'Saving…' : `Save ${draftCount} entries`}
                  </Button>
                  <Button variant="ghost" onClick={discardDrafts} className="rounded-xl">
                    <X className="h-4 w-4 mr-2" /> Discard
                  </Button>
                </>
              ) : (
                <Button onClick={() => setEditMode(true)} className="rounded-xl">
                  <Plus className="h-4 w-4 mr-2" /> Edit Timetable
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subject-Teacher legend */}
      {hasClass && mappingsForSection.length > 0 && (
        <Card className="erp-card">
          <CardHeader className="py-4 px-6 border-b border-border/50 bg-muted/10">
            <CardTitle className="text-sm font-bold">Subject Mappings — {selectedClassName} {selectedSectionName}</CardTitle>
            <CardDescription className="text-xs">
              {mappingsForSection.length} subject-teacher assignments available
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 flex flex-wrap gap-2">
            {mappingsForSection.map((m) => (
              <div key={m.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/20 border border-border/40 text-xs">
                <span className="font-bold text-foreground">{m.subjectName}</span>
                <span className="text-muted-foreground">— {m.teacherName || m.teacherId}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {hasClass && mappingsForSection.length === 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 flex items-center gap-3 text-amber-700 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          No subject-teacher mappings exist for {selectedClassName}-{selectedSectionName}. Create them in Subject Mapping first.
        </div>
      )}

      {/* Conflict warnings */}
      {Object.keys(conflictMap).length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 space-y-1">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
            <AlertTriangle className="h-4 w-4" /> Conflicts detected — fix before saving
          </div>
          {Object.entries(conflictMap).map(([key, msg]) => {
            const [day, periodId] = key.split('|');
            const slot = sorted.find((s) => s.id === Number(periodId));
            return (
              <p key={key} className="text-xs text-amber-600 ml-6">
                {day} Period #{slot?.periodNumber}: {msg}
              </p>
            );
          })}
        </div>
      )}

      {/* Timetable Grid */}
      {!hasClass ? (
        <div className="py-24 text-center text-muted-foreground/40 bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="text-[11px] font-bold uppercase tracking-widest">Select a class and section to view the timetable</p>
        </div>
      ) : loadingTimetable ? (
        <Card className="erp-card animate-pulse"><CardContent className="p-6"><div className="h-64 bg-muted rounded" /></CardContent></Card>
      ) : sorted.length === 0 ? (
        <div className="py-16 text-center">
          <Calendar className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-bold text-muted-foreground">No period slots defined yet</p>
          <p className="text-xs text-muted-foreground mt-1">Ask the administration to define period slots.</p>
        </div>
      ) : (
        <Card className="erp-card overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="py-3 px-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-r border-border/40 w-[110px]">
                      Period
                    </th>
                    {DAYS.map((d) => (
                      <th key={d} className="py-3 px-4 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-r border-border/40">
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((slot) => (
                    <tr key={slot.id}>
                      <td className="py-2 px-4 border-b border-r border-border/30 text-xs whitespace-nowrap">
                        <div className="font-bold">#{slot.periodNumber}</div>
                        <div className="text-muted-foreground">{slot.startTime} – {slot.endTime}</div>
                      </td>
                      {DAYS.map((day) => {
                        const key = cellKey(day, slot.id);
                        const existing = existingGrid[key];
                        const draft = drafts[key];
                        const conflict = conflictMap[key];

                        return (
                          <td key={day} className={cn(
                            'py-2 px-2 border-b border-r border-border/30 text-center align-top min-w-[130px]',
                            conflict && 'bg-amber-50',
                          )}>
                            {existing ? (
                              <ExistingCell
                                entry={existing}
                                sd={sdMap.get(String(existing.classSubjectId))}
                                onDelete={handleDelete}
                                isDeleting={deleteMut.isPending}
                              />
                            ) : editMode ? (
                              <DraftSelect
                                value={draft?.classSubjectId ?? ''}
                                mappings={mappingsForSection}
                                onChange={(tcId) => handleDraftChange(day, slot.id, tcId)}
                                conflict={conflict}
                              />
                            ) : (
                              <span className="text-muted-foreground/30 text-xs">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ExistingCell({
  entry, sd, onDelete, isDeleting,
}: {
  entry: TimetableEntry;
  sd?: SubjectDetail;
  onDelete: (id: number | string) => void;
  isDeleting: boolean;
}) {
  return (
    <div className="group relative py-1 flex flex-col items-center justify-center min-h-[40px]">
      <div className="text-xs font-semibold text-primary">{sd?.subjectName || `#${entry.classSubjectId}`}</div>
      {sd?.teacherName && (
        <div className="text-[10px] text-muted-foreground mt-0.5">{sd.teacherName}</div>
      )}
      <Button
        variant="ghost" size="icon"
        onClick={() => onDelete(entry.id ?? (entry as any).timetableId ?? (entry as any).timetable_id)}
        disabled={isDeleting}
        className="h-5 w-5 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}

function DraftSelect({
  value, mappings, onChange, conflict,
}: {
  value: string;
  mappings: SubjectDetail[];
  onChange: (tcId: string) => void;
  conflict?: string;
}) {
  return (
    <div className="relative">
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full h-8 text-[11px] px-1.5 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring',
          conflict ? 'border-amber-400 bg-amber-50' : value ? 'border-primary/40 bg-primary/5' : 'border-input',
        )}
      >
        <option value="">—</option>
        {mappings.map((m) => (
          <option key={m.id} value={String(m.id)}>
            {m.subjectName} — {m.teacherName || m.teacherId}
          </option>
        ))}
      </select>
      {value && !conflict && (
        <Check className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-emerald-500 pointer-events-none" />
      )}
      {conflict && (
        <AlertTriangle className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-amber-500 pointer-events-none" />
      )}
    </div>
  );
}
