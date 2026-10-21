import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPatientDetails, getPatientRecoveryHistory, getPatientWoundHistory, addDoctorNote, updatePatientRecoveryStatus } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import MedicalDisclaimer from '../../components/MedicalDisclaimer';
import RecoveryChart from '../../components/RecoveryChart';
import { ArrowLeft, CheckCircle, AlertCircle, Camera, Send, Flag } from 'lucide-react';

export default function PatientDetailPage() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [wounds, setWounds] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [note, setNote] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState([]);
  const [noteSent, setNoteSent] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [pRes, rRes, wRes] = await Promise.all([
          getPatientDetails(id),
          getPatientRecoveryHistory(id),
          getPatientWoundHistory(id)
        ]);
        setPatient(pRes.data.patient);
        setHistory((rRes.data.updates || []).reverse());
        setWounds(wRes.data.assessments || []);
        // Store doctor notes from patient details
        setDoctorNotes(pRes.data.patient.doctor_notes || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const handleAddNote = async () => {
    if (!note.trim()) return;
    setNoteLoading(true);
    try {
      const response = await addDoctorNote({ patient_id: id, note });
      if (response && response.data && response.data.doctor_note) {
        setDoctorNotes(prev => [response.data.doctor_note, ...prev]);
      }
      setNoteSent(true);
      setNote('');
      setTimeout(() => setNoteSent(false), 3000);
    } catch (e) { console.error(e); }
    finally { setNoteLoading(false); }
  };

  const handleFlagPatient = async (status) => {
    setStatusLoading(true);
    try {
      await updatePatientRecoveryStatus({ patient_id: id, recovery_status: status });
      setPatient(prev => ({ ...prev, recovery_status: status }));
    } catch (e) { console.error(e); }
    finally { setStatusLoading(false); }
  };

  const latest = history[history.length - 1];

  const tabs = ['overview', 'recovery', 'wounds', 'notes'];

  if (loading) return <div className="app-layout"><Sidebar role="doctor" /><div className="main-content"><div className="loading-screen"><div className="spinner"></div><p>Loading patient...</p></div></div></div>;
  if (!patient) return <div className="app-layout"><Sidebar role="doctor" /><div className="main-content"><div className="card empty-state"><h3>Patient not found</h3><Link to="/doctor/patients" className="btn btn-primary">Back to Patients</Link></div></div></div>;

  return (
    <div className="app-layout">
      <Sidebar role="doctor" />
      <div className="main-content">
        <div className="page-header">
          <div>
            <Link to="/doctor/patients" className="back-link"><ArrowLeft size={16} /> Back to Patients</Link>
            <h1>{patient.name}</h1>
            <p className="subtitle">{patient.surgery_type} • {patient.hospital_name}</p>
          </div>
          <div className="patient-status-controls">
            <span className={`badge badge-lg ${patient.recovery_status === 'Good' ? 'badge-success' : patient.recovery_status === 'Critical' ? 'badge-danger' : 'badge-warning'}`}>
              {patient.recovery_status || 'Under Review'}
            </span>
            <select
              className="form-select"
              value={patient.recovery_status || ''}
              onChange={e => handleFlagPatient(e.target.value)}
              disabled={statusLoading}
            >
              <option value="Good">✅ Good</option>
              <option value="Needs Attention">⚠️ Needs Attention</option>
              <option value="Critical">🚨 Critical</option>
              <option value="Under Review">🔍 Under Review</option>
            </select>
          </div>
        </div>

        <MedicalDisclaimer compact />

        {/* Tabs */}
        <div className="tab-nav mb-4">
          {tabs.map(t => (
            <button key={t} className={`tab-btn ${activeTab === t ? 'tab-btn-active' : ''}`} onClick={() => setActiveTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div className="info-grid-lg card mb-4">
              <div className="info-item"><span className="info-label">Full Name</span><span className="info-value">{patient.name}</span></div>
              <div className="info-item"><span className="info-label">Surgery Date</span><span className="info-value">{patient.surgery_date}</span></div>
              <div className="info-item"><span className="info-label">Surgery Type</span><span className="info-value">{patient.surgery_type}</span></div>
              <div className="info-item"><span className="info-label">Hospital</span><span className="info-value">{patient.hospital_name}</span></div>
              <div className="info-item"><span className="info-label">Emergency Contact</span><span className="info-value">{patient.emergency_contact || '—'}</span></div>
              <div className="info-item"><span className="info-label">Emergency Phone</span><span className="info-value">{patient.emergency_phone || '—'}</span></div>
            </div>

            {/* Latest update summary */}
            {latest && (
              <div className="card">
                <h2 className="card-title">Latest Daily Update</h2>
                <div className="stats-grid">
                  <div className="stat-card"><div className="stat-label">Pain</div><div className="stat-value">{latest.pain_score}/10</div></div>
                  <div className="stat-card"><div className="stat-label">Temperature</div><div className="stat-value">{latest.body_temp}°F</div></div>
                  <div className="stat-card"><div className="stat-label">Swelling</div><div className="stat-value capitalize">{latest.swelling}</div></div>
                  <div className="stat-card"><div className="stat-label">Discharge</div><div className="stat-value capitalize">{latest.discharge}</div></div>
                </div>
                {latest.comments && <p className="mt-2"><strong>Comments:</strong> {latest.comments}</p>}
              </div>
            )}
          </div>
        )}

        {/* Recovery Tab */}
        {activeTab === 'recovery' && (
          <div>
            {history.length < 2 ? (
              <div className="card empty-state"><AlertCircle size={48} opacity={0.3} /><h3>Not enough data</h3><p>Patient needs to submit more daily updates.</p></div>
            ) : (
              <>
                <div className="card mb-4">
                  <h2 className="card-title">Pain Level Trend</h2>
                  <RecoveryChart data={history} metric="pain_score" color="#ef4444" />
                </div>
                <div className="card">
                  <h2 className="card-title">Recovery History</h2>
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead><tr><th>Date</th><th>Pain</th><th>Temp</th><th>Swelling</th><th>Redness</th><th>Bleeding</th></tr></thead>
                      <tbody>
                        {[...history].reverse().map((u, i) => (
                          <tr key={i}>
                            <td>{new Date(u.update_date || u.created_at).toLocaleDateString()}</td>
                            <td><span className={`badge ${u.pain_score <= 3 ? 'badge-success' : u.pain_score <= 6 ? 'badge-warning' : 'badge-danger'}`}>{u.pain_score}/10</span></td>
                            <td>{u.body_temp}°F</td>
                            <td className="capitalize">{u.swelling}</td>
                            <td className="capitalize">{u.redness}</td>
                            <td>{u.bleeding ? '⚠️ Yes' : 'No'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Wounds Tab */}
        {activeTab === 'wounds' && (
          <div>
            {wounds.length === 0 ? (
              <div className="card empty-state"><Camera size={48} opacity={0.3} /><h3>No wound images yet</h3></div>
            ) : (
              <div className="wound-gallery">
                {wounds.map(w => {
                  const isHealing = w.assessment?.toLowerCase().includes('healing normally');
                  return (
                    <div key={w.id} className="wound-card">
                      <div className="wound-img-wrapper">
                        {w.image_url
                          ? <img src={`/uploads/${w.image_url}`} alt="Wound" className="wound-thumbnail" />
                          : <div className="wound-no-img"><Camera size={32} opacity={0.3} /></div>
                        }
                        <span className={`wound-badge ${isHealing ? 'badge-healing' : 'badge-attention'}`}>
                          {isHealing ? '✅ Healing' : '⚠️ Attention'}
                        </span>
                      </div>
                      <div className="wound-meta">
                        <p className="wound-date">{new Date(w.upload_date || w.created_at).toLocaleDateString()}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Confidence: {w.confidence}%</p>
                        {w.notes && <p style={{ fontSize: '0.8rem' }}>{w.notes}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="card">
            <h2 className="card-title">Add Clinical Note</h2>
            {noteSent && <div className="alert-banner alert-banner-success mb-3"><CheckCircle size={16}/> Note added successfully!</div>}
            <textarea
              className="form-textarea"
              rows={5}
              placeholder="Write your clinical observations, recommendations, or follow-up instructions here..."
              value={note}
              onChange={e => setNote(e.target.value)}
            />
            <div className="form-actions">
              <button className="btn btn-primary" onClick={handleAddNote} disabled={noteLoading || !note.trim()}>
                {noteLoading ? <><div className="btn-spinner"></div> Saving...</> : <><Send size={16}/> Add Note</>}
              </button>
            </div>
            {/* Display existing doctor notes */}
            {doctorNotes.length > 0 && (
              <div className="notes-list mt-4">
                <h3 className="text-lg font-medium mb-2">Clinical Notes</h3>
                {doctorNotes.map((n, i) => (
                  <div key={i} className="note-item border-b pb-2 mb-2">
                    <p className="text-sm text-muted">{new Date(n.created_at).toLocaleString()} – <strong>{n.doctor_name}</strong></p>
                    <p className="mt-1">{n.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
