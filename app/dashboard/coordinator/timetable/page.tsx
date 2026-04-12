'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  useClassSectionLists, useSubjectDetails, useTimetable, usePeriodSlots,
  useCreateTimetableEntry, useUpdateTimetableEntry, useDeleteTimetableEntry,
} from '@/hooks/useClasses';
import { useAuthStore } from '@/store/authStore';
import { CURRENT_SESSION } from '@/lib/constants';
import { toast } from 'sonner';
import { Calendar, Save, X } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

export default function CoordinatorTimetablePage() {
  const user = useAuthStore((s) => s.user);
  const coordinatorClasses = user?.coordinatorClasses ?? [];

  const { data: allClassSections = [] } = useClassSectionLists();
  const { data: subjectDetails = [] } = useSubjectDetails();
  const { data: timetableEntries = [] } = useTimetable();
  const { data: periodSlots = [] } = usePeriodSlots();

  const classSections = useMemo(
    () => coordinatorClasses.length > 0
      ? allClassSections.filter((cs) => coordinatorClasses.includes(cs.className))
      : allClassSections,
    [allClassSections, coordinatorClasses],
  );

  const [selectedId, setSelectedId] = useState<number>(0);
  const selectedSection = classSections.find((cs) => cs.id === selectedId);

  const sectionSubjects = useMemo(
    () => selectedSection
      ? subjectDetails.filter((sd) => sd.className === selectedSection.className && sd.sectionName === selectedSection.sectionName)
      : [],
    [subjectDetails, selectedSection],
  );

  const sectionSdIds = useMemo(() => new Set(sectionSubjects.map((sd) => sd.id)), [sectionSubjects]);
  const sectionTimetable = useMemo(
    () => timetableEntries.filter((e) => sectionSdIds.has(e.teacherClassId)),
    [timetableEntries, sectionSdIds],
  );

  const sortedSlots = useMemo(
    () => [...periodSlots].sort((a, b) => a.periodNumber - b.periodNumber),
    [periodSlots],
  );

  const sdMap = useMemo(() => {
    const m = new Map<number, (typeof subjectDetails)[number]>();
    subjectDetails.forEach((sd) => m.set(sd.id, sd));
    return m;
  }, [subjectDetails]);

  const ttGrid = useMemo(() => {
    const map: Record<string, Record<number, (typeof timetableEntries)[number]>> = {};
    DAYS.forEach((d) => { map[d] = {}; });
    sectionTimetable.forEach((e) => { if (map[e.dayOfWeek]) map[e.dayOfWeek][e.periodId] = e; });
    return map;
  }, [sectionTimetable]);

  // Editing state
  const [editingCell, setEditingCell] = useState<{ day: string; slotId: number } | null>(null);
  const [selectedSdId, setSelectedSdId] = useState<number>(0);

  const createMutation = useCreateTimetableEntry();
  const updateMutation = useUpdateTimetableEntry();
  const deleteMutation = useDeleteTimetableEntry();

  const handleCellClick = (day: string, slotId: number) => {
    const existing = ttGrid[day]?.[slotId];
    setSelectedSdId(existing ? existing.teacherClassId : 0);
    setEditingCell({ day, slotId });
  };

  const handleSaveCell = () => {
    if (!editingCell) return;
    const { day, slotId } = editingCell;
    const existing = ttGrid[day]?.[slotId];

    if (selectedSdId === 0 && existing) {
      deleteMutation.mutate(existing.id, {
        onSuccess: () => { toast.success('Slot cleared'); setEditingCell(null); },
        onError: () => toast.error('Failed to clear'),
      });
    } else if (selectedSdId && existing) {
      updateMutation.mutate(
        { id: existing.id, data: { teacherClassId: selectedSdId } },
        { onSuccess: () => { toast.success('Updated'); setEditingCell(null); }, onError: () => toast.error('Failed') },
      );
    } else if (selectedSdId && !existing) {
      createMutation.mutate(
        { session: CURRENT_SESSION, teacherClassId: selectedSdId, periodId: slotId, dayOfWeek: day },
        { onSuccess: () => { toast.success('Assigned'); setEditingCell(null); }, onError: () => toast.error('Failed') },
      );
    } else {
      setEditingCell(null);
    }
  };

  const filledCount = sectionTimetable.length;
  const totalSlots = sortedSlots.length * DAYS.length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
            <Calendar className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Timetable</h1>
            <p className="text-muted-foreground mt-1 text-sm">Manage class schedules</p>
          </div>
        </div>
        <select value={selectedId || ''} onChange={(e) => { setSelectedId(Number(e.target.value)); setEditingCell(null); }}
          className="h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring w-56">
          <option value="">Select class-section...</option>
          {classSections.map((cs) => (
            <option key={cs.id} value={cs.id}>{cs.className} — {cs.sectionName}</option>
          ))}
        </select>
      </div>

      {!selectedSection ? (
        <Card className="erp-card">
          <CardContent className="p-16 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-bold text-muted-foreground">Select a class-section</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Choose a class above to view and edit its timetable</p>
          </CardContent>
        </Card>
      ) : sortedSlots.length === 0 ? (
        <Card className="erp-card">
          <CardContent className="p-16 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-bold text-muted-foreground">No period slots defined</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="rounded-lg">
              {filledCount}/{totalSlots} slots filled
            </Badge>
            <p className="text-xs text-muted-foreground">Click any cell to edit</p>
          </div>

          <Card className="erp-card overflow-hidden">
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full border-collapse min-w-175">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="py-3 px-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-r border-border/40 w-24">Period</th>
                    {DAYS.map((d) => (
                      <th key={d} className="py-3 px-4 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-r border-border/40">{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedSlots.map((slot) => (
                    <tr key={slot.id}>
                      <td className="py-2 px-4 border-b border-r border-border/30 text-xs whitespace-nowrap">
                        <div className="font-bold">#{slot.periodNumber}</div>
                        <div className="text-muted-foreground">{slot.startTime}–{slot.endTime}</div>
                      </td>
                      {DAYS.map((day) => {
                        const entry = ttGrid[day]?.[slot.id];
                        const sd = entry ? sdMap.get(entry.teacherClassId) : undefined;
                        const isEditing = editingCell?.day === day && editingCell?.slotId === slot.id;

                        return (
                          <td key={day} className="py-2 px-2 border-b border-r border-border/30 text-center align-top min-w-28 cursor-pointer hover:bg-muted/20 transition-colors"
                            onClick={() => !isEditing && handleCellClick(day, slot.id)}>
                            {isEditing ? (
                              <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
                                <select value={selectedSdId} onChange={(e) => setSelectedSdId(Number(e.target.value))}
                                  className="w-full h-7 px-1 text-[10px] bg-background border border-input rounded text-center">
                                  <option value={0}>— Empty —</option>
                                  {sectionSubjects.map((s) => (
                                    <option key={s.id} value={s.id}>{s.subjectName} ({s.teacherName || s.teacherId})</option>
                                  ))}
                                </select>
                                <div className="flex gap-1 justify-center">
                                  <Button size="icon" className="h-5 w-5 rounded" onClick={handleSaveCell}
                                    disabled={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending}>
                                    <Save className="h-3 w-3" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-5 w-5 rounded" onClick={() => setEditingCell(null)}>
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ) : sd ? (
                              <div className="text-xs">
                                <div className="font-semibold text-primary">{sd.subjectName}</div>
                                {sd.teacherName && <div className="text-muted-foreground text-[10px]">{sd.teacherName}</div>}
                              </div>
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
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
