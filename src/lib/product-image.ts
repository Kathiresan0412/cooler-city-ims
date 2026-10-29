export function getProductImageSrc(imageUrl: string): string {
  try {
    const url = new URL(imageUrl);
    if (url.hostname.endsWith(".private.blob.vercel-storage.com")) {
      const pathname = decodeURIComponent(url.pathname.slice(1));
      return `/api/product-image?pathname=${encodeURIComponent(pathname)}`;
    }
  } catch {
    return imageUrl;
  }

  return imageUrl;
}
