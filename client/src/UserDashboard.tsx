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
    localStorage.clear();
    window.location.replace('/');
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
    <div style={{ height: '100vh', background: '#ffffff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid #e5e7eb', borderTop: '3px solid #1e40af', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!user) return (
    <div style={{ height: '100vh', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '50px', marginBottom: '20px' }}>⚠️</div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px', color: '#1f2937' }}>Connection Error</h2>
        <button onClick={() => window.location.reload()} style={{ color: '#1e40af', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}>Refresh Page</button>
      </div>
    </div>
  );

  if (user?.isFrozen) return (
    <div style={{ height: '100vh', background: 'linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#ffffff', padding: '40px 24px', borderRadius: '20px', border: '2px solid #dc2626', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 10px 25px rgba(220, 38, 38, 0.1)' }}>
        <div style={{ fontSize: '60px', marginBottom: '16px' }}>🔒</div>
        <h2 style={{ fontSize: '22px', color: '#dc2626', fontWeight: 700, margin: '0 0 12px 0' }}>Account Suspended</h2>
        <p style={{ color: '#6b7280', lineHeight: '1.6', marginBottom: '28px', fontSize: '14px' }}>Your account has been temporarily suspended. Please contact our support team to resolve this issue.</p>
        <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '24px' }}>support@ibk-terminal.com</p>
        <button onClick={handleLogout} style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: '#dc2626', color: 'white', fontWeight: 700, cursor: 'pointer', width: '100%', fontSize: '14px' }}>LOGOUT</button>
      </div>
    </div>
  );

  const isViewingSubPage = location.pathname !== '/dashboard' && !location.pathname.endsWith('/dashboard/');

  return (
    <div style={{ background: '#f9fafb', color: '#1f2937', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', minHeight: '100vh', width: '100%' }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        html, body { overflow-x: hidden; }
        body { background: #f9fafb; }
        
        .scroll-container { overflow-y: auto; -webkit-overflow-scrolling: touch; }
        
        button { border: none; border-radius: 10px; font-weight: 600; transition: all 0.2s ease; font-size: 14px; cursor: pointer; touch-action: manipulation; }
        .btn-primary { background: #1e40af; color: white; padding: 12px 20px; }
        .btn-primary:active { transform: scale(0.97); background: #1e3a8a; }
        .btn-secondary { background: #e5e7eb; color: #1f2937; padding: 10px 16px; }
        .btn-secondary:active { background: #d1d5db; }
        
        .card-container { background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); border-radius: 16px; padding: 24px; color: white; margin: 16px 16px 0 16px; box-shadow: 0 10px 30px rgba(30, 64, 175, 0.15); position: relative; overflow: hidden; }
        .card-container::before { content: ''; position: absolute; top: -40%; right: -40%; width: 300px; height: 300px; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%); border-radius: 50%; }
        .card-container::after { content: ''; position: absolute; bottom: -30%; left: -30%; width: 250px; height: 250px; background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%); border-radius: 50%; }
        
        .card-header { position: relative; z-index: 2; display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
        .card-chip { width: 45px; height: 32px; background: linear-gradient(135deg, #fbbf24, #f97316); border-radius: 6px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); }
        
        .card-number { font-size: 18px; letter-spacing: 3px; font-family: monospace; font-weight: 500; margin: 20px 0; position: relative; z-index: 2; }
        .card-footer { position: relative; z-index: 2; display: flex; justify-content: space-between; align-items: flex-end; }
        .card-holder-name { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; margin-bottom: 4px; }
        .card-holder { font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        
        .section { margin: 24px 16px; }
        .section-title { font-size: 18px; font-weight: 700; margin-bottom: 14px; color: #1f2937; }
        
        .top-bar { background: white; padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e5e7eb; sticky: top; z-index: 50; }
        .top-bar-logo { font-size: 14px; font-weight: 800; color: #1e40af; letter-spacing: 1px; }
        .top-bar-user { font-size: 13px; font-weight: 600; color: #1f2937; }
        
        .quick-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .action-btn { background: white; border: 1px solid #e5e7eb; padding: 14px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s; }
        .action-btn:active { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.08); }
        .action-btn-icon { font-size: 24px; }
        .action-btn-label { font-size: 12px; font-weight: 600; color: #1f2937; text-align: center; }
        
        .transaction-item { background: white; border-radius: 12px; padding: 14px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #e5e7eb; cursor: pointer; transition: all 0.2s; }
        .transaction-item:active { background: #f3f4f6; }
        .tx-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .tx-icon.credit { background: #d1fae5; }
        .tx-icon.debit { background: #fee2e2; }
        .tx-content { flex: 1; margin-left: 12px; }
        .tx-desc { font-size: 13px; font-weight: 600; color: #1f2937; }
        .tx-date { font-size: 11px; color: #6b7280; margin-top: 2px; }
        .tx-amount { font-weight: 700; font-size: 14px; }
        .tx-amount.credit { color: #059669; }
        .tx-amount.debit { color: #1f2937; }
        
        .month-filter { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 10px; scroll-behavior: smooth; }
        .month-btn { padding: 8px 14px; border-radius: 18px; background: white; border: 1px solid #e5e7eb; font-size: 12px; font-weight: 600; white-space: nowrap; cursor: pointer; transition: all 0.2s; }
        .month-btn.active { background: #1e40af; color: white; border: none; }
        
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: flex-end; justify-content: center; }
        .modal-sheet { background: white; width: 100%; max-width: 500px; border-radius: 24px 24px 0 0; padding: 24px 20px calc(24px + env(safe-area-inset-bottom)) 20px; animation: slide-up 0.3s ease-out; }
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        
        .modal-handle { width: 36px; height: 4px; background: #d1d5db; border-radius: 2px; margin: 0 auto 20px; }
        
        .modal-label { color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 6px; }
        .modal-content-item { display: flex; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #e5e7eb; }
        .modal-content-item:last-child { border-bottom: none; }
        .modal-content-label { color: #6b7280; font-size: 13px; font-weight: 500; }
        .modal-content-value { font-weight: 700; font-size: 14px; color: #1f2937; }
        
        .pin-inputs { display: flex; gap: 12px; justify-content: center; margin: 24px 0; }
        .pin-input { width: 50px; height: 50px; text-align: center; font-size: 20px; border: 2px solid #e5e7eb; border-radius: 10px; background: white; font-weight: 600; transition: all 0.2s; }
        .pin-input:focus { outline: none; border-color: #1e40af; box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1); }
        
        .success-overlay { position: fixed; inset: 0; background: white; z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center; animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        
        .bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; background: white; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-around; padding: 8px 0 calc(8px + env(safe-area-inset-bottom)) 0; z-index: 100; }
        .nav-item { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; padding: 8px 0; cursor: pointer; transition: all 0.15s; color: #9ca3af; }
        .nav-item.active { color: #1e40af; }
        .nav-icon { font-size: 22px; }
        .nav-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; }
        
        .main-wrapper { padding-bottom: 100px; }
        
        .balance-section { background: white; margin: 16px 16px 0 16px; padding: 20px; border-radius: 14px; border: 1px solid #e5e7eb; }
        .balance-label { font-size: 12px; color: #6b7280; font-weight: 600; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .balance-amount { font-size: 32px; font-weight: 800; color: #1f2937; margin-bottom: 16px; letter-spacing: -1px; }
        
        .empty-state { text-align: center; padding: 40px 20px; }
        .empty-state-icon { font-size: 40px; margin-bottom: 12px; }
        .empty-state-text { color: #6b7280; font-size: 14px; }
        
        @media (max-width: 640px) {
          .quick-actions { grid-template-columns: 1fr; }
          .section { margin: 20px 12px; }
        }
      `}</style>

      {/* SUCCESS OVERLAY */}
      {showSuccess && (
        <div className="success-overlay">
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>✅</div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1f2937', marginBottom: '8px' }}>PIN Activated</h2>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Your transaction PIN is now secure</p>
        </div>
      )}

      {/* TRANSACTION DETAILS MODAL */}
      {selectedTx && (
        <div className="modal-overlay" onClick={() => setSelectedTx(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: '#1f2937' }}>Transaction Details</h3>
            
            <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
              <div className="modal-content-item">
                <span className="modal-content-label">Status</span>
                <span style={{ color: '#059669', fontWeight: 700 }}>Success</span>
              </div>
              <div className="modal-content-item">
                <span className="modal-content-label">Type</span>
                <span className="modal-content-value" style={{ textTransform: 'capitalize' }}>{selectedTx.type}</span>
              </div>
              <div className="modal-content-item">
                <span className="modal-content-label">Description</span>
                <span className="modal-content-value">{selectedTx.description}</span>
              </div>
              <div className="modal-content-item">
                <span className="modal-content-label">Date</span>
                <span className="modal-content-value">{new Date(selectedTx.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="modal-content-item">
                <span className="modal-content-label">Amount</span>
                <span className="modal-content-value" style={{ color: selectedTx.type === 'credit' ? '#059669' : '#1f2937', fontSize: '16px' }}>
                  {selectedTx.type === 'credit' ? '+' : '-'}${selectedTx.amount?.toLocaleString()}
                </span>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button className="btn-secondary" onClick={() => handleShareReceipt(selectedTx)} style={{ width: '100%' }}>Share</button>
              <button className="btn-primary" onClick={() => setSelectedTx(null)} style={{ width: '100%' }}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* TOP BAR */}
      <div className="top-bar">
        <div>
          <div className="top-bar-logo">IBK</div>
          <div style={{ fontSize: '11px', color: '#9ca3af' }}>Terminal</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="top-bar-user">Hi, {user?.name?.split(' ')[0] || 'User'}</div>
          <div style={{ fontSize: '11px', color: '#9ca3af' }}>Welcome back</div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-wrapper scroll-container">
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
                    <div style={{ fontSize: '11px', fontWeight: 600, opacity: 0.8, letterSpacing: '1.5px' }}>VISA PLATINUM</div>
                    <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '4px' }}>IBK Terminal</div>
                  </div>
                  <div className="card-chip" />
                </div>
                
                <div className="card-number">•••• •••• •••• {user?.accountNumber?.toString().slice(-4) || '8842'}</div>

                <div className="card-footer">
                  <div>
                    <div className="card-holder-name">Card Holder</div>
                    <div className="card-holder">{user?.name || 'VALUED CUSTOMER'}</div>
                  </div>
                  <span style={{ fontSize: '18px', fontWeight: 700, opacity: 0.9 }}>VISA</span>
                </div>
              </div>
            )}

            {/* BALANCE SECTION */}
            {activeTab === 'overview' && (
              <div className="balance-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="balance-label">Available Balance</span>
                  <button onClick={() => setShowBalance(!showBalance)} style={{ background: 'none', color: '#1e40af', fontSize: '12px', fontWeight: 600, padding: 0 }}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 className="section-title">Recent Activity</h3>
                  {activeTab === 'overview' && (
                    <button onClick={() => setActiveTab('transactions')} style={{ background: 'none', color: '#1e40af', fontSize: '12px', fontWeight: 700, padding: 0 }}>VIEW ALL</button>
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
                          <div className="tx-date">{new Date(tx.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className={`tx-amount ${tx.type === 'credit' ? 'credit' : 'debit'}`}>
                        {tx.type === 'credit' ? '+' : '-'}${tx.amount?.toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">📭</div>
                    <div className="empty-state-text">No transactions found</div>
                  </div>
                )}
              </div>
            )}

            {/* SECURITY SECTION */}
            {activeTab === 'security' && (
              <div className="section" style={{ maxWidth: '100%', margin: '40px 16px' }}>
                <div style={{ background: 'white', padding: '28px 20px', borderRadius: '16px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#1f2937' }}>Set Transaction PIN</h2>
                  <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '28px' }}>Create a 4-digit PIN to secure your transactions</p>
                  
                  <div className="pin-inputs">
                    {pin.map((d, i) => (
                      <input key={i} id={`pin-${i}`} type="password" className="pin-input" value={d} maxLength={1} onChange={(e) => handlePinChange(i, e.target.value)} inputMode="numeric" />
                    ))}
                  </div>
                  
                  <button className="btn-primary" onClick={handleConfirmPin} disabled={isUpdating} style={{ width: '100%', minHeight: '44px', fontSize: '15px' }}>
                    {isUpdating ? 'Saving PIN...' : 'Confirm PIN'}
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