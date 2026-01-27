import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminDashboard from './AdminDashboard'; // Added Import
import UserDashboard from './UserDashboard'; // Added Import for Standard Users

const images = ['/k1.jpg', '/k2.jpg', '/k3.jpg', '/k4.jpg'];

// Updated Props to include setUser to fix the red underline in App.tsx
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
  
  // NEW STATES: To handle the dashboard transitions
  const [isAdminView, setIsAdminView] = useState(false);
  const [isUserView, setIsUserView] = useState(false);

  // Background Slideshow Logic (Matches Signup.tsx)
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
      // Force email to lowercase before sending to match backend list
      const loginPayload = {
        ...formData,
        email: formData.email.toLowerCase().trim()
      };

      const { data } = await axios.post('http://localhost:5000/api/auth/login', loginPayload);
      
      // DEBUG LOG: Open your browser console (F12) to see this!
      console.log("Login Response Data:", data);

      // Save the token and user to local storage for persistence
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Update the Global state in App.tsx
      // This clears the login screen and shows the dashboard automatically
      setUser(data.user);

      // REDIRECTION LOGIC (Local state fallback):
      if (data.user && data.user.role === 'admin') {
        setIsAdminView(true);
      } else {
        setIsUserView(true);
      }
      
    } catch (err: any) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Security link dispatched to: ${resetEmail}`);
    setModalView('none');
  };

  // VIEW LOGIC:
  // Check user view first, then admin view
  if (isUserView) {
    return <UserDashboard />;
  }

  if (isAdminView) {
    return <AdminDashboard />;
  }

  return (
    <div className="app-viewport">
      {/* INTERNAL CSS - Exact match to Signup for seamless transition */}
      <style>{`
        .app-viewport {
          position: relative;
          width: 100%;
          height: 100vh;
          background: #000;
          overflow: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: 'Inter', sans-serif;
        }
        .slideshow-container {
          position: fixed;
          inset: 0;
          z-index: 0;
        }
        .slide {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          opacity: 0;
          transition: opacity 1.5s ease-in-out;
        }
        .slide.active { opacity: 1; }
        .overlay-gradient {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle, rgba(0,0,0,0.2) 0%, rgba(0,26,51,0.85) 100%);
          z-index: 1;
        }
        .auth-page {
          position: relative;
          z-index: 10;
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 20px;
        }
        .auth-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          width: 100%;
          max-width: 460px;
          padding: clamp(30px, 5vw, 55px) clamp(20px, 4vw, 45px);
          border-radius: 40px;
          box-shadow: 0 50px 100px rgba(0,0,0,0.6);
          border: 1px solid rgba(255,255,255,0.4);
          text-align: center;
        }
        .modal-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(12px);
          z-index: 100;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }
        .slide-up {
          animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(60px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .floating-input { position: relative; width: 100%; }
        .floating-input input {
          width: 100%;
          padding: 18px 24px;
          margin-bottom: 16px;
          border-radius: 20px;
          border: 1.5px solid #e2e8f0;
          background: #f8fafc;
          font-size: 16px;
          outline: none;
          transition: all 0.3s ease;
        }
        .floating-input input:focus {
          border-color: #004da0;
          background: white;
          box-shadow: 0 10px 20px rgba(0,77,160,0.05);
        }
        .security-indicator {
          position: absolute;
          right: 20px;
          top: 18px;
          font-size: 18px;
          color: #004da0;
        }
        .submit-btn.primary {
          width: 100%;
          padding: 20px;
          border-radius: 20px;
          border: none;
          background: linear-gradient(135deg, #004da0 0%, #002d5a 100%);
          color: white;
          font-weight: 700;
          font-size: 1.1rem;
          cursor: pointer;
          transition: 0.2s;
          margin-top: 5px;
        }
        .submit-btn.primary:active { transform: scale(0.98); }
        .signup-link-btn {
          background: transparent;
          border: 2px solid #004da0;
          color: #004da0;
          width: 100%;
          padding: 16px;
          border-radius: 18px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 12px;
          transition: 0.3s;
        }
        .signup-link-btn:hover { background: #004da0; color: white; }
        .forgot-pass {
          text-align: right;
          margin-top: -10px;
          margin-bottom: 20px;
          font-size: 13px;
          color: #004da0;
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>

      {/* Background Slideshow */}
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
        {/* FORGOT PASSWORD MODAL */}
        {modalView === 'forgot' && (
          <div className="modal-overlay">
            <div className="auth-card slide-up">
              <div className="auth-header">
                 <h1 style={{fontSize: '2rem', color: '#002d5a', fontWeight: 800}}>Reset Password</h1>
                 <p style={{color: '#64748b', marginBottom: '25px'}}>Enter your email to receive recovery instructions.</p>
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
                <p 
                  onClick={() => setModalView('none')} 
                  style={{marginTop: '20px', cursor: 'pointer', color: '#004da0', fontWeight: 700, fontSize: '14px'}}
                >
                  BACK TO LOGIN
                </p>
              </form>
            </div>
          </div>
        )}

        {/* LOGIN CARD */}
        <div className="auth-card slide-up">
          <div className="auth-header">
            <span style={{color: '#004da0', fontWeight: 800, fontSize: '11px', background: 'rgba(0,77,160,0.08)', padding: '5px 14px', borderRadius: '50px', letterSpacing: '1px'}}>SECURE ACCESS</span>
            <h1 style={{fontSize: '2.5rem', color: '#002d5a', margin: '12px 0', fontWeight: 800, letterSpacing: '-1px'}}>Welcome Back</h1>
            <p style={{color: '#64748b', fontSize: '15px', marginBottom: '35px', lineHeight: '1.5'}}>Enter your credentials to access your industrial account.</p>
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
              {isPasswordFocused && <span className="security-indicator">🔒</span>}
            </div>

            <div className="forgot-pass" onClick={() => setModalView('forgot')}>Forgot Password?</div>
            
            <button type="submit" disabled={loading} className="submit-btn primary">
              {loading ? "VERIFYING..." : "LOGIN"}
            </button>
          </form>

          <div className="auth-footer" style={{marginTop: '35px', borderTop: '1px solid #f1f5f9', paddingTop: '25px'}}>
            <p style={{color: '#64748b', fontSize: '14px', marginBottom: '5px'}}>New to IBK?</p>
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