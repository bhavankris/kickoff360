import { request } from 'undici';

/**
 * Thin API-Sports client. Every endpoint wraps its payload in
 * `{ response: T }`; errors arrive as a non-empty `errors` object.
 * Clients NEVER call this — only scheduled functions do.
 */

const BASE = 'https://v3.football.api-sports.io';

export async function apiSports<T>(
  apiKey: string,
  path: string,
  params: Record<string, string | number> = {},
): Promise<T> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) qs.set(k, String(v));
  const url = `${BASE}${path}${qs.size ? `?${qs}` : ''}`;

  const res = await request(url, { headers: { 'x-apisports-key': apiKey } });
  if (res.statusCode !== 200) {
    throw new Error(`apiSports ${path}: HTTP ${res.statusCode}`);
  }
  const body = (await res.body.json()) as { response: T; errors?: unknown };
  const errs = body.errors;
  if (errs && (Array.isArray(errs) ? errs.length > 0 : Object.keys(errs).length > 0)) {
    throw new Error(`apiSports ${path}: ${JSON.stringify(errs)}`);
  }
  return body.response;
}
