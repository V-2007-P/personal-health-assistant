import { useState, useEffect } from 'react';
import { MapPin, Navigation, RefreshCw, Share2, Copy } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import toast from 'react-hot-toast';
import './LocationTrackerPage.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

import FacilityLock from '../components/FacilityLock';

const MapRecenter = ({ center }) => {
  const map = useMap();
  useEffect(() => { map.flyTo(center, 15, { animate: true }); }, [center, map]);
  return null;
};

const LocationTrackerPage = ({ user, onLoginRequest }) => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('Fetching your exact location...');
  const [accuracy, setAccuracy] = useState(null);
  const [status, setStatus] = useState('locating');

  const fetchLocation = () => {
    setStatus('locating');
    setAddress('Fetching your exact location...');
    navigator.geolocation?.getCurrentPosition(async pos => {
      const { latitude: lat, longitude: lng, accuracy: acc } = pos.coords;
      setLocation([lat, lng]);
      setAccuracy(acc.toFixed(0));
      setStatus('found');
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        setAddress(data.display_name);
      } catch {
        setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    }, () => { setStatus('denied'); setAddress('Location access denied. Please allow permissions.'); },
    { enableHighAccuracy: true });
  };

  useEffect(() => {
    setTimeout(fetchLocation, 0);
  }, []);

  // Auto-pop login for guests
  useEffect(() => {
    if (!user && onLoginRequest) onLoginRequest();
  }, []);

  const copyCoords = () => {
    if (!location) return;
    navigator.clipboard.writeText(`${location[0].toFixed(6)}, ${location[1].toFixed(6)}`);
    toast.success('Coordinates copied to clipboard!');
  };

  const shareLocation = () => {
    if (!location) return;
    const link = `https://www.google.com/maps?q=${location[0]},${location[1]}`;
    if (navigator.share) {
      navigator.share({ title: '📍 My Location', text: `My live location: ${link}`, url: link });
    } else {
      window.open(`mailto:?subject=My Live Location&body=Here is my location: ${link}`, '_blank');
      toast.success('Opened email with your location');
    }
  };

  return (
    <div className="location-page" style={{ position: 'relative' }}>
      {!user && <FacilityLock onLoginRequest={onLoginRequest} featureName="GPS Tracking" />}
      <div className="location-header">
        <div className="location-title-row">
          <div className="location-icon-badge"><MapPin size={22} /></div>
          <div>
            <h2 className="location-title">Location Tracker</h2>
            <div className="location-sub">Real-time GPS tracking</div>
          </div>
        </div>
        <div className={`location-status-pill ${status}`}>
          {status === 'locating' ? '📡 Locating...' : status === 'found' ? '✅ GPS Found' : '❌ Denied'}
        </div>
      </div>

      {/* Map */}
      <div className="location-map-container">
        {location ? (
          <MapContainer center={location} zoom={15} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
            <MapRecenter center={location} />
            <Marker position={location}>
              <Popup>📍 You are here</Popup>
            </Marker>
          </MapContainer>
        ) : (
          <div className="location-map-placeholder">
            <div className="loc-pulse-icon"><MapPin size={40} /></div>
            <p>{status === 'denied' ? 'Location access denied' : 'Locating you...'}</p>
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="location-info-grid">
        <div className="location-info-card">
          <div className="loc-info-label">Latitude</div>
          <div className="loc-info-value">{location ? `${location[0].toFixed(6)}°` : '---'}</div>
        </div>
        <div className="location-info-card">
          <div className="loc-info-label">Longitude</div>
          <div className="loc-info-value">{location ? `${location[1].toFixed(6)}°` : '---'}</div>
        </div>
        <div className="location-info-card">
          <div className="loc-info-label">Accuracy</div>
          <div className="loc-info-value">{accuracy ? `±${accuracy}m` : '---'}</div>
        </div>
      </div>

      {/* Address */}
      <div className="location-address-bar">
        <MapPin size={16} color="#8A2BE2" />
        <span>{address}</span>
      </div>

      {/* Action Buttons */}
      <div className="location-actions">
        <button className="loc-action-btn refresh" onClick={fetchLocation}>
          <RefreshCw size={16} /> Refresh
        </button>
        <button className="loc-action-btn copy" onClick={copyCoords}>
          <Copy size={16} /> Copy Coords
        </button>
        <button className="loc-action-btn share" onClick={shareLocation}>
          <Share2 size={16} /> Share
        </button>
        {location && (
          <button className="loc-action-btn maps" onClick={() => window.open(`https://www.google.com/maps?q=${location[0]},${location[1]}`, '_blank')}>
            <Navigation size={16} /> Open in Maps
          </button>
        )}
      </div>
    </div>
  );
};

export default LocationTrackerPage;
