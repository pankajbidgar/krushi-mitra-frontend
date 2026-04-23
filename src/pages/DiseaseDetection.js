import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../style/DiseaseDetection.css';


const API = process.env.REACT_APP_API_URL;

function DiseaseDetection() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage) {
      toast.error('कृपया पानाचा फोटो निवडा');
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedImage);
    setLoading(true);
    try {
      const res = await axios.post(`${API}/disease-detection`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data.disease_info);
    } catch (err) {
      toast.error('रोग ओळखताना त्रुटी');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="disease-detection-container">
      <h2>🌿 पीक रोग ओळख (AI)</h2>
      <form onSubmit={handleSubmit}>
        <div className="image-upload">
          {preview && <img src={preview} alt="Preview" className="preview-img" />}
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'प्रक्रिया करत आहे...' : 'रोग ओळखा'}
        </button>
      </form>
      {result && (
        <div className="result-box">
          <h3>🔍 परिणाम:</h3>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}

export default DiseaseDetection;