import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { uploadForm } from "../../../lib/uploadApi";
import Layout from "../../../components/Layout";
import {
  UploadCloud,
  ArrowLeft,
  FileText,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
  FileCheck,
  ShieldAlert,
} from "lucide-react";

const TYPES = [
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

const EMPTY_FORM = {
  doc_code: "",
  name: "",
  doc_type: "policy",
  department: "",
  description: "",
  effective_date: "",
  expiry_date: "",
};

export default function UploadDocuments() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [preview, setPreview] = useState(null);
  const [previewErr, setPreviewErr] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [override, setOverride] = useState(false);
  const [overrideCorpus, setOverrideCorpus] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onFileChange = async (e) => {
    const picked = e.target.files?.[0] || null;
    setFile(picked);
    setPreview(null);
    setPreviewErr(null);
    setError(null);
    setOverride(false);
    setOverrideCorpus(false);
    if (!picked) return;

    try {
      const fd = new FormData();
      fd.append("file", picked);
      const p = await uploadForm("/api/documents/preview", fd);
      setPreview(p);
      if (!p.parseable) {
        setPreviewErr(p.reason || "Could not read this file.");
        return;
      }
      if (!p.meaningful) {
        setPreviewErr(
          "This file has no meaningful text content. Please pick a different file."
        );
        return;
      }
      const d = p.detection || {};
      setForm((prev) => ({
        ...prev,
        doc_code: prev.doc_code || d.doc_code || "",
        name: prev.name || d.name || "",
        doc_type: d.doc_type && TYPES.includes(d.doc_type) ? d.doc_type : prev.doc_type,
        department: prev.department || d.department || "",
        description: prev.description || d.description || "",
      }));
    } catch (err) {
      setPreviewErr(err.message);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("File is required");
      return;
    }
    if (preview && !preview.meaningful) {
      setError("File is empty or unreadable. Pick a different file.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      Object.entries(form).forEach(([k, v]) => {
        if (v !== "") fd.append(k, v);
      });
      if (override) fd.append("override_type_mismatch", "true");
      if (overrideCorpus) fd.append("override_corpus_unrelated", "true");
      const res = await uploadForm("/api/documents/upload", fd);
      navigate(`/admin/documents/${res.document.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const detection = preview?.detection || {};
  const adversarial = detection.adversarial_hits || 0;
  const detectedType = detection.doc_type;
  const showMismatch =
    detectedType &&
    detectedType !== form.doc_type &&
    (detection.type_scores?.[form.doc_type] || 0) < 0.15;
  const corpusWarning = preview?.corpus_warning || null;

  return (
    <Layout mode="admin">
      <div className="space-y-6 max-w-4xl mx-auto">
        
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-olive-600/10 border border-olive-600/20 flex items-center justify-center text-olive-600 shrink-0">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#222321]">
                Upload Document
              </h1>
              <p className="text-xs text-[#706E66] mt-0.5">
                Upload PDF or DOCX policy files to process and index into the corpus.
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

        {/* ERROR BANNERS */}
        {error && (
          <div className="flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {previewErr && (
          <div className="flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{previewErr}</span>
          </div>
        )}

        {/* PREVIEW DETECTED BANNER */}
        {preview?.meaningful && (
          <div className="flex items-start gap-3 p-4 bg-emerald-50/80 border border-emerald-200 text-emerald-900 rounded-[20px] text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-emerald-950">
                File Parsed Successfully
              </p>
              <p className="text-emerald-800">
                Detected <strong>{detection.section_count}</strong> section(s) and <strong>{detection.total_chars}</strong> characters.
                {detectedType && (
                  <> Suggested type: <strong className="capitalize">{detectedType.replace(/_/g, " ")}</strong> (confidence {detection.type_confidence}).</>
                )}
                {adversarial > 0 && (
                  <span className="block mt-1 text-amber-800 font-medium inline-flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600 inline" />
                    {adversarial} chunk(s) flagged as adversarial and will be excluded from AI context.
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* TYPE MISMATCH ALERT */}
        {showMismatch && (
          <div className="p-4 bg-amber-50/80 border border-amber-200 text-amber-900 rounded-[20px] text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Document Type Mismatch</span>
            </div>
            <p className="text-amber-800">
              The file content appears more like a <strong className="capitalize underline">{detectedType.replace(/_/g, " ")}</strong> than the selected <strong className="capitalize underline">{form.doc_type.replace(/_/g, " ")}</strong>. Please review the Type field below, or check the box to confirm.
            </p>
            <label className="flex items-center gap-2 pt-1 font-medium text-amber-900 cursor-pointer">
              <input
                type="checkbox"
                checked={override}
                onChange={(e) => setOverride(e.target.checked)}
                className="w-4 h-4 rounded border-amber-300 text-olive-600 focus:ring-olive-600/30 accent-olive-600 cursor-pointer"
              />
              <span>I have reviewed the type and want to upload anyway.</span>
            </label>
          </div>
        )}

        {/* CORPUS ADVISORY WARNING */}
        {corpusWarning && (
          <div className="p-4 bg-amber-50/80 border border-amber-200 text-amber-900 rounded-[20px] text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Relevance Advisory — Off-Topic Content Detected</span>
            </div>
            <p className="text-amber-800 leading-relaxed">
              {corpusWarning.message}
            </p>
            <label className="flex items-center gap-2 pt-1 font-medium text-amber-900 cursor-pointer">
              <input
                type="checkbox"
                checked={overrideCorpus}
                onChange={(e) => setOverrideCorpus(e.target.checked)}
                className="w-4 h-4 rounded border-amber-300 text-olive-600 focus:ring-olive-600/30 accent-olive-600 cursor-pointer"
              />
              <span>I have reviewed the content and confirm it belongs in this corpus. Proceed with upload.</span>
            </label>
          </div>
        )}

        {/* FORM CONTAINER */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
          <form onSubmit={submit} className="space-y-6">
            
            {/* FILE DROPZONE / INPUT */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#555248]">
                File (PDF or DOCX) <span className="text-rose-500">*</span>
              </label>
              <div className="relative border-2 border-dashed border-[#E2DDD0] hover:border-olive-600/50 rounded-2xl p-6 bg-[#F8F7F2]/60 hover:bg-[#F8F7F2] transition-all text-center cursor-pointer group">
                <input
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={onFileChange}
                  required
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-white border border-[#E2DDD0] flex items-center justify-center text-stone-500 group-hover:text-olive-600 group-hover:border-olive-600/30 transition-all shadow-2xs">
                    {file ? <FileCheck className="w-6 h-6 text-olive-600" /> : <UploadCloud className="w-6 h-6" />}
                  </div>
                  <div>
                    {file ? (
                      <p className="text-xs font-bold text-[#222321]">{file.name}</p>
                    ) : (
                      <p className="text-xs font-bold text-[#222321]">
                        Click or drag file here to upload
                      </p>
                    )}
                    <p className="text-[11px] text-[#706E66] mt-0.5">
                      PDF or DOCX documents up to 50MB
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FORM METADATA GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#555248]">
                  Document Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.doc_code}
                  onChange={update("doc_code")}
                  required
                  placeholder="e.g. POL-01"
                  className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-3.5 py-2.5 rounded-2xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
                />
                <p className="text-[11px] text-[#706E66]">
                  Short stable identifier. Auto-detected when possible.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#555248]">
                  Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={update("name")}
                  required
                  placeholder="Document full title"
                  className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-3.5 py-2.5 rounded-2xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#555248]">
                  Document Type
                </label>
                <select
                  value={form.doc_type}
                  onChange={update("doc_type")}
                  className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-3.5 py-2.5 rounded-2xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all cursor-pointer capitalize"
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#555248]">
                  Department
                </label>
                <input
                  type="text"
                  value={form.department}
                  onChange={update("department")}
                  placeholder="e.g. Human Resources"
                  className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-3.5 py-2.5 rounded-2xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#555248]">
                  Effective Date
                </label>
                <input
                  type="date"
                  value={form.effective_date}
                  onChange={update("effective_date")}
                  className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-3.5 py-2.5 rounded-2xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#555248]">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={form.expiry_date}
                  onChange={update("expiry_date")}
                  className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-3.5 py-2.5 rounded-2xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
                />
              </div>

            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#555248]">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={update("description")}
                rows={3}
                placeholder="Brief summary of document coverage..."
                className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] p-3.5 rounded-2xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all resize-y"
              />
            </div>

            {/* ACTION SUBMIT BUTTON */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={busy || (preview && !preview.meaningful)}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-olive-600 hover:bg-olive-700 disabled:bg-stone-300 text-white text-xs font-semibold rounded-full transition-all shadow-2xs cursor-pointer disabled:cursor-not-allowed"
              >
                {busy ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading & Indexing...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Document</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </Layout>
  );
}