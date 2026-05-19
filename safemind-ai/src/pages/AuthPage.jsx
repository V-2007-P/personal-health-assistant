import { useState, useEffect, useRef } from 'react';
import { Mail, Lock, User, ArrowRight, X, Eye, EyeOff, Fingerprint, Zap, Activity, Globe, Cpu, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import './AuthPage.css';

const AuthPage = ({ onLogin, onClose, isModal }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [scanLine, setScanLine] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
    const interval = setInterval(() => {
      setScanLine(prev => (prev >= 100 ? 0 : prev + 0.5));
    }, 30);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouse = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100
        });
      }
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const handleDemoLogin = () => {
    setEmail('demo@safemind.ai');
    setPassword('password123');
    toast.success('🔑 Demo credentials loaded!', {
      style: { background: '#1a1a2e', color: '#fff', border: '1px solid rgba(138,43,226,0.3)' },
      iconTheme: { primary: '#8A2BE2', secondary: '#fff' }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (email === 'demo@safemind.ai' && password === 'password123') {
        toast.success('🛡️ Authentication successful. Welcome, Commander.', {
          style: { background: '#1a1a2e', color: '#fff', border: '1px solid rgba(138,43,226,0.3)' },
          duration: 3000
        });
        onLogin({ name: isLogin ? 'Aditya' : name, email });
      } else {
        toast.error('⚠️ Access denied. Use Demo Credentials.', {
          style: { background: '#1a1a2e', color: '#FF6B6B', border: '1px solid rgba(255,59,48,0.3)' }
        });
      }
      setIsLoading(false);
    }, 2000);
  };

  const stats = [
    { icon: Activity, label: 'Uptime', value: '99.97%' },
    { icon: Globe, label: 'Coverage', value: 'Global' },
    { icon: Cpu, label: 'AI Model', value: 'Gemma 3' },
    { icon: Zap, label: 'Response', value: '<0.5s' },
  ];

  return (
    <div className={`auth-overlay ${isModal ? 'is-modal' : ''} ${mounted ? 'mounted' : ''}`} ref={containerRef}>
      
      {/* === Animated Background === */}
      <div className="auth-bg-layer">
        <div className="auth-bg-gradient" style={{
          background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(138,43,226,0.15) 0%, transparent 50%)`
        }} />
        <div className="auth-grid-overlay" />
        <div className="auth-scan-line" style={{ top: `${scanLine}%` }} />
        
        {/* Floating Orbs */}
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
        
        {/* Particle Field */}
        {[...Array(20)].map((_, i) => (
          <div key={i} className="auth-particle" style={{
            left: `${(i * 7.7) % 100}%`,
            top: `${(i * 13.3) % 100}%`,
            animationDelay: `${(i * 0.4) % 8}s`,
            animationDuration: `${4 + (i * 0.3) % 6}s`
          }} />
        ))}
      </div>

      {/* === Main Container === */}
      <div className={`auth-container ${mounted ? 'fade-in' : ''}`}>

        {isModal && (
          <button className="auth-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        )}

        {/* ── Left: Cinematic Visual Panel ── */}
        <div className="auth-visual-side">
          <div className="visual-inner">
            {/* Orbital Rings */}
            <div className="orbital-system">
              <div className="orbital-ring orbital-ring-1" />
              <div className="orbital-ring orbital-ring-2" />
              <div className="orbital-ring orbital-ring-3" />
              <div className="orbital-core">
                <ShieldCheck size={48} strokeWidth={1.5} />
              </div>
            </div>

            <div className="visual-text-block">
              <div className="auth-status-chip">
                <div className="status-pulse" />
                <span>SYSTEM ONLINE</span>
              </div>
              <h1 className="visual-title">SafeMind<span className="title-accent"> AI</span></h1>
              <p className="visual-tagline">Next-generation emergency intelligence platform powered by Google's Gemma 3 neural architecture.</p>
            </div>

            {/* Stats Row */}
            <div className="visual-stats-grid">
              {stats.map((stat, i) => (
                <div key={i} className="v-stat-card" style={{ animationDelay: `${0.6 + i * 0.1}s` }}>
                  <stat.icon size={16} strokeWidth={2} />
                  <span className="v-stat-value">{stat.value}</span>
                  <span className="v-stat-label">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* Features List */}
            <div className="visual-features">
              {['Real-time Satellite Geolocation', 'Gemma 3 Medical Intelligence', 'Instant Emergency Protocols', 'Encrypted End-to-End'].map((feat, i) => (
                <div key={i} className="v-feature" style={{ animationDelay: `${0.8 + i * 0.12}s` }}>
                  <div className="v-dot" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div className="visual-footer">
              <ShieldCheck size={14} />
              <span>© 2026 SafeMind AI Technologies · Military-Grade Encryption</span>
            </div>
          </div>
        </div>

        {/* ── Right: Glass Form Panel ── */}
        <div className="auth-form-side">
          <div className="auth-form-card">
            
            {/* Form Header */}
            <div className="form-header">
              <div className="form-logo-row">
                <div className="form-logo-icon">
                  <Fingerprint size={24} strokeWidth={1.5} />
                </div>
                <div className="form-header-badge">{isLogin ? 'AUTHENTICATE' : 'REGISTER'}</div>
              </div>
              <h2 className="form-title">{isLogin ? 'Welcome Back, Commander' : 'Join the Network'}</h2>
              <p className="form-subtitle">
                {isLogin ? 'Enter your credentials to access the control tower' : 'Create your secure identity on the SafeMind network'}
              </p>
            </div>

            {/* Demo Access Banner */}
            <div className="demo-hint-box" onClick={handleDemoLogin}>
              <div className="demo-icon-wrap">
                <Zap size={16} />
              </div>
              <div className="demo-hint-text">
                <strong>Quick Access</strong>
                <span>Click to auto-fill demo credentials</span>
              </div>
              <ArrowRight size={14} className="demo-arrow" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="auth-form">
              {!isLogin && (
                <div className={`input-group ${focusedField === 'name' ? 'focused' : ''}`}>
                  <label><User size={14} /> Full Name</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      placeholder="Commander Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className={`input-group ${focusedField === 'email' ? 'focused' : ''}`}>
                <label><Mail size={14} /> Email Address</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    placeholder="demo@safemind.ai"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                </div>
              </div>

              <div className={`input-group ${focusedField === 'password' ? 'focused' : ''}`}>
                <label><Lock size={14} /> Password</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                  <button type="button" className="eye-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className={`auth-submit-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="auth-spinner" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>{isLogin ? 'Access Control Tower' : 'Initialize Account'}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="auth-divider">
              <span>OR</span>
            </div>

            {/* Social Buttons */}
            <div className="social-grid">
              <button type="button" className="social-btn" onClick={handleDemoLogin}>
                <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                <span>Google</span>
              </button>
              <button type="button" className="social-btn" onClick={handleDemoLogin}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                <span>GitHub</span>
              </button>
            </div>

            {/* Toggle */}
            <p className="auth-toggle-text">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button onClick={() => setIsLogin(!isLogin)} className="toggle-link">
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>

            <div className="auth-encryption-badge">
              <Lock size={11} />
              <span>256-bit AES Encrypted · Zero-Knowledge Protocol</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
