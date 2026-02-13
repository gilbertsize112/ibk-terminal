import React, { useState, useEffect } from 'react';
import { login } from './api';
import AdminDashboard from './AdminDashboard'; 
import UserDashboard from './UserDashboard'; 

const images = ['/k1.jpg', '/k2.jpg', '/k3.jpg', '/k4.jpg'];

interface LoginProps {
  onSwitchToSignup: () => void;
  setUser: (user: any) => void;
}

const Login = ({ onSwitchToSignup, setUser }: LoginProps) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [modalView, setModalView] = useState<'none' | 'forgot'>('none');
  const [resetEmail, setResetEmail] = useState('');
  
  const [isAdminView, setIsAdminView] = useState(false);
  const [isUserView, setIsUserView] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const imgInterval = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(imgInterval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loginPayload = {
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      };

      const { data } = await login(loginPayload);
      
      console.log("Login Response Data:", data);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user && data.user.role === 'admin') {
        console.log("Switching to Admin View...");
        setIsAdminView(true);
      } else {
        console.log("Switching to User View...");
        setIsUserView(true);
      }

      setUser(data.user);
      
    } catch (err: any) {
      console.error("Login Error:", err);
      alert(err.response?.data?.message || "Login failed. Please check your credentials or connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Security link dispatched to: ${resetEmail}`);
    setModalView('none');
  };

  if (isAdminView) {
    return <AdminDashboard />;
  }

  if (isUserView) {
    return <UserDashboard />;
  }

  return (
    <div className="app-viewport">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&family=Syne:wght@400;500;600;700;800&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body {
          width: 100%;
          height: 100%;
          overflow-x: hidden;
        }

        .app-viewport {
          position: relative;
          width: 100%;
          min-height: 100vh;
          background: #000;
          overflow-x: hidden;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          font-family: 'Montserrat', sans-serif;
          padding-top: 0;
        }

        .splash-screen {
          position: fixed;
          inset: 0;
          background: linear-gradient(135deg, #0a0f1e 0%, #152238 25%, #0d1929 50%, #1a2340 75%, #0a0f1e 100%);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          transition: transform 1s cubic-bezier(0.77, 0, 0.175, 1), opacity 0.8s ease;
          overflow: hidden;
          width: 100%;
          height: 100%;
        }

        .splash-screen::before {
          content: '';
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.25) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 50% 30%, rgba(30, 64, 175, 0.15) 0%, transparent 50%);
          pointer-events: none;
          z-index: 1;
        }

        .splash-screen::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(96, 165, 250, 1), transparent);
          animation: topLineGlow 2s infinite;
          z-index: 2;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
        }

        @keyframes topLineGlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        .splash-hidden {
          transform: translateY(-100%);
          opacity: 0;
          pointer-events: none;
        }

        .splash-content {
          position: relative;
          z-index: 10;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 30px;
          padding: 20px;
        }

        .splash-logo-container {
          position: relative;
          width: 120px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .splash-logo {
          font-size: 70px;
          filter: drop-shadow(0 20px 50px rgba(59, 130, 246, 0.4));
          animation: splashBounce 2s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
          z-index: 2;
          position: relative;
        }

        .splash-ring-1 {
          position: absolute;
          width: 140px;
          height: 140px;
          border: 2px solid rgba(59, 130, 246, 0.4);
          border-radius: 50%;
          animation: splashRing 3s ease-out infinite;
          z-index: 1;
        }

        .splash-ring-2 {
          position: absolute;
          width: 100px;
          height: 100px;
          border: 2px solid rgba(99, 102, 241, 0.3);
          border-radius: 50%;
          animation: splashRing 3s ease-out 0.6s infinite;
          z-index: 1;
        }

        @keyframes splashBounce {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.15) translateY(-20px); }
        }

        @keyframes splashRing {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        .splash-text-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          animation: fadeInUp 1s ease-out 0.5s both;
          z-index: 2;
          position: relative;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .splash-title {
          font-size: 42px;
          font-weight: 900;
          letter-spacing: 3px;
          background: linear-gradient(135deg, #fff 0%, #60a5fa 50%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-transform: uppercase;
          font-family: 'Syne', sans-serif;
        }

        .splash-subtitle {
          font-size: 13px;
          color: #94a3b8;
          font-weight: 600;
          letter-spacing: 2.5px;
          text-transform: uppercase;
        }

        .splash-tagline {
          font-size: 11px;
          color: #64748b;
          font-weight: 500;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .loading-bar-container {
          width: 240px;
          height: 4px;
          background: rgba(59, 130, 246, 0.2);
          border-radius: 2px;
          overflow: hidden;
          position: relative;
          border: 1px solid rgba(59, 130, 246, 0.3);
          animation: fadeInUp 1s ease-out 1s both;
          z-index: 2;
        }

        .loading-bar-fill {
          position: absolute;
          height: 100%;
          width: 30%;
          background: linear-gradient(90deg, #3b82f6, #60a5fa, #3b82f6);
          background-size: 200% 100%;
          border-radius: 2px;
          animation: loadingSlide 2s ease-in-out infinite;
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.6);
        }

        @keyframes loadingSlide {
          0% { left: -100%; }
          50% { left: 100%; }
          100% { left: 100%; }
        }

        .security-features {
          display: flex;
          gap: 16px;
          justify-content: center;
          animation: fadeInUp 1s ease-out 1.5s both;
          flex-wrap: wrap;
          padding: 0 24px;
          z-index: 2;
          position: relative;
        }

        .security-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 10px;
          color: #cbd5e1;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .security-badge::before {
          content: '';
          width: 6px;
          height: 6px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 10px #10b981;
        }

        .slideshow-container {
          position: fixed;
          inset: 0;
          z-index: 0;
          width: 100%;
          height: 100vh;
        }

        .slide {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          opacity: 0;
          transition: opacity 1.5s ease-in-out;
          width: 100%;
          height: 100%;
        }

        .slide.active { 
          opacity: 1;
          animation: zoomIn 8s ease-in-out;
        }

        @keyframes zoomIn {
          0% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        .overlay-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(10, 14, 39, 0.8) 50%, rgba(2, 6, 23, 0.95) 100%);
          z-index: 1;
          animation: gradientShift 15s ease infinite;
          width: 100%;
          height: 100%;
        }

        @keyframes gradientShift {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }

        .auth-page {
          position: relative;
          z-index: 10;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 24px;
          animation: authFadeIn 0.8s ease-out;
          min-height: 100vh;
          padding-top: 40px;
          padding-bottom: 40px;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }

        @keyframes authFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .auth-card {
          background: rgba(15, 23, 42, 0.92);
          backdrop-filter: blur(20px);
          width: 100%;
          max-width: 440px;
          padding: 40px 28px;
          border-radius: 24px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          text-align: center;
          border: 1px solid rgba(59, 130, 246, 0.2);
          animation: cardEntrance 0.9s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }

        .auth-card::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.1), transparent);
          border-radius: 50%;
          pointer-events: none;
        }

        .auth-card::after {
          content: '';
          position: absolute;
          bottom: -30%;
          left: -30%;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.05), transparent);
          border-radius: 50%;
          pointer-events: none;
        }

        @keyframes cardEntrance {
          0% { opacity: 0; transform: scale(0.9) translateY(40px); filter: blur(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
        }

        .bank-icon-header {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          font-size: 36px;
          box-shadow: 0 20px 40px rgba(59, 130, 246, 0.3);
          animation: iconPulse 2s ease-in-out infinite;
          border: 2px solid rgba(96, 165, 250, 0.5);
          position: relative;
        }

        .bank-icon-header::after {
          content: '';
          position: absolute;
          inset: -4px;
          border: 2px solid rgba(59, 130, 246, 0.3);
          border-radius: 18px;
          animation: borderSpin 3s linear infinite;
        }

        @keyframes iconPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 20px 40px rgba(59, 130, 246, 0.3); }
          50% { transform: scale(1.08); box-shadow: 0 30px 60px rgba(59, 130, 246, 0.5); }
        }

        @keyframes borderSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .auth-header {
          margin-bottom: 28px;
          animation: headerslidein 0.8s ease-out 0.2s both;
        }

        @keyframes headerslidein {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .secure-badge {
          color: #60a5fa;
          font-weight: 800;
          font-size: 10px;
          background: rgba(59, 130, 246, 0.15);
          padding: 8px 16px;
          border-radius: 50px;
          letter-spacing: 1.5px;
          display: inline-block;
          margin-bottom: 14px;
          text-transform: uppercase;
          border: 1px solid rgba(59, 130, 246, 0.3);
          animation: badgeFloat 3s ease-in-out infinite;
        }

        @keyframes badgeFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        .auth-header h1 {
          font-size: 1.8rem;
          color: #f1f5f9;
          margin: 12px 0 8px 0;
          font-weight: 800;
          letter-spacing: -0.5px;
          font-family: 'Syne', sans-serif;
        }

        .auth-header p {
          color: #cbd5e1;
          font-size: 14px;
          margin-bottom: 0;
          line-height: 1.5;
          font-weight: 500;
        }

        form {
          animation: formSlideIn 0.8s ease-out 0.3s both;
        }

        @keyframes formSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .floating-input { 
          position: relative; 
          width: 100%; 
          margin-bottom: 14px;
        }

        .floating-input input {
          width: 100%;
          padding: 14px 16px;
          border-radius: 12px;
          border: 2px solid rgba(59, 130, 246, 0.3);
          background: rgba(30, 58, 138, 0.3);
          font-size: 14px;
          outline: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-sizing: border-box;
          color: #f1f5f9;
          font-weight: 500;
          font-family: inherit;
        }

        .floating-input input::placeholder {
          color: #94a3b8;
        }

        .floating-input input:focus {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.15);
          box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.1);
          transform: translateY(-2px);
        }

        .security-indicator {
          position: absolute;
          right: 16px;
          top: 14px;
          font-size: 16px;
          animation: lockRoll 0.6s ease-out;
        }

        @keyframes lockRoll {
          0% { transform: rotateZ(0deg) scale(0); opacity: 0; }
          50% { transform: rotateZ(180deg) scale(1.2); }
          100% { transform: rotateZ(360deg) scale(1); opacity: 1; }
        }

        .forgot-pass {
          text-align: right;
          margin: 10px 0 16px 0;
          font-size: 12px;
          color: #94a3b8;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          animation: linkFadeIn 0.8s ease-out 0.6s both;
        }

        .forgot-pass:hover { 
          color: #60a5fa;
          transform: translateX(2px);
        }

        @keyframes linkFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .submit-btn.primary {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 8px;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
          animation: buttonSlideIn 0.8s ease-out 0.5s both;
        }

        .submit-btn.primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s;
        }

        .submit-btn.primary:hover::before {
          left: 100%;
        }

        .submit-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(59, 130, 246, 0.4);
        }

        .submit-btn.primary:active { 
          transform: translateY(0);
          box-shadow: 0 5px 15px rgba(59, 130, 246, 0.3);
        }

        .submit-btn.primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @keyframes buttonSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .auth-footer {
          margin-top: 20px;
          border-top: 1px solid rgba(59, 130, 246, 0.2);
          padding-top: 20px;
          animation: footerSlideIn 0.8s ease-out 0.7s both;
        }

        @keyframes footerSlideIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .auth-footer p {
          color: #cbd5e1;
          font-size: 12px;
          margin-bottom: 12px;
          font-weight: 600;
        }

        .signup-link-btn {
          background: rgba(96, 165, 250, 0.1);
          border: 2px solid rgba(96, 165, 250, 0.3);
          color: #60a5fa;
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          margin-top: 0;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          position: relative;
          overflow: hidden;
        }

        .signup-link-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(96, 165, 250, 0.1));
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }

        .signup-link-btn:hover::before {
          transform: translateX(100%);
        }

        .signup-link-btn:hover { 
          border-color: rgba(96, 165, 250, 0.6);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.15);
        }

        .signup-link-btn:active {
          transform: translateY(0);
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(20px);
          z-index: 100;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          animation: modalFadeIn 0.3s ease-out;
          overflow-y: auto;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 640px) {
          .auth-card { padding: 32px 20px; max-width: 100%; }
          .auth-header h1 { font-size: 1.5rem; }
          .bank-icon-header { width: 60px; height: 60px; font-size: 32px; }
          .floating-input input { padding: 12px 14px; font-size: 13px; }
          .submit-btn.primary { padding: 12px; font-size: 13px; }
          .splash-title { font-size: 28px; }
          .splash-logo { font-size: 50px; }
        }

        @media (max-width: 480px) {
          .auth-page { padding: 16px 16px 30px 16px; }
          .auth-card { padding: 24px 16px; }
          .auth-header h1 { font-size: 1.3rem; }
          .bank-icon-header { width: 55px; height: 55px; font-size: 28px; }
          .floating-input input { padding: 11px 12px; font-size: 12px; }
          .submit-btn.primary { padding: 11px; font-size: 12px; }
          .splash-logo { font-size: 40px; }
          .splash-title { font-size: 24px; }
        }
      `}</style>

      <div className={`splash-screen ${!showSplash ? 'splash-hidden' : ''}`}>
        <div className="splash-content">
          <div className="splash-logo-container">
            <div className="splash-ring-1"></div>
            <div className="splash-ring-2"></div>
            <div className="splash-logo">🏦</div>
          </div>
          <div className="splash-text-container">
            <h1 className="splash-title">IBK BANK</h1>
            <p className="splash-subtitle">Secure Financial Services</p>
            <p className="splash-tagline">Enterprise Banking for Your Future</p>
          </div>
          <div className="loading-bar-container">
            <div className="loading-bar-fill"></div>
          </div>
          <div className="security-features">
            <div className="security-badge">SSL ENCRYPTED</div>
            <div className="security-badge">256-BIT SECURE</div>
            <div className="security-badge">VERIFIED BANK</div>
          </div>
        </div>
      </div>

      <div className="slideshow-container">
        {images.map((img, index) => (
          <div
            key={img}
            className={`slide ${index === currentImg ? 'active' : ''}`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        <div className="overlay-gradient"></div>
      </div>

      <div className="auth-page">
        {modalView === 'forgot' && (
          <div className="modal-overlay">
            <div className="auth-card">
              <div className="bank-icon-header">🔑</div>
              <div className="auth-header">
                <h1>Reset Password</h1>
                <p>Enter your email to receive recovery instructions.</p>
              </div>
              <form onSubmit={handleResetSubmit}>
                <div className="floating-input">
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    required 
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                </div>
                <button type="submit" className="submit-btn primary">SEND LINK</button>
                <p onClick={() => setModalView('none')} style={{ marginTop: '16px', cursor: 'pointer', color: '#60a5fa', fontWeight: 700, fontSize: '12px', transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '0.5px' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#93c5fd')} onMouseLeave={(e) => (e.currentTarget.style.color = '#60a5fa')}>BACK TO LOGIN</p>
              </form>
            </div>
          </div>
        )}

        <div className="auth-card">
          <div className="bank-icon-header" style={{ position: 'relative', zIndex: 2 }}>🏛️</div>
          <div className="auth-header">
            <span className="secure-badge">🔒 SECURE ACCESS</span>
            <h1>Welcome Back</h1>
            <p>Enter your credentials to access your IBK Finance account.</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="floating-input">
              <input 
                type="email" 
                placeholder="Email Address" 
                required 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
              />
            </div>
            <div className="floating-input">
              <input 
                type="password" 
                placeholder="Password" 
                required 
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
              />
              {isPasswordFocused && <span className="security-indicator">🔐</span>}
            </div>

            <div className="forgot-pass" onClick={() => setModalView('forgot')}>Forgot Password?</div>
            
            <button type="submit" disabled={loading} className="submit-btn primary">
              {loading ? "🔄 VERIFYING..." : "LOGIN"}
            </button>
          </form>

          <div className="auth-footer">
            <p>New to IBK Finance?</p>
            <button 
              className="signup-link-btn" 
              type="button" 
              onClick={onSwitchToSignup}
            >
              CREATE ACCOUNT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;