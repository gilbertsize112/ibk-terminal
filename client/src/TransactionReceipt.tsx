import React, { useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TransactionReceipt = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const receiptRef = useRef<HTMLDivElement>(null);

  // Formatting Date to US Style: MM/DD/YYYY, HH:MM:SS AM/PM
  const usTime = new Date().toLocaleString("en-US", {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const { details } = location.state || { 
    details: {
      senderName: "N/A",
      senderAcc: "N/A",
      recipientAcc: "N/A",
      recipientName: "N/A",
      amount: 0,
      memo: "N/A",
      date: usTime,
      transactionId: "TXN-" + Math.random().toString(36).toUpperCase().substring(2, 10)
    }
  };

  // Mobile Share Functionality (iOS/Android Native Share)
  const handleShare = async () => {
    const shareText = `Official Transfer Receipt\nID: ${details.transactionId}\nAmount: $${details.amount}\nTo: ${details.recipientName}\nStatus: Settled`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Transaction Receipt',
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share failed', err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(shareText);
      alert("Receipt details copied to clipboard!");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="receipt-page">
      <style>{`
        @keyframes scaleIn {
          0% { transform: scale(0.95) translateY(10px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }

        @keyframes checkmark {
          0% { stroke-dashoffset: 100; }
          100% { stroke-dashoffset: 0; }
        }

        .receipt-page {
          min-height: 100vh;
          background: #020617;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: calc(20px + env(safe-area-inset-top)) 15px 40px 15px;
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          box-sizing: border-box;
          position: relative;
          -webkit-tap-highlight-color: transparent;
        }

        .home-icon-btn {
          position: absolute;
          top: calc(15px + env(safe-area-inset-top));
          right: 20px;
          width: 44px;
          height: 44px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: white;
          font-size: 20px;
          z-index: 100;
          transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .home-icon-btn:active {
          transform: scale(0.9);
          background: rgba(255, 255, 255, 0.1);
        }

        .receipt-card {
          width: 100%;
          max-width: 400px;
          background: #ffffff;
          background-image: linear-gradient(rgba(241, 245, 249, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(241, 245, 249, 0.5) 1px, transparent 1px);
          background-size: 20px 20px;
          color: #1e293b;
          border-radius: 28px;
          padding: 30px 24px;
          position: relative;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: scaleIn 0.5s cubic-bezier(0.23, 1, 0.32, 1);
          box-sizing: border-box;
          overflow: hidden;
        }

        /* WATERMARK */
        .receipt-card::before {
          content: "FEDERAL RESERVE SYSTEM";
          position: absolute;
          top: 55%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-30deg);
          font-size: 24px;
          font-weight: 900;
          color: rgba(15, 23, 42, 0.03);
          white-space: nowrap;
          pointer-events: none;
          z-index: 0;
        }

        .success-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }

        .success-icon {
          width: 68px;
          height: 68px;
          background: #10b981;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
          position: relative;
          z-index: 2;
        }

        .receipt-header {
          text-align: center;
          margin-bottom: 24px;
          position: relative;
          z-index: 1;
        }

        .ibk-logo {
          font-weight: 900;
          font-size: 22px;
          color: #0f172a;
          letter-spacing: -0.5px;
          display: block;
          text-transform: uppercase;
        }

        .amount-section {
          background: #f8fafc;
          border-radius: 20px;
          padding: 24px 15px;
          text-align: center;
          margin-bottom: 24px;
          border: 1px solid #e2e8f0;
          position: relative;
          z-index: 1;
        }

        .data-grid {
          border-top: 1px solid #f1f5f9;
          padding-top: 20px;
          position: relative;
          z-index: 1;
        }

        .data-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .label { 
          color: #64748b; 
          font-size: 10px; 
          text-transform: uppercase; 
          font-weight: 700; 
          letter-spacing: 0.8px;
          padding-top: 2px;
        }

        .value { 
          color: #0f172a; 
          font-weight: 600; 
          font-size: 14px; 
          text-align: right;
          max-width: 60%;
          word-break: break-word;
          line-height: 1.4;
        }

        .security-seal {
          display: inline-block;
          border: 1px solid #10b981;
          color: #10b981;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 800;
          margin-top: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .action-buttons {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          width: 100%;
          max-width: 400px;
          margin-top: 30px;
          padding-bottom: env(safe-area-inset-bottom);
        }

        .btn {
          padding: 16px 12px;
          border-radius: 16px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          border: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          transition: all 0.2s ease;
        }

        .btn:active {
          transform: scale(0.96);
          opacity: 0.9;
        }

        .btn-primary { background: #3b82f6; color: white; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
        .btn-share { background: #10b981; color: white; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
        .btn-outline { 
          background: rgba(255,255,255,0.08); 
          color: #f8fafc; 
          border: 1px solid rgba(255,255,255,0.1); 
          grid-column: span 2;
          flex-direction: row;
          gap: 8px;
        }

        .sub-text-small {
          font-size: 10px;
          opacity: 0.8;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        @media print {
          .btn, .action-buttons, .home-icon-btn { display: none !important; }
          .receipt-page { background: white; padding: 0; }
          .receipt-card { box-shadow: none; border: none; width: 100%; max-width: 100%; }
        }

        @media (max-width: 360px) {
          .value { font-size: 12px; }
          .receipt-card { padding: 20px 16px; }
        }
      `}</style>

      {/* DASHBOARD ICON BUTTON */}
      <button className="home-icon-btn" onClick={() => navigate('/dashboard')}>
        🏠
      </button>

      <div className="receipt-card" ref={receiptRef}>
        <div className="success-wrapper">
          <div className="success-icon">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17L4 12" style={{ strokeDasharray: 100, strokeDashoffset: 100, animation: 'checkmark 0.6s ease forwards 0.2s' }} />
            </svg>
          </div>
        </div>

        <div className="receipt-header">
          <span className="ibk-logo">IBK BANK</span>
          <h2 style={{ margin: '4px 0', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Transfer Receipt</h2>
          <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>Electronic Funds Transfer (EFT)</span>
        </div>

        <div className="amount-section">
          <span className="label">Amount</span>
          <div style={{ fontSize: '36px', fontWeight: 800, color: '#0f172a', margin: '4px 0', letterSpacing: '-1.5px' }}>
            ${Number(details.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="security-seal">Verified Secure</div>
        </div>

        <div className="data-grid">
          <div className="data-row">
            <span className="label">Date (US)</span>
            <span className="value">{details.date}</span>
          </div>
          <div className="data-row">
            <span className="label">Ref ID</span>
            <span className="value" style={{ fontFamily: 'monospace', letterSpacing: '-0.5px' }}>{details.transactionId}</span>
          </div>
          <div className="data-row">
            <span className="label">Sender</span>
            <span className="value">{details.senderName}</span>
          </div>
          <div className="data-row">
            <span className="label">Source Account</span>
            <span className="value" style={{ fontFamily: 'monospace' }}>{details.senderAcc}</span>
          </div>
          
          <div className="data-row" style={{ marginTop: '10px', borderTop: '1px solid #f8fafc', paddingTop: '10px' }}>
            <span className="label">Beneficiary</span>
            <span className="value" style={{ color: '#3b82f6', fontWeight: 800 }}>{details.recipientName}</span>
          </div>
          <div className="data-row">
            <span className="label">Target Account</span>
            <span className="value" style={{ fontFamily: 'monospace' }}>{details.recipientAcc}</span>
          </div>
          <div className="data-row">
            <span className="label">Memo</span>
            <span className="value">{details.memo || "N/A"}</span>
          </div>
          
          <div className="data-row" style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '16px', marginTop: '4px' }}>
            <span className="label" style={{ color: '#10b981' }}>Status</span>
            <div style={{ textAlign: 'right' }}>
               <span className="value" style={{ color: '#10b981', display: 'block', fontSize: '15px' }}>SETTLED</span>
               <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 600 }}>TRANSACTION COMPLETE</span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
          <p style={{ fontSize: '10px', color: '#94a3b8', lineHeight: '1.5', margin: 0 }}>
            This is an official record generated by US International Banking Rails.
            <br/>
            Member FDIC. All transactions are end-to-end encrypted.
          </p>
        </div>
      </div>

      <div className="action-buttons">
        <button className="btn btn-share" onClick={handleShare}>
           <span style={{fontSize: '18px'}}>📤</span>
           <span>SHARE</span>
           <span className="sub-text-small">DIGITAL COPY</span>
        </button>
        <button className="btn btn-primary" onClick={handlePrint}>
           <span style={{fontSize: '18px'}}>🖨️</span>
           <span>SAVE PDF</span>
           <span className="sub-text-small">PRINT RECORD</span>
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>
           <span style={{fontSize: '18px'}}>🏠</span>
           <span>RETURN HOME</span>
           <span className="sub-text-small">BACK TO DASHBOARD</span>
        </button>
      </div>
    </div>
  );
};

export default TransactionReceipt;