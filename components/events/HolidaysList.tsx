'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { eventService } from '@/services/event/service';
import type { SchoolEvent } from '@/services/event/types';
import { CURRENT_SESSION } from '@/lib/constants';
import { toast } from 'sonner';
import { CalendarDays, RotateCw, Star, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getDayName(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long' });
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface Props {
  role: string;
}

export function HolidaysList({ role }: Props) {
  const [holidays, setHolidays] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(CURRENT_SESSION);


  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const res = await eventService.getHolidays(session);
      setHolidays(Array.isArray(res) ? res : []);
    } catch (err) {
      toast.error('Failed to load holidays');
      setHolidays([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, [session]);

  // Group by month
  const grouped = useMemo(() => {
    const groups: { [monthKey: string]: SchoolEvent[] } = {};
    holidays.forEach(h => {
      const date = new Date(h.startDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(h);
    });
    // Sort by month key
    const sorted = Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
    return sorted.map(([key, events]) => {
      const [year, month] = key.split('-').map(Number);
      return {
        label: `${MONTH_NAMES[month - 1]} ${year}`,
        events: events.sort((a, b) => a.startDate.localeCompare(b.startDate)),
      };
    });
  }, [holidays]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="rounded-xl text-sm px-3 py-1 font-bold">
            {holidays.length} {holidays.length === 1 ? 'Holiday' : 'Holidays'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={session}
            onChange={(e) => setSession(e.target.value)}
            className="h-9 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="2026-27">Session 2026-27</option>
            <option value="2025-26">Session 2025-26</option>
          </select>
          <Button variant="outline" size="icon" onClick={fetchHolidays} disabled={loading} className="rounded-xl h-9 w-9">
            <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : holidays.length === 0 ? (
        <Card className="border border-dashed border-border/80">
          <CardContent className="p-16 text-center">
            <AlertCircle className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
            <h3 className="text-lg font-bold text-foreground">No Holidays Found</h3>
            <p className="text-sm text-muted-foreground mt-1">No holidays have been added for this session yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {grouped.map(group => (
            <div key={group.label}>
              {/* Month header */}
              <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2 mb-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  {group.label}
                  <Badge variant="secondary" className="text-[10px] rounded-lg ml-1">
                    {group.events.length}
                  </Badge>
                </h3>
              </div>

              {/* Holiday items */}
              <div className="space-y-2">
                {group.events.map(h => (
                  <div
                    key={h.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-rose-200/60 bg-rose-50/30 hover:bg-rose-50/60 transition-colors"
                  >
                    {/* Date circle */}
                    <div className="flex flex-col items-center justify-center h-14 w-14 rounded-xl bg-rose-100 text-rose-700 shrink-0">
                      <span className="text-lg font-black leading-none">
                        {new Date(h.startDate.slice(0, 10) + 'T00:00:00').getDate()}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider">
                        {getDayName(h.startDate.slice(0, 10)).slice(0, 3)}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-foreground truncate">{h.title}</h4>
                        <Star className="h-3 w-3 text-rose-500 fill-current shrink-0" />
                      </div>
                      {h.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{h.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                        <span>{formatDate(h.startDate.slice(0, 10))}</span>
                        {h.startDate.slice(0, 10) !== h.endDate.slice(0, 10) && (
                          <span>— {formatDate(h.endDate.slice(0, 10))}</span>
                        )}
                      </div>
                    </div>

                    {/* Day name badge */}
                    <Badge variant="outline" className="text-[10px] rounded-lg shrink-0">
                      {getDayName(h.startDate.slice(0, 10))}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
