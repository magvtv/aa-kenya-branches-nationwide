import { useEffect, useId, useRef, useState } from 'react'
import { usePlaceSearch } from './usePlaceSearch'
import './PlaceSearchInput.css'

/**
 * Place search field with autocomplete suggestions and a "Use my location"
 * button. On selection, calls onPick({ lat, lon, label }).
 */
export function PlaceSearchInput({ value, onPick, placeholder = 'Search a town, area, or landmark' }) {
  const [query, setQuery] = useState(value?.label ?? '')
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const [geoBusy, setGeoBusy] = useState(false)
  const [geoError, setGeoError] = useState(null)
  const containerRef = useRef(null)
  const inputId = useId()
  const listId = `${inputId}-list`

  const { items, loading, error } = usePlaceSearch(query)

  useEffect(() => {
    if (value?.label && value.label !== query) setQuery(value.label)
  }, [value?.label])

  useEffect(() => {
    function onDocClick(ev) {
      if (containerRef.current && !containerRef.current.contains(ev.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  function pickItem(item) {
    if (!item) return
    setQuery(item.label)
    setOpen(false)
    setActiveIdx(-1)
    onPick?.({ lat: item.lat, lon: item.lon, label: item.label })
  }

  function handleKeyDown(ev) {
    if (!open && (ev.key === 'ArrowDown' || ev.key === 'ArrowUp')) {
      setOpen(true)
      return
    }
    if (ev.key === 'ArrowDown') {
      ev.preventDefault()
      setActiveIdx((i) => Math.min(items.length - 1, i + 1))
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault()
      setActiveIdx((i) => Math.max(0, i - 1))
    } else if (ev.key === 'Enter') {
      if (activeIdx >= 0 && items[activeIdx]) {
        ev.preventDefault()
        pickItem(items[activeIdx])
      }
    } else if (ev.key === 'Escape') {
      setOpen(false)
      setActiveIdx(-1)
    }
  }

  function handleUseMyLocation() {
    setGeoError(null)
    if (!('geolocation' in navigator)) {
      setGeoError('Geolocation is not supported by this browser.')
      return
    }
    setGeoBusy(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoBusy(false)
        const lat = pos.coords.latitude
        const lon = pos.coords.longitude
        const label = `My location (${lat.toFixed(4)}, ${lon.toFixed(4)})`
        setQuery(label)
        setOpen(false)
        onPick?.({ lat, lon, label })
      },
      (err) => {
        setGeoBusy(false)
        setGeoError(err?.message || 'Unable to get your location.')
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    )
  }

  const statusText = (() => {
    if (geoError) return geoError
    if (error) return error.message || 'Place search unavailable.'
    if (loading) return 'Searching...'
    if (value?.label && query === value.label) return ''
    return ''
  })()

  return (
    <div className="place-search" ref={containerRef}>
      <div className="place-search__row">
        <input
          id={inputId}
          type="text"
          className="place-search__input"
          placeholder={placeholder}
          value={query}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            setActiveIdx(-1)
          }}
          onFocus={() => {
            if (items.length > 0) setOpen(true)
          }}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          className="place-search__geo"
          onClick={handleUseMyLocation}
          disabled={geoBusy}
          title="Use my current location"
        >
          {geoBusy ? 'Locating...' : 'Use my location'}
        </button>
      </div>

      {(statusText || (value?.label && !geoError && !error)) && (
        <p
          className={`place-search__status${
            geoError || error ? ' place-search__status--error' : ''
          }`}
          aria-live="polite"
        >
          {statusText
            || (value?.label
              ? `Using ${value.label}`
              : '')}
        </p>
      )}

      {open && items.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="place-search__suggestions"
        >
          {items.map((item, idx) => (
            <li
              key={item.id}
              role="option"
              aria-selected={idx === activeIdx}
              className="place-search__suggestion"
              onMouseEnter={() => setActiveIdx(idx)}
              onMouseDown={(e) => {
                e.preventDefault()
                pickItem(item)
              }}
            >
              <span>{item.label}</span>
              {item.city && (
                <span className="place-search__suggestion-city">{item.city}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
