import React, { useState, useEffect } from "react";
import { User, Profile, SportDocument } from "../types";
import { Award, Shield, CheckCircle, Save, Edit, Trash2, Camera, MapPin, Scale, Plus, Trophy, FileText, Upload, Sparkles, Search, Check, X, Sliders, Settings, User as UserIcon, BookOpen, Play, Activity } from "lucide-react";
import SportDetailModal, { SPORT_SEGMENTS_MAP, safeParseJson } from "./SportDetailModal";
import { uploadMedia } from "../lib/supabase";
import ProfileCardView from "./ProfileCardView";
import { SportsMetricsService } from "../services/SportsMetricsService";
import RadarChart from "./RadarChart";

const SPORT_SKILLS_MAP: Record<string, string[]> = {
  "football": [
    "Dribbling", "Short Passing", "Long Passing", "Finishing", "Shot Power", 
    "Heading", "Tackling", "Interceptions", "Defending", "Crossing", 
    "Set Pieces", "Penalty Kicks", "Acceleration", "Sprint Speed", "Agility", 
    "Stamina", "Strength", "Vision", "Positioning", "Ball Control", "Goalkeeping"
  ],
  "soccer": [
    "Dribbling", "Short Passing", "Long Passing", "Finishing", "Shot Power", 
    "Heading", "Tackling", "Interceptions", "Defending", "Crossing", 
    "Set Pieces", "Penalty Kicks", "Acceleration", "Sprint Speed", "Agility", 
    "Stamina", "Strength", "Vision", "Positioning", "Ball Control", "Goalkeeping"
  ],
  "basketball": [
    "Three-Point Shooting", "Mid-Range Shooting", "Layups", "Dunking", 
    "Free Throws", "Ball Handling", "Passing", "Offensive Rebounding", 
    "Defensive Rebounding", "Shot Blocking", "Stealing", "Perimeter Defense", 
    "Interior Defense", "Post Moves", "Court Vision", "Vertical Leap", "Speed"
  ],
  "cricket": [
    "Power Hitting", "Cover Drive", "Pull Shot", "Sweep Shot", "Defensive Batting",
    "Fast Bowling", "Spin Bowling", "Inswing bowling", "Outswing bowling", 
    "Wicketkeeping", "Slip Fielding", "Outfield Fielding", "Direct Hits", "Running between wickets"
  ],
  "tennis": [
    "Forehand", "Backhand", "Flat Serve", "Kick Serve", "Slice Serve", 
    "Forehand Volley", "Backhand Volley", "Overhead Smash", "Slice", 
    "Drop Shot", "Lob", "Footwork", "Court Speed", "Topspin", "Serve Return"
  ],
  "badminton": [
    "Smash", "Drop Shot", "Clear", "Drive", "Net Play", "Serve", 
    "Footwork", "Reflexes", "Court Agility", "Backhand Clear", "Wrist Control"
  ],
  "volleyball": [
    "Spiking", "Blocking", "Serving (Float)", "Serving (Jump)", 
    "Setting", "Passing/Digging", "Receive", "Spike Touch", "Court Agility"
  ],
  "athletics": [
    "Sprinting", "Starting Blocks Acceleration", "Endurance Running", 
    "Pacing", "Long Jump", "High Jump", "Triple Jump", "Pole Vault", 
    "Shot Put", "Javelin Throw", "Discus Throw", "Hurdles Technique"
  ],
  "swimming": [
    "Freestyle", "Backstroke", "Breaststroke", "Butterfly", "Flip Turns", 
    "Diving Start", "Endurance", "Streamline Technique", "Breath Control"
  ],
  "kabaddi": [
    "Raiding Technique", "Ankle Hold", "Thigh Hold", "Corner Defense", 
    "Escape Speed", "Toe Touch", "Hand Touch", "Chain Tackle", "Stamina"
  ],
  "hockey": [
    "Dribbling", "Push Passing", "Hit/Slap Shot", "Drag Flick", 
    "Tackling", "Scoop Shot", "Penalty Corner", "Interceptions", "Stamina"
  ],
  "table tennis": [
    "Forehand Loop", "Backhand Loop", "Serve Spin", "Push/Chop", 
    "Block", "Flick", "Footwork Speed", "Reaction Time"
  ],
  "wrestling": [
    "Takedowns", "Sprawling", "Pins", "Escapes", "Reversals", 
    "Upper Body Throws", "Grip Strength", "Bridge Defense"
  ],
  "boxing": [
    "Jab", "Cross", "Hook", "Uppercut", "Footwork/Pivots", 
    "Head Movement", "Guard Defense", "Stamina", "Hand Speed"
  ]
};

const GENERAL_SKILLS = [
  "Agility", "Sprint Speed", "Endurance", "Stamina", "Strength", 
  "Flexibility", "Balance", "Reflexes", "Hand-Eye Coordination", 
  "Mental Toughness", "Team Leadership", "Tactical Awareness", "Communication"
];

interface ProfileTabProps {
  user: User;
  profile: Profile | null;
  onProfileUpdate: (updatedProfile: Profile) => void;
  onVerificationRequest: (reqData: any) => void;
}

export default function ProfileTab({ user, profile, onProfileUpdate, onVerificationRequest }: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [sport, setSport] = useState(profile?.sport || "");
  const [position, setPosition] = useState(profile?.position || "");
  const [location, setLocation] = useState(profile?.location || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [age, setAge] = useState(profile?.age || "");
  const [gender, setGender] = useState(profile?.gender || "");
  
  // Skills states
  const [skills, setSkills] = useState<string[]>(profile?.skills || []);
  const [skillSearch, setSkillSearch] = useState("");
  const [isSkillDropdownOpen, setIsSkillDropdownOpen] = useState(false);
  
  // Role-specific states
  const [currentTeam, setCurrentTeam] = useState(profile?.current_team || "");
  const [prevTeams, setPrevTeams] = useState(profile?.previous_teams || "");
  const [height, setHeight] = useState(profile?.height || "");
  const [weight, setWeight] = useState(profile?.weight || "");
  const [dominantFoot, setDominantFoot] = useState(profile?.dominant_foot || "Right");
  const [experience, setExperience] = useState(profile?.experience || "");
  const [rankings, setRankings] = useState(profile?.rankings || "");
  const [achievements, setAchievements] = useState(profile?.achievements || "");
  const [coachingLevel, setCoachingLevel] = useState(profile?.coaching_level || "");

  // Sport-specific templates & values
  const [metricTemplates, setMetricTemplates] = useState<any[]>(SportsMetricsService.getTemplates());
  const [sportMetrics, setSportMetrics] = useState<Record<string, string>>(profile?.sport_metrics || {});

  // Custom segment and custom stats input state maps per sportName
  const [customSegmentInputs, setCustomSegmentInputs] = useState<Record<string, string>>({});
  const [newStatKeys, setNewStatKeys] = useState<Record<string, string>>({});
  const [newStatValues, setNewStatValues] = useState<Record<string, string>>({});

  const [sportSearch, setSportSearch] = useState("");
  const [isSportDropdownOpen, setIsSportDropdownOpen] = useState(false);

  // Document management states
  const [documents, setDocuments] = useState<SportDocument[]>(profile?.documents || []);
  const [newDocName, setNewDocName] = useState("");
  const [newDocType, setNewDocType] = useState("Certificate");
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [docUploadError, setDocUploadError] = useState("");

  // Structured Sport Detail Modal states
  const [activeDetailSport, setActiveDetailSport] = useState<string | null>(null);
  const [activeAttrSportEdit, setActiveAttrSportEdit] = useState("");

  const openSportDetailModal = (sportName: string) => {
    setActiveDetailSport(sportName);
  };

  const handleDirectSaveMetrics = async (newMetrics: Record<string, string>) => {
    const updated: Profile = {
      user_id: user.id,
      profile_pic: profilePic,
      cover_pic: coverPic,
      sport,
      position,
      location,
      bio,
      age,
      gender,
      current_team: currentTeam,
      previous_teams: prevTeams,
      height,
      weight,
      dominant_foot: dominantFoot,
      experience,
      rankings,
      achievements,
      coaching_level: coachingLevel,
      certifications: certifications,
      facilities,
      sports_offered: sportsOffered,
      organization,
      region,
      sponsorship_areas: sponsorshipAreas,
      budget_range: budgetRange,
      contact_info: contactInfo,
      sport_metrics: newMetrics,
      documents,
      skills,
      followers: profile?.followers || [],
      following: profile?.following || [],
    };
    
    try {
      const res = await fetch(`/api/profiles/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (res.ok) {
        onProfileUpdate(data.profile);
      }
    } catch (e) {
      console.error("Failed to direct-save profile metrics", e);
    }
  };

  const handleSaveSportDetails = async (data: {
    segments: string[];
    customSegments: string[];
    customStats: { key: string; value: string }[];
    subfields: Record<string, string>;
    nestedObject: Record<string, any>;
  }) => {
    if (!activeDetailSport) return;
    const sportName = activeDetailSport;

    const updatedMetrics = { ...sportMetrics };
    
    // Save flat fields for full backward compatibility
    updatedMetrics[`segments_${sportName}`] = JSON.stringify(data.segments);
    updatedMetrics[`custom_segments_${sportName}`] = JSON.stringify(data.customSegments);
    updatedMetrics[`custom_stats_${sportName}`] = JSON.stringify(data.customStats);
    
    Object.keys(data.subfields).forEach(key => {
      updatedMetrics[key] = data.subfields[key];
    });

    // Save nested preference details (nested objects within sport preferences)
    updatedMetrics[`preferences_${sportName}`] = JSON.stringify(data.nestedObject);

    setSportMetrics(updatedMetrics);

    // Direct persistence if not in global edit mode
    if (!isEditing) {
      await handleDirectSaveMetrics(updatedMetrics);
    }

    setActiveDetailSport(null);
  };

  const selectedSports = sport ? sport.split(",").map(s => s.trim()).filter(Boolean) : [];

  const handleToggleSport = (sportName: string) => {
    let newSports;
    if (selectedSports.includes(sportName)) {
      newSports = selectedSports.filter(s => s !== sportName);
    } else {
      newSports = [...selectedSports, sportName];
      // Automatically trigger the SportDetailModal when selecting a new sport!
      openSportDetailModal(sportName);
    }
    setSport(newSports.join(", "));
  };

  useEffect(() => {
    fetch("/api/sport-metric-templates")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setMetricTemplates(data);
        }
      })
      .catch(err => console.error("Error loading metric templates from API, using SportsMetricsService defaults instead", err));
  }, []);

  useEffect(() => {
    if (profile) {
      setSport(profile.sport || "");
      setPosition(profile.position || "");
      setLocation(profile.location || "");
      setBio(profile.bio || "");
      setAge(profile.age || "");
      setGender(profile.gender || "");
      setCurrentTeam(profile.current_team || "");
      setPrevTeams(profile.previous_teams || "");
      setHeight(profile.height || "");
      setWeight(profile.weight || "");
      setDominantFoot(profile.dominant_foot || "Right");
      setExperience(profile.experience || "");
      setRankings(profile.rankings || "");
      setAchievements(profile.achievements || "");
      setCoachingLevel(profile.coaching_level || "");
      setCertifications(profile.certifications || "");
      setFacilities(profile.facilities || "");
      setSportsOffered(profile.sports_offered || "");
      setOrganization(profile.organization || "");
      setRegion(profile.region || "");
      setSponsorshipAreas(profile.sponsorship_areas || "");
      setBudgetRange(profile.budget_range || "");
      setContactInfo(profile.contact_info || "");
      setProfilePic(profile.profile_pic || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200");
      setCoverPic(profile.cover_pic || "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1000");
      setDocuments(profile.documents || []);
      if (profile.sport_metrics) {
        setSportMetrics(profile.sport_metrics);
      }
      setSkills(profile.skills || []);
    }
  }, [profile]);
  const [certifications, setCertifications] = useState(profile?.certifications || "");
  const [facilities, setFacilities] = useState(profile?.facilities || "");
  const [sportsOffered, setSportsOffered] = useState(profile?.sports_offered || "");
  const [organization, setOrganization] = useState(profile?.organization || "");
  const [region, setRegion] = useState(profile?.region || "");
  const [sponsorshipAreas, setSponsorshipAreas] = useState(profile?.sponsorship_areas || "");
  const [budgetRange, setBudgetRange] = useState(profile?.budget_range || "");
  const [contactInfo, setContactInfo] = useState(profile?.contact_info || "");

  // Avatar and cover image inputs
  const [profilePic, setProfilePic] = useState(profile?.profile_pic || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200");
  const [coverPic, setCoverPic] = useState(profile?.cover_pic || "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1000");

  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const url = await uploadMedia(file);
      setCoverPic(url);
    } catch (err) {
      console.error("Cover upload error", err);
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingProfile(true);
    try {
      const url = await uploadMedia(file);
      setProfilePic(url);
    } catch (err) {
      console.error("Profile picture upload error", err);
    } finally {
      setIsUploadingProfile(false);
    }
  };

  // Verification Form states
  const [idProofName, setIdProofName] = useState("");
  const [certificateName, setCertificateName] = useState("");
  const [fedRecordName, setFedRecordName] = useState("");
  const [submittingVerification, setSubmittingVerification] = useState(false);

  const isVerified = user.is_verified || user.verification_status === "approved";
  const isPending = user.verification_status === "pending";

  const handleSave = async () => {
    const updated: Profile = {
      user_id: user.id,
      profile_pic: profilePic,
      cover_pic: coverPic,
      sport,
      position,
      location,
      bio,
      age,
      gender,
      current_team: currentTeam,
      previous_teams: prevTeams,
      height,
      weight,
      dominant_foot: dominantFoot,
      experience,
      rankings,
      achievements,
      coaching_level: coachingLevel,
      certifications: certifications,
      facilities,
      sports_offered: sportsOffered,
      organization,
      region,
      sponsorship_areas: sponsorshipAreas,
      budget_range: budgetRange,
      contact_info: contactInfo,
      sport_metrics: sportMetrics,
      documents,
      skills,
      followers: profile?.followers || [],
      following: profile?.following || [],
    };

    try {
      const res = await fetch(`/api/profiles/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (res.ok) {
        onProfileUpdate(data.profile);
        setIsEditing(false);
      }
    } catch (e) {
      console.error("Failed to update profile", e);
    }
  };

  const submitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idProofName || !certificateName || !fedRecordName) return;

    setSubmittingVerification(true);
    try {
      const res = await fetch("/api/verifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          identity_proof: idProofName,
          sports_certificates: certificateName,
          federation_records: fedRecordName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onVerificationRequest(data);
      }
    } catch (e) {
      console.error("Verification submit error:", e);
    } finally {
      setSubmittingVerification(false);
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    const inputLower = newDocName.toLowerCase();
    if (
      lowerName.includes("aadhar") || 
      lowerName.includes("aadhaar") || 
      lowerName.includes("uidai") || 
      lowerName.includes("government") ||
      inputLower.includes("aadhar") ||
      inputLower.includes("aadhaar")
    ) {
      setDocUploadError("Aadhaar card / government ID uploads are strictly forbidden in this section. Please upload sports certificates, licenses, or logs only.");
      return;
    }

    setIsUploadingDoc(true);
    setDocUploadError("");
    try {
      const url = await uploadMedia(file);
      const newDoc: SportDocument = {
        id: "doc-" + Math.random().toString(36).substr(2, 9),
        name: newDocName.trim() || file.name.replace(/\.[^/.]+$/, ""),
        file_url: url,
        file_name: file.name,
        type: newDocType,
        uploaded_at: new Date().toISOString(),
        verified: false
      };
      setDocuments(prev => [...prev, newDoc]);
      setNewDocName("");
    } catch (err) {
      console.error("Document upload error", err);
      setDocUploadError("Failed to upload document. Please try again.");
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleRemoveDoc = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  const activeProfile: Profile = {
    user_id: user.id,
    profile_pic: profilePic,
    cover_pic: coverPic,
    sport: sport || "Football (Soccer)",
    position: position || "Central Midfielder (CM)",
    age: age || "21",
    gender: gender || "Male",
    location: location || "Nagpur, Maharashtra, India",
    bio: bio || "Passionate footballer with strong technical skills, vision and leadership on the field.",
    current_team: currentTeam,
    previous_teams: prevTeams,
    height,
    weight,
    dominant_foot: dominantFoot,
    experience,
    rankings,
    achievements,
    coaching_level: coachingLevel,
    certifications,
    facilities,
    sports_offered: sportsOffered,
    organization,
    region,
    sponsorship_areas: sponsorshipAreas,
    budget_range: budgetRange,
    contact_info: contactInfo,
    sport_metrics: sportMetrics,
    documents,
    skills,
    followers: profile?.followers || [],
    following: profile?.following || [],
  };

  if (!isEditing) {
    return (
      <ProfileCardView
        user={user}
        profile={activeProfile}
        isSelf={true}
        onEdit={() => setIsEditing(true)}
        onUpdateProfile={async (updatedProfile: Profile) => {
          try {
            const res = await fetch(`/api/profiles/${user.id}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updatedProfile),
            });
            const data = await res.json();
            if (res.ok) {
              onProfileUpdate(data.profile);
            }
          } catch (e) {
            console.error("Failed to inline update profile", e);
          }
        }}
        onVerificationRequest={onVerificationRequest}
      />
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Top Workspace Header */}
      <div className="bg-white border border-slate-200/80 rounded-2.5xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-3xs">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">Digital CV Workspace</h2>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Configure your physical metrics, performance records, and verification credentials.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl border border-slate-200 cursor-pointer transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl border border-blue-500 shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Sports CV</span>
          </button>
        </div>
      </div>

      {/* Editing Workspace Column */}
      <div className="space-y-6">
          {/* Cover and Profile Picture Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs relative">
        <div className="h-48 sm:h-64 bg-slate-100 relative overflow-hidden">
          <img src={coverPic || null} alt="Cover" className="w-full h-full object-cover" />
          {isEditing && (
            <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-xs text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex flex-col space-y-1 border border-white/20 max-w-xs">
              <label className="flex items-center space-x-1 cursor-pointer hover:text-blue-300">
                <Camera className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[10px]">
                  {isUploadingCover ? "Uploading..." : "Upload Cover Image"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                  disabled={isUploadingCover}
                />
              </label>
              <div className="border-t border-white/10 my-0.5"></div>
              <input
                id="edit-cover-pic-input"
                type="text"
                placeholder="Or paste cover URL"
                value={coverPic}
                onChange={(e) => setCoverPic(e.target.value)}
                className="bg-transparent border-none text-white focus:outline-hidden text-[9px] w-36 placeholder-white/50"
              />
            </div>
          )}
        </div>

        <div className="p-6 relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 relative -mt-20 sm:-mt-24 mb-4">
            
            {/* Avatar */}
            <div className="relative group">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-4 border-white overflow-hidden shadow-md bg-slate-50">
                <img src={profilePic || null} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              {isEditing && (
                <div className="absolute inset-0 bg-slate-950/70 rounded-2xl flex flex-col items-center justify-center text-white p-2 text-center space-y-1">
                  <label className="flex flex-col items-center justify-center cursor-pointer hover:text-blue-300">
                    <Camera className="w-4 h-4 mb-0.5" />
                    <span className="text-[9px] font-semibold leading-tight">
                      {isUploadingProfile ? "Uploading..." : "Upload Avatar"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePicUpload}
                      className="hidden"
                      disabled={isUploadingProfile}
                    />
                  </label>
                  <div className="w-4/5 border-t border-white/20 my-0.5"></div>
                  <input
                    id="edit-profile-pic-input"
                    type="text"
                    placeholder="Or paste URL"
                    value={profilePic}
                    onChange={(e) => setProfilePic(e.target.value)}
                    className="bg-transparent border-none text-white focus:outline-hidden text-[8px] w-full text-center placeholder-white/40"
                  />
                </div>
              )}
            </div>

            {/* Profile Action Control buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    id="profile-cancel-edit-btn"
                    onClick={() => setIsEditing(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="profile-save-edit-btn"
                    onClick={handleSave}
                    className="bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center space-x-1 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Sports CV</span>
                  </button>
                </>
              ) : (
                <button
                  id="profile-edit-cv-btn"
                  onClick={() => setIsEditing(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center space-x-1.5 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Profile CV</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4 max-w-3xl">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{user.name}</h1>
                {isVerified && <CheckCircle className="w-5 h-5 text-blue-500 fill-blue-50" title="Federation Verified" />}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500 font-medium">
                {profile?.sport && <span className="text-[#1D4ED8] font-bold">{profile.sport}</span>}
                {profile?.position && <span>• {profile.position}</span>}
                {profile?.location && (
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{profile.location}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Bio & Philosophy</span>
              {isEditing ? (
                <textarea
                  id="profile-bio-textarea"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell scouts and organizations about your playstyle, goals, or qualifications..."
                  className="w-full border border-slate-200 p-3 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 h-24"
                />
              ) : (
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl">
                  {bio || "This user hasn't added a bio yet. Click Edit Profile CV to tell your sports story."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Core Career Parameters (Left column) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main CV Metrics Form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 uppercase tracking-wider">Career Metrics & Parameters</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Common Fields */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Sport Discipline</label>
                {!isEditing ? (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedSports.length > 0 ? (
                      selectedSports.map((s, idx) => (
                        <span key={idx} className="bg-blue-50 text-blue-700 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-blue-100 uppercase tracking-wide">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-xs italic">No sports selected yet</span>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Selected sports tags with remove buttons */}
                    <div className="flex flex-wrap gap-1.5 min-h-[32px] p-1 border border-slate-100 rounded-lg bg-slate-50/50">
                      {selectedSports.length > 0 ? (
                        selectedSports.map((s, idx) => (
                          <span key={idx} className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-blue-100 flex items-center gap-1.5">
                            <span>{s}</span>
                            <button
                              type="button"
                              onClick={() => handleToggleSport(s)}
                              className="text-blue-500 hover:text-blue-800 font-extrabold focus:outline-hidden text-sm"
                            >
                              &times;
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 text-xs italic p-1">No sports selected. Search and add below.</span>
                      )}
                    </div>

                    {/* Search box with dropdown */}
                    <div className="relative">
                      <div className="relative">
                        <input
                          type="text"
                          value={sportSearch}
                          onChange={(e) => {
                            setSportSearch(e.target.value);
                            setIsSportDropdownOpen(true);
                          }}
                          onFocus={() => setIsSportDropdownOpen(true)}
                          placeholder="Search 30+ Indian sports..."
                          className="w-full border border-slate-200 pl-8 pr-3.5 py-2.5 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 bg-white"
                        />
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                      </div>

                      {isSportDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40 bg-transparent"
                            onClick={() => setIsSportDropdownOpen(false)}
                          />
                          <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg p-2 space-y-1">
                            <div className="flex justify-between items-center text-[10px] text-slate-400 px-2 py-1 border-b border-slate-50">
                              <span>Search results for "{sportSearch || 'all'}"</span>
                              <button
                                type="button"
                                onClick={() => setIsSportDropdownOpen(false)}
                                className="text-blue-600 hover:text-blue-800 font-bold"
                              >
                                Done
                              </button>
                            </div>
                            
                            {(() => {
                              const filtered = metricTemplates.filter(t =>
                                t.sport.toLowerCase().includes(sportSearch.toLowerCase())
                              );
                              
                              if (filtered.length === 0) {
                                return (
                                  <div className="p-3 text-center text-xs text-slate-500">
                                    <p>No matching sports found.</p>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (sportSearch.trim()) {
                                          handleToggleSport(sportSearch.trim());
                                          setSportSearch("");
                                        }
                                      }}
                                      className="mt-2 block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] py-1.5 rounded-lg"
                                    >
                                      Add "{sportSearch}" as custom sport
                                    </button>
                                  </div>
                                );
                              }
                              
                              return filtered
                                .slice()
                                .sort((a, b) => a.sport.localeCompare(b.sport))
                                .map((t) => {
                                  const isSelected = selectedSports.includes(t.sport);
                                  return (
                                    <button
                                      key={t.id}
                                      type="button"
                                      onClick={() => handleToggleSport(t.sport)}
                                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex justify-between items-center transition-colors ${
                                        isSelected
                                          ? "bg-blue-50 text-blue-700 font-bold"
                                          : "hover:bg-slate-50 text-slate-700"
                                      }`}
                                    >
                                      <span>{t.sport}</span>
                                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                                    </button>
                                  );
                                });
                            })()}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Primary Position / Title</label>
                <input
                  id="profile-position-input"
                  type="text"
                  disabled={!isEditing}
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Striker, Head Coach, Brand Director..."
                  className="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Location</label>
                <input
                  id="profile-location-input"
                  type="text"
                  disabled={!isEditing}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, Country"
                  className="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Age</label>
                <input
                  id="profile-age-input"
                  type="text"
                  disabled={!isEditing}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 19"
                  className="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
                />
              </div>

              {/* Role-Specific Fields */}
              {user.role === "athlete" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 block">Current Team / Club</label>
                    <input
                      id="athlete-current-team-input"
                      type="text"
                      disabled={!isEditing}
                      value={currentTeam}
                      onChange={(e) => setCurrentTeam(e.target.value)}
                      placeholder="e.g. Tata Football Academy"
                      className="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 block">Previous Teams / Academy Pathway</label>
                    <input
                      id="athlete-prev-teams-input"
                      type="text"
                      disabled={!isEditing}
                      value={prevTeams}
                      onChange={(e) => setPrevTeams(e.target.value)}
                      placeholder="List past clubs separated by commas"
                      className="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 block">Physical Height (cm)</label>
                    <input
                      id="athlete-height-input"
                      type="text"
                      disabled={!isEditing}
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="e.g. 182 cm"
                      className="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 block">Physical Weight (kg)</label>
                    <input
                      id="athlete-weight-input"
                      type="text"
                      disabled={!isEditing}
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="e.g. 74 kg"
                      className="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 block">Dominant Hand / Foot</label>
                    <select
                      id="athlete-dominant-limb-select"
                      disabled={!isEditing}
                      value={dominantFoot}
                      onChange={(e) => setDominantFoot(e.target.value)}
                      className="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
                    >
                      <option>Right</option>
                      <option>Left</option>
                      <option>Both</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 block">Active Rankings / Records</label>
                    <input
                      id="athlete-rankings-input"
                      type="text"
                      disabled={!isEditing}
                      value={rankings}
                      onChange={(e) => setRankings(e.target.value)}
                      placeholder="e.g. Top Division Scorer"
                      className="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
                    />
                  </div>
                </>
              )}

              {user.role === "coach" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 block">Coaching License Level</label>
                    <input
                      id="coach-level-input"
                      type="text"
                      disabled={!isEditing}
                      value={coachingLevel}
                      onChange={(e) => setCoachingLevel(e.target.value)}
                      placeholder="UEFA A Licence, FA Level 3..."
                      className="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 block">Qualifications & Degrees</label>
                    <input
                      id="coach-certifications-input"
                      type="text"
                      disabled={!isEditing}
                      value={certifications}
                      onChange={(e) => setCertifications(e.target.value)}
                      placeholder="e.g. Sports Science B.Sc."
                      className="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
                    />
                  </div>
                </>
              )}

              {user.role === "academy" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 block">Physical Facilities details</label>
                    <input
                      id="club-facilities-input"
                      type="text"
                      disabled={!isEditing}
                      value={facilities}
                      onChange={(e) => setFacilities(e.target.value)}
                      placeholder="e.g. 3 Full-size pitches, Medical Wing"
                      className="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 block">Sports Offered</label>
                    <input
                      id="club-sports-offered-input"
                      type="text"
                      disabled={!isEditing}
                      value={sportsOffered}
                      onChange={(e) => setSportsOffered(e.target.value)}
                      placeholder="Football, Basketball, Athletics"
                      className="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
                    />
                  </div>
                </>
              )}

              {user.role === "scout" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 block">Affiliated Agency / Club</label>
                    <input
                      id="scout-org-input"
                      type="text"
                      disabled={!isEditing}
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="e.g. Premier Scout League"
                      className="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 block">Region Coverage</label>
                    <input
                      id="scout-region-input"
                      type="text"
                      disabled={!isEditing}
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="e.g. North India, Maharashtra"
                      className="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
                    />
                  </div>
                </>
              )}

              {user.role === "sponsor" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 block">Sponsorship Funding Focus Areas</label>
                    <input
                      id="sponsor-areas-input"
                      type="text"
                      disabled={!isEditing}
                      value={sponsorshipAreas}
                      onChange={(e) => setSponsorshipAreas(e.target.value)}
                      placeholder="Youth elite sponsorship, equipment supply"
                      className="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 block">Budget Bracket Range</label>
                    <input
                      id="sponsor-budget-input"
                      type="text"
                      disabled={!isEditing}
                      value={budgetRange}
                      onChange={(e) => setBudgetRange(e.target.value)}
                      placeholder="e.g. $5,000 - $25,000"
                      className="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Contact Information</label>
                <input
                  id="profile-contact-input"
                  type="text"
                  disabled={!isEditing}
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="Email, agent contact number..."
                  className="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Active Experience</label>
                <input
                  id="profile-experience-input"
                  type="text"
                  disabled={!isEditing}
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. 5 seasons youth academy"
                  className="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* Standardized Skills Section */}
            <div className="border-t border-slate-100 pt-6 mt-6">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <Award className="w-4 h-4 text-blue-500" />
                Sports-Specific Skills & Attributes (Standardized Tagging)
              </h3>
              
              <div className="space-y-3">
                {/* Selected tags list with remove button */}
                <div className="flex flex-wrap gap-2 p-3 border border-slate-100 rounded-xl bg-slate-50/50 min-h-[44px]">
                  {skills.length > 0 ? (
                    skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-blue-100 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-100"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => setSkills(prev => prev.filter(s => s !== skill))}
                          className="text-blue-500 hover:text-blue-800 font-extrabold focus:outline-hidden text-sm"
                          title={`Remove ${skill}`}
                        >
                          &times;
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-xs italic">
                      No skills added yet. Select from the predefined list or type your own below.
                    </span>
                  )}
                </div>

                {/* Search/Input area with suggestions */}
                <div className="relative">
                  <div className="relative">
                    <input
                      type="text"
                      value={skillSearch}
                      onChange={(e) => {
                        setSkillSearch(e.target.value);
                        setIsSkillDropdownOpen(true);
                      }}
                      onFocus={() => setIsSkillDropdownOpen(true)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const val = skillSearch.trim();
                          if (val && !skills.includes(val)) {
                            setSkills(prev => [...prev, val]);
                            setSkillSearch("");
                          }
                        }
                      }}
                      placeholder="Type a skill and hit Enter, or select sports-specific recommendations below..."
                      className="w-full border border-slate-200 pl-9 pr-3.5 py-2.5 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 bg-white"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>

                  {isSkillDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40 bg-transparent"
                        onClick={() => setIsSkillDropdownOpen(false)}
                      />
                      <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg p-3 space-y-2">
                        {/* Selected Sports suggestions header */}
                        <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-100 pb-1">
                          <span>
                            Recommended for {selectedSports.length > 0 ? selectedSports.join(", ") : "General Athletics"}
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsSkillDropdownOpen(false)}
                            className="text-blue-600 hover:text-blue-800 font-bold"
                          >
                            Done
                          </button>
                        </div>

                        {/* List of recommended skills matching the search */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
                          {(() => {
                            // Find matching skills for selectedSports, fallback to general
                            let pool: string[] = [];
                            selectedSports.forEach(s => {
                              const key = s.toLowerCase();
                              if (SPORT_SKILLS_MAP[key]) {
                                pool = [...pool, ...SPORT_SKILLS_MAP[key]];
                              } else {
                                // check sub-string matches
                                Object.keys(SPORT_SKILLS_MAP).forEach(k => {
                                  if (key.includes(k) || k.includes(key)) {
                                    pool = [...pool, ...SPORT_SKILLS_MAP[k]];
                                  }
                                });
                              }
                            });

                            if (pool.length === 0) {
                              pool = GENERAL_SKILLS;
                            } else {
                              // Include general skills as extra recommendations at the end
                              pool = [...new Set([...pool, ...GENERAL_SKILLS])];
                            }

                            // Filter out already selected skills
                            pool = pool.filter(s => !skills.includes(s));

                            // Filter by search query
                            if (skillSearch) {
                              pool = pool.filter(s => s.toLowerCase().includes(skillSearch.toLowerCase()));
                            }

                            if (pool.length === 0) {
                              return (
                                <div className="col-span-full py-3 text-center text-xs text-slate-500">
                                  {skillSearch ? (
                                    <p>No matching predefined skills. Hit <b>Enter</b> to add "{skillSearch}" as a custom skill.</p>
                                  ) : (
                                    <p>All recommended skills have been added!</p>
                                  )}
                                </div>
                              );
                            }

                            return pool.map((item, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setSkills(prev => [...prev, item]);
                                  setSkillSearch("");
                                  setIsSkillDropdownOpen(false);
                                }}
                                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-blue-50 hover:text-blue-700 transition-colors border border-slate-100 hover:border-blue-200 flex items-center justify-between"
                              >
                                <span className="truncate">{item}</span>
                                <Plus className="w-3 h-3 text-slate-400 shrink-0" />
                              </button>
                            ));
                          })()}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Overview Dashboard Customization Card */}
            {isEditing && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                  <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Overview Dashboard Customization</h2>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-blue-500" />
                    1. Basic Info & Meta
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 block">Date of Birth</label>
                      <input
                        type="text"
                        value={sportMetrics.date_of_birth !== undefined ? sportMetrics.date_of_birth : "03 Feb 2003"}
                        onChange={(e) => setSportMetrics({ ...sportMetrics, date_of_birth: e.target.value })}
                        placeholder="e.g. 03 Feb 2003"
                        className="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 block">Jersey Number</label>
                      <input
                        type="text"
                        value={sportMetrics.jersey_number !== undefined ? sportMetrics.jersey_number : "10"}
                        onChange={(e) => setSportMetrics({ ...sportMetrics, jersey_number: e.target.value })}
                        placeholder="e.g. 10"
                        className="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 block">Playing Level</label>
                      <input
                        type="text"
                        value={sportMetrics.playing_level !== undefined ? sportMetrics.playing_level : "Semi-Professional"}
                        onChange={(e) => setSportMetrics({ ...sportMetrics, playing_level: e.target.value })}
                        placeholder="e.g. Professional, Semi-Professional, Amateur"
                        className="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 block">Languages</label>
                      <input
                        type="text"
                        value={sportMetrics.languages !== undefined ? sportMetrics.languages : "English, Hindi"}
                        onChange={(e) => setSportMetrics({ ...sportMetrics, languages: e.target.value })}
                        placeholder="e.g. English, Hindi, Marathi"
                        className="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                    2. Education Section
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-600 block">School / College / University</label>
                      <input
                        type="text"
                        value={sportMetrics.education_school !== undefined ? sportMetrics.education_school : "Rashtrasant Tukadoji Maharaj Nagpur University"}
                        onChange={(e) => setSportMetrics({ ...sportMetrics, education_school: e.target.value })}
                        placeholder="University Name"
                        className="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 block">Years</label>
                      <input
                        type="text"
                        value={sportMetrics.education_years !== undefined ? sportMetrics.education_years : "2021 - 2024"}
                        onChange={(e) => setSportMetrics({ ...sportMetrics, education_years: e.target.value })}
                        placeholder="e.g. 2021 - 2024"
                        className="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 bg-white"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-3">
                      <label className="text-xs font-bold text-slate-600 block">Degree / Certification</label>
                      <input
                        type="text"
                        value={sportMetrics.education_degree !== undefined ? sportMetrics.education_degree : "Bachelor of Commerce (B.Com)"}
                        onChange={(e) => setSportMetrics({ ...sportMetrics, education_degree: e.target.value })}
                        placeholder="e.g. Bachelor of Physical Education"
                        className="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 text-blue-500" />
                    3. Highlights & Video
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 block">Highlight Video Title</label>
                      <input
                        type="text"
                        value={sportMetrics.highlight_title !== undefined ? sportMetrics.highlight_title : "Match Highlight vs Central FC"}
                        onChange={(e) => setSportMetrics({ ...sportMetrics, highlight_title: e.target.value })}
                        placeholder="Video description"
                        className="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 block">Highlight Cover Image / Poster URL</label>
                      <input
                        type="text"
                        value={sportMetrics.highlight_url !== undefined ? sportMetrics.highlight_url : "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=400"}
                        onChange={(e) => setSportMetrics({ ...sportMetrics, highlight_url: e.target.value })}
                        placeholder="Image URL"
                        className="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Dynamic Sport-Specific Metrics Cards */}
            {selectedSports.map((sportName) => {
              const matchedTemplate = metricTemplates.find(
                t => t.sport.toLowerCase().trim() === sportName.toLowerCase().trim()
              ) || SportsMetricsService.getTemplateForSport(sportName);
              if (!matchedTemplate) return null;

              const lowerSport = sportName.toLowerCase().trim();
              const segmentDef = SPORT_SEGMENTS_MAP[lowerSport];

              // Parse saved segments and custom segments
              const activeSegments: string[] = safeParseJson(sportMetrics[`segments_${sportName}`], []);
              const customSegments: string[] = safeParseJson(sportMetrics[`custom_segments_${sportName}`], []);
              const customStats: { key: string; value: string }[] = safeParseJson(sportMetrics[`custom_stats_${sportName}`], []);
              const narrative = sportMetrics[`narrative_${sportName}`] || "";

              // Determine sub-fields to render based on active segments
              let subfieldsToRender: string[] = [];
              if (segmentDef) {
                // Predefined sub-fields for selected segments
                if (segmentDef.subfields) {
                  activeSegments.forEach(seg => {
                    if (segmentDef.subfields?.[seg]) {
                      subfieldsToRender.push(...segmentDef.subfields[seg]);
                    }
                  });
                }
                // Predefined default sub-fields for the sport if applicable
                if (segmentDef.defaultSubfields) {
                  subfieldsToRender.push(...segmentDef.defaultSubfields);
                }
              }

              // Remove duplicates
              subfieldsToRender = Array.from(new Set(subfieldsToRender));

              const addCustomSegmentLocal = (e: React.FormEvent) => {
                e.preventDefault();
                const text = customSegmentInputs[sportName]?.trim();
                if (!text) return;
                if (!customSegments.includes(text)) {
                  const updated = [...customSegments, text];
                  setSportMetrics(prev => ({
                    ...prev,
                    [`custom_segments_${sportName}`]: JSON.stringify(updated)
                  }));
                }
                setCustomSegmentInputs(prev => ({ ...prev, [sportName]: "" }));
              };

              const removeCustomSegmentLocal = (tagToRemove: string) => {
                const updated = customSegments.filter(t => t !== tagToRemove);
                setSportMetrics(prev => ({
                  ...prev,
                  [`custom_segments_${sportName}`]: JSON.stringify(updated)
                }));
              };

              const toggleSegmentLocal = (seg: string) => {
                let updated;
                if (activeSegments.includes(seg)) {
                  updated = activeSegments.filter(s => s !== seg);
                } else {
                  updated = [...activeSegments, seg];
                }
                setSportMetrics(prev => ({
                  ...prev,
                  [`segments_${sportName}`]: JSON.stringify(updated)
                }));
              };

              const addCustomStatLocal = () => {
                const key = newStatKeys[sportName]?.trim();
                const val = newStatValues[sportName]?.trim();
                if (!key || !val) return;

                const filtered = customStats.filter(item => item.key.toLowerCase() !== key.toLowerCase());
                const updated = [...filtered, { key, value: val }];

                setSportMetrics(prev => ({
                  ...prev,
                  [`custom_stats_${sportName}`]: JSON.stringify(updated)
                }));

                setNewStatKeys(prev => ({ ...prev, [sportName]: "" }));
                setNewStatValues(prev => ({ ...prev, [sportName]: "" }));
              };

              const removeCustomStatLocal = (keyToRemove: string) => {
                const updated = customStats.filter(item => item.key !== keyToRemove);
                setSportMetrics(prev => ({
                  ...prev,
                  [`custom_stats_${sportName}`]: JSON.stringify(updated)
                }));
              };

              return (
                <div key={matchedTemplate.id} className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-6 shadow-xs">
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                          {matchedTemplate.sport} Profiler
                        </h3>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Customize your disciplines, apparatuses, performance statistics, and sport narrative.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                      <button
                        id={`btn-configure-${sportName.replace(/\s+/g, '-')}`}
                        type="button"
                        onClick={() => openSportDetailModal(sportName)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>{isEditing ? "Configure in Modal" : "View Details Modal"}</span>
                      </button>
                      <span className="text-[9px] bg-blue-100 text-blue-800 font-extrabold px-2.5 py-1 rounded-lg border border-blue-200 uppercase tracking-wider select-none">
                        Comprehensive Profile
                      </span>
                    </div>
                  </div>

                  {/* 1. Disciplines / Segments Section */}
                  <div className="space-y-2.5">
                    <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-blue-600" />
                      Discipline Segments & Specialties
                    </h4>
                    
                    {segmentDef && (
                      <div className="flex flex-wrap gap-1.5 py-1">
                        {segmentDef.segments.map(seg => {
                          const isSelected = activeSegments.includes(seg);
                          return isEditing ? (
                            <button
                              key={seg}
                              type="button"
                              onClick={() => toggleSegmentLocal(seg)}
                              className={`text-[10px] px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                                isSelected
                                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                              {seg}
                            </button>
                          ) : isSelected ? (
                            <span
                              key={seg}
                              className="text-[10px] px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 border border-blue-200 font-extrabold"
                            >
                              {seg}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}

                    {/* Custom specialty tags builder */}
                    <div className="space-y-2">
                      {/* Active Custom Tags */}
                      {(customSegments.length > 0 || (!isEditing && activeSegments.length === 0 && customSegments.length === 0)) && (
                        <div className="flex flex-wrap gap-1.5">
                          {customSegments.map(tag => (
                            <span
                              key={tag}
                              className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-200 text-slate-800 border border-slate-300 font-extrabold flex items-center gap-1.5"
                            >
                              {tag}
                              {isEditing && (
                                <button
                                  type="button"
                                  onClick={() => removeCustomSegmentLocal(tag)}
                                  className="text-slate-500 hover:text-slate-800 font-bold transition-all ml-0.5 cursor-pointer"
                                >
                                  ×
                                </button>
                              )}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Input for new tag (only when editing) */}
                      {isEditing && (
                        <form onSubmit={addCustomSegmentLocal} className="flex gap-2 max-w-sm">
                          <input
                            type="text"
                            placeholder="Add custom segment / special event..."
                            value={customSegmentInputs[sportName] || ""}
                            onChange={(e) => setCustomSegmentInputs({ ...customSegmentInputs, [sportName]: e.target.value })}
                            className="w-full border border-slate-200 px-3 py-1.5 rounded-xl text-[10px] focus:outline-hidden focus:border-blue-500 bg-white"
                          />
                          <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" /> Add
                          </button>
                        </form>
                      )}
                    </div>
                  </div>

                  {/* 2. Core Template Metrics & Dynamic Apparatus Sub-fields */}
                  <div className="space-y-3.5 pt-1">
                    <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-blue-600" />
                      KPI & Apparatus Performance Scores
                    </h4>

                    {/* Standard Template Fields + Dynamically triggered subfields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Original Fields */}
                      {matchedTemplate.fields.map((field: any) => (
                        <div key={field.id} className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-600 block">
                            {field.name} {field.unit ? `(${field.unit})` : ""}
                          </label>
                          {isEditing ? (
                            <input
                              type={field.type === "number" ? "number" : "text"}
                              value={sportMetrics[field.id] || ""}
                              onChange={(e) => setSportMetrics({
                                ...sportMetrics,
                                [field.id]: e.target.value
                              })}
                              placeholder={field.type === "number" ? "Enter value" : "Enter detail"}
                              className="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 bg-white"
                            />
                          ) : (
                            <div className="bg-white border border-slate-100 px-3.5 py-2.5 rounded-xl text-xs text-slate-800 font-semibold font-mono">
                              {sportMetrics[field.id] !== undefined && sportMetrics[field.id] !== ""
                                ? `${sportMetrics[field.id]} ${field.unit || ""}`
                                : "—"}
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Dynamic Apparatus / Subfield Inputs */}
                      {subfieldsToRender.map((subName) => {
                        const subFieldId = `subfield_${sportName}_${subName}`;
                        return (
                          <div key={subName} className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 block">
                              {subName}
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={sportMetrics[subFieldId] || ""}
                                onChange={(e) => setSportMetrics({
                                  ...sportMetrics,
                                  [subFieldId]: e.target.value
                                })}
                                placeholder="Enter score / details"
                                className="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 bg-white"
                              />
                            ) : (
                              <div className="bg-white border border-slate-100 px-3.5 py-2.5 rounded-xl text-xs text-slate-800 font-semibold font-mono">
                                {sportMetrics[subFieldId] !== undefined && sportMetrics[subFieldId] !== ""
                                  ? sportMetrics[subFieldId]
                                  : "—"}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Placeholder if absolutely no subfields are visible or set */}
                    {!isEditing && matchedTemplate.fields.length === 0 && subfieldsToRender.length === 0 && (
                      <p className="text-[11px] text-slate-400 italic">No standard or apparatus KPIs configured yet.</p>
                    )}
                  </div>

                  {/* 3. Custom Dynamic Key-Value Stats builder */}
                  <div className="space-y-3.5 pt-1">
                    <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Custom Performance Metrics & Records
                    </h4>

                    {/* Custom added list */}
                    {customStats.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {customStats.map(item => (
                          <div key={item.key} className="bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-between shadow-2xs">
                            <div className="space-y-0.5">
                              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">{item.key}</span>
                              <span className="text-xs text-slate-800 font-black font-mono">{item.value}</span>
                            </div>
                            {isEditing && (
                              <button
                                type="button"
                                onClick={() => removeCustomStatLocal(item.key)}
                                className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Custom stat form (only when editing) */}
                    {isEditing && (
                      <div className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-2.5 max-w-md">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Add Custom Metric / Test Value</span>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            placeholder="Metric Name (e.g., 50m Sprint, PB, etc.)"
                            value={newStatKeys[sportName] || ""}
                            onChange={(e) => setNewStatKeys({ ...newStatKeys, [sportName]: e.target.value })}
                            className="w-full border border-slate-200 px-3 py-2 rounded-lg text-[10px] focus:outline-hidden focus:border-blue-500 bg-white"
                          />
                          <input
                            type="text"
                            placeholder="Value (e.g., 6.2s, 150kg, etc.)"
                            value={newStatValues[sportName] || ""}
                            onChange={(e) => setNewStatValues({ ...newStatValues, [sportName]: e.target.value })}
                            className="w-full border border-slate-200 px-3 py-2 rounded-lg text-[10px] focus:outline-hidden focus:border-blue-500 bg-white"
                          />
                          <button
                            type="button"
                            onClick={addCustomStatLocal}
                            className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-lg text-[10px] transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0"
                          >
                            <Plus className="w-3 h-3" /> Add
                          </button>
                        </div>
                      </div>
                    )}

                    {!isEditing && customStats.length === 0 && (
                      <p className="text-[10px] text-slate-400 italic">No custom metrics added.</p>
                    )}
                  </div>

                  {/* 4. Sport Biography / Journey / Narrative */}
                  <div className="space-y-2.5 pt-1">
                    <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      My {matchedTemplate.sport} Journey & Playing Style
                    </h4>

                    {isEditing ? (
                      <textarea
                        rows={3}
                        placeholder={`Describe your journey in ${matchedTemplate.sport}, your core strength, playstyle, training hours, coaches, or tournament experiences...`}
                        value={narrative}
                        onChange={(e) => setSportMetrics({
                          ...sportMetrics,
                          [`narrative_${sportName}`]: e.target.value
                        })}
                        className="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 bg-white"
                      />
                    ) : narrative ? (
                      <div className="bg-white border-l-4 border-blue-500/80 px-4 py-3 rounded-r-xl shadow-2xs">
                        <p className="text-xs text-slate-600 leading-relaxed italic whitespace-pre-wrap">
                          "{narrative}"
                        </p>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">No journey or style description added yet.</p>
                    )}
                  </div>

                  {/* 5. Dynamic Performance Radar Attributes Sliders */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-blue-600" />
                      {matchedTemplate.sport} Attribute Ratings (Radar Chart)
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Set your ratings (0 - 100) for sport-specific athletic attributes. These will be beautifully plotted on your interactive scout radar chart.
                    </p>

                    <div className="space-y-3 bg-slate-50/50 border border-slate-200 rounded-xl p-4">
                      {SportsMetricsService.getPerformanceAttributesForSport(sportName).map((attr) => {
                        const attrKey = `radar_${sportName}_${attr.id}`;
                        const currentValue = sportMetrics[attrKey] !== undefined ? sportMetrics[attrKey] : attr.defaultVal;
                        
                        return (
                          <div key={attr.id} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-black text-slate-700">{attr.label}</span>
                              <span className="text-xs font-black text-blue-600 font-mono">{currentValue} / 100</span>
                            </div>
                            {isEditing ? (
                              <div className="flex items-center gap-3">
                                <input 
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={currentValue}
                                  onChange={(e) => setSportMetrics({
                                    ...sportMetrics,
                                    [attrKey]: e.target.value
                                  })}
                                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                                <input 
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={currentValue}
                                  onChange={(e) => {
                                    let val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                                    setSportMetrics({
                                      ...sportMetrics,
                                      [attrKey]: String(val)
                                    });
                                  }}
                                  className="w-14 border border-slate-200 px-1.5 py-0.5 rounded-lg text-center text-xs focus:outline-hidden font-bold font-mono"
                                />
                              </div>
                            ) : (
                              <div className="w-full bg-slate-100 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${currentValue}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

            {selectedSports.length === 0 && isEditing && (
              <div className="text-[11px] text-slate-500 bg-slate-50 p-3.5 rounded-xl border border-dashed border-slate-200">
                💡 Tip: Use the search-enabled Sport Discipline select above to add multiple sports like <b>Cricket</b>, <b>Kabaddi</b>, <b>Field Hockey</b>, <b>Badminton</b>, or <b>Chess</b> to unlock custom KPI and performance metrics fields for each selected sport!
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 block">Official Tournament Wins & Certifications achievements</label>
              {isEditing ? (
                <textarea
                  id="profile-achievements-textarea"
                  value={achievements}
                  onChange={(e) => setAchievements(e.target.value)}
                  placeholder="🏆 List cup wins, player of season awards, etc. (one per line)"
                  className="w-full border border-slate-200 p-3 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 h-28"
                />
              ) : (
                <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                  {achievements || "No achievements recorded yet."}
                </div>
              )}
            </div>

            {/* My Certificates & Sports Documents Section */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-500" />
                Verified Athletic Credentials & Documents
              </h4>
              
              {/* Aadhaar / Gov ID Warning banner */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5">
                <span className="text-lg shrink-0 select-none">⚠️</span>
                <div className="text-[10px] text-amber-800 leading-relaxed font-medium">
                  <p className="font-bold">Privacy & Security Safeguard:</p>
                  <p className="mt-0.5">Please <b>DO NOT upload government identity proof like Aadhaar Card, Passport, or PAN card</b> in this section. This public area is strictly meant for showcasing sports achievements, certificates, coaching licenses, federation registrations, or athletic performance logs.</p>
                </div>
              </div>

              {/* Upload Form inside editing mode */}
              {isEditing && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">Add New Document</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 block">Document Name</label>
                      <input 
                        type="text"
                        value={newDocName}
                        onChange={(e) => setNewDocName(e.target.value)}
                        placeholder="e.g. State Championship Gold Medal"
                        className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-xs bg-white focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 block">Document Type</label>
                      <select 
                        value={newDocType}
                        onChange={(e) => setNewDocType(e.target.value)}
                        className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-xs bg-white focus:outline-hidden focus:border-blue-500"
                      >
                        <option value="Certificate">Certificate</option>
                        <option value="Federation License">Federation License</option>
                        <option value="Performance Log">Performance Log</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative overflow-hidden">
                      <button 
                        type="button"
                        disabled={isUploadingDoc}
                        className="bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingDoc ? "Uploading..." : "Upload & Save File"}</span>
                      </button>
                      <input 
                        type="file"
                        onChange={handleDocUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        disabled={isUploadingDoc}
                      />
                    </div>
                    <span className="text-[9px] text-slate-400 italic">Supported files: PDF, JPEG, PNG</span>
                  </div>

                  {docUploadError && (
                    <p className="text-[10px] text-rose-600 font-bold leading-tight">{docUploadError}</p>
                  )}
                </div>
              )}

              {/* Render Documents Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {documents.map((doc) => (
                  <div key={doc.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-2 rounded-lg shrink-0 ${
                        doc.type === "Certificate" ? "bg-amber-50 text-amber-600" :
                        doc.type === "Federation License" ? "bg-blue-50 text-blue-600" :
                        doc.type === "Performance Log" ? "bg-purple-50 text-purple-600" :
                        "bg-slate-50 text-slate-600"
                      }`}>
                        <Award className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-black text-slate-800 leading-tight truncate" title={doc.name}>{doc.name}</h5>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{doc.type}</span>
                          {doc.file_name && (
                            <>
                              <span className="text-[8px] text-slate-300">•</span>
                              <span className="text-[8px] font-semibold text-slate-400 truncate max-w-[100px]">{doc.file_name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      {doc.file_url && (
                        <a 
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] text-blue-600 hover:text-blue-700 font-extrabold hover:underline"
                        >
                          View
                        </a>
                      )}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDoc(doc.id)}
                          className="p-1 hover:bg-slate-100 rounded-md text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Remove Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {documents.length === 0 && (
                  <div className="sm:col-span-2 py-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/30">
                    <p className="text-[10px] text-slate-400 italic">No credentials or certificates uploaded yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Verification Hub Portal (Right column) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Verification Portal</h3>
            </div>

            {isVerified ? (
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-center space-y-2.5">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto fill-emerald-50" />
                <h4 className="font-bold text-emerald-800 text-xs uppercase tracking-wider">Federation Verified Pro</h4>
                <p className="text-[10px] text-emerald-600 leading-relaxed">
                  Your profile displays the Verified Badge. Sports scouts can trust your match statistics and background federation files completely.
                </p>
              </div>
            ) : isPending ? (
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-center space-y-2.5">
                <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mx-auto"></div>
                <h4 className="font-bold text-amber-800 text-xs uppercase tracking-wider">Verification Pending</h4>
                <p className="text-[10px] text-amber-600 leading-relaxed">
                  Your registration records and certificates are currently being manually cross-referenced with your national athletic federation databases.
                </p>
              </div>
            ) : (
              <form id="verify-form" onSubmit={submitVerification} className="space-y-4">
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Upload PDF or PNG proof to earn your <b>Verification Badge</b>, unlocking matching systems for elite scholarship and scouting opportunities.
                </p>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                      <span>1. Government ID / Passport</span>
                      {idProofName && <span className="text-emerald-600">Selected</span>}
                    </label>
                    <div className="relative border border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-3 text-center transition-colors cursor-pointer bg-slate-50/50">
                      <input
                        id="verify-id-upload"
                        type="file"
                        onChange={(e) => setIdProofName(e.target.files?.[0]?.name || "ID_Proof.pdf")}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Upload className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                      <span className="text-[10px] font-medium text-slate-500 block truncate">
                        {idProofName || "Drag or browse file"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                      <span>2. Federation Card / League Reg</span>
                      {fedRecordName && <span className="text-emerald-600">Selected</span>}
                    </label>
                    <div className="relative border border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-3 text-center transition-colors cursor-pointer bg-slate-50/50">
                      <input
                        id="verify-fed-upload"
                        type="file"
                        onChange={(e) => setFedRecordName(e.target.files?.[0]?.name || "Federation_Registration.pdf")}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Upload className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                      <span className="text-[10px] font-medium text-slate-500 block truncate">
                        {fedRecordName || "Drag or browse file"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                      <span>3. Sports Achievements (PDF)</span>
                      {certificateName && <span className="text-emerald-600">Selected</span>}
                    </label>
                    <div className="relative border border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-3 text-center transition-colors cursor-pointer bg-slate-50/50">
                      <input
                        id="verify-cert-upload"
                        type="file"
                        onChange={(e) => setCertificateName(e.target.files?.[0]?.name || "Achievements_Portfolio.pdf")}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Upload className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                      <span className="text-[10px] font-medium text-slate-500 block truncate">
                        {certificateName || "Drag or browse file"}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  id="verify-submit-btn"
                  type="submit"
                  disabled={submittingVerification || !idProofName || !certificateName || !fedRecordName}
                  className="w-full bg-[#1D4ED8] hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer shadow-xs"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>{submittingVerification ? "Uploading records..." : "Submit Verification documents"}</span>
                </button>
              </form>
            )}
          </div>
        </div>

      </div> {/* closes grid grid-cols-1 lg:grid-cols-12 gap-6 */}
    </div> {/* closes space-y-6 inner */}

      {/* Structured Sport Detail Modal */}
      <SportDetailModal
        isOpen={!!activeDetailSport}
        onClose={() => setActiveDetailSport(null)}
        sportName={activeDetailSport || ""}
        sportMetrics={sportMetrics}
        isEditing={isEditing}
        onSave={handleSaveSportDetails}
      />
    </div>
  );
}
