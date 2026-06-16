"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth";
import LoginForm from "@/components/ui/8bit-login-form-2";

const DEMO_ACCOUNTS = [
  { label: "Compliance Officer", email: "compliance@demo.in" },
  { label: "Risk Manager", email: "risk@demo.in" },
  { label: "Legal Lead", email: "legal@demo.in" },
  { label: "Tech Lead", email: "tech@demo.in" },
];

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRetroSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    const form = e.currentTarget;
    const emailInput = form.elements.namedItem("email") as HTMLInputElement;
    const passwordInput = form.elements.namedItem("password") as HTMLInputElement;
    
    const targetEmail = emailInput?.value || "";
    const targetPassword = passwordInput?.value || "";

    try {
      await signIn(targetEmail, targetPassword);
      router.push("/dashboard");
    } catch {
      setError("Invalid credentials. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (email: string) => {
    const emailInput = document.getElementById("email") as HTMLInputElement;
    const passwordInput = document.getElementById("password") as HTMLInputElement;
    if (emailInput) emailInput.value = email;
    if (passwordInput) passwordInput.value = "demo1234";
  };

  return (
    <div className="flex min-h-screen bg-slate-900 font-mono text-slate-100">
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 bg-slate-950 border-r-[6px] border-foreground">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Logo" className="h-7 w-auto object-contain pixelated" />
          </div>
          <span className="font-bold text-lg uppercase tracking-widest text-brand-400">ReguAgent OS v1.0</span>
        </div>
        
        <div className="space-y-6">
          <div className="border-[4px] border-dashed border-slate-700 p-6 bg-slate-900 shadow-[4px_4px_0_0_#000]">
            <p className="text-brand-400 text-xs mb-2 animate-pulse">&gt; INITIALIZING AI COMPLIANCE ENGINE...</p>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              [SYSTEM]: IngestionAgent online. ObligationAgent online. MAPGeneratorAgent online. ValidationAgents (x4) online.
            </p>
          </div>
          
          <blockquote className="text-xl font-bold uppercase tracking-tight text-white">
            "From regulatory circular to validated action in minutes, not months."
          </blockquote>
          
          <div className="grid grid-cols-2 gap-4 text-xs">
            {[
              { label: "Regulations Monitored", value: "5+" },
              { label: "Auto-extracted MAPs", value: "12" },
              { label: "Validation Agents", value: "4" },
              { label: "Avg Processing Time", value: "<2 min" },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 border-[3px] border-slate-800 bg-slate-900 shadow-[3px_3px_0_0_#000]">
                <p className="text-lg font-black text-brand-400">{value}</p>
                <p className="text-[9px] uppercase tracking-wider text-slate-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
        
        <p className="text-[10px] text-slate-500 uppercase tracking-widest">[DEMO MODE - SYSTEM LIVE]</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center bg-slate-900 px-8 py-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 lg:hidden mb-8 justify-center">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Logo" className="h-6 w-auto object-contain pixelated" />
            </div>
            <span className="font-bold text-lg uppercase tracking-widest text-brand-400">ReguAgent</span>
          </div>

          <div className="animate-in fade-in zoom-in-95 duration-200">
            <LoginForm onSubmit={handleRetroSubmit} />
            
            {error && (
              <div className="mt-4 border-[3px] border-red-600 bg-red-950/20 px-3 py-2 text-xs font-mono font-bold uppercase text-red-400 shadow-[3px_3px_0_0_#000]">
                [SYS ERROR]: {error}
              </div>
            )}
          </div>

          <div className="mt-8 border-t-4 border-double border-slate-800 pt-6">
            <p className="text-[10px] uppercase font-bold text-slate-400 mb-3 tracking-widest text-center">[ Quick Access Terminals ]</p>
            <div className="grid grid-cols-2 gap-3">
              {DEMO_ACCOUNTS.map(({ label, email }) => (
                <button
                  key={email}
                  type="button"
                  onClick={() => handleQuickLogin(email)}
                  className="border-[3px] border-slate-800 bg-slate-950 p-2 text-left text-xs hover:bg-slate-800 hover:border-slate-700 active:translate-y-0.5 transition-all text-slate-300"
                >
                  <p className="font-bold text-[10px] uppercase text-brand-400 truncate">{label}</p>
                  <p className="text-[9px] text-slate-500 truncate mt-0.5">{email}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
