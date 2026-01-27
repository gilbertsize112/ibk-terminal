import { useState, useEffect } from 'react'
import Signup from './Signup'
import Login from './Login' 
import AdminDashboard from './AdminDashboard' // Added
import UserDashboard from './UserDashboard'   // Added
import './App.css'

function App() {
  const [isLogin, setIsLogin] = useState(true); // Default to login
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // UPDATED: Check for both user and token for a secure session check
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    } else {
      // If either is missing, ensure the state is null
      setUser(null);
    }
  }, []);

  // UPDATED: Standardized logout to match the AdminDashboard behavior
  const handleLogout = () => {
    localStorage.clear(); // Wipe everything clean
    setUser(null);
    window.location.replace('/'); // Force a hard redirect to the login page
  };

  return (
    <div className="App">
      {user ? (
        // DASHBOARD VIEW based on Role
        user.role === 'admin' ? (
          <AdminDashboard /> 
        ) : (
          <UserDashboard />
        )
      ) : (
        // AUTH VIEW
        <div className="auth-container">
          {isLogin ? (
            <Login 
              onSwitchToSignup={() => setIsLogin(false)} 
              setUser={setUser} 
            />
          ) : (
            /* UPDATED: Passing setUser here fixes the red underline */
            <Signup setUser={setUser} /> 
          )}
          
          {/* Toggle Button to switch views manually */}
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
      )}
    </div>
  )
}

export default App