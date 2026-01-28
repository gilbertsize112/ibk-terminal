import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Signup from './Signup'
import Login from './Login' 
import AdminDashboard from './AdminDashboard'
import UserDashboard from './UserDashboard' 
import TransferMoney from './TransferMoney'
import TransactionReceipt from './TransactionReceipt'
// ✅ Import the new component
import InstallPrompt from './InstallPrompt' 
import './App.css'

function App() {
  const [isLogin, setIsLogin] = useState(false); 
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  if (loading) return null;

  return (
    <Router>
      <div className="App">
        {/* ✅ The Install Prompt floats globally here */}
        <InstallPrompt />

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
                )
                }
                
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

              <Route path="/transfer" element={<TransferMoney />} />

              <Route path="/receipt" element={<TransactionReceipt />} />

              <Route path="*" element={<Navigate to="/dashboard" />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  )
}

export default App