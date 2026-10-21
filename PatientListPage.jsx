import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllPatients } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { Eye, Search, Users } from 'lucide-react';

export default function PatientListPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAllPatients();
        setPatients(res.data.patients || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const filtered = patients.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || p.surgery_type?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.recovery_status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="app-layout">
      <Sidebar role="doctor" />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1>My Patients</h1>
            <p className="subtitle">All patients under your care</p>
          </div>
          <div className="badge-count"><Users size={16} />{patients.length} total</div>
        </div>

        {/* Search & Filter */}
        <div className="filter-row mb-4">
          <div className="search-wrapper">
            <Search size={16} className="search-icon" />
            <input className="search-input" placeholder="Search by name or surgery..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-select filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="Good">Good</option>
            <option value="Needs Attention">Needs Attention</option>
            <option value="Critical">Critical</option>
            <option value="Under Review">Under Review</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-screen"><div className="spinner"></div><p>Loading patients...</p></div>
        ) : (
          <div className="patients-grid">
            {filtered.map(p => {
              const days = p.surgery_date ? Math.floor((new Date() - new Date(p.surgery_date)) / 86400000) : '—';
              const isAlert = p.recovery_status === 'Needs Attention' || p.recovery_status === 'Critical';
              return (
                <div key={p.id} className={`patient-card card ${isAlert ? 'patient-card-alert' : ''}`}>
                  <div className="patient-card-top">
                    <div className="patient-avatar-lg">{p.name?.charAt(0).toUpperCase()}</div>
                    <div>
                      <h3 className="patient-card-name">{p.name}</h3>
                      <p className="patient-card-surgery">{p.surgery_type}</p>
                    </div>
                  </div>
                  <div className="patient-card-meta">
                    <div><span>Post-Op Day</span><strong>{days}</strong></div>
                    <div><span>Hospital</span><strong>{p.hospital_name || '—'}</strong></div>
                  </div>
                  <div className="patient-card-footer">
                    <span className={`badge ${p.recovery_status === 'Good' ? 'badge-success' : p.recovery_status === 'Critical' ? 'badge-danger' : 'badge-warning'}`}>
                      {p.recovery_status || 'Under Review'}
                    </span>
                    <Link to={`/doctor/patient/${p.id}`} className="btn btn-sm btn-primary">
                      <Eye size={14} /> View Details
                    </Link>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                <Users size={48} opacity={0.3} />
                <h3>No patients found</h3>
                <p>Try a different search or filter.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
