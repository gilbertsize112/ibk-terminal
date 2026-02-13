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
    dateOfBirth: '',
    country: '',
    accountType: 'Savings',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
    newsletter: false
  });

  const [loading, setLoading] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);
  const [isLoginView, setIsLoginView] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isShaking, setIsShaking] = useState(false);

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
    if (val.length > 6) strength += 25;
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

  const validateForm = () => {
    if (!formData.name) {
      alert("Please enter your full name");
      return false;
    }
    if (!formData.email) {
      alert("Please enter your email");
      return false;
    }
    if (!formData.phone) {
      alert("Please enter your phone number");
      return false;
    }
    if (!formData.dateOfBirth) {
      alert("Please select your date of birth");
      return false;
    }
    if (!formData.country) {
      alert("Please select your country");
      return false;
    }
    if (formData.password.length < 8) {
      alert("Password must be at least 8 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return false;
    }
    if (!formData.agreedToTerms) {
      alert("Please agree to the Terms of Service");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    setLoading(true);
    try {
      const signupPayload = {
        name: formData.name,
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        country: formData.country,
        accountType: formData.accountType,
        password: formData.password,
        agreedToTerms: formData.agreedToTerms,
        newsletter: formData.newsletter
      };

      const { data } = await signup(signupPayload);
      
      alert(`🎉 Welcome to IBK Bank!\n\nYour Account Number: ${data.accountNumber}\n\nYour account is ready to use!`);
      
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
      alert(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isAdminView) {
    return <AdminDashboard />;
  }

  if (isLoginView) {
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

        /* --- SLIDESHOW STYLES --- */
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
          transition: opacity 2s ease-in-out;
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

        /* --- AUTH PAGE STYLES --- */
        .auth-page {
          position: relative;
          z-index: 10;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 24px;
          min-height: 100vh;
          padding-top: 40px;
          padding-bottom: 40px;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }

        .auth-card {
          background: rgba(15, 23, 42, 0.92);
          backdrop-filter: blur(20px);
          width: 100%;
          max-width: 480px;
          padding: 44px 32px;
          border-radius: 28px;
          box-shadow: 
            0 25px 50px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          text-align: center;
          border: 1px solid rgba(59, 130, 246, 0.2);
          animation: cardEntrance 0.9s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
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
          0% { 
            opacity: 0; 
            transform: scale(0.9) translateY(40px);
            filter: blur(10px);
          }
          100% { 
            opacity: 1; 
            transform: scale(1) translateY(0);
            filter: blur(0);
          }
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

        .bank-icon-header {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 28px;
          font-size: 40px;
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
          border-radius: 20px;
          animation: borderSpin 3s linear infinite;
        }

        @keyframes iconPulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 20px 40px rgba(59, 130, 246, 0.3);
          }
          50% { 
            transform: scale(1.08);
            box-shadow: 0 30px 60px rgba(59, 130, 246, 0.5);
          }
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

        .auth-header h1 {
          font-size: 2rem;
          color: #f1f5f9;
          margin: 0 0 12px 0;
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

        .progress-indicator {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          justify-content: center;
        }

        .progress-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(59, 130, 246, 0.3);
          transition: all 0.3s ease;
        }

        .progress-dot.active {
          background: #3b82f6;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.6);
        }

        .form-section {
          animation: formSlideIn 0.8s ease-out 0.3s both;
        }

        @keyframes formSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .floating-input {
          position: relative;
          width: 100%;
          margin-bottom: 16px;
          text-align: left;
          animation: inputFadeIn 0.6s ease-out forwards;
        }

        @keyframes inputFadeIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .floating-input label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: #94a3b8;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .floating-input input,
        .floating-input select {
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

        .select-trigger {
          width: 100%;
          padding: 14px 16px;
          border-radius: 12px;
          border: 2px solid rgba(59, 130, 246, 0.3);
          background: rgba(30, 58, 138, 0.3);
          font-size: 14px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #f1f5f9;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .select-trigger:hover {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.2);
        }

        .search-dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: rgba(15, 23, 42, 0.95);
          border: 2px solid rgba(59, 130, 246, 0.3);
          border-top: none;
          border-radius: 0 0 12px 12px;
          margin-top: 0;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
          z-index: 100;
          max-height: 250px;
          overflow-y: auto;
          backdrop-filter: blur(10px);
          animation: slideIn 0.2s ease-out;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .search-input-field {
          width: calc(100% - 20px) !important;
          margin: 10px auto !important;
          padding: 10px !important;
          border: 1px solid rgba(59, 130, 246, 0.4) !important;
          border-radius: 8px !important;
          background: rgba(59, 130, 246, 0.1) !important;
          font-size: 14px !important;
          color: #f1f5f9 !important;
        }

        .search-input-field::placeholder {
          color: #94a3b8 !important;
        }

        .country-option {
          padding: 12px 16px;
          cursor: pointer;
          font-size: 14px;
          color: #cbd5e1;
          transition: all 0.2s;
        }

        .country-option:hover {
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
          padding-left: 20px;
        }

        .eye-toggle {
          position: absolute;
          right: 14px;
          top: 40px;
          cursor: pointer;
          color: #94a3b8;
          font-size: 18px;
          z-index: 5;
          padding: 4px;
          transition: all 0.2s ease;
        }

        .eye-toggle:hover {
          color: #60a5fa;
          transform: scale(1.1);
        }

        .strength-meter {
          height: 4px;
          width: 100%;
          background: rgba(59, 130, 246, 0.2);
          border-radius: 2px;
          margin: -8px 0 16px 0;
          overflow: hidden;
          display: ${formData.password.length > 0 ? 'block' : 'none'};
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .strength-bar {
          height: 100%;
          transition: all 0.4s ease;
          box-shadow: 0 0 10px ${formData.password.length > 0 ? 'currentColor' : 'none'};
        }

        .checkbox-container {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          text-align: left;
          margin: 16px 0;
          cursor: pointer;
          animation: checkboxFadeIn 0.6s ease-out 0.4s both;
        }

        @keyframes checkboxFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .checkbox-container input {
          margin-top: 4px;
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #3b82f6;
        }

        .checkbox-container span {
          font-size: 12px;
          color: #cbd5e1;
          line-height: 1.4;
          font-weight: 500;
        }

        .submit-btn.primary {
          width: 100%;
          padding: 16px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 12px;
          letter-spacing: 1px;
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
          margin-top: 24px;
          border-top: 1px solid rgba(59, 130, 246, 0.2);
          padding-top: 24px;
          animation: footerSlideIn 0.8s ease-out 0.7s both;
        }

        @keyframes footerSlideIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .auth-footer p {
          color: #cbd5e1;
          font-size: 12px;
          margin-bottom: 14px;
          font-weight: 600;
        }

        .login-link-btn {
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

        .login-link-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(96, 165, 250, 0.1));
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }

        .login-link-btn:hover::before {
          transform: translateX(100%);
        }

        .login-link-btn:hover {
          border-color: rgba(96, 165, 250, 0.6);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.15);
        }

        .login-link-btn:active {
          transform: translateY(0);
        }

        .form-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent);
          margin: 20px 0;
        }

        .form-subtitle {
          font-size: 12px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 16px 0 12px 0;
          font-weight: 700;
        }

        /* --- MOBILE RESPONSIVE --- */
        @media (max-width: 640px) {
          .auth-card {
            padding: 32px 20px;
            max-width: 100%;
            margin: 20px 0;
            border-radius: 20px;
          }

          .auth-header h1 {
            font-size: 1.5rem;
          }

          .auth-header p {
            font-size: 13px;
          }

          .bank-icon-header {
            width: 60px;
            height: 60px;
            font-size: 32px;
            margin: 0 auto 18px;
          }

          .floating-input {
            margin-bottom: 12px;
          }

          .floating-input input,
          .floating-input select {
            padding: 12px 14px;
            font-size: 13px;
            border-radius: 10px;
          }

          .submit-btn.primary {
            padding: 12px;
            font-size: 13px;
            margin-top: 8px;
          }

          .auth-footer p {
            font-size: 11px;
          }

          .login-link-btn {
            padding: 11px;
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .auth-page {
            padding: 16px;
            padding-top: 30px;
            padding-bottom: 30px;
          }

          .auth-card {
            padding: 24px 16px;
            border-radius: 16px;
          }

          .auth-header h1 {
            font-size: 1.3rem;
          }

          .auth-header p {
            font-size: 12px;
          }

          .bank-icon-header {
            width: 55px;
            height: 55px;
            font-size: 28px;
            margin: 0 auto 16px;
          }

          .floating-input {
            margin-bottom: 10px;
          }

          .floating-input label {
            font-size: 10px;
          }

          .floating-input input,
          .floating-input select {
            padding: 11px 12px;
            font-size: 12px;
            border-radius: 8px;
          }

          .submit-btn.primary {
            padding: 11px;
            font-size: 12px;
          }

          .checkbox-container span {
            font-size: 11px;
          }

          .form-subtitle {
            font-size: 10px;
            margin: 12px 0 8px 0;
          }
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
        <div className={`auth-card ${isShaking ? 'shake-effect' : ''}`}>
          <div className="bank-icon-header" style={{ position: 'relative', zIndex: 2 }}>🏦</div>
          
          <div className="auth-header">
            <h1>Open Your Account</h1>
            <p>Join thousands of happy customers managing their finances with IBK Bank</p>
          </div>

          <div className="progress-indicator">
            <div className="progress-dot active"></div>
            <div className={`progress-dot ${formData.name && formData.email ? 'active' : ''}`}></div>
            <div className={`progress-dot ${formData.password ? 'active' : ''}`}></div>
          </div>

          <form onSubmit={handleSubmit} className="form-section">
            {/* PERSONAL INFORMATION */}
            <p className="form-subtitle">📋 Personal Information</p>

            <div className="floating-input">
              <label>Full Name</label>
              <input 
                type="text" 
                placeholder="e.g. John Doe" 
                required 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </div>

            <div className="floating-input">
              <label>Email Address</label>
              <input 
                type="email" 
                placeholder="name@example.com" 
                required 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
              />
            </div>

            <div className="floating-input">
              <label>Phone Number</label>
              <input 
                type="tel" 
                placeholder="+1 (555) 000-0000" 
                required 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})} 
              />
            </div>

            <div className="floating-input">
              <label>Date of Birth</label>
              <input 
                type="date" 
                required 
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} 
              />
            </div>

            <div className="form-divider"></div>

            {/* ACCOUNT DETAILS */}
            <p className="form-subtitle">🌍 Location & Account Type</p>

            <div className="floating-input" ref={dropdownRef}>
              <label>Country of Residence</label>
              <div 
                className="select-trigger" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span style={{ color: formData.country ? '#f1f5f9' : '#94a3b8' }}>
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
              >
                <option value="Savings">💰 Savings Account</option>
                <option value="Checking">💳 Checking Account</option>
                <option value="Business">🏢 Business Account</option>
                <option value="Fixed Deposit">📈 Fixed Deposit</option>
              </select>
            </div>

            <div className="form-divider"></div>

            {/* SECURITY */}
            <p className="form-subtitle">🔐 Security Settings</p>

            <div className="floating-input">
              <label>Create Password</label>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                required 
                value={formData.password}
                onChange={handlePasswordChange} 
              />
              <span className="eye-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </span>
            </div>

            <div className="strength-meter">
              <div 
                className="strength-bar" 
                style={{ width: `${passwordStrength}%`, backgroundColor: getStrengthColor() }}
              ></div>
            </div>

            <div className="floating-input">
              <label>Confirm Password</label>
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="••••••••" 
                required 
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
              />
              <span className="eye-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </span>
            </div>

            <div className="form-divider"></div>

            {/* AGREEMENTS */}
            <label className="checkbox-container">
              <input 
                type="checkbox" 
                checked={formData.agreedToTerms} 
                onChange={(e) => setFormData({...formData, agreedToTerms: e.target.checked})}
              />
              <span>I agree to the Digital Banking Terms, Conditions, and Privacy Policy</span>
            </label>

            <label className="checkbox-container">
              <input 
                type="checkbox" 
                checked={formData.newsletter} 
                onChange={(e) => setFormData({...formData, newsletter: e.target.checked})}
              />
              <span>Send me exclusive offers and banking updates</span>
            </label>
            
            <button type="submit" disabled={loading} className="submit-btn primary">
              {loading ? "⏳ CREATING ACCOUNT..." : "✓ CREATE MY ACCOUNT"}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account?</p>
            <button className="login-link-btn" type="button" onClick={() => setIsLoginView(true)}>
              SIGN IN HERE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;