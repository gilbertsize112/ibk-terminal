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
    <div style={{ height: '100vh', background: '#020617', color: '#f8fafc', fontFamily: 'Inter, sans-serif', display: 'flex', width: '100%', overflow: 'hidden' }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        
        /* FIX FOR SCROLLING */
        .scroll-container { 
          flex: 1; 
          height: 100vh; 
          overflow-y: auto; 
          -webkit-overflow-scrolling: touch; 
          display: flex; 
          flex-direction: column;
        }

        button { cursor: pointer; min-height: 44px; border: none; border-radius: 12px; font-weight: 600; transition: 0.2s; font-size: 15px; }
        .btn-primary { background: #3b82f6; color: white; box-shadow: 0 4px 12px rgba(59,130,246,0.25); }
        .btn-secondary { background: rgba(255,255,255,0.06); color: white; border: 1px solid rgba(255,255,255,0.1); }
        
        .sidebar { width: 260px; background: #070c1b; border-right: 1px solid rgba(255,255,255,0.05); padding: 40px 20px; display: flex; flex-direction: column; }
        .nav-item { padding: 12px 16px; border-radius: 12px; margin-bottom: 6px; color: #64748b; cursor: pointer; display: flex; align-items: center; gap: 12px; font-weight: 500; }
        .nav-item.active { background: rgba(59,130,246,0.1); color: #3b82f6; font-weight: 700; }
        
        .main-content { padding: 40px; max-width: 1100px; width: 100%; margin: 0 auto; flex: 1; }
        
        /* PREMIUM CARD STYLE */
        .card-visual { 
          width: 100%; 
          aspect-ratio: 1.6/1; 
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); 
          border-radius: 20px; 
          padding: 24px; 
          position: relative; 
          border: 1px solid rgba(255,255,255,0.1); 
          display: flex; 
          flex-direction: column; 
          justify-content: space-between;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        .card-chip { width: 42px; height: 30px; background: linear-gradient(135deg, #e2e8f0, #94a3b8); border-radius: 4px; }
        
        .balance-panel { background: #0f172a; border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 24px; }
        
        .mobile-top-bar { display: none; position: sticky; top: 0; background: #020617; padding: 15px 20px; z-index: 100; border-bottom: 1px solid rgba(255,255,255,0.05); align-items: center; justify-content: space-between; }
        .mobile-nav { display: none; position: fixed; bottom: 0; left: 0; right: 0; background: #070c1b; border-top: 1px solid rgba(255,255,255,0.05); padding: 10px 10px env(safe-area-inset-bottom); z-index: 100; justify-content: space-around; }
        
        @media (max-width: 1024px) {
          .sidebar { display: none; }
          .mobile-top-bar, .mobile-nav { display: flex; }
          .main-content { padding: 20px 20px 100px 20px; }
          .top-grid { grid-template-columns: 1fr !important; }
        }

        .animate-fade { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* SUCCESS OVERLAY */}
      {showSuccess && <div style={{ position: 'fixed', inset: 0, background: '#020617', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} className="animate-fade"><div style={{ fontSize: '70px', marginBottom: '20px' }}>🛡️</div><h2 style={{ fontWeight: 800, fontSize: '24px' }}>SECURITY UPDATED</h2><p style={{ color: '#94a3b8' }}>Your secure PIN is now active.</p></div>}

      {/* TRANSACTION MODAL */}
      {selectedTx && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setSelectedTx(null)}>
          <div style={{ background: '#070c1b', width: '100%', maxWidth: '500px', borderRadius: '24px 24px 0 0', padding: '30px 20px calc(30px + env(safe-area-inset-bottom)) 20px' }} onClick={e => e.stopPropagation()} className="animate-fade">
             <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', margin: '0 auto 20px' }} />
             <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Transaction Details</h2>
             </div>
             <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', padding: '20px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}><span style={{ color: '#64748b' }}>Status</span><span style={{ color: '#22c55e', fontWeight: 700 }}>Success</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}><span style={{ color: '#64748b' }}>Description</span><span>{selectedTx.description}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}><span style={{ color: '#64748b', fontWeight: 700 }}>Amount</span><span style={{ fontSize: '18px', fontWeight: 900, color: selectedTx.type === 'credit' ? '#22c55e' : '#fff' }}>${selectedTx.amount?.toLocaleString()}</span></div>
             </div>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button className="btn-secondary" onClick={() => handleShareReceipt(selectedTx)}>Share</button>
                <button className="btn-primary" onClick={() => setSelectedTx(null)}>Done</button>
             </div>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="sidebar">
        <div style={{ fontSize: '20px', fontWeight: 900, marginBottom: '40px', color: '#3b82f6', letterSpacing: '-1px' }}>IBK TERMINAL</div>
        <div style={{ flex: 1 }}>
          {[
            { id: 'overview', name: 'Home', icon: '🏠', path: '/dashboard' },
            { id: 'transfer', name: 'Send Money', icon: '💸', path: '/dashboard/transfer' },
            { id: 'transactions', name: 'Activity', icon: '📊', path: null },
            { id: 'cards', name: 'Cards', icon: '💳', path: '/dashboard/cards' },
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
              <span style={{ fontSize: '18px' }}>{item.icon}</span> {item.name}
            </div>
          ))}
        </div>
        <button className="btn-secondary" onClick={handleLogout} style={{ marginTop: '20px' }}>Logout</button>
      </aside>

      {/* MOBILE CONTENT WRAPPER */}
      <div className="scroll-container">
        <div className="mobile-top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', background: '#3b82f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '12px' }}>IBK</div>
            <span style={{ fontWeight: 700, fontSize: '14px' }}>Hi, {user?.name?.split(' ')[0]}</span>
          </div>
          <button onClick={handleLogout} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '5px 12px', fontSize: '12px', minHeight: '32px' }}>LOGOUT</button>
        </div>

        <main className="main-content">
          {isViewingSubPage ? (
            <div className="animate-fade">
              <Outlet context={{ user }} />
            </div>
          ) : (
            <div className="animate-fade">
              <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Account Overview</h1>
                <p style={{ color: '#64748b', fontSize: '13px' }}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>

              {activeTab === 'overview' && (
                <div className="top-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
                  {/* CARD SECTION */}
                  <div className="card-visual">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, letterSpacing: '1px' }}>VISA PLATINUM</p>
                        <p style={{ fontWeight: 600, fontSize: '14px' }}>IBK Terminal</p>
                      </div>
                      <div className="card-chip" />
                    </div>
                    
                    <div style={{ fontSize: '18px', letterSpacing: '4px', fontWeight: 500, fontFamily: 'monospace', color: '#fff' }}>
                      •••• •••• •••• {user?.accountNumber?.toString().slice(-4) || '8842'}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div>
                        <p style={{ fontSize: '9px', color: '#64748b', marginBottom: '2px' }}>CARD HOLDER</p>
                        <p style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>{user?.name || 'VALUED CUSTOMER'}</p>
                      </div>
                      <span style={{ fontSize: '20px', fontWeight: 900, fontStyle: 'italic', color: '#fff', opacity: 0.9 }}>VISA</span>
                    </div>
                  </div>

                  {/* BALANCE SECTION */}
                  <div className="balance-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>Balance</span>
                      <button onClick={() => setShowBalance(!showBalance)} style={{ background: 'none', color: '#3b82f6', fontSize: '12px' }}>
                        {showBalance ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 900, marginBottom: '20px', letterSpacing: '-1px' }}>
                      {showBalance ? `$${(user?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '••••••••'}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <button className="btn-primary" onClick={() => navigate('/dashboard/transfer')}>Transfer</button>
                      <button className="btn-secondary" onClick={() => navigate('/dashboard/cards')}>Cards</button>
                    </div>
                  </div>
                </div>
              )}

              {/* TRANSACTIONS SECTION */}
              {(activeTab === 'overview' || activeTab === 'transactions') && (
                <div style={{ marginTop: '32px' }} className="animate-fade">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Recent Activity</h3>
                    {activeTab === 'overview' && <button onClick={() => setActiveTab('transactions')} style={{ background: 'none', color: '#3b82f6', fontSize: '13px' }}>View All</button>}
                  </div>

                  {activeTab === 'transactions' && (
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '20px', paddingBottom: '5px' }}>
                      {months.map((m, i) => (
                        <button key={m} onClick={() => setSelectedMonth(i)} style={{ padding: '0 16px', borderRadius: '20px', background: selectedMonth === i ? '#3b82f6' : 'rgba(255,255,255,0.05)', color: selectedMonth === i ? '#fff' : '#64748b', fontSize: '12px', minHeight: '34px', whiteSpace: 'nowrap' }}>{m}</button>
                      ))}
                    </div>
                  )}

                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.slice(0, activeTab === 'overview' ? 5 : undefined).map(tx => (
                      <div key={tx._id} className="animate-fade" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', marginBottom: '10px', border: '1px solid rgba(255,255,255,0.03)' }} onClick={() => setSelectedTx(tx)}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: tx.type === 'credit' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tx.type === 'credit' ? '#22c55e' : '#94a3b8' }}>
                            {tx.type === 'credit' ? '↓' : '↑'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '14px' }}>{tx.description || 'Transfer'}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{new Date(tx.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '15px', color: tx.type === 'credit' ? '#22c55e' : '#fff' }}>
                          {tx.type === 'credit' ? '+' : '-'}${tx.amount?.toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', background: 'rgba(255,255,255,0.01)', borderRadius: '20px' }}>
                      No transactions found.
                    </div>
                  )}
                </div>
              )}

              {/* SECURITY SECTION */}
              {activeTab === 'security' && (
                <div className="animate-fade" style={{ maxWidth: '450px', margin: '20px auto' }}>
                  <div style={{ background: '#0f172a', padding: '30px', borderRadius: '24px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔐</div>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>Secure PIN</h2>
                    <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>Set a 4-digit PIN for your transactions.</p>
                    
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px' }}>
                      {pin.map((d, i) => (
                        <input key={i} id={`pin-${i}`} type="password" style={{ width: '50px', height: '55px', textAlign: 'center', fontSize: '20px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} value={d} maxLength={1} onChange={(e) => handlePinChange(i, e.target.value)} inputMode="numeric" />
                      ))}
                    </div>
                    
                    <button className="btn-primary" onClick={handleConfirmPin} disabled={isUpdating} style={{ width: '100%' }}>
                      {isUpdating ? 'Saving...' : 'Set Transaction PIN'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="mobile-nav">
        {[
          { id: 'overview', icon: '🏠', label: 'Home', path: '/dashboard' },
          { id: 'transfer', icon: '💸', label: 'Send', path: '/dashboard/transfer' },
          { id: 'transactions', icon: '📊', label: 'History', path: null },
          { id: 'cards', icon: '💳', label: 'Cards', path: '/dashboard/cards' },
          { id: 'security', icon: '🛡️', label: 'Secure', path: null },
        ].map((item) => (
          <div 
            key={item.id} 
            className="mobile-nav-item"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1, color: activeTab === item.id ? '#3b82f6' : '#64748b' }}
            onClick={() => {
              if (item.path) navigate(item.path);
              else setActiveTab(item.id as any);
            }}
          >
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            <span style={{ fontSize: '10px', fontWeight: 700 }}>{item.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default UserDashboard;