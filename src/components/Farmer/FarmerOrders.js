// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import toast from 'react-hot-toast';
// import '../style/FarmerOrders.css';

// function FarmerOrders() {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [statusFilter, setStatusFilter] = useState('all');
//   const token = localStorage.getItem('token');

//   const fetchOrders = async () => {
//     try {
//       const res = await axios.get('http://localhost:8000/orders/farmer', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       // सर्वात नवीन ऑर्डर आधी येण्यासाठी सॉर्ट
//       const sortedOrders = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
//       setOrders(sortedOrders);
//     } catch (err) {
//       toast.error('ऑर्डर मिळवताना त्रुटी');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const updateStatus = async (orderId, newStatus) => {
//     try {
//       await axios.patch(`http://localhost:8000/orders/${orderId}/status?status=${newStatus}`, {}, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       toast.success(`ऑर्डर ${newStatus} केली`);
//       fetchOrders();
//     } catch (err) {
//       toast.error('स्टेटस बदलताना त्रुटी');
//     }
//   };

//   const updateDeliveryDate = async (orderId, date) => {
//     if (!date) return;
//     try {
//       await axios.patch(`http://localhost:8000/orders/${orderId}/delivery-date?delivery_date=${date}`, {}, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       toast.success('डिलिव्हरी तारीख अपडेट केली');
//       fetchOrders();
//     } catch (err) {
//       toast.error('तारीख अपडेट करताना त्रुटी');
//     }
//   };

//   // पेमेंट पद्धतीनुसार लेबल
//   const getPaymentLabel = (method, advance, pending) => {
//     if (method === 'cod') return '💵 कॅश ऑन डिलिव्हरी';
//     if (method === 'online_full') return '💳 ऑनलाइन पूर्ण पेमेंट';
//     if (method === 'online_advance') return `📱 ऑनलाइन अॅडव्हान्स (${((advance / (advance + pending)) * 100).toFixed(0)}% आगाऊ)`;
//     return method;
//   };

//   // स्टेटसनुसार फिल्टर
//   const filteredOrders = statusFilter === 'all' 
//     ? orders 
//     : orders.filter(order => order.status === statusFilter);

//   if (loading) return <div className="loading">लोड करत आहे...</div>;

//   return (
//     <div className="farmer-orders-container">
//       <h2>📦 माझ्या उत्पादनांवर आलेल्या ऑर्डर</h2>

//       {/* फिल्टर बटणे */}
//       <div className="filter-buttons">
//         <button className={statusFilter === 'all' ? 'active' : ''} onClick={() => setStatusFilter('all')}>सर्व</button>
//         <button className={statusFilter === 'pending' ? 'active' : ''} onClick={() => setStatusFilter('pending')}>⏳ प्रलंबित</button>
//         <button className={statusFilter === 'confirmed' ? 'active' : ''} onClick={() => setStatusFilter('confirmed')}>✅ कन्फर्म</button>
//         <button className={statusFilter === 'shipped' ? 'active' : ''} onClick={() => setStatusFilter('shipped')}>🚚 पाठवले</button>
//         <button className={statusFilter === 'delivered' ? 'active' : ''} onClick={() => setStatusFilter('delivered')}>🎉 डिलिव्हर</button>
//         <button className={statusFilter === 'cancelled' ? 'active' : ''} onClick={() => setStatusFilter('cancelled')}>❌ रद्द</button>
//       </div>

//       {filteredOrders.length === 0 ? (
//         <p>अद्याप कोणतीही ऑर्डर नाही.</p>
//       ) : (
//         <div className="orders-list">
//           {filteredOrders.map(order => (
//             <div key={order.id} className="order-card">
//               <div className="order-header">
//                 <span>ऑर्डर # {order.id}</span>
//                 <span className={`status-badge ${order.status}`}>{order.status}</span>
//               </div>
//               <div className="order-body">
//                 <p><strong>एकूण:</strong> ₹{order.total_amount}</p>
//                 <p><strong>तारीख:</strong> {new Date(order.created_at).toLocaleString()}</p>
                
//                 {/* पेमेंट तपशील */}
//                 <div className="payment-details">
//                   <p><strong>💳 पेमेंट पद्धत:</strong> {getPaymentLabel(order.payment_method, order.advance_paid, order.pending_amount)}</p>
//                   {order.payment_method !== 'cod' && (
//                     <>
//                       <p><strong>✅ ऑनलाइन भरलेले:</strong> ₹{order.advance_paid.toFixed(2)}</p>
//                       <p><strong>⏳ डिलिव्हरीवेळी देय:</strong> ₹{order.pending_amount.toFixed(2)}</p>
//                     </>
//                   )}
//                 </div>

//                 <div className="order-items">
//                   <strong>उत्पादने:</strong>
//                   <ul>
//                     {order.items.map((item, idx) => (
//                       <li key={idx}>{item.product_name} - {item.quantity} x ₹{item.price} = ₹{item.quantity * item.price}</li>
//                     ))}
//                   </ul>
//                 </div>
//                 <div className="delivery-date-control">
//                   <label>📅 डिलिव्हरी तारीख: </label>
//                   <input
//                     type="date"
//                     value={order.delivery_date ? order.delivery_date.split('T')[0] : ''}
//                     onChange={(e) => updateDeliveryDate(order.id, e.target.value)}
//                   />
//                 </div>
//                 <div className="status-actions">
//                   <label>स्टेटस बदला: </label>
//                   <select onChange={(e) => updateStatus(order.id, e.target.value)} value={order.status}>
//                     <option value="pending">प्रलंबित</option>
//                     <option value="confirmed">कन्फर्म</option>
//                     <option value="shipped">पाठवले</option>
//                     <option value="delivered">डिलिव्हर</option>
//                     <option value="cancelled">रद्द</option>
//                   </select>
//                 </div>
//                 <button onClick={() => navigate(`/chat?userId=${order.buyer_id}`)}>
//   💬 खरेदीदाराला संदेश
// </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
// export default FarmerOrders;



import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';   // हे import करायला विसरू नको
import axios from 'axios';
import toast from 'react-hot-toast';
import '../../style/FarmerOrders.css';

function FarmerOrders() {
  const navigate = useNavigate();   // हुक वापरा
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const token = localStorage.getItem('token');

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:8000/orders/farmer', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const sortedOrders = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setOrders(sortedOrders);
    } catch (err) {
      toast.error('ऑर्डर मिळवताना त्रुटी');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`http://localhost:8000/orders/${orderId}/status?status=${newStatus}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`ऑर्डर ${newStatus} केली`);
      fetchOrders();
    } catch (err) {
      toast.error('स्टेटस बदलताना त्रुटी');
    }
  };


  // downloadInvoice फंक्शन जोडा
const downloadInvoice = async (orderId) => {
  try {
    const response = await axios.get(`http://localhost:8000/orders/${orderId}/invoice`, {
      responseType: 'blob',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoice_${orderId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    toast.error('Failed to download invoice');
  }
};

// बटण जोडा (order कार्डच्या शेवटी)


  const updateDeliveryDate = async (orderId, date) => {
    if (!date) return;
    try {
      await axios.patch(`http://localhost:8000/orders/${orderId}/delivery-date?delivery_date=${date}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('डिलिव्हरी तारीख अपडेट केली');
      fetchOrders();
    } catch (err) {
      toast.error('तारीख अपडेट करताना त्रुटी');
    }
  };

  const getPaymentLabel = (method, advance, pending) => {
    if (method === 'cod') return '💵 कॅश ऑन डिलिव्हरी';
    if (method === 'online_full') return '💳 ऑनलाइन पूर्ण पेमेंट';
    if (method === 'online_advance') return `📱 ऑनलाइन अॅडव्हान्स (${((advance / (advance + pending)) * 100).toFixed(0)}% आगाऊ)`;
    return method;
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  if (loading) return <div className="loading">लोड करत आहे...</div>;

  return (
    <div className="farmer-orders-container">
      <h2>📦 माझ्या उत्पादनांवर आलेल्या ऑर्डर</h2>

      <div className="filter-buttons">
        <button className={statusFilter === 'all' ? 'active' : ''} onClick={() => setStatusFilter('all')}>सर्व</button>
        <button className={statusFilter === 'pending' ? 'active' : ''} onClick={() => setStatusFilter('pending')}>⏳ प्रलंबित</button>
        <button className={statusFilter === 'confirmed' ? 'active' : ''} onClick={() => setStatusFilter('confirmed')}>✅ कन्फर्म</button>
        <button className={statusFilter === 'shipped' ? 'active' : ''} onClick={() => setStatusFilter('shipped')}>🚚 पाठवले</button>
        <button className={statusFilter === 'delivered' ? 'active' : ''} onClick={() => setStatusFilter('delivered')}>🎉 डिलिव्हर</button>
        <button className={statusFilter === 'cancelled' ? 'active' : ''} onClick={() => setStatusFilter('cancelled')}>❌ रद्द</button>
      </div>

      {filteredOrders.length === 0 ? (
        <p>अद्याप कोणतीही ऑर्डर नाही.</p>
      ) : (
        <div className="orders-list">
          {filteredOrders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <span>ऑर्डर # {order.id}</span>
                <span className={`status-badge ${order.status}`}>{order.status}</span>
              </div>
              <div className="order-body">
                <p><strong>एकूण:</strong> ₹{order.total_amount}</p>
                <p><strong>तारीख:</strong> {new Date(order.created_at).toLocaleString()}</p>
                
                <div className="payment-details">
                  <p><strong>💳 पेमेंट पद्धत:</strong> {getPaymentLabel(order.payment_method, order.advance_paid, order.pending_amount)}</p>
                  {order.payment_method !== 'cod' && (
                    <>
                      <p><strong>✅ ऑनलाइन भरलेले:</strong> ₹{order.advance_paid.toFixed(2)}</p>
                      <p><strong>⏳ डिलिव्हरीवेळी देय:</strong> ₹{order.pending_amount.toFixed(2)}</p>
                    </>
                  )}
                </div>

                <div className="order-items">
                  <strong>उत्पादने:</strong>
                  <ul>
                    {order.items.map((item, idx) => (
                      <li key={idx}>{item.product_name} - {item.quantity} x ₹{item.price} = ₹{item.quantity * item.price}</li>
                    ))}
                  </ul>
                </div>
                <div className="delivery-date-control">
                  <label>📅 डिलिव्हरी तारीख: </label>
                  <input
                    type="date"
                    value={order.delivery_date ? order.delivery_date.split('T')[0] : ''}
                    onChange={(e) => updateDeliveryDate(order.id, e.target.value)}
                  />
                </div>
                <div className="status-actions">
                  <label>स्टेटस बदला: </label>
                  <select onChange={(e) => updateStatus(order.id, e.target.value)} value={order.status}>
                    <option value="pending">प्रलंबित</option>
                    <option value="confirmed">कन्फर्म</option>
                    <option value="shipped">पाठवले</option>
                    <option value="delivered">डिलिव्हर</option>
                    <option value="cancelled">रद्द</option>
                  </select>
                </div>
                <button onClick={() => downloadInvoice(order.id)} className="invoice-btn">📄 इनव्हॉइस डाउनलोड करा</button>
                
                {/* मेसेज बटण – शेतकरी ते खरेदीदार */}
                {/* <button 
                  className="msg-buyer-btn" 
                  onClick={() =>navigate(`/chat?userId=${order.buyer_id }`)}
                  
                >
                  💬 खरेदीदाराला संदेश पाठवा
                </button> */}
<button 
  className="msg-buyer-btn" 
  onClick={() => {
    console.log('Order object:', order);
    console.log('Buyer ID:', order.buyer_id);
    navigate(`/chat?userId=${order.buyer_id}`);
  }}
>
  💬 खरेदीदाराला संदेश पाठवा
</button>


              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FarmerOrders;