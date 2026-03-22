import api from '../lib/api';
import { CoordinatorSummary } from '../types/roles';
import { mockCoordinatorSummary } from '../lib/mockData';

const DEV_MODE = true;

export const coordinatorService = {
  getSummary: async (): Promise<CoordinatorSummary> => {
    if (DEV_MODE) {
      return new Promise((resolve) => setTimeout(() => resolve(mockCoordinatorSummary), 800));
    }
    const response = await api.get('/coordinator/dashboard-summary');
    return response.data;
  }
};
