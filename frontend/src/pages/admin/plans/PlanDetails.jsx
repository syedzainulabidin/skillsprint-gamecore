import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ClipboardCheck,
  Cpu,
  FileText,
  Layers,
  ListChecks,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  Trash2,
  User,
  Zap,
} from "lucide-react";
import { api } from "../../../lib/api";
import { notify } from "../../../lib/toast";
import Layout from "../../../components/Layout";

const LIFECYCLE = [
  {
    key: "draft",
    label: "Draft",
    hint: "Generated. Validate before releasing.",
  },
  {
    key: "validated",
    label: "Validated",
    hint: "Passed Python checks. Ready to release.",
  },
  {
    key: "released",
    label: "Released",
    hint: "Visible to the employee.",
  },
  {
    key: "in_progress",
    label: "In progress",
    hint: "Employee has started.",
  },
  {
    key: "completed",
    label: "Completed",
    hint: "All mandatory items done.",
  },
  {
    key: "archived",
    label: "Archived",
    hint: "Retired. Hidden from the employee.",
  },
];

const PRE_RELEASE = new Set([
  "draft",
  "ready",
  "verified",
  "verified_with_warning",
  "partially_verified",
  "manual_review",
]);

const STATUS_STYLE = {
  released: "bg-olive-600/15 text-[#323F35] border-[#4A5D4E]/25",
  in_progress: "bg-olive-600/15 text-[#323F35] border-[#4A5D4E]/25",
  completed: "bg-emerald-100/80 text-emerald-800 border-emerald-200/80",
  verified: "bg-emerald-100/80 text-emerald-800 border-emerald-200/80",
  verified_with_warning: "bg-amber-100/80 text-amber-900 border-amber-200/80",
  partially_verified: "bg-amber-100/80 text-amber-900 border-amber-200/80",
  manual_review: "bg-amber-100/80 text-amber-900 border-amber-200/80",
  draft: "bg-[#EFECE3] text-[#555248] border-[#E2DDD0]",
  ready: "bg-[#EFECE3] text-[#555248] border-[#E2DDD0]",
  archived: "bg-stone-100 text-stone-600 border-stone-200",
};

function lifecyclePosition(status) {
  if (status === "archived") return 5;
  if (status === "completed") return 4;
  if (status === "in_progress") return 3;
  if (status === "released") return 2;
  if (
    ["verified", "verified_with_warning", "partially_verified", "manual_review"].includes(
      status,
    )
  )
    return 1;
  return 0;
}

export default function PlanDetails() {
  const { planId } = useParams();
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    api
      .get(`/api/plans/${planId}`)
      .then(setPlan)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    load();
  }, [planId]);

  const retire = async () => {
    if (
      !confirm(
        "Retire this plan?\n\n" +
          "The employee will lose access. The plan and its history remain in the database " +
          "for audit. You can generate a fresh plan later, but this one is done.",
      )
    )
      return;
    setBusy(true);
    try {
      await api.del(`/api/plans/${planId}`);
      notify.success("Plan retired.");
      load();
    } catch (err) {
      setError(err.message);
      notify.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const regenerate = async () => {
    if (
      !confirm(
        "Regenerate this plan?\n\n" +
          "A brand new plan will be created with a fresh AI run. This one will be archived. " +
          "Use this if validation flagged problems that need a new take.",
      )
    )
      return;
    setBusy(true);
    try {
      const res = await api.post(`/api/plans/${planId}/regenerate`);
      notify.success(`New plan #${res.new_plan_id} created.`);
      window.location.href = `/admin/plans/${res.new_plan_id}`;
    } catch (err) {
      setError(err.message);
      notify.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const validate = async () => {
    setBusy(true);
    try {
      await api.post(`/api/plans/${planId}/validate`);
      notify.success("Validation complete. See the Validation page for findings.");
      load();
    } catch (err) {
      setError(err.message);
      notify.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const release = async () => {
    if (
      !confirm(
        "Release this plan to the employee?\n\n" +
          "They will see it in their onboarding view and can start on modules, tasks and quizzes.",
      )
    )
      return;
    setBusy(true);
    try {
      await api.post(`/api/plans/${planId}/release`);
      notify.success("Plan released. The employee can now see it.");
      load();
    } catch (err) {
      setError(err.message);
      notify.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!plan) {
    return (
      <Layout mode="admin">
        <div className="space-y-6">
          {error && (
            <div className="flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}
          <div className="text-sm text-[#8C8A81]">Loading plan...</div>
        </div>
      </Layout>
    );
  }

  const summary = plan.summary_json ? JSON.parse(plan.summary_json) : {};
  const gr = plan.generation_run;
  const status = plan.status;
  const canValidate = PRE_RELEASE.has(status) || status === "generating";
  const canRelease =
    PRE_RELEASE.has(status) && status !== "draft" && status !== "manual_review";
  const canRegenerate = PRE_RELEASE.has(status);
  const canRetire = status !== "archived";
  const isReleased = ["released", "in_progress", "completed"].includes(status);
  const activeIdx = lifecyclePosition(status);
  const statusStyle =
    STATUS_STYLE[status] || "bg-stone-100 text-stone-700 border-stone-200";

  const nextStepText =
    status === "draft" || status === "ready"
      ? "Run validation to check coverage, source traceability and hallucinations. Once the result is acceptable, release the plan to the employee."
      : status === "verified" ||
          status === "verified_with_warning" ||
          status === "partially_verified"
        ? "Validation passed. Review the findings on the Validation page, then release the plan to the employee."
        : status === "manual_review"
          ? "Validation flagged serious issues. Review them on the Validation page. Regenerate if fixes aren't possible on this plan."
          : status === "released"
            ? "Released. The employee sees the plan and can start on modules, tasks and quizzes. Assessments will need supervisor scoring later."
            : status === "in_progress"
              ? "The employee has started. Track their progress and score any completed assessments."
              : status === "completed"
                ? "All mandatory items are done. You can retire the plan when it's no longer needed."
                : status === "archived"
                  ? "This plan is retired. It's read-only."
                  : "Waiting for the generation run to finish.";

  return (
    <Layout mode="admin">
      <div className="space-y-6">
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-olive-600/10 border border-olive-600/20 flex items-center justify-center text-olive-600 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono font-bold text-[#706E66] mb-0.5">
                {plan.plan_code}
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#222321]">
                Onboarding plan
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-[#555248]">
                <span className="inline-flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-olive-600" />
                  {plan.employee_name}
                </span>
                <span className="text-[#8C8A81]">·</span>
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-olive-600" />
                  {plan.job_role_name}
                </span>
                <span
                  className={`ml-1 inline-block px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${statusStyle}`}
                >
                  {(status || "—").replace(/_/g, " ")}
                </span>
              </div>
            </div>
          </div>

          <Link
            to="/admin/plans"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#EFECE3] hover:bg-[#E2DDD0] text-[#555248] text-xs font-semibold rounded-full transition-all shrink-0 cursor-pointer self-start"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>

        {/* ERROR ALERT */}
        {error && (
          <div className="flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* LIFECYCLE PIPELINE */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
          <div className="text-sm font-bold text-[#222321] mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-olive-600" /> Plan lifecycle
          </div>
          <ol className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
            {LIFECYCLE.map((step, i) => {
              const done = i < activeIdx;
              const current = i === activeIdx;
              return (
                <li
                  key={step.key}
                  className={`rounded-2xl p-3 border transition-colors ${
                    current
                      ? "border-olive-600 bg-olive-600/5"
                      : done
                        ? "border-[#E2DDD0] bg-[#F8F7F2]/60 text-[#555248]"
                        : "border-[#E2DDD0] bg-white text-[#8C8A81]"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        current
                          ? "bg-olive-600 text-white"
                          : done
                            ? "bg-olive-600 text-white"
                            : "bg-[#EFECE3] text-[#8C8A81]"
                      }`}
                    >
                      {done ? "✓" : i + 1}
                    </div>
                    <div
                      className={`font-semibold ${
                        current ? "text-[#222321]" : ""
                      }`}
                    >
                      {step.label}
                    </div>
                  </div>
                  <div className="text-[11px] leading-snug">{step.hint}</div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* NEXT STEP CARD */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs">
          <div className="px-6 pt-5 pb-3 border-b border-[#E2DDD0] bg-[#F8F7F2]/40">
            <h2 className="text-sm font-bold text-[#222321] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-olive-600" /> Next step
            </h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-[#555248] mb-4">{nextStepText}</p>
            <div className="flex flex-wrap gap-2">
              {canValidate && (
                <ActionButton
                  onClick={validate}
                  disabled={busy}
                  variant="primary"
                  icon={ShieldCheck}
                >
                  {busy ? "Validating..." : "Validate"}
                </ActionButton>
              )}
              {canRelease && (
                <ActionButton
                  onClick={release}
                  disabled={busy}
                  variant="primary"
                  icon={Zap}
                >
                  Release to employee
                </ActionButton>
              )}
              {canRegenerate && (
                <ActionButton
                  onClick={regenerate}
                  disabled={busy}
                  variant="secondary"
                  icon={RefreshCw}
                >
                  Regenerate
                </ActionButton>
              )}
              {canRetire && (
                <ActionButton
                  onClick={retire}
                  disabled={busy}
                  variant="danger"
                  icon={Trash2}
                >
                  Retire plan
                </ActionButton>
              )}
              <Link
                to="/admin/validation"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#EFECE3] hover:bg-[#E2DDD0] text-[#555248] text-xs font-semibold rounded-full transition-all cursor-pointer"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                Open Validation page
              </Link>
            </div>
          </div>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatTile
            icon={Layers}
            value={plan.stages.length}
            label="Stages"
          />
          <StatTile
            icon={BookOpen}
            value={plan.modules.length}
            label="Modules"
            sub={`${summary.mandatory_module_count || 0} mandatory`}
          />
          <StatTile icon={ListChecks} value={plan.tasks.length} label="Tasks" />
          <StatTile
            icon={ClipboardCheck}
            value={plan.quizzes.length}
            label="Quizzes"
            sub={`${summary.quiz_question_count || 0} questions`}
          />
          <StatTile
            icon={ListChecks}
            value={plan.checklists.length}
            label="Checklists"
          />
          <StatTile
            icon={Target}
            value={plan.assessments.length}
            label="Assessments"
          />
          {gr && (
            <StatTile
              icon={Cpu}
              value={gr.model_name}
              label="AI model"
              sub={`${gr.latency_ms}ms`}
              mono={false}
            />
          )}
          {gr && (
            <StatTile
              icon={Timer}
              value={gr.token_estimate ?? "—"}
              label="Tokens"
              sub={`${gr.retries} retries`}
            />
          )}
        </div>

        {/* SUMMARY TEXT */}
        {summary.summary_text && (
          <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#706E66] mb-2">
              Plan summary
            </div>
            <p className="text-sm text-[#555248] leading-relaxed">
              {summary.summary_text}
            </p>
          </div>
        )}

        {/* GENERATION RUN */}
        {gr && (
          <div className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs">
            <div className="px-6 pt-5 pb-3 border-b border-[#E2DDD0] bg-[#F8F7F2]/40">
              <h2 className="text-sm font-bold text-[#222321] flex items-center gap-2">
                <Cpu className="w-4 h-4 text-olive-600" /> Generation run #
                {gr.id}
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs">
              <InfoLine label="Provider" value={gr.provider} />
              <InfoLine label="Model" value={gr.model_name} />
              <InfoLine
                label="Status"
                value={
                  <span className="inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border bg-olive-600/15 text-[#323F35] border-[#4A5D4E]/25">
                    {gr.status}
                  </span>
                }
              />
              <InfoLine label="Retries" value={gr.retries} />
              <InfoLine
                label="Source docs"
                value={
                  gr.source_document_ids ? (
                    <span className="font-mono text-[11px] text-[#555248]">
                      {gr.source_document_ids}
                    </span>
                  ) : (
                    "—"
                  )
                }
                span2
              />
              {gr.input_summary && (
                <InfoLine
                  label="Input"
                  value={
                    <span className="text-[#555248]">{gr.input_summary}</span>
                  }
                  span2
                />
              )}
              {gr.parse_error && (
                <div className="md:col-span-2 mt-2 flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                  <span>{gr.parse_error}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STAGES */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs">
          <div className="px-6 pt-5 pb-3 border-b border-[#E2DDD0] bg-[#F8F7F2]/40">
            <h2 className="text-sm font-bold text-[#222321] flex items-center gap-2">
              <Layers className="w-4 h-4 text-olive-600" /> Stages
            </h2>
          </div>
          <ul className="p-6 space-y-3">
            {plan.stages.map((s) => (
              <li key={s.id} className="flex gap-3">
                <span className="inline-block px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border bg-olive-600/15 text-[#323F35] border-[#4A5D4E]/25 shrink-0 h-fit">
                  {s.stage.replace(/_/g, " ")}
                </span>
                <span className="text-sm text-[#555248]">
                  {s.description || "—"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* MODULES */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs">
          <div className="px-6 pt-5 pb-3 border-b border-[#E2DDD0] bg-[#F8F7F2]/40">
            <h2 className="text-sm font-bold text-[#222321] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-olive-600" /> Modules (
              {plan.modules.length})
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {plan.modules.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl border border-[#E2DDD0] bg-[#F8F7F2]/40 p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[11px] font-bold text-[#555248]">
                        {m.module_code}
                      </span>
                      <span className="text-sm font-semibold text-[#222321]">
                        {m.title}
                      </span>
                      {m.is_mandatory && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#323F35] bg-olive-600/15 border border-[#4A5D4E]/25 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          <ShieldCheck className="w-3 h-3 text-olive-600" />
                          Mandatory
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#8C8A81] mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="inline-flex items-center gap-1">
                        <FileText className="w-3 h-3 text-olive-600" />
                        <span className="font-mono">
                          #{m.source_document_id || "?"}
                          {m.source_section && ` §${m.source_section}`}
                        </span>
                      </span>
                      {m.estimated_minutes && (
                        <>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1">
                            <Timer className="w-3 h-3" />
                            {m.estimated_minutes} min
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {m.purpose && (
                  <p className="text-sm text-[#555248] mb-2">{m.purpose}</p>
                )}
                {m.objectives?.length > 0 && (
                  <ol className="text-sm text-[#555248] list-decimal pl-5 space-y-0.5">
                    {m.objectives.map((o) => (
                      <li key={o.id}>{o.text}</li>
                    ))}
                  </ol>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* TASKS */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs">
          <div className="px-6 pt-5 pb-3 border-b border-[#E2DDD0] bg-[#F8F7F2]/40">
            <h2 className="text-sm font-bold text-[#222321] flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-olive-600" /> Tasks (
              {plan.tasks.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F7F2] border-b border-[#E2DDD0]">
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                    Code
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                    Title
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                    Difficulty
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                    Due
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                    Source
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DDD0]/60 text-xs">
                {plan.tasks.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-8 text-center text-[#8C8A81]"
                    >
                      No practical tasks in this plan.
                    </td>
                  </tr>
                ) : (
                  plan.tasks.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-[#F8F7F2]/60 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono text-[11px] font-bold text-[#555248]">
                        {t.task_code}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-[#222321]">
                        {t.title}
                      </td>
                      <td className="px-5 py-3.5 text-[#555248] capitalize">
                        {t.difficulty || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-[#555248]">
                        {t.due_stage ? t.due_stage.replace(/_/g, " ") : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-[#555248]">
                        {t.source_document_id ? (
                          <div className="inline-flex items-center gap-1.5 text-stone-600">
                            <FileText className="w-3.5 h-3.5 text-olive-600" />
                            <span className="font-mono text-[11px]">
                              #{t.source_document_id}
                              {t.source_section && ` §${t.source_section}`}
                            </span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ASSESSMENTS */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs">
          <div className="px-6 pt-5 pb-3 border-b border-[#E2DDD0] bg-[#F8F7F2]/40">
            <h2 className="text-sm font-bold text-[#222321] flex items-center gap-2">
              <Target className="w-4 h-4 text-olive-600" /> Assessments (
              {plan.assessments.length})
            </h2>
            <p className="text-[11px] text-[#706E66] mt-0.5">
              Each assessment lists what to evaluate. The employee never scores
              themselves — a manager, reviewer or admin opens the assessment and
              enters a score (0–100) per criterion. The rubric weight decides
              how criteria roll up into the final percentage.
            </p>
          </div>
          <div className="p-6 space-y-4">
            {plan.assessments.length === 0 ? (
              <div className="text-xs text-[#8C8A81] text-center py-4">
                No assessments in this plan.
              </div>
            ) : (
              plan.assessments.map((a) => (
                <div
                  key={a.id}
                  className="rounded-2xl border border-[#E2DDD0] bg-[#F8F7F2]/40 overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#E2DDD0] bg-white">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-olive-600/10 flex items-center justify-center text-olive-600 shrink-0">
                        <Target className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#222321]">
                          {a.title}
                        </div>
                        <div className="text-[11px] text-[#8C8A81] capitalize">
                          {a.assessment_type} · pass ≥ {a.passing_score}%
                        </div>
                      </div>
                    </div>
                    {isReleased && (
                      <Link
                        to={`/admin/plans/${plan.id}/assessments/${a.id}/score`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-olive-600 hover:bg-olive-700 text-white text-[11px] font-semibold rounded-full transition-all shrink-0"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Enter score
                      </Link>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F8F7F2] border-b border-[#E2DDD0]">
                          <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#706E66]">
                            Criterion
                          </th>
                          <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#706E66] w-24">
                            Weight
                          </th>
                          <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#706E66]">
                            Expected
                          </th>
                          <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#706E66]">
                            Pass condition
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2DDD0]/60 text-xs">
                        {a.rubric.map((r) => (
                          <tr key={r.id}>
                            <td className="px-4 py-3 text-[#222321] font-medium">
                              {r.criterion}
                            </td>
                            <td className="px-4 py-3 font-mono text-[11px] text-[#555248]">
                              {r.weight}
                            </td>
                            <td className="px-4 py-3 text-[#555248]">
                              {r.expected_performance || "—"}
                            </td>
                            <td className="px-4 py-3 text-[#555248]">
                              {r.pass_condition || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function ActionButton({ onClick, disabled, variant, icon: Icon, children }) {
  const styles = {
    primary:
      "bg-olive-600 hover:bg-olive-700 text-white shadow-2xs",
    secondary:
      "bg-[#EFECE3] hover:bg-[#E2DDD0] text-[#555248]",
    danger:
      "bg-rose-600 hover:bg-rose-700 text-white shadow-2xs",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-full transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />} {children}
    </button>
  );
}

function StatTile({ icon: Icon, value, label, sub, mono = true }) {
  return (
    <div className="bg-white border border-[#E2DDD0] rounded-2xl p-4 shadow-2xs">
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-4 h-4 text-olive-600" />
      </div>
      <div
        className={`text-2xl text-[#222321] ${
          mono ? "font-mono font-normal" : "font-semibold"
        }`}
      >
        {value ?? "—"}
      </div>
      <div className="text-[11px] uppercase tracking-wider text-[#706E66] mt-1">
        {label}
      </div>
      {sub && <div className="text-[11px] text-[#8C8A81] mt-0.5">{sub}</div>}
    </div>
  );
}

function InfoLine({ label, value, span2 }) {
  return (
    <div className={span2 ? "md:col-span-2" : ""}>
      <div className="text-[10px] font-bold uppercase tracking-wider text-[#706E66] mb-0.5">
        {label}
      </div>
      <div className="text-sm text-[#222321]">{value}</div>
    </div>
  );
}
