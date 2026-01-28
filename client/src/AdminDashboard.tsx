import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{id: string, name: string} | null>(null);
  const [amount, setAmount] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ✅ Maintain localhost support with dynamic fallback
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Logout Function - Updated to clear everything and force a hard redirect
  const handleLogout = () => {
    // 1. Wipe all local storage to ensure no tokens or user flags remain
    localStorage.clear(); 
    
    // 2. Use replace() to force the browser to discard the admin state 
    // and load the login page as a fresh start.
    window.location.replace('/'); 
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      // ✅ Updated to dynamic URL
      const { data } = await axios.get(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users. Check if your backend is running and you are logged in as Admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // NEW FUNCTION: Handle Freezing/Unfreezing user accounts
  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'frozen' ? 'active' : 'frozen';
    if (!window.confirm(`Are you sure you want to set this user to ${newStatus}?`)) return;

    try {
      const token = localStorage.getItem('token');
      // ✅ Updated to dynamic URL
      await axios.patch(`${API_BASE_URL}/api/admin/user-status`, {
        userId,
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(`User status successfully updated to ${newStatus}.`);
      fetchUsers(); 
    } catch (err) {
      alert("Error updating user status. Verify your backend route exists.");
    }
  };

  const handleLoadMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !amount) return;

    try {
      const token = localStorage.getItem('token');
      // ✅ Updated to dynamic URL
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
      alert("Unauthorized: Admin credentials invalid or server error.");
    }
  };

  return (
    <div className="admin-container">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(0, 77, 160, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(0, 77, 160, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 77, 160, 0); }
        }

        /* --- LAYOUT FIXES --- */
        .admin-container {
          display: flex;
          width: 100%;
          min-height: 100vh;
          background: #060a11; 
          font-family: 'Inter', -apple-system, sans-serif;
          color: #e2e8f0;
          overflow-x: hidden;
          position: relative;
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
          z-index: 1000;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .main-content {
          flex: 1;
          margin-left: 280px; 
          padding: 40px;
          animation: fadeIn 0.8s ease-out;
          min-height: 100vh;
          box-sizing: border-box;
          width: 100%;
        }

        .mobile-header {
          display: none;
          padding: 15px 20px;
          background: #0f172a;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 900;
        }

        /* --- NAVIGATION --- */
        .nav-item {
          padding: 14px 18px;
          border-radius: 12px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 500;
          color: #94a3b8;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.03);
          color: white;
          transform: translateX(4px);
        }

        .nav-item.active {
          background: linear-gradient(135deg, #004da0 0%, #003366 100%);
          color: white;
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3);
        }

        /* --- TABLES & CARDS --- */
        .stat-grid {
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); 
          gap: 20px;
        }

        .stat-card {
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 24px;
          border-radius: 20px;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          border-color: #004da0;
          background: rgba(30, 41, 59, 0.6);
        }

        .user-table-card {
          background: rgba(30, 41, 59, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 24px;
          overflow: hidden;
          margin-top: 30px;
          margin-bottom: 50px;
        }

        /* --- MOBILE RESPONSIVENESS --- */
        @media (max-width: 1024px) {
          .sidebar {
            transform: translateX(${isSidebarOpen ? '0' : '-100%'});
            box-shadow: 20px 0 50px rgba(0,0,0,0.5);
          }
          .main-content {
            margin-left: 0;
            padding: 20px;
          }
          .mobile-header {
            display: flex;
          }
          .desktop-only-header {
            display: none !important;
          }
          
          /* Force table to behave like cards on small screens */
          table, thead, tbody, th, td, tr { display: block; }
          thead tr { position: absolute; top: -9999px; left: -9999px; }
          tr { border: 1px solid rgba(255,255,255,0.05); border-radius: 15px; margin-bottom: 15px; background: rgba(255,255,255,0.02); }
          td { border: none; position: relative; padding-left: 50% !important; text-align: right; }
          td:before { 
            position: absolute; left: 15px; width: 45%; padding-right: 10px; 
            white-space: nowrap; text-align: left; font-weight: bold; color: #64748b; font-size: 11px;
          }
          td:nth-of-type(1):before { content: "IDENTIFIER"; }
          td:nth-of-type(2):before { content: "ACCOUNT"; }
          td:nth-of-type(3):before { content: "STATUS"; }
          td:nth-of-type(4):before { content: "BALANCE"; }
          td:nth-of-type(5):before { content: "ACTION"; }
        }

        .btn-load {
          background: #004da0;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s;
        }

        .btn-block {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
          padding: 10px 16px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          margin-left: 8px;
        }

        .status-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .status-active { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .status-frozen { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

        .logout-btn {
          margin-top: auto;
          padding: 15px;
          border-radius: 14px;
          background: rgba(239, 68, 68, 0.05);
          color: #ef4444;
          text-align: center;
          font-weight: 700;
          cursor: pointer;
          border: 1px solid rgba(239, 68, 68, 0.1);
        }

        .menu-toggle {
          background: #004da0;
          border: none;
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
        }
      `}</style>

      {/* MOBILE TOP BAR */}
      <div className="mobile-header">
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <div style={{width: '25px', height: '25px', background: '#004da0', borderRadius: '4px'}}></div>
          <span style={{fontWeight: 800, fontSize: '18px'}}>IBK</span>
        </div>
        <button className="menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? '✕ Close' : '☰ Menu'}
        </button>
      </div>

      <aside className="sidebar">
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

        <div className="logout-btn" onClick={handleLogout}>
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

        {/* STATS SECTION */}
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

        {/* TABLE SECTION */}
        <div className="user-table-card">
          <div style={{padding: '20px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 700}}>
            Global User Registry
          </div>
          <div className="table-responsive">
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr>
                  <th>IDENTIFIER</th>
                  <th>ACCOUNT NO.</th>
                  <th>STATUS</th>
                  <th>NET BALANCE</th>
                  <th>MANAGEMENT</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? users.map((user: any) => (
                  <tr key={user._id}>
                    <td>
                      <div style={{fontWeight: 600}}>{user.name}</div>
                      <div style={{fontSize: '12px', color: '#64748b'}}>{user.email}</div>
                    </td>
                    <td style={{fontFamily: 'monospace', color: '#00a0e9'}}>{user.accountNumber || 'PENDING'}</td>
                    <td>
                      <span className={`status-badge ${user.status === 'frozen' ? 'status-frozen' : 'status-active'}`}>
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td style={{fontWeight: 700, color: '#059669'}}>${user.balance?.toLocaleString() || '0.00'}</td>
                    <td>
                      <button className="btn-load" onClick={() => {
                          setSelectedUser({id: user._id, name: user.name});
                          setShowLoadModal(true);
                      }}>
                        Inward Credit
                      </button>
                      <button className="btn-block" onClick={() => handleToggleUserStatus(user._id, user.status || 'active')}>
                        {user.status === 'frozen' ? 'Unfreeze' : 'Freeze'}
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} style={{textAlign: 'center', color: '#64748b', padding: '40px'}}>
                      {loading ? "Decrypting user records..." : "No users found in the global registry."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL SECTION */}
      {showLoadModal && (
        <div className="modal-backdrop" onClick={() => setShowLoadModal(false)}>
          <div className="modal-card" style={{width: '90%', maxWidth: '400px', padding: '30px', borderRadius: '24px', background: '#1e293b'}} onClick={e => e.stopPropagation()}>
            <h2 style={{margin: '0 0 10px 0', fontSize: '24px'}}>Fund Injection</h2>
            <p style={{color: '#94a3b8', marginBottom: '25px', fontSize: '14px'}}>Target Account: <span style={{color: 'white', fontWeight: 700}}>{selectedUser?.name}</span></p>
            <form onSubmit={handleLoadMoney}>
              <div style={{position: 'relative', marginBottom: '20px'}}>
                <span style={{position: 'absolute', left: '15px', top: '15px', color: '#64748b', fontWeight: 800}}>$</span>
                <input 
                  type="number" 
                  className="modal-input" 
                  style={{width: '100%', padding: '15px 15px 15px 35px', borderRadius: '12px', fontSize: '18px', boxSizing: 'border-box', background: '#0f172a', border: '1px solid #334155', color: 'white'}}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div style={{display: 'flex', gap: '10px'}}>
                <button type="button" onClick={() => setShowLoadModal(false)} style={{flex: 1, padding: '15px', borderRadius: '12px', background: 'transparent', border: '1px solid #334155', color: 'white', cursor: 'pointer', fontWeight: 600}}>Abort</button>
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