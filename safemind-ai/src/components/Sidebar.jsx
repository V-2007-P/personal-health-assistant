import React from 'react';
import { Shield, LayoutDashboard, ClipboardList, HeartPulse, MapPin, Languages, Bell, ShieldCheck, ChevronDown, AlertTriangle } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ activeNav, setActiveNav, isEmergency, user, onLogout, onLoginRequest }) => {
  const menuItems = [
    { id: 'Dashboard',        icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'Emergency',        icon: Bell,            label: 'Emergency',       badge: 'SOS' },
    { id: 'Health Assistant', icon: HeartPulse,      label: 'Health' },
    { id: 'Location Tracker', icon: MapPin,          label: 'Location' },
    { id: 'Translate',        icon: Languages,       label: 'Translate' },
    { id: 'Incident Reports', icon: ClipboardList,   label: 'Reports' },
  ];

  return (
    <>
      {/* ── Desktop / Tablet Sidebar ── */}
      <div className="sidebar-container" style={isEmergency ? { border: '1px solid #FF3B30', boxShadow: '0 0 20px rgba(255,59,48,0.2)' } : {}}>
        <div>
          <div className="sidebar-header">
            <div className="logo-shield">
              <ShieldCheck size={20} />
            </div>
            <div className="sidebar-brand-text">
              <div className="brand-name">SafeMind AI</div>
              <div className="brand-subtitle">Your Intelligent Guardian</div>
            </div>
          </div>

          <div className="nav-menu">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
                onClick={() => setActiveNav(item.id)}
                data-label={item.id}
              >
                <item.icon size={18} className="nav-icon" />
                <span className="nav-label">{item.id === 'Health Assistant' ? 'Health Assistant' : item.id === 'Location Tracker' ? 'Location Tracker' : item.id === 'Incident Reports' ? 'Incident Reports' : item.label}</span>
                {item.badge && <span className="sos-badge">{item.badge}</span>}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="system-status" style={isEmergency ? { borderColor: 'rgba(255,59,48,0.5)', background: 'rgba(255,59,48,0.1)' } : {}}>
            <div className="status-header">
              <div className="status-dot" style={isEmergency ? { background: '#FF3B30' } : {}}></div>
              {isEmergency ? 'EMERGENCY ACTIVE' : 'All Systems Operational'}
            </div>
            <div className="shield-graphic">
              <div className="shield-rings" style={isEmergency ? { borderColor: 'rgba(255,59,48,0.5)' } : {}}></div>
              <div className="shield-rings" style={{ width: '120px', height: '60px', opacity: 0.5, borderColor: isEmergency ? 'rgba(255,59,48,0.3)' : 'rgba(138, 43, 226, 0.3)' }}></div>
              {isEmergency ?
                <AlertTriangle size={32} className="shield-icon-center" color="#FF3B30" style={{ filter: 'drop-shadow(0 0 10px rgba(255,59,48,0.6))' }} /> :
                <Shield size={32} className="shield-icon-center" fill="rgba(138,43,226,0.2)" />
              }
            </div>
            <div className="status-details">
              <div className="status-row">
                <span>AI Model</span>
              </div>
              <div className="status-row">
                <span className={isEmergency ? "val-red" : "val-purple"} style={isEmergency ? {color: '#FF3B30', fontWeight: 600} : {}}>Gemma 4 (Google)</span>
              </div>
              <div className="status-row" style={{ marginTop: '8px' }}>
                <span>Response Time</span>
                <span className="val-green" style={isEmergency ? {color: '#FF3B30'} : {}}>{isEmergency ? '0.5s' : '1.2s'}</span>
              </div>
            </div>
          </div>

          <div 
            className="user-profile" 
            onClick={user ? onLogout : onLoginRequest} 
            title={user ? "Click to Logout" : "Click to Login"}
          >
            <img 
              src={`https://ui-avatars.com/api/?name=${user?.name || 'Guest User'}&background=${user ? '8A2BE2' : '7A7E9A'}&color=fff`} 
              alt="User" 
              className="avatar" 
            />
            <div className="user-info">
              <div className="user-name">
                {user?.name || 'Guest User'} 
                {user ? <span className="premium-badge">Premium</span> : <span className="guest-badge">Demo</span>}
              </div>
            </div>
            {user ? <ChevronDown size={16} className="chevron-down" /> : <ShieldCheck size={16} className="chevron-down" color="#8A2BE2" />}
          </div>
        </div>
      </div>


      {/* ── Mobile Bottom Navigation Bar ── */}
      <nav className={`mobile-bottom-nav ${isEmergency ? 'emergency-active' : ''}`}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`mobile-nav-item ${activeNav === item.id ? 'active' : ''} ${item.badge ? 'has-sos' : ''}`}
            onClick={() => setActiveNav(item.id)}
          >
            <div className="mobile-nav-icon-wrap">
              <item.icon size={20} />
              {item.badge && <span className="mobile-sos-dot" />}
            </div>
            <span className="mobile-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
};

export default Sidebar;


