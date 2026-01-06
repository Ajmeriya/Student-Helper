import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect } from 'react'

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e)
      }
    }
  })
  return null
}

const MapComponent = ({ center, markers = [], zoom = 13, onMapClick }) => {
  // Validate center coordinates
  const validCenter = center && 
    Array.isArray(center) && 
    center.length >= 2 && 
    center[0] != null && 
    center[1] != null &&
    !isNaN(center[0]) && 
    !isNaN(center[1]) &&
    typeof center[0] === 'number' &&
    typeof center[1] === 'number'
    ? [parseFloat(center[0]), parseFloat(center[1])]
    : null

  if (!validCenter) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-200">
        <p className="text-gray-600">Map location not available</p>
      </div>
    )
  }

  return (
    <MapContainer
      center={validCenter}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
      zoomControl={true}
      doubleClickZoom={true}
      dragging={true}
      touchZoom={true}
      boxZoom={true}
      keyboard={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {onMapClick && <MapClickHandler onMapClick={onMapClick} />}
      {markers
        .filter(marker => 
          marker && 
          marker.lat != null && 
          marker.lng != null && 
          !isNaN(marker.lat) && 
          !isNaN(marker.lng) &&
          typeof marker.lat === 'number' &&
          typeof marker.lng === 'number'
        )
        .map((marker, index) => {
          // Create custom icon for college (if title contains "college" or "College")
          const isCollege = marker.title && (marker.title.toLowerCase().includes('college') || marker.title.toLowerCase().includes('university'))
          
          const customIcon = isCollege 
            ? L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
              })
            : L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
              })
          
          return (
            <Marker key={index} position={[parseFloat(marker.lat), parseFloat(marker.lng)]} icon={customIcon}>
              {marker.title && <Popup>{marker.title}</Popup>}
            </Marker>
          )
        })}
    </MapContainer>
  )
}

export default MapComponent

