import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  ListChecks,
  Grid,
  BookOpen,
  CheckSquare,
  ClipboardList,
  TrendingUp,
  BarChart2,
  FileCode,
  Settings,
  Search,
  LogOut,
  Sparkles,
  User,
  Bell,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

const employeeNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/onboarding", label: "My onboarding", icon: BookOpen },
  { to: "/progress", label: "Progress", icon: TrendingUp },
  { to: "/notifications", label: "Recommendations", icon: Bell },
  { to: "/profile", label: "Profile", icon: User },
];

const adminNav = [
  { section: "Overview" },
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { section: "People" },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/roles", label: "Job roles", icon: Briefcase },
  { section: "Knowledge" },
  { to: "/admin/documents", label: "Documents", icon: FileText },
  { to: "/admin/requirements", label: "Requirements", icon: ListChecks },
  { to: "/admin/role-matrix", label: "Role matrix", icon: Grid },
  { section: "Onboarding" },
  { to: "/admin/plans", label: "Plans", icon: BookOpen },
  { to: "/admin/validation", label: "Validation", icon: CheckSquare },
  { to: "/admin/reviews", label: "Reviews", icon: ClipboardList },
  { to: "/admin/policy-impact", label: "Policy impact", icon: TrendingUp },
  { to: "/admin/reports", label: "Reports", icon: BarChart2 },
  { section: "System" },
  { to: "/admin/audit-logs", label: "Audit log", icon: FileCode },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function NavItem({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-md transition-all ${
          isActive
            ? "bg-olive-600 text-white shadow-xs"
            : "text-[#555248] hover:bg-[#EFECE3] hover:text-[#222321]"
        }`
      }
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span>{label}</span>
    </NavLink>
  );
}

function hitToRoute(mode, kind, hit) {
  if (mode === "admin") {
    switch (kind) {
      case "user":
        return `/admin/users/${hit.id}`;
      case "job_role":
        return `/admin/roles/${hit.id}`;
      case "document":
        return `/admin/documents/${hit.id}`;
      case "requirement":
        return `/admin/requirements/${hit.id}`;
      case "plan":
        return `/admin/plans/${hit.id}`;
      case "module":
      case "task":
      case "quiz":
      case "assessment":
        return hit.plan_id ? `/admin/plans/${hit.plan_id}` : null;
      default:
        return null;
    }
  }
  switch (kind) {
    case "plan":
      return `/onboarding/${hit.id}`;
    case "module":
      return hit.plan_id ? `/onboarding/${hit.plan_id}/module/${hit.id}` : null;
    case "task":
      return hit.plan_id ? `/onboarding/${hit.plan_id}/task/${hit.id}` : null;
    case "assessment":
      return hit.plan_id
        ? `/onboarding/${hit.plan_id}/assessment/${hit.id}`
        : null;
    case "quiz":
      return hit.plan_id ? `/onboarding/${hit.plan_id}` : null;
    default:
      return null;
  }
}

const KIND_LABEL = {
  user: "Users",
  job_role: "Job roles",
  document: "Documents",
  requirement: "Requirements",
  plan: "Onboarding plans",
  module: "Modules",
  task: "Tasks",
  quiz: "Quizzes",
  assessment: "Assessments",
};

export default function Layout({ children, mode = "employee" }) {
  const { user, logout } = useAuth();
  const nav = mode === "admin" ? adminNav : employeeNav;
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);

  const closeResults = () => {
    setResults(null);
    setQ("");
  };

  const goTo = (route) => {
    if (!route) return;
    closeResults();
    navigate(route);
  };

  const search = async (e) => {
    e.preventDefault();
    if (!q || q.length < 2) return;
    setSearching(true);
    try {
      const data = await api.get(`/api/search?q=${encodeURIComponent(q)}&limit=8`);
      const cleaned = {};
      Object.entries(data || {}).forEach(([kind, items]) => {
        if (Array.isArray(items) && items.length > 0) cleaned[kind] = items;
      });
      setResults(cleaned);
    } catch {
      setResults({});
    } finally {
      setSearching(false);
    }
  };

  const onLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-[#F6F5F0] text-[#2C2C2A] font-sans antialiased">
      {/* SIDEBAR */}
      <aside className="w-60 bg-[#F0EEE6] border-r border-[#E2DDD0] flex flex-col justify-between p-4 shrink-0 select-none">
        <div>
          {/* BRAND LOGO */}
          <div className="px-3 py-3 mb-4">
            <Link to={mode === "admin" ? "/admin" : "/dashboard"} className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-full bg-olive-600 flex items-center justify-center text-white shadow-2xs group-hover:bg-[#3B4A3E] transition-colors">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-sm tracking-tight text-[#222321]">SkillSprint</div>
                <div className="text-[10px] font-semibold text-[#8C8A81] tracking-wider uppercase">Onboarding AI</div>
              </div>
            </Link>
          </div>

          {/* NAVIGATION LINKS */}
          <nav className="space-y-1 overflow-y-auto pr-1">
            {nav.map((n, i) =>
              n.section ? (
                <div
                  key={"s" + i}
                  className="text-[10px] uppercase font-bold tracking-wider text-[#8C8A81] px-3 pt-4 pb-1"
                >
                  {n.section}
                </div>
              ) : (
                <NavItem key={n.to} to={n.to} label={n.label} icon={n.icon} />
              )
            )}
          </nav>
        </div>

        {/* USER PROFILE & LOGOUT FOOTER */}
        <div className="bg-white/80 border border-[#E2DDD0] rounded-[20px] p-3 shadow-2xs mt-4">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-7 h-7 rounded-full bg-olive-600/10 text-[#4A5D4E] flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name ? user.name.charAt(0) : "U"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#222321] truncate">{user?.name}</div>
              <div className="text-[10px] text-[#706E66] truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-[#F6F5F0] hover:bg-rose-50 hover:text-rose-700 text-[#555248] text-xs font-semibold rounded-full transition-colors border border-[#E2DDD0]"
          >
            <LogOut className="w-3.5 h-3.5" /> Log out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* HEADER */}
        <header className="bg-[#F0EEE6]/80 backdrop-blur-md border-b border-[#E2DDD0] px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-20">
          <form onSubmit={search} className="flex-1 relative">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3.5 text-[#8C8A81]" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search resources, users, documents..."
                className="w-full text-xs bg-white text-[#2C2C2A] placeholder-[#8C8A81] pl-9 pr-8 py-2 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/30 transition-all shadow-2xs"
              />
              {q && (
                <button
                  type="button"
                  onClick={closeResults}
                  className="absolute right-3 text-[#8C8A81] hover:text-[#2C2C2A]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* SEARCH RESULTS DROPDOWN */}
            {results && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E2DDD0] rounded-[20px] shadow-lg max-h-80 overflow-y-auto z-30 p-2">
                {Object.keys(results).length === 0 ? (
                  <div className="p-3 text-center text-xs text-[#8C8A81]">
                    {searching ? "Searching platform..." : "No matching results found"}
                  </div>
                ) : (
                  Object.entries(results).map(([kind, items]) => (
                    <div key={kind} className="mb-2 last:mb-0">
                      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#4A5D4E] bg-[#F6F5F0] rounded-md mb-1">
                        {KIND_LABEL[kind] || kind} ({items.length})
                      </div>
                      {items.map((h) => {
                        const route = hitToRoute(mode, kind, h);
                        if (route) {
                          return (
                            <button
                              key={`${kind}-${h.id}`}
                              type="button"
                              onClick={() => goTo(route)}
                              className="block w-full text-left px-3 py-1.5 text-xs text-[#2C2C2A] hover:bg-[#F6F5F0] rounded-lg transition-colors truncate"
                            >
                              {h.label}
                            </button>
                          );
                        }
                        return (
                          <div
                            key={`${kind}-${h.id}`}
                            className="px-3 py-1.5 text-xs text-[#8C8A81] cursor-default truncate"
                            title="No page available for this result in your view"
                          >
                            {h.label}
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            )}
          </form>

          {/* USER SYSTEM ROLE BADGE */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-semibold text-[#4A5D4E] bg-olive-600/10 border border-[#4A5D4E]/20 px-3 py-1 rounded-full capitalize">
              {user?.system_role || "guest"}
            </span>
          </div>
        </header>

        {/* CONTAINER PAGE CONTENT */}
        <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}