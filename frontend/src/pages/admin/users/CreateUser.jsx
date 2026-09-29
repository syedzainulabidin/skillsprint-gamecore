import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../../lib/api";
import Layout from "../../../components/Layout";
import {
  ArrowLeft,
  UserPlus,
  IdCard,
  User,
  Mail,
  Lock,
  Shield,
  Briefcase,
  Building2,
  Award,
  MapPin,
  Calendar,
  UserCheck,
  FileText,
  AlertCircle,
  Loader2,
  Check,
} from "lucide-react";

const SYSTEM_ROLES = ["employee", "manager", "reviewer", "training_manager", "admin"];
const EXP = ["", "beginner", "intermediate", "advanced"];

const EMPTY = {
  employee_id: "",
  name: "",
  email: "",
  password: "",
  system_role: "employee",
  job_role_id: "",
  department: "",
  experience_level: "",
  location: "",
  joining_date: "",
  reporting_manager_id: "",
  previous_experience: "",
};

export default function CreateUser() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [roles, setRoles] = useState([]);
  const [managers, setManagers] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/api/job-roles?limit=200").then((d) => setRoles(d.items || []));
    api.get("/api/users?limit=200").then((d) => setManagers(d.items || []));
  }, []);

  const update = (k) => (e) => {
    const v = e.target.value;
    setForm((prev) => {
      const next = { ...prev, [k]: v };
      if (k === "job_role_id" && v) {
        const role = roles.find((r) => String(r.id) === String(v));
        if (role && role.department && !prev.department) {
          next.department = role.department;
        }
      }
      return next;
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const payload = { ...form };
      Object.keys(payload).forEach((k) => {
        if (payload[k] === "") payload[k] = null;
      });
      if (payload.job_role_id) payload.job_role_id = Number(payload.job_role_id);
      if (payload.reporting_manager_id)
        payload.reporting_manager_id = Number(payload.reporting_manager_id);
      const created = await api.post("/api/users", payload);
      navigate(`/admin/users/${created.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout mode="admin">
      <div className="space-y-6">
        
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-olive-600/10 border border-olive-600/20 flex items-center justify-center text-olive-600 shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#222321]">
                New User
              </h1>
              <p className="text-xs text-[#706E66] mt-0.5">
                Create a new user account and assign system permissions
              </p>
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
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* FORM CONTAINER */}
        <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-6 lg:p-8 shadow-2xs">
          <form onSubmit={submit} className="space-y-6">
            
            {/* SECTION 1: ACCOUNT CREDENTIALS */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 border-b border-[#E2DDD0] pb-2">
                Account Information & Credentials
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* EMPLOYEE ID */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-stone-700 flex items-center gap-1.5">
                    <IdCard className="w-3.5 h-3.5 text-olive-600" /> Employee ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.employee_id}
                    onChange={update("employee_id")}
                    required
                    placeholder="e.g. EMP-1024"
                    className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] placeholder-[#8C8A81] px-3.5 py-2.5 rounded-xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
                  />
                </div>

                {/* NAME */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-stone-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-olive-600" /> Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={update("name")}
                    required
                    placeholder="John Doe"
                    className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] placeholder-[#8C8A81] px-3.5 py-2.5 rounded-xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
                  />
                </div>

                {/* EMAIL */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-stone-700 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-olive-600" /> Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={update("email")}
                    required
                    placeholder="john.doe@company.com"
                    className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] placeholder-[#8C8A81] px-3.5 py-2.5 rounded-xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
                  />
                </div>

                {/* PASSWORD */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-stone-700 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-olive-600" /> Password <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-stone-400">Min 8 chars</span>
                  </div>
                  <input
                    type="password"
                    value={form.password}
                    onChange={update("password")}
                    minLength={8}
                    required
                    placeholder="••••••••"
                    className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] placeholder-[#8C8A81] px-3.5 py-2.5 rounded-xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: ROLE & ORGANIZATION */}
            <div className="space-y-4 pt-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 border-b border-[#E2DDD0] pb-2">
                Role & Organizational Mapping
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* SYSTEM ROLE */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-stone-700 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-olive-600" /> System Role
                  </label>
                  <select
                    value={form.system_role}
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
                    value={form.job_role_id}
                    onChange={update("job_role_id")}
                    className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-3.5 py-2.5 rounded-xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all cursor-pointer"
                  >
                    <option value="">— Select Job Role —</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} {r.department ? `(${r.department})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* DEPARTMENT */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-stone-700 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-olive-600" /> Department
                  </label>
                  <input
                    type="text"
                    value={form.department}
                    onChange={update("department")}
                    placeholder="Engineering / Sales"
                    className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] placeholder-[#8C8A81] px-3.5 py-2.5 rounded-xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
                  />
                </div>

                {/* EXPERIENCE LEVEL */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-stone-700 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-olive-600" /> Experience Level
                  </label>
                  <select
                    value={form.experience_level}
                    onChange={update("experience_level")}
                    className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-3.5 py-2.5 rounded-xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all cursor-pointer"
                  >
                    {EXP.map((l) => (
                      <option key={l} value={l}>
                        {l ? l.charAt(0).toUpperCase() + l.slice(1) : "— Select Level —"}
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
                    value={form.location}
                    onChange={update("location")}
                    placeholder="City, HQ, or Remote"
                    className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] placeholder-[#8C8A81] px-3.5 py-2.5 rounded-xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
                  />
                </div>

                {/* JOINING DATE */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-stone-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-olive-600" /> Joining Date
                  </label>
                  <input
                    type="date"
                    value={form.joining_date}
                    onChange={update("joining_date")}
                    className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-3.5 py-2.5 rounded-xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
                  />
                </div>

                {/* REPORTING MANAGER */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-semibold text-stone-700 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-olive-600" /> Reporting Manager
                  </label>
                  <select
                    value={form.reporting_manager_id}
                    onChange={update("reporting_manager_id")}
                    className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] px-3.5 py-2.5 rounded-xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all cursor-pointer"
                  >
                    <option value="">— Select Manager —</option>
                    {managers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 3: PREVIOUS EXPERIENCE */}
            <div className="space-y-1.5 pt-2 text-xs">
              <label className="font-semibold text-stone-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-olive-600" /> Previous Experience
              </label>
              <textarea
                value={form.previous_experience}
                onChange={update("previous_experience")}
                rows={3}
                placeholder="Brief summary of prior employment or expertise..."
                className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] placeholder-[#8C8A81] px-3.5 py-2.5 rounded-xl border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all resize-none"
              />
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-4 border-t border-[#E2DDD0] flex justify-end">
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-olive-600 hover:bg-olive-700 disabled:opacity-50 text-white text-xs font-semibold rounded-full shadow-2xs transition-all cursor-pointer"
              >
                {busy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Create User
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </Layout>
  );
}