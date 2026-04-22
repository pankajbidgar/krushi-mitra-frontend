import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../../style/AuctionList.css';

function AuctionList() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  const fetchAuctions = async () => {
    try {
      const res = await axios.get('http://localhost:8000/auctions/active', {
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
    const interval = setInterval(fetchAuctions, 10000); // refresh every 10 sec
    return () => clearInterval(interval);
  }, []);

  const placeBid = async (auctionId, currentBid) => {
    const amount = prompt(`तुमची बोली टाका (सध्याची बोली: ₹${currentBid})`);
    if (!amount || parseFloat(amount) <= currentBid) {
      toast.error('कृपया सध्याच्या बोलीपेक्षा जास्त रक्कम टाका');
      return;
    }
    try {
      await axios.post(`http://localhost:8000/auctions/${auctionId}/bid`, {
        amount: parseFloat(amount)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('बोली यशस्वी!');
      fetchAuctions(); // refresh immediately
    } catch (err) {
      toast.error(err.response?.data?.detail || 'बोली अयशस्वी');
    }
  };

  if (loading) return <div className="loading-spinner">लोड करत आहे...</div>;

  return (
    <div className="auction-list-container">
      <h2>🔨 सक्रिय लिलाव</h2>
      <p>खालील उत्पादनांवर बोली लावा आणि सर्वोत्तम किंमत मिळवा.</p>
      {auctions.length === 0 ? (
        <div className="no-auctions">सध्या कोणतेही सक्रिय लिलाव नाहीत.</div>
      ) : (
        <div className="auction-grid">
          {auctions.map(auction => (
            <div key={auction.id} className="auction-card">
              <div className="auction-header">
                <h3>{auction.product_name}</h3>
                <span className="bid-count">बोली: {auction.bid_count}</span>
              </div>
              <div className="auction-details">
                <p><strong>शेतकरी:</strong> {auction.seller_name}</p>
                <p><strong>सुरुवातीची बोली:</strong> ₹{auction.starting_bid}</p>
                <p><strong>सध्याची बोली:</strong> <span className="current-bid">₹{auction.current_bid}</span></p>
                <p><strong>सर्वाधिक बोली:</strong> {auction.highest_bidder_name || 'कोणीही नाही'}</p>
                <p><strong>समाप्ती वेळ:</strong> <span className="end-time">{new Date(auction.end_time).toLocaleString()}</span></p>
              </div>
              <button 
                className="bid-btn" 
                onClick={() => placeBid(auction.id, auction.current_bid)}
              >
                💰 बोली लावा
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AuctionList;