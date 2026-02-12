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
    bg: darkMode ? '#070b14' : '#f1f5f9',
    text: darkMode ? '#f8fafc' : '#0f172a',
    card: darkMode ? '#111827' : '#ffffff',
    cardBorder: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    inputBg: darkMode ? '#1f2937' : '#f8fafc',
    inputText: darkMode ? '#ffffff' : '#1e293b',
    modalBg: darkMode ? '#111827' : '#ffffff',
    subtext: darkMode ? '#94a3b8' : '#64748b',
    tableBorder: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    accent: '#3b82f6'
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

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: theme.bg, 
      color: theme.text, 
      padding: 'env(safe-area-inset-top) 16px 80px 16px',
      display: 'block', // Ensuring it blocks for scrolling
      overflowY: 'visible',
      WebkitOverflowScrolling: 'touch'
    }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', -apple-system, sans-serif; }
        html, body { background: ${theme.bg}; height: auto !important; overflow-y: auto !important; }
        
        .card { 
          background: ${theme.card}; 
          border: 1px solid ${theme.cardBorder}; 
          padding: 20px; 
          border-radius: 24px; 
          margin-bottom: 16px; 
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }

        .btn-primary { 
            background: ${theme.accent}; 
            color: white; border: none; 
            padding: 12px; border-radius: 14px; 
            font-weight: 700; width: 100%;
            display: flex; align-items: center; justify-content: center;
        }

        .btn-icon {
            width: 42px; height: 42px; border-radius: 12px; border: none;
            display: flex; align-items: center; justify-content: center; font-size: 18px;
        }

        .scroll-container {
            width: 100%; overflow-x: auto; 
            -webkit-overflow-scrolling: touch;
            border-radius: 16px;
        }

        table { width: 100%; border-collapse: collapse; min-width: 500px; }
        th { text-align: left; padding: 12px; color: ${theme.subtext}; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
        td { padding: 16px 12px; border-top: 1px solid ${theme.tableBorder}; }

        .modal-overlay {
            position: fixed; inset: 0; background: rgba(0,0,0,0.7);
            backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
            z-index: 9999; display: flex; align-items: center; justify-content: center;
            padding: 20px;
        }

        .modal-content {
            background: ${theme.modalBg}; width: 100%; max-width: 400px;
            border-radius: 28px; padding: 24px; position: relative;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
        }

        input {
            width: 100%; padding: 16px; border-radius: 14px;
            background: ${theme.inputBg}; border: 1px solid ${theme.cardBorder};
            color: ${theme.inputText}; font-size: 16px; outline: none;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-in { animation: fadeIn 0.3s ease-in; }
      `}</style>

      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800 }}>Dashboard</h1>
          <p style={{ fontSize: '12px', color: theme.subtext }}>System Control Panel</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setDarkMode(!darkMode)} style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '12px', width: '40px', height: '40px' }}>
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button onClick={handleLogout} style={{ background: '#ef444420', color: '#ef4444', border: 'none', padding: '0 15px', borderRadius: '12px', fontWeight: 600, fontSize: '13px' }}>
            Exit
          </button>
        </div>
      </header>

      {/* STATS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <span style={{ fontSize: '11px', color: theme.subtext, fontWeight: 700 }}>CLIENTS</span>
          <div style={{ fontSize: '24px', fontWeight: 800, margin: '5px 0' }}>{safeUsers.length}</div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <span style={{ fontSize: '11px', color: theme.subtext, fontWeight: 700 }}>RESERVES</span>
          <div style={{ fontSize: '20px', fontWeight: 800, margin: '5px 0', color: '#10b981' }}>
            ${totalBalance > 1000000 ? (totalBalance / 1000000).toFixed(1) + 'M' : totalBalance.toLocaleString()}
          </div>
        </div>
      </div>

      {/* USER LIST */}
      <div className="card">
        <h3 style={{ marginBottom: '20px', fontSize: '16px' }}>Client Management</h3>
        {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
        ) : (
          <div className="scroll-container">
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Balance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {safeUsers.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '14px' }}>{user.name}</div>
                      <div style={{ fontSize: '10px', color: theme.subtext }}>{user.isFrozen ? '⛔ Frozen' : '✅ Active'}</div>
                    </td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>${user.balance?.toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-icon" style={{ background: theme.accent + '20', color: theme.accent }} onClick={() => { setSelectedUser(user); setShowLoadModal(true); }}>💰</button>
                        <button className="btn-icon" style={{ background: theme.subtext + '20', color: theme.text }} onClick={() => { setSelectedUser(user); setShowUserModal(true); }}>⚙️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODALS */}
      {showLoadModal && selectedUser && (
        <div className="modal-overlay animate-in" onClick={() => setShowLoadModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Load Funds</h2>
            <p style={{ color: theme.subtext, fontSize: '14px', marginBottom: '20px' }}>To: {selectedUser.name}</p>
            <form onSubmit={handleLoadMoney}>
              <input 
                type="number" 
                placeholder="0.00" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                required 
                autoFocus
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', margin: '15px 0' }}>
                {[1000, 5000, 10000, 50000].map(v => (
                  <button type="button" key={v} onClick={() => setAmount(v.toString())} style={{ background: theme.inputBg, border: `1px solid ${theme.cardBorder}`, color: theme.text, padding: '8px', borderRadius: '10px', fontSize: '12px' }}>
                    +${v.toLocaleString()}
                  </button>
                ))}
              </div>
              <button type="submit" className="btn-primary">Confirm Injection</button>
              <button type="button" onClick={() => setShowLoadModal(false)} style={{ width: '100%', background: 'none', border: 'none', color: theme.subtext, marginTop: '15px', fontWeight: 600 }}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {showUserModal && selectedUser && (
        <div className="modal-overlay animate-in" onClick={() => setShowUserModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ width: '50px', height: '50px', background: theme.accent, borderRadius: '50%', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px' }}>{selectedUser.name[0]}</div>
                <h2 style={{ fontSize: '18px' }}>{selectedUser.name}</h2>
                <p style={{ fontSize: '12px', color: theme.subtext }}>{selectedUser.email}</p>
            </div>
            
            <div style={{ background: theme.inputBg, borderRadius: '16px', padding: '15px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12px', color: theme.subtext }}>Account No.</span>
                    <span style={{ fontSize: '12px', fontWeight: 700 }}>{selectedUser.accountNumber || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: theme.subtext }}>SSN/ID</span>
                    <span style={{ fontSize: '12px', fontWeight: 700 }}>{selectedUser.ssn || 'N/A'}</span>
                </div>
            </div>

            <button 
                className="btn-primary" 
                style={{ background: selectedUser.isFrozen ? '#10b981' : '#ef4444' }}
                onClick={() => { setShowUserModal(false); handleToggleUserStatus(selectedUser._id, selectedUser.isFrozen); }}
            >
                {selectedUser.isFrozen ? 'Unlock Account' : 'Freeze Account'}
            </button>
            <button type="button" onClick={() => setShowUserModal(false)} style={{ width: '100%', background: 'none', border: 'none', color: theme.subtext, marginTop: '15px', fontWeight: 600 }}>Close</button>
          </div>
        </div>
      )}

      <footer style={{ textAlign: 'center', padding: '20px 0', opacity: 0.5 }}>
        <p style={{ fontSize: '10px', fontWeight: 700 }}>BEACON TRUST FINANCIAL SYSTEM</p>
        <p style={{ fontSize: '9px' }}>DEV: GILBERT FAVOUR</p>
      </footer>
    </div>
  );
};

export default AdminDashboard;