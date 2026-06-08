import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('refreshToken');
        if (!refresh) throw new Error('No refresh token');
        const { data } = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken: refresh });
        localStorage.setItem('accessToken', data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// Auth
export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  verifyEmail: (token: string) => api.get(`/auth/verify-email?token=${token}`),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
};

// Matching
export const matchingApi = {
  joinQueue: (data: any) => api.post('/matching/join-queue', data),
  leaveQueue: () => api.post('/matching/leave-queue'),
  queueStatus: () => api.get('/matching/queue-status'),
};

// Chat
export const chatApi = {
  sendMessage: (data: any) => api.post('/chat/send-message', data),
  accept: (sessionId: string) => api.post('/chat/accept', { sessionId }),
  getSession: (id: string) => api.get(`/chat/session/${id}`),
  history: () => api.get('/chat/history'),
};

// Inbox
export const inboxApi = {
  list: () => api.get('/inbox'),
  messages: (id: string, params?: any) => api.get(`/inbox/${id}/messages`, { params }),
  delete: (id: string) => api.delete(`/inbox/${id}`),
};

// Reports
export const reportApi = {
  report: (data: any) => api.post('/reports', data),
  block: (blockedId: string) => api.post('/reports/block', { blockedId }),
  unblock: (blockedId: string) => api.delete(`/reports/block/${blockedId}`),
};

// Calls
export const callsApi = {
  start: (data: any) => api.post('/calls/start', data),
  accept: (callId: string) => api.post(`/calls/accept/${callId}`),
  reject: (callId: string) => api.post(`/calls/reject/${callId}`),
  end: (callId: string) => api.post(`/calls/end/${callId}`),
};

// Users
export const usersApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.patch('/users/profile', data),
  updateProfileDetails: (data: any) => api.patch('/users/profile/details', data),
  updateSettings: (data: any) => api.patch('/users/settings', data),
  changePassword: (data: any) => api.patch('/users/password', data),
  deleteAccount: (password: string) => api.delete('/users/account', { data: { password } }),
};

// Notifications
export const notificationsApi = {
  list: () => api.get('/notifications'),
  readAll: () => api.patch('/notifications/read-all'),
};

// Admin
export const adminApi = {
  stats: () => api.get('/admin/stats'),
  users: (params?: any) => api.get('/admin/users', { params }),
  ban: (userId: string, reason: string) => api.post(`/admin/ban/${userId}`, { reason }),
  unban: (userId: string) => api.post(`/admin/unban/${userId}`),
  suspend: (userId: string, reason: string) => api.post(`/admin/suspend/${userId}`, { reason }),
  warn: (userId: string, data: any) => api.post(`/admin/warn/${userId}`, data),
  reports: (status?: string) => api.get('/admin/reports', { params: { status } }),
  resolveReport: (id: string, data: any) => api.patch(`/admin/reports/${id}/resolve`, data),
  getConfig: () => api.get('/admin/config'),
  updateConfig: (key: string, value: string) => api.put(`/admin/config/${key}`, { value }),
};
