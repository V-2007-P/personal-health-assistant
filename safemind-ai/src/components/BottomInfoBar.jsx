import { Bot, Globe, ShieldCheck, Zap } from 'lucide-react';
import './BottomInfoBar.css';

const BottomInfoBar = () => {
  return (
    <div className="bottom-info-bar">
      <div className="info-card">
        <div className="info-icon" style={{color: '#007AFF'}}>
          <Bot size={16} />
        </div>
        <div className="info-text-wrapper">
          <div className="info-title">24/7 AI Support</div>
          <div className="info-subtitle">Always here for you</div>
        </div>
      </div>

      <div className="info-card">
        <div className="info-icon" style={{color: '#8A2BE2'}}>
          <Globe size={16} />
        </div>
        <div className="info-text-wrapper">
          <div className="info-title">100+ Languages</div>
          <div className="info-subtitle">Break language barriers</div>
        </div>
      </div>

      <div className="info-card">
        <div className="info-icon" style={{color: '#2D3142'}}>
          <ShieldCheck size={16} />
        </div>
        <div className="info-text-wrapper">
          <div className="info-title">Privacy First</div>
          <div className="info-subtitle">Your data is secure</div>
        </div>
      </div>

      <div className="info-card">
        <div className="info-icon" style={{color: '#34C759'}}>
          <Zap size={16} />
        </div>
        <div className="info-text-wrapper">
          <div className="info-title">Smart & Fast</div>
          <div className="info-subtitle">AI-Powered responses</div>
        </div>
      </div>
    </div>
  );
};

export default BottomInfoBar;
