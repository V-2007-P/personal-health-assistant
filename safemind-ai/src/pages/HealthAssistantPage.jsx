import { useState, useRef, useEffect } from 'react';
import { HeartPulse, Send, User, Stethoscope, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import './HealthAssistantPage.css';

const SYMPTOM_CHIPS = [
  'Chest pain', 'Shortness of breath', 'High fever', 'Severe headache',
  'Dizziness', 'Nausea / Vomiting', 'Abdominal pain', 'Rapid heartbeat'
];

import FacilityLock from '../components/FacilityLock';

const HealthAssistantPage = ({ user, onLoginRequest }) => {
  const [messages, setMessages] = useState([
    {
      id: 1, role: 'ai',
      text: "Hi! I'm your Health Assistant. Describe your symptoms and I'll give you clear, concise medical guidance. Remember: For any life-threatening emergency, always call 108 immediately.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (overridePrompt) => {
    const prompt = (overridePrompt || inputValue).trim();
    if (!prompt || isLoading) return;

    const systemPrompt = `You are a compassionate medical assistant. The user reports: "${prompt}". Give concise, clear first-aid advice in 3 bullet points. End with whether they should seek urgent care. Never diagnose.`;

    const userMsg = {
      id: Date.now(), role: 'user', text: prompt,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000);

      const res = await fetch('http://localhost:5001/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: systemPrompt }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'ai', text: data.reply || 'No response.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch {
      toast.error('Failed to get medical guidance. Check your connection.');
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <div className="health-page" style={{ position: 'relative' }}>
      {!user && <FacilityLock onLoginRequest={onLoginRequest} featureName="Medical Guidance" />}
      <div className="health-header">
        <div className="health-title-row">
          <div className="health-icon-badge"><HeartPulse size={22} /></div>
          <div>
            <h2 className="health-title">Health Assistant</h2>
            <div className="health-sub">AI-powered medical guidance</div>
          </div>
        </div>
        <div className="health-disclaimer-pill">
          <AlertTriangle size={12} /> Not a substitute for a doctor
        </div>
      </div>

      {/* Symptom Quick Chips */}
      <div className="symptom-chips-section">
        <div className="chips-label">Common Symptoms</div>
        <div className="chips-row">
          {SYMPTOM_CHIPS.map(s => (
            <button key={s} className="symptom-chip" onClick={() => sendMessage(`I have: ${s}`)}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="health-chat-window">
        {messages.map(msg => (
          <div key={msg.id} className={`health-bubble-row ${msg.role}`}>
            <div className={`health-bubble-icon ${msg.role}`}>
              {msg.role === 'ai' ? <Stethoscope size={16} /> : <User size={16} />}
            </div>
            <div className={`health-bubble ${msg.role}`}>
              <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
              <span className="health-bubble-time">{msg.time}</span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="health-bubble-row ai">
            <div className="health-bubble-icon ai"><Stethoscope size={16} /></div>
            <div className="health-bubble ai health-typing">
              <span className="dot" /><span className="dot" /><span className="dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="health-input-bar">
        <input
          ref={inputRef}
          className="health-input"
          placeholder="Describe your symptoms..."
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          disabled={isLoading}
        />
        <button className="health-send-btn" onClick={() => sendMessage()} disabled={isLoading || !inputValue.trim()}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default HealthAssistantPage;
