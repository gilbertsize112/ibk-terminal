import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// import { generateReceiptPDF } from './ReceiptGenerator'; // Uncomment when ready

interface User {
  _id: string;
  name: string;
  email: string;
  accountNumber: string;
  balance: number;
}

const TransferMoney = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [recipientAccount, setRecipientAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('Funds Transfer');

  // Logic State
  const [showConfirm, setShowConfirm] = useState(false);
  const [transferData, setTransferData] = useState<any>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch the logged-in user's profile on load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/');
        
        const { data } = await axios.get(`${API_BASE_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        navigate('/');
      }
    };
    fetchProfile();
  }, [navigate, API_BASE_URL]);

  const handleInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // UPDATED: Added safety check to ensure user data is loaded
    if (!user) {
      alert("System synchronizing. Please wait a moment.");
      return;
    }

    // UPDATED: Force balance and amount to Numbers for accurate comparison
    const currentBalance = Number(user.balance);
    const transferAmount = Number(amount);

    if (!recipientAccount || !amount) {
      alert("Please fill all security fields.");
      return;
    }

    // UPDATED: Now correctly compares numbers to fix "Insufficient liquidity" bug
    if (currentBalance < transferAmount) {
      alert(`Insufficient liquidity in source account. Available: $${currentBalance.toLocaleString()}`);
      return;
    }

    if (user.accountNumber === recipientAccount) {
        alert("Cannot transfer to your own account.");
        return;
    }

    // Set data for the Confirmation Modal
    setTransferData({
      senderName: user.name,
      senderAcc: user.accountNumber,
      recipientAcc: recipientAccount,
      amount: transferAmount,
      memo: memo, // UPDATED: Added memo to the confirmation data
      date: new Date().toLocaleString()
    });
    setShowConfirm(true);
  };

  const executeTransfer = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Using the User-specific route we updated earlier
      await axios.post(`${API_BASE_URL}/api/user/transfer`, {
        recipientAccountNumber: recipientAccount,
        amount: Number(amount),
        memo
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // --- CRITICAL UPDATE: GENERATE ID AND NAVIGATE TO RECEIPT ---
      const generatedId = "TXN-" + Math.random().toString(36).toUpperCase().substring(2, 12);
      
      // We navigate FIRST and pass the state
      navigate('/receipt', { 
        state: { 
          details: {
            senderName: user?.name,
            senderAcc: user?.accountNumber,
            recipientAcc: recipientAccount,
            amount: Number(amount),
            memo: memo,
            transactionId: generatedId,
            date: new Date().toLocaleString()
          } 
        } 
      });

      // Then we close the modal (this prevents the dashboard redirect conflict)
      setShowConfirm(false);
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Transfer failed: Unauthorized or System Error.";
      
      // Direct feedback for "Recipient not recognized" or Session Expired
      if (err.response?.status === 401 || errorMessage.toLowerCase().includes("expired")) {
        alert("SESSION EXPIRED: Please log in again for security.");
        localStorage.removeItem('token');
        navigate('/');
      } else {
        alert(errorMessage);
        setShowConfirm(false); // Close modal so user can fix the account number
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transfer-page">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
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

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        @keyframes modalEnter {
          0% { transform: scale(0.8) translateY(40px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.2); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.5); }
        }

        .transfer-page {
          padding: 40px 20px;
          background: radial-gradient(circle at top right, #0f172a, #020617);
          min-height: 100vh;
          color: #e2e8f0;
          font-family: 'Inter', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-sizing: border-box;
        }

        .transfer-card {
          width: 100%;
          max-width: 550px;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(12px);
          padding: 40px;
          border-radius: 28px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          box-sizing: border-box;
        }

        .input-group {
          margin-bottom: 24px;
          position: relative;
        }

        .custom-input {
          width: 100%;
          padding: 16px;
          border-radius: 14px;
          background: rgba(2, 6, 23, 0.8);
          border: 1px solid #1e293b;
          color: white;
          font-size: 15px;
          transition: all 0.3s ease;
          box-sizing: border-box;
          outline: none;
        }

        .custom-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
          background: #020617;
        }

        .source-display {
          width: 100%;
          padding: 16px;
          border-radius: 14px;
          background: linear-gradient(90deg, rgba(30, 41, 59, 0.5), rgba(15, 23, 42, 0.5));
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #94a3b8;
          font-size: 14px;
          margin-bottom: 24px;
          animation: pulseBorder 3s infinite;
        }

        .primary-btn {
          width: 100%;
          padding: 18px;
          border-radius: 14px;
          background: linear-gradient(90deg, #3b82f6, #2563eb, #3b82f6);
          background-size: 200% 100%;
          color: white;
          border: none;
          font-weight: 700;
          cursor: pointer;
          font-size: 16px;
          letter-spacing: 0.5px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
        }

        .primary-btn:hover:not(:disabled) {
          background-position: 100% 0;
          transform: translateY(-2px);
          box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.4);
        }

        .primary-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          filter: grayscale(0.5);
        }

        .back-link {
          align-self: flex-start;
          max-width: 550px;
          width: 100%;
          margin: 0 auto 24px auto;
          color: #64748b;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          transition: color 0.2s;
          cursor: pointer;
        }

        .back-link:hover { color: #3b82f6; }

        .max-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: #1e293b;
          border: 1px solid #334155;
          color: #3b82f6;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s;
        }

        .max-btn:hover {
          background: #3b82f6;
          color: white;
        }

        .modal-container {
          position: fixed;
          inset: 0;
          background: rgba(2, 6, 23, 0.95);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5000;
          padding: 20px;
        }

        .modal-animate {
          animation: modalEnter 0.5s cubic-bezier(0.16, 1, 0.3, 1), glow 4s infinite;
        }

        .confirm-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 14px;
          animation: slideInRight 0.6s ease forwards;
          opacity: 0;
        }

        @media (max-width: 640px) {
          .transfer-page { padding: 20px; }
          .transfer-card { padding: 25px; border-radius: 20px; }
          .primary-btn { padding: 16px; }
        }
      `}</style>

      {/* Back Button */}
      <div className="back-link" onClick={() => navigate('/dashboard')}>
        <span>←</span> Back to Overview
      </div>

      <div style={{ textAlign: 'center', marginBottom: '40px', animation: 'fadeIn 0.6s ease' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 8px 0', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Transfer Protocol
        </h2>
        <p style={{ color: '#64748b', fontSize: '16px' }}>Secure peer-to-peer asset movement.</p>
      </div>

      <div className="transfer-card">
        <form onSubmit={handleInitiate}>
          
          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '11px', fontWeight: 800, color: '#3b82f6', letterSpacing: '1px' }}>SOURCE ACCOUNT (SENDER)</label>
            <div className="source-display">
               {user ? `${user.name} • ${user.accountNumber}` : 'Establishing secure connection...'}
            </div>
          </div>

          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '11px', fontWeight: 800, color: '#64748b', letterSpacing: '1px' }}>TARGET ACCOUNT NUMBER</label>
            <input 
              type="text"
              className="custom-input"
              placeholder="Enter 10-digit destination"
              value={recipientAccount}
              onChange={(e) => setRecipientAccount(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '11px', fontWeight: 800, color: '#64748b', letterSpacing: '1px' }}>AMOUNT (USD)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontWeight: 700 }}>$</span>
              <input 
                type="number"
                className="custom-input"
                style={{ paddingLeft: '32px', paddingRight: '60px', fontSize: '20px', fontWeight: 700 }}
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
          </div>

          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '11px', fontWeight: 800, color: '#64748b', letterSpacing: '1px' }}>TRANSACTION MEMO</label>
            <input 
              type="text"
              className="custom-input"
              placeholder="What's this for?"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>

          <button type="submit" className="primary-btn">
            INITIATE SECURE TRANSFER
          </button>
        </form>
      </div>

      {/* --- CONFIRMATION MODAL --- */}
      {showConfirm && (
        <div className="modal-container">
          <div className="modal-animate" style={{ width: '100%', maxWidth: '450px', background: '#0f172a', padding: '40px', borderRadius: '32px', border: '1px solid #3b82f6', textAlign: 'center' }}>
            <div style={{ fontSize: '60px', marginBottom: '20px', animation: 'float 3s infinite ease-in-out' }}>🛡️</div>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '26px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>Authorize Transfer</h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '32px' }}>Verification required for ledger synchronization.</p>
            
            <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '24px', borderRadius: '24px', textAlign: 'left', marginBottom: '32px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
              
              <div className="confirm-item" style={{ animationDelay: '0.2s' }}>
                <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Origin</span>
                <span style={{ fontWeight: 600, fontSize: '14px', color: '#f8fafc' }}>{transferData?.senderName}</span>
              </div>

              <div className="confirm-item" style={{ animationDelay: '0.3s' }}>
                <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Destination</span>
                <span style={{ fontWeight: 600, fontSize: '14px', color: '#3b82f6' }}>ID: {transferData?.recipientAcc}</span>
              </div>

              <div className="confirm-item" style={{ animationDelay: '0.4s' }}>
                <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Description</span>
                <span style={{ fontWeight: 500, fontSize: '14px', color: '#94a3b8', fontStyle: 'italic' }}>"{transferData?.memo}"</span>
              </div>

              <div className="confirm-item" style={{ animationDelay: '0.5s', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', marginTop: '12px' }}>
                <span style={{ color: '#fff', fontSize: '14px', fontWeight: 800 }}>Transfer Total</span>
                <span style={{ fontWeight: 900, color: '#10b981', fontSize: '24px' }}>${transferData?.amount.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                onClick={() => setShowConfirm(false)}
                style={{ flex: 1, padding: '18px', borderRadius: '16px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #1e293b', color: '#94a3b8', fontWeight: 700, cursor: 'pointer', transition: '0.3s' }}>
                CANCEL
              </button>
              <button 
                onClick={executeTransfer}
                disabled={loading}
                className="primary-btn"
                style={{ flex: 2, padding: '18px' }}>
                {loading ? 'ENCRYPTING...' : 'CONFIRM & SEND'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransferMoney;