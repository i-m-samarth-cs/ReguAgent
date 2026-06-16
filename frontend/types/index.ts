export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  department_id: number | null;
  is_active: boolean;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description: string;
  is_active: boolean;
}

export interface RegulatoryDocument {
  id: number;
  source: string;
  title: string;
  reference_number: string;
  published_date: string;
  summary: string;
  status: string;
  risk_level: string;
  topic_tags: string[];
  ingested_at: string;
  content?: string;
}

export interface Obligation {
  id: number;
  document_id: number;
  title: string;
  description: string;
  obligation_type: string;
  affected_entities: string[];
  deadline: string | null;
  priority: string;
  extracted_by_agent: boolean;
  created_at: string;
}

export interface MAP {
  id: number;
  obligation_id: number | null;
  title: string;
  description: string;
  department_id: number;
  department_name: string;
  priority: string;
  effort_estimate: string;
  dependencies: string[];
  acceptance_criteria: string[];
  evidence_requirement: string;
  deadline: string | null;
  status: string;
  assigned_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface ValidationEvent {
  id: number;
  map_id: number;
  validator_name: string;
  result: "PASS" | "FAIL" | "NEEDS_REVIEW";
  score: number;
  notes: string;
  details: Record<string, unknown>;
  validated_at: string;
}

export interface AuditLog {
  id: number;
  user_id: number | null;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: number | null;
  details: Record<string, unknown>;
  timestamp: string;
}

export interface AdminMetrics {
  total_documents: number;
  total_obligations: number;
  total_maps: number;
  pending_maps: number;
  validated_maps: number;
  completed_maps: number;
  overdue_maps: number;
  overall_compliance_score: number;
  overall_risk_score: number;
  maps_by_department: { department: string; total: number; completed: number; overdue: number }[];
  maps_by_status: { status: string; count: number }[];
  trend_data: { week: string; compliance: number; total_maps: number }[];
}

export interface DeptMetrics {
  department_id: number;
  department_name: string;
  total_maps: number;
  completed_maps: number;
  overdue_maps: number;
  in_progress_maps: number;
  compliance_score: number;
  risk_score: number;
  status_breakdown: Record<string, number>;
}
