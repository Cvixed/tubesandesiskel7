import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom pulse marker for user location
const createPulseIcon = () => {
  return L.divIcon({
    className: '',
    html: `
      <div style="position: relative; width: 20px; height: 20px;">
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 14px; height: 14px; background: #3b82f6; border: 3px solid #fff; border-radius: 50%; box-shadow: 0 0 8px rgba(59,130,246,0.6); z-index: 2;"></div>
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 40px; height: 40px; background: rgba(59,130,246,0.2); border-radius: 50%; animation: pulse-ring 2s ease-out infinite; z-index: 1;"></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// Component to fly map to user location
const FlyToLocation = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 8, { duration: 1.5 });
    }
  }, [position, map]);
  return null;
};

const RainRadarMap = ({ cuaca, isNightMode }) => {
  const isDark = isNightMode || cuaca?.toLowerCase() === 'hujan';

  const [radarFrames, setRadarFrames] = useState([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [radarHost, setRadarHost] = useState('');
  const [userPosition, setUserPosition] = useState(null);
  const [locationName, setLocationName] = useState('Mendeteksi lokasi...');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const playIntervalRef = useRef(null);

  // Default center: Indonesia
  const defaultCenter = [-6.2, 106.8];

  // Fetch radar data from RainViewer
  const fetchRadarData = useCallback(async () => {
    try {
      const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
      const data = await res.json();
      setRadarHost(data.host);
      const frames = data.radar?.past || [];
      setRadarFrames(frames);
      setCurrentFrameIndex(frames.length - 1); // show latest frame
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch radar data:', err);
      setError('Gagal memuat data radar hujan');
      setIsLoading(false);
    }
  }, []);

  // Get user geolocation
  useEffect(() => {
    fetchRadarData();
    // Refresh radar data every 5 minutes
    const refreshInterval = setInterval(fetchRadarData, 5 * 60 * 1000);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserPosition([latitude, longitude]);
          setLocationName(`${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`);
        },
        (err) => {
          console.warn('Geolocation denied:', err.message);
          setLocationName('Lokasi tidak tersedia');
          setUserPosition(defaultCenter);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setUserPosition(defaultCenter);
      setLocationName('Geolocation tidak didukung');
    }

    return () => clearInterval(refreshInterval);
  }, [fetchRadarData]);

  // Playback animation
  useEffect(() => {
    if (isPlaying && radarFrames.length > 0) {
      playIntervalRef.current = setInterval(() => {
        setCurrentFrameIndex(prev => (prev + 1) % radarFrames.length);
      }, 500);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, radarFrames.length]);

  const currentFrame = radarFrames[currentFrameIndex];
  const radarTileUrl = currentFrame
    ? `${radarHost}${currentFrame.path}/256/{z}/{x}/{y}/2/1_1.png`
    : null;

  // Format timestamp from frame
  const getFrameTime = (frame) => {
    if (!frame) return '-';
    const date = new Date(frame.time * 1000);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  // Dark map tiles
  const mapTileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const mapAttribution = isDark
    ? '&copy; <a href="https://carto.com/">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

  if (error) {
    return (
      <div className={`rounded-3xl p-6 mb-8 transition-all duration-500 ${isDark ? 'glass-panel-dark text-white' : 'glass-panel text-slate-800'}`}>
        <h3 className="text-lg font-bold mb-2">🗺️ Peta Radar Hujan</h3>
        <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-500'}`}>{error}</p>
      </div>
    );
  }

  return (
    <div className={`rounded-3xl overflow-hidden mb-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${isDark ? 'glass-panel-dark text-white' : 'glass-panel text-slate-800'}`}>
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              🗺️ Peta Radar Hujan
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
            </h3>
            <p className={`text-sm ${isDark ? 'text-blue-200' : 'text-slate-500'}`}>
              Curah hujan real-time dari radar cuaca
            </p>
          </div>
          <div className={`text-right text-xs ${isDark ? 'text-blue-200/70' : 'text-slate-400'}`}>
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{locationName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="relative" style={{ height: '350px' }}>
        {isLoading && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-white text-sm font-medium">Memuat radar...</span>
            </div>
          </div>
        )}
        <MapContainer
          center={userPosition || defaultCenter}
          zoom={7}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          {/* Base Map */}
          <TileLayer url={mapTileUrl} attribution={mapAttribution} />

          {/* Radar Overlay */}
          {radarTileUrl && (
            <TileLayer
              url={radarTileUrl}
              opacity={0.65}
              zIndex={2}
              attribution='<a href="https://www.rainviewer.com/">RainViewer</a>'
            />
          )}

          {/* User Location Marker */}
          {userPosition && (
            <>
              <FlyToLocation position={userPosition} />
              <Marker position={userPosition} icon={createPulseIcon()}>
                <Popup>
                  <div className="text-center font-sans">
                    <strong>📍 Lokasi Anda</strong>
                    <br />
                    <span className="text-xs text-gray-500">{locationName}</span>
                  </div>
                </Popup>
              </Marker>
            </>
          )}
        </MapContainer>
      </div>

      {/* Playback Controls */}
      <div className={`px-5 py-3 border-t ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-white/40'}`}>
        <div className="flex items-center gap-3">
          {/* Play/Pause Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200
              ${isPlaying 
                ? (isDark ? 'bg-blue-500/30 text-blue-300 hover:bg-blue-500/40' : 'bg-blue-100 text-blue-600 hover:bg-blue-200')
                : (isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
              }`}
            title={isPlaying ? 'Pause' : 'Play animasi radar'}
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Timeline Slider */}
          <div className="flex-1">
            <input
              type="range"
              min={0}
              max={Math.max(0, radarFrames.length - 1)}
              value={currentFrameIndex}
              onChange={(e) => {
                setCurrentFrameIndex(parseInt(e.target.value));
                setIsPlaying(false);
              }}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-blue-500"
              style={{
                background: isDark
                  ? `linear-gradient(to right, #3b82f6 ${(currentFrameIndex / Math.max(1, radarFrames.length - 1)) * 100}%, rgba(255,255,255,0.15) 0%)`
                  : `linear-gradient(to right, #3b82f6 ${(currentFrameIndex / Math.max(1, radarFrames.length - 1)) * 100}%, #e2e8f0 0%)`
              }}
            />
          </div>

          {/* Timestamp */}
          <div className={`flex-shrink-0 text-xs font-mono px-2.5 py-1 rounded-full ${isDark ? 'bg-white/10 text-blue-200' : 'bg-gray-100 text-gray-600'}`}>
            {getFrameTime(currentFrame)}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-2.5">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] uppercase tracking-wider font-semibold ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Intensitas:</span>
            <div className="flex items-center gap-1">
              <div className="flex h-2.5 rounded-full overflow-hidden">
                <div className="w-5 bg-[#78c7ff]"></div>
                <div className="w-5 bg-[#2096ff]"></div>
                <div className="w-5 bg-[#0060e0]"></div>
                <div className="w-5 bg-[#ffff00]"></div>
                <div className="w-5 bg-[#ff9900]"></div>
                <div className="w-5 bg-[#ff0000]"></div>
              </div>
              <div className="flex justify-between w-14">
                <span className={`text-[9px] ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Ringan</span>
                <span className={`text-[9px] ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Lebat</span>
              </div>
            </div>
          </div>
          <a
            href="https://www.rainviewer.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={`text-[10px] ${isDark ? 'text-white/30 hover:text-white/50' : 'text-gray-300 hover:text-gray-400'} transition-colors`}
          >
            © RainViewer
          </a>
        </div>
      </div>
    </div>
  );
};

export default RainRadarMap;
