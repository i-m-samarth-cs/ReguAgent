import axios from "axios";
import Cookies from "js-cookie";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((config) => {
  const token = Cookies.get("ra_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      Cookies.remove("ra_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Auth
export const login = (email: string, password: string) =>
  api.post("/api/auth/login", { email, password }).then((r) => r.data);

export const getMe = () => api.get("/api/auth/me").then((r) => r.data);

// Regulatory
export const getRegulatory = () => api.get("/api/regulatory").then((r) => r.data);
export const getRegulatoryDoc = (id: number) => api.get(`/api/regulatory/${id}`).then((r) => r.data);
export const getRegulatoryObligations = (id: number) => api.get(`/api/regulatory/${id}/obligations`).then((r) => r.data);
export const extractObligations = (id: number) => api.post(`/api/regulatory/${id}/extract-obligations`).then((r) => r.data);
export const ingestDocument = (data: object) => api.post("/api/regulatory/ingest", data).then((r) => r.data);

// MAPs
export const getMaps = (params?: object) => api.get("/api/maps", { params }).then((r) => r.data);
export const getMap = (id: number) => api.get(`/api/maps/${id}`).then((r) => r.data);
export const updateMapStatus = (id: number, status: string, notes?: string) =>
  api.patch(`/api/maps/${id}/status`, { status, notes }).then((r) => r.data);
export const assignMap = (id: number, department_id: number, notes?: string) =>
  api.post(`/api/maps/${id}/assign`, { department_id, notes }).then((r) => r.data);
export const submitEvidence = (id: number, data: object) =>
  api.post(`/api/maps/${id}/submit-evidence`, data).then((r) => r.data);
export const triggerValidation = (id: number) =>
  api.post(`/api/maps/${id}/trigger-validation`).then((r) => r.data);
export const generateMap = (obligationId: number) =>
  api.post(`/api/obligations/${obligationId}/generate-map`).then((r) => r.data);

// Departments
export const getDepartments = () => api.get("/api/departments").then((r) => r.data);
export const getDepartmentMaps = (id: number) => api.get(`/api/departments/${id}/maps`).then((r) => r.data);
export const getDepartmentMetrics = (id: number) => api.get(`/api/departments/${id}/metrics`).then((r) => r.data);

// Validation
export const getValidationResults = (mapId: number) =>
  api.get(`/api/validation-results/${mapId}`).then((r) => r.data);

// Audit
export const getAuditLogs = (params?: object) => api.get("/api/audit-logs", { params }).then((r) => r.data);

// Admin
export const getAdminMetrics = () => api.get("/api/admin/metrics").then((r) => r.data);
export const getPromptTraces = () => api.get("/api/admin/prompt-traces").then((r) => r.data);

// Reports
export const getComplianceSummary = () => api.get("/api/reports/compliance-summary").then((r) => r.data);
