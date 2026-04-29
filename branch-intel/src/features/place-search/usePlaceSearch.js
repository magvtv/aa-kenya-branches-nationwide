import { useEffect, useRef, useState } from 'react'
import { searchPlaces } from './placeSearchClient'

/**
 * Debounced place-search hook. Cancels in-flight requests when the query
 * changes and tracks loading + error state for the consumer UI.
 */
export function usePlaceSearch(query, { debounceMs = 250, minChars = 2 } = {}) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const controllerRef = useRef(null)

  useEffect(() => {
    const trimmed = (query ?? '').trim()

    if (controllerRef.current) {
      controllerRef.current.abort()
      controllerRef.current = null
    }

    if (trimmed.length < minChars) {
      setItems([])
      setLoading(false)
      setError(null)
      return undefined
    }

    setLoading(true)
    setError(null)

    const handle = setTimeout(async () => {
      const controller = new AbortController()
      controllerRef.current = controller
      try {
        const { items: nextItems } = await searchPlaces(trimmed, controller.signal)
        if (!controller.signal.aborted) setItems(nextItems)
      } catch (err) {
        if (err?.name === 'AbortError') return
        setError(err)
        setItems([])
      } finally {
        if (controllerRef.current === controller) {
          setLoading(false)
          controllerRef.current = null
        }
      }
    }, debounceMs)

    return () => {
      clearTimeout(handle)
      if (controllerRef.current) {
        controllerRef.current.abort()
        controllerRef.current = null
      }
    }
  }, [query, debounceMs, minChars])

  return { items, loading, error }
}
