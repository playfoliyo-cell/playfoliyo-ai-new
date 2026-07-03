import React, { useState } from "react";
import { User, Profile } from "../types";
import { 
  Settings, 
  Lock, 
  Bell, 
  Globe, 
  Shield, 
  Save, 
  CheckCircle2, 
  Mail, 
  Eye, 
  EyeOff, 
  MessageSquare, 
  Sliders, 
  Clock, 
  Tv, 
  LayoutGrid,
  Loader2
} from "lucide-react";
import { motion } from "motion/react";

interface SettingsTabProps {
  user: User;
  profile: Profile | null;
  onProfileUpdate: (updatedProfile: Profile) => void;
}

export default function SettingsTab({ user, profile, onProfileUpdate }: SettingsTabProps) {
  // Local states initialized with existing profile fields or sensible defaults
  const [profileVisibility, setProfileVisibility] = useState<"public" | "private" | "network">(
    profile?.profile_visibility || "public"
  );
  const [onlineStatusPreference, setOnlineStatusPreference] = useState<"show_online" | "show_last_seen" | "hide_last_seen">(
    (profile as any)?.online_status_preference || "show_online"
  );
  const [showEmail, setShowEmail] = useState<boolean>(
    profile?.show_email !== undefined ? profile.show_email : true
  );
  const [allowDirectMessages, setAllowDirectMessages] = useState<boolean>(
    profile?.allow_direct_messages !== undefined ? profile.allow_direct_messages : true
  );

  const [notifEmail, setNotifEmail] = useState<boolean>(
    profile?.notifications_email !== undefined ? profile.notifications_email : true
  );
  const [notifPush, setNotifPush] = useState<boolean>(
    profile?.notifications_push !== undefined ? profile.notifications_push : false
  );
  const [notifMessages, setNotifMessages] = useState<boolean>(
    profile?.notifications_messages !== undefined ? profile.notifications_messages : true
  );
  const [notifOpportunities, setNotifOpportunities] = useState<boolean>(
    profile?.notifications_opportunities !== undefined ? profile.notifications_opportunities : true
  );
  const [notifFollowers, setNotifFollowers] = useState<boolean>(
    profile?.notifications_followers !== undefined ? profile.notifications_followers : true
  );

  const [preferredLanguage, setPreferredLanguage] = useState<string>(
    profile?.preferred_language || "English"
  );
  const [timezone, setTimezone] = useState<string>(
    profile?.timezone || "GMT-5"
  );
  const [autoPlayVideos, setAutoPlayVideos] = useState<boolean>(
    profile?.auto_play_videos !== undefined ? profile.auto_play_videos : true
  );
  const [compactDashboard, setCompactDashboard] = useState<boolean>(
    profile?.compact_dashboard_view !== undefined ? profile.compact_dashboard_view : false
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);

    // Prepare updated profile
    const updatedProfileData: Partial<Profile> = {
      profile_visibility: profileVisibility,
      online_status_preference: onlineStatusPreference,
      show_email: showEmail,
      allow_direct_messages: allowDirectMessages,
      notifications_email: notifEmail,
      notifications_push: notifPush,
      notifications_messages: notifMessages,
      notifications_opportunities: notifOpportunities,
      notifications_followers: notifFollowers,
      preferred_language: preferredLanguage,
      timezone: timezone,
      auto_play_videos: autoPlayVideos,
      compact_dashboard_view: compactDashboard,
    };

    try {
      const res = await fetch(`/api/profiles/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProfileData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onProfileUpdate(data.profile);
        setSaveSuccess(true);
        // Clear success message after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setError(data.message || "Could not update settings in database.");
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
      setError("Network or server error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16">
      
      {/* Settings Title Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex justify-between items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/40 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="relative">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600 animate-spin-slow" />
            <span>Account & Privacy Preferences</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure how your sports recruitment digital CV is shared, tweak alerts, and change view metrics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* SECTION 1: PRIVACY SETTINGS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Lock className="w-4 h-4 text-rose-500" />
            <span>Privacy & Visibility</span>
          </h2>

          {/* Visibility Options */}
          <div className="space-y-2.5">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Profile Visibility
            </label>
            
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "public", label: "Public", desc: "Everyone can search & view", icon: Eye },
                { value: "network", label: "Network Only", desc: "Only connected users", icon: Shield },
                { value: "private", label: "Private", desc: "Hidden from search engines", icon: EyeOff }
              ].map((option) => {
                const Icon = option.icon;
                const isSelected = profileVisibility === option.value;
                return (
                  <button
                    id={`settings-privacy-btn-${option.value}`}
                    key={option.value}
                    type="button"
                    onClick={() => setProfileVisibility(option.value as any)}
                    className={`flex flex-col items-center justify-between p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/30 ring-1 ring-blue-500/20"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? "text-blue-600" : "text-slate-400"}`} />
                    <span className={`text-[11px] font-bold ${isSelected ? "text-blue-700" : "text-slate-700"}`}>
                      {option.label}
                    </span>
                    <span className="text-[8px] text-slate-400 leading-tight mt-1">
                      {option.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Privacy Toggles */}
          <div className="space-y-3 pt-2">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Privacy Overrides
            </label>

            {/* Show Email Switch */}
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-150 rounded-xl">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-slate-700 block">Display Email Address</span>
                <span className="text-[9px] text-slate-400 block leading-tight">
                  Allow verified scouts and clubs to view your contact email
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="settings-toggle-show-email"
                  type="checkbox"
                  checked={showEmail}
                  onChange={(e) => setShowEmail(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Direct Messages Switch */}
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-150 rounded-xl">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-slate-700 block">Allow Direct Messages</span>
                <span className="text-[9px] text-slate-400 block leading-tight">
                  Let other players, coaches, or recruiters open new chats with you
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="settings-toggle-allow-dm"
                  type="checkbox"
                  checked={allowDirectMessages}
                  onChange={(e) => setAllowDirectMessages(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Online Status Privacy Select */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Online Status Privacy
              </label>
              <select
                id="settings-select-online-privacy"
                value={onlineStatusPreference}
                onChange={(e) => setOnlineStatusPreference(e.target.value as any)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-blue-500 bg-slate-50 text-slate-700"
              >
                <option value="show_online">Show Online (Active green light indicator)</option>
                <option value="show_last_seen">Show Last Seen (Displays active grey light recently)</option>
                <option value="hide_last_seen">Hide Last Seen (Completely offline status to everyone)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: NOTIFICATION PREFERENCES */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell className="w-4 h-4 text-blue-500" />
            <span>Notification Hub</span>
          </h2>

          <div className="space-y-3">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Alert Delivery Channels
            </label>

            {/* Email Notif */}
            <div className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-lg transition-colors">
              <div className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-[11px] font-bold text-slate-700 block">Email Newsletters & Alerts</span>
                  <span className="text-[9px] text-slate-400 block">Weekly Digests of matching offers</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="settings-toggle-notif-email"
                  type="checkbox"
                  checked={notifEmail}
                  onChange={(e) => setNotifEmail(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Push Notif */}
            <div className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-lg transition-colors">
              <div className="flex items-center space-x-2.5">
                <Bell className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-[11px] font-bold text-slate-700 block">Real-time Push Alerts</span>
                  <span className="text-[9px] text-slate-400 block">Instant browser notification indicators</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="settings-toggle-notif-push"
                  type="checkbox"
                  checked={notifPush}
                  onChange={(e) => setNotifPush(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-2">
              Activity Triggers
            </label>

            {/* Messages Trigger */}
            <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
              <span className="text-[11px] font-medium text-slate-600">New Direct Messages</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="settings-toggle-notif-messages"
                  type="checkbox"
                  checked={notifMessages}
                  onChange={(e) => setNotifMessages(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Opportunities Trigger */}
            <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
              <span className="text-[11px] font-medium text-slate-600">Matching Trial or Scholarship Offers</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="settings-toggle-notif-opps"
                  type="checkbox"
                  checked={notifOpportunities}
                  onChange={(e) => setNotifOpportunities(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Followers Trigger */}
            <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
              <span className="text-[11px] font-medium text-slate-600">New Connection Followers</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="settings-toggle-notif-followers"
                  type="checkbox"
                  checked={notifFollowers}
                  onChange={(e) => setNotifFollowers(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 3: WORKSPACE PREFERENCES */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sliders className="w-4 h-4 text-emerald-500" />
          <span>Workspace & Language Preference</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left: Dropdowns */}
          <div className="space-y-4">
            {/* Preferred Language */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Preferred Language</span>
              </label>
              <select
                id="settings-select-language"
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-blue-500 bg-slate-50"
              >
                <option value="English">English (United States)</option>
                <option value="Spanish">Español (España/Latam)</option>
                <option value="French">Français (France)</option>
                <option value="German">Deutsch (Deutschland)</option>
                <option value="Portuguese">Português (Brasil)</option>
              </select>
            </div>

            {/* Timezone */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Default Timezone</span>
              </label>
              <select
                id="settings-select-timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-blue-500 bg-slate-50"
              >
                <option value="GMT-8">Pacific Standard Time (GMT-8)</option>
                <option value="GMT-5">Eastern Standard Time (GMT-5)</option>
                <option value="GMT">Greenwich Mean Time (GMT)</option>
                <option value="GMT+1">Central European Time (GMT+1)</option>
                <option value="GMT+8">China Standard Time (GMT+8)</option>
              </select>
            </div>
          </div>

          {/* Right: Interface Controls */}
          <div className="space-y-3">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Interface Customizations
            </label>

            {/* Compact Dashboard Switch */}
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-150 rounded-xl">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-slate-700 block flex items-center gap-1.5">
                  <LayoutGrid className="w-3.5 h-3.5 text-slate-400" />
                  <span>Compact Dashboard View</span>
                </span>
                <span className="text-[9px] text-slate-400 block leading-tight">
                  Condense spacing and shrink metric graphs to fit more details
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="settings-toggle-compact-dashboard"
                  type="checkbox"
                  checked={compactDashboard}
                  onChange={(e) => setCompactDashboard(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Auto-play Videos Switch */}
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-150 rounded-xl">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-slate-700 block flex items-center gap-1.5">
                  <Tv className="w-3.5 h-3.5 text-slate-400" />
                  <span>Auto-Play Video Highlights</span>
                </span>
                <span className="text-[9px] text-slate-400 block leading-tight">
                  Automatically preview video highlights directly in your feed
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="settings-toggle-autoplay"
                  type="checkbox"
                  checked={autoPlayVideos}
                  onChange={(e) => setAutoPlayVideos(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Save Action Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {error && <p className="text-xs font-bold text-rose-500 mb-1">{error}</p>}
          {saveSuccess && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings successfully synchronized with database!</span>
            </motion.div>
          )}
          {!error && !saveSuccess && (
            <p className="text-[10px] text-slate-400 font-medium">
              Changes take effect immediately across all linked recruiter dashboards.
            </p>
          )}
        </div>

        <button
          id="settings-save-btn"
          type="button"
          disabled={isSaving}
          onClick={handleSaveSettings}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer min-w-[150px]"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Preferences...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="bg-rose-50/20 border border-rose-200 rounded-2xl p-6 mt-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-rose-50 border border-rose-100 rounded-xl text-rose-600">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Danger Zone</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Permanently delete your PlayFoliyo account and purge all records, athletic CV documents, highlight reels, and chats.
            </p>
          </div>
        </div>

        <div className="border-t border-rose-100/60 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="max-w-xl">
            <span className="text-xs font-bold text-rose-800 block">Permanently Delete Account</span>
            <span className="text-[10px] text-slate-400 font-semibold block mt-1">
              Warning: This is an irreversible action. All your profile data, athletic accomplishments, followed lists, and messaging history will be permanently wiped from our systems.
            </span>
          </div>
          <button
            id="settings-delete-account-btn"
            type="button"
            onClick={() => {
              if (window.confirm("⚠️ CRITICAL WARNING ⚠️\n\nAre you absolutely sure you want to permanently delete your athletic account? This will permanently wipe all your records and achievements from PlayFoliyo databases. This is IRREVERSIBLE.")) {
                fetch(`/api/admin/users/${user.id}/delete`, { method: "POST" })
                  .then(() => {
                    alert("Your profile and all data have been completely scrubbed from PlayFoliyo. We hope to see you back on the field soon!");
                    localStorage.removeItem("playfoliyo_user");
                    localStorage.removeItem("playfoliyo_profile");
                    window.location.reload();
                  });
              }
            }}
            className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-rose-500/10 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap self-start sm:self-center"
          >
            Delete Account
          </button>
        </div>
      </div>

    </div>
  );
}
