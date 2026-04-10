import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../style/Chatbot.css';

function Chatbot() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = { text: query, sender: 'user', timestamp: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      // Backend AI endpoint – adjust if you use GET or POST with params
      const res = await axios.post('http://localhost:8000/chatbot', { query: query });
      const botMsg = { text: res.data.answer, sender: 'bot', timestamp: new Date().toLocaleTimeString() };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      toast.error('बॉट उत्तर देऊ शकला नाही. कृपया नंतर प्रयत्न करा.');
      // Optional: fallback message
      const errorMsg = { text: 'क्षमस्व, सध्या सेवा उपलब्ध नाही. कृपया थोड्या वेळाने विचारा.', sender: 'bot', timestamp: '' };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h2>🤖 Krushi Mitra – शेती सहाय्यक</h2>
        <p>तुमच्या शेतीतील प्रश्न विचारा, आम्ही AI द्वारे उत्तर देऊ.</p>
      </div>
      <div className="chat-messages-area">
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="welcome-message">
              <p>🌾 नमस्कार! मी Krushi Mitra AI आहे.</p>
              <p>तुम्ही मला शेतीशी संबंधित कोणताही प्रश्न विचारू शकता. उदा.:</p>
              <ul>
                <li>भात लागवडीसाठी योग्य हंगाम कोणता?</li>
                <li>कांद्याची साठवणूक कशी करावी?</li>
                <li>सेंद्रिय खत कोणते वापरावे?</li>
              </ul>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.sender}`}>
              <div className="message-bubble">
                <span className="message-text">{msg.text}</span>
                {msg.timestamp && <span className="message-time">{msg.timestamp}</span>}
              </div>
            </div>
          ))}
          {loading && (
            <div className="message bot">
              <div className="message-bubble typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <form onSubmit={sendMessage} className="chat-input-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="तुमचा प्रश्न इथे लिहा..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'विचार करत आहे...' : 'पाठवा'}
        </button>
      </form>
    </div>
  );
}

export default Chatbot;