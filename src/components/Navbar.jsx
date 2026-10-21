import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, LogOut, User as UserIcon, ShieldAlert } from 'lucide-react';

export const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <div style={{ backgroundColor: '#0284c7', color: '#fff', padding: '0.4rem', borderRadius: '8px', display: 'flex' }}>
          <Activity size={22} />
        </div>
        <div>
          <span>Post-Op Recovery Tracker</span>
          <span style={{ fontSize: '0.75rem', display: 'block', color: '#64748b', fontWeight: 500 }}>Wound Evaluation Portal</span>
        </div>
      </Link>

      <div className="navbar-user">
        {user ? (
          <>
            <div className="user-badge">
              <UserIcon size={16} />
              <span>{user.name}</span>
              <span className={`role-tag role-${role}`}>{role}</span>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Log out">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
