import React, { useState, useEffect } from "react";
import { User, Tournament, Profile } from "../types";
import { 
  Trophy, 
  MapPin, 
  Calendar, 
  Clock,
  HelpCircle, 
  Plus, 
  X, 
  Award, 
  CheckCircle, 
  Search, 
  Filter, 
  BarChart3, 
  Users, 
  Trash2, 
  Edit, 
  Activity, 
  UserCheck, 
  Sparkles, 
  TrendingUp, 
  Tag, 
  Eye, 
  EyeOff, 
  MessageSquare,
  Map,
  Network,
  LayoutGrid
} from "lucide-react";

const COMMON_SPORTS = [
  "Football",
  "Basketball",
  "Tennis",
  "Cricket",
  "Rugby",
  "Volleyball",
  "Badminton",
  "Field Hockey",
  "Baseball",
  "Swimming",
  "Golf",
  "Table Tennis",
  "Athletics",
  "American Football",
  "Ice Hockey",
  "Handball"
];

const formatTime = (timeStr: string) => {
  if (!timeStr) return "";
  const [hourStr, minStr] = timeStr.split(":");
  const hour = parseInt(hourStr);
  const ampm = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${formattedHour}:${minStr} ${ampm}`;
};

const formatDateRange = (start: string, end: string) => {
  if (!start) return "";
  const options: Intl.DateTimeFormatOptions = { month: "long", day: "numeric", year: "numeric" };
  const startFormatted = new Date(start).toLocaleDateString("en-US", options);
  if (!end || start === end) return startFormatted;
  const endFormatted = new Date(end).toLocaleDateString("en-US", options);
  return `${startFormatted} - ${endFormatted}`;
};

interface TournamentsTabProps {
  user: User;
  onRegister: (tourneyId: string) => void;
  registrations: string[]; // List of registered tourneyIds
  showToast: (message: string, type?: "success" | "error" | "info", title?: string) => void;
}

export default function TournamentsTab({ user, onRegister, registrations, showToast }: TournamentsTabProps) {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"browse" | "organizer">("browse");

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState("");
  const [sport, setSport] = useState("");
  const [location, setLocation] = useState("");
  const [dates, setDates] = useState("");
  const [description, setDescription] = useState("");
  const [results, setResults] = useState("");
  const [category, setCategory] = useState("Championship");

  // Detailed Date, Time, and Auto-complete States for Creation
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [sportSuggestions, setSportSuggestions] = useState<string[]>([]);
  const [showSportSuggestions, setShowSportSuggestions] = useState(false);

  const handleSportChange = (val: string) => {
    setSport(val);
    if (!val.trim()) {
      setSportSuggestions([]);
      setShowSportSuggestions(false);
      return;
    }
    const allSports = Array.from(new Set([...COMMON_SPORTS, ...tournaments.map(t => t.sport)]))
      .filter(Boolean)
      .map(s => s.trim());
    
    const filtered = allSports.filter(s => 
      s.toLowerCase().includes(val.toLowerCase()) && 
      s.toLowerCase() !== val.toLowerCase()
    );
    setSportSuggestions(filtered);
    setShowSportSuggestions(filtered.length > 0);
  };

  const handleSelectSportSuggestion = (s: string) => {
    setSport(s);
    setSportSuggestions([]);
    setShowSportSuggestions(false);
  };

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Browse Mode & Interactive Map State
  const [browseMode, setBrowseMode] = useState<"list" | "map">("list");
  const [selectedMapTourney, setSelectedMapTourney] = useState<Tournament | null>(null);

  // Bracket Interactive State
  const [selectedTourneyForBracket, setSelectedTourneyForBracket] = useState<Tournament | null>(null);
  const [showBracketModal, setShowBracketModal] = useState(false);
  const [selectedMatchToEdit, setSelectedMatchToEdit] = useState<any | null>(null);
  const [editScore1, setEditScore1] = useState<number | "">("");
  const [editScore2, setEditScore2] = useState<number | "">("");
  const [selectedWinnerName, setSelectedWinnerName] = useState("");
  const [bracketTeams, setBracketTeams] = useState<string[]>([]);
  const [newTeamNameInput, setNewTeamNameInput] = useState("");

  useEffect(() => {
    if (selectedTourneyForBracket) {
      const registeredTeamNames = selectedTourneyForBracket.registrations.map(userId => {
        const p = profiles.find(prof => prof.user_id === userId);
        return p?.current_team || `Team #${userId.slice(-4)}`;
      });
      
      if (registeredTeamNames.length < 4) {
        const placeholders = ["Viper Strike FC", "Apex Mavericks", "Titans Athletic", "Omega Knights", "Horizon United", "Elite Athletics", "Blaze FC", "Sentinel SC"];
        const padded = [...registeredTeamNames];
        while (padded.length < 4) {
          const next = placeholders[padded.length % placeholders.length];
          if (!padded.includes(next)) padded.push(next);
          else padded.push(`${next} II`);
        }
        setBracketTeams(padded);
      } else {
        setBracketTeams(registeredTeamNames);
      }
    } else {
      setBracketTeams([]);
      setNewTeamNameInput("");
    }
  }, [selectedTourneyForBracket, profiles]);

  // Management State
  const [managingTourney, setManagingTourney] = useState<Tournament | null>(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [updatingResultsId, setUpdatingResultsId] = useState<string | null>(null);
  const [newResultsText, setNewResultsText] = useState("");
  const [newStatusText, setNewStatusText] = useState<"upcoming" | "ongoing" | "completed">("upcoming");

  // Coordinate helper for Map view
  const getCoordinatesForLocation = (loc: string): { x: number; y: number } => {
    const l = loc.toLowerCase();
    if (l.includes("paris")) return { x: 45, y: 55 }; // in %
    if (l.includes("manchester")) return { x: 38, y: 35 };
    if (l.includes("london")) return { x: 40, y: 42 };
    if (l.includes("barcelona")) return { x: 30, y: 80 };
    if (l.includes("madrid")) return { x: 22, y: 82 };
    if (l.includes("munich")) return { x: 55, y: 52 };
    if (l.includes("milan")) return { x: 52, y: 68 };
    if (l.includes("berlin")) return { x: 58, y: 40 };
    if (l.includes("amsterdam")) return { x: 44, y: 44 };
    
    // Hash-based deterministic coordinates so any new location lands in a nice spot on our map
    let hash = 0;
    for (let i = 0; i < loc.length; i++) {
      hash = loc.charCodeAt(i) + ((hash << 5) - hash);
    }
    const x = 15 + Math.abs(hash % 70); // 15% to 85%
    const y = 25 + Math.abs((hash >> 3) % 55); // 25% to 80%
    return { x, y };
  };

  // Generate a tournament bracket
  const handleGenerateBracket = async (tourneyId: string, teams: string[]) => {
    try {
      const res = await fetch(`/api/tournaments/${tourneyId}/bracket/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teams })
      });
      if (res.ok) {
        const updated = await res.json();
        // Update both the main list and current selected bracket tournament
        setTournaments(prev => prev.map(t => t.id === tourneyId ? updated : t));
        setSelectedTourneyForBracket(updated);
        showToast("Scouting bracket generated successfully!", "success", "Bracket Generated");
      }
    } catch (e) {
      console.error("Bracket generation failed", e);
      showToast("Could not generate tournament bracket.", "error", "Error");
    }
  };

  // Update a match score and advance the winner
  const handleUpdateBracketMatch = async (tourneyId: string, matchId: string, score1: number, score2: number, winnerName: string) => {
    try {
      const res = await fetch(`/api/tournaments/${tourneyId}/bracket/match/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ match_id: matchId, score1, score2, winner_name: winnerName })
      });
      if (res.ok) {
        const updated = await res.json();
        setTournaments(prev => prev.map(t => t.id === tourneyId ? updated : t));
        setSelectedTourneyForBracket(updated);
        setSelectedMatchToEdit(null);
        showToast("Match results updated and bracket advanced!", "success", "Bracket Updated");
      }
    } catch (e) {
      console.error("Match update failed", e);
      showToast("Could not save match score.", "error", "Error");
    }
  };

  // Fetch all necessary data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [tourneyRes, profilesRes] = await Promise.all([
        fetch("/api/tournaments"),
        fetch("/api/profiles")
      ]);
      
      if (tourneyRes.ok) {
        const tourneyData = await tourneyRes.json();
        setTournaments(tourneyData);
      }
      
      if (profilesRes.ok) {
        const profilesData = await profilesRes.json();
        setProfiles(profilesData);
      }
    } catch (e) {
      console.error("Failed to load tournaments and profiles", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter tournaments
  const filteredTournaments = tournaments.filter((tourney) => {
    const matchesSearch = 
      tourney.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tourney.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tourney.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSport = selectedSport === "all" || tourney.sport.toLowerCase() === selectedSport.toLowerCase();
    const matchesLocation = selectedLocation === "all" || tourney.location.toLowerCase().includes(selectedLocation.toLowerCase());
    const matchesCategory = selectedCategory === "all" || tourney.category === selectedCategory;

    return matchesSearch && matchesSport && matchesLocation && matchesCategory;
  });

  // Get unique filter values
  const uniqueSports = Array.from(new Set(tournaments.map((t) => t.sport))).filter(Boolean);
  const uniqueLocations = Array.from(new Set(tournaments.map((t) => {
    // Return city name by splitting on comma if exists
    return t.location.split(",")[0].trim();
  }))).filter(Boolean);

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setName("");
    setSport("");
    setLocation("");
    setDates("");
    setStartDate("");
    setEndDate("");
    setStartTime("");
    setEndTime("");
    setSportSuggestions([]);
    setShowSportSuggestions(false);
    setDescription("");
    setResults("");
    setCategory("Championship");
  };

  // Handle tournament creation
  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sport || !location || !startDate) return;

    // Build dates string dynamically
    const formattedDates = formatDateRange(startDate, endDate || startDate) + (startTime ? ` @ ${formatTime(startTime)}${endTime ? ` - ${formatTime(endTime)}` : ""}` : "");

    try {
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          sport, 
          location, 
          dates: formattedDates, 
          description, 
          results, 
          category,
          creator_id: user.id
        }),
      });

      if (res.ok) {
        handleCloseCreateModal();
        fetchData();
        showToast(
          `"${name}" has been successfully hosted and is now live for athlete scouting.`,
          "success",
          "Tournament Event Created"
        );
      }
    } catch (e) {
      console.error("Create tournament failed", e);
    }
  };

  // Register for tournament
  const handleRegisterClick = async (tourneyId: string) => {
    const tourney = tournaments.find((t) => t.id === tourneyId);
    try {
      const res = await fetch(`/api/tournaments/${tourneyId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });

      if (res.ok) {
        onRegister(tourneyId);
        fetchData();
        showToast(
          `You have successfully registered for the "${tourney?.name || "Tournament"}". Check your dashboard for match updates.`,
          "success",
          "Registration Confirmed!"
        );
      }
    } catch (e) {
      console.error("Registration failed", e);
    }
  };

  // Unregister participant
  const handleUnregisterParticipant = async (tourneyId: string, participantId: string) => {
    try {
      const res = await fetch(`/api/tournaments/${tourneyId}/unregister`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: participantId }),
      });

      if (res.ok) {
        fetchData();
        // Update local managing tournament state if open
        setTournaments((prev) => {
          const updated = prev.map((t) => {
            if (t.id === tourneyId) {
              const copy = { ...t };
              copy.registrations = copy.registrations.filter((id) => id !== participantId);
              if (managingTourney && managingTourney.id === tourneyId) {
                setManagingTourney(copy);
              }
              return copy;
            }
            return t;
          });
          return updated;
        });
      }
    } catch (e) {
      console.error("Unregistration failed", e);
    }
  };

  // Update Tournament details (Status / Results)
  const handleUpdateTournament = async (tourneyId: string, updatedFields: Partial<Tournament>) => {
    try {
      const res = await fetch(`/api/tournaments/${tourneyId}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });

      if (res.ok) {
        const updated = await res.json();
        setUpdatingResultsId(null);
        fetchData();
        if (managingTourney && managingTourney.id === tourneyId) {
          setManagingTourney(updated);
        }
      }
    } catch (e) {
      console.error("Failed to update tournament", e);
    }
  };

  // Delete Tournament
  const handleDeleteTournament = async (tourneyId: string) => {
    if (!window.confirm("Are you sure you want to delete this tournament? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/tournaments/${tourneyId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setShowManageModal(false);
        setManagingTourney(null);
        fetchData();
      }
    } catch (e) {
      console.error("Failed to delete tournament", e);
    }
  };

  // Organizer Dashboard stats & summaries
  const myCreatedTourneys = tournaments.filter(t => t.creator_id === user.id || user.role === "admin");
  const totalRegistrationsCount = myCreatedTourneys.reduce((acc, curr) => acc + curr.registrations.length, 0);

  // Demographic Aggregations
  const registeredUserIds = Array.from(new Set(myCreatedTourneys.flatMap(t => t.registrations)));
  const registeredProfiles = profiles.filter(p => registeredUserIds.includes(p.user_id));

  // Sport distribution
  const sportCounts: Record<string, number> = {};
  registeredProfiles.forEach(p => {
    const s = p.sport || "Unspecified";
    sportCounts[s] = (sportCounts[s] || 0) + 1;
  });

  // Gender distribution
  let maleCount = 0;
  let femaleCount = 0;
  let unspecifiedGenderCount = 0;
  registeredProfiles.forEach(p => {
    const g = (p.gender || "").toLowerCase();
    if (g.includes("m") || g === "male") maleCount++;
    else if (g.includes("f") || g === "female") femaleCount++;
    else unspecifiedGenderCount++;
  });

  // Category distribution
  const categoryCounts: Record<string, number> = {};
  myCreatedTourneys.forEach(t => {
    const cat = t.category || "Championship";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  // Check if current user is a verified tournament organizer / administrator
  const isOrganizerOrAdmin = ["admin", "club", "academy", "scout"].includes(user.role) || user.is_verified;

  // Render an individual match card in the bracket tree
  const renderBracketMatchCard = (match: any) => {
    const isCreator = selectedTourneyForBracket?.creator_id === user.id || user.role === "admin";
    const hasWinner = !!match.winnerName;

    return (
      <div 
        key={`match-${match.id}`}
        className={`bg-slate-900 border ${
          hasWinner ? "border-slate-800" : "border-slate-800 hover:border-blue-500/50"
        } rounded-xl p-3 shadow-lg relative min-w-[180px] transition-all`}
      >
        {/* Match HUD indicator */}
        <div className="flex justify-between items-center mb-1.5 text-[9px] font-mono text-slate-500 border-b border-slate-800 pb-1">
          <span>Match {match.id}</span>
          {match.nextMatchId && <span>Next: M{match.nextMatchId}</span>}
        </div>

        <div className="space-y-1.5 text-xs">
          {/* Team 1 */}
          <div className="flex justify-between items-center gap-2">
            <span className={`font-bold truncate max-w-[120px] ${
              hasWinner && match.winnerName === match.team1Name 
                ? "text-emerald-400 font-extrabold flex items-center gap-1" 
                : hasWinner 
                ? "text-slate-500 line-through" 
                : "text-slate-300"
            }`}>
              {hasWinner && match.winnerName === match.team1Name && <Trophy className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
              {match.team1Name || <span className="text-slate-600 font-mono font-normal">TBD (M{match.nextMatchId ? "Prev" : "Seed"})</span>}
            </span>
            <span className={`font-mono text-[11px] px-1.5 py-0.5 rounded font-bold ${
              hasWinner && match.winnerName === match.team1Name
                ? "bg-emerald-950/40 text-emerald-400"
                : "bg-slate-950 text-slate-500"
            }`}>
              {match.team1Score !== undefined ? match.team1Score : "-"}
            </span>
          </div>

          {/* Team 2 */}
          <div className="flex justify-between items-center gap-2">
            <span className={`font-bold truncate max-w-[120px] ${
              hasWinner && match.winnerName === match.team2Name 
                ? "text-emerald-400 font-extrabold flex items-center gap-1" 
                : hasWinner 
                ? "text-slate-500 line-through" 
                : "text-slate-300"
            }`}>
              {hasWinner && match.winnerName === match.team2Name && <Trophy className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
              {match.team2Name || <span className="text-slate-600 font-mono font-normal">TBD (M{match.nextMatchId ? "Prev" : "Seed"})</span>}
            </span>
            <span className={`font-mono text-[11px] px-1.5 py-0.5 rounded font-bold ${
              hasWinner && match.winnerName === match.team2Name
                ? "bg-emerald-950/40 text-emerald-400"
                : "bg-slate-950 text-slate-500"
            }`}>
              {match.team2Score !== undefined ? match.team2Score : "-"}
            </span>
          </div>
        </div>

        {/* Organizer Update Action Overlay */}
        {isCreator && (
          <button
            type="button"
            onClick={() => {
              setSelectedMatchToEdit(match);
              setEditScore1(match.team1Score !== undefined ? match.team1Score : 0);
              setEditScore2(match.team2Score !== undefined ? match.team2Score : 0);
              setSelectedWinnerName(match.winnerName || "");
            }}
            className="absolute top-1.5 right-1.5 opacity-100 p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer transition-opacity text-[8px] font-mono flex items-center gap-0.5 border border-slate-700"
            title="Update Score"
          >
            <Edit className="w-2.5 h-2.5" />
            <span>Set</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Visual Header / Banner */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-emerald-500/20 to-blue-600/20 rounded-full blur-3xl opacity-70"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center w-max gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Athletic Scouting Hub</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none">
              Tournaments & Combines
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Register for upcoming elite scouting matches, regional championships, and collegiate showcases to map your performance stats onto live scout leaderboards.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              id="tourney-publish-trigger-btn"
              onClick={() => setShowCreateModal(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-4 py-3 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Create Tournament</span>
            </button>
          </div>
        </div>
      </div>

      {/* Organizer Dashboard Quick Stats Header (if they have created events) */}
      {isOrganizerOrAdmin && myCreatedTourneys.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs space-y-1">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">My Hosted Events</span>
              <Trophy className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-xl font-black text-slate-900">{myCreatedTourneys.length}</p>
          </div>

          <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs space-y-1">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Registrations</span>
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-xl font-black text-slate-900">{totalRegistrationsCount}</p>
          </div>

          <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs space-y-1">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Unique Athletes</span>
              <UserCheck className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-xl font-black text-slate-900">{registeredProfiles.length}</p>
          </div>

          <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs space-y-1">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Scouted Sports</span>
              <Activity className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-xl font-black text-slate-900">
              {Object.keys(sportCounts).length || 0}
            </p>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab("browse")}
          className={`px-4 py-2.5 font-bold text-xs border-b-2 transition-all cursor-pointer ${
            activeSubTab === "browse"
              ? "border-[#1D4ED8] text-[#1D4ED8]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          All Active Tournaments
        </button>

        {isOrganizerOrAdmin && (
          <button
            onClick={() => setActiveSubTab("organizer")}
            className={`px-4 py-2.5 font-bold text-xs border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "organizer"
                ? "border-[#1D4ED8] text-[#1D4ED8]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Organizer Center & Analytics</span>
          </button>
        )}
      </div>

      {activeSubTab === "browse" ? (
        <>
          {/* Advanced Search & Filter Interface */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 border-b border-slate-100 pb-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span>Search & Filter Engine</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Keyword Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name, venue..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden transition-all text-slate-800"
                />
              </div>

              {/* Sport Filter */}
              <div>
                <select
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden transition-all text-slate-800"
                >
                  <option value="all">All Sports</option>
                  {uniqueSports.map((sport) => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden transition-all text-slate-800"
                >
                  <option value="all">All Categories</option>
                  <option value="Championship">Championship</option>
                  <option value="League">League</option>
                  <option value="Combine & Scouting">Combine & Scouting</option>
                  <option value="Tournament">Tournament</option>
                  <option value="Cup Fixture">Cup Fixture</option>
                  <option value="Friendly / Exhibition">Friendly / Exhibition</option>
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden transition-all text-slate-800"
                >
                  <option value="all">All Locations</option>
                  {uniqueLocations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters Indicator */}
            {(searchQuery || selectedSport !== "all" || selectedCategory !== "all" || selectedLocation !== "all") && (
              <div className="flex justify-between items-center pt-1">
                <p className="text-[11px] text-slate-500 font-medium">
                  Found <span className="font-bold text-slate-800">{filteredTournaments.length}</span> results matching filters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedSport("all");
                    setSelectedCategory("all");
                    setSelectedLocation("all");
                  }}
                  className="text-[11px] text-[#1D4ED8] hover:underline font-bold"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

          {/* List vs Map View Selector */}
          <div className="flex justify-between items-center bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-xs text-slate-600 font-bold">
                {browseMode === "list" 
                  ? "Standard scout list view active" 
                  : "Interactive tactical scouting radar map active"
                }
              </p>
            </div>
            
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setBrowseMode("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  browseMode === "list"
                    ? "bg-white text-[#1D4ED8] shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid List</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setBrowseMode("map");
                  if (filteredTournaments.length > 0 && !selectedMapTourney) {
                    setSelectedMapTourney(filteredTournaments[0]);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  browseMode === "map"
                    ? "bg-white text-[#1D4ED8] shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>Map Radar</span>
              </button>
            </div>
          </div>

          {/* Tournament List Card Grid & Map Explorer Selector */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white h-48 rounded-2xl border border-slate-200 animate-pulse"></div>
              ))}
            </div>
          ) : filteredTournaments.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto">
              <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3 animate-pulse" />
              <h3 className="font-bold text-slate-700 text-sm">No Matching Tournaments</h3>
              <p className="text-xs text-slate-400 mt-1">
                Try adjusting your search keywords, location filters, or category selectors to view other events.
              </p>
            </div>
          ) : browseMode === "list" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTournaments.map((tourney) => {
                const isRegistered = registrations.includes(tourney.id) || tourney.registrations.includes(user.id);
                const isCompleted = tourney.status === "completed" || !!tourney.results;
                const isCreator = tourney.creator_id === user.id || user.role === "admin";

                return (
                  <div
                    id={`tournament-card-${tourney.id}`}
                    key={tourney.id}
                    className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all ${
                      isRegistered ? "border-emerald-200 bg-emerald-50/10" : "border-slate-200"
                    }`}
                  >
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight leading-snug line-clamp-1">
                            {tourney.name}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-[#1D4ED8] font-bold block bg-blue-50 px-2 py-0.5 rounded-md">
                              {tourney.sport}
                            </span>
                            <span className="text-slate-300 text-[10px]">•</span>
                            <span className="text-[10px] text-slate-500 font-semibold block bg-slate-100 px-1.5 py-0.5 rounded-md">
                              {tourney.category || "Championship"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isCreator && (
                            <span className="text-[8px] font-extrabold uppercase bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full">
                              My Event
                            </span>
                          )}
                          <span
                            className={`text-[8px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              isCompleted
                                ? "bg-slate-100 text-slate-600 border-slate-200"
                                : "bg-rose-50 text-rose-600 border-rose-100"
                            }`}
                          >
                            {isCompleted ? "Completed" : "Upcoming"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="font-medium">{tourney.dates}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span className="font-medium">{tourney.location}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed font-normal">{tourney.description}</p>

                      {tourney.results && (
                        <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-xl space-y-1">
                          <span className="text-[9px] font-bold text-amber-800 uppercase tracking-wider flex items-center space-x-1">
                            <Award className="w-3.5 h-3.5" />
                            <span>Combine Leaderboards / Results</span>
                          </span>
                          <p className="text-[11px] text-amber-900 font-medium leading-relaxed">{tourney.results}</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100/70 mt-4 flex items-center justify-between gap-4">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {tourney.registrations.length} competitors registered
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTourneyForBracket(tourney);
                            setShowBracketModal(true);
                          }}
                          className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-[11px] py-1.5 px-3 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                        >
                          <Network className="w-3 h-3 text-slate-500" />
                          <span>Bracket</span>
                        </button>

                        {isCreator && (
                          <button
                            type="button"
                            onClick={() => {
                              setManagingTourney(tourney);
                              setNewResultsText(tourney.results || "");
                              setNewStatusText(tourney.status || "upcoming");
                              setShowManageModal(true);
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] py-1.5 px-3 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Manage</span>
                          </button>
                        )}

                        {isCompleted ? (
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">Closed</div>
                        ) : isRegistered ? (
                          <div className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-emerald-100 flex items-center space-x-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Registered</span>
                          </div>
                        ) : (
                          <button
                            id={`tourney-reg-btn-${tourney.id}`}
                            type="button"
                            onClick={() => handleRegisterClick(tourney.id)}
                            className="bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold text-[11px] py-1.5 px-3.5 rounded-xl transition-all cursor-pointer shadow-sm"
                          >
                            Register
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Interactive Scout Map Radar Explorer */
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 md:p-6 relative overflow-hidden flex flex-col lg:flex-row gap-6 shadow-2xl h-[520px] select-none">
              
              {/* Tactical Blueprint Grid Canvas */}
              <div 
                className="relative flex-1 bg-slate-900/40 rounded-2xl border border-slate-800 overflow-hidden h-[240px] lg:h-full flex items-center justify-center shadow-inner"
                style={{
                  backgroundImage: "radial-gradient(circle, #334155 1.2px, transparent 1.2px)",
                  backgroundSize: "24px 24px"
                }}
              >
                {/* SVG Tactical Radar Accents */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50%" cy="50%" r="20%" fill="none" stroke="#475569" strokeWidth="0.5" strokeDasharray="4 4" />
                    <circle cx="50%" cy="50%" r="35%" fill="none" stroke="#475569" strokeWidth="0.5" />
                    <circle cx="50%" cy="50%" r="5%" fill="none" stroke="#475569" strokeWidth="0.5" />
                    <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#334155" strokeWidth="0.5" />
                    <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#334155" strokeWidth="0.5" />
                  </svg>
                </div>

                {/* Grid Compass HUD Headers */}
                <div className="absolute top-3 left-4 text-[9px] font-mono text-slate-500 flex flex-col uppercase tracking-wider">
                  <span>Radar Active: Scouting Hubs</span>
                  <span>Sensors: Gating Precision</span>
                </div>
                <div className="absolute top-3 right-4 text-[9px] font-mono text-slate-500 text-right uppercase tracking-wider">
                  <span>Coordinates Grid</span>
                  <span>Lat: 54.5260° N | Lon: 15.2551° E</span>
                </div>

                {/* Dynamic Map Pins */}
                {filteredTournaments.map((tourney) => {
                  const coord = getCoordinatesForLocation(tourney.location);
                  const isSelected = selectedMapTourney?.id === tourney.id;
                  const isRegistered = registrations.includes(tourney.id) || tourney.registrations.includes(user.id);
                  const isOngoing = tourney.status === "ongoing";

                  return (
                    <button
                      key={`pin-${tourney.id}`}
                      type="button"
                      onClick={() => setSelectedMapTourney(tourney)}
                      className="absolute group z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300"
                      style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
                    >
                      {/* Pulsing Concentric Radar Rings */}
                      <span className="absolute -inset-4 rounded-full bg-blue-500/5 group-hover:bg-blue-500/15 duration-300 transition-colors"></span>
                      
                      {isOngoing && (
                        <span className="absolute -inset-2.5 rounded-full border border-emerald-400/30 animate-ping"></span>
                      )}
                      
                      {/* Visual Pulse Wave */}
                      <span className={`absolute -inset-1.5 rounded-full ${
                        isSelected 
                          ? "bg-blue-500/30 scale-125 border border-blue-400/40" 
                          : isRegistered 
                          ? "bg-emerald-500/20 group-hover:scale-110" 
                          : "bg-slate-800/20 group-hover:scale-110"
                      } transition-all duration-300`}></span>

                      {/* Main Center Node */}
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shadow-lg transition-transform duration-300 ${
                        isSelected 
                          ? "bg-blue-400 border-white scale-125 shadow-blue-500/30" 
                          : isRegistered 
                          ? "bg-emerald-500 border-emerald-200" 
                          : isOngoing
                          ? "bg-amber-500 border-amber-200 animate-pulse"
                          : "bg-slate-700 border-slate-500"
                      }`}>
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>

                      {/* Pin Label Banner */}
                      <div className={`absolute left-1/2 -translate-x-1/2 top-5 whitespace-nowrap px-2 py-0.5 rounded bg-slate-900/90 border text-[8px] font-mono tracking-tight font-bold transition-all ${
                        isSelected 
                          ? "border-blue-400 text-blue-300 opacity-100 scale-100 translate-y-0" 
                          : "border-slate-800 text-slate-400 opacity-0 group-hover:opacity-100 scale-90 -translate-y-1"
                      }`}>
                        {tourney.location.split(",")[0]}
                      </div>
                    </button>
                  );
                })}

                {/* Bottom Status Panel */}
                <div className="absolute bottom-3 left-4 right-4 flex justify-between items-center text-[9px] font-mono text-slate-500">
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400"></span>Selected</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Registered</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>Live Event</span>
                  </div>
                  <span>Scouting Region: Pan-India Sports Grid</span>
                </div>
              </div>

              {/* Map Detail Panel (Sidebar) */}
              <div className="w-full lg:w-80 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between overflow-y-auto max-h-[180px] lg:max-h-full h-full text-slate-100">
                {selectedMapTourney ? (
                  <div className="flex flex-col h-full justify-between gap-3">
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-start gap-2">
                        <span className="bg-blue-900/40 text-blue-400 border border-blue-900 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md">
                          {selectedMapTourney.sport}
                        </span>
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                          selectedMapTourney.status === "completed"
                            ? "bg-slate-800 text-slate-400 border-slate-700"
                            : "bg-rose-950/40 text-rose-400 border-rose-900"
                        }`}>
                          {selectedMapTourney.status}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-extrabold text-sm text-white tracking-tight leading-snug line-clamp-2">
                          {selectedMapTourney.name}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                          Category: {selectedMapTourney.category || "Championship"}
                        </p>
                      </div>

                      <div className="space-y-1.5 py-1 text-[11px] text-slate-300 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{selectedMapTourney.dates}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>{selectedMapTourney.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-500" />
                          <span>{selectedMapTourney.registrations.length} Competitors Scouted</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3 font-medium">
                        {selectedMapTourney.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800 space-y-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTourneyForBracket(selectedMapTourney);
                            setShowBracketModal(true);
                          }}
                          className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 font-bold text-xs py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Network className="w-3.5 h-3.5 text-slate-300" />
                          <span>View Bracket</span>
                        </button>

                        {selectedMapTourney.creator_id === user.id && (
                          <button
                            type="button"
                            onClick={() => {
                              setManagingTourney(selectedMapTourney);
                              setNewResultsText(selectedMapTourney.results || "");
                              setNewStatusText(selectedMapTourney.status || "upcoming");
                              setShowManageModal(true);
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs p-2 rounded-xl transition-all cursor-pointer"
                            title="Manage Tournament"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {selectedMapTourney.status === "completed" ? (
                        <div className="w-full text-center text-[10px] text-slate-500 font-bold uppercase py-2 bg-slate-950 border border-slate-800 rounded-xl">
                          Registration Closed
                        </div>
                      ) : (registrations.includes(selectedMapTourney.id) || selectedMapTourney.registrations.includes(user.id)) ? (
                        <div className="w-full bg-emerald-950/20 text-emerald-400 border border-emerald-900/40 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5">
                          <CheckCircle className="w-4 h-4" />
                          <span>Registered to Event</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRegisterClick(selectedMapTourney.id)}
                          className="w-full bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer shadow-md text-center"
                        >
                          Register Team
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <Map className="w-10 h-10 text-slate-700 animate-pulse mb-2.5" />
                    <h4 className="font-bold text-xs text-slate-400">Select Radar Point</h4>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-[180px] mx-auto">
                      Click on any glowing coordinate pin on the radar map to view its active scouting profile.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Organizer Dashboard Center */
        <div className="space-y-6">
          
          {/* Dashboard Summary and Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Demographics Summary Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs lg:col-span-2">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <BarChart3 className="w-5 h-5 text-emerald-500" />
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Participant Demographic Summaries</h3>
                  <p className="text-[10px] text-slate-400">Aggregated profiles of sports athletes registered across your tournaments.</p>
                </div>
              </div>

              {registeredProfiles.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <Users className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <span>No competitor demographics available. Register athletes first.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Gender Distribution Bar */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-600">Gender Distribution</h4>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                          <span>Male Athletes</span>
                          <span className="font-bold text-slate-800">{maleCount} ({Math.round((maleCount / registeredProfiles.length) * 100) || 0}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(maleCount / registeredProfiles.length) * 100}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                          <span>Female Athletes</span>
                          <span className="font-bold text-slate-800">{femaleCount} ({Math.round((femaleCount / registeredProfiles.length) * 100) || 0}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-rose-500 h-full rounded-full" style={{ width: `${(femaleCount / registeredProfiles.length) * 100}%` }}></div>
                        </div>
                      </div>

                      {unspecifiedGenderCount > 0 && (
                        <div>
                          <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                            <span>Unspecified / Co-ed</span>
                            <span className="font-bold text-slate-800">{unspecifiedGenderCount} ({Math.round((unspecifiedGenderCount / registeredProfiles.length) * 100) || 0}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-slate-400 h-full rounded-full" style={{ width: `${(unspecifiedGenderCount / registeredProfiles.length) * 100}%` }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sport Split Breakdown */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-600">Discipline Breakdowns</h4>
                    <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                      {Object.entries(sportCounts).map(([sp, count]) => {
                        const pct = Math.round((count / registeredProfiles.length) * 100);
                        return (
                          <div key={sp} className="space-y-1">
                            <div className="flex justify-between text-[11px] font-medium text-slate-500">
                              <span className="capitalize font-semibold text-slate-700">{sp}</span>
                              <span className="font-bold text-slate-800">{count} ({pct}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Category Split List Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Tag className="w-5 h-5 text-blue-500" />
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Events by Category</h3>
                  <p className="text-[10px] text-slate-400">Categorical distributions of hosted combines.</p>
                </div>
              </div>

              {myCreatedTourneys.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <span>No events created yet.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(categoryCounts).map(([cat, count]) => (
                    <div key={cat} className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                      <span className="font-semibold text-slate-600">{cat}</span>
                      <span className="bg-blue-50 text-[#1D4ED8] font-bold px-2 py-0.5 rounded-md text-[10px]">{count} events</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Manage My Tournaments Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
            <h3 className="font-extrabold text-slate-800 text-sm">Host Operations & Participant Controls</h3>
            <p className="text-xs text-slate-400">Click manage on any tournament to view registries, verify athletes, remove/cancel slots, and update leaderboard results directly.</p>

            {myCreatedTourneys.length === 0 ? (
              <div className="border border-dashed border-slate-200 p-8 rounded-xl text-center text-slate-500 text-xs">
                You haven't scheduled any tournament events yet. Go to Browse and click "Create Tournament" to post one!
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {myCreatedTourneys.map(tourney => (
                  <div key={tourney.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{tourney.name}</h4>
                      <p className="text-[11px] text-slate-400">{tourney.sport} • {tourney.location} • {tourney.dates}</p>
                      <div className="flex gap-2 mt-1.5">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[9px] font-bold">
                          {tourney.category || "Championship"}
                        </span>
                        <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md text-[9px] font-bold">
                          {tourney.registrations.length} registered
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          setManagingTourney(tourney);
                          setNewResultsText(tourney.results || "");
                          setNewStatusText(tourney.status || "upcoming");
                          setShowManageModal(true);
                        }}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-3.5 rounded-xl transition-all w-full sm:w-auto cursor-pointer flex justify-center items-center gap-1"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Manage Registrations</span>
                      </button>

                      <button
                        onClick={() => handleDeleteTournament(tourney.id)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 rounded-xl transition-all cursor-pointer"
                        title="Delete Tournament"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE TOURNAMENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={handleCloseCreateModal}></div>

          <div className="relative bg-white border border-slate-100 rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Host Tournament / Scouting Event</span>
              </h2>
              <button onClick={handleCloseCreateModal} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="create-tourney-form" onSubmit={handleCreateTournament} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Tournament/Combine Name</label>
                <input
                  id="tourney-name-input"
                  type="text"
                  required
                  placeholder="e.g. West Coast Soccer Cup 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-xs text-slate-800 focus:outline-hidden bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="space-y-1 relative">
                <label className="text-xs font-bold text-slate-600 block">Sport Discipline</label>
                <input
                  id="tourney-sport-input"
                  type="text"
                  required
                  placeholder="Start typing sport name..."
                  value={sport}
                  onChange={(e) => handleSportChange(e.target.value)}
                  onFocus={() => { if (sport.trim()) setShowSportSuggestions(true); }}
                  className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-xs text-slate-800 focus:outline-hidden bg-slate-50 focus:bg-white"
                  autoComplete="off"
                />
                {showSportSuggestions && sportSuggestions.length > 0 && (
                  <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-40 overflow-y-auto divide-y divide-slate-100 py-1">
                    {sportSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleSelectSportSuggestion(suggestion)}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors block"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>Start Date</span>
                  </label>
                  <input
                    id="tourney-start-date"
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-xs text-slate-800 focus:outline-hidden bg-slate-50 focus:bg-white cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>End Date</span>
                  </label>
                  <input
                    id="tourney-end-date"
                    type="date"
                    required
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-xs text-slate-800 focus:outline-hidden bg-slate-50 focus:bg-white cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    <span>Start Time (Optional)</span>
                  </label>
                  <input
                    id="tourney-start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-xs text-slate-800 focus:outline-hidden bg-slate-50 focus:bg-white cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    <span>End Time (Optional)</span>
                  </label>
                  <input
                    id="tourney-end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-xs text-slate-800 focus:outline-hidden bg-slate-50 focus:bg-white cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Location</label>
                  <input
                    id="tourney-location-input"
                    type="text"
                    required
                    placeholder="e.g. Mumbai, DY Patil Stadium"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-xs text-slate-800 focus:outline-hidden bg-slate-50 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Category</label>
                  <select
                    id="tourney-category-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden text-slate-800"
                  >
                    <option value="Championship">Championship</option>
                    <option value="League">League</option>
                    <option value="Combine & Scouting">Combine & Scouting</option>
                    <option value="Tournament">Tournament</option>
                    <option value="Cup Fixture">Cup Fixture</option>
                    <option value="Friendly / Exhibition">Friendly / Exhibition</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Initial Results (Optional)</label>
                <input
                  id="tourney-results-input"
                  type="text"
                  placeholder="e.g. Leaderboard: Tata Football Academy 1st"
                  value={results}
                  onChange={(e) => setResults(e.target.value)}
                  className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-xs text-slate-800 focus:outline-hidden bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Event / Scouting Description</label>
                <textarea
                  id="tourney-desc-input"
                  required
                  rows={3}
                  placeholder="Outline divisions, scoring rules, scouts attending, and eligibility limits..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-slate-200 p-3 rounded-xl text-xs text-slate-800 focus:outline-hidden bg-slate-50 focus:bg-white"
                />
              </div>

              <button
                id="tourney-submit-btn"
                type="submit"
                className="w-full bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold text-xs py-3.5 rounded-xl transition-all cursor-pointer shadow-md"
              >
                Schedule Tournament Event
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE PARTICIPANTS & LIVE UPDATE MODAL */}
      {showManageModal && managingTourney && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowManageModal(false)}></div>

          <div className="relative bg-white border border-slate-100 rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                  <Activity className="w-5 h-5 text-emerald-500" />
                  <span>Control Console</span>
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">{managingTourney.name}</p>
              </div>
              <button onClick={() => setShowManageModal(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Column: Update Status & Results */}
              <div className="md:col-span-1 space-y-4 border-r border-slate-100 pr-0 md:pr-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <Edit className="w-3.5 h-3.5" />
                  <span>Update Details</span>
                </h3>

                <div className="space-y-3">
                  {/* Status update */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">Status</label>
                    <select
                      value={newStatusText}
                      onChange={(e) => {
                        const statusVal = e.target.value as "upcoming" | "ongoing" | "completed";
                        setNewStatusText(statusVal);
                        handleUpdateTournament(managingTourney.id, { status: statusVal });
                      }}
                      className="w-full border border-slate-200 px-3 py-2 rounded-xl text-xs bg-slate-50 focus:outline-hidden text-slate-800"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {/* Results update */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">Live Results / Standings</label>
                    <textarea
                      placeholder="e.g. Champions: Mumbai Tigers"
                      value={newResultsText}
                      onChange={(e) => setNewResultsText(e.target.value)}
                      rows={4}
                      className="w-full border border-slate-200 p-2.5 rounded-xl text-xs bg-slate-50 text-slate-800 focus:outline-hidden"
                    />
                    <button
                      onClick={() => handleUpdateTournament(managingTourney.id, { results: newResultsText })}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] py-2 rounded-xl transition-all cursor-pointer"
                    >
                      Save Leaderboard Results
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Registrations list */}
              <div className="md:col-span-2 space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>Registered Competitors ({managingTourney.registrations.length})</span>
                </h3>

                {managingTourney.registrations.length === 0 ? (
                  <div className="border border-dashed border-slate-200 p-8 rounded-xl text-center text-slate-400 text-xs">
                    No athletes have registered for this tournament event yet.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                    {managingTourney.registrations.map(userId => {
                      const athleteProf = profiles.find(p => p.user_id === userId);
                      
                      return (
                        <div key={userId} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div className="flex items-center space-x-3">
                            <img
                              referrerPolicy="no-referrer"
                              src={athleteProf?.profile_pic || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"}
                              alt={athleteProf?.current_team || "Athlete"}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 bg-white"
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-800">
                                {athleteProf?.current_team || `Athlete #${userId.slice(-4)}`}
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium">
                                {athleteProf?.sport} • {athleteProf?.position || "Competitor"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleUnregisterParticipant(managingTourney.id, userId)}
                              className="bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-100 text-slate-500 hover:text-rose-600 p-1.5 rounded-lg transition-all cursor-pointer"
                              title="Cancel Registration"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ================= TOURNAMENT BRACKET & SEEDING MODAL ================= */}
      {showBracketModal && selectedTourneyForBracket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    {selectedTourneyForBracket.sport}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">ID: {selectedTourneyForBracket.id.slice(0, 8)}</span>
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-1.5">
                  <Trophy className="w-5 h-5 text-amber-500 animate-bounce" />
                  <span>{selectedTourneyForBracket.name} — Tournament Bracket</span>
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowBracketModal(false);
                  setSelectedTourneyForBracket(null);
                  setSelectedMatchToEdit(null);
                }}
                className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-full cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Content Container */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-950/20 space-y-6">
              
              {!selectedTourneyForBracket.bracket ? (
                /* ================= STATE A: NO BRACKET GENERATED YET ================= */
                <div className="max-w-xl mx-auto py-10 text-center space-y-6">
                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
                    <Network className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
                    <div>
                      <h3 className="font-extrabold text-slate-200 text-sm sm:text-base">No Active Bracket Generated</h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        This tournament is currently scheduled or pending trial configurations. The bracket will connect individual team registries into match seedings.
                      </p>
                    </div>
                  </div>

                  {/* Organizer Quick-Seed Module */}
                  {(selectedTourneyForBracket.creator_id === user.id || user.role === "admin") ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-left space-y-4">
                      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Seeding & Team Setup (Organizer Operations)</h4>
                      </div>

                      <div className="space-y-3">
                        <p className="text-[11px] text-slate-400">
                          Configure seedings for the tournament tree below. You must have at least 4 teams. Add custom team names or use registered athlete teams.
                        </p>

                        {/* List of Seeding Teams */}
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 max-h-[160px] overflow-y-auto">
                          {bracketTeams.map((team, index) => (
                            <div key={index} className="flex justify-between items-center text-xs text-slate-300 py-1.5 px-2 bg-slate-900/60 rounded border border-slate-850">
                              <span className="font-mono text-[10px] text-slate-500">Seed #{index + 1}</span>
                              <span className="font-bold">{team}</span>
                              <button
                                type="button"
                                onClick={() => setBracketTeams(prev => prev.filter((_, i) => i !== index))}
                                className="text-rose-400 hover:text-rose-600 text-[10px] font-bold cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Add custom team */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add Custom Seed Team Name"
                            value={newTeamNameInput}
                            onChange={(e) => setNewTeamNameInput(e.target.value)}
                            className="flex-1 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-100 focus:outline-hidden"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && newTeamNameInput.trim()) {
                                setBracketTeams(prev => [...prev, newTeamNameInput.trim()]);
                                setNewTeamNameInput("");
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (newTeamNameInput.trim()) {
                                setBracketTeams(prev => [...prev, newTeamNameInput.trim()]);
                                setNewTeamNameInput("");
                              }
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 rounded-lg cursor-pointer"
                          >
                            + Add Team
                          </button>
                        </div>

                        <div className="pt-2">
                          <button
                            type="button"
                            disabled={bracketTeams.length < 4}
                            onClick={() => handleGenerateBracket(selectedTourneyForBracket.id, bracketTeams)}
                            className="w-full bg-[#1D4ED8] hover:bg-blue-700 text-white disabled:bg-slate-800 disabled:text-slate-600 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer flex justify-center items-center gap-1.5 shadow-md"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Publish Brackets & Generate Schedule</span>
                          </button>
                          {bracketTeams.length < 4 && (
                            <p className="text-center text-[10px] text-amber-500 font-semibold mt-1.5">
                              ⚠️ At least 4 teams are required to seed brackets. Current count: {bracketTeams.length}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-xs italic">
                      Seeding scheduled shortly. Organizers are currently validating trial slots. Please check back.
                    </div>
                  )}

                </div>
              ) : (
                /* ================= STATE B: BRACKET GENERATED AND VISUALIZED ================= */
                <div className="space-y-6">
                  
                  {/* Standings HUD Bar */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tournament Standing</h4>
                        <p className="text-sm font-extrabold text-white">
                          {selectedTourneyForBracket.bracket.champion_name ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              🏆 Champion: {selectedTourneyForBracket.bracket.champion_name}
                            </span>
                          ) : (
                            "Tournament Ongoing • Matches in Play"
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 font-mono text-right hidden sm:block">
                      <span>Live Seedings Grid</span>
                    </div>
                  </div>

                  {/* Interactive Tournament Bracket Tree Columns */}
                  <div className="relative overflow-x-auto pb-4 pt-2">
                    <div className="flex gap-8 md:gap-12 min-w-[750px] justify-between p-2">
                      
                      {/* Round 1: Quarterfinals */}
                      {selectedTourneyForBracket.bracket.matches.some(m => m.roundName === "Quarterfinals") && (
                        <div className="flex-1 flex flex-col justify-around gap-6">
                          <div className="text-center border-b border-slate-800 pb-1.5 mb-2">
                            <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Quarterfinals</h5>
                            <span className="text-[9px] text-slate-600 font-mono">4 Matchups</span>
                          </div>
                          {selectedTourneyForBracket.bracket.matches
                            .filter(m => m.roundName === "Quarterfinals")
                            .sort((a,b) => a.id.localeCompare(b.id))
                            .map(match => renderBracketMatchCard(match))}
                        </div>
                      )}

                      {/* Round 2: Semifinals */}
                      <div className="flex-1 flex flex-col justify-around gap-12">
                        <div className="text-center border-b border-slate-800 pb-1.5 mb-2">
                          <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Semifinals</h5>
                          <span className="text-[9px] text-slate-600 font-mono">2 Matchups</span>
                        </div>
                        {selectedTourneyForBracket.bracket.matches
                          .filter(m => m.roundName === "Semifinals")
                          .sort((a,b) => a.id.localeCompare(b.id))
                          .map(match => renderBracketMatchCard(match))}
                      </div>

                      {/* Round 3: Finals */}
                      <div className="flex-1 flex flex-col justify-center gap-16">
                        <div className="text-center border-b border-slate-800 pb-1.5 mb-2">
                          <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Grand Finals</h5>
                          <span className="text-[9px] text-slate-600 font-mono">Championship Match</span>
                        </div>
                        <div className="h-full flex flex-col justify-center gap-6 py-12">
                          {selectedTourneyForBracket.bracket.matches
                            .filter(m => m.roundName === "Finals")
                            .map(match => renderBracketMatchCard(match))}
                        </div>
                      </div>

                      {/* Winner Podium / Crown */}
                      <div className="w-48 flex flex-col items-center justify-center text-center">
                        <div className="border border-slate-850 bg-slate-900/40 p-5 rounded-2xl w-full relative overflow-hidden flex flex-col items-center justify-center h-48">
                          {/* Radial ambient circle */}
                          <div className="absolute inset-0 bg-blue-500/5 rounded-full filter blur-xl"></div>
                          <div className="relative z-10 space-y-3 flex flex-col items-center">
                            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center text-amber-500 shadow-xl animate-pulse">
                              <Trophy className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">CHAMPION</p>
                              <h4 className="text-sm font-extrabold text-white mt-0.5 tracking-tight line-clamp-2">
                                {selectedTourneyForBracket.bracket.champion_name || "Seeding Trial..."}
                              </h4>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Inline Score Editor Popover */}
                  {selectedMatchToEdit && (
                    <div className="bg-slate-900 border border-blue-500/30 p-5 rounded-2xl space-y-4 max-w-md mx-auto relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                      <div>
                        <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest block font-mono">OPERATIONS EDITOR</span>
                        <h4 className="text-xs font-bold text-white uppercase mt-0.5">
                          Update Match Result — {selectedMatchToEdit.roundName} (Match {selectedMatchToEdit.id})
                        </h4>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 block truncate">{selectedMatchToEdit.team1Name || "TBD Team 1"}</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={editScore1}
                            onChange={(e) => setEditScore1(e.target.value === "" ? "" : parseInt(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-white text-center focus:outline-hidden"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 block truncate">{selectedMatchToEdit.team2Name || "TBD Team 2"}</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={editScore2}
                            onChange={(e) => setEditScore2(e.target.value === "" ? "" : parseInt(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-white text-center focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 block">Select Winner</label>
                        <select
                          value={selectedWinnerName}
                          onChange={(e) => setSelectedWinnerName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 px-3 py-2 rounded-xl text-xs text-white focus:outline-hidden"
                        >
                          <option value="">-- Choose Winner --</option>
                          {selectedMatchToEdit.team1Name && <option value={selectedMatchToEdit.team1Name}>{selectedMatchToEdit.team1Name}</option>}
                          {selectedMatchToEdit.team2Name && <option value={selectedMatchToEdit.team2Name}>{selectedMatchToEdit.team2Name}</option>}
                        </select>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMatchToEdit(null);
                            setEditScore1("");
                            setEditScore2("");
                            setSelectedWinnerName("");
                          }}
                          className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-[11px] py-2 rounded-xl transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={!selectedWinnerName}
                          onClick={() => {
                            handleUpdateBracketMatch(
                              selectedTourneyForBracket.id,
                              selectedMatchToEdit.id,
                              Number(editScore1) || 0,
                              Number(editScore2) || 0,
                              selectedWinnerName
                            );
                          }}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] py-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          Advance Winner
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 text-center bg-slate-950/40 text-[10px] text-slate-500 font-mono">
              <span>Secure Trial Seeding Infrastructure • PlayFoliyo Engine</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
