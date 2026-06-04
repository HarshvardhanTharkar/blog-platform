import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { register, loading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
    return () => clearError();
  }, [isAuthenticated]); // eslint-disable-line

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) clearError();
    if (formError) setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    const result = await register(form.name, form.email, form.password);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const displayError = formError || error;

  return (
    <div className="auth-page">
      <div className="auth-decoration">
        <div className="auth-deco-1" />
        <div className="auth-deco-2" />
      </div>
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand">
            <span className="brand-icon">✦</span> inkwell
          </div>
          <h1>Create your account</h1>
          <p>Join thousands of writers and readers.</p>
        </div>

        {displayError && (
          <div className="alert alert-error">
            <span>⚠</span> {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-input"
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
              required
              minLength={2}
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              autoComplete="new-password"
            />
            <small className="form-hint">
              Must include uppercase, lowercase, and a number.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className={`form-input ${confirmPassword && form.password !== confirmPassword ? 'input-error' : ''}`}
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (formError) setFormError('');
              }}
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? <span className="spinner spinner-sm" /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
