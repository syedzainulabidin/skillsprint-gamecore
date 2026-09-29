import { useEffect, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ClipboardCheck,
  MessageSquare,
  Save,
  ShieldAlert,
  X,
} from "lucide-react";
import { api } from "../../../lib/api";
import { notify } from "../../../lib/toast";
import Layout from "../../../components/Layout";

const SEVERITY_STYLE = {
  error: "bg-rose-100/80 text-rose-800 border-rose-200/80",
  warning: "bg-amber-100/80 text-amber-900 border-amber-200/80",
  info: "bg-stone-100 text-stone-700 border-stone-200",
};

const SEVERITY_ICON = {
  error: ShieldAlert,
  warning: AlertTriangle,
  info: MessageSquare,
};

export default function Reviews() {
  const [items, setItems] = useState([]);
  const [severity, setSeverity] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState(null);
  const [decision, setDecision] = useState("acknowledge");
  const [comment, setComment] = useState("");
  const [override, setOverride] = useState("");

  const load = () => {
    const q = severity ? `?severity=${severity}` : "";
    api
      .get(`/api/review-queue${q}`)
      .then((d) => setItems(d.items || []))
      .catch((err) => {
        setError(err.message);
        notify.error(err.message);
      });
  };

  useEffect(() => {
    load();
  }, [severity]);

  const submit = async () => {
    if (!selected) return;
    setBusy(true);
    setError(null);
    try {
      await api.post(`/api/validation-findings/${selected.id}/reviews`, {
        decision,
        comment: comment || null,
        override_severity: override || null,
      });
      notify.success(`Finding #${selected.id} — ${decision}.`);
      setSelected(null);
      setComment("");
      setOverride("");
      setDecision("acknowledge");
      load();
    } catch (err) {
      setError(err.message);
      notify.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout mode="admin">
      <div className="space-y-6">
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-olive-600/10 border border-olive-600/20 flex items-center justify-center text-olive-600 shrink-0">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#222321]">
                Review Queue ({items.length})
              </h1>
              <p className="text-xs text-[#706E66] mt-0.5">
                Triage validation findings — acknowledge, resolve, reject, or
                escalate
              </p>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* FILTER */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#706E66] shrink-0">
              Filter by severity
            </label>
            <div className="sm:w-52">
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-4 py-2.5 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all appearance-none cursor-pointer"
              >
                <option value="">All severities</option>
                <option value="error">Error</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs">
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
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                    Score
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66] text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DDD0]/60 text-xs">
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-[#8C8A81]"
                    >
                      <div className="inline-flex items-center gap-2 text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" />
                        Queue is clear — no findings need review.
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((f) => {
                    const Icon = SEVERITY_ICON[f.severity] || AlertTriangle;
                    return (
                      <tr
                        key={f.id}
                        className={`hover:bg-[#F8F7F2]/60 transition-colors ${
                          selected?.id === f.id ? "bg-olive-600/5" : ""
                        }`}
                      >
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${
                              SEVERITY_STYLE[f.severity] ||
                              "bg-stone-100 text-stone-700 border-stone-200"
                            }`}
                          >
                            <Icon className="w-3 h-3" />
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
                        <td className="px-5 py-3.5 text-[#555248] max-w-md">
                          {f.message}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[#555248]">
                          {f.score != null ? f.score.toFixed(2) : "—"}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => setSelected(f)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-olive-600 hover:text-olive-700 hover:underline"
                          >
                            Review <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* REVIEW PANEL */}
        {selected && (
          <div className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs">
            <div className="px-6 pt-5 pb-3 border-b border-[#E2DDD0] bg-[#F8F7F2]/40 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-[#222321] flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-olive-600" /> Review
                  finding #{selected.id}
                </h2>
                <p className="text-[11px] text-[#706E66] mt-0.5 max-w-2xl">
                  {selected.message}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-[#8C8A81] hover:text-[#555248] shrink-0"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FieldGroup label="Decision" required>
                  <SelectPill
                    value={decision}
                    onChange={(e) => setDecision(e.target.value)}
                  >
                    <option value="acknowledge">Acknowledge</option>
                    <option value="resolve">Resolve</option>
                    <option value="reject">Reject</option>
                    <option value="escalate">Escalate</option>
                  </SelectPill>
                </FieldGroup>
                <FieldGroup
                  label="Override severity"
                  hint="Optional — reclassifies the finding."
                >
                  <SelectPill
                    value={override}
                    onChange={(e) => setOverride(e.target.value)}
                  >
                    <option value="">(no change)</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </SelectPill>
                </FieldGroup>
              </div>
              <FieldGroup label="Comment (optional)">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="Why you made this decision — visible in the audit trail."
                  className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] placeholder-[#8C8A81] px-4 py-2.5 rounded-2xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all resize-none"
                />
              </FieldGroup>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  onClick={() => setSelected(null)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#EFECE3] hover:bg-[#E2DDD0] text-[#555248] text-xs font-semibold rounded-full transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={submit}
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-olive-600 hover:bg-olive-700 text-white text-xs font-semibold rounded-full shadow-2xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {busy ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save review{" "}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function FieldGroup({ label, hint, required, children }) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#706E66] mb-1.5">
        {label}
        {required && <span className="text-rose-600 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-[#8C8A81] mt-1">{hint}</p>}
    </div>
  );
}

function SelectPill({ className = "", children, ...props }) {
  return (
    <select
      {...props}
      className={`w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-4 py-2.5 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all appearance-none cursor-pointer ${className}`}
    >
      {children}
    </select>
  );
}
