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

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    let isMounted = true;

    const fetchInitialUsers = async () => {
      try {
        if (isMounted) setLoading(true);
        const token = localStorage.getItem('token');
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
      const payload = { userId: selectedUser._id, amount: parseFloat(amount) };
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
      minHeight: '100%', 
      background: theme.bg, 
      color: theme.text, 
      padding: '20px 16px', 
      display: 'flex',
      flexDirection: 'column',
      transition: 'background 0.3s ease'
    }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        
        html, body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
          background: ${theme.bg};
          height: auto;
          overflow-y: auto; 
          overflow-x: hidden;
          width: 100%;
          transition: background 0.3s ease;
        }

        /* Animations */
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-slide { animation: slideUp 0.5s ease forwards; }
        .animate-fade { animation: fadeIn 0.4s ease forwards; }

        button { cursor: pointer; min-height: 48px; border-radius: 12px; font-weight: 600; transition: all 0.2s; touch-action: manipulation; }
        .btn-primary { background: #004da0; color: white; border: none; padding: 10px 20px; box-shadow: 0 4px 12px rgba(0,77,160,0.3); }
        .btn-primary:active { transform: scale(0.96); }
        .btn-danger { background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); padding: 10px 20px; }
        
        input { 
          padding: 16px; 
          border: 1px solid ${darkMode ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.2)'}; 
          border-radius: 12px; 
          background: ${theme.inputBg}; 
          color: ${theme.inputText}; 
          width: 100%; 
          font-size: 16px; 
          outline: none;
        }

        .card { 
          background: ${theme.card}; 
          backdrop-filter: blur(12px); 
          -webkit-backdrop-filter: blur(12px); 
          border: 1px solid ${theme.cardBorder}; 
          padding: 20px; 
          border-radius: 20px; 
          margin-bottom: 16px; 
          box-shadow: ${darkMode ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 25px rgba(0,0,0,0.05)'};
        }

        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 24px; }
        .stat-label { color: ${theme.subtext}; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
        .stat-value { font-size: 24px; font-weight: 900; margin: 8px 0; color: #3b82f6; }
        
        .table-wrapper { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: 12px; }
        table { width: 100%; border-collapse: collapse; min-width: 600px; }
        th { text-align: left; padding: 16px 12px; color: ${theme.subtext}; font-size: 10px; font-weight: 800; border-bottom: 1px solid ${theme.cardBorder}; text-transform: uppercase; }
        td { padding: 18px 12px; font-size: 14px; border-bottom: 1px solid ${theme.tableBorder}; color: ${theme.text}; }
        
        .modal-overlay { 
          position: fixed; 
          inset: 0; 
          background: rgba(0,0,0,0.8); 
          backdrop-filter: blur(5px);
          display: flex; 
          align-items: flex-end; 
          justify-content: center; 
          z-index: 1000; 
          animation: fadeIn 0.3s ease;
        }
        
        .modal-content { 
          background: ${theme.modalBg}; 
          padding: 30px 24px; 
          border-radius: 30px 30px 0 0; 
          width: 100%; 
          max-width: 500px; 
          animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          color: ${theme.text};
        }

        .action-group { display: flex; gap: 10px; }
        .btn-icon { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 12px; font-size: 18px; border: none; }

        @media (max-width: 640px) {
          .modal-overlay { align-items: flex-end; }
          .modal-content { border-radius: 24px 24px 0 0; padding-bottom: 40px; }
          .stat-value { font-size: 20px; }
          .grid { grid-template-columns: 1fr 1fr; }
          .grid > div:last-child { grid-column: span 2; }
        }

        footer { margin-top: 40px; padding: 30px 0; text-align: center; border-top: 1px solid ${theme.cardBorder}; }
      `}</style>

      <div style={{ flex: 1 }} className="animate-fade">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontWeight: 900, fontSize: '24px', letterSpacing: '-0.5px' }}>
              Admin <span style={{ color: '#3b82f6' }}>Portal</span>
            </h1>
            <p style={{ fontSize: '12px', color: theme.subtext }}>Secure Node Management</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)} style={{
               background: theme.card, color: theme.text, border: `1px solid ${theme.cardBorder}`,
               width: '44px', height: '44px', borderRadius: '14px', fontSize: '20px'
            }}>
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button className="btn-danger" onClick={handleLogout} style={{ padding: '8px 16px', fontSize: '13px', minHeight: '44px', borderRadius: '14px' }}>Logout</button>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <>
            <div className="grid">
              <div className="card animate-slide" style={{ animationDelay: '0.1s' }}>
                <div className="stat-label">Total Clients</div>
                <div className="stat-value">{safeUsers.length}</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#10b981' }}>● {activeUsers} Online</div>
              </div>
              <div className="card animate-slide" style={{ animationDelay: '0.2s' }}>
                <div className="stat-label">Total Reserves</div>
                <div className="stat-value" style={{ color: '#10b981' }}>${totalBalance.toLocaleString()}</div>
                <div style={{ fontSize: '11px', color: theme.subtext }}>Global Liquidity</div>
              </div>
              <div className="card animate-slide" style={{ animationDelay: '0.3s' }}>
                <div className="stat-label">Server Status</div>
                <div className="stat-value" style={{ color: '#f59e0b' }}>Stable</div>
                <div style={{ fontSize: '11px', color: theme.subtext }}>Encryption v3.4.1</div>
              </div>
            </div>

            <div className="card animate-slide" style={{ animationDelay: '0.4s', padding: '10px' }}>
              <h3 style={{ padding: '15px', fontSize: '18px', fontWeight: 800 }}>Master Database</h3>
              {loading ? (
                <div style={{ padding: '60px 0', textAlign: 'center' }}>
                  <div style={{ width: '30px', height: '30px', border: '3px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 10px' }}></div>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  <p style={{ color: theme.subtext, fontSize: '14px' }}>Establishing Secure Link...</p>
                </div>
              ) : safeUsers.length > 0 ? (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Client Identity</th>
                        <th>Balance</th>
                        <th>Account Status</th>
                        <th>Management</th>
                      </tr>
                    </thead>
                    <tbody>
                      {safeUsers.map(user => (
                        <tr key={user._id}>
                          <td>
                            <div style={{ fontWeight: 800, fontSize: '15px' }}>{user.name}</div>
                            <div style={{ fontSize: '11px', color: theme.subtext }}>{user.email}</div>
                          </td>
                          <td style={{ color: '#10b981', fontWeight: 800 }}>
                            ${user.balance?.toLocaleString() || '0'}
                          </td>
                          <td>
                            <span style={{ 
                              padding: '6px 10px', 
                              borderRadius: '8px', 
                              fontSize: '10px', 
                              fontWeight: 900, 
                              background: user.isFrozen ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', 
                              color: user.isFrozen ? '#ef4444' : '#10b981',
                              border: user.isFrozen ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(16,185,129,0.2)'
                            }}>
                              {user.isFrozen ? 'FROZEN' : 'ACTIVE'}
                            </span>
                          </td>
                          <td>
                            <div className="action-group">
                              <button className="btn-primary btn-icon" onClick={() => { setSelectedUser(user); setShowLoadModal(true); }}>💰</button>
                              <button className="btn-primary btn-icon" style={{ background: '#1e293b' }} onClick={() => { setSelectedUser(user); setShowUserModal(true); }}>👤</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: theme.subtext, textAlign: 'center', padding: '40px' }}>No client data available.</p>
              )}
            </div>
          </>
        )}
      </div>

      <footer>
        <div style={{ color: theme.subtext, fontSize: '11px', marginBottom: '8px', letterSpacing: '1px' }}>
          &copy; {new Date().getFullYear()} BEACON TRUST FINANCIAL
        </div>
        <div style={{ color: theme.subtext, fontSize: '13px' }}>
          System Developer: <span style={{ color: '#3b82f6', fontWeight: 800 }}>GILBERT FAVOUR</span>
        </div>
      </footer>
       
       {showUserModal && selectedUser && (
  <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ 
          width: '60px', 
          height: '60px', 
          background: '#3b82f6', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', // ✅ Fixed from justifyCenter
          margin: '0 auto 16px', 
          fontSize: '24px', 
          color: 'white' 
        }}>
          👤
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 900 }}>{selectedUser.name}</h2>
        <p style={{ color: theme.subtext, fontSize: '14px' }}>System UID: {selectedUser._id.slice(-8)}</p>
      </div>
            
            <div style={{ display: 'grid', gap: '10px', marginBottom: '30px' }}>
              {[
                { label: 'Account Number', value: selectedUser.accountNumber || 'PENDING' },
                { label: 'Current Assets', value: `$${selectedUser.balance?.toLocaleString()}`, color: '#10b981' },
                { label: 'Security Status', value: selectedUser.isFrozen ? 'Access Restricted' : 'Access Granted' },
                { label: 'Identity (SSN)', value: selectedUser.ssn || 'NOT VERIFIED' },
                { label: 'Primary Contact', value: selectedUser.phoneNumber || 'N/A' }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderRadius: '15px', border: `1px solid ${theme.cardBorder}` }}>
                  <span style={{ color: theme.subtext, fontSize: '12px', fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontWeight: 800, fontSize: '13px', color: item.color || theme.text }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
              <button className={selectedUser.isFrozen ? 'btn-primary' : 'btn-danger'} 
                style={{ height: '54px', fontSize: '16px' }}
                onClick={() => { setShowUserModal(false); handleToggleUserStatus(selectedUser._id, selectedUser.isFrozen); }}>
                {selectedUser.isFrozen ? 'Authorize Access' : 'Restrict Access'}
              </button>
              <button onClick={() => setShowUserModal(false)} style={{ border: 'none', background: 'transparent', color: theme.subtext, fontWeight: 700 }}>Dismiss</button>
            </div>
          </div>
        </div>
      )}

      {showLoadModal && (
        <div className="modal-overlay" onClick={() => setShowLoadModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '10px', textAlign: 'center', fontSize: '24px', fontWeight: 900 }}>Financial Injection</h2>
            <p style={{ textAlign: 'center', color: theme.subtext, fontSize: '14px', marginBottom: '30px' }}>Recipient: <span style={{ color: theme.text, fontWeight: 800 }}>{selectedUser?.name}</span></p>
            
            <form onSubmit={handleLoadMoney}>
              <div style={{ position: 'relative', marginBottom: '24px' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: '#3b82f6' }}>$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  style={{ paddingLeft: '35px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '30px' }}>
                {[100, 1000, 10000, 50000].map(val => (
                  <button type="button" key={val} onClick={() => setAmount(val.toString())} 
                    style={{ background: darkMode ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.05)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)', fontSize: '14px', borderRadius: '14px' }}>
                    +${val.toLocaleString()}
                  </button>
                ))}
              </div>

              <div style={{ display: 'grid', gap: '12px' }}>
                <button type="submit" className="btn-primary" style={{ background: '#10b981', height: '54px', fontSize: '16px' }}>Execute Transfer</button>
                <button type="button" onClick={() => setShowLoadModal(false)} style={{ border: 'none', background: 'transparent', color: theme.subtext, fontWeight: 700 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;