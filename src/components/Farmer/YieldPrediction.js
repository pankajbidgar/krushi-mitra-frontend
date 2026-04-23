import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../../style/YieldPrediction.css';

const API = process.env.REACT_APP_API_URL;


function YieldPrediction() {
  const token = localStorage.getItem('token');
  const [form, setForm] = useState({
    crop_name: '',
    land_area: '',
    soil_type: 'काळी',
    seed_type: 'local',
    irrigation_method: 'flood',
    season: 'kharif'
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.crop_name || !form.land_area) {
      toast.error('कृपया पीक आणि क्षेत्रफळ भरा');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/crop/yield-predict`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(res.data);
      toast.success('उत्पादन अंदाज तयार');
    } catch (err) {
      toast.error('अंदाज मिळवताना त्रुटी');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API}/crop/yield-history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data);
      setShowHistory(true);
    } catch (err) {
      toast.error('इतिहास मिळवताना त्रुटी');
    }
  };

  return (
    <div className="yield-prediction-container">
      <h2>🌾 पीक उत्पादन अंदाज</h2>
      <p>तुमच्या शेताची माहिती भरा. AI तुम्हाला अंदाजित उत्पादन सांगेल.</p>

      <form onSubmit={handleSubmit} className="prediction-form">
        <div className="form-group">
          <label>पीक *</label>
          <select name="crop_name" value={form.crop_name} onChange={handleChange} required>
            <option value="">निवडा</option>
            <option value="टोमॅटो">टोमॅटो</option>
            <option value="कांदा">कांदा</option>
            <option value="गहू">गहू</option>
            <option value="भात">भात</option>
            <option value="कापूस">कापूस</option>
            <option value="ज्वारी">ज्वारी</option>
            <option value="बाजरी">बाजरी</option>
            <option value="हरभरा">हरभरा</option>
          </select>
        </div>
        <div className="form-group">
          <label>क्षेत्रफळ (एकर) *</label>
          <input type="number" step="0.1" name="land_area" value={form.land_area} onChange={handleChange} placeholder="उदा. 2.5" required />
        </div>
        <div className="form-group">
          <label>मातीचा प्रकार</label>
          <select name="soil_type" value={form.soil_type} onChange={handleChange}>
            <option value="काळी">काळी माती</option>
            <option value="लाल">लाल माती</option>
            <option value="वालुकामय">वालुकामय माती</option>
            <option value="चिकणमाती">चिकणमाती</option>
          </select>
        </div>
        <div className="form-group">
          <label>बियाण्याचा प्रकार</label>
          <select name="seed_type" value={form.seed_type} onChange={handleChange}>
            <option value="local">स्थानिक</option>
            <option value="hybrid">हायब्रीड</option>
          </select>
        </div>
        <div className="form-group">
          <label>सिंचन पद्धत</label>
          <select name="irrigation_method" value={form.irrigation_method} onChange={handleChange}>
            <option value="flood">पारंपारिक</option>
            <option value="drip">ठिबक सिंचन</option>
            <option value="sprinkler">फवारणी सिंचन</option>
          </select>
        </div>
        <div className="form-group">
          <label>हंगाम</label>
          <select name="season" value={form.season} onChange={handleChange}>
            <option value="kharif">खरीप (जून-ऑक्टोबर)</option>
            <option value="rabi">रब्बी (ऑक्टोबर-मार्च)</option>
            <option value="summer">उन्हाळी (मार्च-जून)</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="predict-btn">
          {loading ? 'प्रक्रिया...' : 'उत्पादन अंदाज करा'}
        </button>
      </form>

      {result && (
        <div className="result-card">
          <h3>📊 अंदाजित उत्पादन</h3>
          <div className="yield-value">
            {result.predicted_yield.toFixed(2)} <span>किलो</span>
          </div>
          <div className="confidence">
            अचूकता: {result.confidence}%
          </div>
          <div className="factors">
            <strong>प्रभावित करणारे घटक:</strong>
            <ul>
              {result.factors.map((factor, idx) => (
                <li key={idx}>{factor}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <button onClick={fetchHistory} className="history-btn">📋 मागील अंदाज पाहा</button>

      {showHistory && (
        <div className="history-section">
          <h3>मागील अंदाज</h3>
          {history.length === 0 ? (
            <p>अद्याप कोणताही अंदाज नाही.</p>
          ) : (
            <table className="history-table">
              <thead>
                <tr>
                  <th>पीक</th>
                  <th>क्षेत्रफळ</th>
                  <th>माती</th>
                  <th>उत्पादन (kg)</th>
                  <th>तारीख</th>
                </tr>
              </thead>
              <tbody>
                {history.map(item => (
                  <tr key={item.id}>
                    <td>{item.crop_name}</td>
                    <td>{item.land_area} एकर</td>
                    <td>{item.soil_type}</td>
                    <td>{item.predicted_yield.toFixed(2)}</td>
                    <td>{new Date(item.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default YieldPrediction;