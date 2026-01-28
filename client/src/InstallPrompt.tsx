import React, { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if user is on iPhone/iPad
    const isApple = /iPhone|iPad|iPod/.test(navigator.userAgent);
    setIsIOS(isApple);

    // Standard Android/Chrome Install Logic
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Wait 10 seconds before showing the "High-End" invitation
      setTimeout(() => {
        setShowPrompt(true);
      }, 10000);
    });

    window.addEventListener('appinstalled', () => {
      setShowPrompt(false);
    });
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowPrompt(false);
    setDeferredPrompt(null);
  };

  if (!showPrompt && !isIOS) return null; 
  // For this demo, we'll show it if the prompt is ready or if it's iOS
  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-8 left-4 right-4 z-[9999] animate-in fade-in slide-in-from-bottom-10 duration-1000">
      <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-black p-1 border border-slate-700 flex-shrink-0">
            <img src="/logo.png" alt="IBK" className="w-full h-full object-contain" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm tracking-tight">IBK Premier App</h3>
            <p className="text-slate-400 text-[10px] uppercase letter spacing-1">Fast • Secure • Native</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isIOS ? (
            <div className="flex items-center gap-1 text-blue-400 text-[10px] font-bold px-2">
              Tap <Share size={14} /> then 'Add to Home Screen'
            </div>
          ) : (
            <button 
              onClick={handleInstall}
              className="bg-blue-600 active:scale-95 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-900/20"
            >
              INSTALL
            </button>
          )}
          <button 
            onClick={() => setShowPrompt(false)}
            className="text-slate-500 hover:text-white p-1"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;