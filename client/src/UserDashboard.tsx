import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { setupPin, fetchProfile, fetchTransactions } from './api/index';

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
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.includes('/transfer')) {
      setActiveTab('transfer');
    } else if (location.pathname.includes('/cards')) {
      setActiveTab('cards');
    } else if (location.pathname.includes('/receipt')) {
      setActiveTab('transactions');
    } else if (location.pathname === '/dashboard') {
      setActiveTab('overview');
    }
  }, [location.pathname]);

 const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      if (!token) { 
        if (isMounted) setLoading(false); 
        return; 
      }
      try {
        const profileRes = await fetchProfile();
        if (isMounted) {
          const userData = profileRes.data?.user || profileRes.data;
          setUser(userData);
        }
        try {
          const transRes = await fetchTransactions();
          if (isMounted) setTransactions(Array.isArray(transRes.data) ? transRes.data : transRes.data?.transactions || []);
        } catch (e) { 
          if (isMounted) setTransactions([]); 
        }
      } catch (err: any) {
        if (err.response?.status === 403) handleLogout();
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchDashboardData();
    return () => { isMounted = false; };
  }, []);

  const fetchDashboardDataManual = async () => {
    try {
      const profileRes = await fetchProfile();
      setUser(profileRes.data?.user || profileRes.data);
      const transRes = await fetchTransactions();
      setTransactions(Array.isArray(transRes.data) ? transRes.data : transRes.data?.transactions || []);
    } catch (err) {}
  };

  const filteredTransactions = Array.isArray(transactions) 
    ? transactions.filter(tx => {
        if (!tx?.createdAt) return false;
        return new Date(tx.createdAt).getMonth() === selectedMonth;
      })
    : [];

  const handlePinChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newPin = [...pin];
    newPin[index] = value.substring(value.length - 1);
    setPin(newPin);
    if (value && index < 3) document.getElementById(`pin-${index + 1}`)?.focus();
  };

  const handleConfirmPin = async () => {
    const finalPin = pin.join('');
    if (finalPin.length !== 4) { alert("PIN must be 4 digits"); return; }
    setIsUpdating(true);
    try {
      const response = await setupPin(finalPin);
      if (response.data.success) {
        setShowSuccess(true);
        setPin(['', '', '', '']);
        setTimeout(() => { 
          setShowSuccess(false); 
          setActiveTab('overview'); 
          navigate('/dashboard'); 
          fetchDashboardDataManual(); 
        }, 2500);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "PIN setup failed.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleShareReceipt = async (tx: any) => {
    const shareData = {
      title: 'IBK Transaction Receipt',
      text: `Receipt: ${tx.description}\nAmount: $${tx.amount}\nRef: ${tx._id}`,
      url: window.location.href
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { console.log('Share failed', err); }
    } else {
      navigator.clipboard.writeText(shareData.text);
      alert("Receipt copied!");
    }
  };

  if (loading) return (
    <div style={{ height: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <div style={{ width: '50px', height: '50px', border: '3px solid rgba(255,255,255,0.2)', borderTop: '3px solid #60a5fa', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 500 }}>Loading your account...</p>
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!user) return (
    <div style={{ height: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '80px', marginBottom: '20px', animation: 'float 3s ease-in-out infinite' }}>⚠️</div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '10px', color: '#f1f5f9' }}>Connection Error</h2>
        <p style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '24px' }}>Unable to load your account</p>
        <button onClick={() => window.location.reload()} style={{ padding: '12px 28px', background: '#60a5fa', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Refresh Page</button>
      </div>
      <style>{`@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }`}</style>
    </div>
  );

  if (user?.isFrozen) return (
    <div style={{ height: '100vh', background: 'linear-gradient(135deg, #7f1d1d 0%, #4c0519 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'rgba(255,255,255,0.95)', padding: '40px 24px', borderRadius: '16px', border: '2px solid #dc2626', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
        <div style={{ fontSize: '60px', marginBottom: '16px' }}>🔒</div>
        <h2 style={{ fontSize: '22px', color: '#dc2626', fontWeight: 700, margin: '0 0 12px 0' }}>Account Suspended</h2>
        <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '28px', fontSize: '14px' }}>Your account has been temporarily suspended. Please contact our support team.</p>
        <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '24px', fontWeight: 500 }}>support@ibk-terminal.com</p>
        <button onClick={handleLogout} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: '#dc2626', color: 'white', fontWeight: 700, cursor: 'pointer', width: '100%', fontSize: '14px' }}>LOGOUT</button>
      </div>
    </div>
  );

  const isViewingSubPage = location.pathname !== '/dashboard' && !location.pathname.endsWith('/dashboard/');

  return (
    <div style={{ 
      background: 'linear-gradient(to bottom, #0f172a 0%, #1a1f2e 50%, #0f172a 100%)',
      color: '#f1f5f9', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif', 
      minHeight: '100vh', 
      width: '100%',
      overflow: 'auto',
      overflowX: 'hidden',
      scrollBehavior: 'smooth'
    }}>
      <style>{`
        html, body { 
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow-x: hidden;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          background: linear-gradient(to bottom, #0f172a 0%, #1a1f2e 50%, #0f172a 100%);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
        }

        ::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 10px;
          opacity: 0.6;
        }

        ::-webkit-scrollbar-thumb:hover {
          opacity: 0.9;
        }

        scrollbar-color: #3b82f6 transparent;
        scrollbar-width: thin;

        body { background: linear-gradient(to bottom, #0f172a 0%, #1a1f2e 50%, #0f172a 100%); }
        
        button { 
          border: none; 
          border-radius: 10px; 
          font-weight: 600; 
          transition: all 0.3s ease; 
          font-size: 14px; 
          cursor: pointer; 
          touch-action: manipulation; 
          font-family: inherit;
        }
        
        button:active { transform: scale(0.97); }
        
        .btn-primary { 
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); 
          color: white; 
          padding: 12px 20px;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }
        
        .btn-primary:hover { 
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }
        
        .btn-secondary { 
          background: rgba(148, 163, 184, 0.2); 
          color: #e2e8f0; 
          padding: 10px 16px;
          border: 1px solid rgba(148, 163, 184, 0.3);
        }
        
        .btn-secondary:hover { 
          background: rgba(148, 163, 184, 0.3);
        }

        .btn-danger {
          background: rgba(220, 38, 38, 0.1);
          color: #fca5a5;
          border: 1px solid rgba(220, 38, 38, 0.3);
          padding: 10px 16px;
        }

        .btn-danger:hover {
          background: rgba(220, 38, 38, 0.2);
          border-color: rgba(220, 38, 38, 0.5);
        }
        
        .card-container { 
          background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 50%, #0f172a 100%);
          border-radius: 20px; 
          padding: 28px 24px; 
          color: white; 
          margin: 24px 16px 12px 16px; 
          box-shadow: 0 20px 40px rgba(30, 64, 175, 0.25), inset 0 1px 0 rgba(255,255,255,0.1);
          position: relative; 
          overflow: hidden;
          border: 1px solid rgba(96, 165, 250, 0.2);
        }

        .card-container::before { 
          content: ''; 
          position: absolute; 
          top: -40%; 
          right: -40%; 
          width: 400px; 
          height: 400px; 
          background: radial-gradient(circle, rgba(96, 165, 250, 0.15) 0%, transparent 70%); 
          border-radius: 50%; 
        }

        .card-container::after { 
          content: ''; 
          position: absolute; 
          bottom: -30%; 
          left: -30%; 
          width: 300px; 
          height: 300px; 
          background: radial-gradient(circle, rgba(30, 64, 175, 0.2) 0%, transparent 70%); 
          border-radius: 50%; 
        }
        
        .card-header { 
          position: relative; 
          z-index: 2; 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-start; 
          margin-bottom: 45px; 
        }

        .card-brand { 
          font-size: 13px; 
          font-weight: 700; 
          letter-spacing: 2px; 
          text-transform: uppercase; 
          opacity: 0.85;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .card-type {
          font-size: 14px;
          opacity: 0.7;
          margin-top: 6px;
          letter-spacing: 0.5px;
        }

        .card-chip { 
          width: 50px; 
          height: 35px; 
          background: linear-gradient(135deg, #fbbf24, #f97316); 
          border-radius: 8px; 
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.3);
        }
        
        .card-number { 
          font-size: 22px; 
          letter-spacing: 3px; 
          font-family: 'Courier New', monospace; 
          font-weight: 500; 
          margin: 25px 0; 
          position: relative; 
          z-index: 2;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .card-footer { 
          position: relative; 
          z-index: 2; 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-end; 
        }

        .card-holder-label { 
          font-size: 11px; 
          text-transform: uppercase; 
          letter-spacing: 1px; 
          opacity: 0.6; 
          margin-bottom: 4px;
          font-weight: 600;
        }

        .card-holder-name { 
          font-size: 14px; 
          font-weight: 700; 
          text-transform: uppercase; 
          letter-spacing: 0.5px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .card-visa { 
          font-size: 20px; 
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .section { margin: 24px 16px; }

        .section-title { 
          font-size: 18px; 
          font-weight: 800; 
          margin-bottom: 16px; 
          color: '#f1f5f9';
          letter-spacing: -0.5px;
        }
        
        .top-bar { 
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(10px);
          padding: 16px 16px; 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          border-bottom: 1px solid rgba(96, 165, 250, 0.1);
          position: sticky; 
          top: 0; 
          z-index: 50;
        }

        .top-bar-logo { 
          font-size: 13px; 
          font-weight: 900; 
          color: '#60a5fa'; 
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .top-bar-subtitle { 
          font-size: 11px; 
          color: '#94a3b8'; 
          font-weight: 500;
          letter-spacing: 0.5px;
          margin-top: 2px;
        }

        .top-bar-user { 
          font-size: 13px; 
          font-weight: 700; 
          color: '#f1f5f9';
          text-align: right;
        }

        .top-bar-greeting {
          font-size: 11px;
          color: '#94a3b8';
          font-weight: 500;
          margin-top: 2px;
        }

        .profile-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 20px;
          transition: all 0.3s ease;
          border: 2px solid rgba(96, 165, 250, 0.3);
          position: relative;
        }

        .profile-icon:hover {
          border-color: rgba(96, 165, 250, 0.6);
          transform: scale(1.05);
        }

        .profile-menu {
          position: fixed;
          top: 60px;
          right: 16px;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(96, 165, 250, 0.2);
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          z-index: 200;
          overflow: hidden;
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .profile-menu-item {
          padding: 14px 20px;
          color: '#e2e8f0';
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border-bottom: 1px solid rgba(96, 165, 250, 0.1);
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .profile-menu-item:last-child {
          border-bottom: none;
        }

        .profile-menu-item:hover {
          background: rgba(59, 130, 246, 0.1);
          color: '#60a5fa';
          padding-left: 24px;
        }

        .profile-menu-logout {
          color: '#fca5a5';
        }

        .profile-menu-logout:hover {
          background: rgba(220, 38, 38, 0.1);
          color: '#fca5a5';
        }
        
        .quick-actions { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 14px; 
        }

        .action-btn { 
          background: rgba(30, 58, 138, 0.4);
          border: 1px solid rgba(96, 165, 250, 0.2);
          padding: 24px 16px; 
          border-radius: 14px; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          gap: 10px; 
          cursor: pointer; 
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          backdrop-filter: blur(10px);
        }

        .action-btn:active { 
          transform: translateY(-4px); 
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.2);
        }

        .action-btn:hover {
          background: rgba(59, 130, 246, 0.15);
          border-color: rgba(96, 165, 250, 0.4);
        }

        .action-btn-icon { 
          font-size: 32px; 
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        }

        .action-btn-label { 
          font-size: 13px; 
          font-weight: 700; 
          color: '#e2e8f0'; 
          text-align: center;
          letter-spacing: -0.3px;
        }
        
        .transaction-item { 
          background: rgba(30, 58, 138, 0.2);
          border-radius: 12px; 
          padding: 16px; 
          margin-bottom: 10px; 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          border: 1px solid rgba(96, 165, 250, 0.15);
          cursor: pointer; 
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          backdrop-filter: blur(10px);
        }

        .transaction-item:active { 
          background: rgba(59, 130, 246, 0.15);
          transform: translateY(-2px);
        }

        .transaction-item:hover {
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(96, 165, 250, 0.3);
        }

        .tx-icon { 
          width: 44px; 
          height: 44px; 
          border-radius: 12px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-size: 20px; 
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .tx-icon.credit { 
          background: rgba(16, 185, 129, 0.2);
          color: '#6ee7b7';
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .tx-icon.debit { 
          background: rgba(239, 68, 68, 0.2);
          color: '#fca5a5';
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .tx-content { 
          flex: 1; 
          margin-left: 12px; 
        }

        .tx-desc { 
          font-size: 14px; 
          font-weight: 700; 
          color: '#f1f5f9';
        }

        .tx-date { 
          font-size: 12px; 
          color: '#94a3b8'; 
          margin-top: 4px;
        }

        .tx-amount { 
          font-weight: 700; 
          font-size: 15px;
        }

        .tx-amount.credit { 
          color: '#6ee7b7'; 
        }

        .tx-amount.debit { 
          color: '#fca5a5'; 
        }
        
        .month-filter { 
          display: flex; 
          gap: 10px; 
          overflow-x: auto; 
          padding: 0 16px 16px 16px; 
          scroll-behavior: smooth; 
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }

        .month-filter::-webkit-scrollbar {
          display: none;
        }

        .month-btn { 
          padding: 10px 16px; 
          border-radius: 20px; 
          background: rgba(30, 58, 138, 0.3);
          border: 1px solid rgba(96, 165, 250, 0.2);
          font-size: 12px; 
          font-weight: 700; 
          white-space: nowrap; 
          cursor: pointer; 
          transition: all 0.3s ease;
          color: '#cbd5e1';
        }

        .month-btn:hover {
          background: rgba(59, 130, 246, 0.2);
          border-color: rgba(96, 165, 250, 0.4);
        }

        .month-btn.active { 
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white; 
          border: none;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }
        
        .modal-overlay { 
          position: fixed; 
          inset: 0; 
          background: rgba(0,0,0,0.6); 
          backdrop-filter: blur(8px); 
          z-index: 2000; 
          display: flex; 
          align-items: flex-end; 
          justify-content: center;
        }

        .modal-sheet { 
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%);
          width: 100%; 
          max-width: 500px; 
          border-radius: 24px 24px 0 0; 
          padding: 24px 20px calc(24px + env(safe-area-inset-bottom)) 20px; 
          animation: slide-up 0.3s ease-out; 
          max-height: 90vh; 
          overflow-y: auto; 
          -webkit-overflow-scrolling: touch;
          border: 1px solid rgba(96, 165, 250, 0.1);
          box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
        }

        @keyframes slide-up { 
          from { transform: translateY(100%); } 
          to { transform: translateY(0); } 
        }
        
        .modal-handle { 
          width: 36px; 
          height: 4px; 
          background: rgba(148, 163, 184, 0.3); 
          border-radius: 2px; 
          margin: 0 auto 20px; 
        }
        
        .modal-content-item { 
          display: flex; 
          justify-content: space-between; 
          padding: 14px 0; 
          border-bottom: 1px solid rgba(96, 165, 250, 0.1);
        }

        .modal-content-item:last-child { 
          border-bottom: none; 
        }

        .modal-content-label { 
          color: '#94a3b8'; 
          font-size: 12px; 
          font-weight: 700; 
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .modal-content-value { 
          font-weight: 700; 
          font-size: 14px; 
          color: '#e2e8f0';
        }
        
        .pin-inputs { 
          display: flex; 
          gap: 14px; 
          justify-content: center; 
          margin: 32px 0; 
        }

        .pin-input { 
          width: 56px; 
          height: 56px; 
          text-align: center; 
          font-size: 24px; 
          border: 2px solid rgba(96, 165, 250, 0.3);
          border-radius: 12px; 
          background: rgba(30, 58, 138, 0.3);
          font-weight: 700;
          color: '#f1f5f9';
          transition: all 0.3s ease;
        }

        .pin-input:focus { 
          outline: none; 
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.2);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
        }
        
        .success-overlay { 
          position: fixed; 
          inset: 0; 
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          z-index: 9999; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: center; 
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn { 
          from { opacity: 0; } 
          to { opacity: 1; } 
        }
        
        .bottom-nav { 
          position: fixed; 
          bottom: 0; 
          left: 0; 
          right: 0; 
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(10px);
          border-top: 1px solid rgba(96, 165, 250, 0.1);
          display: flex; 
          justify-content: space-around; 
          padding: 8px 0 calc(8px + env(safe-area-inset-bottom)) 0; 
          z-index: 100;
        }

        .nav-item { 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          gap: 6px; 
          flex: 1; 
          padding: 12px 0; 
          cursor: pointer; 
          transition: all 0.2s ease;
          color: '#94a3b8'; 
          touch-action: manipulation;
        }

        .nav-item.active { 
          color: '#60a5fa';
        }

        .nav-item.active::before {
          content: '';
          position: absolute;
          top: 0;
          width: 40px;
          height: 3px;
          background: linear-gradient(90deg, #3b82f6, #60a5fa);
          border-radius: 2px;
        }

        .nav-icon { 
          font-size: 24px; 
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }

        .nav-label { 
          font-size: 10px; 
          font-weight: 700; 
          text-transform: uppercase; 
          letter-spacing: 0.5px;
        }
        
        .main-wrapper { 
          padding-bottom: 120px;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          overflow-x: hidden;
        }
        
        .balance-section { 
          background: linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%);
          margin: 16px 16px 0 16px; 
          padding: 24px; 
          border-radius: 16px; 
          border: 1px solid rgba(96, 165, 250, 0.2);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
          backdrop-filter: blur(10px);
        }

        .balance-label { 
          font-size: 12px; 
          color: '#94a3b8'; 
          font-weight: 700; 
          margin-bottom: 12px; 
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .balance-amount { 
          font-size: 36px; 
          font-weight: 900; 
          color: '#f1f5f9'; 
          margin-bottom: 0;
          letter-spacing: -1.5px;
        }
        
        .empty-state { 
          text-align: center; 
          padding: 60px 20px; 
        }

        .empty-state-icon { 
          font-size: 50px; 
          margin-bottom: 16px;
          filter: drop-shadow(0 2px 8px rgba(0,0,0,0.2));
        }

        .empty-state-text { 
          color: '#94a3b8'; 
          font-size: 14px;
          font-weight: 500;
        }
        
        @media (max-width: 640px) {
          .quick-actions { grid-template-columns: 1fr; }
          .section { margin: 20px 12px; }
          .card-container { margin: 20px 12px 8px 12px; }
        }
      `}</style>

      {/* SUCCESS OVERLAY */}
      {showSuccess && (
        <div className="success-overlay">
          <div style={{ fontSize: '70px', marginBottom: '24px', animation: 'bounce 0.6s ease-out' }}>✅</div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#f1f5f9', marginBottom: '8px' }}>PIN Activated</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 500 }}>Your transaction PIN is now secure</p>
          <style>{`@keyframes bounce { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }`}</style>
        </div>
      )}

      {/* TRANSACTION DETAILS MODAL */}
      {selectedTx && (
        <div className="modal-overlay" onClick={() => setSelectedTx(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', color: '#f1f5f9', letterSpacing: '-0.3px' }}>Transaction Details</h3>
            
            <div style={{ background: 'rgba(30, 58, 138, 0.3)', padding: '18px', borderRadius: '12px', marginBottom: '24px', border: '1px solid rgba(96, 165, 250, 0.1)' }}>
              <div className="modal-content-item">
                <span className="modal-content-label">Status</span>
                <span style={{ color: '#6ee7b7', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px' }}>✓</span> Success
                </span>
              </div>
              <div className="modal-content-item">
                <span className="modal-content-label">Type</span>
                <span className="modal-content-value" style={{ textTransform: 'capitalize' }}>{selectedTx.type}</span>
              </div>
              <div className="modal-content-item">
                <span className="modal-content-label">Description</span>
                <span className="modal-content-value">{selectedTx.description || 'Transfer'}</span>
              </div>
              <div className="modal-content-item">
                <span className="modal-content-label">Date</span>
                <span className="modal-content-value">{new Date(selectedTx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="modal-content-item">
                <span className="modal-content-label">Time</span>
                <span className="modal-content-value">{new Date(selectedTx.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="modal-content-item">
                <span className="modal-content-label">Amount</span>
                <span className="modal-content-value" style={{ color: selectedTx.type === 'credit' ? '#6ee7b7' : '#fca5a5', fontSize: '16px', fontWeight: 800 }}>
                  {selectedTx.type === 'credit' ? '+' : '-'}${selectedTx.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button className="btn-secondary" onClick={() => handleShareReceipt(selectedTx)} style={{ width: '100%', padding: '12px' }}>📤 Share</button>
              <button className="btn-primary" onClick={() => setSelectedTx(null)} style={{ width: '100%', padding: '12px' }}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE MENU */}
      {showLogoutMenu && (
        <div className="profile-menu">
          <div className="profile-menu-item" onClick={() => {
            setShowLogoutMenu(false);
            setActiveTab('security');
            navigate('/dashboard');
          }}>
            <span>🔒</span>
            Security
          </div>
          <div className="profile-menu-item" onClick={() => {
            setShowLogoutMenu(false);
            setActiveTab('overview');
            navigate('/dashboard');
          }}>
            <span>⚙️</span>
            Settings
          </div>
          <div className="profile-menu-item profile-menu-logout" onClick={() => {
            setShowLogoutMenu(false);
            handleLogout();
          }}>
            <span>🚪</span>
            Logout
          </div>
        </div>
      )}

      {/* TOP BAR */}
      <div className="top-bar">
        <div>
          <div className="top-bar-logo">🏦 IBK</div>
          <div className="top-bar-subtitle">Terminal</div>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <div className="top-bar-user">Hi, {user?.name?.split(' ')[0] || 'User'}</div>
            <div className="top-bar-greeting">Welcome back</div>
          </div>
          <div className="profile-icon" onClick={() => setShowLogoutMenu(!showLogoutMenu)}>
            👤
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-wrapper">
        {isViewingSubPage ? (
          <div>
            <Outlet context={{ user }} />
          </div>
        ) : (
          <>
            {/* CARD DISPLAY */}
            {activeTab === 'overview' && (
              <div className="card-container">
                <div className="card-header">
                  <div>
                    <div className="card-brand">VISA PLATINUM</div>
                    <div className="card-type">IBK Terminal</div>
                  </div>
                  <div className="card-chip" />
                </div>
                
                <div className="card-number">•••• •••• •••• {user?.accountNumber?.toString().slice(-4) || '8842'}</div>

                <div className="card-footer">
                  <div>
                    <div className="card-holder-label">Card Holder</div>
                    <div className="card-holder-name">{user?.name || 'VALUED CUSTOMER'}</div>
                  </div>
                  <span className="card-visa">VISA</span>
                </div>
              </div>
            )}

            {/* BALANCE SECTION */}
            {activeTab === 'overview' && (
              <div className="balance-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="balance-label">💰 Available Balance</span>
                  <button onClick={() => setShowBalance(!showBalance)} style={{ background: 'none', color: '#60a5fa', fontSize: '11px', fontWeight: 700, padding: 0, cursor: 'pointer', border: 'none', transition: 'color 0.2s ease', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {showBalance ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
                <div className="balance-amount">
                  {showBalance ? `$${(user?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '••••••••'}
                </div>
              </div>
            )}

            {/* QUICK ACTIONS */}
            {activeTab === 'overview' && (
              <div className="section">
                <div className="quick-actions">
                  <div className="action-btn" onClick={() => navigate('/dashboard/transfer')}>
                    <div className="action-btn-icon">💸</div>
                    <div className="action-btn-label">Send Money</div>
                  </div>
                  <div className="action-btn" onClick={() => navigate('/dashboard/cards')}>
                    <div className="action-btn-icon">💳</div>
                    <div className="action-btn-label">My Cards</div>
                  </div>
                </div>
              </div>
            )}

            {/* RECENT ACTIVITY / TRANSACTIONS */}
            {(activeTab === 'overview' || activeTab === 'transactions') && (
              <div className="section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 className="section-title">📊 Recent Activity</h3>
                  {activeTab === 'overview' && (
                    <button onClick={() => setActiveTab('transactions')} style={{ background: 'none', color: '#60a5fa', fontSize: '12px', fontWeight: 700, padding: 0, cursor: 'pointer', border: 'none', transition: 'color 0.2s ease', textTransform: 'uppercase', letterSpacing: '0.3px' }}>VIEW ALL</button>
                  )}
                </div>

                {activeTab === 'transactions' && (
                  <div className="month-filter">
                    {months.map((m, i) => (
                      <button key={m} onClick={() => setSelectedMonth(i)} className={`month-btn ${selectedMonth === i ? 'active' : ''}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                )}

                {filteredTransactions.length > 0 ? (
                  filteredTransactions.slice(0, activeTab === 'overview' ? 5 : undefined).map(tx => (
                    <div key={tx._id} className="transaction-item" onClick={() => setSelectedTx(tx)}>
                      <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <div className={`tx-icon ${tx.type === 'credit' ? 'credit' : 'debit'}`}>
                          {tx.type === 'credit' ? '↓' : '↑'}
                        </div>
                        <div className="tx-content">
                          <div className="tx-desc">{tx.description || 'Transfer'}</div>
                          <div className="tx-date">{new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        </div>
                      </div>
                      <div className={`tx-amount ${tx.type === 'credit' ? 'credit' : 'debit'}`}>
                        {tx.type === 'credit' ? '+' : '-'}${tx.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">📭</div>
                    <div className="empty-state-text">No transactions yet</div>
                  </div>
                )}
              </div>
            )}

            {/* SECURITY SECTION */}
            {activeTab === 'security' && (
              <div className="section" style={{ maxWidth: '100%', margin: '40px 16px' }}>
                <div style={{ background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)', padding: '40px 24px', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(96, 165, 250, 0.2)', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>
                  <div style={{ fontSize: '56px', marginBottom: '20px', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))' }}>🔐</div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px', color: '#f1f5f9', letterSpacing: '-0.3px' }}>Secure Your Account</h2>
                  <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '36px', lineHeight: '1.6', fontWeight: 500 }}>Set a 4-digit PIN to authorize all your transactions</p>
                  
                  <div className="pin-inputs">
                    {pin.map((d, i) => (
                      <input key={i} id={`pin-${i}`} type="password" className="pin-input" value={d} maxLength={1} onChange={(e) => handlePinChange(i, e.target.value)} inputMode="numeric" />
                    ))}
                  </div>
                  
                  <button className="btn-primary" onClick={handleConfirmPin} disabled={isUpdating} style={{ width: '100%', minHeight: '48px', fontSize: '16px', fontWeight: 700, letterSpacing: '-0.3px' }}>
                    {isUpdating ? '⏳ Securing...' : '✓ Set PIN'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="bottom-nav">
        {[
          { id: 'overview', icon: '🏠', label: 'Home', path: '/dashboard' },
          { id: 'transfer', icon: '💸', label: 'Send', path: '/dashboard/transfer' },
          { id: 'transactions', icon: '📊', label: 'Activity', path: null },
          { id: 'cards', icon: '💳', label: 'Cards', path: '/dashboard/cards' },
          { id: 'security', icon: '🔐', label: 'Secure', path: null },
        ].map((item) => (
          <div 
            key={item.id}
            style={{ position: 'relative' }}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => {
              if (item.path) navigate(item.path);
              else setActiveTab(item.id as any);
            }}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default UserDashboard;