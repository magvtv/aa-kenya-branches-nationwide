/**
 * Calls the backend proxy that forwards to Geoapify Autocomplete.
 * Returns a normalized list of suggestion items.
 *
 * @param {string} query
 * @param {AbortSignal} [signal]
 * @returns {Promise<{ items: Array<{ id: string, label: string, city: string|null, lat: number, lon: number }> }>}
 */
export async function searchPlaces(query, signal) {
  const q = (query ?? '').trim()
  if (q.length < 2) return { items: [] }

  const url = `/api/places/autocomplete?q=${encodeURIComponent(q)}`
  const response = await fetch(url, { signal })

  if (!response.ok) {
    let detail = ''
    try {
      const data = await response.json()
      detail = data?.message || data?.error || ''
    } catch {
      detail = ''
    }
    const err = new Error(detail || `Place search failed (${response.status})`)
    err.status = response.status
    throw err
  }

  const data = await response.json()
  return { items: Array.isArray(data?.items) ? data.items : [] }
}
