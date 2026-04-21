
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import toast from "react-hot-toast";
// import "../../style/MyProducts.css";
// import StarRating from "../../context/StarRating";

// function MyProducts() {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [editingProduct, setEditingProduct] = useState(null);
//   const [editForm, setEditForm] = useState({
//     name: "",
//     category: "",
//     price: "",
//     unit: "kg",
//     quantity: "",
//     description: "",
//     location: "",
//     image_urls: [],
//   });
//   const [editNewImageFiles, setEditNewImageFiles] = useState([]);
//   const [editImagePreviews, setEditImagePreviews] = useState([]);
//   const [uploading, setUploading] = useState(false);
//   const [aiLoading, setAiLoading] = useState(false); // नवीन

//   const token = localStorage.getItem("token");

//   const fetchProducts = async () => {
//     try {
//       const res = await axios.get("http://localhost:8000/products/my", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const sortedProducts = res.data.sort((a, b) => {
//         const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
//         const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
//         return dateB - dateA;
//       });
//       setProducts(sortedProducts);
//     } catch (err) {
//       toast.error("उत्पादने मिळवताना त्रुटी");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   const handleDelete = async (id) => {
//     if (window.confirm("खात्री आहे की हे उत्पादन हटवायचे?")) {
//       try {
//         await axios.delete(`http://localhost:8000/products/${id}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         toast.success("उत्पादन हटवले");
//         fetchProducts();
//       } catch (err) {
//         toast.error("हटवताना त्रुटी");
//       }
//     }
//   };

//   const handleToggleStatus = async (id) => {
//     try {
//       const res = await axios.patch(
//         `http://localhost:8000/products/${id}/toggle-status`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       toast.success(`उत्पादन ${res.data.is_available ? "उपलब्ध" : "अनुपलब्ध"} केले`);
//       fetchProducts();
//     } catch (err) {
//       toast.error("स्थिती बदलताना त्रुटी");
//     }
//   };

//   const openEditModal = (product) => {
//     setEditingProduct(product);
//     setEditForm({
//       name: product.name,
//       category: product.category || "",
//       price: product.price,
//       unit: product.unit,
//       quantity: product.quantity,
//       description: product.description || "",
//       location: product.location || "",
//       image_urls: product.image_urls || [],
//     });
//     setEditNewImageFiles([]);
//     setEditImagePreviews([]);
//   };

//   const handleEditChange = (e) => {
//     setEditForm({ ...editForm, [e.target.name]: e.target.value });
//   };

//   // AI सुचवलेली किंमत मिळवण्यासाठी
//   const fetchAiPriceForEdit = async () => {
//     if (!editForm.category) {
//       toast.error("कृपया प्रथम 'प्रकार' निवडा (भाजी/फळ/धान्य)");
//       return;
//     }
//     if (!editForm.price || parseFloat(editForm.price) <= 0) {
//       toast.error("कृपया प्रथम आधारभूत किंमत टाका");
//       return;
//     }
//     setAiLoading(true);
//     try {
//       const response = await axios.post("http://localhost:8000/dynamic-pricing", {
//         category: editForm.category,
//         base_price: parseFloat(editForm.price),
//         season: "खरीप",
//         demand: "medium"
//       });
//       const suggested = response.data.suggested_price;
//       setEditForm(prev => ({ ...prev, price: suggested }));
//       toast.success(`🤖 AI सुचवलेली किंमत: ₹${suggested}`);
//     } catch (err) {
//       toast.error("किंमत मिळवताना त्रुटी");
//     } finally {
//       setAiLoading(false);
//     }
//   };

//   const handleEditImageChange = (e) => {
//     const files = Array.from(e.target.files);
//     const newPreviews = files.map(file => URL.createObjectURL(file));
//     setEditNewImageFiles(prev => [...prev, ...files]);
//     setEditImagePreviews(prev => [...prev, ...newPreviews]);
//   };

//   const removeNewImage = (index) => {
//     const newFiles = [...editNewImageFiles];
//     const newPreviews = [...editImagePreviews];
//     newFiles.splice(index, 1);
//     newPreviews.splice(index, 1);
//     setEditNewImageFiles(newFiles);
//     setEditImagePreviews(newPreviews);
//   };

//   const removeExistingImage = (indexToRemove) => {
//     const newUrls = editForm.image_urls.filter((_, idx) => idx !== indexToRemove);
//     setEditForm({ ...editForm, image_urls: newUrls });
//   };

//   const uploadNewImages = async () => {
//     if (editNewImageFiles.length === 0) return [];
//     const formData = new FormData();
//     editNewImageFiles.forEach((file) => {
//       formData.append("files", file);
//     });
//     try {
//       const response = await axios.post("http://localhost:8000/upload-multiple/", formData, {
//         headers: { "Content-Type": "multipart/form-data" }
//       });
//       return response.data.image_urls;
//     } catch (error) {
//       toast.error("नवीन इमेजेस अपलोड अयशस्वी");
//       return null;
//     }
//   };

//   const handleEditSubmit = async (e) => {
//     e.preventDefault();
//     setUploading(true);
//     let finalImageUrls = [...editForm.image_urls];
//     if (editNewImageFiles.length > 0) {
//       const newUrls = await uploadNewImages();
//       if (newUrls) {
//         finalImageUrls = [...finalImageUrls, ...newUrls];
//       } else {
//         setUploading(false);
//         return;
//       }
//     }
//     const updatedData = { ...editForm, image_urls: finalImageUrls };
//     try {
//       await axios.put(
//         `http://localhost:8000/products/${editingProduct.id}`,
//         updatedData,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       toast.success("उत्पादन अद्ययावत केले");
//       setEditingProduct(null);
//       fetchProducts();
//     } catch (err) {
//       toast.error("अद्ययावत करताना त्रुटी");
//     } finally {
//       setUploading(false);
//     }
//   };

//   if (loading) return <div className="loading">लोड करत आहे...</div>;

//   return (
//     <div className="my-products-container">
//       <h2>📦 माझी उत्पादने</h2>
//       {products.length === 0 ? (
//         <p>अद्याप कोणतेही उत्पादन जोडलेले नाही. <a href="/farmer/add-product">येथे जोडा</a></p>
//       ) : (
//         <div className="products-grid">
//           {products.map((p) => (
//             <div key={p.id} className="product-card">
//               {p.image_urls && p.image_urls.length > 0 && (
//                 <div className="product-images-gallery">
//                   {p.image_urls.map((url, idx) => (
//                     <img key={idx} src={`http://localhost:8000${url}`} alt={p.name} className="product-image" />
//                   ))}
//                 </div>
//               )}
//               <h3>{p.name}</h3>
//               <p className="price">₹{p.price} / {p.unit}</p>
//               <p>प्रमाण: {p.quantity} {p.unit}</p>
//               <p>स्थान: {p.location || "नाही"}</p>
//               <p>स्थिती: {p.is_available ? "✅ उपलब्ध" : "❌ उपलब्ध नाही"}</p>
              
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

//               <div className="product-actions">
//                 <button className="edit-btn" onClick={() => openEditModal(p)}>✏️ संपादित करा</button>
//                 <button className="delete-btn" onClick={() => handleDelete(p.id)}>🗑️ हटवा</button>
//                 <button className="status-btn" onClick={() => handleToggleStatus(p.id)}>
//                   {p.is_available ? "🔴 अनुपलब्ध करा" : "🟢 उपलब्ध करा"}
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Edit Modal with AI Pricing */}
//       {editingProduct && (
//         <div className="modal-overlay" onClick={() => setEditingProduct(null)}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <h3>उत्पादन संपादित करा</h3>
//             <form onSubmit={handleEditSubmit}>
//               <div className="form-group">
//                 <label>नाव</label>
//                 <input type="text" name="name" value={editForm.name} onChange={handleEditChange} required />
//               </div>
//               <div className="form-group">
//                 <label>प्रकार</label>
//                 <input type="text" name="category" value={editForm.category} onChange={handleEditChange} />
//               </div>
//               <div className="form-row">
//                 <div className="form-group">
//                   <label>किंमत (₹)</label>
//                   <input type="number" step="0.01" name="price" value={editForm.price} onChange={handleEditChange} required />
//                   {/* AI बटण */}
//                   <button
//                     type="button"
//                     className="ai-price-btn"
//                     onClick={fetchAiPriceForEdit}
//                     disabled={aiLoading}
//                     style={{ marginTop: '6px', width: '100%' }}
//                   >
//                     {aiLoading ? "प्रक्रिया..." : "🤖 AI सुचवलेली किंमत"}
//                   </button>
//                 </div>
//                 <div className="form-group">
//                   <label>युनिट</label>
//                   <select name="unit" value={editForm.unit} onChange={handleEditChange}>
//                     <option value="kg">kg</option>
//                     <option value="dozen">dozen</option>
//                     <option value="piece">piece</option>
//                   </select>
//                 </div>
//               </div>
//               <div className="form-group">
//                 <label>प्रमाण ({editForm.unit})</label>
//                 <input type="number" step="0.1" name="quantity" value={editForm.quantity} onChange={handleEditChange} required />
//               </div>
//               <div className="form-group">
//                 <label>माहिती</label>
//                 <textarea name="description" rows="2" value={editForm.description} onChange={handleEditChange} />
//               </div>
//               <div className="form-group">
//                 <label>स्थान</label>
//                 <input type="text" name="location" value={editForm.location} onChange={handleEditChange} />
//               </div>
              
//               {editForm.image_urls.length > 0 && (
//                 <div className="form-group">
//                   <label>सध्याचे फोटो</label>
//                   <div className="existing-images">
//                     {editForm.image_urls.map((url, idx) => (
//                       <div key={idx} className="image-preview-wrapper">
//                         <img src={`http://localhost:8000${url}`} alt="product" className="edit-preview-img" />
//                         <button type="button" className="remove-img-btn" onClick={() => removeExistingImage(idx)}>✖</button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {editImagePreviews.length > 0 && (
//                 <div className="form-group">
//                   <label>नवीन निवडलेले फोटो</label>
//                   <div className="existing-images">
//                     {editImagePreviews.map((preview, idx) => (
//                       <div key={idx} className="image-preview-wrapper">
//                         <img src={preview} alt="preview" className="edit-preview-img" />
//                         <button type="button" className="remove-img-btn" onClick={() => removeNewImage(idx)}>✖</button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               <div className="form-group">
//                 <label>नवीन फोटो जोडा (एकाधिक निवडू शकता)</label>
//                 <input type="file" multiple accept="image/*" onChange={handleEditImageChange} />
//               </div>

//               <div className="modal-actions">
//                 <button type="submit" className="save-btn" disabled={uploading}>
//                   {uploading ? "अपलोड होत आहे..." : "सेव्ह करा"}
//                 </button>
//                 <button type="button" className="cancel-btn" onClick={() => setEditingProduct(null)}>रद्द करा</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default MyProducts;



import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import "../../style/MyProducts.css";
import StarRating from "../../context/StarRating";

function MyProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    price: "",
    unit: "kg",
    quantity: "",
    description: "",
    location: "",
    image_urls: [],
  });
  const [editNewImageFiles, setEditNewImageFiles] = useState([]);
  const [editImagePreviews, setEditImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Refs for camera and gallery inputs in edit modal
  const editCameraInputRef = useRef(null);
  const editGalleryInputRef = useRef(null);

  const token = localStorage.getItem("token");

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:8000/products/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sortedProducts = res.data.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        return dateB - dateA;
      });
      setProducts(sortedProducts);
    } catch (err) {
      toast.error("उत्पादने मिळवताना त्रुटी");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("खात्री आहे की हे उत्पादन हटवायचे?")) {
      try {
        await axios.delete(`http://localhost:8000/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("उत्पादन हटवले");
        fetchProducts();
      } catch (err) {
        toast.error("हटवताना त्रुटी");
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await axios.patch(
        `http://localhost:8000/products/${id}/toggle-status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`उत्पादन ${res.data.is_available ? "उपलब्ध" : "अनुपलब्ध"} केले`);
      fetchProducts();
    } catch (err) {
      toast.error("स्थिती बदलताना त्रुटी");
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      category: product.category || "",
      price: product.price,
      unit: product.unit,
      quantity: product.quantity,
      description: product.description || "",
      location: product.location || "",
      image_urls: product.image_urls || [],
    });
    setEditNewImageFiles([]);
    setEditImagePreviews([]);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const fetchAiPriceForEdit = async () => {
    if (!editForm.category) {
      toast.error("कृपया प्रथम 'प्रकार' निवडा (भाजी/फळ/धान्य)");
      return;
    }
    if (!editForm.price || parseFloat(editForm.price) <= 0) {
      toast.error("कृपया प्रथम आधारभूत किंमत टाका");
      return;
    }
    setAiLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/dynamic-pricing", {
        category: editForm.category,
        base_price: parseFloat(editForm.price),
        season: "खरीप",
        demand: "medium",
      });
      const suggested = response.data.suggested_price;
      setEditForm((prev) => ({ ...prev, price: suggested }));
      toast.success(`🤖 AI सुचवलेली किंमत: ₹${suggested}`);
    } catch (err) {
      toast.error("किंमत मिळवताना त्रुटी");
    } finally {
      setAiLoading(false);
    }
  };

  // Gallery selection (multiple)
  const handleEditGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setEditNewImageFiles((prev) => [...prev, ...files]);
    setEditImagePreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = ""; // reset so same file can be selected again
  };

  // Camera capture (single)
  const handleEditCameraCapture = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setEditNewImageFiles((prev) => [...prev, ...files]);
    setEditImagePreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = "";
  };

  const openEditCamera = () => {
    editCameraInputRef.current.click();
  };

  const openEditGallery = () => {
    editGalleryInputRef.current.click();
  };

  const removeNewImage = (index) => {
    const newFiles = [...editNewImageFiles];
    const newPreviews = [...editImagePreviews];
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setEditNewImageFiles(newFiles);
    setEditImagePreviews(newPreviews);
  };

  const removeExistingImage = (indexToRemove) => {
    const newUrls = editForm.image_urls.filter((_, idx) => idx !== indexToRemove);
    setEditForm({ ...editForm, image_urls: newUrls });
  };

  const uploadNewImages = async () => {
    if (editNewImageFiles.length === 0) return [];
    const formData = new FormData();
    editNewImageFiles.forEach((file) => {
      formData.append("files", file);
    });
    try {
      const response = await axios.post("http://localhost:8000/upload-multiple/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.image_urls;
    } catch (error) {
      toast.error("नवीन इमेजेस अपलोड अयशस्वी");
      return null;
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    let finalImageUrls = [...editForm.image_urls];
    if (editNewImageFiles.length > 0) {
      const newUrls = await uploadNewImages();
      if (newUrls) {
        finalImageUrls = [...finalImageUrls, ...newUrls];
      } else {
        setUploading(false);
        return;
      }
    }
    const updatedData = { ...editForm, image_urls: finalImageUrls };
    try {
      await axios.put(
        `http://localhost:8000/products/${editingProduct.id}`,
        updatedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("उत्पादन अद्ययावत केले");
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      toast.error("अद्ययावत करताना त्रुटी");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="loading">लोड करत आहे...</div>;

  return (
    <div className="my-products-container">
      <h2>📦 माझी उत्पादने</h2>
      {products.length === 0 ? (
        <p>
          अद्याप कोणतेही उत्पादन जोडलेले नाही.{" "}
          <a href="/farmer/add-product">येथे जोडा</a>
        </p>
      ) : (
        <div className="products-grid">
          {products.map((p) => (
            <div key={p.id} className="product-card">
              {p.image_urls && p.image_urls.length > 0 && (
                <div className="product-images-gallery">
                  {p.image_urls.map((url, idx) => (
                    <img
                      key={idx}
                      src={`http://localhost:8000${url}`}
                      alt={p.name}
                      className="product-image"
                    />
                  ))}
                </div>
              )}
              <h3>{p.name}</h3>
              <p className="price">
                ₹{p.price} / {p.unit}
              </p>
              <p>
                प्रमाण: {p.quantity} {p.unit}
              </p>
              <p>स्थान: {p.location || "नाही"}</p>
              <p>स्थिती: {p.is_available ? "✅ उपलब्ध" : "❌ उपलब्ध नाही"}</p>

              <div className="product-rating">
                {p.avg_rating ? (
                  <>
                    <StarRating rating={Math.round(p.avg_rating)} />
                    <span className="rating-count">
                      ({p.review_count} रिव्ह्यू)
                    </span>
                  </>
                ) : (
                  <span className="no-rating">अद्याप रेटिंग नाही</span>
                )}
              </div>

              <div className="product-actions">
                <button
                  className="farmer-edit-btn"
                  onClick={() => openEditModal(p)}
                >
                  ✏️ संपादित करा
                </button>
                <button
                  className="farmer-delete-btn"
                  onClick={() => handleDelete(p.id)}
                >
                  🗑️ हटवा
                </button>
                <button
                  className="farmer-status-btn"
                  onClick={() => handleToggleStatus(p.id)}
                >
                  {p.is_available ? "🔴 अनुपलब्ध करा" : "🟢 उपलब्ध करा"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal with AI Pricing and Camera/Gallery options */}
      {editingProduct && (
        <div
          className="modal-overlay"
          onClick={() => setEditingProduct(null)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>उत्पादन संपादित करा</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>नाव</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>प्रकार</label>
                <input
                  type="text"
                  name="category"
                  value={editForm.category}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>किंमत (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={editForm.price}
                    onChange={handleEditChange}
                    required
                  />
                  <button
                    type="button"
                    className="ai-price-btn"
                    onClick={fetchAiPriceForEdit}
                    disabled={aiLoading}
                    style={{ marginTop: "6px", width: "100%" }}
                  >
                    {aiLoading ? "प्रक्रिया..." : "🤖 AI सुचवलेली किंमत"}
                  </button>
                </div>
                <div className="form-group">
                  <label>युनिट</label>
                  <select
                    name="unit"
                    value={editForm.unit}
                    onChange={handleEditChange}
                  >
                    <option value="kg">kg</option>
                    <option value="dozen">dozen</option>
                    <option value="piece">piece</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>प्रमाण ({editForm.unit})</label>
                <input
                  type="number"
                  step="0.1"
                  name="quantity"
                  value={editForm.quantity}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>माहिती</label>
                <textarea
                  name="description"
                  rows="2"
                  value={editForm.description}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>स्थान</label>
                <input
                  type="text"
                  name="location"
                  value={editForm.location}
                  onChange={handleEditChange}
                />
              </div>

              {editForm.image_urls.length > 0 && (
                <div className="form-group">
                  <label>सध्याचे फोटो</label>
                  <div className="existing-images">
                    {editForm.image_urls.map((url, idx) => (
                      <div key={idx} className="image-preview-wrapper">
                        <img
                          src={`http://localhost:8000${url}`}
                          alt="product"
                          className="edit-preview-img"
                        />
                        <button
                          type="button"
                          className="remove-img-btn"
                          onClick={() => removeExistingImage(idx)}
                        >
                          ✖
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New image upload section with camera & gallery */}
              <div className="form-group">
                <label>नवीन फोटो जोडा</label>
                <div className="image-upload-buttons">
                  <button
                    type="button"
                    className="gallery-btn"
                    onClick={openEditGallery}
                  >
                    🖼️ गॅलरीतून निवडा
                  </button>
                  <button
                    type="button"
                    className="camera-btn"
                    onClick={openEditCamera}
                  >
                    📷 कॅमेरा
                  </button>
                </div>
                <input
                  ref={editGalleryInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleEditGalleryChange}
                  style={{ display: "none" }}
                />
                <input
                  ref={editCameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleEditCameraCapture}
                  style={{ display: "none" }}
                />
                {editImagePreviews.length > 0 && (
                  <div className="image-previews">
                    {editImagePreviews.map((preview, idx) => (
                      <div key={idx} className="preview-wrapper">
                        <img
                          src={preview}
                          alt="preview"
                          className="preview-image"
                        />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => removeNewImage(idx)}
                        >
                          ✖
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="submit" className="save-btn" disabled={uploading}>
                  {uploading ? "अपलोड होत आहे..." : "सेव्ह करा"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setEditingProduct(null)}
                >
                  रद्द करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyProducts;