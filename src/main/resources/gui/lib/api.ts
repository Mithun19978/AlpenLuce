import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach Bearer token on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('alpenluce-auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const token = parsed?.state?.tokens?.accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        // ignore parse errors
      }
    }
  }
  return config;
});

// Auto-refresh on 401
let refreshing = false;
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry && !refreshing) {
      original._retry = true;
      refreshing = true;
      try {
        const stored = localStorage.getItem('alpenluce-auth');
        const parsed = stored ? JSON.parse(stored) : null;
        const refreshToken = parsed?.state?.tokens?.refreshToken;
        if (refreshToken) {
          const res = await axios.post('/api/auth/refresh', { refreshToken });
          const newAccess: string = res.data.accessToken;
          // Patch stored tokens
          if (parsed?.state?.tokens) {
            parsed.state.tokens.accessToken = newAccess;
            localStorage.setItem('alpenluce-auth', JSON.stringify(parsed));
          }
          original.headers.Authorization = `Bearer ${newAccess}`;
          return api(original);
        }
      } catch {
        // Refresh failed — redirect to login
        if (typeof window !== 'undefined') window.location.href = '/auth/login';
      } finally {
        refreshing = false;
      }
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ────────────────────────────────────────────────────
export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  logout: (refreshToken?: string) =>
    api.post('/auth/logout', { refreshToken }),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
};

// ── Users ───────────────────────────────────────────────────
export const userApi = {
  register: (data: {
    username: string;
    email: string;
    mobileNumber: string;
    password: string;
    gender: number;
  }) => api.post('/user/register', data),
  getAll: () => api.get('/user/getUserAll'),
  changeRole: (userId: number, role: number) =>
    api.put(`/admin/users/${userId}/role`, { role }),
};

// ── Garments ─────────────────────────────────────────────────
export const garmentApi = {
  getAll: () => api.get('/garments'),
  shopAll: () => api.get('/garments'),
  getById: (id: number) => api.get(`/garments/${id}`),
};

// ── Customizations ───────────────────────────────────────────
export const customizationApi = {
  create: (data: {
    garmentId: number;
    notes: string;
    layers: object[];
  }) => api.post('/user/customizations', data),
  getMine: () => api.get('/user/customizations'),
  getPending: () => api.get('/technical/customizations/pending'),
  approve: (id: number, priceInCents: number, notes: string) =>
    api.post(`/technical/customizations/${id}/approve`, { approvedPrice: priceInCents, notes }),
  reject: (id: number, notes: string) =>
    api.post(`/technical/customizations/${id}/reject`, { notes }),
};

// ── Cart ─────────────────────────────────────────────────────
export const cartApi = {
  getMine: () => api.get('/user/cart'),
  add: (customizationId: number) =>
    api.post('/user/cart', { customizationId }),
  remove: (cartItemId: number) =>
    api.delete(`/user/cart/${cartItemId}`),
};

// ── Tickets ──────────────────────────────────────────────────
export const ticketApi = {
  getMine: () => api.get('/user/tickets'),
  getAll: () => api.get('/support/tickets'),
  getEscalated: () => api.get('/admin/tickets'),
  create: (data: { orderId: number; issueType: string; description: string }) =>
    api.post('/user/tickets', data),
  resolve: (id: number, resolution: string) =>
    api.post(`/support/tickets/${id}/resolve`, { resolution }),
  escalate: (id: number) =>
    api.post(`/support/tickets/${id}/escalate`),
  decide: (id: number, decision: 'APPROVE' | 'REJECT', resolution: string) =>
    api.post(`/admin/tickets/${id}/decide`, { decision, resolution }),
};

// ── Activity Logs ────────────────────────────────────────────
export const logApi = {
  getAll: () => api.get('/admin/activity-logs'),
};

// ── Categories ───────────────────────────────────────────────
export const categoryApi = {
  getAll: () => api.get('/admin/categories'),
  setActive: (id: number, active: boolean) =>
    api.patch(`/admin/categories/${id}/active?active=${active}`),
};

// ── Garment Admin ─────────────────────────────────────────────
export const garmentAdminApi = {
  getAll: () => api.get('/admin/garments'),
  create: (payload: object) => api.post('/admin/garments', payload),
  update: (id: number, payload: object) => api.put(`/admin/garments/${id}`, payload),
  setActive: (id: number, active: boolean) =>
    api.patch(`/admin/garments/${id}/active?active=${active}`),
  setFeatured: (id: number, featured: boolean) =>
    api.patch(`/admin/garments/${id}/featured?featured=${featured}`),
  delete: (id: number) => api.delete(`/admin/garments/${id}`),
};
