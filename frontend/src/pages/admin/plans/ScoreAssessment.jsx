import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Info,
  Save,
  ShieldCheck,
  Target,
  User,
  XCircle,
} from "lucide-react";
import { api } from "../../../lib/api";
import { notify } from "../../../lib/toast";
import Layout from "../../../components/Layout";

export default function ScoreAssessment() {
  const { planId, assessmentId } = useParams();
  const [plan, setPlan] = useState(null);
  const [scores, setScores] = useState({});
  const [notes, setNotes] = useState("");
  const [priorAttempt, setPriorAttempt] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    api
      .get(`/api/plans/${planId}`)
      .then(setPlan)
      .catch((err) => {
        setError(err.message);
        notify.error(err.message);
      });
  }, [planId]);

  useEffect(() => {
    if (!assessmentId) return;
    api
      .get(`/api/assessments/${assessmentId}/attempts`)
      .then((r) => setPriorAttempt((r.items || [])[0] || null))
      .catch(() => {});
  }, [assessmentId]);

  const assessment =
    plan && plan.assessments.find((a) => String(a.id) === String(assessmentId));
  const locked = Boolean(priorAttempt || result);
  const shown = result || priorAttempt;

  // Live weighted-preview so the reviewer sees the projected % as they type.
  const previewPercent = useMemo(() => {
    if (!assessment || locked) return null;
    const rubric = assessment.rubric || [];
    if (rubric.length === 0) return null;
    let totalWeight = 0;
    let scoreSum = 0;
    let anyEntered = false;
    for (const r of rubric) {
      const s = Number(scores[r.id]);
      const w = Number(r.weight) || 0;
      totalWeight += w;
      if (Number.isFinite(s) && scores[r.id] !== "" && scores[r.id] !== undefined) {
        scoreSum += s * w;
        anyEntered = true;
      }
    }
    if (!anyEntered || totalWeight === 0) return null;
    return Math.round(scoreSum / totalWeight);
  }, [assessment, scores, locked]);

  const submit = async () => {
    if (
      !confirm(
        "Submit these scores?\n\n" +
          "This is final — once recorded the assessment can't be re-scored on the same plan.",
      )
    )
      return;
    setBusy(true);
    setError(null);
    try {
      const rubric_scores = assessment.rubric.map((r) => ({
        rubric_id: r.id,
        score: Number(scores[r.id] || 0),
      }));
      const res = await api.post(`/api/assessments/${assessmentId}/attempts`, {
        rubric_scores,
        notes: notes || null,
      });
      setResult(res);
      notify.success(
        `Score submitted: ${res.percentage}% ${res.passed ? "(Passed)" : "(Not passed)"}`,
      );
    } catch (err) {
      setError(err.message);
      notify.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!plan) {
    return (
      <Layout mode="admin">
        <div className="space-y-6">
          {error && (
            <div className="flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}
          <div className="text-sm text-[#8C8A81]">Loading assessment...</div>
        </div>
      </Layout>
    );
  }

  if (!assessment) {
    return (
      <Layout mode="admin">
        <div className="flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>Assessment not found in this plan.</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout mode="admin">
      <div className="space-y-6">
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-olive-600/10 border border-olive-600/20 flex items-center justify-center text-olive-600 shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono font-bold text-[#706E66] mb-0.5">
                {plan.plan_code}
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#222321]">
                Score assessment
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-[#555248]">
                <span className="font-semibold text-[#222321]">
                  {assessment.title}
                </span>
                <span className="text-[#8C8A81]">·</span>
                <span className="inline-flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-olive-600" />
                  {plan.employee_name}
                </span>
              </div>
            </div>
          </div>

          <Link
            to={`/admin/plans/${planId}`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#EFECE3] hover:bg-[#E2DDD0] text-[#555248] text-xs font-semibold rounded-full transition-all shrink-0 cursor-pointer self-start"
          >
            <ArrowLeft className="w-4 h-4" /> Back to plan
          </Link>
        </div>

        {/* ERROR ALERT */}
        {error && (
          <div className="flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* RESULT ALERT */}
        {shown && (
          <div
            className={`flex items-center gap-3 p-4 rounded-2xl border ${
              shown.passed
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-amber-50 border-amber-200 text-amber-900"
            }`}
          >
            {shown.passed ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            ) : (
              <XCircle className="w-5 h-5 shrink-0 text-amber-600" />
            )}
            <div className="flex-1">
              <div className="text-sm font-semibold">
                Final score: {shown.percentage}% —{" "}
                {shown.passed ? "Passed" : "Not passed"}
              </div>
              {!result && priorAttempt && (
                <div className="text-[11px] mt-0.5 opacity-80">
                  Already submitted earlier
                </div>
              )}
            </div>
          </div>
        )}

        {/* ASSESSMENT META */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white border border-[#E2DDD0] rounded-2xl p-4 shadow-2xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#706E66] mb-1">
              Type
            </div>
            <div className="text-sm font-semibold text-[#222321] capitalize">
              {assessment.assessment_type
                ? assessment.assessment_type.replace(/_/g, " ")
                : "—"}
            </div>
          </div>
          <div className="bg-white border border-[#E2DDD0] rounded-2xl p-4 shadow-2xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#706E66] mb-1">
              Pass threshold
            </div>
            <div className="text-sm font-semibold text-[#222321] font-mono">
              {assessment.passing_score}%
            </div>
          </div>
          <div className="bg-white border border-[#E2DDD0] rounded-2xl p-4 shadow-2xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#706E66] mb-1">
              Preview score
            </div>
            <div className="text-sm font-semibold text-[#222321] font-mono">
              {previewPercent != null ? `${previewPercent}%` : "—"}
            </div>
            <div className="text-[11px] text-[#8C8A81] mt-0.5">
              Live weighted rollup as you type
            </div>
          </div>
        </div>

        {/* DESCRIPTION */}
        {assessment.description && (
          <div className="bg-white border border-[#E2DDD0] rounded-2xl p-4 shadow-2xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#706E66] mb-1">
              About this assessment
            </div>
            <p className="text-sm text-[#555248]">{assessment.description}</p>
          </div>
        )}

        {/* RUBRIC CARD */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs">
          <div className="px-6 pt-5 pb-3 border-b border-[#E2DDD0] bg-[#F8F7F2]/40">
            <h2 className="text-sm font-bold text-[#222321] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-olive-600" /> Rubric —
              supervisor scoring
            </h2>
            <p className="text-[11px] text-[#706E66] mt-0.5">
              Enter a score from <b>0 to 100</b> for each criterion based on the
              employee's performance. The <i>weight</i> is fixed at generation
              time and controls how the criteria roll up into the final
              percentage. Save when done — one submission only.
            </p>
          </div>
          <div className="p-6 space-y-4">
            {assessment.rubric.map((r, idx) => (
              <div
                key={r.id}
                className="rounded-2xl border border-[#E2DDD0] bg-[#F8F7F2]/40 p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-olive-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <div className="text-sm font-semibold text-[#222321]">
                      {r.criterion}
                    </div>
                  </div>
                  <div className="text-[10px] font-mono font-bold text-[#555248] bg-white border border-[#E2DDD0] rounded-full px-2.5 py-0.5 shrink-0">
                    weight {r.weight}
                  </div>
                </div>

                <div className="space-y-1 mb-3">
                  {r.expected_performance && (
                    <div className="text-xs text-[#555248]">
                      <b className="text-[#222321]">Expected:</b>{" "}
                      {r.expected_performance}
                    </div>
                  )}
                  {r.pass_condition && (
                    <div className="text-xs text-[#555248]">
                      <b className="text-[#222321]">Pass condition:</b>{" "}
                      {r.pass_condition}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#706E66] shrink-0">
                    Employee's score (0–100)
                  </label>
                  <div className="w-28">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={scores[r.id] ?? ""}
                      disabled={locked}
                      placeholder="—"
                      onChange={(e) =>
                        setScores((prev) => ({ ...prev, [r.id]: e.target.value }))
                      }
                      className="w-full bg-white text-sm text-[#2C2C2A] placeholder-[#8C8A81] font-mono text-center px-3 py-2 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all disabled:bg-[#F8F7F2] disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 pb-6">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#706E66] mb-1.5">
              Reviewer notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={locked}
              rows={3}
              placeholder="Anything the employee should know about this evaluation."
              className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] placeholder-[#8C8A81] px-4 py-2.5 rounded-2xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all resize-none disabled:cursor-not-allowed"
            />

            {!locked && (
              <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2 text-[11px] text-[#706E66]">
                  <Info className="w-3.5 h-3.5 text-olive-600 mt-0.5 shrink-0" />
                  <span>
                    Submitting is final. If the score is wrong, retire this plan
                    and generate a new one to reassess.
                  </span>
                </div>
                <button
                  onClick={submit}
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-olive-600 hover:bg-olive-700 text-white text-xs font-semibold rounded-full shadow-2xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  <Save className="w-4 h-4" />
                  {busy ? "Saving..." : "Submit final score"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
