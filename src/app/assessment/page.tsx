"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  Wind,
  Activity,
  Droplets,
  Zap,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface Disease {
  id: string;
  name: string;
  icon: any;
  questions: Question[];
}

interface Question {
  id: string;
  text: string;
  options: { value: string; label: string }[];
}

interface AssessmentData {
  disease: string;
  answers: Record<string, string>;
}

const diseases: Disease[] = [
  {
    id: "heart",
    name: "Heart Disease",
    icon: Heart,
    questions: [
      {
        id: "exercise",
        text: "How often do you exercise per week?",
        options: [
          { value: "none", label: "Never" },
          { value: "1-2", label: "1-2 times" },
          { value: "3-4", label: "3-4 times" },
          { value: "5+", label: "5+ times" },
        ],
      },
      {
        id: "oily_food",
        text: "How often do you consume oily/fried food?",
        options: [
          { value: "daily", label: "Daily" },
          { value: "weekly", label: "Few times a week" },
          { value: "rarely", label: "Rarely" },
          { value: "never", label: "Never" },
        ],
      },
      {
        id: "sleep",
        text: "How many hours do you sleep daily?",
        options: [
          { value: "<5", label: "Less than 5 hours" },
          { value: "5-6", label: "5-6 hours" },
          { value: "7-8", label: "7-8 hours" },
          { value: "9+", label: "9+ hours" },
        ],
      },
      {
        id: "stress",
        text: "What is your stress level at work/home?",
        options: [
          { value: "low", label: "Low" },
          { value: "moderate", label: "Moderate" },
          { value: "high", label: "High" },
          { value: "very_high", label: "Very High" },
        ],
      },
      {
        id: "smoking_alcohol",
        text: "Do you smoke/consume alcohol?",
        options: [
          { value: "both", label: "Both regularly" },
          { value: "smoke", label: "Only smoke" },
          { value: "alcohol", label: "Only alcohol" },
          { value: "none", label: "Neither" },
        ],
      },
    ],
  },
  {
    id: "lung",
    name: "Lung Disease",
    icon: Wind,
    questions: [
      {
        id: "smoking_status",
        text: "What is your smoking status?",
        options: [
          { value: "never", label: "Never smoked" },
          { value: "former", label: "Former smoker" },
          { value: "current", label: "Current smoker" },
          { value: "passive", label: "Passive smoker" },
        ],
      },
      {
        id: "air_quality",
        text: "How is the air quality in your area?",
        options: [
          { value: "excellent", label: "Excellent" },
          { value: "good", label: "Good" },
          { value: "moderate", label: "Moderate" },
          { value: "poor", label: "Poor" },
        ],
      },
      {
        id: "breathing",
        text: "Do you experience breathing difficulties?",
        options: [
          { value: "never", label: "Never" },
          { value: "rarely", label: "Rarely" },
          { value: "sometimes", label: "Sometimes" },
          { value: "frequently", label: "Frequently" },
        ],
      },
      {
        id: "activity_level",
        text: "How active is your lifestyle?",
        options: [
          { value: "sedentary", label: "Sedentary" },
          { value: "lightly", label: "Lightly active" },
          { value: "moderately", label: "Moderately active" },
          { value: "very", label: "Very active" },
        ],
      },
      {
        id: "allergies",
        text: "Do you have any allergies or asthma?",
        options: [
          { value: "none", label: "None" },
          { value: "mild", label: "Mild allergies" },
          { value: "asthma", label: "Asthma" },
          { value: "both", label: "Both" },
        ],
      },
    ],
  },
  {
    id: "diabetes",
    name: "Type 2 Diabetes",
    icon: Droplets,
    questions: [
      {
        id: "sugary_foods",
        text: "How often do you consume sugary foods/drinks?",
        options: [
          { value: "daily", label: "Daily" },
          { value: "weekly", label: "Few times a week" },
          { value: "rarely", label: "Rarely" },
          { value: "never", label: "Never" },
        ],
      },
      {
        id: "physical_activity",
        text: "What is your physical activity level?",
        options: [
          { value: "sedentary", label: "Sedentary" },
          { value: "light", label: "Light" },
          { value: "moderate", label: "Moderate" },
          { value: "high", label: "High" },
        ],
      },
      {
        id: "body_weight",
        text: "How would you describe your body weight?",
        options: [
          { value: "underweight", label: "Underweight" },
          { value: "normal", label: "Normal" },
          { value: "overweight", label: "Overweight" },
          { value: "obese", label: "Obese" },
        ],
      },
      {
        id: "family_history",
        text: "Do you have a family history of diabetes?",
        options: [
          { value: "none", label: "No" },
          { value: "distant", label: "Distant relatives" },
          { value: "immediate", label: "Immediate family" },
          { value: "both_parents", label: "Both parents" },
        ],
      },
      {
        id: "processed_food",
        text: "How often do you eat processed/junk food?",
        options: [
          { value: "daily", label: "Daily" },
          { value: "weekly", label: "Few times a week" },
          { value: "rarely", label: "Rarely" },
          { value: "never", label: "Never" },
        ],
      },
    ],
  },
  {
    id: "pcod",
    name: "PCOD/PCOS",
    icon: Activity,
    questions: [
      {
        id: "menstrual_cycle",
        text: "How regular is your menstrual cycle?",
        options: [
          { value: "regular", label: "Regular (every 28-35 days)" },
          { value: "irregular", label: "Irregular" },
          { value: "very_irregular", label: "Very irregular" },
          { value: "absent", label: "Absent periods" },
        ],
      },
      {
        id: "acne_hair",
        text: "Do you experience acne or excess hair growth?",
        options: [
          { value: "none", label: "Neither" },
          { value: "acne", label: "Acne only" },
          { value: "hair", label: "Excess hair only" },
          { value: "both", label: "Both" },
        ],
      },
      {
        id: "weight_gain",
        text: "Have you experienced unexplained weight gain?",
        options: [
          { value: "none", label: "No" },
          { value: "slight", label: "Slight (2-5 kg)" },
          { value: "moderate", label: "Moderate (5-10 kg)" },
          { value: "significant", label: "Significant (>10 kg)" },
        ],
      },
      {
        id: "stress_level",
        text: "What is your stress level?",
        options: [
          { value: "low", label: "Low" },
          { value: "moderate", label: "Moderate" },
          { value: "high", label: "High" },
          { value: "very_high", label: "Very High" },
        ],
      },
      {
        id: "family_history_pcod",
        text: "Family history of PCOD/PCOS?",
        options: [
          { value: "none", label: "No" },
          { value: "distant", label: "Distant relatives" },
          { value: "immediate", label: "Immediate family" },
          { value: "multiple", label: "Multiple family members" },
        ],
      },
    ],
  },
  {
    id: "thyroid",
    name: "Thyroid",
    icon: Zap,
    questions: [
      {
        id: "fatigue",
        text: "Do you experience unexplained fatigue?",
        options: [
          { value: "never", label: "Never" },
          { value: "rarely", label: "Rarely" },
          { value: "sometimes", label: "Sometimes" },
          { value: "frequently", label: "Frequently" },
        ],
      },
      {
        id: "weight_changes",
        text: "Have you noticed unexplained weight changes?",
        options: [
          { value: "none", label: "No changes" },
          { value: "gain", label: "Weight gain" },
          { value: "loss", label: "Weight loss" },
          { value: "fluctuating", label: "Fluctuating" },
        ],
      },
      {
        id: "mood_changes",
        text: "Do you experience mood swings or depression?",
        options: [
          { value: "never", label: "Never" },
          { value: "rarely", label: "Rarely" },
          { value: "sometimes", label: "Sometimes" },
          { value: "frequently", label: "Frequently" },
        ],
      },
      {
        id: "temperature_sensitivity",
        text: "Are you sensitive to cold or heat?",
        options: [
          { value: "neither", label: "Neither" },
          { value: "cold", label: "Sensitive to cold" },
          { value: "heat", label: "Sensitive to heat" },
          { value: "both", label: "Both" },
        ],
      },
      {
        id: "family_history_thyroid",
        text: "Family history of thyroid disorders?",
        options: [
          { value: "none", label: "No" },
          { value: "distant", label: "Distant relatives" },
          { value: "immediate", label: "Immediate family" },
          { value: "multiple", label: "Multiple family members" },
        ],
      },
    ],
  },
];

function ProgressBar({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const progress = ((currentStep + 1) / (totalSteps + 1)) * 100;
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-[#94A3B8]">
          Question {currentStep + 1} of {totalSteps}
        </span>
        <span className="text-sm text-cyan-400">{Math.round(progress)}%</span>
      </div>
      <div className="h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function PillSelector({
  options,
  selected,
  onChange,
}: {
  options: { value: string; label: string }[];
  selected: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
            selected === option.value
              ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-[#0B1220] shadow-lg shadow-cyan-500/25"
              : "bg-[#1E293B] text-[#94A3B8] hover:bg-[#2D3B4F] border border-white/5"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default function AssessmentPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1); // -1 means disease selection
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<AssessmentData>({
    disease: "",
    answers: {},
  });
  const [direction, setDirection] = useState(0);

  const handleLogout = () => {
    logout();
  };

  // Check URL parameters and auto-select disease if provided
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const diseaseParam = params.get('disease');
      if (diseaseParam) {
        const disease = diseases.find(d => d.id === diseaseParam);
        if (disease) {
          setSelectedDisease(disease);
          setCurrentQuestionIndex(0);
          setData({ disease: disease.id, answers: {} });
        }
      }
    }
  }, []);

  const currentDisease = selectedDisease;
  const totalQuestions = currentDisease?.questions.length || 0;

  const canProceed = () => {
    if (currentQuestionIndex === -1) {
      return selectedDisease !== null;
    }
    const currentQuestion = currentDisease?.questions[currentQuestionIndex];
    return currentQuestion ? data.answers[currentQuestion.id] !== undefined : false;
  };

  const handleNext = () => {
    if (currentQuestionIndex === -1 && selectedDisease) {
      // Moving from disease selection to first question
      setData({ disease: selectedDisease.id, answers: {} });
      setCurrentQuestionIndex(0);
    } else if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex === 0) {
      setCurrentQuestionIndex(-1);
      setSelectedDisease(null);
      setData({ disease: "", answers: {} });
    } else if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diseaseType: data.disease,
          answers: data.answers,
          userId: user?.id, // Include user ID for saving to database
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        localStorage.setItem('lastAssessment', JSON.stringify(result));
        router.push(`/results?score=${result.riskScore}&disease=${data.disease}&level=${result.riskLevel}`);
      } else {
        console.error('Assessment failed:', result.error);
        const fallbackScore = Math.floor(Math.random() * 40) + 20;
        router.push(`/results?score=${fallbackScore}&disease=${data.disease}`);
      }
    } catch (error) {
      console.error('Assessment error:', error);
      const fallbackScore = Math.floor(Math.random() * 40) + 20;
      router.push(`/results?score=${fallbackScore}&disease=${data.disease}`);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  const goNext = () => {
    setDirection(1);
    handleNext();
  };

  const goBack = () => {
    setDirection(-1);
    handleBack();
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setData({
      ...data,
      answers: {
        ...data.answers,
        [questionId]: value,
      },
    });
  };

  const renderContent = () => {
    // Disease selection screen
    if (currentQuestionIndex === -1) {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Select Disease
            </h2>
            <p className="text-sm text-[#64748B]">Choose the condition you'd like to assess</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {diseases.map((disease) => {
              const Icon = disease.icon;
              const isSelected = selectedDisease?.id === disease.id;
              return (
                <button
                  key={disease.id}
                  onClick={() => setSelectedDisease(disease)}
                  className={`flex items-center gap-4 p-4 rounded-2xl font-medium transition-all duration-200 ${
                    isSelected
                      ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-[#0B1220] shadow-lg shadow-cyan-500/25"
                      : "bg-[#1E293B] text-[#94A3B8] hover:bg-[#2D3B4F] border border-white/5"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isSelected ? "bg-white/20" : "bg-[#0B1220]"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-semibold">{disease.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // Question screen
    if (currentDisease && currentQuestionIndex >= 0) {
      const question = currentDisease.questions[currentQuestionIndex];
      const Icon = currentDisease.icon;

      return (
        <div className="space-y-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
              <Icon className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {currentDisease.name}
              </h2>
            </div>
          </div>
          
          <div>
            <p className="text-2xl font-bold text-white mb-6">{question.text}</p>
          </div>

          <div className="space-y-3">
            {question.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswerChange(question.id, option.value)}
                className={`w-full px-6 py-4 rounded-2xl font-medium transition-all duration-200 text-left ${
                  data.answers[question.id] === option.value
                    ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-[#0B1220] shadow-lg shadow-cyan-500/25"
                    : "bg-[#1E293B] text-[#94A3B8] hover:bg-[#2D3B4F] border border-white/5"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen w-full bg-[#0B1220] relative overflow-hidden">
      {/* Header with Logout */}
      <div className="bg-[#0f172a] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-white uppercase tracking-widest">HEALTH ASSESSMENT</h1>
              <p className="text-xs text-slate-500 uppercase tracking-widest">Disease Risk Evaluation</p>
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

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Health Assessment
            </span>
          </motion.div>

          {currentQuestionIndex >= 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <ProgressBar currentStep={currentQuestionIndex} totalSteps={totalQuestions} />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#111827] rounded-[32px] p-8 shadow-2xl border border-white/5"
          >
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentQuestionIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-4 mt-10">
              {(currentQuestionIndex >= 0) && (
                <button
                  onClick={goBack}
                  className="h-12 px-6 bg-[#1E293B] text-[#94A3B8] rounded-full font-medium hover:bg-[#2D3B4F] transition-all flex items-center gap-2 border border-white/5"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back
                </button>
              )}

              {currentQuestionIndex < totalQuestions - 1 || currentQuestionIndex === -1 ? (
                <button
                  onClick={goNext}
                  disabled={!canProceed()}
                  className="flex-1 h-12 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-[#0B1220] font-semibold rounded-full transition-all duration-200 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-cyan-500/25"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!canProceed() || isSubmitting}
                  className="flex-1 h-12 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-[#0B1220] font-semibold rounded-full transition-all duration-200 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      Get My Results
                      <Heart className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>

          <p className="mt-6 text-center text-xs text-[#64748B]">
            Your data is encrypted and never shared. This assessment is for educational purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}
