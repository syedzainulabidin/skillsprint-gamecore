import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../../lib/api";
import Layout from "../../../components/Layout";
import {
  FileText,
  Upload,
  Search,
  Filter,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  Tag,
  ArchiveX,
  FileCheck,
} from "lucide-react";

const TYPES = [
  "",
  "policy",
  "hr_policy",
  "leave_policy",
  "info_security",
  "workplace_conduct",
  "data_privacy",
  "sop",
  "process_manual",
  "role_description",
  "faq",
  "compliance",
  "handbook",
  "department_guideline",
  "safety",
  "other",
];

export default function Documents() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [docType, setDocType] = useState("");
  const [showRetired, setShowRetired] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (docType) params.set("doc_type", docType);
    if (showRetired) params.set("include_inactive", "true");
    try {
      const d = await api.get(
        `/api/documents${params.toString() ? "?" + params : ""}`
      );
      setItems(d.items || []);
      setTotal(d.total || 0);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, [showRetired]);

  return (
    <Layout mode="admin">
      <div className="space-y-6">
        
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-olive-600/10 border border-olive-600/20 flex items-center justify-center text-olive-600 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#222321]">
                Documents ({total})
              </h1>
              <p className="text-xs text-[#706E66] mt-0.5">
                Browse policies, compliance manuals, and department guidelines
              </p>
            </div>
          </div>

          <Link
            to="/admin/documents/upload"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-olive-600 hover:bg-olive-700 text-white text-xs font-semibold rounded-full shadow-2xs transition-all shrink-0 cursor-pointer"
          >
            <Upload className="w-4 h-4" /> Upload
          </Link>
        </div>

        {/* ERROR DISPLAY */}
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
            className="flex flex-col md:flex-row items-stretch md:items-center gap-3"
          >
            {/* SEARCH INPUT */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C8A81]" />
              <input
                placeholder="Search documents by code or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] placeholder-[#8C8A81] pl-9 pr-4 py-2.5 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
              />
            </div>

            {/* DOCUMENT TYPE SELECT */}
            <div className="relative min-w-[180px]">
              <Tag className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C8A81] pointer-events-none" />
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] pl-9 pr-8 py-2.5 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all appearance-none cursor-pointer"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t ? t.replace(/_/g, " ") : "All types"}
                  </option>
                ))}
              </select>
            </div>

            {/* RETIRED CHECKBOX */}
            <label className="text-xs text-stone-600 font-medium flex items-center gap-2 px-2 cursor-pointer select-none whitespace-nowrap">
              <input
                type="checkbox"
                checked={showRetired}
                onChange={(e) => setShowRetired(e.target.checked)}
                className="w-4 h-4 rounded border-[#E2DDD0] text-olive-600 focus:ring-olive-600/30 cursor-pointer"
              />
              Show retired
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

        {/* DOCUMENTS TABLE */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F7F2] border-b border-[#E2DDD0]">
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">Code</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">Document Name</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">Type</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">Department</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">Status</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DDD0]/60 text-xs">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-[#8C8A81]">
                      No documents found matching your filter criteria
                    </td>
                  </tr>
                ) : (
                  items.map((d) => (
                    <tr
                      key={d.id}
                      className={`hover:bg-[#F8F7F2]/60 transition-colors ${
                        d.is_active ? "" : "opacity-60 bg-stone-50/50"
                      }`}
                    >
                      <td className="px-5 py-3.5 font-mono text-[11px] font-bold text-[#555248]">
                        {d.doc_code}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-[#222321]">
                        <div className="flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-olive-600 shrink-0" />
                          <span>{d.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 border border-stone-200 text-stone-700 capitalize">
                          {d.doc_type ? d.doc_type.replace(/_/g, " ") : "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[#555248]">
                        <div className="inline-flex items-center gap-1.5 text-stone-600">
                          <Building2 className="w-3.5 h-3.5 text-stone-400" />
                          {d.department || "—"}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {d.is_active ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-100/80 border border-rose-200/80 px-2 py-0.5 rounded-full">
                            <ArchiveX className="w-3 h-3 text-rose-600" /> Retired
                            {d.superseded_by_id ? ` → #${d.superseded_by_id}` : ""}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to={`/admin/documents/${d.id}`}
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