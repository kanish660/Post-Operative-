import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { getPatientDetails, getPatientRecoveryHistory, getPatientWoundHistory, addDoctorNote, updatePatientRecoveryStatus } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import MedicalDisclaimer from '../../components/MedicalDisclaimer';
import RecoveryChart from '../../components/RecoveryChart';
import StatusBadge from '../../components/Badge';
import { ArrowLeft, CheckCircle2, Camera, Send, ShieldCheck, Stethoscope, User, Calendar, AlertCircle } from 'lucide-react';

export default function PatientDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [wounds, setWounds] = useState([]);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
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
        setHistory((rRes.data.recovery_updates || rRes.data.updates || []).reverse());
        setWounds(wRes.data.wound_images || wRes.data.assessments || []);
        setDoctorNotes(pRes.data.patient.doctor_notes || []);
      } catch (e) {
        console.error('Error loading patient details:', e);
      } finally {
        setLoading(false);
      }
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
    } catch (e) {
      console.error(e);
    } finally {
      setNoteLoading(false);
    }
  };

  const handleFlagPatient = async (status) => {
    setStatusLoading(true);
    try {
      await updatePatientRecoveryStatus({ patient_id: id, recovery_status: status });
      setPatient(prev => ({ ...prev, recovery_status: status }));
    } catch (e) {
      console.error(e);
    } finally {
      setStatusLoading(false);
    }
  };

  const latest = history[history.length - 1];
  const tabs = [
    { id: 'overview', label: 'Patient Overview' },
    { id: 'recovery', label: 'Recovery Logs & Trends' },
    { id: 'wounds', label: 'Wound AI Evaluations' },
    { id: 'notes', label: 'Clinical Notes & Follow-up' }
  ];

  if (loading) return (
    <div className="app-layout">
      <Sidebar role="doctor" />
      <div className="main-content">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading clinical chart...</p>
        </div>
      </div>
    </div>
  );

  if (!patient) return (
    <div className="app-layout">
      <Sidebar role="doctor" />
      <div className="main-content">
        <div className="card empty-state">
          <h3>Patient Record Not Found</h3>
          <Link to="/doctor/patients" className="btn btn-primary mt-3">Back to Patients Directory</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-layout">
      <Sidebar role="doctor" />
      <div className="main-content">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <Link to="/doctor/patients" className="link-btn mb-2" style={{ fontSize: '0.85rem' }}>
              <ArrowLeft size={16} /> Back to Patient Directory
            </Link>
            <h1>{patient.name}</h1>
            <p className="subtitle">{patient.surgery_type || 'Post-Op Patient'} • {patient.hospital || patient.hospital_name || 'City Hospital'}</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <StatusBadge status={patient.recovery_status || 'Healing Normally'} />
            <select
              className="form-select"
              style={{ width: '180px', fontWeight: 700 }}
              value={patient.recovery_status || 'Healing Normally'}
              onChange={e => handleFlagPatient(e.target.value)}
              disabled={statusLoading}
            >
              <option value="Healing Normally">✅ Healing Normally</option>
              <option value="Good">✅ Good</option>
              <option value="Needs Attention">⚠️ Needs Attention</option>
              <option value="Critical">🚨 Critical</option>
              <option value="Under Review">🔍 Under Review</option>
            </select>
          </div>
        </div>

        <MedicalDisclaimer compact />

        {/* Tab Navigation */}
        <div className="card mb-4" style={{ padding: '0.75rem 1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {tabs.map(t => (
              <button
                key={t.id}
                className={`btn btn-sm ${activeTab === t.id ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 1. Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div className="card mb-4">
              <h2 className="card-title">
                <User size={18} color="var(--primary)" /> Patient Demographic & Surgery Information
              </h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Full Patient Name</span>
                  <span className="info-value">{patient.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Age & Gender</span>
                  <span className="info-value">{patient.age ? `${patient.age} yrs` : 'N/A'} • {patient.gender || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Procedure / Surgery</span>
                  <span className="info-value">{patient.surgery_type || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Surgery Date</span>
                  <span className="info-value">{patient.surgery_date || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Hospital</span>
                  <span className="info-value">{patient.hospital || patient.hospital_name || 'City Hospital'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Attending Doctor</span>
                  <span className="info-value">Dr. {patient.doctor_name || 'Assigned Physician'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Emergency Contact</span>
                  <span className="info-value">{patient.emergency_contact || 'None specified'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Contact Phone</span>
                  <span className="info-value">{patient.phone || patient.emergency_phone || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Latest Recovery Log Summary */}
            {latest && (
              <div className="card mb-4">
                <h2 className="card-title">
                  <Calendar size={18} color="var(--primary)" /> Most Recent Daily Log ({latest.update_date || latest.created_at?.split(' ')[0]})
                </h2>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-label">Pain Level</div>
                    <div className="stat-value">{latest.pain_level ?? latest.pain_score ?? '—'}<span className="stat-unit">/10</span></div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Temperature</div>
                    <div className="stat-value">{latest.temperature ?? latest.body_temp ?? '—'}<span className="stat-unit">°F</span></div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Swelling</div>
                    <div className="stat-value capitalize" style={{ fontSize: '1.2rem' }}>{latest.swelling || 'None'}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Discharge</div>
                    <div className="stat-value capitalize" style={{ fontSize: '1.2rem' }}>{latest.discharge || 'None'}</div>
                  </div>
                </div>
                {latest.comments && (
                  <div style={{ marginTop: '1rem', padding: '0.85rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--navy-dark)' }}>Patient Observations:</strong>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>{latest.comments}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. Recovery Tab */}
        {activeTab === 'recovery' && (
          <div>
            {history.length < 2 ? (
              <div className="card empty-state">
                <AlertCircle size={32} />
                <h3>Insufficient Trend Data</h3>
                <p>Patient needs to record at least 2 daily updates for trend graphs.</p>
              </div>
            ) : (
              <>
                <div className="card mb-4">
                  <h2 className="card-title">Pain Score Trajectory</h2>
                  <RecoveryChart data={history} metric="pain_level" color="#2563eb" />
                </div>
                <div className="card">
                  <h2 className="card-title">Daily Recovery Log History</h2>
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Pain Score</th>
                          <th>Temperature</th>
                          <th>Swelling</th>
                          <th>Redness</th>
                          <th>Discharge</th>
                          <th>Bleeding</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...history].reverse().map((u, i) => (
                          <tr key={i}>
                            <td>{new Date(u.update_date || u.created_at).toLocaleDateString()}</td>
                            <td>
                              <span className={`badge ${u.pain_level <= 3 ? 'badge-success' : u.pain_level <= 6 ? 'badge-warning' : 'badge-danger'}`}>
                                {u.pain_level}/10
                              </span>
                            </td>
                            <td>{u.temperature}°F</td>
                            <td className="capitalize">{u.swelling || 'None'}</td>
                            <td className="capitalize">{u.redness || 'None'}</td>
                            <td className="capitalize">{u.discharge || 'None'}</td>
                            <td>{u.bleeding ? <span className="badge badge-danger">Active</span> : 'None'}</td>
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

        {/* 3. Wounds Tab */}
        {activeTab === 'wounds' && (
          <div>
            {wounds.length === 0 ? (
              <div className="card empty-state">
                <Camera size={32} />
                <h3>No Wound Images Uploaded</h3>
                <p>The patient has not uploaded any wound photos for visual assessment.</p>
              </div>
            ) : (
              <div className="patients-grid">
                {wounds.map(w => {
                  const statusVal = w.result || w.assessment || w.ai_result || 'Healing Normally';
                  const confVal = w.confidence || w.ai_confidence || 85;

                  return (
                    <div key={w.id} className="card">
                      {w.image_url && (
                        <img
                          src={`/uploads/${w.image_url}`}
                          alt="Wound Assessment"
                          style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}
                        />
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <StatusBadge status={statusVal} />
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--navy-dark)' }}>{confVal}% Confidence</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        {w.message || w.ai_message || 'Prototype AI visual assessment.'}
                      </p>
                      {w.notes && (
                        <div style={{ fontSize: '0.8rem', padding: '0.5rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
                          <strong>Notes:</strong> {w.notes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 4. Notes Tab */}
        {activeTab === 'notes' && (
          <div className="card">
            <h2 className="card-title">
              <Stethoscope size={18} color="var(--primary)" /> Add Clinical Note &amp; Follow-up Instructions
            </h2>
            {noteSent && (
              <div className="alert-banner alert-banner-success mb-3">
                <CheckCircle2 size={18} /> Clinical note recorded successfully!
              </div>
            )}
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Write your clinical notes, instructions, or follow-up recommendations for this patient..."
              value={note}
              onChange={e => setNote(e.target.value)}
            />
            <div className="form-actions mt-3">
              <button className="btn btn-primary" onClick={handleAddNote} disabled={noteLoading || !note.trim()}>
                {noteLoading ? <><div className="btn-spinner"></div> Saving Note...</> : <><Send size={16} /> Save Clinical Note</>}
              </button>
            </div>

            {doctorNotes.length > 0 && (
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy-dark)', marginBottom: '1rem' }}>
                  Recorded Clinical Notes ({doctorNotes.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {doctorNotes.map((n, i) => (
                    <div key={i} style={{ padding: '1rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                        <strong>Dr. {n.doctor_name || 'Physician'}</strong>
                        <span>{n.created_at ? new Date(n.created_at).toLocaleString() : 'Recent'}</span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--navy-dark)', margin: 0 }}>{n.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
