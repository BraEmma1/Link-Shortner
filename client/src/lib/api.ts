import axios from 'axios';

const getBaseURL = () => {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const cleanedUrl = url.trim().replace(/\/$/, '');
  return cleanedUrl.endsWith('/api') ? cleanedUrl : `${cleanedUrl}/api`;
};

// 30s timeout — accounts for cold starts on free-tier hosting (e.g. Render)
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

export interface ShortLink {
  slug: string;
  targetUrl: string;
  shortUrl: string;
  clicks: number;
  createdAt: string;
}

export const shortenUrl = async (targetUrl: string, customSlug?: string): Promise<ShortLink> => {
  const { data } = await api.post('/shorten', { targetUrl, customSlug });
  return data.link;
};

export const getLinkStats = async (slug: string): Promise<ShortLink> => {
  const { data } = await api.get(`/stats/${encodeURIComponent(slug)}`);
  return data.link;
};

export const errorMessage = (err: unknown, fallback: string): string => {
  const e = err as { response?: { data?: { error?: string } }; message?: string };
  return e.response?.data?.error || e.message || fallback;
};
