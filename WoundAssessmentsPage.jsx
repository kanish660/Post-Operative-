import React, { useEffect, useState } from 'react';
import { getAdminWoundAssessments } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { Camera, CheckCircle, AlertCircle, Search } from 'lucide-react';

export default function WoundAssessmentsPage() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getAdminWoundAssessments()
      .then(r => setAssessments(r.data.assessments || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = assessments.filter(a => {
    const matchSearch = a.patient_name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all'
      ? true
      : filter === 'healing' ? a.assessment?.toLowerCase().includes('healing normally')
      : !a.assessment?.toLowerCase().includes('healing normally');
    return matchSearch && matchFilter;
  });

  const healingCount = assessments.filter(a => a.assessment?.toLowerCase().includes('healing normally')).length;
  const attentionCount = assessments.length - healingCount;

  return (
    <div className="app-layout">
      <Sidebar role="admin" />
      <div className="main-content">
        <div className="page-header">
          <div><h1>AI Wound Assessments</h1><p className="subtitle">All wound image uploads and assessment results</p></div>
        </div>

        <div className="stats-grid mb-4">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)' }}><Camera size={22} color="#6366f1" /></div>
            <div><p className="stat-label">Total Assessments</p><p className="stat-value">{assessments.length}</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}><CheckCircle size={22} color="#10b981" /></div>
            <div><p className="stat-label">Healing Normally</p><p className="stat-value" style={{ color: '#10b981' }}>{healingCount}</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)' }}><AlertCircle size={22} color="#ef4444" /></div>
            <div><p className="stat-label">Needs Attention</p><p className="stat-value" style={{ color: '#ef4444' }}>{attentionCount}</p></div>
          </div>
        </div>

        <div className="filter-row mb-4">
          <div className="search-wrapper">
            <Search size={16} className="search-icon" />
            <input className="search-input" placeholder="Search by patient name..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-select filter-select" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All Results</option>
            <option value="healing">Healing Normally</option>
            <option value="attention">Needs Attention</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-screen"><div className="spinner"></div><p>Loading assessments...</p></div>
        ) : (
          <div className="card">
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr><th>Patient</th><th>Date</th><th>Assessment</th><th>Confidence</th><th>Notes</th></tr>
                </thead>
                <tbody>
                  {filtered.map((a, i) => {
                    const isHealing = a.assessment?.toLowerCase().includes('healing normally');
                    return (
                      <tr key={i}>
                        <td>{a.patient_name}</td>
                        <td>{new Date(a.upload_date || a.created_at).toLocaleDateString()}</td>
                        <td>
                          <span style={{ color: isHealing ? '#10b981' : '#ef4444', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {isHealing ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                            {a.assessment}
                          </span>
                        </td>
                        <td>
                          <div className="confidence-bar-wrapper" style={{ minWidth: '100px' }}>
                            <div className="confidence-bar-bg" style={{ height: '6px' }}>
                              <div className={`confidence-bar-fill ${isHealing ? 'bar-green' : 'bar-red'}`} style={{ width: `${a.confidence}%`, height: '6px' }}></div>
                            </div>
                            <span style={{ fontSize: '0.8rem' }}>{a.confidence}%</span>
                          </div>
                        </td>
                        <td>{a.notes || '—'}</td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={5} className="empty-cell">No assessments found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
