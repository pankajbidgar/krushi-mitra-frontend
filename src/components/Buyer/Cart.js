import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../../style/Cart.css';

function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [advancePercent, setAdvancePercent] = useState(30);
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_URL;

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      setCart(JSON.parse(saved));
    }
  };

  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const updateQuantity = (id, newQty) => {
    if (newQty < 1) {
      removeItem(id);
      return;
    }
    const newCart = cart.map(item =>
      item.id === id ? { ...item, quantity: newQty } : item
    );
    saveCart(newCart);
  };

  const removeItem = (id) => {
    const newCart = cart.filter(item => item.id !== id);
    saveCart(newCart);
    toast.success('उत्पादन कार्टमधून हटवले');
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const advanceAmount = (advancePercent / 100) * total;
  const pendingAmount = total - advanceAmount;

  const placeOrder = async () => {
    if (cart.length === 0) {
      toast.error('कार्ट रिकामे आहे');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');
    const orderData = {
      items: cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity
      })),
      payment_method: paymentMethod,
      advance_percent: paymentMethod === 'online_advance' ? advancePercent : null
    };

    try {
      const response = await axios.post(`${API}/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // If COD, just clear cart and go to orders
      if (paymentMethod === 'cod') {
        toast.success('ऑर्डर यशस्वी! धन्यवाद.');
        localStorage.removeItem('cart');
        setCart([]);
        navigate('/buyer/orders');
      } else {
        // Online payment: open Razorpay
        const options = {
          key: response.data.razorpay_key,
          amount: response.data.advance_paid * 100,
          currency: 'INR',
          name: 'शेतकरी बाजार',
          description: `ऑर्डर #${response.data.id}`,
          order_id: response.data.razorpay_order_id,
          handler: async (paymentResponse) => {
            // Verify payment on backend
            try {
              await axios.post(`${API}/verify-payment`, {
                order_id: response.data.id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_signature: paymentResponse.razorpay_signature
              }, {
                headers: { Authorization: `Bearer ${token}` }
              });
              toast.success('पेमेंट यशस्वी! ऑर्डर कन्फर्म झाली.');
              localStorage.removeItem('cart');
              setCart([]);
              navigate('/buyer/orders');
            } catch (err) {
              toast.error('पेमेंट व्हेरिफिकेशन अयशस्वी');
            }
          },
          prefill: {
            name: localStorage.getItem('user_name') || '',
            email: localStorage.getItem('user_email') || ''
          },
          theme: {
            color: '#2e7d32'
          }
        };
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'ऑर्डर करताना त्रुटी';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <h2>🛒 तुमचे कार्ट रिकामे आहे</h2>
        <button onClick={() => navigate('/buyer/products')}>उत्पादने बघा</button>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2>🛍️ तुमचे कार्ट</h2>
      <div className="cart-items">
        {cart.map(item => (
          <div key={item.id} className="cart-item">
            {item.image_urls && item.image_urls[0] && (
              <img src={`${API}${item.image_urls[0]}`} alt={item.name} className="cart-item-img" />
            )}
            <div className="cart-item-info">
              <h4>{item.name}</h4>
              <p>₹{item.price} / {item.unit}</p>
            </div>
            <div className="cart-item-controls">
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
              <button className="remove-btn" onClick={() => removeItem(item.id)}>हटवा</button>
            </div>
            <div className="cart-item-total">
              ₹{(item.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <div className="payment-section">
        <h3>पेमेंट पर्याय निवडा</h3>
        <label className="payment-option">
          <input
            type="radio"
            name="payment"
            value="cod"
            checked={paymentMethod === 'cod'}
            onChange={() => setPaymentMethod('cod')}
          />
          <span>🚚 कॅश ऑन डिलिव्हरी (COD) – पूर्ण रक्कम डिलिव्हरीवेळी</span>
        </label>
        <label className="payment-option">
          <input
            type="radio"
            name="payment"
            value="online_full"
            checked={paymentMethod === 'online_full'}
            onChange={() => setPaymentMethod('online_full')}
          />
          <span>💳 ऑनलाइन पूर्ण पेमेंट – आत्ताच पूर्ण पैसे द्या</span>
        </label>
        <label className="payment-option">
          <input
            type="radio"
            name="payment"
            value="online_advance"
            checked={paymentMethod === 'online_advance'}
            onChange={() => setPaymentMethod('online_advance')}
          />
          <span>📱 ऑनलाइन अॅडव्हान्स – आत्ता <strong>{advancePercent}%</strong> (₹{advanceAmount.toFixed(2)}) आणि उरलेले ₹{pendingAmount.toFixed(2)} डिलिव्हरीवेळी</span>
        </label>

        {paymentMethod === 'online_advance' && (
          <div className="advance-slider">
            <input
              type="range"
              min="10"
              max="90"
              step="5"
              value={advancePercent}
              onChange={(e) => setAdvancePercent(Number(e.target.value))}
            />
            <span>{advancePercent}% अॅडव्हान्स (₹{advanceAmount.toFixed(2)})</span>
          </div>
        )}

        <div className="payment-summary">
          <p><strong>एकूण रक्कम:</strong> ₹{total.toFixed(2)}</p>
          {paymentMethod !== 'cod' && (
            <>
              <p><strong>आत्ता द्यावयाचे:</strong> ₹{(paymentMethod === 'online_full' ? total : advanceAmount).toFixed(2)}</p>
              <p><strong>डिलिव्हरीवेळी देय:</strong> ₹{(paymentMethod === 'online_full' ? 0 : (paymentMethod === 'cod' ? total : pendingAmount)).toFixed(2)}</p>
            </>
          )}
        </div>
      </div>

      <div className="cart-summary">
        <button className="order-btn" onClick={placeOrder} disabled={loading}>
          {loading ? 'प्रक्रिया करत आहे...' : 'ऑर्डर करा'}
        </button>
      </div>
    </div>
  );
}

export default Cart;