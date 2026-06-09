'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { eventService } from '@/services/event/service';
import type { SchoolEvent } from '@/services/event/types';
import { CURRENT_SESSION } from '@/lib/constants';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, CalendarDays, Clock, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const EVENT_DOT_COLORS: Record<string, string> = {
  HOLIDAY: 'bg-rose-500',
  EXAM: 'bg-amber-500',
  SPORTS: 'bg-emerald-500',
  CULTURAL: 'bg-purple-500',
  PTM: 'bg-blue-500',
  MEETING: 'bg-teal-500',
  OTHER: 'bg-slate-400',
};

interface Props {
  role: string;
}

export function EventCalendar({ role }: Props) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayDialogOpen, setDayDialogOpen] = useState(false);
  const [session] = useState(CURRENT_SESSION);

  // Upcoming events state
  const [upcomingEvents, setUpcomingEvents] = useState<SchoolEvent[]>([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(false);

  const fetchCalendarEvents = async () => {
    setLoading(true);
    try {
      const res = await eventService.listEvents({
        session,
        month: currentMonth,
        year: currentYear,
      });
      setEvents(Array.isArray(res) ? res : []);
    } catch (err) {
      toast.error('Failed to load calendar events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingEvents = async () => {
    setLoadingUpcoming(true);
    try {
      const res = await eventService.getUpcoming(session);
      setUpcomingEvents(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to load upcoming events:', err);
    } finally {
      setLoadingUpcoming(false);
    }
  };

  useEffect(() => {
    fetchCalendarEvents();
  }, [currentMonth, currentYear, session]);

  useEffect(() => {
    fetchUpcomingEvents();
  }, [session]);

  const prevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  // Build calendar grid
  const calendarGrid = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);
    const startDow = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const cells: Array<{ date: number | null; dateStr: string; events: SchoolEvent[]; isToday: boolean; isHoliday: boolean }> = [];

    // Empty cells for days before the 1st
    for (let i = 0; i < startDow; i++) {
      cells.push({ date: null, dateStr: '', events: [], isToday: false, isHoliday: false });
    }

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayEvents = events.filter(ev => {
        const start = ev.startDate.slice(0, 10);
        const end = ev.endDate.slice(0, 10);
        return dateStr >= start && dateStr <= end;
      });
      const isToday = today.getFullYear() === currentYear && today.getMonth() + 1 === currentMonth && today.getDate() === d;
      const isHoliday = dayEvents.some(ev => ev.isHoliday);
      cells.push({ date: d, dateStr, events: dayEvents, isToday, isHoliday });
    }

    return cells;
  }, [currentYear, currentMonth, events, today]);

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return events.filter(ev => {
      const start = ev.startDate.slice(0, 10);
      const end = ev.endDate.slice(0, 10);
      return selectedDate >= start && selectedDate <= end;
    });
  }, [selectedDate, events]);

  const handleDayClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setDayDialogOpen(true);
  };

  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case 'HOLIDAY': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'EXAM': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'MEETING': return 'bg-teal-100 text-teal-700 border-teal-200';
      case 'CULTURAL': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'SPORTS': return 'bg-green-100 text-green-700 border-green-200';
      case 'PTM': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Legend
  const legend = useMemo(() => {
    const typesInMonth = new Set(events.map(ev => ev.eventType));
    return Array.from(typesInMonth);
  }, [events]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Calendar Grid Section */}
      <div className="lg:col-span-8 space-y-6 bg-card border border-border/50 p-6 rounded-2xl shadow-sm">
        {/* Calendar Header */}
        <div className="flex items-center justify-between pb-2 border-b border-border/40">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={prevMonth} className="rounded-xl h-9 w-9 border-border/80 hover:bg-muted/40 transition">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-bold tracking-tight text-foreground min-w-[160px] text-center select-none">
              {MONTH_NAMES[currentMonth - 1]} {currentYear}
            </h2>
            <Button variant="outline" size="icon" onClick={nextMonth} className="rounded-xl h-9 w-9 border-border/80 hover:bg-muted/40 transition">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setCurrentMonth(today.getMonth() + 1); setCurrentYear(today.getFullYear()); }}
            className="rounded-xl text-xs px-4 border-border/80 hover:bg-muted/40 transition"
          >
            Today
          </Button>
        </div>

        {/* Legend */}
        {legend.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 py-1">
            {legend.map(type => (
              <div key={type} className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/20 px-2.5 py-1 rounded-lg border border-border/30">
                <div className={`h-2.5 w-2.5 rounded-full ${EVENT_DOT_COLORS[type] || EVENT_DOT_COLORS.OTHER}`} />
                <span className="font-bold tracking-wide uppercase text-[9px]">{type}</span>
              </div>
            ))}
          </div>
        )}

        {/* Calendar Grid Body */}
        {loading ? (
          <div className="h-[480px] bg-muted/20 animate-pulse rounded-xl" />
        ) : (
          <div className="border border-border/40 rounded-xl overflow-hidden shadow-inner bg-background/50">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-border/40 bg-muted/30">
              {DAY_NAMES.map(d => (
                <div key={d} className="py-3 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground border-r border-border/20 last:border-r-0">
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">
              {calendarGrid.map((cell, idx) => (
                <div
                  key={idx}
                  onClick={() => cell.date && cell.dateStr && handleDayClick(cell.dateStr)}
                  className={`min-h-[95px] p-2.5 border-r border-b border-border/20 last:border-r-0 transition-all ${
                    cell.date
                      ? `cursor-pointer hover:bg-primary/[0.02] hover:shadow-inner ${cell.isHoliday ? 'bg-rose-50/20' : ''} ${cell.isToday ? 'bg-primary/[0.04] ring-1 ring-primary/20 ring-inset' : ''}`
                      : 'bg-muted/5 opacity-40 select-none pointer-events-none'
                  }`}
                >
                  {cell.date && (
                    <>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className={`text-xs font-bold ${
                          cell.isToday ? 'h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center' : cell.isHoliday ? 'text-rose-600' : 'text-foreground'
                        }`}>
                          {cell.date}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {cell.events.slice(0, 2).map(ev => (
                          <div
                            key={ev.id}
                            className={`text-[8.5px] font-bold px-2 py-0.5 rounded-md truncate border ${
                              ev.isHoliday ? 'bg-rose-100/40 text-rose-700 border-rose-200' : 'bg-primary/5 text-primary border-primary/10'
                            }`}
                          >
                            {ev.title}
                          </div>
                        ))}
                        {cell.events.length > 2 && (
                          <div className="text-[8px] text-muted-foreground font-black px-1.5 uppercase tracking-wide">
                            +{cell.events.length - 2} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Upcoming Events Column */}
      <div className="lg:col-span-4 space-y-6 bg-card border border-border/50 p-6 rounded-2xl shadow-sm">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-foreground">Upcoming Events</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Scheduled for the next 7 days</p>
        </div>

        {loadingUpcoming ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted/20 animate-pulse rounded-xl border" />
            ))}
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground border border-dashed border-border/80 rounded-xl bg-muted/5">
            <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">No events next 7 days</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 no-scrollbar">
            {upcomingEvents.map((ev) => {
              const start = ev.startDate.slice(0, 10);
              const end = ev.endDate.slice(0, 10);
              return (
                <div
                  key={ev.id}
                  onClick={() => handleDayClick(start)}
                  className="p-3.5 rounded-xl border border-border/60 bg-muted/5 hover:bg-muted/10 hover:border-border transition-all cursor-pointer space-y-2 group shadow-sm hover:shadow"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge className={`text-[9px] rounded-lg border uppercase tracking-wider font-black px-2 ${getEventBadgeColor(ev.eventType)}`}>
                      {ev.eventType}
                    </Badge>
                    {ev.isHoliday && <Badge className="text-[8px] rounded-lg bg-rose-50 text-rose-600 border border-rose-100 uppercase tracking-widest font-black">Holiday</Badge>}
                  </div>
                  <h4 className="font-bold text-xs text-foreground group-hover:text-primary transition line-clamp-1">{ev.title}</h4>
                  <div className="flex items-center justify-between text-[9px] text-muted-foreground font-semibold">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3 text-muted-foreground/75" />
                      {new Date(start + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      {start !== end && ` - ${new Date(end + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                    </span>
                    {!ev.isFullDay && ev.startTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground/75" />
                        {ev.startTime}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Day Detail Dialog */}
      <Dialog open={dayDialogOpen} onOpenChange={setDayDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedDate && new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
              })}
            </DialogTitle>
          </DialogHeader>
          {selectedDateEvents.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No events on this day
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {selectedDateEvents.map(ev => (
                <div key={ev.id} className={`p-4 rounded-xl border border-border/60 space-y-2 ${ev.isHoliday ? 'bg-rose-50/50 border-rose-200' : 'bg-card shadow-sm'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <Badge className={`text-[9px] uppercase tracking-wider font-bold rounded-lg border-0 ${
                      ev.isHoliday ? 'bg-rose-100 text-rose-700' : 'bg-primary/10 text-primary'
                    }`}>
                      {ev.eventType}
                    </Badge>
                    {ev.isHoliday && <Star className="h-3.5 w-3.5 text-rose-500 fill-current" />}
                    {ev.isFullDay && <Badge variant="outline" className="text-[9px] rounded-lg">Full Day</Badge>}
                  </div>
                  <h4 className="font-bold text-sm text-foreground">{ev.title}</h4>
                  {ev.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed">{ev.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-1.5 border-t border-border/40 mt-1 flex-wrap">
                    {!ev.isFullDay && ev.startTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground/75" />
                        {ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ''}
                      </span>
                    )}
                    {ev.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground/75" />
                        {ev.location}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end pt-2">
            <Button onClick={() => setDayDialogOpen(false)} className="rounded-xl px-5" size="sm">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
