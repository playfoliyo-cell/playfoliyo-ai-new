import React, { useState, useEffect, useRef } from "react";
import { 
  Play, Plus, Trash2, Heart, Eye, Video, Loader2, 
  ChevronLeft, ChevronRight, Clock, Sparkles, Upload, X, Activity, Award
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { HighlightReel, Profile, User } from "../types";
import { uploadMedia } from "../lib/supabase";

interface HighlightReelsProps {
  user: User;
  profile: Profile;
  isSelf: boolean;
  onUpdateProfile: (updatedProfile: Profile) => void;
}

// Map sports to beautiful action backgrounds for fallbacks
const SPORT_FALLBACK_IMAGES: Record<string, string> = {
  football: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=600",
  soccer: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=600",
  basketball: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=600",
  cricket: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=600",
  volleyball: "https://images.unsplash.com/photo-1592656094267-764a45160876?auto=format&fit=crop&q=80&w=600",
  badminton: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=600",
  tennis: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80&w=600",
  kabaddi: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=600",
  athletics: "https://images.unsplash.com/photo-1502224562085-639556652f33?auto=format&fit=crop&q=80&w=600",
  general: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=600"
};

const getSportFallbackImage = (sport: string): string => {
  const norm = sport.toLowerCase();
  for (const key of Object.keys(SPORT_FALLBACK_IMAGES)) {
    if (norm.includes(key)) return SPORT_FALLBACK_IMAGES[key];
  }
  return SPORT_FALLBACK_IMAGES.general;
};

// Default seed highlight reels for user Kartik Sharma or other athletes
const DEFAULT_SEEDS: HighlightReel[] = [
  {
    id: "reel-seed-1",
    title: "Free Kick Screamer vs Mumbai Elite",
    video_url: "https://assets.mixkit.co/videos/preview/mixkit-soccer-player-kicking-ball-in-the-stadium-3180-large.mp4",
    sport: "Football (Soccer)",
    description: "Tucked it into the top corner from 30 yards out during the Nagpur District Cup Semifinals in front of 3,000 spectators.",
    thumbnail_url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=600",
    duration: "1:05",
    views: 842,
    likes: 124,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "reel-seed-2",
    title: "Midfield Assist & Defense Splitter",
    video_url: "https://assets.mixkit.co/videos/preview/mixkit-soccer-ball-being-kicked-by-a-player-3181-large.mp4",
    sport: "Football (Soccer)",
    description: "Key passes, overhead lobs, and a precise defense-splitting through ball that set up our crucial counter-attack goal.",
    thumbnail_url: "https://images.unsplash.com/photo-1540747737956-378724044592?auto=format&fit=crop&q=80&w=600",
    duration: "2:15",
    views: 512,
    likes: 76,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "reel-seed-3",
    title: "Agility Training & Cone Drills",
    video_url: "https://assets.mixkit.co/videos/preview/mixkit-soccer-player-training-on-the-field-3182-large.mp4",
    sport: "Football (Soccer)",
    description: "Daily technical drills exhibiting shuttle sprints, cone weaves, and first-touch controls under high pressure.",
    thumbnail_url: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=600",
    duration: "0:45",
    views: 318,
    likes: 45,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export default function HighlightReels({ user, profile, isSelf, onUpdateProfile }: HighlightReelsProps) {
  const isSeeded = ["u-athlete1", "u-coach1", "u-club1", "u-scout1", "u-sponsor1", "u-admin"].includes(profile.user_id);

  const [reels, setReels] = useState<HighlightReel[]>([]);
  const [activePlay, setActivePlay] = useState<HighlightReel | null>(null);
  const [videoError, setVideoError] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    setVideoError(false);
  }, [activePlay]);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  // Add form state
  const [newTitle, setNewTitle] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newSport, setNewSport] = useState(profile.sport?.split(",")[0]?.trim() || "Football (Soccer)");
  const [newDescription, setNewDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Load and seed initial reels
  useEffect(() => {
    if (profile.highlight_reels && profile.highlight_reels.length > 0) {
      setReels(profile.highlight_reels);
    } else {
      if (isSeeded) {
        // Seed default reels for our core user
        setReels(DEFAULT_SEEDS);
        // Persist the seeded plays to the profile on first mount
        const updatedProfile = {
          ...profile,
          highlight_reels: DEFAULT_SEEDS
        };
        onUpdateProfile(updatedProfile);
      } else {
        // New user gets clean blank reels
        setReels([]);
      }
    }
  }, [profile.highlight_reels, profile.user_id]);

  // Handle Carousel Scrolling
  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = 340;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  // Helper to format video duration
  const formatDuration = (secs: number): string => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Dynamic Video Metadata and Thumbnail extraction
  const processVideoMetadata = (url: string): Promise<{ duration: string; thumbnail?: string }> => {
    return new Promise((resolve) => {
      // Check if it is a Youtube URL
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        let videoId = "";
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
          videoId = match[2];
        }
        if (videoId) {
          resolve({
            duration: "3:00",
            thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
          });
          return;
        }
      }

      // If Vimeo
      if (url.includes("vimeo.com")) {
        const vimeoId = url.split("/").pop() || "";
        if (vimeoId) {
          resolve({
            duration: "2:00",
            thumbnail: `https://vumbnail.com/${vimeoId}.jpg`
          });
          return;
        }
      }

      // If direct HTML5 video url
      const video = document.createElement("video");
      video.src = url;
      video.crossOrigin = "anonymous";
      video.preload = "metadata";

      // Set timeout in case it hangs
      const timeoutId = setTimeout(() => {
        resolve({ duration: "1:30" });
      }, 8000);

      video.onloadedmetadata = () => {
        // Attempt to seek to half of duration to grab a preview frame
        video.currentTime = Math.min(2, video.duration / 2);
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = 640;
          canvas.height = 360;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
            clearTimeout(timeoutId);
            resolve({
              duration: formatDuration(video.duration),
              thumbnail: dataUrl
            });
          } else {
            clearTimeout(timeoutId);
            resolve({ duration: formatDuration(video.duration) });
          }
        } catch (e) {
          console.warn("CORS/Canvas thumbnail restriction on URL. Applying fallback.", e);
          clearTimeout(timeoutId);
          resolve({ duration: formatDuration(video.duration) });
        }
      };

      video.onerror = () => {
        clearTimeout(timeoutId);
        resolve({ duration: "1:15" });
      };
    });
  };

  // Video File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setErrorMsg("Please upload a valid video file.");
      return;
    }

    setUploadProgress(true);
    setErrorMsg("");

    try {
      const url = await uploadMedia(file);
      setNewVideoUrl(url);
    } catch (err) {
      console.error("Video file upload error", err);
      setErrorMsg("Failed to upload video file. Please enter a URL or retry.");
    } finally {
      setUploadProgress(false);
    }
  };

  // Submit and save new play
  const handleAddPlay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newVideoUrl.trim()) {
      setErrorMsg("Title and Video URL are required.");
      return;
    }

    setErrorMsg("");
    setIsAnalyzing(true);
    setAnalysisProgress(20);

    // Simulate progress steps for polished high-fidelity AI feel
    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 85) return prev;
        return prev + 15;
      });
    }, 250);

    try {
      const meta = await processVideoMetadata(newVideoUrl.trim());
      setAnalysisProgress(100);
      clearInterval(interval);

      const newReel: HighlightReel = {
        id: "reel-" + Math.random().toString(36).substr(2, 9),
        title: newTitle.trim(),
        video_url: newVideoUrl.trim(),
        sport: newSport,
        description: newDescription.trim(),
        thumbnail_url: meta.thumbnail || getSportFallbackImage(newSport),
        duration: meta.duration,
        views: 0,
        likes: 0,
        created_at: new Date().toISOString()
      };

      setTimeout(() => {
        const updatedList = [newReel, ...reels];
        setReels(updatedList);
        
        // Update profile schema
        const updatedProfile = {
          ...profile,
          highlight_reels: updatedList
        };
        onUpdateProfile(updatedProfile);

        // Reset form
        setNewTitle("");
        setNewVideoUrl("");
        setNewDescription("");
        setIsAddModalOpen(false);
        setIsAnalyzing(false);
      }, 500);

    } catch (e) {
      console.error(e);
      setErrorMsg("An error occurred during video analysis. Please try again.");
      setIsAnalyzing(false);
      clearInterval(interval);
    }
  };

  // Delete play
  const handleDeletePlay = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedList = reels.filter((r) => r.id !== id);
    setReels(updatedList);
    const updatedProfile = {
      ...profile,
      highlight_reels: updatedList
    };
    onUpdateProfile(updatedProfile);
  };

  // Like Play Interaction
  const handleLikePlay = (reelId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedList = reels.map((r) => {
      if (r.id === reelId) {
        // Simple client toggle simulation
        const currentLikes = r.likes || 0;
        const hasLiked = (r as any).hasLiked;
        return {
          ...r,
          likes: hasLiked ? currentLikes - 1 : currentLikes + 1,
          hasLiked: !hasLiked
        };
      }
      return r;
    });
    setReels(updatedList);
    const updatedProfile = {
      ...profile,
      highlight_reels: updatedList
    };
    onUpdateProfile(updatedProfile);
  };

  // Watch/Click Play
  const handleWatchPlay = (reel: HighlightReel) => {
    setActivePlay(reel);
    // Increment view count dynamically on watch click
    const updatedList = reels.map((r) => {
      if (r.id === reel.id) {
        return {
          ...r,
          views: (r.views || 0) + 1
        };
      }
      return r;
    });
    setReels(updatedList);
    const updatedProfile = {
      ...profile,
      highlight_reels: updatedList
    };
    onUpdateProfile(updatedProfile);
  };

  // Helper to check YouTube URLs
  const getEmbedVideoUrl = (url: string) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      let videoId = "";
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) videoId = match[2];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    if (url.includes("vimeo.com")) {
      const vimeoId = url.split("/").pop() || "";
      return `https://player.vimeo.com/video/${vimeoId}?autoplay=1`;
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2.5xl p-6 shadow-3xs space-y-5">
      {/* Header of Highlight Reels */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Athlete Highlight Reels</h2>
          </div>
          <p className="text-[10px] text-slate-400 font-bold mt-1">DYNAMIC GAME TAPES & SCOUTING REELS</p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-start">
          {/* Carousel Arrows */}
          <div className="flex items-center gap-1.5 mr-1">
            <button
              onClick={() => scroll("left")}
              className="p-2 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-xl text-slate-600 cursor-pointer transition-all shadow-xs"
              title="Previous Reels"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-xl text-slate-600 cursor-pointer transition-all shadow-xs"
              title="Next Reels"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {isSelf && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-2.5 rounded-xl border border-blue-500 shadow-sm flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Play Tape</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Carousel viewport */}
      <div className="relative">
        {reels.length === 0 ? (
          <div className="border border-dashed border-slate-200 p-8 rounded-2xl text-center">
            <Video className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-500">No highlight play tapes loaded yet.</p>
            <p className="text-[10px] text-slate-400 mt-1">Upload your elite game moments for scouts and directors.</p>
            {isSelf && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-3.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-wider px-4 py-2 border border-blue-100 rounded-xl"
              >
                Upload First Clip
              </button>
            )}
          </div>
        ) : (
          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto scrollbar-none pb-2 snap-x snap-mandatory scroll-smooth"
          >
            {reels.map((reel) => {
              const hasLiked = (reel as any).hasLiked;
              return (
                <div
                  key={reel.id}
                  onClick={() => handleWatchPlay(reel)}
                  className="w-[290px] sm:w-[320px] bg-slate-50 border border-slate-200/80 hover:border-blue-400/70 hover:shadow-md hover:bg-white rounded-2xl p-3 shrink-0 snap-start transition-all cursor-pointer group"
                >
                  {/* Thumbnail Cover Wrapper */}
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                    <img
                      src={reel.thumbnail_url || getSportFallbackImage(reel.sport)}
                      alt={reel.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />

                    {/* Overlay vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-60"></div>

                    {/* Duration badge */}
                    {reel.duration && (
                      <div className="absolute bottom-2.5 right-2.5 bg-slate-950/80 backdrop-blur-xs text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1 shadow">
                        <Clock className="w-2.5 h-2.5 text-blue-400" />
                        <span>{reel.duration}</span>
                      </div>
                    )}

                    {/* Centered Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-slate-950/30">
                      <div className="w-11 h-11 rounded-full bg-blue-600 border border-blue-500 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                        <Play className="w-4 h-4 fill-current ml-0.5 text-white" />
                      </div>
                    </div>

                    {/* Sport pill */}
                    <span className="absolute top-2.5 left-2.5 bg-blue-600 border border-blue-500 text-white text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-lg shadow">
                      {reel.sport}
                    </span>

                    {/* Delete button (owner only) */}
                    {isSelf && (
                      <button
                        onClick={(e) => handleDeletePlay(reel.id, e)}
                        className="absolute top-2.5 right-2.5 p-1.5 bg-slate-900/80 hover:bg-rose-600 text-slate-300 hover:text-white border border-white/10 rounded-lg shadow transition-colors cursor-pointer"
                        title="Delete highlight"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Title and stats */}
                  <div className="mt-3.5 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-black text-slate-800 leading-snug tracking-tight group-hover:text-blue-600 transition-colors line-clamp-1">
                        {reel.title}
                      </h4>
                      {/* Live views indicator */}
                      <div className="flex items-center gap-1 shrink-0 text-slate-400 text-[9px] font-bold">
                        <Eye className="w-3 h-3 text-slate-400" />
                        <span>{reel.views || 0}</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed font-medium">
                      {reel.description || "Watch dynamic physical action play, agility performance, and skill showcase."}
                    </p>

                    {/* Interactions panel */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-2.5">
                      <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        {reel.created_at ? new Date(reel.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "RECENT PLAY"}
                      </span>

                      <button
                        onClick={(e) => handleLikePlay(reel.id, e)}
                        className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                          hasLiked ? "text-rose-600" : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${hasLiked ? "fill-rose-500 text-rose-600" : ""}`} />
                        <span>{reel.likes || 0} Likes</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* THEATER PLAYBACK MODAL */}
      <AnimatePresence>
        {activePlay && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePlay(null)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl z-10 border border-slate-200"
            >
              {/* Close Button */}
              <button
                onClick={() => setActivePlay(null)}
                className="absolute top-4 right-4 z-20 p-2.5 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full cursor-pointer border border-white/10 hover:scale-105 transition-transform"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-12">
                {/* Left Side: Video player (Takes 8 cols) */}
                <div className="md:col-span-8 bg-black aspect-video flex items-center justify-center relative">
                  {getEmbedVideoUrl(activePlay.video_url) ? (
                    <iframe
                      src={getEmbedVideoUrl(activePlay.video_url) || undefined}
                      title={activePlay.title}
                      className="w-full h-full aspect-video border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : videoError ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-900 absolute inset-0 w-full h-full">
                      <span className="text-xs font-bold mb-1">Highlight Tape Playback Unavailable</span>
                      <span className="text-[10px] text-slate-500">The video file could not be loaded or is unsupported.</span>
                    </div>
                  ) : (
                    <video
                      src={activePlay.video_url}
                      controls
                      autoPlay
                      className="w-full h-full max-h-[500px] object-contain"
                      onError={() => {
                        console.warn("Video failed to load source:", activePlay.video_url);
                        setVideoError(true);
                      }}
                    />
                  )}
                </div>

                {/* Right Side: Metadata (Takes 4 cols) */}
                <div className="md:col-span-4 p-6 flex flex-col justify-between h-full min-h-[300px] md:min-h-[400px]">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <span className="bg-blue-50 border border-blue-100 text-blue-700 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg inline-block">
                        {activePlay.sport}
                      </span>
                      <h3 className="text-base font-black text-slate-800 leading-snug">
                        {activePlay.title}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {activePlay.description || "Dynamic elite performance scouting play showing critical agility, technique, physical metrics, and match intelligence."}
                    </p>

                    {/* Dynamic Metadata details */}
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl space-y-1.5 text-[10px] text-slate-500 font-bold">
                      <div className="flex justify-between">
                        <span>Duration</span>
                        <span className="text-slate-800">{activePlay.duration || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Scouted Views</span>
                        <span className="text-slate-800">{activePlay.views || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Likes</span>
                        <span className="text-slate-800">{activePlay.likes || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Uploaded On</span>
                        <span className="text-slate-800">
                          {activePlay.created_at ? new Date(activePlay.created_at).toLocaleDateString("en-IN") : "Recent"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer with action buttons */}
                  <div className="border-t border-slate-100 pt-4 mt-6 flex items-center justify-between">
                    <button
                      onClick={(e) => handleLikePlay(activePlay.id, e)}
                      className={`flex items-center gap-2 text-xs font-black uppercase tracking-wider ${
                        (activePlay as any).hasLiked ? "text-rose-600" : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${(activePlay as any).hasLiked ? "fill-rose-500 text-rose-600" : ""}`} />
                      <span>{(activePlay as any).hasLiked ? "Liked Play" : "Like Play"}</span>
                    </button>

                    <button
                      onClick={() => setActivePlay(null)}
                      className="text-[10px] font-black text-slate-500 hover:text-slate-800 uppercase tracking-wider"
                    >
                      Close Player
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD PLAY TAPES MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isAnalyzing && setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-2.5xl p-6 shadow-2xl z-10 border border-slate-200"
            >
              {isAnalyzing ? (
                <div className="p-8 text-center space-y-4">
                  <div className="relative w-16 h-16 mx-auto">
                    <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-blue-600">
                      {analysisProgress}%
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Analyzing Game Tape</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">EXTRACTING VIDEO METADATA & GENERATING PREVIEW THUMBNAILS</p>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${analysisProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAddPlay} className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-blue-600" />
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Add Scouting Play Tape</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[10px] font-bold text-rose-600">
                      {errorMsg}
                    </div>
                  )}

                  <div className="space-y-3">
                    {/* Title */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Play Title</label>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="e.g. Free Kick Winner vs Mumbai FC"
                        className="w-full border border-slate-200 p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>

                    {/* Sport Discipline selection */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Sport Discipline</label>
                      <select
                        value={newSport}
                        onChange={(e) => setNewSport(e.target.value)}
                        className="w-full border border-slate-200 p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                      >
                        {profile.sport ? (
                          profile.sport.split(",").map((s) => (
                            <option key={s.trim()} value={s.trim()}>{s.trim()}</option>
                          ))
                        ) : (
                          <>
                            <option value="Football (Soccer)">Football (Soccer)</option>
                            <option value="Basketball">Basketball</option>
                            <option value="Cricket">Cricket</option>
                            <option value="Volleyball">Volleyball</option>
                            <option value="Badminton">Badminton</option>
                          </>
                        )}
                      </select>
                    </div>

                    {/* Video URL or File Upload */}
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Video source</label>
                      
                      {/* Paste URL */}
                      <input
                        type="text"
                        value={newVideoUrl}
                        onChange={(e) => setNewVideoUrl(e.target.value)}
                        placeholder="Paste MP4 URL, Youtube link, or Vimeo URL"
                        className="w-full border border-slate-200 p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none bg-slate-50/50"
                      />

                      <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-slate-150"></div>
                        <span className="flex-shrink mx-3 text-[9px] text-slate-400 font-bold uppercase">Or Upload Video File</span>
                        <div className="flex-grow border-t border-slate-150"></div>
                      </div>

                      {/* File Uploader */}
                      <label className="w-full h-16 border border-dashed border-slate-300 hover:border-blue-400 rounded-xl flex flex-col items-center justify-center text-[10px] text-slate-500 cursor-pointer bg-slate-50/20 hover:bg-slate-50/50 transition-colors">
                        {uploadProgress ? (
                          <div className="flex items-center gap-1.5 font-bold text-blue-600">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Uploading video to cloud servers...</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-5 h-5 text-slate-400 mb-1" />
                            <span className="font-bold uppercase tracking-wide">Choose highlight video file</span>
                            <span className="text-[9px] text-slate-400 mt-0.5">MP4, WEBM formats supported</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={handleFileUpload}
                          disabled={uploadProgress}
                        />
                      </label>
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Tactical Description</label>
                      <textarea
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        rows={2}
                        placeholder="Detail the play context, tactical setup, or scouting importance..."
                        className="w-full border border-slate-200 p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl border border-slate-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploadProgress}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl border border-blue-500 shadow-sm flex items-center gap-1 cursor-pointer disabled:opacity-55"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Analyze & Add</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
