import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  Briefcase,
  ClipboardCheck,
  Filter,
  Layers,
  ListChecks,
  Search,
  Sparkles,
  Target,
  Timer,
  User,
} from "lucide-react";
import { api } from "../../../lib/api";
import { notify } from "../../../lib/toast";
import Layout from "../../../components/Layout";

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
  generating: "bg-stone-100 text-stone-700 border-stone-200",
  archived: "bg-stone-100 text-stone-600 border-stone-200",
  incomplete: "bg-rose-100/80 text-rose-800 border-rose-200/80",
  unsupported: "bg-rose-100/80 text-rose-800 border-rose-200/80",
  contradictory: "bg-rose-100/80 text-rose-800 border-rose-200/80",
};

export default function Plans() {
  const [items, setItems] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState({
    employee_user_id: "",
    job_role_id: "",
    max_chunks: 40,
    plan_note: "",
  });
  const [busy, setBusy] = useState(false);

  const load = () => {
    api
      .get("/api/plans")
      .then((d) => setItems(d.items || []))
      .catch((err) => {
        setError(err.message);
        notify.error(err.message);
      });
  };

  useEffect(() => {
    load();
    api.get("/api/users?limit=200").then((d) => setEmployees(d.items || []));
    api.get("/api/job-roles?limit=200").then((d) => setRoles(d.items || []));
  }, []);

  const generate = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const payload = {
        employee_user_id: Number(form.employee_user_id),
        job_role_id: Number(form.job_role_id),
        max_chunks: Number(form.max_chunks),
        plan_note: form.plan_note || null,
      };
      const p = await api.post("/api/plans/generate", payload);
      notify.success(`Plan ${p.plan_code} generated.`);
      setForm({
        employee_user_id: "",
        job_role_id: "",
        max_chunks: 40,
        plan_note: "",
      });
      load();
    } catch (err) {
      setError(err.message);
      notify.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const filtered = useMemo(() => {
    return items.filter((p) => {
      if (statusFilter && p.status !== statusFilter) return false;
      if (search) {
        const q = search.trim().toLowerCase();
        return (
          (p.plan_code || "").toLowerCase().includes(q) ||
          (p.employee_name || "").toLowerCase().includes(q) ||
          (p.job_role_name || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [items, search, statusFilter]);

  const statusOptions = useMemo(() => {
    const set = new Set(items.map((p) => p.status).filter(Boolean));
    return Array.from(set);
  }, [items]);

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
              <h1 className="text-2xl font-bold tracking-tight text-[#222321]">
                Onboarding Plans ({items.length})
              </h1>
              <p className="text-xs text-[#706E66] mt-0.5">
                AI-generated, source-cited onboarding plans validated by Python
                rules
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

        {/* GENERATE CARD */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs">
          <div className="px-6 pt-5 pb-3 border-b border-[#E2DDD0] bg-[#F8F7F2]/40">
            <h2 className="text-sm font-bold text-[#222321] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-olive-600" />
              Generate a new plan
            </h2>
            <p className="text-[11px] text-[#706E66] mt-0.5">
              Pick an employee and role. Groq composes the plan; Python
              validates. Takes 10–20 seconds.
            </p>
          </div>
          <form onSubmit={generate} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FieldGroup label="Employee" required>
                <SelectPill
                  value={form.employee_user_id}
                  onChange={(e) =>
                    setForm({ ...form, employee_user_id: e.target.value })
                  }
                  required
                >
                  <option value="">Select employee</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} — {e.employee_id}
                    </option>
                  ))}
                </SelectPill>
              </FieldGroup>
              <FieldGroup label="Job role" required>
                <SelectPill
                  value={form.job_role_id}
                  onChange={(e) =>
                    setForm({ ...form, job_role_id: e.target.value })
                  }
                  required
                >
                  <option value="">Select role</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </SelectPill>
              </FieldGroup>
              <FieldGroup
                label="Max chunks"
                hint="How many source chunks to send to the AI. Default 40."
              >
                <InputPill
                  type="number"
                  min={5}
                  max={200}
                  value={form.max_chunks}
                  onChange={(e) =>
                    setForm({ ...form, max_chunks: e.target.value })
                  }
                />
              </FieldGroup>
              <FieldGroup label="Note" hint="Optional label for audit or A/B.">
                <InputPill
                  value={form.plan_note}
                  onChange={(e) =>
                    setForm({ ...form, plan_note: e.target.value })
                  }
                  placeholder="e.g. baseline v2 prompt"
                />
              </FieldGroup>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-olive-600 hover:bg-olive-700 text-white text-xs font-semibold rounded-full shadow-2xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy ? (
                  <>
                    <Timer className="w-4 h-4 animate-pulse" /> Generating
                    (10–20 s)...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Generate plan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* FILTER CARD */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C8A81]" />
              <input
                placeholder="Search by plan code, employee or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] placeholder-[#8C8A81] pl-9 pr-4 py-2.5 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
              />
            </div>
            <div className="relative min-w-[180px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-4 py-2.5 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all appearance-none cursor-pointer"
              >
                <option value="">All statuses</option>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("");
              }}
              disabled={!search && !statusFilter}
              className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#EFECE3] hover:bg-[#E2DDD0] text-[#555248] text-xs font-semibold rounded-full transition-all shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Filter className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
        </div>

        {/* PLANS TABLE */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F7F2] border-b border-[#E2DDD0]">
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                    Code
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                    Employee
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                    Role
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66] text-center">
                    Content
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
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-8 text-center text-[#8C8A81]"
                    >
                      No plans match your filter. Generate the first plan above.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-[#F8F7F2]/60 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono text-[11px] font-bold text-[#555248]">
                        {p.plan_code}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-[#222321]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-olive-600/10 flex items-center justify-center text-olive-600 shrink-0">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <span>{p.employee_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[#555248]">
                        <div className="inline-flex items-center gap-1.5 text-stone-600">
                          <Briefcase className="w-3.5 h-3.5 text-stone-400" />
                          {p.job_role_name || "—"}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${
                            STATUS_STYLE[p.status] ||
                            "bg-stone-100 text-stone-700 border-stone-200"
                          }`}
                        >
                          {(p.status || "—").replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-[#555248]">
                          <span
                            title="Modules"
                            className="inline-flex items-center gap-0.5"
                          >
                            <Layers className="w-3 h-3 text-olive-600" />
                            {p.module_count}
                          </span>
                          <span
                            title="Tasks"
                            className="inline-flex items-center gap-0.5"
                          >
                            <ListChecks className="w-3 h-3 text-olive-600" />
                            {p.task_count}
                          </span>
                          <span
                            title="Quizzes"
                            className="inline-flex items-center gap-0.5"
                          >
                            <ClipboardCheck className="w-3 h-3 text-olive-600" />
                            {p.quiz_count}
                          </span>
                          <span
                            title="Assessments"
                            className="inline-flex items-center gap-0.5"
                          >
                            <Target className="w-3 h-3 text-olive-600" />
                            {p.assessment_count}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[#8C8A81] font-mono text-[11px]">
                        {p.created_at
                          ? new Date(p.created_at).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to={`/admin/plans/${p.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-olive-600 hover:text-olive-700 hover:underline"
                        >
                          View <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
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

function InputPill({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] placeholder-[#8C8A81] px-4 py-2.5 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all ${className}`}
    />
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
