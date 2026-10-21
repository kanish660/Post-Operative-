import React, { useEffect, useState } from 'react';
import { getAllPatients, addDoctorNote } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { Send, CheckCircle, FileText } from 'lucide-react';

export default function DoctorNotesPage() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getAllPatients().then(r => setPatients(r.data.patients || [])).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient || !note.trim()) { setError('Please select a patient and enter a note.'); return; }
    setLoading(true);
    setError('');
    try {
      await addDoctorNote({ patient_id: selectedPatient, note: note });
      setSuccess(true);
      setNote('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to add note.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar role="doctor" />
      <div className="main-content">
        <div className="page-header">
          <div><h1>Clinical Notes</h1><p className="subtitle">Add notes and recommendations for your patients</p></div>
        </div>

        <div className="card form-card">
          <div className="form-icon-header">
            <FileText size={32} color="#6366f1" />
            <div>
              <h2>New Clinical Note</h2>
              <p className="subtitle">Your notes will be visible in the patient's recovery report</p>
            </div>
          </div>

          {error && <div className="alert-banner alert-banner-error">{error}</div>}
          {success && <div className="alert-banner alert-banner-success"><CheckCircle size={16}/> Note saved successfully!</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Select Patient</label>
              <select className="form-select" value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
                <option value="">— Choose a patient —</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.surgery_type})</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Clinical Note</label>
              <textarea
                className="form-textarea"
                rows={8}
                placeholder="Write your clinical observations, treatment adjustments, follow-up instructions, or recommendations here..."
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? <><div className="btn-spinner"></div> Saving...</> : <><Send size={18}/> Save Clinical Note</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
