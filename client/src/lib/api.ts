export type ApiError = { code: string; message: string }

const API_BASE = (window.__APP_CONFIG__?.API_BASE || import.meta.env.VITE_API_BASE || 'http://localhost:4000') as string

function getCookie(name: string) {
  return document.cookie.split('; ').find((row) => row.startsWith(name + '='))?.split('=')[1];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const isMutation = (init?.method && init.method !== 'GET') ? true : false
  const csrf = isMutation ? getCookie('csrf') : undefined
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(csrf ? { 'x-csrf-token': csrf } : {}), ...(init?.headers || {}) },
    ...init,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw (data as ApiError)
  return data as T
}

export const api = {
  // auth
  me: () => request<{ user: { id: string; name: string; email: string; provider: string } | null }>(`/api/auth/me`),
  requestOtp: (body: { purpose: 'signup' | 'login'; name?: string; dob?: string; email: string }) =>
    request<{ ok: true; message: string }>(`/api/auth/request-otp`, { method: 'POST', body: JSON.stringify(body) }),
  verifyOtp: (body: { purpose: 'signup' | 'login'; name?: string; dob?: string; email: string; otp: string; remember?: boolean }) =>
    request<{ ok: true; user: { id: string; name: string; email: string; provider: string } }>(`/api/auth/verify-otp`, { method: 'POST', body: JSON.stringify(body) }),
  google: (idToken: string, remember?: boolean) =>
    request<{ ok: true; user: { id: string; name: string; email: string; provider: string } }>(`/api/auth/google`, { method: 'POST', body: JSON.stringify({ idToken, remember }) }),
  logout: () => request<{ ok: true }>(`/api/auth/logout`, { method: 'POST' }),

  // notes
  listNotes: () => request<{ ok: true; notes: { _id: string; content: string }[] }>(`/api/notes`),
  createNote: (content: string) => request<{ ok: true; note: { _id: string; content: string } }>(`/api/notes`, { method: 'POST', body: JSON.stringify({ content }) }),
  deleteNote: (id: string) => request<{ ok: true }>(`/api/notes/${id}`, { method: 'DELETE' }),
}
