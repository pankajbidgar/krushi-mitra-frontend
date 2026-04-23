import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../../style/CreateAuction.css';

function CreateAuction() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [startingBid, setStartingBid] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');


  const API = process.env.REACT_APP_API_URL;

  useEffect(() => {
    axios.get(`${API}/products/my`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setProducts(res.data))
    .catch(err => toast.error('तुमची उत्पादने मिळवता आली नाहीत'));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !startingBid || !endTime) {
      toast.error('कृपया सर्व फील्ड भरा');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/auctions`, {
        product_id: selectedProduct,
        starting_bid: parseFloat(startingBid),
        end_time: new Date(endTime).toISOString()
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('लिलाव यशस्वीरित्या तयार झाला!');
      setSelectedProduct('');
      setStartingBid('');
      setEndTime('');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'लिलाव तयार करताना त्रुटी');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-auction-container">
      <div className="create-auction-card">
        <h2>🔨 नवीन लिलाव तयार करा</h2>
        <p>तुमचे उत्पादन लिलावासाठी ठेवा आणि सर्वोत्तम किंमत मिळवा.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>उत्पादन निवडा *</label>
            <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} required>
              <option value="">-- उत्पादन निवडा --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (स्टॉक: {p.quantity} {p.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>सुरुवातीची बोली (₹) *</label>
            <input
              type="number"
              step="0.01"
              placeholder="उदा. 1000"
              value={startingBid}
              onChange={e => setStartingBid(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>लिलाव समाप्तीची तारीख व वेळ *</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              required
            />
            <small>स्थानिक वेळेनुसार (IST)</small>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'लिलाव सुरू करत आहे...' : '🚀 लिलाव सुरू करा'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateAuction;