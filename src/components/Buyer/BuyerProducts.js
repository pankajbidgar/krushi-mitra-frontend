

// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';   // ✅ import navigate
// import axios from 'axios';
// import toast from 'react-hot-toast';
// import '../style/BuyerProducts.css';
// import ProductReviews from './ProductReview';
// import StarRating from '../context/StarRating';

// function BuyerProducts() {
//   const navigate = useNavigate();   // ✅ useNavigate hook
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');
//   const [locationFilter, setLocationFilter] = useState('');
//   const [selectedProduct, setSelectedProduct] = useState(null);

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   const fetchProducts = async () => {
//     try {
//       const res = await axios.get('http://localhost:8000/products');
//       const sortedProducts = res.data.sort((a, b) => {
//         const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
//         const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
//         return dateB - dateA;
//       });
//       setProducts(sortedProducts);
//     } catch (err) {
//       toast.error('उत्पादने मिळवताना त्रुटी');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredProducts = products.filter(p => {
//     const matchName = p.name.toLowerCase().includes(search.toLowerCase());
//     const matchLocation = locationFilter === '' || (p.location && p.location.toLowerCase().includes(locationFilter.toLowerCase()));
//     return matchName && matchLocation;
//   });

//   const uniqueLocations = [...new Set(products.map(p => p.location).filter(l => l))];

//   const addToCart = (product) => {
//     let cart = JSON.parse(localStorage.getItem('cart') || '[]');
//     const existing = cart.find(item => item.id === product.id);
//     if (existing) {
//       existing.quantity += 1;
//     } else {
//       cart.push({ ...product, quantity: 1 });
//     }
//     localStorage.setItem('cart', JSON.stringify(cart));
//     toast.success(`${product.name} कार्टमध्ये जोडले`);
//   };

//   if (loading) return <div className="loading">लोड करत आहे...</div>;

//   return (
//     <div className="buyer-products">
//       <h2>🛒 सर्व उत्पादने</h2>
//       <div className="filters">
//         <input type="text" placeholder="उत्पादनाचे नाव..." value={search} onChange={e => setSearch(e.target.value)} />
//         <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)}>
//           <option value="">सर्व ठिकाणे</option>
//           {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
//         </select>
//       </div>
//       {filteredProducts.length === 0 ? (
//         <p>कोणतेही उत्पादन सापडले नाही.</p>
//       ) : (
//         <div className="products-grid">
//           {filteredProducts.map(p => (
//             <div key={p.id} className="product-card">
//               {p.image_urls && p.image_urls.length > 0 && (
//                 <img src={`http://localhost:8000${p.image_urls[0]}`} alt={p.name} className="product-img" />
//               )}
//               <h3>{p.name}</h3>
//               <p className="price">₹{p.price} / {p.unit}</p>
//               <p>उपलब्ध: {p.quantity} {p.unit}</p>
//               <p>शेतकरी: {p.farmer_name || 'अज्ञात'}</p>
//               <p>ठिकाण: {p.location || 'नाही'}</p>
              
//               <div className="product-rating">
//                 {p.avg_rating ? (
//                   <>
//                     <StarRating rating={Math.round(p.avg_rating)} />
//                     <span className="rating-count">({p.review_count} रिव्ह्यू)</span>
//                   </>
//                 ) : (
//                   <span className="no-rating">अद्याप रेटिंग नाही</span>
//                 )}
//               </div>

//               <div className="card-buttons">
//                 <button className="details-btn" onClick={() => setSelectedProduct(p)}>तपशील</button>
//                 <button className="cart-btn" onClick={() => addToCart(p)}>कार्टमध्ये घाला</button>
//                 {/* ✅ मेसेज बटण – शेतकऱ्याला थेट चॅट */}
//                 <button 
//                   className="msg-btn" 
//                   onClick={() => navigate(`/chat?userId=${p.farmer_id}`)}
//                 >
//                   💬 संदेश पाठवा
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Modal for product details */}
//       {selectedProduct && (
//         <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
//           <div className="modal-content" onClick={e => e.stopPropagation()}>
//             <h3>{selectedProduct.name}</h3>
            
//             {selectedProduct.image_urls && selectedProduct.image_urls.length > 0 && (
//               <div className="modal-images">
//                 {selectedProduct.image_urls.map((url, idx) => (
//                   <img key={idx} src={`http://localhost:8000${url}`} alt={`${selectedProduct.name} ${idx+1}`} className="modal-img" />
//                 ))}
//               </div>
//             )}
            
//             <p><strong>किंमत:</strong> ₹{selectedProduct.price} / {selectedProduct.unit}</p>
//             <p><strong>उपलब्ध प्रमाण:</strong> {selectedProduct.quantity} {selectedProduct.unit}</p>
//             <p><strong>शेतकरी:</strong> {selectedProduct.farmer_name}</p>
//             <p><strong>ठिकाण:</strong> {selectedProduct.location || 'नाही'}</p>
//             <p><strong>माहिती:</strong> {selectedProduct.description || 'नाही'}</p>
            
//             <ProductReviews productId={selectedProduct.id} />

//             <div className="modal-buttons">
//               <button className="cart-btn" onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}>कार्टमध्ये घाला</button>
//               <button className="close-btn" onClick={() => setSelectedProduct(null)}>बंद करा</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default BuyerProducts;



import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../../style/BuyerProducts.css';
import ProductReviews from '../ProductReview';
import StarRating from '../../context/StarRating';

function BuyerProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(''); // नवीन
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:8000/products');
      const sortedProducts = res.data.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        return dateB - dateA;
      });
      setProducts(sortedProducts);
    } catch (err) {
      toast.error('उत्पादने मिळवताना त्रुटी');
    } finally {
      setLoading(false);
    }
  };

  // फिल्टर लॉजिक (नाव, ठिकाण, कॅटेगरी)
  const filteredProducts = products.filter(p => {
    const matchName = p.name.toLowerCase().includes(search.toLowerCase());
    const matchLocation = locationFilter === '' || (p.location && p.location.toLowerCase().includes(locationFilter.toLowerCase()));
    const matchCategory = categoryFilter === '' || p.category === categoryFilter;
    return matchName && matchLocation && matchCategory;
  });

  const uniqueLocations = [...new Set(products.map(p => p.location).filter(l => l))];
  const categories = [...new Set(products.map(p => p.category).filter(c => c))]; // सर्व कॅटेगरीज

  const addToCart = (product) => {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success(`${product.name} कार्टमध्ये जोडले`);
  };

  // QR कोड उघडण्यासाठी
  const showQRCode = (productId) => {
    window.open(`http://localhost:8000/product/qrcode/${productId}`, '_blank');
  };

  if (loading) return <div className="loading">लोड करत आहे...</div>;

  return (
    <div className="buyer-products">
      <h2>🛒 सर्व उत्पादने</h2>
      <div className="filters">
        <input type="text" placeholder="उत्पादनाचे नाव..." value={search} onChange={e => setSearch(e.target.value)} />
        <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)}>
          <option value="">सर्व ठिकाणे</option>
          {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
        </select>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="">सर्व कॅटेगरी</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>
      {filteredProducts.length === 0 ? (
        <p>कोणतेही उत्पादन सापडले नाही.</p>
      ) : (
        <div className="products-grid">
          {filteredProducts.map(p => (
            <div key={p.id} className="product-card">
              {p.image_urls && p.image_urls.length > 0 && (
                <img src={`http://localhost:8000${p.image_urls[0]}`} alt={p.name} className="product-img" />
              )}
              <h3>{p.name}</h3>
              <p className="price">₹{p.price} / {p.unit}</p>
              <p>उपलब्ध: {p.quantity} {p.unit}</p>
              <p>शेतकरी: {p.farmer_name || 'अज्ञात'}</p>
              <p>ठिकाण: {p.location || 'नाही'}</p>
              <p>कॅटेगरी: {p.category || '—'}</p>

              <div className="product-rating">
                {p.avg_rating ? (
                  <>
                    <StarRating rating={Math.round(p.avg_rating)} />
                    <span className="rating-count">({p.review_count} रिव्ह्यू)</span>
                  </>
                ) : (
                  <span className="no-rating">अद्याप रेटिंग नाही</span>
                )}
              </div>

              <div className="card-buttons">
                <button className="details-btn" onClick={() => setSelectedProduct(p)}>तपशील</button>
                <button className="cart-btn" onClick={() => addToCart(p)}>कार्टमध्ये घाला</button>
                <button className="msg-btn" onClick={() => navigate(`/chat?userId=${p.farmer_id}`)}>💬 संदेश</button>
                <button className="qr-btn" onClick={() => showQRCode(p.id)}>📱 QR कोड</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for product details */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{selectedProduct.name}</h3>
            {selectedProduct.image_urls && selectedProduct.image_urls.length > 0 && (
              <div className="modal-images">
                {selectedProduct.image_urls.map((url, idx) => (
                  <img key={idx} src={`http://localhost:8000${url}`} alt={`${selectedProduct.name} ${idx+1}`} className="modal-img" />
                ))}
              </div>
            )}
            <p><strong>किंमत:</strong> ₹{selectedProduct.price} / {selectedProduct.unit}</p>
            <p><strong>उपलब्ध प्रमाण:</strong> {selectedProduct.quantity} {selectedProduct.unit}</p>
            <p><strong>शेतकरी:</strong> {selectedProduct.farmer_name}</p>
            <p><strong>ठिकाण:</strong> {selectedProduct.location || 'नाही'}</p>
            <p><strong>माहिती:</strong> {selectedProduct.description || 'नाही'}</p>
            <p><strong>कॅटेगरी:</strong> {selectedProduct.category || '—'}</p>

            <ProductReviews productId={selectedProduct.id} />

            <div className="modal-buttons">
              <button className="cart-btn" onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}>कार्टमध्ये घाला</button>
              <button className="qr-btn" onClick={() => showQRCode(selectedProduct.id)}>📱 QR कोड</button>
              <button className="close-btn" onClick={() => setSelectedProduct(null)}>बंद करा</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BuyerProducts;