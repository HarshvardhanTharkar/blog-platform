import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Link to="/" className="navbar-brand">
            <span className="brand-icon">✦</span>
            <span className="brand-text">inkwell</span>
          </Link>
          <p className="footer-tagline">Where ideas find their voice.</p>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h4>Platform</h4>
            <Link to="/">Explore</Link>
            <Link to="/register">Start Writing</Link>
          </div>
          <div className="footer-col">
            <h4>Account</h4>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Create Account</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Inkwell. Built with the MERN stack.</p>
      </div>
    </footer>
  );
};

export default Footer;
