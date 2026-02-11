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
  const [activeTab, setActiveTab] = useState('dashboard');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(data);
    } catch (err) {
      console.error("Fetch error:", err);
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
      await axios.post(`${API_BASE_URL}/api/admin/load-wallet`, {
        userId: selectedUser._id,
        amount: Number(amount)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Funds successfully injected.`);
      setShowLoadModal(false);
      setAmount('');
      fetchUsers();
    } catch (err) {
      alert("Error injecting funds.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.replace('/');
  };

  const totalBalance = users.reduce((sum, user) => sum + (user.balance || 0), 0);
  const activeUsers = users.filter(user => !user.isFrozen).length;
  const frozenUsers = users.filter(user => user.isFrozen).length;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1a', color: '#e2e8f0', padding: '16px', paddingBottom: '40px' }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        html, body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        body { width: 100%; height: 100%; overflow-x: hidden; }
        
        button { cursor: pointer; min-height: 48px; border-radius: 8px; font-weight: 600; transition: all 0.3s; touch-action: manipulation; -webkit-appearance: none; font-size: 16px; }
        .btn-primary { background: #004da0; color: white; border: none; padding: 12px 20px; }
        .btn-primary:active { background: #0080d0; transform: scale(0.98); }
        .btn-danger { background: rgba(239,68,68,0.2); color: #ef4444; border: 1px solid #ef4444; padding: 12px 20px; }
        .btn-danger:active { background: rgba(239,68,68,0.4); transform: scale(0.98); }
        
        input, select { padding: 14px; border: 1px solid #3b82f6; border-radius: 8px; background: rgba(15,23,42,0.9); color: white; width: 100%; -webkit-appearance: none; -moz-appearance: none; appearance: none; font-size: 16px; }
        input:focus, select:focus { outline: none; border-color: #0096ff; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
        input::placeholder { color: #64748b; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid rgba(59,130,246,0.2); font-size: 14px; }
        th { background: rgba(15,23,42,0.9); font-weight: 700; color: #64748b; }
        tr:active td { background: rgba(59,130,246,0.12); }
        
        .card { background: rgba(30,41,59,0.5); border: 1px solid rgba(59,130,246,0.2); padding: 16px; border-radius: 12px; margin-bottom: 16px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.95); display: flex; align-items: flex-end; justify-content: center; z-index: 1000; padding-bottom: env(safe-area-inset-bottom); }
        .modal-content { background: rgba(15,23,42,0.95); padding: 20px; border-radius: 16px 16px 0 0; max-width: 600px; width: 100%; border: 1px solid rgba(59,130,246,0.3); max-height: 90vh; overflow-y: auto; -webkit-overflow-scrolling: touch; }
        .stat { font-size: 24px; font-weight: 800; margin: 12px 0; color: #00a0e9; }
        
        h1 { font-size: 24px; }
        h2 { font-size: 20px; }
        h3 { font-size: 16px; }
        
        .table-wrapper { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
        
        @supports (-webkit-touch-callout: none) {
          body { padding-top: env(safe-area-inset-top); }
          button, input, select { min-height: 48px; font-size: 16px; }
        }
        
        @media (max-width: 640px) {
          .grid { grid-template-columns: 1fr; gap: 12px; }
          .card { padding: 12px; margin-bottom: 12px; }
          .modal { align-items: center; padding: 10px; }
          .modal-content { border-radius: 12px; max-height: 85vh; width: 95%; }
          table { font-size: 12px; }
          th, td { padding: 8px; }
          h1 { font-size: 20px; }
          h2 { font-size: 18px; }
          .stat { font-size: 20px; }
          button { padding: 10px 16px; font-size: 14px; min-height: 44px; }
          .btn-table { padding: 6px 10px; font-size: 11px; min-height: 40px; }
          input, select { padding: 12px; font-size: 16px; }
          .action-group { display: flex; gap: 6px; flex-wrap: wrap; }
        }
        
        @media (max-width: 480px) {
          padding: 12px;
          .grid { grid-template-columns: 1fr; gap: 10px; }
          .card { padding: 12px; margin-bottom: 12px; }
          table { font-size: 11px; }
          th, td { padding: 6px; }
          h1 { font-size: 18px; }
          .stat { font-size: 18px; }
          button { padding: 8px 12px; font-size: 12px; min-height: 42px; }
          .btn-table { padding: 4px 8px; font-size: 10px; min-height: 36px; }
          .action-group { display: flex; gap: 4px; }
          .table-wrapper { font-size: 10px; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1>Admin Dashboard</h1>
        <button className="btn-danger" onClick={handleLogout} style={{ padding: '10px 16px', fontSize: '14px' }}>Logout</button>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['dashboard', 'users'].map(tab => (
          <button
            key={tab}
            className={activeTab === tab ? 'btn-primary' : 'btn-danger'}
            onClick={() => setActiveTab(tab)}
            style={{ textTransform: 'capitalize', padding: '10px 16px', fontSize: '14px' }}
          >
            {tab === 'dashboard' ? '📊' : '👥'} {tab}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <>
          {/* Stats */}
          <div className="grid">
            <div className="card">
              <div style={{ color: '#64748b', fontSize: '11px', fontWeight: 700 }}>Total Users</div>
              <div className="stat">{users.length}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>{activeUsers} active • {frozenUsers} frozen</div>
            </div>
            <div className="card">
              <div style={{ color: '#64748b', fontSize: '11px', fontWeight: 700 }}>Total Balance</div>
              <div className="stat" style={{ color: '#059669' }}>${totalBalance.toLocaleString()}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Avg: ${(totalBalance / users.length || 0).toLocaleString()}</div>
            </div>
            <div className="card">
              <div style={{ color: '#64748b', fontSize: '11px', fontWeight: 700 }}>System Status</div>
              <div className="stat" style={{ color: '#10b981' }}>Online</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Operational</div>
            </div>
          </div>

          {/* Users Table */}
          <div className="card">
            <h3 style={{ marginBottom: '12px' }}>User Registry</h3>
            {loading ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>Loading...</p>
            ) : users.length > 0 ? (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Account</th>
                      <th>Balance</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id}>
                        <td style={{ fontWeight: 600 }}>{user.name}</td>
                        <td style={{ fontSize: '12px' }}>{user.email}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '10px' }}>{user.accountNumber || 'PENDING'}</td>
                        <td style={{ color: '#059669', fontWeight: 600 }}>${user.balance?.toLocaleString() || '0'}</td>
                        <td>
                          <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600, background: user.isFrozen ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)', color: user.isFrozen ? '#ef4444' : '#10b981', whiteSpace: 'nowrap' }}>
                            {user.isFrozen ? '❄️ Frozen' : '✅ Active'}
                          </span>
                        </td>
                        <td>
                          <div className="action-group">
                            <button className="btn-primary btn-table" onClick={() => { setSelectedUser(user); setShowLoadModal(true); }}>💰</button>
                            <button className="btn-danger btn-table" onClick={() => handleToggleUserStatus(user._id, user.isFrozen)}>{user.isFrozen ? '🔥' : '❄️'}</button>
                            <button className="btn-primary btn-table" onClick={() => { setSelectedUser(user); setShowUserModal(true); }}>👁️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '24px' }}>No users found</p>
            )}
          </div>
        </>
      )}

      {/* User Modal */}
      {showUserModal && selectedUser && (
        <div className="modal" onClick={() => setShowUserModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2>{selectedUser.name}</h2>
              <button onClick={() => setShowUserModal(false)} style={{ background: 'transparent', color: '#64748b', border: 'none', fontSize: '20px', padding: '4px' }}>×</button>
            </div>
            
            <div style={{ background: 'rgba(15,23,42,0.9)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div><span style={{ color: '#64748b', fontWeight: 600 }}>Email:</span> {selectedUser.email}</div>
                <div><span style={{ color: '#64748b', fontWeight: 600 }}>Phone:</span> {selectedUser.phoneNumber || 'N/A'}</div>
                <div><span style={{ color: '#64748b', fontWeight: 600 }}>SSN:</span> {selectedUser.ssn || '****'}</div>
                <div><span style={{ color: '#64748b', fontWeight: 600 }}>Account:</span> {selectedUser.accountNumber || 'PENDING'}</div>
                <div><span style={{ color: '#64748b', fontWeight: 600 }}>Type:</span> {selectedUser.accountType || 'Savings'}</div>
                <div><span style={{ color: '#64748b', fontWeight: 600 }}>Balance:</span> <span style={{ color: '#059669', fontWeight: 600 }}>${selectedUser.balance?.toLocaleString()}</span></div>
                <div><span style={{ color: '#64748b', fontWeight: 600 }}>Status:</span> {selectedUser.isFrozen ? '❄️ Frozen' : '✅ Active'}</div>
                <div><span style={{ color: '#64748b', fontWeight: 600 }}>Address:</span> {selectedUser.address ? `${selectedUser.address}, ${selectedUser.city}` : 'N/A'}</div>
                <div><span style={{ color: '#64748b', fontWeight: 600 }}>Member:</span> {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button className="btn-primary" onClick={() => { setShowUserModal(false); setShowLoadModal(true); }} style={{ width: '100%' }}>💰 Inject Funds</button>
              <button className={selectedUser.isFrozen ? 'btn-primary' : 'btn-danger'} onClick={() => { setShowUserModal(false); handleToggleUserStatus(selectedUser._id, selectedUser.isFrozen); }} style={{ width: '100%' }}>
                {selectedUser.isFrozen ? '🔥 Unfreeze' : '❄️ Freeze'}
              </button>
              <button className="btn-danger" onClick={() => setShowUserModal(false)} style={{ width: '100%' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Load Money Modal */}
      {showLoadModal && (
        <div className="modal" onClick={() => setShowLoadModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '12px' }}>Inject Funds</h2>
            <p style={{ color: '#94a3b8', marginBottom: '16px', fontSize: '14px' }}>Target: <span style={{ color: 'white', fontWeight: 600 }}>{selectedUser?.name}</span></p>
            
            <form onSubmit={handleLoadMoney}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontSize: '12px', fontWeight: 700 }}>Amount ($)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                min="0"
                step="0.01"
                style={{ marginBottom: '12px' }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px' }}>
                {[100, 500, 1000, 5000].map(quick => (
                  <button type="button" key={quick} onClick={() => setAmount(quick.toString())} className="btn-danger" style={{ padding: '10px', fontSize: '13px' }}>
                    ${quick}
                  </button>
                ))}
              </div>

              <div style={{ background: 'rgba(239,68,68,0.1)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', color: '#ef4444' }}>
                ⚠️ This action cannot be reversed.
              </div>

              <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                <button type="submit" className="btn-primary" style={{ width: '100%' }}>Execute</button>
                <button type="button" className="btn-danger" onClick={() => setShowLoadModal(false)} style={{ width: '100%' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;