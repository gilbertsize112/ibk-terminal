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
        @keyframes scaleIn {
          0% { transform: scale(0.9) translateY(20px); opacity: 0; }
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
          padding: 100px 15px 40px 15px;
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          box-sizing: border-box;
          position: relative;
        }

        .home-icon-btn {
          position: absolute;
          top: 25px;
          right: 25px;
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: white;
          font-size: 22px;
          transition: all 0.3s ease;
          z-index: 100;
        }

        .receipt-card {
          width: 100%;
          max-width: 450px;
          background: #ffffff;
          background-image: linear-gradient(rgba(241, 245, 249, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(241, 245, 249, 0.5) 1px, transparent 1px);
          background-size: 20px 20px;
          color: #1e293b;
          border-radius: 24px;
          padding: 40px 30px;
          position: relative;
          box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.7);
          animation: scaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          box-sizing: border-box;
          overflow: hidden;
        }

        /* IBK KOREAN WATERMARK */
        .receipt-card::before {
          content: "IBK 기업은행";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-30deg);
          font-size: 50px;
          font-weight: 900;
          color: rgba(0, 102, 179, 0.03);
          white-space: nowrap;
          pointer-events: none;
          z-index: 0;
        }

        .success-icon {
          width: 86px;
          height: 86px;
          background: #10b981;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: -85px auto 25px auto;
          border: 8px solid #020617;
          box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4);
          position: relative;
          z-index: 2;
        }

        .receipt-header {
          text-align: center;
          margin-bottom: 30px;
          position: relative;
          z-index: 1;
        }

        .ibk-logo {
          font-weight: 900;
          font-size: 22px;
          color: #0066b3;
          letter-spacing: -1px;
          display: block;
          margin-bottom: 4px;
        }

        .amount-section {
          background: #f8fafc;
          border-radius: 16px;
          padding: 30px 20px;
          text-align: center;
          margin-bottom: 30px;
          border: 1px solid #e2e8f0;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
          position: relative;
          z-index: 1;
        }

        .data-grid {
          border-top: 1px solid #f1f5f9;
          padding-top: 25px;
          position: relative;
          z-index: 1;
        }

        .data-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .label { 
          color: #64748b; 
          font-size: 11px; 
          text-transform: uppercase; 
          font-weight: 700; 
          letter-spacing: 0.8px;
        }

        .value { 
          color: #0f172a; 
          font-weight: 600; 
          font-size: 14px; 
          text-align: right;
        }

        .security-seal {
          display: inline-block;
          border: 1.5px solid #10b981;
          color: #10b981;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 800;
          margin-top: 15px;
          text-transform: uppercase;
        }

        .action-buttons {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          width: 100%;
          max-width: 450px;
          margin-top: 35px;
        }

        @media (min-width: 640px) {
          .action-buttons { grid-template-columns: 1fr 1fr; }
          .full-width { grid-column: span 2; }
        }

        .btn {
          padding: 16px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: 0.2s;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .btn-primary { background: #3b82f6; color: white; }
        .btn-share { background: #10b981; color: white; }
        .btn-outline { background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); }

        .korean-text {
          font-size: 10px;
          display: block;
          opacity: 0.8;
          font-weight: 400;
          margin-top: 2px;
        }

        @media print {
          .btn, .action-buttons, .receipt-page, .home-icon-btn { display: none !important; }
          .receipt-page { background: white; padding: 0; }
          .receipt-card { box-shadow: none; border: none; width: 100%; max-width: 100%; background: white; }
          .receipt-card::before { color: rgba(0, 102, 179, 0.05); }
        }
      `}</style>

      {/* DASHBOARD ICON BUTTON */}
      <button className="home-icon-btn" onClick={() => navigate('/dashboard')}>
        🏠
      </button>

      <div className="receipt-card" ref={receiptRef}>
        <div className="success-icon">
          {/* THE BIG THICK GOOD CHECKMARK */}
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17L4 12" style={{ strokeDasharray: 100, strokeDashoffset: 100, animation: 'checkmark 0.8s ease forwards 0.4s' }} />
          </svg>
        </div>

        <div className="receipt-header">
          <span className="ibk-logo">IBK Bank</span>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>Transaction Receipt</h2>
          <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>송금 확인서</span>
          <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>Ref: {details.transactionId}</p>
        </div>

        <div className="amount-section">
          <span className="label">Amount Transferred</span>
          <div style={{ fontSize: '36px', fontWeight: 800, color: '#0f172a', marginTop: '8px', letterSpacing: '-1.5px' }}>
            ${Number(details.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="security-seal">Verified Secure</div>
        </div>

        <div className="data-grid">
          <div className="data-row">
            <span className="label">Date</span>
            <span className="value">{details.date}</span>
          </div>
          <div className="data-row">
            <span className="label">Sender</span>
            <span className="value">{details.senderName}</span>
          </div>
          <div className="data-row">
            <span className="label">From Account</span>
            <span className="value" style={{ fontFamily: 'monospace', fontSize: '13px' }}>{details.senderAcc}</span>
          </div>
          <div className="data-row">
            <span className="label">Recipient ID</span>
            <span className="value" style={{ color: '#3b82f6', fontWeight: 700 }}>{details.recipientAcc}</span>
          </div>
          <div className="data-row">
            <span className="label">Note</span>
            <span className="value" style={{ fontStyle: 'italic', color: '#64748b' }}>{details.memo || "N/A"}</span>
          </div>
          
          <div className="data-row" style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '18px', marginTop: '10px' }}>
            <span className="label" style={{ color: '#10b981' }}>Status</span>
            <div style={{ textAlign: 'right' }}>
               <span className="value" style={{ color: '#10b981', display: 'block' }}>SUCCESSFUL</span>
               <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 600 }}>정상 처리됨</span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
          <p style={{ fontSize: '10px', color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>
            Official digital record of peer-to-peer transfer. Verification performed via IBK secure protocol.
            <br/>
            본 영수증은 IBK 기업은행의 안전한 암호화 채널을 통해 전송된 공식 기록입니다.
          </p>
        </div>
      </div>

      <div className="action-buttons">
        <button className="btn btn-share full-width" onClick={handleShare}>
           <div style={{ textAlign: 'center' }}>
             <span>📤 SHARE RECEIPT</span>
             <span className="korean-text">영수증 공유하기</span>
           </div>
        </button>
        <button className="btn btn-primary" onClick={handlePrint}>
           <div style={{ textAlign: 'center' }}>
             <span>🖨️ PRINT PDF</span>
             <span className="korean-text">PDF 인쇄</span>
           </div>
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>
           <div style={{ textAlign: 'center' }}>
             <span>🏠 DASHBOARD</span>
             <span className="korean-text">대시보드로 돌아가기</span>
           </div>
        </button>
      </div>
    </div>
  );
};

export default TransactionReceipt;