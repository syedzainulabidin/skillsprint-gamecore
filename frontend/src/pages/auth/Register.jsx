import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Building,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Alert, Button, Field, Input } from "../../components/UI";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    employee_id: "",
    name: "",
    email: "",
    password: "",
    department: "",
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register({
        employee_id: form.employee_id.trim(),
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        department: form.department.trim() || null,
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 text-charcoal font-sans flex flex-col justify-between selection:bg-olive-700 selection:text-cream-50 overflow-x-hidden">
      {/* MINIMAL TOP BRANDING BAR */}
      <Header />

      {/* MAIN AUTHENTICATION CONTAINER */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 mt-20">
        <div className="w-full max-w-md">
          {/* HEADER BADGE & TITLE */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cream-100 border border-cream-200 rounded-full text-xs font-medium text-olive-600 mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-olive-700" />
              Secure System Authentication
            </div>
            <h1 className="text-2xl sm:text-3xl font-normal text-charcoal tracking-tight mb-2">
              Create an account
            </h1>
            <p className="text-xs sm:text-sm text-charcoal/70 font-light">
              Set up your employee workspace and verification credentials.
            </p>
          </div>

          {/* CARD CONTAINER */}
          <div className="bg-white border border-cream-200 p-6 sm:p-8 rounded-sm shadow-sm">
            {error && (
              <div className="mb-6">
                <Alert type="error">{error}</Alert>
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <span className="flex gap-2">
                <Field label="Employee ID">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal/40">
                      <User className="w-4 h-4" />
                    </div>
                    <Input
                      value={form.employee_id}
                      onChange={update("employee_id")}
                      required
                      placeholder="EMP-1024"
                      className="pl-9 bg-cream-50/50 border-cream-200 focus:border-olive-700 focus:ring-olive-700 text-charcoal placeholder:text-charcoal/40 text-sm py-2.5 rounded-sm"
                    />
                  </div>
                </Field>

                <Field label="Full Name">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal/40">
                      <User className="w-4 h-4" />
                    </div>
                    <Input
                      value={form.name}
                      onChange={update("name")}
                      required
                      placeholder="Jane Doe"
                      className="pl-9 bg-cream-50/50 border-cream-200 focus:border-olive-700 focus:ring-olive-700 text-charcoal placeholder:text-charcoal/40 text-sm py-2.5 rounded-sm"
                    />
                  </div>
                </Field>
              </span>

              <Field label="Email Address">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal/40">
                    <Mail className="w-4 h-4" />
                  </div>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={update("email")}
                    required
                    autoComplete="email"
                    placeholder="name@company.com"
                    className="pl-9 bg-cream-50/50 border-cream-200 focus:border-olive-700 focus:ring-olive-700 text-charcoal placeholder:text-charcoal/40 text-sm py-2.5 rounded-sm"
                  />
                </div>
              </Field>

              <Field label="Password" hint="Minimum 8 characters">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal/40">
                    <Lock className="w-4 h-4" />
                  </div>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={update("password")}
                    minLength={8}
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="pl-9 bg-cream-50/50 border-cream-200 focus:border-olive-700 focus:ring-olive-700 text-charcoal placeholder:text-charcoal/40 text-sm py-2.5 rounded-sm"
                  />
                </div>
              </Field>

              <Field label="Department (optional)">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal/40">
                    <Building className="w-4 h-4" />
                  </div>
                  <Input
                    value={form.department}
                    onChange={update("department")}
                    placeholder="Operations"
                    className="pl-9 bg-cream-50/50 border-cream-200 focus:border-olive-700 focus:ring-olive-700 text-charcoal placeholder:text-charcoal/40 text-sm py-2.5 rounded-sm"
                  />
                </div>
              </Field>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 bg-olive-700 hover:bg-olive-600 text-cream-50 py-2.5 font-medium text-sm rounded-sm transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>Creating account...</span>
                ) : (
                  <>
                    <span>Create account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-cream-200 text-center text-xs text-charcoal/70">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-olive-700 font-semibold hover:underline"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER LINKS */}
      <Footer />
    </div>
  );
}
