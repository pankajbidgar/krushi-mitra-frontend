import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../style/WeatherAdvice.css';

function WeatherAdvice() {
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!city.trim()) {
      toast.error('कृपया शहराचे नाव प्रविष्ट करा');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8000/weather-advice?city=${city}`);
      setWeather(res.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'शहर सापडले नाही');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const getLiveLocation = () => {
    if (!navigator.geolocation) {
      toast.error('तुमचा ब्राउझर लोकेशन सपोर्ट करत नाही');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await axios.get(`http://localhost:8000/weather-advice?lat=${latitude}&lon=${longitude}`);
          setWeather(res.data);
          toast.success('तुमच्या स्थानासाठी हवामान मिळाले');
        } catch (err) {
          toast.error('हवामान मिळवताना त्रुटी');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error(error);
        toast.error('लोकेशन मिळवता आले नाही. कृपया परवानगी द्या.');
        setLoading(false);
      }
    );
  };

  return (
    <div className="weather-advice-container">
      <h2>🌤️ हवामान आधारित शेती सल्ला</h2>
      <div className="location-buttons">
        <button onClick={getLiveLocation} disabled={loading} className="live-location-btn">
          📍 माझे स्थान वापरा
        </button>
        <span>किंवा</span>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="शहराचे नाव (English, उदा. Nashik, Pune)"
          value={city}
          onChange={e => setCity(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'लोड करत आहे...' : 'सल्ला मिळवा'}
        </button>
      </form>

      {weather && (
        <div className="weather-result">
          <h3>{weather.city}</h3>
          <div className="weather-details">
            <p>🌡️ तापमान: {weather.temperature}°C</p>
            <p>💧 आर्द्रता: {weather.humidity}%</p>
            <p>🌬️ वाऱ्याचा वेग: {weather.wind_speed} m/s</p>
            <p>☁️ स्थिती: {weather.description}</p>
          </div>
          <div className="advice-box">
            <h4>📋 शेती सल्ला:</h4>
            <ul>
              {weather.advice.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default WeatherAdvice;