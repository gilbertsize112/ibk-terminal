import React, { useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TransactionReceipt = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const receiptRef = useRef<HTMLDivElement>(null);

  // Formatting Date to US Style
  const usTime = new Date().toLocaleString("en-US", {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  // --- SAFETY SHIELD: This prevents the 'toLocaleString' error ---
  // We check if location.state exists, AND if details exists inside it.
  const stateData = location.state?.details ? location.state.details : {
    senderName: "Valued Member",
    senderAcc: "Checking ****1234",
    recipientAcc: "External Account",
    recipientName: "Processing...",
    amount: 0,
    memo: "Standard Transfer",
    date: usTime,
    transactionId: "TRX-" + Math.random().toString(36).toUpperCase().substring(2, 10)
  };

  const handleShare = async () => {
    const shareText = `IBK Receipt\nID: ${stateData.transactionId}\nAmount: $${stateData.amount}\nStatus: Settled`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Receipt', text: shareText, url: window.location.href }); } 
      catch (err) { console.log(err); }
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Copied to clipboard");
    }
  };

  return (
    <div className="receipt-page">
      <style>{`
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .receipt-page { min-height: 100vh; background: #020617; display: flex; flex-direction: column; align-items: center; padding: 40px 15px; color: white; font-family: sans-serif; }
        .receipt-card { width: 100%; max-width: 400px; background: white; color: #1e293b; border-radius: 28px; padding: 30px 24px; box-shadow: 0 25px 50px rgba(0,0,0,0.5); animation: scaleIn 0.4s ease-out; position: relative; }
        .success-icon { width: 60px; height: 60px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
        .amount-box { background: #f8fafc; border-radius: 20px; padding: 20px; text-align: center; margin: 20px 0; border: 1px solid #e2e8f0; }
        .data-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
        .label { color: #64748b; font-weight: 600; font-size: 11px; text-transform: uppercase; }
        .value { color: #0f172a; font-weight: 700; }
        .btn-group { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 100%; max-width: 400px; margin-top: 20px; }
        .btn { padding: 15px; border-radius: 12px; border: none; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .btn-blue { background: #3b82f6; color: white; }
        .btn-green { background: #10b981; color: white; }
      `}</style>

      <div className="receipt-card" ref={receiptRef}>
        <div className="success-icon">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
            <path d="M20 6L9 17L4 12" />
          </svg>
        </div>

        <div style={{ textAlign: 'center' }}>
          <b style={{ letterSpacing: '2px' }}>IBK BANK</b>
          <h2 style={{ margin: '5px 0' }}>Transfer Successful</h2>
        </div>

        <div className="amount-box">
          <span className="label">Amount Settled</span>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a' }}>
            {/* SAFE TO LOCALESTRING */}
            ${(Number(stateData.amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="data-grid">
          <div className="data-row"><span className="label">Reference</span><span className="value">{stateData.transactionId}</span></div>
          <div className="data-row"><span className="label">Sender</span><span className="value">{stateData.senderName}</span></div>
          <div className="data-row"><span className="label">Recipient</span><span className="value">{stateData.recipientName}</span></div>
          <div className="data-row"><span className="label">Date</span><span className="value">{stateData.date}</span></div>
          <div className="data-row"><span className="label">Status</span><span className="value" style={{color: '#10b981'}}>COMPLETED</span></div>
        </div>
      </div>

      <div className="btn-group">
        <button className="btn btn-green" onClick={handleShare}>SHARE</button>
        <button className="btn btn-blue" onClick={() => navigate('/dashboard')}>DONE</button>
      </div>
    </div>
  );
};

export default TransactionReceipt;