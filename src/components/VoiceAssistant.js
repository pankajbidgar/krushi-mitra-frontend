import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../style/VoiceAssistant.css';

function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [userQuestion, setUserQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  // ब्राउझर सपोर्ट तपासा
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  const startListening = () => {
    if (!recognition) {
      toast.error('तुमचा ब्राउझर व्हॉईस रेकग्निशन सपोर्ट करत नाही. कृपया Chrome/Edge वापरा.');
      return;
    }
    recognition.lang = 'mr-IN'; // मराठी
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      toast('🎙️ बोला...', { duration: 3000 });
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setUserQuestion(transcript);
      setIsListening(false);
      setLoading(true);
      try {
        const res = await axios.post('http://localhost:8000/chatbot', { query: transcript }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAnswer(res.data.answer);
        // उत्तर वाचून दाखवा
        const utterance = new SpeechSynthesisUtterance(res.data.answer);
        utterance.lang = 'mr-IN';
        utterance.rate = 0.9; // थोडे हळू बोला
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        toast.error('उत्तर मिळवताना त्रुटी');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    recognition.onerror = (event) => {
      console.error(event);
      toast.error('काहीतरी चूक झाली. पुन्हा प्रयत्न करा.');
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="voice-assistant-container">
      <h2>🎤 व्हॉईस असिस्टंट (मराठी)</h2>
      <p>मायक्रोफोनवर क्लिक करा आणि शेतीविषयक प्रश्न बोला.</p>
      <button className="mic-btn" onClick={startListening} disabled={isListening}>
        {isListening ? '🎙️ ऐकत आहे...' : '🎤 प्रश्न विचारा'}
      </button>
      {userQuestion && (
        <div className="user-question">
          <strong>तुम्ही विचारले:</strong> {userQuestion}
        </div>
      )}
      {loading && <div className="loading">विचार करत आहे...</div>}
      {answer && (
        <div className="answer-box">
          <strong>🤖 उत्तर:</strong> {answer}
        </div>
      )}
    </div>
  );
}

export default VoiceAssistant;