import { useCallback, useMemo, useState } from 'react'
import { BranchIntelContext } from './branchIntelContext'
import { getBranchIntelData } from '../features/branch-data'

const DEFAULT_USER = { lat: -1.2921, lon: 36.8219 }

export function BranchIntelProvider({ children }) {
  const data = useMemo(() => getBranchIntelData(), [])
  const [viewMode, setViewMode] = useState('map')
  const [selectedId, setSelectedId] = useState(null)
  const [userLat, setUserLat] = useState(DEFAULT_USER.lat)
  const [userLon, setUserLon] = useState(DEFAULT_USER.lon)

  const selectById = useCallback((id) => {
    setSelectedId(id)
  }, [])

  const value = useMemo(
    () => ({
      ...data,
      viewMode,
      setViewMode,
      selectedId,
      selectById,
      userLat,
      userLon,
      setUserLat,
      setUserLon,
    }),
    [data, viewMode, selectedId, selectById, userLat, userLon],
  )

  return (
    <BranchIntelContext.Provider value={value}>{children}</BranchIntelContext.Provider>
  )
}
