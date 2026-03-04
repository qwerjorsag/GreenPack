const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? '';

export const apiUrl = (path: string) => {
  if (!API_BASE) return path;
  const base = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
};
