import React from 'react';
import '../style/ProductModal.css';

function ProductModal({ product, onClose }) {
  if (!product) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>{product.name}</h3>
        <p><strong>किंमत:</strong> ₹{product.price} / {product.unit}</p>
        <p><strong>उपलब्ध प्रमाण:</strong> {product.quantity} {product.unit}</p>
        <p><strong>शेतकरी:</strong> {product.farmer_name}</p>
        <p><strong>ठिकाण:</strong> {product.location || 'नाही'}</p>
        <p><strong>माहिती:</strong> {product.description || 'नाही'}</p>
        <button className="cart-btn">🛒 कार्टमध्ये घाला</button>
        <button className="close-btn" onClick={onClose}>बंद करा</button>
      </div>
    </div>
  );
}
export default ProductModal;