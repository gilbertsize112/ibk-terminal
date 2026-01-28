import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // ✅ Added for navigation

const UserDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<any>(null); // ✅ New state for Modal
  const [activeTab, setActiveTab] = useState<'overview' | 'security'>('overview'); // ✅ Toggle between views
  const [pin, setPin] = useState(['', '', '', '']); // ✅ State for 4-digit PIN
  const navigate = useNavigate(); // ✅ Initialize navigation

  // ✅ Keep localhost support while adding production support
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Updated Logout Logic to match App.tsx
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

  // Handle PIN input
  const handlePinChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newPin = [...pin];
    newPin[index] = value.substring(value.length - 1);
    setPin(newPin);
    
    // Auto focus next input
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');

        .user-dashboard {
          min-height: 100vh;
          background: #020617;
          color: #f8fafc;
          font-family: 'Inter', sans-serif;
          display: flex;
          width: 100%;
        }

        /* Desktop Sidebar */
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

        /* Mobile Bottom Nav */
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
        }

        @media (max-width: 640px) {
          .main-content { padding: 20px; }
        }

        /* Card Section */
        .top-section {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          margin-bottom: 40px;
        }

        @media (min-width: 1024px) { .top-section { grid-template-columns: 1fr 1fr; } }

        /* Professional Card */
        .card-visual {
          width: 100%;
          height: 220px;
          background: linear-gradient(135deg, #1e293b 0%, #020617 100%);
          border-radius: 20px;
          padding: 28px;
          position: relative;
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.6);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-sizing: border-box;
        }

        .card-number {
          font-family: 'Courier New', monospace;
          font-size: 20px;
          letter-spacing: 2px;
          color: #fff;
          margin: 20px 0;
        }

        /* Balance Panel */
        .balance-panel {
          background: #070c1b;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 20px;
          padding: 30px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .balance-amount {
          font-size: 36px;
          font-weight: 700;
          letter-spacing: -1px;
          margin: 8px 0 24px 0;
          font-family: 'Plus Jakarta Sans';
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
          transition: 0.2s;
          border: none;
        }
        .action-btn.secondary {
          background: rgba(255,255,255,0.05);
          color: #f8fafc;
        }
        .action-btn:hover { opacity: 0.9; transform: translateY(-1px); }

        .tx-card, .security-card {
          background: #070c1b;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.05);
          padding: 24px;
        }

        .tx-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 12px; border-bottom: 1px solid rgba(255,255,255,0.03);
          cursor: pointer;
          transition: background 0.2s ease;
          border-radius: 12px;
        }
        .tx-row:hover {
          background: rgba(255,255,255,0.03);
        }

        /* Security Specific Styles */
        .security-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .pin-input {
          width: 50px;
          height: 60px;
          background: #0f172a;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          text-align: center;
          font-size: 24px;
          font-weight: 700;
          color: white;
        }

        .gold-chip {
          width: 42px; height: 32px;
          background: linear-gradient(135deg, #fcd34d 0%, #b45309 100%);
          border-radius: 6px;
        }

        .modal-overlay {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.85);
          display: flex; justify-content: center; align-items: center;
          z-index: 1000;
          backdrop-filter: blur(8px);
          padding: 20px;
        }
        .modal-content {
          background: #0f172a;
          border: 1px solid rgba(255,255,255,0.1);
          width: 100%;
          max-width: 400px;
          border-radius: 24px;
          padding: 32px;
          position: relative;
        }
        .detail-row {
          display: flex; justify-content: space-between;
          padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);
        }
      `}</style>

      {/* TRANSACTION MODAL */}
      {selectedTx && (
        <div className="modal-overlay" onClick={() => setSelectedTx(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ textAlign: 'center', marginBottom: '24px' }}>Transaction Details</h3>
            <div className="detail-row">
              <span style={{ color: '#64748b' }}>Amount</span>
              <span style={{ fontWeight: 600 }}>${selectedTx.amount.toLocaleString()}</span>
            </div>
            <div className="detail-row">
              <span style={{ color: '#64748b' }}>Date</span>
              <span>{new Date(selectedTx.createdAt).toLocaleString()}</span>
            </div>
            <div className="detail-row">
              <span style={{ color: '#64748b' }}>Description</span>
              <span>{selectedTx.description || 'Electronic Transfer'}</span>
            </div>
            <button className="action-btn" style={{ width: '100%', marginTop: '20px' }} onClick={() => setSelectedTx(null)}>Close</button>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px', padding: '0 10px' }}>
          <div style={{ width: '28px', height: '28px', background: '#3b82f6', borderRadius: '6px' }}></div>
          <span style={{ fontSize: '18px', fontWeight: 800 }}>IBK BANK</span>
        </div>
        <div className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><span>🏠</span> Overview</div>
        <div className="nav-item" onClick={() => navigate('/transfer')}><span>💸</span> Payments</div>
        <div className="nav-item"><span>📉</span> Statistics</div>
        <div className={`nav-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}><span>🛡️</span> Security</div>
        <div style={{ marginTop: 'auto' }} className="nav-item" onClick={handleLogout}><span>🚪</span> Logout</div>
      </aside>

      {/* MOBILE NAV */}
      <nav className="mobile-nav">
        <div className={`mobile-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><span>🏠</span>Overview</div>
        <div className="mobile-item" onClick={() => navigate('/transfer')}><span>💸</span>Payments</div>
        <div className={`mobile-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}><span>🛡️</span>Security</div>
        <div className="mobile-item" onClick={handleLogout}><span>🚪</span>Exit</div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>
              {activeTab === 'overview' ? `Hello, ${user?.name?.split(' ')[0]}` : 'Security Settings'}
            </h1>
            <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '14px' }}>
              {activeTab === 'overview' ? new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Manage your account protection'}
            </p>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, border: '1px solid rgba(255,255,255,0.1)', color: '#3b82f6' }}>
            {user?.name?.[0]}
          </div>
        </header>

        {activeTab === 'overview' ? (
          <>
            <div className="top-section">
              <div className="card-visual">
                <div className="gold-chip"></div>
                <div className="card-number">{user?.accountNumber ? user.accountNumber.match(/.{1,4}/g).join(' ') : '•••• •••• •••• ••••'}</div>
                <div style={{ fontWeight: 600 }}>{user?.name || 'IBK CLIENT'}</div>
              </div>
              <div className="balance-panel">
                <p style={{ color: '#64748b', fontSize: '13px' }}>Available Balance</p>
                <h2 className="balance-amount">${user?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button className="action-btn" onClick={() => navigate('/transfer')}>Send Money</button>
                  <button className="action-btn secondary">Add Funds</button>
                </div>
              </div>
            </div>

            <div className="tx-card">
              <h3 style={{ marginBottom: '24px' }}>Recent Activity</h3>
              {transactions.length > 0 ? (
                transactions.map((tx: any) => (
                  <div key={tx._id} className="tx-row" onClick={() => setSelectedTx(tx)}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <div style={{ width: '40px', height: '40px', background: tx.type === 'credit' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tx.type === 'credit' ? '#22c55e' : '#94a3b8' }}>{tx.type === 'credit' ? '↓' : '↑'}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{tx.description || 'Transfer'}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{new Date(tx.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: tx.type === 'credit' ? '#22c55e' : '#f8fafc' }}>
                      {tx.type === 'credit' ? '+' : '-'}${tx.amount.toLocaleString()}
                    </div>
                  </div>
                ))
              ) : <div style={{ textAlign: 'center', color: '#64748b' }}>No activity found.</div>}
            </div>
          </>
        ) : (
          /* ✅ SECURITY SECTION WITH 4-DIGIT PIN */
          <div className="security-card">
            <h3 style={{ marginBottom: '8px' }}>Transaction PIN</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Set a 4-digit PIN to authorize your transfers.</p>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '32px' }}>
              {pin.map((digit, i) => (
                <input
                  key={i}
                  id={`pin-${i}`}
                  type="password"
                  className="pin-input"
                  value={digit}
                  maxLength={1}
                  onChange={(e) => handlePinChange(i, e.target.value)}
                />
              ))}
            </div>
            
            <button className="action-btn" style={{ width: '100%' }}>Update PIN</button>

            <div style={{ marginTop: '40px' }}>
              <div className="security-item">
                <div>
                  <div style={{ fontWeight: 600 }}>Freeze Account</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Instantly stop all card activity</div>
                </div>
                <div style={{ width: '40px', height: '20px', background: '#1e293b', borderRadius: '10px' }}></div>
              </div>
              
              <div className="security-item">
                <div>
                  <div style={{ fontWeight: 600 }}>2-Factor Authentication</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Secure your login with SMS</div>
                </div>
                <div style={{ color: '#22c55e', fontSize: '12px', fontWeight: 600 }}>ENABLED</div>
              </div>

              <div className="security-item" style={{ border: 'none' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Active Sessions</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Currently logged in on iPhone 15 Pro</div>
                </div>
                <span style={{ fontSize: '18px' }}>📱</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;