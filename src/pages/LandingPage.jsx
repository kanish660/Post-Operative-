import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, ShieldCheck, HeartPulse, Camera, LineChart, 
  Stethoscope, ArrowRight, CheckCircle, AlertCircle
} from 'lucide-react';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

export const LandingPage = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <MedicalDisclaimer />

      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '4rem 1rem 3rem', backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '3rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.5rem' }}>
          <Activity size={16} /> Remote Post-Operative Healthcare Portal
        </div>
        <h1 style={{ fontSize: '2.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2, marginBottom: '1rem', maxWidth: '850px', margin: '0 auto 1rem' }}>
          Monitor Recovery. Stay Connected. Recover Better.
        </h1>
        <p style={{ fontSize: '1.15rem', color: '#475569', maxWidth: '700px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
          A digital platform for remote post-operative recovery tracking, daily symptom monitoring, and AI-assisted wound healing evaluation.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/login" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1.05rem' }}>
            Patient Portal Login <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '0.85rem 2rem', fontSize: '1.05rem' }}>
            Doctor Portal Login <Stethoscope size={18} />
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>Comprehensive Post-Op Care Features</h2>
          <p style={{ color: '#64748b' }}>Empowering surgical patients and clinical teams with real-time recovery data</p>
        </div>

        <div className="grid-cards">
          <div className="card">
            <div style={{ backgroundColor: '#e0f2fe', color: '#0369a1', width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <HeartPulse size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Daily Symptom Tracking</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Log daily pain scores, body temperature, swelling, redness, mobility status, and recovery observations.
            </p>
          </div>

          <div className="card">
            <div style={{ backgroundColor: '#ecfdf5', color: '#047857', width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Camera size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Wound Image Assessment</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Upload incision photos for automated visual evaluation. Receives prototype AI feedback: "Healing Normally" or "Needs Attention".
            </p>
          </div>

          <div className="card">
            <div style={{ backgroundColor: '#fef3c7', color: '#b45309', width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <LineChart size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Recovery Trends & Analytics</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Interactive visual charts mapping pain regression, fever monitoring, and mobility restoration over time.
            </p>
          </div>

          <div className="card">
            <div style={{ backgroundColor: '#f3e8ff', color: '#7e22ce', width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Stethoscope size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Doctor Review Portal</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Allows surgeons to inspect patient progress, review AI wound flags, add clinical notes, and schedule follow-ups.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works — Remote Recovery Workflow */}
      <section className="workflow-section">
        <div className="workflow-header-block">
          <span className="workflow-badge">4-Step Recovery Process</span>
          <h2 className="workflow-section-heading">How The Remote Recovery Workflow Operates</h2>
          <p className="workflow-section-subheading">Continuous clinical oversight from patient registration to full post-operative recovery.</p>
        </div>

        <div className="workflow-cards-container">
          {/* Step 01 */}
          <div className="workflow-card-wrapper">
            <div className="workflow-card">
              <div className="workflow-img-box">
                <img 
                  src="/workflow_step1_registration.jpg" 
                  alt="Patient Registration" 
                  className="workflow-img" 
                />
              </div>
              <div className="workflow-step-num">01</div>
              <h4 className="workflow-card-title">Patient Registration</h4>
              <p className="workflow-card-desc">
                Patient registers with surgery type, date, surgeon name, and contact details.
              </p>
            </div>
            <div className="workflow-arrow-desktop">
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Step 02 */}
          <div className="workflow-card-wrapper">
            <div className="workflow-card">
              <div className="workflow-img-box">
                <img 
                  src="/workflow_step2_updates.jpg" 
                  alt="Daily Recovery Updates" 
                  className="workflow-img" 
                />
              </div>
              <div className="workflow-step-num">02</div>
              <h4 className="workflow-card-title">Daily Recovery Updates</h4>
              <p className="workflow-card-desc">
                Submit daily pain metrics, body temperature, and incision photos.
              </p>
            </div>
            <div className="workflow-arrow-desktop">
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Step 03 */}
          <div className="workflow-card-wrapper">
            <div className="workflow-card">
              <div className="workflow-img-box">
                <img 
                  src="/workflow_step3_ai_alerts.jpg" 
                  alt="AI Evaluation & Alerts" 
                  className="workflow-img" 
                />
              </div>
              <div className="workflow-step-num">03</div>
              <h4 className="workflow-card-title">AI Evaluation &amp; Alerts</h4>
              <p className="workflow-card-desc">
                Prototype AI checks wound redness and flags any concerning symptom spikes.
              </p>
            </div>
            <div className="workflow-arrow-desktop">
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Step 04 */}
          <div className="workflow-card-wrapper">
            <div className="workflow-card">
              <div className="workflow-img-box">
                <img 
                  src="/workflow_step4_clinical.jpg" 
                  alt="Clinical Oversight" 
                  className="workflow-img" 
                />
              </div>
              <div className="workflow-step-num">04</div>
              <h4 className="workflow-card-title">Clinical Oversight</h4>
              <p className="workflow-card-desc">
                Surgeons review trends, add notes, mark follow-ups, and generate reports.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
