import React from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import '../../style/Buyerdashboard.css';

function BuyerDashboard() {
  const { user } = useAuth();

  const handleViewProducts = () => {
    toast.success('लवकरच उत्पादने बघता येतील!', {
      icon: '🔍',
      duration: 3000,
    });
    // नेव्हिगेशन नंतर जोडू: navigate('/buyer/products')
  };

  const handleViewOrders = () => {
    toast('तुमचे ऑर्डर येथे दिसतील', {
      icon: '🛍️',
      duration: 3000,
    });
  };

  const handleFavoriteFarmers = () => {
    toast.error('हे फीचर लवकरच येत आहे!', {
      icon: '⭐',
      duration: 3000,
    });
  };

  return (
    <div className="buyer-dashboard">
      <div className="dashboard-header">
        <h1>🛒 खरेदीदार डॅशबोर्ड</h1>
        <p>नमस्कार, {user?.full_name}! तुमच्यासाठी ताजी उत्पादने आणि ऑफर.</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card" onClick={handleViewProducts}>
          <div className="card-icon">🔍</div>
          <h3>उत्पादने बघा</h3>
          <p>शेतकऱ्यांची ताजी भाजीपाला, फळे, धान्य येथे पाहा. थेट खरेदी करा.</p>
          <button className="card-btn">आता बघा →</button>
        </div>

        <div className="dashboard-card" onClick={handleViewOrders}>
          <div className="card-icon">🛍️</div>
          <h3>माझे ऑर्डर</h3>
          <p>तुम्ही केलेल्या सर्व खरेदीचा इतिहास, स्टेटस आणि बिल येथे पाहा.</p>
          <button className="card-btn">ऑर्डर पाहा →</button>
        </div>

        <div className="dashboard-card" onClick={handleFavoriteFarmers}>
          <div className="card-icon">⭐</div>
          <h3>आवडते शेतकरी</h3>
          <p>तुमचे आवडते शेतकरी सेव्ह करा. त्यांची नवीन उत्पादने तुम्हाला नोटिफिकेशन मिळतील.</p>
          <button className="card-btn">व्यवस्थापित करा →</button>
        </div>
      </div>
    </div>
  );
}

export default BuyerDashboard;