import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

const UserDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'transfer' | 'cards' | 'transactions'>('overview');
  const [pin, setPin] = useState(['', '', '', '']);
  const [showBalance, setShowBalance] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ FIXED: Better API URL logic for Vercel/Production
  const API_BASE_URL = import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL}/api` 
    : '/api';

  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    if (!isMobile) setSidebarOpen(false);
    window.addEventListener('resize', () => setSidebarOpen(false));
  }, []);

  // ✅ IMPROVED: Sync activeTab with the URL immediately
  useEffect(() => {
    if (location.pathname.includes('/transfer')) {
      setActiveTab('transfer');
    } else if (location.pathname.includes('/cards')) {
      setActiveTab('cards');
    } else if (location.pathname.includes('/receipt')) {
      setActiveTab('transactions');
    } else if (location.pathname === '/dashboard') {
      setActiveTab('overview');
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.replace('/');
  };

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const profileRes = await axios.get(`${API_BASE_URL}/user/profile`, config);
      setUser(profileRes.data);
      try {
        const transRes = await axios.get(`${API_BASE_URL}/user/transactions`, config);
        setTransactions(transRes.data);
      } catch (e) { setTransactions([]); }
    } catch (err: any) {
      if (err.response?.status === 403) handleLogout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const filteredTransactions = transactions.filter(tx => {
    if (!tx.createdAt) return false;
    return new Date(tx.createdAt).getMonth() === selectedMonth;
  });

  const handlePinChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newPin = [...pin];
    newPin[index] = value.substring(value.length - 1);
    setPin(newPin);
    if (value && index < 3) document.getElementById(`pin-${index + 1}`)?.focus();
  };

  const handleConfirmPin = async () => {
    const finalPin = pin.join('');
    if (finalPin.length !== 4) { alert("PIN must be 4 digits"); return; }

    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/user/setup-pin`, { pin: finalPin }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setShowSuccess(true);
        setPin(['', '', '', '']);
        setTimeout(() => { setShowSuccess(false); setActiveTab('overview'); navigate('/dashboard'); fetchDashboardData(); }, 2500);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "PIN setup failed");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleShareReceipt = async (tx: any) => {
    const shareData = {
      title: 'IBK Transaction Receipt',
      text: `Receipt: ${tx.description}\nAmount: $${tx.amount}\nRef: ${tx._id}`,
      url: window.location.href
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { console.log('Share failed', err); }
    } else {
      navigator.clipboard.writeText(shareData.text);
      alert("Receipt copied!");
    }
  };

  if (loading) return <div style={{ height: '100vh', background: '#020617', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div style={{ width: '50px', height: '50px', border: '3px solid rgba(59,130,246,0.1)', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /><style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style></div>;

  if (user?.isFrozen) return <div style={{ height: '100vh', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}><div style={{ background: '#070c1b', padding: '40px 20px', borderRadius: '24px', border: '1px solid rgba(239,68,68,0.3)', maxWidth: '500px', width: '100%', textAlign: 'center' }}><div style={{ fontSize: '60px', marginBottom: '20px' }}>⚠️</div><h2 style={{ fontSize: '28px', color: '#ef4444', fontWeight: 800, margin: '0 0 20px 0' }}>Account Suspended</h2><p style={{ color: '#94a3b8', lineHeight: '1.6' }}>Contact support@ibk-terminal.com to verify your account.</p><button onClick={handleLogout} style={{ marginTop: '30px', padding: '14px 28px', borderRadius: '12px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 700, cursor: 'pointer', width: '100%' }}>LOGOUT</button></div></div>;

  // ✅ FIXED LOGIC: If we are not on the base /dashboard path, we show the Outlet (Transfer/Cards/Receipt)
  const isViewingSubPage = location.pathname !== '/dashboard';

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#f8fafc', fontFamily: 'Inter, sans-serif', display: 'flex', width: '100%' }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        html, body { overflow-x: hidden; width: 100%; position: relative; }
        button { cursor: pointer; min-height: 48px; border: none; border-radius: 12px; font-weight: 600; transition: 0.3s; -webkit-appearance: none; font-size: 16px; touch-action: manipulation; }
        .btn-primary { background: #3b82f6; color: white; padding: 12px 20px; }
        .btn-primary:active { background: #2563eb; transform: scale(0.98); }
        .btn-secondary { background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1); padding: 12px 20px; }
        input { padding: 12px; border: 2px solid rgba(255,255,255,0.1); border-radius: 12px; background: rgba(2,6,23,0.8); color: white; font-size: 16px; -webkit-appearance: none; }
        input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
        .sidebar { width: 280px; background: rgba(7,12,27,0.95); backdrop-filter: blur(12px); border-right: 1px solid rgba(255,255,255,0.05); padding: 30px 20px; display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; }
        .nav-item { padding: 12px 16px; border-radius: 12px; margin-bottom: 8px; color: #94a3b8; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 12px; font-weight: 500; user-select: none; }
        .nav-item:hover { background: rgba(255,255,255,0.05); }
        .nav-item.active { background: #3b82f6; color: white; }
        .main-content { flex: 1; padding: 40px 60px; max-width: 1200px; width: 100%; margin: 0 auto; }
        .card-visual { width: 100%; max-width: 440px; aspect-ratio: 1.6/1; background: linear-gradient(135deg, #0f172a, #020617); border-radius: 20px; padding: 24px; position: relative; border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); }
        .card-number { font-family: 'Space Mono', monospace; font-size: 20px; letter-spacing: 3px; color: white; word-break: break-all; }
        .balance-panel { background: rgba(15,23,42,0.3); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.06); border-radius: 24px; padding: 28px; display: flex; flex-direction: column; justify-content: center; min-height: 200px; }
        .balance-amount { font-size: 32px; font-weight: 800; margin: 10px 0 20px 0; color: #3b82f6; word-break: break-word; }
        .tx-card { background: #070c1b; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); padding: 24px; }
        .tx-row { display: flex; justify-content: space-between; align-items: center; padding: 16px; border-radius: 14px; margin-bottom: 8px; cursor: pointer; transition: 0.2s; gap: 12px; }
        .tx-row:hover { background: rgba(255,255,255,0.03); }
        .month-pill { padding: 10px 20px; border-radius: 20px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: #94a3b8; cursor: pointer; white-space: nowrap; transition: 0.3s; flex-shrink: 0; }
        .month-pill.active { background: #3b82f6; color: white; }
        .top-section { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 40px; }
        
        @media (max-width: 1024px) { 
          .sidebar { position: fixed; left: 0; transform: translateX(-100%); height: 100vh; transition: 0.3s; z-index: 1001; box-shadow: 20px 0 50px rgba(0,0,0,0.7); } 
          .sidebar.active { transform: translateX(0); } 
          .mobile-top-bar { display: flex; } 
          .mobile-nav { display: flex; } 
          .main-content { padding: 100px 20px 120px 20px; width: 100%; max-width: 100vw; } 
          .top-section { grid-template-columns: 1fr; gap: 20px; } 
        }
        @media (max-width: 768px) { 
          .main-content { padding-top: 90px; } 
          .card-visual { aspect-ratio: 1.7/1; max-width: 100%; } 
          .balance-amount { font-size: 28px; } 
        }
        @media (max-width: 480px) { 
          .card-visual { aspect-ratio: 1.8/1; padding: 20px; border-radius: 16px; } 
          .card-number { font-size: 16px; letter-spacing: 2px; } 
          .balance-amount { font-size: 26px; } 
          .tx-row { flex-direction: row; align-items: center; padding: 12px; } 
          .tx-card { padding: 16px; }
          button { min-height: 46px; font-size: 14px; } 
          input { padding: 12px; font-size: 16px; } 
          .main-content { padding: 85px 12px 100px 12px; } 
        }
        .mobile-top-bar { display: none; position: fixed; top: 0; left: 0; right: 0; background: rgba(7,12,27,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.05); padding: env(safe-area-inset-top) 20px 16px 20px; z-index: 999; align-items: center; justify-content: space-between; height: auto; }
        .mobile-nav { display: none; position: fixed; bottom: 0; left: 0; right: 0; background: rgba(15,23,42,0.98); backdrop-filter: blur(20px); border-top: 1px solid rgba(255,255,255,0.1); padding: 12px 12px calc(12px + env(safe-area-inset-bottom)) 12px; justify-content: space-around; z-index: 1000; height: auto; }
        .mobile-item { display: flex; flex-direction: column; align-items: center; color: #94a3b8; gap: 6px; cursor: pointer; flex: 1; transition: 0.2s; }
        .mobile-item.active { color: #3b82f6; transform: translateY(-2px); }
      `}</style>

      {/* Success Modal */}
      {showSuccess && <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.95)', backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}><div style={{ fontSize: '60px' }}>✅</div><h2 style={{ marginTop: '30px', fontWeight: 800, color: 'white', letterSpacing: '2px' }}>SECURITY ESTABLISHED</h2><p style={{ color: '#94a3b8', marginTop: '10px' }}>Transaction PIN activated successfully.</p></div>}

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setSelectedTx(null)}>
          <div style={{ background: '#0a0f1e', borderRadius: '24px', width: '100%', maxWidth: '420px', border: '1px solid rgba(255,255,255,0.1)', padding: '30px' }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '50px', marginBottom: '16px', color: selectedTx.type === 'credit' ? '#22c55e' : '#3b82f6' }}>{selectedTx.type === 'credit' ? '↓' : '↑'}</div>
              <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Transaction Receipt</h2>
              <div style={{ color: '#64748b', fontSize: '12px', fontFamily: 'monospace', marginTop: '8px', wordBreak: 'break-all' }}>REF: {selectedTx._id}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span style={{ color: '#64748b' }}>Description</span><span>{selectedTx.description || 'Transfer'}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span style={{ color: '#64748b' }}>Date</span><span>{new Date(selectedTx.createdAt).toLocaleString()}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)' }}><span style={{ color: '#64748b' }}>Amount</span><span style={{ fontSize: '18px', fontWeight: 800, color: selectedTx.type === 'credit' ? '#22c55e' : 'white' }}>{selectedTx.type === 'credit' ? '+' : '-'}${(selectedTx.amount || 0).toLocaleString()}</span></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button className="btn-secondary" onClick={() => handleShareReceipt(selectedTx)}>🔗 Share</button>
              <button className="btn-primary" onClick={() => setSelectedTx(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="mobile-top-bar">
        <button className="btn-secondary" style={{ minHeight: '40px', padding: '0 15px' }} onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
        <span style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '1px' }}>IBK BANK</span>
        <div style={{ width: '40px' }} />
      </div>

      <aside className={`sidebar ${sidebarOpen ? 'active' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', fontSize: '18px', fontWeight: 800 }}>📊 IBK BANK</div>
        <div style={{ flex: 1 }}>
          {['Overview', 'Payments', 'Transactions', 'Cards', 'Security'].map((name, i) => (
            <div 
              key={i} 
              className={`nav-item ${(i === 0 && activeTab === 'overview') || (i === 1 && activeTab === 'transfer') || (i === 2 && activeTab === 'transactions') || (i === 3 && activeTab === 'cards') || (i === 4 && activeTab === 'security') ? 'active' : ''}`} 
              onClick={() => { 
                setSidebarOpen(false); 
                if (i === 0) { navigate('/dashboard'); } 
                else if (i === 1) { navigate('/dashboard/transfer'); } 
                else if (i === 2) setActiveTab('transactions'); 
                else if (i === 3) { navigate('/dashboard/cards'); } 
                else setActiveTab('security'); 
              }}
            >
              <span>{['🏠', '💸', '📊', '💳', '🛡️'][i]}</span>{name}
            </div>
          ))}
        </div>
        <button className="btn-secondary" onClick={handleLogout} style={{ width: '100%', marginTop: 'auto' }}>Logout</button>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav">
        {['🏠', '💸', '📊', '💳', '🛡️'].map((emoji, i) => (
          <div 
            key={i} 
            className={`mobile-item ${(i === 0 && activeTab === 'overview') || (i === 1 && activeTab === 'transfer') || (i === 2 && activeTab === 'transactions') || (i === 3 && activeTab === 'cards') || (i === 4 && activeTab === 'security') ? 'active' : ''}`} 
            onClick={() => { 
              if (i === 0) navigate('/dashboard'); 
              else if (i === 1) navigate('/dashboard/transfer'); 
              else if (i === 2) setActiveTab('transactions'); 
              else if (i === 3) navigate('/dashboard/cards'); 
              else setActiveTab('security'); 
            }}
          >
            <span style={{ fontSize: '20px' }}>{emoji}</span>
          </div>
        ))}
      </nav>

      <main className="main-content">
        {/* ✅ DYNAMIC ROUTING AREA */}
        {isViewingSubPage ? (
          <Outlet context={{ user }} />
        ) : (
          <>
            <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>
              {activeTab === 'overview' ? `Welcome, ${user?.name?.split(' ')[0]}!` : activeTab === 'transactions' ? 'Transactions' : 'Security'}
            </h1>
            
            {activeTab === 'overview' && (
              <div className="top-section">
                <div className="card-visual">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 800, fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>IBK PREMIER</span>
                    <div style={{ width: '40px', height: '30px', background: 'linear-gradient(135deg, #d4af37, #f9e195)', borderRadius: '6px' }} />
                  </div>
                  <div className="card-number">{user?.accountNumber ? user.accountNumber.match(/.{1,4}/g).join(' ') : '•••• •••• •••• 7890'}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ fontSize: '9px', color: '#94a3b8', marginBottom: '4px' }}>CARD HOLDER</div>
                      <div style={{ fontWeight: 700, fontSize: '12px', textTransform: 'uppercase' }}>{user?.name}</div>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 900, fontStyle: 'italic' }}>VISA</div>
                  </div>
                </div>

                <div className="balance-panel">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>Total Available Balance</span>
                    <button style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '12px', minHeight: 'auto' }} onClick={() => setShowBalance(!showBalance)}>
                      {showBalance ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <h2 className="balance-amount">{showBalance ? `$${(user?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '••••••••'}</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <button className="btn-primary" onClick={() => navigate('/dashboard/transfer')}>💸 Transfer</button>
                    <button className="btn-secondary">💰 Deposit</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="tx-card">
                <div style={{ marginBottom: '15px' }}>
                  <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>Recent Activity</h3>
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none' }}>
                    {months.map((m, i) => <div key={m} className={`month-pill ${selectedMonth === i ? 'active' : ''}`} onClick={() => setSelectedMonth(i)}>{m}</div>)}
                  </div>
                </div>
                {filteredTransactions.length > 0 ? filteredTransactions.map(tx => (
                  <div key={tx._id} className="tx-row" onClick={() => setSelectedTx(tx)}>
                    <div style={{ display: 'flex', gap: '12px', flex: 1, alignItems: 'center' }}>
                      <div style={{ width: '44px', height: '44px', background: tx.type === 'credit' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tx.type === 'credit' ? '#22c55e' : '#94a3b8', fontSize: '18px', flexShrink: 0 }}>
                        {tx.type === 'credit' ? '↓' : '↑'}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description || 'Transfer'}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{new Date(tx.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 800, color: tx.type === 'credit' ? '#22c55e' : 'white', fontSize: '15px' }}>
                        {tx.type === 'credit' ? '+' : '-'}${(tx.amount || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', color: '#64748b', padding: '40px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                    No transactions in {months[selectedMonth]}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'security' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px', marginBottom: '30px' }}>
                  {[{label: '2FA Auth', status: user?.hasPin}, {label: 'AES-256', status: true}, {label: 'Session', status: true}].map((s, i) => (
                    <div key={i} style={{ background: '#070c1b', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ color: '#3b82f6', fontSize: '10px', fontWeight: 700, marginBottom: '8px' }}>SECURITY</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>{s.label}</div>
                      <div style={{ color: s.status ? '#22c55e' : '#f59e0b', fontSize: '11px' }}>{s.status ? '✓ Active' : '⚠ Setup'}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#070c1b', padding: '30px 20px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', maxWidth: '500px', margin: '0 auto' }}>
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔐</div>
                    <h3 style={{ fontSize: '18px', margin: 0, fontWeight: 700, marginBottom: '6px' }}>Transaction PIN</h3>
                    <p style={{ color: '#64748b', fontSize: '13px' }}>Required for transfers and withdrawals.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
                    {pin.map((d, i) => (
                      <input 
                        key={i} 
                        id={`pin-${i}`} 
                        type="password" 
                        style={{ width: '50px', height: '50px', fontSize: '20px', textAlign: 'center' }} 
                        value={d} 
                        maxLength={1} 
                        onChange={(e) => handlePinChange(i, e.target.value)} 
                        inputMode="numeric" 
                        pattern="[0-9]*"
                      />
                    ))}
                  </div>
                  <button className="btn-primary" onClick={handleConfirmPin} disabled={isUpdating} style={{ width: '100%' }}>
                    {isUpdating ? 'ENCRYPTING...' : 'UPDATE PIN'}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;