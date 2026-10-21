import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllPatients } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/Badge';
import { Eye, Search, Users, LayoutGrid, Table, Calendar, ShieldAlert } from 'lucide-react';

export default function PatientListPage() {
  const [searchParams] = useSearchParams();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  
  // Read initial filters from URL parameters
  const initialStatus = searchParams.get('status') || 'all';
  const alertFilter = searchParams.get('alert') === 'high';
  
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAllPatients();
        setPatients(res.data.patients || []);
      } catch (e) {
        console.error('Error loading patient list:', e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = patients.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || p.surgery_type?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.recovery_status === statusFilter;
    const matchAlert = !alertFilter || (p.recovery_status === 'Needs Attention' || p.recovery_status === 'Critical');
    return matchSearch && matchStatus && matchAlert;
  });

  return (
    <div className="app-layout">
      <Sidebar role="doctor" />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1>Assigned Patients Directory</h1>
            <p className="subtitle">Monitor recovery status, daily logs, and AI wound evaluations for all active patients</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="badge badge-info badge-lg">
              <Users size={16} /> {patients.length} Total Patients
            </span>
          </div>
        </div>

        {/* Search & Filter Header */}
        <div className="card mb-4" style={{ padding: '1rem 1.25rem' }}>
          <div className="filter-row">
            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input
                className="search-input"
                placeholder="Search patient by name or procedure..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <select
              className="form-select filter-select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All Recovery Statuses</option>
              <option value="Healing Normally">Healing Normally</option>
              <option value="Good">Good</option>
              <option value="Needs Attention">Needs Attention</option>
              <option value="Critical">Critical</option>
              <option value="Under Review">Pending Review</option>
            </select>

            <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-app)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <button
                className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <Table size={16} />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-screen">
            <div className="spinner"></div>
            <p>Loading patient directory...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-state-icon">
              <Users size={32} />
            </div>
            <h3>No Patients Match Your Filters</h3>
            <p>Try clearing your search query or selecting "All Recovery Statuses".</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="patients-grid">
            {filtered.map(p => {
              const days = p.surgery_date ? Math.floor((new Date() - new Date(p.surgery_date)) / 86400000) : '—';
              const isAttention = p.recovery_status === 'Needs Attention' || p.recovery_status === 'Critical';

              return (
                <div
                  key={p.id}
                  className="patient-card card"
                  style={{ borderLeft: isAttention ? '4px solid var(--danger)' : '4px solid var(--success)' }}
                >
                  <div className="patient-card-top">
                    <div className="patient-avatar-lg">{p.name?.charAt(0).toUpperCase()}</div>
                    <div>
                      <h3 className="patient-card-name">{p.name}</h3>
                      <p className="patient-card-surgery">{p.surgery_type || 'Post-Op Patient'}</p>
                    </div>
                  </div>

                  <div className="patient-card-meta">
                    <div>
                      <span>Post-Op Day</span>
                      <strong>Day {days}</strong>
                    </div>
                    <div>
                      <span>Contact</span>
                      <strong>{p.phone || 'Phone on file'}</strong>
                    </div>
                  </div>

                  <div className="patient-card-footer">
                    <StatusBadge status={p.recovery_status || 'Healing Normally'} />
                    <Link to={`/doctor/patient/${p.id}`} className="btn btn-sm btn-primary">
                      <Eye size={14} /> Open Chart
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card">
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Surgery Type</th>
                    <th>Surgery Date</th>
                    <th>Post-Op Day</th>
                    <th>Recovery Status</th>
                    <th>Alert Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => {
                    const days = p.surgery_date ? Math.floor((new Date() - new Date(p.surgery_date)) / 86400000) : '—';
                    const isAttention = p.recovery_status === 'Needs Attention' || p.recovery_status === 'Critical';

                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="cell-user">
                            <div className="cell-avatar">{p.name?.charAt(0)}</div>
                            <span style={{ fontWeight: 700, color: 'var(--navy-dark)' }}>{p.name}</span>
                          </div>
                        </td>
                        <td>{p.surgery_type || 'Surgical Procedure'}</td>
                        <td>{p.surgery_date || 'N/A'}</td>
                        <td>
                          <span className="badge badge-info">Day {days}</span>
                        </td>
                        <td>
                          <StatusBadge status={p.recovery_status || 'Healing Normally'} />
                        </td>
                        <td>
                          {isAttention ? (
                            <span className="badge badge-danger">
                              <ShieldAlert size={12} /> High Priority
                            </span>
                          ) : (
                            <span className="badge badge-success">Clear</span>
                          )}
                        </td>
                        <td>
                          <Link to={`/doctor/patient/${p.id}`} className="btn btn-sm btn-primary">
                            <Eye size={14} /> Open Chart
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
