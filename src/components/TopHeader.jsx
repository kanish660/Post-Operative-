import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, User, Menu, ChevronDown, Shield, Activity } from 'lucide-react';

export const TopHeader = ({ title, subtitle, unreadCount = 0, onToggleMobileSidebar }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getProfileLink = () => {
    if (role === 'patient') return '/patient/profile';
    if (role === 'doctor') return '/doctor/notes';
    if (role === 'admin') return '/admin/users';
    return '/';
  };

  const getAlertsLink = () => {
    if (role === 'patient') return '/patient/alerts';
    if (role === 'doctor') return '/doctor/dashboard';
    if (role === 'admin') return '/admin/dashboard';
    return '/';
  };

  return (
    <header className="top-header">
      <div className="top-header-left">
        {onToggleMobileSidebar && (
          <button 
            className="mobile-menu-toggle" 
            onClick={onToggleMobileSidebar}
            aria-label="Toggle navigation menu"
          >
            <Menu size={20} />
          </button>
        )}
        {title && (
          <div className="top-header-title-block">
            <h1 className="top-header-title">{title}</h1>
            {subtitle && <p className="top-header-subtitle">{subtitle}</p>}
          </div>
        )}
      </div>

      <div className="top-header-right">
        {/* Notifications Icon with Badge */}
        <Link 
          to={getAlertsLink()} 
          className="top-header-icon-btn" 
          title={`${unreadCount} Unread Alerts`}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="top-header-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </Link>

        {/* User Profile Avatar Card */}
        <Link to={getProfileLink()} className="top-header-user">
          <div className="top-header-avatar">
            <User size={18} />
          </div>
          <div className="top-header-user-info">
            <span className="top-header-user-name">{user?.name || 'User'}</span>
            <span className={`role-pill role-${role}`}>{role}</span>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default TopHeader;
