/**
 * src/utils/api.js
 * Central API client. All requests go through here.
 * Automatically attaches JWT access token and handles 401 refresh.
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

//  Token helpers
export const getTokens = () => ({
  access: sessionStorage.getItem("bh_access"),
  refresh: sessionStorage.getItem("bh_refresh"),
});

export const setTokens = (access, refresh) => {
  sessionStorage.setItem("bh_access", access);
  sessionStorage.setItem("bh_refresh", refresh);
};

export const clearTokens = () => {
  sessionStorage.removeItem("bh_access");
  sessionStorage.removeItem("bh_refresh");
  sessionStorage.removeItem("brewhaven_user");
};

//  Core fetch wrapper
async function request(path, options = {}, retry = true) {
  const { access, refresh } = getTokens();
  const headers = {
    "Content-Type": "application/json",
    ...(access ? { Authorization: `Bearer ${access}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // 401 → try refresh once
  if (res.status === 401 && refresh && retry) {
    const refreshed = await fetch(`${BASE_URL}/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (refreshed.ok) {
      const data = await refreshed.json();
      setTokens(data.access, refresh);
      return request(path, options, false);
    } else {
      clearTokens();
      window.location.href = "/login";
      return;
    }
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    const message =
      data?.error ||
      data?.detail ||
      data?.non_field_errors?.[0] ||
      Object.values(data)?.[0]?.[0] ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

//  Convenience methods
export const api = {
  get: (path, opts) => request(path, { method: "GET", ...opts }),
  post: (path, body, opts) => request(path, { method: "POST", body, ...opts }),
  patch: (path, body, opts) =>
    request(path, { method: "PATCH", body, ...opts }),
  put: (path, body, opts) => request(path, { method: "PUT", body, ...opts }),
  delete: (path, opts) => request(path, { method: "DELETE", ...opts }),
};

//  Auth endpoints
export const authAPI = {
  register: (name, email, password, password2) =>
    api.post("/auth/register/", { name, email, password, password2 }),

  login: (email, password) => api.post("/auth/login/", { email, password }),

  logout: (refresh) => api.post("/auth/logout/", { refresh }),

  profile: () => api.get("/auth/profile/"),
};

//  Products endpoints
export const productsAPI = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/products/${qs ? "?" + qs : ""}`);
  },

  get: (id) => api.get(`/products/${id}/`),

  create: (data) => api.post("/products/", data),

  update: (id, data) => api.patch(`/products/${id}/`, data),

  delete: (id) => api.delete(`/products/${id}/`),

  toggle: (id) => api.patch(`/products/${id}/toggle/`),
};

//  Orders endpoints
export const ordersAPI = {
  place: (items, paymentMethod, notes = "", customerName = "") =>
    api.post("/orders/", {
      items,
      payment_method: paymentMethod,
      notes,
      ...(customerName ? { customer_name: customerName } : {}),
    }),

  myOrders: () => api.get("/orders/my/"),

  adminOrders: (status) => {
    const qs = status ? `?status=${status}` : "";
    return api.get(`/orders/admin/${qs}`);
  },

  detail: (id) => api.get(`/orders/${id}/`),

  updateStatus: (id, status) => api.patch(`/orders/${id}/status/`, { status }),
};

//  Reports endpoints
export const reportsAPI = {
  summary: () => api.get("/reports/summary/"),
  daily: (days = 7) => api.get(`/reports/daily/?days=${days}`),
  weekly: (weeks = 8) => api.get(`/reports/weekly/?weeks=${weeks}`),
  monthly: (months = 12) => api.get(`/reports/monthly/?months=${months}`),
  yearly: (years = 3) => api.get(`/reports/yearly/?years=${years}`),
  topProducts: (limit = 5, period = "monthly") =>
    api.get(`/reports/top-products/?limit=${limit}&period=${period}`),
};
