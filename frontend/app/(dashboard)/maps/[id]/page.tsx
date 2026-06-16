"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getMap, getValidationResults, updateMapStatus, triggerValidation, submitEvidence, assignMap, getDepartments,
} from "@/lib/api";
import { getAuthUser, AuthUser } from "@/lib/auth";
import { MAP, ValidationEvent, Department } from "@/types";
import { StatusBadge, PriorityBadge } from "@/components/ui/badge";
import { ValidationSummary } from "@/components/validation/validation-status";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fmtDate, isOverdue } from "@/lib/utils";
import { ArrowLeft, Calendar, Building2, CheckCircle2, Bot, Upload, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function MAPDetailPage() {
  const { id } = useParams();
  const mapId = Number(id);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [map, setMap] = useState<MAP | null>(null);
  const [validations, setValidations] = useState<ValidationEvent[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [evidenceDesc, setEvidenceDesc] = useState("");
  const [evidenceType, setEvidenceType] = useState("document");
  const [selectedDept, setSelectedDept] = useState("");

  const refresh = () => {
    return Promise.all([getMap(mapId), getValidationResults(mapId)]).then(([m, v]) => {
      setMap(m);
      setValidations(v);
    });
  };

  useEffect(() => {
    Promise.all([getMap(mapId), getValidationResults(mapId), getDepartments(), getAuthUser()])
      .then(([m, v, d, u]) => {
        setMap(m);
        setValidations(v);
        setDepartments(d);
        setUser(u);
        setSelectedDept(String(m.department_id));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [mapId]);

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const updated = await updateMapStatus(mapId, newStatus);
      setMap(updated);
    } catch (e: any) {
      alert(e.response?.data?.detail || "Status update failed");
    }
  };

  const handleValidate = async () => {
    setValidating(true);
    try {
      await triggerValidation(mapId);
      await new Promise((r) => setTimeout(r, 1500));
      await refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setValidating(false);
    }
  };

  const handleEvidence = async () => {
    if (!evidenceDesc) return;
    setSubmitting(true);
    try {
      await submitEvidence(mapId, {
        evidence_type: evidenceType,
        description: evidenceDesc,
        filename: `evidence_${Date.now()}.pdf`,
      });
      setEvidenceDesc("");
      await refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReassign = async () => {
    if (!selectedDept) return;
    try {
      const updated = await assignMap(mapId, Number(selectedDept));
      setMap(updated);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" /></div>;
  }

  if (!map) return <p className="text-slate-500">MAP not found.</p>;

  const overdue = isOverdue(map.deadline, map.status);
  const isReviewerOrOfficer = user && ["reviewer", "compliance_officer"].includes(user.role);
  const canValidate = ["submitted", "in_progress"].includes(map.status) && isReviewerOrOfficer;
  const canProgress = !["completed"].includes(map.status);

  const STATUS_FLOW: Record<string, string> = {
    pending: "assigned",
    assigned: "in_progress",
    in_progress: "submitted",
    submitted: "validated",
    validated: "completed",
  };

  const nextStatus = STATUS_FLOW[map.status];
  
  // Department leads shouldn't be able to mark verified/completed
  const showProgressButton = nextStatus && canProgress && (
    !["validated", "completed"].includes(nextStatus) || isReviewerOrOfficer
  );

  return (
    <div className="space-y-5 max-w-3xl">
      <Link href="/maps" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to MAPs
      </Link>

      {/* Header */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={map.status} />
            <PriorityBadge priority={map.priority} />
            {overdue && (
              <span className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                <AlertCircle className="h-3 w-3" /> Overdue
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {canValidate && (
              <Button size="sm" onClick={handleValidate} loading={validating} variant="outline">
                <Bot className="h-3.5 w-3.5" /> Run Validation
              </Button>
            )}
            {showProgressButton && (
              <Button size="sm" onClick={() => handleStatusUpdate(nextStatus)}>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Mark {nextStatus.replace(/_/g, " ")}
              </Button>
            )}
          </div>
        </div>
        <h1 className="mt-3 text-lg font-bold text-slate-900 dark:text-slate-100">{map.title}</h1>
        <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">{map.description}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-500 dark:text-slate-400 sm:grid-cols-4">
          <div>
            <p className="font-medium text-slate-700 dark:text-slate-300">Department</p>
            <p className="flex items-center gap-1 mt-0.5"><Building2 className="h-3 w-3" />{map.department_name}</p>
          </div>
          {map.deadline && (
            <div>
              <p className="font-medium text-slate-700 dark:text-slate-300">Deadline</p>
              <p className={cn("flex items-center gap-1 mt-0.5", overdue && "text-red-500")}>
                <Calendar className="h-3 w-3" />{fmtDate(map.deadline)}
              </p>
            </div>
          )}
          <div>
            <p className="font-medium text-slate-700 dark:text-slate-300">Effort</p>
            <p className="mt-0.5">{map.effort_estimate || "—"}</p>
          </div>
          {map.assigned_at && (
            <div>
              <p className="font-medium text-slate-700 dark:text-slate-300">Assigned</p>
              <p className="mt-0.5">{fmtDate(map.assigned_at)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Acceptance Criteria */}
      {map.acceptance_criteria?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Acceptance Criteria</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {map.acceptance_criteria.map((c, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                {c}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Evidence Requirement + Submit */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="h-4 w-4 text-brand-600" /> Submit Evidence</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">{map.evidence_requirement}</p>
          <div className="flex gap-2 flex-wrap">
            <select
              value={evidenceType}
              onChange={(e) => setEvidenceType(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              {["document", "screenshot", "log", "report", "policy"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input
              className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs placeholder-slate-400 focus:border-brand-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              placeholder="Describe evidence (e.g. 'Policy document v2.1 approved by Board')"
              value={evidenceDesc}
              onChange={(e) => setEvidenceDesc(e.target.value)}
            />
            <Button size="sm" onClick={handleEvidence} loading={submitting} disabled={!evidenceDesc}>
              Submit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reassign - Limit visibility to Compliance Officer & Risk Manager */}
      {user && ["compliance_officer", "risk_manager"].includes(user.role) && (
        <Card>
          <CardHeader><CardTitle>Reassign Department</CardTitle></CardHeader>
          <CardContent className="flex gap-2">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <Button size="sm" variant="outline" onClick={handleReassign}>Reassign</Button>
          </CardContent>
        </Card>
      )}

      {/* Validation Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bot className="h-4 w-4 text-brand-600" /> Validation Results ({validations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {validations.length === 0 ? (
            <p className="text-sm text-slate-400">No validation runs yet. Submit evidence and trigger validation.</p>
          ) : (
            <ValidationSummary events={validations} />
          )}
        </CardContent>
      </Card>

      {/* Dependencies */}
      {map.dependencies?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Dependencies</CardTitle></CardHeader>
          <CardContent className="flex gap-2 flex-wrap">
            {map.dependencies.map((d, i) => (
              <span key={i} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{d}</span>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
