import { useCallback, useMemo, useState } from 'react'

/**
 * Empty selection = no filter (show all). Otherwise branch must include every selected service.
 */
export function useServiceFilters() {
  const [selected, setSelected] = useState(() => new Set())

  const toggle = useCallback((serviceName) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(serviceName)) next.delete(serviceName)
      else next.add(serviceName)
      return next
    })
  }, [])

  const clear = useCallback(() => setSelected(new Set()), [])

  const branchMatches = useCallback(
    (branch) => {
      if (selected.size === 0) return true
      for (const s of selected) {
        if (!branch.services.includes(s)) return false
      }
      return true
    },
    [selected],
  )

  const selectedList = useMemo(() => [...selected], [selected])

  return {
    selected,
    selectedList,
    toggle,
    clear,
    branchMatches,
  }
}
