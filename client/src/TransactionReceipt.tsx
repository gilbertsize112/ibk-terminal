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
      amount: 0,
      memo: "N/A",
      date: usTime,
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
          padding: 40px 15px;
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          box-sizing: border-box;
          position: relative;
        }

        .home-icon-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: white;
          font-size: 18px;
          z-index: 100;
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
          animation: scaleIn 0.5s ease-out;
          box-sizing: border-box;
          overflow: hidden;
        }

        /* IBK KOREAN WATERMARK */
        .receipt-card::before {
          content: "IBK 기업은행";
          position: absolute;
          top: 55%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-30deg);
          font-size: 44px;
          font-weight: 900;
          color: rgba(0, 102, 179, 0.03);
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
          width: 64px;
          height: 64px;
          background: #10b981;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
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
          font-size: 20px;
          color: #0066b3;
          letter-spacing: -0.5px;
          display: block;
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
          margin-bottom: 14px;
        }

        .label { 
          color: #64748b; 
          font-size: 10px; 
          text-transform: uppercase; 
          font-weight: 700; 
          letter-spacing: 0.5px;
          padding-top: 2px;
        }

        .value { 
          color: #0f172a; 
          font-weight: 600; 
          font-size: 13px; 
          text-align: right;
          max-width: 60%;
          word-break: break-word;
        }

        .security-seal {
          display: inline-block;
          border: 1px solid #10b981;
          color: #10b981;
          padding: 3px 10px;
          border-radius: 5px;
          font-size: 10px;
          font-weight: 800;
          margin-top: 12px;
          text-transform: uppercase;
        }

        .action-buttons {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
          width: 100%;
          max-width: 400px;
          margin-top: 25px;
        }

        .btn {
          padding: 12px 16px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          flex: 1;
          min-width: 110px;
        }

        .btn-primary { background: #3b82f6; color: white; }
        .btn-share { background: #10b981; color: white; }
        .btn-outline { background: rgba(255,255,255,0.08); color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); }

        .korean-text-small {
          font-size: 9px;
          opacity: 0.8;
          font-weight: 400;
        }

        @media print {
          .btn, .action-buttons, .home-icon-btn { display: none !important; }
          .receipt-page { background: white; padding: 0; }
          .receipt-card { box-shadow: none; border: none; width: 100%; max-width: 100%; }
        }
      `}</style>

      {/* DASHBOARD ICON BUTTON */}
      <button className="home-icon-btn" onClick={() => navigate('/dashboard')}>
        🏠
      </button>

      <div className="receipt-card" ref={receiptRef}>
        <div className="success-wrapper">
          <div className="success-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17L4 12" style={{ strokeDasharray: 100, strokeDashoffset: 100, animation: 'checkmark 0.6s ease forwards 0.2s' }} />
            </svg>
          </div>
        </div>

        <div className="receipt-header">
          <span className="ibk-logo">IBK Bank</span>
          <h2 style={{ margin: '4px 0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Transfer Receipt</h2>
          <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 700 }}>송금 확인서</span>
        </div>

        <div className="amount-section">
          <span className="label">Amount</span>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: '4px 0', letterSpacing: '-1px' }}>
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
            <span className="value" style={{ fontFamily: 'monospace' }}>{details.transactionId}</span>
          </div>
          <div className="data-row">
            <span className="label">Sender</span>
            <span className="value">{details.senderName}</span>
          </div>
          <div className="data-row">
            <span className="label">Account</span>
            <span className="value" style={{ fontFamily: 'monospace' }}>{details.senderAcc}</span>
          </div>
          <div className="data-row">
            <span className="label">Recipient</span>
            <span className="value" style={{ color: '#3b82f6' }}>{details.recipientAcc}</span>
          </div>
          <div className="data-row">
            <span className="label">Memo</span>
            <span className="value">{details.memo || "N/A"}</span>
          </div>
          
          <div className="data-row" style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '15px', marginTop: '5px' }}>
            <span className="label" style={{ color: '#10b981' }}>Status</span>
            <div style={{ textAlign: 'right' }}>
               <span className="value" style={{ color: '#10b981', display: 'block' }}>COMPLETED</span>
               <span style={{ fontSize: '9px', color: '#10b981', fontWeight: 600 }}>정상 송금 완료</span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
          <p style={{ fontSize: '9px', color: '#94a3b8', lineHeight: '1.4', margin: 0 }}>
            Official record generated by IBK International.
            <br/>
            본 문서는 IBK 기업은행에서 발행된 공식 송금 영수증입니다.
          </p>
        </div>
      </div>

      <div className="action-buttons">
        <button className="btn btn-share" onClick={handleShare}>
           <span>📤 SHARE</span>
           <span className="korean-text-small">공유</span>
        </button>
        <button className="btn btn-primary" onClick={handlePrint}>
           <span>🖨️ PDF</span>
           <span className="korean-text-small">저장</span>
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>
           <span>🏠 HOME</span>
           <span className="korean-text-small">홈</span>
        </button>
      </div>
    </div>
  );
};

export default TransactionReceipt;