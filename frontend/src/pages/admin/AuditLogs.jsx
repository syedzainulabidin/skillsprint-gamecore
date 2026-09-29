import { useEffect, useState } from "react";
import {
  AlertCircle,
  Filter,
  Globe,
  History,
  Search,
  User as UserIcon,
} from "lucide-react";
import { api } from "../../lib/api";
import { notify } from "../../lib/toast";
import Layout from "../../components/Layout";

// Colour cues by action prefix — keeps the log skimmable.
function actionTone(action) {
  const a = (action || "").toLowerCase();
  if (
    a.includes("delete") ||
    a.includes("retire") ||
    a.includes("archive") ||
    a.includes("reject")
  )
    return "bg-rose-100/80 text-rose-800 border-rose-200/80";
  if (
    a.includes("create") ||
    a.includes("upload") ||
    a.includes("generate") ||
    a.includes("release") ||
    a.includes("assign")
  )
    return "bg-olive-600/15 text-[#323F35] border-[#4A5D4E]/25";
  if (a.includes("update") || a.includes("edit") || a.includes("supersede"))
    return "bg-amber-100/80 text-amber-900 border-amber-200/80";
  return "bg-stone-100 text-stone-700 border-stone-200";
}

export default function AuditLogs() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);
  const [action, setAction] = useState("");
  const [entity, setEntity] = useState("");

  const load = () => {
    const params = new URLSearchParams({ limit: "200" });
    if (action) params.set("action", action);
    if (entity) params.set("entity_type", entity);
    api
      .get(`/api/audit-logs?${params.toString()}`)
      .then((d) => {
        setItems(d.items || []);
        setTotal(d.total || 0);
      })
      .catch((err) => {
        setError(err.message);
        notify.error(err.message);
      });
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Layout mode="admin">
      <div className="space-y-6">
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-olive-600/10 border border-olive-600/20 flex items-center justify-center text-olive-600 shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#222321]">
                Audit Log ({total})
              </h1>
              <p className="text-xs text-[#706E66] mt-0.5">
                Immutable timeline of every mutating action across the platform
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

        {/* FILTER */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-4 shadow-2xs">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              load();
            }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C8A81]" />
              <input
                placeholder="Action contains (e.g. plan.generate)"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] placeholder-[#8C8A81] pl-9 pr-4 py-2.5 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
              />
            </div>
            <div className="relative flex-1">
              <input
                placeholder="Entity type (e.g. document, plan, user)"
                value={entity}
                onChange={(e) => setEntity(e.target.value)}
                className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] placeholder-[#8C8A81] px-4 py-2.5 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
              />
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-olive-600 hover:bg-olive-700 text-white text-xs font-semibold rounded-full transition-all shadow-2xs cursor-pointer shrink-0"
            >
              <Filter className="w-3.5 h-3.5" /> Filter
            </button>
          </form>
        </div>

        {/* TABLE */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F7F2] border-b border-[#E2DDD0]">
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                    Time
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                    User
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                    Action
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                    Entity
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                    Details
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                    IP
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DDD0]/60 text-xs">
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-[#8C8A81]"
                    >
                      No audit entries match this filter.
                    </td>
                  </tr>
                ) : (
                  items.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-[#F8F7F2]/60 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-[#8C8A81] font-mono text-[11px] whitespace-nowrap">
                        {r.created_at
                          ? new Date(r.created_at).toLocaleString()
                          : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-[#555248]">
                        <div className="inline-flex items-center gap-1.5">
                          <UserIcon className="w-3.5 h-3.5 text-olive-600" />
                          <span className="font-mono text-[11px]">
                            {r.user_id ? `#${r.user_id}` : "system"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[10px] font-mono font-semibold rounded-full border ${actionTone(
                            r.action,
                          )}`}
                        >
                          {r.action}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[#555248] font-mono text-[11px]">
                        {r.entity_type}
                        {r.entity_id ? ` #${r.entity_id}` : ""}
                      </td>
                      <td className="px-5 py-3.5 text-[#555248] max-w-xs truncate">
                        {r.details || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-[#8C8A81] font-mono text-[11px]">
                        {r.ip_address ? (
                          <div className="inline-flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {r.ip_address}
                          </div>
                        ) : (
                          "—"
                        )}
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
