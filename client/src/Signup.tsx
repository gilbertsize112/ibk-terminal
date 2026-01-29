import React, { useState, useEffect } from 'react';
import { signup } from './api';
import Login from './Login'; 
import AdminDashboard from './AdminDashboard'; 

const images = ['/k1.jpg', '/k2.jpg', '/k3.jpg', '/k4.jpg'];

interface SignupProps {
  setUser: (user: any) => void;
}

const Signup = ({ setUser }: SignupProps) => { 
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [currentImg, setCurrentImg] = useState(0);
  
  // New States
  const [modalView, setModalView] = useState<'none' | 'forgot'>('none');
  const [resetEmail, setResetEmail] = useState('');
  const [isLoginView, setIsLoginView] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);

  // NEW: UI Enhancement States
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

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

  // Password Strength Logic
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData({ ...formData, password: val });

    // Simple strength logic
    let strength = 0;
    if (val.length > 5) strength += 25;
    if (val.match(/[A-Z]/)) strength += 25;
    if (val.match(/[0-9]/)) strength += 25;
    if (val.match(/[^A-Za-z0-9]/)) strength += 25;
    setPasswordStrength(strength);
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 25) return '#ef4444'; // Red
    if (passwordStrength <= 50) return '#f59e0b'; // Orange
    if (passwordStrength <= 75) return '#10b981'; // Green
    return '#3b82f6'; // Blue (Exceptional)
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const signupPayload = {
        ...formData,
        email: formData.email.toLowerCase().trim()
      };

      const { data } = await signup(signupPayload);
      alert(`✅ Account Verified: ${data.accountNumber}`);
      
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

  if (!showSplash && isAdminView) {
    return <AdminDashboard />;
  }

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
          transition: opacity 2s ease-in-out;
        }

        .slide.active { opacity: 1; }

        .overlay-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(2, 6, 23, 0.95));
          z-index: 1;
        }

        .splash-screen {
          position: relative;
          z-index: 10;
          text-align: center;
          color: white;
          animation: fadeIn 1s ease-in;
          padding: 20px;
        }

        .spinning-icon {
          font-size: 60px;
          margin-bottom: 20px;
          display: inline-block;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .logo-text {
          font-size: clamp(2.5rem, 8vw, 4rem);
          font-weight: 800;
          margin: 0;
          letter-spacing: -1px;
        }

        .auth-page {
          position: relative;
          z-index: 10;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-start; /* Better for mobile keyboard */
          align-items: center;
          padding: 40px 24px;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch; /* Smooth scroll for iOS */
        }

        .auth-card {
          background: rgba(255, 255, 255, 1);
          width: 100%;
          max-width: 440px;
          padding: 40px;
          border-radius: 28px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          text-align: center;
          animation: cardEntrance 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          margin-top: auto;
          margin-bottom: auto;
          flex-shrink: 0;
        }

        @keyframes cardEntrance {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
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

        .floating-input {
          position: relative;
          width: 100%;
        }

        .floating-input input {
          width: 100%;
          padding: 16px 20px;
          margin-bottom: 12px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          font-size: 16px; /* Prevents auto-zoom on iOS */
          outline: none;
          transition: all 0.2s;
          box-sizing: border-box;
          color: #1e293b;
          -webkit-appearance: none; /* Removes iOS input shadow */
        }

        .floating-input input:focus {
          border-color: #004da0;
          background: white;
          box-shadow: 0 0 0 4px rgba(0, 77, 160, 0.05);
        }

        .eye-toggle {
          position: absolute;
          right: 15px;
          top: 18px;
          cursor: pointer;
          color: #94a3b8;
          font-size: 18px;
          z-index: 5;
          padding: 5px; /* Larger touch area */
        }

        .strength-meter {
          height: 4px;
          width: 100%;
          background: #f1f5f9;
          border-radius: 2px;
          margin: -4px 0 15px 0;
          overflow: hidden;
          display: ${formData.password.length > 0 ? 'block' : 'none'};
          animation: fadeIn 0.3s ease;
        }

        .strength-bar {
          height: 100%;
          transition: all 0.4s ease;
        }

        .submit-btn.primary {
          width: 100%;
          padding: 18px; /* Slightly taller for mobile thumbs */
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
          -webkit-tap-highlight-color: transparent;
        }

        .submit-btn.primary:active {
          transform: scale(0.98);
          background: #003a7a;
        }

        .login-link-btn {
          background: #f1f5f9;
          border: none;
          color: #004da0;
          width: 100%;
          padding: 16px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          margin-top: 8px;
          transition: 0.2s;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.85);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 100;
          padding: 20px;
          backdrop-filter: blur(5px);
        }

        @media (max-width: 480px) {
          .auth-card {
            padding: 32px 20px;
            max-width: 100%;
            border-radius: 24px;
          }
          .logo-text { font-size: 2.2rem; }
          .auth-page { padding: 20px 16px; padding-bottom: calc(20px + env(safe-area-inset-bottom)); }
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

      {showSplash ? (
        <div className="splash-screen">
          <div className="splash-content">
            <div className="spinning-icon">🏦</div>
            <h1 className="logo-text">IBK FINANCE</h1>
            <h2 className="bank-subtitle" style={{color: 'rgba(255,255,255,0.7)', letterSpacing: '4px', fontSize: '14px', fontWeight: 600, marginTop: '10px'}}>INDUSTRIAL BANK OF KOREA</h2>
            <div className="korean-badge" style={{background: '#00a0e9', padding: '5px 20px', borderRadius: '8px', display: 'inline-block', margin: '30px 0'}}>
              <p className="korean-text" style={{fontWeight: 600, margin: 0, fontSize: '13px'}}>기업은행</p>
            </div>
            <div className="loading-dots">
              <p style={{color: '#fff', opacity: 0.6, fontSize: '11px', letterSpacing: '1px'}}>SECURE CONNECTION ESTABLISHED</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="auth-page">
          {modalView === 'forgot' && (
            <div className="modal-overlay" onClick={() => setModalView('none')}>
              <div className="auth-card" onClick={e => e.stopPropagation()}>
                <div className="bank-icon-header">🔑</div>
                <h1 style={{fontSize: '1.5rem', color: '#0f172a', fontWeight: 800, margin: '0 0 8px 0'}}>Reset Access</h1>
                <p style={{color: '#64748b', fontSize: '14px', marginBottom: '24px'}}>Enter your email for a recovery link.</p>
                <form onSubmit={handleResetSubmit}>
                  <div className="floating-input">
                    <input 
                      type="email" placeholder="Email Address" required 
                      value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="submit-btn primary">SEND LINK</button>
                  <p onClick={() => setModalView('none')} style={{marginTop: '24px', cursor: 'pointer', color: '#64748b', fontWeight: 700, fontSize: '13px', padding: '10px'}}>GO BACK</p>
                </form>
              </div>
            </div>
          )}

          <div className="auth-card">
            <div className="bank-icon-header">🏛️</div>
            
            <div className="auth-header">
              <h1 style={{fontSize: '1.8rem', color: '#0f172a', margin: '0 0 8px 0', fontWeight: 800, letterSpacing: '-0.5px'}}>Create Account</h1>
              <p style={{color: '#64748b', fontSize: '14px', marginBottom: '32px', fontWeight: 500}}>Join the global industrial network.</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="floating-input">
                <input type="text" placeholder="Full Name" required 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="floating-input">
                <input type="email" placeholder="Email Address" required 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="floating-input">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Secure Password" required 
                  value={formData.password}
                  onChange={handlePasswordChange} 
                />
                <span className="eye-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "👁️‍🗨️" : "👁️"}
                </span>
              </div>

              <div className="strength-meter">
                <div 
                  className="strength-bar" 
                  style={{ width: `${passwordStrength}%`, backgroundColor: getStrengthColor() }}
                ></div>
              </div>

              <div style={{textAlign: 'right', margin: '-4px 0 20px 0', fontSize: '13px', color: '#64748b', fontWeight: 500, cursor: 'pointer', padding: '10px 0'}} onClick={() => setModalView('forgot')}>
                Forgot Password?
              </div>
              
              <button type="submit" disabled={loading} className="submit-btn primary">
                {loading ? "VERIFYING..." : "SIGN UP"}
              </button>
            </form>

            <div style={{marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '24px'}}>
              <p style={{color: '#64748b', fontSize: '13px', marginBottom: '16px', fontWeight: 500}}>Already an IBK Member?</p>
              <button className="login-link-btn" type="button" onClick={() => setIsLoginView(true)}>
                LOG IN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;