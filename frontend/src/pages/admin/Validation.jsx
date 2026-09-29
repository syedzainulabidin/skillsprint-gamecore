import { useEffect, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Copy,
  FileText,
  GitCompare,
  Info,
  Layers,
  ListChecks,
  Play,
  ShieldCheck,
  Target,
  Timer,
  XCircle,
} from "lucide-react";
import { api } from "../../lib/api";
import { notify } from "../../lib/toast";
import Layout from "../../components/Layout";

const SEVERITY_STYLE = {
  error: "bg-rose-100/80 text-rose-800 border-rose-200/80",
  warning: "bg-amber-100/80 text-amber-900 border-amber-200/80",
  info: "bg-stone-100 text-stone-700 border-stone-200",
};

const RUN_STATUS_STYLE = {
  verified: "bg-emerald-100/80 text-emerald-800 border-emerald-200/80",
  verified_with_warning: "bg-amber-100/80 text-amber-900 border-amber-200/80",
  partially_verified: "bg-amber-100/80 text-amber-900 border-amber-200/80",
  manual_review: "bg-amber-100/80 text-amber-900 border-amber-200/80",
  incomplete: "bg-rose-100/80 text-rose-800 border-rose-200/80",
  unsupported: "bg-rose-100/80 text-rose-800 border-rose-200/80",
  contradictory: "bg-rose-100/80 text-rose-800 border-rose-200/80",
  running: "bg-stone-100 text-stone-700 border-stone-200",
  succeeded: "bg-emerald-100/80 text-emerald-800 border-emerald-200/80",
  failed: "bg-rose-100/80 text-rose-800 border-rose-200/80",
};

export default function Validation() {
  const [plans, setPlans] = useState([]);
  const [selected, setSelected] = useState("");
  const [runs, setRuns] = useState([]);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get("/api/plans?limit=200")
      .then((d) => setPlans(d.items || []))
      .catch((err) => {
        setError(err.message);
        notify.error(err.message);
      });
  }, []);

  useEffect(() => {
    if (!selected) return;
    api
      .get(`/api/plans/${selected}/validation-runs`)
      .then((d) => setRuns(d.items || []))
      .catch(() => setRuns([]));
  }, [selected]);

  const runValidation = async () => {
    if (!selected) return;
    setBusy(true);
    setError(null);
    setDetail(null);
    try {
      const res = await api.post(`/api/plans/${selected}/validate`);
      setDetail(res);
      const r = await api.get(`/api/plans/${selected}/validation-runs`);
      setRuns(r.items || []);
      notify.success("Validation complete.");
    } catch (err) {
      setError(err.message);
      notify.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const loadRun = async (id) => {
    setError(null);
    try {
      const res = await api.get(`/api/validation-runs/${id}`);
      setDetail(res);
    } catch (err) {
      setError(err.message);
      notify.error(err.message);
    }
  };

  return (
    <Layout mode="admin">
      <div className="space-y-6">
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-olive-600/10 border border-olive-600/20 flex items-center justify-center text-olive-600 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#222321]">
                Validation
              </h1>
              <p className="text-xs text-[#706E66] mt-0.5">
                Independent Python ground-truth checks on every generated plan
              </p>
            </div>
          </div>
        </div>

        {/* ERROR ALERT */}
        {error && (
          <div className="flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* PLAN PICKER */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
          <h2 className="text-sm font-bold text-[#222321] mb-1 flex items-center gap-2">
            <Play className="w-4 h-4 text-olive-600" /> Run validation
          </h2>
          <p className="text-[11px] text-[#706E66] mb-4">
            Runs eight deterministic checks: coverage, traceability,
            hallucination, contradiction, duplicates, role relevance, sequence,
            distractors.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#706E66] mb-1.5">
                Plan
              </label>
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-4 py-2.5 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all appearance-none cursor-pointer"
              >
                <option value="">Select plan</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.plan_code} — {p.employee_name} — {p.job_role_name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={runValidation}
              disabled={!selected || busy}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-olive-600 hover:bg-olive-700 text-white text-xs font-semibold rounded-full shadow-2xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {busy ? (
                <>
                  <Timer className="w-4 h-4 animate-pulse" /> Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Run validation
                </>
              )}
            </button>
          </div>
        </div>

        {/* PREVIOUS RUNS */}
        {runs.length > 0 && (
          <div className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs">
            <div className="px-6 pt-5 pb-3 border-b border-[#E2DDD0] bg-[#F8F7F2]/40">
              <h2 className="text-sm font-bold text-[#222321] flex items-center gap-2">
                <Layers className="w-4 h-4 text-olive-600" /> Previous runs (
                {runs.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8F7F2] border-b border-[#E2DDD0]">
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                      ID
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                      Status
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                      Coverage
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                      Traceability
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                      Findings
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                      Created
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66] text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2DDD0]/60 text-xs">
                  {runs.map((r) => {
                    const findings =
                      (r.missing_requirement_count || 0) +
                      (r.hallucination_count || 0) +
                      (r.contradiction_count || 0) +
                      (r.duplicate_count || 0);
                    const s = r.final_status || r.status;
                    return (
                      <tr
                        key={r.id}
                        className="hover:bg-[#F8F7F2]/60 transition-colors"
                      >
                        <td className="px-5 py-3.5 font-mono text-[11px] font-bold text-[#555248]">
                          #{r.id}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${
                              RUN_STATUS_STYLE[s] ||
                              "bg-stone-100 text-stone-700 border-stone-200"
                            }`}
                          >
                            {(s || "—").replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[#555248]">
                          {r.coverage_score?.toFixed(1) ?? "—"}%
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[#555248]">
                          {r.traceability_score?.toFixed(1) ?? "—"}%
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[#555248]">
                          {findings}
                        </td>
                        <td className="px-5 py-3.5 text-[#8C8A81] font-mono text-[11px]">
                          {r.created_at
                            ? new Date(r.created_at).toLocaleString()
                            : "—"}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => loadRun(r.id)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-olive-600 hover:text-olive-700 hover:underline"
                          >
                            View <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DETAIL */}
        {detail && (
          <>
            {/* METRICS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetricTile
                icon={Target}
                value={`${(detail.coverage_score || 0).toFixed(1)}%`}
                label="Coverage"
                sub={`${detail.mandatory_covered}/${detail.mandatory_total} mandatory`}
              />
              <MetricTile
                icon={FileText}
                value={`${(detail.traceability_score || 0).toFixed(1)}%`}
                label="Traceability"
              />
              <MetricTile
                icon={XCircle}
                value={detail.missing_requirement_count}
                label="Missing"
                tone={detail.missing_requirement_count > 0 ? "warn" : "ok"}
              />
              <MetricTile
                icon={AlertTriangle}
                value={detail.hallucination_count}
                label="Hallucinations"
                sub={`${detail.contradiction_count} contradictions`}
                tone={detail.hallucination_count > 0 ? "warn" : "ok"}
              />
              <MetricTile
                icon={Copy}
                value={detail.duplicate_count}
                label="Duplicates"
                tone={detail.duplicate_count > 0 ? "warn" : "ok"}
              />
              <MetricTile
                icon={ListChecks}
                value={detail.role_irrelevance_count}
                label="Role irrelevance"
                tone={detail.role_irrelevance_count > 0 ? "warn" : "ok"}
              />
              <MetricTile
                icon={Layers}
                value={detail.sequence_violation_count}
                label="Sequence"
                tone={detail.sequence_violation_count > 0 ? "warn" : "ok"}
              />
              <MetricTile
                icon={AlertCircle}
                value={detail.distractor_conflict_count}
                label="Distractor issues"
                tone={detail.distractor_conflict_count > 0 ? "warn" : "ok"}
              />
            </div>

            {/* FINDINGS */}
            <div className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs">
              <div className="px-6 pt-5 pb-3 border-b border-[#E2DDD0] bg-[#F8F7F2]/40">
                <h2 className="text-sm font-bold text-[#222321] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-olive-600" /> Findings (
                  {detail.findings.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8F7F2] border-b border-[#E2DDD0]">
                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                        Severity
                      </th>
                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                        Issue
                      </th>
                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                        Entity
                      </th>
                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                        Message
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2DDD0]/60 text-xs">
                    {detail.findings.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-5 py-8 text-center text-[#8C8A81]"
                        >
                          <div className="inline-flex items-center gap-2 text-emerald-700">
                            <CheckCircle2 className="w-4 h-4" />
                            No findings — this plan is clean.
                          </div>
                        </td>
                      </tr>
                    ) : (
                      detail.findings.map((f) => (
                        <tr
                          key={f.id}
                          className="hover:bg-[#F8F7F2]/60 transition-colors"
                        >
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${
                                SEVERITY_STYLE[f.severity] ||
                                "bg-stone-100 text-stone-700 border-stone-200"
                              }`}
                            >
                              {f.severity}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-[#222321] font-medium capitalize">
                            {(f.issue_type || "").replace(/_/g, " ")}
                          </td>
                          <td className="px-5 py-3.5 text-[#555248] font-mono text-[11px]">
                            {f.entity_type}
                            {f.entity_code ? ` ${f.entity_code}` : ""}
                          </td>
                          <td className="px-5 py-3.5 text-[#555248]">
                            {f.message}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* COMPARISONS */}
            <div className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs">
              <div className="px-6 pt-5 pb-3 border-b border-[#E2DDD0] bg-[#F8F7F2]/40">
                <h2 className="text-sm font-bold text-[#222321] flex items-center gap-2">
                  <GitCompare className="w-4 h-4 text-olive-600" /> Requirement
                  comparisons ({detail.comparisons.length})
                </h2>
                <p className="text-[11px] text-[#706E66] mt-0.5">
                  Python-expected vs GenAI output, requirement by requirement
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8F7F2] border-b border-[#E2DDD0]">
                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                        Requirement
                      </th>
                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                        Coverage
                      </th>
                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                        Traceability
                      </th>
                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                        Status
                      </th>
                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2DDD0]/60 text-xs">
                    {detail.comparisons.map((c) => {
                      let exp = {};
                      try {
                        exp = c.python_expected_json
                          ? JSON.parse(c.python_expected_json)
                          : {};
                      } catch (e) {}
                      const coverageOK = c.coverage_status === "covered";
                      const validationOK = c.validation_status === "verified";
                      return (
                        <tr
                          key={c.id}
                          className="hover:bg-[#F8F7F2]/60 transition-colors"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] font-bold text-[#555248]">
                                {exp.req_code}
                              </span>
                              <span className="text-[#222321] font-medium">
                                {exp.title}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            {coverageOK ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#323F35] bg-olive-600/15 border border-[#4A5D4E]/25 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3 text-olive-600" />
                                {c.coverage_status}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-100/80 border border-rose-200/80 px-2 py-0.5 rounded-full">
                                <XCircle className="w-3 h-3 text-rose-600" />
                                {c.coverage_status}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-[#555248] capitalize">
                            {(c.traceability_status || "—").replace(/_/g, " ")}
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${
                                validationOK
                                  ? "bg-emerald-100/80 text-emerald-800 border-emerald-200/80"
                                  : "bg-amber-100/80 text-amber-900 border-amber-200/80"
                              }`}
                            >
                              {c.validation_status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-[#555248]">
                            {c.match_details || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

function MetricTile({ icon: Icon, value, label, sub, tone = "ok" }) {
  const toneStyle =
    tone === "warn"
      ? "text-amber-700"
      : tone === "err"
        ? "text-rose-700"
        : "text-olive-600";
  return (
    <div className="bg-white border border-[#E2DDD0] rounded-2xl p-4 shadow-2xs">
      <Icon className={`w-4 h-4 mb-2 ${toneStyle}`} />
      <div className="text-2xl font-mono text-[#222321]">{value ?? "—"}</div>
      <div className="text-[11px] uppercase tracking-wider text-[#706E66] mt-1">
        {label}
      </div>
      {sub && <div className="text-[11px] text-[#8C8A81] mt-0.5">{sub}</div>}
    </div>
  );
}
