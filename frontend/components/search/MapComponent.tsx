'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import { AdSpace } from '@/types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

// Component to update map center when selected ad space changes
function MapCenterUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

interface MapComponentProps {
  adSpaces: AdSpace[];
  onMarkerClick?: (adSpace: AdSpace) => void;
  selectedId?: string;
  selectedAdSpace?: AdSpace | null;
}

export default function MapComponent({ adSpaces, onMarkerClick, selectedId, selectedAdSpace }: MapComponentProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Ensure we're in the browser
    if (typeof window !== 'undefined') {
      setMounted(true);
    }
  }, []);

  if (!mounted) {
    return (
      <div className="h-[calc(100vh-200px)] bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `₹${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `₹${(price / 1000).toFixed(0)}k`;
    }
    return `₹${price}`;
  };

  // Calculate center and bounds from selected ad space, or first ad space, or default to Mumbai
  const getCenter = (): [number, number] => {
    if (selectedAdSpace) {
      // If it has a route/coverage, center on the coverage center
      if (selectedAdSpace.route) {
        return [
          selectedAdSpace.route.center_location.latitude,
          selectedAdSpace.route.center_location.longitude
        ];
      }
      return [selectedAdSpace.latitude, selectedAdSpace.longitude];
    }
    if (selectedId) {
      const selectedSpace = adSpaces.find(s => s.id === selectedId);
      if (selectedSpace) {
        if (selectedSpace.route) {
          return [
            selectedSpace.route.center_location.latitude,
            selectedSpace.route.center_location.longitude
          ];
        }
        return [selectedSpace.latitude, selectedSpace.longitude];
      }
    }
    if (adSpaces.length > 0) {
      return [adSpaces[0].latitude, adSpaces[0].longitude];
    }
    return [19.0760, 72.8777]; // Mumbai coordinates
  };

  const center = getCenter();
  // Zoom based on coverage radius - larger radius needs more zoom out
  const getZoom = (): number => {
    if (selectedAdSpace?.route) {
      const radiusKm = selectedAdSpace.route.coverage_radius;
      // Zoom levels: 5km=13, 8km=12, 10km=11, 15km=10, 20km=9, 25km=8
      if (radiusKm <= 5) return 13;
      if (radiusKm <= 8) return 12;
      if (radiusKm <= 10) return 11;
      if (radiusKm <= 15) return 10;
      if (radiusKm <= 20) return 9;
      return 8;
    }
    return selectedId ? 15 : 13;
  };
  const zoom = getZoom();

  // Create custom red icon for markers
  const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  // Create custom blue icon for selected marker
  const blueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [35, 51],
    iconAnchor: [17, 51],
    popupAnchor: [1, -34],
    shadowSize: [51, 51],
  });

  return (
    <div 
      className="relative h-[calc(100vh-200px)]"
      style={{ position: 'relative', zIndex: 0 }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        key={`map-${selectedId || 'default'}`}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapCenterUpdater center={center} zoom={zoom} />
        
        {/* Show coverage radius for movable ad spaces */}
        {selectedAdSpace?.route && (
          <>
            {/* Coverage Circle - radius in meters */}
            <Circle
              center={[
                selectedAdSpace.route.center_location.latitude,
                selectedAdSpace.route.center_location.longitude
              ]}
              radius={selectedAdSpace.route.coverage_radius * 1000} // Convert km to meters
              color="#E91E63"
              fillColor="#E91E63"
              fillOpacity={0.15}
              weight={3}
              dashArray="10, 5"
            />
            
            {/* Center marker */}
            <Marker
              position={[
                selectedAdSpace.route.center_location.latitude,
                selectedAdSpace.route.center_location.longitude
              ]}
              icon={new L.Icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                iconSize: [35, 51],
                iconAnchor: [17, 51],
              })}
            >
              <Popup>
                <div className="p-2">
                  <p className="font-semibold text-sm text-blue-600 mb-1">
                    Coverage Center
                  </p>
                  <p className="text-xs text-gray-600">
                    {selectedAdSpace.route.center_location.address}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedAdSpace.route.coverage_radius} km radius
                  </p>
                </div>
              </Popup>
            </Marker>
          </>
        )}
        
        {/* Regular markers */}
        {adSpaces.map((space) => (
          <Marker
            key={space.id}
            position={[space.latitude, space.longitude]}
            icon={selectedId === space.id ? blueIcon : redIcon}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) {
                  onMarkerClick(space);
                }
              },
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-sm mb-1">{space.title}</h3>
                <p className="text-[#E91E63] font-semibold text-sm mb-2">
                  {formatPrice(space.price_per_month)}/month
                </p>
                {space.route && (
                  <p className="text-xs text-gray-600 mb-2">
                    Coverage: {space.route.coverage_radius} km radius from {space.route.center_location.address}
                  </p>
                )}
                <button
                  onClick={() => onMarkerClick && onMarkerClick(space)}
                  className="text-[#2196F3] text-xs hover:underline w-full text-left"
                >
                  View Details →
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

