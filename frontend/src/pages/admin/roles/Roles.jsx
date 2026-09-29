import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../../lib/api";
import Layout from "../../../components/Layout";
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
} from "lucide-react";

export default function Roles() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    const params = new URLSearchParams({ limit: "200" });
    if (search) params.set("search", search);
    if (includeInactive) params.set("include_inactive", "true");
    try {
      const d = await api.get(`/api/job-roles?${params.toString()}`);
      setItems(d.items || []);
      setTotal(d.total || 0);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Layout mode="admin">
      <div className="space-y-6">
        
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-olive-600/10 border border-olive-600/20 flex items-center justify-center text-olive-600 shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#222321]">
                Job Roles ({total})
              </h1>
              <p className="text-xs text-[#706E66] mt-0.5">
                Manage job designations and department assignments
              </p>
            </div>
          </div>

          <Link
            to="/admin/roles/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-olive-600 hover:bg-olive-700 text-white text-xs font-semibold rounded-full shadow-2xs transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New role
          </Link>
        </div>

        {/* ERROR ALERT */}
        {error && (
          <div className="flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-medium">
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
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            {/* SEARCH INPUT */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C8A81]" />
              <input
                placeholder="Search job roles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] placeholder-[#8C8A81] pl-9 pr-4 py-2.5 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
              />
            </div>

            {/* CHECKBOX */}
            <label className="text-xs text-stone-600 font-medium flex items-center gap-2 px-2 cursor-pointer select-none whitespace-nowrap">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
                className="w-4 h-4 rounded border-[#E2DDD0] text-olive-600 focus:ring-olive-600/30 cursor-pointer"
              />
              Include inactive
            </label>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-olive-600 hover:bg-olive-700 text-white text-xs font-semibold rounded-full transition-all shadow-2xs cursor-pointer shrink-0"
            >
              <Filter className="w-3.5 h-3.5" /> Filter
            </button>
          </form>
        </div>

        {/* ROLES TABLE */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F7F2] border-b border-[#E2DDD0]">
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">Role Name</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">Department</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">Active Status</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DDD0]/60 text-xs">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-[#8C8A81]">
                      No job roles found matching your query
                    </td>
                  </tr>
                ) : (
                  items.map((r) => (
                    <tr key={r.id} className="hover:bg-[#F8F7F2]/60 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-[#222321]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-olive-600/10 flex items-center justify-center text-olive-600 text-xs font-bold shrink-0">
                            <Briefcase className="w-3.5 h-3.5" />
                          </div>
                          <span>{r.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[#555248]">
                        <div className="inline-flex items-center gap-1.5 text-stone-600">
                          <Building2 className="w-3.5 h-3.5 text-stone-400" />
                          {r.department || "—"}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {r.is_active ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full">
                            <XCircle className="w-3 h-3 text-stone-400" /> No
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to={`/admin/roles/${r.id}`}
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