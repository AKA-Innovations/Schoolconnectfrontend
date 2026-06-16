'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useTeacherRoles } from '@/lib/permissions';
import { CURRENT_SESSION } from '@/lib/constants';
import { announcementService } from '@/services/announcement/service';
import type { Announcement, AnnouncementAttachment, ReadReceipt } from '@/services/announcement/types';
import { 
  useAnnouncements, 
  useAnnouncementDetails, 
  useAnnouncementReadReceipts 
} from '@/services/announcement/queries';
import { 
  useCreateAnnouncement, 
  useUpdateAnnouncement, 
  useDeleteAnnouncement, 
  useTogglePinAnnouncement,
  useUploadAnnouncementAttachment,
  useDeleteAnnouncementAttachment
} from '@/services/announcement/mutations';
import { classService } from '@/services/class/service';
import { teacherService } from '@/services/teacher/service';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Megaphone, Plus, Search, Filter, Pin, Trash2, Edit, 
  Eye, FileText, CheckCircle2, Circle, Clock, Users, X, 
  Upload, Download, UserCheck, EyeOff, BookOpen, AlertCircle, RotateCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  role: 'school_admin' | 'principal' | 'teacher' | 'student' | 'subject_coordinator';
}

export function AnnouncementsManager({ role: userRole }: Props) {
  const user = useAuthStore((s) => s.user);
  const teacherRoles = useTeacherRoles();

  // Determine actual role capability
  const isCreatorRole = useMemo(() => {
    return userRole === 'school_admin' || 
           userRole === 'principal' || 
           userRole === 'teacher' || 
           teacherRoles.isPrincipal || 
           teacherRoles.isCoordinator;
  }, [userRole, teacherRoles]);

  // List State
  const [session, setSession] = useState(CURRENT_SESSION);
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [audienceFilter, setAudienceFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [readStatusFilter, setReadStatusFilter] = useState<'ALL' | 'READ' | 'UNREAD'>('ALL');
  const [page, setPage] = useState(1);

  const queryParams = useMemo(() => {
    const p: any = {
      session,
      page,
      limit: 10,
    };
    if (priorityFilter !== 'ALL') p.priority = priorityFilter;
    if (audienceFilter !== 'ALL') p.targetAudience = audienceFilter;
    return p;
  }, [session, priorityFilter, audienceFilter, page]);

  const { data: queryData, isLoading: loading, error: queryError, refetch: fetchAnnouncements } = useAnnouncements(queryParams);

  const announcements = queryData?.data || [];
  const totalPages = queryData?.meta?.pages || 1;
  const error = queryError ? ((queryError as any).response?.data?.message || (queryError as any).message || 'Failed to load announcements') : null;

  // React Query Mutations
  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();
  const togglePinMutation = useTogglePinAnnouncement();
  const uploadAttachmentMutation = useUploadAnnouncementAttachment();

  // Form / Modal States
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [receiptsOpen, setReceiptsOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [readReceipts, setReadReceipts] = useState<ReadReceipt[]>([]);
  const [receiptsLoading, setReceiptsLoading] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [targetAudience, setTargetAudience] = useState<'ALL' | 'TEACHERS' | 'STUDENTS' | 'PARENTS' | 'SPECIFIC_CLASS'>(
    userRole === 'teacher' && !teacherRoles.isPrincipal ? 'SPECIFIC_CLASS' : 'ALL'
  );
  const [targetClassId, setTargetClassId] = useState<string>('');
  const [targetSectionId, setTargetSectionId] = useState<string>('');
  const [selectedTargetClasses, setSelectedTargetClasses] = useState<Array<{ classId: number; sectionId?: number }>>([]);
  const [publishAt, setPublishAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [isPinned, setIsPinned] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Dropdown Options
  const [classSectionOptions, setClassSectionOptions] = useState<any[]>([]);
  const [teacherDetailClasses, setTeacherDetailClasses] = useState<any[]>([]);

  const schoolId = useAuthStore((s) => s.schoolId);

  // Load dropdown options for target audience selection
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
            m.className === ms.className &&
            m.sectionName === ms.sectionName
          );

          return {
            id: matchingMapped?.id || ms.id,
            masterSectionId: ms.id,
            mappingId: matchingMapped?.id,
            classId: ms.classId,
            className: ms.className,
            sectionName: ms.sectionName,
            classTeacherId: matchingMapped?.classTeacherId || null,
            maxLimit: matchingMapped?.maxLimit || null,
            schoolId: ms.schoolId || activeSchoolId,
            session: matchingMapped?.session || CURRENT_SESSION,
            isMapped: !!matchingMapped
          };
        });

        // Add any mapped sections that might be missing from master list
        mapped.forEach((m: any) => {
          if (!merged.some((mer: any) => mer.className === m.className && mer.sectionName === m.sectionName)) {
            merged.push({
              ...m,
              masterSectionId: m.classSectionsId || m.masterSectionId,
              isMapped: true
            });
          }
        });

        setClassSectionOptions(merged);

        if ((userRole === 'teacher' || userRole === 'subject_coordinator') && user?.id) {
          const subjectMappings = await classService.getSubjectDetails({ teacherId: user.id });
          setTeacherDetailClasses(subjectMappings);
        }
      } catch (err: any) {
        toast.error('Failed to load class selection options');
        console.error('Failed to load class options:', err);
      }
    };

    loadOptions();
  }, [isCreatorRole, userRole, user?.id, schoolId]);

  // Filtered Options for dropdowns based on role
  const filteredClassSections = useMemo(() => {
    // Admin and principal can target any class
    if (userRole === 'school_admin' || userRole === 'principal' || teacherRoles.isPrincipal) {
      return classSectionOptions;
    }

    const allowed: any[] = [];

    // 1. Class teacher class
    if (user?.classTeacherClass) {
      const ct = user.classTeacherClass;
      const matched = classSectionOptions.find(
        cs => String(cs.className) === String(ct.className) && String(cs.sectionName) === String(ct.sectionName)
      );
      if (matched) {
        allowed.push(matched);
      }
    }

    // 2. Coordinator classes
    if (user?.coordinatorClasses) {
      user.coordinatorClasses.forEach(cc => {
        const matched = classSectionOptions.filter(
          cs => String(cs.className) === String(cc.className)
        );
        matched.forEach(m => {
          if (!allowed.some(a => a.id === m.id)) {
            allowed.push(m);
          }
        });
      });
    }

    // 3. Subject teacher classes she teaches
    teacherDetailClasses.forEach(tc => {
      const matched = classSectionOptions.find(
        cs => cs.id === tc.classDtlsId || cs.id === tc.classSectionId || (String(cs.className) === String(tc.className) && String(cs.sectionName) === String(tc.sectionName))
      );
      if (matched && !allowed.some(a => a.id === matched.id)) {
        allowed.push(matched);
      }
    });

    return allowed;
  }, [classSectionOptions, teacherDetailClasses, userRole, teacherRoles, user]);

  const groupedClassSections = useMemo(() => {
    const groups: { [key: string]: typeof filteredClassSections } = {};
    filteredClassSections.forEach(cs => {
      const key = cs.className;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(cs);
    });
    return groups;
  }, [filteredClassSections]);

  // Search and local filters
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(ann => {
      const matchesSearch = 
        ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ann.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ann.createdByFullName || '').toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [announcements, searchTerm]);

  // Handle viewing detail
  const handleViewDetails = async (ann: Announcement) => {
    setSelectedAnnouncement(ann);
    setViewOpen(true);
    
    // Save to local read list
    try {
      const readIdsRaw = localStorage.getItem('read-announcements');
      const readIds = readIdsRaw ? JSON.parse(readIdsRaw) : [];
      if (!readIds.includes(ann.id)) {
        readIds.push(ann.id);
        localStorage.setItem('read-announcements', JSON.stringify(readIds));
        window.dispatchEvent(new Event('announcement-read'));
      }
    } catch (e) {
      console.error('Failed to write read announcement to storage:', e);
    }
    
    // Mark as read on backend (triggered by simply fetching details)
    try {
      await announcementService.getAnnouncementDetails(ann.id);
      fetchAnnouncements();
    } catch (err) {
      console.error('Failed to mark read receipt:', err);
    }
  };

  // Toggle Pin
  const handleTogglePin = async (e: React.MouseEvent, ann: Announcement) => {
    e.stopPropagation();
    try {
      const nextPin = !ann.isPinned;
      await togglePinMutation.mutateAsync({ id: ann.id, isPinned: nextPin });
      toast.success(nextPin ? 'Announcement pinned' : 'Announcement unpinned');
      fetchAnnouncements();
    } catch (err) {
      toast.error('Failed to update pin status');
    }
  };

  // Delete Announcement
  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Announcement deleted successfully');
      fetchAnnouncements();
    } catch (err) {
      toast.error('Failed to delete announcement');
    }
  };

  // Read Receipts View
  const handleViewReceipts = async (e: React.MouseEvent, ann: Announcement) => {
    e.stopPropagation();
    setSelectedAnnouncement(ann);
    setReceiptsOpen(true);
    setReceiptsLoading(true);
    try {
      const data = await announcementService.getReadReceipts(ann.id);
      setReadReceipts(data);
    } catch (err) {
      toast.error('Failed to load read receipts');
    } finally {
      setReceiptsLoading(false);
    }
  };

  // Form submit (create / edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        session,
        title,
        content,
        priority,
        targetAudience,
        isPublished,
        isPinned,
      };

      if (publishAt) payload.publishAt = new Date(publishAt).toISOString();
      if (expiresAt) payload.expiresAt = new Date(expiresAt).toISOString();

      if (targetAudience === 'SPECIFIC_CLASS') {
        if (selectedTargetClasses.length === 0) {
          toast.error('Please select at least one target class/section');
          setSubmitting(false);
          return;
        }
        payload.targetClasses = selectedTargetClasses;
      }

      let savedAnnouncement: Announcement;
      if (isEditMode && selectedAnnouncement) {
        savedAnnouncement = await updateMutation.mutateAsync({ id: selectedAnnouncement.id, data: payload });
        toast.success('Announcement updated successfully');
      } else {
        savedAnnouncement = await createMutation.mutateAsync(payload);
        toast.success('Announcement created successfully');
      }

      // Upload Attachments if selected
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          await uploadAttachmentMutation.mutateAsync({ id: savedAnnouncement.id, file });
        }
        toast.success('Attachments uploaded successfully');
      }

      setFormOpen(false);
      resetForm();
      fetchAnnouncements();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (e: React.MouseEvent, ann: Announcement) => {
    e.stopPropagation();
    setSelectedAnnouncement(ann);
    setIsEditMode(true);
    setTitle(ann.title);
    setContent(ann.content);
    setPriority(ann.priority);
    setTargetAudience(ann.targetAudience);
    
    // Find class section ID matching classId and sectionId
    if (ann.targetedClasses && Array.isArray(ann.targetedClasses) && ann.targetedClasses.length > 0) {
      setSelectedTargetClasses(ann.targetedClasses.map((tc: any) => ({
        classId: Number(tc.classId),
        sectionId: tc.sectionId ? Number(tc.sectionId) : undefined
      })));
    } else if (ann.targetClassId) {
      setSelectedTargetClasses([{
        classId: Number(ann.targetClassId),
        sectionId: ann.targetSectionId ? Number(ann.targetSectionId) : undefined
      }]);
    } else {
      setSelectedTargetClasses([]);
    }
    
    setPublishAt(ann.publishAt ? new Date(ann.publishAt).toISOString().slice(0, 16) : '');
    setExpiresAt(ann.expiresAt ? new Date(ann.expiresAt).toISOString().slice(0, 16) : '');
    setIsPublished(ann.isPublished);
    setIsPinned(ann.isPinned);
    setFormOpen(true);
  };

  const resetForm = () => {
    setIsEditMode(false);
    setSelectedAnnouncement(null);
    setTitle('');
    setContent('');
    setPriority('NORMAL');
    setTargetAudience(userRole === 'teacher' && !teacherRoles.isPrincipal ? 'SPECIFIC_CLASS' : 'ALL');
    setTargetClassId('');
    setTargetSectionId('');
    setSelectedTargetClasses([]);
    setPublishAt('');
    setExpiresAt('');
    setIsPublished(true);
    setIsPinned(false);
    setSelectedFiles([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Megaphone className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Announcements</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              View and manage notices and communications for the school community.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => fetchAnnouncements()} 
            disabled={loading} 
            className="rounded-xl border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            title="Refresh Notice Board"
          >
            <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin text-primary' : ''}`} />
          </Button>
          {isCreatorRole && (
            <Button onClick={() => { resetForm(); setFormOpen(true); }} className="rounded-xl flex items-center gap-2">
              <Plus className="h-4 w-4" /> Create Notice
            </Button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-muted/20 p-4 rounded-2xl border border-border/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search notices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low Priority</option>
            <option value="NORMAL">Normal Priority</option>
            <option value="HIGH">High Priority</option>
            <option value="URGENT">Urgent Priority</option>
          </select>
        </div>

        <div>
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
        </div>

        <div>
          <select
            value={session}
            onChange={(e) => setSession(e.target.value)}
            className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="2026-27">Session 2026-27</option>
            <option value="2025-26">Session 2025-26</option>
          </select>
        </div>
      </div>

      {/* Main List */}
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
              <h3 className="text-lg font-bold text-foreground">Server Connection Error</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                {error}. Please check your connection or try again.
              </p>
            </div>
            <Button onClick={() => fetchAnnouncements()} className="rounded-xl flex items-center gap-2">
              <RotateCw className="h-4 w-4" /> Retry Loading
            </Button>
          </CardContent>
        </Card>
      ) : filteredAnnouncements.length === 0 ? (
        <Card className="border border-dashed border-border/80">
          <CardContent className="p-16 text-center">
            <Megaphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
            <h3 className="text-lg font-bold text-foreground">No Announcements Found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              There are no notices published matching your filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((ann) => {
            const isOwner = ann.createdBy === user?.id || userRole === 'school_admin';
            return (
              <motion.div
                key={ann.id}
                layoutId={`ann-${ann.id}`}
                onClick={() => handleViewDetails(ann)}
                className={`relative flex flex-col md:flex-row justify-between p-4 sm:p-6 bg-card border rounded-2xl cursor-pointer hover:shadow-md transition group overflow-hidden ${
                  ann.isPinned ? 'border-primary/40 bg-primary/5' : 'border-border/60'
                }`}
              >
                {/* Priority Glow Sidebar indicator */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  ann.priority === 'URGENT' ? 'bg-rose-500' :
                  ann.priority === 'HIGH' ? 'bg-amber-500' :
                  ann.priority === 'NORMAL' ? 'bg-blue-500' : 'bg-slate-400'
                }`} />

                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {ann.isPinned && (
                      <Badge className="rounded-lg bg-primary/10 text-primary border-0 text-xs flex items-center gap-1">
                        <Pin className="h-3 w-3 fill-current" /> Pinned
                      </Badge>
                    )}
                    <Badge variant="outline" className={`rounded-lg text-[11px] uppercase tracking-wider font-semibold ${
                      ann.priority === 'URGENT' ? 'border-rose-200 text-rose-700 bg-rose-50/50' :
                      ann.priority === 'HIGH' ? 'border-amber-200 text-amber-700 bg-amber-50/50' :
                      'border-border/60'
                    }`}>
                      {ann.priority} Priority
                    </Badge>
                    <Badge variant="secondary" className="rounded-lg text-[10px]">
                      Audience: {ann.targetAudience === 'SPECIFIC_CLASS' ? (
                        ann.targetedClasses && ann.targetedClasses.length > 0 ? (
                          `Classes: ${ann.targetedClasses.map((tc: any) => {
                            const className = tc.className || tc.class?.className || tc.class?.name || `Class ${tc.classId}`;
                            const sectionName = tc.sectionName || tc.section?.sectionName || tc.section?.name;
                            return sectionName ? `${className}-${sectionName}` : className;
                          }).join(', ')}`
                        ) : (
                          `Class ${ann.targetClassName || ''}-${ann.targetSectionName || ''}`
                        )
                      ) : ann.targetAudience}
                    </Badge>
                  </div>

                  <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition">
                    {ann.title}
                  </h3>

                  <p className="text-sm text-muted-foreground line-clamp-2 pr-6">
                    {ann.content}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> 
                      Published: {ann.publishAt ? new Date(ann.publishAt).toLocaleDateString() : new Date(ann.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      By: {ann.createdByFullName || 'Staff'}
                    </span>
                    {ann.AnnouncementAttachment?.length > 0 && (
                      <span className="flex items-center gap-1 text-primary">
                        <FileText className="h-3 w-3" />
                        {ann.AnnouncementAttachment.length} Attachments
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick actions for creator/admin */}
                {isCreatorRole && (
                  <div className="flex items-center gap-2 mt-4 md:mt-0 self-end md:self-center" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" onClick={(e) => handleTogglePin(e, ann)} className="text-muted-foreground hover:text-primary rounded-xl">
                      <Pin className={`h-4 w-4 ${ann.isPinned ? 'fill-current text-primary' : ''}`} />
                    </Button>
                    {isOwner && (
                      <>
                        <Button variant="ghost" size="icon" onClick={(e) => handleEditClick(e, ann)} className="text-muted-foreground hover:text-amber-600 rounded-xl">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={(e) => handleDelete(e, ann.id)} className="text-muted-foreground hover:text-rose-600 rounded-xl">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {ann.createdBy === user?.id && (
                      <Button variant="outline" size="sm" onClick={(e) => handleViewReceipts(e, ann)} className="rounded-xl text-xs flex items-center gap-1">
                        <UserCheck className="h-3.5 w-3.5" /> Readers
                      </Button>
                    )}
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
          {selectedAnnouncement && (
            <div className="space-y-6">
              <div className="flex items-start justify-between border-b pb-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="rounded-lg">{selectedAnnouncement.priority}</Badge>
                    <Badge variant="secondary" className="rounded-lg">
                      Audience: {selectedAnnouncement.targetAudience === 'SPECIFIC_CLASS' ? (
                        selectedAnnouncement.targetedClasses && selectedAnnouncement.targetedClasses.length > 0 ? (
                          `Classes: ${selectedAnnouncement.targetedClasses.map((tc: any) => {
                            const className = tc.className || tc.class?.className || tc.class?.name || tc.classId;
                            const sectionName = tc.sectionName || tc.section?.sectionName || tc.section?.name;
                            return sectionName ? `${className}-${sectionName}` : className;
                          }).join(', ')}`
                        ) : (
                          `Class ${selectedAnnouncement.targetClassName || ''}-${selectedAnnouncement.targetSectionName || ''}`
                        )
                      ) : selectedAnnouncement.targetAudience}
                    </Badge>
                  </div>
                  <h2 className="text-2xl font-bold">{selectedAnnouncement.title}</h2>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>By {selectedAnnouncement.createdByFullName}</span>
                    <span>•</span>
                    <span>Published {new Date(selectedAnnouncement.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed min-h-[120px] bg-muted/10 p-4 rounded-xl border">
                {selectedAnnouncement.content}
              </div>

              {/* Attachments Section */}
              {selectedAnnouncement.AnnouncementAttachment?.length > 0 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Attachments</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedAnnouncement.AnnouncementAttachment.map(att => (
                        <a 
                          key={att.id} 
                          href={att.documentUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center justify-between p-3 bg-muted/40 hover:bg-muted/70 border rounded-xl text-xs transition group"
                        >
                          <span className="flex items-center gap-2 truncate">
                            <FileText className="h-4 w-4 text-primary shrink-0" />
                            <span className="truncate font-semibold">{att.fileName}</span>
                          </span>
                          <Download className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition" />
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Previews Section */}
                  {selectedAnnouncement.AnnouncementAttachment.some(att => {
                    const name = att.fileName.toLowerCase();
                    return name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.gif') || name.endsWith('.webp') || name.endsWith('.pdf');
                  }) && (
                    <div className="space-y-3 border-t pt-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">File Preview</h4>
                      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                        {selectedAnnouncement.AnnouncementAttachment.map(att => {
                          const lowerName = att.fileName.toLowerCase();
                          const isImage = lowerName.endsWith('.png') || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg') || lowerName.endsWith('.gif') || lowerName.endsWith('.webp');
                          const isPDF = lowerName.endsWith('.pdf');
                          
                          if (isImage) {
                            return (
                              <div key={att.id} className="space-y-1">
                                <p className="text-[10px] text-muted-foreground font-semibold truncate">{att.fileName}</p>
                                <img src={att.documentUrl} alt={att.fileName} className="max-w-full h-auto rounded-xl border object-contain max-h-[200px] bg-muted/20" />
                              </div>
                            );
                          }
                          
                          if (isPDF) {
                            return (
                              <div key={att.id} className="space-y-1 h-[220px]">
                                <p className="text-[10px] text-muted-foreground font-semibold truncate">{att.fileName}</p>
                                <iframe src={`${att.documentUrl}#toolbar=0`} className="w-full h-full rounded-xl border bg-white" />
                              </div>
                            );
                          }
                          
                          return null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button onClick={() => setViewOpen(false)} className="rounded-xl">Close Notice</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create / Edit Form Modal */}
      <Dialog open={formOpen} onOpenChange={(o) => { if (!o) resetForm(); setFormOpen(o); }}>
        <DialogContent className="max-w-2xl rounded-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Announcement' : 'Create New Announcement'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">Title</label>
              <input
                type="text"
                placeholder="Enter title (e.g. School Reopening Schedule)"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">Content Details</label>
              <textarea
                placeholder="Describe the announcement details..."
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full min-h-[120px] p-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Priority</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as any)}
                  className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm"
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Target Audience</label>
                {userRole === 'teacher' && !teacherRoles.isPrincipal ? (
                  <select
                    value={targetAudience}
                    onChange={e => setTargetAudience(e.target.value as any)}
                    className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm"
                  >
                    <option value="SPECIFIC_CLASS">Specific Class</option>
                  </select>
                ) : (
                  <select
                    value={targetAudience}
                    onChange={e => setTargetAudience(e.target.value as any)}
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

            {/* Target Class Section Selectors */}
            {targetAudience === 'SPECIFIC_CLASS' && (
              <div className="space-y-3 bg-muted/20 p-4 rounded-xl border border-border/60">
                <label className="text-xs font-bold text-muted-foreground block">Target Classes & Sections</label>
                <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
                  {Object.entries(groupedClassSections).map(([className, sections]) => {
                    const classId = sections[0]?.classId;
                    if (!classId) return null;

                    // Check if all sections are selected or if the whole class is selected
                    const isWholeClassSelected = selectedTargetClasses.some(tc => tc.classId === classId && tc.sectionId === undefined);
                    const areAllSectionsSelected = sections.every(s => 
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
                          {sections.map(s => {
                            const isSectionSelected = selectedTargetClasses.some(
                              tc => tc.classId === classId && (tc.sectionId === s.masterSectionId || tc.sectionId === undefined)
                            );

                            const handleToggleSection = () => {
                              setSelectedTargetClasses(prev => {
                                const wholeClassSelected = prev.some(tc => tc.classId === classId && tc.sectionId === undefined);
                                if (wholeClassSelected) {
                                  const otherSections = sections
                                    .filter(sect => sect.masterSectionId !== s.masterSectionId)
                                    .map(sect => ({ classId, sectionId: sect.masterSectionId }));
                                  return [
                                    ...prev.filter(tc => tc.classId !== classId),
                                    ...otherSections
                                  ];
                                }

                                const exists = prev.some(tc => tc.classId === classId && tc.sectionId === s.masterSectionId);
                                if (exists) {
                                  return prev.filter(tc => !(tc.classId === classId && tc.sectionId === s.masterSectionId));
                                } else {
                                  const newSelection = [...prev, { classId, sectionId: s.masterSectionId }];
                                  const allSecsSelectedNow = sections.every(sect =>
                                    sect.masterSectionId === s.masterSectionId || 
                                    newSelection.some(tc => tc.classId === classId && tc.sectionId === sect.masterSectionId)
                                  );
                                  if (allSecsSelectedNow) {
                                    return [
                                      ...newSelection.filter(tc => tc.classId !== classId),
                                      { classId }
                                    ];
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Publish At (Optional)</label>
                <input
                  type="datetime-local"
                  value={publishAt}
                  onChange={e => setPublishAt(e.target.value)}
                  className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Expires At (Optional)</label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={e => setExpiresAt(e.target.value)}
                  className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={e => setIsPublished(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                Publish immediately
              </label>

              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={e => setIsPinned(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                Pin Notice to top
              </label>
            </div>

            {/* Document Attachments Dropzone */}
            <div className="space-y-2 border-t pt-4">
              <label className="text-xs font-bold text-muted-foreground">Add File Attachments</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border/80 hover:border-primary/50 rounded-xl cursor-pointer bg-muted/10 hover:bg-muted/30 transition">
                  <div className="flex flex-col items-center justify-center pt-3 pb-3">
                    <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                    <p className="text-[11px] text-muted-foreground">
                      <span className="font-semibold text-primary">Click to upload</span> files (PDF, images)
                    </p>
                  </div>
                  <input type="file" multiple className="hidden" onChange={handleFileChange} />
                </label>
              </div>

              {selectedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedFiles.map((file, i) => (
                    <Badge key={i} variant="secondary" className="rounded-lg text-xs flex items-center gap-1.5 py-1 px-2.5">
                      <FileText className="h-3 w-3" />
                      {file.name}
                      <button type="button" onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-rose-500">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)} disabled={submitting}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Read Receipts Modal */}
      <Dialog open={receiptsOpen} onOpenChange={setReceiptsOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Read Receipts</DialogTitle>
          </DialogHeader>

          {receiptsLoading ? (
            <div className="space-y-3 py-6 text-center text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2" />
              Loading readers list...
            </div>
          ) : readReceipts.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground space-y-2 bg-muted/10 rounded-xl border border-dashed border-border/80">
              <EyeOff className="h-8 w-8 mx-auto opacity-30 text-muted-foreground" />
              <p className="font-bold text-foreground">No readers yet</p>
              <p className="text-xs">No one has opened or read this notice yet.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              <p className="text-xs text-muted-foreground font-semibold">Total Reads: {readReceipts.length}</p>
              <div className="divide-y divide-border/60">
                {readReceipts.map((rec) => (
                  <div key={rec.userId} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      {rec.userImage ? (
                        <img src={rec.userImage} alt={rec.userName} className="h-8 w-8 rounded-full object-cover border" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {rec.userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-foreground">{rec.userName}</p>
                        <p className="text-[10px] text-muted-foreground">User ID: {rec.userId.slice(0, 8)}...</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(rec.readAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button onClick={() => setReceiptsOpen(false)} className="rounded-xl">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
