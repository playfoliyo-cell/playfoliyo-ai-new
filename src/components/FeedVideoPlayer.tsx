import React, { useRef, useEffect, useState } from "react";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";

interface FeedVideoPlayerProps {
  src: string;
  autoPlayPref?: boolean;
}

export default function FeedVideoPlayer({ src, autoPlayPref = true }: FeedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!autoPlayPref) {
      video.pause();
      setIsPlaying(false);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play()
              .then(() => {
                setIsPlaying(true);
              })
              .catch((err) => {
                console.warn("Autoplay was prevented or interrupted:", err);
                setIsPlaying(false);
              });
          } else {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      {
        threshold: 0.5, // 50% of the video must be in view to autoplay
      }
    );

    observer.observe(video);

    return () => {
      observer.unobserve(video);
      observer.disconnect();
    };
  }, [src, autoPlayPref]);

  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video || hasError) return;

    setHasInteracted(true);
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn("Play failed:", err);
        });
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    const newMuted = !isMuted;
    video.muted = newMuted;
    setIsMuted(newMuted);
  };

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-950 group max-h-80 flex items-center justify-center min-h-[160px]">
      <video
        ref={videoRef}
        src={src || null}
        loop
        muted={isMuted}
        playsInline
        className="w-full h-full max-h-80 object-contain cursor-pointer bg-black"
        onClick={handleTogglePlay}
        onError={() => {
          console.warn("Video failed to load source:", src);
          setHasError(true);
        }}
      />

      {hasError && (
        <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-4 text-center z-10">
          <span className="text-slate-400 text-xs font-black uppercase tracking-wider mb-1">Scouting Video Unavailable</span>
          <span className="text-slate-500 text-[10px] max-w-[240px] leading-relaxed">The video file could not be loaded or is unsupported by this browser.</span>
        </div>
      )}

      {/* Auto-playing indicator badge */}
      {autoPlayPref && !hasInteracted && isPlaying && (
        <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-700/50 text-[9px] text-blue-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5 shadow-md select-none pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          Auto-playing
        </div>
      )}

      {/* Overlay controls - hover reveals */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none flex flex-col justify-between p-3.5">
        <div /> {/* Spacer */}
        
        <div className="flex items-center justify-between w-full pointer-events-auto">
          <button
            type="button"
            onClick={handleTogglePlay}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-700/50 text-white transition-all cursor-pointer shadow-lg"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleToggleMute}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-700/50 text-white transition-all cursor-pointer shadow-lg"
          >
            {isMuted ? (
              <div className="flex items-center gap-1.5">
                <VolumeX className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-0.5">Muted</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest px-0.5">Sound On</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Muted overlay helper reminder shown initially */}
      {!hasInteracted && isPlaying && isMuted && (
        <button
          type="button"
          onClick={handleToggleMute}
          className="absolute bottom-3 right-3 bg-slate-900/75 hover:bg-slate-900/90 border border-slate-700/40 text-slate-300 hover:text-white px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
        >
          <VolumeX className="w-3 h-3" /> Click to Unmute
        </button>
      )}

      {/* Play indicator centered when paused */}
      {!isPlaying && (
        <button
          type="button"
          onClick={handleTogglePlay}
          className="absolute bg-slate-900/75 border border-slate-700/50 backdrop-blur-xs p-4 rounded-full text-white hover:scale-105 transition-transform"
        >
          <Play className="w-6 h-6 fill-white/10" />
        </button>
      )}
    </div>
  );
}
