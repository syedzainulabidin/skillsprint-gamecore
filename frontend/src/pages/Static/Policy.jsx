import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Database,
  Eye,
  Server,
  UserCheck,
  FileKey,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function Policy() {

  return (
    <div className="min-h-screen bg-cream-50 text-charcoal font-sans selection:bg-olive-700 selection:text-cream-50 overflow-x-hidden">
      {/* HEADER / NAVIGATION */}
      <Header />

      {/* HERO / PAGE TITLE */}
      <section className="pt-12 mt-20 sm:pt-16 pb-12 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto border-b border-cream-200">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cream-100 border border-cream-200 rounded-full text-xs font-medium text-olive-600 mb-6">
            <Lock className="w-3.5 h-3.5 text-olive-700" />
            Data Protection & Privacy Framework
          </div>
          <h1 className="text-3xl sm:text-5xl font-normal tracking-tight text-charcoal leading-[1.15] mb-4">
            Privacy Policy & Data Handling
          </h1>
          <p className="text-base sm:text-lg text-charcoal/70 font-light leading-relaxed">
            Learn how SkillSprint AI collects, isolates, processes, and safeguards corporate documentation, employee progress data, and generated onboarding content.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <main className="py-12 sm:py-16 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* QUICK NAVIGATION (STICKY SIDEBAR) */}
          <aside className="lg:col-span-4">
            <div className="bg-white border border-cream-200 p-6 rounded-sm sticky top-28 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-olive-700 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Policy Sections
              </h3>
              <nav className="space-y-2 text-xs font-medium text-charcoal/70">
                <a href="#data-collection" className="block p-2 rounded-sm hover:bg-cream-100 hover:text-olive-700 transition-colors">
                  1. Information We Collect
                </a>
                <a href="#tenant-isolation" className="block p-2 rounded-sm hover:bg-cream-100 hover:text-olive-700 transition-colors">
                  2. Tenant Data Isolation & AI Models
                </a>
                <a href="#document-parsing" className="block p-2 rounded-sm hover:bg-cream-100 hover:text-olive-700 transition-colors">
                  3. Document Parsing & Section Mapping
                </a>
                <a href="#ground-truth-logs" className="block p-2 rounded-sm hover:bg-cream-100 hover:text-olive-700 transition-colors">
                  4. Verification Logs & Compliance
                </a>
                <a href="#data-security" className="block p-2 rounded-sm hover:bg-cream-100 hover:text-olive-700 transition-colors">
                  5. Storage, Encryption & Retention
                </a>
                <a href="#user-rights" className="block p-2 rounded-sm hover:bg-cream-100 hover:text-olive-700 transition-colors">
                  6. Organizational Rights & Controls
                </a>
                <a href="#privacy-contact" className="block p-2 rounded-sm hover:bg-cream-100 hover:text-olive-700 transition-colors">
                  7. Privacy & Security Contact
                </a>
              </nav>

              <div className="mt-6 pt-6 border-t border-cream-200 text-xs text-charcoal/60 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-olive-700" />
                  <span>Zero Public Model Training</span>
                </div>
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-olive-700" />
                  <span>Encrypted at Rest & in Transit</span>
                </div>
              </div>
            </div>
          </aside>

          {/* POLICY CLAUSES */}
          <section className="lg:col-span-8 space-y-10 text-charcoal/80 font-light text-sm sm:text-base leading-relaxed">

            {/* SECTION 1 */}
            <div id="data-collection" className="bg-white border border-cream-200 p-6 sm:p-8 rounded-sm shadow-sm scroll-mt-28">
              <span className="text-xs font-mono font-bold text-olive-700 uppercase tracking-wider block mb-2">
                Section 01
              </span>
              <h2 className="text-xl sm:text-2xl font-normal text-charcoal mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-olive-700" /> Information We Collect
              </h2>
              <p className="mb-4">
                SkillSprint AI processes only the data strictly necessary to generate personalized onboarding itineraries and verify policy comprehension.
              </p>
              <div className="space-y-3 mb-4 text-xs sm:text-sm">
                <div className="p-3 bg-cream-50 border border-cream-200 rounded-sm">
                  <strong className="text-charcoal block mb-1">Uploaded Organizational Knowledge:</strong>
                  PDFs, DOCX files, SOPs, HR handbooks, and job role specifications uploaded by corporate administrators.
                </div>
                <div className="p-3 bg-cream-50 border border-cream-200 rounded-sm">
                  <strong className="text-charcoal block mb-1">Employee Account & Role Data:</strong>
                  Names, corporate email addresses, assigned job roles, department tags, and supervisor assignments.
                </div>
                <div className="p-3 bg-cream-50 border border-cream-200 rounded-sm">
                  <strong className="text-charcoal block mb-1">Onboarding Analytics & Assessments:</strong>
                  Task completion timestamps, quiz results, coverage verification logs, and manual review history.
                </div>
              </div>
            </div>

            {/* SECTION 2 */}
            <div id="tenant-isolation" className="bg-white border border-cream-200 p-6 sm:p-8 rounded-sm shadow-sm scroll-mt-28">
              <span className="text-xs font-mono font-bold text-olive-700 uppercase tracking-wider block mb-2">
                Section 02
              </span>
              <h2 className="text-xl sm:text-2xl font-normal text-charcoal mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-olive-700" /> Tenant Data Isolation & AI Models
              </h2>
              <p className="mb-4">
                We enforce strict tenant boundaries. Corporate documentation uploaded to your organization's instance remains completely isolated.
              </p>
              <div className="bg-cream-100/60 p-4 border-l-2 border-olive-700 mb-4 text-xs sm:text-sm text-charcoal/80">
                <strong>Model Training Guarantee:</strong> Your proprietary documentation, internal SOPs, and employee performance metrics are never used to train, fine-tune, or improve public foundation models or shared datasets.
              </div>
              <p>
                Generative AI prompts are constructed dynamically in secured runtime memory and discarded immediately following verification by the deterministic evaluation engine.
              </p>
            </div>

            {/* SECTION 3 */}
            <div id="document-parsing" className="bg-white border border-cream-200 p-6 sm:p-8 rounded-sm shadow-sm scroll-mt-28">
              <span className="text-xs font-mono font-bold text-olive-700 uppercase tracking-wider block mb-2">
                Section 03
              </span>
              <h2 className="text-xl sm:text-2xl font-normal text-charcoal mb-4 flex items-center gap-2">
                <FileKey className="w-5 h-5 text-olive-700" /> Document Parsing & Traceable Chunking
              </h2>
              <p className="mb-4">
                When documents are processed by SkillSprint AI, they are decomposed into traceable text blocks linked directly to Document IDs and Section IDs.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-charcoal/70">
                <li>Text chunks are indexed solely for vector retrieval during active onboarding plan generation.</li>
                <li>Every task or question generated maintains a direct lineage citation back to the original source text.</li>
                <li>When source documents are updated or deleted, associated vector indices are immediately purged or refreshed.</li>
              </ul>
            </div>

            {/* SECTION 4 */}
            <div id="ground-truth-logs" className="bg-white border border-cream-200 p-6 sm:p-8 rounded-sm shadow-sm scroll-mt-28">
              <span className="text-xs font-mono font-bold text-olive-700 uppercase tracking-wider block mb-2">
                Section 04
              </span>
              <h2 className="text-xl sm:text-2xl font-normal text-charcoal mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-olive-700" /> Verification Logs & Dual-Pipeline Auditing
              </h2>
              <p className="mb-4">
                Our dual-pipeline architecture separates generative synthesis from deterministic validation. To maintain compliance transparency, the system logs:
              </p>
              <ol className="list-decimal pl-5 space-y-2 mb-4 text-charcoal/70">
                <li>Policy requirement coverage percentages calculated by the evaluation engine.</li>
                <li>Flags generated for unverified claims or missing requirements.</li>
                <li>Administrator override decisions and manual approval timestamps.</li>
              </ol>
              <p className="text-xs text-charcoal/60">
                These logs are retained exclusively for internal administrative auditing and compliance reporting.
              </p>
            </div>

            {/* SECTION 5 */}
            <div id="data-security" className="bg-white border border-cream-200 p-6 sm:p-8 rounded-sm shadow-sm scroll-mt-28">
              <span className="text-xs font-mono font-bold text-olive-700 uppercase tracking-wider block mb-2">
                Section 05
              </span>
              <h2 className="text-xl sm:text-2xl font-normal text-charcoal mb-4 flex items-center gap-2">
                <Server className="w-5 h-5 text-olive-700" /> Data Encryption, Storage & Retention
              </h2>
              <p className="mb-4">
                We implement industry-standard cryptographic practices across all stages of data storage and transmission:
              </p>
              <ul className="list-disc pl-5 space-y-2 mb-4 text-charcoal/70">
                <li><strong>In Transit:</strong> All API communications utilize TLS 1.3 encryption.</li>
                <li><strong>At Rest:</strong> Databases and document storage utilize AES-256 bit encryption.</li>
                <li><strong>Retention:</strong> Documents and employee completion data are stored for the duration of the organization's subscription or until explicitly deleted by an administrator.</li>
              </ul>
            </div>

            {/* SECTION 6 */}
            <div id="user-rights" className="bg-white border border-cream-200 p-6 sm:p-8 rounded-sm shadow-sm scroll-mt-28">
              <span className="text-xs font-mono font-bold text-olive-700 uppercase tracking-wider block mb-2">
                Section 06
              </span>
              <h2 className="text-xl sm:text-2xl font-normal text-charcoal mb-4 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-olive-700" /> Organizational Controls & Data Access
              </h2>
              <p className="mb-4">
                Corporate administrators retain full ownership and control over all submitted data. Authorized managers have the ability to:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-charcoal/70 mb-4">
                <li>Export complete onboarding logs and compliance reports in standard formats.</li>
                <li>Permanently remove outdated policy documents and purge associated vectors.</li>
                <li>Revoke access or delete employee records in accordance with company policy.</li>
              </ul>
            </div>

            {/* SECTION 7 */}
            <div id="privacy-contact" className="bg-cream-100/80 border border-cream-200 p-6 sm:p-8 rounded-sm shadow-sm scroll-mt-28">
              <h2 className="text-xl font-normal text-charcoal mb-2 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-olive-700" /> Privacy & Security Inquiries
              </h2>
              <p className="text-sm text-charcoal/70 mb-6">
                If you have questions regarding data handling, security architecture, or compliance audits, please contact our privacy officer.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/terms"
                  className="inline-flex items-center justify-center bg-olive-700 text-cream-50 px-6 py-2.5 text-sm font-medium rounded-sm hover:bg-olive-600 transition-colors"
                >
                  View Terms of Service
                </Link>
                <a
                  href="mailto:privacy@skillsprint.ai"
                  className="inline-flex items-center justify-center border border-charcoal/20 text-charcoal px-6 py-2.5 text-sm font-medium rounded-sm hover:bg-cream-50 transition-colors"
                >
                  Contact Privacy Officer
                </a>
              </div>
            </div>

          </section>
        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}