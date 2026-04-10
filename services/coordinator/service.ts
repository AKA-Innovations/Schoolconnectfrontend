import api from '../../lib/api';
import { mockCoordinatorSummary } from '../../lib/mockData';
import { API_ENDPOINTS } from '../config';
import type { CoordinatorSummary } from './types';

const DEV_MODE = true;

export const coordinatorService = {
  getSummary: async (): Promise<CoordinatorSummary> => {
    if (DEV_MODE) {
      return new Promise((resolve) => setTimeout(() => resolve(mockCoordinatorSummary), 800));
    }
    const response = await api.get(API_ENDPOINTS.COORDINATOR.DASHBOARD_SUMMARY);
    return response.data;
  },
};
