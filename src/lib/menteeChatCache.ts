type ChatCacheEntry<T> = {
  data: T;
  fetchedAt: number;
};

const CHAT_CACHE_TTL_MS = 30 * 1000;
const SIGNED_URL_TTL_SEC = 60 * 5;

const chatCache = new Map<string, ChatCacheEntry<any>>();
const attachmentUrlCache = new Map<
  string,
  { signedUrl: string | null; expiresAt: number }
>();

export function readMenteeChatCache<T>(key: string) {
  const entry = chatCache.get(key);
  if (!entry) return null;

  const age = Date.now() - entry.fetchedAt;
  return {
    data: entry.data as T,
    stale: age > CHAT_CACHE_TTL_MS,
  };
}

export function writeMenteeChatCache<T>(key: string, data: T) {
  chatCache.set(key, {
    data,
    fetchedAt: Date.now(),
  });
}

export function getCachedSignedUrl(path: string) {
  const entry = attachmentUrlCache.get(path);
  if (!entry) return undefined;
  if (Date.now() >= entry.expiresAt) {
    attachmentUrlCache.delete(path);
    return undefined;
  }
  return entry.signedUrl;
}

export function setCachedSignedUrl(
  path: string,
  signedUrl: string | null,
  expiresInSec = SIGNED_URL_TTL_SEC,
) {
  const safetyWindowMs = 5000;
  const expiresAt = Date.now() + expiresInSec * 1000 - safetyWindowMs;
  attachmentUrlCache.set(path, { signedUrl, expiresAt });
}
