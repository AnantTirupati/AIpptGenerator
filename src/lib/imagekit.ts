// ImageKit URL builder — no upload needed, just URL generation for image display
const ENDPOINT = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/demo';

/**
 * Build an ImageKit transformation URL for a keyword-based image.
 * Falls back to a styled gradient when ImageKit is not configured.
 */
export const getSlideImageUrl = (keyword: string, width = 800, height = 450): string => {
  const slug = keyword.toLowerCase().replace(/\s+/g, '-');
  return `${ENDPOINT}/tr:w-${width},h-${height},fo-auto,q-80/${slug}`;
};

/**
 * Returns true when a real ImageKit endpoint is configured.
 */
export const isImageKitConfigured = (): boolean => {
  const ep = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT;
  return !!ep && !ep.includes('demo');
};
