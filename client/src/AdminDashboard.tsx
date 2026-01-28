import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{id: string, name: string} | null>(null);
  const [amount, setAmount] = useState('');

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
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
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
          background: #0a0f18; 
          font-family: 'Inter', sans-serif;
          color: #e2e8f0;
          overflow-x: hidden;
          position: relative;
        }

        .sidebar {
          width: 280px;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(10px);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          position: fixed; 
          left: 0;
          top: 0;
          bottom: 0;
          z-index: 100;
        }

        .main-content {
          flex: 1;
          margin-left: 280px; 
          padding: 40px;
          animation: fadeIn 0.8s ease-out;
          min-height: 100vh;
          display: block; 
          box-sizing: border-box;
        }

        .nav-item {
          padding: 16px 20px;
          border-radius: 14px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 500;
          color: #94a3b8;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
          transform: translateX(5px);
        }

        .nav-item.active {
          background: linear-gradient(135deg, #004da0 0%, #002d5a 100%);
          color: white;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }

        .stat-card {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 25px;
          border-radius: 24px;
          transition: transform 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          border-color: #004da0;
        }

        .user-table-card {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 24px;
          overflow: hidden;
          margin-top: 30px;
          margin-bottom: 80px; 
        }

        .table-responsive {
          width: 100%;
          overflow-x: auto;
        }

        table { width: 100%; border-collapse: collapse; }
        th { background: rgba(15, 23, 42, 0.5); padding: 20px; text-align: left; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; }
        td { padding: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.03); }

        .btn-load {
          background: #004da0;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          margin-right: 10px;
        }

        .btn-load:hover {
          background: #00a0e9;
          box-shadow: 0 0 15px rgba(0, 160, 233, 0.4);
        }

        /* NEW STYLE: Block/Freeze Button */
        .btn-block {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-block:hover {
          background: #ef4444;
          color: white;
        }

        .status-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .status-active { background: rgba(5, 150, 105, 0.2); color: #10b981; }
        .status-frozen { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

        .logout-btn {
          margin-top: auto;
          padding: 15px;
          border-radius: 12px;
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          text-align: center;
          font-weight: 700;
          cursor: pointer;
          transition: 0.3s;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .logout-btn:hover {
          background: #ef4444;
          color: white;
        }

        .modal-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-card {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: fadeIn 0.3s ease-out;
        }

        .modal-input {
          background: #0f172a;
          border: 1px solid #334155;
          color: white;
          transition: all 0.3s;
        }

        .modal-input:focus {
          border-color: #004da0;
          outline: none;
          box-shadow: 0 0 0 4px rgba(0, 77, 160, 0.2);
        }
      `}</style>

      <aside className="sidebar">
        <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px'}}>
          <div style={{width: '35px', height: '35px', background: '#004da0', borderRadius: '8px', animation: 'pulse 2s infinite'}}></div>
          <h1 style={{fontSize: '22px', fontWeight: 800, margin: 0, letterSpacing: '-1px'}}>IBK <span style={{color: '#64748b', fontWeight: 400}}>Terminal</span></h1>
        </div>
        
        <nav style={{flex: 1}}>
          <div className="nav-item active"><span>📊</span> Dashboard</div>
          <div className="nav-item"><span>👥</span> User Records</div>
          <div className="nav-item"><span>🛡️</span> Security</div>
          <div className="nav-item"><span>⚙️</span> Settings</div>
        </nav>

        <div className="logout-btn" onClick={handleLogout}>
          SECURE LOGOUT
        </div>
      </aside>

      <main className="main-content">
        <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px'}}>
          <div>
            <h2 style={{fontSize: '32px', margin: 0, fontWeight: 800}}>Executive Panel</h2>
            <p style={{color: '#64748b', margin: '5px 0 0 0'}}>Welcome back, Authorized Administrator.</p>
          </div>
          <div style={{display: 'flex', gap: '15px'}}>
            <div style={{textAlign: 'right'}}>
              <div style={{fontWeight: 700}}>Daniel Gilbert</div>
              <div style={{fontSize: '12px', color: '#059669'}}>● System Online</div>
            </div>
          </div>
        </header>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px'}}>
          <div className="stat-card">
            <p style={{color: '#64748b', fontSize: '14px', marginBottom: '10px'}}>TOTAL NETWORK USERS</p>
            <h3 style={{fontSize: '36px', margin: 0}}>{users.length}</h3>
          </div>
          <div className="stat-card">
            <p style={{color: '#64748b', fontSize: '14px', marginBottom: '10px'}}>SYSTEM LIQUIDITY</p>
            <h3 style={{fontSize: '36px', margin: 0, color: '#00a0e9'}}>$842,000</h3>
          </div>
          <div className="stat-card">
            <p style={{color: '#64748b', fontSize: '14px', marginBottom: '10px'}}>ACTIVE SESSIONS</p>
            <h3 style={{fontSize: '36px', margin: 0, color: '#059669'}}>12</h3>
          </div>
        </div>

        <div className="user-table-card">
          <div style={{padding: '25px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 700}}>
            Global User Registry
          </div>
          <div className="table-responsive">
            <table>
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

      {showLoadModal && (
        <div className="modal-backdrop" onClick={() => setShowLoadModal(false)}>
          <div className="modal-card" style={{width: '90%', maxWidth: '450px', padding: '40px', borderRadius: '32px'}} onClick={e => e.stopPropagation()}>
            <h2 style={{margin: '0 0 10px 0'}}>Fund Injection</h2>
            <p style={{color: '#94a3b8', marginBottom: '30px'}}>Target: <span style={{color: 'white', fontWeight: 700}}>{selectedUser?.name}</span></p>
            <form onSubmit={handleLoadMoney}>
              <div style={{position: 'relative'}}>
                <span style={{position: 'absolute', left: '20px', top: '15px', color: '#64748b', fontWeight: 800}}>$</span>
                <input 
                  type="number" 
                  className="modal-input" 
                  style={{width: '100%', padding: '18px 20px 18px 40px', borderRadius: '16px', fontSize: '20px', marginBottom: '30px', boxSizing: 'border-box'}}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div style={{display: 'flex', gap: '15px'}}>
                <button type="button" onClick={() => setShowLoadModal(false)} style={{flex: 1, padding: '18px', borderRadius: '16px', background: 'transparent', border: '1px solid #334155', color: 'white', cursor: 'pointer'}}>Abort</button>
                <button type="submit" style={{flex: 2, padding: '18px', borderRadius: '16px', background: '#004da0', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer'}}>Execute Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;