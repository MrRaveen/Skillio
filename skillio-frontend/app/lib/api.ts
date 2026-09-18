export const devStatus = process.env.NEXT_PUBLIC_DEV_STATUS || 'production';
export const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5000';

interface ApiCallOptions extends RequestInit {
  mockData?: any;
}

export async function apiCall(endpoint: string, options: ApiCallOptions = {}) {
  if (devStatus === 'ui-only') {
    console.log(`[UI-ONLY] Mocking API call to ${endpoint}`, options.body);
    return {
      ok: true,
      status: 200,
      json: async () => (options.mockData || { message: 'Success (Mocked)', status: 'success', data: [] })
    } as Response;
  }

  const url = `${backendUrl}${endpoint}`;
  
  // Get token from localStorage
  let token = '';
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token') || '';
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string>),
    },
  });

  return response;
}
