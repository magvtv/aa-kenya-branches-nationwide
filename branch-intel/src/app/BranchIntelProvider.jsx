import { useCallback, useMemo, useState } from 'react'
import { BranchIntelContext } from './branchIntelContext'
import { getBranchIntelData } from '../features/branch-data'

const DEFAULT_USER = {
  lat: -1.2921,
  lon: 36.8219,
  label: 'Nairobi (default)',
}

export function BranchIntelProvider({ children }) {
  const data = useMemo(() => getBranchIntelData(), [])
  const [viewMode, setViewMode] = useState('map')
  const [selectedId, setSelectedId] = useState(null)
  const [userLat, setUserLat] = useState(DEFAULT_USER.lat)
  const [userLon, setUserLon] = useState(DEFAULT_USER.lon)
  const [userLabel, setUserLabel] = useState(DEFAULT_USER.label)

  const selectById = useCallback((id) => {
    setSelectedId(id)
  }, [])

  const setUserPlace = useCallback((place) => {
    if (!place) return
    if (typeof place.lat === 'number') setUserLat(place.lat)
    if (typeof place.lon === 'number') setUserLon(place.lon)
    if (typeof place.label === 'string') setUserLabel(place.label)
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
      userLabel,
      setUserLat,
      setUserLon,
      setUserPlace,
    }),
    [data, viewMode, selectedId, selectById, userLat, userLon, userLabel, setUserPlace],
  )

  return (
    <BranchIntelContext.Provider value={value}>{children}</BranchIntelContext.Provider>
  )
}
