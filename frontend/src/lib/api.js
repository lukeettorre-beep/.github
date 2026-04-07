import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const api = axios.create({ baseURL: API });

// Rate Tables
export const getRateTables = () => api.get('/rate-tables').then(r => r.data);
export const getRateTable = (code) => api.get(`/rate-tables/${code}`).then(r => r.data);
export const updateRateTable = (code, data) => api.put(`/rate-tables/${code}`, data).then(r => r.data);
export const seedRates = () => api.post('/seed-rates').then(r => r.data);

// Employees
export const getEmployees = () => api.get('/employees').then(r => r.data);
export const getEmployee = (id) => api.get(`/employees/${id}`).then(r => r.data);
export const createEmployee = (data) => api.post('/employees', data).then(r => r.data);
export const updateEmployee = (id, data) => api.put(`/employees/${id}`, data).then(r => r.data);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`).then(r => r.data);

// Calculate
export const calculateShift = (data) => api.post('/calculate', data).then(r => r.data);

// Audit Trail
export const getAuditTrail = () => api.get('/audit-trail').then(r => r.data);
export const exportAuditCSV = () => `${API}/audit-trail/csv`;
export const clearAuditTrail = () => api.delete('/audit-trail').then(r => r.data);

// Health
export const healthCheck = () => api.get('/health').then(r => r.data);
