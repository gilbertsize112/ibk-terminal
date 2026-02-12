import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface User {
  _id: string;
  name: string;
  email: string;
  accountNumber: string;
  balance: number;
  hasPin: boolean;
}

const TransferMoney = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [recipientAccount, setRecipientAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('Funds Transfer');

  const [showConfirm, setShowConfirm] = useState(false);
  const [transferData, setTransferData] = useState<any>(null);

  const [showKeypad, setShowKeypad] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false); 
  const [isNavigating, setIsNavigating] = useState(false); // New state to prevent redirect loops

  const API_BASE_URL = import.meta.env.VITE_API_URL || '""';

  useEffect(() => {
    const fetchProfile = async () => {
      // If we are already heading to the receipt, stop fetching/redirecting here
      if (isNavigating) return;

      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/');
        
        const { data } = await axios.get(`${API_BASE_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        if (!isNavigating) navigate('/');
      }
    };
    fetchProfile();
  }, [navigate, API_BASE_URL, isNavigating]);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      setPinError(false); 
      setPin(prev => prev + num);
    }
  };

  const handleBackspace = () => {
    setPinError(false);
    setPin(prev => prev.slice(0, -1));
  };

  useEffect(() => {
    if (pin.length === 4) {
      const timer = setTimeout(() => {
        executeFinalAction();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pin]);

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert("System synchronizing. Please wait a moment.");
      return;
    }

    const currentBalance = Number(user.balance);
    const transferAmount = Number(amount);

    if (!recipientAccount || !amount) {
      alert("Please fill all security fields.");
      return;
    }

    if (currentBalance < transferAmount) {
      alert(`Insufficient liquidity in source account. Available: $${currentBalance.toLocaleString()}`);
      return;
    }

    if (user.accountNumber === recipientAccount) {
        alert("Cannot transfer to your own account.");
        return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_BASE_URL}/api/user/verify/${recipientAccount}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTransferData({
        senderName: user.name,
        senderAcc: user.accountNumber,
        recipientAcc: recipientAccount,
        recipientName: data.name,
        amount: transferAmount,
        memo: memo,
        date: new Date().toLocaleString()
      });
      setShowConfirm(true);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Recipient account number not recognized";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const executeFinalAction = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      // 1. PIN SETUP (Only if user doesn't have one)
      if (!user?.hasPin) {
        try {
          await axios.post(`${API_BASE_URL}/api/user/setup-pin`, { pin }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          // Update local state so we don't try to set it again
          setUser(prev => prev ? { ...prev, hasPin: true } : null);
        } catch (setupErr: any) {
          console.error("PIN Setup Failed:", setupErr);
          setPinError(true);
          setPin('');
          setLoading(false);
          return; 
        }
      }

      // 2. TRANSFER EXECUTION
      const response = await axios.post(`${API_BASE_URL}/api/user/transfer`, {
        recipientAccountNumber: recipientAccount,
        amount: Number(amount),
        memo,
        pin 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Mark that we are now in the navigation phase
      setIsNavigating(true);

      const generatedId = response.data.transactionId || "TXN-" + Math.random().toString(36).toUpperCase().substring(2, 12);
      
      // Explicitly close UI elements
      setShowKeypad(false);
      setShowConfirm(false);

      // SAFETY FIX: Check for recipientName one last time
      const finalRecipientName = transferData?.recipientName || "Valued Client";

      // FINAL REDIRECT
      navigate('/dashboard/receipt', { 
        state: { 
          details: {
            senderName: user?.name || "Member",
            senderAcc: user?.accountNumber || "N/A",
            recipientAcc: recipientAccount,
            recipientName: finalRecipientName,
            amount: Number(amount),
            memo: memo,
            transactionId: generatedId,
            date: new Date().toLocaleString()
          } 
        } 
      });

    } catch (err: any) {
      console.error("Transfer error:", err);
      const message = err.response?.data?.message || "";
      
      if (message.toLowerCase().includes("pin")) {
        setPinError(true);
      } else {
        alert(message || "Transfer failed. Please check your connection.");
      }
      setPin(''); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transfer-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideInUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }

        @keyframes pulseBorder {
          0% { border-color: rgba(59, 130, 246, 0.2); }
          50% { border-color: rgba(59, 130, 246, 0.6); }
          100% { border-color: rgba(59, 130, 246, 0.2); }
        }

        @keyframes modalEnter {
          0% { transform: scale(0.9) translateY(40px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }

        .shake-err {
          animation: shake 0.2s ease-in-out 0s 2;
        }

        .transfer-page {
          padding: 20px 20px 60px 20px;
          padding-top: max(40px, env(safe-area-inset-top));
          background: #020617;
          background-image: 
            radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.05) 0%, transparent 40%),
            radial-gradient(circle at 100% 100%, rgba(30, 58, 138, 0.1) 0%, transparent 40%);
          min-height: 100vh;
          color: #f8fafc;
          font-family: 'Inter', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
        }

        .transfer-card {
          width: 100%;
          max-width: 550px;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          padding: 48px;
          border-radius: 32px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.6);
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          box-sizing: border-box;
          position: relative;
        }

        .transfer-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent);
        }

        .input-group {
          margin-bottom: 28px;
          position: relative;
        }

        .custom-input {
          width: 100%;
          padding: 18px;
          border-radius: 16px;
          background: #070c1b;
          border: 1px solid rgba(255,255,255,0.05);
          color: white;
          font-size: 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-sizing: border-box;
          outline: none;
          appearance: none;
        }

        .custom-input:focus {
          border-color: #3b82f6;
          background: #020617;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.1);
        }

        .source-display {
          width: 100%;
          padding: 18px;
          border-radius: 16px;
          background: rgba(59, 130, 246, 0.03);
          border: 1px solid rgba(59, 130, 246, 0.2);
          color: #94a3b8;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 24px;
          animation: pulseBorder 3s infinite;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .primary-btn {
          width: 100%;
          padding: 20px;
          border-radius: 16px;
          background: #3b82f6;
          color: white;
          border: none;
          font-weight: 700;
          cursor: pointer;
          font-size: 16px;
          letter-spacing: 0.5px;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
          font-family: 'Plus Jakarta Sans', sans-serif;
          touch-action: manipulation;
        }

        .primary-btn:active {
          transform: scale(0.98);
          opacity: 0.9;
        }

        .primary-btn:hover:not(:disabled) {
          background: #2563eb;
        }

        .primary-btn:disabled {
          background: #1e293b;
          color: #475569;
          cursor: not-allowed;
          box-shadow: none;
        }

        .back-link {
          align-self: flex-start;
          max-width: 550px;
          width: 100%;
          margin: 0 auto 30px auto;
          color: #64748b;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 700;
          transition: 0.2s;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 1px;
          touch-action: manipulation;
        }

        .back-link:hover { color: #f8fafc; }

        .max-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          color: #3b82f6;
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.3s;
          touch-action: manipulation;
        }

        .modal-container {
          position: fixed;
          inset: 0;
          background: rgba(2, 6, 23, 0.9);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
          overflow-y: auto;
        }

        .confirm-card {
          width: 100%;
          max-width: 480px;
          background: #0f172a;
          padding: 40px;
          border-radius: 32px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
          animation: modalEnter 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 50px 100px rgba(0,0,0,0.8);
        }

        .confirm-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
          animation: slideInRight 0.6s ease forwards;
          opacity: 0;
        }

        .step-indicator {
           display: flex;
           gap: 8px;
           margin-bottom: 32px;
           justify-content: center;
        }
        .step { width: 30px; height: 4px; border-radius: 2px; background: #1e293b; }
        .step.active { background: #3b82f6; }

        .keypad-sheet {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: #0f172a;
          border-top: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 40px 40px 0 0;
          padding: 24px 20px calc(24px + env(safe-area-inset-bottom)) 20px;
          z-index: 20000;
          animation: slideInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 600px;
          margin: 0 auto;
        }

        .pin-dots {
          display: flex;
          gap: 20px;
          margin: 30px 0;
        }

        .dot {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid #334155;
          transition: all 0.2s;
        }

        .dot.filled {
          background: #3b82f6;
          border-color: #3b82f6;
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.6);
          transform: scale(1.2);
        }

        .dot.error {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.2);
        }

        .key-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          width: 100%;
        }

        .key {
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 20px;
          font-size: 24px;
          font-weight: 700;
          color: white;
          cursor: pointer;
          transition: 0.1s;
          touch-action: manipulation;
          -webkit-user-select: none;
        }

        .key:active {
          background: #3b82f6;
          transform: scale(0.92);
        }

        @media (max-width: 640px) {
          .transfer-page { padding: 20px 16px 40px 16px; padding-top: max(30px, env(safe-area-inset-top)); }
          .transfer-card { padding: 32px 24px; border-radius: 24px; }
          .primary-btn { padding: 18px; }
          .key { height: 60px; }
        }
      `}</style>

      <div className="back-link" onClick={() => navigate('/dashboard')}>
        <span style={{fontSize: '18px'}}>‹</span> Return to Dashboard
      </div>

      <header style={{ textAlign: 'center', marginBottom: '40px', animation: 'fadeIn 0.6s ease' }}>
        <div className="step-indicator">
            <div className="step active"></div>
            <div className="step active"></div>
            <div className="step"></div>
        </div>
        <h2 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 12px 0', fontFamily: 'Plus Jakarta Sans', letterSpacing: '-1px' }}>
          Transfer Protocol
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '15px', maxWidth: '320px', margin: '0 auto', lineHeight: '1.4' }}>Secure peer-to-peer asset movement over encrypted banking rails.</p>
      </header>

      <div className="transfer-card">
        <form onSubmit={handleInitiate}>
          
          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '11px', fontWeight: 800, color: '#3b82f6', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Source Account</label>
            <div className="source-display">
               <span>{user ? user.name : 'Loading...'}</span>
               <span style={{fontFamily: 'Space Mono', color: 'white'}}>{user?.accountNumber}</span>
            </div>
          </div>

          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '11px', fontWeight: 800, color: '#64748b', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Target Account Number</label>
            <input 
              type="text"
              inputMode="numeric"
              className="custom-input"
              placeholder="Enter 10-digit destination"
              value={recipientAccount}
              onChange={(e) => setRecipientAccount(e.target.value)}
              required
              style={{ fontFamily: 'Space Mono' }}
            />
          </div>

          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '11px', fontWeight: 800, color: '#64748b', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Amount (USD)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#3b82f6', fontWeight: 800, fontSize: '20px' }}>$</span>
              <input 
                type="number"
                inputMode="decimal"
                className="custom-input"
                style={{ paddingLeft: '38px', paddingRight: '70px', fontSize: '24px', fontWeight: 800, fontFamily: 'Plus Jakarta Sans' }}
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="max-btn"
                onClick={() => user && setAmount(user.balance.toString())}
              >
                MAX
              </button>
            </div>
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#475569', textAlign: 'right' }}>
                Available: <span style={{color: '#94a3b8'}}>${(user?.balance || 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="input-group" style={{marginBottom: '40px'}}>
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '11px', fontWeight: 800, color: '#64748b', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Transaction Memo</label>
            <input 
              type="text"
              className="custom-input"
              placeholder="What's this for?"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'VERIFYING...' : 'INITIATE SECURE TRANSFER'}
          </button>

          <div style={{marginTop: '24px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#475569', fontSize: '11px', fontWeight: 700}}>
             <span style={{fontSize: '14px'}}>🔒</span> END-TO-END ENCRYPTED TRANSACTION
          </div>
        </form>
      </div>

      {showConfirm && (
        <div className="modal-container">
          <div className="confirm-card">
            <div style={{ fontSize: '56px', marginBottom: '20px', animation: 'float 3s infinite ease-in-out' }}>🛡️</div>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '24px', fontWeight: 800, color: '#fff', letterSpacing: '-1px', fontFamily: 'Plus Jakarta Sans' }}>Authorize Transfer</h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '28px', lineHeight: '1.5' }}>Please verify the transaction details below.</p>
            
            <div style={{ background: 'rgba(2, 6, 23, 0.4)', padding: '24px', borderRadius: '24px', textAlign: 'left', marginBottom: '28px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              
              <div className="confirm-item" style={{ animationDelay: '0.1s' }}>
                <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Origin</span>
                <span style={{ fontWeight: 700, fontSize: '13px', color: '#f8fafc' }}>{transferData?.senderName}</span>
              </div>

              <div className="confirm-item" style={{ animationDelay: '0.2s' }}>
                <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Destination</span>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '13px', color: '#3b82f6' }}>{transferData?.recipientName}</div>
                    <div style={{ fontWeight: 700, fontSize: '11px', color: '#64748b', fontFamily: 'Space Mono' }}>{transferData?.recipientAcc}</div>
                </div>
              </div>

              <div className="confirm-item" style={{ animationDelay: '0.3s' }}>
                <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Reference</span>
                <span style={{ fontWeight: 600, fontSize: '13px', color: '#94a3b8' }}>{transferData?.memo}</span>
              </div>

              <div className="confirm-item" style={{ animationDelay: '0.4s', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', marginTop: '16px' }}>
                <span style={{ color: '#fff', fontSize: '13px', fontWeight: 800 }}>Total Amount</span>
                <span style={{ fontWeight: 900, color: '#10b981', fontSize: '24px', fontFamily: 'Plus Jakarta Sans' }}>${(Number(amount) || 0).toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setShowConfirm(false)}
                style={{ flex: 1, padding: '18px', borderRadius: '16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontWeight: 700, cursor: 'pointer' }}>
                DECLINE
              </button>
              <button 
                onClick={() => setShowKeypad(true)}
                disabled={loading}
                className="primary-btn"
                style={{ flex: 2, padding: '18px' }}>
                {loading ? 'ENCRYPTING...' : 'CONFIRM & SEND'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showKeypad && (
        <div className="modal-container" style={{ alignItems: 'flex-end', padding: 0 }}>
          <div className="keypad-sheet">
            <div style={{ width: '40px', height: '5px', background: '#334155', borderRadius: '10px', marginBottom: '20px' }} onClick={() => setShowKeypad(false)}></div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'white', margin: 0 }}>
              {user?.hasPin ? "Enter Transaction PIN" : "Create Transaction PIN"}
            </h3>
            
            {pinError ? (
              <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px', marginBottom: '0', fontWeight: 700 }}>
                  Invalid PIN. Please try again.
              </p>
            ) : (
              <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px', marginBottom: '0' }}>
                {user?.hasPin ? "Authorize this asset movement" : "Set a 4-digit code"}
              </p>
            )}

            <div className={`pin-dots ${pinError ? 'shake-err' : ''}`}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`dot ${pin.length > i ? 'filled' : ''} ${pinError ? 'error' : ''}`}></div>
              ))}
            </div>

            <div className="key-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <div key={num} className="key" onClick={() => handleKeyPress(num.toString())}>{num}</div>
              ))}
              <div className="key" style={{ background: 'transparent', border: 'none' }} onClick={() => setShowKeypad(false)}>✕</div>
              <div className="key" onClick={() => handleKeyPress('0')}>0</div>
              <div className="key" style={{ background: 'transparent', border: 'none' }} onClick={handleBackspace}>⌫</div>
            </div>

            <p style={{ marginTop: '24px', color: '#475569', fontSize: '10px', fontWeight: 800, letterSpacing: '1px' }}>SECURE KEYBOARD BY GEMINI RAILS</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransferMoney;