import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../../lib/api";
import Layout from "../../../components/Layout";
import {
  Briefcase,
  ArrowLeft,
  Save,
  AlertCircle,
  Building2,
  FileText,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ShieldAlert,
  ListChecks,
  Loader2,
} from "lucide-react";

export default function RoleDetails() {
  const { roleId } = useParams();
  const [role, setRole] = useState(null);
  const [matrix, setMatrix] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setError(null);
    try {
      const r = await api.get(`/api/job-roles/${roleId}`);
      setRole(r);
      const m = await api.get(`/api/role-matrix/roles/${roleId}`);
      setMatrix(m);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, [roleId]);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.put(`/api/job-roles/${roleId}`, {
        name: role.name,
        department: role.department || null,
        description: role.description || null,
        is_active: role.is_active,
      });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!role)
    return (
      <Layout mode="admin">
        <div className="space-y-4 max-w-5xl mx-auto">
          {error && (
            <div className="flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}
          <div className="flex items-center justify-center p-12 bg-white/80 border border-[#E2DDD0] rounded-[28px]">
            <div className="flex items-center gap-2 text-xs font-medium text-[#706E66]">
              <Loader2 className="w-4 h-4 animate-spin text-olive-600" />
              <span>Loading role details...</span>
            </div>
          </div>
        </div>
      </Layout>
    );

  return (
    <Layout mode="admin">
      <div className="space-y-6 max-w-5xl mx-auto">
        
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-olive-600/10 border border-olive-600/20 flex items-center justify-center text-olive-600 shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#222321]">
                {role.name}
              </h1>
              <p className="text-xs text-[#706E66] mt-0.5">
                Job Role ID: <span className="font-mono text-[#222321]">{roleId}</span>
              </p>
            </div>
          </div>

          <Link
            to="/admin/roles"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#F8F7F2] hover:bg-[#EAE6DB] border border-[#E2DDD0] text-[#222321] text-xs font-semibold rounded-full transition-all shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to roles
          </Link>
        </div>

        {/* ERROR DISPLAY */}
        {error && (
          <div className="flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* EDIT FORM CARD */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E2DDD0]">
            <FileText className="w-4 h-4 text-olive-600" />
            <h2 className="text-sm font-bold text-[#222321]">Edit Role Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* NAME FIELD */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#555248]">Role Name</label>
              <input
                type="text"
                value={role.name || ""}
                onChange={(e) => setRole({ ...role, name: e.target.value })}
                className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-3.5 py-2.5 rounded-2xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
                placeholder="e.g. Senior Software Engineer"
              />
            </div>

            {/* DEPARTMENT FIELD */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#555248]">Department</label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C8A81]" />
                <input
                  type="text"
                  value={role.department || ""}
                  onChange={(e) => setRole({ ...role, department: e.target.value })}
                  className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] pl-9 pr-3.5 py-2.5 rounded-2xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
                  placeholder="e.g. Engineering"
                />
              </div>
            </div>
          </div>

          {/* DESCRIPTION FIELD */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#555248]">Description</label>
            <textarea
              rows={3}
              value={role.description || ""}
              onChange={(e) => setRole({ ...role, description: e.target.value })}
              className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] p-3.5 rounded-2xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all resize-y"
              placeholder="Provide a detailed description of responsibilities..."
            />
          </div>

          {/* ACTIVE STATUS TOGGLE */}
          <div className="flex items-center gap-2 pt-1">
            <label className="text-xs text-[#555248] font-semibold flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={role.is_active || false}
                onChange={(e) => setRole({ ...role, is_active: e.target.checked })}
                className="w-4 h-4 rounded border-[#E2DDD0] text-olive-600 focus:ring-olive-600/30 cursor-pointer"
              />
              Role Active
            </label>
          </div>

          {/* SAVE BUTTON */}
          <div className="pt-2">
            <button
              onClick={save}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-olive-600 hover:bg-olive-700 disabled:bg-stone-300 text-white text-xs font-semibold rounded-full transition-all shadow-2xs cursor-pointer disabled:cursor-not-allowed"
            >
              {busy ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save changes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* MATRIX REQUIREMENTS CARD */}
        {matrix && (
          <div className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs">
            <div className="p-6 border-b border-[#E2DDD0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-olive-600" />
                <h2 className="text-sm font-bold text-[#222321]">Requirements Matrix</h2>
              </div>
              <span className="text-xs font-medium text-[#706E66] bg-[#F8F7F2] border border-[#E2DDD0] px-3 py-1 rounded-full w-fit">
                <strong className="text-rose-700 font-semibold">{matrix.mandatory_count}</strong> mandatory / {matrix.total_count} total
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8F7F2] border-b border-[#E2DDD0]">
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">Code</th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">Title</th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">Must Type</th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">Mandatory</th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">Priority</th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66]">Due Stage</th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#706E66] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2DDD0]/60 text-xs">
                  {matrix.cells.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-[#8C8A81]">
                        No requirements assigned to this role yet.
                      </td>
                    </tr>
                  ) : (
                    matrix.cells.map((c) => (
                      <tr key={c.requirement_id} className="hover:bg-[#F8F7F2]/60 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-[11px] font-semibold text-[#555248]">
                          {c.req_code}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-[#222321]">
                          {c.title}
                        </td>
                        <td className="px-5 py-3.5 text-[#555248]">
                          {c.must_type || "—"}
                        </td>
                        <td className="px-5 py-3.5">
                          {c.is_mandatory ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-100/80 border border-rose-200/80 px-2 py-0.5 rounded-full">
                              <ShieldAlert className="w-3 h-3 text-rose-600" /> Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full">
                              <XCircle className="w-3 h-3 text-stone-400" /> No
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 font-medium text-[#555248]">
                          {c.effective_priority}
                        </td>
                        <td className="px-5 py-3.5 text-[#555248]">
                          {c.effective_due_stage || "—"}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Link
                            to={`/admin/requirements/${c.requirement_id}`}
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
        )}

      </div>
    </Layout>
  );
}