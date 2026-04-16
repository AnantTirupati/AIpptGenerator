// Pexels image service — fetches topic-relevant, high-quality stock photos
// API docs: https://www.pexels.com/api/documentation/

const KEY = import.meta.env.VITE_PEXELS_API_KEY as string | undefined;

// In-memory cache: keyword → direct image URL (avoids duplicate API calls per session)
const urlCache = new Map<string, string>();

/**
 * Returns a Pexels landscape image URL for the given keyword.
 * Falls back to null if the API key is missing or the request fails.
 */
export const fetchPexelsImageUrl = async (keyword: string): Promise<string | null> => {
  if (!KEY || !keyword.trim()) return null;

  const cacheKey = keyword.toLowerCase().trim();
  if (urlCache.has(cacheKey)) return urlCache.get(cacheKey)!;

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(cacheKey)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: KEY } }
    );
    if (!res.ok) return null;

    const data = await res.json();
    // Use `large` (940px wide) — good balance of quality and size
    const url: string | undefined =
      data.photos?.[0]?.src?.large ?? data.photos?.[0]?.src?.medium ?? undefined;

    if (url) urlCache.set(cacheKey, url);
    return url ?? null;
  } catch {
    return null;
  }
};

/**
 * Fetches a Pexels image and converts it to a base64 data-URL for embedding in PPTX.
 * Uses a 10-second timeout and falls back to null on any error.
 */
export const fetchPexelsImageBase64 = async (keyword: string): Promise<string | null> => {
  const imgUrl = await fetchPexelsImageUrl(keyword);
  if (!imgUrl) return null;

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 10_000);
    const res = await fetch(imgUrl, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return null;

    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

export const isPexelsConfigured = (): boolean => !!KEY;
