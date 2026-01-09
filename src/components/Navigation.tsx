"use client";

import { motion } from "framer-motion";
import {
  Heart,
  Search,
  Home,
  BarChart3,
  FileText,
  Settings,
  HelpCircle,
  List,
  User,
  Sparkles,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCommand } from "@/context/CommandContext";

const sidebarItems = [
  { icon: List, label: "Overview", href: "/" },
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Sparkles, label: "Simulator", href: "/simulator" },
  { icon: FileText, label: "Reports", href: "/results" },
  { icon: Settings, label: "Settings", href: "#" },
  { icon: HelpCircle, label: "Help", href: "#" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-24 h-screen bg-[#030712] border-r border-white/5 flex flex-col items-center py-8 fixed left-0 top-0 z-50">
      <Link href="/" className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-10 group transition-all hover:bg-cyan-500/20">
        <Heart className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
      </Link>
      
      <nav className="flex-1 flex flex-col gap-4">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all relative group ${
                isActive
                  ? "bg-cyan-500/10 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.1)]"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <item.icon className={`w-6 h-6 transition-transform ${isActive ? "scale-100" : "group-hover:scale-110"}`} />
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute -left-0 top-1/4 bottom-1/4 w-1 bg-cyan-400 rounded-r-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className="absolute left-full ml-4 px-3 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-white/10">
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3 items-center">
        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all group relative"
        >
          <LogOut className="w-5 h-5" />
          <div className="absolute left-full ml-4 px-3 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-white/10">
            Logout
          </div>
        </button>

        {/* User Avatar */}
        <div className="relative group">
          <button className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm border-2 border-white/10">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </button>
          <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-white/10">
            <p className="font-medium">{user?.name || "User"}</p>
            <p className="text-slate-400 text-[10px]">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function Header({ title, subtitle }: { title: string; subtitle: string }) {
  const { toggle } = useCommand();

  return (
    <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-[#030712]/40 backdrop-blur-md sticky top-0 z-40">
      <div>
        <h1 className="text-white font-bold text-lg tracking-tight flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {title} <span className="text-cyan-400 text-sm">/</span>
        </h1>
        <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">{subtitle}</p>
      </div>
      
      <div className="flex items-center gap-8">
        <button 
          onClick={toggle}
          className="relative group flex items-center"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          <div className="w-64 h-10 pl-10 pr-4 bg-slate-900/50 border border-white/5 rounded-xl text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between group-hover:border-cyan-500/30 group-hover:bg-slate-900 transition-all">
            <span>Search Commands...</span>
            <span className="text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded border border-white/5">⌘K</span>
          </div>
        </button>
        <div className="h-8 w-px bg-white/5" />
        <div className="text-right">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tighter">Reference ID</p>
          <p className="text-white text-sm font-mono tracking-tighter">00027689</p>
        </div>
      </div>
    </header>
  );
}
