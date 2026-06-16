"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight, Shield, Zap, FileSearch, BarChart3, Bot, Building2, Sun, Moon, Terminal, Play, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import ChartAreaStep from "@/components/ui/8bit-chart-area-step";
import PixelLogoGrid from "@/components/ui/pixel-logo-grid";

const FEATURES = [
  {
    icon: FileSearch,
    title: "Regulatory Monitoring",
    desc: "Continuous ingestion of RBI, SEBI, IRDAI, DPDP, and PMMC circulars with AI-powered obligation extraction.",
  },
  {
    icon: Zap,
    title: "MAP Generation Engine",
    desc: "Automatically converts regulatory obligations into structured Measurable Action Points with deadlines and ownership.",
  },
  {
    icon: Building2,
    title: "Auto-Assignment",
    desc: "Intelligent routing of MAPs to compliance, risk, legal, or technology departments based on topic and priority.",
  },
  {
    icon: Bot,
    title: "Autonomous Validation",
    desc: "Validation agents run evidence checks, policy audits, and documentation reviews — without manual intervention.",
  },
  {
    icon: BarChart3,
    title: "Compliance Dashboard",
    desc: "Real-time visibility into MAP status, department workload, risk scores, and compliance trends.",
  },
  {
    icon: Shield,
    title: "Audit & Provenance",
    desc: "Full traceability from regulatory source to validated MAP with role-based audit logs and prompt traces.",
  },
];

const AGENT_STATUSES = [
  { name: "IngestionAgent", desc: "Monitors and classifies incoming circulars", status: "idle", log: "Watching feeds..." },
  { name: "ObligationAgent", desc: "Extracts structured obligations", status: "active", log: "Extracting sections from RBI KYC..." },
  { name: "MAPGeneratorAgent", desc: "Builds Action Points & Criteria", status: "success", log: "Generated 3 action plans successfully." },
  { name: "AssignmentAgent", desc: "Intelligently routes tasks to departments", status: "success", log: "Routed to Tech Lead." },
  { name: "ValidationAgent", desc: "Verifies evidence artifacts", status: "active", log: "Auditing compliance evidence..." },
];

const SOURCES = ["RBI", "SEBI", "IRDAI", "DPDP Act", "PMMC"];

export default function LandingPage() {
  const [dark, setDark] = useState(false);
  const [activeAgent, setActiveAgent] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  // Rotate active agent in the terminal console preview
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAgent((prev) => (prev + 1) % AGENT_STATUSES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300 overflow-x-hidden">
      {/* Nav */}
      <nav className="border-b border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50 transition-colors">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Logo" className="h-6 w-auto object-contain pixelated" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">ReguAgent</span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleDark}
              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {dark ? <Sun className="h-4.5 w-4.5 text-yellow-400" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
            
            <Link href="/login">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">Sign in</Button>
            </Link>
            <Link href="/login">
              <Button size="md" className="font-bold text-xs sm:text-sm px-4">Open Console <ArrowRight className="h-3.5 w-3.5 ml-1" /></Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-16 text-center relative">
        {/* Animated background blob */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-brand-500/10 blur-[100px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 dark:border-brand-900/50 dark:bg-brand-950/30 px-3 py-1 text-xs font-semibold text-brand-700 dark:text-brand-300 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
            Built for Indian Fintech & Banking Compliance
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white leading-tight tracking-tight max-w-4xl mx-auto">
            Regulatory Compliance, <span className="bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent">Automated End-to-End</span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
            ReguAgent monitors circulars from central authorities — then autonomously converts them
            into trackable action points, assigns ownership, validates evidence, and generates board-ready compliance logs.
          </p>
          
          <div className="mt-10 flex flex-col items-center justify-center gap-3">
            <Link href="/login">
              <Button size="lg" className="text-sm sm:text-base md:text-lg px-8 py-3.5 font-bold shadow-xl shadow-brand-500/20 hover:shadow-brand-500/35 transition-all duration-200">
                Open Console <ArrowRight className="h-5 w-5 ml-1.5" />
              </Button>
            </Link>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
              *Requires no registration. Sign in with demo access keys.
            </span>
          </div>
          
          <div className="mt-16 mx-auto max-w-sm">
            <PixelLogoGrid />
          </div>
        </motion.div>
      </section>

      {/* Regulatory Sources */}
      <section className="bg-slate-50 dark:bg-slate-900/30 border-y border-slate-100 dark:border-slate-800/80 py-8 transition-colors">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-5 font-semibold">Integrates with</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {SOURCES.map((s, idx) => (
              <motion.span
                key={s}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 shadow-sm"
              >
                {s}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Agent Terminal Console */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <Cpu className="h-3.5 w-3.5" />
              Agent Core Status
            </div>
            
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Watch our AI Agents Coordinate Compliance Tasks
            </h2>
            
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              ReguAgent coordinates five specialized AI agents. Together, they read documents, extract structured legal obligations, map actions, route assignments, and validate uploaded evidence.
            </p>

            <div className="space-y-3">
              {AGENT_STATUSES.map((agent, index) => (
                <button
                  key={agent.name}
                  onClick={() => setActiveAgent(index)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left ${
                    index === activeAgent
                      ? "border-brand-500 bg-brand-50/50 dark:bg-brand-950/20"
                      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900"
                  }`}
                >
                  <div>
                    <p className="font-bold text-xs">{agent.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{agent.desc}</p>
                  </div>
                  <span className={`h-2 w-2 rounded-full ${
                    agent.status === "active" ? "bg-amber-500 animate-ping" : agent.status === "success" ? "bg-emerald-500" : "bg-slate-400"
                  }`} />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 shadow-2xl font-mono text-xs">
              {/* Terminal Title Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                </div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold flex items-center gap-1">
                  <Terminal className="w-3 h-3" /> Live Agent Logs
                </span>
              </div>

              {/* Terminal Logs Content */}
              <div className="space-y-4 min-h-[260px] flex flex-col justify-between">
                <div className="space-y-2 text-slate-400">
                  <p className="text-slate-600">[SYSTEM] Booting agent cores...</p>
                  <p className="text-slate-600">[SYSTEM] Connection secure. Database sqlite:///reguagent.db linked.</p>
                  
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeAgent}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-1.5"
                    >
                      <p className="text-brand-400 font-bold">&gt; {AGENT_STATUSES[activeAgent].name} initialized.</p>
                      <p className="text-slate-300 font-semibold">[LOGS]: {AGENT_STATUSES[activeAgent].log}</p>
                      <p className="text-emerald-500 text-[10px]">&gt; STATUS: {AGENT_STATUSES[activeAgent].status.toUpperCase()}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="bg-slate-900/50 p-3 border border-slate-800 rounded text-[10px] text-slate-400 leading-normal flex items-start gap-2.5">
                  <Play className="w-3.5 h-3.5 text-brand-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-300 uppercase block mb-0.5">Automated Validation Flow</span>
                    Each document runs through these agents step-by-step. You can review detailed traces, models, and timestamps under the audit panel once logged in.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Graphics Showcase */}
      <section className="bg-slate-950 text-white border-y border-slate-800 py-20 transition-colors">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold font-mono uppercase tracking-widest text-brand-400 mb-2">Interactive Retro Analytics</h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto text-xs sm:text-sm">Hover over the data nodes below to see real-time active data tracking in retro 8-bit graphics mode.</p>
          <div className="mx-auto max-w-2xl bg-slate-900 p-4 border-[4px] border-slate-850 shadow-xl">
            <ChartAreaStep />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 dark:bg-slate-900/20 border-y border-slate-100 dark:border-slate-800/80 py-20 transition-colors">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Everything Compliance Teams Need</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950/30">
                  <Icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="mt-4 font-bold text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Ready to automate compliance?</h2>
        <p className="mt-3 text-slate-500 dark:text-slate-400 font-medium">Log in to explore the dashboard loaded with mock regulatory circulars and agent validation traces.</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3">
          <Link href="/login">
            <Button size="lg" className="text-sm sm:text-base md:text-lg px-8 py-3.5 font-bold shadow-xl shadow-brand-500/20 hover:shadow-brand-500/35 transition-all duration-200">
              Open Console <ArrowRight className="h-5 w-5 ml-1.5" />
            </Button>
          </Link>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            *Credentials can be found in the credentials.md file.
          </span>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-center text-xs text-slate-400 dark:text-slate-500">
        ReguAgent · Agentic Regulatory Intelligence · Built with FastAPI + Next.js · Demo mode
      </footer>
    </div>
  );
}
