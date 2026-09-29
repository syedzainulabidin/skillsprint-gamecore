import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, Mail, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Alert, Button, Field, Input } from "../../components/UI";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from || "/dashboard";

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const me = await login(email, password);
      const target =
        me.system_role === "admin" || me.system_role === "training_manager"
          ? "/admin"
          : from;
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
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
              Sign in to your account
            </h1>
            <p className="text-xs sm:text-sm text-charcoal/70 font-light">
              Access your onboarding workspace and ground-truth verification
              tools.
            </p>
          </div>

          {/* CARD CONTAINER */}
          <div className="bg-white border border-cream-200 p-6 sm:p-8 rounded-sm shadow-sm">
            {error && (
              <div className="mb-6">
                <Alert type="error">{error}</Alert>
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-5">
              <Field label="Email Address">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal/40">
                    <Mail className="w-4 h-4" />
                  </div>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="name@company.com"
                    className="pl-9 bg-cream-50/50 border-cream-200 focus:border-olive-700 focus:ring-olive-700 text-charcoal placeholder:text-charcoal/40 text-sm py-2.5 rounded-sm"
                  />
                </div>
              </Field>

              <Field label="Password">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal/40">
                    <Lock className="w-4 h-4" />
                  </div>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
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
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-cream-200 text-center text-xs text-charcoal/70">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-olive-700 font-semibold hover:underline"
              >
                Create account
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
