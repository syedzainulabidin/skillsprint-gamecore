import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  Bell,
  Briefcase,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import { api } from "../../lib/api";
import { notify } from "../../lib/toast";
import Layout from "../../components/Layout";

const PRIORITY_STYLE = {
  high: "bg-rose-100/80 text-rose-800 border-rose-200/80",
  medium: "bg-amber-100/80 text-amber-900 border-amber-200/80",
  low: "bg-[#EFECE3] text-[#555248] border-[#E2DDD0]",
};

const STATUS_STYLE = {
  pending: "bg-olive-600/15 text-[#323F35] border-[#4A5D4E]/25",
  completed: "bg-emerald-100/80 text-emerald-800 border-emerald-200/80",
  dismissed: "bg-stone-100 text-stone-600 border-stone-200",
};

export default function Notifications() {
  const [plans, setPlans] = useState([]);
  const [recs, setRecs] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api
      .get("/api/plans")
      .then(async (d) => {
        const list = d.items || [];
        setPlans(list);
        const results = await Promise.all(
          list.map((p) =>
            api
              .get(`/api/plans/${p.id}/recommendations`)
              .catch(() => ({ items: [] })),
          ),
        );
        const map = {};
        list.forEach((p, i) => {
          map[p.id] = results[i].items || [];
        });
        setRecs(map);
      })
      .catch((err) => {
        setError(err.message);
        notify.error(err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const regenerate = async (planId) => {
    setBusy(true);
    try {
      await api.post(`/api/plans/${planId}/recommendations/generate`);
      notify.success("Recommendations refreshed.");
      load();
    } catch (err) {
      setError(err.message);
      notify.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const update = async (recId, status) => {
    setBusy(true);
    try {
      await api.put(`/api/recommendations/${recId}`, { status });
      notify.info(`Marked ${status}.`);
      load();
    } catch (err) {
      setError(err.message);
      notify.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout mode="employee">
      <div className="space-y-6">
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-olive-600/10 border border-olive-600/20 flex items-center justify-center text-olive-600 shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#222321]">
                Recommendations
              </h1>
              <p className="text-xs text-[#706E66] mt-0.5">
                Adaptive suggestions based on your quiz and assessment
                performance
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
            Loading recommendations...
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-8 shadow-2xs text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-olive-600/10 flex items-center justify-center text-olive-600 mb-3">
              <Bell className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-[#222321] mb-1">
              No plans assigned yet
            </h2>
            <p className="text-xs text-[#706E66]">
              Recommendations will appear here once you have an active
              onboarding plan.
            </p>
          </div>
        ) : (
          plans.map((p) => {
            const rs = recs[p.id] || [];
            return (
              <div
                key={p.id}
                className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs"
              >
                {/* PLAN HEADER */}
                <div className="px-6 pt-5 pb-3 border-b border-[#E2DDD0] bg-[#F8F7F2]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-mono font-bold text-[#706E66] mb-0.5">
                      {p.plan_code}
                    </div>
                    <h2 className="text-sm font-bold text-[#222321] flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-olive-600" />
                      {p.job_role_name || "Onboarding"}
                    </h2>
                  </div>
                  <button
                    onClick={() => regenerate(p.id)}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#EFECE3] hover:bg-[#E2DDD0] text-[#555248] text-xs font-semibold rounded-full transition-all shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                  </button>
                </div>

                <div className="p-6">
                  {rs.length === 0 ? (
                    <div className="text-center py-6">
                      <Sparkles className="w-8 h-8 mx-auto text-olive-600/60 mb-2" />
                      <p className="text-sm font-medium text-[#222321]">
                        No recommendations right now
                      </p>
                      <p className="text-[11px] text-[#8C8A81] mt-1">
                        Complete a module or a quiz — the engine will suggest
                        follow-ups if needed.
                      </p>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {rs.map((r) => (
                        <li
                          key={r.id}
                          className="rounded-2xl border border-[#E2DDD0] bg-[#F8F7F2]/40 px-4 py-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span
                                  className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${
                                    PRIORITY_STYLE[r.priority] ||
                                    "bg-stone-100 text-stone-700 border-stone-200"
                                  }`}
                                >
                                  {r.priority}
                                </span>
                                <span className="text-sm font-semibold text-[#222321] capitalize">
                                  {r.recommendation_type.replace(/_/g, " ")}
                                </span>
                                <span
                                  className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${
                                    STATUS_STYLE[r.status] ||
                                    "bg-stone-100 text-stone-700 border-stone-200"
                                  }`}
                                >
                                  {r.status}
                                </span>
                              </div>
                              <div className="text-sm text-[#555248]">
                                {r.reason}
                              </div>
                            </div>
                            {r.status === "pending" && (
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => update(r.id, "completed")}
                                  disabled={busy}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-olive-600 hover:bg-olive-700 text-white text-[11px] font-semibold rounded-full transition-all shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <CheckCircle2 className="w-3 h-3" /> Done
                                </button>
                                <button
                                  onClick={() => update(r.id, "dismissed")}
                                  disabled={busy}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#EFECE3] hover:bg-[#E2DDD0] text-[#555248] text-[11px] font-semibold rounded-full transition-all disabled:opacity-50"
                                >
                                  <X className="w-3 h-3" /> Dismiss
                                </button>
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Layout>
  );
}
