const apiUrl = import.meta.env.VITE_API_URL ?? '';

export async function apiRequest(path, { token, ...options } = {}) {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      ...(!isFormData && options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || 'Request failed. Please try again.');
    error.fields = payload.fields || {};
    error.status = response.status;
    throw error;
  }

  return payload;
}
