import { useState } from 'react';
import { Languages, Send, ArrowRight, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import './TranslatePage.css';

const LANGUAGES = ['Spanish', 'French', 'Hindi', 'Arabic', 'Chinese', 'German', 'Japanese', 'Portuguese', 'Russian', 'Bengali'];

const EMERGENCY_PHRASES = [
  { en: 'I need help!', emoji: '🆘' },
  { en: 'Call an ambulance!', emoji: '🚑' },
  { en: 'Where is the hospital?', emoji: '🏥' },
  { en: 'I have a medical emergency.', emoji: '💊' },
  { en: 'Please call the police.', emoji: '🚔' },
  { en: 'I am lost. Help me.', emoji: '📍' },
];

import FacilityLock from '../components/FacilityLock';

const TranslatePage = ({ user, onLoginRequest }) => {
  const [inputText, setInputText] = useState('');
  const [targetLang, setTargetLang] = useState('Spanish');
  const [translation, setTranslation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const translate = async (overrideText) => {
    const text = (overrideText || inputText).trim();
    if (!text || isLoading) return;
    if (!overrideText) setInputText(text);
    setIsLoading(true);
    setTranslation('');

    try {
      const prompt = `Translate the following text to ${targetLang}. Reply ONLY with the translated text, nothing else:\n\n"${text}"`;
      const res = await fetch('http://localhost:5001/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      setTranslation(data.reply?.replace(/^"|"$/g, '') || 'Translation failed.');
    } catch {
      toast.error('Translation failed. Check your AI server.');
    } finally {
      setIsLoading(false);
    }
  };

  const copy = () => {
    if (!translation) return;
    navigator.clipboard.writeText(translation);
    toast.success('Translation copied!');
  };

  return (
    <div className="translate-page" style={{ position: 'relative' }}>
      {!user && <FacilityLock onLoginRequest={onLoginRequest} featureName="Multi-language Translation" />}
      <div className="translate-header">
        <div className="translate-title-row">
          <div className="translate-icon-badge"><Languages size={22} /></div>
          <div>
            <h2 className="translate-title">Translate</h2>
            <div className="translate-sub">AI-powered real-time translation</div>
          </div>
        </div>
        <div className="translate-powered"><Globe size={14} /> Powered by Gemma</div>
      </div>

      {/* Language Selector */}
      <div className="translate-lang-row">
        <div className="translate-lang-pill active">English</div>
        <div className="translate-arrow"><ArrowRight size={18} /></div>
        <div className="translate-lang-select">
          <select value={targetLang} onChange={e => setTargetLang(e.target.value)} className="lang-select">
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {/* Emergency Quick Phrases */}
      <div className="emergency-phrases-section">
        <div className="phrases-label">Emergency Phrases</div>
        <div className="phrases-grid">
          {EMERGENCY_PHRASES.map(p => (
            <button key={p.en} className="phrase-card" onClick={() => { setInputText(p.en); translate(p.en); }}>
              <span className="phrase-emoji">{p.emoji}</span>
              <span className="phrase-text">{p.en}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Translation Box */}
      <div className="translation-box-area">
        <div className="translation-panel input-panel">
          <div className="panel-label">English</div>
          <textarea
            className="translation-textarea"
            placeholder="Type text to translate..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), translate())}
          />
        </div>
        <button className="translate-go-btn" onClick={() => translate()} disabled={isLoading || !inputText.trim()}>
          {isLoading ? <span className="translate-spinner" /> : <><Send size={16} /> Translate</>}
        </button>
        <div className="translation-panel output-panel">
          <div className="panel-label">{targetLang}</div>
          <div className="translation-output">
            {isLoading ? (
              <div className="translate-dots"><span /><span /><span /></div>
            ) : (
              <span>{translation || 'Translation will appear here...'}</span>
            )}
          </div>
          {translation && (
            <button className="copy-translation-btn" onClick={copy}>Copy</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranslatePage;
