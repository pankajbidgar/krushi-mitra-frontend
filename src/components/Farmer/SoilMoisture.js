// frontend/src/components/SoilMoisture.js
import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../../style/SoilMoisture.css';


const API = process.env.REACT_APP_API_URL;

function SoilMoisture() {
  const [location, setLocation] = useState('');
  const [locationType, setLocationType] = useState('city'); // 'city' or 'pincode'
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location.trim()) {
      toast.error('कृपया शहराचे नाव किंवा पिनकोड प्रविष्ट करा.');
      return;
    }
    setLoading(true);
    try {
      let url = `${API}/soil-moisture?`;
      if (locationType === 'city') {
        url += `city=${encodeURIComponent(location)}`;
      } else {
        url += `pincode=${location}`;
      }
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'डेटा मिळवताना त्रुटी');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // मातीतील ओलाव्याची टक्केवारी दाखवण्यासाठी प्रोग्रेस बार
  const getMoistureBar = (value) => {
    const percentage = value !== null ? value : 0;
    let color = '#f44336'; // red (low)
    if (percentage > 30) color = '#4caf50'; // green (optimal)
    else if (percentage > 15) color = '#ff9800'; // orange (medium)
    
    return (
      <div className="moisture-bar">
        <div className="moisture-fill" style={{ width: `${percentage}%`, backgroundColor: color }}></div>
        <span className="moisture-label">{percentage}%</span>
      </div>
    );
  };

  return (
    <div className="soil-moisture-container">
      <h2>💧 मातीतील ओलावा मॉनिटरिंग</h2>
      <p>तुमच्या शेताची माती किती ओलसर आहे ते जाणून घ्या आणि योग्य सिंचन सल्ला मिळवा.</p>
      
      <form onSubmit={handleSubmit} className="moisture-form">
        <div className="form-group">
          <label>
            <input
              type="radio"
              value="city"
              checked={locationType === 'city'}
              onChange={() => setLocationType('city')}
            /> शहराचे नाव
          </label>
          <label>
            <input
              type="radio"
              value="pincode"
              checked={locationType === 'pincode'}
              onChange={() => setLocationType('pincode')}
            /> पिनकोड
          </label>
        </div>
        <div className="input-group">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={locationType === 'city' ? 'उदा. Pune, Nashik' : '6 अंकी पिनकोड'}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'प्रक्रिया...' : 'ओलावा तपासा'}
          </button>
        </div>
      </form>

      {data && (
        <div className="moisture-result">
          <div className="location-info">
            <span>📍 {data.location}</span>
            <span>🕒 {new Date(data.timestamp).toLocaleString()}</span>
          </div>
          <div className="moisture-cards">
            <div className="moisture-card">
              <h3>वरचा थर (0-7 cm)</h3>
              {data.soil_moisture.surface !== null ? (
                getMoistureBar(data.soil_moisture.surface)
              ) : (
                <p>डेटा उपलब्ध नाही</p>
              )}
            </div>
            <div className="moisture-card">
              <h3>खोल थर (7-28 cm)</h3>
              {data.soil_moisture.deep !== null ? (
                getMoistureBar(data.soil_moisture.deep)
              ) : (
                <p>डेटा उपलब्ध नाही</p>
              )}
            </div>
          </div>
          <div className="advice-box">
            <h3>📋 सिंचन सल्ला</h3>
            <ul>
              {data.advice.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default SoilMoisture;