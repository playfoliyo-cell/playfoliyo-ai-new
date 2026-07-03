import React from "react";
import { User, Profile } from "../types";
import { LayoutDashboard, User as UserIcon, Award, FileText, CheckCircle, ShieldAlert, ArrowUpRight, HelpCircle, Settings } from "lucide-react";

interface SidebarProps {
  user: User;
  profile: Profile | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ user, profile, activeTab, onTabChange }: SidebarProps) {
  const isVerified = user.is_verified || user.verification_status === "approved";
  const isPending = user.verification_status === "pending";

  return (
    <div className="space-y-4">
      {/* Quick Profile Overview Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 overflow-hidden relative shadow-sm">
        {/* Cover thumbnail */}
        <div className="h-12 bg-gradient-to-r from-blue-700 to-indigo-800 absolute top-0 inset-x-0"></div>

        <div className="relative pt-4 flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-lg border-2 border-white overflow-hidden shadow-sm bg-slate-100 mb-2 cursor-pointer" onClick={() => onTabChange("profile")}>
            <img
              src={(profile?.profile_pic || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200") || null}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center justify-center space-x-1">
              <span className="font-bold text-slate-900 text-xs hover:underline cursor-pointer" onClick={() => onTabChange("profile")}>{user.name}</span>
              {isVerified && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" title="Verified Pro" />}
            </div>
            <p className="text-[10px] text-slate-500 font-medium capitalize">
              {profile?.sport ? `${profile.position || "Member"} • ${profile.sport}` : `${user.role} Member`}
            </p>
            <p className="text-[9px] text-slate-400">{profile?.location || "No Location Listed"}</p>
          </div>

          {/* Verification Badge Status block */}
          <div className="w-full mt-3 pt-3 border-t border-slate-100 flex flex-col items-center">
            {isVerified ? (
              <div className="w-full flex items-center justify-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase tracking-wider">Verified Athlete</span>
              </div>
            ) : isPending ? (
              <div className="w-full flex items-center justify-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-100 animate-pulse">
                <span className="text-[10px] font-bold uppercase tracking-wider">Pending Review</span>
              </div>
            ) : (
              <button
                id="sidebar-request-verify"
                onClick={() => onTabChange("profile")}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer flex items-center gap-1 bg-blue-50/50 px-3 py-1 rounded-full border border-blue-100 w-full justify-center"
              >
                <span>Request Verification</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Secondary Actions Navigation Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-sm">
        <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2.5 mb-1.5">My Workspace</h3>
        <nav className="space-y-0.5">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "profile", label: "My Digital CV", icon: UserIcon },
            { id: "feed", label: "Social Activity", icon: FileText },
            { id: "settings", label: "Preferences & Privacy", icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                id={`sidebar-tab-${item.id}`}
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                  isSelected
                    ? "text-blue-600 bg-blue-50/80 border border-blue-100/10"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-blue-600" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Network Connections metrics */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
        <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Network Impact</h4>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-slate-50 border border-slate-150 p-2 rounded-lg">
            <span className="block text-sm font-black text-slate-800">
              {profile?.followers?.length || 0}
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Followers</span>
          </div>
          <div className="bg-slate-50 border border-slate-150 p-2 rounded-lg">
            <span className="block text-sm font-black text-slate-800">
              {profile?.following?.length || 0}
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Following</span>
          </div>
        </div>

        {/* Informative Tips Footer */}
        <div className="bg-blue-50/60 rounded-lg p-2.5 border border-blue-100/30 flex items-start space-x-2">
          <HelpCircle className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Completing your digital CV unlocks the <b>AI-powered Recruitment Review</b>, providing recommendations to secure elite trial opportunities.
          </p>
        </div>
      </div>
    </div>
  );
}
