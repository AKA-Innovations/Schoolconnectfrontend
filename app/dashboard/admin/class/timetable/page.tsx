'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  useTimetable, useCreateTimetableEntry,
  useUpdateTimetableEntry, useDeleteTimetableEntry,
  usePeriodSlots, useSubjectDetails, useClassSectionLists,
} from '@/hooks/useClasses';
import { Plus, Trash2, Calendar, X, Save } from 'lucide-react';
import { toast } from 'sonner';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TimetablePage() {
  const { data: entries = [], isLoading } = useTimetable();
  const { data: periodSlots = [] } = usePeriodSlots();
  const { data: subjectDetails = [] } = useSubjectDetails();
  const { data: classSections = [] } = useClassSectionLists();

  const createMutation = useCreateTimetableEntry();
  const updateMutation = useUpdateTimetableEntry();
  const deleteMutation = useDeleteTimetableEntry();

  const [selectedClass, setSelectedClass] = useState<number>(0);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    classDtlsId: 0, periodSlotId: 0, subjectDtlsId: 0, dayOfWeek: '',
  });

  const sorted = useMemo(
    () => [...periodSlots].sort((a, b) => a.periodNumber - b.periodNumber),
    [periodSlots],
  );

  const filteredEntries = useMemo(
    () => (selectedClass ? entries.filter((e) => e.classDtlsId === selectedClass) : entries),
    [entries, selectedClass],
  );

  // group by day → slotId for the grid
  const grid = useMemo(() => {
    const map: Record<string, Record<number, typeof entries[number]>> = {};
    DAYS.forEach((d) => { map[d] = {}; });
    filteredEntries.forEach((e) => {
      if (map[e.dayOfWeek]) map[e.dayOfWeek][e.periodSlotId] = e;
    });
    return map;
  }, [filteredEntries]);

  // Subject-details scoped to selected class
  const classSubjectDetails = useMemo(
    () => (selectedClass ? subjectDetails.filter((sd) => sd.classDtlsId === selectedClass) : subjectDetails),
    [subjectDetails, selectedClass],
  );

  const handleSave = async () => {
    if (!form.classDtlsId || !form.periodSlotId || !form.dayOfWeek) {
      toast.error('Class, period slot, and day are required');
      return;
    }
    try {
      await createMutation.mutateAsync({
        classDtlsId: form.classDtlsId,
        periodSlotId: form.periodSlotId,
        subjectDtlsId: form.subjectDtlsId || undefined,
        dayOfWeek: form.dayOfWeek,
      });
      toast.success('Timetable entry added');
      resetForm();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Entry removed');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const resetForm = () => {
    setShowAdd(false);
    setForm({ classDtlsId: selectedClass || 0, periodSlotId: 0, subjectDtlsId: 0, dayOfWeek: '' });
  };

  const selectedClassName = classSections.find((c) => c.id === selectedClass);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Timetable</h1>
          <p className="text-muted-foreground mt-1">Build and manage weekly timetables for each class</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedClass ? String(selectedClass) : ''} onValueChange={(v) => setSelectedClass(Number(v))}>
            <SelectTrigger className="rounded-xl w-[220px]">
              <SelectValue placeholder="Filter by class…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">All Classes</SelectItem>
              {classSections.map((cs) => (
                <SelectItem key={cs.id} value={String(cs.id)}>
                  {cs.className} — {cs.sectionName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => { setShowAdd(true); setForm({ classDtlsId: selectedClass || 0, periodSlotId: 0, subjectDtlsId: 0, dayOfWeek: '' }); }} className="rounded-xl">
            <Plus className="h-4 w-4 mr-2" /> Add Entry
          </Button>
        </div>
      </div>

      {/* Quick add form */}
      {showAdd && (
        <Card className="erp-card border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Class / Section *</Label>
                <Select value={form.classDtlsId ? String(form.classDtlsId) : ''} onValueChange={(v) => setForm({ ...form, classDtlsId: Number(v) })}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {classSections.map((cs) => (
                      <SelectItem key={cs.id} value={String(cs.id)}>{cs.className} — {cs.sectionName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Day *</Label>
                <Select value={form.dayOfWeek} onValueChange={(v) => setForm({ ...form, dayOfWeek: v })}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select day" /></SelectTrigger>
                  <SelectContent>
                    {DAYS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Period Slot *</Label>
                <Select value={form.periodSlotId ? String(form.periodSlotId) : ''} onValueChange={(v) => setForm({ ...form, periodSlotId: Number(v) })}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {sorted.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        #{s.periodNumber} {s.startTime}–{s.endTime}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Subject (optional)</Label>
                <Select value={form.subjectDtlsId ? String(form.subjectDtlsId) : ''} onValueChange={(v) => setForm({ ...form, subjectDtlsId: Number(v) })}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">— None —</SelectItem>
                    {classSubjectDetails.map((sd) => (
                      <SelectItem key={sd.id} value={String(sd.id)}>
                        {sd.subjectName} ({sd.teacherName || sd.teacherId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSave} disabled={createMutation.isPending} className="rounded-xl">
                <Save className="h-4 w-4 mr-2" /> Add
              </Button>
              <Button variant="ghost" onClick={resetForm} className="rounded-xl">
                <X className="h-4 w-4 mr-2" /> Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timetable grid */}
      {isLoading ? (
        <Card className="erp-card animate-pulse">
          <CardContent className="p-6"><div className="h-64 bg-muted rounded" /></CardContent>
        </Card>
      ) : sorted.length === 0 ? (
        <div className="py-16 text-center">
          <Calendar className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-bold text-muted-foreground">No period slots defined</p>
          <p className="text-xs text-muted-foreground mt-1">Create period slots first before building the timetable</p>
        </div>
      ) : (
        <Card className="erp-card overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="py-3 px-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-r border-border/40 w-[100px]">
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
                        <div className="text-muted-foreground">{slot.startTime}–{slot.endTime}</div>
                      </td>
                      {DAYS.map((day) => {
                        const entry = grid[day]?.[slot.id];
                        return (
                          <td key={day} className="py-2 px-3 border-b border-r border-border/30 text-center align-top min-w-[120px]">
                            {entry ? (
                              <div className="group relative">
                                <div className="text-xs font-semibold text-primary">{entry.subjectName || '—'}</div>
                                {entry.teacherName && (
                                  <div className="text-[10px] text-muted-foreground">{entry.teacherName}</div>
                                )}
                                <Button
                                  variant="ghost" size="icon"
                                  onClick={() => handleDelete(entry.id)}
                                  className="h-5 w-5 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
