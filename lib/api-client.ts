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
    body?: any;
    credentials?: RequestCredentials;
};

export async function fetchApi(endpoint: string, options: RequestOptions = {}) {
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'API Request Failed');
    }

    return response.json();
}

// Client-side helper methods
export const api = {
    get: (endpoint: string) => fetchApi(endpoint, { method: 'GET' }),
    post: (endpoint: string, body: any) => fetchApi(endpoint, { method: 'POST', body }),
    put: (endpoint: string, body: any) => fetchApi(endpoint, { method: 'PUT', body }),
    patch: (endpoint: string, body: any) => fetchApi(endpoint, { method: 'PATCH', body }),
    delete: (endpoint: string) => fetchApi(endpoint, { method: 'DELETE' }),
};
