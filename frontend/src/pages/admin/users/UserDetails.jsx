import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../../lib/api";
import Layout from "../../../components/Layout";
import {
  ArrowLeft,
  User,
  Shield,
  Briefcase,
  Building,
  MapPin,
  Calendar,
  UserCheck,
  Award,
  AlertTriangle,
  Save,
  UserX,
  Clock,
  Mail,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

const SYSTEM_ROLES = ["employee", "manager", "reviewer", "training_manager", "admin"];
const EXP = ["", "beginner", "intermediate", "advanced"];
const TS = [
  "not_started",
  "in_progress",
  "on_track",
  "requires_attention",
  "behind_schedule",
  "assessment_required",
  "completed",
];

export default function UserDetails() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [managers, setManagers] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setError(null);
    try {
      const u = await api.get(`/api/users/${userId}`);
      setUser(u);
      const jr = await api.get("/api/job-roles?limit=200");
      setRoles(jr.items || []);
      const mg = await api.get("/api/users?limit=200");
      setManagers((mg.items || []).filter((m) => m.id !== u.id));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, [userId]);

  const update = (k) => (e) => setUser({ ...user, [k]: e.target.value });

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.put(`/api/users/${userId}`, {
        name: user.name,
        system_role: user.system_role,
        job_role_id: user.job_role_id ? Number(user.job_role_id) : null,
        department: user.department || null,
        experience_level: user.experience_level || null,
        location: user.location || null,
        joining_date: user.joining_date || null,
        reporting_manager_id: user.reporting_manager_id
          ? Number(user.reporting_manager_id)
          : null,
        previous_experience: user.previous_experience || null,
        training_status: user.training_status,
      });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const deactivate = async () => {
    if (!confirm("Deactivate this user?")) return;
    setBusy(true);
    try {
      await api.del(`/api/users/${userId}`);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!user) {
    return (
      <Layout mode="admin">
        {error && (
          <div className="flex items-center gap-2.5 p-4 mb-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}
        <div className="flex items-center gap-3 p-8 bg-white border border-[#E2DDD0] rounded-[28px] text-xs font-medium text-stone-500">
          <Loader2 className="w-4 h-4 animate-spin text-olive-600" />
          <span>Loading user profile...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout mode="admin">
      <div className="space-y-6">
        
        {/* TOP HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-olive-600/10 border border-olive-600/20 flex items-center justify-center text-olive-600 font-bold text-lg shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-stone-100 border border-stone-200 rounded-full text-[11px] font-mono text-stone-600 mb-1">
                ID: {user.employee_id || "—"}
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#222321]">
                {user.name}
              </h1>
            </div>
          </div>

          <Link
            to="/admin/users"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#EFECE3] hover:bg-[#E2DDD0] text-stone-700 text-xs font-semibold rounded-full transition-all shrink-0"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Users
          </Link>
        </div>

        {/* ERROR DISPLAY */}
        {error && (
          <div className="flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT SIDEBAR: PROFILE METADATA */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-6 space-y-5 shadow-2xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 border-b border-[#E2DDD0] pb-3">
                Account Summary
              </h2>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-stone-400 text-[10px] uppercase font-semibold">Email</span>
                    <span className="font-medium text-[#222321] break-all">{user.email}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-stone-400 text-[10px] uppercase font-semibold">System Role</span>
                    <span className="inline-block mt-0.5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-olive-600/10 text-olive-600 border border-olive-600/20">
                      {user.system_role ? user.system_role.replace("_", " ") : "—"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  {user.is_active ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <span className="block text-stone-400 text-[10px] uppercase font-semibold">Account Status</span>
                    {user.is_active ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 border border-emerald-200/80 px-2 py-0.5 rounded-full mt-0.5">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-100/80 border border-rose-200/80 px-2 py-0.5 rounded-full mt-0.5">
                        Deactivated
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2 border-t border-stone-100">
                  <Clock className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <div>
                      <span className="block text-stone-400 text-[10px] uppercase font-semibold">Created At</span>
                      <span className="text-stone-600">{user.created_at || "—"}</span>
                    </div>
                    <div>
                      <span className="block text-stone-400 text-[10px] uppercase font-semibold">Last Updated</span>
                      <span className="text-stone-600">{user.updated_at || "—"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT MAIN PANEL: EDITABLE FIELDS */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-6 space-y-6 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#E2DDD0] pb-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Edit Profile Information
                </h2>
                <span className="text-[11px] text-stone-400">Modify details below and save</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* NAME */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-semibold text-stone-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-olive-600" /> Full Name
                  </label>
                  <input
                    type="text"
                    value={user.name || ""}
                    onChange={update("name")}
                    className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-3.5 py-2.5 rounded-xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
                  />
                </div>

                {/* SYSTEM ROLE */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-stone-700 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-olive-600" /> System Role
                  </label>
                  <select
                    value={user.system_role}
                    onChange={update("system_role")}
                    className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-3.5 py-2.5 rounded-xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all cursor-pointer"
                  >
                    {SYSTEM_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r.replace("_", " ").toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* JOB ROLE */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-stone-700 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-olive-600" /> Job Role
                  </label>
                  <select
                    value={user.job_role_id || ""}
                    onChange={update("job_role_id")}
                    className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-3.5 py-2.5 rounded-xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all cursor-pointer"
                  >
                    <option value="">— Select Job Role —</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* DEPARTMENT */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-stone-700 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-olive-600" /> Department
                  </label>
                  <input
                    type="text"
                    value={user.department || ""}
                    onChange={update("department")}
                    className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-3.5 py-2.5 rounded-xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
                  />
                </div>

                {/* EXPERIENCE LEVEL */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-stone-700 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-olive-600" /> Experience Level
                  </label>
                  <select
                    value={user.experience_level || ""}
                    onChange={update("experience_level")}
                    className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-3.5 py-2.5 rounded-xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all cursor-pointer"
                  >
                    {EXP.map((l) => (
                      <option key={l} value={l}>
                        {l ? l.charAt(0).toUpperCase() + l.slice(1) : "— Select Experience —"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* LOCATION */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-stone-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-olive-600" /> Location
                  </label>
                  <input
                    type="text"
                    value={user.location || ""}
                    onChange={update("location")}
                    className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-3.5 py-2.5 rounded-xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
                  />
                </div>

                {/* JOINING DATE */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-stone-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-olive-600" /> Joining Date
                  </label>
                  <input
                    type="date"
                    value={user.joining_date || ""}
                    onChange={update("joining_date")}
                    className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-3.5 py-2.5 rounded-xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
                  />
                </div>

                {/* REPORTING MANAGER */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-semibold text-stone-700 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-olive-600" /> Reporting Manager
                  </label>
                  <select
                    value={user.reporting_manager_id || ""}
                    onChange={update("reporting_manager_id")}
                    className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-3.5 py-2.5 rounded-xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all cursor-pointer"
                  >
                    <option value="">— Select Manager —</option>
                    {managers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PREVIOUS EXPERIENCE */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-semibold text-stone-700">Previous Experience</label>
                  <textarea
                    value={user.previous_experience || ""}
                    onChange={update("previous_experience")}
                    rows={3}
                    className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-3.5 py-2.5 rounded-xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all resize-none"
                    placeholder="Provide details about prior roles..."
                  />
                </div>

                {/* TRAINING STATUS */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-semibold text-stone-700">Training Status</label>
                  <select
                    value={user.training_status}
                    onChange={update("training_status")}
                    className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-3.5 py-2.5 rounded-xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all cursor-pointer"
                  >
                    {TS.map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ").toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-4 border-t border-[#E2DDD0] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={save}
                  disabled={busy}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-olive-600 hover:bg-olive-700 disabled:opacity-50 text-white text-xs font-semibold rounded-full shadow-2xs transition-all cursor-pointer"
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>

                {user.is_active && (
                  <button
                    type="button"
                    onClick={deactivate}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 text-xs font-semibold rounded-full transition-all cursor-pointer"
                  >
                    <UserX className="w-4 h-4" /> Deactivate
                  </button>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}