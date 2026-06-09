'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useTeacherRoles } from '@/lib/permissions';
import { CURRENT_SESSION } from '@/lib/constants';
import { eventService } from '@/services/event/service';
import { eventTypeService } from '@/services/event-type/service';
import type { SchoolEvent, EventType, EventAudience } from '@/services/event/types';
import { classService } from '@/services/class/service';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  CalendarDays, Plus, Search, Trash2, Edit, Eye, Clock, Users, X,
  MapPin, AlertCircle, RotateCw, Tag, CheckCircle2, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  role: 'school_admin' | 'principal' | 'teacher' | 'student' | 'subject_coordinator';
}

const EVENT_TYPE_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  HOLIDAY: { border: 'border-l-rose-500', bg: 'bg-rose-50/50', text: 'text-rose-700' },
  EXAM: { border: 'border-l-amber-500', bg: 'bg-amber-50/50', text: 'text-amber-700' },
  SPORTS: { border: 'border-l-emerald-500', bg: 'bg-emerald-50/50', text: 'text-emerald-700' },
  CULTURAL: { border: 'border-l-purple-500', bg: 'bg-purple-50/50', text: 'text-purple-700' },
  PTM: { border: 'border-l-blue-500', bg: 'bg-blue-50/50', text: 'text-blue-700' },
  MEETING: { border: 'border-l-teal-500', bg: 'bg-teal-50/50', text: 'text-teal-700' },
  OTHER: { border: 'border-l-slate-400', bg: 'bg-slate-50/50', text: 'text-slate-600' },
};

function getEventColors(eventType: string) {
  return EVENT_TYPE_COLORS[eventType] || EVENT_TYPE_COLORS.OTHER;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function EventsManager({ role: userRole }: Props) {
  const user = useAuthStore((s) => s.user);
  const schoolId = useAuthStore((s) => s.schoolId);
  const teacherRoles = useTeacherRoles();

  const isCreatorRole = useMemo(() => {
    return userRole === 'school_admin' ||
      userRole === 'principal' ||
      userRole === 'teacher' ||
      teacherRoles.isPrincipal ||
      teacherRoles.isCoordinator;
  }, [userRole, teacherRoles]);

  // List State
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState(CURRENT_SESSION);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [audienceFilter, setAudienceFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Form / Modal States
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SchoolEvent | null>(null);

  // Event Types
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isFullDay, setIsFullDay] = useState(true);
  const [isHoliday, setIsHoliday] = useState(false);
  const [targetAudience, setTargetAudience] = useState<EventAudience>(
    userRole === 'teacher' && !teacherRoles.isPrincipal ? 'SPECIFIC_CLASS' : 'ALL'
  );
  const [selectedTargetClasses, setSelectedTargetClasses] = useState<Array<{ classId: number; sectionId?: number }>>([]);
  const [location, setLocation] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Dropdown Options
  const [classSectionOptions, setClassSectionOptions] = useState<any[]>([]);
  const [teacherDetailClasses, setTeacherDetailClasses] = useState<any[]>([]);

  // Fetch events
  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { session };
      if (typeFilter !== 'ALL') params.eventType = typeFilter;
      if (audienceFilter !== 'ALL') params.targetAudience = audienceFilter;
      const res = await eventService.listEvents(params);
      setEvents(Array.isArray(res) ? res : []);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load events';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [session, typeFilter, audienceFilter]);

  // Fetch event types
  useEffect(() => {
    const loadEventTypes = async () => {
      try {
        const types = await eventTypeService.listEventTypes(session);
        setEventTypes(Array.isArray(types) ? types : []);
      } catch (err) {
        console.error('Failed to load event types:', err);
      }
    };
    loadEventTypes();
  }, [session]);

  // Load class/section options for SPECIFIC_CLASS targeting
  useEffect(() => {
    if (!isCreatorRole) return;
    const loadOptions = async () => {
      try {
        const activeSchoolId = schoolId || user?.schoolId || '';
        if (!activeSchoolId) return;
        const [mSections, mapped] = await Promise.all([
          classService.getSchoolSections(activeSchoolId),
          classService.getClassSectionLists(activeSchoolId, CURRENT_SESSION)
        ]);
        const merged = mSections.map((ms: any) => {
          const matchingMapped = mapped.find((m: any) =>
            m.className === ms.className && m.sectionName === ms.sectionName
          );
          return {
            id: matchingMapped?.id || ms.id,
            masterSectionId: ms.id,
            mappingId: matchingMapped?.id,
            classId: ms.classId,
            className: ms.className,
            sectionName: ms.sectionName,
            schoolId: ms.schoolId || activeSchoolId,
            session: matchingMapped?.session || CURRENT_SESSION,
            isMapped: !!matchingMapped
          };
        });
        mapped.forEach((m: any) => {
          if (!merged.some((mer: any) => mer.className === m.className && mer.sectionName === m.sectionName)) {
            merged.push({ ...m, masterSectionId: m.classSectionsId || m.masterSectionId, isMapped: true });
          }
        });
        setClassSectionOptions(merged);
        if ((userRole === 'teacher' || userRole === 'subject_coordinator') && user?.id) {
          const subjectMappings = await classService.getSubjectDetails({ teacherId: user.id });
          setTeacherDetailClasses(subjectMappings);
        }
      } catch (err) {
        console.error('Failed to load class options:', err);
      }
    };
    loadOptions();
  }, [isCreatorRole, userRole, user?.id, schoolId]);

  // Filtered class sections based on role
  const filteredClassSections = useMemo(() => {
    if (userRole === 'school_admin' || userRole === 'principal' || teacherRoles.isPrincipal) {
      return classSectionOptions;
    }
    const allowed: any[] = [];
    if (user?.classTeacherClass) {
      const ct = user.classTeacherClass;
      const matched = classSectionOptions.find(
        cs => String(cs.className) === String(ct.className) && String(cs.sectionName) === String(ct.sectionName)
      );
      if (matched) allowed.push(matched);
    }
    if (user?.coordinatorClasses) {
      user.coordinatorClasses.forEach((cc: any) => {
        const matched = classSectionOptions.filter(cs => String(cs.className) === String(cc.className));
        matched.forEach((m: any) => {
          if (!allowed.some(a => a.id === m.id)) allowed.push(m);
        });
      });
    }
    teacherDetailClasses.forEach((tc: any) => {
      const matched = classSectionOptions.find(
        cs => cs.id === tc.classDtlsId || cs.id === tc.classSectionId ||
          (String(cs.className) === String(tc.className) && String(cs.sectionName) === String(tc.sectionName))
      );
      if (matched && !allowed.some(a => a.id === matched.id)) allowed.push(matched);
    });
    return allowed;
  }, [classSectionOptions, teacherDetailClasses, userRole, teacherRoles, user]);

  const groupedClassSections = useMemo(() => {
    const groups: { [key: string]: typeof filteredClassSections } = {};
    filteredClassSections.forEach(cs => {
      const key = cs.className;
      if (!groups[key]) groups[key] = [];
      groups[key].push(cs);
    });
    return groups;
  }, [filteredClassSections]);

  // Search filter
  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      const matchesSearch =
        ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ev.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ev.location || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [events, searchTerm]);

  // View details
  const handleViewDetails = (ev: SchoolEvent) => {
    setSelectedEvent(ev);
    setViewOpen(true);
  };

  // Delete
  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await eventService.deleteEvent(id);
      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (err) {
      toast.error('Failed to delete event');
    }
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventType || !startDate || !endDate) {
      toast.error('Title, event type, start date and end date are required');
      return;
    }
    setSubmitting(true);
    try {
      const canCreateHoliday = userRole === 'school_admin' || userRole === 'principal' || teacherRoles.isPrincipal;
      const payload: any = {
        session,
        title,
        description: description || undefined,
        eventType: (eventType === 'HOLIDAY' && !canCreateHoliday) ? 'OTHER' : eventType,
        startDate,
        endDate,
        isFullDay,
        isHoliday: canCreateHoliday ? isHoliday : false,
        targetAudience,
        location: location || undefined,
      };
      if (!isFullDay) {
        if (startTime) payload.startTime = startTime;
        if (endTime) payload.endTime = endTime;
      }
      if (targetAudience === 'SPECIFIC_CLASS') {
        if (selectedTargetClasses.length === 0) {
          toast.error('Please select at least one target class/section');
          setSubmitting(false);
          return;
        }
        payload.targetClasses = selectedTargetClasses;
      }

      if (isEditMode && selectedEvent) {
        await eventService.updateEvent(selectedEvent.id, payload);
        toast.success('Event updated successfully');
      } else {
        await eventService.createEvent(payload);
        toast.success('Event created successfully');
      }
      setFormOpen(false);
      resetForm();
      fetchEvents();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (e: React.MouseEvent, ev: SchoolEvent) => {
    e.stopPropagation();
    setSelectedEvent(ev);
    setIsEditMode(true);
    setTitle(ev.title);
    setDescription(ev.description || '');
    setEventType(ev.eventType);
    setStartDate(ev.startDate?.slice(0, 10) || '');
    setEndDate(ev.endDate?.slice(0, 10) || '');
    setStartTime(ev.startTime || '');
    setEndTime(ev.endTime || '');
    setIsFullDay(ev.isFullDay);
    setIsHoliday(ev.isHoliday);
    setTargetAudience(ev.targetAudience);
    setLocation(ev.location || '');
    if (ev.targetedClasses && ev.targetedClasses.length > 0) {
      setSelectedTargetClasses(ev.targetedClasses.map(tc => ({
        classId: Number(tc.classId),
        sectionId: tc.sectionId ? Number(tc.sectionId) : undefined
      })));
    } else {
      setSelectedTargetClasses([]);
    }
    setFormOpen(true);
  };

  const resetForm = () => {
    setIsEditMode(false);
    setSelectedEvent(null);
    setTitle('');
    setDescription('');
    setEventType('');
    setStartDate('');
    setEndDate('');
    setStartTime('');
    setEndTime('');
    setIsFullDay(true);
    setIsHoliday(false);
    setTargetAudience(userRole === 'teacher' && !teacherRoles.isPrincipal ? 'SPECIFIC_CLASS' : 'ALL');
    setSelectedTargetClasses([]);
    setLocation('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <CalendarDays className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Events</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              View and manage school events, calendars, and academic activities.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchEvents}
            disabled={loading}
            className="rounded-xl border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            title="Refresh Events"
          >
            <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin text-primary' : ''}`} />
          </Button>
          {isCreatorRole && (
            <Button onClick={() => { resetForm(); setFormOpen(true); }} className="rounded-xl flex items-center gap-2">
              <Plus className="h-4 w-4" /> Create Event
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-muted/20 p-4 rounded-2xl border border-border/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="ALL">All Event Types</option>
          {eventTypes.map(et => (
            <option key={et.id} value={et.name}>{et.name}</option>
          ))}
        </select>
        <select
          value={audienceFilter}
          onChange={(e) => setAudienceFilter(e.target.value)}
          className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="ALL">All Audiences</option>
          <option value="TEACHERS">Teachers Only</option>
          <option value="STUDENTS">Students Only</option>
          <option value="PARENTS">Parents Only</option>
          <option value="SPECIFIC_CLASS">Specific Class</option>
        </select>
        <select
          value={session}
          onChange={(e) => setSession(e.target.value)}
          className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="2026-27">Session 2026-27</option>
          <option value="2025-26">Session 2025-26</option>
        </select>
      </div>

      {/* Event List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <Card className="border border-destructive/20 bg-destructive/5 dark:bg-destructive/10">
          <CardContent className="p-16 text-center space-y-4 flex flex-col items-center justify-center">
            <AlertCircle className="h-12 w-12 text-destructive animate-bounce" />
            <div>
              <h3 className="text-lg font-bold text-foreground">Failed to Load Events</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">{error}</p>
            </div>
            <Button onClick={fetchEvents} className="rounded-xl flex items-center gap-2">
              <RotateCw className="h-4 w-4" /> Retry
            </Button>
          </CardContent>
        </Card>
      ) : filteredEvents.length === 0 ? (
        <Card className="border border-dashed border-border/80">
          <CardContent className="p-16 text-center">
            <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
            <h3 className="text-lg font-bold text-foreground">No Events Found</h3>
            <p className="text-sm text-muted-foreground mt-1">There are no events matching your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((ev) => {
            const isOwner = ev.createdBy === user?.id || userRole === 'school_admin';
            const colors = getEventColors(ev.eventType);
            return (
              <motion.div
                key={ev.id}
                layoutId={`event-${ev.id}`}
                onClick={() => handleViewDetails(ev)}
                className="relative flex flex-col md:flex-row justify-between p-4 sm:p-6 bg-card border border-border/60 rounded-2xl cursor-pointer hover:shadow-md transition group overflow-hidden"
              >
                {/* Colored Sidebar Indicator based on Event Type / Holiday */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  ev.isHoliday ? 'bg-rose-500' :
                  ev.eventType === 'EXAM' ? 'bg-amber-500' :
                  ev.eventType === 'MEETING' ? 'bg-teal-500' :
                  ev.eventType === 'SPORTS' ? 'bg-emerald-500' :
                  ev.eventType === 'CULTURAL' ? 'bg-purple-500' : 'bg-primary'
                }`} />

                <div className="flex-1 space-y-3 pl-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={`rounded-lg text-[11px] uppercase tracking-wider font-semibold border-0 ${colors.bg} ${colors.text}`}>
                      {ev.eventType}
                    </Badge>
                    {ev.isHoliday && (
                      <Badge className="rounded-lg bg-rose-100 text-rose-700 border-0 text-[11px] flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" /> Holiday
                      </Badge>
                    )}
                    {ev.isFullDay && (
                      <Badge variant="outline" className="rounded-lg text-[10px]">Full Day</Badge>
                    )}
                    <Badge variant="secondary" className="rounded-lg text-[10px]">
                      {ev.targetAudience === 'SPECIFIC_CLASS' ? (
                        ev.targetedClasses && ev.targetedClasses.length > 0 ? (
                          `Classes: ${ev.targetedClasses.map(tc => {
                            const cn = tc.className || `${tc.classId}`;
                            return tc.sectionName ? `${cn}-${tc.sectionName}` : cn;
                          }).join(', ')}`
                        ) : 'Specific Class'
                      ) : ev.targetAudience}
                    </Badge>
                  </div>

                  <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition">
                    {ev.title}
                  </h3>

                  {ev.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 pr-6">{ev.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 flex-wrap">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {formatDate(ev.startDate)}
                      {ev.startDate !== ev.endDate && ` — ${formatDate(ev.endDate)}`}
                    </span>
                    {!ev.isFullDay && ev.startTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ''}
                      </span>
                    )}
                    {ev.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {ev.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      By: {ev.createdByFullName || 'Staff'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {isCreatorRole && isOwner && (
                  <div className="flex items-center gap-2 mt-4 md:mt-0 self-end md:self-center" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" onClick={(e) => handleEditClick(e, ev)} className="text-muted-foreground hover:text-amber-600 rounded-xl">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={(e) => handleDelete(e, ev.id)} className="text-muted-foreground hover:text-rose-600 rounded-xl">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* View Detail Modal */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl rounded-2xl">
          {selectedEvent && (
            <div className="space-y-6">
              <div className="flex items-start justify-between border-b pb-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge className={`rounded-lg ${getEventColors(selectedEvent.eventType).bg} ${getEventColors(selectedEvent.eventType).text} border-0`}>
                      {selectedEvent.eventType}
                    </Badge>
                    {selectedEvent.isHoliday && (
                      <Badge className="rounded-lg bg-rose-100 text-rose-700 border-0">Holiday</Badge>
                    )}
                    <Badge variant="secondary" className="rounded-lg">
                      {selectedEvent.targetAudience === 'SPECIFIC_CLASS' ? (
                        selectedEvent.targetedClasses && selectedEvent.targetedClasses.length > 0 ? (
                          `Classes: ${selectedEvent.targetedClasses.map(tc => {
                            const cn = tc.className || `${tc.classId}`;
                            return tc.sectionName ? `${cn}-${tc.sectionName}` : cn;
                          }).join(', ')}`
                        ) : 'Specific Class'
                      ) : selectedEvent.targetAudience}
                    </Badge>
                  </div>
                  <h2 className="text-2xl font-bold">{selectedEvent.title}</h2>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {formatDate(selectedEvent.startDate)}
                      {selectedEvent.startDate !== selectedEvent.endDate && ` — ${formatDate(selectedEvent.endDate)}`}
                    </span>
                    {!selectedEvent.isFullDay && selectedEvent.startTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {selectedEvent.startTime}{selectedEvent.endTime ? ` – ${selectedEvent.endTime}` : ''}
                      </span>
                    )}
                    {selectedEvent.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {selectedEvent.location}
                      </span>
                    )}
                    <span>By {selectedEvent.createdByFullName || 'Staff'}</span>
                  </div>
                </div>
              </div>

              {selectedEvent.description && (
                <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed min-h-[80px] bg-muted/10 p-4 rounded-xl border">
                  {selectedEvent.description}
                </div>
              )}

              {selectedEvent.targetedClasses && selectedEvent.targetedClasses.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Target Classes</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.targetedClasses.map((tc, i) => (
                      <Badge key={i} variant="outline" className="rounded-lg text-xs">
                        Class {tc.className || tc.classId}{tc.sectionName ? ` - ${tc.sectionName}` : ' (All Sections)'}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button onClick={() => setViewOpen(false)} className="rounded-xl">Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create / Edit Form Modal */}
      <Dialog open={formOpen} onOpenChange={(o) => { if (!o) resetForm(); setFormOpen(o); }}>
        <DialogContent className="max-w-2xl rounded-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Event' : 'Create New Event'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">Title *</label>
              <input
                type="text"
                placeholder="Enter event title (e.g. Annual Sports Day)"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">Description</label>
              <textarea
                placeholder="Describe the event details..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full min-h-[80px] p-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Event Type *</label>
                <select
                  value={eventType}
                  onChange={e => setEventType(e.target.value)}
                  className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm"
                  required
                >
                  <option value="">— Select Type —</option>
                  {eventTypes.filter(et => {
                    if (et.name === 'HOLIDAY') {
                      return userRole === 'school_admin' || userRole === 'principal' || teacherRoles.isPrincipal;
                    }
                    return true;
                  }).map(et => (
                    <option key={et.id} value={et.name}>{et.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Target Audience *</label>
                {userRole === 'teacher' && !teacherRoles.isPrincipal ? (
                  <select
                    value={targetAudience}
                    onChange={e => setTargetAudience(e.target.value as EventAudience)}
                    className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm"
                  >
                    <option value="SPECIFIC_CLASS">Specific Class</option>
                  </select>
                ) : (
                  <select
                    value={targetAudience}
                    onChange={e => setTargetAudience(e.target.value as EventAudience)}
                    className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm"
                  >
                    <option value="ALL">All Users</option>
                    <option value="TEACHERS">Teachers</option>
                    <option value="STUDENTS">Students</option>
                    <option value="PARENTS">Parents</option>
                    <option value="SPECIFIC_CLASS">Specific Class</option>
                  </select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Start Date *</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">End Date *</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-6 pt-1">
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFullDay}
                  onChange={e => setIsFullDay(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                Full Day Event
              </label>
              {(userRole === 'school_admin' || userRole === 'principal' || teacherRoles.isPrincipal) && (
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isHoliday}
                    onChange={e => setIsHoliday(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  Mark as Holiday
                </label>
              )}
            </div>

            {!isFullDay && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Start Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 09:00 AM"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">End Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 04:00 PM"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">Location</label>
              <input
                type="text"
                placeholder="e.g. School Auditorium"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm"
              />
            </div>

            {/* Target Class Section Selectors */}
            {targetAudience === 'SPECIFIC_CLASS' && (
              <div className="space-y-3 bg-muted/20 p-4 rounded-xl border border-border/60">
                <label className="text-xs font-bold text-muted-foreground block">Target Classes & Sections</label>
                <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
                  {Object.entries(groupedClassSections).map(([className, sections]) => {
                    const classId = sections[0]?.classId;
                    if (!classId) return null;
                    const isWholeClassSelected = selectedTargetClasses.some(tc => tc.classId === classId && tc.sectionId === undefined);
                    const areAllSectionsSelected = sections.every((s: any) =>
                      selectedTargetClasses.some(tc => tc.classId === classId && tc.sectionId === s.masterSectionId)
                    );
                    const handleToggleWholeClass = () => {
                      if (isWholeClassSelected || areAllSectionsSelected) {
                        setSelectedTargetClasses(prev => prev.filter(tc => tc.classId !== classId));
                      } else {
                        setSelectedTargetClasses(prev => [
                          ...prev.filter(tc => tc.classId !== classId),
                          { classId }
                        ]);
                      }
                    };
                    return (
                      <div key={className} className="border-b border-border/40 pb-3 last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <label className="flex items-center gap-2 font-semibold text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isWholeClassSelected || areAllSectionsSelected}
                              onChange={handleToggleWholeClass}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            Class {className} (All Sections)
                          </label>
                        </div>
                        <div className="flex flex-wrap gap-2 pl-6">
                          {sections.map((s: any) => {
                            const isSectionSelected = selectedTargetClasses.some(
                              tc => tc.classId === classId && (tc.sectionId === s.masterSectionId || tc.sectionId === undefined)
                            );
                            const handleToggleSection = () => {
                              setSelectedTargetClasses(prev => {
                                const wholeClassSelected = prev.some(tc => tc.classId === classId && tc.sectionId === undefined);
                                if (wholeClassSelected) {
                                  const otherSections = sections
                                    .filter((sect: any) => sect.masterSectionId !== s.masterSectionId)
                                    .map((sect: any) => ({ classId, sectionId: sect.masterSectionId }));
                                  return [...prev.filter(tc => tc.classId !== classId), ...otherSections];
                                }
                                const exists = prev.some(tc => tc.classId === classId && tc.sectionId === s.masterSectionId);
                                if (exists) {
                                  return prev.filter(tc => !(tc.classId === classId && tc.sectionId === s.masterSectionId));
                                } else {
                                  const newSelection = [...prev, { classId, sectionId: s.masterSectionId }];
                                  const allSecsSelectedNow = sections.every((sect: any) =>
                                    sect.masterSectionId === s.masterSectionId ||
                                    newSelection.some(tc => tc.classId === classId && tc.sectionId === sect.masterSectionId)
                                  );
                                  if (allSecsSelectedNow) {
                                    return [...newSelection.filter(tc => tc.classId !== classId), { classId }];
                                  }
                                  return newSelection;
                                }
                              });
                            };
                            return (
                              <label
                                key={s.id}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                                  isSectionSelected
                                    ? 'bg-primary/10 border-primary text-primary font-medium'
                                    : 'bg-background hover:bg-muted/50 border-border/80 text-muted-foreground'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSectionSelected}
                                  onChange={handleToggleSection}
                                  className="sr-only"
                                />
                                {s.sectionName}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)} disabled={submitting}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
