"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Brain,
  Stethoscope,
  Activity,
  Droplets,
  Bone,
  ChevronRight,
  TrendingUp,
  LogOut,
  Loader2,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Navigation";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useAuth } from "@/context/AuthContext";
import { useUserAssessments } from "@/hooks/use-user-data";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";


const diseaseMetadata = [
  {
    id: "heart",
    name: "Heart Disease",
    icon: Heart,
  },
  {
    id: "lung",
    name: "Lung Disease",
    icon: Brain,
  },
  {
    id: "thyroid",
    name: "Thyroid",
    icon: Activity,
  },
  {
    id: "pcod",
    name: "PCOD/PCOS",
    icon: Stethoscope,
  },
  {
    id: "diabetes",
    name: "Type 2 Diabetes",
    icon: Droplets,
  },
];

function MiniSparkline({ trend }: { trend: string | null }) {
  if (!trend) return null;
  
  const isImproving = trend === "improving";
  const points = isImproving 
    ? "0,15 10,14 20,16 30,10 40,8 50,4"
    : "0,10 10,12 20,10 30,11 40,10 50,10";
  
  return (
    <svg className="w-12 h-5 opacity-80" viewBox="0 0 50 20">
      <polyline
        points={points}
        fill="none"
        stroke={isImproving ? "#22D3EE" : "#64748B"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DiseasePanel({ disease }: { disease: any }) {
  const Icon = disease.icon;
  const isAssessed = disease.riskLevel !== null;
  
  return (
    <Link href={isAssessed ? `/results?disease=${disease.id}` : `/assessment?disease=${disease.id}`} className="block">
      <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 hover:bg-[#1e293b]/50 transition-all group cursor-pointer relative overflow-hidden h-full">
        {isAssessed && (
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 blur-3xl -mr-12 -mt-12 group-hover:bg-cyan-500/10 transition-colors" />
        )}
        
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-cyan-500/10 transition-colors">
              <Icon className={`w-5 h-5 ${isAssessed ? "text-cyan-400" : "text-slate-500"}`} />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm tracking-tight">{disease.name}</h3>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${
                  isAssessed ? "text-cyan-400" : "text-slate-500"
              }`}>
                {isAssessed ? "Active" : "Awaiting Scan"}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-transform group-hover:translate-x-1" />
        </div>
        
        {isAssessed ? (
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-white tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {disease.riskLevel}%
              </p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Latest Risk Score</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <MiniSparkline trend={disease.trend} />
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800/50 border border-white/5">
                 <span className={`text-[10px] font-bold uppercase tracking-tighter ${disease.trend === "improving" ? "text-cyan-400" : "text-slate-500"}`}>
                  {disease.trend === "improving" ? "Improving" : "Stable"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between mt-2">
            <p className="text-slate-500 text-xs font-medium">No assessment data</p>
            <div
              className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 bg-cyan-500/5 px-3 py-1.5 rounded-lg border border-cyan-500/10"
            >
              Start Scan
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

  export default function ClinicalDashboard() {
    const prefersReducedMotion = useReducedMotion();
    const router = useRouter();
    const { user, logout } = useAuth();
    const { assessments, isLoading } = useUserAssessments();
    
    const username = user?.name || user?.email?.split("@")[0] || "";

    // Calculate Aggregate Risk Index
    const aggregateRisk = useMemo(() => {
      if (assessments.length === 0) return null;
      
      const latestByDisease = new Map();
      assessments.forEach(a => {
        if (!latestByDisease.has(a.disease_type)) {
          latestByDisease.set(a.disease_type, a.risk_score);
        }
      });
      
      const scores = Array.from(latestByDisease.values());
      const average = scores.reduce((a, b) => a + b, 0) / scores.length;
      return Math.round(average);
    }, [assessments]);

    // Transform assessments into Temporal Risk Trajectory data
    const chartData = useMemo(() => {
      if (assessments.length === 0) return [];
      
      const grouped = assessments.reduce((acc: any, curr) => {
        const date = new Date(curr.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (!acc[date]) acc[date] = { date, total: 0, count: 0 };
        acc[date].total += curr.risk_score;
        acc[date].count += 1;
        return acc;
      }, {});

      return Object.values(grouped)
        .map((g: any) => ({
          name: g.date,
          risk: Math.round(g.total / g.count),
        }))
        .reverse();
    }, [assessments]);

    const diseases = useMemo(() => {
    return diseaseMetadata.map(metadata => {
      // Find all assessments for this disease
      const diseaseAssessments = assessments.filter(a => a.disease_type.toLowerCase() === metadata.id.toLowerCase());
      
      if (diseaseAssessments.length === 0) {
        return {
          ...metadata,
          riskLevel: null,
          trend: null,
          status: "Inactive"
        };
      }

      const latest = diseaseAssessments[0];
      const previous = diseaseAssessments[1];
      
      let trend = "stable";
      if (previous) {
        if (latest.risk_score < previous.risk_score) trend = "improving";
        else if (latest.risk_score > previous.risk_score) trend = "declining";
      }

      return {
        ...metadata,
        riskLevel: Math.round(latest.risk_score),
        trend,
        status: "Active"
      };
    });
  }, [assessments]);

  const handleLogout = () => {
    logout();
  };

  
  return (
    <div className="min-h-screen">
      <div className="bg-[#0f172a] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-white uppercase tracking-widest">HEALTH OVERVIEW</h1>
              <p className="text-xs text-slate-500 uppercase tracking-widest">Diagnostic Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              {username && (
                <span className="text-sm text-slate-400">
                  Welcome, <span className="text-cyan-400 font-medium">{username}</span>
                </span>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/20 transition-all text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <main className="p-10">
        <div className="max-w-[1600px] mx-auto">
            {/* Welcome Message */}
            {username && (
              <div className="mb-10">
                <h2 className="text-4xl font-bold text-white tracking-tight">Hi, {username}! 👋</h2>
                <p className="text-slate-400 mt-2 text-lg">Here's your comprehensive health overview</p>
              </div>
            )}

            {/* Top Stats & Charts */}
            <div className="grid grid-cols-12 gap-6 mb-10">
              <div className="col-span-full xl:col-span-8 bg-[#0f172a] border border-white/5 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-white font-bold text-sm uppercase tracking-widest">Temporal Risk Trajectory</h3>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-tighter">Your overall health trend over time</p>
                  </div>
                  <Link href="/history" className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest hover:underline border border-cyan-400/20 px-4 py-2 rounded-xl">
                    Detailed History
                  </Link>
                </div>
                
                <div className="h-64">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                    </div>
                  ) : chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="riskGradientHome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                        <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            border: "1px solid rgba(255,255,255,0.05)",
                            borderRadius: "12px",
                            color: "#fff",
                            fontSize: 10,
                            fontWeight: "bold",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="risk"
                          stroke="#22D3EE"
                          strokeWidth={3}
                          fill="url(#riskGradientHome)"
                          dot={{ fill: "#22D3EE", r: 4, strokeWidth: 2, stroke: "#0f172a" }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Activity className="w-12 h-12 text-slate-700 mb-4" />
                      <p className="text-slate-500 text-xs uppercase tracking-widest mb-4">Awaiting Assessment Trajectory</p>
                      <Link
                        href="/assessment"
                        className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest border border-cyan-400/20 px-6 py-3 rounded-2xl hover:bg-cyan-400/10 transition-all"
                      >
                        Start First Scan
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              <div className="col-span-full xl:col-span-4 bg-[#0f172a] border border-white/5 rounded-3xl p-8 flex flex-col justify-between">
                <div>
                  <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-2">Aggregate Risk Index</h3>
                  <p className="text-xs text-slate-500 uppercase tracking-tighter">Weighted Systemic Risk Summary</p>
                </div>

                <div className="py-8">
                  {aggregateRisk !== null ? (
                    <div className="text-center">
                      <div className="relative inline-block mb-4">
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="58"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-slate-800"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="58"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={364.42}
                            strokeDashoffset={364.42 - (364.42 * aggregateRisk) / 100}
                            className={`${
                              aggregateRisk > 60 ? "text-red-500" : 
                              aggregateRisk > 30 ? "text-cyan-400" : "text-green-500"
                            } transition-all duration-1000`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-4xl font-bold text-white">{aggregateRisk}%</span>
                        </div>
                      </div>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${
                        aggregateRisk > 60 ? "text-red-400" : 
                        aggregateRisk > 30 ? "text-cyan-400" : "text-green-500"
                      }`}>
                        {aggregateRisk > 60 ? "Attention Required" : 
                         aggregateRisk > 30 ? "Moderate Status" : "Optimal Health"}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-24 h-24 rounded-full border-4 border-slate-800 flex items-center justify-center mx-auto mb-4">
                        <span className="text-slate-600 text-2xl font-bold">--</span>
                      </div>
                      <p className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">Initialize Assessment</p>
                    </div>
                  )}
                </div>

                <Link
                  href="/simulator"
                  className="flex items-center justify-center gap-2 w-full h-14 bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-cyan-500/20 transition-all border border-cyan-500/20 group"
                >
                  <Zap className="w-4 h-4 group-hover:fill-cyan-400" />
                  Launch Lifestyle Simulator
                </Link>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-white font-bold text-sm uppercase tracking-widest">Diagnostic Protocols</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">V2.4.12 Live System</p>
            </div>

              <motion.div 

              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {diseases.map((disease) => (
                <DiseasePanel key={disease.id} disease={disease} />
              ))}
              
              <div className="xl:col-span-1 bg-[#0f172a] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-bold text-sm uppercase tracking-widest">Recent Activity</h3>
                  <Link href="/history" className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest hover:underline">
                    Protocol History
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    </div>
                  ) : assessments.length > 0 ? (
                    assessments.slice(0, 4).map((item, i) => (
                      <div key={i} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            item.risk_level === "low" ? "bg-green-400" : 
                            item.risk_level === "moderate" ? "bg-cyan-400" : "bg-red-400"
                          }`} />
                          <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">
                            {item.disease_type.charAt(0).toUpperCase() + item.disease_type.slice(1)} Scan: {item.risk_score}%
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-600 font-mono">
                          {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-[10px] text-slate-600 uppercase font-bold">No Activity Recorded</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

          
          <footer className="mt-12 flex flex-col md:flex-row items-center justify-between border-t border-white/5 pt-8 gap-4">
            <div className="flex gap-6">
              <Link href="#" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors">Documentation</Link>
              <Link href="#" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors">Privacy Policy</Link>
              <Link href="#" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors">System Status</Link>
            </div>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
              © 2024 CARDIO-AI PROTOCOL. PRED-V2.4.12
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
