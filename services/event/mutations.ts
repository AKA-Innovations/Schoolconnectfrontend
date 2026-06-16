import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from './service';
import { eventTypeService } from '../event-type/service';
import { eventKeys } from './queries';
import type { CreateEventPayload, UpdateEventPayload, CreateEventTypePayload, UpdateEventTypePayload } from './types';

// Events Mutations
export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventPayload) => eventService.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEventPayload }) =>
      eventService.updateEvent(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(variables.id) });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eventService.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
};

// Event Types Mutations
export const useCreateEventType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventTypePayload) => eventTypeService.createEventType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.types });
    },
  });
};

export const useUpdateEventType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEventTypePayload }) =>
      eventTypeService.updateEventType(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.types });
      queryClient.invalidateQueries({ queryKey: eventKeys.typeDetail(variables.id) });
    },
  });
};

export const useDeleteEventType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eventTypeService.deleteEventType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.types });
    },
  });
};
