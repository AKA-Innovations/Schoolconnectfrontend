'use client';

import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { useTimetable, usePeriodSlots } from '@/hooks/useClasses';
import { Calendar, Clock, BookOpen } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TeacherSchedulePage() {
  const user = useAuthStore((s) => s.user);

  const { data: allEntries = [], isLoading: loadingTT } = useTimetable();
  const { data: periodSlots = [], isLoading: loadingSlots } = usePeriodSlots();

  const isLoading = loadingTT || loadingSlots;

  // Filter entries where the current teacher is assigned
  const myEntries = useMemo(
    () => allEntries.filter((e) => e.teacherName != null),
    [allEntries],
  );

  const sorted = useMemo(
    () => [...periodSlots].sort((a, b) => a.periodNumber - b.periodNumber),
    [periodSlots],
  );

  // Build grid: day → slotId → entry
  const grid = useMemo(() => {
    const map: Record<string, Record<number, typeof myEntries[number]>> = {};
    DAYS.forEach((d) => { map[d] = {}; });
    myEntries.forEach((e) => {
      if (map[e.dayOfWeek]) map[e.dayOfWeek][e.periodSlotId] = e;
    });
    return map;
  }, [myEntries]);

  // Today's schedule
  const todayName = DAYS[new Date().getDay() - 1] || 'Monday';
  const todayEntries = useMemo(
    () => myEntries.filter((e) => e.dayOfWeek === todayName).sort((a, b) => {
      const slotA = periodSlots.find((s) => s.id === a.periodSlotId);
      const slotB = periodSlots.find((s) => s.id === b.periodSlotId);
      return (slotA?.periodNumber ?? 0) - (slotB?.periodNumber ?? 0);
    }),
    [myEntries, todayName, periodSlots],
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Schedule</h1>
        <p className="text-muted-foreground mt-1">Your weekly teaching timetable</p>
      </div>

      {/* Today's highlight */}
      <Card className="erp-card border-l-4 border-l-primary">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Today — {todayName}</h2>
            <Badge variant="secondary" className="ml-auto">{todayEntries.length} classes</Badge>
          </div>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-muted rounded animate-pulse" />)}
            </div>
          ) : todayEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No classes scheduled for today</p>
          ) : (
            <div className="space-y-2">
              {todayEntries.map((entry) => {
                const slot = periodSlots.find((s) => s.id === entry.periodSlotId);
                return (
                  <div key={entry.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="text-xs font-mono text-muted-foreground w-[100px]">
                      {slot?.startTime} – {slot?.endTime}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-semibold">{entry.subjectName || '—'}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {entry.className} {entry.sectionName}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      Period {slot?.periodNumber}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full week grid */}
      {isLoading ? (
        <Card className="erp-card animate-pulse">
          <CardContent className="p-6"><div className="h-64 bg-muted rounded" /></CardContent>
        </Card>
      ) : sorted.length === 0 ? (
        <div className="py-16 text-center">
          <Calendar className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-bold text-muted-foreground">No timetable available</p>
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
                      <th key={d} className={`py-3 px-4 text-center text-[10px] font-bold uppercase tracking-widest border-b border-r border-border/40 ${d === todayName ? 'text-primary bg-primary/5' : 'text-muted-foreground'}`}>
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
                          <td key={day} className={`py-2 px-3 border-b border-r border-border/30 text-center align-top min-w-[120px] ${day === todayName ? 'bg-primary/[0.02]' : ''}`}>
                            {entry ? (
                              <div>
                                <div className="text-xs font-semibold text-primary">{entry.subjectName || '—'}</div>
                                <div className="text-[10px] text-muted-foreground">{entry.className} {entry.sectionName}</div>
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
