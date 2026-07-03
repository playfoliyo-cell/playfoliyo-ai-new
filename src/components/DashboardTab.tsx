import React, { useState, useEffect } from "react";
import { User, Profile } from "../types";
import { Sparkles, Trophy, Eye, ClipboardList, CheckCircle, Activity, Loader2, ListChecks, Award, MessageSquare, Send, RefreshCw } from "lucide-react";

interface DashboardTabProps {
  user: User;
  profile: Profile | null;
  onTabChange: (tab: string) => void;
  applicationsCount: number;
}

interface AIAnalysis {
  recruitmentScore: number;
  profileStrength: number;
  summary: string;
  recommendations: string[];
  nextActions: { title: string; description: string; checked?: boolean }[];
}

export default function DashboardTab({ user, profile, onTabChange, applicationsCount }: DashboardTabProps) {
  const [aiData, setAiData] = useState<AIAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [profileViews, setProfileViews] = useState(12); // Simulated realistic starting view logs
  const [localActions, setLocalActions] = useState<{ title: string; description: string; checked: boolean }[]>([
    { title: "Fill basic information", description: "Add sport, position, gender, location, and a bio", checked: !!profile?.sport && !!profile?.bio },
    { title: "Complete sports resume details", description: "Enter current team and experience years", checked: !!profile?.current_team },
    { title: "Document tournament achievements", description: "Write down medals or wins", checked: !!profile?.achievements },
    { title: "Upload official verification documents", description: "Submit passport or federation registration certificate", checked: user.verification_status === "approved" },
  ]);

  // Chatbot states
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "scout"; text: string; time: string }[]>([
    {
      role: "scout",
      text: `Hi ${user.name}! 👋 I am Coach PlayFoliyo, your virtual scouting & athletic career coach. What are you training for today? Let's discuss how you can optimize your player resume metrics, prepare for upcoming trials, or design diet and workout plans.`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [sendingChat, setSendingChat] = useState(false);

  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || sendingChat) return;

    const userMsg = { role: "user" as const, text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setChatMessages(prev => [...prev, userMsg]);
    setInputText("");
    setSendingChat(true);

    try {
      const res = await fetch("/api/ai/scout-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          message: text,
          history: chatMessages.map(m => ({ role: m.role === "user" ? "user" : "model", text: m.text }))
        })
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        setChatMessages(prev => [...prev, {
          role: "scout",
          text: data.reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }]);
      } else {
        setChatMessages(prev => [...prev, {
          role: "scout",
          text: "I experienced a temporary network latency. Please try again! Remember you can always complete your basic information to help me give better advice.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }]);
      }
    } catch (err) {
      console.error("Scout chatbot error:", err);
      setChatMessages(prev => [...prev, {
        role: "scout",
        text: "I had trouble connecting to the PlayFoliyo server. Please check your internet connection.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }]);
    } finally {
      setSendingChat(false);
    }
  };

  const handleSendQuickPrompt = (promptText: string) => {
    setInputText("");
    const text = promptText.trim();
    const userMsg = { role: "user" as const, text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setChatMessages(prev => [...prev, userMsg]);
    setSendingChat(true);

    fetch("/api/ai/scout-advisor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        message: text,
        history: chatMessages.map(m => ({ role: m.role === "user" ? "user" : "model", text: m.text }))
      })
    }).then(res => res.json())
      .then(data => {
        if (data.reply) {
          setChatMessages(prev => [...prev, {
            role: "scout",
            text: data.reply,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }]);
        } else {
          setChatMessages(prev => [...prev, {
            role: "scout",
            text: "I experienced a brief server timeout. Let's try that again!",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }]);
        }
      })
      .catch(err => {
        console.error(err);
        setChatMessages(prev => [...prev, {
          role: "scout",
          text: "Trouble connecting. Please try again in a moment.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }]);
      })
      .finally(() => {
        setSendingChat(false);
      });
  };

  // Run initial lightweight analysis
  const runAIAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/ai/analyze-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      setAiData(data);

      if (data.nextActions) {
        setLocalActions(data.nextActions.map((item: any) => ({ ...item, checked: false })));
      }
    } catch (e) {
      console.error("AI analysis error:", e);
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleAction = (index: number) => {
    const updated = [...localActions];
    updated[index].checked = !updated[index].checked;
    setLocalActions(updated);

    // Adjust score reactively when action checked
    if (aiData) {
      const diff = updated[index].checked ? 4 : -4;
      setAiData({
        ...aiData,
        recruitmentScore: Math.min(100, Math.max(0, aiData.recruitmentScore + diff)),
        profileStrength: Math.min(100, Math.max(0, aiData.profileStrength + diff)),
      });
    }
  };

  // Helper for scoring tier labels
  const getScoreTier = (score: number) => {
    if (score >= 90) return { label: "Elite Pro Prospect", color: "text-emerald-600 bg-emerald-50 border-emerald-100" };
    if (score >= 75) return { label: "Strong Regional Prospect", color: "text-blue-600 bg-blue-50 border-blue-100" };
    if (score >= 55) return { label: "Emerging Athlete Talent", color: "text-amber-600 bg-amber-50 border-amber-100" };
    return { label: "Needs Profile Updates", color: "text-slate-500 bg-slate-50 border-slate-100" };
  };

  // Run once on load to get initial calculations
  useEffect(() => {
    runAIAnalysis();
    // Simulate incremental views
    const interval = setInterval(() => {
      setProfileViews(prev => prev + Math.floor(Math.random() * 2));
    }, 15000);
    return () => clearInterval(interval);
  }, [user.id, profile?.sport]);

  const defaultPicPlaceholder = "photo-1535713875002-d1d0cf377fde";
  const hasProfilePic = !!profile?.profile_pic && !profile.profile_pic.includes(defaultPicPlaceholder);
  const hasBio = !!profile?.bio && profile.bio.trim().length > 10;
  const hasSportMetrics = !!profile?.sport && (
    !!profile.position || 
    !!profile.height || 
    !!profile.weight || 
    !!profile.experience || 
    !!profile.coaching_level || 
    !!profile.rankings
  );
  const hasUploadedDocs = (user.verification_status === "pending" || user.verification_status === "approved") || 
    (!!profile?.certifications && profile.certifications.trim().length > 0);

  let calculatedStrength = 0;
  if (hasProfilePic) calculatedStrength += 25;
  if (hasBio) calculatedStrength += 25;
  if (hasSportMetrics) calculatedStrength += 25;
  if (hasUploadedDocs) calculatedStrength += 25;

  const strengthPercentage = calculatedStrength;
  const recruitmentScore = aiData?.recruitmentScore || (profile?.sport ? 75 : 45);
  const tier = getScoreTier(recruitmentScore);

  return (
    <div className="space-y-5 pb-8">
      
      {/* Overview Analytics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Core Strength / Completeness */}
        <div className="bg-white border border-slate-100 hover:border-slate-200 p-4 rounded-xl shadow-xs transition-all duration-300">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">CV Progress</span>
            <Activity className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{strengthPercentage}%</span>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${strengthPercentage}%` }}></div>
          </div>
        </div>

        {/* Profile Views */}
        <div className="bg-white border border-slate-100 hover:border-slate-200 p-4 rounded-xl shadow-xs transition-all duration-300">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Profile Impressions</span>
            <Eye className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{profileViews}</span>
          <p className="text-[9px] text-emerald-600 font-bold mt-1">▲ 15% this week</p>
        </div>

        {/* Total followers */}
        <div className="bg-white border border-slate-100 hover:border-slate-200 p-4 rounded-xl shadow-xs transition-all duration-300">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Scout Tracking</span>
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{profile?.followers?.length || 0}</span>
          <p className="text-[9px] text-slate-400 mt-1">Coaches monitoring you</p>
        </div>

        {/* Total applications */}
        <div className="bg-white border border-slate-100 hover:border-slate-200 p-4 rounded-xl shadow-xs transition-all duration-300">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Active Trials</span>
            <ClipboardList className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{applicationsCount}</span>
          <p className="text-[9px] text-blue-600 font-semibold mt-1 hover:underline cursor-pointer" onClick={() => onTabChange("opportunities")}>
            View active trials
          </p>
        </div>
      </div>

      {/* Main Section: bento-style 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: AI Scouting & Recruitment Assessment Card (lg:col-span-8) */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-3 gap-3">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500 fill-blue-50" />
                <span>AI Scouting & Recruitment Assessment</span>
              </h2>
              <p className="text-[10px] text-slate-500 mt-0.5">Real-time performance metrics powered by Google Gemini.</p>
            </div>
            
            <button
              id="dashboard-re-analyze-btn"
              onClick={runAIAnalysis}
              disabled={analyzing}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 text-blue-400" />
                  <span>Refresh Review</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
            {/* Left radial/gauge representation */}
            <div className="sm:col-span-4 flex flex-col items-center text-center p-4 bg-slate-50/70 rounded-xl border border-slate-100/80">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Recruitment Rating</span>
              
              <div className="relative w-28 h-28 flex items-center justify-center">
                {/* SVG circular progress ring */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    className="stroke-slate-100"
                    strokeWidth="5"
                    fill="transparent"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    className="stroke-blue-600 transition-all duration-1000 shadow-lg"
                    strokeWidth="5"
                    fill="transparent"
                    strokeDasharray={289}
                    strokeDashoffset={289 - (289 * recruitmentScore) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-black text-slate-900 tracking-tight">{recruitmentScore}%</span>
                  <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider mt-0.5">Scout Score</span>
                </div>
              </div>

              <div className={`mt-3 px-2.5 py-1 rounded-full border text-[9px] font-bold leading-none ${tier.color}`}>
                {tier.label}
              </div>
            </div>

            {/* AI Summary statements */}
            <div className="sm:col-span-8 space-y-4">
              {analyzing ? (
                <div className="space-y-2.5 py-2">
                  <div className="h-3 bg-slate-100 rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-slate-100 rounded animate-pulse w-5/6"></div>
                  <div className="h-3 bg-slate-100 rounded animate-pulse w-2/3"></div>
                </div>
              ) : aiData ? (
                <>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Executive Scout Assessment</span>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {aiData.summary}
                    </p>
                  </div>

                  <div className="space-y-1.5 border-t border-slate-100 pt-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Actionable Pro Recommendations</span>
                    <ul className="space-y-1.5">
                      {aiData.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-xs text-slate-600 flex items-start space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5"></span>
                          <span className="leading-tight">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-slate-400 font-medium">Click "Refresh Review" to trigger Gemini recruitment indexing.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Combined Pathway & CV Simulator Widget (lg:col-span-4) */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-xl p-4 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-150 pb-2.5">
            <ListChecks className="w-4 h-4 text-slate-400" />
            <h3 className="font-bold text-slate-800 text-xs">Pathway CV Completeness</h3>
          </div>

          <div className="space-y-1.5 p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completeness Index</span>
              <span className="text-lg font-black text-slate-800">{strengthPercentage}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  strengthPercentage >= 100 ? "bg-emerald-500" : strengthPercentage >= 75 ? "bg-blue-600" : strengthPercentage >= 50 ? "bg-amber-500" : "bg-rose-500"
                }`}
                style={{ width: `${strengthPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Starter</span>
              <span>Professional</span>
              <span>Pro Verified</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block px-1">Simulated Checklist Tasks</span>
            <div className="space-y-1.5">
              {localActions.map((item, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg border transition-all flex items-start space-x-2.5 cursor-pointer ${
                    item.checked
                      ? "bg-slate-50/30 border-slate-150/80"
                      : "bg-white border-slate-100 hover:border-slate-150"
                  }`}
                  onClick={() => toggleAction(index)}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      item.checked ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300"
                    }`}
                  >
                    {item.checked && (
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <span className={`text-[10px] font-bold block ${item.checked ? "text-slate-400 line-through font-medium" : "text-slate-700"}`}>
                      {item.title}
                    </span>
                    <span className="text-[9px] text-slate-400 leading-tight block">
                      {item.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            id="dashboard-complete-cv-btn"
            onClick={() => onTabChange("profile")}
            className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-[10px] py-2 rounded-lg border border-blue-100 transition-colors text-center cursor-pointer block mt-1"
          >
            Update Sports Profile CV
          </button>
        </div>

      </div>

      {/* Interactive AI Scout Advisor Chat Room */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 gap-3">
          <div className="flex items-center space-x-3.5">
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20 shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-tight flex items-center gap-2">
                <span>PlayFoliyo AI Scout Chat Advisor</span>
                <span className="text-[8px] bg-blue-500/20 text-blue-400 font-black px-2 py-0.5 rounded-full border border-blue-500/30 tracking-wider">COACH MODE</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Ask questions about trial preparation, sports nutrition, exercise drills, or scout requirements.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setChatMessages([
              {
                role: "scout",
                text: `Hi ${user.name}! 👋 I am Coach PlayFoliyo, your virtual scouting & athletic career coach. What are you training for today? Let's discuss how you can optimize your player resume metrics, prepare for upcoming trials, or design diet and workout plans.`,
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              }
            ])}
            className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-xl border border-white/10 transition-all cursor-pointer"
            title="Reset Conversation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Chat</span>
          </button>
        </div>

        {/* Chat Message Thread */}
        <div className="space-y-4 max-h-80 overflow-y-auto p-4 bg-slate-950/40 rounded-2xl border border-slate-800/80 scrollbar-thin">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2.5`}>
              {msg.role === 'scout' && (
                <div className="w-7 h-7 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-md">
                  PF
                </div>
              )}
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#1D4ED8] text-white rounded-br-none shadow-md'
                  : 'bg-slate-800/90 text-slate-100 border border-slate-700/50 rounded-bl-none'
              }`}>
                <p className="whitespace-pre-line font-medium">{msg.text}</p>
                <span className="block text-[8px] text-slate-400 text-right mt-1.5 font-mono">{msg.time}</span>
              </div>
            </div>
          ))}
          {sendingChat && (
            <div className="flex justify-start items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center text-[10px] font-black shrink-0 animate-pulse">
                PF
              </div>
              <div className="bg-slate-800/90 text-slate-400 text-xs px-4 py-2.5 rounded-2xl border border-slate-700/50 rounded-bl-none flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                <span className="font-medium">Coach is analyzing...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            "How do I get noticed by pro scouts?",
            "What metrics should I add for Cricket/Soccer?",
            "Suggest a workout plan for speed & endurance",
            "What is a standard athlete diet before a trial?"
          ].map((promptText, idx) => (
            <button
              key={idx}
              type="button"
              disabled={sendingChat}
              onClick={() => handleSendQuickPrompt(promptText)}
              className="text-[10px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-50 px-3.5 py-1.5 rounded-full border border-slate-700/60 transition-all cursor-pointer font-semibold"
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* Input box */}
        <form onSubmit={handleSendChat} className="flex gap-2 pt-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={sendingChat}
            placeholder={`Ask Coach PlayFoliyo a question (e.g., "how do I prepare for selection trials?")...`}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-hidden focus:border-blue-500 placeholder-slate-500 font-medium"
          />
          <button
            type="submit"
            disabled={sendingChat || !inputText.trim()}
            className="bg-[#1D4ED8] hover:bg-blue-700 disabled:opacity-50 text-white p-3 rounded-xl transition-all shrink-0 cursor-pointer flex items-center justify-center shadow-lg shadow-blue-500/10"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
