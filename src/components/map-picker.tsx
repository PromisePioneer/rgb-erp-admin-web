/**
 * Map Picker Component
 * Input fields + inline map yang sync
 */
import { useEffect, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Search, Loader2, RotateCw } from 'lucide-react'

// Fix default marker icon
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface MapPickerProps {
  lat?: string | number | null
  lng?: string | number | null
  onChange?: (lat: string | null | undefined, lng: string | null | undefined) => void
  className?: string
  label?: string
  error?: string
}

// Map click handler
function MapClickHandler({
  onPositionChange,
}: {
  onPositionChange: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

// Fly to position when lat/lng props change
function MapPositionUpdater({
  lat,
  lng,
}: {
  lat: number | null
  lng: number | null
}) {
  const map = useMap()

  useEffect(() => {
    if (lat != null && lng != null) {
      map.flyTo([lat, lng], 15)
    }
  }, [lat, lng, map])

  return null
}

export function MapPicker({
  lat,
  lng,
  onChange,
  className = '',
  label,
  error,
}: MapPickerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Array<{ lat: number; lng: number; display: string }>>([])
  const [mapKey, setMapKey] = useState(0)

  // Helper to safely parse coordinates
  const parseCoord = (val: string | number | null | undefined): number | null => {
    if (val == null || val === '') return null
    const num = typeof val === 'string' ? parseFloat(val) : val
    return isNaN(num) ? null : num
  }

  // Convert props to numbers safely
  const latNum = parseCoord(lat)
  const lngNum = parseCoord(lng)

  // Handle coordinate change from map click or search
  const handlePositionChange = useCallback((newLat: number, newLng: number) => {
    onChange?.(newLat.toString(), newLng.toString())
  }, [onChange])

  // Handle search
  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        { headers: { 'Accept': 'application/json' } }
      )
      const data = await response.json()
      setSearchResults(
        data.map((item: { lat: string; lon: string; display_name: string }) => ({
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          display: item.display_name.split(',').slice(0, 3).join(','),
        }))
      )
    } catch {
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const selectSearchResult = (result: { lat: number; lng: number }) => {
    handlePositionChange(result.lat, result.lng)
    setSearchResults([])
    setSearchQuery('')
  }

  // Default center (Indonesia)
  const defaultCenter: [number, number] = [-6.2, 106.8]
  const center: [number, number] =
    latNum != null && lngNum != null ? [latNum, lngNum] : defaultCenter

  // Refresh map when lat/lng reset to null
  useEffect(() => {
    if (lat == null && lng == null) {
      setMapKey(k => k + 1)
    }
  }, [lat, lng])

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium mb-1.5 text-foreground">
          {label}
        </label>
      )}

      {/* Search Bar */}
      <div className="flex gap-2 mb-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                searchLocation(searchQuery)
              }
            }}
            placeholder="Cari lokasi..."
            className="w-full h-10 pl-10 pr-4 rounded-md border bg-background text-sm"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('')
              setSearchResults([])
            }}
            className="h-10 px-3 flex items-center justify-center rounded-md border hover:bg-accent"
          >
            <RotateCw className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mb-2 border rounded-md bg-background max-h-[100px] overflow-y-auto">
          {searchResults.map((result, i) => (
            <button
              key={i}
              type="button"
              onClick={() => selectSearchResult(result)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-accent truncate border-b last:border-b-0"
            >
              {result.display}
            </button>
          ))}
        </div>
      )}

      {/* Map */}
      <div className="relative rounded-md border overflow-hidden h-[200px]">
        <MapContainer
          key={mapKey}
          center={center}
          zoom={latNum != null && lngNum != null ? 15 : 10}
          className="w-full h-full"
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onPositionChange={handlePositionChange} />
          <MapPositionUpdater lat={latNum} lng={lngNum} />
          {latNum != null && lngNum != null && (
            <Marker position={[latNum, lngNum]} icon={customIcon} />
          )}
        </MapContainer>

        {/* Coordinate overlay */}
        <div className="absolute top-2 left-2 bg-background/90 px-2 py-1 rounded text-xs shadow">
          {latNum != null && lngNum != null
            ? `${latNum.toFixed(5)}, ${lngNum.toFixed(5)}`
            : 'Klik map untuk pilih lokasi'}
        </div>
      </div>

      {error && <p className="text-sm text-destructive mt-1.5">{error}</p>}
    </div>
  )
}

export default MapPicker
