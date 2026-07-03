import React, { useState, useEffect } from "react";
import { User, Profile, Post } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { FileText, Search, Award, Calendar, MessageSquare } from "lucide-react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import LandingPage from "./components/LandingPage";
import AuthModal from "./components/AuthModal";
import DashboardTab from "./components/DashboardTab";
import ProfileTab from "./components/ProfileTab";
import FeedTab from "./components/FeedTab";
import DiscoverTab from "./components/DiscoverTab";
import OpportunitiesTab from "./components/OpportunitiesTab";
import TournamentsTab from "./components/TournamentsTab";
import MessagesTab from "./components/MessagesTab";
import NotificationsTab from "./components/NotificationsTab";
import AdminTab from "./components/AdminTab";
import SettingsTab from "./components/SettingsTab";

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("playfoliyo_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [profile, setProfile] = useState<Profile | null>(() => {
    const saved = localStorage.getItem("playfoliyo_profile");
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem("playfoliyo_user") ? "feed" : "landing";
  });

  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [posts, setPosts] = useState<Post[]>([]);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [applications, setApplications] = useState<string[]>([]);
  const [registrations, setRegistrations] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [targetMessageRecipientId, setTargetMessageRecipientId] = useState<string | null>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");

  // Centralized Toast Notifications System
  interface PlayFoliyoToast {
    id: string;
    message: string;
    type: "success" | "error" | "info";
    title?: string;
  }
  const [toasts, setToasts] = useState<PlayFoliyoToast[]>([]);

  const showToast = (message: string, type: "success" | "error" | "info" = "success", title?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: PlayFoliyoToast = { id, message, type, title };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Sync user and profile to localStorage
  const handleAuthSuccess = async (authenticatedUser: User, isSignup?: boolean) => {
    setUser(authenticatedUser);
    localStorage.setItem("playfoliyo_user", JSON.stringify(authenticatedUser));
    
    // Fetch profile
    try {
      const res = await fetch(`/api/profiles/${authenticatedUser.id}`);
      const data = await res.json();
      if (res.ok) {
        setProfile(data.profile);
        localStorage.setItem("playfoliyo_profile", JSON.stringify(data.profile));
      }
    } catch (e) {
      console.error("Auth profile fetch failed", e);
    }

    if (isSignup) {
      setActiveTab("feed");
    } else {
      setActiveTab("feed");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem("playfoliyo_user");
    localStorage.removeItem("playfoliyo_profile");
    setActiveTab("landing");
  };

  // Sync feed posts from backend
  const fetchPosts = async () => {
    setIsPostsLoading(true);
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      if (res.ok) {
        setPosts(data);
      }
    } catch (e) {
      console.error("Error loading posts", e);
    } finally {
      setTimeout(() => {
        setIsPostsLoading(false);
      }, 1000);
    }
  };

  const handleCreatePost = async (postData: any) => {
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });
      if (res.ok) {
        fetchPosts();
      }
    } catch (e) {
      console.error("Failed to create post", e);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });
      if (res.ok) {
        fetchPosts();
      }
    } catch (e) {
      console.error("Failed to like post", e);
    }
  };

  const handleCommentPost = async (postId: string, text: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, text }),
      });
      if (res.ok) {
        fetchPosts();
      }
    } catch (e) {
      console.error("Failed to comment", e);
    }
  };

  const fetchNotificationsCount = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/notifications/${user.id}`);
      const data = await res.json();
      if (res.ok) {
        const unread = data.filter((n: any) => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (e) {
      console.error("Failed to load notifications count", e);
    }
  };

  // Direct communications shortcuts from Discover Tab
  const handleSendMessageShortcut = (recipientId: string) => {
    setTargetMessageRecipientId(recipientId);
    setActiveTab("messages");
  };

  const handleViewProfileShortcut = async (recipientId: string) => {
    try {
      const res = await fetch(`/api/profiles/${recipientId}`);
      const data = await res.json();
      if (res.ok) {
        // We set temporary external profile review details into sidebar/active tab
        // For simple single view, we will jump to search details or let them view
        // custom stats. For high fidelity, we will show standard popup or load
        // messaging prompts.
        setTargetMessageRecipientId(recipientId);
        setActiveTab("messages");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
    localStorage.setItem("playfoliyo_profile", JSON.stringify(updatedProfile));
  };

  const handleVerificationRequest = (reqData: any) => {
    if (user) {
      const updatedUser = { ...user, verification_status: "pending" as const };
      setUser(updatedUser);
      localStorage.setItem("playfoliyo_user", JSON.stringify(updatedUser));
    }
  };

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/profiles/${user.id}`);
      const data = await res.json();
      if (res.ok) {
        setProfile(data.profile);
        localStorage.setItem("playfoliyo_profile", JSON.stringify(data.profile));
      }
    } catch (e) {
      console.error("Failed to sync profile", e);
    }
  };

  useEffect(() => {
    fetchPosts();
    if (user) {
      fetchNotificationsCount();
      fetchProfile();
    }
  }, [user?.id, activeTab]);

  // Custom Dynamic Metadata & Document Title updates
  useEffect(() => {
    let title = "PlayFoliyo | Athlete Profiles & Opportunities";
    let desc = "Discover sports opportunities, showcase athlete portfolios, and build professional athletic connections on PlayFoliyo.";

    if (user) {
      switch (activeTab) {
        case "dashboard":
          title = "PlayFoliyo | Dashboard";
          desc = `Welcome back, ${profile?.full_name || user.name || "Athlete"}. View your performance stats, application updates, and athletic profile tracking.`;
          break;
        case "profile":
          const name = profile?.full_name || user.name || "My Profile";
          const sport = profile?.sport || "Athlete";
          title = `PlayFoliyo | ${name} (${sport})`;
          desc = `Check out the athletic achievements, skill highlights, and background of ${name} on PlayFoliyo.`;
          break;
        case "feed":
          title = "PlayFoliyo | Activity Feed";
          desc = "Stay updated with recent videos, scores, and posts from the PlayFoliyo athlete community.";
          break;
        case "discover":
          title = "PlayFoliyo | Discover Athletes";
          desc = "Search and discover high school, college, and professional athlete talent across sports.";
          break;
        case "opportunities":
          title = "PlayFoliyo | Sports Opportunities";
          desc = "Browse athletic scholarships, collegiate recruitment offers, and professional club tryouts.";
          break;
        case "tournaments":
          title = "PlayFoliyo | Tournaments & Events";
          desc = "Register for upcoming competitive matches, recruitment camps, and sports meets.";
          break;
        case "messages":
          title = "PlayFoliyo | Messaging Hub";
          desc = "Directly chat and connect with sports coaches, scouts, and fellow athletes on PlayFoliyo.";
          break;
        case "notifications":
          title = unreadCount > 0 ? `PlayFoliyo | Notifications (${unreadCount})` : "PlayFoliyo | Notifications";
          desc = "Check your latest athletic updates, offers, mentions, and connection alerts.";
          break;
        case "settings":
          title = "PlayFoliyo | Account Settings";
          desc = "Manage your PlayFoliyo athlete credentials, privacy settings, and notifications.";
          break;
        case "admin":
          title = "PlayFoliyo | Admin Control";
          desc = "System administration panel for content verification and user management.";
          break;
        default:
          title = "PlayFoliyo | Athlete Profiles & Opportunities";
          break;
      }
    } else {
      title = "PlayFoliyo | Showcase Athlete Portfolios & Discover Opportunities";
      desc = "An elite athletic recruitment and portfolio platform. Empowering high school, collegiate, and professional players to find scholarships and scouts.";
    }

    // Update document title
    document.title = title;

    // Update meta tags for social share previews
    const ogTitle = document.getElementById("meta-og-title");
    if (ogTitle) ogTitle.setAttribute("content", title);

    const ogDesc = document.getElementById("meta-og-description");
    if (ogDesc) ogDesc.setAttribute("content", desc);

    const twTitle = document.getElementById("meta-twitter-title");
    if (twTitle) twTitle.setAttribute("content", title);

    const twDesc = document.getElementById("meta-twitter-description");
    if (twDesc) twDesc.setAttribute("content", desc);
  }, [activeTab, user, profile, unreadCount]);

  // Main layout router
  const renderActiveTab = () => {
    if (!user) return null;

    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardTab
            user={user}
            profile={profile}
            onTabChange={setActiveTab}
            applicationsCount={applications.length}
          />
        );
      case "profile":
        return (
          <ProfileTab
            user={user}
            profile={profile}
            onProfileUpdate={handleProfileUpdate}
            onVerificationRequest={handleVerificationRequest}
          />
        );
      case "feed":
        return (
          <FeedTab
            user={user}
            profile={profile}
            posts={posts}
            isLoading={isPostsLoading}
            onCreatePost={handleCreatePost}
            onLikePost={handleLikePost}
            onCommentPost={handleCommentPost}
            onRefresh={fetchPosts}
          />
        );
      case "discover":
        return (
          <DiscoverTab
            user={user}
            profile={profile}
            onProfileUpdate={handleProfileUpdate}
            onSendMessage={handleSendMessageShortcut}
            onViewProfileExternal={handleViewProfileShortcut}
            initialSearchQuery={globalSearchQuery}
            onClearInitialSearchQuery={() => setGlobalSearchQuery("")}
          />
        );
      case "opportunities":
        return (
          <OpportunitiesTab
            user={user}
            onApply={(oppId) => setApplications([...applications, oppId])}
            applications={applications}
          />
        );
      case "tournaments":
        return (
          <TournamentsTab
            user={user}
            onRegister={(tourneyId) => setRegistrations([...registrations, tourneyId])}
            registrations={registrations}
            showToast={showToast}
          />
        );
      case "messages":
        return (
          <MessagesTab
            user={user}
            onSelectRecipientId={targetMessageRecipientId}
          />
        );
      case "notifications":
        return (
          <NotificationsTab
            user={user}
            onReadNotification={() => setUnreadCount(Math.max(0, unreadCount - 1))}
          />
        );
      case "settings":
        return (
          <SettingsTab
            user={user}
            profile={profile}
            onProfileUpdate={handleProfileUpdate}
          />
        );
      case "admin":
        if (user.role === "admin") {
          return <AdminTab user={user} />;
        }
        return null;
      default:
        return <DashboardTab user={user} profile={profile} onTabChange={setActiveTab} applicationsCount={applications.length} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col relative bg-grid-pattern pt-14">
      
      {/* Universal header bar */}
      <Header
        user={user}
        profilePic={profile?.profile_pic}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setTargetMessageRecipientId(null); // Clear active recipients when navigation shifts
        }}
        onLogout={handleLogout}
        onLogin={() => {
          setAuthTab("login");
          setAuthOpen(true);
        }}
        onJoin={() => {
          setAuthTab("signup");
          setAuthOpen(true);
        }}
        notificationsCount={unreadCount}
        searchQuery={globalSearchQuery}
        onSearchChange={(query) => {
          setGlobalSearchQuery(query);
          if (activeTab !== "discover") {
            setActiveTab("discover");
          }
        }}
      />

      {/* Main Core Body grid structure */}
      {user ? (
        <>
          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-20 md:pb-5 w-full">
            <div className={activeTab === "feed"
              ? "grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start"
              : "grid grid-cols-1 lg:grid-cols-12 gap-5 items-start"
            }>
              
              {/* Sidebar quick profile card */}
              <div className={activeTab === "feed"
                ? "hidden lg:block lg:sticky lg:top-[76px] self-start h-fit overflow-visible pr-1"
                : "lg:col-span-3 hidden lg:block lg:sticky lg:top-[80px] self-start max-h-[calc(100vh-110px)] overflow-y-auto pr-1"
              }>
                <Sidebar
                  user={user}
                  profile={profile}
                  activeTab={activeTab}
                  onTabChange={(tab) => {
                    setActiveTab(tab);
                    setTargetMessageRecipientId(null);
                  }}
                />
              </div>

              {/* Middle active route segment */}
              <div className={activeTab === "feed" ? "w-full" : "lg:col-span-9 col-span-12"}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                  >
                    {renderActiveTab()}
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>
          </main>

          {/* Locked Mobile Bottom Navigation Bar */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.06)] backdrop-blur-md bg-white/95">
            <nav className="flex justify-around items-center h-16">
              {[
                { id: "feed", label: "Feed", icon: FileText },
                { id: "discover", label: "Discover", icon: Search },
                { id: "opportunities", label: "Opportunities", icon: Award },
                { id: "tournaments", label: "Events", icon: Calendar },
                { id: "messages", label: "Messages", icon: MessageSquare },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setTargetMessageRecipientId(null);
                    }}
                    className={`flex flex-col items-center justify-center flex-1 h-full py-1 relative cursor-pointer ${
                      isSelected ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Icon className={`w-4.5 h-4.5 mb-1 transition-transform ${isSelected ? "text-blue-600 scale-105" : "text-slate-400"}`} />
                    <span className="text-[9px] font-semibold tracking-tight">{item.label}</span>
                    {isSelected && (
                      <motion.div
                        layoutId="bottom-nav-indicator"
                        className="absolute top-0 w-8 h-0.75 bg-blue-600 rounded-full"
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </>
      ) : (
        <LandingPage
          onJoin={() => {
            setAuthTab("signup");
            setAuthOpen(true);
          }}
          onLogin={() => {
            setAuthTab("login");
            setAuthOpen(true);
          }}
          onExplore={() => {
            setAuthTab("signup");
            setAuthOpen(true);
          }}
        />
      )}

      {/* Centralized Toast Notification Center */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="pointer-events-auto bg-slate-950 text-white rounded-xl shadow-2xl p-4 border border-slate-800 flex gap-3.5 items-start justify-between shadow-emerald-500/5"
            >
              <div className="flex gap-2.5 items-start">
                <div className={`mt-0.5 p-1 rounded-lg ${
                  toast.type === "success" 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                    : toast.type === "error" 
                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                    : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                }`}>
                  {toast.type === "success" ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : toast.type === "error" ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div>
                  {toast.title && <h4 className="font-extrabold text-xs tracking-tight text-slate-100">{toast.title}</h4>}
                  <p className="text-[11px] text-slate-300 font-medium leading-relaxed mt-0.5">{toast.message}</p>
                </div>
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-slate-400 hover:text-white p-0.5 rounded-md hover:bg-slate-800 transition-all cursor-pointer flex-shrink-0"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Credentials and login portal popup overlay */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={handleAuthSuccess}
        initialTab={authTab}
      />
    </div>
  );
}
