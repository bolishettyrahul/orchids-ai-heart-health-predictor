"use client";

import { motion } from "framer-motion";
import {
  Zap,
  Info,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { Header } from "@/components/Navigation";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useAuth } from "@/context/AuthContext";
import { 
  useUserAssessments, 
  useUserHealthProfile 
} from "@/hooks/use-user-data";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HeartAgeVisual } from "@/components/dashboard/HeartAgeVisual";
import { HealthResilienceRadar } from "@/components/dashboard/HealthResilienceRadar";
import { PeerBenchmarking } from "@/components/dashboard/PeerBenchmarking";

function DataPanel({ 
  title, 
  children, 
  className = "",
  delay = 0,
  info = ""
}: { 
  title: string; 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
  info?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  
  const content = (
    <div className={`bg-slate-900 border border-slate-700/50 rounded-2xl p-6 lg:p-8 h-full flex flex-col shadow-xl ${className}`}>
      <div className="flex items-start justify-between mb-6 pb-4 border-b border-slate-700/30">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm tracking-wide">{title}</h3>
          {info && (
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">{info.slice(0, 80)}...</p>
          )}
        </div>
        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger asChild>
              <button className="ml-3 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors flex-shrink-0">
                <Info className="w-4 h-4 text-slate-400" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-slate-800 border-slate-600 text-sm max-w-[280px] p-3">
              <p className="text-slate-200">{info}</p>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
      </div>
      <div className="flex-1 min-h-[300px] flex flex-col">
        {children}
      </div>
    </div>
  );

  if (prefersReducedMotion) return content;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="h-full"
    >
      {content}
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { assessments, isLoading: assessmentsLoading } = useUserAssessments();
  const { profile, isLoading: profileLoading } = useUserHealthProfile();

  const calendarAge = 35;

  const calculatedMetrics = useMemo(() => {
    const heartAssessment = assessments.find(a => a.disease_type === 'heart');
    const answers = heartAssessment?.answers as Record<string, string> | undefined;
    
    if (!answers) {
      return null;
    }

    const nutritionMap: Record<string, number> = {
      'never': 95, 'rarely': 80, 'weekly': 55, 'daily': 25
    };
    const nutritionScore = nutritionMap[answers.oily_food] ?? 50;

    const activityMap: Record<string, number> = {
      '5+': 95, '3-4': 75, '1-2': 45, 'none': 15
    };
    const activityScore = activityMap[answers.exercise] ?? 50;

    const stressMap: Record<string, number> = {
      'low': 90, 'moderate': 65, 'high': 35, 'very_high': 15
    };
    const stressScore = stressMap[answers.stress] ?? 50;

    const sleepMap: Record<string, number> = {
      '7-8': 95, '9+': 75, '5-6': 50, '<5': 20
    };
    const sleepScore = sleepMap[answers.sleep] ?? 50;

    const substanceMap: Record<string, number> = {
      'none': 100, 'alcohol': 60, 'smoke': 40, 'both': 15
    };
    const substanceScore = substanceMap[answers.smoking_alcohol] ?? 50;

    const riskScore = heartAssessment?.risk_score ?? 50;
    const heartAgeOffset = Math.round((riskScore - 50) / 10);
    
    const avgScore = (nutritionScore + activityScore + stressScore + sleepScore + substanceScore) / 5;
    const percentile = Math.round(avgScore);

    return {
      nutritionScore,
      activityScore,
      stressScore,
      sleepScore,
      substanceScore,
      heartAgeOffset,
      percentile,
      hasData: true
    };
  }, [assessments]);

  const hasAssessmentData = calculatedMetrics !== null;
  const hasProfileData = profile?.heart_age !== null;

  const heartAge = profile?.heart_age 
    ? Number(profile.heart_age) 
    : calculatedMetrics
      ? calendarAge + calculatedMetrics.heartAgeOffset
      : null;

  const resilienceData = {
    nutrition: profile?.nutrition_score ? Number(profile.nutrition_score) : (calculatedMetrics?.nutritionScore ?? null),
    activity: profile?.activity_score ? Number(profile.activity_score) : (calculatedMetrics?.activityScore ?? null),
    stress: profile?.stress_score ? Number(profile.stress_score) : (calculatedMetrics?.stressScore ?? null),
    sleep: profile?.sleep_score ? Number(profile.sleep_score) : (calculatedMetrics?.sleepScore ?? null),
    substance: profile?.substance_score ? Number(profile.substance_score) : (calculatedMetrics?.substanceScore ?? null),
  };

  const percentile = profile?.peer_percentile 
    ? Number(profile.peer_percentile) 
    : calculatedMetrics?.percentile ?? null;

  const isLoading = assessmentsLoading || profileLoading;
  
  const needsAssessment = !isLoading && !hasAssessmentData && !hasProfileData;

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <Header 
        title="Clinical Executive Dashboard" 
        subtitle="Physiological Resilience & Biological Aging Profile" 
      />
      
      <main className="flex-1 p-6 md:p-8 lg:p-12 bg-slate-950">
        <div className="max-w-[1600px] mx-auto">
          {isLoading ? (
            <div className="h-[60vh] flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
                <p className="text-slate-400 font-medium animate-pulse">Analyzing physiological markers...</p>
              </div>
            </div>
          ) : needsAssessment ? (
            <div className="h-[60vh] flex items-center justify-center">
              <div className="flex flex-col items-center gap-6 text-center max-w-md">
                <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                  <Zap className="w-10 h-10 text-cyan-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Complete Your First Assessment</h2>
                <p className="text-slate-400">
                  To see your personalized health dashboard, please complete a health assessment first. 
                  This will analyze your lifestyle factors and calculate your health metrics.
                </p>
                <Link
                  href="/assessment"
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold text-sm rounded-xl transition-all shadow-lg shadow-cyan-500/20"
                >
                  <Zap className="w-5 h-5" />
                  Start Health Assessment
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <DataPanel 
                title="Biological Heart Age" 
                delay={0}
                info="A comparative analysis of your cardiovascular efficiency vs chronological age. Calculated from metabolic biomarkers and assessment data."
              >
                <HeartAgeVisual 
                  calendarAge={calendarAge} 
                  heartAge={heartAge ?? calendarAge}
                  noData={heartAge === null}
                />
              </DataPanel>

              <DataPanel 
                title="Health Resilience Radar" 
                delay={0.05}
                info="Holistic visualization of your 5 key lifestyle pillars. Identifies imbalances in your physiological protective factors."
              >
                <HealthResilienceRadar 
                  data={{
                    nutrition: resilienceData.nutrition ?? 0,
                    activity: resilienceData.activity ?? 0,
                    stress: resilienceData.stress ?? 0,
                    sleep: resilienceData.sleep ?? 0,
                    substance: resilienceData.substance ?? 0,
                  }}
                  noData={resilienceData.nutrition === null}
                />
              </DataPanel>

              <DataPanel 
                title="Peer Benchmarking" 
                delay={0.1}
                info="Contextualizes your health metrics against an anonymized cohort of your specific demographic profile."
              >
                <PeerBenchmarking 
                  percentile={percentile ?? 0} 
                  gender="General" 
                  ageRange={`${Math.floor(calendarAge/10)*10}-${Math.floor(calendarAge/10)*10+9}`}
                  noData={percentile === null}
                />
              </DataPanel>
              
              <div className="col-span-full lg:col-span-3 mt-4">
                <Link
                  href="/assessment"
                  className="flex items-center justify-center gap-3 h-14 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold text-sm rounded-xl transition-all shadow-lg shadow-cyan-500/20"
                >
                  <Zap className="w-5 h-5" />
                  {hasAssessmentData ? "Take Another Assessment" : "Start Health Assessment"}
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
