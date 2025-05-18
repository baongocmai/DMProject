import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useForgotPasswordMutation } from '../services/api';
import Layout from '../components/Layout';
import Loader from '../components/Loader';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  
  // Forgot password mutation
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  
  // Handle email input change
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic email validation
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      setError('');
      await forgotPassword({ email }).unwrap();
      setEmailSent(true);
    } catch (err) {
      setError(err.data?.message || 'Failed to send password reset email. Please try again.');
    }
  };
  
  return (
    <Layout>
      <Container className="py-5">
        <Card className="p-4 mx-auto" style={{ maxWidth: '500px' }}>
          <h2 className="text-center mb-4">Forgot Password</h2>
          
          {emailSent ? (
            <Alert variant="success">
              <Alert.Heading>Password Reset Email Sent</Alert.Heading>
              <p>
                We've sent password reset instructions to <strong>{email}</strong>.
                Please check your email and follow the instructions to reset your password.
              </p>
              <hr />
              <p className="mb-0">
                If you don't receive an email within a few minutes, please check your spam folder.
              </p>
              <div className="d-flex justify-content-center mt-3">
                <Link to="/login" className="btn btn-primary">
                  Return to Login
                </Link>
              </div>
            </Alert>
          ) : (
            <>
              <p className="text-center mb-4">
                Enter your email address and we'll send you instructions to reset your password.
              </p>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={handleEmailChange}
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
                  {isLoading ? <Loader size="sm" inline /> : 'Send Reset Instructions'}
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

export default ForgotPasswordPage; 