import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Signup from './Signup'
import Login from './Login' 
import AdminDashboard from './AdminDashboard'
import UserDashboard from './UserDashboard' 
import TransferMoney from './TransferMoney'
import TransactionReceipt from './TransactionReceipt'
// import InstallPrompt from './InstallPrompt'  <-- You can remove this import
import './App.css'

function App() {
  const [isLogin, setIsLogin] = useState(true); // Default to true so people see Login first
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. SUPPRESS BROWSER INSTALL PROMPT (For PC)
    const handlePrompt = (e: any) => e.preventDefault();
    window.addEventListener('beforeinstallprompt', handlePrompt);

    // 2. CHECK AUTH SESSION
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.clear();
      }
    }
    setLoading(false);

    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  if (loading) return null;

  return (
    <Router>
      <div className="App">
        {/* ✅ REMOVED <InstallPrompt /> FROM HERE */}

        <Routes>
          {/* 1. AUTH ROUTES (Only show if NOT logged in) */}
          {!user ? (
            <>
              <Route path="/" element={
                <div className="auth-container">
                  {isLogin ? (
                    <Login 
                      onSwitchToSignup={() => setIsLogin(false)} 
                      setUser={setUser} 
                    />
                  ) : (
                    <Signup setUser={setUser} /> 
                  )}
                  
                  <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <p style={{ color: '#64748b' }}>
                      {isLogin ? "Don't have an account?" : "Already have an account?"}
                      <button 
                        onClick={() => setIsLogin(!isLogin)}
                        style={{ 
                          marginLeft: '10px', background: 'none', border: 'none', 
                          color: '#004da0', textDecoration: 'underline', 
                          fontWeight: 'bold', cursor: 'pointer' 
                        }}
                      >
                        {isLogin ? 'Sign Up' : 'Login'}
                      </button>
                    </p>
                  </div>
                </div>
              } />
              {/* If they try to go to /dashboard while logged out, send them to Login */}
              <Route path="*" element={<Navigate to="/" />} />
            </>
          ) : (
            /* 2. PROTECTED ROUTES (Only show if logged in) */
            <>
              <Route path="/dashboard" element={
                user.role === 'admin' ? <AdminDashboard /> : <UserDashboard />
              } />
              <Route path="/transfer" element={<TransferMoney />} />
              <Route path="/receipt" element={<TransactionReceipt />} />
              
              {/* If they hit the root "/" while logged in, send them to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" />} />
              
              {/* Catch all other typos and send to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  )
}

export default App