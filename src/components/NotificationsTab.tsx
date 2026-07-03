import React, { useState, useEffect } from "react";
import { User, Notification } from "../types";
import { Bell, ShieldCheck, Mail, CheckCircle, Trophy, HelpCircle, Eye } from "lucide-react";

interface NotificationsTabProps {
  user: User;
  onReadNotification: (notifId: string) => void;
}

export default function NotificationsTab({ user, onReadNotification }: NotificationsTabProps) {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications/${user.id}`);
      const data = await res.json();
      if (res.ok) {
        setNotifs(data);
      }
    } catch (e) {
      console.error("Failed to load notifications", e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: "POST",
      });
      if (res.ok) {
        onReadNotification(id);
        fetchNotifs();
      }
    } catch (e) {
      console.error("Mark read error:", e);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [user.id]);

  const getIcon = (type: string) => {
    switch (type) {
      case "follower":
        return <Trophy className="w-4 h-4 text-amber-500" />;
      case "profile_view":
        return <Eye className="w-4 h-4 text-blue-500" />;
      case "message":
        return <Mail className="w-4 h-4 text-slate-500" />;
      case "verification_update":
        return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      default:
        return <Bell className="w-4 h-4 text-[#1D4ED8]" />;
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-16">
      
      {/* Header alert panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#1D4ED8]" />
            <span>Alert & Notifications Hub</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Review new recruitment trials matches, connection follows, and profile audit updates.</p>
        </div>
      </div>

      {/* Lists */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white h-20 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : notifs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-sm">You are completely caught up!</h3>
          <p className="text-xs text-slate-400 mt-1">New scholarship and scouting interest logs will show up here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifs.map((notif) => (
            <div
              id={`notification-card-${notif.id}`}
              key={notif.id}
              onClick={() => !notif.read && handleMarkAsRead(notif.id)}
              className={`p-4 rounded-xl border transition-all flex items-start space-x-3.5 cursor-pointer ${
                notif.read
                  ? "bg-white border-slate-100 opacity-60"
                  : "bg-blue-50/20 border-blue-100 shadow-xs"
              }`}
            >
              <div className="p-2.5 rounded-lg bg-slate-100 shrink-0">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 space-y-0.5">
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-bold block ${notif.read ? "text-slate-700" : "text-slate-900"}`}>
                    {notif.title}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {new Date(notif.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{notif.description}</p>
              </div>

              {!notif.read && (
                <span className="w-2 h-2 rounded-full bg-blue-500 mt-2.5 shrink-0"></span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
