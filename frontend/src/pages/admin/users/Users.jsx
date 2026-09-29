import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../../lib/api";
import Layout from "../../../components/Layout";
import {
  Search,
  Filter,
  UserPlus,
  ArrowUpRight,
  Shield,
  Building2,
  CheckCircle2,
  XCircle,
  Briefcase,
  AlertCircle,
  User,
} from "lucide-react";

const SYSTEM_ROLES = [
  "",
  "admin",
  "training_manager",
  "reviewer",
  "manager",
  "employee",
];

export default function Users() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [dept, setDept] = useState("");
  const [error, setError] = useState(null);

  const load = async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (role) params.set("system_role", role);
    if (dept) params.set("department", dept);
    try {
      const d = await api.get(`/api/users?${params.toString()}`);
      setItems(d.items || []);
      setTotal(d.total || 0);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const getRoleBadgeStyle = (sysRole) => {
    switch (sysRole) {
      case "admin":
        return "bg-olive-600 text-white border-[#3B4A3E]";
      case "manager":
      case "training_manager":
        return "bg-olive-600/15 text-[#323F35] border-[#4A5D4E]/25";
      case "reviewer":
        return "bg-amber-100/80 text-amber-900 border-amber-200/80";
      default:
        return "bg-[#EFECE3] text-[#555248] border-[#E2DDD0]";
    }
  };

  return (
    <Layout mode="admin">
      <div className="space-y-6">
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-olive-600/10 border border-olive-600/20 flex items-center justify-center text-olive-600 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#222321]">
                Users ({total})
              </h1>
              <p className="text-xs text-[#706E66] mt-0.5">
                Manage accounts, assign roles, and configure system permissions
              </p>
            </div>
          </div>

          <Link
            to="/admin/users/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-olive-600 hover:bg-[#3B4A3E] text-white text-xs font-semibold rounded-full shadow-2xs transition-all shrink-0"
          >
            <UserPlus className="w-4 h-4" /> New user
          </Link>
        </div>

        {/* ERROR ALERT */}
        {error && (
          <div className="flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-[20px] text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* FILTER CONTROL CARD */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-4 shadow-2xs">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              load();
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3"
          >
            {/* SEARCH INPUT */}
            <div className="lg:col-span-4 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C8A81]" />
              <input
                placeholder="Search by name, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] placeholder-[#8C8A81] pl-9 pr-4 py-2.5 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/30 transition-all"
              />
            </div>

            {/* ROLE SELECT */}
            <div className="lg:col-span-3 relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-4 py-2.5 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/30 transition-all appearance-none cursor-pointer"
              >
                {SYSTEM_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r ? r.replace("_", " ").toUpperCase() : "All roles"}
                  </option>
                ))}
              </select>
            </div>

            {/* DEPARTMENT INPUT */}
            <div className="lg:col-span-3 relative">
              <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C8A81]" />
              <input
                placeholder="Department"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] placeholder-[#8C8A81] pl-9 pr-4 py-2.5 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/30 transition-all"
              />
            </div>

            {/* SUBMIT BUTTON */}
            <div className="lg:col-span-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-olive-600 hover:bg-[#3B4A3E] text-white text-xs font-semibold rounded-full transition-all shadow-2xs"
              >
                <Filter className="w-3.5 h-3.5" /> Filter
              </button>
            </div>
          </form>
        </div>

        {/* USERS DATA TABLE */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F7F2] border-b border-[#E2DDD0]">
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                    Employee ID
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                    Name
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                    Email
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                    Role
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                    Dept
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                    Active
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
                      colSpan={7}
                      className="px-5 py-8 text-center text-[#8C8A81]"
                    >
                      No users found matching your query
                    </td>
                  </tr>
                ) : (
                  items.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-[#F8F7F2]/60 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono text-[#555248] font-medium">
                        {u.employee_id || "—"}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-[#222321]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#EFECE3] flex items-center justify-center text-[#4A5D4E] font-bold text-[11px] shrink-0">
                            {u.name ? u.name.charAt(0) : "U"}
                          </div>
                          <span>{u.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[#555248]">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${getRoleBadgeStyle(u.system_role)}`}
                        >
                          {u.system_role
                            ? u.system_role.replace("_", " ")
                            : "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[#555248]">
                        {u.department || "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />{" "}
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full">
                            <XCircle className="w-3 h-3 text-stone-400" /> No
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to={`/admin/users/${u.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#4A5D4E] hover:text-[#3B4A3E] hover:underline"
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
