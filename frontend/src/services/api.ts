const API_URL = import.meta.env.VITE_API_URL || '';

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  
  // Garantir que as credenciais (cookies) sejam enviadas
  const defaultOptions: RequestInit = {
    ...options,
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      ...options.headers,
    }
  };

  if (defaultOptions.body && !(defaultOptions.body instanceof FormData)) {
    defaultOptions.headers = {
      ...defaultOptions.headers,
      'Content-Type': 'application/json',
    };
  }

  const response = await fetch(url, defaultOptions);

  if (response.status === 401) {
    // Sessão expirada ou não autenticado
    if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
      localStorage.removeItem('onboarding_complete');
      localStorage.removeItem('user_name');
      localStorage.removeItem('user_photo');
      window.location.href = '/welcome'; // Redireciona para o início
    }
  }

  return response;
};

export const api = {
  get: (endpoint: string) => apiFetch(endpoint, { method: 'GET' }),
  post: (endpoint: string, body: any) => apiFetch(endpoint, { 
    method: 'POST', 
    body: body instanceof FormData ? body : JSON.stringify(body) 
  }),
  put: (endpoint: string, body: any) => apiFetch(endpoint, { 
    method: 'PUT', 
    body: body instanceof FormData ? body : JSON.stringify(body) 
  }),
  patch: (endpoint: string, body: any) => apiFetch(endpoint, { 
    method: 'PATCH', 
    body: body instanceof FormData ? body : JSON.stringify(body) 
  }),
  delete: (endpoint: string) => apiFetch(endpoint, { method: 'DELETE' }),
};
