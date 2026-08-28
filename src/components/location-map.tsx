/**
 * Simple Map Component using Leaflet
 * Displays a marker at given coordinates
 */
import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface LocationMapProps {
  latitude?: string | null
  longitude?: string | null
  height?: string
  className?: string
}

// Default Bandung coordinates
const DEFAULT_CENTER: [number, number] = [-6.9147, 107.6097]
const DEFAULT_ZOOM = 13

export function LocationMap({
  latitude,
  longitude,
  height = '200px',
  className = '',
}: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // Initialize map
    const lat = latitude ? parseFloat(latitude) : null
    const lng = longitude ? parseFloat(longitude) : null
    const center: [number, number] = lat && lng ? [lat, lng] : DEFAULT_CENTER

    // Create map if not exists
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(center, DEFAULT_ZOOM)

      // Add tile layer (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current)
    }

    // Clear existing markers
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapInstanceRef.current?.removeLayer(layer)
      }
    })

    // Add marker if coordinates exist
    if (lat && lng) {
      const marker = L.marker([lat, lng]).addTo(mapInstanceRef.current)

      // Add popup with coordinates
      marker.bindPopup(`Lat: ${lat}<br>Lng: ${lng}`)

      // Pan to marker
      mapInstanceRef.current.setView([lat, lng], DEFAULT_ZOOM)
    }

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [latitude, longitude])

  return (
    <div
      ref={mapRef}
      className={className}
      style={{ height, borderRadius: '8px', overflow: 'hidden' }}
    />
  )
}
