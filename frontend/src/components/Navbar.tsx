import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import WalletButton from './WalletButton';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="brand-icon">[S]</span>
        <span className="brand-text">
          SECLO
          <span className="brand-subtitle">SECURE PAYROLL</span>
        </span>
      </Link>

      <ul className="navbar-nav">
        <li>
          <Link to="/" className={`nav-link ${isActive('/')}`}>
            PAYROLL_TERMINAL
          </Link>
        </li>
        <li>
          <Link to="/status" className={`nav-link ${isActive('/status')}`}>
            STATUS
          </Link>
        </li>
        <li>
          <Link to="/ai" className={`nav-link ${isActive('/ai')}`}>
            AI_ASSISTANT
          </Link>
        </li>
      </ul>

      <div className="navbar-wallet">
        <WalletButton />
      </div>
    </nav>
  );
};

export default Navbar;
