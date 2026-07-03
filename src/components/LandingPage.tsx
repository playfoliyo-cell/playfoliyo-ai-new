import React, { useState } from "react";
import { 
  Award, Shield, Search, Briefcase, Trophy, Sparkles, MessageSquare, 
  ArrowRight, UserPlus, LogIn, CheckCircle, Activity, Star, Users, 
  Calendar, ArrowUpRight, Check, Sparkle, Target, Zap, Globe, MapPin, 
  Filter, Play, FileText, ChevronRight, MessageCircle, Heart, Share2, Mail, Phone, Info, ShieldAlert
} from "lucide-react";
import { motion } from "motion/react";
import PlayFoliyoLogo from "./PlayFoliyoLogo";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const cardIn = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 90, damping: 14 }
  }
};

interface LandingPageProps {
  onJoin: () => void; // mapped to Signup
  onLogin: () => void;
  onExplore: () => void;
}

export default function LandingPage({ onJoin, onLogin, onExplore }: LandingPageProps) {
  const [isLandingLoading, setIsLandingLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLandingLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Local interactive states for the Landing Page demo widgets
  const [activeSportTab, setActiveSportTab] = useState<"football" | "basketball" | "cricket">("football");
  const [athleteSearchQuery, setAthleteSearchQuery] = useState("");
  const [selectedSportFilter, setSelectedSportFilter] = useState("all");

  // Sample athletes data for the Discover Athletes Preview (Section 8)
  const sampleAthletes = [
    {
      id: "ath-1",
      name: "Rahul Sharma",
      sports: ["Football", "Cricket"],
      position: "Midfielder / All-Rounder",
      country: "India",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
      isVerified: true,
      stats: { primary: "12 Goals", secondary: "24 Assists" },
    },
    {
      id: "ath-2",
      name: "Aarav 'The Storm' Sharma",
      sports: ["Football"],
      position: "Striker",
      country: "India",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150",
      isVerified: true,
      stats: { primary: "28 Goals", secondary: "10.9s (100m)" },
    },
    {
      id: "ath-3",
      name: "Priyanka Patel",
      sports: ["Basketball"],
      position: "Point Guard",
      country: "India",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
      isVerified: true,
      stats: { primary: "18.5 PPG", secondary: "6.2 APG" },
    },
    {
      id: "ath-4",
      name: "Kabir Dev",
      sports: ["Athletics", "Swimming"],
      position: "Sprinter",
      country: "India",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
      isVerified: false,
      stats: { primary: "10.45s 100m", secondary: "21.2s 200m" },
    },
    {
      id: "ath-5",
      name: "Ananya Sen",
      sports: ["Tennis"],
      position: "Single Player",
      country: "India",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150",
      isVerified: true,
      stats: { primary: "AITA Rank #42", secondary: "92% Win Rate" },
    },
    {
      id: "ath-6",
      name: "Rohan Das",
      sports: ["Cricket"],
      position: "Fast Bowler",
      country: "India",
      avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=150",
      isVerified: true,
      stats: { primary: "42 Wickets", secondary: "142 km/h" },
    },
  ];

  // Filtered athletes based on interactive selection
  const filteredAthletes = sampleAthletes.filter(ath => {
    const matchesSearch = ath.name.toLowerCase().includes(athleteSearchQuery.toLowerCase()) || 
                          ath.country.toLowerCase().includes(athleteSearchQuery.toLowerCase());
    const matchesSport = selectedSportFilter === "all" || ath.sports.includes(selectedSportFilter);
    return matchesSearch && matchesSport;
  });

  if (isLandingLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-blue-100 selection:text-[#1D4ED8] antialiased overflow-x-hidden">
        {/* Nav Skeleton */}
        <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200/80 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-slate-200 rounded-lg animate-pulse" />
                  <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                </div>
                <div className="hidden lg:flex space-x-1.5">
                  <div className="h-6 w-24 bg-slate-100 rounded-md animate-pulse" />
                  <div className="h-6 w-24 bg-slate-100 rounded-md animate-pulse" />
                  <div className="h-6 w-24 bg-slate-100 rounded-md animate-pulse" />
                </div>
              </div>
              <div className="flex items-center space-x-2.5">
                <div className="h-8 w-16 bg-slate-100 rounded-lg animate-pulse" />
                <div className="h-9 w-20 bg-slate-200 rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        </header>

        {/* Hero Skeleton */}
        <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-200 bg-gradient-to-b from-blue-50/40 via-white to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6 text-left">
                <div className="h-6 w-44 bg-blue-100 rounded-full animate-pulse" />
                <div className="space-y-3">
                  <div className="h-10 bg-slate-200 rounded-lg w-full animate-pulse" />
                  <div className="h-10 bg-slate-200 rounded-lg w-4/5 animate-pulse" />
                  <div className="h-10 bg-slate-200 rounded-lg w-3/4 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-full animate-pulse" />
                  <div className="h-4 bg-slate-100 rounded w-11/12 animate-pulse" />
                  <div className="h-4 bg-slate-100 rounded w-5/6 animate-pulse" />
                </div>
                <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
                  <div className="h-12 w-48 bg-blue-200 rounded-xl animate-pulse" />
                  <div className="h-12 w-48 bg-slate-200 rounded-xl animate-pulse" />
                </div>
              </div>
              <div className="lg:col-span-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xl space-y-4">
                  <div className="h-48 bg-slate-200 rounded-2xl animate-pulse" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1.5">
                      <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                      <div className="h-3 w-48 bg-slate-100 rounded animate-pulse" />
                    </div>
                    <div className="h-10 w-12 bg-blue-100 rounded-xl animate-pulse" />
                  </div>
                  <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
                  <div className="h-10 bg-blue-200 rounded-xl animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats row skeleton */}
        <section className="bg-white border-b border-slate-200 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="h-3.5 w-64 bg-slate-100 rounded mx-auto animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2.5">
                  <div className="h-8 w-16 bg-slate-200 rounded mx-auto animate-pulse" />
                  <div className="h-3 w-24 bg-slate-100 rounded mx-auto animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Discover Athletes Section Skeleton */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-3">
              <div className="h-6 w-48 bg-slate-200 rounded mx-auto animate-pulse" />
              <div className="h-3 w-64 bg-slate-150 rounded mx-auto animate-pulse" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-slate-200 animate-pulse" />
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-24 bg-slate-200 rounded animate-pulse" />
                      <div className="h-2.5 w-16 bg-slate-100 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded animate-pulse" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-5 w-16 bg-slate-100 rounded-full animate-pulse" />
                    <div className="h-7 w-20 bg-blue-100 rounded-lg animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-blue-100 selection:text-[#1D4ED8] antialiased overflow-x-hidden">
      
      {/* 1. FIGMA STYLE NAVIGATION BAR */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* PlayFoliyo Logo */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center cursor-pointer" onClick={onExplore}>
                <PlayFoliyoLogo size={32} showText={false} />
                <span className="font-black tracking-wider font-sans text-lg flex items-center ml-2">
                  <span className="text-slate-900 select-none">PLAY</span>
                  <span className="text-[#1D4ED8] select-none">FOLIYO</span>
                </span>
              </div>

              {/* Navigation Menu Links */}
              <nav className="hidden lg:flex items-center space-x-1">
                <button 
                  onClick={onExplore}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3.5 py-2 rounded-lg transition-all cursor-pointer"
                >
                  Discover Athletes
                </button>
                <button 
                  onClick={onExplore}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3.5 py-2 rounded-lg transition-all cursor-pointer"
                >
                  Opportunities
                </button>
                <button 
                  onClick={onExplore}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3.5 py-2 rounded-lg transition-all cursor-pointer"
                >
                  Tournaments
                </button>
                <a 
                  href="#how-it-works"
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3.5 py-2 rounded-lg transition-all cursor-pointer"
                >
                  About
                </a>
              </nav>
            </div>

            {/* Action Buttons with Signup terminology */}
            <div className="flex items-center space-x-2.5">
              <button
                id="landing-login-btn-top"
                onClick={onLogin}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg transition-all cursor-pointer hover:bg-slate-50"
              >
                Login
              </button>
              <button
                id="landing-join-btn-top"
                onClick={onJoin}
                className="bg-[#1D4ED8] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-sm cursor-pointer flex items-center space-x-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Signup</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-200 bg-gradient-to-b from-blue-50/40 via-white to-transparent">
        {/* Abstract subtle mesh background grids */}
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-blue-100/40 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-12 right-1/4 w-[500px] h-[500px] bg-emerald-100/20 rounded-full blur-[120px] -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Main Pitch */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="lg:col-span-6 space-y-6 text-left"
            >
              <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full text-[#1D4ED8] text-[10px] font-black uppercase tracking-wider">
                <Sparkle className="w-3.5 h-3.5" />
                <span>Verified Recruitment Platform</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-[1.05] uppercase">
                BUILD YOUR SPORTS CAREER.<br />
                <span className="text-[#1D4ED8]">GET DISCOVERED.</span><br />
                <span className="text-slate-900">GET RECRUITED.</span>
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium max-w-xl">
                Create your digital sports profile, showcase achievements, connect with scouts, coaches, clubs, academies, and sponsors. All physical specs, trophies, and certifications are fully verified on one beautiful, secure platform.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  id="hero-create-profile-btn"
                  onClick={onJoin}
                  className="bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold text-sm px-6 py-4 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md shadow-blue-500/10 group cursor-pointer"
                >
                  <span>Create Free Profile</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  id="hero-discover-btn"
                  onClick={onExplore}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm px-6 py-4 rounded-xl flex items-center justify-center space-x-2 transition-colors shadow-xs cursor-pointer"
                >
                  <Search className="w-4 h-4 text-slate-500" />
                  <span>Discover Athletes</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Right Hero Interactive Athlete Profile Preview Mockup */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.15, ease: "easeOut" }}
              className="lg:col-span-6 relative"
            >
              <div className="absolute -inset-4 bg-slate-150/40 rounded-[2.5rem] -z-20 border border-slate-200/40" />
              
              <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xl space-y-4 relative"
              >
                
                {/* Stadium background overlay mockup header */}
                <div className="h-48 bg-slate-100 rounded-2xl overflow-hidden relative border border-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800"
                    alt="Bright stadium lights under dynamic night game"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                  <div className="absolute top-3 left-3 bg-white/90 border border-slate-200 text-slate-900 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live Match Rating</span>
                  </div>
                </div>

                {/* Athlete identity card */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                      <span>Aarav Sharma</span>
                      <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-50" />
                    </h3>
                    <p className="text-xs font-semibold text-slate-500">Striker • Tata Football Academy</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl text-center">
                    <span className="block text-sm font-black text-[#1D4ED8]">96%</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Completeness</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Season Goals</span>
                    <p className="text-xs font-extrabold text-slate-800">28 Goals in 31 Matches</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">100m sprint</span>
                    <p className="text-xs font-extrabold text-slate-800">10.95 Seconds</p>
                  </div>
                </div>

                <button
                  onClick={onJoin}
                  className="w-full bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Signup to Connect</span>
                </button>
              </motion.div>

            </motion.div>

          </div>
        </div>
      </section>

      {/* 3. TRUSTED BY SECTION (DYNAMIC METRIC BOARDS) */}
      <section className="bg-white border-b border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            GROWING ATHLETIC ECOSYSTEM STATISTICS
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-blue-200 transition-colors">
              <span className="block text-3xl font-black text-[#1D4ED8]">500+</span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verified Athletes</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-blue-200 transition-colors">
              <span className="block text-3xl font-black text-slate-800">50+</span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expert Coaches</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-blue-200 transition-colors">
              <span className="block text-3xl font-black text-emerald-600">20+</span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sports Academies</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-blue-200 transition-colors">
              <span className="block text-3xl font-black text-purple-600">10+</span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Sports</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHO IS PLAYFOLIYO FOR? */}
      <section className="py-20 bg-[#F8FAFC] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center max-w-2xl mx-auto space-y-2"
          >
            <span className="text-[10px] font-extrabold text-[#1D4ED8] uppercase tracking-widest bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
              Users & Ecosystem
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
              WHO IS PLAYFOLIYO FOR?
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
              Tailored workspaces and distinct digital dashboards serving everyone in the modern sports hierarchy.
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-5"
          >
            
            {/* Athlete */}
            <motion.div 
              variants={cardIn}
              whileHover={{ y: -6, scale: 1.03, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1)" }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-500/20 transition-colors space-y-3"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1D4ED8] flex items-center justify-center font-bold">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Athlete</h3>
              <ul className="space-y-1 text-[10px] font-bold text-slate-500 list-none">
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#1D4ED8]" /> Build Sports CV</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#1D4ED8]" /> Upload Highlights</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#1D4ED8]" /> Get Recruited</li>
              </ul>
            </motion.div>

            {/* Coach */}
            <motion.div 
              variants={cardIn}
              whileHover={{ y: -6, scale: 1.03, boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.1)" }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-amber-500/20 transition-colors space-y-3"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Coach</h3>
              <ul className="space-y-1 text-[10px] font-bold text-slate-500 list-none">
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-amber-500" /> Showcase Exp</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-amber-500" /> Find Talent</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-amber-500" /> Post Vacancies</li>
              </ul>
            </motion.div>

            {/* Club */}
            <motion.div 
              variants={cardIn}
              whileHover={{ y: -6, scale: 1.03, boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.1)" }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-500/20 transition-colors space-y-3"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Club</h3>
              <ul className="space-y-1 text-[10px] font-bold text-slate-500 list-none">
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-500" /> Conduct Trials</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-500" /> Recruit Players</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-500" /> Manage Rosters</li>
              </ul>
            </motion.div>

            {/* Academy */}
            <motion.div 
              variants={cardIn}
              whileHover={{ y: -6, scale: 1.03, boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.1)" }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-purple-500/20 transition-colors space-y-3"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Academy</h3>
              <ul className="space-y-1 text-[10px] font-bold text-slate-500 list-none">
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-purple-500" /> Enroll Athletes</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-purple-500" /> Scout Link</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-purple-500" /> Post Brackets</li>
              </ul>
            </motion.div>

            {/* Scout */}
            <motion.div 
              variants={cardIn}
              whileHover={{ y: -6, scale: 1.03, boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.1)" }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-500/20 transition-colors space-y-3"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Scout</h3>
              <ul className="space-y-1 text-[10px] font-bold text-slate-500 list-none">
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-indigo-500" /> Discover Talent</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-indigo-500" /> Access Analytics</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-indigo-500" /> Send Messages</li>
              </ul>
            </motion.div>

            {/* Sponsor */}
            <motion.div 
              variants={cardIn}
              whileHover={{ y: -6, scale: 1.03, boxShadow: "0 10px 25px -5px rgba(244, 63, 94, 0.1)" }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-rose-500/20 transition-colors space-y-3"
            >
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Sponsor</h3>
              <ul className="space-y-1 text-[10px] font-bold text-slate-500 list-none">
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-rose-500" /> Find Athletes</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-rose-500" /> Distribute Funds</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-rose-500" /> Brand Match</li>
              </ul>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section id="how-it-works" className="py-20 bg-white border-y border-slate-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center max-w-2xl mx-auto space-y-2"
          >
            <span className="text-[10px] font-extrabold text-[#1D4ED8] uppercase tracking-widest bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
              Interactive Guide
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
              HOW IT WORKS
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
              Our streamlined, secure onboarding lifecycle takes you from sign up directly to a signed scouting contract.
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-5 gap-6 relative"
          >
            
            {/* Step 1 */}
            <motion.div 
              variants={cardIn}
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3 relative group hover:bg-white hover:shadow-lg transition-all duration-300"
            >
              <span className="absolute -top-3 left-6 px-3 py-1 bg-blue-600 text-white font-black text-xs rounded-full shadow-sm">
                01
              </span>
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider pt-2">
                Create Profile
              </h3>
              <p className="text-[11px] text-slate-500 leading-normal font-medium">
                Signup and declare your sports specialization role and bio.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              variants={cardIn}
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3 relative group hover:bg-white hover:shadow-lg transition-all duration-300"
            >
              <span className="absolute -top-3 left-6 px-3 py-1 bg-[#1D4ED8] text-white font-black text-xs rounded-full shadow-sm">
                02
              </span>
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider pt-2">
                Upload Achievements
              </h3>
              <p className="text-[11px] text-slate-500 leading-normal font-medium">
                Add tournament placements, trophies, awards, and licenses.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              variants={cardIn}
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3 relative group hover:bg-white hover:shadow-lg transition-all duration-300"
            >
              <span className="absolute -top-3 left-6 px-3 py-1 bg-[#1D4ED8] text-white font-black text-xs rounded-full shadow-sm">
                03
              </span>
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider pt-2">
                Add Statistics
              </h3>
              <p className="text-[11px] text-slate-500 leading-normal font-medium">
                Input physical dimensions (height, weight) and game metrics.
              </p>
            </motion.div>

            {/* Step 4 */}
            <motion.div 
              variants={cardIn}
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3 relative group hover:bg-white hover:shadow-lg transition-all duration-300"
            >
              <span className="absolute -top-3 left-6 px-3 py-1 bg-purple-600 text-white font-black text-xs rounded-full shadow-sm">
                04
              </span>
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider pt-2">
                Upload Videos
              </h3>
              <p className="text-[11px] text-slate-500 leading-normal font-medium">
                Attach action video highlights of real competitive matches.
              </p>
            </motion.div>

            {/* Step 5 */}
            <motion.div 
              variants={cardIn}
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-emerald-50/50 border-2 border-emerald-500/40 rounded-2xl p-6 space-y-3 relative group hover:bg-white hover:shadow-lg transition-all duration-300"
            >
              <span className="absolute -top-3 left-6 px-3 py-1 bg-emerald-600 text-white font-black text-xs rounded-full shadow-sm">
                05
              </span>
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider pt-2">
                Get Discovered
              </h3>
              <p className="text-[11px] text-slate-500 leading-normal font-medium">
                Recruiters browse, verify your data and offer global opportunities.
              </p>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* 6. MULTI-SPORT FEATURE (UNIQUE SELLING POINT) */}
      <section className="py-20 bg-[#F8FAFC] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* USP Pitch */}
            <div className="lg:col-span-5 space-y-5 text-left">
              <span className="text-[10px] font-extrabold text-[#1D4ED8] bg-blue-50 border border-blue-100 px-3.5 py-1.5 rounded-full uppercase tracking-widest">
                Our Strongest Innovation
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight uppercase leading-[1.1]">
                "ONE ATHLETE.<br /> UNLIMITED SPORTS."
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                Athletes are rarely one-dimensional. PlayFoliyo supports creating multiple sporting metrics under <span className="text-[#1D4ED8] font-bold">one single profile</span>. Track football goals, basketball shoot averages, and cricket batting wickets completely separated.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-2.5 text-slate-700 font-semibold text-xs">
                  <div className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center text-[#1D4ED8]">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Single Integrated Profile Page</span>
                </div>
                <div className="flex items-center space-x-2.5 text-slate-700 font-semibold text-xs">
                  <div className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center text-[#1D4ED8]">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Isolated Discipline Statistics</span>
                </div>
                <div className="flex items-center space-x-2.5 text-slate-700 font-semibold text-xs">
                  <div className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center text-[#1D4ED8]">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Dedicated PDF CV Customizer</span>
                </div>
              </div>

              <button 
                onClick={onJoin}
                className="bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-sm cursor-pointer inline-flex items-center space-x-1.5"
              >
                <span>Create Unlimited Profile (Signup)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Interactive Demo Block featuring Rahul Sharma (Football, Basketball, Cricket) */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200">
                    <img 
                      src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150" 
                      alt="Rahul Sharma portrait"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                      <span>Rahul Sharma</span>
                      <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-50" />
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold">Multiple Sports Registered</p>
                  </div>
                </div>

                <span className="bg-blue-50 border border-blue-100 px-3 py-1 rounded text-[10px] font-black uppercase text-[#1D4ED8]">
                  State Level Athlete
                </span>
              </div>

              {/* Simulated Tab selection buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveSportTab("football")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeSportTab === "football"
                      ? "bg-[#1D4ED8] text-white"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  ⚽ Football Stats
                </button>
                <button
                  onClick={() => setActiveSportTab("basketball")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeSportTab === "basketball"
                      ? "bg-[#1D4ED8] text-white"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  🏀 Basketball Stats
                </button>
                <button
                  onClick={() => setActiveSportTab("cricket")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeSportTab === "cricket"
                      ? "bg-[#1D4ED8] text-white"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  🏏 Cricket Stats
                </button>
              </div>

              {/* Dynamic stats preview box based on tab */}
              <div className="bg-slate-50 border border-slate-150/80 p-4 rounded-xl space-y-3">
                {activeSportTab === "football" && (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Goals</span>
                      <span className="text-lg font-black text-slate-900">14 Goals</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Assists</span>
                      <span className="text-lg font-black text-slate-900">8 Assists</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Position</span>
                      <span className="text-lg font-black text-[#1D4ED8]">Midfielder</span>
                    </div>
                  </div>
                )}
                {activeSportTab === "basketball" && (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Points PG</span>
                      <span className="text-lg font-black text-slate-900">16.2 PPG</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Rebounds</span>
                      <span className="text-lg font-black text-slate-900">4.5 RPG</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Position</span>
                      <span className="text-lg font-black text-[#1D4ED8]">Shooting Guard</span>
                    </div>
                  </div>
                )}
                {activeSportTab === "cricket" && (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Runs</span>
                      <span className="text-lg font-black text-slate-900">420 Runs</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Wickets</span>
                      <span className="text-lg font-black text-slate-900">12 Wickets</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Role</span>
                      <span className="text-lg font-black text-[#1D4ED8]">All-Rounder</span>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 7. ATHLETE PROFILE PREVIEW */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-extrabold text-[#1D4ED8] uppercase tracking-widest bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
              Full Product Preview
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
              ATHLETE PROFILE LAYOUT
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
              Take an interactive look at the state-of-the-art layout registered athletes receive to display their digital credentials.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-[#F8FAFC] border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            
            {/* Header section of mock profile */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-5 gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-300">
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150" 
                    alt="Athlete main avatar"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span>Elena Rostova</span>
                    <CheckCircle className="w-4.5 h-4.5 text-emerald-500 fill-emerald-50" />
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">Aesthetic Tennis Competitor • Krakow, Poland</p>
                </div>
              </div>

              <div className="flex space-x-2">
                <button 
                  onClick={onJoin}
                  className="bg-[#1D4ED8] hover:bg-blue-700 text-white text-[10px] font-bold px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download Sports CV</span>
                </button>
              </div>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Bio and stats columns */}
              <div className="md:col-span-8 space-y-5">
                
                {/* About section */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">About</h4>
                  <p className="text-xs text-slate-600 leading-normal font-medium">
                    State-certified tennis champion focusing on competitive junior leagues. Training over 20 hours weekly at Elena Krakow Academy. Searching for elite US college recruitment sponsorship matches.
                  </p>
                </div>

                {/* Multiple Sports Stats cards */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Football Stats</h4>
                  <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-2.5 rounded-xl">
                    <div>
                      <span className="block text-[8px] font-bold text-slate-400 uppercase">Matches</span>
                      <span className="text-xs font-bold text-slate-800">12 played</span>
                    </div>
                    <div>
                      <span className="block text-[8px] font-bold text-slate-400 uppercase">Clean sheets</span>
                      <span className="text-xs font-bold text-slate-800">4 sheets</span>
                    </div>
                    <div>
                      <span className="block text-[8px] font-bold text-slate-400 uppercase">Wing speed</span>
                      <span className="text-xs font-bold text-slate-800">11.1s (100m)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Basketball Stats</h4>
                  <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-2.5 rounded-xl">
                    <div>
                      <span className="block text-[8px] font-bold text-slate-400 uppercase">Points PG</span>
                      <span className="text-xs font-bold text-slate-800">14.2 PPG</span>
                    </div>
                    <div>
                      <span className="block text-[8px] font-bold text-slate-400 uppercase">FT Accuracy</span>
                      <span className="text-xs font-bold text-slate-800">88.5% Accuracy</span>
                    </div>
                    <div>
                      <span className="block text-[8px] font-bold text-slate-400 uppercase">Block rating</span>
                      <span className="text-xs font-bold text-slate-800">1.2 BPG</span>
                    </div>
                  </div>
                </div>

                {/* Achievements */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Achievements</h4>
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2 text-xs">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      <span className="font-semibold text-slate-700">🥇 Gold Medalist Krakow Youth Tennis Open 2025</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <Trophy className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-700">🥈 Polish Nationals Junior Under-18 Finalist</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Videos and certifications */}
              <div className="md:col-span-4 space-y-5">
                
                {/* Videos */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Action Videos</h4>
                  <div className="h-28 bg-slate-150 rounded-xl relative overflow-hidden group border border-slate-100">
                    <img 
                      src="https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?auto=format&fit=crop&q=80&w=300" 
                      alt="Tennis match play"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-9 h-9 rounded-full bg-white/90 text-[#1D4ED8] flex items-center justify-center font-bold shadow-md cursor-pointer hover:scale-105 transition-transform">
                        <Play className="w-4 h-4 fill-[#1D4ED8]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Certificates */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2.5">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Certificates</h4>
                  <div className="space-y-1.5 text-[11px] font-bold text-slate-500">
                    <div className="flex items-center space-x-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Polish Tennis Federation Player License</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Medical Clearance Certificate</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 8. DISCOVER ATHLETES PREVIEW */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-extrabold text-[#1D4ED8] uppercase tracking-widest bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
              Real-Time Finder Mockup
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
              DISCOVER ATHLETES PREVIEW
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
              Test drive our live search queries. Filters allow elite scouts to find exactly the height, age, and country profiles needed.
            </p>
          </div>

          {/* Search bar & filter controls */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs max-w-4xl mx-auto space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search Athletes by Name or Country..."
                  value={athleteSearchQuery}
                  onChange={(e) => setAthleteSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs font-medium focus:outline-hidden focus:bg-white focus:border-blue-500 transition-all text-slate-800"
                />
              </div>

              {/* Filters selector */}
              <div className="flex space-x-2">
                <select
                  value={selectedSportFilter}
                  onChange={(e) => setSelectedSportFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-hidden text-slate-700 cursor-pointer"
                >
                  <option value="all">Sport: All Sports</option>
                  <option value="Football">Football</option>
                  <option value="Basketball">Basketball</option>
                  <option value="Cricket">Cricket</option>
                  <option value="Tennis">Tennis</option>
                </select>
                <button
                  onClick={() => {
                    setAthleteSearchQuery("");
                    setSelectedSportFilter("all");
                  }}
                  className="bg-slate-100 hover:bg-slate-150 border border-slate-200 text-slate-700 text-xs font-bold px-4 py-3 rounded-xl cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Athletes results cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {filteredAthletes.map((ath) => (
                <div key={ath.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-blue-400 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200">
                          <img src={ath.avatar || null} alt={ath.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1">
                            <span>{ath.name}</span>
                            {ath.isVerified && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 fill-emerald-50" />}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-bold">{ath.position}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {ath.sports.map((sp) => (
                        <span key={sp} className="bg-blue-50 text-[#1D4ED8] text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                          {sp}
                        </span>
                      ))}
                      <span className="bg-slate-100 text-slate-500 text-[8px] font-bold px-2 py-0.5 rounded flex items-center gap-0.5">
                        <MapPin className="w-2 h-2" />
                        {ath.country}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-white p-2 rounded-lg border border-slate-100 text-[10px] text-center">
                      <div>
                        <span className="block text-slate-400 font-bold uppercase text-[7px]">Primary Stat</span>
                        <span className="font-extrabold text-slate-800">{ath.stats.primary}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-bold uppercase text-[7px]">Secondary Stat</span>
                        <span className="font-extrabold text-slate-800">{ath.stats.secondary}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={onJoin}
                    className="w-full mt-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-[10px] font-bold py-2 rounded-lg cursor-pointer"
                  >
                    View Full Profile
                  </button>
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* 9. OPPORTUNITIES PREVIEW */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-extrabold text-[#1D4ED8] uppercase tracking-widest bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
              Live Vacancies & Applications
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
              OPPORTUNITIES PREVIEW
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
              Explore scout-vetted club trials, basketball scholarships, and direct commercial sponsorship deals active right now.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Opportunity 1 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-blue-400 transition-all">
              <div className="space-y-3">
                <span className="bg-blue-50 text-[#1D4ED8] text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                  Trial Opportunity
                </span>
                <h3 className="font-extrabold text-slate-900 text-sm">Under-21 Football Trial</h3>
                <p className="text-xs text-slate-500 leading-normal">
                  Red Star Football Academy is hosting open competitive scouting trials for elite regional strikers.
                </p>
                <div className="text-[10px] text-slate-400 font-bold space-y-0.5">
                  <div>Sport: Football</div>
                  <div>Location: Munich, Germany</div>
                </div>
              </div>
              <button 
                onClick={onJoin}
                className="w-full mt-4 bg-[#1D4ED8] hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg cursor-pointer"
              >
                Apply for Trial
              </button>
            </div>

            {/* Opportunity 2 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-blue-400 transition-all">
              <div className="space-y-3">
                <span className="bg-purple-50 text-purple-600 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                  Scholarship Opportunity
                </span>
                <h3 className="font-extrabold text-slate-900 text-sm">Basketball College Scholarship</h3>
                <p className="text-xs text-slate-500 leading-normal">
                  Full collegiate athletic funding package covering accommodation and high-performance training.
                </p>
                <div className="text-[10px] text-slate-400 font-bold space-y-0.5">
                  <div>Sport: Basketball</div>
                  <div>Location: Texas, USA</div>
                </div>
              </div>
              <button 
                onClick={onJoin}
                className="w-full mt-4 bg-[#1D4ED8] hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg cursor-pointer"
              >
                Apply for Scholarship
              </button>
            </div>

            {/* Opportunity 3 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-blue-400 transition-all">
              <div className="space-y-3">
                <span className="bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                  Recruitment Opportunity
                </span>
                <h3 className="font-extrabold text-slate-900 text-sm">Cricket Academy Recruitment</h3>
                <p className="text-xs text-slate-500 leading-normal">
                  Professional junior league recruitment. Selecting certified bowlers for upcoming international test tours.
                </p>
                <div className="text-[10px] text-slate-400 font-bold space-y-0.5">
                  <div>Sport: Cricket</div>
                  <div>Location: Victoria, Australia</div>
                </div>
              </div>
              <button 
                onClick={onJoin}
                className="w-full mt-4 bg-[#1D4ED8] hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg cursor-pointer"
              >
                Apply for Academy
              </button>
            </div>

            {/* Opportunity 4 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-blue-400 transition-all">
              <div className="space-y-3">
                <span className="bg-rose-50 text-rose-600 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                  Sponsorship Opportunity
                </span>
                <h3 className="font-extrabold text-slate-900 text-sm">Brand Sponsorship Deal</h3>
                <p className="text-xs text-slate-500 leading-normal">
                  Looking for dynamic localized brand ambassadors to distribute apparel campaigns.
                </p>
                <div className="text-[10px] text-slate-400 font-bold space-y-0.5">
                  <div>Budget: $5k - $10k USD</div>
                  <div>Location: Worldwide</div>
                </div>
              </div>
              <button 
                onClick={onJoin}
                className="w-full mt-4 bg-[#1D4ED8] hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg cursor-pointer"
              >
                Apply for Sponsor
              </button>
            </div>

          </div>

          <div className="text-center pt-4">
            <button
              onClick={onExplore}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              View All Opportunities
            </button>
          </div>

        </div>
      </section>

      {/* 10. SUCCESS STORIES */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-extrabold text-[#1D4ED8] uppercase tracking-widest bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
              Athlete Placements
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
              SUCCESS STORIES
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
              Read real-world transformations of high-performance athletes who leveraged PlayFoliyo to enter professional sports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Story 1 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 hover:shadow-md transition-all">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150" alt="Rahul Sharma" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Rahul Sharma</h4>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">All-Rounder • Football & Cricket</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium italic">
                "Joining PlayFoliyo allowed me to publish my separate stats for Football and Cricket. Scouts checked my certified medals and immediately selected me for the official state team trial."
              </p>
              <div className="bg-blue-50/50 border border-blue-100 p-2.5 rounded-xl flex items-center justify-between text-[10px]">
                <span className="text-slate-500 font-bold">Joined PlayFoliyo</span>
                <span className="text-[#1D4ED8] font-extrabold">Selected For State Team</span>
              </div>
            </div>

            {/* Story 2 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 hover:shadow-md transition-all">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" alt="Aisha Diop" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Aisha Diop</h4>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Point Guard • Basketball</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium italic">
                "My verified basketball shooting percentages caught the eye of an American collegiate scout. I am moving this autumn on a full athletic tuition scholarship."
              </p>
              <div className="bg-blue-50/50 border border-blue-100 p-2.5 rounded-xl flex items-center justify-between text-[10px]">
                <span className="text-slate-500 font-bold">Joined PlayFoliyo</span>
                <span className="text-[#1D4ED8] font-extrabold">Full College Scholarship</span>
              </div>
            </div>

            {/* Story 3 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 hover:shadow-md transition-all">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" alt="Kenji Sato" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Kenji Sato</h4>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Sprinter • Athletics</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium italic">
                "I uploaded physical run records and my national federation license. PlayFoliyo's verified check let a global sportswear sponsor connect directly to fund my summer training."
              </p>
              <div className="bg-blue-50/50 border border-blue-100 p-2.5 rounded-xl flex items-center justify-between text-[10px]">
                <span className="text-slate-500 font-bold">Joined PlayFoliyo</span>
                <span className="text-[#1D4ED8] font-extrabold">Brand Sponsorship Signed</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 11. FEATURES SECTION */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-extrabold text-[#1D4ED8] uppercase tracking-widest bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
              Innovative Architecture
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
              PLATFORM FEATURES
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
              PlayFoliyo is built with custom toolsets to support complete athlete management.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 space-y-3 hover:shadow-xs transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1D4ED8] flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Sports CV Builder</h3>
              <p className="text-[11px] text-slate-500 leading-normal font-medium">
                Assemble medical sheets, running records, achievements and export a professional PDF.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 space-y-3 hover:shadow-xs transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Play className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Video Highlights</h3>
              <p className="text-[11px] text-slate-500 leading-normal font-medium">
                Add competitive highlights and match streams to show scouts your athletic style.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 space-y-3 hover:shadow-xs transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Statistics Tracking</h3>
              <p className="text-[11px] text-slate-500 leading-normal font-medium">
                Separate game logs and physical dimensions mapped precisely per active discipline.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 space-y-3 hover:shadow-xs transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Recruitment Opportunities</h3>
              <p className="text-[11px] text-slate-500 leading-normal font-medium">
                Publishing open scouting trials, college scholarships, and corporate sponsorship vacancies.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 space-y-3 hover:shadow-xs transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Verification System</h3>
              <p className="text-[11px] text-slate-500 leading-normal font-medium">
                Federation licenses and certificates vetted thoroughly to secure Gold Status badges.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 space-y-3 hover:shadow-xs transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Athlete Discovery</h3>
              <p className="text-[11px] text-slate-500 leading-normal font-medium">
                Targeted scout search tools to find players by country, sport, age brackets, and stats.
              </p>
            </div>

            {/* Feature 7 */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 space-y-3 hover:shadow-xs transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Messaging</h3>
              <p className="text-[11px] text-slate-500 leading-normal font-medium">
                Direct peer-to-peer chat systems to negotiate club contracts and vacancies without agents.
              </p>
            </div>

            {/* Feature 8 */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 space-y-3 hover:shadow-xs transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Tournament Management</h3>
              <p className="text-[11px] text-slate-500 leading-normal font-medium">
                Create open brackets, track local games, and broadcast live champion scores directly.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 12. SPORTS SUPPORTED */}
      <section className="py-20 bg-[#F8FAFC] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-extrabold text-[#1D4ED8] uppercase tracking-widest bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
              Full Disciplines Supported
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
              SPORTS SUPPORTED
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
              PlayFoliyo features custom physical dashboards engineered specifically for all major global athletic sports.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
            
            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer">
              <span className="text-2xl block mb-2">⚽</span>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Football</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer">
              <span className="text-2xl block mb-2">🏀</span>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Basketball</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer">
              <span className="text-2xl block mb-2">🏏</span>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Cricket</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer">
              <span className="text-2xl block mb-2">🎾</span>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Tennis</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer">
              <span className="text-2xl block mb-2">🏸</span>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Badminton</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer">
              <span className="text-2xl block mb-2">🤸</span>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Gymnastics</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer">
              <span className="text-2xl block mb-2">🏐</span>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Volleyball</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer">
              <span className="text-2xl block mb-2">🥊</span>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Boxing</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer">
              <span className="text-2xl block mb-2">🤼</span>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Wrestling</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer">
              <span className="text-2xl block mb-2">🏑</span>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Hockey</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer">
              <span className="text-2xl block mb-2">🏊</span>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Swimming</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer">
              <span className="text-2xl block mb-2">🏃</span>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Athletics</span>
            </div>

          </div>

        </div>
      </section>

      {/* 13. FINAL CALL TO ACTION (CTA) */}
      <section className="py-24 bg-gradient-to-b from-[#F8FAFC] to-blue-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-[#1D4ED8] flex items-center justify-center mx-auto shadow-xs">
            <Trophy className="w-6 h-6" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
            READY TO BUILD YOUR SPORTS CAREER?
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto font-medium">
            Join thousands of junior players, professional scouts, academic coaches, and regional brand sponsors active on PlayFoliyo right now.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3.5 pt-2">
            <button
              onClick={onJoin}
              className="bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold text-xs px-8 py-4 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md shadow-blue-500/10 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Free Profile</span>
            </button>
            <button
              onClick={onJoin}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs px-8 py-4 rounded-xl transition-colors cursor-pointer"
            >
              <span>Join PlayFoliyo</span>
            </button>
          </div>
        </div>
      </section>

      {/* 14. COMPREHENSIVE FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 pb-10 border-b border-slate-200/60">
            
            {/* Branding Column */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center">
                <PlayFoliyoLogo size={28} showText={false} />
                <span className="font-black tracking-wider font-sans text-base flex items-center ml-2">
                  <span className="text-slate-900 select-none">PLAY</span>
                  <span className="text-[#1D4ED8] select-none">FOLIYO</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-xs">
                The leading verified multi-sport CV builder and scouts networking ecosystem. Engineered to connect real talents with official vacancies.
              </p>
            </div>

            {/* Links Columns */}
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">Links</h4>
              <ul className="space-y-2 text-[11px] font-bold text-slate-400">
                <li><button onClick={onExplore} className="hover:text-[#1D4ED8] transition-colors cursor-pointer">About</button></li>
                <li><button onClick={onExplore} className="hover:text-[#1D4ED8] transition-colors cursor-pointer">Contact</button></li>
                <li><button onClick={onExplore} className="hover:text-[#1D4ED8] transition-colors cursor-pointer">Terms</button></li>
                <li><button onClick={onExplore} className="hover:text-[#1D4ED8] transition-colors cursor-pointer">Privacy</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">Ecosystem</h4>
              <ul className="space-y-2 text-[11px] font-bold text-slate-400">
                <li><button onClick={onExplore} className="hover:text-[#1D4ED8] transition-colors cursor-pointer">Opportunities</button></li>
                <li><button onClick={onExplore} className="hover:text-[#1D4ED8] transition-colors cursor-pointer">Tournaments</button></li>
                <li><button onClick={onExplore} className="hover:text-[#1D4ED8] transition-colors cursor-pointer">Support</button></li>
              </ul>
            </div>

            {/* Social Links */}
            <div className="col-span-2">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">Follow PlayFoliyo</h4>
              <p className="text-xs text-slate-400 font-medium mb-3">Connect with our active global networks.</p>
              <div className="flex space-x-3 text-xs font-black text-slate-400">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#1D4ED8] transition-all">Instagram</a>
                <span>•</span>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#1D4ED8] transition-all">LinkedIn</a>
                <span>•</span>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#1D4ED8] transition-all">YouTube</a>
              </div>
            </div>

          </div>

          <div className="pt-6 text-center text-[10px] text-slate-400 font-medium">
            <p>© 2026 PLAYFOLIYO Inc. Styled with Figma-precision. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
