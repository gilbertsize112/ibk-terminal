import React, { useState, useEffect } from 'react';
import { login } from './api'; // Use your centralized API config
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
      // ✅ FIX: Force email to lowercase and trim to match the Signup data in MongoDB
      const loginPayload = {
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      };

      // ✅ FIX: Use the imported 'login' function from your ./api file
      const { data } = await login(loginPayload);
      
      // DEBUG LOG: Open your browser console (F12) to see this!
      console.log("Login Response Data:", data);

      // Save the token and user to local storage for persistence
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      /** * ⚠️ CRITICAL UPDATE: 
       * We update the local view states FIRST, then notify the global state.
       */
      if (data.user && data.user.role === 'admin') {
        console.log("Switching to Admin View...");
        setIsAdminView(true);
      } else {
        console.log("Switching to User View...");
        setIsUserView(true);
      }

      // Update the Global state in App.tsx
      setUser(data.user);
      
    } catch (err: any) {
      console.error("Login Error:", err);
      // This handles the "Invalid credentials" message coming from your server
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

  // VIEW LOGIC (This happens before the return below):
  // If the user logs in successfully, we swap the entire UI for the dashboard
  if (isAdminView) {
    return <AdminDashboard />;
  }

  if (isUserView) {
    return <UserDashboard />;
  }

  return (
    <div className="app-viewport">
      {/* INTERNAL CSS - Exact match to Signup for seamless transition */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .app-viewport {
          position: relative;
          width: 100%;
          height: 100vh;
          background: #000;
          overflow: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: 'Plus Jakarta Sans', sans-serif;
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
          background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(2, 6, 23, 0.9));
          z-index: 1;
        }

        .auth-page {
          position: relative;
          z-index: 10;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 24px;
        }

        .auth-card {
          background: #ffffff;
          width: 100%;
          max-width: 420px;
          padding: 40px;
          border-radius: 28px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          text-align: center;
          animation: cardEntrance 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes cardEntrance {
          from { opacity: 0; transform: scale(0.95) translateY(30px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        @media (max-width: 480px) {
          .auth-card {
            padding: 30px 24px;
            max-width: 340px; 
          }
        }

        .bank-icon-header {
          width: 54px;
          height: 54px;
          background: #004da0;
          color: white;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 24px;
          box-shadow: 0 10px 15px -3px rgba(0, 77, 160, 0.3);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 77, 160, 0.4); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(0, 77, 160, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 77, 160, 0); }
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

        .floating-input { position: relative; width: 100%; }

        .floating-input input {
          width: 100%;
          padding: 16px 20px;
          margin-bottom: 12px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          font-size: 15px;
          outline: none;
          transition: all 0.2s;
          box-sizing: border-box;
          color: #1e293b;
        }

        .floating-input input:focus {
          border-color: #004da0;
          background: white;
          box-shadow: 0 0 0 4px rgba(0, 77, 160, 0.05);
        }

        .security-indicator {
          position: absolute;
          right: 18px;
          top: 15px;
          font-size: 16px;
          opacity: 0.7;
        }

        .submit-btn.primary {
          width: 100%;
          padding: 16px;
          border-radius: 12px;
          border: none;
          background: #004da0;
          color: white;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: 0.2s;
          margin-top: 10px;
          letter-spacing: 0.5px;
        }

        .submit-btn.primary:active { transform: scale(0.98); }

        .signup-link-btn {
          background: #f1f5f9;
          border: none;
          color: #004da0;
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          margin-top: 8px;
          transition: 0.2s;
        }

        .signup-link-btn:hover { background: #e2e8f0; }

        .forgot-pass {
          text-align: right;
          margin: -4px 0 20px 0;
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
          cursor: pointer;
        }
        .forgot-pass:hover { color: #004da0; }
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
            <div className="auth-card">
              <div className="bank-icon-header">🔑</div>
              <h1 style={{fontSize: '1.5rem', color: '#0f172a', fontWeight: 800, margin: '0 0 8px 0'}}>Reset Password</h1>
              <p style={{color: '#64748b', fontSize: '14px', marginBottom: '24px'}}>Enter your email to receive recovery instructions.</p>
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
                  style={{marginTop: '20px', cursor: 'pointer', color: '#64748b', fontWeight: 700, fontSize: '13px'}}
                >
                  BACK TO LOGIN
                </p>
              </form>
            </div>
          </div>
        )}

        {/* LOGIN CARD */}
        <div className="auth-card">
          <div className="bank-icon-header">🏛️</div>
          <div className="auth-header">
            <span style={{color: '#004da0', fontWeight: 800, fontSize: '11px', background: 'rgba(0,77,160,0.08)', padding: '5px 14px', borderRadius: '50px', letterSpacing: '1px'}}>SECURE ACCESS</span>
            <h1 style={{fontSize: '1.8rem', color: '#0f172a', margin: '12px 0 8px 0', fontWeight: 800, letterSpacing: '-0.5px'}}>Welcome Back</h1>
            <p style={{color: '#64748b', fontSize: '14px', marginBottom: '32px', lineHeight: '1.5', fontWeight: 500}}>Enter your credentials to access your IBK Finance account.</p>
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

          <div className="auth-footer" style={{marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '24px'}}>
            <p style={{color: '#64748b', fontSize: '13px', marginBottom: '16px', fontWeight: 500}}>New to IBK Finance?</p>
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