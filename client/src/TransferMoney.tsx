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
  const [memo, setMemo] = useState('');

  const [showConfirm, setShowConfirm] = useState(false);
  const [transferData, setTransferData] = useState<any>(null);

  const [showKeypad, setShowKeypad] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false); 
  const [isNavigating, setIsNavigating] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || '""';

  useEffect(() => {
    const fetchProfile = async () => {
      if (isNavigating) return;
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/');
        const { data } = await axios.get(`${API_BASE_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(data);
      } catch (err) {
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
    if (!user) return;

    const transferAmount = Number(amount);
    if (!recipientAccount || !amount) return alert("Please fill all fields.");
    if (user.balance < transferAmount) return alert("Insufficient funds.");
    if (user.accountNumber === recipientAccount) return alert("Self-transfer not allowed.");

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
        memo: memo || 'Transfer',
        date: new Date().toLocaleString()
      });
      setShowConfirm(true);
    } catch (err: any) {
      alert(err.response?.data?.message || "Recipient not found");
    } finally {
      setLoading(false);
    }
  };

  const executeFinalAction = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      if (!user?.hasPin) {
        await axios.post(`${API_BASE_URL}/api/user/setup-pin`, { pin }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(prev => prev ? { ...prev, hasPin: true } : null);
      }

      const response = await axios.post(`${API_BASE_URL}/api/user/transfer`, {
        recipientAccountNumber: recipientAccount,
        amount: Number(amount),
        memo,
        pin 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setIsNavigating(true);
      setShowKeypad(false);
      setShowConfirm(false);

      navigate('/dashboard/receipt', { 
        state: { 
          details: {
            ...transferData,
            transactionId: response.data.transactionId || "TXN-" + Math.random().toString(36).toUpperCase().substring(2, 12),
          } 
        } 
      });
    } catch (err: any) {
      if (err.response?.data?.message?.toLowerCase().includes("pin")) {
        setPinError(true);
      } else {
        alert("Transfer failed.");
      }
      setPin(''); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transfer-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .transfer-page {
          min-height: 100vh;
          background: #f8fafc;
          color: #0f172a;
          font-family: 'Inter', sans-serif;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .top-nav {
          width: 100%;
          max-width: 500px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .back-btn {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          cursor: pointer;
          font-size: 20px;
        }

        .form-container {
          width: 100%;
          max-width: 500px;
          background: white;
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);
        }

        .section-label {
          font-size: 12px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 16px;
          display: block;
        }

        .account-selector {
          background: #f1f5f9;
          padding: 16px;
          border-radius: 16px;
          display: flex;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .input-wrapper {
          margin-bottom: 24px;
        }

        .modern-input {
          width: 100%;
          border: 1px solid #e2e8f0;
          padding: 16px;
          border-radius: 12px;
          font-size: 16px;
          outline: none;
          transition: border-color 0.2s;
        }

        .modern-input:focus {
          border-color: #2563eb;
        }

        .amount-input-container {
          position: relative;
          margin-bottom: 8px;
        }

        .currency-symbol {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-weight: 600;
          color: #94a3b8;
        }

        .amount-field {
          padding-left: 35px !important;
          font-size: 24px !important;
          font-weight: 700;
        }

        .max-pill {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: #dbeafe;
          color: #2563eb;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          border: none;
          cursor: pointer;
        }

        .transfer-btn {
          width: 100%;
          background: #0f172a;
          color: white;
          padding: 18px;
          border-radius: 12px;
          font-weight: 600;
          border: none;
          margin-top: 10px;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .transfer-btn:disabled { opacity: 0.7; }

        /* Modal & Keypad Styles preserved from original but cleaned up */
        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 20px;
        }

        .confirm-sheet {
          background: white;
          width: 100%;
          max-width: 400px;
          border-radius: 24px;
          padding: 30px;
        }

        .keypad-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          width: 100%;
          margin-top: 20px;
        }

        .key-btn {
          height: 60px;
          background: #f1f5f9;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 600;
          cursor: pointer;
        }

        .pin-dot-container {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin: 20px 0;
        }

        .pin-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #e2e8f0;
        }

        .pin-dot.active { background: #2563eb; }
      `}</style>

      <div className="top-nav">
        <div className="back-btn" onClick={() => navigate('/dashboard')}>
          <span>←</span>
        </div>
        <h3 style={{ margin: 0, fontWeight: 700 }}>Move Money</h3>
        <div style={{ width: '45px' }}></div>
      </div>

      <div className="form-container">
        <form onSubmit={handleInitiate}>
          <span className="section-label">From Account</span>
          <div className="account-selector">
            <div style={{ fontWeight: 600 }}>Spending Account</div>
            <div style={{ color: '#64748b' }}>...{user?.accountNumber.slice(-4)}</div>
          </div>

          <div className="input-wrapper">
            <span className="section-label">To Account</span>
            <input 
              className="modern-input" 
              placeholder="Account Number"
              value={recipientAccount}
              onChange={(e) => setRecipientAccount(e.target.value)}
              required
            />
          </div>

          <div className="input-wrapper">
            <span className="section-label">Amount</span>
            <div className="amount-input-container">
              <span className="currency-symbol">$</span>
              <input 
                type="number" 
                className="modern-input amount-field" 
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="max-pill"
                onClick={() => user && setAmount(user.balance.toString())}
              >
                Use Max
              </button>
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', textAlign: 'right' }}>
              Available: ${user?.balance.toLocaleString()}
            </div>
          </div>

          <div className="input-wrapper">
            <span className="section-label">Note (Optional)</span>
            <input 
              className="modern-input" 
              placeholder="What's this for?"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>

          <button type="submit" className="transfer-btn" disabled={loading}>
            {loading ? 'Processing...' : 'Review Transfer'}
          </button>
        </form>
      </div>

      {showConfirm && (
        <div className="overlay">
          <div className="confirm-sheet">
            <h2 style={{ margin: '0 0 10px 0', textAlign: 'center' }}>Review Transfer</h2>
            <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '25px' }}>
              Sending to <strong>{transferData?.recipientName}</strong>
            </p>
            
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', marginBottom: '25px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: '#64748b' }}>Amount</span>
                <span style={{ fontWeight: 700 }}>${Number(amount).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Fee</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>$0.00</span>
              </div>
            </div>

            <button className="transfer-btn" onClick={() => setShowKeypad(true)}>Confirm & Pay</button>
            <button 
              style={{ width: '100%', background: 'none', border: 'none', marginTop: '15px', color: '#64748b', cursor: 'pointer' }}
              onClick={() => setShowConfirm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showKeypad && (
        <div className="overlay" style={{ alignItems: 'flex-end', padding: 0 }}>
          <div className="confirm-sheet" style={{ borderRadius: '32px 32px 0 0', maxWidth: '500px' }}>
            <h3 style={{ textAlign: 'center', margin: 0 }}>Enter PIN</h3>
            <div className="pin-dot-container">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`pin-dot ${pin.length > i ? 'active' : ''} ${pinError ? 'error' : ''}`} />
              ))}
            </div>
            
            <div className="keypad-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                <div key={n} className="key-btn" onClick={() => handleKeyPress(n.toString())}>{n}</div>
              ))}
              <div className="key-btn" style={{ background: 'none' }} onClick={() => setShowKeypad(false)}>✕</div>
              <div className="key-btn" onClick={() => handleKeyPress('0')}>0</div>
              <div className="key-btn" style={{ background: 'none' }} onClick={handleBackspace}>⌫</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransferMoney;