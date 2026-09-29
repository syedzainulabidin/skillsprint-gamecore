import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Layers,
  RefreshCw,
  Search,
  Users,
  X,
  Zap,
} from "lucide-react";
import { api } from "../../lib/api";
import { notify } from "../../lib/toast";
import Layout from "../../components/Layout";

const STATUS_STYLE = {
  regenerated: "bg-olive-600/15 text-[#323F35] border-[#4A5D4E]/25",
  analyzed: "bg-amber-100/80 text-amber-900 border-amber-200/80",
  dismissed: "bg-stone-100 text-stone-600 border-stone-200",
};

export default function PolicyImpact() {
  const [documents, setDocuments] = useState([]);
  const [docId, setDocId] = useState("");
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const loadImpacts = () => {
    api
      .get("/api/policy-impacts")
      .then((d) => setItems(d.items || []))
      .catch(() => {});
  };

  useEffect(() => {
    api
      .get("/api/documents?limit=200")
      .then((d) => setDocuments(d.items || []))
      .catch(() => {});
    loadImpacts();
  }, []);

  const analyze = async () => {
    if (!docId) return;
    setBusy(true);
    setError(null);
    try {
      await api.post(`/api/documents/${docId}/impact`);
      notify.success("Impact analysis complete.");
      loadImpacts();
    } catch (err) {
      setError(err.message);
      notify.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const regenerate = async (impactId) => {
    if (
      !confirm(
        "Regenerate affected plans? This will call the AI provider and archive the old plans.",
      )
    )
      return;
    setBusy(true);
    setError(null);
    try {
      await api.post(`/api/policy-impacts/${impactId}/regenerate`);
      notify.success("Affected plans regenerated.");
      loadImpacts();
    } catch (err) {
      setError(err.message);
      notify.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const dismiss = async (impactId) => {
    setBusy(true);
    try {
      await api.post(`/api/policy-impacts/${impactId}/dismiss`);
      notify.info("Impact dismissed.");
      loadImpacts();
    } catch (err) {
      setError(err.message);
      notify.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout mode="admin">
      <div className="space-y-6">
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-olive-600/10 border border-olive-600/20 flex items-center justify-center text-olive-600 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#222321]">
                Policy Impact
              </h1>
              <p className="text-xs text-[#706E66] mt-0.5">
                When a document changes, find which onboarding plans need
                regenerating
              </p>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* ANALYSE CARD */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
          <h2 className="text-sm font-bold text-[#222321] mb-1 flex items-center gap-2">
            <Search className="w-4 h-4 text-olive-600" /> Analyse a document
          </h2>
          <p className="text-[11px] text-[#706E66] mb-4">
            Pick a document to run impact analysis against. Every plan that
            cites it will be listed as affected.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#706E66] mb-1.5">
                Document
              </label>
              <select
                value={docId}
                onChange={(e) => setDocId(e.target.value)}
                className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-4 py-2.5 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all appearance-none cursor-pointer"
              >
                <option value="">Select document</option>
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.doc_code} — {d.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={analyze}
              disabled={!docId || busy}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-olive-600 hover:bg-olive-700 text-white text-xs font-semibold rounded-full shadow-2xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {busy ? "Analysing..." : (
                <>
                  <Search className="w-4 h-4" /> Analyse impact
                </>
              )}
            </button>
          </div>
        </div>

        {/* HISTORY */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs">
          <div className="px-6 pt-5 pb-3 border-b border-[#E2DDD0] bg-[#F8F7F2]/40">
            <h2 className="text-sm font-bold text-[#222321] flex items-center gap-2">
              <Layers className="w-4 h-4 text-olive-600" /> Impact history (
              {items.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F7F2] border-b border-[#E2DDD0]">
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                    ID
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                    Document
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                    Plans
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                    Modules
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                    Employees
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                    Status
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
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-10 text-center text-[#8C8A81]"
                    >
                      <div className="inline-flex items-center gap-2 text-[#706E66]">
                        <CheckCircle2 className="w-4 h-4 text-olive-600" />
                        No impact analyses yet. Analyse a document above to
                        detect affected plans.
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((i) => {
                    let s = {};
                    try {
                      s = i.summary_json ? JSON.parse(i.summary_json) : {};
                    } catch (e) {}
                    return (
                      <tr
                        key={i.id}
                        className="hover:bg-[#F8F7F2]/60 transition-colors"
                      >
                        <td className="px-5 py-3.5 font-mono text-[11px] font-bold text-[#555248]">
                          #{i.id}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="inline-flex items-center gap-1.5 text-stone-600">
                            <FileText className="w-3.5 h-3.5 text-olive-600" />
                            <span className="font-mono text-[11px] font-semibold text-[#222321]">
                              {s.doc_code || `#${i.document_id}`}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[#555248]">
                          {s.affected_plan_count ?? 0}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[#555248]">
                          {s.affected_module_count ?? 0}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="inline-flex items-center gap-1.5 font-mono text-[#555248]">
                            <Users className="w-3.5 h-3.5 text-stone-400" />
                            {s.affected_employee_count ?? 0}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${
                              STATUS_STYLE[i.status] ||
                              "bg-stone-100 text-stone-700 border-stone-200"
                            }`}
                          >
                            {i.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-[#8C8A81] font-mono text-[11px]">
                          {i.created_at
                            ? new Date(i.created_at).toLocaleString()
                            : "—"}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {i.status === "analyzed" ? (
                            <div className="inline-flex items-center gap-2 justify-end">
                              <button
                                onClick={() => regenerate(i.id)}
                                disabled={busy}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-olive-600 hover:bg-olive-700 text-white text-[11px] font-semibold rounded-full transition-all shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <RefreshCw className="w-3 h-3" /> Regenerate
                              </button>
                              <button
                                onClick={() => dismiss(i.id)}
                                disabled={busy}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#EFECE3] hover:bg-[#E2DDD0] text-[#555248] text-[11px] font-semibold rounded-full transition-all disabled:opacity-50"
                              >
                                <X className="w-3 h-3" /> Dismiss
                              </button>
                            </div>
                          ) : (
                            <span className="text-[#8C8A81] text-[11px]">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
