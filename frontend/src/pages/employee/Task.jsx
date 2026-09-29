import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  FileText,
  Link as LinkIcon,
  ListChecks,
  Save,
  Target,
  Zap,
} from "lucide-react";
import { api } from "../../lib/api";
import { notify } from "../../lib/toast";
import Layout from "../../components/Layout";

const DIFFICULTY_STYLE = {
  beginner: "bg-emerald-100/80 text-emerald-800 border-emerald-200/80",
  intermediate: "bg-amber-100/80 text-amber-900 border-amber-200/80",
  advanced: "bg-rose-100/80 text-rose-800 border-rose-200/80",
};

export default function Task() {
  const { planId, taskId } = useParams();
  const [plan, setPlan] = useState(null);
  const [status, setStatus] = useState("in_progress");
  const [notes, setNotes] = useState("");
  const [evidence, setEvidence] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get(`/api/plans/${planId}`)
      .then(setPlan)
      .catch((err) => {
        setError(err.message);
        notify.error(err.message);
      });
  }, [planId]);

  const task = plan && plan.tasks.find((t) => String(t.id) === String(taskId));

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.post(`/api/tasks/${taskId}/completion`, {
        status,
        completion_notes: notes || null,
        evidence_url: evidence || null,
      });
      notify.success("Progress saved.");
    } catch (err) {
      setError(err.message);
      notify.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (error && !plan) {
    return (
      <Layout mode="employee">
        <div className="flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      </Layout>
    );
  }
  if (!plan) {
    return (
      <Layout mode="employee">
        <div className="text-sm text-[#8C8A81]">Loading...</div>
      </Layout>
    );
  }
  if (!task) {
    return (
      <Layout mode="employee">
        <div className="flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>Task not found in this plan.</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout mode="employee">
      <div className="space-y-6">
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-olive-600/10 border border-olive-600/20 flex items-center justify-center text-olive-600 shrink-0">
              <ListChecks className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono font-bold text-[#706E66] mb-0.5">
                {task.task_code}
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#222321]">
                {task.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {task.difficulty && (
                  <span
                    className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${
                      DIFFICULTY_STYLE[task.difficulty] ||
                      "bg-stone-100 text-stone-700 border-stone-200"
                    }`}
                  >
                    {task.difficulty}
                  </span>
                )}
                {task.due_stage && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#555248] bg-[#EFECE3] border border-[#E2DDD0] px-2 py-0.5 rounded-full">
                    <Calendar className="w-3 h-3 text-olive-600" />
                    {task.due_stage.replace(/_/g, " ")}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Link
            to={`/onboarding/${planId}`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#EFECE3] hover:bg-[#E2DDD0] text-[#555248] text-xs font-semibold rounded-full transition-all shrink-0 cursor-pointer self-start"
          >
            <ArrowLeft className="w-4 h-4" /> Back to plan
          </Link>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* TASK INFO */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
          <div className="space-y-3">
            {task.description && (
              <InfoRow icon={ListChecks} label="Description">
                {task.description}
              </InfoRow>
            )}
            {task.expected_outcome && (
              <InfoRow icon={Target} label="Expected outcome">
                {task.expected_outcome}
              </InfoRow>
            )}
            {task.completion_criteria && (
              <InfoRow icon={CheckCircle2} label="Completion criteria">
                {task.completion_criteria}
              </InfoRow>
            )}
            <InfoRow icon={FileText} label="Source">
              <span className="font-mono text-[11px]">
                #{task.source_document_id || "?"}
                {task.source_section && ` §${task.source_section}`}
              </span>
            </InfoRow>
          </div>
        </div>

        {/* PROGRESS FORM */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs">
          <div className="px-6 pt-5 pb-3 border-b border-[#E2DDD0] bg-[#F8F7F2]/40">
            <h2 className="text-sm font-bold text-[#222321] flex items-center gap-2">
              <Zap className="w-4 h-4 text-olive-600" /> Mark my progress
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FieldGroup label="Status">
                <SelectPill
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="not_started">Not started</option>
                  <option value="in_progress">In progress</option>
                  <option value="completed">Completed</option>
                  <option value="skipped">Skipped</option>
                </SelectPill>
              </FieldGroup>
              <div className="md:col-span-2">
                <FieldGroup
                  label="Evidence URL (optional)"
                  hint="Link to a screenshot, doc or PR that proves you did it."
                >
                  <div className="relative">
                    <LinkIcon className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C8A81]" />
                    <input
                      value={evidence}
                      onChange={(e) => setEvidence(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] placeholder-[#8C8A81] pl-9 pr-4 py-2.5 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
                    />
                  </div>
                </FieldGroup>
              </div>
            </div>
            <FieldGroup label="Notes (optional)">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Anything about how you completed this task."
                className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] placeholder-[#8C8A81] px-4 py-2.5 rounded-2xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all resize-none"
              />
            </FieldGroup>
            <div className="mt-4 flex justify-end">
              <button
                onClick={save}
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-olive-600 hover:bg-olive-700 text-white text-xs font-semibold rounded-full shadow-2xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" /> {busy ? "Saving..." : "Save progress"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <div className="w-6 h-6 rounded-full bg-olive-600/10 flex items-center justify-center text-olive-600 shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-[#706E66] mb-0.5">
          {label}
        </div>
        <div className="text-[#555248]">{children}</div>
      </div>
    </div>
  );
}

function FieldGroup({ label, hint, children }) {
  return (
    <div className="mt-4 first:mt-0">
      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#706E66] mb-1.5">
        {label}
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
