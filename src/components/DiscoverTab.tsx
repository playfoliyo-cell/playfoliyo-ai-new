import React, { useState, useEffect } from "react";
import { User, Profile } from "../types";
import { Search, MapPin, Award, CheckCircle, Trophy, Sparkles, MessageSquare, UserPlus, UserCheck, Shield, HelpCircle, X } from "lucide-react";
import ProfileCardView from "./ProfileCardView";

interface DiscoverTabProps {
  user: User;
  profile: Profile | null;
  onProfileUpdate: (updatedProfile: Profile) => void;
  onSendMessage: (targetId: string) => void;
  onViewProfileExternal: (targetId: string) => void;
  initialSearchQuery?: string;
  onClearInitialSearchQuery?: () => void;
}

interface DiscoverItem {
  user: {
    id: string;
    name: string;
    role: string;
    is_verified: boolean;
    verification_status: string;
  };
  profile: Profile;
}

const DISCOVER_ROLES = [
  { id: "all", label: "All Network" },
  { id: "athlete", label: "🏆 Athletes" },
  { id: "coach", label: "📋 Coaches" },
  { id: "academy", label: "🛡️ Academies" },
  { id: "scout", label: "🔍 Scouts" },
  { id: "sponsor", label: "💼 Sponsors" },
];

export default function DiscoverTab({ 
  user, 
  profile,
  onProfileUpdate,
  onSendMessage, 
  onViewProfileExternal,
  initialSearchQuery = "",
  onClearInitialSearchQuery
}: DiscoverTabProps) {
  const [items, setItems] = useState<DiscoverItem[]>([]);
  const [selectedRole, setSelectedRole] = useState("all");
  const [sportFilter, setSportFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  // States for search history and suggestions dropdown
  const [allProfiles, setAllProfiles] = useState<DiscoverItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<{ text: string; type: "name" | "sport" }[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem("playfoliyo_search_history");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // Load complete profiles list once for generating client-side auto-complete suggestions
  useEffect(() => {
    const fetchAllProfilesForSuggestions = async () => {
      try {
        const res = await fetch("/api/profiles");
        const data = await res.json();
        if (res.ok) {
          setAllProfiles(data);
        }
      } catch (e) {
        console.error("Failed to fetch profiles for suggestions", e);
      }
    };
    fetchAllProfilesForSuggestions();
  }, []);

  // Compute live suggestions matching the current query (highlights names or sports categories)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const queryLower = searchQuery.toLowerCase().trim();

    // Match users' names
    const matchingNames = allProfiles
      .filter(item => item.user.name?.toLowerCase().includes(queryLower))
      .map(item => ({ text: item.user.name, type: "name" as const }));

    // Match sports
    const uniqueSports = Array.from(new Set(allProfiles.map(item => item.profile.sport).filter(Boolean))) as string[];
    const matchingSports = uniqueSports
      .filter(sport => sport.toLowerCase().includes(queryLower))
      .map(sport => ({ text: sport, type: "sport" as const }));

    // Limit to top 6 combinations
    const combined = [...matchingNames, ...matchingSports].slice(0, 6);
    setSuggestions(combined);
  }, [searchQuery, allProfiles]);

  const [loading, setLoading] = useState(false);
  const [followingStates, setFollowingStates] = useState<{ [id: string]: boolean }>({});
  const [selectedProfileItem, setSelectedProfileItem] = useState<DiscoverItem | null>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      let url = `/api/profiles?`;
      if (selectedRole !== "all") url += `role=${selectedRole}&`;
      if (sportFilter) url += `sport=${encodeURIComponent(sportFilter)}&`;
      if (locationFilter) url += `location=${encodeURIComponent(locationFilter)}&`;
      if (searchQuery) url += `query=${encodeURIComponent(searchQuery)}&`;

      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setItems(data);
        
        // Populate initial follow states based on followers list or existing following array
        const initialStates: { [id: string]: boolean } = {};
        data.forEach((item: DiscoverItem) => {
          if (profile?.following?.includes(item.user.id) || item.profile.followers?.includes(user.id)) {
            initialStates[item.user.id] = true;
          }
        });
        setFollowingStates(initialStates);
      }
    } catch (e) {
      console.error("Failed to fetch discover profiles", e);
    } finally {
      setLoading(false);
    }
  };

  const saveToSearchHistory = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;

    setSearchHistory(prev => {
      const filtered = prev.filter(item => item.toLowerCase() !== trimmed.toLowerCase());
      const newHistory = [trimmed, ...filtered].slice(0, 5);
      localStorage.setItem("playfoliyo_search_history", JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("playfoliyo_search_history");
  };

  const performSearchWithQuery = (q: string) => {
    setSearchQuery(q);
    
    let url = `/api/profiles?`;
    if (selectedRole !== "all") url += `role=${selectedRole}&`;
    if (sportFilter) url += `sport=${encodeURIComponent(sportFilter)}&`;
    if (locationFilter) url += `location=${encodeURIComponent(locationFilter)}&`;
    if (q) url += `query=${encodeURIComponent(q)}&`;

    setLoading(true);
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setItems(data);
        
        // Update local follow states
        const initialStates: { [id: string]: boolean } = {};
        data.forEach((item: DiscoverItem) => {
          if (profile?.following?.includes(item.user.id) || item.profile.followers?.includes(user.id)) {
            initialStates[item.user.id] = true;
          }
        });
        setFollowingStates(initialStates);
        
        setLoading(false);
      })
      .catch(err => {
        console.error("Search failed", err);
        setLoading(false);
      });

    saveToSearchHistory(q);
  };

  const handleSuggestionClick = (suggestionText: string) => {
    performSearchWithQuery(suggestionText);
    setShowSuggestions(false);
  };

  const handleRecentSearchClick = (q: string) => {
    performSearchWithQuery(q);
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) => 
          regex.test(part) ? (
            <mark key={i} className="bg-yellow-100 text-slate-900 font-extrabold px-0.5 rounded-sm">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const handleFollowToggle = async (targetId: string) => {
    try {
      const res = await fetch(`/api/profiles/${targetId}/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      if (res.ok) {
        const data = await res.json();
        
        // 1. Toggle local follow status
        setFollowingStates(prev => ({
          ...prev,
          [targetId]: !prev[targetId]
        }));

        // 2. Synchronize current logged-in user's profile following array globally
        if (profile) {
          onProfileUpdate({
            ...profile,
            following: data.following
          });
        }

        // 3. Update the item's followers array dynamically so follower count updates immediately on the card
        setItems(prevItems =>
          prevItems.map(item => {
            if (item.user.id === targetId) {
              return {
                ...item,
                profile: {
                  ...item.profile,
                  followers: data.followers
                }
              };
            }
            return item;
          })
        );

        // 4. Update the active modal profile reference if open
        if (selectedProfileItem && selectedProfileItem.user.id === targetId) {
          setSelectedProfileItem(prev => {
            if (!prev) return null;
            return {
              ...prev,
              profile: {
                ...prev.profile,
                followers: data.followers
              }
            };
          });
        }
      }
    } catch (e) {
      console.error("Follow action failed", e);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [selectedRole, sportFilter, locationFilter]);

  return (
    <div className="space-y-6 pb-16">
      
      {/* Filtering control board */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Targeted Ecosystem Filters</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Text/Keyword query search with live autocomplete */}
          <div className="relative z-30">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="discover-search-query"
              type="text"
              placeholder="Search by name, skills, clubs..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => {
                // Delayed blur to allow onMouseDown on suggestions to register
                setTimeout(() => setShowSuggestions(false), 250);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  performSearchWithQuery(searchQuery);
                  setShowSuggestions(false);
                }
              }}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-blue-500 bg-slate-50/50 font-medium text-slate-800"
            />

            {/* Suggestions dropdown matching query */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden divide-y divide-slate-100 animate-in fade-in duration-150">
                <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Scouting Suggestions</span>
                  <span className="text-[8px] font-semibold text-blue-500 uppercase tracking-wide">Match found</span>
                </div>
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSuggestionClick(item.text);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <span className="text-xs text-slate-700 font-semibold block truncate">
                      {highlightText(item.text, searchQuery)}
                    </span>
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-sm tracking-wider shrink-0 ${
                      item.type === "sport" 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                        : "bg-blue-50 text-blue-700 border border-blue-100"
                    }`}>
                      {item.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sport filter */}
          <input
            id="discover-sport-filter"
            type="text"
            placeholder="Sport (e.g. Cricket, Football)"
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-blue-500 bg-slate-50/50"
          />

          {/* Location filter */}
          <input
            id="discover-location-filter"
            type="text"
            placeholder="Geographical Region (e.g. Mumbai, Punjab)"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-blue-500 bg-slate-50/50"
          />
        </div>

        {/* Recent Search History chips (visible when search bar is empty) */}
        {searchQuery.trim() === "" && searchHistory.length > 0 && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 animate-in fade-in duration-200">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mr-1">Recent Searches:</span>
            {searchHistory.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleRecentSearchClick(q)}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] transition-colors cursor-pointer border border-slate-200/50 flex items-center gap-1"
              >
                <Search className="w-2.5 h-2.5 text-slate-400" />
                <span>{q}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={clearSearchHistory}
              className="text-[9px] font-bold text-rose-500 hover:text-rose-600 cursor-pointer uppercase ml-2 transition-colors"
            >
              Clear History
            </button>
          </div>
        )}

        {/* Horizontal scrollable role tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {DISCOVER_ROLES.map((role) => (
            <button
              id={`discover-role-tab-${role.id}`}
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                selectedRole === role.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-150"
              }`}
            >
              {role.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of users */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white border border-slate-200 rounded-xl h-64 animate-pulse shadow-sm"></div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center max-w-xl mx-auto shadow-sm">
          <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-sm">No profiles match criteria</h3>
          <p className="text-xs text-slate-400 mt-1">Try loosening your sport discipline or geographical search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => {
            const isSelf = item.user.id === user.id;
            const isFollowing = followingStates[item.user.id] || false;
            const isVerified = item.user.is_verified || item.user.verification_status === "approved";

            return (
              <div
                id={`discover-card-${item.user.id}`}
                key={item.user.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Header background with role tag */}
                <div className="h-16 bg-gradient-to-r from-slate-100 to-slate-200 p-3.5 flex justify-between items-start relative">
                  <span className="bg-white border border-slate-200 text-slate-700 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                    {item.user.role}
                  </span>
                  {isVerified && (
                    <span className="bg-emerald-50 text-emerald-700 text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-100 flex items-center space-x-0.5">
                      <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>

                {/* Avatar and Info Body */}
                <div className="px-4 pb-4 relative flex-1 flex flex-col items-center text-center -mt-8">
                  <div className="w-14 h-14 rounded-lg border-2 border-white overflow-hidden shadow-sm bg-slate-50 mb-2">
                    <img
                      src={item.profile?.profile_pic || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"}
                      alt={item.user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h3 className="font-bold text-slate-900 text-xs tracking-tight leading-tight line-clamp-1">{item.user.name}</h3>
                  <span className="text-[10px] text-blue-600 font-bold mt-1 block">
                    {item.profile.sport ? `${item.profile.position || "Representative"} • ${item.profile.sport}` : "Sports Enthusiast"}
                  </span>
                  
                  <div className="flex items-center space-x-1 text-[9px] text-slate-400 mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>{item.profile.location || "India Region"}</span>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-normal mt-2.5 line-clamp-3">
                    {item.profile.bio || "No biography added. This user is expanding their athletic career pathways."}
                  </p>

                  {/* Career Stats Preview */}
                  {item.profile.experience && (
                    <div className="bg-slate-50 rounded-lg p-2 mt-3.5 w-full grid grid-cols-2 gap-2 text-center border border-slate-150">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-700">{item.profile.experience}</span>
                        <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-wide">Experience</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-700">{item.profile.followers?.length || 0}</span>
                        <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-wide">Followers</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card CTA Actions */}
                <div className="p-3 border-t border-slate-150 bg-slate-50/50 flex space-x-2">
                  <button
                    id={`discover-view-profile-${item.user.id}`}
                    onClick={() => setSelectedProfileItem(item)}
                    className="flex-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs py-1.5 rounded-lg transition-all cursor-pointer"
                  >
                    View CV
                  </button>

                  {!isSelf && (
                    <>
                      <button
                        id={`discover-follow-btn-${item.user.id}`}
                        onClick={() => handleFollowToggle(item.user.id)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          isFollowing
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-600 hover:text-slate-800"
                        }`}
                        title={isFollowing ? "Following" : "Follow"}
                      >
                        {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                      </button>

                      <button
                        id={`discover-msg-btn-${item.user.id}`}
                        onClick={() => onSendMessage(item.user.id)}
                        className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
                        title="Send Message"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* GORGEOUS ATHLETE DETAIL MODAL */}
      {selectedProfileItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-50 w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-150 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Reviewing {selectedProfileItem.user.role} Portfolio
                </span>
              </div>
              <button
                onClick={() => setSelectedProfileItem(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body with custom scrolling */}
            <div className="p-6 overflow-y-auto flex-1 scrollbar-thin">
              <ProfileCardView
                user={selectedProfileItem.user as User}
                profile={selectedProfileItem.profile}
                isSelf={selectedProfileItem.user.id === user.id}
                onFollowToggle={() => handleFollowToggle(selectedProfileItem.user.id)}
                isFollowing={followingStates[selectedProfileItem.user.id] || false}
                onSendMessage={() => {
                  setSelectedProfileItem(null);
                  onSendMessage(selectedProfileItem.user.id);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
