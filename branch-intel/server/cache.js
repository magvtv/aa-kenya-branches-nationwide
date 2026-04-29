/**
 * Tiny TTL+LRU cache for proxy responses.
 * Not durable across restarts; only meant to soften upstream rate limits.
 */
export function createCache({ max = 200, ttlMs = 60_000 } = {}) {
  const store = new Map()

  function get(key) {
    const entry = store.get(key)
    if (!entry) return undefined
    if (Date.now() > entry.expiresAt) {
      store.delete(key)
      return undefined
    }
    store.delete(key)
    store.set(key, entry)
    return entry.value
  }

  function set(key, value) {
    if (store.size >= max) {
      const oldestKey = store.keys().next().value
      if (oldestKey !== undefined) store.delete(oldestKey)
    }
    store.set(key, { value, expiresAt: Date.now() + ttlMs })
  }

  return { get, set }
}
