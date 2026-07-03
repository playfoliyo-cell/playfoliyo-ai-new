import React, { useState } from "react";
import { User, Profile, SportDocument } from "../types";
import { 
  MapPin, Trophy, Calendar, Sparkles, MessageSquare, UserPlus, 
  UserCheck, Shield, BookOpen, Clock, Play, Eye, Share2, 
  MoreVertical, Edit2, CheckCircle, ChevronRight, Ruler, 
  Flame, Mail, Phone, Heart, Award, ArrowUpRight, FileText,
  Users, Check, Download, Activity, Sliders, Camera, Save, X, Plus, Trash2, Upload,
  Lock, Bell, Globe, EyeOff, Loader2, RefreshCw
} from "lucide-react";
import { SportsMetricsService } from "../services/SportsMetricsService";
import { SPORT_SEGMENTS_MAP, safeParseJson } from "./SportDetailModal";
import RadarChart from "./RadarChart";
import { uploadMedia } from "../lib/supabase";
import HighlightReels from "./HighlightReels";

interface ProfileCardViewProps {
  user: User;
  profile: Profile;
  isSelf: boolean;
  onEdit?: () => void;
  onSendMessage?: () => void;
  onFollowToggle?: () => void;
  isFollowing?: boolean;
  onUpdateProfile?: (updatedProfile: Profile) => void;
  onVerificationRequest?: (reqData: any) => void;
}

export default function ProfileCardView({
  user,
  profile,
  isSelf,
  onEdit,
  onSendMessage,
  onFollowToggle,
  isFollowing = false,
  onUpdateProfile,
  onVerificationRequest,
}: ProfileCardViewProps) {
  const [activeSubTab, setActiveSubTab] = useState("overview");
  const [activeMediaTab, setActiveMediaTab] = useState("photos");
  const [showToast, setShowToast] = useState(false);
  const [showPrintCV, setShowPrintCV] = useState(false);
  const isSeeded = ["u-athlete1", "u-coach1", "u-club1", "u-scout1", "u-sponsor1", "u-admin"].includes(profile.user_id);

  // More action menu and Settings states
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  
  // Settings detail fields states
  const [profileVisibility, setProfileVisibility] = useState<"public" | "private" | "network">(
    profile?.profile_visibility || "public"
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

  // Password change states
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<{ type: "success" | "error" | ""; msg: string }>({ type: "", msg: "" });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Switch role states
  const [selectedRole, setSelectedRole] = useState(user.role || "athlete");
  const [roleChangeSuccess, setRoleChangeSuccess] = useState(false);
  const [isChangingRole, setIsChangingRole] = useState(false);

  // Settings tab navigation states
  const [activeSettingsTab, setActiveSettingsTab] = useState<"privacy" | "notifications" | "interface" | "security" | "danger">("privacy");
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [settingsError, setSettingsError] = useState("");

  // Social actions states
  const [reportReason, setReportReason] = useState("Spam");
  const [reportText, setReportText] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);
  const [blockSuccess, setBlockSuccess] = useState(false);

  // Inline editing states
  const [isEditingOverview, setIsEditingOverview] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingStats, setIsEditingStats] = useState(false);
  const [isEditingMedia, setIsEditingMedia] = useState(false);
  const [isEditingAchievements, setIsEditingAchievements] = useState(false);
  const [isEditingConnections, setIsEditingConnections] = useState(false);

  // Draft states for Media
  const [draftHighlightUrl, setDraftHighlightUrl] = useState("");
  const [draftHighlightTitle, setDraftHighlightTitle] = useState("");
  const [draftPhotos, setDraftPhotos] = useState<string[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");

  // Draft states for Connections
  const [draftInstagramUrl, setDraftInstagramUrl] = useState("");
  const [draftTwitterUrl, setDraftTwitterUrl] = useState("");
  const [draftLinkedinUrl, setDraftLinkedinUrl] = useState("");
  const [draftConnections, setDraftConnections] = useState<any[]>([]);
  const [newContactName, setNewContactName] = useState("");
  const [newContactRole, setNewContactLocation] = useState(""); // Location and role text inputs
  const [newContactRoleField, setNewContactRoleField] = useState("");
  const [newContactAvatar, setNewContactAvatar] = useState("");

  // Draft states for Overview
  const [draftBio, setDraftBio] = useState("");
  const [draftPosition, setDraftPosition] = useState("");
  const [draftLocation, setDraftLocation] = useState("");
  const [draftAge, setDraftAge] = useState("");
  const [draftGender, setDraftGender] = useState("");
  const [draftCurrentTeam, setDraftCurrentTeam] = useState("");
  const [draftPrevTeams, setDraftPrevTeams] = useState("");
  const [draftHeight, setDraftHeight] = useState("");
  const [draftWeight, setDraftWeight] = useState("");
  const [draftDominantFoot, setDraftDominantFoot] = useState("");
  const [draftExperience, setDraftExperience] = useState("");
  const [draftRankings, setDraftRankings] = useState("");
  const [draftContactInfo, setDraftContactInfo] = useState("");
  
  const [draftDob, setDraftDob] = useState("");
  const [draftJerseyNumber, setDraftJerseyNumber] = useState("");
  const [draftPlayingLevel, setDraftPlayingLevel] = useState("");
  const [draftLanguages, setDraftLanguages] = useState("");
  const [draftEducationSchool, setDraftEducationSchool] = useState("");
  const [draftEducationDegree, setDraftEducationDegree] = useState("");
  const [draftEducationYears, setDraftEducationYears] = useState("");

  const [draftCoachingLevel, setDraftCoachingLevel] = useState("");
  const [draftCertifications, setDraftCertifications] = useState("");
  const [draftFacilities, setDraftFacilities] = useState("");
  const [draftSportsOffered, setDraftSportsOffered] = useState("");
  const [draftOrganization, setDraftOrganization] = useState("");
  const [draftRegion, setDraftRegion] = useState("");
  const [draftSponsorshipAreas, setDraftSponsorshipAreas] = useState("");
  const [draftBudgetRange, setDraftBudgetRange] = useState("");

  // Draft states for Achievements
  const [draftGoldMedals, setDraftGoldMedals] = useState("");
  const [draftSilverMedals, setDraftSilverMedals] = useState("");
  const [draftMvpAwards, setDraftMvpAwards] = useState("");
  const [draftAchievements, setDraftAchievements] = useState("");

  // Draft states for Stats (Dynamic metrics per sport)
  const [draftSportMetrics, setDraftSportMetrics] = useState<Record<string, string>>({});
  const [draftSports, setDraftSports] = useState<string[]>([]);
  const [sportSearch, setSportSearch] = useState("");
  const [isSportDropdownOpen, setIsSportDropdownOpen] = useState(false);
  const [customSegmentInput, setCustomSegmentInput] = useState("");
  const [newStatKey, setNewStatKey] = useState("");
  const [newStatValue, setNewStatValue] = useState("");

  // Cover & Profile uploading states
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);

  // Document upload states
  const [newDocName, setNewDocName] = useState("");
  const [newDocType, setNewDocType] = useState("Certificate");
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [docUploadError, setDocUploadError] = useState("");
  const [idProofName, setIdProofName] = useState("");
  const [certificateName, setCertificateName] = useState("");
  const [fedRecordName, setFedRecordName] = useState("");
  const [submittingVerification, setSubmittingVerification] = useState(false);

  // Parse metrics
  const metrics = profile.sport_metrics || {};

  // Start edit helpers
  const startEditingOverview = () => {
    setDraftBio(profile.bio || "");
    setDraftPosition(profile.position || "");
    setDraftLocation(profile.location || "");
    setDraftAge(profile.age || "");
    setDraftGender(profile.gender || "Male");
    setDraftCurrentTeam(profile.current_team || "");
    setDraftPrevTeams(profile.previous_teams || "");
    setDraftHeight(profile.height || "");
    setDraftWeight(profile.weight || "");
    setDraftDominantFoot(profile.dominant_foot || "Right");
    setDraftExperience(profile.experience || "");
    setDraftRankings(profile.rankings || "");
    setDraftContactInfo(profile.contact_info || "");
    
    setDraftDob(metrics.date_of_birth || "");
    setDraftJerseyNumber(metrics.jersey_number || "");
    setDraftPlayingLevel(metrics.playing_level || "");
    setDraftLanguages(metrics.languages || "");
    setDraftEducationSchool(metrics.education_school || "");
    setDraftEducationDegree(metrics.education_degree || "");
    setDraftEducationYears(metrics.education_years || "");

    setDraftCoachingLevel(profile.coaching_level || "");
    setDraftCertifications(profile.certifications || "");
    setDraftFacilities(profile.facilities || "");
    setDraftSportsOffered(profile.sports_offered || "");
    setDraftOrganization(profile.organization || "");
    setDraftRegion(profile.region || "");
    setDraftSponsorshipAreas(profile.sponsorship_areas || "");
    setDraftBudgetRange(profile.budget_range || "");

    setIsEditingOverview(true);
  };

  const startEditingStats = () => {
    setDraftSportMetrics(profile.sport_metrics || {});
    setDraftSports(profile.sport ? profile.sport.split(",").map(s => s.trim()).filter(Boolean) : []);
    setIsEditingStats(true);
  };

  const startEditingAchievements = () => {
    setDraftGoldMedals(metrics.gold_medals || "4");
    setDraftSilverMedals(metrics.silver_medals || "2");
    setDraftMvpAwards(metrics.mvp_awards || "3");
    setDraftAchievements(profile.achievements || "");
    setIsEditingAchievements(true);
  };

  // Settings, Change Password, Switch Role, Report, and Block handlers
  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    setSettingsSuccess(false);
    setSettingsError("");

    const updatedProfileData: Partial<Profile> = {
      profile_visibility: profileVisibility,
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
        if (onUpdateProfile) {
          onUpdateProfile(data.profile);
        }
        setSettingsSuccess(true);
        setTimeout(() => setSettingsSuccess(false), 3000);
      } else {
        setSettingsError(data.message || "Failed to update settings.");
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
      setSettingsError("Network error. Please try again.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus({ type: "", msg: "" });
    
    if (!currentPasswordInput || !newPasswordInput || !confirmPasswordInput) {
      setPasswordStatus({ type: "error", msg: "All fields are required" });
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordStatus({ type: "error", msg: "New passwords do not match" });
      return;
    }
    if (newPasswordInput.length < 6) {
      setPasswordStatus({ type: "error", msg: "Password must be at least 6 characters long" });
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          currentPassword: currentPasswordInput,
          newPassword: newPasswordInput,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPasswordStatus({ type: "success", msg: "Password updated successfully!" });
        setCurrentPasswordInput("");
        setNewPasswordInput("");
        setConfirmPasswordInput("");
      } else {
        setPasswordStatus({ type: "error", msg: data.error || "Incorrect current password." });
      }
    } catch (err) {
      console.error("Failed to change password", err);
      setPasswordStatus({ type: "error", msg: "Network error. Please try again." });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSwitchRole = async () => {
    setIsChangingRole(true);
    setRoleChangeSuccess(false);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });
      if (res.ok) {
        setRoleChangeSuccess(true);
        // Update user role locally
        user.role = selectedRole as any;
        localStorage.setItem("playfoliyo_user", JSON.stringify(user));
        setTimeout(() => {
          setRoleChangeSuccess(false);
        }, 3000);
      }
    } catch (err) {
      console.error("Failed to update role", err);
    } finally {
      setIsChangingRole(false);
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setIsReportModalOpen(false);
      setReportText("");
    }, 2000);
  };

  const handleBlockSubmit = () => {
    setBlockSuccess(true);
    setTimeout(() => {
      setBlockSuccess(false);
      setIsBlockModalOpen(false);
    }, 2000);
  };

  // Save helpers
  const handleSaveOverview = () => {
    const updatedMetrics = {
      ...metrics,
      date_of_birth: draftDob,
      jersey_number: draftJerseyNumber,
      playing_level: draftPlayingLevel,
      languages: draftLanguages,
      education_school: draftEducationSchool,
      education_degree: draftEducationDegree,
      education_years: draftEducationYears
    };

    const updatedProfile: Profile = {
      ...profile,
      bio: draftBio,
      position: draftPosition,
      location: draftLocation,
      age: draftAge,
      gender: draftGender,
      current_team: draftCurrentTeam,
      previous_teams: draftPrevTeams,
      height: draftHeight,
      weight: draftWeight,
      dominant_foot: draftDominantFoot,
      experience: draftExperience,
      rankings: draftRankings,
      contact_info: draftContactInfo,
      coaching_level: draftCoachingLevel,
      certifications: draftCertifications,
      facilities: draftFacilities,
      sports_offered: draftSportsOffered,
      organization: draftOrganization,
      region: draftRegion,
      sponsorship_areas: draftSponsorshipAreas,
      budget_range: draftBudgetRange,
      sport_metrics: updatedMetrics
    };

    if (onUpdateProfile) {
      onUpdateProfile(updatedProfile);
    }
    setIsEditingOverview(false);
  };

  const handleSaveStats = () => {
    const updatedProfile: Profile = {
      ...profile,
      sport: draftSports.join(", "),
      sport_metrics: draftSportMetrics
    };

    if (onUpdateProfile) {
      onUpdateProfile(updatedProfile);
    }
    setIsEditingStats(false);
  };

  const handleSaveAchievements = () => {
    const updatedMetrics = {
      ...metrics,
      gold_medals: draftGoldMedals,
      silver_medals: draftSilverMedals,
      mvp_awards: draftMvpAwards
    };

    const updatedProfile: Profile = {
      ...profile,
      achievements: draftAchievements,
      sport_metrics: updatedMetrics
    };

    if (onUpdateProfile) {
      onUpdateProfile(updatedProfile);
    }
    setIsEditingAchievements(false);
  };

  const startEditingAbout = () => {
    setDraftBio(profile.bio || "");
    setDraftLocation(profile.location || "");
    setDraftGender(profile.gender || "Male");
    setDraftHeight(profile.height || "");
    setDraftWeight(profile.weight || "");
    setDraftDominantFoot(profile.dominant_foot || "Right");
    setDraftExperience(profile.experience || "");
    setDraftRankings(profile.rankings || "");
    setDraftContactInfo(profile.contact_info || "");
    setDraftDob(metrics.date_of_birth || "");
    setDraftPlayingLevel(metrics.playing_level || "");
    setDraftLanguages(metrics.languages || "");
    setDraftEducationSchool(metrics.education_school || "");
    setDraftEducationDegree(metrics.education_degree || "");
    setDraftEducationYears(metrics.education_years || "");
    setDraftCoachingLevel(profile.coaching_level || "");
    setIsEditingAbout(true);
  };

  const handleSaveAbout = () => {
    const updatedMetrics = {
      ...metrics,
      date_of_birth: draftDob,
      playing_level: draftPlayingLevel,
      languages: draftLanguages,
      education_school: draftEducationSchool,
      education_degree: draftEducationDegree,
      education_years: draftEducationYears
    };

    const updatedProfile: Profile = {
      ...profile,
      bio: draftBio,
      location: draftLocation,
      gender: draftGender,
      height: draftHeight,
      weight: draftWeight,
      dominant_foot: draftDominantFoot,
      experience: draftExperience,
      rankings: draftRankings,
      contact_info: draftContactInfo,
      coaching_level: draftCoachingLevel,
      sport_metrics: updatedMetrics
    };

    if (onUpdateProfile) {
      onUpdateProfile(updatedProfile);
    }
    setIsEditingAbout(false);
  };

  const startEditingMedia = () => {
    setDraftHighlightUrl(metrics.highlight_url || "");
    setDraftHighlightTitle(metrics.highlight_title || "");
    setDraftPhotos(profile.photos || [
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=300",
      "https://images.unsplash.com/photo-1540747737956-378724044592?auto=format&fit=crop&q=80&w=300",
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=300",
      "https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&q=80&w=300"
    ]);
    setIsEditingMedia(true);
  };

  const handleSaveMedia = () => {
    const updatedMetrics = {
      ...metrics,
      highlight_url: draftHighlightUrl,
      highlight_title: draftHighlightTitle
    };

    const updatedProfile: Profile = {
      ...profile,
      photos: draftPhotos,
      sport_metrics: updatedMetrics
    };

    if (onUpdateProfile) {
      onUpdateProfile(updatedProfile);
    }
    setIsEditingMedia(false);
  };

  const startEditingConnections = () => {
    setDraftInstagramUrl(profile.instagram_url || "");
    setDraftTwitterUrl(profile.twitter_url || "");
    setDraftLinkedinUrl(profile.linkedin_url || "");
    setDraftConnections(profile.connections || [
      { name: "Coach Sanjay Ranade", role: "Elite Soccer Coach", location: "Nagpur, India", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150" },
      { name: "Priya Deshmukh", role: "National Gymnast", location: "Mumbai, Maharashtra", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" },
      { name: "Arjun Mehta", role: "Talent Scout", location: "Mumbai, India", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150" },
      { name: "Rohan Kulkarni", role: "Kabaddi Defender", location: "Nagpur, India", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" },
      { name: "Ananya Sharma", role: "Badminton Coach", location: "Pune, India", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150" },
      { name: "Rajesh Gaikwad", role: "Academy Director", location: "Nagpur, India", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150" }
    ]);
    setIsEditingConnections(true);
  };

  const handleSaveConnections = () => {
    const updatedProfile: Profile = {
      ...profile,
      instagram_url: draftInstagramUrl,
      twitter_url: draftTwitterUrl,
      linkedin_url: draftLinkedinUrl,
      connections: draftConnections
    };

    if (onUpdateProfile) {
      onUpdateProfile(updatedProfile);
    }
    setIsEditingConnections(false);
  };

  // Profile pic and cover uploads
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const url = await uploadMedia(file);
      const updatedProfile = {
        ...profile,
        cover_pic: url
      };
      if (onUpdateProfile) {
        onUpdateProfile(updatedProfile);
      }
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
      const updatedProfile = {
        ...profile,
        profile_pic: url
      };
      if (onUpdateProfile) {
        onUpdateProfile(updatedProfile);
      }
    } catch (err) {
      console.error("Profile picture upload error", err);
    } finally {
      setIsUploadingProfile(false);
    }
  };

  const handleDocUploadInline = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      
      const updatedProfile = {
        ...profile,
        documents: [...(profile.documents || []), newDoc]
      };
      
      if (onUpdateProfile) {
        onUpdateProfile(updatedProfile);
      }
      setNewDocName("");
    } catch (err) {
      console.error("Document upload error", err);
      setDocUploadError("Failed to upload document. Please try again.");
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleRemoveDocInline = (docId: string) => {
    const updatedProfile = {
      ...profile,
      documents: (profile.documents || []).filter(d => d.id !== docId)
    };
    if (onUpdateProfile) {
      onUpdateProfile(updatedProfile);
    }
  };

  // Extract stats with fallbacks from the image
  const matchesPlayed = metrics.matches_played || (isSeeded ? "18" : "0");
  const goals = metrics.goals || (isSeeded ? "6" : "0");
  const assists = metrics.assists || (isSeeded ? "7" : "0");
  const minutesPlayed = metrics.minutes_played || (isSeeded ? "1,324" : "0");
  const passAccuracy = metrics.pass_accuracy ? `${metrics.pass_accuracy}%` : (isSeeded ? "86%" : "0%");
  const shotsOnTarget = metrics.shots_on_target || (isSeeded ? "23" : "0");

  // Selected sports & active attribute sport state
  const selectedSports = profile.sport ? profile.sport.split(",").map(s => s.trim()).filter(Boolean) : [];
  const [activeAttrSport, setActiveAttrSport] = useState("");
  const currentAttrSport = activeAttrSport || selectedSports[0] || (isSeeded ? "Football" : "");

  // Sub tabs config
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "about", label: "About" },
    { id: "stats", label: "Stats" },
    { id: "media", label: "Media" },
    { id: "achievements", label: "Achievements" },
    { id: "documents", label: "Documents" },
    { id: "connections", label: "Connections" },
  ];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  // Mock player photos matching soccer theme in Nagpur/Indian colors
  const photos = profile.photos || (isSeeded ? [
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=300",
    "https://images.unsplash.com/photo-1540747737956-378724044592?auto=format&fit=crop&q=80&w=300",
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=300",
    "https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&q=80&w=300"
  ] : []);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl border border-slate-800 flex items-center space-x-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Profile link copied to clipboard!</span>
        </div>
      )}

      {/* COVER HEADER CONTAINER */}
      <div className="relative bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl min-h-[360px] md:min-h-[300px] flex flex-col justify-end">
        {/* Cover background image */}
        <div className="absolute inset-0 group">
          <img 
            src={profile.cover_pic || "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1200"} 
            alt="Cover" 
            className="w-full h-full object-cover opacity-45"
          />
          {/* Subtle vignette/gradient overcover for deep elite contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
          {isSelf && (
            <label className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-900 text-white rounded-xl px-3 py-1.5 text-xs font-bold border border-slate-700 cursor-pointer flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg">
              {isUploadingCover ? (
                <>
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5" />
                  <span>Change Cover</span>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" disabled={isUploadingCover} />
            </label>
          )}
        </div>

        {/* Dynamic Athletic Jersey Backdrop (Image "KARTIK 10" vibe) */}
        <div className="absolute right-8 md:right-16 bottom-0 top-0 w-1/3 hidden md:flex items-center justify-end opacity-10 select-none pointer-events-none">
          <div className="relative text-right">
            <span className="block font-black text-white text-7xl tracking-tighter uppercase opacity-30 leading-none">
              {user.name?.split(" ")[0] || "ATHLETE"}
            </span>
            <span className="block font-black text-white text-[10rem] tracking-tighter uppercase leading-none -mt-4 opacity-50 font-mono">
              {metrics.jersey_number || "10"}
            </span>
          </div>
        </div>

        {/* Athlete Info Header Content */}
        <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 z-10">
          {/* Left Avatar & text stack */}
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
            {/* White-bordered high-contrast circle avatar */}
            <div className="relative shrink-0 flex flex-col items-center group">
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-white overflow-hidden shadow-2xl bg-slate-900 relative">
                <img 
                  src={profile.profile_pic || "https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&q=80&w=200"} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                />
                {isSelf && (
                  <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {isUploadingProfile ? (
                      <Clock className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <Camera className="w-5 h-5 mb-1" />
                        <span className="text-[10px] font-black uppercase">Change</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleProfilePicUpload} className="hidden" disabled={isUploadingProfile} />
                  </label>
                )}
              </div>
              {/* Verified Ribbon centered right below */}
              <div className="absolute -bottom-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full flex items-center gap-1 shadow-lg border border-emerald-400">
                <CheckCircle className="w-3.5 h-3.5 fill-current text-white shrink-0" />
                <span>Verified</span>
              </div>
            </div>

            {/* Title Block */}
            <div className="space-y-2 mt-2 md:mt-0">
              <div className="flex items-center justify-center md:justify-start gap-2.5">
                <h1 className="text-2xl md:text-3.5xl font-black text-white tracking-tight leading-none">
                  {user.name}
                </h1>
                {/* Custom glowing verification badge */}
                <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white shrink-0 shadow-md">
                  <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 20 20">
                    <path d="M6.262 18.257a1 1 0 01-.762-.351l-4.5-5.5a1 1 0 011.524-1.293l3.645 4.456 9.387-11.73a1 1 0 111.568 1.256l-10.1 12.625a1 1 0 01-.762.338z" />
                  </svg>
                </div>
              </div>

              {/* Subtitles */}
              <p className="text-slate-200 text-sm font-semibold tracking-wide flex items-center justify-center md:justify-start gap-1.5">
                <span>{profile.sport || (isSeeded ? "Football" : "No sport specified")}</span>
                {(profile.position || isSeeded) && (
                  <>
                    <span className="text-slate-400">•</span>
                    <span className="text-blue-400">{profile.position || (isSeeded ? "Central Midfielder (CM)" : "")}</span>
                  </>
                )}
              </p>

              <p className="flex items-center justify-center md:justify-start gap-1.5 text-xs text-slate-300 font-medium">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>{profile.location || (isSeeded ? "Nagpur, Maharashtra, India" : "No location specified")}</span>
              </p>

              {/* Badges Row */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1.5">
                <span className="bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-1 rounded-xl text-[11px] font-bold text-white flex items-center gap-1.5 transition-colors">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>{profile.age ? `${profile.age} Years` : (isSeeded ? "21 Years" : "Age —")}</span>
                </span>
                <span className="bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-1 rounded-xl text-[11px] font-bold text-white flex items-center gap-1.5 transition-colors">
                  <Ruler className="w-3.5 h-3.5 text-amber-400" />
                  <span>{profile.height || (isSeeded ? "5'9'' (175 cm)" : "Height —")}</span>
                </span>
                <span className="bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-1 rounded-xl text-[11px] font-bold text-white flex items-center gap-1.5 transition-colors" title="Followers">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{profile.followers?.length || 0} Followers</span>
                </span>
                <span className="bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-1 rounded-xl text-[11px] font-bold text-white flex items-center gap-1.5 transition-colors" title="Following">
                  <Users className="w-3.5 h-3.5 text-sky-400" />
                  <span>{profile.following?.length || 0} Following</span>
                </span>
                {(profile.location || isSeeded) && (
                  <span className="bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-1 rounded-xl text-[11px] font-bold text-white flex items-center gap-1.5 transition-colors">
                    <span className="text-xs">🇮🇳</span>
                    <span>India</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2.5 mt-4 md:mt-0 w-full md:w-auto justify-center">
            {isSelf && onEdit ? (
              <button
                onClick={onEdit}
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4.5 py-2.5 rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <>
                {onFollowToggle && (
                  <button
                    onClick={onFollowToggle}
                    className={`font-extrabold text-xs px-4.5 py-2.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isFollowing
                        ? "bg-emerald-500 hover:bg-emerald-600 border-emerald-400 text-white shadow-md"
                        : "bg-white/10 hover:bg-white/20 border-white/20 text-white"
                    }`}
                  >
                    {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    <span>{isFollowing ? "Connected" : "Connect"}</span>
                  </button>
                )}
                {onSendMessage && (
                  <button
                    onClick={onSendMessage}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4.5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message</span>
                  </button>
                )}
              </>
            )}

            {isSelf && (
              <button
                onClick={() => setShowPrintCV(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                title="Export Athletic Scouting Resume (PDF)"
              >
                <Download className="w-3.5 h-3.5 text-white" />
                <span>Print CV</span>
              </button>
            )}

            <button
              onClick={handleShare}
              className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-xl border border-white/20 transition-all cursor-pointer"
              title="Share Profile CV"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {isSelf && (
              <div className="relative">
                <button
                  onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                  className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-xl border border-white/20 transition-all cursor-pointer flex items-center justify-center"
                  title="More Actions"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {isMoreMenuOpen && (
                  <>
                    {/* Overlay to close menu */}
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsMoreMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-20 text-left animate-in fade-in slide-in-from-top-2 duration-150">
                      {user.id === profile.user_id ? (
                        <>
                          <button
                            onClick={() => {
                              setIsSettingsModalOpen(true);
                              setIsMoreMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2"
                          >
                            <Sliders className="w-3.5 h-3.5 text-slate-400" />
                            <span>Settings</span>
                          </button>
                          <button
                            onClick={() => {
                              setShowPrintCV(true);
                              setIsMoreMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2"
                          >
                            <Download className="w-3.5 h-3.5 text-slate-400" />
                            <span>Print CV</span>
                          </button>
                          <button
                            onClick={() => {
                              handleShare();
                              setIsMoreMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2"
                          >
                            <Share2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>Share Profile</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setIsReportModalOpen(true);
                              setIsMoreMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                          >
                            <Shield className="w-3.5 h-3.5 text-rose-400" />
                            <span>Report Profile</span>
                          </button>
                          <button
                            onClick={() => {
                              setIsBlockModalOpen(true);
                              setIsMoreMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                            <span>Block User</span>
                          </button>
                          <div className="border-t border-slate-100 my-1"></div>
                          <button
                            onClick={() => {
                              setShowPrintCV(true);
                              setIsMoreMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2"
                          >
                            <Download className="w-3.5 h-3.5 text-slate-400" />
                            <span>Print CV</span>
                          </button>
                          <button
                            onClick={() => {
                              handleShare();
                              setIsMoreMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2"
                          >
                            <Share2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>Share Profile</span>
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* HORIZONTAL NAVIGATION TABS */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-2 shadow-xs overflow-x-auto scrollbar-none">
        <div className="flex space-x-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-4.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeSubTab === tab.id
                  ? "bg-blue-50 text-blue-600 shadow-xs border border-blue-100"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* DASHBOARD GRID SECTIONS */}
      {activeSubTab === "overview" && (
        <div className="space-y-6">
          {isSelf && (
            <div className="flex justify-between items-center bg-slate-50 border border-slate-200/60 p-4 rounded-2xl">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Profile Overview</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Manage bio, physical statistics, role-specific attributes and details.</p>
              </div>
              {!isEditingOverview ? (
                <button
                  onClick={startEditingOverview}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] uppercase tracking-wider px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer border border-blue-500"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Overview</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditingOverview(false)}
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-extrabold text-[11px] uppercase tracking-wider px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveOverview}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] uppercase tracking-wider px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer border border-blue-500"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Overview</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {isEditingOverview ? (
            <div className="bg-white border border-slate-200/80 rounded-2.5xl p-6 shadow-xs space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* General Bio */}
                <div className="md:col-span-3 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Biography & Philosophy</label>
                  <textarea
                    value={draftBio}
                    onChange={(e) => setDraftBio(e.target.value)}
                    rows={3}
                    placeholder="Tell us about your sports journey..."
                    className="w-full border border-slate-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Date of Birth */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Date of Birth</label>
                  <input
                    type="text"
                    value={draftDob}
                    onChange={(e) => setDraftDob(e.target.value)}
                    placeholder="03 Feb 2003"
                    className="w-full border border-slate-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Dominant Foot/Hand */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Dominant Foot / Hand</label>
                  <select
                    value={draftDominantFoot}
                    onChange={(e) => setDraftDominantFoot(e.target.value)}
                    className="w-full border border-slate-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="Right">Right</option>
                    <option value="Left">Left</option>
                    <option value="Both">Both / Ambidextrous</option>
                  </select>
                </div>

                {/* Position */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Position / Role</label>
                  <input
                    type="text"
                    value={draftPosition}
                    onChange={(e) => setDraftPosition(e.target.value)}
                    placeholder="Midfielder (CM)"
                    className="w-full border border-slate-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Current Club */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Current Club / Team</label>
                  <input
                    type="text"
                    value={draftCurrentTeam}
                    onChange={(e) => setDraftCurrentTeam(e.target.value)}
                    placeholder="Nagpur United FC"
                    className="w-full border border-slate-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Previous Clubs */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Previous Clubs / Teams</label>
                  <input
                    type="text"
                    value={draftPrevTeams}
                    onChange={(e) => setDraftPrevTeams(e.target.value)}
                    placeholder="Yavatmal FC, Nagpur Juniors"
                    className="w-full border border-slate-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Jersey Number */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Jersey Number</label>
                  <input
                    type="text"
                    value={draftJerseyNumber}
                    onChange={(e) => setDraftJerseyNumber(e.target.value)}
                    placeholder="10"
                    className="w-full border border-slate-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Playing Level */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Playing Level</label>
                  <input
                    type="text"
                    value={draftPlayingLevel}
                    onChange={(e) => setDraftPlayingLevel(e.target.value)}
                    placeholder="Semi-Professional"
                    className="w-full border border-slate-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Height */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Height</label>
                  <input
                    type="text"
                    value={draftHeight}
                    onChange={(e) => setDraftHeight(e.target.value)}
                    placeholder="5'9'' (175 cm)"
                    className="w-full border border-slate-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Weight */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Weight</label>
                  <input
                    type="text"
                    value={draftWeight}
                    onChange={(e) => setDraftWeight(e.target.value)}
                    placeholder="72 kg"
                    className="w-full border border-slate-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Age */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Age</label>
                  <input
                    type="text"
                    value={draftAge}
                    onChange={(e) => setDraftAge(e.target.value)}
                    placeholder="21"
                    className="w-full border border-slate-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Gender */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Gender</label>
                  <select
                    value={draftGender}
                    onChange={(e) => setDraftGender(e.target.value)}
                    className="w-full border border-slate-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other / Prefer not to say</option>
                  </select>
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Location</label>
                  <input
                    type="text"
                    value={draftLocation}
                    onChange={(e) => setDraftLocation(e.target.value)}
                    placeholder="Nagpur, Maharashtra, India"
                    className="w-full border border-slate-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Contact Info */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Contact Number / Email</label>
                  <input
                    type="text"
                    value={draftContactInfo}
                    onChange={(e) => setDraftContactInfo(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full border border-slate-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Experience */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Experience Years</label>
                  <input
                    type="text"
                    value={draftExperience}
                    onChange={(e) => setDraftExperience(e.target.value)}
                    placeholder="8 Years"
                    className="w-full border border-slate-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* National/State Rankings */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">National/State Rankings</label>
                  <input
                    type="text"
                    value={draftRankings}
                    onChange={(e) => setDraftRankings(e.target.value)}
                    placeholder="Rank #15 National Junior"
                    className="w-full border border-slate-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Languages */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Languages Spoken</label>
                  <input
                    type="text"
                    value={draftLanguages}
                    onChange={(e) => setDraftLanguages(e.target.value)}
                    placeholder="English, Hindi, Marathi"
                    className="w-full border border-slate-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Education School */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Education Institution</label>
                  <input
                    type="text"
                    value={draftEducationSchool}
                    onChange={(e) => setDraftEducationSchool(e.target.value)}
                    placeholder="Rashtrasant Tukadoji Maharaj Nagpur University"
                    className="w-full border border-slate-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Education Degree */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Education Degree</label>
                  <input
                    type="text"
                    value={draftEducationDegree}
                    onChange={(e) => setDraftEducationDegree(e.target.value)}
                    placeholder="Bachelor of Commerce (B.Com)"
                    className="w-full border border-slate-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Education Years */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Education Period</label>
                  <input
                    type="text"
                    value={draftEducationYears}
                    onChange={(e) => setDraftEducationYears(e.target.value)}
                    placeholder="2021 - 2024"
                    className="w-full border border-slate-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Coaching / Academy specific fields */}
                {user.role === "coach" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Coaching Certification Level</label>
                      <input
                        type="text"
                        value={draftCoachingLevel}
                        onChange={(e) => setDraftCoachingLevel(e.target.value)}
                        placeholder="AFC 'B' License"
                        className="w-full border border-slate-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Key Certifications</label>
                      <input
                        type="text"
                        value={draftCertifications}
                        onChange={(e) => setDraftCertifications(e.target.value)}
                        placeholder="AIFF Youth Coach, NSNIS Sports Coaching Diploma"
                        className="w-full border border-slate-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </>
                )}

                {user.role === "academy" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Academy Facilities</label>
                      <input
                        type="text"
                        value={draftFacilities}
                        onChange={(e) => setDraftFacilities(e.target.value)}
                        placeholder="2 Full-size Turf pitches, Gym, Physio Center"
                        className="w-full border border-slate-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Sports Offered</label>
                      <input
                        type="text"
                        value={draftSportsOffered}
                        onChange={(e) => setDraftSportsOffered(e.target.value)}
                        placeholder="Football, Cricket, Athletics"
                        className="w-full border border-slate-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </>
                )}

                {user.role === "sponsor" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Organization</label>
                      <input
                        type="text"
                        value={draftOrganization}
                        onChange={(e) => setDraftOrganization(e.target.value)}
                        placeholder="GMR Sports, Pune Steel"
                        className="w-full border border-slate-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Sponsorship Region</label>
                      <input
                        type="text"
                        value={draftRegion}
                        onChange={(e) => setDraftRegion(e.target.value)}
                        placeholder="Maharashtra, Central India"
                        className="w-full border border-slate-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Sponsorship Focus Areas</label>
                      <input
                        type="text"
                        value={draftSponsorshipAreas}
                        onChange={(e) => setDraftSponsorshipAreas(e.target.value)}
                        placeholder="Junior Football, Athletics Kits"
                        className="w-full border border-slate-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Budget Range</label>
                      <input
                        type="text"
                        value={draftBudgetRange}
                        onChange={(e) => setDraftBudgetRange(e.target.value)}
                        placeholder="₹2L - ₹10L per year"
                        className="w-full border border-slate-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </>
                )}

              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* PRIMARY COLUMN - LEFT SIDE (lg:col-span-8) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* ABOUT ME / ATHLETE BIOGRAPHY */}
                <div className="bg-white border border-slate-200/80 rounded-2.5xl p-6 shadow-xs space-y-4">
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    <span>Athlete Biography & Philosophy</span>
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {profile.bio || (isSeeded ? "Passionate athlete dedicated to excellence, continuous improvement, and representing team values with ultimate athletic discipline." : (isSelf ? "You haven't written a biography yet. Click edit to tell other athletes and recruiters about yourself!" : "No biography narrative added yet."))}
                  </p>

                  {/* Standardized Skills Tags */}
                  {profile.skills && profile.skills.length > 0 && (
                    <div className="pt-4 border-t border-slate-100 space-y-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Standardized Skills & Attributes</span>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="bg-blue-50/70 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-blue-100 uppercase tracking-wide"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* PERFORMANCE STATS CARD */}
                <div className="bg-white border border-slate-200/80 rounded-2.5xl p-6 shadow-xs space-y-5">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-500" />
                      <span>Performance Metrics & KPIs</span>
                    </h2>
                    <select className="border border-slate-200 rounded-xl px-2.5 py-1.5 text-[10px] font-extrabold text-slate-600 bg-slate-50 cursor-pointer outline-none focus:ring-1 focus:ring-blue-500">
                      <option>2024 Season</option>
                      <option>2023 Season</option>
                      <option>Career Total</option>
                    </select>
                  </div>

                  {/* Stats Bento Cards */}
                  <div className="space-y-4">
                    {(() => {
                      const selectedSports = profile.sport ? profile.sport.split(",").map(s => s.trim()).filter(Boolean) : [];
                      
                      if (selectedSports.length === 0) {
                        return (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                            <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl text-center space-y-1.5">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Matches Played</span>
                              <span className="text-2.5xl font-black text-slate-900 block tracking-tight leading-none">{matchesPlayed}</span>
                            </div>

                            <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl text-center space-y-1.5">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Goals</span>
                              <span className="text-2.5xl font-black text-slate-900 block tracking-tight leading-none text-blue-600">{goals}</span>
                            </div>

                            <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl text-center space-y-1.5">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Assists</span>
                              <span className="text-2.5xl font-black text-slate-900 block tracking-tight leading-none">{assists}</span>
                            </div>

                            <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl text-center space-y-1.5">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Minutes Played</span>
                              <span className="text-2.5xl font-black text-slate-900 block tracking-tight leading-none">{minutesPlayed}</span>
                            </div>

                            <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl text-center space-y-1.5">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Pass Accuracy</span>
                              <span className="text-2.5xl font-black text-slate-900 block tracking-tight leading-none text-emerald-600">{passAccuracy}</span>
                            </div>

                            <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl text-center space-y-1.5">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Shots on Target</span>
                              <span className="text-2.5xl font-black text-slate-900 block tracking-tight leading-none">{shotsOnTarget}</span>
                            </div>
                          </div>
                        );
                      }

                      return selectedSports.map((sportName) => {
                        const template = SportsMetricsService.getTemplateForSport(sportName);
                        const lowerSport = sportName.toLowerCase().trim();
                        const segmentDef = SPORT_SEGMENTS_MAP[lowerSport];

                        // Get values
                        const activeSegments: string[] = safeParseJson(metrics[`segments_${sportName}`], []);
                        const customStats: { key: string; value: string }[] = safeParseJson(metrics[`custom_stats_${sportName}`], []);

                        // Extract subfields to render
                        let subfieldsToRender: string[] = [];
                        if (segmentDef) {
                          if (segmentDef.subfields) {
                            activeSegments.forEach(seg => {
                              if (segmentDef.subfields?.[seg]) {
                                subfieldsToRender.push(...segmentDef.subfields[seg]);
                              }
                            });
                          }
                          if (segmentDef.defaultSubfields) {
                            subfieldsToRender.push(...segmentDef.defaultSubfields);
                          }
                        }
                        subfieldsToRender = Array.from(new Set(subfieldsToRender));

                        // Predefined template fields
                        const fields = template ? template.fields : [];

                        // Check if we have ANY entered metric value for this sport
                        const hasValues = fields.some(f => metrics[f.id] !== undefined && metrics[f.id] !== "") ||
                          subfieldsToRender.some(subName => {
                            const subFieldId = `subfield_${sportName}_${subName}`;
                            return metrics[subFieldId] !== undefined && metrics[subFieldId] !== "";
                          }) ||
                          customStats.length > 0;

                        return (
                          <div key={sportName} className="border-t border-slate-100 pt-5 first:border-0 first:pt-0 space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100">
                                {sportName}
                              </span>
                              {activeSegments.length > 0 && (
                                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide max-w-[180px] truncate">
                                  {activeSegments.join(" • ")}
                                </span>
                              )}
                            </div>

                            {!hasValues ? (
                              <div className="p-5 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center">
                                <p className="text-xs text-slate-400 italic font-semibold">No performance KPIs recorded yet for {sportName}.</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {/* Standard Template KPI Bento Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                  {fields.map((field) => {
                                    const val = metrics[field.id];
                                    if (val === undefined || val === "") return null;
                                    return (
                                      <div key={field.id} className="bg-slate-50/60 border border-slate-100 p-3.5 rounded-2xl text-center space-y-1 shadow-3xs">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{field.name}</span>
                                        <span className="text-lg font-black text-slate-800 block tracking-tight leading-none font-mono">
                                          {val} {field.unit || ""}
                                        </span>
                                      </div>
                                    );
                                  })}

                                  {/* Subfields */}
                                  {subfieldsToRender.map((subName) => {
                                    const subFieldId = `subfield_${sportName}_${subName}`;
                                    const val = metrics[subFieldId];
                                    if (val === undefined || val === "") return null;
                                    return (
                                      <div key={subName} className="bg-slate-50/60 border border-slate-100 p-3.5 rounded-2xl text-center space-y-1 shadow-3xs">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{subName}</span>
                                        <span className="text-lg font-black text-slate-800 block tracking-tight leading-none font-mono">
                                          {val}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Custom stats list */}
                                {customStats.length > 0 && (
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                                    {customStats.map((item) => (
                                      <div key={item.key} className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex items-center justify-between shadow-3xs">
                                        <div className="space-y-0.5 text-left">
                                          <span className="text-[8px] text-slate-400 font-bold block uppercase tracking-wider">{item.key}</span>
                                          <span className="text-sm text-slate-800 font-black font-mono">{item.value}</span>
                                        </div>
                                        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>

                  <button 
                    onClick={() => setActiveSubTab("stats")}
                    className="w-full text-center py-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-150 rounded-2xl text-xs font-bold text-blue-600 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>View Interactive Radar & Analytical Stats</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* CLUBS AND TEAMS (CAREER TIMELINE) */}
                <div className="bg-white border border-slate-200/80 rounded-2.5xl p-6 shadow-xs space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-500" />
                      <span>Career Clubs & Pathway</span>
                    </h2>
                    <button 
                      onClick={() => setActiveSubTab("about")}
                      className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      View Pathway
                    </button>
                  </div>

                  {(() => {
                    const currentTeam = profile.current_team || (isSeeded ? "Nagpur United FC" : "Independent Athlete");
                    const previousTeams = profile.previous_teams ? profile.previous_teams.split(",").map(t => t.trim()).filter(Boolean) : [];
                    const initials = currentTeam.split(" ").map(w => w[0]).join("").substring(0, 4).toUpperCase();
                    
                    return (
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-slate-50/40">
                          <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs border border-blue-200/50 shrink-0 font-mono">
                              {initials || "CLUB"}
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-slate-900">{currentTeam}</h4>
                              <p className="text-[10px] text-slate-500 font-semibold mt-1">
                                {profile.position || (isSeeded ? "Athlete" : "Independent Talent")} • Jan 2023 - Present
                              </p>
                            </div>
                          </div>
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[8px] font-black uppercase px-2.5 py-1 rounded-full shrink-0 select-none">
                            Current
                          </span>
                        </div>

                        {previousTeams.map((prev, pIdx) => {
                          const prevInitials = prev.split(" ").map(w => w[0]).join("").substring(0, 4).toUpperCase();
                          return (
                            <div key={pIdx} className="flex items-center justify-between p-4 border border-slate-100/70 rounded-2xl bg-slate-50/10">
                              <div className="flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-black text-xs border border-slate-200 shrink-0 font-mono">
                                  {prevInitials || "PREV"}
                                </div>
                                <div>
                                  <h4 className="text-xs font-extrabold text-slate-700">{prev}</h4>
                                  <p className="text-[10px] text-slate-400 font-semibold mt-1 font-sans">Former Club / Academy Pathway</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {/* ACHIEVEMENTS CARD */}
                <div className="bg-white border border-slate-200/80 rounded-2.5xl p-6 shadow-xs space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      <span>Honors & Achievements Cabinet</span>
                    </h2>
                    <button 
                      onClick={() => setActiveSubTab("achievements")}
                      className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      View Cabinet
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {(() => {
                      const rawAchievements = profile.achievements || "";
                      const achievementsList = rawAchievements
                        .split("\n")
                        .map(line => line.trim())
                        .filter(Boolean);

                      if (achievementsList.length > 0) {
                        return achievementsList.map((ach, idx) => {
                          let title = ach;
                          let subtitle = "";
                          if (ach.includes(":") || ach.includes("-")) {
                            const parts = ach.includes(":") ? ach.split(":") : ach.split("-");
                            title = parts[0].trim();
                            subtitle = parts.slice(1).join("-").trim();
                          }
                          return (
                            <div key={idx} className="flex items-start gap-3 bg-amber-50/20 border border-amber-100/50 p-3.5 rounded-2xl shadow-3xs">
                              <div className="p-2 bg-amber-100 text-amber-600 rounded-xl shrink-0">
                                <Trophy className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-black text-slate-900 leading-tight truncate">{title}</h4>
                                {subtitle && <p className="text-[10px] text-slate-500 font-semibold mt-1.5 truncate">{subtitle}</p>}
                              </div>
                            </div>
                          );
                        });
                      }

                      // Default Fallback
                      return (
                        <>
                          <div className="flex items-start gap-3 bg-amber-50/40 border border-amber-100/50 p-3.5 rounded-2xl shadow-3xs">
                            <div className="p-2 bg-amber-100 text-amber-600 rounded-xl shrink-0">
                              <Trophy className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-slate-900">Best Midfielder</h4>
                              <p className="text-[10px] text-slate-500 font-semibold mt-1">Nagpur District League 2024</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 bg-slate-50/80 border border-slate-100 p-3.5 rounded-2xl shadow-3xs">
                            <div className="p-2 bg-slate-200 text-slate-600 rounded-xl shrink-0">
                              <Trophy className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-slate-900">Champion</h4>
                              <p className="text-[10px] text-slate-500 font-semibold mt-1">Vidarbha Youth Cup 2023</p>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* EDUCATION CARD */}
                <div className="bg-white border border-slate-200/80 rounded-2.5xl p-6 shadow-xs space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      <span>Academic Background</span>
                    </h2>
                    <button 
                      onClick={() => setActiveSubTab("about")}
                      className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      View All
                    </button>
                  </div>

                  <div className="flex items-start gap-3.5 p-4 border border-slate-100 rounded-2xl bg-slate-50/30">
                    <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-black text-xs border border-orange-200/40 shrink-0">
                      🎓
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 leading-snug">
                        {metrics.education_school || (isSeeded ? "Rashtrasant Tukadoji Maharaj Nagpur University" : "Academic details not specified yet")}
                      </h4>
                      {(metrics.education_degree || isSeeded) && (
                        <p className="text-[10px] text-slate-500 font-semibold mt-1.5">
                          {metrics.education_degree || (isSeeded ? "Bachelor of Commerce (B.Com)" : "")} {metrics.education_years ? `• ${metrics.education_years}` : (isSeeded ? "• 2021 - 2024" : "")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* SECONDARY SIDEBAR - RIGHT SIDE (lg:col-span-4) */}
              <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
                
                {/* QUICK FACTS INDEX CARD */}
                <div className="bg-white border border-slate-200/80 rounded-2.5xl p-6 shadow-xs space-y-4">
                  <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest font-sans">Quick Facts</h2>
                  
                  <div className="space-y-4 pt-1">
                    <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-50">
                      <span className="text-slate-400 font-bold flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span>Date of Birth</span>
                      </span>
                      <span className="font-extrabold text-slate-800">{metrics.date_of_birth || (isSeeded ? "03 Feb 2003" : "—")}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-50">
                      <span className="text-slate-400 font-bold flex items-center gap-2">
                        <Flame className="w-4 h-4 text-blue-500" />
                        <span>Dominant Side</span>
                      </span>
                      <span className="font-extrabold text-slate-800">{profile.dominant_foot || (isSeeded ? "Right" : "—")}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-50">
                      <span className="text-slate-400 font-bold flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-500" />
                        <span>Position / Role</span>
                      </span>
                      <span className="font-extrabold text-slate-800">{profile.position || (isSeeded ? "Midfielder (CM)" : "—")}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-50">
                      <span className="text-slate-400 font-bold flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-blue-500" />
                        <span>Current Club</span>
                      </span>
                      <span className="font-extrabold text-slate-800 truncate max-w-[150px] text-right" title={profile.current_team || (isSeeded ? "Nagpur United FC" : "Independent Athlete")}>
                        {profile.current_team || (isSeeded ? "Nagpur United FC" : "Independent Athlete")}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-50">
                      <span className="text-slate-400 font-bold flex items-center gap-2">
                        <Award className="w-4 h-4 text-blue-500" />
                        <span>Jersey Number</span>
                      </span>
                      <span className="font-extrabold text-slate-800">{metrics.jersey_number || (isSeeded ? "10" : "—")}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-50">
                      <span className="text-slate-400 font-bold flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        <span>Playing Level</span>
                      </span>
                      <span className="font-extrabold text-slate-800">{metrics.playing_level || (isSeeded ? "Semi-Professional" : "—")}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-bold flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-500" />
                        <span>Languages</span>
                      </span>
                      <span className="font-extrabold text-slate-800 text-right truncate max-w-[130px]" title={metrics.languages || (isSeeded ? "English, Hindi" : "—")}>
                        {metrics.languages || (isSeeded ? "English, Hindi" : "—")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* HIGHLIGHT VIDEO BOX */}
                <div className="bg-white border border-slate-200/80 rounded-2.5xl p-6 shadow-xs space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest font-sans">Featured Highlight</h2>
                    <button 
                      onClick={() => setActiveSubTab("media")}
                      className="text-[10px] font-extrabold text-blue-600 hover:underline cursor-pointer"
                    >
                      All Media
                    </button>
                  </div>
                  
                  {metrics.highlight_url || isSeeded ? (
                    <>
                      <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 group border border-slate-100 shadow-sm cursor-pointer">
                        <img 
                          src={metrics.highlight_url || "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=400"} 
                          alt="Highlight Poster" 
                          className="w-full h-full object-cover opacity-80 group-hover:scale-102 transition-transform duration-300" 
                        />
                        <div className="absolute inset-0 bg-slate-950/20 flex items-center justify-center">
                          <div className="w-11 h-11 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-300">
                            <Play className="w-4.5 h-4.5 fill-current ml-0.5" />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-slate-800 truncate max-w-[180px]">{metrics.highlight_title || "Match Highlight vs Central FC"}</span>
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 shrink-0">
                          <span>2:34</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 border border-dashed border-slate-200 rounded-2xl text-center space-y-2 bg-slate-50/50">
                      <Play className="w-6 h-6 text-slate-300" />
                      <p className="text-[10px] text-slate-400 font-bold leading-normal">
                        No highlight video uploaded yet.
                      </p>
                      {isSelf && (
                        <button 
                          onClick={() => setActiveSubTab("media")}
                          className="text-[9px] font-black text-blue-600 uppercase tracking-wider hover:underline"
                        >
                          Upload Media
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* COMPACT MEDIA REEL GALLERY */}
                <div className="bg-white border border-slate-200/80 rounded-2.5xl p-6 shadow-xs space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest font-sans">Media Gallery</h2>
                    <button 
                      onClick={() => setActiveSubTab("media")}
                      className="text-[10px] font-extrabold text-blue-600 hover:underline cursor-pointer"
                    >
                      Full Gallery
                    </button>
                  </div>

                  {/* Media Sub-tabs */}
                  <div className="flex space-x-1 border-b border-slate-50 pb-2">
                    {["photos", "videos", "clips"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveMediaTab(tab)}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider transition-colors ${
                          activeMediaTab === tab
                            ? "bg-slate-900 text-white"
                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Grid Images */}
                  {activeMediaTab === "photos" && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {photos.map((src, i) => (
                        <div key={i} className="aspect-square rounded-xl overflow-hidden bg-slate-50 relative group cursor-pointer border border-slate-100">
                          <img src={src} alt="Media" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-slate-950/10 group-hover:bg-slate-950/30 transition-colors"></div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeMediaTab !== "photos" && (
                    <div className="aspect-video rounded-xl border border-slate-100 bg-slate-50 flex flex-col items-center justify-center p-4 text-center text-slate-400">
                      <Play className="w-7 h-7 mb-1.5 text-blue-500 stroke-2" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">No video clips loaded</span>
                    </div>
                  )}
                </div>

                {/* PROFILE VIEWS CARD WITH HIGH QUALITY SPARKLINE SVG */}
                <div className="bg-white border border-slate-200/80 rounded-2.5xl p-6 shadow-xs space-y-2">
                  <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest font-sans flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-slate-400" />
                    <span>Profile Views Tracker</span>
                  </h2>

                  <div className="pt-2">
                    <span className="text-3xl font-black text-slate-900 block tracking-tight leading-none">412</span>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-1.5 block">Unique views in last 30 days</span>
                  </div>

                  {/* Sparkline line spline SVG */}
                  <div className="h-16 w-full mt-4 overflow-hidden select-none">
                    <svg className="w-full h-full text-blue-500" viewBox="0 0 100 30" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 0 25 Q 15 15 25 22 T 50 10 T 75 18 T 100 12 L 100 30 L 0 30 Z"
                        fill="url(#viewsGradient)"
                      />
                      <path
                        d="M 0 25 Q 15 15 25 22 T 50 10 T 75 18 T 100 12"
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="100" cy="12" r="2" fill="#2563EB" className="animate-ping" />
                      <circle cx="100" cy="12" r="1.5" fill="#2563EB" />
                    </svg>
                  </div>
                </div>

                {/* CONNECT CARD FOR VISITORS */}
                {!isSelf && (
                  <div className="bg-white border border-slate-200/80 rounded-2.5xl p-6 shadow-xs space-y-4">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest font-sans">Connect</h2>
                    
                    <div className="grid grid-cols-2 gap-2.5">
                      {onFollowToggle && (
                        <button
                          onClick={onFollowToggle}
                          className={`font-black text-xs py-3 rounded-2xl flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                            isFollowing
                              ? "bg-emerald-500 hover:bg-emerald-600 border-emerald-400 text-white"
                              : "bg-blue-600 hover:bg-blue-700 border-blue-500 text-white shadow-md"
                          }`}
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>{isFollowing ? "Connected" : "Connect"}</span>
                        </button>
                      )}
                      
                      {onSendMessage && (
                        <button
                          onClick={onSendMessage}
                          className="bg-white hover:bg-slate-50 border border-slate-200 font-black text-xs py-3 rounded-2xl flex items-center justify-center gap-1.5 text-slate-700 transition-all cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Message</span>
                        </button>
                      )}
                    </div>

                    {/* Social Media Links row */}
                    <div className="flex justify-center gap-4 pt-3 border-t border-slate-100">
                      <a href={profile.instagram_url || "https://instagram.com"} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-rose-50 text-rose-600 rounded-full hover:scale-105 transition-transform" title="Instagram">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                        </svg>
                      </a>
                      <a href={profile.twitter_url || "https://twitter.com"} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-sky-50 text-sky-500 rounded-full hover:scale-105 transition-transform" title="Twitter">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                      </a>
                      <a href={profile.linkedin_url || "https://linkedin.com"} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-blue-50 text-blue-700 rounded-full hover:scale-105 transition-transform" title="LinkedIn">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                )}

              </div>

            </div>
      )}
    </div>
  )}

      {/* RENDER ACTIVE TAB VIEWS */}
      {activeSubTab === "about" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {isSelf && (
            <div className="md:col-span-12 flex justify-between items-center bg-slate-50 border border-slate-200/60 p-4 rounded-2xl mb-2">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Demographics, Bio & Education</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Manage biography, physical stats, languages, coaching records and university degrees.</p>
              </div>
              {!isEditingAbout ? (
                <button
                  onClick={startEditingAbout}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] uppercase tracking-wider px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer border border-blue-500"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Profile Details</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditingAbout(false)}
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-extrabold text-[11px] uppercase tracking-wider px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAbout}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] uppercase tracking-wider px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer border border-blue-500"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Details</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {isEditingAbout ? (
            <div className="md:col-span-12 bg-white border border-slate-200/80 rounded-2.5xl p-6 shadow-xs space-y-6">
              {/* Bio Card Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Athlete Biography & Philosophy</label>
                <textarea
                  value={draftBio}
                  onChange={(e) => setDraftBio(e.target.value)}
                  rows={3}
                  placeholder="Tell coaches, scouts, and teammates about yourself, your philosophy, and your journey..."
                  className="w-full border border-slate-200 p-3.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none font-medium bg-slate-50/50 resize-y"
                />
              </div>

              {/* Physical & Demographic Profile Inputs */}
              <div className="space-y-3.5 border-t border-slate-100 pt-5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Physical & Demographic Profile</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">Date of Birth</label>
                    <input
                      type="text"
                      value={draftDob}
                      onChange={(e) => setDraftDob(e.target.value)}
                      placeholder="e.g. 03 Feb 2003"
                      className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">Preferred Foot / Hand</label>
                    <input
                      type="text"
                      value={draftDominantFoot}
                      onChange={(e) => setDraftDominantFoot(e.target.value)}
                      placeholder="Right / Left"
                      className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">Height</label>
                    <input
                      type="text"
                      value={draftHeight}
                      onChange={(e) => setDraftHeight(e.target.value)}
                      placeholder="e.g. 5'9'' (175 cm)"
                      className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">Weight</label>
                    <input
                      type="text"
                      value={draftWeight}
                      onChange={(e) => setDraftWeight(e.target.value)}
                      placeholder="e.g. 72 kg"
                      className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">Gender</label>
                    <select
                      value={draftGender}
                      onChange={(e) => setDraftGender(e.target.value)}
                      className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none bg-white font-semibold text-slate-700"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Mixed">Mixed</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">Languages Spoken</label>
                    <input
                      type="text"
                      value={draftLanguages}
                      onChange={(e) => setDraftLanguages(e.target.value)}
                      placeholder="e.g. English, Hindi"
                      className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Career Background Details */}
              <div className="space-y-3.5 border-t border-slate-100 pt-5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Career Background & Contact</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">Playing Level</label>
                    <input
                      type="text"
                      value={draftPlayingLevel}
                      onChange={(e) => setDraftPlayingLevel(e.target.value)}
                      placeholder="e.g. Semi-Professional"
                      className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">Experience Years</label>
                    <input
                      type="text"
                      value={draftExperience}
                      onChange={(e) => setDraftExperience(e.target.value)}
                      placeholder="e.g. 8 Years"
                      className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">National/State Rankings</label>
                    <input
                      type="text"
                      value={draftRankings}
                      onChange={(e) => setDraftRankings(e.target.value)}
                      placeholder="e.g. Top 50 State Seed"
                      className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">Coaching Certification Level</label>
                    <input
                      type="text"
                      value={draftCoachingLevel}
                      onChange={(e) => setDraftCoachingLevel(e.target.value)}
                      placeholder="e.g. AIFF C-Licence"
                      className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">Location</label>
                    <input
                      type="text"
                      value={draftLocation}
                      onChange={(e) => setDraftLocation(e.target.value)}
                      placeholder="e.g. Nagpur, Maharashtra, India"
                      className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">Alternative Phone Contact</label>
                    <input
                      type="text"
                      value={draftContactInfo}
                      onChange={(e) => setDraftContactInfo(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Education Background */}
              <div className="space-y-3.5 border-t border-slate-100 pt-5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Academic Background (Education)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">School / University</label>
                    <input
                      type="text"
                      value={draftEducationSchool}
                      onChange={(e) => setDraftEducationSchool(e.target.value)}
                      placeholder="e.g. Nagpur University"
                      className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">Degree / Certification</label>
                    <input
                      type="text"
                      value={draftEducationDegree}
                      onChange={(e) => setDraftEducationDegree(e.target.value)}
                      placeholder="e.g. Bachelor of Commerce (B.Com)"
                      className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">Years Period</label>
                    <input
                      type="text"
                      value={draftEducationYears}
                      onChange={(e) => setDraftEducationYears(e.target.value)}
                      placeholder="e.g. 2021 - 2024"
                      className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="md:col-span-8 space-y-6">
                {/* Bio Card */}
                <div className="bg-white border border-slate-200/80 rounded-2.5xl p-6 shadow-xs space-y-4">
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    Athlete Biography & Philosophy
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
                    {profile.bio || (isSeeded ? "Passionate athlete dedicated to excellence, continuous improvement, and representing team values with ultimate athletic discipline." : (isSelf ? "You haven't written a biography yet. Click edit to tell other athletes and recruiters about yourself!" : "No biography narrative added yet."))}
                  </p>

                  {/* Standardized Skills Tags */}
                  {profile.skills && profile.skills.length > 0 && (
                    <div className="pt-4 border-t border-slate-100 space-y-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Standardized Skills & Attributes</span>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="bg-blue-50/70 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-blue-100 uppercase tracking-wide"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Demographics fact sheet */}
                <div className="bg-white border border-slate-200/80 rounded-2.5xl p-6 shadow-xs space-y-4">
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-blue-500" />
                    Physical & Demographic Profile
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Date of Birth</span>
                        <span className="text-xs font-bold text-slate-700">{metrics.date_of_birth || (isSeeded ? "03 Feb 2003" : "—")}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center gap-3">
                      <Flame className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Preferred Foot / Hand</span>
                        <span className="text-xs font-bold text-slate-700">{profile.dominant_foot || (isSeeded ? "Right" : "—")}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center gap-3">
                      <Ruler className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Height</span>
                        <span className="text-xs font-bold text-slate-700">{profile.height || (isSeeded ? "5'9'' (175 cm)" : "—")}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center gap-3">
                      <Activity className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Weight</span>
                        <span className="text-xs font-bold text-slate-700">{profile.weight || (isSeeded ? "72 kg" : "—")}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center gap-3">
                      <Heart className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Gender</span>
                        <span className="text-xs font-bold text-slate-700">{profile.gender || (isSeeded ? "Male" : "—")}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center gap-3">
                      <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Languages</span>
                        <span className="text-xs font-bold text-slate-700">{metrics.languages || (isSeeded ? "English, Hindi" : "—")}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Career details */}
                <div className="bg-white border border-slate-200/80 rounded-2.5xl p-6 shadow-xs space-y-4">
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-blue-500" />
                    Career Background & Level
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 bg-slate-50/30 rounded-xl border border-slate-100">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Playing Level</span>
                      <span className="text-xs font-bold text-slate-800 bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-md inline-block">
                        {metrics.playing_level || (isSeeded ? "Semi-Professional" : "—")}
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50/30 rounded-xl border border-slate-100">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Experience Years</span>
                      <span className="text-xs font-extrabold text-slate-800">{profile.experience ? `${profile.experience} Years` : (isSeeded ? "8 Years" : "—")}</span>
                    </div>

                    {profile.rankings && (
                      <div className="p-3.5 bg-slate-50/30 rounded-xl border border-slate-100">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">National/State Rankings</span>
                        <span className="text-xs font-extrabold text-slate-800">{profile.rankings}</span>
                      </div>
                    )}

                    {profile.coaching_level && (
                      <div className="p-3.5 bg-slate-50/30 rounded-xl border border-slate-100">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Coaching Cert Level</span>
                        <span className="text-xs font-extrabold text-slate-800">{profile.coaching_level}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="md:col-span-4 space-y-6">
                {/* Contact details Card */}
                <div className="bg-white border border-slate-200/80 rounded-2.5xl p-6 shadow-xs space-y-4">
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Contact Info</h2>
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center gap-3 text-xs">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-slate-600 font-medium break-all">{user.email}</span>
                    </div>
                    {profile.contact_info && (
                      <div className="flex items-center gap-3 text-xs border-t border-slate-100 pt-3">
                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-slate-600 font-medium">{profile.contact_info}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-xs border-t border-slate-100 pt-3">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-slate-600 font-medium">{profile.location || (isSeeded ? "Nagpur, Maharashtra, India" : "No location specified")}</span>
                    </div>
                  </div>
                </div>

                {/* School card */}
                <div className="bg-white border border-slate-200/80 rounded-2.5xl p-6 shadow-xs space-y-3">
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Education</h2>
                  <div className="flex items-start gap-3 p-3 bg-slate-50/30 border border-slate-100 rounded-xl">
                    <span className="text-lg shrink-0">🎓</span>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 leading-snug">
                        {metrics.education_school || (isSeeded ? "Rashtrasant Tukadoji Maharaj Nagpur University" : "Academic details not specified yet")}
                      </h4>
                      {(metrics.education_degree || isSeeded) && (
                        <p className="text-[9px] text-slate-500 font-semibold mt-0.5">
                          {metrics.education_degree || (isSeeded ? "Bachelor of Commerce (B.Com)" : "")} {metrics.education_years ? `• ${metrics.education_years}` : (isSeeded ? "• 2021 - 2024" : "")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeSubTab === "stats" && (
        <div className="space-y-6">
          {isSelf && (
            <div className="flex justify-between items-center bg-slate-50 border border-slate-200/60 p-4 rounded-2xl">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Performance Stats & KPIs</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Manage sports, metric template values, dimension scores, and custom records.</p>
              </div>
              {!isEditingStats ? (
                <button
                  onClick={startEditingStats}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] uppercase tracking-wider px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer border border-blue-500"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Stats & KPIs</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditingStats(false)}
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-extrabold text-[11px] uppercase tracking-wider px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveStats}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] uppercase tracking-wider px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer border border-blue-500"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Stats</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {isEditingStats ? (
            <div className="bg-white border border-slate-200/80 rounded-2.5xl p-6 shadow-xs space-y-6">
              
              {/* Sports Managed */}
              <div className="space-y-2 border-b border-slate-100 pb-5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Sports Played / Practiced (comma separated)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={draftSports.join(", ")}
                    onChange={(e) => setDraftSports(e.target.value.split(",").map(s => s.trim()))}
                    placeholder="Football, Cricket, Basketball"
                    className="w-full border border-slate-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none font-medium"
                  />
                </div>
                <p className="text-[10px] text-slate-400">Add multiple sports separated by commas (e.g. Cricket, Football (Soccer), Athletics (Track & Field)) to load their matching elite KPI fields.</p>
              </div>

              {/* Dynamic KPI fields based on listed sports */}
              <div className="space-y-6">
                {draftSports.filter(Boolean).map((sportName) => {
                  const template = SportsMetricsService.getTemplateForSport(sportName);
                  const fields = template ? template.fields : [];
                  const radarAttrs = SportsMetricsService.getPerformanceAttributesForSport(sportName);

                  // Safe retrieve custom stats array
                  const customStatsKey = `custom_stats_${sportName}`;
                  let customStatsArray: { key: string; value: string }[] = [];
                  if (draftSportMetrics[customStatsKey]) {
                    if (typeof draftSportMetrics[customStatsKey] === "string") {
                      customStatsArray = safeParseJson(draftSportMetrics[customStatsKey], []);
                    } else if (Array.isArray(draftSportMetrics[customStatsKey])) {
                      customStatsArray = draftSportMetrics[customStatsKey];
                    }
                  }

                  return (
                    <div key={sportName} className="border border-slate-100 rounded-2.5xl p-5 bg-slate-50/20 space-y-5">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>{sportName} KPIs & Attributes</span>
                        </span>
                      </div>

                      {/* Standard Fields */}
                      {fields.length > 0 && (
                        <div className="space-y-3.5">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Standard KPI Metrics</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {fields.map((field) => (
                              <div key={field.id} className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 block">{field.name} {field.unit ? `(${field.unit})` : ""}</label>
                                <input
                                  type={field.type === "number" ? "number" : "text"}
                                  value={draftSportMetrics[field.id] || ""}
                                  onChange={(e) => {
                                    setDraftSportMetrics({
                                      ...draftSportMetrics,
                                      [field.id]: e.target.value
                                    });
                                  }}
                                  placeholder={`Enter ${field.name}`}
                                  className="w-full border border-slate-200 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Radar Attribute Values */}
                      <div className="space-y-3.5 border-t border-slate-100/60 pt-4">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Performance Radar Scores (0 - 100%)</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {radarAttrs.map((attr) => {
                            const attrKey = `radar_${sportName}_${attr.id}`;
                            const val = draftSportMetrics[attrKey] !== undefined ? draftSportMetrics[attrKey] : attr.defaultVal;
                            return (
                              <div key={attr.id} className="space-y-1">
                                <div className="flex justify-between text-[10px] font-bold">
                                  <span className="text-slate-600">{attr.label}</span>
                                  <span className="text-slate-800 font-mono">{val}%</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={val}
                                    onChange={(e) => {
                                      setDraftSportMetrics({
                                        ...draftSportMetrics,
                                        [attrKey]: e.target.value
                                      });
                                    }}
                                    className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                                  />
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={val}
                                    onChange={(e) => {
                                      setDraftSportMetrics({
                                        ...draftSportMetrics,
                                        [attrKey]: e.target.value
                                      });
                                    }}
                                    className="w-12 border border-slate-200 text-center py-1 rounded-md text-[11px] font-bold font-mono outline-none"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Custom Added Records */}
                      <div className="space-y-3 border-t border-slate-100/60 pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Custom Stats & Milestones</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newCustomRecord = { key: "New Stat Key", value: "New Val" };
                              const nextArray = [...customStatsArray, newCustomRecord];
                              setDraftSportMetrics({
                                ...draftSportMetrics,
                                [customStatsKey]: nextArray
                              });
                            }}
                            className="text-[9px] font-black text-blue-600 uppercase tracking-wider flex items-center gap-1 hover:underline cursor-pointer font-sans"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Custom Stat</span>
                          </button>
                        </div>

                        {customStatsArray.length === 0 ? (
                          <p className="text-[10px] text-slate-400 italic font-semibold">No custom stats added yet. Add records like "Centuries Scored" or "Tackles Per Match".</p>
                        ) : (
                          <div className="space-y-2">
                            {customStatsArray.map((item, idx) => (
                              <div key={idx} className="flex gap-3 items-center bg-white p-3 border border-slate-100 rounded-xl shadow-3xs">
                                <input
                                  type="text"
                                  value={item.key}
                                  onChange={(e) => {
                                    const nextArray = [...customStatsArray];
                                    nextArray[idx] = { ...nextArray[idx], key: e.target.value };
                                    setDraftSportMetrics({
                                      ...draftSportMetrics,
                                      [customStatsKey]: nextArray
                                    });
                                  }}
                                  placeholder="Stat Label"
                                  className="w-1/2 border border-slate-200 px-3 py-1.5 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                                />
                                <input
                                  type="text"
                                  value={item.value}
                                  onChange={(e) => {
                                    const nextArray = [...customStatsArray];
                                    nextArray[idx] = { ...nextArray[idx], value: e.target.value };
                                    setDraftSportMetrics({
                                      ...draftSportMetrics,
                                      [customStatsKey]: nextArray
                                    });
                                  }}
                                  placeholder="Value"
                                  className="w-5/12 border border-slate-200 px-3 py-1.5 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextArray = customStatsArray.filter((_, subIdx) => subIdx !== idx);
                                    setDraftSportMetrics({
                                      ...draftSportMetrics,
                                      [customStatsKey]: nextArray
                                    });
                                  }}
                                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                                  title="Remove Stat"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          ) : (
            <>
              {/* Sport Selector Pills if multiple sports are chosen */}
              {selectedSports.length > 1 && (
                <div className="flex flex-wrap gap-2 pb-2">
                  {selectedSports.map((sp) => (
                    <button
                      key={sp}
                      onClick={() => setActiveAttrSport(sp)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        currentAttrSport === sp
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                          : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {sp}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: KPI Values & Custom Records */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white border border-slate-200/80 rounded-2.5xl p-6 shadow-xs space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider font-sans flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-blue-500" />
                    <span>{currentAttrSport} KPI Template Values</span>
                  </h2>
                </div>
                
                {(() => {
                  const template = SportsMetricsService.getTemplateForSport(currentAttrSport);
                  if (!template) {
                    return (
                      <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center">
                        <p className="text-[10px] text-slate-400 italic font-semibold">No standard KPIs available for {currentAttrSport}.</p>
                      </div>
                    );
                  }

                  const fields = template.fields;
                  const segmentDef = SPORT_SEGMENTS_MAP[currentAttrSport.toLowerCase().trim()];
                  let subfieldsToRender: string[] = [];
                  if (segmentDef) {
                    const activeSegmentsStr = metrics[`segments_${currentAttrSport}`];
                    const activeSegments: string[] = activeSegmentsStr ? safeParseJson(activeSegmentsStr, []) : [];
                    activeSegments.forEach(seg => {
                      const extraFields = segmentDef.subfields?.[seg];
                      if (extraFields) {
                        subfieldsToRender.push(...extraFields);
                      }
                    });
                    if (segmentDef.defaultSubfields) {
                      subfieldsToRender.push(...segmentDef.defaultSubfields);
                    }
                  }
                  subfieldsToRender = Array.from(new Set(subfieldsToRender));

                  const customStatsStr = metrics[`custom_stats_${currentAttrSport}`];
                  const customStats: { key: string; value: string }[] = customStatsStr ? safeParseJson(customStatsStr, []) : [];

                  const hasStandardFields = fields.some(f => metrics[f.id] !== undefined && metrics[f.id] !== "");
                  const hasSubfields = subfieldsToRender.some(subName => {
                    const subFieldId = `subfield_${currentAttrSport}_${subName}`;
                    return metrics[subFieldId] !== undefined && metrics[subFieldId] !== "";
                  });

                  if (!hasStandardFields && !hasSubfields && customStats.length === 0) {
                    return (
                      <p className="text-xs text-slate-400 italic text-center p-6 font-medium">No performance metrics or scores recorded yet.</p>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {fields.map((field) => {
                          const val = metrics[field.id];
                          if (val === undefined || val === "") return null;
                          return (
                            <div key={field.id} className="bg-slate-50/60 border border-slate-100 p-3.5 rounded-xl text-center space-y-1 shadow-2xs">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">{field.name}</span>
                              <span className="text-xs font-black text-slate-800 block tracking-tight leading-none font-mono">
                                {val} {field.unit || ""}
                              </span>
                            </div>
                          );
                        })}

                        {subfieldsToRender.map((subName) => {
                          const subFieldId = `subfield_${currentAttrSport}_${subName}`;
                          const val = metrics[subFieldId];
                          if (val === undefined || val === "") return null;
                          return (
                            <div key={subName} className="bg-slate-50/60 border border-slate-100 p-3.5 rounded-xl text-center space-y-1 shadow-2xs">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">{subName}</span>
                              <span className="text-xs font-black text-slate-800 block tracking-tight leading-none font-mono">
                                {val}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {customStats.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Custom Added Records</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {customStats.map((item) => (
                              <div key={item.key} className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center justify-between shadow-3xs">
                                <div className="space-y-0.5 text-left">
                                  <span className="text-[8px] text-slate-400 font-bold block uppercase tracking-wider">{item.key}</span>
                                  <span className="text-xs text-slate-800 font-black font-mono">{item.value}</span>
                                </div>
                                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* RIGHT COLUMN: Scout Performance Radar Chart */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-slate-200/80 rounded-2.5xl p-6 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-blue-500" />
                    <span>Scout Performance Radar</span>
                  </h2>
                  <p className="text-[10px] text-slate-400 font-medium mt-1 leading-normal">
                    This radar plots athletic performance metrics specifically tailored for <b>{currentAttrSport}</b>.
                  </p>
                </div>

                {/* Render the Radar Chart */}
                {(() => {
                  const attrs = SportsMetricsService.getPerformanceAttributesForSport(currentAttrSport);
                  const radarData = attrs.map((attr) => {
                    const attrKey = `radar_${currentAttrSport}_${attr.id}`;
                    const val = metrics[attrKey] !== undefined ? Number(metrics[attrKey]) : Number(attr.defaultVal);
                    return {
                      label: attr.label,
                      value: val
                    };
                  });

                  return (
                    <div className="space-y-4">
                      <div className="flex justify-center py-2 bg-slate-50/50 border border-slate-100 rounded-2xl">
                        <RadarChart data={radarData} size={250} />
                      </div>

                      {/* Legends/List of Values below the Radar Chart */}
                      <div className="space-y-2.5 pt-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Radar Dimension Scores</span>
                        <div className="grid grid-cols-1 gap-2">
                          {radarData.map((dataPoint) => (
                            <div key={dataPoint.label} className="flex items-center justify-between text-xs bg-slate-50/30 border border-slate-100 p-2 rounded-xl">
                              <span className="font-semibold text-slate-600">{dataPoint.label}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 bg-slate-100 rounded-full h-1.5 hidden sm:block">
                                  <div 
                                    className="bg-blue-600 h-1.5 rounded-full" 
                                    style={{ width: `${dataPoint.value}%` }}
                                  ></div>
                                </div>
                                <span className="font-extrabold text-slate-800 font-mono text-right shrink-0 w-8">{dataPoint.value}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
            </div>
          </div>
        </div>
      </>
    )}
  </div>
)}

      {activeSubTab === "media" && (
        <div className="space-y-6">
          {isSelf && (
            <div className="flex justify-between items-center bg-slate-50 border border-slate-200/60 p-4 rounded-2xl">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Highlight Reels & Photos</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Manage video highlight clips and photo galleries of your matches and training.</p>
              </div>
              {!isEditingMedia ? (
                <button
                  onClick={startEditingMedia}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] uppercase tracking-wider px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer border border-blue-500"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Media Clips</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditingMedia(false)}
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-extrabold text-[11px] uppercase tracking-wider px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveMedia}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] uppercase tracking-wider px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer border border-blue-500"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Media</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {isEditingMedia ? (
            <div className="bg-white border border-slate-200/80 rounded-2.5xl p-6 shadow-xs space-y-6">
              {/* Highlight Reel Editing */}
              <div className="space-y-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Feature Highlight Video / Banner</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">Highlight Title</label>
                    <input
                      type="text"
                      value={draftHighlightTitle}
                      onChange={(e) => setDraftHighlightTitle(e.target.value)}
                      placeholder="e.g. Official Tournament Highlight Reel"
                      className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">Cover / Media URL</label>
                    <input
                      type="text"
                      value={draftHighlightUrl}
                      onChange={(e) => setDraftHighlightUrl(e.target.value)}
                      placeholder="e.g. https://images.unsplash.com/photo-..."
                      className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Photos Gallery Management */}
              <div className="space-y-4 border-t border-slate-100 pt-5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Manage Photo Gallery</span>
                
                {/* Upload or Add URL Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-150">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">Option A: Upload Image File</label>
                    <label className="w-full h-10 border border-dashed border-slate-300 hover:border-blue-400 rounded-xl flex items-center justify-center gap-1.5 text-xs text-slate-500 cursor-pointer bg-white transition-colors">
                      <Upload className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold">Choose photo file</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const url = await uploadMedia(file);
                            setDraftPhotos([...draftPhotos, url]);
                          } catch (err) {
                            console.error("Gallery file upload error", err);
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">Option B: Add via Image URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newPhotoUrl}
                        onChange={(e) => setNewPhotoUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full border border-slate-200 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newPhotoUrl.trim()) {
                            setDraftPhotos([...draftPhotos, newPhotoUrl.trim()]);
                            setNewPhotoUrl("");
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 rounded-xl cursor-pointer shrink-0"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Display draft photos for visual deletion */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  {draftPhotos.map((src, idx) => (
                    <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-slate-50 relative group border border-slate-200">
                      <img src={src} alt="Draft Gallery" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setDraftPhotos(draftPhotos.filter((_, subIdx) => subIdx !== idx));
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-transform hover:scale-105 cursor-pointer shadow-md"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Dynamic Highlight Reels Carousel & Interactive Player */}
              <HighlightReels
                user={user}
                profile={profile}
                isSelf={isSelf}
                onUpdateProfile={(updated) => {
                  if (onUpdateProfile) {
                    onUpdateProfile(updated);
                  }
                }}
              />

              {/* Photo Gallery Grid */}
              <div className="bg-white border border-slate-200/80 rounded-2.5xl p-6 shadow-xs space-y-4">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Training & Competition Photo Gallery</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {photos.map((src, i) => (
                    <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-slate-50 relative group cursor-pointer border border-slate-150 shadow-sm">
                      <img src={src} alt="Gallery" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-slate-950/10 group-hover:bg-slate-950/40 transition-colors flex items-end p-3 opacity-0 group-hover:opacity-100 duration-200">
                        <span className="text-[9px] font-bold text-white uppercase tracking-wider">Nagpur Season {2024 - i}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeSubTab === "achievements" && (
        <div className="space-y-6">
          {isSelf && (
            <div className="flex justify-between items-center bg-slate-50 border border-slate-200/60 p-4 rounded-2xl">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Achievements & Cabinet</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Manage medals, honors, MVP awards, and achievements log entries.</p>
              </div>
              {!isEditingAchievements ? (
                <button
                  onClick={startEditingAchievements}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] uppercase tracking-wider px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer border border-blue-500"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Cabinet</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditingAchievements(false)}
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-extrabold text-[11px] uppercase tracking-wider px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAchievements}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] uppercase tracking-wider px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer border border-blue-500"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Cabinet</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {isEditingAchievements ? (
            <div className="bg-white border border-slate-200/80 rounded-2.5xl p-6 shadow-xs space-y-6">
              
              {/* Medal Cabinet */}
              <div className="space-y-3.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Medal Cabinet Counts</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  <div className="space-y-1.5 bg-amber-50/30 border border-amber-100 p-4 rounded-2xl">
                    <label className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">🥇 Gold Medals Count</label>
                    <input
                      type="text"
                      value={draftGoldMedals}
                      onChange={(e) => setDraftGoldMedals(e.target.value)}
                      placeholder="4"
                      className="w-full border border-slate-200 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500 bg-white font-bold"
                    />
                  </div>

                  <div className="space-y-1.5 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">🥈 Silver Medals Count</label>
                    <input
                      type="text"
                      value={draftSilverMedals}
                      onChange={(e) => setDraftSilverMedals(e.target.value)}
                      placeholder="2"
                      className="w-full border border-slate-200 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500 bg-white font-bold"
                    />
                  </div>

                  <div className="space-y-1.5 bg-orange-50/30 border border-orange-100 p-4 rounded-2xl">
                    <label className="text-[10px] font-bold text-orange-800 uppercase tracking-wider block">🏆 MVP Awards Count</label>
                    <input
                      type="text"
                      value={draftMvpAwards}
                      onChange={(e) => setDraftMvpAwards(e.target.value)}
                      placeholder="3"
                      className="w-full border border-slate-200 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500 bg-white font-bold"
                    />
                  </div>

                </div>
              </div>

              {/* Achievements Log */}
              <div className="space-y-3 border-t border-slate-100 pt-5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Achievements Log Entries</span>
                  <button
                    type="button"
                    onClick={() => {
                      const achievementsList = draftAchievements.split("\n").filter(Boolean);
                      achievementsList.push("New Achievement: Enter description here");
                      setDraftAchievements(achievementsList.join("\n"));
                    }}
                    className="text-[9px] font-black text-blue-600 uppercase tracking-wider flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Entry</span>
                  </button>
                </div>

                {(() => {
                  const achievementsList = draftAchievements.split("\n").filter(Boolean);
                  return (
                    <div className="space-y-3">
                      {achievementsList.map((ach, idx) => (
                        <div key={idx} className="flex gap-3 items-center bg-slate-50/50 p-3.5 border border-slate-100 rounded-2xl shadow-3xs">
                          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                            <Trophy className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            value={ach}
                            onChange={(e) => {
                              const list = [...achievementsList];
                              list[idx] = e.target.value;
                              setDraftAchievements(list.join("\n"));
                            }}
                            placeholder="e.g. Best Player Award: District League 2024"
                            className="w-full border border-slate-200 px-3 py-2 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500 font-medium bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const list = achievementsList.filter((_, subIdx) => subIdx !== idx);
                              setDraftAchievements(list.join("\n"));
                            }}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                            title="Remove Entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {achievementsList.length === 0 && (
                        <p className="text-xs text-slate-400 italic font-semibold text-center py-4 bg-slate-50 border border-dashed rounded-2xl">No achievement log entries yet. Click "Add Entry" to log titles, prizes and honors.</p>
                      )}
                    </div>
                  );
                })()}
              </div>

            </div>
          ) : (
            <>
              <div className="bg-white border border-slate-200/80 rounded-2.5xl p-6 shadow-xs space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-blue-500" />
                    Medal Cabinet & Honors
                  </h2>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2.5 py-1 rounded-lg border border-amber-200">
                    District Elite
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl shrink-0">
                      🥇
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-amber-700 uppercase tracking-wider block">Gold Medals</span>
                      <span className="text-lg font-black text-slate-800 font-sans">{metrics.gold_medals || "4"} Titles</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50/50 border border-slate-150 rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-xl shrink-0">
                      🥈
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Silver Medals</span>
                      <span className="text-lg font-black text-slate-800 font-sans">{metrics.silver_medals || "2"} Titles</span>
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50/40 border border-orange-100 rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl shrink-0">
                      🏆
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-orange-700 uppercase tracking-wider block">Tournament MVP</span>
                      <span className="text-lg font-black text-slate-800 font-sans">{metrics.mvp_awards || "3"} Awards</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* List of custom typed achievements */}
              <div className="bg-white border border-slate-200/80 rounded-2.5xl p-6 shadow-xs space-y-4">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Achievements Log</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(() => {
                    const rawAchievements = profile.achievements || "";
                    const achievementsList = rawAchievements
                      .split("\n")
                      .map(line => line.trim())
                      .filter(Boolean);

                    if (achievementsList.length > 0) {
                      return achievementsList.map((ach, idx) => {
                        let title = ach;
                        let subtitle = "";
                        if (ach.includes(":") || ach.includes("-")) {
                          const parts = ach.includes(":") ? ach.split(":") : ach.split("-");
                          title = parts[0].trim();
                          subtitle = parts.slice(1).join("-").trim();
                        }
                        return (
                          <div key={idx} className="flex items-start gap-3 bg-slate-50/50 border border-slate-100 p-4 rounded-xl shadow-2xs">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                              <Trophy className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-slate-900 leading-tight">{title}</h4>
                              {subtitle && <p className="text-[10px] text-slate-500 font-semibold mt-1">{subtitle}</p>}
                            </div>
                          </div>
                        );
                      });
                    }

                    return (
                      <>
                        <div className="flex items-start gap-3 bg-amber-50/40 border border-amber-100/50 p-4 rounded-xl shadow-2xs">
                          <div className="p-2 bg-amber-100 text-amber-600 rounded-lg shrink-0">
                            <Trophy className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-900 leading-tight">Best Player / MVP</h4>
                            <p className="text-[10px] text-slate-500 font-semibold mt-1">Nagpur District Premier League 2024</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 bg-slate-50/80 border border-slate-100 p-4 rounded-xl shadow-2xs">
                          <div className="p-2 bg-slate-200 text-slate-600 rounded-lg shrink-0">
                            <Trophy className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-900 leading-tight">Inter-State Championship Champion</h4>
                            <p className="text-[10px] text-slate-500 font-semibold mt-1">Vidarbha State Youth Cup 2023</p>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeSubTab === "documents" && (
        <div className="space-y-6">
          {/* Privacy warning safeguard banner */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4.5 flex gap-3 shadow-3xs">
            <span className="text-lg shrink-0 select-none">⚠️</span>
            <div className="text-xs text-amber-800 leading-relaxed font-semibold">
              <p className="font-extrabold uppercase tracking-wide text-[10px]">Privacy & Security Safeguard:</p>
              <p className="mt-1 font-medium">Please <b>DO NOT upload government identity cards (such as Aadhaar Card, Passport, PAN Card, etc.)</b> to this public area. This section is strictly reserved for athletic achievements, federation licenses, coaching certificates, and professional performance logs.</p>
            </div>
          </div>

          {/* Secure inline file uploader for own profile */}
          {isSelf && (
            <div className="bg-white border border-slate-200/80 rounded-2.5xl p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-blue-500 animate-pulse" />
                  <span>Upload Athletic Credentials</span>
                </h3>
                <p className="text-[10px] text-slate-400 font-medium mt-1">Showcase verifiable certificates, state-association licenses, and athletic logs.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Document / Certificate Name</label>
                  <input
                    type="text"
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    placeholder="e.g. State Championship Gold Medal"
                    className="w-full border border-slate-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none font-medium bg-slate-50/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Credential Category</label>
                  <select
                    value={newDocType}
                    onChange={(e) => setNewDocType(e.target.value)}
                    className="w-full border border-slate-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none font-bold bg-white"
                  >
                    <option value="Certificate">Certificate</option>
                    <option value="Federation License">Federation License</option>
                    <option value="Performance Log">Performance Log</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="relative overflow-hidden">
                  <button
                    type="button"
                    disabled={isUploadingDoc}
                    className="bg-slate-900 hover:bg-slate-950 disabled:opacity-50 text-white text-xs font-extrabold uppercase tracking-wider px-5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isUploadingDoc ? "Uploading..." : "Select & Upload File"}</span>
                  </button>
                  <input
                    type="file"
                    onChange={handleDocUploadInline}
                    className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    disabled={isUploadingDoc}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-semibold italic">Supported: PDF, JPEG, PNG</span>
              </div>

              {docUploadError && (
                <div className="text-xs text-rose-600 font-extrabold bg-rose-50 border border-rose-100 p-3.5 rounded-xl leading-relaxed">
                  {docUploadError}
                </div>
              )}
            </div>
          )}

          <div className="bg-white border border-slate-200/80 rounded-2.5xl p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-500" />
                Verified Athletic Credentials
              </h2>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider select-none">
                Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {(() => {
                const docList = profile.documents || [];
                if (docList.length > 0) {
                  return docList.map((doc) => (
                    <div key={doc.id} className="p-4 border border-slate-100 bg-slate-50/40 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2.5 rounded-xl shrink-0 ${
                          doc.type === "Certificate" ? "bg-amber-50 text-amber-600" :
                          doc.type === "Federation License" ? "bg-blue-50 text-blue-600" :
                          doc.type === "Performance Log" ? "bg-purple-50 text-purple-600" :
                          "bg-slate-50 text-slate-600"
                        }`}>
                          <Award className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-slate-800 leading-snug truncate" title={doc.name}>{doc.name}</h4>
                          <span className="text-[9px] font-bold text-slate-400 block mt-0.5 uppercase tracking-wider">{doc.type}</span>
                          {doc.file_name && <span className="text-[8px] font-semibold text-slate-400 block truncate mt-0.5">{doc.file_name}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {doc.file_url && (
                          <a 
                            href={doc.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-[10px] text-blue-600 font-extrabold hover:underline cursor-pointer shrink-0"
                          >
                            View
                          </a>
                        )}
                        {isSelf && (
                          <button
                            type="button"
                            onClick={() => handleRemoveDocInline(doc.id)}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-500 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
                            title="Remove Document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ));
                }

                // Default Fallbacks (without Aadhaar card)
                return (
                  <>
                    <div className="p-4 border border-slate-100 bg-slate-50/40 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl shrink-0">
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800 leading-none">State Association License</h4>
                          <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider mt-1 block">Registered</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">Standard</span>
                    </div>

                    <div className="p-4 border border-slate-100 bg-slate-50/40 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                          <Shield className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800 leading-none">Federation Athlete ID</h4>
                          <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider mt-1 block">Active Registration</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">Standard</span>
                    </div>

                    <div className="p-4 border border-slate-100 bg-slate-50/40 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl shrink-0">
                          <Trophy className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800 leading-none">Scouting Performance Log</h4>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1 block font-sans">Pending Verification</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">Standard</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Export card */}
          <div className="bg-slate-900 text-white rounded-2.5xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest block font-sans">Exporter Module</span>
              <h3 className="text-sm font-black uppercase tracking-wider font-sans">Generate Verified Athletic CV</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                Compile your sport-specific disciplines, apparatus scores, radar charts, bio and media links into a single, printable Scout PDF.
              </p>
            </div>
            <button 
              onClick={() => window.print()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-lg cursor-pointer border border-blue-500"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Sports CV</span>
            </button>
          </div>
        </div>
      )}

      {activeSubTab === "connections" && (
        <div className="space-y-6">
          {isSelf && (
            <div className="flex justify-between items-center bg-slate-50 border border-slate-200/60 p-4 rounded-2xl">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Scouting & Athlete Network</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Manage your social handle links and featured connections in your scouting network.</p>
              </div>
              {!isEditingConnections ? (
                <button
                  onClick={startEditingConnections}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] uppercase tracking-wider px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer border border-blue-500"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Connections</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditingConnections(false)}
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-extrabold text-[11px] uppercase tracking-wider px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveConnections}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] uppercase tracking-wider px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer border border-blue-500"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Network</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {isEditingConnections ? (
            <div className="bg-white border border-slate-200/80 rounded-2.5xl p-6 shadow-xs space-y-6">
              {/* Social Media Link Editing */}
              <div className="space-y-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Social Media Profiles</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">Instagram Handle / URL</label>
                    <input
                      type="text"
                      value={draftInstagramUrl}
                      onChange={(e) => setDraftInstagramUrl(e.target.value)}
                      placeholder="e.g. https://instagram.com/athlete"
                      className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">Twitter / X Handle / URL</label>
                    <input
                      type="text"
                      value={draftTwitterUrl}
                      onChange={(e) => setDraftTwitterUrl(e.target.value)}
                      placeholder="e.g. https://twitter.com/athlete"
                      className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">LinkedIn Handle / URL</label>
                    <input
                      type="text"
                      value={draftLinkedinUrl}
                      onChange={(e) => setDraftLinkedinUrl(e.target.value)}
                      placeholder="e.g. https://linkedin.com/in/athlete"
                      className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Manage Network Connections List */}
              <div className="space-y-4 border-t border-slate-100 pt-5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Featured Connections</span>
                
                {/* Form to add a new connection */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-3">
                  <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block">Add New Network Connection</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <input
                      type="text"
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      placeholder="Contact Name (e.g. Sunil Gavaskar)"
                      className="border border-slate-200 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none bg-white font-semibold"
                    />
                    <input
                      type="text"
                      value={newContactRoleField}
                      onChange={(e) => setNewContactRoleField(e.target.value)}
                      placeholder="Role (e.g. Head Scout)"
                      className="border border-slate-200 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                    />
                    <input
                      type="text"
                      value={newContactRole}
                      onChange={(e) => setNewContactLocation(e.target.value)}
                      placeholder="Location (e.g. Mumbai, India)"
                      className="border border-slate-200 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newContactAvatar}
                        onChange={(e) => setNewContactAvatar(e.target.value)}
                        placeholder="Avatar URL (Optional)"
                        className="border border-slate-200 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none bg-white w-full"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newContactName.trim()) {
                            const newConn = {
                              name: newContactName.trim(),
                              role: newContactRoleField.trim() || "Network Member",
                              location: newContactRole.trim() || "India",
                              avatar: newContactAvatar.trim() || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"
                            };
                            setDraftConnections([...draftConnections, newConn]);
                            setNewContactName("");
                            setNewContactRoleField("");
                            setNewContactLocation("");
                            setNewContactAvatar("");
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 rounded-xl cursor-pointer shrink-0"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Display draft connections list with delete buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  {draftConnections.map((networkUser, idx) => (
                    <div key={idx} className="p-4 border border-slate-150 bg-white rounded-2xl flex items-center justify-between gap-3 shadow-2xs relative">
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={networkUser.avatar} alt={networkUser.name} className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0" />
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-slate-800 leading-tight truncate font-sans">{networkUser.name}</h4>
                          <span className="text-[10px] text-blue-600 font-bold block mt-0.5 truncate">{networkUser.role}</span>
                          <span className="text-[9px] text-slate-400 font-medium block truncate">{networkUser.location}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setDraftConnections(draftConnections.filter((_, subIdx) => subIdx !== idx));
                        }}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0 animate-fadeIn"
                        title="Remove connection"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-2.5xl p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  <Users className="w-4 h-4 text-blue-500" />
                  Scouting & Athlete Network
                </h2>
                <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg border border-slate-200">
                  Nagpur Hub
                </span>
              </div>

              {/* Network Contacts list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                {(profile.connections || [
                  { name: "Coach Sanjay Ranade", role: "Elite Soccer Coach", location: "Nagpur, India", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150" },
                  { name: "Priya Deshmukh", role: "National Gymnast", location: "Mumbai, Maharashtra", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" },
                  { name: "Arjun Mehta", role: "Talent Scout", location: "Mumbai, India", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150" },
                  { name: "Rohan Kulkarni", role: "Kabaddi Defender", location: "Nagpur, India", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" },
                  { name: "Ananya Sharma", role: "Badminton Coach", location: "Pune, India", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150" },
                  { name: "Rajesh Gaikwad", role: "Academy Director", location: "Nagpur, India", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150" }
                ]).map((networkUser, idx) => (
                  <div key={idx} className="p-4 border border-slate-150 bg-white hover:border-blue-300 rounded-2xl flex items-center gap-3 transition-colors shadow-2xs">
                    <img src={networkUser.avatar} alt={networkUser.name} className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0" />
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-slate-800 leading-tight truncate font-sans">{networkUser.name}</h4>
                      <span className="text-[10px] text-blue-600 font-bold block mt-0.5">{networkUser.role}</span>
                      <span className="text-[9px] text-slate-400 font-medium block">{networkUser.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER ATHLETIC RESUME SCOUTING CV PRINT MODAL */}
      {showPrintCV && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 overflow-y-auto flex items-center justify-center p-4 no-print animate-fadeIn">
          <style>{`
            @media print {
              body * {
                visibility: hidden !important;
              }
              #scouting-cv-print-area, #scouting-cv-print-area * {
                visibility: visible !important;
              }
              #scouting-cv-print-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                background: white !important;
                color: black !important;
                box-shadow: none !important;
                border: none !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>

          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative">
            {/* Modal actions */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                  PF
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white tracking-tight font-sans">Professional Scouting Card</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">W3C Print-standard design optimized for PDF downloads and physical club sheets.</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/10"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintCV(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-xl transition-all cursor-pointer border border-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Area Card */}
            <div 
              id="scouting-cv-print-area"
              className="bg-white border border-slate-200 text-slate-900 rounded-2xl p-6 md:p-8 space-y-6 shadow-xs relative overflow-hidden"
            >
              {/* Top Accent Strip */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-[#1D4ED8]" />

              {/* Watermark Logo */}
              <div className="absolute right-6 top-6 opacity-15">
                <div className="flex items-center space-x-1.5 font-black text-xs text-slate-400 font-mono tracking-widest uppercase">
                  <span>PLAYFOLIYO</span>
                </div>
              </div>

              {/* Athlete Header */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 border-b border-slate-100 pb-5">
                <div className="w-24 h-24 rounded-full border-2 border-[#1D4ED8] overflow-hidden bg-slate-100 shrink-0 shadow-sm">
                  <img 
                    src={profile.profile_pic || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"} 
                    alt={user.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="text-center sm:text-left space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start gap-1.5 sm:gap-2.5">
                    <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight leading-none font-sans">
                      {user.name}
                    </h2>
                    <span className="inline-flex items-center gap-1 text-[8px] bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider mx-auto sm:mx-0">
                      <span>✓ Verified Pro Athlete</span>
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#1D4ED8] capitalize tracking-wide font-sans">
                    {profile.sport} — <span className="text-slate-600 font-semibold">{profile.position || "Athlete"}</span>
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium max-w-xl italic">
                    "{profile.bio || "No biography narrative added yet."}"
                  </p>
                </div>
              </div>

              {/* Key Bio & Performance Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Left side: Bio Parameters */}
                <div className="md:col-span-5 space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-100 pb-1 flex items-center gap-1.5 font-sans">
                    <Sliders className="w-3.5 h-3.5 text-[#1D4ED8]" />
                    <span>Bio-Parameters</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 text-xs">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Age</span>
                      <span className="font-extrabold text-slate-800 font-mono">{profile.age || "21"} Years</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Gender</span>
                      <span className="font-extrabold text-slate-800 capitalize">{profile.gender || "Male"}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Height</span>
                      <span className="font-extrabold text-slate-800 font-mono">{profile.height || "5'9''"}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Weight</span>
                      <span className="font-extrabold text-slate-800 font-mono">{profile.weight || "68 kg"}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Dominant Limb</span>
                      <span className="font-extrabold text-slate-800">{profile.dominant_foot || "Right"}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Experience</span>
                      <span className="font-extrabold text-slate-800 font-mono">{profile.experience || "3"} Years</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Current Team</span>
                      <span className="font-extrabold text-slate-800">{profile.current_team || "Nagpur FC"}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Location / Region</span>
                      <span className="font-extrabold text-slate-800">{profile.location || "Nagpur, Maharashtra"}</span>
                    </div>
                  </div>
                </div>

                {/* Right side: Performance Metrics KPIs */}
                <div className="md:col-span-7 space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-100 pb-1 flex items-center gap-1.5 font-sans">
                    <Trophy className="w-3.5 h-3.5 text-[#1D4ED8]" />
                    <span>KPI Performance Metrics</span>
                  </h4>
                  
                  {/* Custom KPIs list */}
                  <div className="grid grid-cols-2 gap-3.5">
                    {/* Render standard KPIs of the first sport */}
                    {selectedSports.map((sportName) => {
                      const matchedTemplate = SportsMetricsService.getTemplateForSport(sportName);
                      if (!matchedTemplate) return null;
                      return matchedTemplate.fields.map((field) => {
                        const val = metrics[field.id];
                        if (val === undefined || val === "") return null;
                        return (
                          <div key={field.id} className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                            <span className="text-[8px] text-slate-400 font-bold block uppercase tracking-wider truncate" title={field.name}>{field.name}</span>
                            <span className="text-xs text-slate-800 font-black font-mono">{val} {field.unit || ""}</span>
                          </div>
                        );
                      });
                    })}

                    {/* Fallback default sports metrics */}
                    {selectedSports.length === 0 && (
                      <>
                        <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                          <span className="text-[8px] text-slate-400 font-bold block uppercase tracking-wider">Matches Played</span>
                          <span className="text-xs text-slate-800 font-black font-mono">{matchesPlayed}</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                          <span className="text-[8px] text-slate-400 font-bold block uppercase tracking-wider">Goals scored</span>
                          <span className="text-xs text-slate-800 font-black font-mono">{goals}</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                          <span className="text-[8px] text-slate-400 font-bold block uppercase tracking-wider">Assists logged</span>
                          <span className="text-xs text-slate-800 font-black font-mono">{assists}</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                          <span className="text-[8px] text-slate-400 font-bold block uppercase tracking-wider">Pass accuracy</span>
                          <span className="text-xs text-slate-800 font-black font-mono">{passAccuracy}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Attribute Ratings (Radar equivalent) */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Athletic Attribute Sliders</span>
                    <div className="space-y-2 bg-slate-50/50 border border-slate-100 p-3.5 rounded-xl">
                      {SportsMetricsService.getPerformanceAttributesForSport(selectedSports[0] || "Football").slice(0, 3).map((attr) => {
                        const attrKey = `radar_${selectedSports[0] || 'Football'}_${attr.id}`;
                        const val = metrics[attrKey] !== undefined ? metrics[attrKey] : attr.defaultVal;
                        return (
                          <div key={attr.id} className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-slate-700">
                              <span>{attr.label}</span>
                              <span className="font-mono text-[#1D4ED8]">{val} / 100</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-[#1D4ED8] h-1.5 rounded-full" style={{ width: `${val}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tournaments, Medals & Credentials section */}
              <div className="space-y-3.5 border-t border-slate-100 pt-5">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 font-sans">
                  <Award className="w-3.5 h-3.5 text-[#1D4ED8]" />
                  <span>Official Tournament Wins & Credentials achievements</span>
                </h4>
                <div className="text-xs text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100 whitespace-pre-line font-medium italic">
                  {profile.achievements || "• Winner of National School Games Championship\n• Golden Boot Awardee Nagpur Zilla League\n• Federation Certificate Level-1 Registration Verified"}
                </div>
              </div>

              {/* Footnote branding */}
              <div className="flex justify-between items-center text-[8px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-100 pt-4 font-mono">
                <span>PlayFoliyo Scout Registry ID: {user.id.slice(0, 8).toUpperCase()}</span>
                <span>SYSTEM VERIFIED AT {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL SETTINGS MODAL */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-250">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-4xl overflow-hidden flex flex-col md:flex-row h-[90vh] max-h-[640px] animate-in zoom-in-95 duration-200">
            {/* Sidebar navigation */}
            <div className="w-full md:w-64 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200/80 p-6 flex flex-col justify-between shrink-0">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <span>Control Room</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">Configure your athletic profile & preferences</p>
                </div>

                <nav className="space-y-1">
                  {[
                    { id: "privacy", label: "🔒 Privacy Controls", desc: "Profile & visibility settings" },
                    { id: "notifications", label: "🔔 Notifications", desc: "Alerts, DM & email setup" },
                    { id: "interface", label: "🌐 System Preference", desc: "Language, timezone & style" },
                    { id: "security", label: "🔑 Security & Account", desc: "Passwords & credential roles" },
                    { id: "danger", label: "⚠️ Danger Zone", desc: "Deactivation & termination" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSettingsTab(tab.id as any)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all cursor-pointer block ${
                        activeSettingsTab === tab.id
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/15"
                          : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                      }`}
                    >
                      <span className="text-xs font-black block leading-none">{tab.label}</span>
                      <span className={`text-[9px] block mt-1 font-medium ${
                        activeSettingsTab === tab.id ? "text-blue-100" : "text-slate-400"
                      }`}>{tab.desc}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="hidden md:block">
                <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-4">
                  <span className="text-[9px] font-black text-blue-700 block uppercase tracking-wider">PlayFoliyo Sync</span>
                  <span className="text-[10px] text-slate-500 font-semibold block mt-1 leading-relaxed">All adjustments are immediately applied to your active scouting ID globally.</span>
                </div>
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 flex flex-col min-w-0 bg-white">
              {/* Header */}
              <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-white">
                <div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider block">PlayFoliyo Account Settings</span>
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight mt-0.5">
                    {activeSettingsTab === "privacy" && "🔒 Privacy Controls"}
                    {activeSettingsTab === "notifications" && "🔔 Notification Preferences"}
                    {activeSettingsTab === "interface" && "🌐 System Preferences"}
                    {activeSettingsTab === "security" && "🔑 Security & Account Type"}
                    {activeSettingsTab === "danger" && "⚠️ Danger Zone Controls"}
                  </h2>
                </div>
                <button
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable body content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activeSettingsTab === "privacy" && (
                  <div className="space-y-5 animate-in fade-in duration-150">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Profile Visibility</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { value: "public", label: "Public Mode", desc: "Visible to all scouts & athletes" },
                          { value: "private", label: "Incognito Mode", desc: "Completely private, search hidden" },
                          { value: "network", label: "Connections Only", desc: "Only accepted partners see data" }
                        ].map((v) => (
                          <label
                            key={v.value}
                            className={`p-3.5 rounded-2xl border-2 cursor-pointer block transition-all ${
                              profileVisibility === v.value
                                ? "border-blue-600 bg-blue-50/25"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="privacyMode"
                              value={v.value}
                              checked={profileVisibility === v.value}
                              onChange={(e) => setProfileVisibility(e.target.value as any)}
                              className="sr-only"
                            />
                            <span className="text-xs font-black text-slate-800 block">{v.label}</span>
                            <span className="text-[9px] text-slate-400 font-semibold block mt-1 leading-snug">{v.desc}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 space-y-4">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Display Email on Profile Card</span>
                          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Let verified scouts see your primary inbox directly</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={showEmail}
                          onChange={(e) => setShowEmail(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Allow Direct Messages</span>
                          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Let coaches and other athletes direct-message you in chat</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={allowDirectMessages}
                          onChange={(e) => setAllowDirectMessages(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeSettingsTab === "notifications" && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <p className="text-xs text-slate-400 font-medium">Control when and how you are notified across the PlayFoliyo ecosystem.</p>
                    
                    <div className="space-y-3.5">
                      {[
                        { state: notifEmail, setter: setNotifEmail, label: "Send Email Digests", desc: "Receive weekly notifications, connection summaries, and platform news via email." },
                        { state: notifPush, setter: setNotifPush, label: "Enable Live Push Notifications", desc: "Get real-time browser indicators for instant chat messages and trial invitations." },
                        { state: notifMessages, setter: setNotifMessages, label: "Direct Message Alerts", desc: "Notify me immediately when receiving direct messages from scouts or sponsors." },
                        { state: notifOpportunities, setter: setNotifOpportunities, label: "Trial & Opportunity Matches", desc: "Receive high-priority alerts whenever a trial matches your registered sports segment." },
                        { state: notifFollowers, setter: setNotifFollowers, label: "New Follower Alerts", desc: "Get notified when athletes follow your updates or share your scouting video reel." }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50/80 rounded-2xl border border-slate-150">
                          <div className="max-w-[80%]">
                            <span className="text-xs font-bold text-slate-800 block">{item.label}</span>
                            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5 leading-relaxed">{item.desc}</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={item.state}
                            onChange={(e) => item.setter(e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSettingsTab === "interface" && (
                  <div className="space-y-5 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 block">Preferred System Language</label>
                        <select
                          value={preferredLanguage}
                          onChange={(e) => setPreferredLanguage(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-blue-500 bg-slate-50 font-semibold"
                        >
                          <option value="English">English (United States)</option>
                          <option value="Hindi">हिन्दी (Hindi)</option>
                          <option value="Marathi">मराठी (Marathi)</option>
                          <option value="Spanish">Español (Spanish)</option>
                          <option value="German">Deutsch (German)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 block">Local Timezone</label>
                        <select
                          value={timezone}
                          onChange={(e) => setTimezone(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-blue-500 bg-slate-50 font-semibold"
                        >
                          <option value="GMT+5:30">GMT+05:30 (India Standard Time)</option>
                          <option value="GMT-5">GMT-05:00 (Eastern Standard Time)</option>
                          <option value="GMT">GMT+00:00 (Greenwich Mean Time)</option>
                          <option value="GMT+8">GMT+08:00 (Singapore Standard Time)</option>
                        </select>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 space-y-4">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Auto-Play Performance Reels</span>
                          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Play scouting reels instantly when scrolling through highlights</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={autoPlayVideos}
                          onChange={(e) => setAutoPlayVideos(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Compact Dashboard View</span>
                          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Collapse visual banners and optimize grid density on slow networks</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={compactDashboard}
                          onChange={(e) => setCompactDashboard(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeSettingsTab === "security" && (
                  <div className="space-y-6 animate-in fade-in duration-150">
                    {/* Role Switch Area */}
                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-3">
                      <div>
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider block">Federation Registry Role</span>
                        <h4 className="text-xs font-bold text-slate-800 mt-0.5">Switch Scouting Role Card</h4>
                        <p className="text-[9px] text-slate-400 font-semibold leading-relaxed">Most networks allow changing account credentials. Toggle your profile to act as an athlete, scout, sponsor, or club.</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-blue-500 bg-white font-bold text-slate-700 min-w-44"
                        >
                          <option value="athlete">🏆 Athlete (Player Registry)</option>
                          <option value="coach">📋 Sports Coach / Trainer</option>
                          <option value="scout">🔍 Professional Scout / Recruiter</option>
                          <option value="sponsor">💼 Corporate Sponsor / Brand</option>
                          <option value="academy">🛡️ Academy / Sports Club</option>
                        </select>
                        <button
                          onClick={handleSwitchRole}
                          disabled={isChangingRole}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-4 py-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          {isChangingRole ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Switching...</span>
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-3 h-3" />
                              <span>Change Role</span>
                            </>
                          )}
                        </button>
                      </div>
                      {roleChangeSuccess && (
                        <div className="p-2.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-100 flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Scouting role successfully converted to {selectedRole.toUpperCase()}! Refresh to redraw dashboard.</span>
                        </div>
                      )}
                    </div>

                    {/* Change Password Form */}
                    <form onSubmit={handleChangePassword} className="space-y-4 border-t border-slate-100 pt-5">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">🔒 Change Account Password</h4>
                        <p className="text-[10px] text-slate-400 font-semibold">Change your password to keep your scouting statistics secured.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 block">Current Password</label>
                          <input
                            type="password"
                            value={currentPasswordInput}
                            onChange={(e) => setCurrentPasswordInput(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 block">New Password</label>
                          <input
                            type="password"
                            value={newPasswordInput}
                            onChange={(e) => setNewPasswordInput(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 block">Confirm New Password</label>
                          <input
                            type="password"
                            value={confirmPasswordInput}
                            onChange={(e) => setConfirmPasswordInput(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                          />
                        </div>
                      </div>

                      {passwordStatus.msg && (
                        <div className={`p-2.5 rounded-xl border text-[10px] font-bold flex items-center gap-1.5 ${
                          passwordStatus.type === "success" 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                            : "bg-rose-50 text-rose-700 border-rose-100"
                        }`}>
                          {passwordStatus.type === "success" ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Shield className="w-3.5 h-3.5 text-rose-500" />
                          )}
                          <span>{passwordStatus.msg}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isChangingPassword}
                        className="bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isChangingPassword ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Saving Password...</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Update Password</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}

                {activeSettingsTab === "danger" && (
                  <div className="space-y-5 animate-in fade-in duration-150">
                    <div className="p-4 bg-rose-50 rounded-2xl border border-rose-150 space-y-2">
                      <h4 className="text-xs font-black text-rose-800 uppercase flex items-center gap-2">
                        <Shield className="w-4 h-4 text-rose-600" />
                        <span>Irreversible Scouting Termination Option</span>
                      </h4>
                      <p className="text-[10px] text-rose-700 font-semibold leading-relaxed">
                        Deactivating or deleting this account will immediately strip your registered scouting cards, delete your highlight video reels, and disconnect your follower network. No scouts will be able to lookup your history.
                      </p>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-slate-200 rounded-2xl gap-3">
                        <div className="max-w-[70%]">
                          <span className="text-xs font-bold text-slate-800 block">Deactivate Account</span>
                          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Temporarily hide your profile from search rankings. You can restore it anytime by logging back in.</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to temporarily deactivate your scouting card? You can log back in anytime to restore it.")) {
                              alert("Profile temporarily deactivated. Logging out.");
                              setIsSettingsModalOpen(false);
                              localStorage.removeItem("playfoliyo_user");
                              localStorage.removeItem("playfoliyo_profile");
                              window.location.reload();
                            }
                          }}
                          className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-[10px] font-bold text-slate-600 cursor-pointer whitespace-nowrap"
                        >
                          Deactivate
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-rose-100 rounded-2xl gap-3 bg-rose-50/10">
                        <div className="max-w-[70%]">
                          <span className="text-xs font-bold text-rose-800 block">Permanently Delete Account</span>
                          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Completely scrub all sports metrics, documents, highlight reels, and chats. This cannot be undone.</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm("⚠️ CRITICAL WARNING ⚠️\n\nAre you absolutely sure you want to permanently delete your athletic account? This will permanently wipe all your records and achievements from PlayFoliyo databases. This is IRREVERSIBLE.")) {
                              fetch(`/api/admin/users/${user.id}/delete`, { method: "POST" })
                                .then(() => {
                                  alert("Account permanently deleted. Hope to see you back on the field soon!");
                                  setIsSettingsModalOpen(false);
                                  localStorage.removeItem("playfoliyo_user");
                                  localStorage.removeItem("playfoliyo_profile");
                                  window.location.reload();
                                });
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold cursor-pointer whitespace-nowrap shadow-md shadow-rose-500/10"
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4.5 border-t border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                <div className="flex items-center gap-2">
                  {settingsSuccess && (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Adjustments saved!</span>
                    </span>
                  )}
                  {settingsError && (
                    <span className="text-[10px] font-bold text-rose-600">
                      {settingsError}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsSettingsModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-[11px] font-bold text-slate-600 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-5 py-2 rounded-xl shadow-md shadow-blue-500/10 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
                  >
                    {isSavingSettings ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      "Save Preferences"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPORT MODAL */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">Community Shield</span>
                <h3 className="text-sm font-black text-slate-800 uppercase mt-0.5">Report Athlete Profile</h3>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="text-slate-400 hover:bg-slate-50 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="p-6 space-y-4">
              {reportSuccess ? (
                <div className="p-4 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-2xl border border-emerald-100 flex flex-col items-center text-center gap-2">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                  <span>Report Submitted Successfully</span>
                  <p className="text-[10px] text-slate-400 font-semibold font-sans mt-1">Our system moderators will audit this scouting card within 24 hours.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Reason for Complaint</label>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 font-bold text-slate-700 focus:bg-white"
                    >
                      <option value="Spam">Fake profile / Spam content</option>
                      <option value="Harassment">Abuse, Harassment, or Hate Speech</option>
                      <option value="Impersonation">Impersonating an athlete or scout</option>
                      <option value="Inappropriate">Inappropriate highlight video or photos</option>
                      <option value="Other">Other compliance concern</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Detailed Description</label>
                    <textarea
                      value={reportText}
                      onChange={(e) => setReportText(e.target.value)}
                      placeholder="Please provide specifics about this report..."
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-hidden font-medium"
                      required
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsReportModalOpen(false)}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/10"
                    >
                      Submit Complaint
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* BLOCK MODAL */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-600">
                <EyeOff className="w-6 h-6" />
              </div>
              
              {blockSuccess ? (
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-slate-800">Athlete Blocked Successfully</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">This user will no longer be able to message you or view your highlight reels.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-800">Block Athlete?</h3>
                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                      You will no longer receive messages or connection invites from this profile. They will be hidden from your feed and discover listings entirely.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setIsBlockModalOpen(false)}
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBlockSubmit}
                      className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Confirm Block
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
