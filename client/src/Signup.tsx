import React, { useState, useEffect, useRef } from 'react';
import { signup } from './api';
import Login from './Login'; 
import AdminDashboard from './AdminDashboard'; 

const images = ['/k1.jpg', '/k2.jpg', '/k3.jpg', '/k4.jpg'];

const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast",
  "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
  "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen",
  "Zambia", "Zimbabwe"
];

interface SignupProps {
  setUser: (user: any) => void;
}

const Signup = ({ setUser }: SignupProps) => { 
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '',
    country: '',
    accountType: 'Savings',
    password: '',
    agreedToTerms: false
  });

  const [loading, setLoading] = useState(false);
  const [showSplash] = useState(false); 
  const [currentImg, setCurrentImg] = useState(0);
  
  const [modalView, setModalView] = useState<'none' | 'forgot'>('none');
  const [resetEmail, setResetEmail] = useState('');
  const [isLoginView, setIsLoginView] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isShaking, setIsShaking] = useState(false); 

  // Searchable Country State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = countries.filter(c => 
    c.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const selectCountry = (country: string) => {
    setFormData({ ...formData, country });
    setCountrySearch('');
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const imgInterval = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(imgInterval);
  }, []);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData({ ...formData, password: val });

    let strength = 0;
    if (val.length > 5) strength += 25;
    if (val.match(/[A-Z]/)) strength += 25;
    if (val.match(/[0-9]/)) strength += 25;
    if (val.match(/[^A-Za-z0-9]/)) strength += 25;
    setPasswordStrength(strength);
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 25) return '#ef4444'; 
    if (passwordStrength <= 50) return '#f59e0b'; 
    if (passwordStrength <= 75) return '#10b981'; 
    return '#3b82f6'; 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreedToTerms) {
      alert("Please agree to the Terms of Service to continue.");
      return;
    }

    if (!formData.country) {
      alert("Please select your country of residence.");
      return;
    }

    setLoading(true);
    try {
      const signupPayload = {
        ...formData,
        email: formData.email.toLowerCase().trim()
      };

      const { data } = await signup(signupPayload);
      
      // Updated message as requested
      alert(`🎉 Congratulations account created! \nYour Account Number: ${data.accountNumber}`);
      
      if (data.role === 'admin') {
        setIsAdminView(true);
      } else {
        setIsLoginView(true);
      }
    } catch (err: any) {
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]); 
      }
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500); 

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
          background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(2, 6, 23, 0.9));
          z-index: 1;
        }

        .auth-page {
          position: relative;
          z-index: 10;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
          padding: 40px 20px;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        .auth-card {
          background: #ffffff;
          width: 100%;
          max-width: 440px;
          padding: 32px 24px;
          border-radius: 28px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          text-align: center;
          animation: cardEntrance 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
          margin-bottom: 40px;
        }

        .shake-effect {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
          border: 1px solid #ef4444;
        }

        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }

        @keyframes cardEntrance {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
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
          margin: 0 auto 16px;
          font-size: 24px;
          box-shadow: 0 10px 15px -3px rgba(0, 77, 160, 0.3);
        }

        .floating-input {
          position: relative;
          width: 100%;
          margin-bottom: 12px;
          text-align: left;
        }

        .floating-input label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: #64748b;
          margin-bottom: 6px;
          margin-left: 4px;
          text-transform: uppercase;
        }

        .floating-input input, .floating-input select {
          width: 100%;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          font-size: 16px;
          outline: none;
          transition: all 0.2s;
          box-sizing: border-box;
          color: #1e293b;
          font-family: inherit;
        }

        .select-trigger {
          width: 100%;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .search-dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          margin-top: 5px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
          z-index: 100;
          max-height: 250px;
          overflow-y: auto;
          animation: slideIn 0.2s ease-out;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .search-input-field {
          width: calc(100% - 20px) !important;
          margin: 10px auto !important;
          display: block;
          padding: 10px !important;
          border-radius: 8px !important;
          font-size: 14px !important;
        }

        .country-option {
          padding: 12px 16px;
          cursor: pointer;
          font-size: 14px;
          color: #1e293b;
          transition: background 0.2s;
        }

        .country-option:hover {
          background: #f1f5f9;
        }

        .floating-input input:focus {
          border-color: #004da0;
          background: white;
          box-shadow: 0 0 0 4px rgba(0, 77, 160, 0.05);
        }

        .eye-toggle {
          position: absolute;
          right: 12px;
          bottom: 12px;
          cursor: pointer;
          color: #94a3b8;
          font-size: 18px;
          z-index: 5;
          padding: 4px;
        }

        .strength-meter {
          height: 4px;
          width: 100%;
          background: #f1f5f9;
          border-radius: 2px;
          margin: -4px 0 15px 0;
          overflow: hidden;
          display: ${formData.password.length > 0 ? 'block' : 'none'};
        }

        .strength-bar {
          height: 100%;
          transition: all 0.4s ease;
        }

        .checkbox-container {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          text-align: left;
          margin: 15px 0;
          cursor: pointer;
        }

        .checkbox-container input {
          margin-top: 3px;
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .checkbox-container span {
          font-size: 13px;
          color: #64748b;
          line-height: 1.4;
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

        .submit-btn.primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-link-btn {
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
          .auth-page { padding: 20px 15px; }
          .auth-card { 
            padding: 24px 20px; 
            border-radius: 24px;
          }
          .bank-icon-header { width: 44px; height: 44px; font-size: 20px; }
          h1 { font-size: 1.5rem !important; }
        }
      `}</style>

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
          <div className="modal-overlay" onClick={() => setModalView('none')}>
            <div className={`auth-card ${isShaking ? 'shake-effect' : ''}`} onClick={e => e.stopPropagation()}>
              <div className="bank-icon-header">🔑</div>
              <h1 style={{fontSize: '1.4rem', color: '#0f172a', fontWeight: 800, margin: '0 0 8px 0'}}>Reset Access</h1>
              <p style={{color: '#64748b', fontSize: '13px', marginBottom: '24px'}}>Enter email for a recovery link.</p>
              <form onSubmit={handleResetSubmit}>
                <div className="floating-input">
                  <input 
                    type="email" placeholder="Email Address" required 
                    value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                  />
                </div>
                <button type="submit" className="submit-btn primary">SEND LINK</button>
                <p onClick={() => setModalView('none')} style={{marginTop: '20px', cursor: 'pointer', color: '#64748b', fontWeight: 700, fontSize: '13px'}}>GO BACK</p>
              </form>
            </div>
          </div>
        )}

        <div className={`auth-card ${isShaking ? 'shake-effect' : ''}`}>
          <div className="bank-icon-header">🏦</div>
          
          <div className="auth-header">
            <h1 style={{fontSize: '1.7rem', color: '#0f172a', margin: '0 0 4px 0', fontWeight: 800, letterSpacing: '-0.5px'}}>Open Account</h1>
            <p style={{color: '#64748b', fontSize: '14px', marginBottom: '24px', fontWeight: 500}}>Complete the form below to join our digital bank.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="floating-input">
              <label>Full Name</label>
              <input type="text" placeholder="e.g. John Doe" required 
                onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>

            <div className="floating-input">
              <label>Email Address</label>
              <input type="email" placeholder="name@example.com" required 
                onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>

            <div className="floating-input">
              <label>Phone Number</label>
              <input type="tel" placeholder="+1 (555) 000-0000" required 
                onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            </div>

            {/* Searchable Country Dropdown */}
            <div className="floating-input" ref={dropdownRef}>
              <label>Country of Residence</label>
              <div 
                className="select-trigger" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{ border: formData.country ? '1px solid #004da0' : '1px solid #e2e8f0' }}
              >
                <span style={{ color: formData.country ? '#1e293b' : '#94a3b8' }}>
                  {formData.country || "Select your country"}
                </span>
                <span>{isDropdownOpen ? '▲' : '▼'}</span>
              </div>
              
              {isDropdownOpen && (
                <div className="search-dropdown-menu">
                  <input 
                    autoFocus
                    type="text" 
                    className="search-input-field" 
                    placeholder="Search country..." 
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="options-list">
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((country) => (
                        <div 
                          key={country} 
                          className="country-option"
                          onClick={() => selectCountry(country)}
                        >
                          {country}
                        </div>
                      ))
                    ) : (
                      <div className="country-option" style={{ color: '#94a3b8', cursor: 'default' }}>No country found</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="floating-input">
              <label>Account Type</label>
              <select 
                value={formData.accountType}
                onChange={(e) => setFormData({...formData, accountType: e.target.value})}
                style={{ appearance: 'auto' }}
              >
                <option value="Savings">Savings Account</option>
                <option value="Checking">Checking Account</option>
                <option value="Business">Business Account</option>
                <option value="Fixed Deposit">Fixed Deposit</option>
              </select>
            </div>

            <div className="floating-input">
              <label>Secure Password</label>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" required 
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

            <label className="checkbox-container">
              <input 
                type="checkbox" 
                checked={formData.agreedToTerms} 
                onChange={(e) => setFormData({...formData, agreedToTerms: e.target.checked})}
              />
              <span>I agree to the Digital Banking Terms and Privacy Policy.</span>
            </label>
            
            <button type="submit" disabled={loading} className="submit-btn primary">
              {loading ? "PROCESSING..." : "REGISTER ACCOUNT"}
            </button>
          </form>

          <div style={{marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '20px'}}>
            <p style={{color: '#64748b', fontSize: '13px', marginBottom: '12px', fontWeight: 500}}>Already have an account?</p>
            <button className="login-link-btn" type="button" onClick={() => setIsLoginView(true)}>
              SIGN IN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;