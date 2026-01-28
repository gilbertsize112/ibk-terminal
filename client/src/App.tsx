import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Signup from './Signup'
import Login from './Login' 
import AdminDashboard from './AdminDashboard'
import UserDashboard from './UserDashboard' 
import TransferMoney from './TransferMoney' // ✅ Added import
import TransactionReceipt from './TransactionReceipt' // ✅ ADD THIS IMPORT
import './App.css'

function App() {
  const [isLogin, setIsLogin] = useState(false); 
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true); // Added to prevent flickering

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  if (loading) return null; // Wait for localStorage check

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* AUTH LOGIC */}
          {!user ? (
            <Route path="*" element={
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
                        marginLeft: '10px', 
                        background: 'none', 
                        border: 'none', 
                        color: '#004da0', 
                        textDecoration: 'underline', 
                        fontWeight: 'bold',
                        cursor: 'pointer' 
                      }}
                    >
                      {isLogin ? 'Sign Up' : 'Login'}
                    </button>
                  </p>
                </div>
              </div>
            } />
          ) : (
            <>
              {/* DASHBOARD ROUTES */}
              <Route path="/dashboard" element={
                user.role === 'admin' ? <AdminDashboard /> : <UserDashboard />
              } />

              {/* TRANSFER PAGE ROUTE */}
              <Route path="/transfer" element={<TransferMoney />} />

              {/* ✅ ADD THE RECEIPT ROUTE HERE */}
              <Route path="/receipt" element={<TransactionReceipt />} />

              {/* DEFAULT REDIRECT */}
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  )
}

export default App