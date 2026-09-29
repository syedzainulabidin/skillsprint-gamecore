import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../../lib/api";
import Layout from "../../../components/Layout";
import {
  Briefcase,
  ArrowLeft,
  PlusCircle,
  AlertCircle,
  Building2,
  FileText,
  Loader2,
} from "lucide-react";

export default function CreateRoles() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", department: "", description: "" });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const created = await api.post("/api/job-roles", {
        name: form.name.trim(),
        department: form.department.trim() || null,
        description: form.description.trim() || null,
      });
      navigate(`/admin/roles/${created.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout mode="admin">
      <div className="space-y-6 max-w-4xl mx-auto">
        
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-olive-600/10 border border-olive-600/20 flex items-center justify-center text-olive-600 shrink-0">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#222321]">
                New Job Role
              </h1>
              <p className="text-xs text-[#706E66] mt-0.5">
                Define a new position designation and department assignment
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

        {/* FORM CARD */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
          <form onSubmit={submit} className="space-y-5">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* NAME FIELD */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#555248] flex items-center gap-1">
                  Role Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C8A81]" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="e.g. Lead Frontend Engineer"
                    className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] pl-9 pr-3.5 py-2.5 rounded-2xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
                  />
                </div>
              </div>

              {/* DEPARTMENT FIELD */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#555248]">
                  Department
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C8A81]" />
                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    placeholder="e.g. Software Engineering"
                    className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] pl-9 pr-3.5 py-2.5 rounded-2xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* DESCRIPTION FIELD */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#555248] flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-[#8C8A81]" /> Description
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Outline core responsibilities and expectations for this role..."
                className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] p-3.5 rounded-2xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all resize-y"
              />
            </div>

            {/* ACTIONS */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-olive-600 hover:bg-olive-700 disabled:bg-stone-300 text-white text-xs font-semibold rounded-full transition-all shadow-2xs cursor-pointer disabled:cursor-not-allowed"
              >
                {busy ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Create role</span>
                  </>
                )}
              </button>

              <Link
                to="/admin/roles"
                className="px-5 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
              >
                Cancel
              </Link>
            </div>

          </form>
        </div>

      </div>
    </Layout>
  );
}