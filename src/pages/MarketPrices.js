import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../style/MarketPrices.css';


const API = process.env.REACT_APP_API_URL;

function MarketPrices() {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCommodity, setSearchCommodity] = useState('');
  const [searchMarket, setSearchMarket] = useState('');

  useEffect(() => {
    axios.get(`${API}/market-prices/dynamic`)
      .then(res => {
        setAllData(res.data);
        setFilteredData(res.data);
        toast.success(`मार्केट डेटा लोड झाला. एकूण ${res.data.length} रेकॉर्ड्स.`);
      })
      .catch(err => {
        console.error(err);
        toast.error('डेटा लोड करताना त्रुटी');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const filtered = allData.filter(item => {
      const matchCommodity = item.commodity?.toLowerCase().includes(searchCommodity.toLowerCase());
      const matchMarket = item.market?.toLowerCase().includes(searchMarket.toLowerCase());
      return matchCommodity && matchMarket;
    });
    setFilteredData(filtered);
  }, [searchCommodity, searchMarket, allData]);

  if (loading) return <div className="loading">लोड करत आहे...</div>;

  return (
    <div className="market-prices-container">
      <h2>📊 लाईव्ह मंडी भाव (AGMARKNET)</h2>
      <div className="search-box">
        <input type="text" placeholder="उत्पादन (टोमॅटो)..." value={searchCommodity} onChange={e => setSearchCommodity(e.target.value)} />
        <input type="text" placeholder="बाजार (पुणे)..." value={searchMarket} onChange={e => setSearchMarket(e.target.value)} />
      </div>
      {filteredData.length === 0 && <p>कोणताही डेटा सापडला नाही.</p>}
      {filteredData.length > 0 && (
        <div className="market-table">
          <table>
            <thead><tr><th>उत्पादन</th><th>वाण</th><th>बाजार</th><th>किमान</th><th>कमाल</th><th>मध्यम</th><th>तारीख</th></tr></thead>
            <tbody>
              {filteredData.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.commodity || '—'}</td>
                  <td>{item.variety || '—'}</td>
                  <td>{item.market || '—'}</td>
                  <td>{item.price_min ? `₹${item.price_min}` : '—'}</td>
                  <td>{item.price_max ? `₹${item.price_max}` : '—'}</td>
                  <td className="price">{item.price_modal ? `₹${item.price_modal}` : '—'}</td>
                  <td>{item.arrival_date ? new Date(item.arrival_date).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MarketPrices;