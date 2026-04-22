import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../style/SchemeFinder.css';

function SchemeFinder() {
  const token = localStorage.getItem('token');
  const [form, setForm] = useState({
    crop_name: '',
    land_area: '',
    district: '',
    annual_income: ''
  });
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);

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
      const res = await axios.post('http://localhost:8000/schemes/recommend', {
        crop_name: form.crop_name,
        land_area: parseFloat(form.land_area),
        district: form.district,
        annual_income: form.annual_income ? parseFloat(form.annual_income) : null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSchemes(res.data);
      if (res.data.length === 0) {
        toast('तुमच्या प्रोफाइलसाठी कोणतीही योजना सापडली नाही.', { icon: 'ℹ️' });
      }
    } catch (err) {
      toast.error('योजना मिळवताना त्रुटी');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="scheme-finder-container">
      <h2>📢 सरकारी योजना शोधा</h2>
      <p>तुमच्या शेताची माहिती भरा. तुम्हाला पात्र असलेल्या योजना दाखवू.</p>
      <form onSubmit={handleSubmit} className="scheme-form">
        <div className="form-group">
          <label>प्रमुख पीक *</label>
          <input type="text" name="crop_name" placeholder="उदा. टोमॅटो, कांदा, गहू" value={form.crop_name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>क्षेत्रफळ (एकर) *</label>
          <input type="number" step="0.1" name="land_area" placeholder="उदा. 2.5" value={form.land_area} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>जिल्हा (पर्यायी)</label>
          <input type="text" name="district" placeholder="उदा. पुणे, नाशिक" value={form.district} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>वार्षिक उत्पन्न (₹, पर्यायी)</label>
          <input type="number" step="1000" name="annual_income" placeholder="उदा. 500000" value={form.annual_income} onChange={handleChange} />
        </div>
        <button type="submit" disabled={loading} className="search-btn">
          {loading ? 'योजना शोधत आहे...' : 'योजना शोधा'}
        </button>
      </form>

      {schemes.length > 0 && (
        <div className="schemes-list">
          <h3>तुमच्यासाठी सुचवलेल्या योजना</h3>
          {schemes.map(scheme => (
            <div key={scheme.id} className="scheme-card">
              <h4>{scheme.name}</h4>
              <p><strong>📝 वर्णन:</strong> {scheme.description}</p>
              <p><strong>✅ पात्रता:</strong> {scheme.eligibility}</p>
              <p><strong>🎁 लाभ:</strong> {scheme.benefits}</p>
              <p><strong>📂 श्रेणी:</strong> {scheme.category}</p>
              {scheme.apply_link && (
                <a href={scheme.apply_link} target="_blank" rel="noopener noreferrer" className="apply-link">अर्ज करा →</a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SchemeFinder;