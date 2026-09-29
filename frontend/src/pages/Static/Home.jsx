import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Cpu,
  FileCheck2,
  GitBranch,
  Search,
  CheckCircle2,
  ArrowRight,
  Layers,
  Database,
  Lock,
  Zap,
  Activity,
  Box,
} from "lucide-react";
import Hero3DCanvas from "../../components/Hero3DCanvas";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);

  const pipelineSteps = [
    {
      num: "01",
      icon: <Database className="w-5 h-5 text-olive-700" />,
      title: "Document Ingestion & Chunking",
      desc: "HR policies, SOPs, and role specifications are uploaded (PDF/DOCX) and parsed into traceable metadata chunks with section-level IDs.",
      metrics: "Parsing speed: < 2.4s per file",
    },
    {
      num: "02",
      icon: <Cpu className="w-5 h-5 text-olive-700" />,
      title: "GenAI Plan Generation",
      desc: "The generative pipeline analyzes employee metadata against company knowledge to generate role-specific modules, checklists, and quizzes.",
      metrics: "Schema compliance: 100% JSON validated",
    },
    {
      num: "03",
      icon: <ShieldCheck className="w-5 h-5 text-olive-700" />,
      title: "Ground-Truth Verification Engine",
      desc: "An independent Python logic engine audits the GenAI outputs against the Role Requirement Matrix to verify coverage and flag hallucinations.",
      metrics: "Zero-hallucination guarantee",
    },
    {
      num: "04",
      icon: <GitBranch className="w-5 h-5 text-olive-700" />,
      title: "Adaptive Delivery & Progress Audit",
      desc: "Learners execute personalized onboarding paths while administrators access real-time coverage scores and compliance analytics.",
      metrics: "Live progress tracking enabled",
    },
  ];

  const features = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-olive-700" />,
      title: "Dual-Pipeline Audit",
      desc: "GenAI creates personalized plans while a deterministic Python engine independently verifies mandatory policy coverage and section references.",
    },
    {
      icon: <FileCheck2 className="w-6 h-6 text-olive-700" />,
      title: "Zero-Hallucination Guardrails",
      desc: "Every module, task, and quiz item maps back to an explicit Document ID and Section ID. Unsupported claims are flagged before deployment.",
    },
    {
      icon: <Layers className="w-6 h-6 text-olive-700" />,
      title: "Role-Specific Precision",
      desc: "Tailored paths across engineering, support, finance, and operations. No two roles receive identical onboarding schedules.",
    },
    {
      icon: <Zap className="w-6 h-6 text-olive-700" />,
      title: "Policy Update Impact Detection",
      desc: "When an SOP or policy document updates, SkillSprint automatically performs impact analysis and regenerates only affected modules.",
    },
  ];

  const workflowIntegrations = [
    {
      role: "Engineering Lead",
      output: "Security Protocols & Repository Guidelines",
      coverage: "100%",
    },
    {
      role: "Financial Operations",
      output: "Compliance Policies & Expense Approval Matrix",
      coverage: "100%",
    },
    {
      role: "Customer Support",
      output: "SLA Frameworks & Escalation Workflows",
      coverage: "100%",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  (function initRandomStatusFlashes() {
    const items = Array.from(document.querySelectorAll("[data-\\#pipe-item]"));
    if (!items.length) return;

    let activeBadge = null;

    function triggerNextEvent() {
      if (activeBadge) {
        activeBadge.remove();
        activeBadge = null;
      }

      const randomItem = items[Math.floor(Math.random() * items.length)];
      const isApproved = Math.random() > 0.4;
      const text = isApproved ? "APPROVED" : "REJECTED";

      const badge = document.createElement("span");
      badge.className = `absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[9px] font-mono font-semibold rounded border transition-opacity duration-200 ${
        isApproved
          ? "bg-[#008080]/10 text-[#008080] border-[#008080]/30"
          : "bg-slate-200 text-slate-700 border-slate-300"
      }`;
      badge.innerText = text;

      randomItem.appendChild(badge);
      activeBadge = badge;

      setTimeout(() => {
        if (activeBadge === badge) {
          badge.remove();
          activeBadge = null;
        }
      }, 1200);
    }

    setInterval(triggerNextEvent, 2200);
  })();

  return (
    <div className="min-h-screen bg-cream-50 text-charcoal font-sans scroll-smooth selection:bg-olive-700 selection:text-cream-50 overflow-x-hidden">
      {/* HEADER / NAVIGATION */}
      <Header />
      {/* SECTION 1: HERO WITH 3D INTERACTIVE MODEL */}
      <section
        id="overview"
        className="pt-12 mt-20 sm:pt-16 pb-16 sm:pb-24 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cream-100 border border-cream-200 rounded-full text-xs font-medium text-olive-600 mb-6">
              <span className="w-2 h-2 rounded-full bg-olive-700 animate-pulse"></span>
              Deterministic Onboarding Intelligence
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-charcoal leading-[1.15] mb-6">
              Verifiable onboarding powered by generative AI and Python rules.
            </h1>

            <p className="text-base sm:text-lg text-charcoal/70 font-light leading-relaxed mb-8 max-w-xl">
              SkillSprint converts raw policies, SOPs, and role manuals into
              adaptive learning paths, then independently validates every step
              against company ground truth.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 bg-olive-700 text-cream-50 px-8 py-3.5 text-sm font-medium rounded-sm hover:bg-olive-600 transition-colors w-full sm:w-auto"
                >
                  Create Account <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <a
                  href="#pipeline"
                  className="inline-flex items-center justify-center border border-charcoal/20 text-charcoal px-8 py-3.5 text-sm font-medium rounded-sm hover:bg-cream-100 transition-colors w-full sm:w-auto"
                >
                  Explore Dual Pipeline
                </a>
              </motion.div>
            </div>
          </motion.div>

          {/* Interactive 3D AI Model in Hero */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-6 bg-white rounded-sm p-2 relative overflow-hidden"
          >
            <Hero3DCanvas />
          </motion.div>
        </div>
      </section>

      <section
        id="system-architecture-flow"
        className="w-full max-w-5xl mx-auto my-12 p-8 bg-white border border-slate-200 rounded-2xl shadow-sm font-sans text-slate-800"
      >
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-olive-700 block mb-3">
            Architecture Flow
          </span>
          <h2 className="text-2xl sm:text-4xl font-normal text-charcoal">
            System Processing Workflow
          </h2>
        </div>

        <div className="relative w-full max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
            <div className="bg-olive-600 border border-slate-200 rounded-xl p-4 text-center shadow-sm">
              <div className="text-xs font-semibold text-olive-400 p-2 bg-olive-700 rounded-md uppercase tracking-wider">
                Step 1
              </div>
              <div className="text-lg font-semibold text-white mt-0.5">
                Prompt Engineering &amp; Input Context
              </div>
              <div className="text-xs text-olive-950 mt-1">
                System Instructions | Persona Setup
              </div>
            </div>
            <div className="bg-olive-600 border border-slate-200 rounded-xl p-4 text-center shadow-sm">
              <div className="text-xs font-semibold text-olive-400 p-2 bg-olive-700 rounded-md uppercase tracking-wider">
                Step 2
              </div>
              <div className="text-lg font-semibold text-white mt-0.5">
                Document Parsing &amp; Extraction
              </div>
              <div className="text-xs text-olive-950 mt-1">
                Ingestion Engine | Structural Tokenization
              </div>
            </div>
          </div>

          <div className="relative w-full h-16">
            <svg
              className="w-full h-full"
              viewBox="0 0 800 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 200 0 V 32 H 400 V 64"
                stroke="#CBD5E1"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <path
                d="M 600 0 V 32 H 400 V 64"
                stroke="#CBD5E1"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <circle r="4" className="fill-olive-800">
                <animateMotion
                  path="M 200 0 V 32 H 400 V 64"
                  dur="2.5s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle r="4" className="fill-olive-600">
                <animateMotion
                  path="M 600 0 V 32 H 400 V 64"
                  dur="2.8s"
                  begin="0.6s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          </div>

          <div className="bg-olive-600 border border-slate-200 rounded-xl p-4 text-center shadow-sm">
            <div className="text-xs font-semibold text-olive-400 p-2 bg-olive-700 rounded-md uppercase tracking-wider">
              Step 3
            </div>
            <div className="text-lg font-semibold text-white mt-0.5">
              Role and Requirement Setup
            </div>
            <div className="text-xs text-olive-950 mt-1">
              Employee Profile | Role Requirement Matrix
            </div>
          </div>

          <div className="relative w-full h-24">
            <svg
              className="w-full h-full"
              viewBox="0 0 800 96"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 400 0 V 32 H 200 V 96"
                stroke="#CBD5E1"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <path
                d="M 400 32 H 600 V 96"
                stroke="#CBD5E1"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <circle r="4" className="fill-olive-600">
                <animateMotion
                  path="M 400 0 V 32 H 200 V 96"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle r="4" className="fill-olive-800">
                <animateMotion
                  path="M 400 32 H 600 V 96"
                  dur="3.2s"
                  begin="0.8s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
            <div
              id="pipe1-container"
              className="relative bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm min-h-[220px]"
            >
              <div className="bg-olive-600 px-4 py-3 text-white">
                <div className="text-xs mb-2 font-semibold text-olive-400 p-2 bg-olive-700 rounded-md uppercase tracking-wider">
                  Step 4
                </div>
                <div className="text-sm font-semibold">Pipeline 1</div>
                <div className="text-xs opacity-90">Python + GenAI API</div>
              </div>
              <ul className="p-4 space-y-2 text-xs text-slate-700">
                <li
                  data-pipe-item="1"
                  className="relative py-0.5 px-2 rounded transition-colors duration-300"
                >
                  Generate Onboarding Plan
                </li>
                <li
                  data-pipe-item="2"
                  className="relative py-0.5 px-2 rounded transition-colors duration-300"
                >
                  Learning Modules
                </li>
                <li
                  data-pipe-item="3"
                  className="relative py-0.5 px-2 rounded transition-colors duration-300"
                >
                  Checklists &amp; Tasks
                </li>
                <li
                  data-pipe-item="4"
                  className="relative py-0.5 px-2 rounded transition-colors duration-300"
                >
                  Quizzes &amp; Assessments
                </li>
              </ul>
            </div>

            <div
              id="pipe2-container"
              className="relative bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm min-h-[220px]"
            >
              <div className="bg-olive-600 px-4 py-3 text-white">
                <div className="text-xs mb-2 font-semibold text-olive-400 p-2 bg-olive-700 rounded-md uppercase tracking-wider">
                  Step 4
                </div>
                <div className="text-sm font-semibold">Pipeline 2</div>
                <div className="text-xs opacity-90">Python Validation</div>
              </div>
              <ul className="p-4 space-y-2 text-xs text-slate-700">
                <li
                  data-pipe-item="5"
                  className="relative py-0.5 px-2 rounded transition-colors duration-300"
                >
                  Check Requirements &amp; Sources
                </li>
                <li
                  data-pipe-item="6"
                  className="relative py-0.5 px-2 rounded transition-colors duration-300"
                >
                  Validate Coverage
                </li>
                <li
                  data-pipe-item="7"
                  className="relative py-0.5 px-2 rounded transition-colors duration-300"
                >
                  Detect Contradictions
                </li>
                <li
                  data-pipe-item="8"
                  className="relative py-0.5 px-2 rounded transition-colors duration-300"
                >
                  Check Role Relevance
                </li>
              </ul>
            </div>
          </div>

          <div className="relative w-full h-24">
            <svg
              className="w-full h-full"
              viewBox="0 0 800 96"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 200 0 V 48 H 400 V 96"
                stroke="#CBD5E1"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <path
                d="M 600 0 V 48 H 400 V 96"
                stroke="#CBD5E1"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <circle r="4" className="fill-olive-600">
                <animateMotion
                  path="M 200 0 V 48 H 400 V 96"
                  dur="2.8s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle r="4" className="fill-olive-800">
                <animateMotion
                  path="M 600 0 V 48 H 400 V 96"
                  dur="3.1s"
                  begin="0.4s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          </div>

          <div className="relative z-10 w-full bg-olive-600 border border-slate-200 rounded-xl p-4 text-center shadow-sm">
            <div className="text-xs mb-2 font-semibold text-olive-400 p-2 bg-olive-700 rounded-md uppercase tracking-wider">
              Step 5
            </div>
            <div className="text-sm font-semi text-white mt-0.5">
              Result Comparison
            </div>
            <div className="text-xs text-olive-200 mt-1">
              Coverage | Traceability | Consistency
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: DUAL PIPELINE ARCHITECTURE */}
      <section
        id="pipeline"
        className="py-20 sm:py-24 bg-cream-100/60 border-y border-cream-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-olive-700 block mb-3">
                Core System Mechanism
              </span>
              <h2 className="text-2xl sm:text-4xl font-normal text-charcoal">
                How SkillSprint Works
              </h2>
            </div>
            <p className="text-charcoal/70 max-w-md text-sm font-light leading-relaxed">
              Generative outputs alone are prone to omissions. SkillSprint pairs
              LLM generation with independent rule checking to ensure absolute
              accuracy.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Step Selection Navigation */}
            <div className="lg:col-span-5 space-y-3">
              {pipelineSteps.map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`w-full text-left p-5 sm:p-6 transition-all duration-200 border rounded-sm flex items-start gap-4 ${
                    activeTab === idx
                      ? "bg-white border-olive-700 shadow-sm"
                      : "bg-transparent border-cream-200 hover:bg-cream-100/80"
                  }`}
                >
                  <div className="p-2 bg-cream-100 rounded-sm shrink-0">
                    {step.icon}
                  </div>
                  <div>
                    <span
                      className={`font-mono text-xs ${
                        activeTab === idx
                          ? "text-olive-700 font-bold"
                          : "text-charcoal/40"
                      }`}
                    >
                      STEP {step.num}
                    </span>
                    <h3 className="font-medium text-charcoal text-base mt-0.5">
                      {step.title}
                    </h3>
                  </div>
                </button>
              ))}
            </div>

            {/* Display Active Detail */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-10 border border-cream-200 rounded-sm min-h-[320px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-semibold text-olive-700 uppercase tracking-wider">
                    Step {pipelineSteps[activeTab].num} Execution Detail
                  </span>
                  <span className="text-xs font-mono text-charcoal/50 bg-cream-100 px-2.5 py-1 rounded-sm">
                    {pipelineSteps[activeTab].metrics}
                  </span>
                </div>
                <h3 className="text-2xl font-normal text-charcoal mb-4">
                  {pipelineSteps[activeTab].title}
                </h3>
                <p className="text-charcoal/70 text-base leading-relaxed font-light mb-6">
                  {pipelineSteps[activeTab].desc}
                </p>
              </div>

              <div className="pt-6 border-t border-cream-100 flex items-center justify-between text-xs text-charcoal/60">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-olive-700" />{" "}
                  Deterministic Logic Engine
                </span>
                <span className="font-mono text-olive-700 font-semibold">
                  Status: Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 (RELOCATED): GROUND-TRUTH EXECUTION FLOWCHART */}
      <section
        id="audit-flow"
        className="py-20 sm:py-24 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto"
      >
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-olive-700 block mb-3">
            Execution Flowchart
          </span>
          <h2 className="text-2xl sm:text-4xl font-normal text-charcoal mb-4">
            Ground-Truth Audit Pipeline
          </h2>
          <p className="text-charcoal/70 font-light text-base">
            How raw files flow through GenAI structure generation and Python
            rule verification.
          </p>
        </div>

        <div className="bg-white border border-cream-200 p-6 sm:p-10 rounded-sm shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="p-5 bg-olive-700 text-cream-50 rounded-sm relative">
              <div className="flex items-center justify-between text-xs text-cream-200/80 mb-3 font-mono">
                <span>STAGE 01</span>
                <span className="text-cream-100 font-semibold">Ingestion</span>
              </div>
              <p className="text-sm font-medium text-cream-50 mb-1">
                Company SOP & Policy PDFs
              </p>
              <p className="text-xs text-cream-200/80 font-light">
                Document ID & Section Chunking
              </p>
            </div>

            <div className="p-5 bg-olive-700 text-cream-50 rounded-sm relative">
              <div className="flex items-center justify-between text-xs text-cream-200/80 mb-3 font-mono">
                <span>STAGE 02</span>
                <span className="text-cream-100 font-semibold">
                  GenAI Engine
                </span>
              </div>
              <p className="text-sm font-medium text-cream-50 mb-1">
                Role Plan & Quiz Generation
              </p>
              <p className="text-xs text-cream-200/80 font-light">
                JSON Schema Structured Output
              </p>
            </div>

            <div className="p-5 bg-olive-700 text-cream-50 rounded-sm relative">
              <div className="flex items-center justify-between text-xs text-cream-200/80 mb-3 font-mono">
                <span>STAGE 03</span>
                <span className="text-cream-100 font-semibold">
                  Deterministic Audit
                </span>
              </div>
              <p className="text-sm font-medium text-cream-50 mb-1">
                Python Logic Verification
              </p>
              <p className="text-xs text-cream-200/80 font-light">
                100% Policy Ground-Truth Match
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: ROLE REQUIREMENT MATRIX */}
      <section
        id="audit-matrix"
        className="py-20 sm:py-24 bg-cream-100/40 border-y border-cream-200 px-4 sm:px-8 lg:px-12"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-olive-700 block mb-3">
                Ground-Truth Mapping
              </span>
              <h2 className="text-2xl sm:text-4xl font-normal text-charcoal">
                Role Requirement Matrix
              </h2>
            </div>
          </div>

          <div className="overflow-x-auto border border-cream-200 rounded-sm bg-white">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-cream-100/60 border-b border-cream-200 text-charcoal/70 font-mono text-xs">
                  <th className="p-4 sm:p-5">Department / Role</th>
                  <th className="p-4 sm:p-5">Generated Onboarding Modules</th>
                  <th className="p-4 sm:p-5">Policy Ground-Truth Coverage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200/80">
                {workflowIntegrations.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-cream-50/50 transition-colors"
                  >
                    <td className="p-4 sm:p-5 font-medium text-charcoal">
                      {row.role}
                    </td>
                    <td className="p-4 sm:p-5 text-charcoal/70">
                      {row.output}
                    </td>
                    <td className="p-4 sm:p-5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-olive-700/10 text-olive-600 font-mono text-xs font-semibold rounded-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-olive-700" />{" "}
                        {row.coverage} Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION 5: SYSTEM ARCHITECTURE FEATURES */}
      <section
        id="architecture"
        className="py-20 sm:py-24 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto"
      >
        <div className="max-w-2xl mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-olive-700 block mb-3">
            System Architecture
          </span>
          <h2 className="text-2xl sm:text-4xl font-normal text-charcoal mb-4">
            Built for governance, speed, and absolute clarity.
          </h2>
          <p className="text-charcoal/70 font-light text-base">
            Designed for organizations requiring strict policy adherence without
            sacrificing modern AI capabilities.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8"
        >
          {features.map((item, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="p-6 sm:p-8 bg-white border border-cream-200 rounded-sm hover:border-olive-700/50 transition-all shadow-sm"
            >
              <div className="w-12 h-12 bg-cream-100 rounded-sm flex items-center justify-center mb-6">
                {item.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-charcoal mb-3">
                {item.title}
              </h3>
              <p className="text-charcoal/70 text-sm font-light leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* SECTION 6: SECURITY & GOVERNANCE */}
      <section className="py-20 sm:py-24 bg-cream-100/40 border-y border-cream-200 px-4 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <span className="text-xs font-bold uppercase tracking-widest text-olive-700 block mb-3">
              Enterprise Ready
            </span>
            <h2 className="text-2xl sm:text-4xl font-normal text-charcoal mb-6">
              Data Security & Governance First
            </h2>
            <p className="text-charcoal/70 font-light text-base leading-relaxed mb-8">
              Your organizational policies and employee data remain enclosed
              within your private tenant. SkillSprint operates with strict
              role-based access control and deterministic logging.
            </p>
            <div className="space-y-4 text-sm font-medium text-charcoal">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-olive-700 shrink-0" />
                <span>
                  Isolated tenant processing with zero data training leakage
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-olive-700 shrink-0" />
                <span>Full audit logs for every generated quiz and module</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white border border-cream-200 p-8 rounded-sm shadow-sm">
            <h3 className="text-lg font-medium text-charcoal mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-olive-700" /> Verification Audit
              Log
            </h3>
            <div className="font-mono text-xs space-y-3 text-charcoal/70 bg-cream-50 p-4 rounded-sm border border-cream-200/60">
              <p>
                <span className="text-olive-700">[12:04:11]</span>{" "}
                FETCH_SOP_CLAUSES -- ID: SOP_FIN_04
              </p>
              <p>
                <span className="text-olive-700">[12:04:12]</span> GEN_MODULES
                -- Target: Finance Specialist
              </p>
              <p>
                <span className="text-olive-700">[12:04:13]</span>{" "}
                EXEC_PYTHON_AUDIT -- RuleSet: v3.1
              </p>
              <p className="text-olive-600 font-semibold">
                [12:04:14] SUCCESS -- 100% Match verified
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: METRICS & VERIFICATION PROOF */}
      <section
        id="metrics"
        className="py-16 sm:py-20 bg-olive-900 text-cream-50 px-4 sm:px-8 lg:px-12"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 text-center lg:text-left">
          <div className="lg:border-r border-olive-700/60 lg:pr-8">
            <span className="text-3xl sm:text-4xl font-light text-cream-50 block mb-2 font-mono">
              100%
            </span>
            <span className="text-xs font-medium uppercase tracking-wider text-cream-200/70">
              Mandatory Coverage Verification
            </span>
          </div>
          <div className="lg:border-r border-olive-700/60 lg:pr-8">
            <span className="text-3xl sm:text-4xl font-light text-cream-50 block mb-2 font-mono">
              &lt; 30s
            </span>
            <span className="text-xs font-medium uppercase tracking-wider text-cream-200/70">
              Plan Generation & Verification Time
            </span>
          </div>
          <div className="lg:border-r border-olive-700/60 lg:pr-8">
            <span className="text-3xl sm:text-4xl font-light text-cream-50 block mb-2 font-mono">
              1:1
            </span>
            <span className="text-xs font-medium uppercase tracking-wider text-cream-200/70">
              Source Clause Traceability Ratio
            </span>
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-light text-cream-50 block mb-2 font-mono">
              Zero
            </span>
            <span className="text-xs font-medium uppercase tracking-wider text-cream-200/70">
              Unverified AI Claims
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 8: CTA BLOCK */}
      <section className="py-20 sm:py-24 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto text-center">
        <div className="max-w-3xl mx-auto bg-cream-100/80 border border-cream-200 p-8 sm:p-12 rounded-sm">
          <h2 className="text-2xl sm:text-3xl font-normal text-charcoal mb-4">
            Ready to structure your corporate onboarding?
          </h2>
          <p className="text-charcoal/70 font-light text-sm mb-8 max-w-xl mx-auto">
            Sign in to your account or create a new workplace profile to start
            managing role requirements.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-olive-700 text-cream-50 px-8 py-3 text-sm font-medium rounded-sm hover:bg-olive-600 transition-colors"
            >
              Create Account
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto border border-charcoal/20 text-charcoal px-8 py-3 text-sm font-medium rounded-sm hover:bg-cream-50 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
