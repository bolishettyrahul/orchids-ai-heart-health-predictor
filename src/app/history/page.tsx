"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Search,
  ChevronRight,
  Home,
  BarChart3,
  FileText,
  Settings,
  HelpCircle,
  List,
  TrendingDown,
  TrendingUp,
  Calendar,
  LogOut,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { VirtualizedList } from "@/components/performance";
import { useAuth } from "@/context/AuthContext";
import { useUserAssessments, useHealthMetrics } from "@/hooks/use-user-data";

const sidebarItems = [
  { icon: List, label: "Overview", href: "/" },
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: BarChart3, label: "Analytics", href: "/history", active: true },
  { icon: FileText, label: "Reports", href: "/results" },
  { icon: Settings, label: "Settings" },
  { icon: HelpCircle, label: "Help" },
];

function Sidebar() {
  return (
    <aside className="w-20 h-screen bg-[#0a0f1a] border-r border-cyan-500/10 flex flex-col items-center py-6 fixed left-0 top-0 z-50">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center mb-8">
        <Heart className="w-5 h-5 text-white" />
      </div>
      
      <nav className="flex-1 flex flex-col gap-2">
        {sidebarItems.map((item) => (
          <Link
            key={item.label}
            href={item.href || "#"}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              item.active
                ? "bg-cyan-500/20 text-cyan-400"
                : "text-slate-500 hover:bg-slate-800/50 hover:text-slate-300"
            }`}
          >
            <item.icon className="w-5 h-5" />
          </Link>
        ))}
      </nav>
    </aside>
  );
}

function DataPanel({ 
  title, 
  children, 
  className = "",
  delay = 0 
}: { 
  title: string; 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  
  if (prefersReducedMotion) {
    return (
      <div className={`bg-[#111827] border border-cyan-500/10 rounded-lg p-5 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-medium text-sm">{title}</h3>
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </div>
        {children}
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={`bg-[#111827] border border-cyan-500/10 rounded-lg p-5 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium text-sm">{title}</h3>
        <ChevronRight className="w-4 h-4 text-slate-600" />
      </div>
      {children}
    </motion.div>
  );
}

export default function HistoryPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { assessments: userAssessments, isLoading } = useUserAssessments();
  const { metrics: cholesterolMetrics } = useHealthMetrics("cholesterol");
  const { metrics: systolicMetrics } = useHealthMetrics("blood_pressure_systolic");
  const { metrics: diastolicMetrics } = useHealthMetrics("blood_pressure_diastolic");

  // Transform user assessments into chart data
  const riskHistoryData = userAssessments.map((a) => ({
    date: new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    risk: a.risk_score,
  })).reverse();

  // Transform metrics into chart data
  const cholesterolHistoryData = cholesterolMetrics.map(m => ({
    date: new Date(m.recorded_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: m.value
  })).reverse();

  const bpHistoryData = useMemo(() => {
    // Group systolic and diastolic by date
    const history: Record<string, { date: string; systolic: number; diastolic: number }> = {};
    
    systolicMetrics.forEach(m => {
      const d = new Date(m.recorded_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!history[d]) history[d] = { date: d, systolic: 0, diastolic: 0 };
      history[d].systolic = m.value;
    });

    diastolicMetrics.forEach(m => {
      const d = new Date(m.recorded_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!history[d]) history[d] = { date: d, systolic: 0, diastolic: 0 };
      history[d].diastolic = m.value;
    });

    return Object.values(history).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [systolicMetrics, diastolicMetrics]);

  // Calculate stats from real data
  const totalAssessments = userAssessments.length;
  const firstRisk = userAssessments[userAssessments.length - 1]?.risk_score || 0;
  const latestRisk = userAssessments[0]?.risk_score || 0;
  const riskChange = firstRisk > 0 ? Math.round(latestRisk - firstRisk) : 0;

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <Sidebar />
      
      <main className="ml-20">
        <motion.header 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="h-16 border-b border-cyan-500/10 flex items-center justify-between px-8 bg-[#0a0f1a]/80 backdrop-blur-sm sticky top-0 z-40"
        >
          <div>
            <h1 className="text-white font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {user?.name ? `PATIENT: ${user.name.toUpperCase()}` : "PATIENT: USER"} <span className="text-cyan-400 ml-1">+</span>
            </h1>
            <p className="text-slate-500 text-xs">Historical analytics</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="SEARCH"
                className="w-48 h-9 pl-9 pr-4 bg-[#111827] border border-cyan-500/10 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/30"
              />
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/20 transition-all text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </motion.header>
        
        <div className="p-6">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 grid grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#111827] border border-cyan-500/10 rounded-lg p-5"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-500 text-xs">Risk Score Change</span>
                  {riskChange <= 0 ? (
                    <TrendingDown className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-red-400" />
                  )}
                </div>
                <p className={`text-3xl font-bold ${riskChange <= 0 ? "text-green-400" : "text-red-400"}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {riskChange <= 0 ? riskChange : `+${riskChange}`}%
                </p>
                <p className="text-xs text-slate-600 mt-1">Since first assessment</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-[#111827] border border-cyan-500/10 rounded-lg p-5"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-500 text-xs">Latest Risk Score</span>
                  <TrendingDown className="w-4 h-4 text-cyan-400" />
                </div>
                <p className="text-3xl font-bold text-cyan-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {latestRisk}%
                </p>
                <p className="text-xs text-slate-600 mt-1">Current assessment</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#111827] border border-cyan-500/10 rounded-lg p-5"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-500 text-xs">Total Assessments</span>
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                </div>
                <p className="text-3xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {totalAssessments}
                </p>
                <p className="text-xs text-slate-600 mt-1">All time</p>
              </motion.div>
            </div>
            
            <DataPanel title="Risk score over time" className="col-span-6" delay={0.15}>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={riskHistoryData}>
                    <defs>
                      <linearGradient id="riskGradientHist" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="date" stroke="#64748B" fontSize={10} />
                    <YAxis stroke="#64748B" fontSize={10} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111827",
                        border: "1px solid rgba(34,211,238,0.2)",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="risk"
                      stroke="#22D3EE"
                      strokeWidth={2}
                      fill="url(#riskGradientHist)"
                      dot={{ fill: "#22D3EE", r: 3 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </DataPanel>
            
            <DataPanel title="Cholesterol over time" className="col-span-6" delay={0.2}>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cholesterolHistoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="date" stroke="#64748B" fontSize={10} />
                    <YAxis stroke="#64748B" fontSize={10} domain={[150, 250]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111827",
                        border: "1px solid rgba(34,211,238,0.2)",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#14B8A6"
                      strokeWidth={2}
                      dot={{ fill: "#14B8A6", r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </DataPanel>
            
            <DataPanel title="Blood pressure trend" className="col-span-12" delay={0.25}>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={bpHistoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="date" stroke="#64748B" fontSize={10} />
                    <YAxis stroke="#64748B" fontSize={10} domain={[60, 140]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111827",
                        border: "1px solid rgba(34,211,238,0.2)",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="systolic"
                      stroke="#22C55E"
                      strokeWidth={2}
                      name="Systolic"
                      dot={{ fill: "#22C55E", r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="diastolic"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      name="Diastolic"
                      dot={{ fill: "#F59E0B", r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-xs text-slate-500">Systolic</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-xs text-slate-500">Diastolic</span>
                </div>
              </div>
            </DataPanel>
            
            <DataPanel title="Assessment history" className="col-span-12" delay={0.3}>
              <div className="space-y-2">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                  </div>
                ) : userAssessments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500">No assessments yet</p>
                    <Link href="/assessment" className="text-cyan-400 text-sm hover:underline mt-2 inline-block">
                      Take your first assessment
                    </Link>
                  </div>
                ) : (
                  userAssessments.map((assessment, i) => (
                    <motion.div
                      key={assessment.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + i * 0.03 }}
                      className="flex items-center justify-between p-3 bg-[#0a0f1a] rounded-lg hover:bg-[#0f1520] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#111827] flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm text-white">
                            {new Date(assessment.created_at).toLocaleDateString("en-US", { 
                              month: "long", 
                              day: "numeric", 
                              year: "numeric" 
                            })}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            <span>Type: {assessment.disease_type}</span>
                            <span>Level: {assessment.risk_level}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`text-xl font-bold ${
                            assessment.risk_level === "low" ? "text-green-400" : 
                            assessment.risk_level === "moderate" ? "text-amber-400" : "text-red-400"
                          }`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            {Math.round(assessment.risk_score)}%
                          </p>
                          <p className="text-xs text-slate-600">Risk Score</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </DataPanel>
          </div>
          
          <p className="mt-6 text-center text-xs text-slate-600">
            This platform provides predictive analytics for educational purposes only. 
            Always consult healthcare professionals for medical decisions.
          </p>
        </div>
      </main>
    </div>
  );
}
