"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { signOut, getAuthUser, AuthUser } from "@/lib/auth";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Building2,
  BarChart3,
  ScrollText,
  LogOut,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["compliance_officer", "risk_manager", "department_lead", "reviewer"] },
  { href: "/regulatory", label: "Regulatory Feed", icon: FileText, roles: ["compliance_officer"] },
  { href: "/maps", label: "Action Points", icon: ClipboardList, roles: ["compliance_officer", "risk_manager", "department_lead", "reviewer"] },
  { href: "/departments", label: "Departments", icon: Building2, roles: ["compliance_officer", "risk_manager"] },
  { href: "/audit", label: "Audit Trail", icon: ScrollText, roles: ["compliance_officer", "reviewer"] },
  { href: "/reports", label: "Reports", icon: BarChart3, roles: ["compliance_officer", "risk_manager", "reviewer"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    getAuthUser().then(setUser);
  }, []);

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center gap-2.5 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <div className="flex h-8 w-8 items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Logo" className="h-7 w-auto object-contain" />
        </div>
        <div>
          <span className="text-sm font-bold text-slate-900 dark:text-white">ReguAgent</span>
          <p className="text-xs text-slate-500 dark:text-slate-400">Compliance Intelligence</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {visibleItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-brand-50 text-brand-700 font-medium dark:bg-brand-950 dark:text-brand-300"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="h-3.5 w-3.5 opacity-50" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
