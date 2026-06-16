"use client";
import { Bell, Moon, Sun, User } from "lucide-react";
import { useState, useEffect } from "react";
import { getAuthUser, AuthUser } from "@/lib/auth";

const ROLE_LABELS: Record<string, string> = {
  compliance_officer: "Compliance Officer",
  risk_manager: "Risk Manager",
  department_lead: "Department Lead",
  reviewer: "Reviewer",
};

export function Header({ title }: { title: string }) {
  const [dark, setDark] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    getAuthUser().then(setUser);
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

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-950">
      <h1 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h1>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleDark}
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <button className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
          <Bell className="h-4 w-4" />
        </button>
        {user && (
          <div className="flex items-center gap-2 rounded-md border border-slate-200 px-2.5 py-1.5 dark:border-slate-700">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-medium text-white">
              {user.name[0]}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-medium text-slate-900 dark:text-slate-100">{user.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{ROLE_LABELS[user.role] || user.role}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
