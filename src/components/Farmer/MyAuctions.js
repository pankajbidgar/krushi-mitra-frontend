import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../../style/MyAuctions.css';

function MyAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAuctionBids, setSelectedAuctionBids] = useState({});
  const token = localStorage.getItem('token');

  const fetchAuctions = async () => {
    try {
      const res = await axios.get('http://localhost:8000/auctions/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAuctions(res.data);
    } catch (err) {
      toast.error('लिलाव मिळवताना त्रुटी');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchBids = async (auctionId) => {
    if (selectedAuctionBids[auctionId]) {
      // toggle off
      const newState = { ...selectedAuctionBids };
      delete newState[auctionId];
      setSelectedAuctionBids(newState);
      return;
    }
    try {
      const res = await axios.get(`http://localhost:8000/auctions/${auctionId}/bids`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedAuctionBids(prev => ({ ...prev, [auctionId]: res.data }));
    } catch (err) {
      toast.error('बोली मिळवताना त्रुटी');
    }
  };

  const endAuction = async (auctionId) => {
    if (window.confirm('हा लिलाव संपवून सर्वाधिक बोलीवाल्याला विक्री करायची?')) {
      try {
        await axios.post(`http://localhost:8000/auctions/${auctionId}/end`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('लिलाव संपवला');
        fetchAuctions();
      } catch (err) {
        toast.error(err.response?.data?.detail || 'त्रुटी');
      }
    }
  };

  const cancelAuction = async (auctionId) => {
    if (window.confirm('हा लिलाव रद्द करायचा? कोणतीही विक्री होणार नाही.')) {
      try {
        await axios.post(`http://localhost:8000/auctions/${auctionId}/cancel`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('लिलाव रद्द केला');
        fetchAuctions();
      } catch (err) {
        toast.error(err.response?.data?.detail || 'त्रुटी');
      }
    }
  };

  if (loading) return <div className="loading-spinner">लोड करत आहे...</div>;

  return (
    <div className="my-auctions-container">
      <h2>📋 माझे लिलाव</h2>
      {auctions.length === 0 ? (
        <p>तुम्ही अद्याप कोणताही लिलाव तयार केलेला नाही.</p>
      ) : (
        <div className="auctions-list">
          {auctions.map(auction => (
            <div key={auction.id} className="auction-item">
              <div className="auction-info">
                <h3>{auction.product_name}</h3>
                <p>स्थिती: <span className={`status ${auction.status}`}>{auction.status === 'active' ? 'सक्रिय' : auction.status === 'sold' ? 'विकले' : 'रद्द'}</span></p>
                <p>सुरुवातीची बोली: ₹{auction.starting_bid}</p>
                <p>सध्याची बोली: ₹{auction.current_bid}</p>
                <p>सर्वाधिक बोली: {auction.highest_bidder_name || 'कोणीही नाही'}</p>
                {auction.winner_name && <p>विजेता: {auction.winner_name}</p>}
                <p>समाप्ती वेळ: {new Date(auction.end_time).toLocaleString()}</p>
              </div>
              <div className="auction-actions">
                <button onClick={() => fetchBids(auction.id)} className="view-bids-btn">
                  📋 बोली पाहा
                </button>
                {auction.status === 'active' && (
                  <>
                    <button onClick={() => endAuction(auction.id)} className="end-auction-btn">🏁 लिलाव संपवा (विक्री)</button>
                    <button onClick={() => cancelAuction(auction.id)} className="cancel-auction-btn">❌ लिलाव रद्द करा</button>
                  </>
                )}
              </div>
              {selectedAuctionBids[auction.id] && (
                <div className="bids-list">
                  <h4>बोली यादी</h4>
                  <table className="bids-table">
                    <thead>
                      <tr><th>बोलीदार</th><th>रक्कम (₹)</th><th>वेळ</th></tr>
                    </thead>
                    <tbody>
                      {selectedAuctionBids[auction.id].map(bid => (
                        <tr key={bid.id}><td>{bid.bidder_name}</td><td>₹{bid.amount}</td><td>{new Date(bid.created_at).toLocaleString()}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyAuctions;