import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
});

export const businessAPI = {
  onboard: (data: any) => API.post('/api/business/onboard', data),
  get: (id: string) => API.get(`/api/business/${id}`),
  update: (id: string, data: any) => API.put(`/api/business/${id}`, data),
  getAnalysis: (id: string) => API.get(`/api/business/${id}/analysis`),
  getGrowthDNA: (id: string) => API.get(`/api/business/${id}/growth-dna`),
  list: () => API.get('/api/business'),
};

export const kpiAPI = {
  update: (data: any) => API.post('/api/kpi/update', data),
  getHistory: (businessId: string) => API.get(`/api/kpi/history/${businessId}`),
  getDashboard: (businessId: string) => API.get(`/api/kpi/dashboard/${businessId}`),
};

export const strategyAPI = {
  generate: (businessId: string) => API.post('/api/strategy/generate', { businessId }),
  whatif: (businessId: string, changes: any) => API.post('/api/strategy/whatif', { businessId, changes }),
};

export const copilotAPI = {
  chat: (businessId: string, message: string) => API.post('/api/copilot/chat', { businessId, message }),
  getMorningBrief: (businessId: string) => API.get(`/api/copilot/morning-brief/${businessId}`),
};

export const contentAPI = {
  generateCampaign: (businessId: string, type: string) => API.post('/api/content/campaign', { businessId, type }),
  getOpportunityRadar: (businessId: string) => API.post('/api/content/opportunity-radar', { businessId }),
};

export const boardroomAPI = {
  getSessions: (businessId: string) => API.get(`/api/boardroom/sessions/${businessId}`),
};

export default API;
