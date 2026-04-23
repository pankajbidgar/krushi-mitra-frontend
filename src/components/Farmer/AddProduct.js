


// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import toast from "react-hot-toast";
// import "../../style/AddProduct.css";

// function AddProduct() {
//   const navigate = useNavigate();
//   const [form, setForm] = useState({
//     name: "",
//     category: "",
//     price: "",
//     unit: "kg",
//     quantity: "",
//     description: "",
//     location: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [imageFiles, setImageFiles] = useState([]);
//   const [imagePreviews, setImagePreviews] = useState([]);
//   const [uploading, setUploading] = useState(false);
//   const [aiLoading, setAiLoading] = useState(false);

//   // मल्टीपल इमेजेस निवडल्यावर
//   const handleImageChange = (e) => {
//     const files = Array.from(e.target.files);
//     const newPreviews = files.map(file => URL.createObjectURL(file));
//     setImageFiles(prev => [...prev, ...files]);
//     setImagePreviews(prev => [...prev, ...newPreviews]);
//   };

//   // इमेजेस रिमूव करण्यासाठी
//   const removeImage = (index) => {
//     const newFiles = [...imageFiles];
//     const newPreviews = [...imagePreviews];
//     newFiles.splice(index, 1);
//     newPreviews.splice(index, 1);
//     setImageFiles(newFiles);
//     setImagePreviews(newPreviews);
//   };

//   // सर्व इमेजेस एकाच वेळी अपलोड करण्यासाठी
//   const uploadImages = async () => {
//     if (imageFiles.length === 0) return [];
//     const formData = new FormData();
//     imageFiles.forEach((file) => {
//       formData.append("files", file);
//     });
//     setUploading(true);
//     try {
//       const response = await axios.post("http://localhost:8000/upload-multiple/", formData, {
//         headers: { "Content-Type": "multipart/form-data" }
//       });
//       return response.data.image_urls;
//     } catch (error) {
//       toast.error("इमेज अपलोड अयशस्वी");
//       return null;
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   // AI सुचवलेली किंमत मिळवण्यासाठी
//   const fetchAiPrice = async () => {
//     if (!form.category) {
//       toast.error("कृपया प्रथम 'प्रकार' निवडा (भाजी/फळ/धान्य)");
//       return;
//     }
//     if (!form.price || parseFloat(form.price) <= 0) {
//       toast.error("कृपया प्रथम आधारभूत किंमत टाका");
//       return;
//     }
//     setAiLoading(true);
//     try {
//       const response = await axios.post("http://localhost:8000/dynamic-pricing", {
//         category: form.category,
//         base_price: parseFloat(form.price),
//         season: "खरीप",   // तुम्ही हे यूजरकडून घेऊ शकता; आत्ता डीफॉल्ट
//         demand: "medium"
//       });
//       const suggested = response.data.suggested_price;
//       setForm(prev => ({ ...prev, price: suggested }));
//       toast.success(`🤖 AI सुचवलेली किंमत: ₹${suggested}`);
//     } catch (err) {
//       toast.error("किंमत मिळवताना त्रुटी");
//     } finally {
//       setAiLoading(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
    
//     let uploadedImageUrls = [];
//     if (imageFiles.length > 0) {
//       uploadedImageUrls = await uploadImages();
//       if (uploadedImageUrls === null) {
//         setLoading(false);
//         return;
//       }
//     }
    
//     const productData = { ...form, image_urls: uploadedImageUrls };
//     const token = localStorage.getItem("token");
//     try {
//       await axios.post("http://localhost:8000/products", productData, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       toast.success("उत्पादन यशस्वीरित्या जोडले!");
//       navigate("/farmer/my-products");
//     } catch (err) {
//       toast.error(err.response?.data?.detail || "उत्पादन जोडताना त्रुटी");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="add-product-container">
//       <div className="add-product-card">
//         <h2>🌾 नवीन उत्पादन जोडा</h2>
//         <form onSubmit={handleSubmit}>
//           <div className="form-group">
//             <label>उत्पादनाचे नाव *</label>
//             <input type="text" name="name" value={form.name} onChange={handleChange} required />
//           </div>
//           <div className="form-group">
//             <label>प्रकार (भाजी/फळ/धान्य)</label>
//             <input type="text" name="category" value={form.category} onChange={handleChange} placeholder="उदा. भाजी" />
//           </div>
//           <div className="form-row">
//             <div className="form-group">
//               <label>किंमत (₹) *</label>
//               <input type="number" step="0.01" name="price" value={form.price} onChange={handleChange} required />
//               {/* AI बटण */}
//               <button
//                 type="button"
//                 className="ai-price-btn"
//                 onClick={fetchAiPrice}
//                 disabled={aiLoading}
//               >
//                 {aiLoading ? "प्रक्रिया..." : "🤖 AI सुचवलेली किंमत"}
//               </button>
//             </div>
//             <div className="form-group">
//               <label>युनिट</label>
//               <select name="unit" value={form.unit} onChange={handleChange}>
//                 <option value="kg">किलो (kg)</option>
//                 <option value="dozen">डझन (dozen)</option>
//                 <option value="piece">नग (piece)</option>
//               </select>
//             </div>
//           </div>
//           <div className="form-group">
//             <label>उपलब्ध प्रमाण (किलोमध्ये) *</label>
//             <input type="number" step="0.1" name="quantity" value={form.quantity} onChange={handleChange} required />
//           </div>
//           <div className="form-group">
//             <label>थोडक्यात माहिती</label>
//             <textarea name="description" rows="3" value={form.description} onChange={handleChange} placeholder="तुमच्या उत्पादनाबद्दल विशेष माहिती..." />
//           </div>
//           <div className="form-group">
//             <label>शहर / गाव</label>
//             <input type="text" name="location" value={form.location} onChange={handleChange} placeholder="उदा. पुणे, सातारा" />
//           </div>
//           <div className="form-group">
//             <label>उत्पादनाचे फोटो (एकाधिक निवडू शकता)</label>
//             <input type="file" multiple accept="image/*" onChange={handleImageChange} />
//             {imagePreviews.length > 0 && (
//               <div className="image-previews">
//                 {imagePreviews.map((preview, idx) => (
//                   <div key={idx} className="preview-wrapper">
//                     <img src={preview} alt={`Preview ${idx}`} className="preview-image" />
//                     <button type="button" className="remove-image-btn" onClick={() => removeImage(idx)}>✖</button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           <button type="submit" className="submit-btn" disabled={loading || uploading}>
//             {loading || uploading ? "प्रक्रिया करत आहे..." : "उत्पादन जोडा"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default AddProduct;


import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import "../../style/AddProduct.css";


const API = process.env.REACT_APP_API_URL;

function AddProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    unit: "kg",
    quantity: "",
    description: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // गॅलरीतून एकाधिक फोटो निवडल्यावर
  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImageFiles(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  // कॅमेराने फोटो काढल्यावर
  const handleCameraCapture = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImageFiles(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
    // रीसेट करा जेणेकरून पुन्हा त्याच फोटोसाठी ट्रिगर होणार नाही
    e.target.value = '';
  };

  const openCamera = () => {
    cameraInputRef.current.click();
  };

  const openGallery = () => {
    galleryInputRef.current.click();
  };

  // इमेजेस रिमूव करण्यासाठी
  const removeImage = (index) => {
    const newFiles = [...imageFiles];
    const newPreviews = [...imagePreviews];
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  // सर्व इमेजेस एकाच वेळी अपलोड करण्यासाठी
  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];
    const formData = new FormData();
    imageFiles.forEach((file) => {
      formData.append("files", file);
    });
    setUploading(true);
    try {
      const response = await axios.post(`${API}/upload-multiple/`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return response.data.image_urls;
    } catch (error) {
      toast.error("इमेज अपलोड अयशस्वी");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // AI सुचवलेली किंमत मिळवण्यासाठी
  const fetchAiPrice = async () => {
    if (!form.category) {
      toast.error("कृपया प्रथम 'प्रकार' निवडा (भाजी/फळ/धान्य)");
      return;
    }
    if (!form.price || parseFloat(form.price) <= 0) {
      toast.error("कृपया प्रथम आधारभूत किंमत टाका");
      return;
    }
    setAiLoading(true);
    try {
      const response = await axios.post(`${API}/dynamic-pricing`, {
        category: form.category,
        base_price: parseFloat(form.price),
        season: "खरीप",
        demand: "medium"
      });
      const suggested = response.data.suggested_price;
      setForm(prev => ({ ...prev, price: suggested }));
      toast.success(`🤖 AI सुचवलेली किंमत: ₹${suggested}`);
    } catch (err) {
      toast.error("किंमत मिळवताना त्रुटी");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let uploadedImageUrls = [];
    if (imageFiles.length > 0) {
      uploadedImageUrls = await uploadImages();
      if (uploadedImageUrls === null) {
        setLoading(false);
        return;
      }
    }
    
    const productData = { ...form, image_urls: uploadedImageUrls };
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${API}/products`, productData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("उत्पदन यशस्वीरित्या जोडले!");
      navigate("/farmer/my-products");
    } catch (err) {
      toast.error(err.response?.data?.detail || "उत्पादन जोडताना त्रुटी");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-container">
      <div className="add-product-card">
        <h2>🌾 नवीन उत्पादन जोडा</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>उत्पादनाचे नाव *</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>प्रकार (भाजी/फळ/धान्य)</label>
            <input type="text" name="category" value={form.category} onChange={handleChange} placeholder="उदा. भाजी" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>किंमत (₹) *</label>
              <input type="number" step="0.01" name="price" value={form.price} onChange={handleChange} required />
              <button
                type="button"
                className="ai-price-btn"
                onClick={fetchAiPrice}
                disabled={aiLoading}
              >
                {aiLoading ? "प्रक्रिया..." : "🤖 AI सुचवलेली किंमत"}
              </button>
            </div>
            <div className="form-group">
              <label>युनिट</label>
              <select name="unit" value={form.unit} onChange={handleChange}>
                <option value="kg">किलो (kg)</option>
                <option value="dozen">डझन (dozen)</option>
                <option value="piece">नग (piece)</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>उपलब्ध प्रमाण (किलोमध्ये) *</label>
            <input type="number" step="0.1" name="quantity" value={form.quantity} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>थोडक्यात माहिती</label>
            <textarea name="description" rows="3" value={form.description} onChange={handleChange} placeholder="तुमच्या उत्पादनाबद्दल विशेष माहिती..." />
          </div>
          <div className="form-group">
            <label>शहर / गाव</label>
            <input type="text" name="location" value={form.location} onChange={handleChange} placeholder="उदा. पुणे, सातारा" />
          </div>
          
          {/* Image Upload Section with Camera & Gallery Options */}
          <div className="form-group">
            <label>उत्पादनाचे फोटो</label>
            <div className="image-upload-buttons">
              <button type="button" className="gallery-btn" onClick={openGallery}>
                🖼️ गॅलरीतून निवडा
              </button>
              <button type="button" className="camera-btn" onClick={openCamera}>
                📷 कॅमेरा
              </button>
            </div>
            {/* Hidden file inputs */}
            <input
              ref={galleryInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleGalleryChange}
              style={{ display: 'none' }}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
              style={{ display: 'none' }}
            />
            {/* Image previews */}
            {imagePreviews.length > 0 && (
              <div className="image-previews">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="preview-wrapper">
                    <img src={preview} alt={`Preview ${idx}`} className="preview-image" />
                    <button type="button" className="remove-image-btn" onClick={() => removeImage(idx)}>✖</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="submit-btn" disabled={loading || uploading}>
            {loading || uploading ? "प्रक्रिया करत आहे..." : "उत्पादन जोडा"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;