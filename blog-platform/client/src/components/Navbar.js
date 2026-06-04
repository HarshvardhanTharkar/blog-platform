import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">✦</span>
          <span className="brand-text">inkwell</span>
        </Link>

        <button
          className={`menu-toggle ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} end onClick={() => setMenuOpen(false)}>
            Explore
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>
                Dashboard
              </NavLink>
              <Link to="/blogs/create" className="btn btn-primary nav-cta" onClick={() => setMenuOpen(false)}>
                Write
              </Link>
              <div className="nav-user-menu">
                <NavLink to="/profile" className="nav-avatar" onClick={() => setMenuOpen(false)}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <span className="avatar-initials">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </NavLink>
                <button className="btn btn-ghost nav-logout" onClick={handleLogout}>
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>
                Sign in
              </NavLink>
              <Link to="/register" className="btn btn-primary" onClick={() => setMenuOpen(false)}>
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
