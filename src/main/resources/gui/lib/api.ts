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
  getAll:      () => api.get('/garments'),
  shopAll:     () => api.get('/garments'),
  getFeatured: () => api.get('/garments/featured'),  // { mens:[], womens:[], kids:[] }
  getById:     (id: number) => api.get(`/garments/${id}`),
};

// ── Cart ─────────────────────────────────────────────────────
export const cartApi = {
  getMine: () => api.get('/user/cart'),
  add: (garmentId: number, size: string, quantity = 1) =>
    api.post('/user/cart', { garmentId, size, quantity }),
  updateQty: (cartItemId: number, quantity: number) =>
    api.patch(`/user/cart/${cartItemId}?quantity=${quantity}`),
  remove: (cartItemId: number) =>
    api.delete(`/user/cart/${cartItemId}`),
};

// ── Checkout ──────────────────────────────────────────────────
export const checkoutApi = {
  place: (payload: {
    shippingName: string;
    shippingAddress: string;
    shippingCity: string;
    shippingPincode: string;
    shippingPhone: string;
    paymentMethod: string;
    paymentRef?: string;
  }) => api.post('/user/checkout', payload),
};

// ── Orders ────────────────────────────────────────────────────
export const orderApi = {
  getMine: () => api.get('/user/orders'),
  getById: (id: number) => api.get(`/user/orders/${id}`),
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
  getAll:    () => api.get('/admin/categories'),          // admin/tech: all categories
  getActive: () => api.get('/categories'),                // authenticated users: active only
  setActive: (id: number, active: boolean) =>
    api.patch(`/admin/categories/${id}/active?active=${active}`),
  rename: (id: number, name: string) =>
    api.patch(`/admin/categories/${id}/rename`, { name }),
  delete: (id: number) => api.delete(`/admin/categories/${id}`),
  create: (payload: { name: string; parentId?: number | null }) =>
    api.post('/admin/categories', payload),
};

// Public categories — no auth required (used in guest navbar)
export const publicCategoryApi = {
  getActive: () => axios.get('/api/categories'),
};

// ── Payment (Razorpay) ───────────────────────────────────────
export const paymentApi = {
  // Step 1: create a Razorpay order on the backend
  createOrder: (amountInPaise: number) =>
    api.post('/user/payment/create-order', { amountInPaise }),
  // Step 2: verify signature + place order + trigger Shiprocket
  verify: (payload: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    shippingName: string;
    shippingAddress: string;
    shippingCity: string;
    shippingPincode: string;
    shippingPhone: string;
  }) => api.post('/user/payment/verify', payload),
};

// ── Image Upload (AWS S3) ─────────────────────────────────────
export const imageApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/admin/images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ── Analytics ─────────────────────────────────────────────────
export const analyticsApi = {
  getSummary: () => api.get('/admin/analytics/summary'),
};

// ── Garment Admin ─────────────────────────────────────────────
export const garmentAdminApi = {
  getAll: () => api.get('/admin/garments'),
  create: (payload: object) => api.post('/admin/garments', payload),
  bulkCreate: (requests: object[]) => api.post('/admin/garments/bulk', requests),
  update: (id: number, payload: object) => api.put(`/admin/garments/${id}`, payload),
  setActive: (id: number, active: boolean) =>
    api.patch(`/admin/garments/${id}/active?active=${active}`),
  setFeatured: (id: number, featured: boolean) =>
    api.patch(`/admin/garments/${id}/featured?featured=${featured}`),
  delete: (id: number) => api.delete(`/admin/garments/${id}`),
};
