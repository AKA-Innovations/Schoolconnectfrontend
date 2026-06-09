export type EventTypeEnum = 'HOLIDAY' | 'EXAM' | 'MEETING' | 'CULTURAL' | 'SPORTS' | 'PTM' | 'OTHER' | string;
export type EventAudience = 'ALL' | 'TEACHERS' | 'STUDENTS' | 'PARENTS' | 'SPECIFIC_CLASS';

export interface EventTargetClass {
  id?: number;
  classId: number;
  className?: string;
  sectionId?: number | null;
  sectionName?: string | null;
}

export interface SchoolEvent {
  id: number;
  schoolId: string;
  session: string;
  title: string;
  description: string | null;
  eventType: EventTypeEnum;
  startDate: string;
  endDate: string;
  startTime: string | null;
  endTime: string | null;
  isFullDay: boolean;
  isHoliday: boolean;
  targetAudience: EventAudience;
  targetedClasses?: EventTargetClass[];
  location: string | null;
  createdBy: string;
  createdByFullName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventPayload {
  session: string;
  title: string;
  description?: string;
  eventType: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  isFullDay?: boolean;
  isHoliday?: boolean;
  targetAudience: EventAudience;
  targetClasses?: Array<{ classId: number; sectionId?: number }>;
  location?: string;
}

export interface UpdateEventPayload extends Partial<CreateEventPayload> {}

export interface ListEventParams {
  session?: string;
  eventType?: string;
  startDate?: string;
  endDate?: string;
  isHoliday?: boolean;
  month?: number;
  year?: number;
  targetAudience?: string;
}

export interface EventType {
  id: number;
  name: string;
  isActive: boolean;
  schoolId: string;
  session?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEventTypePayload {
  session: string;
  name: string;
}

export interface UpdateEventTypePayload {
  name?: string;
  isActive?: boolean;
}

export interface CalendarDay {
  date: string;
  events: SchoolEvent[];
  isHoliday: boolean;
}
