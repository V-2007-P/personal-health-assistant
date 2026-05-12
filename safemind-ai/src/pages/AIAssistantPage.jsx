import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Mic, Trash2, User } from 'lucide-react';
import toast from 'react-hot-toast';
import './AIAssistantPage.css';

const AIAssistantPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'ai',
      text: "Hello! I'm Gemma, your SafeMind AI assistant. I'm here to help you with medical guidance, emergency support, and any questions you have. How can I help you today?",
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

  const sendMessage = async () => {
    const prompt = inputValue.trim();
    if (!prompt || isLoading) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      text: prompt,
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
        body: JSON.stringify({ prompt }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      const aiMsg = {
        id: Date.now() + 1,
        role: 'ai',
        text: data.reply || 'No response received.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      toast.error(err.name === 'AbortError' ? 'Request timed out.' : 'Failed to connect to AI server.');
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 1, role: 'ai',
      text: "Chat cleared! How can I help you?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    toast.success('Chat cleared');
  };

  return (
    <div className="ai-page">
      <div className="ai-page-header">
        <div className="ai-page-title-row">
          <div className="ai-avatar-icon"><Bot size={22} /></div>
          <div>
            <h2 className="ai-page-title">AI Assistant</h2>
            <div className="ai-page-sub">Powered by Gemma 3 via Ollama</div>
          </div>
        </div>
        <button className="ai-clear-btn" onClick={clearChat}>
          <Trash2 size={15} /> Clear Chat
        </button>
      </div>

      <div className="ai-chat-window">
        {messages.map(msg => (
          <div key={msg.id} className={`ai-bubble-row ${msg.role}`}>
            <div className={`ai-bubble-icon ${msg.role}`}>
              {msg.role === 'ai' ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className={`ai-bubble ${msg.role}`}>
              <p>{msg.text}</p>
              <span className="ai-bubble-time">{msg.time}</span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="ai-bubble-row ai">
            <div className="ai-bubble-icon ai"><Bot size={16} /></div>
            <div className="ai-bubble ai ai-typing">
              <span className="dot" /><span className="dot" /><span className="dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="ai-input-bar">
        <div className="ai-mic-btn"><Mic size={18} /></div>
        <input
          ref={inputRef}
          className="ai-input"
          placeholder="Ask me anything..."
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          disabled={isLoading}
          autoFocus
        />
        <button className="ai-send-btn" onClick={sendMessage} disabled={isLoading || !inputValue.trim()}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default AIAssistantPage;
