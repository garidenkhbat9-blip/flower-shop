/**
 * Returns the appropriate image URL.
 * If the URL points to a HEIC/HEIF file, routes it through
 * our server-side image-proxy API for conversion.
 * Otherwise, returns the original URL as-is.
 */
export function getImageUrl(url: string | undefined | null): string {
  if (!url) return "/logo.jpg";
  
  // Check if URL contains a HEIC/HEIF file reference
  const lower = url.toLowerCase();
  if (lower.includes(".heic") || lower.includes(".heif")) {
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  }

  return url;
}
