"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronRight,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Info,
  Calendar,
  Target,
  Sparkles,
  ArrowRight,
  LogOut,
  History,
  Activity as ActivityIcon,
} from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { Header } from "@/components/Navigation";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useUserAssessments } from "@/hooks/use-user-data";

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
      <div className={`bg-[#0f172a] border border-white/5 rounded-2xl p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-bold text-xs uppercase tracking-widest">{title}</h3>
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
      className={`bg-[#0f172a] border border-white/5 rounded-2xl p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-bold text-xs uppercase tracking-widest">{title}</h3>
        <ChevronRight className="w-4 h-4 text-slate-600" />
      </div>
      {children}
    </motion.div>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { assessments, isLoading: assessmentsLoading } = useUserAssessments();
  
  const scoreParam = searchParams.get("score");
  const diseaseParam = searchParams.get("disease");
  
  const [reportId, setReportId] = useState("RPT-000000");
  const [aiAnalysis, setAiAnalysis] = useState<{
    analysis?: string;
    recommendations?: string[];
    keyRiskFactors?: string[];
    diseaseType?: string;
    answers?: Record<string, string>;
  } | null>(null);

  useEffect(() => {
    setReportId(`RPT-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`);
    
    const lastAssessmentStr = localStorage.getItem('lastAssessment');
    if (lastAssessmentStr) {
      try {
        const parsed = JSON.parse(lastAssessmentStr);
        setAiAnalysis({
          ...parsed.analysis,
          diseaseType: parsed.diseaseType,
          answers: parsed.answers
        });
      } catch (e) {
        console.error('Failed to parse assessment:', e);
      }
    }
  }, []);

  const score = useMemo(() => {
    // 1. Check URL param first (for immediate results after assessment)
    if (scoreParam) return parseInt(scoreParam);
    
    // 2. Fallback to latest assessment from database
    if (assessments.length > 0) {
      // If a disease is specified in URL, find the latest for that disease
      if (diseaseParam) {
        const diseaseMatch = assessments.find(a => a.disease_type.toLowerCase() === diseaseParam.toLowerCase());
        if (diseaseMatch) return diseaseMatch.risk_score;
      }
      // Otherwise just take the latest one
      return assessments[0].risk_score;
    }

    // 3. Last fallback (legacy/same-session)
    const lastAssessmentStr = localStorage.getItem('lastAssessment');
    if (lastAssessmentStr) {
      try {
        return JSON.parse(lastAssessmentStr).riskScore;
      } catch (e) {
        return null;
      }
    }
    return null;
  }, [scoreParam, assessments, diseaseParam]);

  // Aggregate Risk Index calculation: Weighted average of latest risks for all diseases
  const aggregateRiskIndex = useMemo(() => {
    if (assessments.length === 0) return score || 0;
    
    const latestRisks: Record<string, number> = {};
    assessments.forEach(a => {
      if (!(a.disease_type in latestRisks)) {
        latestRisks[a.disease_type] = a.risk_score;
      }
    });
    
    const scores = Object.values(latestRisks);
    const sum = scores.reduce((acc, s) => acc + s, 0);
    return Math.round(sum / scores.length);
  }, [assessments, score]);

  const trendData = useMemo(() => {
    if (assessmentsLoading) return [];
    if (assessments.length === 0) {
      if (score !== null) {
        return [{ month: "Today", risk: score }];
      }
      return [];
    }
    
    return assessments
      .slice(0, 6)
      .map(a => ({
        month: new Date(a.created_at).toLocaleDateString("en-US", { month: "short" }),
        risk: a.risk_score
      }))
      .reverse();
  }, [assessments, assessmentsLoading, score]);

  const factorData = useMemo(() => {
    if (!aiAnalysis?.answers) {
      return [];
    }

    const answers = aiAnalysis.answers;
    const factors: { name: string; contribution: number; color: string }[] = [];
    
    // Map answers to factors
    Object.entries(answers).forEach(([key, value]) => {
      let weight = 0;
      const valStr = String(value).toLowerCase();
      if (valStr.includes('high') || valStr.includes('daily') || valStr.includes('frequent') || valStr === 'yes' || valStr === 'true') weight = 30;
      else if (valStr.includes('moderate') || valStr.includes('weekly') || valStr.includes('sometimes')) weight = 15;
      else weight = 5;

      factors.push({
        name: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        contribution: weight,
        color: "#22D3EE"
      });
    });

    return factors.sort((a, b) => b.contribution - a.contribution).slice(0, 5);
  }, [aiAnalysis]);

  const vectorBreakdown = useMemo(() => {
    if (!aiAnalysis?.answers) return null;
    
    return Object.entries(aiAnalysis.answers).map(([key, value]) => {
      const isGood = value.includes('never') || value.includes('rarely') || value.includes('low') || value === 'none' || value === 'no';
      return {
        label: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        status: isGood ? "good" : "warning",
        icon: isGood ? CheckCircle : AlertCircle,
        text: isGood ? "Optimal range detected" : "Contributing to elevated risk"
      };
    }).slice(0, 4);
  }, [aiAnalysis]);

  const forecastData = useMemo(() => {
    if (score === null) return [];
    return [
      { month: "Current", improved: score, unchanged: score },
      { month: "+2M", improved: Math.max(10, score - 10), unchanged: Math.min(100, score + 5) },
      { month: "+4M", improved: Math.max(10, score - 20), unchanged: Math.min(100, score + 12) },
      { month: "+6M", improved: Math.max(10, score - 25), unchanged: Math.min(100, score + 20) },
    ];
  }, [score]);

  const beforeAfterData = useMemo(() => {
    if (score === null) return [];
    return [
      { metric: "Aggregate Risk", before: score + 12, after: score, unit: "%" },
      { metric: "Factor Impact", before: 45, after: 33, unit: "%" },
    ];
  }, [score]);

  if (score === null && !assessmentsLoading) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-white/5 flex items-center justify-center mb-6">
          <ActivityIcon className="w-10 h-10 text-slate-700" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">No Assessment Found</h1>
        <p className="text-slate-500 mb-8 max-w-md">You haven't completed any health assessments yet. Complete one now to see your diagnostic report.</p>
        <Link
          href="/assessment"
          className="h-12 px-8 bg-cyan-500 text-[#0B1220] font-bold uppercase tracking-widest text-[10px] rounded-xl hover:bg-cyan-400 transition-all flex items-center gap-2"
        >
          Start Assessment
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
  };

  const getRiskLevel = () => {
    const s = score || 0;
    if (s < 30) return { level: "Low", color: "text-green-400" };
    if (s < 60) return { level: "Moderate", color: "text-cyan-400" };
    return { level: "Elevated", color: "text-red-400" };
  };

  const riskInfo = getRiskLevel();

  return (
    <div className="min-h-screen">
      <div className="bg-[#0f172a] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-white uppercase tracking-widest">DIAGNOSTIC REPORT</h1>
              <p className="text-xs text-slate-500 uppercase tracking-widest">Risk Analysis Verification</p>
            </div>
            <div className="flex items-center gap-4">
              {user?.name && (
                <span className="text-sm text-slate-400">
                  Welcome, <span className="text-cyan-400 font-medium">{user.name}</span>
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
          <div className="grid grid-cols-12 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="col-span-full lg:col-span-4 bg-[#0f172a] border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl -mr-16 -mt-16" />
              
                <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-10">Aggregate Risk Index</h3>
                
                <div className="relative w-48 h-48 mb-8">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="44" fill="none" stroke="#1E293B" strokeWidth="6" />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="44"
                      fill="none"
                      stroke="#22D3EE"
                      strokeWidth="6"
                      strokeLinecap="round"
                      initial={{ strokeDashoffset: 2 * Math.PI * 44 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - (aggregateRiskIndex || 0) / 100) }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      style={{ strokeDasharray: 2 * Math.PI * 44 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold text-white tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {aggregateRiskIndex}%
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Global Score</span>
                  </div>
                </div>

              
              <p className={`text-xl font-bold uppercase tracking-tight ${riskInfo.color}`}>
                {riskInfo.level} Risk Profile
              </p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-3 max-w-[200px]">
                Analyzed across physiological vectors for {aiAnalysis?.diseaseType || "General Health"}
              </p>
            </motion.div>
            
            <DataPanel title="Temporal Risk Trajectory" className="col-span-full lg:col-span-8" delay={0.05}>
              <div className="h-64">
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="riskGradientRes" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                      <XAxis dataKey="month" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
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
                        fill="url(#riskGradientRes)"
                        dot={{ fill: "#22D3EE", r: 4, strokeWidth: 2, stroke: "#0f172a" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500 text-xs uppercase tracking-widest">
                    Insufficient data for trend analysis
                  </div>
                )}
              </div>
            </DataPanel>
            
            <DataPanel title="Vector Contribution" className="col-span-full lg:col-span-6" delay={0.1}>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={factorData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                    <XAxis type="number" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} domain={[0, 40]} />
                    <YAxis dataKey="name" type="category" stroke="#475569" fontSize={10} width={100} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "1px solid rgba(255,255,255,0.05)",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: 10,
                      }}
                    />
                    <Bar dataKey="contribution" radius={[0, 4, 4, 0]}>
                      {factorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </DataPanel>
            
            <DataPanel title="Vector Breakdown" className="col-span-full lg:col-span-6" delay={0.15}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(vectorBreakdown || [
                  { label: "Assessment Required", status: "warning", icon: AlertCircle, text: "No input data detected" },
                  { label: "Baseline Scan", status: "warning", icon: AlertCircle, text: "Execute analysis for breakdown" },
                ]).map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-xl border border-white/5">
                    <item.icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${item.status === "good" ? "text-green-400" : "text-amber-400"}`} />
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-tight">{item.label}</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-1 leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </DataPanel>
            
            <DataPanel title="Intelligence Synthesis" className="col-span-full lg:col-span-8" delay={0.2}>
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start gap-4 p-5 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl">
                      <Info className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-white uppercase tracking-widest">AI Diagnostic Summary</p>
                        <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                          {aiAnalysis?.analysis || "The current profile indicates potential risk vectors that require attention. Follow the recommendations below to improve your health score over the next diagnostic epoch."}
                        </p>
                        {aiAnalysis?.keyRiskFactors && aiAnalysis.keyRiskFactors.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {aiAnalysis.keyRiskFactors.map((factor, i) => (
                              <span key={i} className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-[10px]">
                                {factor}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 md:w-[360px]">
                    {[
                      { icon: TrendingDown, value: "-12%", label: "Est. Delta", color: "text-green-400" },
                      { icon: History, value: assessments.length.toString(), label: "Assessments", color: "text-cyan-400" },
                      { icon: CheckCircle, value: "4/6", label: "Safe Zones", color: "text-green-400" },
                    ].map((stat, i) => (
                      <div key={i} className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 text-center">
                        <stat.icon className={`w-4 h-4 mx-auto mb-3 ${stat.color}`} />
                        <p className="text-lg font-bold text-white tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{stat.value}</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </DataPanel>
              
              <DataPanel title="AI Recommendations" className="col-span-full lg:col-span-4" delay={0.25}>
                <div className="space-y-4">
                  {(aiAnalysis?.recommendations || [
                    "Execute primary assessment to generate recommendations",
                    "Maintain standard hydration protocols",
                    "Target 7.5 hours of circadian rest",
                    "Regular physiological activity: 30min daily",
                  ]).map((text, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span className="text-[11px] text-slate-300 font-medium">{text}</span>
                    </div>
                  ))}
                <Link
                  href="/recommendations"
                  className="mt-6 flex items-center justify-center gap-2 h-12 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold uppercase tracking-widest text-[10px] rounded-xl hover:bg-cyan-500/20 transition-all"
                >
                  Retrieve Implementation Plan
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </DataPanel>

            <DataPanel 
              title="6-Month Health Risk Forecast" 
              className="col-span-full lg:col-span-8" 
              delay={0.3}
              info="This forecast models potential risk progression over 6 months based on your current assessment answers. Factors affecting the forecast include predicted lifestyle changes, metabolic recovery rates, and stress management efficacy."
            >
              <div className="mb-4 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="text-xs text-slate-400">If habits improved</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="text-xs text-slate-400">If unchanged</span>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="month" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        fontSize: 11,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="improved"
                      name="With Improvements"
                      stroke="#22c55e"
                      strokeWidth={3}
                      dot={{ fill: "#22c55e", r: 4 }}
                      strokeDasharray="0"
                    />
                    <Line
                      type="monotone"
                      dataKey="unchanged"
                      name="No Changes"
                      stroke="#ef4444"
                      strokeWidth={3}
                      dot={{ fill: "#ef4444", r: 4 }}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-4 bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-xl border border-green-500/20">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-medium mb-1">Forecast Insight</p>
                    <p className="text-slate-400 text-xs">
                      With consistent habit improvements, your risk could drop to <span className="text-green-400 font-bold">{Math.max(10, (score || 0) - 25)}%</span> in 6 months. 
                      This forecast is based on your current assessment answers and typical recovery rates.
                    </p>
                  </div>
                </div>
              </div>
            </DataPanel>

            {/* Before vs After Comparison */}
            <DataPanel title="Before vs After Comparison" className="col-span-full lg:col-span-4" delay={0.35}>
              <p className="text-slate-500 text-xs mb-4">Your estimated progress with protocols</p>
              <div className="space-y-4">
                {beforeAfterData.map((item, i) => {
                  const isImproved = item.after < item.before;
                  const changePercent = Math.round(Math.abs(item.after - item.before) / item.before * 100);
                  
                  return (
                    <div key={i} className="p-3 bg-slate-900/50 rounded-xl border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400">{item.metric}</span>
                        <span className={`text-xs font-bold ${isImproved ? "text-green-400" : "text-red-400"}`}>
                          {isImproved ? "↓" : "↑"} {changePercent}%
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-500">Current</span>
                            <span className="text-slate-300 font-mono">{item.before}{item.unit}</span>
                          </div>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-slate-600 rounded-full"
                              style={{ width: `${Math.min((item.before / Math.max(item.before, item.after)) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-600" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-500">Target</span>
                            <span className={`font-mono font-bold ${isImproved ? "text-green-400" : "text-red-400"}`}>
                              {item.after}{item.unit}
                            </span>
                          </div>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isImproved ? "bg-green-500" : "bg-red-500"}`}
                              style={{ width: `${Math.min((item.after / Math.max(item.before, item.after)) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </DataPanel>
          </div>
          
          <div className="mt-10 flex justify-center gap-6">
            <Link
              href="/dashboard"
              className="h-12 px-8 bg-slate-900 border border-white/5 text-slate-400 font-bold uppercase tracking-widest text-[10px] rounded-xl hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center"
            >
              System Command
            </Link>
            <Link
              href="/simulator"
              className="h-12 px-8 bg-gradient-to-r from-cyan-500/10 to-teal-500/10 border border-cyan-500/20 text-cyan-400 font-bold uppercase tracking-widest text-[10px] rounded-xl hover:from-cyan-500/20 hover:to-teal-500/20 transition-all flex items-center gap-2 justify-center"
            >
              <Sparkles className="w-4 h-4" />
              Try Lifestyle Simulator
            </Link>
            <Link
              href="/assessment"
              className="h-12 px-8 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold uppercase tracking-widest text-[10px] rounded-xl hover:bg-cyan-500/20 transition-all flex items-center justify-center"
            >
              Execute New Analysis
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-[#030712] flex flex-col items-center justify-center gap-6">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-400/20 border-t-cyan-400 animate-spin" />
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Synchronizing Diagnostics...</p>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
