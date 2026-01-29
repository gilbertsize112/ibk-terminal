import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'security'>('overview');
  const [pin, setPin] = useState(['', '', '', '']);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

  if (loading) return (
    <div style={{ height: '100vh', background: '#020617', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="loader"></div>
      <style>{`.loader { border: 3px solid rgba(59,130,246,0.1); border-top: 3px solid #3b82f6; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div className="user-dashboard">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;600;800&family=Space+Mono:wght@400;700&display=swap');

        .user-dashboard {
          min-height: 100vh;
          background: #020617;
          color: #f8fafc;
          font-family: 'Inter', sans-serif;
          display: flex;
          width: 100%;
          overflow-x: hidden; /* Prevent horizontal scroll */
        }

        .sidebar {
          width: 260px;
          background: #070c1b;
          border-right: 1px solid rgba(255,255,255,0.05);
          padding: 32px 20px;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
        }

        @media (max-width: 1024px) { 
          .sidebar { display: none; } 
        }

        .mobile-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          background: #070c1b;
          border-top: 1px solid rgba(255,255,255,0.1);
          padding: 12px 0;
          justify-content: space-around;
          align-items: center;
          z-index: 100;
          padding-bottom: env(safe-area-inset-bottom);
        }

        @media (max-width: 1024px) {
          .mobile-nav { display: flex; }
          .main-content { padding-bottom: 100px !important; }
        }

        .mobile-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 10px;
          color: #64748b;
          gap: 4px;
          cursor: pointer;
          flex: 1;
        }
        .mobile-item.active { color: #3b82f6; }
        .mobile-item span { font-size: 20px; }

        .nav-item {
          padding: 12px 16px;
          border-radius: 10px;
          margin-bottom: 4px;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 500;
          font-size: 14px;
        }

        .nav-item:hover { background: rgba(255,255,255,0.03); color: white; }
        .nav-item.active { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }

        .main-content {
          flex: 1;
          padding: 40px;
          max-width: 1100px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }

        @media (max-width: 640px) {
          .main-content { padding: 20px 16px; }
        }

        .top-section {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }

        @media (min-width: 1024px) { .top-section { grid-template-columns: 1fr 1fr; } }

        .card-visual {
          width: 100%;
          min-height: 200px; /* Reduced for mobile */
          aspect-ratio: 1.58 / 1; /* Keep credit card ratio */
          background: linear-gradient(135deg, #0f172a 0%, #020617 100%);
          background-image: 
            radial-gradient(circle at 20% 20%, rgba(255,255,255,0.05) 0%, transparent 50%),
            linear-gradient(135deg, #111827 0%, #000000 100%);
          border-radius: 20px;
          padding: 24px;
          position: relative;
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.9);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-sizing: border-box;
          overflow: hidden;
        }
        
        @media (max-width: 480px) {
            .card-visual { padding: 20px; }
            .card-number { font-size: 16px !important; letter-spacing: 2px !important; }
            .bank-name { font-size: 11px !important; }
            .card-chip { width: 38px !important; height: 28px !important; }
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          z-index: 5;
        }

        .bank-name {
          font-family: 'Plus Jakarta Sans';
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.8);
        }

        .card-chip {
          width: 48px;
          height: 36px;
          background: linear-gradient(135deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c);
          border-radius: 6px;
          position: relative;
        }

        .wireless-icon {
           width: 20px;
           height: 20px;
           color: rgba(255,255,255,0.5);
           position: absolute;
           top: 38px;
           right: 24px;
        }

        .card-number {
          font-family: 'Space Mono', monospace;
          font-size: 20px;
          letter-spacing: 3px;
          color: #ffffff;
          margin: 15px 0;
          text-shadow: 0 2px 2px rgba(0,0,0,0.8);
          z-index: 5;
        }

        .card-bottom {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          z-index: 5;
        }

        .card-info-group {
          display: flex;
          flex-direction: column;
        }

        .card-label {
          font-size: 8px;
          text-transform: uppercase;
          color: #64748b;
        }

        .card-holder {
          text-transform: uppercase;
          font-size: 13px;
          letter-spacing: 1px;
          font-weight: 600;
          color: #f8fafc;
        }

        .balance-panel {
          background: #070c1b;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 20px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .balance-amount {
          font-size: 32px;
          font-weight: 700;
          margin: 8px 0 20px 0;
        }

        .action-btn {
          background: #3b82f6;
          color: white;
          padding: 14px;
          border-radius: 12px;
          text-align: center;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          border: none;
        }
        .action-btn.secondary {
          background: rgba(255,255,255,0.05);
          color: #f8fafc;
        }

        .tx-card, .security-card {
          background: #070c1b;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.05);
          padding: 20px;
          margin-bottom: 20px;
        }

        .tx-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 12px 8px; border-bottom: 1px solid rgba(255,255,255,0.03);
          cursor: pointer;
        }

        .pin-input {
          width: 45px;
          height: 55px;
          background: #0f172a;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          text-align: center;
          font-size: 20px;
          color: white;
        }

        .modal-overlay {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.85);
          display: flex; justify-content: center; align-items: center;
          z-index: 1000;
          backdrop-filter: blur(8px);
          padding: 16px;
        }
        .modal-content {
          background: #0f172a;
          width: 100%;
          max-width: 360px;
          border-radius: 24px;
          padding: 24px;
        }
      `}</style>

      {/* TRANSACTION MODAL */}
      {selectedTx && (
        <div className="modal-overlay" onClick={() => setSelectedTx(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Transaction Details</h3>
            <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: '#64748b' }}>Amount</span>
              <span style={{ fontWeight: 600 }}>${selectedTx.amount.toLocaleString()}</span>
            </div>
            <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: '#64748b' }}>Date</span>
              <span>{new Date(selectedTx.createdAt).toLocaleString()}</span>
            </div>
            <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
              <span style={{ color: '#64748b' }}>Description</span>
              <span style={{textAlign: 'right'}}>{selectedTx.description || 'Electronic Transfer'}</span>
            </div>
            <button className="action-btn" style={{ width: '100%', marginTop: '20px' }} onClick={() => setSelectedTx(null)}>Close</button>
          </div>
        </div>
      )}

      {/* SIDEBAR (Desktop) */}
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px', padding: '0 10px' }}>
          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', borderRadius: '6px' }}></div>
          <span style={{ fontSize: '18px', fontWeight: 800 }}>IBK BANK</span>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', paddingLeft: '16px' }}>Main Menu</div>
          
          <div className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><span>🏠</span> Overview</div>
          <div className="nav-item" onClick={() => navigate('/transfer')}><span>💸</span> Payments</div>
          <div className="nav-item"><span>💳</span> My Cards</div>
          <div className={`nav-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}><span>🛡️</span> Security</div>
          <div className="nav-item"><span>📊</span> Statements</div>

          {/* Credit Score Widget */}
          <div style={{ marginTop: '32px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
             <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>Credit Score</div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ height: '4px', flex: 1, background: '#1e293b', borderRadius: '2px', overflow: 'hidden' }}>
                   <div style={{ width: '82%', height: '100%', background: '#22c55e' }}></div>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#22c55e' }}>782</span>
             </div>
          </div>
        </div>

        {/* User Profile Section at Bottom */}
        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 10px', marginBottom: '8px' }}>
             <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' }}>
                {user?.name?.[0]}
             </div>
             <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Premium</div>
             </div>
          </div>
          <div className="nav-item" style={{ color: '#ef4444' }} onClick={handleLogout}><span>🚪</span> Logout</div>
        </div>
      </aside>

      {/* MOBILE NAV (Bottom) */}
      <nav className="mobile-nav">
        <div className={`mobile-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><span>🏠</span>Overview</div>
        <div className="mobile-item" onClick={() => navigate('/transfer')}><span>💸</span>Payments</div>
        <div className={`mobile-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}><span>🛡️</span>Security</div>
        <div className="mobile-item" onClick={handleLogout}><span>🚪</span>Exit</div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div style={{ maxWidth: '80%' }}>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>
              {activeTab === 'overview' ? `Hello, ${user?.name?.split(' ')[0]}` : 'Security Settings'}
            </h1>
            <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '13px' }}>
              {activeTab === 'overview' ? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Manage protection'}
            </p>
          </div>
          <div style={{ minWidth: '40px', height: '40px', borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, border: '1px solid rgba(255,255,255,0.1)', color: '#3b82f6' }}>
            {user?.name?.[0]}
          </div>
        </header>

        {activeTab === 'overview' ? (
          <>
            <div className="top-section">
              <div className="card-visual">
                <div className="card-top">
                  <span className="bank-name">IBK PREMIER</span>
                  <div className="card-chip"></div>
                </div>
                <svg className="wireless-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8a10 10 0 0 1 14 0"/><path d="M7 10a6 6 0 0 1 10 0"/><path d="M9 12a2 2 0 0 1 6 0"/></svg>
                <div className="card-number">
                  {user?.accountNumber 
                    ? user.accountNumber.match(/.{1,4}/g).join(' ') 
                    : '5244 9012 3456 7890'}
                </div>
                <div className="card-bottom">
                  <div className="card-info-group">
                    <span className="card-label">Card Holder</span>
                    <div className="card-holder">{user?.name || 'IBK CLIENT'}</div>
                  </div>
                  <div className="visa-logo-box">
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#fde68a' }}>ELITE</div>
                  </div>
                </div>
              </div>

              <div className="balance-panel">
                <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>Available Balance</p>
                <h2 className="balance-amount">${user?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button className="action-btn" onClick={() => navigate('/transfer')}>Send</button>
                  <button className="action-btn secondary">Add</button>
                </div>
              </div>
            </div>

            <div className="tx-card">
              <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Recent Activity</h3>
              {transactions.length > 0 ? (
                transactions.map((tx: any) => (
                  <div key={tx._id} className="tx-row" onClick={() => setSelectedTx(tx)}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ width: '36px', height: '36px', background: tx.type === 'credit' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tx.type === 'credit' ? '#22c55e' : '#94a3b8' }}>{tx.type === 'credit' ? '↓' : '↑'}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{tx.description || 'Transfer'}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{new Date(tx.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: tx.type === 'credit' ? '#22c55e' : '#f8fafc', fontSize: '14px' }}>
                      {tx.type === 'credit' ? '+' : '-'}${tx.amount.toLocaleString()}
                    </div>
                  </div>
                ))
              ) : <div style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>No activity.</div>}
            </div>
          </>
        ) : (
          <div className="security-card">
            <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Transaction PIN</h3>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>Authorize your transfers.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '32px' }}>
              {pin.map((digit, i) => (
                <input
                  key={i} id={`pin-${i}`} type="password" className="pin-input"
                  value={digit} maxLength={1} onChange={(e) => handlePinChange(i, e.target.value)}
                />
              ))}
            </div>
            <button className="action-btn" style={{ width: '100%' }}>Update PIN</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;