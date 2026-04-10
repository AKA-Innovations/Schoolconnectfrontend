import api from '../../lib/api';
import { mockPrincipalSummary } from '../../lib/mockData';
import { API_ENDPOINTS } from '../config';
import type { PrincipalSummary } from './types';

const DEV_MODE = true;

export const principalService = {
  getSummary: async (): Promise<PrincipalSummary> => {
    if (DEV_MODE) {
      return new Promise((resolve) => setTimeout(() => resolve(mockPrincipalSummary), 800));
    }
    const response = await api.get(API_ENDPOINTS.PRINCIPAL.DASHBOARD_SUMMARY);
    return response.data;
  },
};
