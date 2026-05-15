const API_URL = import.meta.env.VITE_API_URL || '';

export const getMediaUrl = (path: string | undefined | null) => {
  if (!path) return "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80";
  if (path.startsWith('http')) return path;
  
  // Garantir que haja uma barra entre a URL e o caminho
  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${normalizedPath}`;
};
