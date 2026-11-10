import { apiRequest } from './api.js';

export function listBugs(token, status) {
  const query = status === 'all' ? '' : `?status=${encodeURIComponent(status)}`;
  return apiRequest(`/api/bugs${query}`, { token });
}

export function getBug(token, bugId) {
  return apiRequest(`/api/bugs/${bugId}`, { token });
}

export function saveBug(token, bugId, payload) {
  const isEditing = Boolean(bugId);
  return apiRequest(isEditing ? `/api/bugs/${bugId}` : '/api/bugs', {
    method: isEditing ? 'PUT' : 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export function removeBug(token, bugId) {
  return apiRequest(`/api/bugs/${bugId}`, { method: 'DELETE', token });
}

export async function uploadImage(token, file) {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (!validTypes.includes(file.type)) {
    throw new Error('Choose a JPG, PNG, or WebP image.');
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image must be no larger than 5 MB.');
  }

  const signed = await apiRequest('/api/bugs/upload-url', {
    method: 'POST',
    token,
    body: JSON.stringify({ contentType: file.type, size: file.size }),
  });

  const form = new FormData();
  Object.entries(signed.fields).forEach(([key, value]) => form.append(key, value));
  form.append('file', file);

  const response = await fetch(signed.url, { method: 'POST', body: form });
  if (!response.ok) {
    throw new Error('The image could not be uploaded. Check your connection and try again.');
  }

  return signed.imageKey;
}
