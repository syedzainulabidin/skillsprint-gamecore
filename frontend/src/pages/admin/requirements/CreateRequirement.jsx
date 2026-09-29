import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FileText,
  ListChecks,
  Save,
  ShieldCheck,
} from "lucide-react";
import { api } from "../../../lib/api";
import { notify } from "../../../lib/toast";
import Layout from "../../../components/Layout";
import {
  DUE_STAGES,
  MUST_TYPES,
  PRIORITIES,
  REQUIREMENT_TYPES,
} from "../../../lib/enums";

const EMPTY = {
  req_code: "",
  title: "",
  description: "",
  requirement_type: "policy",
  must_type: "must_know",
  priority: "medium",
  due_stage: "",
  competency: "",
  assessment_topic: "",
  source_document_id: "",
  source_section: "",
};

const DOC_TO_REQ_TYPE = {
  hr_policy: "policy",
  data_privacy: "policy",
  info_security: "policy",
  workplace_conduct: "policy",
  compliance: "policy",
  safety: "policy",
  handbook: "policy",
  leave_policy: "policy",
  department_guideline: "policy",
  policy: "policy",
  sop: "process",
  process_manual: "process",
  role_description: "competency",
  faq: "knowledge",
  other: "policy",
};

function suggestNextCode(existing) {
  let max = 0;
  for (const r of existing || []) {
    const m = /^R(\d+)$/.exec(r.req_code || "");
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > max) max = n;
    }
  }
  return "R" + String(max + 1).padStart(3, "0");
}

export default function CreateRequirement() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [docs, setDocs] = useState([]);
  const [sections, setSections] = useState([]);
  const [sectionsBusy, setSectionsBusy] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [d, r] = await Promise.all([
          api.get("/api/documents?limit=200"),
          api.get("/api/requirements?limit=500"),
        ]);
        setDocs(d.items || []);
        setForm((prev) => ({
          ...prev,
          req_code: suggestNextCode(r.items || []),
        }));
      } catch (err) {
        setError(err.message);
        notify.error(err.message);
      }
    })();
  }, []);

  useEffect(() => {
    if (!form.source_document_id) {
      setSections([]);
      return;
    }
    setSectionsBusy(true);
    api
      .get(`/api/documents/${form.source_document_id}/chunks?limit=500`)
      .then((d) => {
        const uniq = new Map();
        (d.items || []).forEach((c) => {
          const key = `${c.section_number || ""}||${c.heading || ""}`;
          if (!uniq.has(key)) uniq.set(key, c);
        });
        setSections(Array.from(uniq.values()));
      })
      .catch(() => setSections([]))
      .finally(() => setSectionsBusy(false));
  }, [form.source_document_id]);

  const update = (k) => (e) => setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const onDocSelect = (v) => {
    const doc = docs.find((d) => String(d.id) === String(v));
    setForm((prev) => ({
      ...prev,
      source_document_id: v,
      source_section: "",
      requirement_type:
        (doc && DOC_TO_REQ_TYPE[doc.doc_type]) || prev.requirement_type,
    }));
  };

  const onSectionSelect = (v) => {
    const section = sections.find((s) => (s.section_number || s.chunk_code) === v);
    const heading = section && section.heading && section.heading.trim();
    const suggested = heading && heading.length >= 3 ? heading : "";
    setForm((prev) => ({
      ...prev,
      source_section: v,
      title: prev.title || suggested,
    }));
  };

  const canSubmit = form.source_document_id && form.title && form.req_code;

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const payload = { ...form };
      Object.keys(payload).forEach((k) => {
        if (payload[k] === "") payload[k] = null;
      });
      if (payload.source_document_id) {
        payload.source_document_id = Number(payload.source_document_id);
      }
      const created = await api.post("/api/requirements", payload);
      notify.success(`Requirement ${created.req_code} created.`);
      navigate(`/admin/requirements/${created.id}`);
    } catch (err) {
      setError(err.message);
      notify.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const activeSectionCount = useMemo(() => sections.length, [sections]);

  return (
    <Layout mode="admin">
      <div className="space-y-6">
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-olive-600/10 border border-olive-600/20 flex items-center justify-center text-olive-600 shrink-0">
              <ListChecks className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#222321]">
                New Requirement
              </h1>
              <p className="text-xs text-[#706E66] mt-0.5">
                Start with the source document — everything else auto-fills
              </p>
            </div>
          </div>

          <Link
            to="/admin/requirements"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#EFECE3] hover:bg-[#E2DDD0] text-[#555248] text-xs font-semibold rounded-full transition-all shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>

        {/* ERROR ALERT */}
        {error && (
          <div className="flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={submit} className="space-y-6">
          {/* STEP 1 — SOURCE */}
          <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-olive-600 text-white text-[11px] font-bold flex items-center justify-center">
                1
              </div>
              <h2 className="text-sm font-bold text-[#222321]">
                Ground the requirement in a source
              </h2>
            </div>
            <p className="text-xs text-[#706E66] mb-5">
              Every requirement must trace back to an approved company document.
              Pick the doc, then the section it comes from.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldGroup label="Source document" required>
                <SelectPill
                  value={form.source_document_id}
                  onChange={(e) => onDocSelect(e.target.value)}
                  required
                >
                  <option value="">Pick a document</option>
                  {docs.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.doc_code} — {d.name}
                    </option>
                  ))}
                </SelectPill>
              </FieldGroup>

              <FieldGroup
                label="Source section"
                hint={
                  form.source_document_id
                    ? sectionsBusy
                      ? "Loading sections..."
                      : `${activeSectionCount} section(s) detected`
                    : "Pick a document above first"
                }
              >
                {form.source_document_id ? (
                  sections.length > 0 ? (
                    <SelectPill
                      value={form.source_section}
                      onChange={(e) => onSectionSelect(e.target.value)}
                    >
                      <option value="">Pick a section</option>
                      {sections.map((s) => {
                        const val = s.section_number || s.chunk_code;
                        const label = s.section_number
                          ? `§${s.section_number}${s.heading ? ` — ${s.heading}` : ""}`
                          : s.heading || s.chunk_code;
                        return (
                          <option key={val} value={val}>
                            {label}
                          </option>
                        );
                      })}
                    </SelectPill>
                  ) : (
                    <InputPill
                      value={form.source_section}
                      onChange={update("source_section")}
                      placeholder="e.g. 4.2"
                    />
                  )
                ) : (
                  <div className="w-full bg-[#F8F7F2] text-xs text-[#8C8A81] italic px-4 py-2.5 rounded-full border border-[#E2DDD0]">
                    Pick a document first
                  </div>
                )}
              </FieldGroup>
            </div>
          </div>

          {/* STEP 2 — WHAT IT MEANS */}
          <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-olive-600 text-white text-[11px] font-bold flex items-center justify-center">
                2
              </div>
              <h2 className="text-sm font-bold text-[#222321]">
                Define the requirement
              </h2>
            </div>
            <p className="text-xs text-[#706E66] mb-5">
              Pre-filled from your selected section. Adjust the title if you
              want it phrased differently.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldGroup label="Title" required>
                <InputPill
                  value={form.title}
                  onChange={update("title")}
                  placeholder="What the employee must know / do"
                  required
                />
              </FieldGroup>
              <FieldGroup
                label="Must type"
                hint="How is completion measured?"
              >
                <SelectPill value={form.must_type} onChange={update("must_type")}>
                  {MUST_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </option>
                  ))}
                </SelectPill>
              </FieldGroup>
              <FieldGroup
                label="Type"
                hint="Auto-set from the source document"
              >
                <SelectPill
                  value={form.requirement_type}
                  onChange={update("requirement_type")}
                >
                  {REQUIREMENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </SelectPill>
              </FieldGroup>
              <FieldGroup label="Priority">
                <SelectPill value={form.priority} onChange={update("priority")}>
                  {PRIORITIES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </SelectPill>
              </FieldGroup>
              <FieldGroup label="Due stage">
                <SelectPill value={form.due_stage} onChange={update("due_stage")}>
                  <option value="">—</option>
                  {DUE_STAGES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </option>
                  ))}
                </SelectPill>
              </FieldGroup>
              <FieldGroup
                label="Code"
                hint="Auto-numbered. Change only if you have a naming convention."
              >
                <InputPill
                  value={form.req_code}
                  onChange={update("req_code")}
                  required
                />
              </FieldGroup>
            </div>

            <div className="mt-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#706E66] mb-1.5">
                Description (optional)
              </label>
              <textarea
                value={form.description}
                onChange={update("description")}
                rows={2}
                placeholder="Optional context about this requirement"
                className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] placeholder-[#8C8A81] px-4 py-2.5 rounded-2xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all resize-none"
              />
            </div>

            {/* ADVANCED TOGGLE */}
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-olive-600 hover:text-olive-700"
            >
              {showAdvanced ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" /> Hide advanced fields
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" /> Show advanced fields
                  (competency, assessment topic)
                </>
              )}
            </button>

            {showAdvanced && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#E2DDD0]">
                <FieldGroup
                  label="Competency"
                  hint="Named skill this builds — used for progress reports."
                >
                  <InputPill
                    value={form.competency}
                    onChange={update("competency")}
                    placeholder="e.g. Customer escalation handling"
                  />
                </FieldGroup>
                <FieldGroup
                  label="Assessment topic"
                  hint="Groups related quiz/assessment questions."
                >
                  <InputPill
                    value={form.assessment_topic}
                    onChange={update("assessment_topic")}
                    placeholder="e.g. Data privacy basics"
                  />
                </FieldGroup>
              </div>
            )}
          </div>

          {/* SUBMIT ROW */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-[#E2DDD0] rounded-[28px] p-4 shadow-2xs">
            <div className="text-xs text-[#706E66] flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-olive-600" />
              Requirement will be created and open its details page.
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/admin/requirements"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#EFECE3] hover:bg-[#E2DDD0] text-[#555248] text-xs font-semibold rounded-full transition-all cursor-pointer"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={busy || !canSubmit}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-olive-600 hover:bg-olive-700 text-white text-xs font-semibold rounded-full shadow-2xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Create requirement
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
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
