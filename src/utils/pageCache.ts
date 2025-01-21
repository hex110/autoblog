export interface CachedPage {
  content: string;
  timestamp: number;
}

export function getCachedPage(cacheKey: string, lastModified?: number): CachedPage | null {
  try {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;

    const parsedCache: CachedPage = JSON.parse(cached);
    if (lastModified && parsedCache.timestamp < lastModified) {
      localStorage.removeItem(`page_${cacheKey}`);
      return null;
    }

    return parsedCache;
  } catch {
    return null;
  }
}

export function cachePage(cacheKey: string, content: string): CachedPage {
  const cacheObject: CachedPage = {
    content,
    timestamp: Date.now(),
  };
  localStorage.setItem(cacheKey, JSON.stringify(cacheObject));
  return cacheObject;
}

export function clearPageCache() {
  // Get all keys from localStorage
  const keys = Object.keys(localStorage);
  
  // Remove all items that look like page cache entries (contain an underscore)
  keys.forEach(key => {
    if (key.includes('_')) {
      localStorage.removeItem(key);
    }
  });
}
