import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('post_op_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Auth APIs
export const registerUser = (data) => api.post('/register', data);
export const loginUser = (data) => api.post('/login', data);
export const getCurrentUser = () => api.get('/me');

// Patient APIs
export const getAllPatients = () => api.get('/patients');
export const getPatientDetails = (id) => api.get(`/patients/${id}`);
export const updatePatientDetails = (id, data) => api.put(`/patients/${id}`, data);

// Recovery Update APIs
export const submitRecoveryUpdate = (data) => api.post('/recovery', data);
export const getPatientRecoveryHistory = (patientId) => api.get(`/recovery/${patientId}`);

// Wound APIs
export const uploadWoundImage = (formData) => api.post('/wound/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getPatientWoundHistory = (patientId) => api.get(`/wound/${patientId}`);
export const getLatestWoundAssessment = (patientId) => api.get(`/wound/latest/${patientId}`);
export const standaloneAIAssess = (formData) => api.post('/ai/assess', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// Doctor APIs
export const getDoctorsList = () => api.get('/doctors');
export const addDoctorNote = (data) => api.post('/doctor/note', data);
export const updatePatientRecoveryStatus = (data) => api.put('/doctor/patient-status', data);

// Alert APIs
export const getPatientAlerts = (patientId) => api.get(`/alerts/${patientId}`);
export const getAllAlerts = () => api.get('/alerts');
export const updateAlertStatus = (id, status) => api.put(`/alerts/${id}`, { status });

// Report APIs
export const getRecoveryReport = (patientId) => api.get(`/report/${patientId}`);

// Admin APIs
export const getAdminStats = () => api.get('/admin/stats');
export const getAdminUsers = () => api.get('/admin/users');
export const createAdminUser = (data) => api.post('/admin/users', data);
export const deleteAdminUser = (id) => api.delete(`/admin/users/${id}`);
export const getAdminDoctors = () => api.get('/admin/doctors');
export const updateDoctorApprovalStatus = (doctorId, status) => api.put(`/admin/doctors/${doctorId}/approval`, { status });
export const getAdminRecoveryRecords = () => api.get('/admin/recovery-records');
export const getAdminWoundAssessments = () => api.get('/admin/wound-assessments');
export const getAdminActivityLogs = () => api.get('/admin/activity-logs');

export default api;
