import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useMemo } from 'react'

// Fix for default marker icon
//today's working done
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      if (onMapClick && e && e.latlng) {
        try {
          // Prevent default behavior that might cause issues
          e.originalEvent?.preventDefault?.()
          onMapClick(e)
        } catch (error) {
          console.error('Error handling map click:', error)
        }
      }
    }
  })
  return null
}

// Component to update map center when it changes
function MapUpdater({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center && Array.isArray(center) && center.length >= 2) {
      map.setView([center[0], center[1]], map.getZoom())
    }
  }, [center, map])
  return null
}

const MapComponent = ({ center, markers = [], zoom = 13, onMapClick, color = 'blue' }) => {
  // Validate center coordinates
  const validCenter = useMemo(() => {
    if (center && 
        Array.isArray(center) && 
        center.length >= 2 && 
        center[0] != null && 
        center[1] != null &&
        !isNaN(center[0]) && 
        !isNaN(center[1]) &&
        typeof center[0] === 'number' &&
        typeof center[1] === 'number') {
      return [parseFloat(center[0]), parseFloat(center[1])]
    }
    return null
  }, [center])

  // Memoize valid markers
  const validMarkers = useMemo(() => {
    return markers.filter(marker => 
      marker && 
      marker.lat != null && 
      marker.lng != null && 
      !isNaN(marker.lat) && 
      !isNaN(marker.lng) &&
      typeof marker.lat === 'number' &&
      typeof marker.lng === 'number'
    )
  }, [markers])

  if (!validCenter) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-200">
        <p className="text-gray-600">Map location not available</p>
      </div>
    )
  }

  // Color mapping for markers
  const colorMap = {
    red: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    blue: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    green: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    yellow: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
    orange: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png'
  }

  const defaultIconUrl = colorMap[color] || colorMap.blue

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer
        center={validCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        scrollWheelZoom={true}
        zoomControl={true}
        doubleClickZoom={true}
        dragging={true}
        touchZoom={true}
        boxZoom={true}
        keyboard={true}
        whenCreated={(mapInstance) => {
          // Store map instance to prevent garbage collection
          window._leafletMapInstance = mapInstance
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={validCenter} />
        {onMapClick && <MapClickHandler onMapClick={onMapClick} />}
        {validMarkers.map((marker, index) => {
          // Use marker color if provided, otherwise use default
          const markerColor = marker.color || color
          const iconUrl = colorMap[markerColor] || defaultIconUrl
          
          const customIcon = L.icon({
            iconUrl: iconUrl,
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          })
          
          return (
            <Marker 
              key={`marker-${index}-${marker.lat}-${marker.lng}`} 
              position={[parseFloat(marker.lat), parseFloat(marker.lng)]} 
              icon={customIcon}
            >
              {marker.title && <Popup>{marker.title}</Popup>}
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}

export default MapComponent
