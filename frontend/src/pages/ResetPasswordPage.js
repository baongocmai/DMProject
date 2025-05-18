import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useResetPasswordMutation } from '../services/api';
import Layout from '../components/Layout';
import Loader from '../components/Loader';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract otp and email from query parameters
  const queryParams = new URLSearchParams(location.search);
  const otp = queryParams.get('otp');
  const email = queryParams.get('email');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordReset, setPasswordReset] = useState(false);
  const [error, setError] = useState('');
  
  // Password reset mutation
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  
  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    hasNumber: false,
    hasLowercase: false,
    hasUppercase: false,
    hasSpecial: false
  });
  
  // Handle password input change
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    
    // Validate password requirements
    setPasswordValidation({
      length: value.length >= 8,
      hasNumber: /\d/.test(value),
      hasLowercase: /[a-z]/.test(value),
      hasUppercase: /[A-Z]/.test(value),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(value)
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Check if password meets all requirements
    const isPasswordValid = Object.values(passwordValidation).every(value => value);
    if (!isPasswordValid) {
      setError('Please ensure your password meets all requirements');
      return;
    }
    
    try {
      setError('');
      await resetPassword({ email, otp, password }).unwrap();
      setPasswordReset(true);
    } catch (err) {
      setError(err.data?.message || 'Failed to reset password. Please try again.');
    }
  };
  
  // If no OTP or email in URL, redirect to forgot password
  if (!otp || !email) {
    return (
      <Layout>
        <Container className="py-5">
          <Card className="p-4 mx-auto" style={{ maxWidth: '500px' }}>
            <Alert variant="danger">
              <Alert.Heading>Invalid Reset Link</Alert.Heading>
              <p>
                The password reset link you followed is invalid or has expired.
                Please request a new password reset.
              </p>
              <div className="d-flex justify-content-center mt-3">
                <Link to="/forgot-password" className="btn btn-primary">
                  Request Password Reset
                </Link>
              </div>
            </Alert>
          </Card>
        </Container>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Container className="py-5">
        <Card className="p-4 mx-auto" style={{ maxWidth: '500px' }}>
          <h2 className="text-center mb-4">Reset Your Password</h2>
          
          {passwordReset ? (
            <Alert variant="success">
              <Alert.Heading>Password Reset Successful</Alert.Heading>
              <p>
                Your password has been reset successfully. You can now log in with your new password.
              </p>
              <div className="d-flex justify-content-center mt-3">
                <Button variant="primary" onClick={() => navigate('/login')}>
                  Go to Login
                </Button>
              </div>
            </Alert>
          ) : (
            <>
              <p className="text-center mb-4">
                Please create a new password for your account.
              </p>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={handlePasswordChange}
                    disabled={isLoading}
                    required
                  />
                  <div className="mt-2 small">
                    <p className="mb-1">Password must have:</p>
                    <ul className="ps-3">
                      <li className={passwordValidation.length ? 'text-success' : 'text-muted'}>
                        At least 8 characters
                      </li>
                      <li className={passwordValidation.hasUppercase ? 'text-success' : 'text-muted'}>
                        At least one uppercase letter
                      </li>
                      <li className={passwordValidation.hasLowercase ? 'text-success' : 'text-muted'}>
                        At least one lowercase letter
                      </li>
                      <li className={passwordValidation.hasNumber ? 'text-success' : 'text-muted'}>
                        At least one number
                      </li>
                      <li className={passwordValidation.hasSpecial ? 'text-success' : 'text-muted'}>
                        At least one special character
                      </li>
                    </ul>
                  </div>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </Form.Group>
                
                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mb-3"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader size="sm" inline /> : 'Reset Password'}
                </Button>
                
                <div className="text-center mt-3">
                  <Link to="/login">Return to Login</Link>
                </div>
              </Form>
            </>
          )}
        </Card>
      </Container>
    </Layout>
  );
};

export default ResetPasswordPage; 