import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  Briefcase,
  ClipboardCheck,
  Layers,
  ListChecks,
  Target,
} from "lucide-react";
import { api } from "../../lib/api";
import { notify } from "../../lib/toast";
import Layout from "../../components/Layout";

const STATUS_STYLE = {
  released: "bg-olive-600/15 text-[#323F35] border-[#4A5D4E]/25",
  in_progress: "bg-olive-600/15 text-[#323F35] border-[#4A5D4E]/25",
  completed: "bg-emerald-100/80 text-emerald-800 border-emerald-200/80",
  archived: "bg-stone-100 text-stone-600 border-stone-200",
};

export default function Onboarding() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/plans")
      .then((d) => setItems(d.items || []))
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
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#222321]">
                My Onboarding Plans ({items.length})
              </h1>
              <p className="text-xs text-[#706E66] mt-0.5">
                Your personalised, source-cited onboarding journeys
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
            Loading your plans...
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-8 shadow-2xs text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-olive-600/10 flex items-center justify-center text-olive-600 mb-3">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-[#222321] mb-1">
              No plans assigned yet
            </h2>
            <p className="text-xs text-[#706E66] max-w-md mx-auto">
              Your onboarding plan is being prepared. Once an administrator
              releases it, it will appear here.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8F7F2] border-b border-[#E2DDD0]">
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                      Plan
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                      Role
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                      Status
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66] text-center">
                      Content
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66] text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2DDD0]/60 text-xs">
                  {items.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-[#F8F7F2]/60 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono text-[11px] font-bold text-[#555248]">
                        {p.plan_code}
                      </td>
                      <td className="px-5 py-3.5 text-[#222321]">
                        <div className="inline-flex items-center gap-1.5 font-semibold">
                          <Briefcase className="w-3.5 h-3.5 text-olive-600" />
                          {p.job_role_name || "—"}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${
                            STATUS_STYLE[p.status] ||
                            "bg-stone-100 text-stone-700 border-stone-200"
                          }`}
                        >
                          {(p.status || "—").replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-[#555248]">
                          <span
                            title="Modules"
                            className="inline-flex items-center gap-0.5"
                          >
                            <Layers className="w-3 h-3 text-olive-600" />
                            {p.module_count}
                          </span>
                          <span
                            title="Tasks"
                            className="inline-flex items-center gap-0.5"
                          >
                            <ListChecks className="w-3 h-3 text-olive-600" />
                            {p.task_count}
                          </span>
                          <span
                            title="Quizzes"
                            className="inline-flex items-center gap-0.5"
                          >
                            <ClipboardCheck className="w-3 h-3 text-olive-600" />
                            {p.quiz_count}
                          </span>
                          <span
                            title="Assessments"
                            className="inline-flex items-center gap-0.5"
                          >
                            <Target className="w-3 h-3 text-olive-600" />
                            {p.assessment_count}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to={`/onboarding/${p.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-olive-600 hover:text-olive-700 hover:underline"
                        >
                          Open <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
