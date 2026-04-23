// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import toast from 'react-hot-toast';
// import { useAuth } from '../context/AuthContext';
// import '../style/Profile.css';

// function Profile() {
//   const { user, setUser } = useAuth();
//   const [form, setForm] = useState({
//     full_name: '',
//     phone: '',
//     location: '',
//   });
//   const [profilePic, setProfilePic] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const token = localStorage.getItem('token');

//   useEffect(() => {
//     if (user) {
//       setForm({
//         full_name: user.full_name || '',
//         phone: user.phone || '',
//         location: user.location || '',
//       });
//       // प्रीव्ह्यू साठी पूर्ण URL तयार करा
//       if (user.profile_picture) {
//         const fullUrl = `http://localhost:8000${user.profile_picture}`;
//         setPreview(fullUrl);
//         console.log('Profile picture URL from user:', fullUrl);
//       } else {
//         setPreview(null);
//       }
//     }
//   }, [user]);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setProfilePic(file);
//       setPreview(URL.createObjectURL(file));
//     }
//   };

//   const uploadProfilePic = async () => {
//     if (!profilePic) return null;
//     const formData = new FormData();
//     formData.append('file', profilePic);
//     try {
//       const res = await axios.post('http://localhost:8000/upload-profile-picture', formData, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       console.log('Upload response:', res.data);
//       return res.data.profile_picture;
//     } catch (err) {
//       console.error('Upload error:', err);
//       toast.error('फोटो अपलोड अयशस्वी');
//       return null;
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     let profilePictureUrl = user?.profile_picture || null;
    
//     if (profilePic) {
//       const newUrl = await uploadProfilePic();
//       if (newUrl) {
//         profilePictureUrl = newUrl;
//       } else {
//         setLoading(false);
//         return;
//       }
//     }
    
//     const updatedData = { ...form, profile_picture: profilePictureUrl };
//     try {
//       const res = await axios.put('http://localhost:8000/profile', updatedData, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       toast.success('प्रोफाइल यशस्वीरित्या अपडेट केले');
//       setUser(res.data);  // हे महत्त्वाचे आहे
//       console.log('Updated user data:', res.data);
//     } catch (err) {
//       toast.error('अपडेट अयशस्वी');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="profile-container">
//       <h2>👤 माझी प्रोफाइल</h2>
//       <div className="profile-picture-section">
//         {preview ? (
//           <img src={preview} alt="Profile" className="profile-preview" />
//         ) : (
//           <div className="profile-preview-placeholder">👤</div>
//         )}
//         <input type="file" accept="image/*" onChange={handleImageChange} />
//       </div>
//       <form onSubmit={handleSubmit}>
//         <div className="form-group">
//           <label>पूर्ण नाव</label>
//           <input type="text" name="full_name" value={form.full_name} onChange={handleChange} required />
//         </div>
//         <div className="form-group">
//           <label>ईमेल</label>
//           <input type="email" value={user?.email || ''} disabled />
//         </div>
//         <div className="form-group">
//           <label>मोबाइल नंबर</label>
//           <input type="text" name="phone" value={form.phone} onChange={handleChange} />
//         </div>
//         <div className="form-group">
//           <label>शहर / गाव</label>
//           <input type="text" name="location" value={form.location} onChange={handleChange} />
//         </div>
//         <button type="submit" disabled={loading} className="save-btn">
//           {loading ? 'सेव्ह करत आहे...' : 'प्रोफाइल अपडेट करा'}
//         </button>
//       </form>
//     </div>
//   );
// }

// export default Profile;


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import '../style/Profile.css';


const API = process.env.REACT_APP_API_URL;

function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    location: '',
  });
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || '',
        phone: user.phone || '',
        location: user.location || '',
      });
      if (user.profile_picture) {
        const fullUrl = `${API}${user.profile_picture}`;
        setPreview(fullUrl);
      } else {
        setPreview(null);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const uploadProfilePic = async () => {
    if (!profilePic) return null;
    const formData = new FormData();
    formData.append('file', profilePic);
    try {
      const res = await axios.post(`${API}/profile-picture`,formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data.profile_picture;
    } catch (err) {
      toast.error('फोटो अपलोड अयशस्वी');
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let profilePictureUrl = user?.profile_picture || null;
    
    if (profilePic) {
      const newUrl = await uploadProfilePic();
      if (newUrl) profilePictureUrl = newUrl;
      else {
        setLoading(false);
        return;
      }
    }
    
    const updatedData = { ...form, profile_picture: profilePictureUrl };
    try {
      const res = await axios.put(`${API}/profile`, updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('प्रोफाइल यशस्वीरित्या अपडेट केले');
      setUser(res.data);
    } catch (err) {
      toast.error('अपडेट अयशस्वी');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('नवीन पासवर्ड जुळत नाहीत');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('पासवर्ड किमान ६ अक्षरांचा असावा');
      return;
    }
    setChangingPassword(true);
    try {
      await axios.post(`${API}/change-password`, {
        current_password: currentPassword,
        new_password: newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('पासवर्ड यशस्वीरित्या बदलला');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowChangePassword(false);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'पासवर्ड बदलताना त्रुटी');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>👤 माझी प्रोफाइल</h2>
        
        {/* Profile Picture Section */}
        <div className="profile-picture-section">
          <div className="avatar-wrapper">
            {preview ? (
              <img src={preview} alt="Profile" className="profile-avatar" />
            ) : (
              <div className="profile-avatar-placeholder">👤</div>
            )}
          </div>
          <label className="upload-btn">
            📸 प्रोफाइल फोटो बदला
            <input type="file" accept="image/*" onChange={handleImageChange} hidden />
          </label>
        </div>

        {/* Profile Info Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>पूर्ण नाव</label>
            <input type="text" name="full_name" value={form.full_name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>ईमेल</label>
            <input type="email" value={user?.email || ''} disabled className="disabled-input" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>मोबाइल नंबर</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>शहर / गाव</label>
              <input type="text" name="location" value={form.location} onChange={handleChange} />
            </div>
          </div>
          <button type="submit" disabled={loading} className="save-btn">
            {loading ? 'सेव्ह करत आहे...' : 'प्रोफाइल अपडेट करा'}
          </button>
        </form>

        {/* Change Password Section */}
        <div className="change-password-section">
          <button 
            className="change-pwd-toggle" 
            onClick={() => setShowChangePassword(!showChangePassword)}
          >
            🔒 {showChangePassword ? 'रद्द करा' : 'पासवर्ड बदला'}
          </button>
          {showChangePassword && (
            <div className="change-password-form">
              <input 
                type="password" 
                placeholder="सध्याचा पासवर्ड" 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)} 
              />
              <input 
                type="password" 
                placeholder="नवीन पासवर्ड" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
              />
              <input 
                type="password" 
                placeholder="नवीन पासवर्ड पुन्हा" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
              />
              <button 
                onClick={handleChangePassword} 
                disabled={changingPassword}
                className="change-pwd-submit"
              >
                {changingPassword ? 'प्रक्रिया...' : 'पासवर्ड अपडेट करा'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;