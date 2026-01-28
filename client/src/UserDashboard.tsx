import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Transfer Modal States
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferData, setTransferData] = useState({ accNo: '', amount: '' });
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/user/transfer`, 
        { recipientAccountNumber: transferData.accNo, amount: transferData.amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert("Transfer Successful!");
      setShowTransferModal(false);
      setTransferData({ accNo: '', amount: '' });
      fetchDashboardData(); 
    } catch (err: any) {
      alert(err.response?.data?.message || "Transfer failed.");
    } finally {
      setIsProcessing(false);
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

        .tx-card {
          background: #070c1b;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.05);
          padding: 24px;
        }

        .tx-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.03);
        }

        .modal-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.85); backdrop-filter: blur(4px);
          display: flex; justify-content: center; align-items: center; z-index: 1000;
        }

        .gold-chip {
          width: 42px; height: 32px;
          background: linear-gradient(135deg, #fcd34d 0%, #b45309 100%);
          border-radius: 6px;
        }

        @media (max-width: 480px) {
          .balance-amount { font-size: 28px; }
          .card-visual { height: 190px; padding: 20px; }
          .card-number { font-size: 16px; }
        }
      `}</style>

      {/* SIDEBAR - DESKTOP ONLY */}
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px', padding: '0 10px' }}>
          <div style={{ width: '28px', height: '28px', background: '#3b82f6', borderRadius: '6px' }}></div>
          <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px' }}>IBK BANK</span>
        </div>
        <div className="nav-item active"><span>🏠</span> Overview</div>
        <div className="nav-item"><span>💸</span> Payments</div>
        <div className="nav-item"><span>📉</span> Statistics</div>
        <div className="nav-item"><span>🛡️</span> Security</div>
        <div style={{ marginTop: 'auto' }} className="nav-item" onClick={handleLogout}><span>🚪</span> Logout</div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="mobile-nav">
        <div className="mobile-item active"><span>🏠</span>Overview</div>
        <div className="mobile-item" onClick={() => setShowTransferModal(true)}><span>💸</span>Payments</div>
        <div className="mobile-item"><span>📉</span>Stats</div>
        <div className="mobile-item"><span>🛡️</span>Security</div>
        <div className="mobile-item" onClick={handleLogout}><span>🚪</span>Exit</div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>Hello, {user?.name?.split(' ')[0]}</h1>
            <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '14px' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, border: '1px solid rgba(255,255,255,0.1)', color: '#3b82f6' }}>
            {user?.name?.[0]}
          </div>
        </header>

        <div className="top-section">
          {/* MASTERCARD DESIGN */}
          <div className="card-visual">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="gold-chip"></div>
              <span style={{ fontWeight: 700, fontSize: '14px', color: '#64748b' }}>PREMIUM DEBIT</span>
            </div>
            <div className="card-number">
              {user?.accountNumber ? user.accountNumber.match(/.{1,4}/g).join(' ') : '•••• •••• •••• ••••'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <p style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Card Holder</p>
                <p style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>{user?.name || 'IBK CLIENT'}</p>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#eb001b', opacity: 0.9 }}></div>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f79e1b', opacity: 0.9, marginLeft: '-12px' }}></div>
              </div>
            </div>
          </div>

          {/* BALANCE PANEL */}
          <div className="balance-panel">
            <p style={{ color: '#64748b', fontSize: '13px', margin: 0, fontWeight: 500 }}>Available Balance</p>
            <h2 className="balance-amount">${user?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button className="action-btn" onClick={() => setShowTransferModal(true)}>Send Money</button>
              <button className="action-btn secondary">Add Funds</button>
            </div>
          </div>
        </div>

        {/* TRANSACTIONS SECTION */}
        <div className="tx-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>Recent Activity</h3>
            <span style={{ color: '#3b82f6', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>View all</span>
          </div>
          
          {transactions.length > 0 ? (
            transactions.map((tx: any) => (
              <div key={tx._id} className="tx-row">
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div style={{ 
                    width: '40px', height: '40px', background: tx.type === 'credit' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)', 
                    borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: tx.type === 'credit' ? '#22c55e' : '#94a3b8', fontSize: '16px'
                  }}>
                    {tx.type === 'credit' ? '↓' : '↑'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{tx.description || 'Electronic Transfer'}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{new Date(tx.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: tx.type === 'credit' ? '#22c55e' : '#f8fafc' }}>
                    {tx.type === 'credit' ? '+' : '-'}${tx.amount.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Completed</div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: '14px' }}>
              No recent transaction activity found.
            </div>
          )}
        </div>
      </main>

      {/* TRANSFER MODAL */}
      {showTransferModal && (
        <div className="modal-overlay" onClick={() => setShowTransferModal(false)}>
          <div style={{ width: '90%', maxWidth: '380px', background: '#070c1b', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, fontSize: '20px' }}>Secure Transfer</h2>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>Move funds instantly to any IBK Bank account.</p>
            <form onSubmit={handleTransfer}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '8px', fontWeight: 700 }}>RECIPIENT ACCOUNT</label>
                <input style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '10px', color: 'white', boxSizing: 'border-box' }} 
                  placeholder="Enter 10-digit number" value={transferData.accNo} onChange={e => setTransferData({...transferData, accNo: e.target.value})} required />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '8px', fontWeight: 700 }}>AMOUNT (USD)</label>
                <input style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '10px', color: 'white', boxSizing: 'border-box', fontSize: '18px', fontWeight: 700 }} 
                  type="number" placeholder="0.00" value={transferData.amount} onChange={e => setTransferData({...transferData, amount: e.target.value})} required />
              </div>
              <button type="submit" disabled={isProcessing} className="action-btn" style={{ width: '100%', padding: '16px' }}>
                {isProcessing ? 'Authorizing...' : 'Confirm Transfer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;