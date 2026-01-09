"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Wind, Droplets, Activity, Zap, LogOut, ArrowLeft, TrendingDown, TrendingUp, Minus, BarChart3 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useUserAssessments } from "@/hooks/use-user-data";

interface DiseaseAnswers {
  [key: string]: string[];
}

const diseases = {
  heart: {
    name: "Heart Disease",
    icon: Heart,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    barColor: "bg-red-500",
    questions: [
      { question: "How often do you exercise per week?", options: ["Never", "1-2 times", "3-4 times", "5+ times"] },
      { question: "How often do you consume oily/fried food?", options: ["Daily", "Several times a week", "Once a week", "Rarely"] },
      { question: "How many hours do you sleep daily?", options: ["Less than 5 hours", "5-6 hours", "7-8 hours", "More than 8 hours"] },
      { question: "What is your stress level at work/home?", options: ["Very high", "High", "Moderate", "Low"] },
      { question: "Do you smoke/consume alcohol?", options: ["Both regularly", "One regularly", "Occasionally", "Never"] },
    ],
  },
  lung: {
    name: "Lung Disease",
    icon: Wind,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    barColor: "bg-blue-500",
    questions: [
      { question: "What is your smoking status?", options: ["Current smoker", "Former smoker", "Never smoked"] },
      { question: "How is the air quality in your area?", options: ["Poor", "Fair", "Good", "Excellent"] },
      { question: "Do you experience breathing difficulties?", options: ["Frequently", "Sometimes", "Rarely", "Never"] },
      { question: "How active is your lifestyle?", options: ["Sedentary", "Lightly active", "Moderately active", "Very active"] },
      { question: "Do you have any allergies or asthma?", options: ["Severe", "Moderate", "Mild", "None"] },
    ],
  },
  diabetes: {
    name: "Type 2 Diabetes",
    icon: Droplets,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    barColor: "bg-purple-500",
    questions: [
      { question: "How often do you consume sugary foods/drinks?", options: ["Daily", "Several times a week", "Once a week", "Rarely"] },
      { question: "What is your physical activity level?", options: ["Sedentary", "Lightly active", "Moderately active", "Very active"] },
      { question: "How would you describe your body weight?", options: ["Obese", "Overweight", "Normal", "Underweight"] },
      { question: "Do you have a family history of diabetes?", options: ["Yes, immediate family", "Yes, extended family", "No"] },
      { question: "How often do you eat processed/junk food?", options: ["Daily", "Several times a week", "Once a week", "Rarely"] },
    ],
  },
  pcod: {
    name: "PCOD/PCOS",
    icon: Activity,
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
    barColor: "bg-pink-500",
    questions: [
      { question: "How regular is your menstrual cycle?", options: ["Very irregular", "Somewhat irregular", "Mostly regular", "Always regular"] },
      { question: "Do you experience acne or excess hair growth?", options: ["Both frequently", "One frequently", "Occasionally", "Never"] },
      { question: "Have you experienced unexplained weight gain?", options: ["Significant", "Moderate", "Slight", "No"] },
      { question: "What is your stress level?", options: ["Very high", "High", "Moderate", "Low"] },
      { question: "Family history of PCOD/PCOS?", options: ["Yes, immediate family", "Yes, extended family", "No"] },
    ],
  },
  thyroid: {
    name: "Thyroid",
    icon: Zap,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    barColor: "bg-yellow-500",
    questions: [
      { question: "Do you experience unexplained fatigue?", options: ["Constantly", "Frequently", "Sometimes", "Never"] },
      { question: "Have you noticed unexplained weight changes?", options: ["Significant changes", "Moderate changes", "Slight changes", "No changes"] },
      { question: "Do you experience mood swings or depression?", options: ["Frequently", "Sometimes", "Rarely", "Never"] },
      { question: "Are you sensitive to cold or heat?", options: ["Very sensitive to both", "Sensitive to one", "Slightly sensitive", "Not sensitive"] },
      { question: "Family history of thyroid disorders?", options: ["Yes, immediate family", "Yes, extended family", "No"] },
    ],
  },
};

export default function SimulatorPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { assessments, isLoading: assessmentsLoading } = useUserAssessments();
  const [username, setUsername] = useState("");
  const [answers, setAnswers] = useState<DiseaseAnswers>({
    heart: ["", "", "", "", ""],
    lung: ["", "", "", "", ""],
    diabetes: ["", "", "", "", ""],
    pcod: ["", "", "", "", ""],
    thyroid: ["", "", "", "", ""],
  });
  
  // Current risks (loaded from overview/localStorage)
  const [currentRisks, setCurrentRisks] = useState({
    heart: 0,
    lung: 0,
    diabetes: 0,
    pcod: 0,
    thyroid: 0,
  });

  // Simulated risks (calculated from lifestyle adjustments)
  const [simulatedRisks, setSimulatedRisks] = useState({
    heart: 0,
    lung: 0,
    diabetes: 0,
    pcod: 0,
    thyroid: 0,
  });

  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setUsername(user.name);
    }
  }, [user]);

  useEffect(() => {
    if (!assessmentsLoading && assessments.length > 0) {
      const risks = {
        heart: 0,
        lung: 0,
        diabetes: 0,
        pcod: 0,
        thyroid: 0,
      };

      // Get the latest assessment for each disease type
      assessments.forEach(a => {
        const type = a.disease_type.toLowerCase() as keyof typeof risks;
        if (risks[type] === 0) { // Only take the latest one (since sorted by created_at desc)
          risks[type] = a.risk_score;
        }
      });

      setCurrentRisks(risks);
    }
  }, [assessments, assessmentsLoading]);

  const handleLogout = () => {
    logout();
  };

  const handleAnswerChange = (diseaseKey: string, questionIndex: number, value: string) => {
    setAnswers((prev) => {
      const newAnswers = { ...prev };
      newAnswers[diseaseKey] = [...prev[diseaseKey]];
      newAnswers[diseaseKey][questionIndex] = value;
      return newAnswers;
    });
  };

  const calculateRisk = (diseaseKey: string): number => {
    const diseaseAnswers = answers[diseaseKey];
    const disease = diseases[diseaseKey as keyof typeof diseases];
    let totalRisk = 0;
    let answeredQuestions = 0;

    diseaseAnswers.forEach((answer, index) => {
      if (answer) {
        answeredQuestions++;
        const options = disease.questions[index].options;
        const optionIndex = options.indexOf(answer);
        const riskScore = ((options.length - 1 - optionIndex) / (options.length - 1)) * 100;
        totalRisk += riskScore;
      }
    });

    if (answeredQuestions === 0) return currentRisks[diseaseKey as keyof typeof currentRisks];
    return Math.round(totalRisk / answeredQuestions);
  };

  const analyzeRisk = () => {
    const newRisks = {
      heart: calculateRisk("heart"),
      lung: calculateRisk("lung"),
      diabetes: calculateRisk("diabetes"),
      pcod: calculateRisk("pcod"),
      thyroid: calculateRisk("thyroid"),
    };
    setSimulatedRisks(newRisks);
    setHasAnalyzed(true);
  };

  const getRiskColor = (risk: number) => {
    if (risk >= 70) return "text-red-400";
    if (risk >= 40) return "text-yellow-400";
    return "text-green-400";
  };

  const getRiskBgColor = (risk: number) => {
    if (risk >= 70) return "bg-red-500";
    if (risk >= 40) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getRiskLabel = (risk: number) => {
    if (risk >= 70) return "High Risk";
    if (risk >= 40) return "Moderate Risk";
    if (risk > 0) return "Low Risk";
    return "Not Assessed";
  };

  const getDifferenceInfo = (current: number, simulated: number) => {
    const diff = simulated - current;
    if (diff < 0) {
      return { value: diff, color: "text-green-400", bgColor: "bg-green-500/20", icon: TrendingDown, label: "Improved" };
    } else if (diff > 0) {
      return { value: `+${diff}`, color: "text-red-400", bgColor: "bg-red-500/20", icon: TrendingUp, label: "Increased" };
    }
    return { value: 0, color: "text-slate-400", bgColor: "bg-slate-500/20", icon: Minus, label: "No Change" };
  };

  return (
    <div className="min-h-screen bg-[#0B1220]">
      {/* Header */}
      <div className="bg-[#0f172a] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back to Dashboard</span>
              </Link>
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

      <main className="p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Lifestyle Simulator</h1>
            <p className="text-slate-400">Adjust your lifestyle habits to see how they affect your health risk</p>
          </div>

          {/* Risk Comparison Summary */}
          <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 lg:p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">Risk Comparison Summary</h2>
            </div>
            <p className="text-slate-400 mb-6">Compare your current risk with simulated risk based on lifestyle changes</p>

            {/* Risk Comparison Table */}
            <div className="overflow-x-auto mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-4 text-sm font-bold text-slate-300 uppercase tracking-wider">Disease</th>
                    <th className="text-center py-4 px-4 text-sm font-bold text-slate-300 uppercase tracking-wider">Current Risk</th>
                    <th className="text-center py-4 px-4 text-sm font-bold text-slate-300 uppercase tracking-wider">Simulated Risk</th>
                    <th className="text-center py-4 px-4 text-sm font-bold text-slate-300 uppercase tracking-wider">Risk Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(diseases).map(([key, disease]) => {
                    const Icon = disease.icon;
                    const current = currentRisks[key as keyof typeof currentRisks];
                    const simulated = hasAnalyzed ? simulatedRisks[key as keyof typeof simulatedRisks] : 0;
                    const diffInfo = getDifferenceInfo(current, simulated);
                    const DiffIcon = diffInfo.icon;

                    return (
                      <tr key={key} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg ${disease.bgColor} flex items-center justify-center`}>
                              <Icon className={`w-5 h-5 ${disease.color}`} />
                            </div>
                            <span className="font-semibold text-white">{disease.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`text-2xl font-bold ${getRiskColor(current)}`}>{current}%</span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {hasAnalyzed ? (
                            <span className={`text-2xl font-bold ${getRiskColor(simulated)}`}>{simulated}%</span>
                          ) : (
                            <span className="text-slate-500 text-lg">--</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {hasAnalyzed ? (
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${diffInfo.bgColor}`}>
                              <DiffIcon className={`w-4 h-4 ${diffInfo.color}`} />
                              <span className={`font-bold ${diffInfo.color}`}>{diffInfo.value}%</span>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-lg">--</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bar Graph Comparison */}
            <div className="mt-8">
              <h3 className="text-lg font-bold text-white mb-6">Risk Comparison Chart</h3>
              <div className="space-y-6">
                {Object.entries(diseases).map(([key, disease]) => {
                  const Icon = disease.icon;
                  const current = currentRisks[key as keyof typeof currentRisks];
                  const simulated = hasAnalyzed ? simulatedRisks[key as keyof typeof simulatedRisks] : 0;

                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`w-4 h-4 ${disease.color}`} />
                        <span className="text-sm font-semibold text-white">{disease.name}</span>
                      </div>
                      
                      {/* Current Risk Bar */}
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 w-20">Current</span>
                        <div className="flex-1 bg-[#1e293b] rounded-full h-6 relative overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${current}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`${disease.barColor} h-6 rounded-full flex items-center justify-end pr-3`}
                          >
                            <span className="text-xs font-bold text-white">{current}%</span>
                          </motion.div>
                        </div>
                      </div>

                      {/* Simulated Risk Bar */}
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 w-20">Simulated</span>
                        <div className="flex-1 bg-[#1e293b] rounded-full h-6 relative overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: hasAnalyzed ? `${simulated}%` : "0%" }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`${hasAnalyzed ? disease.barColor : "bg-slate-600"} h-6 rounded-full opacity-60 flex items-center justify-end pr-3`}
                          >
                            {hasAnalyzed && <span className="text-xs font-bold text-white">{simulated}%</span>}
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-8 mt-6 pt-6 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-cyan-500 rounded"></div>
                  <span className="text-sm text-slate-400">Current Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-cyan-500 opacity-60 rounded"></div>
                  <span className="text-sm text-slate-400">Simulated Risk</span>
                </div>
              </div>
            </div>
          </div>

          {/* Adjust Lifestyle Habits */}
          <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 lg:p-8">
            <h2 className="text-2xl font-bold text-white mb-2">Adjust Lifestyle Habits</h2>
            <p className="text-slate-400 mb-8">Change the options below and click "Analyze Risk" to see how lifestyle changes affect your risk</p>

            <div className="space-y-10">
              {Object.entries(diseases).map(([key, disease]) => {
                const Icon = disease.icon;
                const current = currentRisks[key as keyof typeof currentRisks];
                const simulated = hasAnalyzed ? simulatedRisks[key as keyof typeof simulatedRisks] : 0;

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${disease.bgColor} rounded-2xl p-6 border border-white/5`}
                  >
                    {/* Disease Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#0B1220] flex items-center justify-center">
                          <Icon className={`w-6 h-6 ${disease.color}`} />
                        </div>
                        <h3 className="text-xl font-bold text-white">{disease.name}</h3>
                      </div>
                      
                      {/* Risk Summary */}
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Current</p>
                          <p className={`text-2xl font-bold ${getRiskColor(current)}`}>{current}%</p>
                        </div>
                        {hasAnalyzed && (
                          <>
                            <div className="text-2xl text-slate-600">→</div>
                            <div className="text-center">
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Simulated</p>
                              <p className={`text-2xl font-bold ${getRiskColor(simulated)}`}>{simulated}%</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Questions Grid */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-4">
                      {disease.questions.map((q, qIndex) => (
                        <div key={qIndex} className="bg-[#0B1220] p-4 rounded-xl">
                          <label className="block text-sm font-bold text-white mb-2">{q.question}</label>
                          <select
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/30 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                            value={answers[key][qIndex]}
                            onChange={(e) => handleAnswerChange(key, qIndex, e.target.value)}
                          >
                            <option value="">Select an option</option>
                            {q.options.map((option, oIndex) => (
                              <option key={oIndex} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>

                    {/* Risk Progress Bar */}
                    <div className="h-2 bg-[#0B1220] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${getRiskBgColor(hasAnalyzed ? simulated : current)}`}
                        style={{ width: `${hasAnalyzed ? simulated : current}%` }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Analyze Risk Button */}
            <div className="flex justify-center mt-10">
              <button
                onClick={analyzeRisk}
                className="px-12 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-[#0B1220] font-bold text-lg rounded-full transition-all duration-200 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
              >
                Analyze Risk
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
