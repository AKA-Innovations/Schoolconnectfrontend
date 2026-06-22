import api from '../../lib/api';
import { API_ENDPOINTS } from '../config';
import type {
  SchoolEvent,
  CreateEventPayload,
  UpdateEventPayload,
  ListEventParams,
} from './types';

export const eventService = {
  createEvent: async (data: CreateEventPayload): Promise<SchoolEvent> => {
    const response = await api.post(API_ENDPOINTS.EVENT.BASE, data);
    return response.data;
  },

  listEvents: async (params?: ListEventParams): Promise<SchoolEvent[]> => {
    const response = await api.get(API_ENDPOINTS.EVENT.BASE, { params });
    return response.data;
  },

  getEventDetails: async (id: number): Promise<SchoolEvent> => {
    const response = await api.get(API_ENDPOINTS.EVENT.BY_ID(id));
    return response.data;
  },

  updateEvent: async (id: number, data: UpdateEventPayload): Promise<SchoolEvent> => {
    const response = await api.put(API_ENDPOINTS.EVENT.BY_ID(id), data);
    return response.data;
  },

  deleteEvent: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.EVENT.BY_ID(id));
  },

  getCalendar: async (params?: ListEventParams): Promise<any> => {
    const response = await api.get(API_ENDPOINTS.EVENT.CALENDAR, { params });
    return response.data;
  },

  getUpcoming: async (session: string): Promise<SchoolEvent[]> => {
    const response = await api.get(API_ENDPOINTS.EVENT.UPCOMING, { params: { session } });
    return response.data;
  },

  getHolidays: async (session: string): Promise<SchoolEvent[]> => {
    const response = await api.get(API_ENDPOINTS.EVENT.HOLIDAYS, { params: { session } });
    return response.data;
  },
};
