import type { ApiErrorBody, CreateGrudgeInput, Grudge } from '@jigoku/shared';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: ApiErrorBody | null,
  ) {
    super(`API request failed with status ${status}`);
  }
}

export function createGrudge(input: CreateGrudgeInput) {
  return request<Grudge>('/api/grudges', { method: 'POST', body: JSON.stringify(input) });
}

export function contractGrudge(id: string) {
  return request<Grudge>(`/api/grudges/${encodeURIComponent(id)}/contract`, { method: 'POST' });
}

export function abandonGrudge(id: string) {
  return request<Grudge>(`/api/grudges/${encodeURIComponent(id)}/abandon`, { method: 'POST' });
}

async function request<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    throw new ApiError(response.status, body);
  }
  return (await response.json()) as T;
}
