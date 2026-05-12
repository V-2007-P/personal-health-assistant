import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Cross } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './RightPanel.css';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to recenter map dynamically
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
};

const RightPanel = ({ isEmergency, setIsEmergency }) => {
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(5);
  
  // New States for Geolocation and API
  const [userLocation, setUserLocation] = useState([28.6304, 77.2177]);
  const [address, setAddress] = useState({ main: 'Locating...', sub: 'Please allow location access' });
  const [hospitals, setHospitals] = useState([]);
  const [isLocating, setIsLocating] = useState(true);

  // Geolocation and API logic
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation([lat, lng]);
        
        // 1. Reverse Geocode for Address
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await res.json();
          const main = data.address.road || data.address.suburb || data.address.city || 'Current Location';
          const sub = `${data.address.state || ''}, ${data.address.country || ''} - ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;
          setAddress({ main, sub });
        } catch {
          setAddress({ main: 'Location Found', sub: `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E` });
        }

        // 2. Fetch Nearby Hospitals using Overpass API
        try {
          const query = `
            [out:json];
            (
              node["amenity"="hospital"](around:5000, ${lat}, ${lng});
              way["amenity"="hospital"](around:5000, ${lat}, ${lng});
              relation["amenity"="hospital"](around:5000, ${lat}, ${lng});
            );
            out center;
          `;
          const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
          const overpassRes = await fetch(overpassUrl);
          const overpassData = await overpassRes.json();
          
          const parsedHospitals = overpassData.elements.map(el => {
            const hLat = el.lat || el.center?.lat;
            const hLng = el.lon || el.center?.lon;
            const name = el.tags?.name || 'General Hospital';
            
            // Haversine distance calc in km
            const R = 6371; 
            const dLat = (hLat - lat) * Math.PI / 180;
            const dLon = (hLng - lng) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(lat * Math.PI / 180) * Math.cos(hLat * Math.PI / 180) *
                      Math.sin(dLon/2) * Math.sin(dLon/2);
            const dist = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
            
            return { id: el.id, name, lat: hLat, lng: hLng, dist: dist.toFixed(1) };
          }).sort((a, b) => a.dist - b.dist).slice(0, 3);

          setHospitals(parsedHospitals);
        } catch {
          console.error("Failed to fetch hospitals");
        } finally {
          setIsLocating(false);
        }
      }, () => {
        setAddress({ main: 'Location Denied', sub: 'Please enable location permissions in your browser' });
        setIsLocating(false);
      });
    } else {
      setTimeout(() => {
        setAddress({ main: 'Unsupported Browser', sub: 'Geolocation is not supported' });
        setIsLocating(false);
      }, 0);
    }
  }, []);

  useEffect(() => {
    let timer;
    if (showModal && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (showModal && countdown === 0) {
      setIsEmergency(true);
      if (showModal) setTimeout(() => setShowModal(false), 0);
    }
    return () => clearTimeout(timer);
  }, [showModal, countdown, setIsEmergency]);

  const handleSOSClick = () => {
    if (isEmergency) {
      setIsEmergency(false);
      return;
    }
    setCountdown(5);
    setShowModal(true);
  };

  const cancelEmergency = () => {
    setShowModal(false);
    setCountdown(5);
  };

  return (
    <div className="right-panel" style={{ position: 'relative' }}>
      
      {showModal && (
        <div className="sos-modal-overlay">
          <div className="sos-modal-content">
            <AlertTriangle size={48} color="#FF3B30" />
            <h2>SENDING SOS ALERT</h2>
            <div className="countdown-circle">{countdown}</div>
            <p>Your location and audio will be shared with authorities.</p>
            <button className="cancel-btn" onClick={cancelEmergency}>CANCEL</button>
          </div>
        </div>
      )}

      <div className="sos-card" style={isEmergency ? { background: 'rgba(255,59,48,0.1)', borderColor: '#FF3B30', boxShadow: '0 0 20px rgba(255,59,48,0.3)' } : {}}>
        <div className="sos-card-header">
          <div className="sos-title"><AlertTriangle size={16} /> Emergency Mode</div>
          <div className="sos-label-right" style={isEmergency ? {color: '#FF3B30'} : {}}>SOS</div>
        </div>
        <div className="sos-button-wrapper" onClick={handleSOSClick} style={{ cursor: 'pointer' }}>
          <div className="sos-pulse-ring" style={isEmergency ? { borderColor: '#FF3B30', animation: 'pulse 1s infinite' } : {}}></div>
          <div className="sos-pulse-ring" style={isEmergency ? { borderColor: '#FF3B30', animation: 'pulse 1.5s infinite' } : {}}></div>
          <div className="sos-button" style={isEmergency ? { background: '#FF3B30', boxShadow: '0 0 30px #FF3B30' } : {}}>
            {isEmergency ? 'STOP' : 'SOS'}
          </div>
        </div>
        <div className="sos-text">{isEmergency ? 'Emergency Alert Active' : 'Tap to send emergency alert'}</div>
        <div className="sos-subtext"><CheckCircle2 size={12} /> Your location {isEmergency ? 'is being' : 'will be'} shared</div>
      </div>

      <div className="location-card">
        <div className="card-header">
          <div className="card-title">Live Location</div>
          <div className="live-badge" style={{ animation: 'pulse 2s infinite' }}>{isLocating ? 'Locating...' : 'Live'}</div>
        </div>
        <div className="map-preview-container" style={{ height: '140px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)' }}>
          <MapContainer center={userLocation} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            <MapUpdater center={userLocation} />
            <Marker position={userLocation}>
              <Popup>You are here</Popup>
            </Marker>
            {hospitals.map(h => (
              <Marker key={h.id} position={[h.lat, h.lng]}>
                <Popup>{h.name}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        <div>
          <div className="location-address">{address.main}</div>
          <div className="location-subaddress">{address.sub}</div>
        </div>
      </div>

      <div className="services-card">
        <div className="card-header">
          <div className="card-title">Nearby Hospitals</div>
        </div>
        <div className="services-list">
          {isLocating ? (
            <div className="service-sub" style={{ textAlign: 'center', padding: '20px 0' }}>Scanning area for services...</div>
          ) : hospitals.length > 0 ? (
            hospitals.map(h => (
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="service-item" 
                key={h.id}
                style={{ textDecoration: 'none', cursor: 'pointer', transition: 'background 0.2s', padding: '8px', borderRadius: '12px', margin: '-8px' }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div className="service-info">
                  <div className="service-icon icon-hospital">
                    <Cross size={14} />
                  </div>
                  <div>
                    <div className="service-name" style={{ maxWidth: '160px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.name}</div>
                    <div className="service-sub" style={{ color: '#007AFF', fontWeight: 600 }}>Get Directions</div>
                  </div>
                </div>
                <div className="service-dist">{h.dist} km</div>
              </a>
            ))
          ) : (
            <div className="service-sub" style={{ textAlign: 'center', padding: '20px 0' }}>No hospitals found nearby.</div>
          )}
        </div>
        <button 
          className="view-all-btn" 
          onClick={() => window.open(`https://www.google.com/maps/search/hospitals/@${userLocation[0]},${userLocation[1]},14z`, '_blank')}
        >
          View All Services on Map
        </button>
      </div>
    </div>
  );
};

export default RightPanel;
