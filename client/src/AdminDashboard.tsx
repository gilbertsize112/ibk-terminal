import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  name: string;
  email: string;
  accountNumber?: string;
  isFrozen: boolean;
  balance?: number;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  ssn?: string;
  accountType?: string;
  createdAt?: string;
  lastLogin?: string;
  kycStatus?: string;
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [amount, setAmount] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('adminTheme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    localStorage.setItem('adminTheme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const theme = {
    bg: darkMode ? '#0a0e27' : '#f5f7fb',
    card: darkMode ? '#141b2e' : '#ffffff',
    cardBorder: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    text: darkMode ? '#e8eef7' : '#0f1419',
    subtext: darkMode ? '#8b94a8' : '#6b7280',
    accent: '#2563eb',
    success: '#10b981',
    danger: '#ef4444',
    inputBg: darkMode ? '#1a2237' : '#f3f4f6',
    gradient: darkMode ? 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    warning: '#f59e0b',
  };

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    let isMounted = true;
    const fetchInitialUsers = async () => {
      try {
        if (isMounted) setLoading(true);
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${API_BASE_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (isMounted) {
          const userData = Array.isArray(data) ? data : (data.users || []);
          setUsers(userData);
        }
      } catch (err: any) {
        if (isMounted) setUsers([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchInitialUsers();
    return () => { isMounted = false; };
  }, [API_BASE_URL]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = Array.isArray(data) ? data : (data.users || []);
      setUsers(userData);
    } catch (err: any) {
      console.error("Refresh error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentlyFrozen: boolean) => {
    const newStatus = !currentlyFrozen;
    if (!window.confirm(`Set user to ${newStatus ? 'frozen' : 'active'}?`)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_BASE_URL}/api/admin/user-status`, {
        userId,
        isFrozen: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      alert("Error updating status.");
    }
  };

  const handleLoadMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !amount) return;
    try {
      const token = localStorage.getItem('token');
      const payload = { userId: selectedUser._id, amount: parseFloat(amount) };
      await axios.post(`${API_BASE_URL}/api/admin/load-wallet`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowLoadModal(false);
      setAmount('');
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Injection failed.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.replace('/');
  };

  const safeUsers = Array.isArray(users) ? users : [];
  const totalBalance = safeUsers.reduce((sum, user) => sum + (Number(user.balance) || 0), 0);
  const activeUsers = safeUsers.filter(u => !u.isFrozen).length;
  const frozenUsers = safeUsers.length - activeUsers;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: theme.bg, 
      color: theme.text,
      overflow: 'auto',
      overflowX: 'hidden',
      scrollBehavior: 'smooth'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Sora:wght@600;700;800&display=swap');
        
        html, body { 
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow-x: hidden;
          scroll-behavior: smooth;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        #root, [data-reactroot] { width: 100%; }

        body { font-family: 'Inter', sans-serif; }

        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: ${theme.accent};
          border-radius: 10px;
          transition: background 0.3s ease;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: ${theme.accent};
          opacity: 0.8;
        }

        scrollbar-color: ${theme.accent} transparent;
        scrollbar-width: thin;
        
        .glass-card {
          background: ${theme.card};
          border: 1px solid ${theme.cardBorder};
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 16px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        .glass-card:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(0,0,0,0.1); }

        .stat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }

        .stat-box {
          background: ${theme.card};
          border: 1px solid ${theme.cardBorder};
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .stat-box::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, ${theme.accent}15 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .stat-label { font-size: 11px; color: ${theme.subtext}; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; position: relative; z-index: 1; }
        .stat-value { font-size: 24px; font-weight: 800; margin-top: 8px; font-family: 'Sora', sans-serif; position: relative; z-index: 1; }

        .hero-card {
          background: ${theme.gradient};
          border-radius: 20px;
          padding: 28px;
          color: white;
          margin-bottom: 24px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(37, 99, 235, 0.2);
        }

        .hero-card::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: drift 20s linear infinite;
        }

        .hero-card::after {
          content: '';
          position: absolute;
          bottom: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 80px 80px;
          animation: drift-reverse 25s linear infinite;
        }

        @keyframes drift { from { transform: translate(0, 0); } to { transform: translate(50px, 50px); } }
        @keyframes drift-reverse { from { transform: translate(0, 0); } to { transform: translate(-50px, -50px); } }

        .hero-content { position: relative; z-index: 2; }
        .hero-label { opacity: 0.9; font-size: 13px; font-weight: 600; }
        .hero-value { font-size: 40px; font-weight: 800; margin: 12px 0; font-family: 'Sora', sans-serif; letter-spacing: -1px; }
        .hero-status { display: flex; align-items: center; font-size: 13px; opacity: 0.95; }

        .pulse {
          width: 8px; height: 8px; border-radius: 50%;
          background: #10b981; display: inline-block; margin-right: 8px;
          animation: pulse-animation 2s infinite;
        }
        @keyframes pulse-animation {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          100% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
        }

        .badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-right: 8px;
        }

        .badge-success { background: ${theme.success}20; color: ${theme.success}; }
        .badge-danger { background: ${theme.danger}20; color: ${theme.danger}; }
        .badge-warning { background: ${theme.warning}20; color: ${theme.warning}; }
        .badge-info { background: ${theme.accent}20; color: ${theme.accent}; }

        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, ${theme.cardBorder}, transparent);
          margin: 20px 0;
        }

        .bottom-nav {
          position: fixed; bottom: 0; left: 0; right: 0;
          background: ${darkMode ? 'rgba(10, 14, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
          backdrop-filter: blur(20px);
          height: 80px;
          border-top: 1px solid ${theme.cardBorder};
          display: flex; justify-content: space-around; align-items: center;
          z-index: 1000;
        }

        .nav-item { text-align: center; cursor: pointer; transition: all 0.3s; }
        .nav-item:hover { opacity: 1; }
        .nav-icon { font-size: 24px; margin-bottom: 4px; }
        .nav-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }

        .btn-action {
          padding: 14px 24px; border-radius: 12px; border: none;
          font-weight: 700; font-size: 15px; cursor: pointer;
          transition: all 0.2s; font-family: 'Inter', sans-serif;
        }
        .btn-action:active { transform: scale(0.96); }

        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.5); backdrop-filter: blur(5px);
          display: flex; align-items: center; justify-content: center;
          z-index: 2000; padding: 20px;
          overflow-y: auto;
        }
        .modal-content {
          background: ${theme.card}; width: 100%; max-width: 480px;
          border-radius: 24px; padding: 32px 24px;
          border: 1px solid ${theme.cardBorder};
          animation: modal-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          margin: auto;
        }
        @keyframes modal-pop { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .form-group { margin-bottom: 20px; }
        .form-input {
          width: 100%; padding: 16px; border-radius: 12px;
          background: ${theme.inputBg}; border: 1px solid ${theme.cardBorder};
          color: ${theme.text}; font-size: 16px; font-family: 'Inter', sans-serif;
          transition: all 0.2s;
        }
        .form-input:focus { outline: none; border-color: ${theme.accent}; box-shadow: 0 0 0 3px ${theme.accent}20; }

        .quick-amounts {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;
          margin-bottom: 20px;
        }
        .quick-btn {
          padding: 12px; border-radius: 10px;
          background: ${theme.inputBg}; border: 1px solid ${theme.cardBorder};
          color: ${theme.text}; font-size: 13px; font-weight: 700;
          cursor: pointer; transition: all 0.2s;
        }
        .quick-btn:active { background: ${theme.accent}; color: white; }

        .user-card {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px; background: ${theme.card};
          border: 1px solid ${theme.cardBorder}; border-radius: 16px;
          margin-bottom: 12px; transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }

        .user-card::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: ${theme.accent};
          opacity: 0;
          transition: opacity 0.3s;
        }

        .user-card:hover { border-color: ${theme.accent}; }
        .user-card:hover::before { opacity: 1; }

        .user-info { flex: 1; }
        .user-name { font-weight: 700; font-size: 16px; margin-bottom: 4px; }
        .user-email { font-size: 13px; color: ${theme.subtext}; }
        .user-status { font-size: 12px; font-weight: 700; margin-top: 8px; }

        .btn-icon {
          width: 44px; height: 44px; border-radius: 10px;
          border: none; cursor: pointer;
          transition: all 0.2s; font-size: 18px;
          background: ${theme.inputBg};
          flex-shrink: 0;
        }
        .btn-icon:active { transform: scale(0.92); }

        .main-content { padding: 24px 20px; padding-bottom: 100px; }
        .header { padding: 24px 20px 0; display: flex; justify-content: space-between; align-items: center; }
        .header-title { font-family: 'Sora', sans-serif; }
        .header-tag { font-size: 12px; color: ${theme.subtext}; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
        .header-name { font-size: 28px; font-weight: 800; }

        .theme-toggle {
          width: 48px; height: 48px; border-radius: 12px;
          background: ${theme.card}; border: 1px solid ${theme.cardBorder};
          font-size: 20px; cursor: pointer; transition: all 0.2s;
        }
        .theme-toggle:active { transform: scale(0.92); }

        .loading-text { padding: 40px 20px; text-align: center; color: ${theme.subtext}; }
        
        .section-title { font-size: 18px; font-weight: 800; margin-bottom: 16px; font-family: 'Sora', sans-serif; }
        
        .refresh-btn { background: none; border: none; color: ${theme.accent}; font-weight: 700; font-size: 13px; cursor: pointer; transition: all 0.2s; }
        .refresh-btn:hover { opacity: 0.7; }

        .info-box {
          background: ${theme.inputBg};
          border: 1px solid ${theme.cardBorder};
          border-left: 4px solid ${theme.warning};
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
          font-size: 13px;
          color: ${theme.text};
        }

        @media (max-width: 640px) {
          .hero-value { font-size: 32px; }
          .stat-grid { grid-template-columns: 1fr 1fr; }
          .quick-amounts { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>

      {/* HEADER */}
      <div className="header">
        <div className="header-title">
          <div className="header-tag">BEACON TRUST</div>
          <div className="header-name">Admin Center</div>
        </div>
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="theme-toggle"
        >
          {darkMode ? '🌙' : '☀️'}
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">
        {/* HERO CARD */}
        <div className="hero-card">
          <div className="hero-content">
            <div className="hero-label">TOTAL CONTROLLED ASSETS</div>
            <div className="hero-value">${totalBalance.toLocaleString()}</div>
            <div className="hero-status">
              <span className="pulse"></span> System Online & Secured
            </div>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="stat-grid">
          <div className="stat-box">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{safeUsers.length}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Active</div>
            <div className="stat-value" style={{ color: theme.success }}>{activeUsers}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Frozen</div>
            <div className="stat-value" style={{ color: theme.danger }}>{frozenUsers}</div>
          </div>
        </div>

        <div className="info-box">
          ⚠️ System Status: All operations running normally. Last sync: Just now
        </div>

        <div className="divider"></div>

        {/* USERS SECTION */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="section-title">Master Database</div>
          <button onClick={fetchUsers} className="refresh-btn">Refresh</button>
        </div>

        {loading ? (
          <div className="loading-text">Syncing encryption keys...</div>
        ) : (
          safeUsers.map(user => (
            <div key={user._id} className="user-card">
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-email">{user.email}</div>
                <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className="badge" style={{ background: user.isFrozen ? `${theme.danger}20` : `${theme.success}20`, color: user.isFrozen ? theme.danger : theme.success }}>
                    {user.isFrozen ? '🔒 LOCKED' : '✓ VERIFIED'}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: theme.subtext }}>
                    ${user.balance?.toLocaleString()}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                <button 
                  onClick={() => { setSelectedUser(user); setShowLoadModal(true); }}
                  className="btn-icon"
                  style={{ background: `${theme.accent}10`, color: theme.accent }}
                  title="Inject Funds"
                >
                  💰
                </button>
                <button 
                  onClick={() => { setSelectedUser(user); setShowUserModal(true); }}
                  className="btn-icon"
                  title="User Settings"
                >
                  ⚙️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* BOTTOM NAV */}
      <div className="bottom-nav">
        <div className="nav-item" style={{ color: theme.accent }}>
          <div className="nav-icon">📊</div>
          <div className="nav-label">Dashboard</div>
        </div>
        <div className="nav-item" onClick={handleLogout} style={{ opacity: 0.5, cursor: 'pointer' }}>
          <div className="nav-icon">🚪</div>
          <div className="nav-label">Logout</div>
        </div>
      </div>

      {/* MODAL: LOAD MONEY */}
      {showLoadModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowLoadModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Inject Funds</h2>
            <p style={{ color: theme.subtext, marginBottom: '24px', fontSize: '14px' }}>Recipient: <b style={{ color: theme.text }}>{selectedUser.name}</b></p>
            
            <form onSubmit={handleLoadMoney}>
              <div className="form-group" style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '16px', fontWeight: 800, color: theme.accent }}>$</span>
                <input 
                  type="number" 
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="form-input"
                  style={{ paddingLeft: '35px' }}
                  autoFocus
                />
              </div>

              <div className="quick-amounts">
                {[500, 1000, 5000, 10000, 50000].map(val => (
                  <button key={val} type="button" onClick={() => setAmount(val.toString())} className="quick-btn">
                    +${val.toLocaleString()}
                  </button>
                ))}
              </div>

              <button type="submit" className="btn-action" style={{ background: theme.success, color: 'white', width: '100%', height: '48px' }}>Authorize Injection</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: USER DETAILS */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '14px', background: theme.accent, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: 800 }}>
                {selectedUser.name[0]}
              </div>
              <h2 style={{ fontWeight: 800, fontSize: '20px' }}>{selectedUser.name}</h2>
              <p style={{ fontSize: '13px', color: theme.subtext }}>{selectedUser.email}</p>
            </div>

            <div style={{ background: theme.inputBg, borderRadius: '16px', padding: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${theme.cardBorder}` }}>
                <span style={{ color: theme.subtext, fontSize: '13px' }}>Account No.</span>
                <span style={{ fontWeight: 700, fontSize: '14px' }}>{selectedUser.accountNumber || '---'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                <span style={{ color: theme.subtext, fontSize: '13px' }}>ID/SSN</span>
                <span style={{ fontWeight: 700, fontSize: '14px' }}>{selectedUser.ssn || 'PENDING'}</span>
              </div>
            </div>

            <button 
              onClick={() => { setShowUserModal(false); handleToggleUserStatus(selectedUser._id, selectedUser.isFrozen); }}
              className="btn-action" 
              style={{ background: selectedUser.isFrozen ? theme.success : theme.danger, color: 'white', width: '100%', height: '48px', marginBottom: '12px' }}
            >
              {selectedUser.isFrozen ? 'Unlock Account Assets' : 'Freeze All Access'}
            </button>
            <button onClick={() => setShowUserModal(false)} style={{ width: '100%', background: 'none', border: 'none', color: theme.subtext, fontWeight: 700, cursor: 'pointer' }}>Dismiss</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;