import { useEffect, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Gauge,
  ListChecks,
  Target,
  TrendingUp,
} from "lucide-react";
import { api } from "../../lib/api";
import { notify } from "../../lib/toast";
import Layout from "../../components/Layout";

const ASSESSMENT_STYLE = {
  on_track: "bg-emerald-100/80 text-emerald-800 border-emerald-200/80",
  requires_attention: "bg-amber-100/80 text-amber-900 border-amber-200/80",
  behind_schedule: "bg-rose-100/80 text-rose-800 border-rose-200/80",
  assessment_required: "bg-olive-600/15 text-[#323F35] border-[#4A5D4E]/25",
  completed: "bg-olive-600/15 text-[#323F35] border-[#4A5D4E]/25",
};

export default function Progress() {
  const [plans, setPlans] = useState([]);
  const [progress, setProgress] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/plans")
      .then(async (d) => {
        const list = d.items || [];
        setPlans(list);
        const results = await Promise.all(
          list.map((p) =>
            api.get(`/api/plans/${p.id}/progress`).catch(() => null),
          ),
        );
        const map = {};
        list.forEach((p, i) => {
          if (results[i]) map[p.id] = results[i];
        });
        setProgress(map);
      })
      .catch((err) => {
        setError(err.message);
        notify.error(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout mode="employee">
      <div className="space-y-6">
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-olive-600/10 border border-olive-600/20 flex items-center justify-center text-olive-600 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#222321]">
                Progress
              </h1>
              <p className="text-xs text-[#706E66] mt-0.5">
                Where you stand across every module, task, quiz and assessment
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

        {loading ? (
          <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-8 shadow-2xs text-center text-sm text-[#8C8A81]">
            Loading progress...
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-8 shadow-2xs text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-olive-600/10 flex items-center justify-center text-olive-600 mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-[#222321] mb-1">
              No plans assigned yet
            </h2>
            <p className="text-xs text-[#706E66]">
              Your progress will show here once an administrator releases your
              plan.
            </p>
          </div>
        ) : (
          plans.map((p) => {
            const prog = progress[p.id];
            return (
              <div
                key={p.id}
                className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs"
              >
                {/* PLAN HEADER */}
                <div className="px-6 pt-5 pb-3 border-b border-[#E2DDD0] bg-[#F8F7F2]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-mono font-bold text-[#706E66] mb-0.5">
                      {p.plan_code}
                    </div>
                    <h2 className="text-sm font-bold text-[#222321] flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-olive-600" />
                      {p.job_role_name || "Onboarding"}
                    </h2>
                  </div>
                  {prog?.progress_assessment && (
                    <span
                      className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${
                        ASSESSMENT_STYLE[prog.progress_assessment] ||
                        "bg-stone-100 text-stone-700 border-stone-200"
                      }`}
                    >
                      {prog.progress_assessment.replace(/_/g, " ")}
                    </span>
                  )}
                </div>

                {prog ? (
                  <div className="p-6 space-y-5">
                    {/* OVERALL BAR */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#706E66] flex items-center gap-1.5">
                          <Gauge className="w-3 h-3 text-olive-600" /> Overall
                        </div>
                        <div className="text-xs font-mono text-[#555248]">
                          {Math.round(prog.overall_percentage)}%
                        </div>
                      </div>
                      <div className="w-full bg-[#F8F7F2] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-olive-600 h-2 transition-all"
                          style={{ width: `${prog.overall_percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* METRIC GRID */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <ProgressTile
                        icon={BookOpen}
                        label="Modules"
                        current={prog.modules_completed}
                        total={prog.modules_total}
                        percent={prog.module_percentage}
                      />
                      <ProgressTile
                        icon={ListChecks}
                        label="Tasks"
                        current={prog.tasks_completed}
                        total={prog.tasks_total}
                        percent={prog.task_percentage}
                      />
                      <ProgressTile
                        icon={ClipboardList}
                        label="Checklist"
                        current={prog.checklist_items_completed}
                        total={prog.checklist_items_total}
                        percent={prog.checklist_percentage}
                      />
                      <ScoreTile
                        icon={ClipboardCheck}
                        label="Quiz average"
                        score={prog.quiz_average}
                        attempted={prog.quizzes_attempted}
                        total={prog.quizzes_total}
                      />
                      <ScoreTile
                        icon={Target}
                        label="Assessment average"
                        score={prog.assessment_average}
                        attempted={prog.assessments_attempted}
                        total={prog.assessments_total}
                      />
                      <div className="bg-[#F8F7F2]/60 border border-[#E2DDD0] rounded-2xl p-4">
                        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#706E66] mb-1">
                          <AlertTriangle className="w-3 h-3 text-olive-600" />
                          Weak areas
                        </div>
                        <div className="text-2xl font-mono text-[#222321]">
                          {prog.weak_areas.length}
                        </div>
                        <div className="text-[11px] text-[#8C8A81] mt-0.5">
                          topics needing reinforcement
                        </div>
                      </div>
                    </div>

                    {/* WEAK AREAS */}
                    {prog.weak_areas.length > 0 && (
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#706E66] mb-2 flex items-center gap-1.5">
                          <AlertTriangle className="w-3 h-3 text-amber-700" />
                          Weak areas
                        </div>
                        <ul className="space-y-2">
                          {prog.weak_areas.map((w, i) => (
                            <li
                              key={i}
                              className="flex items-center gap-3 rounded-2xl border border-[#E2DDD0] bg-[#F8F7F2]/40 px-4 py-2.5"
                            >
                              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-[#222321]">
                                  {w.title}
                                </div>
                                <div className="text-[11px] text-[#8C8A81] capitalize">
                                  {(w.kind || "").replace(/_/g, " ")}
                                </div>
                              </div>
                              <span className="text-xs font-mono text-amber-800 bg-amber-100/80 border border-amber-200/80 px-2 py-0.5 rounded-full shrink-0">
                                {w.percentage}%
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 text-sm text-[#8C8A81]">
                    Loading progress...
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </Layout>
  );
}

function ProgressTile({ icon: Icon, label, current, total, percent }) {
  return (
    <div className="bg-[#F8F7F2]/60 border border-[#E2DDD0] rounded-2xl p-4">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#706E66] mb-1">
        <Icon className="w-3 h-3 text-olive-600" />
        {label}
      </div>
      <div className="text-lg font-mono text-[#222321]">
        {current ?? 0}
        <span className="text-[#8C8A81]">/{total ?? 0}</span>
      </div>
      <div className="mt-1.5 w-full bg-white h-1 rounded-full overflow-hidden">
        <div
          className="bg-olive-600 h-1"
          style={{ width: `${percent || 0}%` }}
        />
      </div>
    </div>
  );
}

function ScoreTile({ icon: Icon, label, score, attempted, total }) {
  return (
    <div className="bg-[#F8F7F2]/60 border border-[#E2DDD0] rounded-2xl p-4">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#706E66] mb-1">
        <Icon className="w-3 h-3 text-olive-600" />
        {label}
      </div>
      <div className="text-lg font-mono text-[#222321]">
        {score != null ? `${score}%` : "—"}
      </div>
      <div className="text-[11px] text-[#8C8A81] mt-0.5">
        {attempted ?? 0}/{total ?? 0} attempted
      </div>
    </div>
  );
}
