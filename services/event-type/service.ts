import api from '../../lib/api';
import { API_ENDPOINTS } from '../config';
import type {
  EventType,
  CreateEventTypePayload,
  UpdateEventTypePayload,
} from '../event/types';

export const eventTypeService = {
  createEventType: async (data: CreateEventTypePayload): Promise<EventType> => {
    const response = await api.post(API_ENDPOINTS.EVENT_TYPE.BASE, data);
    return response.data;
  },

  listEventTypes: async (session?: string): Promise<EventType[]> => {
    const response = await api.get(API_ENDPOINTS.EVENT_TYPE.BASE, {
      params: session ? { session } : undefined,
    });
    return response.data;
  },

  getEventType: async (id: number): Promise<EventType> => {
    const response = await api.get(API_ENDPOINTS.EVENT_TYPE.BY_ID(id));
    return response.data;
  },

  updateEventType: async (id: number, data: UpdateEventTypePayload): Promise<EventType> => {
    const response = await api.put(API_ENDPOINTS.EVENT_TYPE.BY_ID(id), data);
    return response.data;
  },

  deleteEventType: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.EVENT_TYPE.BY_ID(id));
  },
};
