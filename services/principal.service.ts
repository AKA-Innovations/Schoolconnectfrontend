import api from '../lib/api';
import { PrincipalSummary } from '../types/roles';
import { mockPrincipalSummary } from '../lib/mockData';

const DEV_MODE = true;

export const principalService = {
  getSummary: async (): Promise<PrincipalSummary> => {
    if (DEV_MODE) {
      return new Promise((resolve) => setTimeout(() => resolve(mockPrincipalSummary), 800));
    }
    const response = await api.get('/principal/dashboard-summary');
    return response.data;
  }
};
