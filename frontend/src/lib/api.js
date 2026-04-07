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

// Batch
export const batchCalculate = (shifts) => api.post('/batch-calculate', { shifts }).then(r => r.data);
export const batchTemplateCSV = () => `${API}/batch-template/csv`;

// Roster Templates
export const getRosterTemplates = () => api.get('/roster-templates').then(r => r.data);
export const createRosterTemplate = (data) => api.post('/roster-templates', data).then(r => r.data);
export const updateRosterTemplate = (id, data) => api.put(`/roster-templates/${id}`, data).then(r => r.data);
export const deleteRosterTemplate = (id) => api.delete(`/roster-templates/${id}`).then(r => r.data);
export const generateFromRoster = (id, data) => api.post(`/roster-templates/${id}/generate`, data).then(r => r.data);

// Shifts (Calendar)
export const getShifts = (params) => api.get('/shifts', { params }).then(r => r.data);
export const saveShift = (data) => api.post('/shifts', data).then(r => r.data);
export const deleteShift = (id) => api.delete(`/shifts/${id}`).then(r => r.data);

// Weekly OT
export const getWeeklyOT = (params) => api.get('/weekly-ot', { params }).then(r => r.data);

// Annualised Salary
export const annualisedReconcile = (data) => api.post('/annualised-reconcile', data).then(r => r.data);

// Rate Alerts
export const getRateAlerts = () => api.get('/rate-alerts').then(r => r.data);
export const resetRateDefaults = (code) => api.post(`/rate-alerts/reset-defaults/${code}`).then(r => r.data);

// Leave Calculator
export const calculateLeave = (data) => api.post('/leave-calculate', data).then(r => r.data);

// Analytics
export const getAnalyticsSummary = () => api.get('/analytics/summary').then(r => r.data);
export const getAnalyticsTrends = () => api.get('/analytics/trends').then(r => r.data);

// Comparison
export const compareScenarios = (data) => api.post('/compare', data).then(r => r.data);

// Bulk Employee Import
export const bulkImportEmployees = (employees) => api.post('/employees/bulk-import', { employees }).then(r => r.data);
export const employeeTemplateCSV = () => `${API}/employees/bulk-template/csv`;

// Payroll Export
export const payrollExportURL = (format, params) => {
  const url = `${API}/payroll-export/${format}`;
  return api.post(url, params).then(r => r.data);
};
export const getPayrollExport = (format, params) => `${API}/payroll-export/${format}`;

// Audit Trail
export const getAuditTrail = () => api.get('/audit-trail').then(r => r.data);
export const exportAuditCSV = () => `${API}/audit-trail/csv`;
export const clearAuditTrail = () => api.delete('/audit-trail').then(r => r.data);

// Health
export const healthCheck = () => api.get('/health').then(r => r.data);
