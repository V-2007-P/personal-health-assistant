import { useState, useEffect, useRef } from 'react';
import { Mic, Send, AlertTriangle, Activity, MapPin, Languages, CheckCircle2, Shield, ArrowRight, Bot, Phone, Navigation, MoreHorizontal, Cpu, HeartPulse } from 'lucide-react';
import toast from 'react-hot-toast';
import './MainContent.css';
import FacilityLock from './FacilityLock';

const TypingText = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    setTimeout(() => setDisplayedText(''), 0);
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i));
      i++;
      if (i === text.length) clearInterval(timer);
    }, 20); // 20ms per character
    return () => clearInterval(timer);
  }, [text]);

  return <span className="typing-effect">{displayedText}</span>;
};

const MainContent = ({ isEmergency, setIsEmergency, user, onLoginRequest }) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [errorState, setErrorState] = useState(null);
  const responseEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const [response, setResponse] = useState({
    title: "AI Response",
    text: "If you are experiencing a medical emergency, please remain calm. Based on your message, here are the immediate steps you can take:",
    bullets: [
      "Stay calm and try to move to a safe place.",
      "Call emergency services immediately.",
      "If applicable, provide first aid if you are trained.",
      "Share your live location with your contacts."
    ],
    prompt: "Would you like me to call emergency services for you?",
    time: "10:24 PM"
  });

  useEffect(() => {
    if (responseEndRef.current) {
      responseEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [response, isLoading, errorState]);

  // Handle simulated emergency update
  useEffect(() => {
    if (isEmergency && response.title !== "CRITICAL ALERT") {
      setTimeout(() => {
        setResponse({
          title: "CRITICAL ALERT",
          text: "SOS HAS BEEN ACTIVATED. Emergency protocol initiated.",
          bullets: [
            "Broadcasting live location to emergency contacts.",
            "Dispatching local police and ambulance services.",
            "Recording audio and video for security logs.",
            "Please stay on the line or remain hidden if in danger."
          ],
          prompt: "Authorities have been notified and are en route.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }, 0);
    }
  }, [isEmergency, response.title]);

  const sendPromptToBackend = async (prompt, isRetry = false) => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setErrorState(null);
    if (!isRetry) {
      setInputValue('');
      setUserMessage(prompt);
    }
    
    try {
      const controller = new AbortController();
      // 2-minute timeout for Gemma 3 locally
      const timeoutId = setTimeout(() => controller.abort(), 120000); 
      
      const res = await fetch('http://localhost:54321/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: isRetry ? userMessage : prompt }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Backend connection failed");
      }
      
      const data = await res.json();
      const aiText = data.reply || "No response received.";
      
      // Split Gemma's response into paragraphs/bullets for display
      const lines = aiText.split('\n').filter(l => l.trim());
      const mainText = lines[0] || aiText;
      const bulletLines = lines.slice(1, 5).map(l => l.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, ''));
      
      setResponse({
        title: "AI Response",
        text: mainText,
        bullets: bulletLines.length > 0 ? bulletLines : ["Gemma 3 has processed your request successfully."],
        prompt: lines.length > 5 ? lines.slice(5).join(' ') : "Is there anything else I can help you with?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } catch (error) {
      const errorMessage = error.name === 'AbortError' ? 'Request timed out. The AI model is taking too long to respond.' : (error.message || 'Failed to connect to AI server.');
      setErrorState(errorMessage);
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    sendPromptToBackend(inputValue);
  };

  const handleQuickAction = (type) => {
    if (type === 'emergency') {
      if (setIsEmergency) setIsEmergency(true);
      toast.success("Emergency SOS Activated!", { style: { background: '#FF3B30', color: 'white' } });
    } else if (type === 'health') {
      setInputValue("I am experiencing the following symptoms: ");
      setTimeout(() => inputRef.current?.focus(), 100);
    } else if (type === 'location') {
      if ('geolocation' in navigator) {
        toast.loading("Fetching location...", { id: 'loc' });
        navigator.geolocation.getCurrentPosition((position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const mapLink = `https://www.google.com/maps?q=${lat},${lng}`;
          window.open(`mailto:?subject=Emergency Location Share&body=I need help! My current location is: ${mapLink}`, '_blank');
          toast.success("Opened email to share location", { id: 'loc' });
        }, () => {
          toast.error("Failed to get location. Ensure permissions are granted.", { id: 'loc' });
        });
      } else {
        toast.error("Geolocation is not supported by your browser");
      }
    } else if (type === 'translate') {
      setInputValue("Please translate the following text to Spanish: ");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <div className="main-content">
      {/* Hero Section */}
      <div className="hero-section" style={isEmergency ? { background: 'linear-gradient(135deg, rgba(255,59,48,0.2), rgba(255,59,48,0.05))', borderColor: 'rgba(255,59,48,0.5)' } : {}}>
        <div className="hero-abstract-bg" style={isEmergency ? { backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(255, 59, 48, 0.4), transparent 50%)' } : {}}></div>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              {user ? `Good Evening, ${user.name}! 👋` : "Welcome to SafeMind AI 👋"}
            </h1>
            <p className="hero-subtitle">I'm your AI emergency assistant. How can I help you today?</p>
            <div className="pills-container">
              <span className="pill pill-purple"><Cpu size={14} /> AI Model: Gemma 4</span>
              <span className="pill pill-blue"><Activity size={14} /> Accuracy: 98.7%</span>
              <span className="pill pill-green"><CheckCircle2 size={14} /> Response: 1.2s</span>
            </div>
          </div>
          <div className="hologram-container">
            <div className="hologram-platform" style={isEmergency ? { background: 'radial-gradient(ellipse at center, rgba(255, 59, 48, 0.6) 0%, transparent 70%)', boxShadow: '0 0 20px rgba(255, 59, 48, 0.4)', borderColor: 'rgba(255, 59, 48, 0.2)' } : {}}></div>
            <Bot size={120} className="robot-hologram" strokeWidth={1.5} style={isEmergency ? { color: '#FF3B30', filter: 'drop-shadow(0 0 10px rgba(255, 59, 48, 0.5))' } : {}} />
          </div>
        </div>
      </div>

      {/* Voice Input Section */}
      <div className="voice-input-section" style={isEmergency ? { borderColor: 'rgba(255,59,48,0.5)' } : { position: 'relative' }}>
        {!user && <FacilityLock onLoginRequest={onLoginRequest} featureName="Voice Intelligence" />}
        <div className="mic-btn" style={isEmergency ? { background: 'linear-gradient(135deg, #FF3B30, #ff6b6b)' } : {}}>
          <Mic size={20} />
        </div>
        <div className="waveform">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="wave-bar" style={{ 
              animation: (isLoading || inputValue) ? `waveform ${0.5 + (i * 0.13) % 1}s ease-in-out infinite alternate` : 'none',
              background: isEmergency ? '#FF3B30' : undefined
            }}></div>
          ))}
        </div>
        <input 
          ref={inputRef}
          type="text" 
          className="input-placeholder" 
          placeholder={isLoading ? "AI is processing..." : "Type your problem or speak..."}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
          disabled={isLoading}
        />
        <div className="send-btn" onClick={!isLoading ? handleSend : undefined} style={{ background: isEmergency ? '#FF3B30' : (isLoading ? '#A0A5C0' : undefined), cursor: isLoading ? 'not-allowed' : 'pointer' }}>
          <Send size={18} />
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: '4px', marginBottom: '4px', fontSize: '14px', fontWeight: 700, color: '#2D3142' }}>Quick Actions</div>
      <div className="quick-actions">
        <div className="action-card" onClick={() => !isLoading && handleQuickAction('emergency')} style={{cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1}}>
          <div className="action-icon-wrapper icon-wrapper-red">
            <AlertTriangle size={20} />
          </div>
          <div className="action-text">
            <div className="action-title">Emergency SOS</div>
            <div className="action-subtitle">Get immediate help</div>
          </div>
          <ArrowRight size={14} className="action-arrow" color="#FF3B30" />
        </div>

        <div className="action-card" onClick={() => !isLoading && handleQuickAction('health')} style={{cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1}}>
          <div className="action-icon-wrapper icon-wrapper-blue">
            <HeartPulse size={20} />
          </div>
          <div className="action-text">
            <div className="action-title">Health Assistant</div>
            <div className="action-subtitle">Medical guidance</div>
          </div>
          <ArrowRight size={14} className="action-arrow" color="#007AFF" />
        </div>

        <div className="action-card" onClick={() => !isLoading && handleQuickAction('location')} style={{cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1}}>
          <div className="action-icon-wrapper icon-wrapper-green">
            <MapPin size={20} />
          </div>
          <div className="action-text">
            <div className="action-title">Share Location</div>
            <div className="action-subtitle">Send your location</div>
          </div>
          <ArrowRight size={14} className="action-arrow" color="#34C759" />
        </div>

        <div className="action-card" onClick={() => !isLoading && handleQuickAction('translate')} style={{cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1}}>
          <div className="action-icon-wrapper icon-wrapper-purple">
            <Languages size={20} />
          </div>
          <div className="action-text">
            <div className="action-title">Translate</div>
            <div className="action-subtitle">Multi-language support</div>
          </div>
          <ArrowRight size={14} className="action-arrow" color="#8A2BE2" />
        </div>
      </div>

      {/* AI Response Section */}
      <div className="ai-response-card" style={isEmergency ? { borderColor: 'rgba(255,59,48,0.5)', background: 'rgba(255,59,48,0.05)' } : { position: 'relative' }}>
        {!user && <FacilityLock onLoginRequest={onLoginRequest} featureName="AI Analysis" />}
        <div className="ai-response-header">
          <div className="ai-response-title" style={isEmergency ? {color: '#FF3B30'} : {}}>{response.title}</div>
          <div className="ai-badge" style={isEmergency ? {background: 'rgba(255,59,48,0.1)', color: '#FF3B30'} : {}}>
            {isLoading ? "Processing..." : <><Bot size={12} /> Gemma 4</>}
          </div>
        </div>
        <div className="response-content">
          <div className="response-text">
            {isLoading ? (
              // Loading Skeleton Shimmer
              <div style={{marginTop: '10px'}}>
                <div className="skeleton-text shimmer-bg"></div>
                <div className="skeleton-text short shimmer-bg"></div>
                <div style={{height: '20px'}}></div>
                <div className="skeleton-text shimmer-bg" style={{height: '10px', width: '80%'}}></div>
                <div className="skeleton-text shimmer-bg" style={{height: '10px', width: '70%'}}></div>
                <div className="skeleton-text shimmer-bg" style={{height: '10px', width: '85%'}}></div>
              </div>
            ) : errorState ? (
              <>
                <div style={{ marginBottom: '12px', padding: '8px 12px', background: 'rgba(255, 255, 255, 0.5)', borderRadius: '8px', fontSize: '14px', fontStyle: 'italic', color: '#555' }}>
                  <strong>You:</strong> {userMessage}
                </div>
                <p className="response-p" style={{ color: '#FF3B30', fontWeight: 500 }}>
                  <AlertTriangle size={16} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} />
                  {errorState}
                </p>
                <div className="response-actions" style={{ marginTop: '16px' }}>
                  <button className="btn-action btn-red" onClick={() => sendPromptToBackend(userMessage, true)}>
                    Retry Request
                  </button>
                </div>
              </>
            ) : (
              <>
                {userMessage && (
                  <div style={{ marginBottom: '12px', padding: '8px 12px', background: 'rgba(255, 255, 255, 0.5)', borderRadius: '8px', fontSize: '14px', fontStyle: 'italic', color: '#555' }}>
                    <strong>You:</strong> {userMessage}
                  </div>
                )}
                <p className="response-p">
                  <TypingText text={response.text} />
                </p>
                <ul className="response-list">
                  {response.bullets.map((bullet, idx) => (
                    <li key={idx}><CheckCircle2 size={16} className="check-icon" style={isEmergency ? {color: '#FF3B30'} : {}} /> {bullet}</li>
                  ))}
                </ul>
                <p className="response-p" style={{ marginTop: '12px', fontWeight: 600 }}>
                  <TypingText text={response.prompt} />
                </p>
                <div className="response-actions">
                  <span className="time-stamp">{response.time}</span>
                  <button className="btn-action btn-red">
                    <Phone size={14} /> Call Emergency
                  </button>
                  <button className="btn-action btn-blue">
                    <Navigation size={14} /> Share Location
                  </button>
                  <button className="btn-action btn-grey">
                    <MoreHorizontal size={14} /> More Options
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="response-illustration">
            <div className="shield-platform" style={isEmergency ? {borderColor: 'rgba(255,59,48,0.3)', boxShadow: '0 0 20px rgba(255,59,48,0.3)'} : {}}></div>
            <div className="shield-platform" style={{ width: '80px', height: '26px', bottom: '6px', borderColor: isEmergency ? 'rgba(255,59,48,0.3)' : undefined }}></div>
            <Shield size={80} className="floating-shield" strokeWidth={1} style={isEmergency ? {color: '#FF3B30', filter: 'drop-shadow(0 0 15px rgba(255,59,48,0.5))'} : {}} />
          </div>
        </div>
      </div>
      <div ref={responseEndRef} />
    </div>
  );
};

export default MainContent;
