import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import "../style/CropRecommendation.css"



const API = process.env.REACT_APP_API_URL;
function CropRecommendation() {
  const [soilType, setSoilType] = useState('');
  const [season, setSeason] = useState('');
  const [water, setWater] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!soilType || !season || !water) {
      toast.error('कृपया सर्व माहिती भरा');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/crop-recommendation`, {
        soil_type: soilType,
        season: season,
        water: water
      });
      setRecommendations(res.data.recommendations);
      toast.success(res.data.message);
    } catch (err) {
      toast.error('काहीतरी चूक झाली');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crop-recommendation-container">
      <h2>🌾 पीक शिफारस (Krushi Mitra)</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>मातीचा प्रकार</label>
          <select value={soilType} onChange={(e) => setSoilType(e.target.value)} required>
            <option value="">निवडा</option>
            <option value="काळी">काळी माती</option>
            <option value="लाल">लाल माती</option>
            <option value="वालुकामय">वालुकामय माती</option>
            <option value="चिकणमाती">चिकणमाती</option>
          </select>
        </div>
        <div className="form-group">
          <label>हंगाम</label>
          <select value={season} onChange={(e) => setSeason(e.target.value)} required>
            <option value="">निवडा</option>
            <option value="खरीप">खरीप (जून-ऑक्टोबर)</option>
            <option value="रब्बी">रब्बी (ऑक्टोबर-मार्च)</option>
            <option value="उन्हाळी">उन्हाळी (मार्च-जून)</option>
          </select>
        </div>
        <div className="form-group">
          <label>पाण्याची उपलब्धता</label>
          <select value={water} onChange={(e) => setWater(e.target.value)} required>
            <option value="">निवडा</option>
            <option value="भरपूर">भरपूर</option>
            <option value="मध्यम">मध्यम</option>
            <option value="कमी">कमी</option>
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'प्रक्रिया...' : 'शिफारस मिळवा'}
        </button>
      </form>

      {recommendations.length > 0 && (
        <div className="recommendations">
          <h3>शिफारस केलेली पिके:</h3>
          <ul>
            {recommendations.map((crop, idx) => (
              <li key={idx}>{crop}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CropRecommendation;