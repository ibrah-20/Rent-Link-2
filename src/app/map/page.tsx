'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  GoogleMap, 
  useJsApiLoader, 
  MarkerF, 
  InfoWindowF
} from '@react-google-maps/api';
import { MapPin, Home, Info, ArrowRight, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('@/components/Map/LeafletMap'), { 
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-sm font-medium">Loading fallback map...</p>
      </div>
    </div>
  )
});
import { VacancyBadge } from '@/components/ui/VacancyBadge';
import { formatPrice, getHouseTypeLabel } from '@/lib/utils';
import { Apartment } from '@/types';
import { MapFilters } from '@/components/Map/MapFilters';

// Safe Default Coordinates for Narok, Kenya
const center = {
  lat: -1.0803,
  lng: 35.8711,
};

const containerStyle = {
  width: '100%',
  height: '100%'
};

const mapOptions = {
  styles: [
    { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2d3748' }] },
    { featureType: 'water', stylers: [{ color: '#0f172a' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  ],
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
};

export default function MapPage() {
  const [apartments, setApartments] = useState<(Apartment & { vacantCount: number })[]>([]);
  const [selected, setSelected] = useState<(Apartment & { vacantCount: number }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const isValidKey = apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE' && apiKey !== 'YOUR_API_KEY';

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey
  });

  useEffect(() => {
    fetchApartments();
  }, []);

  async function fetchApartments() {
    try {
      const res = await fetch('/api/apartments?limit=100');
      const data = await res.json();
      if (data.success) {
        setApartments(data.data.map((apt: any) => ({
          ...apt,
          vacantCount: apt.units.filter((u: any) => u.status === 'VACANT').length
        })));
      }
    } catch (err) {
      console.error('Failed to fetch apartments:', err);
    } finally {
      setLoading(false);
    }
  }

  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    setMapReady(true);
  }, []);

  const onMapUnmount = useCallback(() => {
    setMap(null);
    setMapReady(false);
  }, []);

  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <Navbar />
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
          <Info className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="font-display font-bold text-xl mb-2">Map Error</h2>
          <p className="text-slate-400 text-sm mb-6">
            Google Maps failed to load. Please check your API key and connection.
          </p>
          <Link href="/" className="px-6 py-2 bg-indigo-600 rounded-xl text-sm font-bold">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col pt-20">
        {/* Header Bar */}
        <div className="bg-slate-900/50 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between z-20">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="font-display font-black text-white text-xl tracking-tight">Real-Time Discovery</h1>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{apartments.length} Properties in Narok</p>
          </div>
          
          <MapFilters />

          <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest">
            <span className="flex items-center gap-2 text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
              Vacant
            </span>
            <span className="flex items-center gap-2 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              Occupied
            </span>
          </div>
        </div>

        <div className="flex-1 flex relative">
          {/* Main Map area */}
          <div className="flex-1 relative bg-slate-950">
            {!isLoaded || loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
                <div className="text-center">
                  <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-3" />
                  <p className="text-slate-400 text-sm font-medium">Loading map...</p>
                </div>
              </div>
            ) : isValidKey ? (
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={14}
                onLoad={onMapLoad}
                onUnmount={onMapUnmount}
                options={mapOptions}
              >
                {/* Safe Marker Rendering */}
                {mapReady && window.google && apartments.length > 0 && apartments.filter(apt => apt.latitude != null && apt.longitude != null).map((apt) => (
                  <MarkerF
                    key={apt.id}
                    position={{ lat: apt.latitude!, lng: apt.longitude! }}
                    onClick={() => setSelected(apt)}
                    icon={{
                      path: window.google.maps.SymbolPath.CIRCLE,
                      scale: apt.vacantCount > 0 ? 12 : 9,
                      fillColor: apt.vacantCount > 0 ? '#EF4444' : '#10B981',
                      fillOpacity: 1,
                      strokeWeight: 2,
                      strokeColor: '#FFFFFF',
                    }}
                  />
                ))}

                {selected && selected.latitude != null && selected.longitude != null && (
                  <InfoWindowF
                    position={{ lat: selected.latitude!, lng: selected.longitude! }}
                    onCloseClick={() => setSelected(null)}
                  >
                    <div className="p-0 min-w-[240px] max-w-[280px]">
                      <div className="rounded-lg overflow-hidden bg-white">
                        <div className="h-28 relative">
                          {selected.images?.[0] ? (
                            <img src={selected.images[0].url} alt={selected.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                              <Home className="w-8 h-8 text-slate-300" />
                            </div>
                          )}
                          <div className="absolute top-2 left-2"><VacancyBadge vacantCount={selected.vacantCount} totalUnits={selected.totalUnits} size="sm" /></div>
                        </div>
                        <div className="p-3">
                          <h3 className="font-display font-bold text-slate-900 text-sm mb-1">{selected.name}</h3>
                          <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                            <div>
                              <p className="text-indigo-600 font-bold text-sm leading-none">{formatPrice(selected.pricePerMonth)}</p>
                              <p className="text-slate-400 text-[10px]">{getHouseTypeLabel(selected.houseType)}</p>
                            </div>
                            <Link href={`/listings/${selected.id}`} className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700">
                              Details <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </InfoWindowF>
                )}
              </GoogleMap>
            ) : (
              <LeafletMap apartments={apartments} selected={selected} setSelected={setSelected} />
            )}
          </div>

          {/* Property List Sidebar */}
          <div className="hidden md:flex flex-col w-80 bg-slate-900 border-l border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <h2 className="text-white font-display font-bold text-sm">All Properties</h2>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="p-8 text-center text-slate-500 text-sm italic">Loading properties...</div>
              ) : (
                <div className="divide-y divide-slate-800/40">
                  {apartments.map(apt => (
                    <button
                      key={apt.id}
                      onClick={() => {
                        setSelected(apt);
                        if (apt.latitude != null && apt.longitude != null) {
                          map?.panTo({ lat: apt.latitude, lng: apt.longitude });
                          map?.setZoom(16);
                        }
                      }}
                      className={`w-full text-left p-4 hover:bg-slate-800/60 transition-all ${selected?.id === apt.id ? 'bg-indigo-500/10 border-l-2 border-indigo-500' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className={`font-semibold text-xs transition-colors ${selected?.id === apt.id ? 'text-white' : 'text-slate-300'}`}>
                          {apt.name}
                        </p>
                        {apt.vacantCount > 0 && (
                          <span className="flex items-center gap-1 text-red-500 text-[10px] font-bold">
                            {apt.vacantCount} 🔴
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-[10px]">{apt.neighborhood} · {formatPrice(apt.pricePerMonth)}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .gm-style-iw { padding: 0 !important; background: transparent !important; box-shadow: none !important; }
        .gm-style-iw-d { overflow: hidden !important; background: white !important; border-radius: 12px !important; }
        .gm-ui-hover-effect { display: none !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
    </div>
  );
}
