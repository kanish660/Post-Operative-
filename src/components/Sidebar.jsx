import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, User, ClipboardList, Camera, History, 
  TrendingUp, Bell, FileText, Users, Stethoscope, 
  Activity, FolderGit2, LogOut, HeartPulse, ShieldCheck, X
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { role, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!role) return null;

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={onClose} 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 90
          }} 
        />
      )}

      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <HeartPulse size={20} />
          </div>
          <span className="sidebar-brand-text">PostOp<strong>Care</strong></span>
          {onClose && (
            <button 
              onClick={onClose} 
              style={{ marginLeft: 'auto', display: 'flex', color: 'var(--text-muted)' }}
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="sidebar-role-badge">
          <ShieldCheck size={14} />
          <span>{role} Portal</span>
        </div>

        <ul className="sidebar-menu">
          {role === 'patient' && (
            <>
              <li className="sidebar-item">
                <NavLink to="/patient/dashboard" onClick={onClose}>
                  <LayoutDashboard size={18} /> Dashboard
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink to="/patient/daily-update" onClick={onClose}>
                  <ClipboardList size={18} /> Daily Recovery Update
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink to="/patient/wound-upload" onClick={onClose}>
                  <Camera size={18} /> Wound Upload
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink to="/patient/recovery-tracking" onClick={onClose}>
                  <TrendingUp size={18} /> Recovery Tracking
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink to="/patient/wound-history" onClick={onClose}>
                  <History size={18} /> Wound Analysis
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink to="/patient/report" onClick={onClose}>
                  <FileText size={18} /> Reports
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink to="/patient/profile" onClick={onClose}>
                  <User size={18} /> Profile
                </NavLink>
              </li>
            </>
          )}

          {role === 'doctor' && (
            <>
              <li className="sidebar-item">
                <NavLink to="/doctor/dashboard" onClick={onClose}>
                  <LayoutDashboard size={18} /> Dashboard
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink to="/doctor/patients" onClick={onClose}>
                  <Users size={18} /> My Patients
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink to="/doctor/notes" onClick={onClose}>
                  <Stethoscope size={18} /> Clinical Notes
                </NavLink>
              </li>
            </>
          )}

          {role === 'admin' && (
            <>
              <li className="sidebar-item">
                <NavLink to="/admin/dashboard" onClick={onClose}>
                  <LayoutDashboard size={18} /> Dashboard
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink to="/admin/users" onClick={onClose}>
                  <Users size={18} /> User Management
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink to="/admin/recovery-records" onClick={onClose}>
                  <ClipboardList size={18} /> Recovery Records
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink to="/admin/wound-assessments" onClick={onClose}>
                  <FolderGit2 size={18} /> Wound Assessments
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink to="/admin/activity" onClick={onClose}>
                  <Activity size={18} /> System Activity
                </NavLink>
              </li>
            </>
          )}
        </ul>

        <div className="sidebar-footer">
          <div style={{ padding: '0 0.5rem 0.75rem 0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--navy-dark)', display: 'block' }}>{user?.name || 'User'}</strong>
            <span style={{ fontSize: '0.75rem' }}>{user?.email || ''}</span>
          </div>
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
