import { useQuery } from '@tanstack/react-query';
import { eventService } from './service';
import { eventTypeService } from '../event-type/service';
import type { ListEventParams } from './types';

export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (params?: ListEventParams) => [...eventKeys.lists(), { params }] as const,
  detail: (id: number) => [...eventKeys.all, 'detail', id] as const,
  calendar: (params?: ListEventParams) => [...eventKeys.all, 'calendar', { params }] as const,
  upcoming: (session: string) => [...eventKeys.all, 'upcoming', session] as const,
  holidays: (session: string) => [...eventKeys.all, 'holidays', session] as const,

  types: ['event-types'] as const,
  typeList: (session?: string) => [...eventKeys.types, 'list', { session }] as const,
  typeDetail: (id: number) => [...eventKeys.types, 'detail', id] as const,
};

// Events Queries
export const useEvents = (params?: ListEventParams) => {
  return useQuery({
    queryKey: eventKeys.list(params),
    queryFn: () => eventService.listEvents(params),
    enabled: params?.session !== undefined ? !!params.session : true,
  });
};

export const useEventDetails = (id: number) => {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => eventService.getEventDetails(id),
    enabled: !!id,
  });
};

export const useEventCalendar = (params?: ListEventParams) => {
  return useQuery({
    queryKey: eventKeys.calendar(params),
    queryFn: () => eventService.getCalendar(params),
    enabled: params?.session !== undefined ? !!params.session : true,
  });
};

export const useUpcomingEvents = (session: string) => {
  return useQuery({
    queryKey: eventKeys.upcoming(session),
    queryFn: () => eventService.getUpcoming(session),
    enabled: !!session,
  });
};

export const useHolidays = (session: string) => {
  return useQuery({
    queryKey: eventKeys.holidays(session),
    queryFn: () => eventService.getHolidays(session),
    enabled: !!session,
  });
};

// Event Types Queries
export const useEventTypes = (session?: string) => {
  return useQuery({
    queryKey: eventKeys.typeList(session),
    queryFn: () => eventTypeService.listEventTypes(session),
    enabled: session !== undefined ? !!session : true,
  });
};

export const useEventTypeDetails = (id: number) => {
  return useQuery({
    queryKey: eventKeys.typeDetail(id),
    queryFn: () => eventTypeService.getEventType(id),
    enabled: !!id,
  });
};
