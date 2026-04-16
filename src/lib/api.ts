export interface AuthResponse {
  token: string;
  user: { id: number; email: string };
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function getToken(): string | null {
  return localStorage.getItem('authToken');
}

const API_BASE = import.meta.env.VITE_API_URL ?? '';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  path = `${API_BASE}${path}`;
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(path, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, body.error || res.statusText || 'Request failed');
  }
  return res.json();
}

export function signUp(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function signIn(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function getMe(): Promise<{ user: { id: number; email: string } }> {
  return request('/api/auth/me');
}

export function saveScore(score: number, result: 'win' | 'tie' | 'loss'): Promise<{ id: number }> {
  return request('/api/scores', {
    method: 'POST',
    body: JSON.stringify({ score, result }),
  });
}
