import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import { Apartment } from '@/types';
import { formatPrice, getHouseTypeLabel } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Fix default icon issues with Leaflet's webpack bundling
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface Props {
  apartments: (Apartment & { vacantCount: number })[];
  selected: Apartment & { vacantCount: number } | null;
  setSelected: (apt: Apartment & { vacantCount: number } | null) => void;
}

// Helper component to fit map bounds to markers
function FitBounds({ apartments }: { apartments: (Apartment & { vacantCount: number })[] }) {
  const map = useMap();
  useEffect(() => {
    if (apartments.length === 0) return;
    const bounds = L.latLngBounds(
      apartments
        .filter((a) => a.latitude != null && a.longitude != null)
        .map((a) => [a.latitude!, a.longitude!])
    );
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [apartments, map]);
  return null;
}

export default function LeafletMap({ apartments, selected, setSelected }: Props) {
  const center = { lat: -1.0803, lng: 35.8711 };

  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ width: '100%', height: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      <FitBounds apartments={apartments} />
      {apartments
        .filter((apt) => apt.latitude != null && apt.longitude != null)
        .map((apt) => (
          <Marker
            key={apt.id}
            position={[apt.latitude!, apt.longitude!]}
            eventHandlers={{ click: () => setSelected(apt) }}
          >
            {selected && selected.id === apt.id && (
              <Popup
                position={[apt.latitude!, apt.longitude!]}
                eventHandlers={{
                  remove: () => setSelected(null)
                }}
              >
                <div className="p-2 min-w-[200px] max-w-[260px]">
                  <h3 className="font-display font-bold text-slate-900 text-sm mb-1">
                    {apt.name}
                  </h3>
                  <p className="text-indigo-600 font-bold text-sm leading-none">
                    {formatPrice(apt.pricePerMonth)}
                  </p>
                  <p className="text-slate-400 text-[10px] mb-2">
                    {getHouseTypeLabel(apt.houseType)}
                  </p>
                  <Link
                    href={`/listings/${apt.id}`}
                    className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700"
                  >
                    Details <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </Popup>
            )}
          </Marker>
        ))}
    </MapContainer>
  );
}
