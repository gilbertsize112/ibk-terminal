import React, { useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TransactionReceipt = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const receiptRef = useRef<HTMLDivElement>(null);

  const { details } = location.state || { 
    details: {
      senderName: "N/A",
      senderAcc: "N/A",
      recipientAcc: "N/A",
      amount: 0,
      memo: "N/A",
      date: new Date().toLocaleString(),
      transactionId: "TXN-" + Math.random().toString(36).toUpperCase().substring(2, 10)
    }
  };

  // Mobile Share Functionality (iOS/Android Native Share)
  const handleShare = async () => {
    const shareText = `Official Transfer Receipt\nID: ${details.transactionId}\nAmount: $${details.amount}\nTo: ${details.recipientAcc}\nStatus: Settled`;
    
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@500&display=swap');

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .receipt-page {
          min-height: 100vh;
          background: #020617;
          background-image: radial-gradient(circle at 50% 0%, #0f172a 0%, #020617 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px;
          color: white;
          font-family: 'Inter', sans-serif;
          box-sizing: border-box;
          position: relative;
        }

        /* FLOATING DASHBOARD ICON BUTTON */
        .home-icon-btn {
          position: absolute;
          top: 25px;
          right: 25px;
          width: 44px;
          height: 44px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: white;
          font-size: 20px;
          transition: all 0.2s ease;
          z-index: 100;
        }

        .home-icon-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }

        .receipt-card {
          width: 100%;
          max-width: 420px;
          background: #ffffff;
          color: #0f172a;
          border-radius: 28px;
          position: relative;
          box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.8);
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          padding: 0;
        }

        .receipt-inner {
          padding: 40px 32px;
          background-image: radial-gradient(#e2e8f0 0.5px, transparent 0.5px);
          background-size: 16px 16px; /* Subtle dot matrix pattern */
        }

        /* Header Styling */
        .receipt-top-bar {
          height: 6px;
          background: linear-gradient(90deg, #3b82f6, #10b981);
          width: 100%;
        }

        .bank-logo-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
        }

        .success-badge {
          background: #ecfdf5;
          color: #059669;
          padding: 6px 12px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          border: 1px solid #d1fae5;
        }

        .amount-display {
          text-align: center;
          padding: 24px 0;
          border-bottom: 1px dashed #e2e8f0;
          margin-bottom: 24px;
        }

        .amount-display h1 {
          font-size: 42px;
          font-weight: 800;
          margin: 0;
          letter-spacing: -2px;
          color: #0f172a;
        }

        .data-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 18px;
          align-items: baseline;
        }

        .label {
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .value {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          text-align: right;
          max-width: 60%;
        }

        .mono-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
        }

        .qr-section {
          display: flex;
          justify-content: center;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #f1f5f9;
        }

        .qr-placeholder {
          width: 80px;
          height: 80px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .qr-placeholder::after {
          content: 'VERIFIED';
          position: absolute;
          font-size: 8px;
          font-weight: 800;
          bottom: 4px;
          color: #94a3b8;
        }

        .action-buttons {
          width: 100%;
          max-width: 420px;
          margin-top: 32px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .btn {
          width: 100%;
          padding: 16px;
          border-radius: 16px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .btn-primary { background: #ffffff; color: #020617; }
        .btn-share { background: #3b82f6; color: white; }
        .btn-outline { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; }

        .btn:active { transform: scale(0.98); }

        .korean-text {
          font-size: 10px;
          font-weight: 400;
          opacity: 0.7;
          margin-left: 4px;
        }

        @media print {
          .btn, .action-buttons, .home-icon-btn { display: none !important; }
          .receipt-page { background: white; padding: 0; }
          .receipt-card { box-shadow: none; max-width: 100%; }
        }
      `}</style>

      {/* DASHBOARD ICON BUTTON */}
      <button className="home-icon-btn" onClick={() => navigate('/dashboard')}>
        🏠
      </button>

      <div className="receipt-card" ref={receiptRef}>
        <div className="receipt-top-bar"></div>
        <div className="receipt-inner">
          <div className="bank-logo-section">
            <div>
              <div style={{ fontWeight: 800, fontSize: '18px', color: '#0f172a' }}>IBK BANK</div>
              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>INTERNATIONAL DIGITAL BRANCH</div>
            </div>
            <div className="success-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17L4 12"/></svg>
              SETTLED
            </div>
          </div>

          <div className="amount-display">
            <span className="label">Total Amount</span>
            <h1>${Number(details.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h1>
            <div style={{ color: '#10b981', fontSize: '12px', fontWeight: 700, marginTop: '4px' }}>
              Funds Transferred Successfully <span className="korean-text">송금 완료</span>
            </div>
          </div>

          <div className="data-grid">
            <div className="data-row">
              <span className="label">Reference ID</span>
              <span className="value mono-value">{details.transactionId}</span>
            </div>
            <div className="data-row">
              <span className="label">Date & Time</span>
              <span className="value">{details.date}</span>
            </div>
            <div className="data-row">
              <span className="label">Sender</span>
              <span className="value">{details.senderName}</span>
            </div>
            <div className="data-row">
              <span className="label">Debit Acc</span>
              <span className="value mono-value">{details.senderAcc}</span>
            </div>
            <div className="data-row">
              <span className="label">Recipient ID</span>
              <span className="value" style={{ color: '#3b82f6' }}>{details.recipientAcc}</span>
            </div>
            <div className="data-row">
              <span className="label">Description</span>
              <span className="value">{details.memo || "Bank Transfer"}</span>
            </div>
            <div className="data-row" style={{ marginTop: '12px' }}>
              <span className="label">Status</span>
              <span className="value" style={{ color: '#10b981' }}>COMPLETED</span>
            </div>
          </div>

          <div className="qr-section">
            <div className="qr-placeholder">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <path d="M14 14h3m3 0h1m-4 3h.01M14 20h3m3 0h1M17 17h3"/>
              </svg>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <p style={{ fontSize: '9px', color: '#94a3b8', lineHeight: '1.5', margin: 0 }}>
              This is a computer-generated receipt and does not require a physical signature. 
              IBK Bank encryption guarantees the authenticity of this document.
            </p>
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button className="btn btn-share" onClick={handleShare}>
          📤 SHARE RECEIPT <span className="korean-text">영수증 공유</span>
        </button>
        <button className="btn btn-primary" onClick={handlePrint}>
          🖨️ SAVE AS PDF <span className="korean-text">PDF 저장</span>
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>
          🏠 BACK TO HOME <span className="korean-text">홈으로</span>
        </button>
      </div>
    </div>
  );
};

export default TransactionReceipt;