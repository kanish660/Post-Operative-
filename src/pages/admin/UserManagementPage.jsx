import React, { useEffect, useState } from 'react';
import { getAdminUsers, createAdminUser, deleteAdminUser, getAdminDoctors, updateDoctorApprovalStatus } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import TopHeader from '../../components/TopHeader';
import { 
  UserPlus, Trash2, Search, Users, Shield, Stethoscope, 
  Check, X, Clock, CheckCircle2, AlertCircle, Building, Award, Phone, Mail, FileText, Calendar
} from 'lucide-react';

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState('doctors'); // 'doctors' or 'all_users'
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [doctorStatusFilter, setDoctorStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient' });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => { 
    fetchData(); 
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, docsRes] = await Promise.all([
        getAdminUsers().catch(() => ({ data: { users: [] } })),
        getAdminDoctors().catch(() => ({ data: { doctors: [] } }))
      ]);
      setUsers(usersRes.data.users || []);
      setDoctors(docsRes.data.doctors || []);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError('All fields required.'); return; }
    setFormLoading(true);
    setError('');
    try {
      await createAdminUser(form);
      setShowForm(false);
      setForm({ name: '', email: '', password: '', role: 'patient' });
      fetchData();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to create user.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteAdminUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleDoctorApproval = async (doctorId, doctorName, newStatus) => {
    const actionText = newStatus === 'approved' ? 'approve' : 'reject';
    if (!window.confirm(`Are you sure you want to ${actionText} Dr. ${doctorName}?`)) return;

    try {
      await updateDoctorApprovalStatus(doctorId, newStatus);
      setActionSuccess(`Successfully ${newStatus} Dr. ${doctorName}.`);
      setTimeout(() => setActionSuccess(''), 4000);
      
      // Update state locally
      setDoctors(prev => prev.map(d => d.id === doctorId ? { ...d, approval_status: newStatus } : d));
    } catch (err) {
      alert(err.response?.data?.error || `Failed to update approval status for Dr. ${doctorName}.`);
    }
  };

  const roleIcon = { admin: Shield, doctor: Stethoscope, patient: Users };
  const roleColor = { admin: '#6366f1', doctor: '#3b82f6', patient: '#10b981' };

  const pendingDoctorsCount = doctors.filter(d => d.approval_status === 'pending').length;

  const filteredUsers = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const filteredDoctors = doctors.filter(d => {
    const matchSearch = (d.name || '').toLowerCase().includes(search.toLowerCase()) || 
                        (d.email || '').toLowerCase().includes(search.toLowerCase()) ||
                        (d.specialization || '').toLowerCase().includes(search.toLowerCase()) ||
                        (d.hospital || '').toLowerCase().includes(search.toLowerCase()) ||
                        (d.registration_number || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = doctorStatusFilter === 'all' || d.approval_status === doctorStatusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status) => {
    const s = status ? status.toLowerCase() : 'pending';
    if (s === 'approved') {
      return (
        <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
          <CheckCircle2 size={13} /> Approved
        </span>
      );
    }
    if (s === 'rejected') {
      return (
        <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
          <X size={13} /> Rejected
        </span>
      );
    }
    return (
      <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
        <Clock size={13} /> Pending
      </span>
    );
  };

  return (
    <div className="app-layout">
      <Sidebar role="admin" isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      <div className="main-content">
        <TopHeader 
          title="User & Doctor Management" 
          subtitle="Manage credentials, applications & access permissions"
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} 
        />

        <div className="page-header" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h1>User &amp; Doctor Management</h1>
            <p className="subtitle">Review doctor credential applications &amp; system users</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <UserPlus size={18} /> {showForm ? 'Cancel' : 'Add User'}
          </button>
        </div>

        {actionSuccess && (
          <div className="alert-banner alert-banner-success mb-3" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '8px' }}>
            <CheckCircle2 size={18} />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('doctors')}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              background: activeTab === 'doctors' ? 'linear-gradient(135deg, #2563eb, #06b6d4)' : 'transparent',
              color: activeTab === 'doctors' ? '#ffffff' : '#94a3b8'
            }}
          >
            <Stethoscope size={18} /> Doctor Applications &amp; Approvals
            {pendingDoctorsCount > 0 && (
              <span style={{ background: '#ef4444', color: '#ffffff', borderRadius: '99px', padding: '0.15rem 0.5rem', fontSize: '0.75rem', fontWeight: 800 }}>
                {pendingDoctorsCount} Pending
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all_users')}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              background: activeTab === 'all_users' ? 'linear-gradient(135deg, #2563eb, #06b6d4)' : 'transparent',
              color: activeTab === 'all_users' ? '#ffffff' : '#94a3b8'
            }}
          >
            <Users size={18} /> All System Users ({users.length})
          </button>
        </div>

        {/* Create User Form */}
        {showForm && (
          <div className="card mb-4">
            <h2 className="card-title">Create New User</h2>
            {error && <div className="alert-banner alert-banner-error mb-3">{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="John Doe" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="user@example.com" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Temporary password" />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-select" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? <><div className="btn-spinner"></div> Creating...</> : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search & Filters */}
        <div className="filter-row mb-4" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="search-wrapper" style={{ flex: 1, minWidth: '260px' }}>
            <Search size={16} className="search-icon" />
            <input 
              className="search-input" 
              placeholder={activeTab === 'doctors' ? "Search doctor name, specialization, reg number, hospital..." : "Search users..."} 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>

          {activeTab === 'doctors' ? (
            <select className="form-select filter-select" value={doctorStatusFilter} onChange={e => setDoctorStatusFilter(e.target.value)}>
              <option value="all">All Approval Statuses</option>
              <option value="pending">Pending Review ({doctors.filter(d => d.approval_status === 'pending').length})</option>
              <option value="approved">Approved ({doctors.filter(d => d.approval_status === 'approved').length})</option>
              <option value="rejected">Rejected ({doctors.filter(d => d.approval_status === 'rejected').length})</option>
            </select>
          ) : (
            <select className="form-select filter-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="patient">Patients</option>
              <option value="doctor">Doctors</option>
              <option value="admin">Admins</option>
            </select>
          )}
        </div>

        {/* TAB 1: DOCTOR APPLICATIONS & APPROVALS */}
        {activeTab === 'doctors' && (
          loading ? (
            <div className="loading-screen"><div className="spinner"></div><p>Loading doctor applications...</p></div>
          ) : (
            <div className="card">
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Doctor Details</th>
                      <th>Professional Credentials</th>
                      <th>Hospital / Clinic</th>
                      <th>Reg. Date</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'center' }}>Approval Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDoctors.map(d => (
                      <tr key={d.id} style={{ background: d.approval_status === 'pending' ? 'rgba(245, 158, 11, 0.04)' : 'transparent' }}>
                        <td>
                          <div className="cell-user">
                            <div className="cell-avatar" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', fontWeight: 800 }}>
                              {d.name ? d.name.charAt(0) : 'D'}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.92rem' }}>{d.name || 'Dr. Application'}</div>
                              <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                <Mail size={12} /> {d.email}
                              </div>
                              {d.phone && (
                                <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Phone size={12} /> {d.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td>
                          <div style={{ fontWeight: 600, color: '#60a5fa', fontSize: '0.88rem' }}>
                            {d.specialization || 'General Practice'}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FileText size={12} /> Reg #: <strong style={{ color: '#ffffff' }}>{d.registration_number || 'N/A'}</strong>
                          </div>
                          {d.years_of_experience !== undefined && (
                            <div style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Award size={12} /> Experience: {d.years_of_experience} yrs
                            </div>
                          )}
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: '#e2e8f0' }}>
                            <Building size={14} color="#06b6d4" /> {d.hospital || 'N/A'}
                          </div>
                        </td>

                        <td style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={13} /> {d.created_at ? new Date(d.created_at).toLocaleDateString() : '—'}
                          </div>
                        </td>

                        <td>
                          {getStatusBadge(d.approval_status)}
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: '0.5rem', justifyContent: 'center' }}>
                            {d.approval_status !== 'approved' && (
                              <button
                                type="button"
                                className="btn btn-sm"
                                style={{ background: '#059669', color: '#ffffff', border: 'none', padding: '0.4rem 0.75rem', fontWeight: 700, borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                onClick={() => handleDoctorApproval(d.id, d.name, 'approved')}
                                title="Approve Doctor Application"
                              >
                                <Check size={14} /> Approve
                              </button>
                            )}
                            {d.approval_status !== 'rejected' && (
                              <button
                                type="button"
                                className="btn btn-sm"
                                style={{ background: '#dc2626', color: '#ffffff', border: 'none', padding: '0.4rem 0.75rem', fontWeight: 700, borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                onClick={() => handleDoctorApproval(d.id, d.name, 'rejected')}
                                title="Reject Doctor Application"
                              >
                                <X size={14} /> Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredDoctors.length === 0 && (
                      <tr>
                        <td colSpan={6} className="empty-cell" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                          No doctor applications found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {/* TAB 2: ALL SYSTEM USERS */}
        {activeTab === 'all_users' && (
          loading ? (
            <div className="loading-screen"><div className="spinner"></div><p>Loading users...</p></div>
          ) : (
            <div className="card">
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => {
                      const Icon = roleIcon[u.role] || Users;
                      return (
                        <tr key={u.id}>
                          <td>
                            <div className="cell-user">
                              <div className="cell-avatar" style={{ background: `${roleColor[u.role]}22`, color: roleColor[u.role] }}>{u.name?.charAt(0)}</div>
                              <span>{u.name}</span>
                            </div>
                          </td>
                          <td>{u.email}</td>
                          <td>
                            <span className="role-tag" style={{ background: `${roleColor[u.role]}22`, color: roleColor[u.role] }}>
                              <Icon size={12} /> {u.role}
                            </span>
                          </td>
                          <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                          <td>
                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u.id)}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredUsers.length === 0 && (
                      <tr><td colSpan={5} className="empty-cell">No users found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
