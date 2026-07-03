import React, { useState, useEffect } from "react";
import { Award, Bell, MessageSquare, Search, LogOut, LayoutDashboard, User as UserIcon, ShieldAlert, Settings } from "lucide-react";
import { User } from "../types";
import PlayFoliyoLogo from "./PlayFoliyoLogo";

interface HeaderProps {
  user: User | null;
  profilePic?: string | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  onLogin: () => void;
  onJoin: () => void;
  notificationsCount: number;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export default function Header({
  user,
  profilePic,
  activeTab,
  onTabChange,
  onLogout,
  onLogin,
  onJoin,
  notificationsCount,
  searchQuery = "",
  onSearchChange,
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-[1000] w-full transition-all duration-200 border-b ${
      scrolled
        ? "bg-white/80 backdrop-blur-md border-slate-200/80 shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
        : "bg-white border-slate-200"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          
          {/* Logo */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center cursor-pointer" onClick={() => onTabChange("feed")}>
              <PlayFoliyoLogo size={32} textSize="text-base sm:text-lg" textClassName="hidden sm:inline-flex" />
            </div>

            {/* Main Tabs (Only visible when logged in) */}
            {user && (
              <nav className="hidden md:flex space-x-1">
                {[
                  { id: "feed", label: "Feed" },
                  { id: "discover", label: "Discover" },
                  { id: "opportunities", label: "Opportunities" },
                  { id: "tournaments", label: "Tournaments" },
                ].map((t) => (
                  <button
                    id={`nav-tab-${t.id}`}
                    key={t.id}
                    onClick={() => onTabChange(t.id)}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === t.id
                        ? "text-blue-600 bg-blue-50/80 border border-blue-100/30"
                        : "text-slate-500 hover:text-blue-600 hover:bg-slate-50"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </nav>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Search query box */}
                <div className="relative max-w-xs hidden sm:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="header-global-search"
                    type="text"
                    placeholder="Search athletes, scouts, clubs..."
                    value={searchQuery}
                    onChange={(e) => {
                      if (onSearchChange) onSearchChange(e.target.value);
                    }}
                    onClick={() => onTabChange("discover")}
                    className="pl-9 pr-4 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500 bg-slate-50 cursor-pointer w-56 transition-all text-slate-800 font-medium"
                  />
                </div>

                {/* Direct Messages Icon */}
                <button
                  id="nav-btn-messages"
                  onClick={() => onTabChange("messages")}
                  className={`p-1.5 rounded-md relative hover:bg-slate-50 transition-colors cursor-pointer ${
                    activeTab === "messages" ? "text-blue-600 bg-blue-50" : "text-slate-500"
                  }`}
                  title="Messages"
                >
                  <MessageSquare className="w-4.5 h-4.5" />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500"></span>
                </button>

                {/* Notifications Icon */}
                <button
                  id="nav-btn-notifications"
                  onClick={() => onTabChange("notifications")}
                  className={`p-1.5 rounded-md relative hover:bg-slate-50 transition-colors cursor-pointer ${
                    activeTab === "notifications" ? "text-blue-600 bg-blue-50" : "text-slate-500"
                  }`}
                  title="Notifications"
                >
                  <Bell className="w-4.5 h-4.5" />
                  {notificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center px-1">
                      {notificationsCount}
                    </span>
                  )}
                </button>

                {/* Settings Icon */}
                <button
                  id="nav-btn-settings"
                  onClick={() => onTabChange("settings")}
                  className={`p-1.5 rounded-md relative hover:bg-slate-50 transition-colors cursor-pointer ${
                    activeTab === "settings" ? "text-blue-600 bg-blue-50" : "text-slate-500"
                  }`}
                  title="Settings"
                >
                  <Settings className="w-4.5 h-4.5" />
                </button>

                {/* Admin Tab (Only for Admin users) */}
                {user.role === "admin" && (
                  <button
                    id="nav-btn-admin"
                    onClick={() => onTabChange("admin")}
                    className={`p-1.5 rounded-md relative hover:bg-slate-50 transition-colors cursor-pointer ${
                      activeTab === "admin" ? "text-amber-600 bg-amber-50" : "text-amber-500"
                    }`}
                    title="Admin Console"
                  >
                    <ShieldAlert className="w-4.5 h-4.5" />
                  </button>
                )}

                {/* Divider */}
                <div className="w-px h-5 bg-slate-200 hidden sm:block"></div>

                {/* User Dropdown Profile Shortcut */}
                <div className="flex items-center space-x-2">
                  <button
                    id="header-profile-menu-btn"
                    onClick={() => onTabChange("profile")}
                    className={`flex items-center space-x-2 p-1 rounded-md hover:bg-slate-50 transition-colors cursor-pointer ${
                      activeTab === "profile" || activeTab === "dashboard" ? "bg-slate-100/80" : ""
                    }`}
                  >
                    <div className="w-7 h-7 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs font-bold uppercase shadow-xs overflow-hidden">
                      {profilePic ? (
                        <img src={profilePic} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name.slice(0, 2)
                      )}
                    </div>
                    <div className="text-left hidden sm:block">
                      <span className="block text-xs font-bold text-slate-800 line-clamp-1 leading-none">{user.name}</span>
                      <span className="block text-[9px] text-slate-400 capitalize mt-0.5 leading-none">{user.role} Dashboard</span>
                    </div>
                  </button>

                  <button
                    id="header-logout-btn"
                    onClick={onLogout}
                    className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  id="header-login-btn"
                  onClick={onLogin}
                  className="text-xs font-bold text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-md cursor-pointer"
                >
                  Log in
                </button>
                <button
                  id="header-join-btn"
                  onClick={onJoin}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-1.5 rounded-md shadow-xs cursor-pointer"
                >
                  Signup
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
