import { z } from 'zod';

const baseURL = import.meta.env.VITE_API_URL || '/api';
let accessToken: string | null = null;
let refreshAttempted = false;

type ApiError =
  | { kind: 'http'; status: number; code: string; message: string; details?: unknown }
  | { kind: 'network'; message: string; cause?: unknown }
  | { kind: 'validation'; message: string; issues: z.ZodIssue[] };

export type { ApiError };
export type ToastPayload = { message: string; tone: 'info' | 'error' };

function notifyError(error: ApiError): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent<ToastPayload>('apik:toast', { detail: { message: error.message, tone: 'error' } }));
}
function endpoint(path: string): string { return `${baseURL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`; }
export function setAccessToken(token: string | null): void { accessToken = token; }
export function getAccessToken(): string | null { return accessToken; }

async function refresh(): Promise<boolean> {
  if (refreshAttempted) return false;
  refreshAttempted = true;
  try {
    const response = await fetch(endpoint('/auth/refresh'), { method: 'POST', credentials: 'include' });
    if (!response.ok) return false;
    const payload = await response.json() as { accessToken?: string };
    if (!payload.accessToken) return false;
    setAccessToken(payload.accessToken);
    return true;
  } catch { return false; }
}

export async function restoreSession(): Promise<boolean> { refreshAttempted = false; return refresh(); }

export async function fetchJson<T>(path: string, options: RequestInit = {}, schema?: z.ZodType<T>): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  try {
    let response = await fetch(endpoint(path), { ...options, headers, credentials: 'include' });
    if (response.status === 401 && !path.includes('/auth/refresh') && await refresh()) {
      headers.set('Authorization', `Bearer ${accessToken}`);
      response = await fetch(endpoint(path), { ...options, headers, credentials: 'include' });
    }
    if (!response.ok) {
      const body = await response.json().catch(() => ({})) as { code?: string; message?: string; details?: unknown };
      const error: ApiError = { kind: 'http', status: response.status, code: body.code ?? 'HTTP_ERROR', message: body.message ?? 'Une erreur est survenue.', details: body.details };
      notifyError(error);
      throw error;
    }
    if (response.status === 204) return undefined as T;
    const payload: unknown = await response.json();
    if (!schema) return payload as T;
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      const error: ApiError = { kind: 'validation', message: 'La réponse reçue est invalide.', issues: parsed.error.issues };
      notifyError(error);
      throw error;
    }
    return parsed.data;
  } catch (cause) {
    if ((cause as ApiError).kind) throw cause;
    const error: ApiError = { kind: 'network', message: 'Le service est momentanément indisponible.', cause };
    notifyError(error);
    throw error;
  }
}

export const api = { get: <T>(path: string, schema?: z.ZodType<T>) => fetchJson<T>(path, {}, schema), post: <T>(path: string, body: unknown, schema?: z.ZodType<T>) => fetchJson<T>(path, { method: 'POST', body: JSON.stringify(body) }, schema), put: <T>(path: string, body: unknown, schema?: z.ZodType<T>) => fetchJson<T>(path, { method: 'PUT', body: JSON.stringify(body) }, schema), delete: <T>(path: string, schema?: z.ZodType<T>) => fetchJson<T>(path, { method: 'DELETE' }, schema) };
