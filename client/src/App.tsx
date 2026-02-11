import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Signup from './Signup'
import Login from './Login' 
import AdminDashboard from './AdminDashboard'
import UserDashboard from './UserDashboard' 
import TransferMoney from './TransferMoney'
import TransactionReceipt from './TransactionReceipt'
import MyCards from './MyCards' 
import './App.css'

function App() {
  const [isLogin, setIsLogin] = useState(true); 
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. SUPPRESS BROWSER INSTALL PROMPT
    const handlePrompt = (e: any) => e.preventDefault();
    window.addEventListener('beforeinstallprompt', handlePrompt);

    // 2. CHECK AUTH SESSION (Hydration)
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Session restoration failed", e);
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
                  
                  {/* Toggle button design kept exactly as provided */}
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
              {/* If not logged in, any random path redirects to login page */}
              <Route path="*" element={<Navigate to="/" />} />
            </>
          ) : (
            /* 2. PROTECTED ROUTES (Only show if logged in) */
            <>
              {/* ADMIN SPECIFIC ROUTE */}
              <Route path="/admin" element={
                user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/dashboard" />
              } />

              {/* USER SPECIFIC ROUTE - Nested structure maintained */}
              <Route path="/dashboard" element={
                user.role === 'admin' ? <Navigate to="/admin" /> : <UserDashboard />
              }>
                <Route path="transfer" element={<TransferMoney />} />
                <Route path="receipt" element={<TransactionReceipt />} />
                <Route path="cards" element={<MyCards />} />
              </Route>

              {/* Support old paths and redirects */}
              <Route path="/transfer" element={<Navigate to="/dashboard/transfer" />} />
              <Route path="/receipt" element={<Navigate to="/dashboard/receipt" />} />
              <Route path="/cards" element={<Navigate to="/dashboard/cards" />} />
              
              {/* Smart Redirect: If admin hits root, go to /admin. If user hits root, go to /dashboard */}
              <Route path="/" element={
                user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />
              } />
              
              <Route path="*" element={
                user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />
              } />
            </>
          )}
        </Routes>
      </div>
    </Router>
  )
}

export default App