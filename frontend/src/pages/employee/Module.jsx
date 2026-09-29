import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  ListChecks,
  Save,
  ShieldCheck,
  Sparkles,
  Timer,
  XCircle,
} from "lucide-react";
import { api } from "../../lib/api";
import { notify } from "../../lib/toast";
import Layout from "../../components/Layout";

export default function Module() {
  const { planId, moduleId } = useParams();
  const [plan, setPlan] = useState(null);
  const [status, setStatus] = useState("in_progress");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Quiz state
  const [quizPicks, setQuizPicks] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [quizBusy, setQuizBusy] = useState(false);
  const [priorAttempts, setPriorAttempts] = useState({});

  useEffect(() => {
    api
      .get(`/api/plans/${planId}`)
      .then(setPlan)
      .catch((err) => {
        setError(err.message);
        notify.error(err.message);
      });
  }, [planId]);

  const module =
    plan && plan.modules.find((m) => String(m.id) === String(moduleId));
  const quizzes =
    plan && module
      ? plan.quizzes.filter((q) => q.module_id === module.id)
      : [];

  useEffect(() => {
    if (quizzes.length === 0) return;
    let cancelled = false;
    Promise.all(
      quizzes.map((q) =>
        api
          .get(`/api/quizzes/${q.id}/attempts`)
          .then((r) => [q.id, (r.items || [])[0] || null])
          .catch(() => [q.id, null]),
      ),
    ).then((rows) => {
      if (cancelled) return;
      const map = {};
      rows.forEach(([id, first]) => {
        if (first) map[id] = first;
      });
      setPriorAttempts(map);
    });
    return () => {
      cancelled = true;
    };
  }, [quizzes.map((q) => q.id).join(",")]);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.post(`/api/modules/${moduleId}/completion`, {
        status,
        notes,
      });
      notify.success("Progress saved.");
    } catch (err) {
      setError(err.message);
      notify.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const togglePick = (qid, oid, multiple) => {
    setQuizPicks((prev) => {
      const current = prev[qid] || [];
      let next;
      if (multiple) {
        next = current.includes(oid)
          ? current.filter((x) => x !== oid)
          : [...current, oid];
      } else {
        next = [oid];
      }
      return { ...prev, [qid]: next };
    });
  };

  const submitQuiz = async (quiz) => {
    setQuizBusy(true);
    setError(null);
    try {
      const answers = quiz.questions.map((qu) => ({
        question_id: qu.id,
        option_ids: quizPicks[qu.id] || [],
      }));
      const res = await api.post(`/api/quizzes/${quiz.id}/attempts`, {
        answers,
      });
      setQuizResult({ quizId: quiz.id, ...res });
      notify.success(
        `Quiz submitted — ${res.percentage}% ${res.passed ? "(Passed)" : "(Not passed)"}`,
      );
    } catch (err) {
      setError(err.message);
      notify.error(err.message);
    } finally {
      setQuizBusy(false);
    }
  };

  if (error && !plan) {
    return (
      <Layout mode="employee">
        <div className="flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      </Layout>
    );
  }
  if (!plan) {
    return (
      <Layout mode="employee">
        <div className="text-sm text-[#8C8A81]">Loading...</div>
      </Layout>
    );
  }
  if (!module) {
    return (
      <Layout mode="employee">
        <div className="flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>Module not found in this plan.</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout mode="employee">
      <div className="space-y-6">
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-olive-600/10 border border-olive-600/20 flex items-center justify-center text-olive-600 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono font-bold text-[#706E66] mb-0.5">
                {module.module_code}
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#222321]">
                {module.title}
              </h1>
            </div>
          </div>

          <Link
            to={`/onboarding/${planId}`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#EFECE3] hover:bg-[#E2DDD0] text-[#555248] text-xs font-semibold rounded-full transition-all shrink-0 cursor-pointer self-start"
          >
            <ArrowLeft className="w-4 h-4" /> Back to plan
          </Link>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* MODULE INFO */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
          <div className="space-y-3">
            {module.purpose && (
              <InfoRow icon={Sparkles} label="Purpose">
                {module.purpose}
              </InfoRow>
            )}
            {module.key_concepts && (
              <InfoRow icon={ListChecks} label="Key concepts">
                {module.key_concepts}
              </InfoRow>
            )}
            {module.estimated_minutes && (
              <InfoRow icon={Timer} label="Estimated">
                {module.estimated_minutes} min
              </InfoRow>
            )}
            {module.completion_criteria && (
              <InfoRow icon={ShieldCheck} label="Completion">
                {module.completion_criteria}
              </InfoRow>
            )}
            <InfoRow icon={FileText} label="Source">
              <span className="font-mono text-[11px]">
                #{module.source_document_id || "?"}
                {module.source_section && ` §${module.source_section}`}
              </span>
            </InfoRow>
          </div>

          {module.objectives?.length > 0 && (
            <div className="mt-5 pt-4 border-t border-[#E2DDD0]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#706E66] mb-2">
                Objectives
              </div>
              <ol className="space-y-1.5">
                {module.objectives.map((o, i) => (
                  <li
                    key={o.id}
                    className="flex items-start gap-2 text-sm text-[#555248]"
                  >
                    <span className="w-5 h-5 rounded-full bg-olive-600/10 text-olive-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{o.text}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {module.activities?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[#E2DDD0]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#706E66] mb-2">
                Activities
              </div>
              <ol className="space-y-1.5">
                {module.activities.map((a, i) => (
                  <li
                    key={a.id}
                    className="flex items-start gap-2 text-sm text-[#555248]"
                  >
                    <span className="w-5 h-5 rounded-full bg-olive-600/10 text-olive-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{a.description}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* PROGRESS FORM */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs">
          <div className="px-6 pt-5 pb-3 border-b border-[#E2DDD0] bg-[#F8F7F2]/40">
            <h2 className="text-sm font-bold text-[#222321] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-olive-600" /> Mark my
              progress
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FieldGroup label="Status">
                <SelectPill
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="not_started">Not started</option>
                  <option value="in_progress">In progress</option>
                  <option value="completed">Completed</option>
                  <option value="skipped">Skipped</option>
                </SelectPill>
              </FieldGroup>
              <div className="md:col-span-2">
                <FieldGroup label="Notes (optional)">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Anything you want to remember about this module."
                    className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] placeholder-[#8C8A81] px-4 py-2.5 rounded-2xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all resize-none"
                  />
                </FieldGroup>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={save}
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-olive-600 hover:bg-olive-700 text-white text-xs font-semibold rounded-full shadow-2xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" /> {busy ? "Saving..." : "Save progress"}
              </button>
            </div>
          </div>
        </div>

        {/* QUIZZES */}
        {quizzes.length > 0 && (
          <div className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs">
            <div className="px-6 pt-5 pb-3 border-b border-[#E2DDD0] bg-[#F8F7F2]/40">
              <h2 className="text-sm font-bold text-[#222321] flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-olive-600" /> Quizzes
                for this module
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {quizzes.map((quiz) => {
                const prior = priorAttempts[quiz.id];
                const fresh =
                  quizResult && quizResult.quizId === quiz.id
                    ? quizResult
                    : null;
                const locked = Boolean(prior || fresh);
                const shownScore = fresh || prior;
                return (
                  <div
                    key={quiz.id}
                    className="rounded-2xl border border-[#E2DDD0] bg-[#F8F7F2]/40 p-5"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="text-sm font-semibold text-[#222321]">
                          {quiz.title}
                        </div>
                        <div className="text-[11px] text-[#8C8A81] mt-0.5">
                          Pass ≥ {quiz.passing_score}% · One attempt only.
                          Review your answers before submitting.
                        </div>
                      </div>
                    </div>

                    {shownScore && (
                      <div
                        className={`flex items-center gap-2 p-3 rounded-2xl border mb-3 ${
                          shownScore.passed
                            ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                            : "bg-amber-50 border-amber-200 text-amber-900"
                        }`}
                      >
                        {shownScore.passed ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                        ) : (
                          <XCircle className="w-4 h-4 shrink-0 text-amber-600" />
                        )}
                        <div className="text-sm font-semibold">
                          Score: {shownScore.percentage}% —{" "}
                          {shownScore.passed ? "Passed" : "Not passed"}
                          {prior && !fresh && (
                            <span className="text-[11px] font-normal opacity-80">
                              {" "}
                              (submitted earlier)
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {quiz.questions.map((qu, qi) => {
                        const multi = qu.question_type === "multiple_response";
                        const picks = quizPicks[qu.id] || [];
                        return (
                          <div key={qu.id}>
                            <div className="text-sm text-[#222321] mb-2">
                              <span className="font-bold">Q{qi + 1}.</span>{" "}
                              {qu.prompt_text}{" "}
                              <span className="text-[#8C8A81] text-[11px]">
                                ({qu.question_type.replace(/_/g, " ")},{" "}
                                {qu.points} pt)
                              </span>
                            </div>
                            <ul className="space-y-1.5">
                              {qu.options.map((opt) => {
                                const checked = picks.includes(opt.id);
                                return (
                                  <li key={opt.id}>
                                    <label
                                      className={`flex items-start gap-2.5 px-3 py-2 rounded-2xl border cursor-pointer transition-all ${
                                        locked
                                          ? "border-[#E2DDD0] bg-white/40 text-[#8C8A81] cursor-not-allowed"
                                          : checked
                                            ? "border-olive-600 bg-olive-600/10 text-[#222321]"
                                            : "border-[#E2DDD0] bg-white text-[#555248] hover:border-olive-600/40"
                                      }`}
                                    >
                                      <input
                                        type={multi ? "checkbox" : "radio"}
                                        name={`q${qu.id}`}
                                        checked={checked}
                                        disabled={locked}
                                        onChange={() =>
                                          togglePick(qu.id, opt.id, multi)
                                        }
                                        className="mt-0.5 accent-olive-600 cursor-pointer disabled:cursor-not-allowed"
                                      />
                                      <span className="text-sm">
                                        {opt.text}
                                      </span>
                                    </label>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4">
                      {!locked ? (
                        <button
                          onClick={() => submitQuiz(quiz)}
                          disabled={quizBusy}
                          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-olive-600 hover:bg-olive-700 text-white text-xs font-semibold rounded-full shadow-2xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ClipboardCheck className="w-4 h-4" />
                          {quizBusy ? "Submitting..." : "Submit quiz (final)"}
                        </button>
                      ) : (
                        <p className="text-[11px] text-[#8C8A81] italic">
                          This quiz has been submitted and cannot be attempted
                          again.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <div className="w-6 h-6 rounded-full bg-olive-600/10 flex items-center justify-center text-olive-600 shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-[#706E66] mb-0.5">
          {label}
        </div>
        <div className="text-[#555248]">{children}</div>
      </div>
    </div>
  );
}

function FieldGroup({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#706E66] mb-1.5">
        {label}
      </label>
      {children}
    </div>
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
