import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import DailyUpdateForm from './pages/patient/DailyUpdateForm';
import WoundUploadPage from './pages/patient/WoundUploadPage';
import WoundHistoryPage from './pages/patient/WoundHistoryPage';
import RecoveryTrackingPage from './pages/patient/RecoveryTrackingPage';
import PatientAlertsPage from './pages/patient/PatientAlertsPage';
import RecoveryReportPage from './pages/patient/RecoveryReportPage';
import PatientProfile from './pages/patient/PatientProfile';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PatientListPage from './pages/doctor/PatientListPage';
import PatientDetailPage from './pages/doctor/PatientDetailPage';
import DoctorNotesPage from './pages/doctor/DoctorNotesPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagementPage from './pages/admin/UserManagementPage';
import RecoveryRecordsPage from './pages/admin/RecoveryRecordsPage';
import WoundAssessmentsPage from './pages/admin/WoundAssessmentsPage';
import SystemActivityPage from './pages/admin/SystemActivityPage';

import ProtectedRoute from './components/ProtectedRoute';

function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner"></div><p>Loading...</p></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'patient') return <Navigate to="/patient/dashboard" replace />;
  if (user.role === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public & Authentication Routes */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Login Routes with Role Pre-selection */}
          <Route path="/login" element={<LoginPage defaultRole="patient" />} />
          <Route path="/patient/login" element={<LoginPage defaultRole="patient" />} />
          <Route path="/doctor/login" element={<LoginPage defaultRole="doctor" />} />
          <Route path="/admin/login" element={<LoginPage defaultRole="admin" />} />

          {/* Registration Routes with Role Pre-selection */}
          <Route path="/register" element={<RegisterPage defaultRole="patient" />} />
          <Route path="/patient/signup" element={<RegisterPage defaultRole="patient" />} />
          <Route path="/doctor/signup" element={<RegisterPage defaultRole="doctor" />} />

          <Route path="/dashboard" element={<RoleRedirect />} />

          {/* Patient Routes */}
          <Route path="/patient/dashboard" element={<ProtectedRoute role="patient"><PatientDashboard /></ProtectedRoute>} />
          <Route path="/patient/daily-update" element={<ProtectedRoute role="patient"><DailyUpdateForm /></ProtectedRoute>} />
          <Route path="/patient/wound-upload" element={<ProtectedRoute role="patient"><WoundUploadPage /></ProtectedRoute>} />
          <Route path="/patient/wound-history" element={<ProtectedRoute role="patient"><WoundHistoryPage /></ProtectedRoute>} />
          <Route path="/patient/recovery-tracking" element={<ProtectedRoute role="patient"><RecoveryTrackingPage /></ProtectedRoute>} />
          <Route path="/patient/alerts" element={<ProtectedRoute role="patient"><PatientAlertsPage /></ProtectedRoute>} />
          <Route path="/patient/report" element={<ProtectedRoute role="patient"><RecoveryReportPage /></ProtectedRoute>} />
          <Route path="/patient/profile" element={<ProtectedRoute role="patient"><PatientProfile /></ProtectedRoute>} />

          {/* Doctor Routes */}
          <Route path="/doctor/dashboard" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/patients" element={<ProtectedRoute role="doctor"><PatientListPage /></ProtectedRoute>} />
          <Route path="/doctor/patient/:id" element={<ProtectedRoute role="doctor"><PatientDetailPage /></ProtectedRoute>} />
          <Route path="/doctor/notes" element={<ProtectedRoute role="doctor"><DoctorNotesPage /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute role="admin"><UserManagementPage /></ProtectedRoute>} />
          <Route path="/admin/recovery-records" element={<ProtectedRoute role="admin"><RecoveryRecordsPage /></ProtectedRoute>} />
          <Route path="/admin/wound-assessments" element={<ProtectedRoute role="admin"><WoundAssessmentsPage /></ProtectedRoute>} />
          <Route path="/admin/activity" element={<ProtectedRoute role="admin"><SystemActivityPage /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
