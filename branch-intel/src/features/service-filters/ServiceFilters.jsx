import { useMemo, useState } from 'react'
import './ServiceFilters.css'

export function ServiceFilters({
  serviceCatalog,
  selected,
  query,
  onQueryChange,
  onToggle,
  onClearAll,
}) {
  const [open, setOpen] = useState(false)
  const selectedCount = selected.size
  const buttonLabel = useMemo(() => {
    if (selectedCount === 0) return 'Services'
    return `Services (${selectedCount})`
  }, [selectedCount])

  return (
    <div
      className="service-filters"
      role="group"
      aria-label="Branch filters"
    >
      <div className="service-filters__block">
        <button
          type="button"
          className="service-filters__dropdown-btn"
          aria-expanded={open}
          aria-controls="service-filters-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span>{buttonLabel}</span>
          <span className="service-filters__caret" aria-hidden="true">
            {open ? '▲' : '▼'}
          </span>
        </button>

        {open && (
          <div id="service-filters-menu" className="service-filters__menu">
            {serviceCatalog.map((name) => (
              <label
                key={name}
                className="service-filters__option"
              >
                <input
                  type="checkbox"
                  checked={selected.has(name)}
                  onChange={() => onToggle(name)}
                />
                <span>{name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <label className="service-filters__search">
        <span className="service-filters__search-label">Search branch</span>
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Name, city, or locality"
          aria-label="Search branch by name, city, or locality"
        />
      </label>

      {(selectedCount > 0 || query.trim()) && (
        <button
          type="button"
          className="service-filters__clear"
          onClick={onClearAll}
        >
          Clear all
        </button>
      )}
    </div>
  )
}
