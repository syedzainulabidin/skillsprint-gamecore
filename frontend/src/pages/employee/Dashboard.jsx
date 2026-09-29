import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  Bell,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Gauge,
  Layers,
  ListChecks,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { notify } from "../../lib/toast";
import Layout from "../../components/Layout";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.04 * i, duration: 0.4, ease: [0.25, 0.8, 0.25, 1] },
  }),
};

const STAGE_LABEL = {
  day_1: "Day 1",
  week_1: "Week 1",
  week_2: "Week 2",
  first_30_days: "First 30 days",
  first_60_days: "First 60 days",
  first_90_days: "First 90 days",
};

const STAGE_ORDER = [
  "day_1",
  "week_1",
  "week_2",
  "first_30_days",
  "first_60_days",
  "first_90_days",
];

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [progress, setProgress] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/plans")
      .then(async (d) => {
        const items = d.items || [];
        setPlans(items);
        if (items.length > 0) {
          const first = items[0];
          const [detail, prog, recs] = await Promise.all([
            api.get(`/api/plans/${first.id}`).catch(() => null),
            api.get(`/api/plans/${first.id}/progress-detail`).catch(() => null),
            api
              .get(`/api/plans/${first.id}/recommendations`)
              .catch(() => ({ items: [] })),
          ]);
          setActivePlan(detail ? { ...first, ...detail } : first);
          if (prog) setProgress(prog);
          setRecommendations((recs.items || []).slice(0, 4));
        }
      })
      .catch((err) => notify.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const pct = progress?.overall_percent
    ? Math.round(progress.overall_percent)
    : 0;

  const nextItem = useMemo(() => {
    if (!activePlan || !progress) return null;
    const doneModules = new Set(
      (progress.module_completions || [])
        .filter((c) => c.status === "completed")
        .map((c) => c.module_id),
    );
    const inProgModules = new Set(
      (progress.module_completions || [])
        .filter((c) => c.status === "in_progress")
        .map((c) => c.module_id),
    );
    const mod = (activePlan.modules || []).find((m) => !doneModules.has(m.id));
    if (mod) {
      return {
        kind: "module",
        title: mod.title,
        code: mod.module_code,
        to: `/onboarding/${activePlan.id}/module/${mod.id}`,
        state: inProgModules.has(mod.id) ? "in_progress" : "new",
      };
    }
    const doneTasks = new Set(
      (progress.task_completions || [])
        .filter((c) => c.status === "completed")
        .map((c) => c.task_id),
    );
    const task = (activePlan.tasks || []).find((t) => !doneTasks.has(t.id));
    if (task) {
      return {
        kind: "task",
        title: task.title,
        code: task.task_code,
        to: `/onboarding/${activePlan.id}/task/${task.id}`,
        state: "new",
      };
    }
    if ((activePlan.assessments || []).length > 0) {
      return {
        kind: "assessments",
        title: "Assessments pending supervisor",
        to: null,
        state: "awaiting",
      };
    }
    return null;
  }, [activePlan, progress]);

  const kpis = [
    {
      icon: Gauge,
      label: "Overall progress",
      value: progress ? `${pct}%` : "—",
      to: "/progress",
    },
    {
      icon: BookOpen,
      label: "Modules",
      value: progress
        ? `${progress.modules_completed}/${progress.modules_total}`
        : "—",
      to: activePlan ? `/onboarding/${activePlan.id}` : "/onboarding",
    },
    {
      icon: ListChecks,
      label: "Tasks",
      value: progress
        ? `${progress.tasks_completed}/${progress.tasks_total}`
        : "—",
      to: activePlan ? `/onboarding/${activePlan.id}` : "/onboarding",
    },
    {
      icon: ClipboardCheck,
      label: "Quizzes",
      value: progress
        ? `${progress.quizzes_attempted}/${progress.quizzes_total}`
        : "—",
      to: activePlan ? `/onboarding/${activePlan.id}` : "/onboarding",
    },
    {
      icon: Target,
      label: "Assessments",
      value: progress
        ? `${progress.assessments_attempted}/${progress.assessments_total}`
        : "—",
      to: activePlan ? `/onboarding/${activePlan.id}` : "/onboarding",
    },
    {
      icon: Bell,
      label: "Recommendations",
      value: recommendations.length,
      to: "/notifications",
    },
  ];

  // Compute stage milestones: for each stage present in the plan, count completed vs total modules.
  const milestones = useMemo(() => {
    if (!activePlan) return [];
    const modulesByStage = {};
    (activePlan.modules || []).forEach((m) => {
      const s = m.stage_key || m.stage || "unassigned";
      modulesByStage[s] = modulesByStage[s] || [];
      modulesByStage[s].push(m);
    });
    const doneSet = new Set(
      (progress?.module_completions || [])
        .filter((c) => c.status === "completed")
        .map((c) => c.module_id),
    );
    const stages = STAGE_ORDER.filter((s) => modulesByStage[s]);
    return stages.map((s) => {
      const mods = modulesByStage[s] || [];
      const done = mods.filter((m) => doneSet.has(m.id)).length;
      return {
        key: s,
        label: STAGE_LABEL[s] || s.replace(/_/g, " "),
        done,
        total: mods.length,
        complete: done === mods.length && mods.length > 0,
      };
    });
  }, [activePlan, progress]);

  const completedMilestones = milestones.filter((m) => m.complete).length;

  const upcomingModules = useMemo(() => {
    if (!activePlan || !progress) return [];
    const doneSet = new Set(
      (progress.module_completions || [])
        .filter((c) => c.status === "completed")
        .map((c) => c.module_id),
    );
    return (activePlan.modules || []).filter((m) => !doneSet.has(m.id)).slice(0, 5);
  }, [activePlan, progress]);

  const moduleStatusMap = useMemo(() => {
    const m = new Map();
    (progress?.module_completions || []).forEach((c) => m.set(c.module_id, c.status));
    return m;
  }, [progress]);

  const noPlan = !loading && plans.length === 0;

  return (
    <Layout mode="employee">
      <div className="bg-[#F6F5F0] min-h-screen -m-6 p-6 sm:p-8 font-sans text-[#2C2C2A] rounded-[32px] overflow-hidden">
        {/* HEADER BANNER */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 bg-white/70 backdrop-blur-md border border-[#E5E2D9] rounded-[28px] p-6 shadow-sm"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-olive-600/10 border border-[#4A5D4E]/20 rounded-full text-xs font-semibold text-[#3A4A3E] mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-[#4A5D4E]" />
              {user?.name ? `Hello, ${user.name.split(" ")[0]}` : "Hello"}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#222321]">
              Your Onboarding Journey
            </h1>
            <p className="text-sm text-[#62615B] mt-1 max-w-xl">
              Personalised for {user?.job_role_name || "your role"}. Cited to
              the company documents you'll actually use on the job.
            </p>
          </div>
        </motion.div>

        {noPlan ? (
          <EmptyDashboard />
        ) : (
          <>
            {/* HERO CARDS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
              {/* MAIN OLIVE HERO */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={1}
                className="lg:col-span-8 bg-olive-600 text-white rounded-[28px] p-7 flex flex-col justify-between shadow-md relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

                <div className="flex items-center justify-between mb-6 relative">
                  <span className="text-xs uppercase tracking-wider font-semibold text-[#D4DEC9] bg-white/10 px-3 py-1 rounded-full border border-white/10">
                    {activePlan?.plan_code || "Active Plan"}
                  </span>
                  {nextItem?.to && (
                    <Link
                      to={nextItem.to}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-[#3A4A3E] text-xs font-semibold rounded-full hover:bg-[#F3F1EA] transition-all"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      {nextItem.state === "in_progress"
                        ? "Continue"
                        : "Start next"}
                    </Link>
                  )}
                </div>

                <div className="mb-8 relative">
                  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-2">
                    {activePlan?.job_role_name || "Onboarding"}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#D8E2D2] leading-relaxed max-w-lg">
                    {nextItem
                      ? nextItem.state === "awaiting"
                        ? "You've finished everything you can do on your own. Your supervisor will grade the remaining assessments."
                        : `Do this next — ${nextItem.code ? `${nextItem.code}: ` : ""}${nextItem.title}`
                      : pct > 0
                        ? "You're all set. Nice work on completing your onboarding."
                        : "Open your first module and start your journey."}
                  </p>
                </div>

                {/* In-card stats pill grid */}
                <div className="grid grid-cols-3 gap-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-[20px] p-4 relative">
                  <div className="text-center border-r border-white/10 last:border-r-0">
                    <p className="text-[10px] uppercase tracking-wider text-[#D4DEC9] font-medium">
                      Progress
                    </p>
                    <p className="text-xl sm:text-2xl font-bold mt-0.5 text-white">
                      {pct}%
                    </p>
                  </div>
                  <div className="text-center border-r border-white/10 last:border-r-0">
                    <p className="text-[10px] uppercase tracking-wider text-[#D4DEC9] font-medium">
                      Modules
                    </p>
                    <p className="text-xl sm:text-2xl font-bold mt-0.5 text-white">
                      {progress?.modules_completed ?? 0}/
                      {progress?.modules_total ?? 0}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-[#D4DEC9] font-medium">
                      Assessments
                    </p>
                    <p className="text-xl sm:text-2xl font-bold mt-0.5 text-white">
                      {progress?.assessments_attempted ?? 0}/
                      {progress?.assessments_total ?? 0}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* MILESTONES SIDE PANEL */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={2}
                className="lg:col-span-4 bg-[#E2DEC2]/40 border border-[#D5D0B1] rounded-[28px] p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-[#323D33] flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#4A5D4E]" /> Journey
                      Milestones
                    </h3>
                    <span className="text-xs font-mono font-semibold text-[#4A5D4E] bg-white/60 px-2.5 py-1 rounded-full border border-[#D5D0B1]">
                      {completedMilestones}/{milestones.length || 0}
                    </span>
                  </div>
                  <p className="text-xs text-[#5C5A52] mb-4">
                    Onboarding is a journey. Clear each stage to unlock the next
                    step of your role.
                  </p>

                  <div className="w-full bg-white/70 h-2 rounded-full overflow-hidden mb-5 border border-[#D5D0B1]">
                    <div
                      className="bg-olive-600 h-2 transition-all duration-500 rounded-full"
                      style={{
                        width: `${
                          milestones.length
                            ? (completedMilestones / milestones.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    {milestones.length === 0 ? (
                      <div className="text-xs text-[#5C5A52] italic bg-white/60 rounded-[16px] p-3 border border-[#D5D0B1]">
                        No staged milestones yet.
                      </div>
                    ) : (
                      milestones.slice(0, 4).map((m) => (
                        <div
                          key={m.key}
                          className="flex items-center justify-between p-2.5 bg-white/80 rounded-[16px] text-xs font-medium text-[#2C2C2A] border border-[#E2DDD0] shadow-2xs"
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            <span
                              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                                m.complete
                                  ? "bg-olive-600 text-white"
                                  : "bg-[#EFECE3] text-[#8C8A81]"
                              }`}
                            >
                              {m.complete ? "✓" : "•"}
                            </span>
                            <span
                              className={
                                m.complete
                                  ? "line-through text-[#8C8A81] truncate"
                                  : "truncate"
                              }
                            >
                              {m.label}
                            </span>
                          </span>
                          <span className="text-[10px] font-mono text-[#4A5D4E] shrink-0 ml-2">
                            {m.done}/{m.total}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <Link
                  to={activePlan ? `/onboarding/${activePlan.id}` : "/onboarding"}
                  className="mt-4 w-full text-center text-xs font-semibold py-2.5 bg-olive-600 text-white rounded-full hover:bg-[#3B4A3E] transition-colors block"
                >
                  Open Full Plan
                </Link>
              </motion.div>
            </div>

            {/* KPI PILL STATS GRID */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#2C2C2A]">
                  Your Metrics
                </h2>
                <span className="text-xs text-[#706E66]">
                  Live progress snapshot
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                {kpis.map((k, i) => (
                  <motion.div
                    key={k.label}
                    custom={i + 2}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                  >
                    <Link
                      to={k.to}
                      className="block group bg-white border border-[#E2DDD0] hover:border-[#4A5D4E]/50 rounded-[22px] p-4 transition-all shadow-2xs hover:shadow-md"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-full bg-[#F3F1EA] text-[#4A5D4E] group-hover:bg-olive-600 group-hover:text-white transition-colors">
                          <k.icon className="w-4 h-4" />
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#8C8A81] group-hover:text-[#4A5D4E] transition-colors" />
                      </div>
                      <div className="text-2xl font-bold text-[#222321] tracking-tight">
                        {loading ? (
                          <span className="text-[#C0BDB4]">—</span>
                        ) : (
                          (k.value ?? "—")
                        )}
                      </div>
                      <div className="text-[11px] font-medium text-[#706E66] mt-1 truncate">
                        {k.label}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* MAIN DATA SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* CONTINUE LEARNING PANEL */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={8}
                className="bg-white border border-[#E2DDD0] rounded-[28px] p-6 lg:col-span-2 shadow-2xs"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-full bg-olive-600/10 text-[#4A5D4E]">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-[#222321]">
                        Continue Learning
                      </h2>
                      <p className="text-xs text-[#706E66]">
                        Modules waiting for you — pick up where you left off
                      </p>
                    </div>
                  </div>
                  {activePlan && (
                    <Link
                      to={`/onboarding/${activePlan.id}`}
                      className="px-3.5 py-1.5 text-xs font-semibold text-[#4A5D4E] bg-[#F3F1EA] hover:bg-olive-600 hover:text-white rounded-full transition-all"
                    >
                      View all
                    </Link>
                  )}
                </div>

                {loading ? (
                  <div className="text-xs text-[#8C8A81] py-8 text-center font-medium">
                    Loading your plan...
                  </div>
                ) : upcomingModules.length === 0 ? (
                  <EmptyState
                    title="You're all caught up"
                    hint="Every module has been completed. Check Progress to review your standing."
                    cta={{ to: "/progress", label: "View Progress" }}
                  />
                ) : (
                  <div className="space-y-2.5">
                    {upcomingModules.map((m) => {
                      const st = moduleStatusMap.get(m.id);
                      return (
                        <Link
                          key={m.id}
                          to={`/onboarding/${activePlan.id}/module/${m.id}`}
                          className="group flex items-center justify-between p-3.5 hover:bg-[#F6F5F0] rounded-[20px] border border-transparent hover:border-[#E2DDD0] transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-[#EFECE3] flex items-center justify-center text-[#4A5D4E] shrink-0">
                              {st === "in_progress" ? (
                                <PlayCircle className="w-4 h-4" />
                              ) : (
                                <BookOpen className="w-4 h-4" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-[#222321] group-hover:text-[#4A5D4E] transition-colors truncate">
                                {m.module_code}: {m.title}
                              </div>
                              <div className="text-[11px] text-[#706E66] truncate mt-0.5">
                                {m.stage
                                  ? STAGE_LABEL[m.stage] || m.stage.replace(/_/g, " ")
                                  : "Any stage"}
                                {m.estimated_minutes &&
                                  ` · ${m.estimated_minutes} min`}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <ModuleStatusPill status={st} mandatory={m.is_mandatory} />
                            <ArrowUpRight className="w-4 h-4 text-[#8C8A81] group-hover:text-[#4A5D4E] transition-colors" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </motion.div>

              {/* SIDEBAR */}
              <div className="space-y-6 lg:col-span-1">
                {/* NEXT STEP PANEL */}
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={9}
                  className="bg-white border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-[#4A5D4E]" />
                    <h2 className="text-sm font-semibold text-[#222321]">
                      Your Standing
                    </h2>
                  </div>
                  <div className="text-3xl font-bold font-mono text-[#222321] mb-1">
                    {pct}%
                  </div>
                  <div className="text-xs text-[#706E66] mb-4">
                    {pct >= 90
                      ? "Almost there — finish strong."
                      : pct >= 50
                        ? "Great pace. Keep the momentum."
                        : pct > 0
                          ? "You've started. One module at a time."
                          : "Ready when you are."}
                  </div>
                  <div className="w-full bg-[#F8F7F2] h-1.5 rounded-full overflow-hidden mb-4">
                    <div
                      className="bg-olive-600 h-1.5 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <Link
                    to="/progress"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#4A5D4E] hover:underline"
                  >
                    See detailed progress <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </motion.div>

                {/* RECOMMENDATIONS PANEL */}
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={10}
                  className="bg-white border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Bell className="w-4 h-4 text-amber-600" />
                    <h2 className="text-sm font-semibold text-[#222321]">
                      Recommendations
                    </h2>
                  </div>

                  {recommendations.length === 0 ? (
                    <div className="text-xs text-[#8C8A81] py-4">
                      No recommendations right now. Complete a module or quiz
                      and the engine will suggest follow-ups if needed.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recommendations.map((r) => (
                        <div
                          key={r.id}
                          className="p-3.5 bg-[#F8F7F2] border border-[#E2DDD0] rounded-[18px]"
                        >
                          <div className="text-xs font-bold text-[#222321] capitalize mb-0.5">
                            {r.recommendation_type.replace(/_/g, " ")}
                          </div>
                          <div className="text-[11px] text-[#706E66] leading-snug">
                            {r.reason}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Link
                    to="/notifications"
                    className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#4A5D4E] hover:underline"
                  >
                    All recommendations <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

function ModuleStatusPill({ status, mandatory }) {
  if (mandatory) {
    return (
      <span className="text-[10px] font-semibold tracking-wide px-2.5 py-1 rounded-full border bg-olive-600/15 text-[#323F35] border-[#4A5D4E]/25 uppercase">
        Mandatory
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className="text-[10px] font-semibold tracking-wide px-2.5 py-1 rounded-full border bg-amber-100/80 text-amber-900 border-amber-200/80 uppercase">
        In progress
      </span>
    );
  }
  return (
    <span className="text-[10px] font-semibold tracking-wide px-2.5 py-1 rounded-full border bg-[#EFECE3] text-[#706E66] border-[#E2DDD0] uppercase">
      Not started
    </span>
  );
}

function EmptyState({ title, hint, cta }) {
  return (
    <div className="text-center py-8 px-4 bg-[#F8F7F2] rounded-[20px] border border-dashed border-[#E2DDD0]">
      <p className="text-xs font-semibold text-[#222321] mb-1">{title}</p>
      <p className="text-[11px] text-[#706E66] mb-3">{hint}</p>
      {cta && (
        <Link
          to={cta.to}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-olive-600 text-white text-xs font-medium rounded-full hover:bg-[#3B4A3E] transition-colors"
        >
          {cta.label} <ArrowUpRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

function EmptyDashboard() {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="bg-white border border-[#E2DDD0] rounded-[28px] p-10 shadow-2xs text-center"
    >
      <div className="w-14 h-14 mx-auto rounded-full bg-olive-600/10 border border-olive-600/20 flex items-center justify-center text-[#4A5D4E] mb-4">
        <BookOpen className="w-6 h-6" />
      </div>
      <h2 className="text-xl font-bold text-[#222321] mb-1">
        No plan released yet
      </h2>
      <p className="text-sm text-[#706E66] max-w-md mx-auto">
        Your onboarding plan is being prepared. Once an administrator releases
        it, you'll see a personalised step-by-step journey right here.
      </p>
    </motion.div>
  );
}
