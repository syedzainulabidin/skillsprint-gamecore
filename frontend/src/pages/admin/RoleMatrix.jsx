import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowUpRight,
  Briefcase,
  Building2,
  CheckCircle2,
  FileText,
  Filter,
  Grid3x3,
  ListChecks,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { api } from "../../lib/api";
import { notify } from "../../lib/toast";
import Layout from "../../components/Layout";

const PRIORITY_STYLE = {
  critical: "bg-rose-100/80 text-rose-800 border-rose-200/80",
  high: "bg-amber-100/80 text-amber-900 border-amber-200/80",
  medium: "bg-stone-100 text-stone-700 border-stone-200",
  low: "bg-[#EFECE3] text-[#555248] border-[#E2DDD0]",
};

const MUST_STYLE = {
  must_know: "bg-olive-600/15 text-[#323F35] border-[#4A5D4E]/25",
  must_complete: "bg-olive-600/15 text-[#323F35] border-[#4A5D4E]/25",
  must_demonstrate: "bg-olive-600/15 text-[#323F35] border-[#4A5D4E]/25",
  must_acknowledge: "bg-olive-600/15 text-[#323F35] border-[#4A5D4E]/25",
  recommended: "bg-stone-100 text-stone-700 border-stone-200",
  optional: "bg-[#EFECE3] text-[#555248] border-[#E2DDD0]",
  not_applicable: "bg-stone-100 text-stone-500 border-stone-200",
};

export default function RoleMatrix() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const d = await api.get("/api/role-matrix");
      const items = d.rows || [];
      setRows(items);
      setSelected((prev) => prev ?? (items[0]?.job_role_id || null));
    } catch (err) {
      setError(err.message);
      notify.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (r.job_role_name || "").toLowerCase().includes(q) ||
        (r.department || "").toLowerCase().includes(q),
    );
  }, [rows, search]);

  const totals = useMemo(() => {
    const mandatory = rows.reduce((a, r) => a + (r.mandatory_count || 0), 0);
    const total = rows.reduce((a, r) => a + (r.total_count || 0), 0);
    return { mandatory, total };
  }, [rows]);

  const active = rows.find((r) => r.job_role_id === selected);

  return (
    <Layout mode="admin">
      <div className="space-y-6">
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-olive-600/10 border border-olive-600/20 flex items-center justify-center text-olive-600 shrink-0">
              <Grid3x3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#222321]">
                Role Requirement Matrix ({rows.length})
              </h1>
              <p className="text-xs text-[#706E66] mt-0.5">
                Ground-truth map of which requirements apply to each job role
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#555248] bg-[#EFECE3] border border-[#E2DDD0] px-3 py-1.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-olive-600" />
              {totals.mandatory} mandatory
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#555248] bg-[#EFECE3] border border-[#E2DDD0] px-3 py-1.5 rounded-full">
              <ListChecks className="w-3.5 h-3.5 text-olive-600" />
              {totals.total} total
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

        {/* FILTER CONTROL CARD */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-4 shadow-2xs">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C8A81]" />
              <input
                placeholder="Search by role name or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] placeholder-[#8C8A81] pl-9 pr-4 py-2.5 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
              />
            </div>
            <button
              type="button"
              onClick={() => setSearch("")}
              disabled={!search}
              className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#EFECE3] hover:bg-[#E2DDD0] text-[#555248] text-xs font-semibold rounded-full transition-all shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Filter className="w-3.5 h-3.5" /> Clear
            </button>
          </form>
        </div>

        {/* SUMMARY TABLE */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs">
          <div className="px-6 pt-5 pb-3 border-b border-[#E2DDD0] bg-[#F8F7F2]/40">
            <h2 className="text-sm font-bold text-[#222321]">Summary by role</h2>
            <p className="text-[11px] text-[#706E66] mt-0.5">
              Click a row to preview which requirements it covers
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F7F2] border-b border-[#E2DDD0]">
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                    Role
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                    Department
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                    Mandatory
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                    Total
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                    Mandatory share
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66] text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DDD0]/60 text-xs">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-8 text-center text-[#8C8A81]"
                    >
                      Loading matrix...
                    </td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-8 text-center text-[#8C8A81]"
                    >
                      No matching roles. Assign requirements to a role from the
                      Requirements page to populate the matrix.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((r) => {
                    const share =
                      r.total_count > 0
                        ? Math.round((r.mandatory_count / r.total_count) * 100)
                        : 0;
                    const isSelected = r.job_role_id === selected;
                    return (
                      <tr
                        key={r.job_role_id}
                        onClick={() => setSelected(r.job_role_id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-olive-600/5 hover:bg-olive-600/10"
                            : "hover:bg-[#F8F7F2]/60"
                        }`}
                      >
                        <td className="px-5 py-3.5 font-semibold text-[#222321]">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? "bg-olive-600 text-white"
                                  : "bg-olive-600/10 text-olive-600"
                              }`}
                            >
                              <Briefcase className="w-3.5 h-3.5" />
                            </div>
                            <span>{r.job_role_name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-[#555248]">
                          <div className="inline-flex items-center gap-1.5 text-stone-600">
                            <Building2 className="w-3.5 h-3.5 text-stone-400" />
                            {r.department || "—"}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#323F35] bg-olive-600/15 border border-[#4A5D4E]/25 px-2 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3 text-olive-600" />
                            {r.mandatory_count}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[#555248]">
                          {r.total_count}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2 min-w-[140px]">
                            <div className="flex-1 h-1.5 bg-[#EFECE3] rounded-full overflow-hidden">
                              <div
                                className="h-1.5 bg-olive-600"
                                style={{ width: `${share}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-mono text-[#555248] w-9 text-right">
                              {share}%
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(r.job_role_id);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-olive-600 hover:text-olive-700 hover:underline"
                          >
                            View <ArrowUpRight className="w-3 h-3" />
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

        {/* DETAIL TABLE */}
        {active && (
          <div className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 pt-5 pb-4 border-b border-[#E2DDD0] bg-[#F8F7F2]/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-olive-600 text-white flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#222321]">
                    {active.job_role_name}
                  </h2>
                  <p className="text-[11px] text-[#706E66]">
                    {active.department || "No department"} ·{" "}
                    {active.mandatory_count} mandatory / {active.total_count}{" "}
                    total requirements
                  </p>
                </div>
              </div>
              <Link
                to={`/admin/roles/${active.job_role_id}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-olive-600 hover:text-olive-700 hover:underline"
              >
                Open role <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8F7F2] border-b border-[#E2DDD0]">
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                      Code
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                      Requirement
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                      Must
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                      Mandatory
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                      Priority
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                      Stage
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                      Source
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66] text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2DDD0]/60 text-xs">
                  {(!active.cells || active.cells.length === 0) ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-5 py-8 text-center text-[#8C8A81]"
                      >
                        No requirements assigned to this role yet.
                      </td>
                    </tr>
                  ) : (
                    active.cells.map((c) => (
                      <tr
                        key={c.requirement_id}
                        className="hover:bg-[#F8F7F2]/60 transition-colors"
                      >
                        <td className="px-5 py-3.5 font-mono text-[11px] font-bold text-[#555248]">
                          {c.req_code}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-[#222321]">
                          {c.title}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${
                              MUST_STYLE[c.must_type] ||
                              "bg-stone-100 text-stone-700 border-stone-200"
                            }`}
                          >
                            {(c.must_type || "—").replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {c.is_mandatory ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#323F35] bg-olive-600/15 border border-[#4A5D4E]/25 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-olive-600" />{" "}
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full">
                              <XCircle className="w-3 h-3 text-stone-400" /> No
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${
                              PRIORITY_STYLE[c.effective_priority] ||
                              "bg-stone-100 text-stone-700 border-stone-200"
                            }`}
                          >
                            {c.effective_priority || "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-[#555248]">
                          {c.effective_due_stage
                            ? c.effective_due_stage.replace(/_/g, " ")
                            : "—"}
                        </td>
                        <td className="px-5 py-3.5 text-[#555248]">
                          {c.source_document_id ? (
                            <div className="inline-flex items-center gap-1.5 text-stone-600">
                              <FileText className="w-3.5 h-3.5 text-olive-600" />
                              <span className="font-mono text-[11px]">
                                #{c.source_document_id}
                                {c.source_section
                                  ? ` §${c.source_section}`
                                  : ""}
                              </span>
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Link
                            to={`/admin/requirements/${c.requirement_id}`}
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
        )}
      </div>
    </Layout>
  );
}
