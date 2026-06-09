export type AnnouncementPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type AnnouncementAudience = 'ALL' | 'TEACHERS' | 'STUDENTS' | 'PARENTS' | 'SPECIFIC_CLASS';

export interface AnnouncementAttachment {
  id: number;
  fileName: string;
  documentUrl: string;
}

export interface Announcement {
  id: number;
  schoolId: string;
  session: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  targetAudience: AnnouncementAudience;
  targetClassId: number | null;
  targetSectionId: number | null;
  targetedClasses?: Array<{ classId: number; className?: string; sectionId?: number | null; sectionName?: string | null }>;
  publishAt: string | null;
  expiresAt: string | null;
  isPublished: boolean;
  isPinned: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  AnnouncementAttachment: AnnouncementAttachment[];
  createdByFullName: string;
  createdByProfileImage: string | null;
  targetClassName: string | null;
  targetSectionName: string | null;
}

export interface CreateAnnouncementPayload {
  session: string;
  title: string;
  content: string;
  priority?: AnnouncementPriority;
  targetAudience?: AnnouncementAudience;
  targetClassId?: number;
  targetSectionId?: number;
  targetClasses?: Array<{ classId: number; sectionId?: number }>;
  publishAt?: string;
  expiresAt?: string;
  isPinned?: boolean;
  isPublished?: boolean;
}

export interface UpdateAnnouncementPayload extends Partial<CreateAnnouncementPayload> {}

export interface ListAnnouncementParams {
  session?: string;
  priority?: AnnouncementPriority;
  targetAudience?: AnnouncementAudience;
  isPublished?: boolean;
  page?: number;
  limit?: number;
}

export interface ReadReceipt {
  userId: string;
  userName: string;
  userImage: string | null;
  readAt: string;
}

export interface AnnouncementListResponse {
  data: Announcement[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
