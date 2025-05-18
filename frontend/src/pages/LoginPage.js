import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '../services/api';
import { setCredentials } from '../redux/slices/authSlice';
import { formatError } from '../utils/errorHandler';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { removeToken, removeUserData } from '../utils/tokenHelper';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect path from URL query string
  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get('redirect') || '/';
  
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const [login, { isLoading }] = useLoginMutation();

  // Clear any existing authentication data when the login page loads
  useEffect(() => {
    removeToken();
    removeUserData();
    console.log('🧹 Cleared existing auth data on login page load');
  }, []);

  useEffect(() => {
    // If user is already logged in, redirect to specified path or home page
    if (isAuthenticated) {
      navigate(redirect);
    }
  }, [isAuthenticated, navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');
    
    if (!email || !password) {
      setErrorMessage('Please enter both email and password');
      return;
    }

    try {
      setInfoMessage('Logging in...');
      
      // Clear any existing auth data before login
      removeToken();
      removeUserData();
      
      const response = await login({ email, password }).unwrap();
      console.log('🔐 Login response detail:', JSON.stringify(response));
      
      // Add isAdmin flag for backward compatibility if needed
      const userData = {
        ...response,
        isAdmin: response.role?.toLowerCase() === 'admin'
      };
      
      console.log('👤 Enhanced user data with isAdmin flag:', userData);
      
      // Dispatch with enhanced user data
      dispatch(setCredentials(userData));
      
      // Show the destinations and add a slight delay for state to settle
      if (userData.role === 'admin' || userData.isAdmin === true) {
        console.log('🚀 Navigating to admin dashboard...');
        setInfoMessage('Login successful! Redirecting to admin dashboard...');
        
        // Add a small delay to ensure state is updated
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 500);
      } else {
        setInfoMessage('Login successful! Redirecting...');
        setTimeout(() => {
          navigate(redirect);
        }, 300);
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setErrorMessage(formatError(err));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-sidebar">
          <div className="auth-logo-block">
            <img src="/logo.png" alt="2NADH" className="logo-image" />
          </div>
        </div>
        
        <div className="auth-form-container">
          <div className="auth-form-wrapper">
            <div className="back-to-home">
              <Link to="/" className="btn-back">
                <i className="fas fa-home"></i> Back to Home
              </Link>
            </div>
            
            <h2>Sign-in</h2>
            
            {errorMessage && <Message variant="error">{errorMessage}</Message>}
            {infoMessage && <Message variant="info">{infoMessage}</Message>}
            
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <button 
                type="submit" 
                className="btn-login"
                disabled={isLoading}
              >
                {isLoading ? <Loader /> : 'Login'}
              </button>
              
              <div className="auth-link">
                Don't have an account? <Link to="/register">Signup Here</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 