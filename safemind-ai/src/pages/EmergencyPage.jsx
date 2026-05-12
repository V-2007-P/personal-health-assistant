import { useState, useEffect } from 'react';
import { AlertTriangle, Phone, MapPin, Radio, CheckCircle2, Siren } from 'lucide-react';
import toast from 'react-hot-toast';
import './EmergencyPage.css';

import FacilityLock from '../components/FacilityLock';

const EMERGENCY_CONTACTS = [
  { name: 'Police', number: '100', color: '#007AFF', emoji: '🚔' },
  { name: 'Ambulance', number: '108', color: '#34C759', emoji: '🚑' },
  { name: 'Fire', number: '101', color: '#FF3B30', emoji: '🚒' },
  { name: 'Women Helpline', number: '1091', color: '#8A2BE2', emoji: '🛡️' },
  { name: 'Child Helpline', number: '1098', color: '#FF9500', emoji: '👶' },
  { name: 'Disaster Mgmt', number: '1078', color: '#5856D6', emoji: '⛑️' },
];

const EmergencyPage = ({ isEmergency, setIsEmergency, user, onLoginRequest }) => {
  const [location, setLocation] = useState(null);
  const [locationText, setLocationText] = useState('Fetching your location...');
  const [countdown, setCountdown] = useState(null);
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(pos => {
      const { latitude: lat, longitude: lng } = pos.coords;
      setLocation({ lat, lng });
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(r => r.json())
        .then(d => setLocationText(d.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`))
        .catch(() => setLocationText(`${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`));
    }, () => setLocationText('Location access denied'));
  }, []);

  const callNumber = (number, name) => {
    window.location.assign(`tel:${number}`);
    toast.success(`Calling ${name} (${number})...`, { duration: 3000 });
  };

  const triggerSOS = () => {
    if (isEmergency) {
      setIsEmergency(false);
      if (timer) clearInterval(timer);
      setCountdown(null);
      toast.success('Emergency deactivated.');
      return;
    }
    let c = 3;
    setCountdown(c);
    const t = setInterval(() => {
      c--;
      setCountdown(c);
      if (c === 0) {
        clearInterval(t);
        setCountdown(null);
        setIsEmergency(true);
        toast.error('🚨 SOS ACTIVATED — Authorities being notified!', { duration: 5000 });
      }
    }, 1000);
    setTimer(t);
  };

  const shareLocation = () => {
    if (!location) { toast.error('Location not available yet'); return; }
    const link = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
    if (navigator.share) {
      navigator.share({ title: '🆘 SOS Location', text: `I need help! My location: ${link}`, url: link });
    } else {
      window.open(`mailto:?subject=🆘 Emergency SOS&body=I need immediate help! My location: ${link}`, '_blank');
      toast.success('Opened email with your location');
    }
  };

  return (
    <div className="emergency-page" style={{ position: 'relative' }}>
      {!user && <FacilityLock onLoginRequest={onLoginRequest} featureName="Emergency SOS" />}
      {/* SOS Countdown Overlay */}
      {countdown !== null && (
        <div className="sos-countdown-overlay">
          <div className="sos-countdown-box">
            <AlertTriangle size={40} color="#FF3B30" />
            <h2>ACTIVATING SOS IN</h2>
            <div className="sos-countdown-num">{countdown}</div>
            <button className="sos-cancel-countdown" onClick={() => { if (timer) clearInterval(timer); setCountdown(null); toast('SOS cancelled'); }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="emergency-header">
        <div className="emergency-title-row">
          <div className="emergency-icon-badge">
            <AlertTriangle size={22} />
          </div>
          <div>
            <h2 className="emergency-title">Emergency Control</h2>
            <div className="emergency-sub">One tap to get immediate help</div>
          </div>
        </div>
        <div className={`emergency-status-pill ${isEmergency ? 'active' : 'safe'}`}>
          {isEmergency ? <><Radio size={12} /> ACTIVE</> : <><CheckCircle2 size={12} /> SAFE</>}
        </div>
      </div>

      {/* Big SOS Button */}
      <div className="sos-center">
        <div className="sos-rings-container" onClick={triggerSOS}>
          <div className={`sos-ring r1 ${isEmergency ? 'sos-pulsing' : ''}`} />
          <div className={`sos-ring r2 ${isEmergency ? 'sos-pulsing' : ''}`} />
          <div className={`sos-ring r3 ${isEmergency ? 'sos-pulsing' : ''}`} />
          <div className={`sos-big-btn ${isEmergency ? 'sos-active' : ''}`}>
            <Siren size={36} />
            <span>{isEmergency ? 'STOP' : 'SOS'}</span>
            <small>{isEmergency ? 'Tap to deactivate' : 'Hold for emergency'}</small>
          </div>
        </div>
      </div>

      {/* Location Bar */}
      <div className="emergency-location-bar">
        <MapPin size={16} color="#8A2BE2" />
        <span>{locationText}</span>
        {location && (
          <button className="share-loc-btn" onClick={shareLocation}>Share</button>
        )}
      </div>

      {/* Emergency Numbers */}
      <div className="emergency-contacts-section">
        <div className="emergency-section-title">Emergency Numbers</div>
        <div className="emergency-contacts-grid">
          {EMERGENCY_CONTACTS.map(c => (
            <button
              key={c.number}
              className="emergency-contact-card"
              style={{ borderColor: `${c.color}30`, '--contact-color': c.color }}
              onClick={() => callNumber(c.number, c.name)}
            >
              <span className="contact-emoji">{c.emoji}</span>
              <span className="contact-name">{c.name}</span>
              <span className="contact-number" style={{ color: c.color }}>{c.number}</span>
              <div className="contact-call-label"><Phone size={12} /> Call</div>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="emergency-actions-row">
        <button className="emergency-action-btn share" onClick={shareLocation}>
          <MapPin size={16} /> Share Location
        </button>
        <button className="emergency-action-btn call" onClick={() => callNumber('112', 'Universal Emergency')}>
          <Phone size={16} /> Call 112
        </button>
      </div>
    </div>
  );
};

export default EmergencyPage;
