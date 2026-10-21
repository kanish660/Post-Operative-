import React, { useEffect, useState } from 'react';
import { getAdminRecoveryRecords } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { Activity, Search } from 'lucide-react';

export default function RecoveryRecordsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAdminRecoveryRecords()
      .then(r => setRecords(r.data.records || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = records.filter(r =>
    r.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.surgery_type?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-layout">
      <Sidebar role="admin" />
      <div className="main-content">
        <div className="page-header">
          <div><h1>Recovery Records</h1><p className="subtitle">All patient daily recovery updates</p></div>
          <div className="badge-count"><Activity size={16} />{records.length} records</div>
        </div>

        <div className="filter-row mb-4">
          <div className="search-wrapper">
            <Search size={16} className="search-icon" />
            <input className="search-input" placeholder="Search by patient or surgery type..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="loading-screen"><div className="spinner"></div><p>Loading records...</p></div>
        ) : (
          <div className="card">
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Surgery</th>
                    <th>Date</th>
                    <th>Pain</th>
                    <th>Temp (°F)</th>
                    <th>Swelling</th>
                    <th>Redness</th>
                    <th>Bleeding</th>
                    <th>Mobility</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={i}>
                      <td>{r.patient_name}</td>
                      <td>{r.surgery_type || '—'}</td>
                      <td>{new Date(r.update_date || r.created_at).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${r.pain_score <= 3 ? 'badge-success' : r.pain_score <= 6 ? 'badge-warning' : 'badge-danger'}`}>
                          {r.pain_score}/10
                        </span>
                      </td>
                      <td>{r.body_temp}</td>
                      <td className="capitalize">{r.swelling}</td>
                      <td className="capitalize">{r.redness}</td>
                      <td>{r.bleeding ? '⚠️ Yes' : 'No'}</td>
                      <td className="capitalize">{r.mobility?.replace(/_/g, ' ')}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={9} className="empty-cell">No records found.</td></tr>
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
