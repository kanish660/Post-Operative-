import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, User, ClipboardList, Camera, History, 
  TrendingUp, Bell, FileText, Users, Stethoscope, 
  Activity, FolderGit2, LogOut, HeartPulse
} from 'lucide-react';

export const Sidebar = () => {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!role) return null;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <HeartPulse size={20} color="#6366f1" />
        <span>PostOp<strong>Care</strong></span>
      </div>
      <div className="sidebar-role-label">{role} Portal</div>

      <ul className="sidebar-menu">
        {role === 'patient' && (
          <>
            <li className="sidebar-item">
              <NavLink to="/patient/dashboard"><LayoutDashboard size={18} /> Dashboard</NavLink>
            </li>
            <li className="sidebar-item">
              <NavLink to="/patient/profile"><User size={18} /> My Profile</NavLink>
            </li>
            <li className="sidebar-item">
              <NavLink to="/patient/daily-update"><ClipboardList size={18} /> Daily Update</NavLink>
            </li>
            <li className="sidebar-item">
              <NavLink to="/patient/wound-upload"><Camera size={18} /> Wound Upload</NavLink>
            </li>
            <li className="sidebar-item">
              <NavLink to="/patient/wound-history"><History size={18} /> Wound History</NavLink>
            </li>
            <li className="sidebar-item">
              <NavLink to="/patient/recovery-tracking"><TrendingUp size={18} /> Recovery Tracking</NavLink>
            </li>
            <li className="sidebar-item">
              <NavLink to="/patient/alerts"><Bell size={18} /> Alerts</NavLink>
            </li>
            <li className="sidebar-item">
              <NavLink to="/patient/report"><FileText size={18} /> Recovery Report</NavLink>
            </li>
          </>
        )}

        {role === 'doctor' && (
          <>
            <li className="sidebar-item">
              <NavLink to="/doctor/dashboard"><LayoutDashboard size={18} /> Dashboard</NavLink>
            </li>
            <li className="sidebar-item">
              <NavLink to="/doctor/patients"><Users size={18} /> My Patients</NavLink>
            </li>
            <li className="sidebar-item">
              <NavLink to="/doctor/notes"><Stethoscope size={18} /> Clinical Notes</NavLink>
            </li>
          </>
        )}

        {role === 'admin' && (
          <>
            <li className="sidebar-item">
              <NavLink to="/admin/dashboard"><LayoutDashboard size={18} /> Dashboard</NavLink>
            </li>
            <li className="sidebar-item">
              <NavLink to="/admin/users"><Users size={18} /> User Management</NavLink>
            </li>
            <li className="sidebar-item">
              <NavLink to="/admin/recovery-records"><ClipboardList size={18} /> Recovery Records</NavLink>
            </li>
            <li className="sidebar-item">
              <NavLink to="/admin/wound-assessments"><FolderGit2 size={18} /> Wound Assessments</NavLink>
            </li>
            <li className="sidebar-item">
              <NavLink to="/admin/activity"><Activity size={18} /> System Activity</NavLink>
            </li>
          </>
        )}
      </ul>

      <div className="sidebar-footer">
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
