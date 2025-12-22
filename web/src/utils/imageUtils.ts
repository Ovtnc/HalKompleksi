import { ENV } from '../config/env';

/**
 * Normalize image URL to full URL
 * Handles relative paths, absolute paths, and full URLs
 */
export const normalizeImageUrl = (url: string | undefined | null): string | undefined => {
  if (!url) return undefined;
  
  // If already a full URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If starts with /, prepend base URL
  if (url.startsWith('/')) {
    return `${ENV.WEB_BASE_URL}${url}`;
  }
  
  // Otherwise, assume it's relative to uploads
  return `${ENV.WEB_BASE_URL}/uploads/${url}`;
};

/**
 * Get primary image from product images array
 */
export const getPrimaryImage = (images: any[] | undefined): string | undefined => {
  if (!images || images.length === 0) return undefined;
  
  const firstImage = images[0];
  const rawUrl = typeof firstImage === 'string' ? firstImage : (firstImage as any)?.url;
  
  return normalizeImageUrl(rawUrl);
};

