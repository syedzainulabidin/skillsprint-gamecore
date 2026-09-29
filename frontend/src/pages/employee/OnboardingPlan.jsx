import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  ClipboardList,
  Info,
  ListChecks,
  Play,
  ShieldCheck,
  Target,
} from "lucide-react";
import { api } from "../../lib/api";
import Layout from "../../components/Layout";

const STAGE_ORDER = [
  "day_1",
  "week_1",
  "week_2",
  "first_30_days",
  "first_60_days",
  "first_90_days",
];

const STAGE_LABEL = {
  day_1: "Day 1",
  week_1: "Week 1",
  week_2: "Week 2",
  first_30_days: "First 30 days",
  first_60_days: "First 60 days",
  first_90_days: "First 90 days",
};

export default function OnboardingPlan() {
  const { planId } = useParams();
  const [plan, setPlan] = useState(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get(`/api/plans/${planId}`)
      .then(setPlan)
      .catch((err) => setError(err.message));
    api
      .get(`/api/plans/${planId}/progress-detail`)
      .then(setProgress)
      .catch(() => setProgress(null));
  }, [planId]);

  const grouped = useMemo(() => {
    if (!plan) return {};
    const bucket = {};
    (plan.modules || []).forEach((m) => {
      const stage = m.stage_key || m.stage || "unassigned";
      bucket[stage] = bucket[stage] || { modules: [], tasks: [] };
      bucket[stage].modules.push(m);
    });
    (plan.tasks || []).forEach((t) => {
      const stage = t.due_stage || "unassigned";
      bucket[stage] = bucket[stage] || { modules: [], tasks: [] };
      bucket[stage].tasks.push(t);
    });
    return bucket;
  }, [plan]);

  const nextStep = useMemo(() => {
    if (!plan || !progress) return null;
    const moduleStatus = new Map(
      (progress.module_completions || []).map((c) => [c.module_id, c.status]),
    );
    const nextModule = (plan.modules || []).find(
      (m) => moduleStatus.get(m.id) !== "completed",
    );
    if (nextModule) {
      const state = moduleStatus.get(nextModule.id);
      return {
        kind: "module",
        title: nextModule.title,
        code: nextModule.module_code,
        to: `/onboarding/${plan.id}/module/${nextModule.id}`,
        hint:
          state === "in_progress"
            ? "You started this module — pick up where you left off."
            : "Your next module. Read the source-cited material and finish the quiz.",
      };
    }
    const taskStatus = new Map(
      (progress.task_completions || []).map((c) => [c.task_id, c.status]),
    );
    const nextTask = (plan.tasks || []).find(
      (t) => taskStatus.get(t.id) !== "completed",
    );
    if (nextTask) {
      return {
        kind: "task",
        title: nextTask.title,
        code: nextTask.task_code,
        to: `/onboarding/${plan.id}/task/${nextTask.id}`,
        hint: "Practical task assigned to you. Mark it complete when done.",
      };
    }
    if ((plan.assessments || []).length > 0) {
      return {
        kind: "assessments",
        title: "Assessments pending supervisor review",
        to: null,
        hint:
          "You've finished everything you can do on your own. Your supervisor will score each assessment against its rubric.",
      };
    }
    return null;
  }, [plan, progress]);

  if (error) {
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
        <div className="text-sm text-[#8C8A81]">
          Loading your onboarding plan...
        </div>
      </Layout>
    );
  }

  const summary = plan.summary_json ? JSON.parse(plan.summary_json) : {};
  const pct = progress?.overall_percent
    ? Math.round(progress.overall_percent)
    : 0;

  const moduleStatus = new Map(
    (progress?.module_completions || []).map((c) => [c.module_id, c.status]),
  );
  const taskStatus = new Map(
    (progress?.task_completions || []).map((c) => [c.task_id, c.status]),
  );
  const assessAttempted = new Set(
    (progress?.assessment_attempts || []).map((a) => a.assessment_id),
  );

  const stageKeys = Array.from(
    new Set([
      ...STAGE_ORDER.filter((s) => grouped[s]),
      ...Object.keys(grouped).filter((s) => !STAGE_ORDER.includes(s)),
    ]),
  );

  return (
    <Layout mode="employee">
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
                Your onboarding
              </h1>
              <p className="text-xs text-[#706E66] mt-0.5">
                {plan.job_role_name || "Role"}
              </p>
            </div>
          </div>
        </div>

        {/* PROGRESS */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-bold text-[#222321] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-olive-600" /> Overall
              progress
            </div>
            <div className="text-xs font-mono text-[#555248]">
              {pct}% complete
            </div>
          </div>
          <div className="w-full bg-[#F8F7F2] h-2 rounded-full overflow-hidden">
            <div
              className="bg-olive-600 h-2 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <MiniStat
              icon={BookOpen}
              current={progress?.modules_completed || 0}
              total={plan.modules.length}
              label="Modules"
            />
            <MiniStat
              icon={ListChecks}
              current={progress?.tasks_completed || 0}
              total={plan.tasks.length}
              label="Tasks"
            />
            <MiniStat
              icon={ClipboardCheck}
              current={progress?.quizzes_attempted || 0}
              total={plan.quizzes.length}
              label="Quizzes"
            />
            <MiniStat
              icon={Target}
              current={progress?.assessments_attempted || 0}
              total={plan.assessments.length}
              label="Assessments"
            />
          </div>
        </div>

        {/* NEXT STEP */}
        {nextStep && (
          <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-olive-700 mb-2 flex items-center gap-1.5">
              <Play className="w-3 h-3" />
              {nextStep.kind === "assessments"
                ? "Awaiting supervisor"
                : "Do this next"}
            </div>
            <div className="text-base font-bold text-[#222321] mb-1">
              {nextStep.code
                ? `${nextStep.code}: ${nextStep.title}`
                : nextStep.title}
            </div>
            <p className="text-sm text-[#555248] mb-4">{nextStep.hint}</p>
            {nextStep.to && (
              <Link
                to={nextStep.to}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-olive-600 hover:bg-olive-700 text-white text-xs font-semibold rounded-full shadow-2xs transition-all"
              >
                Continue <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        )}

        {/* SUMMARY */}
        {summary.summary_text && (
          <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#706E66] mb-2 flex items-center gap-1.5">
              <Info className="w-3 h-3 text-olive-600" /> About this plan
            </div>
            <p className="text-sm text-[#555248] leading-relaxed">
              {summary.summary_text}
            </p>
          </div>
        )}

        {/* TIMELINE */}
        {stageKeys.map((stage) => {
          const g = grouped[stage] || { modules: [], tasks: [] };
          return (
            <div
              key={stage}
              className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs"
            >
              <div className="px-6 pt-5 pb-3 border-b border-[#E2DDD0] bg-[#F8F7F2]/40">
                <h2 className="text-sm font-bold text-[#222321] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-olive-600" />
                  {STAGE_LABEL[stage] || stage.replace(/_/g, " ")}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {g.modules.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#706E66] mb-2 flex items-center gap-1.5">
                      <BookOpen className="w-3 h-3 text-olive-600" /> Modules
                    </div>
                    <ul className="space-y-2">
                      {g.modules.map((m) => {
                        const st = moduleStatus.get(m.id);
                        return (
                          <li key={m.id}>
                            <Link
                              to={`/onboarding/${plan.id}/module/${m.id}`}
                              className="group flex items-center gap-3 rounded-2xl border border-[#E2DDD0] bg-[#F8F7F2]/40 hover:bg-white hover:border-olive-600/40 px-4 py-3 transition-all"
                            >
                              <StatusIcon status={st} />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-[#222321]">
                                  <span className="font-mono text-[11px] font-bold text-[#555248] mr-1.5">
                                    {m.module_code}
                                  </span>
                                  {m.title}
                                </div>
                              </div>
                              {m.is_mandatory && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#323F35] bg-olive-600/15 border border-[#4A5D4E]/25 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                                  <ShieldCheck className="w-3 h-3 text-olive-600" />
                                  Mandatory
                                </span>
                              )}
                              <StatusPill status={st} />
                              <ArrowUpRight className="w-4 h-4 text-[#8C8A81] group-hover:text-olive-600 shrink-0" />
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {g.tasks.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#706E66] mb-2 flex items-center gap-1.5">
                      <ListChecks className="w-3 h-3 text-olive-600" /> Tasks
                    </div>
                    <ul className="space-y-2">
                      {g.tasks.map((t) => {
                        const st = taskStatus.get(t.id);
                        return (
                          <li key={t.id}>
                            <Link
                              to={`/onboarding/${plan.id}/task/${t.id}`}
                              className="group flex items-center gap-3 rounded-2xl border border-[#E2DDD0] bg-[#F8F7F2]/40 hover:bg-white hover:border-olive-600/40 px-4 py-3 transition-all"
                            >
                              <StatusIcon status={st} />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-[#222321]">
                                  <span className="font-mono text-[11px] font-bold text-[#555248] mr-1.5">
                                    {t.task_code}
                                  </span>
                                  {t.title}
                                </div>
                              </div>
                              <StatusPill status={st} />
                              <ArrowUpRight className="w-4 h-4 text-[#8C8A81] group-hover:text-olive-600 shrink-0" />
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* ASSESSMENTS */}
        {(plan.assessments || []).length > 0 && (
          <div className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs">
            <div className="px-6 pt-5 pb-3 border-b border-[#E2DDD0] bg-[#F8F7F2]/40">
              <h2 className="text-sm font-bold text-[#222321] flex items-center gap-2">
                <Target className="w-4 h-4 text-olive-600" /> Assessments —
                supervisor scored
              </h2>
              <p className="text-[11px] text-[#706E66] mt-0.5">
                These are practical evaluations. You don't score yourself —
                your supervisor grades you against the rubric criteria.
              </p>
            </div>
            <div className="p-6">
              <ul className="space-y-2">
                {plan.assessments.map((a) => {
                  const done = assessAttempted.has(a.id);
                  return (
                    <li key={a.id}>
                      <Link
                        to={`/onboarding/${plan.id}/assessment/${a.id}`}
                        className="group flex items-center gap-3 rounded-2xl border border-[#E2DDD0] bg-[#F8F7F2]/40 hover:bg-white hover:border-olive-600/40 px-4 py-3 transition-all"
                      >
                        {done ? (
                          <CheckCircle2 className="w-5 h-5 text-olive-600 shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-[#8C8A81] shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-[#222321]">
                            {a.title}
                          </div>
                          <div className="text-[11px] text-[#8C8A81] capitalize">
                            {a.assessment_type}
                          </div>
                        </div>
                        {done ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#323F35] bg-olive-600/15 border border-[#4A5D4E]/25 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3 text-olive-600" />
                            Reviewed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-900 bg-amber-100/80 border border-amber-200/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Awaiting review
                          </span>
                        )}
                        <ArrowUpRight className="w-4 h-4 text-[#8C8A81] group-hover:text-olive-600 shrink-0" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        {/* CHECKLISTS */}
        {(plan.checklists || []).length > 0 && (
          <div className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs">
            <div className="px-6 pt-5 pb-3 border-b border-[#E2DDD0] bg-[#F8F7F2]/40">
              <h2 className="text-sm font-bold text-[#222321] flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-olive-600" /> Onboarding
                checklists
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {plan.checklists.map((c) => (
                <div key={c.id}>
                  <div className="text-sm font-semibold text-[#222321] mb-2">
                    {c.title}
                  </div>
                  <ul className="space-y-1.5">
                    {c.items.map((i) => (
                      <li
                        key={i.id}
                        className="flex items-start gap-2 text-sm text-[#555248]"
                      >
                        <Circle className="w-3.5 h-3.5 text-[#8C8A81] mt-0.5 shrink-0" />
                        <span>{i.activity}</span>
                        {i.due_stage && (
                          <span className="text-[11px] text-[#8C8A81] shrink-0 ml-auto capitalize">
                            {i.due_stage.replace(/_/g, " ")}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function MiniStat({ icon: Icon, current, total, label }) {
  return (
    <div className="bg-[#F8F7F2]/60 border border-[#E2DDD0] rounded-2xl p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#706E66] mb-1">
        <Icon className="w-3 h-3 text-olive-600" />
        {label}
      </div>
      <div className="text-sm font-mono text-[#222321]">
        {current}
        <span className="text-[#8C8A81]">/{total}</span>
      </div>
    </div>
  );
}

function StatusIcon({ status }) {
  if (status === "completed")
    return <CheckCircle2 className="w-5 h-5 text-olive-600 shrink-0" />;
  if (status === "in_progress")
    return (
      <div className="w-5 h-5 rounded-full border-2 border-olive-600 border-t-transparent animate-spin shrink-0" />
    );
  return <Circle className="w-5 h-5 text-[#8C8A81] shrink-0" />;
}

function StatusPill({ status }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#323F35] bg-olive-600/15 border border-[#4A5D4E]/25 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
        Done
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-900 bg-amber-100/80 border border-amber-200/80 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
        In progress
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#706E66] bg-[#EFECE3] border border-[#E2DDD0] px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
      Not started
    </span>
  );
}
