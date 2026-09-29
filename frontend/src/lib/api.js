const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

let refreshInFlight = null;

async function rawRequest(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
    body:
      options.body && typeof options.body !== "string"
        ? JSON.stringify(options.body)
        : options.body,
  });

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  return { res, data };
}

async function tryRefresh() {
  if (!refreshInFlight) {
    refreshInFlight = rawRequest("/api/auth/refresh", { method: "POST" })
      .then(({ res }) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

export async function apiRequest(path, options = {}, retry = true) {
  const { res, data } = await rawRequest(path, options);

  if (res.status === 401 && retry && path !== "/api/auth/login" && path !== "/api/auth/refresh") {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return apiRequest(path, options, false);
    }
  }

  if (!res.ok) {
    const err = new Error(
      (data && data.error && data.error.message) || `HTTP ${res.status}`,
    );
    err.status = res.status;
    err.code = data && data.error && data.error.code;
    err.details = data && data.error && data.error.details;
    throw err;
  }

  return data;
}

export const api = {
  get: (path) => apiRequest(path, { method: "GET" }),
  post: (path, body) => apiRequest(path, { method: "POST", body }),
  put: (path, body) => apiRequest(path, { method: "PUT", body }),
  del: (path) => apiRequest(path, { method: "DELETE" }),
};
