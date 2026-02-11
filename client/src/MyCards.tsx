import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

const MyCards = () => {
  // 1. ADDED SAFETY CHECK: Provide a fallback if context is missing
  const context = useOutletContext<{ user: any }>() || { user: { name: "Guest User", accountNumber: "4412882100928892" } };
  const { user } = context;

  const [isLocked, setIsLocked] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);

  // 2. Formatting logic with fallback to prevent .match() errors
  const rawAccount = user?.accountNumber || "4412882100928892";
  const displayAccountNumber = rawAccount.match(/.{1,4}/g)?.join(' ') || rawAccount;

  return (
    <div className="cards-container" style={{ padding: '20px', animation: 'fadeIn 0.5s ease', color: '#fff' }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .card-perspective {
          perspective: 1500px;
          margin-bottom: 40px;
        }

        .premium-card {
          background: linear-gradient(135deg, #111827 0%, #000000 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 30px;
          position: relative;
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          transform-style: preserve-3d;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        /* Crazy 3D Hover & Shimmer */
        .premium-card:hover {
          transform: rotateY(-10deg) rotateX(5deg) scale(1.02);
          box-shadow: -20px 20px 50px rgba(0,0,0,0.8), 5px 5px 20px rgba(59, 130, 246, 0.2);
          border-color: rgba(59, 130, 246, 0.4);
        }

        .premium-card::before {
          content: "";
          position: absolute;
          top: 0; left: -100%;
          width: 50%; height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent);
          transition: 0.5s;
          pointer-events: none;
        }

        .premium-card:hover::before {
          left: 100%;
          transition: 0.8s;
        }

        .card-chip {
          width: 50px;
          height: 40px;
          background: linear-gradient(135deg, #e5e7eb 0%, #9ca3af 100%);
          border-radius: 8px;
          position: relative;
          box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
        }

        .glass-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(125deg, rgba(255,255,255,0.1) 0%, transparent 40%, rgba(0,0,0,0.3) 100%);
          pointer-events: none;
        }
      `}</style>

      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-1px', margin: 0 }}>My Cards</h1>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>Security Level: IBK Elite Tier</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
        
        {/* PHYSICAL CARD VISUAL */}
        <div className="card-perspective">
          <div className="premium-card">
            <div className="glass-overlay"></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ fontWeight: 900, fontSize: '18px', letterSpacing: '2px', color: '#f8fafc' }}>IBK BLACK</div>
              <div className="card-chip"></div>
            </div>

            <div style={{ margin: '50px 0', fontSize: '24px', letterSpacing: '4px', fontFamily: 'monospace', color: '#fff' }}>
              {showFullDetails ? displayAccountNumber : `•••• •••• •••• ${rawAccount.slice(-4)}`}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <p style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', margin: 0 }}>Card Holder</p>
                <p style={{ fontWeight: 600, fontSize: '14px', margin: '4px 0 0 0' }}>{user?.name || "PREMIER MEMBER"}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '20px', fontWeight: 900, fontStyle: 'italic' }}>VISA</span>
              </div>
            </div>

            {isLocked && (
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 10, borderRadius: '24px'
              }}>
                <div style={{ color: '#ef4444', fontWeight: 800, letterSpacing: '2px', border: '2px solid #ef4444', padding: '10px 20px' }}>FROZEN</div>
              </div>
            )}
          </div>
        </div>

        {/* CONTROLS */}
        <div style={{ background: '#0f172a', borderRadius: '24px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ marginTop: 0 }}>Card Management</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '15px' }}>
              <span>Show Details</span>
              <button 
                onClick={() => setShowFullDetails(!showFullDetails)}
                style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {showFullDetails ? 'HIDE' : 'SHOW'}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '15px' }}>
              <span>Freeze Status</span>
              <button 
                onClick={() => setIsLocked(!isLocked)}
                style={{ background: isLocked ? '#ef4444' : '#1e293b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {isLocked ? 'UNFREEZE' : 'FREEZE'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MyCards;