import React, { useEffect, useState } from 'react';
import { getAdminActivityLogs } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { Activity, Clock, User } from 'lucide-react';

export default function SystemActivityPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminActivityLogs()
      .then(r => setLogs(r.data.logs || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const actionColor = {
    login: '#10b981',
    logout: '#6b7280',
    register: '#3b82f6',
    upload: '#f59e0b',
    update: '#6366f1',
    delete: '#ef4444',
  };

  const getColor = (action = '') => {
    const key = Object.keys(actionColor).find(k => action.toLowerCase().includes(k));
    return actionColor[key] || '#6b7280';
  };

  return (
    <div className="app-layout">
      <Sidebar role="admin" />
      <div className="main-content">
        <div className="page-header">
          <div><h1>System Activity</h1><p className="subtitle">Audit log of all system events</p></div>
          <div className="badge-count"><Activity size={16} />{logs.length} events</div>
        </div>

        {loading ? (
          <div className="loading-screen"><div className="spinner"></div><p>Loading activity log...</p></div>
        ) : logs.length === 0 ? (
          <div className="card empty-state">
            <Activity size={48} opacity={0.3} />
            <h3>No Activity Logs Yet</h3>
            <p>System events will appear here as users interact with the portal.</p>
          </div>
        ) : (
          <div className="card">
            <div className="activity-timeline">
              {logs.map((log, i) => (
                <div key={i} className="activity-item">
                  <div className="activity-dot" style={{ background: getColor(log.action) }}></div>
                  <div className="activity-content">
                    <div className="activity-top">
                      <span className="activity-action" style={{ color: getColor(log.action) }}>{log.action}</span>
                      <span className="activity-time"><Clock size={12} />{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                    <p className="activity-desc">{log.description || log.details}</p>
                    {log.user_name && (
                      <p className="activity-user"><User size={12} />{log.user_name} ({log.user_role})</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
