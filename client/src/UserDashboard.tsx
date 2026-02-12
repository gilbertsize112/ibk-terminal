import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
// ✅ IMPORT THE CLEAN API FUNCTIONS
import { setupPin, fetchProfile, fetchTransactions } from './api/index';

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

  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    if (!isMobile) setSidebarOpen(false);

    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      if (!token) { 
        if (isMounted) setLoading(false); 
        return; 
      }
      try {
        const profileRes = await fetchProfile();
        if (isMounted) {
          const userData = profileRes.data?.user || profileRes.data;
          setUser(userData);
        }
        try {
          const transRes = await fetchTransactions();
          if (isMounted) setTransactions(Array.isArray(transRes.data) ? transRes.data : transRes.data?.transactions || []);
        } catch (e) { 
          if (isMounted) setTransactions([]); 
        }
      } catch (err: any) {
        if (err.response?.status === 403) handleLogout();
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchDashboardData();
    return () => { isMounted = false; };
  }, []);

  const fetchDashboardDataManual = async () => {
    try {
      const profileRes = await fetchProfile();
      setUser(profileRes.data?.user || profileRes.data);
      const transRes = await fetchTransactions();
      setTransactions(Array.isArray(transRes.data) ? transRes.data : transRes.data?.transactions || []);
    } catch (err) {}
  };

  const filteredTransactions = Array.isArray(transactions) 
    ? transactions.filter(tx => {
        if (!tx?.createdAt) return false;
        return new Date(tx.createdAt).getMonth() === selectedMonth;
      })
    : [];

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
      const response = await setupPin(finalPin);
      if (response.data.success) {
        setShowSuccess(true);
        setPin(['', '', '', '']);
        setTimeout(() => { 
          setShowSuccess(false); 
          setActiveTab('overview'); 
          navigate('/dashboard'); 
          fetchDashboardDataManual(); 
        }, 2500);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "PIN setup failed.");
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

  if (loading) return <div style={{ height: '100vh', background: '#020617', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div style={{ width: '40px', height: '40px', border: '3px solid rgba(59,130,246,0.1)', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /><style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style></div>;

  if (!user) return <div style={{ height: '100vh', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><div>Connection Error. <button onClick={() => window.location.reload()} style={{color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline'}}>Refresh</button></div></div>;

  if (user?.isFrozen) return <div style={{ height: '100vh', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}><div style={{ background: '#070c1b', padding: '40px 20px', borderRadius: '24px', border: '1px solid rgba(239,68,68,0.3)', maxWidth: '500px', width: '100%', textAlign: 'center' }}><div style={{ fontSize: '60px', marginBottom: '20px' }}>⚠️</div><h2 style={{ fontSize: '28px', color: '#ef4444', fontWeight: 800, margin: '0 0 20px 0' }}>Account Suspended</h2><p style={{ color: '#94a3b8', lineHeight: '1.6' }}>Contact support@ibk-terminal.com to verify your account.</p><button onClick={handleLogout} style={{ marginTop: '30px', padding: '14px 28px', borderRadius: '12px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 700, cursor: 'pointer', width: '100%' }}>LOGOUT</button></div></div>;

  const isViewingSubPage = location.pathname !== '/dashboard' && !location.pathname.endsWith('/dashboard/');

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#f8fafc', fontFamily: 'Inter, sans-serif', display: 'flex', width: '100%', position: 'relative' }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        html, body { overflow-x: hidden; background: #020617; width: 100%; -webkit-overflow-scrolling: touch; }
        
        button { cursor: pointer; min-height: 48px; border: none; border-radius: 12px; font-weight: 600; transition: 0.3s; font-size: 16px; touch-action: manipulation; }
        .btn-primary { background: #3b82f6; color: white; padding: 12px 20px; box-shadow: 0 4px 15px rgba(59,130,246,0.2); }
        .btn-primary:active { transform: scale(0.96); }
        .btn-secondary { background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1); padding: 12px 20px; }
        
        input { padding: 14px; border: 2px solid rgba(255,255,255,0.1); border-radius: 14px; background: rgba(15,23,42,0.6); color: white; font-size: 16px; width: 100%; }
        
        .sidebar { width: 280px; background: #070c1b; border-right: 1px solid rgba(255,255,255,0.05); padding: 40px 24px; position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; z-index: 1001; }
        
        .nav-item { padding: 14px 18px; border-radius: 14px; margin-bottom: 10px; color: #94a3b8; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 12px; font-weight: 600; }
        .nav-item.active { background: #3b82f6; color: white; }
        
        .main-content { flex: 1; padding: 40px; max-width: 1200px; width: 100%; margin: 0 auto; padding-bottom: 100px; }
        
        .card-visual { width: 100%; max-width: 400px; aspect-ratio: 1.58/1; background: linear-gradient(135deg, #1e293b 0%, #020617 100%); border-radius: 24px; padding: 28px; position: relative; border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; }
        .card-visual::before { content: ""; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%); pointer-events: none; }
        
        .balance-panel { background: #070c1b; border: 1px solid rgba(255,255,255,0.05); border-radius: 28px; padding: 30px; }
        .balance-amount { font-size: 36px; font-weight: 800; color: #fff; margin: 12px 0 24px 0; letter-spacing: -1px; }

        .tx-row { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: rgba(255,255,255,0.02); border-radius: 18px; margin-bottom: 10px; border: 1px solid transparent; }
        .tx-row:active { background: rgba(255,255,255,0.05); border-color: rgba(59,130,246,0.3); }

        .mobile-top-bar { display: none; position: fixed; top: 0; left: 0; right: 0; background: rgba(2,6,23,0.8); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); padding: calc(15px + env(safe-area-inset-top)) 20px 15px 20px; z-index: 1000; border-bottom: 1px solid rgba(255,255,255,0.05); align-items: center; justify-content: space-between; }
        
        .mobile-nav { display: none; position: fixed; bottom: 0; left: 0; right: 0; background: rgba(7,12,27,0.9); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-top: 1px solid rgba(255,255,255,0.08); padding: 12px 10px calc(12px + env(safe-area-inset-bottom)) 10px; z-index: 1000; justify-content: space-around; }
        .mobile-item { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; color: #64748b; font-size: 10px; font-weight: 700; transition: 0.2s; }
        .mobile-item.active { color: #3b82f6; }
        .mobile-item span:first-child { font-size: 22px; margin-bottom: 2px; }

        @media (max-width: 1024px) {
          .sidebar { display: none; }
          .mobile-top-bar, .mobile-nav { display: flex; }
          .main-content { padding: 100px 16px 120px 16px; margin-top: 0; }
          .top-section { display: flex; flex-direction: column; gap: 20px; }
          .card-visual { max-width: 100%; }
        }

        .animate-fade { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* SUCCESS OVERLAY */}
      {showSuccess && <div style={{ position: 'fixed', inset: 0, background: '#020617', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} className="animate-fade"><div style={{ fontSize: '70px', marginBottom: '20px' }}>🛡️</div><h2 style={{ fontWeight: 800, fontSize: '24px' }}>SECURITY UPDATED</h2><p style={{ color: '#94a3b8' }}>Your secure PIN is now active.</p></div>}

      {/* TRANSACTION MODAL */}
      {selectedTx && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setSelectedTx(null)}>
          <div style={{ background: '#070c1b', width: '100%', maxWidth: '500px', borderRadius: '30px 30px 0 0', padding: '35px 25px calc(35px + env(safe-area-inset-bottom)) 25px', border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()} className="animate-fade">
             <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', margin: '0 auto 25px' }} />
             <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: selectedTx.type === 'credit' ? 'rgba(34,197,94,0.1)' : 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', color: selectedTx.type === 'credit' ? '#22c55e' : '#3b82f6', fontSize: '24px' }}>{selectedTx.type === 'credit' ? '↓' : '↑'}</div>
                <h2 style={{ fontSize: '22px', fontWeight: 800 }}>Transfer Receipt</h2>
                <p style={{ color: '#64748b', fontSize: '13px', marginTop: '5px' }}>{new Date(selectedTx.createdAt).toLocaleString()}</p>
             </div>
             <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '20px', padding: '20px', marginBottom: '25px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}><span style={{ color: '#64748b' }}>Status</span><span style={{ color: '#22c55e', fontWeight: 700 }}>Completed</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}><span style={{ color: '#64748b' }}>Reference</span><span style={{ fontFamily: 'monospace' }}>{selectedTx._id.slice(-12).toUpperCase()}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)' }}><span style={{ color: '#64748b', fontWeight: 700 }}>Amount</span><span style={{ fontSize: '20px', fontWeight: 900, color: selectedTx.type === 'credit' ? '#22c55e' : '#fff' }}>{selectedTx.type === 'credit' ? '+' : '-'}${selectedTx.amount?.toLocaleString()}</span></div>
             </div>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <button className="btn-secondary" onClick={() => handleShareReceipt(selectedTx)}>Share</button>
                <button className="btn-primary" onClick={() => setSelectedTx(null)}>Done</button>
             </div>
          </div>
        </div>
      )}

      {/* MOBILE TOP BAR */}
      <div className="mobile-top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '35px', height: '35px', background: '#3b82f6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px' }}>IBK</div>
          <span style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '0.5px' }}>HELLO, {user?.name?.split(' ')[0].toUpperCase()}</span>
        </div>
        <button onClick={handleLogout} style={{ background: 'none', color: '#ef4444', fontSize: '13px', fontWeight: 700, minHeight: 'auto' }}>LOGOUT</button>
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className="sidebar">
        <div style={{ fontSize: '22px', fontWeight: 900, marginBottom: '50px', color: '#3b82f6' }}>IBK TERMINAL</div>
        <div style={{ flex: 1 }}>
          {[
            { id: 'overview', name: 'Dashboard', icon: '🏠', path: '/dashboard' },
            { id: 'transfer', name: 'Transfers', icon: '💸', path: '/dashboard/transfer' },
            { id: 'transactions', name: 'Activity', icon: '📊', path: null },
            { id: 'cards', name: 'My Cards', icon: '💳', path: '/dashboard/cards' },
            { id: 'security', name: 'Security', icon: '🛡️', path: null },
          ].map((item) => (
            <div 
              key={item.id} 
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => {
                if (item.path) navigate(item.path);
                else setActiveTab(item.id as any);
              }}
            >
              <span>{item.icon}</span> {item.name}
            </div>
          ))}
        </div>
        <button className="btn-secondary" onClick={handleLogout}>Secure Logout</button>
      </aside>

      {/* MOBILE BOTTOM NAV */}
      <nav className="mobile-nav">
        {[
          { id: 'overview', icon: '🏠', label: 'Home', path: '/dashboard' },
          { id: 'transfer', icon: '💸', label: 'Pay', path: '/dashboard/transfer' },
          { id: 'transactions', icon: '📊', label: 'Activity', path: null },
          { id: 'cards', icon: '💳', label: 'Cards', path: '/dashboard/cards' },
          { id: 'security', icon: '🛡️', label: 'Safety', path: null },
        ].map((item) => (
          <div 
            key={item.id} 
            className={`mobile-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => {
              if (item.path) navigate(item.path);
              else setActiveTab(item.id as any);
            }}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        {isViewingSubPage ? (
          <div className="animate-fade">
            <Outlet context={{ user }} />
          </div>
        ) : (
          <div className="animate-fade">
            <div style={{ marginBottom: '30px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 900 }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
              <p style={{ color: '#64748b', fontSize: '14px' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>

            {activeTab === 'overview' && (
              <div className="top-section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                <div className="card-visual">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, marginBottom: '4px' }}>PREMIER ACCOUNT</div>
                      <div style={{ fontWeight: 800, fontSize: '16px' }}>VISA PLATINUM</div>
                    </div>
                    <div style={{ width: '45px', height: '32px', background: 'linear-gradient(135deg, #fcd34d, #b45309)', borderRadius: '6px' }} />
                  </div>
                  <div style={{ fontSize: '20px', letterSpacing: '4px', fontWeight: 600, fontFamily: 'monospace' }}>
                    •••• •••• •••• {user?.accountNumber?.toString().slice(-4) || '8842'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>{user?.name || 'VALUED CUSTOMER'}</span>
                    <span style={{ fontSize: '22px', fontWeight: 900, fontStyle: 'italic', opacity: 0.8 }}>VISA</span>
                  </div>
                </div>

                <div className="balance-panel">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 600 }}>Available Funds</span>
                    <button onClick={() => setShowBalance(!showBalance)} style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', minHeight: 'auto' }}>
                      {showBalance ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <div className="balance-amount">
                    {showBalance ? `$${(user?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '••••••••'}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <button className="btn-primary" onClick={() => navigate('/dashboard/transfer')}>Transfer</button>
                    <button className="btn-secondary" onClick={() => navigate('/dashboard/cards')}>Deposit</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="animate-fade">
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '25px', paddingBottom: '5px' }}>
                  {months.map((m, i) => (
                    <button 
                      key={m} 
                      onClick={() => setSelectedMonth(i)}
                      style={{ 
                        padding: '0 20px', 
                        borderRadius: '25px', 
                        background: selectedMonth === i ? '#3b82f6' : 'rgba(255,255,255,0.05)',
                        color: selectedMonth === i ? '#fff' : '#64748b',
                        fontSize: '13px', minHeight: '38px', whiteSpace: 'nowrap'
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map(tx => (
                    <div key={tx._id} className="tx-row" onClick={() => setSelectedTx(tx)}>
                      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: tx.type === 'credit' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tx.type === 'credit' ? '#22c55e' : '#94a3b8', fontSize: '20px' }}>
                          {tx.type === 'credit' ? '↓' : '↑'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '15px' }}>{tx.description || 'Electronic Transfer'}</div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{new Date(tx.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '16px', color: tx.type === 'credit' ? '#22c55e' : '#fff' }}>
                        {tx.type === 'credit' ? '+' : '-'}${tx.amount?.toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                    <div style={{ fontSize: '40px', marginBottom: '15px' }}>📅</div>
                    <p>No activity recorded for {months[selectedMonth]}.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'security' && (
              <div className="animate-fade" style={{ maxWidth: '500px', margin: '0 auto' }}>
                <div style={{ background: '#070c1b', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                  <div style={{ fontSize: '50px', marginBottom: '20px' }}>🔐</div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '10px' }}>Transfer PIN</h2>
                  <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '30px' }}>Ensure your account is protected. Set a 4-digit PIN for all outgoing transfers.</p>
                  
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '30px' }}>
                    {pin.map((d, i) => (
                      <input 
                        key={i} id={`pin-${i}`} type="password" 
                        style={{ width: '55px', height: '60px', textAlign: 'center', fontSize: '24px', fontWeight: 800 }} 
                        value={d} maxLength={1} onChange={(e) => handlePinChange(i, e.target.value)}
                        inputMode="numeric" pattern="[0-9]*"
                      />
                    ))}
                  </div>
                  
                  <button className="btn-primary" onClick={handleConfirmPin} disabled={isUpdating} style={{ width: '100%', height: '55px' }}>
                    {isUpdating ? 'SECURING...' : 'SAVE NEW PIN'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;