import { useCallback, useMemo, useState } from 'react'

/**
 * Empty selection = no filter (show all). Otherwise branch must include every selected service.
 */
export function useServiceFilters() {
  const [selected, setSelected] = useState(() => new Set())
  const [query, setQuery] = useState('')

  const toggle = useCallback((serviceName) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(serviceName)) next.delete(serviceName)
      else next.add(serviceName)
      return next
    })
  }, [])

  const clear = useCallback(() => setSelected(new Set()), [])
  const clearAll = useCallback(() => {
    setSelected(new Set())
    setQuery('')
  }, [])

  const branchMatches = useCallback(
    (branch) => {
      const text = query.trim().toLowerCase()
      const serviceOk =
        selected.size === 0 || [...selected].every((s) => branch.services.includes(s))
      if (!serviceOk) return false
      if (!text) return true

      const haystack = [branch.name, branch.city, branch.locality]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(text)
    },
    [selected, query],
  )

  const selectedList = useMemo(() => [...selected], [selected])

  return {
    selected,
    query,
    setQuery,
    selectedList,
    toggle,
    clear,
    clearAll,
    branchMatches,
  }
}
