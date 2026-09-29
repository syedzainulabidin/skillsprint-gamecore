import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Filter,
  ListChecks,
  Plus,
  Search,
  ShieldCheck,
  X,
  XCircle,
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

// Document type → sensible default requirement type
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

export default function Requirements() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [reqType, setReqType] = useState("");
  const [mustType, setMustType] = useState("");
  const [error, setError] = useState(null);

  // Form State from requirements.txt
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [docs, setDocs] = useState([]);
  const [sections, setSections] = useState([]);
  const [sectionsBusy, setSectionsBusy] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    api
      .get("/api/documents?limit=200")
      .then((d) => setDocs(d.items || []))
      .catch(() => {});
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

  const openCreate = () => {
    setForm({
      ...EMPTY,
      req_code: suggestNextCode(items),
    });
    setShowAdvanced(false);
    setFormError(null);
    setCreating(true);
  };

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
    const section = sections.find(
      (s) => (s.section_number || s.chunk_code) === v
    );
    setForm((prev) => {
      const heading = section && section.heading && section.heading.trim();
      const suggested = heading && heading.length >= 3 ? heading : "";
      return {
        ...prev,
        source_section: v,
        title: prev.title || suggested,
      };
    });
  };

  const load = async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (reqType) params.set("requirement_type", reqType);
    if (mustType) params.set("must_type", mustType);
    try {
      const d = await api.get(
        `/api/requirements${params.toString() ? "?" + params : ""}`
      );
      setItems(d.items || []);
      setTotal(d.total || 0);
    } catch (err) {
      setError(err.message);
      notify.error(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const create = async (e) => {
    e.preventDefault();
    setFormError(null);
    setBusy(true);
    try {
      const payload = { ...form };
      Object.keys(payload).forEach((k) => {
        if (payload[k] === "") payload[k] = null;
      });
      if (payload.source_document_id)
        payload.source_document_id = Number(payload.source_document_id);
      await api.post("/api/requirements", payload);
      setForm(EMPTY);
      setCreating(false);
      notify.success("Requirement created successfully");
      await load();
    } catch (err) {
      setFormError(err.message);
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
              <ListChecks className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#222321]">
                Requirements ({total})
              </h1>
              <p className="text-xs text-[#706E66] mt-0.5">
                The catalogue of what employees must know, do, or acknowledge
              </p>
            </div>
          </div>

          <button
            onClick={creating ? () => setCreating(false) : openCreate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-olive-600 hover:bg-olive-700 text-white text-xs font-semibold rounded-full shadow-2xs transition-all shrink-0 cursor-pointer"
          >
            {creating ? (
              <>
                <X className="w-4 h-4" /> Cancel
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> New requirement
              </>
            )}
          </button>
        </div>

        {/* GENERAL ERROR ALERT */}
        {error && (
          <div className="flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* CREATE REQUIREMENT CARD */}
        {creating && (
          <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
            <div className="mb-4">
              <h2 className="text-base font-bold text-[#222321]">
                New Requirement
              </h2>
              <p className="text-xs text-[#706E66] mt-0.5">
                Start by picking the source document — the section list,
                requirement type, code and title suggestion will populate
                automatically.
              </p>
            </div>

            {formError && (
              <div className="mb-4 flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={create} className="space-y-4">
              {/* Step 1 — source */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#555248] mb-1.5">
                    Source document <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.source_document_id}
                    onChange={(e) => onDocSelect(e.target.value)}
                    required
                    className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-4 py-2.5 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all cursor-pointer"
                  >
                    <option value="">Pick a document</option>
                    {docs.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.doc_code} — {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#555248] mb-1.5">
                    Source section
                  </label>
                  {form.source_document_id ? (
                    sectionsBusy ? (
                      <div className="px-4 py-2.5 text-xs text-[#8C8A81] bg-[#F8F7F2] rounded-full border border-[#E2DDD0]">
                        Loading sections...
                      </div>
                    ) : sections.length > 0 ? (
                      <select
                        value={form.source_section}
                        onChange={(e) => onSectionSelect(e.target.value)}
                        className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-4 py-2.5 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all cursor-pointer"
                      >
                        <option value="">Pick a section</option>
                        {sections.map((s) => {
                          const val = s.section_number || s.chunk_code;
                          const label = s.section_number
                            ? `§${s.section_number}${
                                s.heading ? ` — ${s.heading}` : ""
                              }`
                            : s.heading || s.chunk_code;
                          return (
                            <option key={val} value={val}>
                              {label}
                            </option>
                          );
                        })}
                      </select>
                    ) : (
                      <input
                        value={form.source_section}
                        onChange={update("source_section")}
                        placeholder="e.g. 4.2"
                        className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] placeholder-[#8C8A81] px-4 py-2.5 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
                      />
                    )
                  ) : (
                    <div className="px-4 py-2.5 text-xs text-[#8C8A81] bg-[#F8F7F2] rounded-full border border-[#E2DDD0]">
                      Pick a document first
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2 — main details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-[#555248]">
                      Title <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-[#8C8A81]">
                      What the employee must know / do
                    </span>
                  </div>
                  <input
                    value={form.title}
                    onChange={update("title")}
                    required
                    className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-4 py-2.5 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-[#555248]">
                      Must type
                    </label>
                    <span className="text-[10px] text-[#8C8A81]">
                      How is completion measured?
                    </span>
                  </div>
                  <select
                    value={form.must_type}
                    onChange={update("must_type")}
                    className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-4 py-2.5 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all cursor-pointer"
                  >
                    {MUST_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-[#555248]">
                      Type
                    </label>
                    <span className="text-[10px] text-[#8C8A81]">
                      Auto-set from source doc
                    </span>
                  </div>
                  <select
                    value={form.requirement_type}
                    onChange={update("requirement_type")}
                    className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-4 py-2.5 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all cursor-pointer"
                  >
                    {REQUIREMENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#555248] mb-1.5">
                    Priority
                  </label>
                  <select
                    value={form.priority}
                    onChange={update("priority")}
                    className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-4 py-2.5 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all cursor-pointer"
                  >
                    {PRIORITIES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#555248] mb-1.5">
                    Due stage
                  </label>
                  <select
                    value={form.due_stage}
                    onChange={update("due_stage")}
                    className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-4 py-2.5 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all cursor-pointer"
                  >
                    <option value="">—</option>
                    {DUE_STAGES.map((t) => (
                      <option key={t} value={t}>
                        {t.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-[#555248]">
                      Code <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-[#8C8A81]">
                      Auto-numbered
                    </span>
                  </div>
                  <input
                    value={form.req_code}
                    onChange={update("req_code")}
                    required
                    className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-4 py-2.5 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#555248] mb-1.5">
                  Description (optional)
                </label>
                <textarea
                  value={form.description}
                  onChange={update("description")}
                  rows={2}
                  className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] p-3 rounded-2xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
                />
              </div>

              <div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-xs font-medium text-olive-600 hover:text-olive-700 cursor-pointer"
                  onClick={() => setShowAdvanced((v) => !v)}
                >
                  {showAdvanced ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" /> Hide advanced fields
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" /> Show advanced
                      fields (competency, assessment topic)
                    </>
                  )}
                </button>
              </div>

              {showAdvanced && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#E2DDD0]/60">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold text-[#555248]">
                        Competency
                      </label>
                    </div>
                    <input
                      value={form.competency}
                      onChange={update("competency")}
                      placeholder="e.g. Customer escalation handling"
                      className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] placeholder-[#8C8A81] px-4 py-2.5 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
                    />
                    <p className="text-[10px] text-[#8C8A81] mt-1">
                      Named skill this requirement builds — used for progress
                      reports.
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold text-[#555248]">
                        Assessment topic
                      </label>
                    </div>
                    <input
                      value={form.assessment_topic}
                      onChange={update("assessment_topic")}
                      placeholder="e.g. Data privacy basics"
                      className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] placeholder-[#8C8A81] px-4 py-2.5 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
                    />
                    <p className="text-[10px] text-[#8C8A81] mt-1">
                      Groups related quiz/assessment questions — free text.
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="px-5 py-2.5 bg-olive-600 hover:bg-olive-700 disabled:opacity-50 text-white text-xs font-semibold rounded-full transition-all shadow-2xs cursor-pointer"
                >
                  {busy ? "Creating..." : "Create Requirement"}
                </button>
              </div>
            </form>
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
            <div className="lg:col-span-5 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C8A81]" />
              <input
                placeholder="Search by code or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] placeholder-[#8C8A81] pl-9 pr-4 py-2.5 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
              />
            </div>

            <div className="lg:col-span-2.5">
              <select
                value={reqType}
                onChange={(e) => setReqType(e.target.value)}
                className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-4 py-2.5 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all appearance-none cursor-pointer"
              >
                <option value="">All types</option>
                {REQUIREMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2.5">
              <select
                value={mustType}
                onChange={(e) => setMustType(e.target.value)}
                className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-4 py-2.5 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all appearance-none cursor-pointer"
              >
                <option value="">All must-types</option>
                {MUST_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-olive-600 hover:bg-olive-700 text-white text-xs font-semibold rounded-full transition-all shadow-2xs cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5" /> Filter
              </button>
            </div>
          </form>
        </div>

        {/* REQUIREMENTS TABLE */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs">
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
                    Type
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
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-8 text-center text-[#8C8A81]"
                    >
                      No requirements found. Create one to define what employees
                      must know, do, or acknowledge.
                    </td>
                  </tr>
                ) : (
                  items.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-[#F8F7F2]/60 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono text-[11px] font-bold text-[#555248]">
                        {r.req_code}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-[#222321]">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-olive-600 shrink-0" />
                          <span>{r.title}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[#555248] capitalize">
                        {r.requirement_type
                          ? r.requirement_type.replace(/_/g, " ")
                          : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${
                            MUST_STYLE[r.must_type] ||
                            "bg-stone-100 text-stone-700 border-stone-200"
                          }`}
                        >
                          {(r.must_type || "—").replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {r.is_mandatory_derived ? (
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
                            PRIORITY_STYLE[r.priority] ||
                            "bg-stone-100 text-stone-700 border-stone-200"
                          }`}
                        >
                          {r.priority || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[#555248]">
                        {r.due_stage ? r.due_stage.replace(/_/g, " ") : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-[#555248]">
                        {r.source_document_id ? (
                          <div className="inline-flex items-center gap-1.5 text-stone-600">
                            <FileText className="w-3.5 h-3.5 text-olive-600" />
                            <span className="font-mono text-[11px]">
                              #{r.source_document_id}
                              {r.source_section
                                ? ` §${r.source_section}`
                                : ""}
                            </span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to={`/admin/requirements/${r.id}`}
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