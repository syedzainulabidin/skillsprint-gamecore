import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  Info,
  Timer,
} from "lucide-react";
import { api } from "../../lib/api";
import { notify } from "../../lib/toast";
import Layout from "../../components/Layout";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Reports() {
  const [kinds, setKinds] = useState([]);
  const [selected, setSelected] = useState("");
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get("/api/reports")
      .then((d) => setKinds(d.kinds || []))
      .catch((err) => {
        setError(err.message);
        notify.error(err.message);
      });
  }, []);

  const load = async (kind) => {
    setSelected(kind);
    setLoading(true);
    setError(null);
    try {
      const d = await api.get(`/api/reports/${kind}`);
      setReport(d);
    } catch (err) {
      setError(err.message);
      notify.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(
    () => (report && report.rows.length > 0 ? Object.keys(report.rows[0]) : []),
    [report],
  );

  const activeKind = kinds.find((k) => k.key === selected);

  return (
    <Layout mode="admin">
      <div className="space-y-6">
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-olive-600/10 border border-olive-600/20 flex items-center justify-center text-olive-600 shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#222321]">
                Reports
              </h1>
              <p className="text-xs text-[#706E66] mt-0.5">
                Aggregated data across the platform — export to CSV or PDF for
                audit
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

        {/* REPORT PICKER */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
          <h2 className="text-sm font-bold text-[#222321] mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-olive-600" /> Pick a report
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {kinds.map((k) => {
              const active = selected === k.key;
              return (
                <button
                  key={k.key}
                  onClick={() => load(k.key)}
                  className={`text-left px-4 py-3 rounded-2xl border transition-all cursor-pointer ${
                    active
                      ? "bg-olive-600 border-olive-600 text-white shadow-2xs"
                      : "bg-[#F8F7F2] border-[#E2DDD0] text-[#222321] hover:border-olive-600/40 hover:bg-white"
                  }`}
                >
                  <div className="text-xs font-semibold">{k.title}</div>
                  {k.description && (
                    <div
                      className={`text-[10px] mt-1 ${
                        active ? "text-cream-50/80" : "text-[#706E66]"
                      }`}
                    >
                      {k.description}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {loading && (
          <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-8 shadow-2xs flex items-center justify-center gap-2 text-sm text-[#706E66]">
            <Timer className="w-4 h-4 animate-pulse text-olive-600" />
            Building report...
          </div>
        )}

        {report && !loading && (
          <>
            {/* EXPORT + COUNT ROW */}
            <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-4 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="text-xs text-[#555248] flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-olive-600" />
                <span className="font-semibold text-[#222321]">
                  {activeKind?.title || selected}
                </span>
                <span className="text-[#8C8A81]">·</span>
                <span className="font-mono">{report.count} rows</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`${BASE_URL}/api/reports/${selected}?export=csv`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#EFECE3] hover:bg-[#E2DDD0] text-[#555248] text-xs font-semibold rounded-full transition-all"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> CSV
                </a>
                <a
                  href={`${BASE_URL}/api/reports/${selected}?export=pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-olive-600 hover:bg-olive-700 text-white text-xs font-semibold rounded-full shadow-2xs transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> PDF
                </a>
              </div>
            </div>

            {/* DATA TABLE */}
            <div className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs">
              {report.rows.length === 0 ? (
                <div className="p-8 text-center text-[#8C8A81] text-sm">
                  No data for this report.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F8F7F2] border-b border-[#E2DDD0]">
                        {columns.map((c) => (
                          <th
                            key={c}
                            className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66] whitespace-nowrap"
                          >
                            {c.replace(/_/g, " ")}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2DDD0]/60 text-xs">
                      {report.rows.map((r, i) => (
                        <tr
                          key={i}
                          className="hover:bg-[#F8F7F2]/60 transition-colors"
                        >
                          {columns.map((c) => {
                            const v = r[c];
                            const isNumber = typeof v === "number";
                            return (
                              <td
                                key={c}
                                className={`px-5 py-3.5 text-[#555248] ${
                                  isNumber ? "font-mono" : ""
                                }`}
                              >
                                {v == null
                                  ? "—"
                                  : typeof v === "boolean"
                                    ? v
                                      ? "yes"
                                      : "no"
                                    : String(v)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {!report && !loading && (
          <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-8 shadow-2xs text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-olive-600/10 flex items-center justify-center text-olive-600 mb-3">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-[#222321] mb-1">
              Pick a report above to start
            </h2>
            <p className="text-xs text-[#706E66] max-w-md mx-auto">
              Every report can be downloaded as CSV (spreadsheet-friendly) or
              PDF (paper trail).
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
