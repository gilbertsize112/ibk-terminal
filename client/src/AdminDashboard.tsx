import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ✅ Added Interface to stop TypeScript "red lines"
interface User {
  _id: string;
  name: string;
  email: string;
  accountNumber?: string;
  status?: string;
  balance?: number;
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{id: string, name: string} | null>(null);
  const [amount, setAmount] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleLogout = () => {
    localStorage.clear(); 
    window.location.replace('/'); 
  };

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'frozen' ? 'active' : 'frozen';
    if (!window.confirm(`Are you sure you want to set this user to ${newStatus}?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_BASE_URL}/api/admin/user-status`, {
        userId,
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(`User status successfully updated to ${newStatus}.`);
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
        userId: selectedUser.id,
        amount: Number(amount)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(`Funds successfully injected into ${selectedUser.name}'s account.`);
      setShowLoadModal(false);
      setAmount('');
      fetchUsers(); 
    } catch (err) {
      alert("Unauthorized or server error.");
    }
  };

  return (
    <div className="admin-container">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(0, 77, 160, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(0, 77, 160, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 77, 160, 0); }
        }

        .admin-container {
          display: flex;
          width: 100vw;
          min-height: 100vh;
          background: #060a11; 
          font-family: 'Inter', sans-serif;
          color: #e2e8f0;
          overflow-x: hidden;
          margin: 0;
          padding: 0;
        }

        .sidebar {
          width: 280px;
          background: rgba(15, 23, 42, 0.98);
          backdrop-filter: blur(15px);
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          position: fixed; 
          left: 0; top: 0; bottom: 0;
          z-index: 2000;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-sizing: border-box;
        }

        .main-content {
          flex: 1;
          margin-left: 280px; 
          padding: 40px;
          animation: fadeIn 0.8s ease-out;
          min-height: 100vh;
          box-sizing: border-box;
          width: calc(100% - 280px);
          transition: margin 0.3s ease;
        }

        .mobile-header {
          display: none;
          width: 100%;
          padding: 15px 20px;
          background: #0f172a;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 1500;
          box-sizing: border-box;
        }

        /* 3-Line Hamburger Icon */
        .hamburger {
          display: flex;
          flex-direction: column;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 10px;
        }
        .hamburger span {
          display: block;
          width: 25px;
          height: 3px;
          background: white;
          border-radius: 2px;
          transition: 0.3s;
        }

        @media (max-width: 1024px) {
          .sidebar {
            transform: translateX(-100%); /* Hidden by default on mobile */
          }
          .sidebar.active {
            transform: translateX(0); /* Slide in when active */
          }
          .main-content {
            margin-left: 0;
            width: 100%;
            padding: 20px;
          }
          .mobile-header {
            display: flex;
          }
          .desktop-only-header {
            display: none !important;
          }
          
          table, thead, tbody, th, td, tr { display: block; }
          thead tr { display: none; }
          tr { 
            border: 1px solid rgba(255,255,255,0.05); 
            border-radius: 16px; 
            margin-bottom: 15px; 
            background: rgba(30, 41, 59, 0.3);
            padding: 10px;
          }
          td { 
            border: none; 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 10px 5px; 
            text-align: right; 
          }
          td:before { 
            content: attr(data-label);
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            font-size: 10px;
          }
        }

        .nav-item {
          padding: 14px 18px;
          border-radius: 12px;
          margin-bottom: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #94a3b8;
        }

        .nav-item.active {
          background: linear-gradient(135deg, #004da0 0%, #003366 100%);
          color: white;
        }

        .stat-grid {
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
          gap: 20px;
        }

        .stat-card {
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 24px;
          border-radius: 20px;
        }

        .btn-load { background: #004da0; color: white; border: none; padding: 10px 16px; border-radius: 10px; font-weight: 600; cursor: pointer; }
        .btn-block { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); padding: 10px 16px; border-radius: 10px; font-weight: 600; margin-left: 5px; cursor: pointer; }

        .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
        .status-active { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .status-frozen { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
      `}</style>

      {/* MOBILE TOP BAR */}
      <div className="mobile-header">
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <div style={{width: '25px', height: '25px', background: '#004da0', borderRadius: '4px'}}></div>
          <span style={{fontWeight: 800, fontSize: '18px'}}>IBK</span>
        </div>
        <button className="hamburger" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <span style={{transform: isSidebarOpen ? 'rotate(45deg) translate(5px, 6px)' : ''}}></span>
          <span style={{opacity: isSidebarOpen ? 0 : 1}}></span>
          <span style={{transform: isSidebarOpen ? 'rotate(-45deg) translate(5px, -6px)' : ''}}></span>
        </button>
      </div>

      {/* Side Overlay */}
      {isSidebarOpen && (
        <div 
          style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1900}} 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Restored with "active" class logic */}
      <aside className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px'}}>
          <div style={{width: '35px', height: '35px', background: '#004da0', borderRadius: '8px', animation: 'pulse 2s infinite'}}></div>
          <h1 style={{fontSize: '22px', fontWeight: 800, margin: 0, letterSpacing: '-1px'}}>IBK <span style={{color: '#64748b', fontWeight: 400}}>Terminal</span></h1>
        </div>
        
        <nav style={{flex: 1}}>
          <div className="nav-item active" onClick={() => setIsSidebarOpen(false)}><span>📊</span> Dashboard</div>
          <div className="nav-item" onClick={() => setIsSidebarOpen(false)}><span>👥</span> User Records</div>
          <div className="nav-item" onClick={() => setIsSidebarOpen(false)}><span>🛡️</span> Security</div>
          <div className="nav-item" onClick={() => setIsSidebarOpen(false)}><span>⚙️</span> Settings</div>
        </nav>

        <div className="logout-btn" style={{marginTop: 'auto', padding: '15px', borderRadius: '14px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', textAlign: 'center', fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(239,68,68,0.2)'}} onClick={handleLogout}>
          SECURE LOGOUT
        </div>
      </aside>

      <main className="main-content">
        <header className="desktop-only-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px'}}>
          <div>
            <h2 style={{fontSize: '32px', margin: 0, fontWeight: 800}}>Executive Panel</h2>
            <p style={{color: '#64748b', margin: '5px 0 0 0'}}>Welcome back, Authorized Administrator.</p>
          </div>
          <div style={{textAlign: 'right'}}>
            <div style={{fontWeight: 700}}>Daniel Gilbert</div>
            <div style={{fontSize: '12px', color: '#059669'}}>● System Online</div>
          </div>
        </header>

        <div className="stat-grid">
          <div className="stat-card">
            <p style={{color: '#64748b', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '10px'}}>TOTAL NETWORK USERS</p>
            <h3 style={{fontSize: '32px', margin: 0, fontWeight: 800}}>{users.length}</h3>
          </div>
          <div className="stat-card">
            <p style={{color: '#64748b', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '10px'}}>SYSTEM LIQUIDITY</p>
            <h3 style={{fontSize: '32px', margin: 0, color: '#00a0e9', fontWeight: 800}}>$842,000</h3>
          </div>
          <div className="stat-card">
            <p style={{color: '#64748b', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '10px'}}>ACTIVE SESSIONS</p>
            <h3 style={{fontSize: '32px', margin: 0, color: '#059669', fontWeight: 800}}>12</h3>
          </div>
        </div>

        <div className="user-table-card" style={{marginTop: '30px', background: 'rgba(30, 41, 59, 0.3)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px', overflow: 'hidden'}}>
          <div style={{padding: '20px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 700}}>
            Global User Registry
          </div>
          <div style={{width: '100%', overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr>
                  <th style={{padding: '20px', textAlign: 'left', color: '#64748b', fontSize: '12px'}}>IDENTIFIER</th>
                  <th style={{padding: '20px', textAlign: 'left', color: '#64748b', fontSize: '12px'}}>ACCOUNT NO.</th>
                  <th style={{padding: '20px', textAlign: 'left', color: '#64748b', fontSize: '12px'}}>STATUS</th>
                  <th style={{padding: '20px', textAlign: 'left', color: '#64748b', fontSize: '12px'}}>NET BALANCE</th>
                  <th style={{padding: '20px', textAlign: 'left', color: '#64748b', fontSize: '12px'}}>MANAGEMENT</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? users.map((user) => (
                  <tr key={user._id}>
                    <td data-label="Identifier">
                      <div style={{fontWeight: 600}}>{user.name}</div>
                      <div style={{fontSize: '11px', color: '#64748b'}}>{user.email}</div>
                    </td>
                    <td data-label="Account" style={{fontFamily: 'monospace', color: '#00a0e9'}}>{user.accountNumber || 'PENDING'}</td>
                    <td data-label="Status">
                      <span className={`status-badge ${user.status === 'frozen' ? 'status-frozen' : 'status-active'}`}>
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td data-label="Balance" style={{fontWeight: 700, color: '#059669'}}>${user.balance?.toLocaleString() || '0.00'}</td>
                    <td data-label="Action">
                      <button className="btn-load" onClick={() => {
                          setSelectedUser({id: user._id, name: user.name});
                          setShowLoadModal(true);
                      }}>Credit</button>
                      <button className="btn-block" onClick={() => handleToggleUserStatus(user._id, user.status || 'active')}>
                        {user.status === 'frozen' ? 'Unfreeze' : 'Freeze'}
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} style={{textAlign: 'center', color: '#64748b', padding: '40px'}}>
                      {loading ? "Decrypting records..." : "Registry empty."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showLoadModal && (
        <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '20px'}} onClick={() => setShowLoadModal(false)}>
          <div style={{width: '100%', maxWidth: '400px', padding: '30px', borderRadius: '24px', background: '#1e293b'}} onClick={e => e.stopPropagation()}>
            <h2 style={{margin: '0 0 10px 0', fontSize: '24px'}}>Fund Injection</h2>
            <p style={{color: '#94a3b8', marginBottom: '25px'}}>Target: <span style={{color: 'white'}}>{selectedUser?.name}</span></p>
            <form onSubmit={handleLoadMoney}>
              <input 
                type="number" 
                style={{width: '100%', padding: '15px', borderRadius: '12px', fontSize: '18px', marginBottom: '20px', boxSizing: 'border-box', background: '#0f172a', border: '1px solid #334155', color: 'white'}}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount ($)"
                required
              />
              <div style={{display: 'flex', gap: '10px'}}>
                <button type="button" onClick={() => setShowLoadModal(false)} style={{flex: 1, padding: '15px', borderRadius: '12px', background: 'transparent', border: '1px solid #334155', color: 'white', cursor: 'pointer'}}>Abort</button>
                <button type="submit" style={{flex: 2, padding: '15px', borderRadius: '12px', background: '#004da0', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer'}}>Execute</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;