import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Briefcase,
  FileText,
  ListChecks,
  BookOpen,
  Gauge,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Search,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  PlayCircle,
  FileCheck2,
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

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [recentPlans, setRecentPlans] = useState([]);
  const [pendingReviews, setPendingReviews] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/api/users?limit=1"),
      api.get("/api/job-roles?limit=1"),
      api.get("/api/documents?limit=1&include_inactive=true"),
      api.get("/api/requirements?limit=1"),
      api.get("/api/plans?limit=5"),
      api.get("/api/reports/policy_coverage").catch(() => ({ rows: [] })),
      api
        .get("/api/reviews?status=open")
        .catch(() => ({ total: 0, items: [] })),
    ])
      .then(([u, r, d, req, p, cov, rev]) => {
        const rows = cov.rows || [];
        const covAvg =
          rows.length > 0
            ? rows.reduce((a, x) => a + (x.coverage_score || 0), 0) /
              rows.length
            : null;
        setStats({
          users: u.total,
          roles: r.total,
          documents: d.total,
          requirements: req.total,
          plans: p.total,
          coverage: covAvg,
        });
        setRecentPlans(p.items || []);
        setPendingReviews(rev.total || 0);
      })
      .catch((err) => notify.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const kpis = [
    { icon: Users, label: "Employees", value: stats.users, to: "/admin/users" },
    {
      icon: Briefcase,
      label: "Job Roles",
      value: stats.roles,
      to: "/admin/roles",
    },
    {
      icon: FileText,
      label: "Documents",
      value: stats.documents,
      to: "/admin/documents",
    },
    {
      icon: ListChecks,
      label: "Requirements",
      value: stats.requirements,
      to: "/admin/requirements",
    },
    { icon: BookOpen, label: "Plans", value: stats.plans, to: "/admin/plans" },
    {
      icon: Gauge,
      label: "Avg Coverage",
      value: stats.coverage != null ? `${Math.round(stats.coverage)}%` : "—",
      to: "/admin/reports",
    },
  ];

  const statusStyle = (s) => {
    const map = {
      released: "bg-olive-600/15 text-[#323F35] border-[#4A5D4E]/25",
      in_progress: "bg-olive-600/15 text-[#323F35] border-[#4A5D4E]/25",
      completed: "bg-emerald-100/80 text-emerald-800 border-emerald-200",
      draft: "bg-[#EFECE3] text-[#555248] border-[#E2DDD0]",
      ready: "bg-blue-100/70 text-blue-800 border-blue-200",
      manual_review: "bg-amber-100/80 text-amber-900 border-amber-200/80",
      archived: "bg-stone-200/60 text-stone-600 border-stone-300",
    };
    return map[s] || "bg-[#EFECE3] text-[#555248] border-[#E2DDD0]";
  };

  const setupSteps = [
    {
      label: "Add job roles",
      to: "/admin/roles",
      done: (stats.roles || 0) > 0,
    },
    {
      label: "Upload documents",
      to: "/admin/documents",
      done: (stats.documents || 0) > 0,
    },
    {
      label: "Define requirements",
      to: "/admin/requirements",
      done: (stats.requirements || 0) > 0,
    },
    { label: "Build role matrix", to: "/admin/role-matrix", done: false },
    {
      label: "Create employees",
      to: "/admin/users",
      done: (stats.users || 0) > 1,
    },
    {
      label: "Generate plans",
      to: "/admin/plans",
      done: (stats.plans || 0) > 0,
    },
  ];

  const done = setupSteps.filter((s) => s.done).length;
  const setupProgressPercent = Math.round((done / setupSteps.length) * 100);

  return (
    <Layout mode="admin">
      <div className="bg-[#F6F5F0] min-h-screen -m-6 p-6 sm:p-8 font-sans text-[#2C2C2A] rounded-[32px] overflow-hidden">
        {/* HEADER & HERO BANNER */}
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
              Onboarding Control Room
            </h1>
            <p className="text-sm text-[#62615B] mt-1 max-w-xl">
              Company knowledge in, source-cited onboarding out. Everything
              managed at a glance.
            </p>
          </div>

          {/* Quick Search visual input */}
          {/* <div className="relative w-full md:w-72 mt-2 md:mt-0">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C8A81]" />
            <input
              type="text"
              placeholder="Search platform..."
              className="w-full bg-[#F0EEE6] text-xs text-[#2C2C2A] placeholder-[#8C8A81] pl-10 pr-4 py-2.5 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/30 transition-all"
              readOnly
            />
          </div> */}
        </motion.div>

        {/* HERO CARDS ROW (INSP BY REFERENCE LAYOUT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Main Olive Card (Featured Workspace Overview) */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="lg:col-span-8 bg-olive-600 text-white rounded-[28px] p-7 flex flex-col justify-between shadow-md relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

            <div className="flex items-center justify-between mb-6">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#D4DEC9] bg-white/10 px-3 py-1 rounded-full border border-white/10">
                Workspace Summary
              </span>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-2">
                Spatial Onboarding & Operations
              </h2>
              <p className="text-xs sm:text-sm text-[#D8E2D2] leading-relaxed max-w-lg">
                Automated role-based document compliance, real-time employee
                plans, and active policy verification engine.
              </p>
            </div>

            {/* In-Card Stats Pill Grid */}
            <div className="grid grid-cols-3 gap-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-[20px] p-4">
              <div className="text-center border-r border-white/10 last:border-r-0">
                <p className="text-[10px] uppercase tracking-wider text-[#D4DEC9] font-medium">
                  Progress
                </p>
                <p className="text-xl sm:text-2xl font-bold mt-0.5 text-white">
                  {setupProgressPercent}%
                </p>
              </div>
              <div className="text-center border-r border-white/10 last:border-r-0">
                <p className="text-[10px] uppercase tracking-wider text-[#D4DEC9] font-medium">
                  Open Reviews
                </p>
                <p className="text-xl sm:text-2xl font-bold mt-0.5 text-white">
                  {pendingReviews}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-wider text-[#D4DEC9] font-medium">
                  Coverage
                </p>
                <p className="text-xl sm:text-2xl font-bold mt-0.5 text-white">
                  {stats.coverage != null
                    ? `${Math.round(stats.coverage)}%`
                    : "—"}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Quick Action Side Panel */}
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
                  <ShieldCheck className="w-4 h-4 text-[#4A5D4E]" /> Onboarding
                  Matrix
                </h3>
                <span className="text-xs font-mono font-semibold text-[#4A5D4E] bg-white/60 px-2.5 py-1 rounded-full border border-[#D5D0B1]">
                  {done}/{setupSteps.length}
                </span>
              </div>
              <p className="text-xs text-[#5C5A52] mb-4">
                Complete these setup modules to ensure 100% policy matching.
              </p>

              <div className="w-full bg-white/70 h-2 rounded-full overflow-hidden mb-5 border border-[#D5D0B1]">
                <div
                  className="bg-olive-600 h-2 transition-all duration-500 rounded-full"
                  style={{ width: `${(done / setupSteps.length) * 100}%` }}
                />
              </div>

              <div className="space-y-2">
                {setupSteps.slice(0, 4).map((s) => (
                  <Link
                    key={s.label}
                    to={s.to}
                    className="flex items-center justify-between p-2.5 bg-white/80 hover:bg-white rounded-[16px] text-xs font-medium text-[#2C2C2A] transition-all border border-[#E2DDD0] group shadow-2xs"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${s.done ? "bg-olive-600 text-white" : "bg-[#EFECE3] text-[#8C8A81]"}`}
                      >
                        {s.done ? "✓" : "•"}
                      </span>
                      <span
                        className={s.done ? "line-through text-[#8C8A81]" : ""}
                      >
                        {s.label}
                      </span>
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#8C8A81] group-hover:text-[#4A5D4E] transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            <Link
              to="/admin/role-matrix"
              className="mt-4 w-full text-center text-xs font-semibold py-2.5 bg-olive-600 text-white rounded-full hover:bg-[#3B4A3E] transition-colors block"
            >
              Open Setup Matrix
            </Link>
          </motion.div>
        </div>

        {/* KPI PILL STATS GRID */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#2C2C2A]">
              Core Metrics
            </h2>
            <span className="text-xs text-[#706E66]">
              Real-time system sync
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

        {/* MAIN DATA SECTION: RECENT PLANS & ATTENTION TILES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* RECENT PLANS PANEL */}
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
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[#222321]">
                    Recently Generated Onboarding
                  </h2>
                  <p className="text-xs text-[#706E66]">
                    Latest automated plans & assigned job roles
                  </p>
                </div>
              </div>
              <Link
                to="/admin/plans"
                className="px-3.5 py-1.5 text-xs font-semibold text-[#4A5D4E] bg-[#F3F1EA] hover:bg-olive-600 hover:text-white rounded-full transition-all"
              >
                View all
              </Link>
            </div>

            {loading ? (
              <div className="text-xs text-[#8C8A81] py-8 text-center font-medium">
                Loading plans...
              </div>
            ) : recentPlans.length === 0 ? (
              <EmptyState
                title="No plans created yet"
                hint="Generate your first onboarding plan from the Plans management page."
                cta={{ to: "/admin/plans", label: "Go to Plans" }}
              />
            ) : (
              <div className="space-y-2.5">
                {recentPlans.slice(0, 5).map((p) => (
                  <Link
                    key={p.id}
                    to={`/admin/plans/${p.id}`}
                    className="group flex items-center justify-between p-3.5 bg-[#FBFB20]/0 hover:bg-[#F6F5F0] rounded-[20px] border border-transparent hover:border-[#E2DDD0] transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[#EFECE3] flex items-center justify-center text-[#4A5D4E] font-bold text-xs shrink-0">
                        {p.employee_name ? p.employee_name.charAt(0) : "P"}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#222321] group-hover:text-[#4A5D4E] transition-colors truncate">
                          {p.plan_code}
                        </div>
                        <div className="text-[11px] text-[#706E66] truncate mt-0.5">
                          {p.employee_name} ·{" "}
                          <span className="font-medium text-[#555248]">
                            {p.job_role_name}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-[10px] font-semibold tracking-wide px-2.5 py-1 rounded-full border ${statusStyle(
                          p.status,
                        )}`}
                      >
                        {p.status}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-[#8C8A81] group-hover:text-[#4A5D4E] transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>

          {/* SETUP & ATTENTION SIDEBAR */}
          <div className="space-y-6 lg:col-span-1">
            {/* SETUP PROGRESS PANEL */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={9}
              className="bg-white border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#4A5D4E]" />
                  <h2 className="text-sm font-semibold text-[#222321]">
                    Checklist Progress
                  </h2>
                </div>
                <span className="text-xs font-bold text-[#4A5D4E]">
                  {done}/{setupSteps.length}
                </span>
              </div>

              <div className="space-y-2">
                {setupSteps.map((s, i) => (
                  <Link
                    key={s.label}
                    to={s.to}
                    className="flex items-center justify-between p-2.5 rounded-[14px] bg-[#F8F7F2] hover:bg-[#EFECE3] text-xs font-medium text-[#32312D] transition-colors group"
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                          s.done
                            ? "bg-olive-600 text-white"
                            : "bg-[#E2DDD0] text-[#706E66]"
                        }`}
                      >
                        {s.done ? "✓" : i + 1}
                      </span>
                      <span
                        className={s.done ? "line-through text-[#8C8A81]" : ""}
                      >
                        {s.label}
                      </span>
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#8C8A81] group-hover:text-[#4A5D4E] transition-colors" />
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* NEEDS ATTENTION PANEL */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={10}
              className="bg-white border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs"
            >
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-semibold text-[#222321]">
                  Needs Attention
                </h2>
              </div>

              <div className="space-y-3">
                <AttentionTile
                  value={pendingReviews}
                  label="Open validation reviews"
                  hint="Findings waiting for a decision"
                  to="/admin/reviews"
                />
                <AttentionTile
                  value={
                    recentPlans.filter((p) => p.status === "manual_review")
                      .length
                  }
                  label="Plans in manual review"
                  hint="Validation flagged serious issues"
                  to="/admin/plans"
                />
                <AttentionTile
                  value={
                    recentPlans.filter(
                      (p) => p.status === "draft" || p.status === "ready",
                    ).length
                  }
                  label="Unreleased plans"
                  hint="Validate and release to employee"
                  to="/admin/plans"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
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

function AttentionTile({ value, label, hint, to }) {
  const content = (
    <div className="flex items-start justify-between">
      <div>
        <div className="text-xs font-bold text-[#222321]">{label}</div>
        <div className="text-[11px] text-[#706E66] mt-0.5">{hint}</div>
      </div>
      <div className="text-lg font-bold text-[#4A5D4E] font-mono bg-olive-600/10 px-2.5 py-0.5 rounded-full shrink-0">
        {value ?? "—"}
      </div>
    </div>
  );
  return to ? (
    <Link
      to={to}
      className="block bg-[#F8F7F2] hover:bg-[#EFECE3] border border-[#E2DDD0] rounded-[18px] p-3.5 transition-all"
    >
      {content}
    </Link>
  ) : (
    <div className="bg-[#F8F7F2] border border-[#E2DDD0] rounded-[18px] p-3.5">
      {content}
    </div>
  );
}
