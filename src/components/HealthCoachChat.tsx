"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { PerformanceAwareMotion } from "@/components/performance";
import {
  MessageCircle,
  Send,
  X,
  Bot,
  User,
  Moon,
  Utensils,
  Activity,
  Heart,
  Calendar,
  ChevronRight,
  Loader2,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface WeeklyPlan {
  day: string;
  sleep: string;
  diet: string;
  activity: string;
  mindfulness: string;
}

function generateWeeklyPlan(): WeeklyPlan[] {
  return [
    { day: "Monday", sleep: "7.5 hrs target", diet: "Reduce sugar 20%", activity: "5000 steps", mindfulness: "5 min breathing" },
    { day: "Tuesday", sleep: "Sleep by 10:30 PM", diet: "Add 2 vegetables", activity: "20 min walk", mindfulness: "Gratitude journal" },
    { day: "Wednesday", sleep: "No screens after 9 PM", diet: "Protein breakfast", activity: "6000 steps", mindfulness: "Body scan" },
    { day: "Thursday", sleep: "8 hrs target", diet: "Meal prep lunch", activity: "Light stretching", mindfulness: "Nature break" },
    { day: "Friday", sleep: "Consistent wake time", diet: "Hydration focus", activity: "5000 steps", mindfulness: "Social connection" },
    { day: "Saturday", sleep: "7.5 hrs minimum", diet: "Cook healthy meal", activity: "30 min activity", mindfulness: "Hobby time" },
    { day: "Sunday", sleep: "Prep for week", diet: "Meal planning", activity: "Rest/light walk", mindfulness: "Week reflection" },
  ];
}

const quickSuggestions = [
  "How can I improve my sleep quality?",
  "What foods should I avoid for heart health?",
  "Give me a beginner exercise plan",
  "How do I manage stress better?",
];

export function HealthCoachChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [showWeeklyPlan, setShowWeeklyPlan] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Hi! I'm your AI Health Coach powered by advanced AI. I can help you with personalized advice on sleep, nutrition, exercise, and stress management.\n\nBased on your profile, I can provide tailored recommendations for heart health, diabetes prevention, lung health, thyroid management, and PCOD/PCOS support.\n\nWhat would you like to focus on today?",
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: content.trim(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No reader available");
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, assistantMessage]);

      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // Plain text stream - just append directly
        fullContent += chunk;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id ? { ...m, content: fullContent } : m
          )
        );
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const handleQuickSend = (text: string) => {
    sendMessage(text);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    const message = inputValue;
    setInputValue("");
    sendMessage(message);
  };


  const weeklyPlan = generateWeeklyPlan();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full shadow-lg shadow-cyan-500/25 flex items-center justify-center text-white z-50 hover:scale-105 active:scale-95 transition-transform"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <PerformanceAwareMotion
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-[420px] h-[600px] bg-[#0a0f1a] border border-cyan-500/20 rounded-2xl shadow-2xl shadow-black/50 flex flex-col z-50 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-cyan-500/10 to-teal-500/10 border-b border-white/5 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">AI Health Coach</h3>
                  <p className="text-cyan-400 text-xs flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    Powered by GPT-4
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowWeeklyPlan(!showWeeklyPlan)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  title="Weekly Plan"
                >
                  <Calendar className="w-5 h-5 text-slate-400" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showWeeklyPlan && (
                <PerformanceAwareMotion
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-b border-white/5 overflow-hidden"
                >
                  <div className="p-4 bg-slate-800/30">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-cyan-400" />
                      Your Weekly Health Plan
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {weeklyPlan.map((day) => (
                        <div
                          key={day.day}
                          className="flex items-center gap-3 p-2 bg-slate-900/50 rounded-lg text-xs"
                        >
                          <span className="text-cyan-400 font-bold w-16">{day.day.slice(0, 3)}</span>
                          <span className="text-slate-400 flex-1 truncate" title={day.diet}>
                            {day.diet}
                          </span>
                          <span className="text-slate-500">{day.activity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </PerformanceAwareMotion>
              )}
            </AnimatePresence>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <PerformanceAwareMotion
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[280px] ${
                      message.role === "user"
                        ? "bg-cyan-500 text-white rounded-2xl rounded-tr-sm"
                        : "bg-slate-800/50 text-slate-200 rounded-2xl rounded-tl-sm border border-white/5"
                    } p-3`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {message.role === "assistant" && message.id === "welcome" && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {quickSuggestions.slice(0, 2).map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => handleQuickSend(suggestion)}
                            className="px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs rounded-full border border-cyan-500/20 transition-colors flex items-center gap-1"
                          >
                            {suggestion.slice(0, 25)}...
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                </PerformanceAwareMotion>
              ))}

              {isLoading && (
                <PerformanceAwareMotion
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-slate-800/50 rounded-2xl rounded-tl-sm p-3 border border-white/5">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </PerformanceAwareMotion>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="px-4 py-2 border-t border-white/5 flex gap-2 overflow-x-auto">
              {[
                { icon: Moon, label: "Sleep", color: "text-purple-400" },
                { icon: Utensils, label: "Diet", color: "text-orange-400" },
                { icon: Activity, label: "Exercise", color: "text-green-400" },
                { icon: Heart, label: "Stress", color: "text-red-400" },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleQuickSend(`Help me with ${action.label.toLowerCase()}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 rounded-full text-xs text-slate-400 hover:text-white transition-colors whitespace-nowrap"
                >
                  <action.icon className={`w-3 h-3 ${action.color}`} />
                  {action.label}
                </button>
              ))}
            </div>

            <form id="chat-form" onSubmit={onFormSubmit} className="p-4 border-t border-white/5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="Ask your health coach..."
                  className="flex-1 bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/30"
                />
                <button
                  type="submit"
                  disabled={!inputValue?.trim() || isLoading}
                  className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </form>
          </PerformanceAwareMotion>
        )}
      </AnimatePresence>
    </>
  );
}
