import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../../lib/api";
import Layout from "../../../components/Layout";
import {
  FileText,
  ArrowLeft,
  Download,
  AlertTriangle,
  AlertCircle,
  Building2,
  Folder,
  Layers,
  Archive,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileCode,
  ShieldAlert,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const CHUNKS_PER_PAGE = 25;

export default function DocumentDetails() {
  const { documentId } = useParams();
  const [detail, setDetail] = useState(null);
  const [chunks, setChunks] = useState({ total: 0, items: [] });
  const [chunkPage, setChunkPage] = useState(0);
  const [chunkVersion, setChunkVersion] = useState(null);
  const [supersedeId, setSupersedeId] = useState("");
  const [otherDocs, setOtherDocs] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const loadDetail = async () => {
    const d = await api.get(`/api/documents/${documentId}`);
    setDetail(d);
    if (chunkVersion === null && d.current_version) {
      setChunkVersion(d.current_version.id);
    }
    return d;
  };

  const loadChunks = async (vid, page) => {
    const params = new URLSearchParams({
      skip: String(page * CHUNKS_PER_PAGE),
      limit: String(CHUNKS_PER_PAGE),
    });
    if (vid) params.set("version_id", String(vid));
    const c = await api.get(
      `/api/documents/${documentId}/chunks?${params.toString()}`
    );
    setChunks({ total: c.total || 0, items: c.items || [] });
  };

  useEffect(() => {
    (async () => {
      try {
        const d = await loadDetail();
        const vid = chunkVersion ?? d.current_version?.id ?? null;
        if (vid) await loadChunks(vid, 0);
      } catch (err) {
        setError(err.message);
      }
    })();
  }, [documentId]);

  useEffect(() => {
    if (chunkVersion) loadChunks(chunkVersion, chunkPage).catch(() => {});
  }, [chunkVersion, chunkPage]);

  useEffect(() => {
    api
      .get("/api/documents?limit=200")
      .then((d) =>
        setOtherDocs(
          (d.items || []).filter((x) => String(x.id) !== String(documentId))
        )
      )
      .catch(() => {});
  }, [documentId]);

  const promoteVersion = async (id) => {
    if (!confirm("Make this version current?")) return;
    setBusy(true);
    try {
      await api.post(`/api/documents/versions/${id}/make-current`);
      await loadDetail();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const supersede = async (targetId) => {
    const replacement =
      targetId != null
        ? otherDocs.find((x) => String(x.id) === String(targetId))
        : null;
    const msg = replacement
      ? `Retire this document and mark ${replacement.doc_code} (${replacement.name}) as its replacement?\n\nThe old document will be marked inactive and hidden from generation, but its content and versions remain in the database. Plans that already cited it will be flagged by Policy Impact.`
      : `Reactivate this document?\n\nIt will appear in the corpus and be usable for plan generation again.`;
    if (!confirm(msg)) return;
    setBusy(true);
    try {
      const qs =
        targetId != null
          ? `?superseded_by_id=${encodeURIComponent(targetId)}`
          : "";
      await api.post(`/api/documents/${documentId}/supersede${qs}`);
      await loadDetail();
      setSupersedeId("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!detail)
    return (
      <Layout mode="admin">
        <div className="space-y-4 max-w-6xl mx-auto">
          {error && (
            <div className="flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}
          <div className="flex items-center justify-center p-12 bg-white/80 border border-[#E2DDD0] rounded-[28px]">
            <div className="flex items-center gap-2 text-xs font-medium text-[#706E66]">
              <Loader2 className="w-4 h-4 animate-spin text-olive-600" />
              <span>Loading document details...</span>
            </div>
          </div>
        </div>
      </Layout>
    );

  const doc = detail.document;
  const current = detail.current_version;
  const totalPages = Math.max(1, Math.ceil(chunks.total / CHUNKS_PER_PAGE));

  return (
    <Layout mode="admin">
      <div className="space-y-6 max-w-6xl mx-auto">
        
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-olive-600/10 border border-olive-600/20 flex items-center justify-center text-olive-600 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-olive-600 bg-olive-600/10 px-2 py-0.5 rounded-md">
                  {doc.doc_code}
                </span>
                <h1 className="text-xl font-bold tracking-tight text-[#222321]">
                  {doc.name}
                </h1>
              </div>
              <p className="text-xs text-[#706E66] mt-0.5">
                System Document ID: <span className="font-mono text-[#222321]">{documentId}</span>
              </p>
            </div>
          </div>

          <Link
            to="/admin/documents"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#F8F7F2] hover:bg-[#EAE6DB] border border-[#E2DDD0] text-[#222321] text-xs font-semibold rounded-full transition-all shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to documents
          </Link>
        </div>

        {/* ERROR DISPLAY */}
        {error && (
          <div className="flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* RETIRED ALERT BANNER */}
        {!doc.is_active && (
          <div className="flex items-start gap-3 p-4 bg-amber-50/80 border border-amber-200/80 text-amber-900 rounded-[20px] text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">This document is retired.</p>
              <p className="text-amber-800">
                {doc.superseded_by_id
                  ? `It was superseded by document #${doc.superseded_by_id}. `
                  : "It is marked inactive. "}
                It is hidden from the corpus and no longer used for plan generation. Use{" "}
                <strong className="underline">Reactivate</strong> below to restore it, or upload a fresh version via the Documents list.
              </p>
            </div>
          </div>
        )}

        {/* METADATA & CURRENT VERSION GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* METADATA CARD */}
          <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E2DDD0]">
              <Folder className="w-4 h-4 text-olive-600" />
              <h2 className="text-sm font-bold text-[#222321]">Metadata</h2>
            </div>
            
            <div className="text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#706E66] font-medium">Document Type</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 border border-stone-200 text-stone-700 capitalize">
                  {doc.doc_type ? doc.doc_type.replace(/_/g, " ") : "—"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#706E66] font-medium">Department</span>
                <span className="font-semibold text-[#222321] inline-flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-stone-400" />
                  {doc.department || "—"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#706E66] font-medium">Category</span>
                <span className="font-semibold text-[#222321]">{doc.category || "—"}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#706E66] font-medium">Active Status</span>
                {doc.is_active ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Yes
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-100/80 border border-rose-200/80 px-2 py-0.5 rounded-full">
                    <XCircle className="w-3 h-3 text-rose-600" /> No
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#706E66] font-medium">Superseded By</span>
                <span className="font-mono text-[#222321] font-medium">
                  {doc.superseded_by_id ? `#${doc.superseded_by_id}` : "—"}
                </span>
              </div>

              <div className="pt-2 border-t border-[#E2DDD0]">
                <span className="text-[#706E66] font-medium block mb-1">Description</span>
                <p className="text-[#555248] leading-relaxed bg-[#F8F7F2] p-3 rounded-2xl border border-[#E2DDD0]">
                  {doc.description || "No description provided."}
                </p>
              </div>
            </div>
          </div>

          {/* CURRENT VERSION CARD */}
          {current && (
            <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2DDD0]">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-olive-600" />
                  <h2 className="text-sm font-bold text-[#222321]">Current Version</h2>
                </div>
                <span className="text-[11px] font-bold text-olive-700 bg-olive-600/10 border border-olive-600/20 px-2.5 py-0.5 rounded-full">
                  #{current.version_number} ({current.version_label})
                </span>
              </div>

              <div className="text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#706E66] font-medium">Original File</span>
                  <span className="font-semibold text-[#222321] truncate max-w-[200px]" title={current.original_filename}>
                    {current.original_filename}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#706E66] font-medium">File Size</span>
                  <span className="font-mono text-[#222321]">{current.size_bytes} B</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#706E66] font-medium">Parse Status</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-stone-100 text-stone-700 uppercase tracking-wider">
                    {current.parse_status}
                  </span>
                </div>

                {current.parse_error && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-[11px]">
                    <strong>Parse Error:</strong> {current.parse_error}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-[#706E66] font-medium">Character Count</span>
                  <span className="font-mono text-[#222321]">{current.parsed_char_count ?? "—"}</span>
                </div>

                <div className="pt-2 border-t border-[#E2DDD0] space-y-1">
                  <span className="text-[#706E66] font-medium block">SHA-256 Checksum</span>
                  <div className="font-mono text-[10px] text-[#555248] break-all bg-[#F8F7F2] p-2 rounded-xl border border-[#E2DDD0]">
                    {current.sha256}
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-olive-600 hover:bg-olive-700 text-white text-xs font-semibold rounded-full transition-all shadow-2xs"
                    href={`${BASE_URL}/api/documents/versions/${current.id}/download`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download file
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RETIRE / REPLACE CARD */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E2DDD0]">
            <Archive className="w-4 h-4 text-olive-600" />
            <h2 className="text-sm font-bold text-[#222321]">Retire / Replace Document</h2>
          </div>

          <p className="text-xs text-[#706E66] leading-relaxed">
            Use this when a policy has been <strong>retired</strong> and (optionally) replaced by a different document. This is <strong>not</strong> for versioning the same document — for that, upload the new file with the same document code and it becomes v2 automatically.
            <br />
            When retired: the document is marked inactive, hidden from the corpus, and excluded from plan generation. Existing plans that cite it are flagged under Policy Impact.
          </p>

          {doc.is_active ? (
            <div className="flex flex-col md:flex-row gap-3 md:items-end pt-1">
              <div className="flex-1 space-y-1.5">
                <label className="block text-xs font-semibold text-[#555248]">
                  Replacement document (optional)
                </label>
                <select
                  className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-3.5 py-2.5 rounded-2xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all cursor-pointer"
                  value={supersedeId}
                  onChange={(e) => setSupersedeId(e.target.value)}
                >
                  <option value="">No replacement — just retire</option>
                  {otherDocs
                    .filter((x) => x.is_active)
                    .map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.doc_code} — {x.name}
                      </option>
                    ))}
                </select>
              </div>

              <button
                onClick={() => supersede(supersedeId || null)}
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-stone-300 text-white text-xs font-semibold rounded-full transition-all shadow-2xs cursor-pointer shrink-0 disabled:cursor-not-allowed"
              >
                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5" />}
                <span>Retire this document</span>
              </button>
            </div>
          ) : (
            <div className="pt-1">
              <button
                onClick={() => supersede(null)}
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-olive-600 hover:bg-olive-700 disabled:bg-stone-300 text-white text-xs font-semibold rounded-full transition-all shadow-2xs cursor-pointer disabled:cursor-not-allowed"
              >
                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span>Reactivate document</span>
              </button>
            </div>
          )}
        </div>

        {/* ALL VERSIONS TABLE CARD */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs">
          <div className="p-6 border-b border-[#E2DDD0] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-olive-600" />
              <h2 className="text-sm font-bold text-[#222321]">All Versions ({detail.versions.length})</h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F7F2] border-b border-[#E2DDD0]">
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">#</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">Label</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">Effective Date</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">Uploaded At</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">Current Status</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DDD0]/60 text-xs">
                {detail.versions.map((v) => (
                  <tr key={v.id} className="hover:bg-[#F8F7F2]/60 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-[#222321]">
                      v{v.version_number}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-[#555248]">
                      {v.version_label}
                    </td>
                    <td className="px-5 py-3.5 text-[#555248]">
                      {v.effective_date || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-[#555248]">
                      {v.uploaded_at}
                    </td>
                    <td className="px-5 py-3.5">
                      {v.is_current ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Current
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full">
                          Archived
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center justify-end gap-3">
                        <a
                          className="inline-flex items-center gap-1 text-xs font-semibold text-olive-600 hover:text-olive-700 hover:underline"
                          href={`${BASE_URL}/api/documents/versions/${v.id}/download`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Download <ArrowUpRight className="w-3 h-3" />
                        </a>
                        {!v.is_current && (
                          <button
                            onClick={() => promoteVersion(v.id)}
                            disabled={busy}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-[#F8F7F2] hover:bg-[#EAE6DB] border border-[#E2DDD0] text-[#222321] text-[11px] font-semibold rounded-full transition-all cursor-pointer disabled:cursor-not-allowed"
                          >
                            Make current
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CHUNKS VIEWER CARD */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2DDD0]">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-olive-600" />
              <h2 className="text-sm font-bold text-[#222321]">
                Document Chunks ({chunks.total})
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-[#706E66]">
                <span>Version:</span>
                <select
                  className="bg-[#F8F7F2] text-xs text-[#2C2C2A] px-2.5 py-1.5 rounded-xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all cursor-pointer"
                  value={chunkVersion || ""}
                  onChange={(e) => {
                    setChunkPage(0);
                    setChunkVersion(Number(e.target.value) || null);
                  }}
                >
                  {detail.versions.map((v) => (
                    <option key={v.id} value={v.id}>
                      v{v.version_number} — {v.version_label}
                      {v.is_current ? " (current)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-[#706E66]">
                <button
                  disabled={chunkPage === 0}
                  onClick={() => setChunkPage((p) => p - 1)}
                  className="p-1.5 bg-[#F8F7F2] hover:bg-[#EAE6DB] border border-[#E2DDD0] text-[#222321] rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span>
                  Page {chunkPage + 1} of {totalPages}
                </span>
                <button
                  disabled={chunkPage + 1 >= totalPages}
                  onClick={() => setChunkPage((p) => p + 1)}
                  className="p-1.5 bg-[#F8F7F2] hover:bg-[#EAE6DB] border border-[#E2DDD0] text-[#222321] rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {chunks.items.length === 0 ? (
              <p className="text-center py-6 text-xs text-[#8C8A81]">
                No chunks available for this version.
              </p>
            ) : (
              chunks.items.map((c) => (
                <div key={c.id} className="p-4 bg-[#F8F7F2]/60 border border-[#E2DDD0] rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#222321]">
                    <span className="font-mono text-olive-700">
                      {c.chunk_code}
                      {c.heading ? ` — ${c.heading}` : ""}
                    </span>
                    {c.page_number && (
                      <span className="text-[11px] font-normal text-[#706E66]">
                        Page {c.page_number}
                      </span>
                    )}
                  </div>

                  {c.adversarial_flags && (
                    <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-[11px]">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span><strong>Flags:</strong> {c.adversarial_flags}</span>
                    </div>
                  )}

                  <pre className="text-xs font-mono text-[#555248] whitespace-pre-wrap leading-relaxed bg-white p-3 rounded-xl border border-[#E2DDD0]/80">
                    {c.content}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
}