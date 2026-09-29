import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Info,
  Plus,
  Save,
  Settings as SettingsIcon,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import { api } from "../../lib/api";
import { notify } from "../../lib/toast";
import Layout from "../../components/Layout";
import { PRECEDENCE_SOURCE_TYPES } from "../../lib/enums";

export default function Settings() {
  const [rules, setRules] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [newRule, setNewRule] = useState({
    source_type: PRECEDENCE_SOURCE_TYPES[0],
    rank: 10,
    label: "",
  });
  const [edits, setEdits] = useState({});

  const load = () => {
    api
      .get("/api/precedence-rules?include_inactive=true")
      .then((d) => {
        const items = d.items || [];
        // Sort by rank so the visual ordering matches the priority ordering.
        items.sort((a, b) => (a.rank || 0) - (b.rank || 0));
        setRules(items);
        const e = {};
        items.forEach((r) => {
          e[r.id] = {
            rank: r.rank,
            label: r.label || "",
            is_active: r.is_active,
          };
        });
        setEdits(e);
      })
      .catch((err) => {
        setError(err.message);
        notify.error(err.message);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    setBusy(true);
    try {
      await api.post("/api/precedence-rules", {
        source_type: newRule.source_type,
        rank: Number(newRule.rank),
        label: newRule.label || null,
      });
      notify.success("Rule added.");
      setNewRule({
        source_type: PRECEDENCE_SOURCE_TYPES[0],
        rank: 10,
        label: "",
      });
      load();
    } catch (err) {
      setError(err.message);
      notify.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const saveRow = async (id) => {
    setBusy(true);
    try {
      const e = edits[id];
      await api.put(`/api/precedence-rules/${id}`, {
        rank: Number(e.rank),
        label: e.label || null,
        is_active: e.is_active,
      });
      notify.success("Rule saved.");
      load();
    } catch (err) {
      setError(err.message);
      notify.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const del = async (id) => {
    if (!confirm("Delete this rule? It will be removed from the precedence order."))
      return;
    setBusy(true);
    try {
      await api.del(`/api/precedence-rules/${id}`);
      notify.info("Rule deleted.");
      load();
    } catch (err) {
      setError(err.message);
      notify.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const editSet = (id, k, v) => {
    setEdits({ ...edits, [id]: { ...edits[id], [k]: v } });
  };

  const hasChanges = (id) => {
    const orig = rules.find((r) => r.id === id);
    const e = edits[id] || {};
    if (!orig) return false;
    return (
      Number(e.rank) !== orig.rank ||
      (e.label || "") !== (orig.label || "") ||
      !!e.is_active !== !!orig.is_active
    );
  };

  return (
    <Layout mode="admin">
      <div className="space-y-6">
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-olive-600/10 border border-olive-600/20 flex items-center justify-center text-olive-600 shrink-0">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#222321]">
                Settings — Policy Precedence
              </h1>
              <p className="text-xs text-[#706E66] mt-0.5">
                Controls which document wins when two sources contradict each
                other
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

        {/* EXPLAINER */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
          <h2 className="text-sm font-bold text-[#222321] mb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-olive-600" /> What this page does
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#555248]">
            <ExplainerCard
              icon={ShieldCheck}
              title="Source-of-truth ordering"
              body="When the validator detects two documents disagree — an SOP says the escalation SLA is 24 hours but an FAQ says 48 hours — it picks the document whose type has the lower rank here as authoritative. The higher-rank document is flagged as contradicting."
            />
            <ExplainerCard
              icon={CheckCircle2}
              title="Why it matters"
              body="Without this, the AI would have no rule for which of two conflicting sources to believe, and the validator couldn't score contradictions. Hard SRS requirement (Step 34), used on every plan validation."
            />
            <ExplainerCard
              icon={ArrowDown}
              title="How to edit"
              body="Lower rank = higher priority. Change a row's Rank and click Save to promote or demote a document type. Deactivate a rule to exclude that type from validation entirely."
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs">
          <div className="px-6 pt-5 pb-3 border-b border-[#E2DDD0] bg-[#F8F7F2]/40">
            <h2 className="text-sm font-bold text-[#222321] flex items-center gap-2">
              <ArrowDown className="w-4 h-4 text-olive-600" /> Precedence table
              — lower rank wins on conflict
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F7F2] border-b border-[#E2DDD0]">
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66] w-16">
                    Order
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                    Source type
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66] w-32">
                    Rank
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">
                    Label
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66] w-24">
                    Active
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66] text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DDD0]/60 text-xs">
                {rules.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-[#8C8A81]"
                    >
                      No precedence rules yet. Add one below to start.
                    </td>
                  </tr>
                ) : (
                  rules.map((r, idx) => {
                    const e = edits[r.id] || {};
                    const changed = hasChanges(r.id);
                    return (
                      <tr
                        key={r.id}
                        className={`transition-colors ${
                          e.is_active ? "" : "opacity-60 bg-stone-50/40"
                        } hover:bg-[#F8F7F2]/60`}
                      >
                        <td className="px-5 py-3.5">
                          <div className="w-7 h-7 rounded-full bg-olive-600/10 text-olive-600 text-[11px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-[#222321] capitalize">
                          {(r.source_type || "").replace(/_/g, " ")}
                        </td>
                        <td className="px-5 py-3.5">
                          <input
                            type="number"
                            value={e.rank ?? r.rank}
                            onChange={(ev) =>
                              editSet(r.id, "rank", ev.target.value)
                            }
                            className="w-20 bg-[#F8F7F2] text-xs font-mono text-center text-[#2C2C2A] px-3 py-2 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
                          />
                        </td>
                        <td className="px-5 py-3.5">
                          <input
                            value={e.label ?? ""}
                            onChange={(ev) =>
                              editSet(r.id, "label", ev.target.value)
                            }
                            placeholder="Optional label"
                            className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] placeholder-[#8C8A81] px-4 py-2 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
                          />
                        </td>
                        <td className="px-5 py-3.5">
                          <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={!!e.is_active}
                              onChange={(ev) =>
                                editSet(r.id, "is_active", ev.target.checked)
                              }
                              className="w-4 h-4 rounded border-[#E2DDD0] text-olive-600 focus:ring-olive-600/30 cursor-pointer"
                            />
                            {e.is_active ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600">
                                <XCircle className="w-3 h-3 text-stone-400" />
                                No
                              </span>
                            )}
                          </label>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="inline-flex items-center gap-2 justify-end">
                            <button
                              onClick={() => saveRow(r.id)}
                              disabled={busy || !changed}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                changed
                                  ? "bg-olive-600 hover:bg-olive-700 text-white shadow-2xs"
                                  : "bg-[#EFECE3] text-[#8C8A81]"
                              }`}
                            >
                              <Save className="w-3 h-3" /> Save
                            </button>
                            <button
                              onClick={() => del(r.id)}
                              disabled={busy}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 hover:text-rose-800 disabled:opacity-50"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ADD RULE */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs">
          <div className="px-6 pt-5 pb-3 border-b border-[#E2DDD0] bg-[#F8F7F2]/40">
            <h2 className="text-sm font-bold text-[#222321] flex items-center gap-2">
              <Plus className="w-4 h-4 text-olive-600" /> Add a new rule
            </h2>
            <p className="text-[11px] text-[#706E66] mt-0.5">
              Introduce a new source type into the precedence order.
            </p>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div className="sm:col-span-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#706E66] mb-1.5">
                Source type
              </label>
              <select
                value={newRule.source_type}
                onChange={(e) =>
                  setNewRule({ ...newRule, source_type: e.target.value })
                }
                className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-4 py-2.5 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all appearance-none cursor-pointer"
              >
                {PRECEDENCE_SOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#706E66] mb-1.5">
                Rank
              </label>
              <input
                type="number"
                value={newRule.rank}
                onChange={(e) =>
                  setNewRule({ ...newRule, rank: e.target.value })
                }
                className="w-full bg-[#F8F7F2] text-xs font-mono text-center text-[#2C2C2A] px-4 py-2.5 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#706E66] mb-1.5">
                Label (optional)
              </label>
              <input
                value={newRule.label}
                onChange={(e) =>
                  setNewRule({ ...newRule, label: e.target.value })
                }
                placeholder="e.g. Regional variant"
                className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] placeholder-[#8C8A81] px-4 py-2.5 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
              />
            </div>
            <div>
              <button
                onClick={create}
                disabled={busy}
                className="w-full inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-olive-600 hover:bg-olive-700 text-white text-xs font-semibold rounded-full shadow-2xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" /> Add rule
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function ExplainerCard({ icon: Icon, title, body }) {
  return (
    <div className="bg-[#F8F7F2]/60 border border-[#E2DDD0] rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-olive-600/10 flex items-center justify-center text-olive-600 shrink-0">
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-[#222321]">
          {title}
        </div>
      </div>
      <p className="leading-relaxed">{body}</p>
    </div>
  );
}
