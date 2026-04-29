import { BranchIntelProvider } from './BranchIntelProvider'
import { useBranchIntel } from './useBranchIntel'
import { BranchMapView } from '../features/branch-map'
import { BranchNetworkView } from '../features/branch-network'
import { BranchDetailPanel } from '../features/branch-detail'
import { ServiceFilters, useServiceFilters } from '../features/service-filters'
import './App.css'

function BranchIntelShell() {
  const { viewMode, setViewMode, branches, serviceCatalog } = useBranchIntel()
  const { selected, toggle, clear, branchMatches } = useServiceFilters()

  return (
    <div className="branch-intel bg-white">
      <header className="branch-intel__header border-b border-[var(--border)] bg-[var(--aa-yellow-soft)]">
        <div className="branch-intel__brand">
          <h1 className="branch-intel__heading !mb-1 text-[var(--aa-green-strong)]">
            AA Kenya Branch Intelligence
          </h1>
          <p className="branch-intel__sub text-[var(--aa-ink)]">
            Map and network views with service filters and nearest-branch scoring.
          </p>
        </div>
        <div
          className="branch-intel__toggle border-[var(--aa-green)]"
          role="tablist"
          aria-label="View mode"
        >
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'map'}
            className={viewMode === 'map' ? 'is-active' : ''}
            onClick={() => setViewMode('map')}
          >
            Map
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'network'}
            className={viewMode === 'network' ? 'is-active' : ''}
            onClick={() => setViewMode('network')}
          >
            Network
          </button>
        </div>
      </header>

      <ServiceFilters
        serviceCatalog={serviceCatalog}
        selected={selected}
        onToggle={toggle}
        onClear={clear}
      />

      <div className="branch-intel__body">
        <main className="branch-intel__stage" aria-live="polite">
          {viewMode === 'map' ? (
            <BranchMapView filteredBranches={branches} branchMatches={branchMatches} />
          ) : (
            <BranchNetworkView branches={branches} branchMatches={branchMatches} />
          )}
        </main>
        <BranchDetailPanel branches={branches} branchMatches={branchMatches} />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BranchIntelProvider>
      <BranchIntelShell />
    </BranchIntelProvider>
  )
}
