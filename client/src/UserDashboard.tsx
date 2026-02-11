import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

const UserDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'transfer' | 'cards' | 'transactions'>('overview');
  const [pin, setPin] = useState(['', '', '', '']);
  const [showBalance, setShowBalance] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const navigate = useNavigate();
  const location = useLocation();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (location.pathname.includes('/transfer')) {
      setActiveTab('transfer');
    } else if (location.pathname.includes('/cards')) {
      setActiveTab('cards');
    } else if (location.pathname === '/dashboard') {
      if (activeTab !== 'security' && activeTab !== 'transactions') {
        setActiveTab('overview');
      }
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.replace('/');
  };

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const profileRes = await axios.get(`${API_BASE_URL}/api/user/profile`, config);
      setUser(profileRes.data);

      try {
        const transRes = await axios.get(`${API_BASE_URL}/api/user/transactions`, config);
        setTransactions(transRes.data);
      } catch (transErr) {
        setTransactions([]); 
      }
    } catch (err: any) {
      if (err.response?.status === 403) handleLogout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const filteredTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.createdAt);
    return txDate.getMonth() === selectedMonth;
  });

  const handlePinChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newPin = [...pin];
    newPin[index] = value.substring(value.length - 1);
    setPin(newPin);
    
    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleConfirmPin = async () => {
    const finalPin = pin.join('');
    if (finalPin.length !== 4) {
      alert("Security PIN must be exactly 4 numeric digits");
      return;
    }

    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.post(`${API_BASE_URL}/api/user/setup-pin`, { pin: finalPin }, config);
      
      if (response.data.success) {
        setShowSuccess(true); 
        setPin(['', '', '', '']);
        
        setTimeout(() => {
          setShowSuccess(false);
          setActiveTab('overview'); 
          navigate('/dashboard');
          fetchDashboardData();
        }, 2500);
      }
    } catch (error: any) {
      console.error("PIN Update Error:", error);
      alert(error.response?.data?.message || "Internal security failure during PIN setup");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleShareReceipt = async (tx: any) => {
    const shareData = {
      title: 'IBK Transaction Receipt',
      text: `Receipt for ${tx.description || 'Transfer'}\nAmount: $${tx.amount}\nRef: ${tx._id}\nStatus: Completed`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share failed', err);
      }
    } else {
      alert("Receipt details copied to clipboard!");
      navigator.clipboard.writeText(shareData.text);
    }
  };

  if (loading) return (
    <div style={{ height: '100vh', background: '#020617', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="loader"></div>
      <style>{`.loader { border: 3px solid rgba(59,130,246,0.1); border-top: 3px solid #3b82f6; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (user?.isFrozen) {
    return (
      <div style={{
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: '#020617',
        color: '#f8fafc',
        textAlign: 'center',
        padding: '20px',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          background: '#070c1b', 
          padding: '40px 20px', 
          borderRadius: '24px', 
          border: '1px solid rgba(239, 68, 68, 0.3)',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>⚠️</div>
          <h2 style={{ fontSize: '28px', color: '#ef4444', fontWeight: 800, margin: '0 0 10px 0', fontFamily: 'Plus Jakarta Sans' }}>Account Suspended</h2>
          <p style={{ color: '#94a3b8', lineHeight: '1.6', margin: '20px 0', fontSize: '15px' }}>
            Your account (Acc: <span style={{color: '#3b82f6', fontFamily: 'Space Mono'}}>{user.accountNumber}</span>) has been temporarily restricted by the IBK Compliance Team. 
            All outgoing transactions and fund access have been disabled.
          </p>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '14px' }}>
            Please contact <strong style={{color: 'white'}}>support@ibk-terminal.com</strong> to initiate the verification process.
          </div>
          <button 
            onClick={handleLogout}
            style={{ 
              marginTop: '30px', 
              padding: '14px 28px', 
              borderRadius: '12px', 
              border: 'none', 
              background: '#ef4444', 
              color: 'white', 
              fontWeight: 700,
              cursor: 'pointer',
              width: '100%'
            }}
          >
            SECURE LOGOUT
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;600;800&family=Space+Mono:wght@400;700&display=swap');

        .user-dashboard {
          min-height: 100vh;
          background: #020617;
          background-image: radial-gradient(circle at 50% 0%, #0f172a 0%, #020617 70%);
          color: #f8fafc;
          font-family: 'Inter', sans-serif;
          display: flex;
          width: 100%;
          overflow-x: hidden;
          position: relative;
        }

        /* Mobile menu overlay */
        .mobile-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(2, 6, 23, 0.95);
          backdrop-filter: blur(12px);
          z-index: 9998;
          display: none;
        }

        @media (max-width: 1024px) {
          .mobile-menu-overlay.active {
            display: block;
          }
        }

        .sidebar {
          width: 280px;
          background: rgba(7, 12, 27, 0.95);
          backdrop-filter: blur(12px);
          border-right: 1px solid rgba(255,255,255,0.05);
          padding: 40px 24px;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
          z-index: 1000;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @media (max-width: 1024px) { 
          .sidebar {
            position: fixed;
            left: 0;
            transform: translateX(-100%);
            box-shadow: 20px 0 50px rgba(0,0,0,0.7);
          }
          .sidebar.active {
            transform: translateX(0);
          }
        }

        .mobile-top-bar {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: rgba(7, 12, 27, 0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding: 16px 20px;
          z-index: 999;
          align-items: center;
          justify-content: space-between;
        }

        @media (max-width: 1024px) {
          .mobile-top-bar {
            display: flex;
          }
        }

        .mobile-menu-btn {
          width: 44px;
          height: 44px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: white;
          cursor: pointer;
          transition: 0.3s;
        }

        .mobile-menu-btn:hover {
          background: rgba(255,255,255,0.1);
        }

        .mobile-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(15, 23, 42, 0.98);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255,255,255,0.1);
          padding: 12px 10px;
          justify-content: space-around;
          align-items: center;
          z-index: 1000;
          box-shadow: 0 -20px 40px rgba(0,0,0,0.6);
        }

        @media (max-width: 1024px) {
          .mobile-nav { 
            display: flex; 
            height: 80px;
          }
          .main-content { 
            padding-top: 100px !important;
            padding-bottom: 100px !important;
          }
        }

        .mobile-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 10px;
          color: #94a3b8;
          gap: 6px;
          cursor: pointer;
          transition: 0.3s;
          flex: 1;
          padding: 8px 0;
        }
        .mobile-item span { 
          font-size: 20px; 
          margin-bottom: 2px;
        }
        .mobile-item.active { 
          color: #3b82f6; 
        }

        .nav-item {
          padding: 14px 18px;
          border-radius: 14px;
          margin-bottom: 8px;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 14px;
          font-weight: 500;
          font-size: 15px;
          user-select: none;
        }

        .nav-item:hover { background: rgba(255,255,255,0.05); color: white; transform: translateX(5px); }
        .nav-item.active { background: #3b82f6; color: white; box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3); }

        .main-content {
          flex: 1;
          padding: 40px 60px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }

        @media (max-width: 768px) {
          .main-content { 
            padding: 20px 20px;
            width: 100%;
            max-width: 100%;
          }
          header h1 { 
            font-size: 24px !important;
            margin-top: 0 !important;
          }
          .card-visual {
            max-width: 100% !important;
          }
          .top-section {
            gap: 20px !important;
          }
        }

        @media (max-width: 480px) {
          .main-content {
            padding: 16px 16px;
          }
          .card-visual {
            padding: 20px !important;
          }
          .balance-amount {
            font-size: 28px !important;
          }
          .action-btn {
            padding: 12px !important;
            font-size: 12px !important;
          }
          .tx-card {
            padding: 20px !important;
          }
          .receipt-item {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 4px !important;
          }
          .receipt-value {
            text-align: left !important;
          }
          .security-card {
            padding: 24px 16px !important;
          }
          .pin-input {
            height: 50px !important;
            font-size: 20px !important;
          }
        }

        .top-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
          margin-bottom: 40px;
        }

        @media (max-width: 1024px) { 
          .top-section { 
            grid-template-columns: 1fr; 
            gap: 20px;
            margin-top: 10px;
          } 
        }

        @media (max-width: 480px) {
          .top-section {
            gap: 16px;
            margin-bottom: 30px;
          }
        }

        .card-visual {
          width: 100%;
          max-width: 440px;
          aspect-ratio: 1.6 / 1;
          background: linear-gradient(135deg, #0f172a 0%, #020617 100%);
          border-radius: 20px;
          padding: 24px;
          position: relative;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          transition: 0.4s;
          box-sizing: border-box;
        }

        @media (max-width: 1024px) {
          .card-visual {
            max-width: 100%;
            aspect-ratio: 1.7 / 1;
          }
        }

        @media (max-width: 480px) {
          .card-visual {
            aspect-ratio: 1.8 / 1;
            padding: 20px;
            border-radius: 16px;
          }
          .card-number {
            font-size: 16px !important;
            letter-spacing: 2px !important;
          }
          .bank-name {
            font-size: 12px !important;
          }
        }

        .card-visual::before {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(from 0deg, transparent, rgba(59, 130, 246, 0.2), transparent);
          animation: rotate 6s linear infinite;
          pointer-events: none;
        }

        @keyframes rotate { 100% { transform: rotate(360deg); } }

        .card-visual:hover { transform: scale(1.02); border-color: rgba(59, 130, 246, 0.4); }

        .bank-name { 
          font-family: 'Plus Jakarta Sans'; 
          font-weight: 800; 
          font-size: 14px; 
          letter-spacing: 2px; 
          color: rgba(255,255,255,0.9); 
        }

        .card-chip { 
          width: 45px; 
          height: 35px; 
          background: linear-gradient(135deg, #d4af37, #f9e195, #b8860b);
          border-radius: 6px; 
          position: relative;
        }

        @media (max-width: 480px) {
          .card-chip {
            width: 40px;
            height: 30px;
          }
        }

        .card-number {
          font-family: 'Space Mono', monospace;
          font-size: 20px;
          letter-spacing: 3px;
          color: white;
          z-index: 2;
          word-break: break-all;
        }

        .balance-panel {
          background: rgba(15, 23, 42, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 24px;
          padding: 28px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 200px;
        }

        @media (max-width: 480px) {
          .balance-panel {
            padding: 20px;
            border-radius: 20px;
            min-height: 180px;
          }
        }

        .balance-amount { 
          font-size: 34px; 
          font-weight: 800; 
          letter-spacing: -1px; 
          margin: 10px 0 20px 0; 
          font-family: 'Plus Jakarta Sans';
          word-break: break-word;
        }

        @media (max-width: 768px) {
          .balance-amount {
            font-size: 30px;
          }
        }

        .action-btn {
          background: #3b82f6;
          color: white;
          padding: 14px;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 700;
          transition: 0.3s;
          border: none;
          box-shadow: 0 8px 16px rgba(59, 130, 246, 0.2);
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 44px;
        }

        .action-btn:hover { background: #2563eb; transform: translateY(-2px); }
        .action-btn.secondary { background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1); }

        @media (max-width: 480px) {
          .action-btn {
            padding: 12px;
            font-size: 12px;
            min-height: 40px;
          }
        }

        .tx-card {
          background: #070c1b;
          border-radius: 28px;
          border: 1px solid rgba(255,255,255,0.05);
          padding: 30px;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .tx-card {
            border-radius: 20px;
            padding: 24px;
          }
        }

        @media (max-width: 480px) {
          .tx-card {
            padding: 20px;
            border-radius: 16px;
          }
        }

        .tx-row {
          display: flex; 
          justify-content: space-between; 
          align-items: center;
          padding: 16px; 
          border-radius: 18px; 
          margin-bottom: 8px;
          transition: 0.2s;
          cursor: pointer;
          gap: 12px;
        }

        @media (max-width: 480px) {
          .tx-row {
            padding: 12px;
            border-radius: 14px;
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          .tx-row > div:last-child {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
        }

        .tx-row:hover { background: rgba(255,255,255,0.03); transform: scale(1.01); }

        .receipt-detail-box {
           background: rgba(255,255,255,0.02);
           border-radius: 16px;
           padding: 20px;
           margin: 20px 0;
           border: 1px dashed rgba(255,255,255,0.1);
           overflow-wrap: break-word;
        }

        @media (max-width: 480px) {
          .receipt-detail-box {
            padding: 16px;
            margin: 16px 0;
          }
        }

        .receipt-item {
           display: flex;
           justify-content: space-between;
           margin-bottom: 12px;
           font-size: 13px;
           align-items: flex-start;
           gap: 10px;
        }

        @media (max-width: 480px) {
          .receipt-item {
            flex-direction: column;
            gap: 4px;
            margin-bottom: 16px;
          }
        }

        .receipt-label { 
          color: #64748b; 
          min-width: 120px;
        }
        .receipt-value { 
          color: white; 
          font-weight: 600; 
          text-align: right;
          flex: 1;
          word-break: break-word;
        }

        @media (max-width: 480px) {
          .receipt-label {
            min-width: auto;
          }
          .receipt-value {
            text-align: left;
            width: 100%;
          }
        }

        .premium-badge {
          display: inline-flex; 
          align-items: center; 
          gap: 6px;
          background: linear-gradient(90deg, #fde68a, #f59e0b);
          color: #78350f; 
          font-size: 10px; 
          font-weight: 800;
          padding: 4px 10px; 
          border-radius: 20px; 
          text-transform: uppercase;
        }

        .pin-input {
          outline: none;
          text-align: center;
          border-radius: 12px;
          color: white;
          transition: all 0.3s;
          -webkit-appearance: none;
          width: 100%;
          max-width: 60px;
          border: 2px solid rgba(255,255,255,0.1);
          background: rgba(2, 6, 23, 0.8);
        }

        @media (max-width: 480px) {
          .pin-input {
            max-width: 50px;
            height: 50px;
            font-size: 20px;
          }
        }

        .pin-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .month-selector {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding: 10px 0 20px 0;
          scrollbar-width: none; 
          -webkit-overflow-scrolling: touch;
        }
        .month-selector::-webkit-scrollbar { display: none; } 

        .month-pill {
          padding: 10px 24px;
          border-radius: 20px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          color: #94a3b8;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          white-space: nowrap;
          transition: 0.3s;
          flex-shrink: 0;
        }

        @media (max-width: 480px) {
          .month-pill {
            padding: 8px 16px;
            font-size: 13px;
          }
        }

        .month-pill.active {
          background: #3b82f6;
          color: white;
          box-shadow: 0 8px 16px rgba(59, 130, 246, 0.2);
        }

        /* Modal responsiveness */
        .modal-content {
          width: 100%;
          max-width: 420px;
          margin: 20px;
          overflow-y: auto;
          max-height: calc(100vh - 40px);
        }

        @media (max-width: 480px) {
          .modal-content {
            max-width: 95%;
            margin: 10px;
            max-height: calc(100vh - 20px);
          }
        }

        /* Security grid responsiveness */
        .security-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 15px;
        }

        @media (max-width: 480px) {
          .security-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
        }

        /* Hide scrollbars but keep functionality */
        * {
          -webkit-tap-highlight-color: transparent;
        }

        /* Touch-friendly improvements */
        button, .nav-item, .mobile-item, .month-pill, .tx-row {
          touch-action: manipulation;
        }

        /* Font size adjustments for mobile */
        @media (max-width: 360px) {
          html {
            font-size: 14px;
          }
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideInFromLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
      `}</style>

      {showSuccess && (
        <div style={{
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%',
          background: 'rgba(2, 6, 23, 0.95)', 
          backdropFilter: 'blur(12px)',
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 9999, 
          animation: 'fadeIn 0.5s ease'
        }}>
          <div style={{ fontSize: '60px' }}>✅</div>
          <h2 style={{ 
            marginTop: '30px', 
            fontFamily: 'Plus Jakarta Sans', 
            fontWeight: 800, 
            color: 'white', 
            letterSpacing: '2px', 
            textAlign: 'center',
            padding: '0 20px'
          }}>
            SECURITY ESTABLISHED
          </h2>
          <p style={{ color: '#94a3b8', marginTop: '10px', textAlign: 'center', padding: '0 20px' }}>
            Transaction PIN activated successfully.
          </p>
        </div>
      )}

      {selectedTx && (
        <div className="modal-overlay" style={{
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          background: 'rgba(0,0,0,0.9)', 
          backdropFilter: 'blur(10px)', 
          zIndex: 2000, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '20px'
        }} onClick={() => setSelectedTx(null)}>
          <div className="modal-content" style={{
            background: '#0a0f1e', 
            borderRadius: '32px', 
            width: '100%', 
            maxWidth: '420px', 
            border: '1px solid rgba(255,255,255,0.1)', 
            overflow: 'hidden', 
            animation: 'slideUp 0.4s ease-out'
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              background: 'linear-gradient(to bottom, rgba(59,130,246,0.1), transparent)', 
              padding: '40px 30px 20px'
            }}>
              <div style={{
                width: '64px', 
                height: '64px', 
                borderRadius: '20px', 
                background: selectedTx.type === 'credit' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', 
                color: selectedTx.type === 'credit' ? '#22c55e' : '#ef4444', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '28px', 
                margin: '0 auto 16px', 
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                {selectedTx.type === 'credit' ? '↓' : '↑'}
              </div>
              <h2 style={{ 
                textAlign: 'center', 
                margin: '0 0 8px 0', 
                fontSize: '24px', 
                fontWeight: 800,
                padding: '0 10px'
              }}>
                Transaction Receipt
              </h2>
              <div style={{ 
                textAlign: 'center', 
                color: '#64748b', 
                fontSize: '13px', 
                fontFamily: 'Space Mono',
                wordBreak: 'break-all',
                padding: '0 10px'
              }}>
                REF: {selectedTx._id.toUpperCase()}
              </div>
            </div>

            <div style={{ padding: '0 30px 30px' }}>
              <div className="receipt-detail-box">
                <div className="receipt-item">
                  <span className="receipt-label">Description</span>
                  <span className="receipt-value">{selectedTx.description || 'Electronic Funds Transfer'}</span>
                </div>
                <div className="receipt-item">
                  <span className="receipt-label">Account Name</span>
                  <span className="receipt-value">{user?.name}</span>
                </div>
                <div className="receipt-item">
                  <span className="receipt-label">Date & Time</span>
                  <span className="receipt-value">{new Date(selectedTx.createdAt).toLocaleString()}</span>
                </div>
                <div className="receipt-item">
                  <span className="receipt-label">Status</span>
                  <span className="receipt-value" style={{color: '#22c55e'}}>SUCCESSFUL</span>
                </div>
                <div style={{ 
                  marginTop: '20px', 
                  paddingTop: '15px', 
                  borderTop: '1px solid rgba(255,255,255,0.05)', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <span style={{color: '#94a3b8', fontSize: '14px'}}>Total Amount</span>
                  <span style={{ fontSize: '22px', fontWeight: 900, color: selectedTx.type === 'credit' ? '#22c55e' : 'white' }}>
                    {selectedTx.type === 'credit' ? '+' : '-'}${selectedTx.amount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '12px',
                marginTop: '20px'
              }}>
                <button className="action-btn secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => handleShareReceipt(selectedTx)}>
                  <span>🔗</span> Share
                </button>
                <button className="action-btn" onClick={() => setSelectedTx(null)}>
                  Close
                </button>
              </div>
              
              <p style={{ 
                textAlign: 'center', 
                fontSize: '10px', 
                color: '#475569', 
                marginTop: '20px', 
                letterSpacing: '1px',
                padding: '0 10px'
              }}>
                OFFICIAL IBK DIGITAL RECEIPT • ENCRYPTED
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Top Bar */}
      <div className="mobile-top-bar">
        <button 
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
        >
          {sidebarOpen ? '✕' : '☰'}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '36px', 
            height: '36px', 
            background: 'linear-gradient(135deg, #3b82f6, #1e40af)', 
            borderRadius: '10px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontWeight: 'bold',
            fontSize: '18px'
          }}>
            I
          </div>
          <span style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.5px' }}>IBK BANK</span>
        </div>
        <div style={{ width: '44px' }}></div> {/* Spacer for alignment */}
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        className={`mobile-menu-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'active' : ''}`}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '14px', 
          marginBottom: '50px',
          paddingTop: '20px'
        }}>
          <div style={{ 
            width: '36px', 
            height: '36px', 
            background: 'linear-gradient(135deg, #3b82f6, #1e40af)', 
            borderRadius: '10px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontWeight: 'bold',
            fontSize: '18px'
          }}>
            I
          </div>
          <span style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-1px' }}>IBK BANK</span>
        </div>

        <div style={{ flex: 1 }}>
          <div 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} 
            onClick={() => { 
              setActiveTab('overview'); 
              navigate('/dashboard'); 
              setSidebarOpen(false);
            }}
          >
            <span>🏠</span> Overview
          </div>
          <div 
            className={`nav-item ${activeTab === 'transfer' ? 'active' : ''}`} 
            onClick={() => { 
              setActiveTab('transfer'); 
              navigate('/dashboard/transfer'); 
              setSidebarOpen(false);
            }}
          >
            <span>💸</span> Payments
          </div>
          <div 
            className={`nav-item ${activeTab === 'transactions' ? 'active' : ''}`} 
            onClick={() => { 
              setActiveTab('transactions'); 
              navigate('/dashboard'); 
              setSidebarOpen(false);
            }}
          >
            <span>📊</span> Transactions
          </div>
          <div 
            className={`nav-item ${activeTab === 'cards' ? 'active' : ''}`} 
            onClick={() => { 
              setActiveTab('cards'); 
              navigate('/dashboard/cards'); 
              setSidebarOpen(false);
            }}
          >
            <span>💳</span> My Cards
          </div>
          <div 
            className={`nav-item ${activeTab === 'security' ? 'active' : ''}`} 
            onClick={() => { 
              setActiveTab('security'); 
              navigate('/dashboard'); 
              setSidebarOpen(false);
            }}
          >
            <span>🛡️</span> Security
          </div>
        </div>

        <div style={{ 
          marginTop: 'auto', 
          background: 'rgba(255,255,255,0.03)', 
          borderRadius: '20px', 
          padding: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '12px', 
              background: '#3b82f6', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontWeight: 800,
              fontSize: '18px'
            }}>
              {user?.name?.[0]}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, wordBreak: 'break-word' }}>{user?.name}</div>
              <span className="premium-badge">ELITE</span>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            style={{ 
              width: '100%', 
              background: 'transparent', 
              border: '1px solid rgba(239,68,68,0.3)', 
              color: '#ef4444', 
              padding: '12px', 
              borderRadius: '10px', 
              cursor: 'pointer', 
              fontWeight: 600,
              fontSize: '14px'
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav">
        <div 
          className={`mobile-item ${activeTab === 'overview' ? 'active' : ''}`} 
          onClick={() => { setActiveTab('overview'); navigate('/dashboard'); }}
        >
          <span>🏠</span>Home
        </div>
        <div 
          className={`mobile-item ${activeTab === 'transfer' ? 'active' : ''}`} 
          onClick={() => { setActiveTab('transfer'); navigate('/dashboard/transfer'); }}
        >
          <span>💸</span>Send
        </div>
        <div 
          className={`mobile-item ${activeTab === 'transactions' ? 'active' : ''}`} 
          onClick={() => { setActiveTab('transactions'); navigate('/dashboard'); }}
        >
          <span>📊</span>History
        </div>
        <div 
          className={`mobile-item ${activeTab === 'cards' ? 'active' : ''}`} 
          onClick={() => { setActiveTab('cards'); navigate('/dashboard/cards'); }}
        >
          <span>💳</span>Cards
        </div>
        <div 
          className={`mobile-item ${activeTab === 'security' ? 'active' : ''}`} 
          onClick={() => { setActiveTab('security'); navigate('/dashboard'); }}
        >
          <span>🛡️</span>Safety
        </div>
      </nav>

      <main className="main-content">
        {activeTab === 'transfer' || activeTab === 'cards' ? (
          <Outlet context={{ user }} />
        ) : (
          <>
            <header style={{ marginBottom: '30px' }}>
              <h1 style={{ 
                fontSize: '28px', 
                fontWeight: 800, 
                letterSpacing: '-1px', 
                margin: '0 0 8px 0',
                lineHeight: '1.2'
              }}>
                {activeTab === 'overview' ? `Welcome, ${user?.name?.split(' ')[0]}!` : activeTab === 'transactions' ? 'Transaction History' : 'Security Hub'}
              </h1>
              <p style={{ 
                color: '#64748b', 
                fontSize: '15px', 
                margin: 0,
                lineHeight: '1.5'
              }}>
                {activeTab === 'overview' ? 'Current account snapshot.' : activeTab === 'transactions' ? 'Detailed record of your activity.' : 'Keep your assets protected.'}
              </p>
            </header>

            {activeTab === 'overview' && (
              <div className="top-section">
                <div className="card-visual">
                  <div style={{ 
                    position: 'relative', 
                    zIndex: 2, 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start' 
                  }}>
                    <span className="bank-name">IBK PREMIER</span>
                    <div className="card-chip"></div>
                  </div>
                  <div className="card-number">
                    {user?.accountNumber 
                      ? user.accountNumber.match(/.{1,4}/g).join(' ') 
                      : '•••• •••• •••• 7890'}
                  </div>
                  <div style={{ 
                    position: 'relative', 
                    zIndex: 2, 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-end',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <div>
                      <span style={{
                        fontSize: '9px', 
                        color: '#94a3b8', 
                        textTransform: 'uppercase', 
                        display: 'block'
                      }}>
                        Card Holder
                      </span>
                      <div style={{
                        fontWeight: 700, 
                        fontSize: '13px', 
                        textTransform: 'uppercase',
                        wordBreak: 'break-word'
                      }}>
                        {user?.name}
                      </div>
                    </div>
                    <div style={{textAlign: 'right'}}>
                      <div style={{
                        fontSize: '18px', 
                        fontWeight: 900, 
                        fontStyle: 'italic', 
                        color: '#fff'
                      }}>
                        VISA
                      </div>
                    </div>
                  </div>
                </div>

                <div className="balance-panel">
                  <div style={{
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <span style={{ 
                      color: '#94a3b8', 
                      fontWeight: 600, 
                      fontSize: '13px' 
                    }}>
                      Total Available Balance
                    </span>
                    <button 
                      onClick={() => setShowBalance(!showBalance)} 
                      style={{
                        background: 'none', 
                        border: 'none', 
                        color: '#3b82f6', 
                        cursor: 'pointer', 
                        fontSize: '12px',
                        padding: '4px 8px'
                      }}
                    >
                      {showBalance ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <h2 className="balance-amount">
                    {showBalance ? `$${user?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '••••••••'}
                  </h2>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '12px',
                    marginTop: 'auto'
                  }}>
                    <button 
                      className="action-btn" 
                      onClick={() => { 
                        setActiveTab('transfer'); 
                        navigate('/dashboard/transfer'); 
                      }}
                    >
                      <span>💸</span> Transfer
                    </button>
                    <button className="action-btn secondary">
                      <span>💰</span> Deposit
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="tx-card">
                <div style={{
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '15px',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Recent Activity</h3>
                  <span style={{ 
                    color: '#64748b', 
                    fontSize: '12px',
                    background: 'rgba(255,255,255,0.03)',
                    padding: '4px 12px',
                    borderRadius: '12px'
                  }}>
                    {months[selectedMonth]} {new Date().getFullYear()}
                  </span>
                </div>

                <div className="month-selector">
                  {months.map((month, idx) => (
                    <div 
                      key={month} 
                      className={`month-pill ${selectedMonth === idx ? 'active' : ''}`}
                      onClick={() => setSelectedMonth(idx)}
                    >
                      {month}
                    </div>
                  ))}
                </div>

                {filteredTransactions.length > 0 ? (
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {filteredTransactions.map((tx: any) => (
                      <div key={tx._id} className="tx-row" onClick={() => setSelectedTx(tx)}>
                        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flex: 1 }}>
                          <div style={{ 
                            width: '44px', 
                            height: '44px', 
                            background: tx.type === 'credit' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)', 
                            borderRadius: '14px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: tx.type === 'credit' ? '#22c55e' : '#94a3b8', 
                            fontSize: '18px',
                            flexShrink: 0
                          }}>
                            {tx.type === 'credit' ? '↓' : '↑'}
                          </div>
                          <div style={{ overflow: 'hidden', flex: 1 }}>
                            <div style={{ 
                              fontWeight: 700, 
                              fontSize: '14px', 
                              whiteSpace: 'nowrap', 
                              textOverflow: 'ellipsis', 
                              overflow: 'hidden',
                              marginBottom: '2px'
                            }}>
                              {tx.description || 'Electronic Transfer'}
                            </div>
                            <div style={{ 
                              fontSize: '11px', 
                              color: '#64748b'
                            }}>
                              {new Date(tx.createdAt).toLocaleDateString(undefined, {
                                month: 'short', 
                                day: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ 
                            fontWeight: 800, 
                            color: tx.type === 'credit' ? '#22c55e' : 'white', 
                            fontSize: '15px',
                            marginBottom: '2px'
                          }}>
                            {tx.type === 'credit' ? '+' : '-'}${tx.amount.toLocaleString()}
                          </div>
                          <div style={{
                            fontSize: '10px', 
                            color: '#22c55e',
                            background: 'rgba(34,197,94,0.1)',
                            padding: '2px 8px',
                            borderRadius: '8px',
                            display: 'inline-block'
                          }}>
                            Completed
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    color: '#64748b', 
                    padding: '40px 20px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '16px',
                    marginTop: '10px'
                  }}>
                    <div style={{ fontSize: '40px', marginBottom: '16px' }}>📊</div>
                    <p style={{ margin: 0, fontSize: '14px' }}>
                      No transactions in {months[selectedMonth]}.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'security' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="security-grid">
                  <div style={{ 
                    background: '#070c1b', 
                    padding: '20px', 
                    borderRadius: '20px', 
                    border: '1px solid rgba(255,255,255,0.05)',
                    minHeight: '120px'
                  }}>
                    <div style={{ 
                      color: '#3b82f6', 
                      marginBottom: '8px', 
                      fontSize: '10px', 
                      fontWeight: 700, 
                      textTransform: 'uppercase' 
                    }}>
                      Shield
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>2FA Auth</div>
                    <div style={{ 
                      color: user?.hasPin ? '#22c55e' : '#f59e0b', 
                      fontSize: '12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px' 
                    }}>
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: user?.hasPin ? '#22c55e' : '#f59e0b'
                      }}></span>
                      {user?.hasPin ? 'Active' : 'Setup Required'}
                    </div>
                  </div>
                  <div style={{ 
                    background: '#070c1b', 
                    padding: '20px', 
                    borderRadius: '20px', 
                    border: '1px solid rgba(255,255,255,0.05)',
                    minHeight: '120px'
                  }}>
                    <div style={{ 
                      color: '#3b82f6', 
                      marginBottom: '8px', 
                      fontSize: '10px', 
                      fontWeight: 700, 
                      textTransform: 'uppercase' 
                    }}>
                      Cipher
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>AES-256</div>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>Encrypted</div>
                  </div>
                  <div style={{ 
                    background: '#070c1b', 
                    padding: '20px', 
                    borderRadius: '20px', 
                    border: '1px solid rgba(255,255,255,0.05)',
                    minHeight: '120px'
                  }}>
                    <div style={{ 
                      color: '#3b82f6', 
                      marginBottom: '8px', 
                      fontSize: '10px', 
                      fontWeight: 700, 
                      textTransform: 'uppercase' 
                    }}>
                      Session
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>Active Now</div>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>This Device</div>
                  </div>
                </div>

                <div className="security-card" style={{
                  width: '100%', 
                  maxWidth: '500px', 
                  margin: '0 auto', 
                  background: '#070c1b', 
                  padding: '30px 20px', 
                  borderRadius: '32px', 
                  border: '1px solid rgba(255,255,255,0.05)', 
                  boxSizing: 'border-box'
                }}>
                  <div style={{textAlign: 'center', marginBottom: '24px'}}>
                    <div style={{fontSize: '40px', marginBottom: '12px'}}>🔐</div>
                    <h3 style={{ fontSize: '20px', margin: '0 0 6px 0', fontWeight: 700 }}>Transaction PIN</h3>
                    <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.5' }}>
                      Required for outgoing transfers and withdrawals.
                    </p>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    gap: '10px', 
                    justifyContent: 'center', 
                    marginBottom: '30px',
                    padding: '0 10px'
                  }}>
                    {pin.map((digit, i) => (
                      <input
                        key={i} 
                        id={`pin-${i}`} 
                        type="password" 
                        className="pin-input"
                        style={{
                          width: '100%', 
                          height: '60px', 
                          fontSize: '24px', 
                          background: '#020617', 
                          border: '2px solid rgba(255,255,255,0.1)',
                          maxWidth: '60px'
                        }}
                        value={digit} 
                        maxLength={1} 
                        onChange={(e) => handlePinChange(i, e.target.value)}
                        inputMode="numeric"
                        autoComplete="off"
                      />
                    ))}
                  </div>
                  <button 
                    className="action-btn" 
                    style={{ 
                      width: '100%', 
                      padding: '18px', 
                      opacity: isUpdating ? 0.7 : 1,
                      fontSize: '14px',
                      fontWeight: 700
                    }}
                    onClick={handleConfirmPin}
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'ENCRYPTING...' : 'UPDATE PIN'}
                  </button>
                  <p style={{
                    textAlign: 'center', 
                    color: '#475569', 
                    fontSize: '11px', 
                    marginTop: '20px',
                    lineHeight: '1.5'
                  }}>
                    Security Protocol: IBK-V2 Terminal • 256-bit Encryption
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;