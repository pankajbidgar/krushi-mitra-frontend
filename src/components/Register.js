// import React, { useState } from 'react';
// import axios from 'axios';
// import { useNavigate, Link } from 'react-router-dom';
// import toast from 'react-hot-toast';

// function Register() {
//   const [form, setForm] = useState({
//     full_name: '',
//     email: '',
//     password: '',
//     role: 'farmer',
//     phone: '',
//     location: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await axios.post('http://localhost:8000/register', form);
//       toast.success('नोंदणी यशस्वी! आता लॉगिन करा.');
//       navigate('/login');
//     } catch (err) {
//       const msg = err.response?.data?.detail || 'काहीतरी चूक झाली.';
//       toast.error(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container" style={{ maxWidth: 500, marginTop: 50 }}>
//       <div className="card">
//         <h2 style={{ textAlign: 'center', color: '#2e7d32' }}>📝 नोंदणी करा</h2>
//         <form onSubmit={handleSubmit}>
//           <div style={{ marginBottom: 10 }}>
//             <label>पूर्ण नाव</label>
//             <input type="text" name="full_name" value={form.full_name} onChange={handleChange} required />
//           </div>
//           <div style={{ marginBottom: 10 }}>
//             <label>ईमेल</label>
//             <input type="email" name="email" value={form.email} onChange={handleChange} required />
//           </div>
//           <div style={{ marginBottom: 10 }}>
//             <label>पासवर्ड</label>
//             <input type="password" name="password" value={form.password} onChange={handleChange} required />
//           </div>
//           <div style={{ marginBottom: 10 }}>
//             <label>प्रकार</label>
//             <select name="role" value={form.role} onChange={handleChange}>
//               <option value="farmer">🌾 शेतकरी</option>
//               <option value="buyer">🛒 खरेदीदार</option>
//             </select>
//           </div>
//           <div style={{ marginBottom: 10 }}>
//             <label>मोबाइल नंबर (पर्यायी)</label>
//             <input type="text" name="phone" value={form.phone} onChange={handleChange} />
//           </div>
//           <div style={{ marginBottom: 20 }}>
//             <label>गाव/शहर (पर्यायी)</label>
//             <input type="text" name="location" value={form.location} onChange={handleChange} />
//           </div>
//           <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
//             {loading ? 'प्रतीक्षा करा...' : 'नोंदणी करा'}
//           </button>
//         </form>
//         <p style={{ textAlign: 'center', marginTop: 15 }}>
//           आधीच खाते आहे? <Link to="/login">लॉगिन करा</Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Register;



import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function Register() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'farmer',
    location: ''
  });
  const [registerMethod, setRegisterMethod] = useState('email'); // 'email' or 'mobile'
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const API = process.env.REACT_APP_API_URL;
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('पासवर्ड जुळत नाहीत');
      return;
    }
    if (registerMethod === 'mobile' && !form.phone) {
      toast.error('मोबाइल नंबर आवश्यक आहे');
      return;
    }
    setLoading(true);
    try {
      // For mobile registration, we might use a different endpoint
      if (registerMethod === 'mobile') {
        // Send registration with phone (email optional)
        const payload = {
          full_name: form.full_name,
          phone: form.phone,
          password: form.password || undefined,
          role: form.role,
          location: form.location,
          email: form.email || null
        };
        await axios.post(`${API}/mobile/register`, payload);
        toast.success('नोंदणी यशस्वी! आता लॉगिन करा.');
        navigate('/login');
      } else {
        // Normal email registration
        await axios.post(`${API}/register`, {
          full_name: form.full_name,
          email: form.email,
          password: form.password,
          role: form.role,
          phone: form.phone,
          location: form.location
        });
        toast.success('नोंदणी यशस्वी! आता लॉगिन करा.');
        navigate('/login');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'काहीतरी चूक झाली.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 500, marginTop: 50 }}>
      <div className="card">
        <h2 style={{ textAlign: 'center', color: '#2e7d32' }}>📝 नोंदणी करा</h2>

        {/* Method Toggle */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => setRegisterMethod('email')}
            style={{
              flex: 1,
              padding: '8px',
              background: registerMethod === 'email' ? '#2e7d32' : '#e0e0e0',
              color: registerMethod === 'email' ? 'white' : '#333',
              border: 'none',
              borderRadius: '30px',
              cursor: 'pointer'
            }}
          >
            📧 ईमेल
          </button>
          <button
            type="button"
            onClick={() => setRegisterMethod('mobile')}
            style={{
              flex: 1,
              padding: '8px',
              background: registerMethod === 'mobile' ? '#2e7d32' : '#e0e0e0',
              color: registerMethod === 'mobile' ? 'white' : '#333',
              border: 'none',
              borderRadius: '30px',
              cursor: 'pointer'
            }}
          >
            📱 मोबाइल
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 10 }}>
            <label>पूर्ण नाव *</label>
            <input type="text" name="full_name" value={form.full_name} onChange={handleChange} required />
          </div>

          {registerMethod === 'email' && (
            <>
              <div style={{ marginBottom: 10 }}>
                <label>ईमेल *</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label>पासवर्ड *</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} required />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label>पासवर्ड पुन्हा *</label>
                <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label>मोबाइल नंबर (पर्यायी)</label>
                <input type="text" name="phone" value={form.phone} onChange={handleChange} />
              </div>
            </>
          )}

          {registerMethod === 'mobile' && (
            <>
              <div style={{ marginBottom: 10 }}>
                <label>मोबाइल नंबर *</label>
                <input type="text" name="phone" value={form.phone} onChange={handleChange} required placeholder="10 अंकी नंबर" />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label>ईमेल (पर्यायी)</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label>पासवर्ड (पर्यायी – ओटीपीने लॉगिनसाठी रिकामा ठेवा)</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} />
              </div>
              {form.password && (
                <div style={{ marginBottom: 10 }}>
                  <label>पासवर्ड पुन्हा</label>
                  <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} />
                </div>
              )}
            </>
          )}

          <div style={{ marginBottom: 10 }}>
            <label>प्रकार</label>
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="farmer">🌾 शेतकरी</option>
              <option value="buyer">🛒 खरेदीदार</option>
            </select>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label>गाव/शहर (पर्यायी)</label>
            <input type="text" name="location" value={form.location} onChange={handleChange} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'प्रतीक्षा करा...' : 'नोंदणी करा'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 15 }}>
          आधीच खाते आहे? <Link to="/login">लॉगिन करा</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;