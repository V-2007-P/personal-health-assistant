import { } from 'react';
import { Search, Sun, Moon, Bell } from 'lucide-react';
import './TopNavbar.css';

const TopNavbar = ({ isDark, toggleTheme, user, onLoginRequest }) => {
  return (
    <div className="top-nav">
      <div className="search-bar">
        <Search size={18} color="#A0A5C0" />
        <input type="text" placeholder="Search anything..." />
      </div>
      <div className="nav-actions">
        {!user && (
          <button className="nav-login-btn" onClick={onLoginRequest}>
            Login
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


