import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import MainContent from './components/MainContent';
import RightPanel from './components/RightPanel';
import BottomInfoBar from './components/BottomInfoBar';
import IncidentReportsPage from './pages/IncidentReportsPage';
import EmergencyPage from './pages/EmergencyPage';
import HealthAssistantPage from './pages/HealthAssistantPage';
import LocationTrackerPage from './pages/LocationTrackerPage';
import TranslatePage from './pages/TranslatePage';
import AuthPage from './pages/AuthPage';
import { Toaster } from 'react-hot-toast';

function App() {
  const [user, setUser] = useState(null);
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [isEmergency, setIsEmergency] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('safemind_user');
      if (savedUser && savedUser !== 'undefined') {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      localStorage.removeItem('safemind_user');
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('safemind_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('safemind_user');
  };

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
  };

  const renderMainContent = () => {
    // If not logged in, show a "blurred" or "demo" version of the content
    // and trigger the login modal when facilities are clicked.
    
    switch (activeNav) {
      case 'Incident Reports':  return <IncidentReportsPage user={user} onLoginRequest={() => setShowLoginModal(true)} />;
      case 'Emergency':         return <EmergencyPage isEmergency={isEmergency} setIsEmergency={setIsEmergency} user={user} onLoginRequest={() => setShowLoginModal(true)} />;
      case 'Health Assistant':  return <HealthAssistantPage user={user} onLoginRequest={() => setShowLoginModal(true)} />;
      case 'Location Tracker':  return <LocationTrackerPage user={user} onLoginRequest={() => setShowLoginModal(true)} />;
      case 'Translate':         return <TranslatePage user={user} onLoginRequest={() => setShowLoginModal(true)} />;
      default:                  return <MainContent isEmergency={isEmergency} setIsEmergency={setIsEmergency} user={user} onLoginRequest={() => setShowLoginModal(true)} />;
    }
  };

  const showRightPanel = activeNav === 'Dashboard';

  return (
    <div className={`dashboard-container ${!user ? 'demo-mode' : ''}`}>
      <Toaster position="top-right" />
      
      {/* Show AuthPage as a Modal if not logged in or explicitly requested */}
      {(!user || showLoginModal) && (
        <AuthPage 
          onLogin={(data) => {
            handleLogin(data);
            setShowLoginModal(false);
          }} 
          onClose={() => user && setShowLoginModal(false)}
          isModal={!!user}
        />
      )}

      <Sidebar 
        activeNav={activeNav} 
        setActiveNav={setActiveNav} 
        isEmergency={isEmergency}
        user={user}
        onLogout={handleLogout}
        onLoginRequest={() => setShowLoginModal(true)}
      />

      <div className="right-wrapper">
        <TopNavbar isDark={isDark} toggleTheme={toggleTheme} user={user} onLoginRequest={() => setShowLoginModal(true)} />
        <div className={`center-and-right ${!showRightPanel ? 'full-width' : ''}`}>
          {renderMainContent()}
          {showRightPanel && <RightPanel isEmergency={isEmergency} setIsEmergency={setIsEmergency} user={user} onLoginRequest={() => setShowLoginModal(true)} />}
        </div>
        <BottomInfoBar />
      </div>
    </div>
  );
}

export default App;
