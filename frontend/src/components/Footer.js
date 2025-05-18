import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaEnvelope } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (email && /^\S+@\S+\.\S+$/.test(email)) {
      try {
        // Simplified newsletter subscription - can be implemented later
        console.log('Newsletter subscription for:', email);
        setSubscribed(true);
        setEmail('');
        setTimeout(() => setSubscribed(false), 5000);
      } catch (err) {
        console.error('Failed to subscribe:', err);
      }
    }
  };

  return (
    <footer className="footer mt-auto py-5">
      <Container>
        <Row className="mb-4">
          <Col lg={4} md={6} className="mb-4 mb-lg-0">
            <h5 className="text-uppercase mb-4">Retail Store</h5>
            <p>
              Your one-stop destination for quality products at affordable prices.
              We offer a wide range of items across multiple categories.
            </p>
            <div className="social-icons">
              <a href="#!" className="me-3"><FaFacebook size={20} /></a>
              <a href="#!" className="me-3"><FaTwitter size={20} /></a>
              <a href="#!" className="me-3"><FaInstagram size={20} /></a>
              <a href="#!" className="me-3"><FaYoutube size={20} /></a>
            </div>
          </Col>
          
          <Col lg={2} md={6} className="mb-4 mb-lg-0">
            <h5 className="text-uppercase mb-4">Shop</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="/category/electronics" className="footer-link">Electronics</a>
              </li>
              <li className="mb-2">
                <a href="/category/clothing" className="footer-link">Clothing</a>
              </li>
              <li className="mb-2">
                <a href="/category/books" className="footer-link">Books</a>
              </li>
              <li className="mb-2">
                <a href="/category/home" className="footer-link">Home & Kitchen</a>
              </li>
            </ul>
          </Col>
          
          <Col lg={2} md={6} className="mb-4 mb-lg-0">
            <h5 className="text-uppercase mb-4">Support</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="/help" className="footer-link">Help Center</a>
              </li>
              <li className="mb-2">
                <a href="/shipping" className="footer-link">Shipping Info</a>
              </li>
              <li className="mb-2">
                <a href="/returns" className="footer-link">Returns & Refunds</a>
              </li>
              <li className="mb-2">
                <a href="/contact" className="footer-link">Contact Us</a>
              </li>
            </ul>
          </Col>
          
          <Col lg={4} md={6}>
            <h5 className="text-uppercase mb-4">Newsletter</h5>
            <p>Subscribe to receive updates, access to exclusive deals, and more.</p>
            <Form onSubmit={handleSubscribe}>
              <InputGroup className="mb-3">
                <Form.Control
                  placeholder="Your email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" variant="primary">
                  <FaEnvelope className="me-2" />
                  Subscribe
                </Button>
              </InputGroup>
              {subscribed && (
                <p className="text-success small">
                  Thank you for subscribing to our newsletter!
                </p>
              )}
            </Form>
          </Col>
        </Row>
        
        <hr className="my-4" />
        
        <Row className="align-items-center">
          <Col md={7} className="mb-3 mb-md-0">
            <p className="small mb-0">
              &copy; {new Date().getFullYear()} Retail Store. All rights reserved.
            </p>
          </Col>
          <Col md={5} className="text-md-end">
            <ul className="list-inline mb-0">
              <li className="list-inline-item">
                <a href="/privacy" className="footer-link small">Privacy Policy</a>
              </li>
              <li className="list-inline-item">
                <span className="mx-2">•</span>
              </li>
              <li className="list-inline-item">
                <a href="/terms" className="footer-link small">Terms of Use</a>
              </li>
              <li className="list-inline-item">
                <span className="mx-2">•</span>
              </li>
              <li className="list-inline-item">
                <a href="/cookies" className="footer-link small">Cookie Policy</a>
              </li>
            </ul>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer; 