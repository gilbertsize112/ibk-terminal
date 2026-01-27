import React, { useState, useEffect } from 'react';
import { signup } from './api';
import Login from './Login'; 
import AdminDashboard from './AdminDashboard'; 

const images = ['/k1.jpg', '/k2.jpg', '/k3.jpg', '/k4.jpg'];

// ADDED: Props interface to receive setUser from App.tsx
interface SignupProps {
  setUser: (user: any) => void;
}

const Signup = ({ setUser }: SignupProps) => { // Destructure setUser here
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [currentImg, setCurrentImg] = useState(0);
  
  // New States for Modal and Navigation
  const [modalView, setModalView] = useState<'none' | 'forgot'>('none');
  const [resetEmail, setResetEmail] = useState('');

  // Added states to toggle between Signup, Login, and Admin views
  const [isLoginView, setIsLoginView] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);

  // Background Slideshow Logic (3 seconds)
  useEffect(() => {
    const imgInterval = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(imgInterval);
  }, []);

  // 5 Second Splash Timer
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await signup(formData);
      alert(`✅ Account Verified: ${data.accountNumber}`);
      
      // If the backend auto-promotes to admin (Option B), we check here
      if (data.role === 'admin') {
        setIsAdminView(true);
      } else {
        setIsLoginView(true);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Reset link sent to: ${resetEmail}`);
    setModalView('none');
  };

  // Logic to show the Admin Dashboard
  if (!showSplash && isAdminView) {
    return <AdminDashboard />;
  }

  // UPDATED: Pass setUser here. This removes the red underline!
  if (!showSplash && isLoginView) {
    return (
      <Login 
        onSwitchToSignup={() => setIsLoginView(false)} 
        setUser={setUser} 
      />
    );
  }

  return (
    <div className="app-viewport">
      {/* INTERNAL CSS */}
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
          background: radial-gradient(circle, rgba(0,0,0,0.3) 0%, rgba(0,26,51,0.8) 100%);
          z-index: 1;
        }
        .splash-screen {
          position: relative;
          z-index: 10;
          text-align: center;
          color: white;
          animation: fadeIn 1s ease-in;
        }
        .spinning-icon {
          font-size: 80px;
          margin-bottom: 20px;
          display: inline-block;
          animation: spin3D 4s infinite linear;
        }
        @keyframes spin3D {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
        .logo-text {
          font-size: clamp(3rem, 10vw, 5rem);
          font-weight: 800;
          margin: 0;
          letter-spacing: -2px;
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
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          width: 100%;
          max-width: 450px;
          padding: 50px 40px;
          border-radius: 40px;
          box-shadow: 0 40px 100px rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.3);
          text-align: center;
        }
        /* Modal Style */
        .modal-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(10px);
          z-index: 100;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }
        .slide-up {
          animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .floating-input input {
          width: 100%;
          padding: 18px 22px;
          margin-bottom: 15px;
          border-radius: 18px;
          border: 1.5px solid #e2e8f0;
          background: #f8fafc;
          font-size: 16px;
          outline: none;
          transition: 0.3s;
        }
        .floating-input input:focus {
          border-color: #004da0;
          background: white;
          box-shadow: 0 5px 15px rgba(0,77,160,0.1);
        }
        .submit-btn.primary {
          width: 100%;
          padding: 18px;
          border-radius: 18px;
          border: none;
          background: #004da0;
          color: white;
          font-weight: 700;
          font-size: 1.1rem;
          cursor: pointer;
          transition: 0.3s;
          margin-top: 5px;
        }
        .submit-btn.primary:hover {
          transform: translateY(-2px);
          background: #003a7a;
        }
        .login-link-btn {
          background: transparent;
          border: 2px solid #004da0;
          color: #004da0;
          width: 100%;
          padding: 14px;
          border-radius: 16px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 10px;
          transition: 0.3s;
        }
        .login-link-btn:hover { background: #004da0; color: white; }
        .forgot-pass {
          text-align: right;
          margin-top: -10px;
          margin-bottom: 15px;
          font-size: 13px;
          color: #004da0;
          font-weight: 600;
          cursor: pointer;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
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

      {showSplash ? (
        <div className="splash-screen">
          <div className="splash-content">
            <div className="spinning-icon">🏦</div>
            <h1 className="logo-text">IBK</h1>
            <h2 className="bank-subtitle" style={{color: 'rgba(255,255,255,0.7)', letterSpacing: '4px'}}>Industrial Bank of Korea</h2>
            <div className="korean-badge" style={{background: '#00a0e9', padding: '5px 20px', borderRadius: '8px', display: 'inline-block', margin: '20px 0'}}>
              <p className="korean-text" style={{fontWeight: 600, margin: 0}}>기업은행</p>
            </div>
            <div className="loading-dots">
              <p style={{color: '#fff', opacity: 0.6, fontSize: '14px'}}>Connecting to Secure Server...</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="auth-page">
          {/* FORGOT PASSWORD MODAL */}
          {modalView === 'forgot' && (
            <div className="modal-overlay">
              <div className="auth-card slide-up">
                <div className="auth-header">
                   <h1 style={{fontSize: '2rem', color: '#002d5a', fontWeight: 800}}>Reset Access</h1>
                   <p className="sub-text" style={{color: '#64748b', marginBottom: '25px'}}>Enter your registered email to receive a recovery link.</p>
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
                  <button type="submit" className="submit-btn primary">SEND RECOVERY LINK</button>
                  <p 
                    onClick={() => setModalView('none')} 
                    style={{marginTop: '20px', cursor: 'pointer', color: '#004da0', fontWeight: 700, fontSize: '14px'}}
                  >
                    RETURN TO SIGNUP
                  </p>
                </form>
              </div>
            </div>
          )}

          <div className="auth-card slide-up">
            <div className="auth-header">
              <span className="brand-tag" style={{color: '#004da0', fontWeight: 700, fontSize: '12px', background: 'rgba(0,77,160,0.1)', padding: '4px 12px', borderRadius: '50px'}}>IDENTITY VERIFICATION</span>
              <h1 style={{fontSize: '2.3rem', color: '#002d5a', margin: '10px 0', fontWeight: 800}}>Create Account</h1>
              <p className="sub-text" style={{color: '#64748b', fontSize: '15px', marginBottom: '30px'}}>Join the world's most secure industrial network.</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="floating-input">
                <input type="text" name="name" placeholder="Full Name" required 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="floating-input">
                <input type="email" name="email" placeholder="Email Address" required 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="floating-input">
                <input type="password" name="password" placeholder="Secure Password" required 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} />
              </div>

              <div className="forgot-pass" onClick={() => setModalView('forgot')}>Forgot Password?</div>
              
              <button type="submit" disabled={loading} className="submit-btn primary">
                {loading ? "AUTHENTICATING..." : "SIGN UP"}
              </button>
            </form>

            <div className="auth-footer" style={{marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px'}}>
              <p style={{color: '#64748b', fontSize: '14px'}}>Member of IBK Global?</p>
              <button 
                className="login-link-btn" 
                type="button" 
                onClick={() => setIsLoginView(true)}
              >
                LOGIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;