const API_URL = import.meta.env.VITE_API_URL || '';

export const getMediaUrl = (path: string | undefined | null) => {
  if (!path) return "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80";
  
  let url = path;
  if (!path.startsWith('http')) {
    // Garantir que haja uma barra entre a URL e o caminho
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    url = `${baseUrl}${normalizedPath}`;
  }

  // Otimização automática para Cloudinary (se for o caso)
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    if (!url.includes("q_auto")) {
      // f_auto: formato automático (webp/avif), q_auto: qualidade automática, w_600: largura máxima para miniaturas
      url = url.replace("/upload/", "/upload/f_auto,q_auto,w_600,c_fill,g_auto/");
    }
  }
  
  return url;
};
