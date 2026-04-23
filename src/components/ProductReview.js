import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import StarRating from '../context/StarRating';

function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [checking, setChecking] = useState(true);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem('token');

  const API = process.env.REACT_APP_API_URL;

  // फेच सर्व रिव्ह्यू
  const fetchReviews = async () => {
    if (!productId) return;
    try {
      const res = await axios.get(`${API}/reviews/product/${productId}`);
      setReviews(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // तपासा की buyer ने हे उत्पादन delivered ऑर्डरमध्ये घेतले आहे का
  const checkReviewEligibility = async () => {
    if (!productId || !token) {
      setChecking(false);
      return;
    }
    try {
      const res = await axios.get(`${API}/orders/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const orders = res.data;
      // बघा की delivered order मध्ये हे product आहे का
      const eligible = orders.some(order => 
        order.status === 'delivered' && 
        order.items && order.items.some(item => item.product_id === productId)
      );
      setCanReview(eligible);
    } catch (err) {
      console.error(err);
      setCanReview(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    checkReviewEligibility();
  }, [productId]);

  const submitReview = async () => {
    if (!productId) return;
    setSubmitting(true);
    try {
      await axios.post(`${API}/reviews`, {
        product_id: productId,
        rating: newRating,
        comment: newComment
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('तुमचा अभिप्राय नोंदवला गेला!');
      setNewComment('');
      setNewRating(5);
      fetchReviews(); // रिव्ह्यू लिस्ट रिफ्रेश करा
      // पुन्हा पात्रता तपासा (आता रिव्ह्यू दिला आहे, त्यामुळे पुन्हा देऊ शकणार नाही)
      checkReviewEligibility();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'रिव्ह्यू पाठवताना त्रुटी');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="product-reviews">
      <h4>📝 ग्राहकांचे मत</h4>
      {reviews.length === 0 && <p>अद्याप कोणतेही रिव्ह्यू नाहीत. तुम्ही पहिले व्हा!</p>}
      {reviews.map(r => (
        <div key={r.id} className="review-card">
          <div><strong>{r.user_name}</strong> <StarRating rating={r.rating} /></div>
          <p>{r.comment}</p>
          <small>{new Date(r.created_at).toLocaleDateString()}</small>
        </div>
      ))}

      {checking ? (
        <p>प्रतीक्षा करा...</p>
      ) : canReview ? (
        <div className="add-review">
          <h5>तुमचे मत नोंदवा</h5>
          <div className="rating-select">
            {[1,2,3,4,5].map(star => (
              <span key={star} onClick={() => setNewRating(star)} style={{cursor:'pointer', fontSize:24, color: star <= newRating ? 'gold' : 'gray'}}>★</span>
            ))}
          </div>
          <textarea 
            value={newComment} 
            onChange={e => setNewComment(e.target.value)} 
            placeholder="तुमचा अनुभव इथे लिहा..." 
            rows="3" 
          />
          <button onClick={submitReview} disabled={submitting}>अभिप्राय पाठवा</button>
        </div>
      ) : (
        <div className="cannot-review-msg">
          ⚠️ या उत्पादनावर रिव्ह्यू देण्यासाठी तुम्ही हे उत्पादन ऑर्डर केले पाहिजे आणि ते डिलिव्हर झाले पाहिजे.
        </div>
      )}
    </div>
  );
}

export default ProductReviews;