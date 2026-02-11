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
  // activeTab kept for internal logic but navigation buttons removed as requested
  const [activeTab] = useState('dashboard');

  // --- Theme Logic Start ---
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('adminTheme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    localStorage.setItem('adminTheme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const theme = {
    bg: darkMode ? '#0a0f1a' : '#f8fafc',
    text: darkMode ? '#e2e8f0' : '#1e293b',
    card: darkMode ? 'rgba(30,41,59,0.7)' : '#ffffff',
    cardBorder: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    inputBg: darkMode ? '#0f172a' : '#f1f5f9',
    inputText: darkMode ? 'white' : '#1e293b',
    modalBg: darkMode ? '#111827' : '#ffffff',
    subtext: darkMode ? '#64748b' : '#94a3b8',
    tableBorder: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'
  };
  // --- Theme Logic End ---

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    let isMounted = true; // Flag to prevent memory leaks and double-log noise

    const fetchUsers = async () => {
      try {
        if (isMounted) setLoading(true);
        const token = localStorage.getItem('token');
        
        // Log only once per mount
        if (isMounted) console.log("🚀 Syncing with Bank Database...");
        
        const { data } = await axios.get(`${API_BASE_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (isMounted) {
          const userData = Array.isArray(data) ? data : (data.users || []);
          setUsers(userData);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Fetch error:", err.response?.data || err.message);
          setUsers([]); 
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUsers();

    return () => {
      isMounted = false; // Cleanup: tells React to stop background tasks if component unmounts
    };
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
    if (!window.confirm(`Are you sure you want to set this user to ${newStatus ? 'frozen' : 'active'}?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_BASE_URL}/api/admin/user-status`, {
        userId,
        isFrozen: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`User status successfully updated.`);
      fetchUsers();
    } catch (err) {
      alert("Error updating user status.");
    }
  };

  const handleLoadMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !amount) return;

    try {
      const token = localStorage.getItem('token');
      const payload = {
        userId: selectedUser._id,
        amount: parseFloat(amount)
      };

      await axios.post(`${API_BASE_URL}/api/admin/load-wallet`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(`Success! $${amount} injected into ${selectedUser.name}'s account.`);
      setShowLoadModal(false);
      setAmount('');
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error injecting funds.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.replace('/');
  };

  const safeUsers = Array.isArray(users) ? users : [];
  const totalBalance = safeUsers.reduce((sum, user) => sum + (Number(user.balance) || 0), 0);
  const activeUsers = safeUsers.filter(user => !user.isFrozen).length;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: theme.bg, 
      color: theme.text, 
      padding: '16px', 
      paddingBottom: 'env(safe-area-inset-bottom)',
      paddingTop: 'env(safe-area-inset-top)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.3s ease'
    }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        html, body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
          -webkit-font-smoothing: antialiased; 
          background: ${theme.bg};
          overflow-x: hidden;
          width: 100%;
          transition: background 0.3s ease;
        }
        
        button { cursor: pointer; min-height: 44px; border-radius: 10px; font-weight: 600; transition: all 0.2s; touch-action: manipulation; }
        .btn-primary { background: #004da0; color: white; border: none; padding: 10px 20px; }
        .btn-primary:active { background: #003a7a; transform: scale(0.97); }
        .btn-danger { background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); padding: 10px 20px; }
        .btn-danger:active { background: rgba(239,68,68,0.3); transform: scale(0.97); }
        
        input { 
          padding: 14px; 
          border: 1px solid ${darkMode ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.2)'}; 
          border-radius: 10px; 
          background: ${theme.inputBg}; 
          color: ${theme.inputText}; 
          width: 100%; 
          font-size: 16px; 
          -webkit-appearance: none;
        }
        
        .card { background: ${theme.card}; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid ${theme.cardBorder}; padding: 20px; border-radius: 16px; margin-bottom: 16px; box-shadow: ${darkMode ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)'}; transition: all 0.3s ease; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 20px; }
        .stat-label { color: ${theme.subtext}; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .stat-value { font-size: 22px; font-weight: 800; margin: 8px 0; color: #3b82f6; }
        
        .table-wrapper { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: 8px; }
        table { width: 100%; border-collapse: collapse; min-width: 500px; }
        th { text-align: left; padding: 12px; color: ${theme.subtext}; font-size: 11px; border-bottom: 1px solid ${theme.cardBorder}; }
        td { padding: 14px 12px; font-size: 13px; border-bottom: 1px solid ${theme.tableBorder}; color: ${theme.text}; }
        
        .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: flex-end; justify-content: center; z-index: 1000; padding: 10px; }
        .modal-content { 
          background: ${theme.modalBg}; 
          padding: 24px; 
          border-radius: 24px 24px 12px 12px; 
          width: 100%; 
          max-width: 500px; 
          margin-bottom: env(safe-area-inset-bottom);
          box-shadow: 0 -10px 25px rgba(0,0,0,0.5);
          color: ${theme.text};
        }

        .action-group { display: flex; gap: 8px; }
        .btn-icon { width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 16px; }

        @media (max-width: 640px) {
          h1 { font-size: 20px; }
          .stat-value { font-size: 18px; }
          .card { padding: 15px; }
          .modal { align-items: center; }
          .modal-content { border-radius: 20px; margin-bottom: 0; }
        }

        footer { margin-top: auto; padding: 24px 0; text-align: center; border-top: 1px solid ${theme.cardBorder}; }
        .footer-text { color: ${theme.subtext}; font-size: 12px; line-height: 1.6; }
        .footer-credit { color: #3b82f6; font-weight: 700; }

        .theme-toggle {
          background: ${theme.card};
          color: ${theme.text};
          border: 1px solid ${theme.cardBorder};
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
      `}</style>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontWeight: 800 }}>Admin <span style={{ color: '#3b82f6' }}>Dashboard</span></h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button className="btn-danger" onClick={handleLogout} style={{ padding: '8px 16px', fontSize: '13px', minHeight: '36px' }}>Logout</button>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <>
            <div className="grid">
              <div className="card">
                <div className="stat-label">Users</div>
                <div className="stat-value">{safeUsers.length}</div>
                <div style={{ fontSize: '11px', color: theme.subtext }}>{activeUsers} Active</div>
              </div>
              <div className="card">
                <div className="stat-label">Vault</div>
                <div className="stat-value" style={{ color: '#10b981' }}>${totalBalance.toLocaleString()}</div>
                <div style={{ fontSize: '11px', color: theme.subtext }}>Total Balance</div>
              </div>
              <div className="card">
                <div className="stat-label">Status</div>
                <div className="stat-value" style={{ color: '#f59e0b' }}>Live</div>
                <div style={{ fontSize: '11px', color: theme.subtext }}>System Up</div>
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>User Management</h3>
              {loading ? (
                <p style={{ color: theme.subtext, textAlign: 'center', padding: '40px' }}>Loading Database...</p>
              ) : safeUsers.length > 0 ? (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>CLIENT</th>
                        <th>BALANCE</th>
                        <th>STATUS</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {safeUsers.map(user => (
                        <tr key={user._id}>
                          <td>
                            <div style={{ fontWeight: 700 }}>{user.name}</div>
                            <div style={{ fontSize: '10px', color: theme.subtext }}>{user.email}</div>
                          </td>
                          <td style={{ color: '#10b981', fontWeight: 700 }}>
                            ${user.balance?.toLocaleString() || '0'}
                          </td>
                          <td>
                            <span style={{ 
                              padding: '4px 8px', 
                              borderRadius: '6px', 
                              fontSize: '10px', 
                              fontWeight: 800, 
                              background: user.isFrozen ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', 
                              color: user.isFrozen ? '#ef4444' : '#10b981'
                            }}>
                              {user.isFrozen ? 'FROZEN' : 'ACTIVE'}
                            </span>
                          </td>
                          <td>
                            <div className="action-group">
                              <button className="btn-primary btn-icon" onClick={() => { setSelectedUser(user); setShowLoadModal(true); }}>💰</button>
                              <button className="btn-primary btn-icon" onClick={() => { setSelectedUser(user); setShowUserModal(true); }}>👤</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: theme.subtext, textAlign: 'center', padding: '24px' }}>No records found</p>
              )}
            </div>
          </>
        )}
      </div>

      <footer>
        <div className="footer-text">
          &copy; {new Date().getFullYear()} Global Asset Management. All Rights Reserved.
        </div>
        <div className="footer-text">
          System Secure & Encrypted. Built by <span className="footer-credit">Gilbert Favour</span>
        </div>
      </footer>

      {showUserModal && selectedUser && (
        <div className="modal" onClick={() => setShowUserModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '22px' }}>{selectedUser.name}</h2>
              <p style={{ color: theme.subtext, fontSize: '13px' }}>Client Profile</p>
            </div>
            
            <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
              {[
                { label: 'Account #', value: selectedUser.accountNumber || 'PENDING' },
                { label: 'Balance', value: `$${selectedUser.balance?.toLocaleString()}`, color: '#10b981' },
                { label: 'Status', value: selectedUser.isFrozen ? 'Frozen' : 'Active' },
                { label: 'SSN', value: selectedUser.ssn || 'N/A' },
                { label: 'Phone', value: selectedUser.phoneNumber || 'N/A' }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderRadius: '10px' }}>
                  <span style={{ color: theme.subtext, fontSize: '13px' }}>{item.label}</span>
                  <span style={{ fontWeight: 700, fontSize: '13px', color: item.color || theme.text }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gap: '10px' }}>
              <button className={selectedUser.isFrozen ? 'btn-primary' : 'btn-danger'} 
                onClick={() => { setShowUserModal(false); handleToggleUserStatus(selectedUser._id, selectedUser.isFrozen); }}>
                {selectedUser.isFrozen ? 'Unfreeze Account' : 'Freeze Account'}
              </button>
              <button onClick={() => setShowUserModal(false)} style={{ border: 'none', background: 'transparent', color: theme.subtext }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showLoadModal && (
        <div className="modal" onClick={() => setShowLoadModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '8px', textAlign: 'center' }}>Inject Funds</h2>
            <p style={{ textAlign: 'center', color: theme.subtext, fontSize: '14px', marginBottom: '20px' }}>To: {selectedUser?.name}</p>
            
            <form onSubmit={handleLoadMoney}>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount (0.00)"
                required
                style={{ marginBottom: '16px' }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                {[100, 1000, 5000, 10000].map(val => (
                  <button type="button" key={val} onClick={() => setAmount(val.toString())} 
                    style={{ background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', color: theme.text, border: `1px solid ${theme.cardBorder}`, minHeight: '40px', fontSize: '13px' }}>
                    +${val.toLocaleString()}
                  </button>
                ))}
              </div>

              <div style={{ display: 'grid', gap: '10px' }}>
                <button type="submit" className="btn-primary" style={{ background: '#10b981' }}>Confirm Transfer</button>
                <button type="button" onClick={() => setShowLoadModal(false)} style={{ border: 'none', background: 'transparent', color: theme.subtext }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;