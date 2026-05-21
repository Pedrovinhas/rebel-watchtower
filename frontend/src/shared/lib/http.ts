import type { ApiError } from '../types/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export async function http<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });

  if (!res.ok) {
    let apiError: ApiError;
    try {
      apiError = (await res.json()) as ApiError;
    } catch {
      apiError = { error: 'network_error', message: res.statusText };
    }
    throw new HttpError(res.status, apiError.error, apiError.message);
  }

  return res.json() as Promise<T>;
}
