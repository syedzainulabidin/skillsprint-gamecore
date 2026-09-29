import { useState } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  KeyRound,
  Lock,
  Mail,
  Save,
  Shield,
  User,
  UserCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { notify } from "../../lib/toast";
import Layout from "../../components/Layout";

export default function Profile() {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({ current_password: "", new_password: "" });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.put("/api/users/me/password", form);
      setForm({ current_password: "", new_password: "" });
      notify.success("Password updated. Use it next time you sign in.");
      await refresh();
    } catch (err) {
      setError(err.message);
      notify.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!user) {
    return (
      <Layout mode="employee">
        <div className="text-sm text-[#8C8A81]">Loading profile...</div>
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
              <UserCircle className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#222321]">
                Profile
              </h1>
              <p className="text-xs text-[#706E66] mt-0.5">
                Your account details and password
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* DETAILS CARD */}
          <div className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs">
            <div className="px-6 pt-5 pb-3 border-b border-[#E2DDD0] bg-[#F8F7F2]/40">
              <h2 className="text-sm font-bold text-[#222321] flex items-center gap-2">
                <User className="w-4 h-4 text-olive-600" /> Account details
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-[#E2DDD0]">
                <div className="w-12 h-12 rounded-full bg-olive-600 text-white flex items-center justify-center text-lg font-bold shrink-0">
                  {(user.name || "U").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-[#222321] truncate">
                    {user.name}
                  </div>
                  <div className="text-[11px] text-[#8C8A81] truncate">
                    {user.email}
                  </div>
                </div>
              </div>
              <dl className="space-y-3 text-sm">
                <DetailRow icon={User} label="Employee ID">
                  <span className="font-mono text-[11px] text-[#555248]">
                    {user.employee_id || "—"}
                  </span>
                </DetailRow>
                <DetailRow icon={Mail} label="Email">
                  <span className="text-[#555248]">{user.email}</span>
                </DetailRow>
                <DetailRow icon={Shield} label="System role">
                  <span className="inline-block px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border bg-olive-600/15 text-[#323F35] border-[#4A5D4E]/25">
                    {user.system_role}
                  </span>
                </DetailRow>
                <DetailRow icon={Building2} label="Department">
                  <span className="text-[#555248]">
                    {user.department || "—"}
                  </span>
                </DetailRow>
              </dl>
            </div>
          </div>

          {/* PASSWORD CARD */}
          <div className="bg-white border border-[#E2DDD0] rounded-[28px] overflow-hidden shadow-2xs">
            <div className="px-6 pt-5 pb-3 border-b border-[#E2DDD0] bg-[#F8F7F2]/40">
              <h2 className="text-sm font-bold text-[#222321] flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-olive-600" /> Change password
              </h2>
              <p className="text-[11px] text-[#706E66] mt-0.5">
                Minimum 8 characters. Use something unique to this workspace.
              </p>
            </div>
            <div className="p-6">
              {error && (
                <div className="mb-4 flex items-center gap-2.5 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}
              <form onSubmit={submit} className="space-y-4">
                <FieldGroup label="Current password" required>
                  <PasswordInput
                    value={form.current_password}
                    onChange={(e) =>
                      setForm({ ...form, current_password: e.target.value })
                    }
                    autoComplete="current-password"
                  />
                </FieldGroup>
                <FieldGroup label="New password" required>
                  <PasswordInput
                    value={form.new_password}
                    onChange={(e) =>
                      setForm({ ...form, new_password: e.target.value })
                    }
                    autoComplete="new-password"
                  />
                </FieldGroup>
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={busy}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-olive-600 hover:bg-olive-700 text-white text-xs font-semibold rounded-full shadow-2xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    {busy ? "Updating..." : "Update password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function DetailRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-olive-600/10 flex items-center justify-center text-olive-600 shrink-0">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <dt className="text-[10px] font-bold uppercase tracking-wider text-[#706E66]">
          {label}
        </dt>
        <dd className="text-sm">{children}</dd>
      </div>
    </div>
  );
}

function FieldGroup({ label, required, children }) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#706E66] mb-1.5">
        {label}
        {required && <span className="text-rose-600 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function PasswordInput(props) {
  return (
    <div className="relative">
      <Lock className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C8A81]" />
      <input
        type="password"
        minLength={8}
        required
        placeholder="••••••••"
        {...props}
        className="w-full bg-[#F8F7F2] text-xs text-[#2C2C2A] placeholder-[#8C8A81] pl-9 pr-4 py-2.5 rounded-full border border-[#E2DDD0] focus:outline-none focus:ring-2 focus:ring-olive-600/30 transition-all"
      />
    </div>
  );
}
