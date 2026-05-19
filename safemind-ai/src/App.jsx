import { useState, useEffect } from 'react';
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
import toast, { Toaster } from 'react-hot-toast';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('safemind_user');
      if (savedUser && savedUser !== 'undefined') {
        return JSON.parse(savedUser);
      }
    } catch {
      localStorage.removeItem('safemind_user');
    }
    return null;
  });

  const [activeNav, setActiveNav] = useState('Dashboard');
  const [isEmergency, setIsEmergency] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Auto-pop login modal when guest user navigates to any feature page
  useEffect(() => {
    if (!user && activeNav !== 'Dashboard') {
      setShowLoginModal(true);
    }
  }, [activeNav, user]);

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
      
      {/* Show AuthPage only when explicitly requested via Login button */}
      {showLoginModal && (
        <AuthPage 
          onLogin={(data) => {
            handleLogin(data);
            setShowLoginModal(false);
          }} 
          onClose={() => setShowLoginModal(false)}
          isModal={true}
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
        <TopNavbar 
          isDark={isDark} 
          toggleTheme={toggleTheme} 
          user={user} 
          onLoginRequest={() => setShowLoginModal(true)} 
          onDummyLogin={() => {
            handleLogin({ name: 'Aditya (Demo)', email: 'demo@safemind.ai' });
            toast.success('🛡️ Welcome! You are logged in as Demo user.', {
              style: { background: '#1a1a2e', color: '#fff', border: '1px solid rgba(138,43,226,0.3)' },
              duration: 3000
            });
          }}
        />
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
