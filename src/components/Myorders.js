// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import toast from 'react-hot-toast';
// import '../style/MyOrders.css';


// function MyOrders() {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [showRatingModal, setShowRatingModal] = useState(false);
//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [ratingValue, setRatingValue] = useState(5);
//   const [reviewComment, setReviewComment] = useState('');
//   const [submitting, setSubmitting] = useState(false);
//   const [reviewedProductIds, setReviewedProductIds] = useState(new Set());

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!token) return;
    
//     axios.get('http://localhost:8000/orders/my', {
//       headers: { Authorization: `Bearer ${token}` }
//     })
//     .then(res => {
//       const sortedOrders = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
//       setOrders(sortedOrders);
//       // Try to fetch user reviews, but don't break if endpoint missing
//       fetchUserReviews(token);
//     })
//     .catch(err => {
//       const msg = err.response?.data?.detail || err.message || 'ऑर्डर मिळवताना त्रुटी';
//       toast.error(typeof msg === 'string' ? msg : 'काहीतरी चूक झाली');
//     })
//     .finally(() => setLoading(false));
//   }, []);

//   const fetchUserReviews = async (token) => {
//     try {
//       const res = await axios.get('http://localhost:8000/reviews/my', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (Array.isArray(res.data)) {
//         const reviewedIds = new Set(res.data.map(r => r.product_id));
//         setReviewedProductIds(reviewedIds);
//       }
//     } catch (err) {
//       // Endpoint may not exist yet – ignore error
//       console.warn('Reviews endpoint not available yet');
//     }
//   };

//   const getPaymentLabel = (method, advance, pending) => {
//     if (method === 'cod') return '💵 कॅश ऑन डिलिव्हरी';
//     if (method === 'online_full') return '💳 ऑनलाइन पूर्ण पेमेंट';
//     if (method === 'online_advance') return `📱 ऑनलाइन अॅडव्हान्स (${((advance / (advance + pending)) * 100).toFixed(0)}% आगाऊ)`;
//     return method;
//   };

//   const filteredOrders = statusFilter === 'all' 
//     ? orders 
//     : orders.filter(order => order.status === statusFilter);

//   const openRatingModal = (product) => {
//     setSelectedProduct(product);
//     setRatingValue(5);
//     setReviewComment('');
//     setShowRatingModal(true);
//   };

//   const submitRating = async () => {
//     if (!selectedProduct) return;
//     setSubmitting(true);
//     const token = localStorage.getItem('token');
//     try {
//       await axios.post('http://localhost:8000/reviews', {
//         product_id: selectedProduct.product_id,
//         rating: ratingValue,
//         comment: reviewComment
//       }, { headers: { Authorization: `Bearer ${token}` } });
//       toast.success(`${selectedProduct.product_name} ला रेटिंग दिली!`);
//       setShowRatingModal(false);
//       setReviewedProductIds(prev => new Set([...prev, selectedProduct.product_id]));
//     } catch (err) {
//       let errorMsg = 'रेटिंग पाठवताना त्रुटी';
//       if (err.response?.data?.detail) {
//         errorMsg = typeof err.response.data.detail === 'string' ? err.response.data.detail : JSON.stringify(err.response.data.detail);
//       }
//       toast.error(errorMsg);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (loading) return <div className="loading-spinner">लोड करत आहे...</div>;

//   return (
//     <div className="my-orders-container">
//       <div className="my-orders-header">
//         <h2>📋 माझे ऑर्डर</h2>
//         <p>तुमच्या सर्व खरेदीचा इतिहास</p>
//       </div>

//       <div className="filter-buttons">
//         <button className={statusFilter === 'all' ? 'active' : ''} onClick={() => setStatusFilter('all')}>सर्व</button>
//         <button className={statusFilter === 'pending' ? 'active' : ''} onClick={() => setStatusFilter('pending')}>⏳ प्रलंबित</button>
//         <button className={statusFilter === 'confirmed' ? 'active' : ''} onClick={() => setStatusFilter('confirmed')}>✅ कन्फर्म</button>
//         <button className={statusFilter === 'shipped' ? 'active' : ''} onClick={() => setStatusFilter('shipped')}>🚚 पाठवले</button>
//         <button className={statusFilter === 'delivered' ? 'active' : ''} onClick={() => setStatusFilter('delivered')}>🎉 डिलिव्हर</button>
//         <button className={statusFilter === 'cancelled' ? 'active' : ''} onClick={() => setStatusFilter('cancelled')}>❌ रद्द</button>
//       </div>

//       {filteredOrders.length === 0 ? (
//         <div className="no-orders">
//           <span>🛒</span>
//           <p>या स्टेटसमध्ये कोणतेही ऑर्डर नाहीत.</p>
//           {statusFilter !== 'all' && <button onClick={() => setStatusFilter('all')}>सर्व ऑर्डर बघा</button>}
//         </div>
//       ) : (
//         <div className="orders-list">
//           {filteredOrders.map(order => (
//             <div key={order.id} className="order-card">
//               <div className="order-header">
//                 <span className="order-id">ऑर्डर # {order.id}</span>
//                 <span className={`order-status ${order.status}`}>
//                   {order.status === 'pending' ? '⏳ प्रलंबित' : 
//                    order.status === 'confirmed' ? '✅ कन्फर्म' :
//                    order.status === 'shipped' ? '🚚 पाठवले' :
//                    order.status === 'delivered' ? '🎉 डिलिव्हर' : '❌ रद्द'}
//                 </span>
//               </div>
//               <div className="order-body">
//                 <div className="order-date">
//                   📅 {new Date(order.created_at).toLocaleDateString('mr-IN')} | 
//                   🕒 {new Date(order.created_at).toLocaleTimeString()}
//                 </div>
//                 <div className="order-total">
//                   <strong>एकूण रक्कम:</strong> ₹{order.total_amount.toFixed(2)}
//                 </div>
                
//                 <div className="payment-details">
//                   <p><strong>💳 पेमेंट पद्धत:</strong> {getPaymentLabel(order.payment_method, order.advance_paid, order.pending_amount)}</p>
//                   {order.payment_method !== 'cod' && (
//                     <>
//                       <p><strong>✅ ऑनलाइन भरलेले:</strong> ₹{order.advance_paid.toFixed(2)}</p>
//                       <p><strong>⏳ डिलिव्हरीवेळी देय:</strong> ₹{order.pending_amount.toFixed(2)}</p>
//                     </>
//                   )}
//                 </div>

//                 {order.items && order.items.length > 0 && (
//                   <div className="order-items">
//                     <strong>उत्पादने:</strong>
//                     <ul>
//                       {order.items.map((item, idx) => (
//                         <li key={idx} className="order-product-item">
//                           <span>{item.product_name} – {item.quantity} x ₹{item.price} = ₹{(item.quantity * item.price).toFixed(2)}</span>
//                           {order.status === 'delivered' && (
//                             reviewedProductIds.has(item.product_id) ? (
//                               <span className="already-reviewed">✓ रिव्ह्यू दिला</span>
//                             ) : (
//                               <button className="rate-product-btn" onClick={() => openRatingModal(item)}>⭐ रेट करा</button>
//                             )
//                           )}
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 )}
                
//                 {order.delivery_date ? (
//                   <div className="delivery-date">
//                     🚚 अंदाजित डिलिव्हरी तारीख: {new Date(order.delivery_date).toLocaleDateString('mr-IN')}
//                   </div>
//                 ) : (
//                   <div className="delivery-date-pending">
//                     ⏳ डिलिव्हरी तारीख अद्याप निश्चित नाही
//                   </div>
//                 )}
//               </div>
//               <button onClick={() => navigate(`/chat?userId=${order.farmer_id}`)}>
//   💬 शेतकऱ्याला संदेश
// </button>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Rating Modal */}
//       {showRatingModal && selectedProduct && (
//         <div className="modal-overlay" onClick={() => setShowRatingModal(false)}>
//           <div className="modal-content" onClick={e => e.stopPropagation()}>
//             <h3>{selectedProduct.product_name} ला रेटिंग द्या</h3>
//             <div className="rating-select">
//               {[1,2,3,4,5].map(star => (
//                 <span key={star} onClick={() => setRatingValue(star)} style={{cursor:'pointer', fontSize:28, color: star <= ratingValue ? 'gold' : 'gray'}}>★</span>
//               ))}
//             </div>
//             <textarea 
//               value={reviewComment} 
//               onChange={e => setReviewComment(e.target.value)} 
//               placeholder="तुमचा अनुभव थोडक्यात लिहा (पर्यायी)" 
//               rows="3"
//             />
//             <div className="modal-buttons">
//               <button className="submit-review-btn" onClick={submitRating} disabled={submitting}>
//                 {submitting ? 'पाठवत आहे...' : 'रिव्ह्यू पाठवा'}
//               </button>
//               <button className="cancel-btn" onClick={() => setShowRatingModal(false)}>रद्द करा</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default MyOrders;


import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';   // ✅ नेव्हिगेटसाठी
import axios from 'axios';
import toast from 'react-hot-toast';
import '../style/MyOrders.css';

function MyOrders() {
  const navigate = useNavigate();   // ✅ हुक वापरा
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewedProductIds, setReviewedProductIds] = useState(new Set());

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    axios.get('http://localhost:8000/orders/my', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const sortedOrders = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setOrders(sortedOrders);
      fetchUserReviews(token);
    })
    .catch(err => {
      const msg = err.response?.data?.detail || err.message || 'ऑर्डर मिळवताना त्रुटी';
      toast.error(typeof msg === 'string' ? msg : 'काहीतरी चूक झाली');
    })
    .finally(() => setLoading(false));
  }, []);

  const fetchUserReviews = async (token) => {
    try {
      const res = await axios.get('http://localhost:8000/reviews/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Array.isArray(res.data)) {
        const reviewedIds = new Set(res.data.map(r => r.product_id));
        setReviewedProductIds(reviewedIds);
      }
    } catch (err) {
      console.warn('Reviews endpoint not available yet');
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

  const openRatingModal = (product) => {
    setSelectedProduct(product);
    setRatingValue(5);
    setReviewComment('');
    setShowRatingModal(true);
  };

  const submitRating = async () => {
    if (!selectedProduct) return;
    setSubmitting(true);
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:8000/reviews', {
        product_id: selectedProduct.product_id,
        rating: ratingValue,
        comment: reviewComment
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`${selectedProduct.product_name} ला रेटिंग दिली!`);
      setShowRatingModal(false);
      setReviewedProductIds(prev => new Set([...prev, selectedProduct.product_id]));
    } catch (err) {
      let errorMsg = 'रेटिंग पाठवताना त्रुटी';
      if (err.response?.data?.detail) {
        errorMsg = typeof err.response.data.detail === 'string' ? err.response.data.detail : JSON.stringify(err.response.data.detail);
      }
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-spinner">लोड करत आहे...</div>;

  return (
    <div className="my-orders-container">
      <div className="my-orders-header">
        <h2>📋 माझे ऑर्डर</h2>
        <p>तुमच्या सर्व खरेदीचा इतिहास</p>
      </div>

      <div className="filter-buttons">
        <button className={statusFilter === 'all' ? 'active' : ''} onClick={() => setStatusFilter('all')}>सर्व</button>
        <button className={statusFilter === 'pending' ? 'active' : ''} onClick={() => setStatusFilter('pending')}>⏳ प्रलंबित</button>
        <button className={statusFilter === 'confirmed' ? 'active' : ''} onClick={() => setStatusFilter('confirmed')}>✅ कन्फर्म</button>
        <button className={statusFilter === 'shipped' ? 'active' : ''} onClick={() => setStatusFilter('shipped')}>🚚 पाठवले</button>
        <button className={statusFilter === 'delivered' ? 'active' : ''} onClick={() => setStatusFilter('delivered')}>🎉 डिलिव्हर</button>
        <button className={statusFilter === 'cancelled' ? 'active' : ''} onClick={() => setStatusFilter('cancelled')}>❌ रद्द</button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="no-orders">
          <span>🛒</span>
          <p>या स्टेटसमध्ये कोणतेही ऑर्डर नाहीत.</p>
          {statusFilter !== 'all' && <button onClick={() => setStatusFilter('all')}>सर्व ऑर्डर बघा</button>}
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <span className="order-id">ऑर्डर # {order.id}</span>
                <span className={`order-status ${order.status}`}>
                  {order.status === 'pending' ? '⏳ प्रलंबित' : 
                   order.status === 'confirmed' ? '✅ कन्फर्म' :
                   order.status === 'shipped' ? '🚚 पाठवले' :
                   order.status === 'delivered' ? '🎉 डिलिव्हर' : '❌ रद्द'}
                </span>
              </div>
              <div className="order-body">
                <div className="order-date">
                  📅 {new Date(order.created_at).toLocaleDateString('mr-IN')} | 
                  🕒 {new Date(order.created_at).toLocaleTimeString()}
                </div>
                <div className="order-total">
                  <strong>एकूण रक्कम:</strong> ₹{order.total_amount.toFixed(2)}
                </div>
                
                <div className="payment-details">
                  <p><strong>💳 पेमेंट पद्धत:</strong> {getPaymentLabel(order.payment_method, order.advance_paid, order.pending_amount)}</p>
                  {order.payment_method !== 'cod' && (
                    <>
                      <p><strong>✅ ऑनलाइन भरलेले:</strong> ₹{order.advance_paid.toFixed(2)}</p>
                      <p><strong>⏳ डिलिव्हरीवेळी देय:</strong> ₹{order.pending_amount.toFixed(2)}</p>
                    </>
                  )}
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="order-items">
                    <strong>उत्पादने:</strong>
                    <ul>
                      {order.items.map((item, idx) => (
                        <li key={idx} className="order-product-item">
                          <span>{item.product_name} – {item.quantity} x ₹{item.price} = ₹{(item.quantity * item.price).toFixed(2)}</span>
                          {order.status === 'delivered' && (
                            reviewedProductIds.has(item.product_id) ? (
                              <span className="already-reviewed">✓ रिव्ह्यू दिला</span>
                            ) : (
                              <button className="rate-product-btn" onClick={() => openRatingModal(item)}>⭐ रेट करा</button>
                            )
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {order.delivery_date ? (
                  <div className="delivery-date">
                    🚚 अंदाजित डिलिव्हरी तारीख: {new Date(order.delivery_date).toLocaleDateString('mr-IN')}
                  </div>
                ) : (
                  <div className="delivery-date-pending">
                    ⏳ डिलिव्हरी तारीख अद्याप निश्चित नाही
                  </div>
                )}

                {/* ✅ मेसेज बटण – खरेदीदार ते शेतकरी */}
                <button 
                  className="msg-farmer-btn" 
                  onClick={() => navigate(`/chat?userId=${order.buyer_id ? order.buyer_id : order.items[0]?.farmer_id}`)}
                >
                  💬 शेतकऱ्याला संदेश पाठवा
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedProduct && (
        <div className="modal-overlay" onClick={() => setShowRatingModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{selectedProduct.product_name} ला रेटिंग द्या</h3>
            <div className="rating-select">
              {[1,2,3,4,5].map(star => (
                <span key={star} onClick={() => setRatingValue(star)} style={{cursor:'pointer', fontSize:28, color: star <= ratingValue ? 'gold' : 'gray'}}>★</span>
              ))}
            </div>
            <textarea 
              value={reviewComment} 
              onChange={e => setReviewComment(e.target.value)} 
              placeholder="तुमचा अनुभव थोडक्यात लिहा (पर्यायी)" 
              rows="3"
            />
            <div className="modal-buttons">
              <button className="submit-review-btn" onClick={submitRating} disabled={submitting}>
                {submitting ? 'पाठवत आहे...' : 'रिव्ह्यू पाठवा'}
              </button>
              <button className="cancel-btn" onClick={() => setShowRatingModal(false)}>रद्द करा</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyOrders;