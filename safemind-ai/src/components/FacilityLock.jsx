import { Lock, Shield, ArrowRight } from 'lucide-react';
import './FacilityLock.css';

const FacilityLock = ({ onLoginRequest, featureName }) => {
  return (
    <div className="facility-lock-overlay">
      <div className="lock-content">
        <div className="lock-icon-circle">
          <Lock size={32} />
        </div>
        <h2 className="lock-title">Access Restricted</h2>
        <p className="lock-text">
          Please log in to your <strong>SafeMind AI</strong> account to use the 
          {featureName ? ` ${featureName}` : ' premium facilities'}.
        </p>
        <div className="lock-demo-badge">
          <Shield size={14} /> <span>Demo Access Available</span>
        </div>
        <button className="lock-login-btn" onClick={onLoginRequest}>
          Login to Continue <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default FacilityLock;
