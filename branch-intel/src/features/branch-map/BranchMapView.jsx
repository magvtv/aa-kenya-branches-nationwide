import { useMemo } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import { useBranchIntel } from '../../app/useBranchIntel'
import 'leaflet/dist/leaflet.css'
import './BranchMapView.css'

function makeDivIcon(kind, selected) {
  const cls = [
    'branch-map__pin',
    `branch-map__pin--${kind}`,
    selected ? 'branch-map__pin--selected' : '',
  ]
    .filter(Boolean)
    .join(' ')
  return L.divIcon({
    className: '',
    html: `<div class="${cls}" role="img" aria-hidden="true"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -11],
  })
}

const MAP_CENTER = [-1.29, 36.82]
const MAP_ZOOM = 6
const KENYA_BOUNDS = [
  [-4.9, 33.45],
  [5.5, 41.95],
]

export function BranchMapView({ filteredBranches, branchMatches }) {
  const { hq, selectedId, selectById } = useBranchIntel()

  const branchesToShow = useMemo(() => {
    return filteredBranches.filter(branchMatches)
  }, [filteredBranches, branchMatches])

  const mapProps = useMemo(
    () => ({
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      scrollWheelZoom: true,
      minZoom: 6,
      maxZoom: 13,
      maxBounds: KENYA_BOUNDS,
      maxBoundsViscosity: 1,
    }),
    [],
  )

  return (
    <div className="branch-map">
      <MapContainer
        className="branch-map__container"
        {...mapProps}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          noWrap
        />
        <Marker
          position={[hq.lat, hq.lon]}
          icon={makeDivIcon('hq', selectedId === hq.id)}
          eventHandlers={{
            click: () => selectById(hq.id),
          }}
        >
          <Popup>
            <strong>{hq.name}</strong>
            <div>{hq.address}</div>
          </Popup>
        </Marker>
        {branchesToShow.map((b) => (
          <Marker
            key={b.branchId}
            position={[b.lat, b.lon]}
            icon={makeDivIcon(
              b.category === 'flagship' ? 'flagship' : 'satellite',
              selectedId === b.branchId,
            )}
            eventHandlers={{
              click: () => selectById(b.branchId),
            }}
          >
            <Popup>
              <strong>{b.name}</strong>
              <div>
                {b.city}
                {b.locality ? ` · ${b.locality}` : ''}
              </div>
              {b.address && <div className="branch-map__popup-address">{b.address}</div>}
              <ul className="branch-map__services">
                {b.services.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
