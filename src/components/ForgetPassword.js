import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import '../style/ForgotPassword.css'

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: reset

  const handleSendOtp = async () => {
    if (!email) {
      toast.error('कृपया ईमेल प्रविष्ट करा');
      return;
    }
    try {
      await axios.post('http://localhost:8000/forgot-password/send-otp', { email });
      toast.success('OTP तुमच्या ईमेलवर पाठवला गेला');
      setStep(2);
    } catch (err) {
      toast.error('OTP पाठवताना त्रुटी');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.error('कृपया OTP प्रविष्ट करा');
      return;
    }
    try {
      await axios.post('http://localhost:8000/forgot-password/verify-otp', { email, otp });
      toast.success('OTP सत्यापित');
      setStep(3);
    } catch (err) {
      toast.error('चुकीचा किंवा कालबाह्य OTP');
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('पासवर्ड जुळत नाहीत');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('पासवर्ड किमान ६ अक्षरांचा असावा');
      return;
    }
    try {
      await axios.post('http://localhost:8000/forgot-password/reset', {
        email,
        otp,
        new_password: newPassword
      });
      toast.success('पासवर्ड यशस्वीरित्या बदलला');
      navigate('/login');
    } catch (err) {
      toast.error('पासवर्ड रीसेट करताना त्रुटी');
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>पासवर्ड विसरलात?</h2>
      {step === 1 && (
        <div>
          <input
            type="email"
            placeholder="तुमचा ईमेल"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={handleSendOtp}>OTP पाठवा</button>
        </div>
      )}
      {step === 2 && (
        <div>
          <p>OTP {email} वर पाठवला आहे</p>
          <input
            type="text"
            placeholder="6-अंकी OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={handleVerifyOtp}>OTP सत्यापित करा</button>
        </div>
      )}
      {step === 3 && (
        <div>
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
          <button onClick={handleResetPassword}>पासवर्ड बदला</button>
        </div>
      )}
      <p>
        <a href="/login">लॉगिन पृष्ठावर जा</a>
      </p>
    </div>
  );
}

export default ForgotPassword;