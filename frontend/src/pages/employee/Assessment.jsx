import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Info,
  MessageSquare,
  ShieldCheck,
  Target,
  XCircle,
} from "lucide-react";
import { api } from "../../lib/api";
import { notify } from "../../lib/toast";
import Layout from "../../components/Layout";

export default function Assessment() {
  const { planId, assessmentId } = useParams();
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);
  const [priorAttempt, setPriorAttempt] = useState(null);

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
  if (!assessment) {
    return (
      <Layout mode="employee">
        <div className="flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>Assessment not found in this plan.</span>
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
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#222321]">
                {assessment.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="inline-block px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border bg-olive-600/15 text-[#323F35] border-[#4A5D4E]/25 capitalize">
                  {(assessment.assessment_type || "").replace(/_/g, " ")}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#555248] bg-[#EFECE3] border border-[#E2DDD0] px-2 py-0.5 rounded-full">
                  Pass ≥ {assessment.passing_score}%
                </span>
              </div>
            </div>
          </div>

          <Link
            to={`/onboarding/${planId}`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#EFECE3] hover:bg-[#E2DDD0] text-[#555248] text-xs font-semibold rounded-full transition-all shrink-0 cursor-pointer self-start"
          >
            <ArrowLeft className="w-4 h-4" /> Back to plan
          </Link>
        </div>

        {/* RESULT / STATUS ALERT */}
        {priorAttempt ? (
          <div
            className={`flex items-start gap-3 p-4 rounded-2xl border ${
              priorAttempt.passed
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-amber-50 border-amber-200 text-amber-900"
            }`}
          >
            {priorAttempt.passed ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="text-sm font-semibold">
                Your supervisor has scored this assessment
              </div>
              <div className="text-sm mt-1">
                <b>{priorAttempt.percentage}%</b> —{" "}
                {priorAttempt.passed ? "Passed" : "Not passed"}
              </div>
              {priorAttempt.notes && (
                <div className="mt-2 pt-2 border-t border-current/20 text-sm">
                  <div className="text-[11px] font-bold uppercase tracking-wider opacity-80 mb-1">
                    Supervisor notes
                  </div>
                  <div>{priorAttempt.notes}</div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 p-4 rounded-2xl border bg-amber-50 border-amber-200 text-amber-900">
            <Info className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <div className="text-sm font-semibold mb-1">
                Awaiting supervisor review
              </div>
              <div className="text-sm">
                You don't score this yourself. Your supervisor will evaluate
                you against the rubric criteria below and record a final score.
                The result will appear here.
              </div>
            </div>
          </div>
        )}

        {/* DESCRIPTION */}
        {assessment.description && (
          <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#706E66] mb-2 flex items-center gap-1.5">
              <MessageSquare className="w-3 h-3 text-olive-600" /> About this
              assessment
            </div>
            <p className="text-sm text-[#555248]">{assessment.description}</p>
          </div>
        )}

        {/* RUBRIC */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs">
          <div className="px-6 pt-5 pb-3 border-b border-[#E2DDD0] bg-[#F8F7F2]/40">
            <h2 className="text-sm font-bold text-[#222321] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-olive-600" /> What you'll be
              evaluated on
            </h2>
            <p className="text-[11px] text-[#706E66] mt-0.5">
              Each row is one criterion your supervisor will use. Read the
              expected performance so you know what "good" looks like.
            </p>
          </div>
          <div className="p-6 space-y-3">
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
                <div className="space-y-1">
                  {r.expected_performance && (
                    <div className="text-sm text-[#555248]">
                      <b className="text-[#222321]">Expected:</b>{" "}
                      {r.expected_performance}
                    </div>
                  )}
                  {r.pass_condition && (
                    <div className="text-sm text-[#555248]">
                      <b className="text-[#222321]">Pass condition:</b>{" "}
                      {r.pass_condition}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
