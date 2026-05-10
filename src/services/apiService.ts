/**
 * API Service for local server deployment
 */

export const apiFetch = async (endpoint: string, options: any = {}) => {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// History API
export const fetchUserHistory = async (userId: string) => {
  const data = await apiFetch(`/api/history?userId=${userId}`);
  return data.map((item: any) => ({
    ...item,
    createdAt: item.createdAt ? { 
      toDate: () => new Date(item.createdAt),
      toMillis: () => item.createdAt
    } : null
  }));
};

export const saveCalculationToLocal = async (userId: string, payload: any) => {
  return apiFetch("/api/history", {
    method: "POST",
    body: JSON.stringify({ userId, payload }),
  });
};

export const deleteCalculationFromLocal = async (id: string) => {
  return apiFetch(`/api/history/${id}`, {
    method: "DELETE",
  });
};

export const clearUserHistoryFromLocal = async (userId: string) => {
  return apiFetch("/api/history", {
    method: "DELETE",
    body: JSON.stringify({ userId }),
  });
};

// Settings API
export const fetchSettings = async (key: string) => {
  return apiFetch(`/api/settings/${key}`);
};

export const saveSettingsToLocal = async (key: string, value: any) => {
  return apiFetch(`/api/settings/${key}`, {
    method: "POST",
    body: JSON.stringify(value),
  });
};

// Auth API
export const loginToLocal = async (credentials: any) => {
  return apiFetch("/api/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
};

export const updateAuth = async (data: any) => {
  return apiFetch("/api/update-auth", {
    method: "POST",
    body: JSON.stringify(data),
  });
};
