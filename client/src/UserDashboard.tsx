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
      // ✅ Updated to dynamic URL
      const profileRes = await axios.get(`${API_BASE_URL}/api/user/profile`, config);
      setUser(profileRes.data);

      try {
        // ✅ Updated to dynamic URL
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
      // ✅ Updated to dynamic URL
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
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');

        .user-dashboard {
          min-height: 100vh;
          background: #020617;
          color: #f8fafc;
          font-family: 'Plus Jakarta Sans', sans-serif;
          display: flex;
          width: 100%;
        }

        /* Sidebar - Hidden on mobile */
        .sidebar {
          width: 280px;
          background: #070c1b;
          border-right: 1px solid rgba(255,255,255,0.05);
          padding: 40px 24px;
          display: flex;
          flex-direction: column;
        }

        @media (max-width: 1024px) { .sidebar { display: none; } }

        .nav-item {
          padding: 14px 18px;
          border-radius: 12px;
          margin-bottom: 8px;
          color: #64748b;
          cursor: pointer;
          transition: 0.3s;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 600;
        }

        .nav-item.active { background: #3b82f6; color: white; box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3); }

        .main-content {
          flex: 1;
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        /* Stats & Card Grid */
        .top-section {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          margin-bottom: 32px;
        }

        @media (min-width: 768px) { .top-section { grid-template-columns: 1.2fr 1.8fr; } }

        /* Mastercard Styling */
        .card-visual {
          width: 100%;
          max-width: 400px;
          height: 240px;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border-radius: 24px;
          padding: 30px;
          position: relative;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.1);
          overflow: hidden;
          transition: transform 0.4s ease;
          cursor: pointer;
        }
        
        .card-visual:hover { transform: translateY(-5px) rotateX(5deg); }

        .card-visual::before {
          content: ""; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
          background: radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%);
        }

        .gold-chip {
          width: 50px; height: 40px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%);
          border-radius: 8px;
          position: relative;
          margin-bottom: 40px;
          box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
        }

        .gold-chip::after {
          content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background-image: linear-gradient(90deg, transparent 45%, rgba(0,0,0,0.1) 50%, transparent 55%),
                            linear-gradient(0deg, transparent 45%, rgba(0,0,0,0.1) 50%, transparent 55%);
          background-size: 10px 10px;
        }

        .card-number {
          font-family: 'Courier New', monospace;
          font-size: 22px;
          letter-spacing: 3px;
          color: white;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          margin-bottom: 30px;
        }

        /* Glassmorphism Panels */
        .glass-panel {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 24px;
          padding: 24px;
          backdrop-filter: blur(12px);
        }

        .action-btn {
          background: #1e293b;
          border: 1px solid rgba(255,255,255,0.05);
          padding: 20px;
          border-radius: 16px;
          text-align: center;
          cursor: pointer;
          transition: 0.2s;
        }
        .action-btn:hover { background: #3b82f6; transform: scale(1.02); }

        .tx-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        /* Mobile Adjustments */
        @media (max-width: 640px) {
          .main-content { padding: 16px; }
          .card-number { font-size: 18px; }
          .top-bar h1 { font-size: 20px; }
        }
      `}</style>

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
          <div style={{ width: '32px', height: '32px', background: '#3b82f6', borderRadius: '8px' }}></div>
          <span style={{ fontSize: '20px', fontWeight: 800 }}>IBK BANK</span>
        </div>
        <div className="nav-item active"><span>🏠</span> Overview</div>
        <div className="nav-item"><span>💸</span> Payments</div>
        <div className="nav-item"><span>📉</span> Statistics</div>
        <div className="nav-item"><span>🛡️</span> Security</div>
        <div style={{ marginTop: 'auto' }} className="nav-item" onClick={handleLogout}><span>🚪</span> Logout</div>
      </aside>

      {/* MAIN */}
      <main className="main-content">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ margin: 0 }}>Hello, {user?.name?.split(' ')[0]}</h1>
            <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, border: '2px solid #3b82f6' }}>
            {user?.name?.[0]}
          </div>
        </header>

        <div className="top-section">
          {/* MASTERCARD */}
          <div className="card-visual">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="gold-chip"></div>
              <div style={{ fontWeight: 800, fontStyle: 'italic', fontSize: '18px', color: 'rgba(255,255,255,0.5)' }}>VISA</div>
            </div>
            <div className="card-number">
              {user?.accountNumber ? user.accountNumber.match(/.{1,4}/g).join(' ') : '4421 •••• •••• 8812'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <p style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', margin: 0, letterSpacing: '1px' }}>Account Holder</p>
                <p style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>{user?.name || 'USER HOLDER'}</p>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#eb001b', opacity: 0.8 }}></div>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#f79e1b', opacity: 0.8, marginLeft: '-10px' }}></div>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>Total Balance</p>
            <h2 style={{ fontSize: '42px', margin: '0 0 24px 0' }}>${user?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="action-btn" onClick={() => setShowTransferModal(true)}>
                <span style={{ display: 'block', fontSize: '20px' }}>🚀</span>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>Send Money</span>
              </div>
              <div className="action-btn">
                <span style={{ display: 'block', fontSize: '20px' }}>➕</span>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>Deposit</span>
              </div>
            </div>
          </div>
        </div>

        {/* TRANSACTIONS */}
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Recent Activity</h3>
            <span style={{ color: '#3b82f6', fontSize: '14px', cursor: 'pointer' }}>View All</span>
          </div>
          {transactions.length > 0 ? (
            transactions.map((tx: any) => (
              <div key={tx._id} className="tx-row">
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ 
                    width: '44px', height: '44px', background: tx.type === 'credit' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', 
                    borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: tx.type === 'credit' ? '#22c55e' : '#ef4444', fontSize: '18px'
                  }}>
                    {tx.type === 'credit' ? '↙' : '↗'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{tx.description || 'General Transfer'}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{new Date(tx.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: tx.type === 'credit' ? '#22c55e' : '#f8fafc' }}>
                    {tx.type === 'credit' ? '+' : '-'}${tx.amount.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>Success</div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No transactions yet.</div>
          )}
        </div>
      </main>

      {/* MODAL */}
      {showTransferModal && (
        <div className="modal-overlay" onClick={() => setShowTransferModal(false)}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '400px', background: '#070c1b' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>New Transfer</h2>
            <form onSubmit={handleTransfer}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '8px' }}>RECIPIENT ACCOUNT</label>
                <input style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '12px', color: 'white', boxSizing: 'border-box' }} 
                  placeholder="Enter Account Number" value={transferData.accNo} onChange={e => setTransferData({...transferData, accNo: e.target.value})} required />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '8px' }}>AMOUNT ($)</label>
                <input style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '12px', color: 'white', boxSizing: 'border-box', fontSize: '20px' }} 
                  type="number" placeholder="0.00" value={transferData.amount} onChange={e => setTransferData({...transferData, amount: e.target.value})} required />
              </div>
              <button type="submit" disabled={isProcessing} style={{ width: '100%', padding: '16px', borderRadius: '12px', background: '#3b82f6', border: 'none', color: 'white', fontWeight: 800, cursor: 'pointer' }}>
                {isProcessing ? 'Processing Securely...' : 'Send Funds Now'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;