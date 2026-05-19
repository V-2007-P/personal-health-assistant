import { Search, Sun, Moon, Bell, LogOut, User } from 'lucide-react';
import './TopNavbar.css';

const TopNavbar = ({ isDark, toggleTheme, user, onLoginRequest, onDummyLogin }) => {

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="top-nav">
      <div className="search-bar">
        <Search size={18} color="#A0A5C0" />
        <input type="text" placeholder="Search anything..." />
      </div>
      <div className="nav-actions">
        {user ? (
          <div className="nav-user-info">
            <img
              src={`https://ui-avatars.com/api/?name=${user.name}&background=8A2BE2&color=fff&size=32`}
              alt={user.name}
              className="nav-avatar"
            />
            <span className="nav-user-name">{getGreeting()}, {user.name.split(' ')[0]}</span>
          </div>
        ) : (
          <button className="nav-login-btn" onClick={onDummyLogin}>
            <User size={14} />
            Quick Login
          </button>
        )}
        <button
          className={`light-toggle ${isDark ? 'dark-mode' : ''}`}
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Moon size={16} /> : <Sun size={16} />}
          <span>{isDark ? 'Dark' : 'Light'}</span>
        </button>
        <div className="bell-btn">
          <Bell size={18} />
          <span className="badge">3</span>
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;
