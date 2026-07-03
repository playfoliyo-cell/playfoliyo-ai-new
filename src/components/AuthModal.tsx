import React, { useState, useEffect } from "react";
import { X, Mail, Lock, User, Shield, Check, Trophy, BookOpen, Search, Briefcase } from "lucide-react";
import PlayFoliyoLogo from "./PlayFoliyoLogo";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any, isSignup?: boolean) => void;
  initialTab?: "login" | "signup";
}

const ROLES = [
  { id: "athlete", name: "Athlete", icon: Trophy, desc: "Showcase stats, highlights & get recruited" },
  { id: "coach", name: "Coach", icon: Shield, desc: "List coaching level & find athletes" },
  { id: "club", name: "Club", icon: Shield, desc: "Manage rosters & post trials" },
  { id: "academy", name: "Academy", icon: BookOpen, desc: "Nurture talents & organize tournaments" },
  { id: "scout", name: "Scout", icon: Search, desc: "Search & index premium prospects" },
  { id: "sponsor", name: "Sponsor", icon: Briefcase, desc: "Discover athletes & fund campaigns" },
];

export default function AuthModal({ isOpen, onClose, onSuccess, initialTab = "login" }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "signup" | "forgot">(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("athlete");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Synchronize state when opening or when initialTab property changes
  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setError("");
      setSuccessMessage("");
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    if (tab === "forgot") {
      try {
        const response = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "An error occurred");
        }

        setSuccessMessage(data.message || "A secure reset link has been dispatched.");
      } catch (err: any) {
        setError(err.message || "Failed to trigger password reset");
      } finally {
        setLoading(false);
      }
      return;
    }

    const url = tab === "login" ? "/api/auth/login" : "/api/auth/signup";
    const body = tab === "login" ? { email, password } : { name, email, password, role };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "An error occurred");
      }

      onSuccess(data.user, tab === "signup");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose}></div>

      {/* Modal Card */}
      <div className="relative bg-white border border-slate-100 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <div className="mb-2.5">
              <PlayFoliyoLogo size={28} textSize="text-sm" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight mt-1">
              {tab === "login" 
                ? "Sign in to your account" 
                : tab === "signup" 
                  ? "Create professional profile" 
                  : "Reset Sports Credentials"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {tab === "login"
                ? "Enter your sports credentials to access the ecosystem."
                : tab === "signup"
                  ? "Join the verified sports networking graph today."
                  : "Enter your registered email address to receive recovery steps."}
            </p>
          </div>
          <button
            id="auth-modal-close"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-xs font-semibold">
              ⚠️ {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-xs font-semibold">
              🎉 {successMessage}
            </div>
          )}

          {/* Segmented control for Tab Switcher */}
          {tab !== "forgot" && (
            <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setTab("login");
                  setError("");
                  setSuccessMessage("");
                }}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  tab === "login"
                    ? "bg-white text-[#1D4ED8] shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab("signup");
                  setError("");
                  setSuccessMessage("");
                }}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  tab === "signup"
                    ? "bg-white text-[#1D4ED8] shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Create Profile
              </button>
            </div>
          )}

          <form id="auth-form" onSubmit={handleSubmit} className="space-y-4">
            {tab === "signup" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="auth-name-input"
                    type="text"
                    required
                    placeholder="Aarav Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="auth-email-input"
                  type="email"
                  required
                  placeholder="marcus@athlete.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {tab !== "forgot" && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Password</label>
                  {tab === "login" && (
                    <button
                      id="forgot-password-link"
                      type="button"
                      onClick={() => {
                        setTab("forgot");
                        setError("");
                        setSuccessMessage("");
                      }}
                      className="text-xs text-[#1D4ED8] font-bold hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="auth-password-input"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
            )}

            {tab === "signup" && (
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Choose Sports Role</label>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map((r) => {
                    const Icon = r.icon;
                    const isSelected = role === r.id;
                    return (
                      <button
                        id={`role-btn-${r.id}`}
                        key={r.id}
                        type="button"
                        onClick={() => setRole(r.id)}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col space-y-1 cursor-pointer ${
                          isSelected
                            ? "border-[#1D4ED8] bg-blue-50/50 shadow-xs"
                            : "border-slate-100 hover:border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Icon className={`w-4 h-4 ${isSelected ? "text-[#1D4ED8]" : "text-slate-400"}`} />
                          {isSelected && <div className="w-4 h-4 rounded-full bg-[#1D4ED8] flex items-center justify-center"><Check className="w-2.5 h-2.5 text-white" /></div>}
                        </div>
                        <span className="text-xs font-bold text-slate-800">{r.name}</span>
                        <span className="text-[10px] text-slate-400 leading-tight">{r.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-[#1D4ED8] hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm shadow-md mt-4 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <span>
                {loading 
                  ? "Processing..." 
                  : tab === "login" 
                    ? "Sign In" 
                    : tab === "signup" 
                      ? "Register Profile" 
                      : "Send Reset Link"}
              </span>
            </button>
          </form>

          {/* Toggle Tab */}
          <div className="text-center pt-2">
            {tab === "forgot" ? (
              <button
                id="auth-back-to-login"
                onClick={() => {
                  setTab("login");
                  setError("");
                  setSuccessMessage("");
                }}
                className="text-xs text-[#1D4ED8] font-semibold hover:underline cursor-pointer"
              >
                Back to Sign In
              </button>
            ) : (
              <button
                id="auth-toggle-tab"
                onClick={() => {
                  setTab(tab === "login" ? "signup" : "login");
                  setError("");
                  setSuccessMessage("");
                }}
                className="text-xs text-[#1D4ED8] font-semibold hover:underline cursor-pointer"
              >
                {tab === "login" ? "New to PLAYFOLIYO? Join Now" : "Already have an account? Login"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
