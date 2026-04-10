// import React, { useState } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { Link } from 'react-router-dom';
// import toast from 'react-hot-toast';

// function Login() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const { login } = useAuth();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const result = await login(email, password);
//     if (result.success) {
//       toast.success('लॉगिन यशस्वी!');
//     } else {
//       toast.error(result.error || 'लॉगिन अयशस्वी');
//     }
//   };

//   return (
//     <div className="container" style={{ maxWidth: 450, marginTop: 80 }}>
//       <div className="card">
//         <h2 style={{ textAlign: 'center', color: '#2e7d32' }}>🔐 लॉगिन</h2>
//         <form onSubmit={handleSubmit}>
//           <div style={{ marginBottom: 15 }}>
//             <label>ईमेल</label>
//             <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
//           </div>
//           <div style={{ marginBottom: 20 }}>
//             <label>पासवर्ड</label>
//             <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
//           </div>
//           <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>लॉगिन</button>
//           <Link to="/forgot-password">पासवर्ड विसरलात?</Link>
//         </form>
//         <p style={{ textAlign: 'center', marginTop: 15 }}>
//           खाते नाही? <Link to="/register">नोंदणी करा</Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Login;


// import React, { useState } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { Link } from 'react-router-dom';
// import axios from 'axios';
// import toast from 'react-hot-toast';

// function Login() {
//   const { login } = useAuth();
//   const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'mobile'
//   // Email state
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   // Mobile state
//   const [phone, setPhone] = useState('');
//   const [mobilePassword, setMobilePassword] = useState('');
//   const [otp, setOtp] = useState('');
//   const [otpSent, setOtpSent] = useState(false);
//   const [isOtpLogin, setIsOtpLogin] = useState(false); // inside mobile: false = password, true = OTP
//   const [loading, setLoading] = useState(false);

//   // Email login
//   const handleEmailSubmit = async (e) => {
//     e.preventDefault();
//     const result = await login(email, password);
//     if (result.success) {
//       toast.success('लॉगिन यशस्वी!');
//     } else {
//       toast.error(result.error || 'लॉगिन अयशस्वी');
//     }
//   };

//   // Send OTP for mobile
//   const handleSendOtp = async () => {
//     if (!phone || phone.length < 10) {
//       toast.error('योग्य मोबाइल नंबर टाका (10 अंक)');
//       return;
//     }
//     setLoading(true);
//     try {
//       await axios.post('http://localhost:8000/mobile/send-otp', { phone });
//       toast.success('OTP पाठवला');
//       setOtpSent(true);
//     } catch (err) {
//       toast.error(err.response?.data?.detail || 'OTP पाठवता आला नाही');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Verify OTP and login/register
//   const handleVerifyOtp = async () => {
//     if (!otp) {
//       toast.error('OTP प्रविष्ट करा');
//       return;
//     }
//     setLoading(true);
//     try {
//       const res = await axios.post('http://localhost:8000/mobile/verify-otp', { phone, otp });
//       localStorage.setItem('token', res.data.access_token);
//       // Refresh user context – simple reload or trigger auth context update
//       window.location.href = '/dashboard';
//     } catch (err) {
//       toast.error(err.response?.data?.detail || 'चुकीचा OTP');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Mobile login with password
//   const handleMobilePasswordLogin = async () => {
//     if (!phone || !mobilePassword) {
//       toast.error('मोबाइल नंबर आणि पासवर्ड टाका');
//       return;
//     }
//     setLoading(true);
//     try {
//       const res = await axios.post('http://localhost:8000/mobile/login', { phone, password: mobilePassword });
//       localStorage.setItem('token', res.data.access_token);
//       window.location.href = '/dashboard';
//     } catch (err) {
//       toast.error(err.response?.data?.detail || 'लॉगिन अयशस्वी');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container" style={{ maxWidth: 450, marginTop: 80 }}>
//       <div className="card">
//         <h2 style={{ textAlign: 'center', color: '#2e7d32' }}>🔐 लॉगिन</h2>

//         {/* Method Toggle */}
//         <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
//           <button
//             type="button"
//             onClick={() => setLoginMethod('email')}
//             style={{
//               flex: 1,
//               padding: '8px',
//               background: loginMethod === 'email' ? '#2e7d32' : '#e0e0e0',
//               color: loginMethod === 'email' ? 'white' : '#333',
//               border: 'none',
//               borderRadius: '30px',
//               cursor: 'pointer'
//             }}
//           >
//             📧 ईमेल
//           </button>
//           <button
//             type="button"
//             onClick={() => setLoginMethod('mobile')}
//             style={{
//               flex: 1,
//               padding: '8px',
//               background: loginMethod === 'mobile' ? '#2e7d32' : '#e0e0e0',
//               color: loginMethod === 'mobile' ? 'white' : '#333',
//               border: 'none',
//               borderRadius: '30px',
//               cursor: 'pointer'
//             }}
//           >
//             📱 मोबाइल
//           </button>
//         </div>

//         {/* Email Login Form */}
//         {loginMethod === 'email' && (
//           <form onSubmit={handleEmailSubmit}>
//             <div style={{ marginBottom: 15 }}>
//               <label>ईमेल</label>
//               <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
//             </div>
//             <div style={{ marginBottom: 20 }}>
//               <label>पासवर्ड</label>
//               <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
//             </div>
//             <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>लॉगिन</button>
//             <Link to="/forgot-password">पासवर्ड विसरलात?</Link>
//           </form>
//         )}

//         {/* Mobile Login Form */}
//         {loginMethod === 'mobile' && (
//           <div>
//             <div style={{ marginBottom: 15 }}>
//               <label>मोबाइल नंबर</label>
//               <input
//                 type="tel"
//                 placeholder="10 अंकी नंबर"
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//                 required
//               />
//             </div>

//             {/* Toggle between OTP and Password */}
//             <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
//               <button
//                 type="button"
//                 onClick={() => setIsOtpLogin(false)}
//                 style={{
//                   flex: 1,
//                   padding: '6px',
//                   background: !isOtpLogin ? '#2e7d32' : '#e0e0e0',
//                   color: !isOtpLogin ? 'white' : '#333',
//                   border: 'none',
//                   borderRadius: '30px',
//                   cursor: 'pointer'
//                 }}
//               >
//                 पासवर्ड
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setIsOtpLogin(true)}
//                 style={{
//                   flex: 1,
//                   padding: '6px',
//                   background: isOtpLogin ? '#2e7d32' : '#e0e0e0',
//                   color: isOtpLogin ? 'white' : '#333',
//                   border: 'none',
//                   borderRadius: '30px',
//                   cursor: 'pointer'
//                 }}
//               >
//                 OTP
//               </button>
//             </div>

//             {/* Password Login */}
//             {!isOtpLogin && (
//               <>
//                 <div style={{ marginBottom: 20 }}>
//                   <label>पासवर्ड</label>
//                   <input
//                     type="password"
//                     value={mobilePassword}
//                     onChange={(e) => setMobilePassword(e.target.value)}
//                     required
//                   />
//                 </div>
//                 <button
//                   className="btn btn-primary"
//                   style={{ width: '100%' }}
//                   onClick={handleMobilePasswordLogin}
//                   disabled={loading}
//                 >
//                   {loading ? 'प्रक्रिया...' : 'लॉगिन'}
//                 </button>
//               </>
//             )}

//             {/* OTP Login */}
//             {isOtpLogin && (
//               <>
//                 {!otpSent ? (
//                   <button
//                     className="btn btn-primary"
//                     style={{ width: '100%', background: '#ff9800' }}
//                     onClick={handleSendOtp}
//                     disabled={loading}
//                   >
//                     {loading ? 'पाठवत आहे...' : 'OTP पाठवा'}
//                   </button>
//                 ) : (
//                   <>
//                     <div style={{ marginBottom: 15 }}>
//                       <label>OTP</label>
//                       <input
//                         type="text"
//                         placeholder="6 अंकी OTP"
//                         value={otp}
//                         onChange={(e) => setOtp(e.target.value)}
//                         required
//                       />
//                     </div>
//                     <button
//                       className="btn btn-primary"
//                       style={{ width: '100%' }}
//                       onClick={handleVerifyOtp}
//                       disabled={loading}
//                     >
//                       {loading ? 'प्रक्रिया...' : 'लॉगिन'}
//                     </button>
//                   </>
//                 )}
//               </>
//             )}

//             <div style={{ marginTop: '10px', textAlign: 'center' }}>
//               <Link to="/forgot-password">पासवर्ड विसरलात?</Link>
//             </div>
//           </div>
//         )}

//         <p style={{ textAlign: 'center', marginTop: 15 }}>
//           खाते नाही? <Link to="/register">नोंदणी करा</Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Login;



import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

function Login() {
  const { login } = useAuth();
  const [loginMethod, setLoginMethod] = useState('email');
  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Mobile state
  const [phone, setPhone] = useState('');
  const [mobilePassword, setMobilePassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isOtpLogin, setIsOtpLogin] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) toast.success('लॉगिन यशस्वी!');
    else toast.error(result.error || 'लॉगिन अयशस्वी');
  };

const handleSendOtp = async () => {
  if (!phone || phone.length < 10) {
    toast.error('10 अंकी मोबाइल नंबर टाका');
    return;
  }
  setLoading(true);
  try {
    const response = await axios.post('http://localhost:8000/mobile/send-otp', { phone });
    toast.success(`OTP पाठवला (DEMO: ${response.data.otp})`);
    setOtpSent(true);
  } catch (err) {
    const msg = err.response?.data?.detail || 'OTP पाठवता आला नाही';
    toast.error(msg);
  } finally {
    setLoading(false);
  }
};
const handleVerifyOtp = async () => {
  if (!otp) {
    toast.error('OTP प्रविष्ट करा');
    return;
  }
  setLoading(true);
  try {
    const response = await axios.post('http://localhost:8000/mobile/verify-otp', { 
      phone: phone, 
      otp: otp 
    });
    localStorage.setItem('token', response.data.access_token);
    window.location.href = '/dashboard';
  } catch (err) {
    let errorMsg = 'चुकीचा OTP';
    if (err.response?.data?.detail) {
      errorMsg = err.response.data.detail;
    }
    toast.error(errorMsg);
  } finally {
    setLoading(false);
  }
};

 

  const handleMobilePasswordLogin = async () => {
    if (!phone || !mobilePassword) {
      toast.error('मोबाइल नंबर आणि पासवर्ड टाका');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/mobile/login', { phone, password: mobilePassword });
      localStorage.setItem('token', res.data.access_token);
      window.location.href = '/dashboard';
    } catch (err) {
      toast.error(err.response?.data?.detail || 'लॉगिन अयशस्वी');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 450, marginTop: 80 }}>
      <div className="card">
        <h2 style={{ textAlign: 'center', color: '#2e7d32' }}>🔐 लॉगिन</h2>

        {/* Toggle Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => setLoginMethod('email')}
            style={{
              flex: 1,
              padding: '8px',
              background: loginMethod === 'email' ? '#2e7d32' : '#e0e0e0',
              color: loginMethod === 'email' ? 'white' : '#333',
              border: 'none',
              borderRadius: '30px',
              cursor: 'pointer'
            }}
          >📧 ईमेल</button>
          <button
            type="button"
            onClick={() => setLoginMethod('mobile')}
            style={{
              flex: 1,
              padding: '8px',
              background: loginMethod === 'mobile' ? '#2e7d32' : '#e0e0e0',
              color: loginMethod === 'mobile' ? 'white' : '#333',
              border: 'none',
              borderRadius: '30px',
              cursor: 'pointer'
            }}
          >📱 मोबाइल</button>
        </div>

        {/* Email Form */}
        {loginMethod === 'email' && (
          <form onSubmit={handleEmailSubmit}>
            <div style={{ marginBottom: 15 }}>
              <label>ईमेल</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label>पासवर्ड</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>लॉगिन</button>
            <Link to="/forgot-password">पासवर्ड विसरलात?</Link>
          </form>
        )}

        {/* Mobile Form */}
        {loginMethod === 'mobile' && (
          <div>
            <div style={{ marginBottom: 15 }}>
              <label>मोबाइल नंबर</label>
              <input
                type="tel"
                placeholder="10 अंकी नंबर"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <button
                type="button"
                onClick={() => setIsOtpLogin(false)}
                style={{
                  flex: 1,
                  padding: '6px',
                  background: !isOtpLogin ? '#2e7d32' : '#e0e0e0',
                  color: !isOtpLogin ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '30px',
                  cursor: 'pointer'
                }}
              >पासवर्ड</button>
              <button
                type="button"
                onClick={() => setIsOtpLogin(true)}
                style={{
                  flex: 1,
                  padding: '6px',
                  background: isOtpLogin ? '#2e7d32' : '#e0e0e0',
                  color: isOtpLogin ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '30px',
                  cursor: 'pointer'
                }}
              >OTP</button>
            </div>

            {!isOtpLogin && (
              <>
                <div style={{ marginBottom: 20 }}>
                  <label>पासवर्ड</label>
                  <input
                    type="password"
                    value={mobilePassword}
                    onChange={(e) => setMobilePassword(e.target.value)}
                    required
                  />
                </div>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={handleMobilePasswordLogin}
                  disabled={loading}
                >{loading ? 'प्रक्रिया...' : 'लॉगिन'}</button>
              </>
            )}

            {isOtpLogin && (
              <>
                {!otpSent ? (
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', background: '#ff9800' }}
                    onClick={handleSendOtp}
                    disabled={loading}
                  >{loading ? 'पाठवत आहे...' : 'OTP पाठवा'}</button>
                ) : (
                  <>
                    <div style={{ marginBottom: 15 }}>
                      <label>OTP</label>
                      <input
                        type="text"
                        placeholder="6 अंकी OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                      />
                    </div>
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                      onClick={handleVerifyOtp}
                      disabled={loading}
                    >{loading ? 'प्रक्रिया...' : 'लॉगिन'}</button>
                  </>
                )}
              </>
            )}
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: 15 }}>
          खाते नाही? <Link to="/register">नोंदणी करा</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;