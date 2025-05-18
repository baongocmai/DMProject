import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useRegisterMutation, useVerifyOTPMutation } from '../services/api';
import { formatError } from '../utils/errorHandler';
import Message from '../components/Message';
import Loader from '../components/Loader';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [userId, setUserId] = useState(null);

  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();
  const [verifyOTP, { isLoading: isVerifyLoading }] = useVerifyOTPMutation();

  useEffect(() => {
    // If user is already logged in, redirect to home page
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    try {
      const response = await register({ name, email, password }).unwrap();
      setUserId(response.userId);
      setSuccessMessage(response.message || 'OTP sent to your email. Please verify.');
      setShowOtpForm(true);
    } catch (err) {
      setErrorMessage(formatError(err));
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!otp) {
      setErrorMessage('Please enter the OTP');
      return;
    }

    try {
      await verifyOTP({ userId, otp }).unwrap();
      setSuccessMessage('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setErrorMessage(formatError(err));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-sidebar">
          <div className="auth-logo">
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
            
            {!showOtpForm ? (
              <>
                <h2>Create Account</h2>
                
                {errorMessage && <Message variant="error">{errorMessage}</Message>}
                {successMessage && <Message variant="success">{successMessage}</Message>}
                
                <form className="auth-form" onSubmit={handleRegister}>
                  <div className="form-group">
                    <label htmlFor="fullName">Full Name</label>
                    <input
                      type="text"
                      id="fullName"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  
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
                  
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      className="form-control"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn-login"
                    disabled={isRegisterLoading}
                  >
                    {isRegisterLoading ? <Loader /> : 'Sign up'}
                  </button>
                  
                  <div className="auth-link">
                    Already have an account? <Link to="/login">Login</Link>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h2>Verify OTP</h2>
                
                {errorMessage && <Message variant="error">{errorMessage}</Message>}
                {successMessage && <Message variant="success">{successMessage}</Message>}
                
                <form className="auth-form" onSubmit={handleVerifyOTP}>
                  <div className="form-group">
                    <label htmlFor="otp">Enter OTP</label>
                    <input
                      type="text"
                      id="otp"
                      className="form-control"
                      placeholder="Enter OTP sent to your email"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn-login"
                    disabled={isVerifyLoading}
                  >
                    {isVerifyLoading ? <Loader /> : 'Verify'}
                  </button>
                  
                  <div className="auth-link">
                    <button 
                      type="button" 
                      className="btn-link"
                      onClick={() => setShowOtpForm(false)}
                    >
                      Back to Register
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 