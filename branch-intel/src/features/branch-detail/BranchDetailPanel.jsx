import { useMemo, useState } from 'react'
import { useBranchIntel } from '../../app/useBranchIntel'
import { findBestBranches } from '../recommendation'
import { PlaceSearchInput } from '../place-search'
import './BranchDetailPanel.css'

export function BranchDetailPanel({ branches, branchMatches }) {
  const {
    hq,
    serviceCatalog,
    selectedId,
    selectById,
    userLat,
    userLon,
    userLabel,
    setUserPlace,
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
        <div className="branch-detail__card">
          <p className="branch-detail__badge branch-detail__badge--hq">HQ</p>
          <h3>{hq.name}</h3>
          <p className="branch-detail__meta">{hq.address}</p>
        </div>
      ) : selectedBranch ? (
        <div className="branch-detail__card">
          <p
            className={`branch-detail__badge ${
              selectedBranch.category === 'flagship'
                ? 'branch-detail__badge--flagship'
                : 'branch-detail__badge--satellite'
            }`}
          >
            {selectedBranch.category === 'flagship' ? 'Flagship' : 'Satellite'}
          </p>
          <h3>{selectedBranch.name}</h3>
          <p className="branch-detail__meta">
            {selectedBranch.city}
            {selectedBranch.locality ? ` · ${selectedBranch.locality}` : ''}
          </p>
          {selectedBranch.address && (
            <p className="branch-detail__meta">{selectedBranch.address}</p>
          )}
          <p className="branch-detail__load">
            Estimated load: {selectedBranch.loadPercent}%
          </p>
          <ul className="branch-detail__services">
            {selectedBranch.services.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="branch-detail__hint">
          Select a marker or graph node to view branch information.
        </p>
      )}

      <section className="branch-detail__section">
        <h3 className="branch-detail__section-title">Nearest best branch</h3>
        <p className="branch-detail__hint branch-detail__hint--small">
          Search a town or area, or use your location. We rank branches by
          distance, load, and flagship preference.
        </p>
        <PlaceSearchInput
          value={{ lat: userLat, lon: userLon, label: userLabel }}
          onPick={(place) => setUserPlace(place)}
        />
        <label className="branch-detail__field">
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

        <ol className="branch-detail__ranked">
          {bestRows.map((row, i) => (
            <li key={row.branch.branchId}>
              <button
                type="button"
                className="branch-detail__rank-btn"
                onClick={() => selectById(row.branch.branchId)}
              >
                <span className="branch-detail__rank-num">{i + 1}</span>
                <span className="branch-detail__rank-body">
                  <span className="branch-detail__rank-name">{row.branch.name}</span>
                  <span className="branch-detail__rank-stats">
                    {row.distKm.toFixed(1)} km · score {row.score.toFixed(2)} · load{' '}
                    {row.loadPercent}%
                  </span>
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
