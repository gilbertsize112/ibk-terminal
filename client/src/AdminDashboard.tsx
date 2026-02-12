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
  const [activeTab] = useState('dashboard');

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('adminTheme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    localStorage.setItem('adminTheme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const theme = {
    bg: darkMode ? '#020617' : '#f8fafc',
    card: darkMode ? '#0f172a' : '#ffffff',
    cardBorder: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
    text: darkMode ? '#f1f5f9' : '#0f172a',
    subtext: darkMode ? '#94a3b8' : '#64748b',
    accent: '#3b82f6',
    success: '#10b981',
    danger: '#ef4444',
    inputBg: darkMode ? '#1e293b' : '#f1f5f9',
  };

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // --- Functions (Kept exactly as requested) ---
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

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: theme.bg, 
      color: theme.text, 
      paddingBottom: '100px', // Space for bottom nav
      transition: 'all 0.3s ease'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
        
        .glass-card {
          background: ${theme.card};
          border: 1px solid ${theme.cardBorder};
          border-radius: 24px;
          padding: 20px;
          margin-bottom: 16px;
        }

        .pulse {
          width: 8px; height: 8px; border-radius: 50%;
          background: ${theme.success};
          display: inline-block; margin-right: 6px;
          box-shadow: 0 0 0 rgba(16, 185, 129, 0.4);
          animation: pulse-animation 2s infinite;
        }

        @keyframes pulse-animation {
          0% { box-shadow: 0 0 0 0px rgba(16, 185, 129, 0.7); }
          100% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
        }

        .bottom-nav {
          position: fixed; bottom: 20px; left: 20px; right: 20px;
          background: ${darkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)'};
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          height: 70px; border-radius: 35px;
          border: 1px solid ${theme.cardBorder};
          display: flex; justify-content: space-around; align-items: center;
          z-index: 1000; box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }

        .scroll-section {
          width: 100%; overflow-x: auto;
          scrollbar-width: none; -ms-overflow-style: none;
        }
        .scroll-section::-webkit-scrollbar { display: none; }

        .btn-action {
          padding: 12px 24px; border-radius: 16px; border: none;
          font-weight: 700; font-size: 14px; cursor: pointer;
          transition: transform 0.2s;
        }
        .btn-action:active { transform: scale(0.95); }

        .modal-blur {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
          display: flex; align-items: flex-end; justify-content: center;
          z-index: 2000;
        }
        .modal-sheet {
          background: ${theme.card}; width: 100%; max-width: 500px;
          border-radius: 32px 32px 0 0; padding: 30px 24px;
          animation: slide-up 0.3s ease-out;
        }
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }

        .stat-card {
           flex: 1; min-width: 140px; padding: 16px; border-radius: 20px;
           background: ${darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'};
        }
      `}</style>

      {/* TOP BAR */}
      <div style={{ padding: '24px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '14px', color: theme.subtext, fontWeight: 700, letterSpacing: '1px' }}>BEACON TRUST</h2>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Admin Center</h1>
        </div>
        <button 
          onClick={() => setDarkMode(!darkMode)}
          style={{ width: '48px', height: '48px', borderRadius: '50%', background: theme.card, border: `1px solid ${theme.cardBorder}`, fontSize: '20px' }}
        >
          {darkMode ? '🌙' : '☀️'}
        </button>
      </div>

      {/* STATS AREA */}
      <div style={{ padding: '0 20px', marginBottom: '24px' }}>
        <div className="glass-card" style={{ background: theme.accent, color: 'white', border: 'none' }}>
          <p style={{ opacity: 0.8, fontSize: '13px', fontWeight: 600 }}>Total Controlled Assets</p>
          <h2 style={{ fontSize: '36px', fontWeight: 800, margin: '8px 0' }}>
            ${totalBalance.toLocaleString()}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
            <span className="pulse"></span> System Online & Secured
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="stat-card">
            <p style={{ fontSize: '12px', color: theme.subtext, fontWeight: 700 }}>USERS</p>
            <p style={{ fontSize: '20px', fontWeight: 800 }}>{safeUsers.length}</p>
          </div>
          <div className="stat-card">
            <p style={{ fontSize: '12px', color: theme.subtext, fontWeight: 700 }}>ACTIVE</p>
            <p style={{ fontSize: '20px', fontWeight: 800, color: theme.success }}>{safeUsers.filter(u => !u.isFrozen).length}</p>
          </div>
        </div>
      </div>

      {/* USERS LIST */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Master Database</h3>
          <button onClick={fetchUsers} style={{ background: 'none', border: 'none', color: theme.accent, fontWeight: 700, fontSize: '13px' }}>Refresh</button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: theme.subtext }}>Syncing encryption keys...</div>
        ) : (
          safeUsers.map(user => (
            <div key={user._id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 800, fontSize: '16px' }}>{user.name}</p>
                <p style={{ fontSize: '12px', color: theme.subtext }}>{user.email}</p>
                <div style={{ marginTop: '8px', fontSize: '11px', fontWeight: 700, color: user.isFrozen ? theme.danger : theme.success }}>
                   {user.isFrozen ? 'LOCKED' : 'VERIFIED'} • ${user.balance?.toLocaleString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                 <button 
                  onClick={() => { setSelectedUser(user); setShowLoadModal(true); }}
                  style={{ width: '44px', height: '44px', borderRadius: '14px', background: theme.accent + '15', border: 'none', color: theme.accent, fontSize: '18px' }}
                 >
                   💰
                 </button>
                 <button 
                  onClick={() => { setSelectedUser(user); setShowUserModal(true); }}
                  style={{ width: '44px', height: '44px', borderRadius: '14px', background: theme.inputBg, border: 'none', color: theme.text, fontSize: '18px' }}
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
        <div style={{ textAlign: 'center', color: theme.accent }}>
          <div style={{ fontSize: '20px' }}>📊</div>
          <div style={{ fontSize: '10px', fontWeight: 800 }}>DASHBOARD</div>
        </div>
        <div onClick={handleLogout} style={{ textAlign: 'center', opacity: 0.5 }}>
          <div style={{ fontSize: '20px' }}>🚪</div>
          <div style={{ fontSize: '10px', fontWeight: 800 }}>LOGOUT</div>
        </div>
      </div>

      {/* MODAL: LOAD MONEY */}
      {showLoadModal && selectedUser && (
        <div className="modal-blur" onClick={() => setShowLoadModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Inject Funds</h2>
            <p style={{ color: theme.subtext, marginBottom: '24px' }}>Recipient: <b>{selectedUser.name}</b></p>
            
            <form onSubmit={handleLoadMoney}>
              <div style={{ position: 'relative', marginBottom: '20px' }}>
                <span style={{ position: 'absolute', left: '16px', top: '18px', fontWeight: 800, color: theme.accent }}>$</span>
                <input 
                  type="number" 
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  style={{ padding: '18px 18px 18px 35px', borderRadius: '16px', background: theme.inputBg, border: 'none', color: theme.text, width: '100%', fontSize: '18px', fontWeight: 700 }}
                  autoFocus
                />
              </div>

              <div className="scroll-section" style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {[500, 1000, 5000, 10000, 50000].map(val => (
                  <button key={val} type="button" onClick={() => setAmount(val.toString())} style={{ padding: '10px 16px', borderRadius: '12px', border: `1px solid ${theme.cardBorder}`, background: 'none', color: theme.text, fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    +${val.toLocaleString()}
                  </button>
                ))}
              </div>

              <button type="submit" className="btn-action" style={{ background: theme.success, color: 'white', width: '100%', height: '56px' }}>Authorize Injection</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: USER DETAILS */}
      {showUserModal && selectedUser && (
        <div className="modal-blur" onClick={() => setShowUserModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '22px', background: theme.accent, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: 800 }}>
                {selectedUser.name[0]}
              </div>
              <h2 style={{ fontWeight: 800 }}>{selectedUser.name}</h2>
              <p style={{ fontSize: '13px', color: theme.subtext }}>{selectedUser.email}</p>
            </div>

            <div style={{ background: theme.inputBg, borderRadius: '20px', padding: '16px', marginBottom: '24px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${theme.cardBorder}` }}>
                 <span style={{ color: theme.subtext, fontSize: '13px' }}>Account No.</span>
                 <span style={{ fontWeight: 700 }}>{selectedUser.accountNumber || '---'}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                 <span style={{ color: theme.subtext, fontSize: '13px' }}>ID/SSN</span>
                 <span style={{ fontWeight: 700 }}>{selectedUser.ssn || 'PENDING'}</span>
               </div>
            </div>

            <button 
              onClick={() => { setShowUserModal(false); handleToggleUserStatus(selectedUser._id, selectedUser.isFrozen); }}
              className="btn-action" 
              style={{ background: selectedUser.isFrozen ? theme.success : theme.danger, color: 'white', width: '100%', height: '56px', marginBottom: '12px' }}
            >
              {selectedUser.isFrozen ? 'Unlock Account Assets' : 'Freeze All Access'}
            </button>
            <button onClick={() => setShowUserModal(false)} style={{ width: '100%', background: 'none', border: 'none', color: theme.subtext, fontWeight: 700 }}>Dismiss</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;