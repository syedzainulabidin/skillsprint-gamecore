import React from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Building2,
  Clock,
  ShieldCheck,
  FileText,
  HelpCircle,
  MessageSquare,
  Globe,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function Contact() {
  return (
    <div className="min-h-screen bg-cream-50 text-charcoal font-sans selection:bg-olive-700 selection:text-cream-50 overflow-x-hidden">
      {/* HEADER / NAVIGATION */}
      <Header />

      {/* HERO / PAGE TITLE */}
      <section className="pt-12 mt-20 sm:pt-16 pb-12 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto border-b border-cream-200">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cream-100 border border-cream-200 rounded-full text-xs font-medium text-olive-600 mb-6">
            <MessageSquare className="w-3.5 h-3.5 text-olive-700" />
            Communication & Directory
          </div>
          <h1 className="text-3xl sm:text-5xl font-normal tracking-tight text-charcoal leading-[1.15] mb-4">
            Get in Touch with SkillSprint AI
          </h1>
          <p className="text-base sm:text-lg text-charcoal/70 font-light leading-relaxed">
            Reach out to our governance, compliance, and enterprise support
            teams directly. We are here to assist with platform deployment,
            policy integration, and system audits.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <main className="py-12 sm:py-16 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto space-y-12">
        {/* DIRECT CONTACT DIRECTORY GRID */}
        <div>
          <h2 className="text-xs font-mono font-bold text-olive-700 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Mail className="w-4 h-4" /> Direct Communication Channels
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CARD 1: GENERAL & ENTERPRISE INQUIRIES */}
            <div className="bg-white border border-cream-200 p-6 sm:p-8 rounded-sm shadow-sm hover:border-olive-700/50 transition-colors">
              <div className="p-2.5 bg-cream-100 w-fit rounded-sm mb-5 text-olive-700">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-normal text-charcoal mb-2">
                Enterprise & Platform Inquiries
              </h3>
              <p className="text-xs sm:text-sm text-charcoal/70 font-light leading-relaxed mb-6">
                Questions regarding custom onboarding architecture, system
                integration, or corporate deployment setups.
              </p>
              <div className="pt-4 border-t border-cream-200 text-xs space-y-2">
                <div className="text-charcoal/60 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-olive-700" /> Mon - Fri,
                  9:00 AM - 6:00 PM EST
                </div>
              </div>
            </div>

            {/* CARD 2: COMPLIANCE & PRIVACY */}
            <div className="bg-white border border-cream-200 p-6 sm:p-8 rounded-sm shadow-sm hover:border-olive-700/50 transition-colors">
              <div className="p-2.5 bg-cream-100 w-fit rounded-sm mb-5 text-olive-700">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-normal text-charcoal mb-2">
                Governance & Compliance
              </h3>
              <p className="text-xs sm:text-sm text-charcoal/70 font-light leading-relaxed mb-6">
                Inquiries concerning ground-truth evaluation, data isolation,
                GDPR/HIPAA standards, or policy audits.
              </p>
              <div className="pt-4 border-t border-cream-200 text-xs space-y-2">
                <div className="text-charcoal/60 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-olive-700" /> Response
                  within 24 business hours
                </div>
              </div>
            </div>

            {/* CARD 3: TECHNICAL SUPPORT */}
            <div className="bg-white border border-cream-200 p-6 sm:p-8 rounded-sm shadow-sm hover:border-olive-700/50 transition-colors">
              <div className="p-2.5 bg-cream-100 w-fit rounded-sm mb-5 text-olive-700">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-normal text-charcoal mb-2">
                Technical & Tenant Support
              </h3>
              <p className="text-xs sm:text-sm text-charcoal/70 font-light leading-relaxed mb-6">
                Assistance with document parsing, vector indexing errors,
                role-based permissions, or system access.
              </p>
              <div className="pt-4 border-t border-cream-200 text-xs space-y-2">
                <div className="text-charcoal/60 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-olive-700" /> 24/7
                  Monitoring for active tenants
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* OFFICE & HEADQUARTERS ADDRESS CARDS */}
        <div>
          <h2 className="text-xs font-mono font-bold text-olive-700 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Global Headquarters & Locations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LOCATION 1 */}
            <div className="bg-white border border-cream-200 p-6 sm:p-8 rounded-sm shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-olive-700 uppercase font-semibold mb-2">
                  Primary Operations
                </div>
                <h3 className="text-xl font-normal text-charcoal mb-3">
                  SkillSprint AI Tech Hub
                </h3>
              </div>
              <div className="pt-4 border-t border-cream-200 text-xs text-charcoal/60">
                Corporate Identification:{" "}
                <span className="font-mono text-charcoal">SS-AI-89201-US</span>
              </div>
            </div>

            {/* LOCATION 2 */}
            <div className="bg-white border border-cream-200 p-6 sm:p-8 rounded-sm shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-olive-700 uppercase font-semibold mb-2">
                  Research & Dual-Pipeline Development
                </div>
                <h3 className="text-xl font-normal text-charcoal mb-3">
                  SkillSprint AI Engineering Lab
                </h3>
              </div>
              <div className="pt-4 border-t border-cream-200 text-xs text-charcoal/60">
                Validation Research Division:{" "}
                <span className="font-mono text-charcoal">GT-ENGINE-V2</span>
              </div>
            </div>
          </div>
        </div>

        {/* HELPFUL LINKS & DOCUMENTATION BANNER */}
        <div className="bg-cream-100/80 border border-cream-200 p-6 sm:p-8 rounded-sm shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-olive-700 uppercase">
                <Sparkles className="w-3.5 h-3.5" /> Self-Service Governance
              </div>
              <h3 className="text-xl font-normal text-charcoal">
                Looking for Policy or Term Documentation?
              </h3>
              <p className="text-sm text-charcoal/70 font-light leading-relaxed">
                Review our governance framework, ground-truth verification
                rules, and data handling protocols directly in our dedicated
                policy center.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <Link
                to="/terms"
                className="inline-flex items-center justify-center gap-2 bg-olive-700 text-cream-50 px-5 py-2.5 text-sm font-medium rounded-sm hover:bg-olive-600 transition-colors"
              >
                <FileText className="w-4 h-4" /> Terms of Service
              </Link>
              <Link
                to="/policy"
                className="inline-flex items-center justify-center gap-2 border border-charcoal/20 text-charcoal px-5 py-2.5 text-sm font-medium rounded-sm hover:bg-cream-50 transition-colors"
              >
                Privacy Policy <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
