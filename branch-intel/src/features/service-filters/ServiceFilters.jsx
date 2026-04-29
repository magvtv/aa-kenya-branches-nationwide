import './ServiceFilters.css'

export function ServiceFilters({ serviceCatalog, selected, onToggle, onClear }) {
  return (
    <div
      className="service-filters border-b border-[var(--border)] bg-white/80"
      role="group"
      aria-label="Filter by service"
    >
      <span className="service-filters__label text-[var(--aa-green-strong)]">Services</span>
      <div className="service-filters__chips">
        {serviceCatalog.map((name) => (
          <label
            key={name}
            className="service-filters__chip hover:border-[var(--aa-green)]"
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
      {selected.size > 0 && (
        <button
          type="button"
          className="service-filters__clear border-[var(--aa-green)] text-[var(--aa-green-strong)]"
          onClick={onClear}
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
