import { api } from '../utils/api';

export const servicesAPI = {
  getAll: (params?: URLSearchParams) => 
    api.get(`/services${params ? `?${params}` : ''}`, false),
  
  getById: (id: string) => 
    api.get(`/services/${id}`, false),
  
  create: (data: any) => 
    api.post('/services', data),
};

export const bookingsAPI = {
  getAll: (params?: URLSearchParams) => 
    api.get(`/bookings${params ? `?${params}` : ''}`),
  
  getById: (id: string) => 
    api.get(`/bookings/${id}`),
  
  create: (data: any) => 
    api.post('/bookings', data),
  
  updateStatus: (id: string, status: string) => 
    api.put(`/bookings/${id}/status`, { status }),
  
  cancel: (id: string) => 
    api.put(`/bookings/${id}/cancel`, {}),
};

export const messagesAPI = {
  getConversation: (userId: string) => 
    api.get(`/messages/${userId}`),
  
  send: (receiver: string, content: string) => 
    api.post('/messages', { receiver, content }),
};
