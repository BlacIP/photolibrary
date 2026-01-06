// Determine API URL - use environment variable or detect production
export const getApiUrl = () => {
  // If explicitly set, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }

  // Default: same-origin API path, letting Next.js rewrites send it to the API project
  // (keeps cookies on the frontend domain in production).
  return '/api';
};

type RequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  credentials?: RequestCredentials;
};

export async function fetchApi<TResponse = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<TResponse> {
  const { method = 'GET', headers = {}, body, credentials = 'include' } = options;

    // Get API URL dynamically at runtime (not at module load time)
    const API_URL = getApiUrl();

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

    // Ensure endpoint starts with / if not present
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const response = await fetch(`${API_URL}${normalizedEndpoint}`, config);

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as {
      error?: string;
      message?: string;
    };
    throw new Error(errorData.error || errorData.message || 'API Request Failed');
  }

  return response.json() as Promise<TResponse>;
}

// Client-side helper methods
export const api = {
  get: <TResponse = unknown>(endpoint: string) => fetchApi<TResponse>(endpoint, { method: 'GET' }),
  post: <TResponse = unknown, TBody = unknown>(endpoint: string, body: TBody) =>
    fetchApi<TResponse>(endpoint, { method: 'POST', body }),
  put: <TResponse = unknown, TBody = unknown>(endpoint: string, body: TBody) =>
    fetchApi<TResponse>(endpoint, { method: 'PUT', body }),
  patch: <TResponse = unknown, TBody = unknown>(endpoint: string, body: TBody) =>
    fetchApi<TResponse>(endpoint, { method: 'PATCH', body }),
  delete: <TResponse = unknown>(endpoint: string) =>
    fetchApi<TResponse>(endpoint, { method: 'DELETE' }),
};
