import { useMemo, useState } from 'react'
import { useBranchIntel } from '../../app/useBranchIntel'
import { findBestBranches } from '../recommendation'
import './BranchDetailPanel.css'

function LoadBar({ percent }) {
  const level =
    percent >= 70 ? 'high' : percent >= 50 ? 'medium' : 'low'
  return (
    <div className="branch-card__load">
      <div className="branch-card__load-header">
        <span className="branch-card__load-label">Estimated load</span>
        <span className="branch-card__load-value">{percent}%</span>
      </div>
      <div className="branch-card__load-track" role="presentation">
        <div
          className={`branch-card__load-fill branch-card__load-fill--${level}`}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
    </div>
  )
}

function ServiceList({ services }) {
  return (
    <ul className="branch-card__services">
      {services.map((s) => (
        <li key={s} className="branch-card__service-pill">
          {s}
        </li>
      ))}
    </ul>
  )
}

function BranchCard({
  badge,
  badgeVariant,
  title,
  locationLine,
  address,
  loadPercent,
  services,
  subtitle,
}) {
  return (
    <article className={`branch-card branch-card--${badgeVariant}`}>
      <header className="branch-card__header">
        <span className={`branch-card__badge branch-card__badge--${badgeVariant}`}>
          {badge}
        </span>
        <h3 className="branch-card__title">{title}</h3>
        {subtitle && <p className="branch-card__subtitle">{subtitle}</p>}
      </header>

      <div className="branch-card__location">
        {locationLine && <p className="branch-card__location-line">{locationLine}</p>}
        {address && <p className="branch-card__address">{address}</p>}
      </div>

      {loadPercent != null && <LoadBar percent={loadPercent} />}

      {services && services.length > 0 && (
        <div className="branch-card__services-wrap">
          <span className="branch-card__services-label">Services</span>
          <ServiceList services={services} />
        </div>
      )}
    </article>
  )
}

export function BranchDetailPanel({ branches, branchMatches }) {
  const {
    hq,
    serviceCatalog,
    selectedId,
    selectById,
    userLat,
    userLon,
    setUserLat,
    setUserLon,
  } = useBranchIntel()

  const [requiredService, setRequiredService] = useState(
    serviceCatalog[0] ?? 'Membership Registration',
  )

  const selectedBranch = useMemo(
    () => branches.find((b) => b.branchId === selectedId) ?? null,
    [branches, selectedId],
  )

  const bestRows = useMemo(() => {
    const eligible = branches.filter(branchMatches)
    return findBestBranches(eligible, userLat, userLon, requiredService, 3)
  }, [branches, branchMatches, userLat, userLon, requiredService])

  const showHq = selectedId === hq.id

  return (
    <aside className="branch-detail" aria-label="Branch details">
      <h2 className="branch-detail__title">Details</h2>

      {showHq ? (
        <BranchCard
          badge="HQ"
          badgeVariant="hq"
          title={hq.name}
          subtitle="National operations center"
          locationLine="Upper Hill, Nairobi"
          address={hq.address}
        />
      ) : selectedBranch ? (
        <BranchCard
          badge={selectedBranch.category === 'flagship' ? 'Flagship' : 'Satellite'}
          badgeVariant={selectedBranch.category === 'flagship' ? 'flagship' : 'satellite'}
          title={selectedBranch.name}
          locationLine={`${selectedBranch.city}${selectedBranch.locality ? ` · ${selectedBranch.locality}` : ''}`}
          address={selectedBranch.address}
          loadPercent={selectedBranch.loadPercent}
          services={selectedBranch.services}
        />
      ) : (
        <div className="branch-detail__empty">
          <p className="branch-detail__hint">
            Select a marker or graph node to view branch information.
          </p>
        </div>
      )}

      <section className="branch-detail__section">
        <h3 className="branch-detail__section-title">Nearest best branch</h3>
        <p className="branch-detail__hint branch-detail__hint--small">
          Uses distance, estimated load, and flagship preference. Choose your
          location and required service.
        </p>
        <div className="branch-detail__fields">
          <label className="branch-detail__field">
            <span>Latitude</span>
            <input
              type="number"
              step="any"
              value={userLat}
              onChange={(e) => setUserLat(Number(e.target.value))}
            />
          </label>
          <label className="branch-detail__field">
            <span>Longitude</span>
            <input
              type="number"
              step="any"
              value={userLon}
              onChange={(e) => setUserLon(Number(e.target.value))}
            />
          </label>
          <label className="branch-detail__field branch-detail__field--full">
            <span>Required service</span>
            <select
              value={requiredService}
              onChange={(e) => setRequiredService(e.target.value)}
            >
              {serviceCatalog.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>

        <ol className="branch-detail__ranked">
          {bestRows.map((row, i) => (
            <li key={row.branch.branchId}>
              <button
                type="button"
                className={`branch-detail__rank-card${selectedId === row.branch.branchId ? ' is-selected' : ''}`}
                onClick={() => selectById(row.branch.branchId)}
              >
                <span className="branch-detail__rank-rank">{i + 1}</span>
                <span className="branch-detail__rank-content">
                  <span className="branch-detail__rank-name">{row.branch.name}</span>
                  <span className="branch-detail__rank-meta">
                    <span>{row.distKm.toFixed(1)} km</span>
                    <span className="branch-detail__rank-dot" aria-hidden="true" />
                    <span>Score {row.score.toFixed(2)}</span>
                    <span className="branch-detail__rank-dot" aria-hidden="true" />
                    <span>Load {row.loadPercent}%</span>
                  </span>
                </span>
                <span className="branch-detail__rank-chevron" aria-hidden="true">
                  ›
                </span>
              </button>
            </li>
          ))}
        </ol>
        {bestRows.length === 0 && (
          <p className="branch-detail__hint">No branches match the current filters.</p>
        )}
      </section>
    </aside>
  )
}
