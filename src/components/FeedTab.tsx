import React, { useState, useEffect, useRef } from "react";
import { User, Post, Profile } from "../types";
import { ThumbsUp, MessageSquare, Share2, Award, Trophy, Send, Calendar, Sparkles, Image, CheckCircle, Video, RotateCw, ArrowUp, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import FeedVideoPlayer from "./FeedVideoPlayer";
import { uploadMedia } from "../lib/supabase";

interface FeedTabProps {
  user: User;
  profile?: Profile | null;
  posts: Post[];
  isLoading?: boolean;
  onCreatePost: (postData: any) => void;
  onLikePost: (postId: string) => void;
  onCommentPost: (postId: string, text: string) => void;
  onRefresh?: () => void;
}

export default function FeedTab({ user, profile, posts, isLoading = false, onCreatePost, onLikePost, onCommentPost, onRefresh }: FeedTabProps) {
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [category, setCategory] = useState<"general" | "achievement" | "tournament_result">("general");
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<{ [postId: string]: string }>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");

  const [visiblePostsCount, setVisiblePostsCount] = useState(5);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullY, setPullY] = useState(0);
  const [isPullActive, setIsPullActive] = useState(false);
  const observerTarget = useRef<HTMLDivElement | null>(null);

  // Monitor window scroll to show/hide "Scroll to Top" button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer to auto load more posts
  useEffect(() => {
    if (!observerTarget.current || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && !isFetchingMore && visiblePostsCount < posts.length) {
          setIsFetchingMore(true);
          // Simulate server fetching latency for beautiful UX
          setTimeout(() => {
            setVisiblePostsCount((prev) => Math.min(prev + 5, posts.length));
            setIsFetchingMore(false);
          }, 800);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerTarget.current);

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [posts.length, visiblePostsCount, isFetchingMore, isLoading]);

  // Adjust visible count if posts length changes (e.g. initial loads or dynamic additions)
  useEffect(() => {
    if (posts.length > 0 && visiblePostsCount < 5) {
      setVisiblePostsCount(5);
    }
  }, [posts.length]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");
    setUploadedFileName(file.name);

    try {
      const url = await uploadMedia(file);
      setMediaUrl(url);
    } catch (err: any) {
      setUploadError(err.message || "Upload failed");
      setUploadedFileName("");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const isVideo = mediaUrl.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) || 
                    mediaUrl.includes("commondatastorage.googleapis.com") || 
                    mediaUrl.includes("mixkit.co/videos") ||
                    mediaUrl.includes("uploads") && uploadedFileName.match(/\.(mp4|webm|ogg|mov)$/i);

    onCreatePost({
      user_id: user.id,
      content,
      media_url: mediaUrl || undefined,
      media_type: mediaUrl ? (isVideo ? "video" : "image") : undefined,
      category,
    });

    setContent("");
    setMediaUrl("");
    setUploadedFileName("");
    setCategory("general");
  };

  const submitComment = (postId: string) => {
    const text = commentText[postId];
    if (!text || !text.trim()) return;

    onCommentPost(postId, text);
    setCommentText({ ...commentText, [postId]: "" });
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "achievement":
        return { label: "🏆 Breakthrough Achievement", color: "text-amber-700 bg-amber-50 border-amber-100" };
      case "tournament_result":
        return { label: "⏱️ Tournament Result", color: "text-rose-700 bg-rose-50 border-rose-100" };
      default:
        return { label: "📢 Career Update", color: "text-slate-600 bg-slate-50 border-slate-100" };
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-16">
      
      {/* Create Post Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-sm uppercase overflow-hidden">
            {profile?.profile_pic ? (
              <img src={profile.profile_pic} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user.name.slice(0, 2)
            )}
          </div>
          <div>
            <span className="font-bold text-slate-800 text-sm block">Share your sports achievements</span>
            <span className="text-[10px] text-slate-400 block uppercase tracking-wide font-semibold">Post to PlayFoliyo feed</span>
          </div>
        </div>

        <form id="create-post-form" onSubmit={handleSubmitPost} className="space-y-3">
          <textarea
            id="post-content-input"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Announce tournament scores, new personal records, trial announcements..."
            className="w-full border border-slate-200 p-2.5 rounded-lg text-xs focus:outline-hidden focus:border-blue-500 bg-slate-50/50"
          />

          <div className="space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Direct File Upload Selection */}
              <div className="flex flex-col justify-center">
                <label className="flex items-center justify-center space-x-2 border border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/25 px-3 py-2 rounded-lg cursor-pointer transition-all bg-slate-50/40">
                  <Image className="w-4 h-4 text-blue-600" />
                  <span className="text-[10px] font-bold text-slate-600">
                    {isUploading ? "Uploading..." : uploadedFileName ? `Replace: ${uploadedFileName.slice(0, 15)}...` : "Upload Image or Video"}
                  </span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>

              {/* Category selection */}
              <select
                id="post-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="border border-slate-200 px-3 py-2 rounded-lg text-[10px] font-bold text-slate-600 bg-slate-50/50 focus:outline-hidden cursor-pointer"
              >
                <option value="general">Career Update</option>
                <option value="achievement">🏆 Breakthrough Achievement</option>
                <option value="tournament_result">⏱️ Tournament Result</option>
              </select>
            </div>

            {/* Optional URL input fallback */}
            <div className="flex items-center space-x-1.5 border border-slate-200 px-3 py-1.5 rounded-lg bg-slate-50/30">
              <Video className="w-4 h-4 text-slate-400" />
              <input
                id="post-media-url-input"
                type="text"
                placeholder="Or paste an external Image/Video URL (optional)"
                value={mediaUrl}
                onChange={(e) => {
                  setMediaUrl(e.target.value);
                  if (!e.target.value) {
                    setUploadedFileName("");
                  }
                }}
                className="bg-transparent border-none text-[10px] focus:outline-hidden w-full placeholder-slate-400"
              />
            </div>

            {uploadError && (
              <p className="text-[10px] text-rose-500 font-semibold">{uploadError}</p>
            )}

            {mediaUrl && (
              <div className="flex items-center justify-between bg-slate-50 border border-slate-150 p-2 rounded-lg">
                <span className="text-[9px] text-slate-500 truncate max-w-xs font-mono">
                  Attached: {mediaUrl}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMediaUrl("");
                    setUploadedFileName("");
                  }}
                  className="text-slate-400 hover:text-rose-600 text-[9px] font-bold uppercase tracking-wider"
                >
                  Clear Attachment
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              id="post-submit-btn"
              type="submit"
              disabled={!content.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all cursor-pointer"
            >
              Post Career Record
            </button>
          </div>
        </form>
      </div>

      {/* Feed Divider & Header with subtle borders and clear spacing */}
      <div className="flex items-center justify-between pt-5 border-t border-slate-200 mt-4 pb-2">
        <div className="flex items-center space-x-2">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pathway Activity Feed</h3>
          {onRefresh && (
            <button
              id="feed-refresh-btn"
              onClick={async () => {
                if (isRefreshing) return;
                setIsRefreshing(true);
                try {
                  await onRefresh();
                  setVisiblePostsCount(5); // reset visible posts
                } catch (e) {
                  console.error(e);
                } finally {
                  setTimeout(() => setIsRefreshing(false), 800);
                }
              }}
              className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all text-[9px] font-bold uppercase cursor-pointer border border-blue-100"
            >
              <RotateCw className={`w-2.5 h-2.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
            </button>
          )}
        </div>
        <div className="h-px bg-slate-100 flex-1 mx-4"></div>
        <span className="text-[10px] text-slate-400 font-medium">{posts.length} {posts.length === 1 ? 'update' : 'updates'}</span>
      </div>

      {/* Social Posts Feed Stream */}
      {onRefresh && (
        <div className="relative mb-6 overflow-hidden bg-slate-50/50 rounded-xl border border-dashed border-slate-200 p-4 flex flex-col items-center justify-center text-center select-none group hover:bg-slate-50/80 transition-colors">
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 80 }}
            dragElastic={0.4}
            onDrag={(_, info) => {
              setPullY(info.offset.y);
              setIsPullActive(info.offset.y > 0);
            }}
            onDragEnd={async (_, info) => {
              setIsPullActive(false);
              if (info.offset.y > 55) {
                setIsRefreshing(true);
                try {
                  await onRefresh();
                  setVisiblePostsCount(5);
                } catch (e) {
                  console.error(e);
                } finally {
                  setTimeout(() => {
                    setIsRefreshing(false);
                    setPullY(0);
                  }, 800);
                }
              } else {
                setPullY(0);
              }
            }}
            style={{ y: isRefreshing ? 15 : pullY }}
            animate={!isPullActive && !isRefreshing ? { y: 0 } : undefined}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
            className="z-10 bg-white shadow-xs rounded-xl px-5 py-2.5 border border-slate-200/80 flex items-center space-x-3 cursor-grab active:cursor-grabbing hover:border-slate-300 transition-colors"
          >
            <div className="p-2 rounded-full bg-blue-50 text-blue-600">
              <RotateCw 
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} 
                style={!isRefreshing && isPullActive ? { transform: `rotate(${pullY * 4.5}deg)` } : undefined}
              />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                {isRefreshing 
                  ? "Refreshing Latest..." 
                  : pullY > 55 
                    ? "Release to refresh immediately! 🎉" 
                    : "Pull down this card to refresh"}
              </p>
              <p className="text-[9px] text-slate-400 font-medium">
                {isRefreshing ? "Checking for new pathway milestones" : "Drag it downward or use the refresh button"}
              </p>
            </div>
          </motion.div>
          
          {/* Active pull progress indicator bar */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-slate-100">
            <div 
              className="h-full bg-blue-500 transition-all duration-75"
              style={{ width: `${Math.min((pullY / 55) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`feed-skeleton-${i}`}
              className="bg-white border border-slate-150 rounded-xl p-5 shadow-xs space-y-4 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-md bg-slate-200" />
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-28" />
                    <div className="h-2 w-16 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="h-5 w-20 bg-slate-200 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-5/6" />
                <div className="h-3 bg-slate-100 rounded w-3/4" />
              </div>
              {i % 2 === 0 && (
                <div className="h-48 bg-slate-100 rounded-lg w-full" />
              )}
              <div className="flex items-center space-x-6 pt-2 border-t border-slate-100">
                <div className="h-3 w-12 bg-slate-100 rounded" />
                <div className="h-3 w-12 bg-slate-100 rounded" />
                <div className="h-3 w-12 bg-slate-100 rounded" />
              </div>
            </div>
          ))
        ) : posts.length === 0 ? (
          <div className="bg-white border border-slate-150 p-10 rounded-xl text-center shadow-xs">
            <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-3 animate-bounce" />
            <h3 className="font-bold text-slate-700 text-xs">No career records posted yet</h3>
            <p className="text-[10px] text-slate-400 mt-1">Be the first to share your athletic pathway update!</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs divide-y divide-slate-100 overflow-hidden">
            {posts.slice(0, visiblePostsCount).map((post) => {
              const hasLiked = post.likes.includes(user.id);
              const badge = getCategoryBadge(post.category);
              const showComments = activeCommentsPostId === post.id;

              return (
                <div
                  id={`feed-post-card-${post.id}`}
                  key={post.id}
                  className={`p-6 md:p-8 space-y-5 transition-all ${
                    post.category === "achievement" ? "bg-amber-50/5" : ""
                  }`}
                >
                  {/* Author Info Section - Top Header block */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-md overflow-hidden border border-slate-200 bg-slate-100">
                        <img src={post.author_avatar || null} alt={post.author_name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-1">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">{post.author_name}</span>
                          <CheckCircle className="w-3.5 h-3.5 text-blue-500 fill-blue-50 shrink-0" />
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block capitalize">
                          {post.author_role}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full border text-[9px] font-bold ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Content text and attachment block */}
                  <div className="space-y-4">
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
                      {post.content}
                    </p>

                    {/* Optional Media (Image / Match Video player) */}
                    {post.media_url && (
                      (() => {
                        const isVideo = post.media_type === "video" || 
                                        post.media_url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) || 
                                        post.media_url.includes("commondatastorage.googleapis.com") || 
                                        post.media_url.includes("mixkit.co/videos");
                        
                        const autoPlayPref = profile?.auto_play_videos !== false;

                        if (isVideo) {
                          return (
                            <div className="mt-3">
                              <FeedVideoPlayer src={post.media_url} autoPlayPref={autoPlayPref} />
                            </div>
                          );
                        }

                        return (
                          <div className="rounded-lg overflow-hidden border border-slate-150 max-h-80 bg-slate-50 mt-3">
                            <img src={post.media_url || null} alt="Post Attachment" className="w-full h-full object-cover" />
                          </div>
                        );
                      })()
                    )}
                  </div>

                  {/* Meta details footer / Timestamp */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-3.5 border-t border-slate-100">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex space-x-3 text-[10px] font-semibold text-slate-500">
                      <span>{post.likes.length} {post.likes.length === 1 ? 'Like' : 'Likes'}</span>
                      <span>•</span>
                      <span>{post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}</span>
                    </div>
                  </div>

                  {/* Post Actions (Like, Comment Drawer trigger, Share) */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100/80">
                    <button
                      id={`post-like-btn-${post.id}`}
                      onClick={() => onLikePost(post.id)}
                      className={`flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        hasLiked ? "text-blue-600 bg-blue-50" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${hasLiked ? "fill-current" : ""}`} />
                      <span>{hasLiked ? "Liked" : "Like"}</span>
                    </button>

                    <button
                      id={`post-comments-toggle-${post.id}`}
                      onClick={() => setActiveCommentsPostId(showComments ? null : post.id)}
                      className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-800 font-bold px-3 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Comments ({post.comments.length})</span>
                    </button>

                    <button
                      id={`post-share-btn-${post.id}`}
                      onClick={() => {
                        navigator.clipboard.writeText(post.content);
                      }}
                      className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-800 font-bold px-3 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Copy Link</span>
                    </button>
                  </div>

                  {/* Comments Drawer Expansion */}
                  {showComments && (
                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      {/* Add comment form */}
                      <div className="flex space-x-2">
                        <input
                          id={`post-comment-input-${post.id}`}
                          type="text"
                          placeholder="Write a supportive, sports-professional comment..."
                          value={commentText[post.id] || ""}
                          onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                          onKeyDown={(e) => e.key === "Enter" && submitComment(post.id)}
                          className="w-full border border-slate-200 px-3 py-2 rounded-lg text-xs focus:outline-hidden focus:border-blue-500 bg-slate-50/50"
                        />
                        <button
                          id={`post-comment-submit-${post.id}`}
                          onClick={() => submitComment(post.id)}
                          className="bg-slate-900 hover:bg-slate-800 text-white p-2 rounded-lg transition-all cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Comment list */}
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {post.comments.length === 0 ? (
                          <p className="text-[10px] text-slate-400 italic text-center py-2">No comments yet. Start the conversation!</p>
                        ) : (
                          post.comments.map((comment) => (
                            <div key={comment.id} className="flex items-start space-x-2 bg-slate-50/70 p-2 rounded-lg border border-slate-150">
                              <div className="w-6.5 h-6.5 rounded-md overflow-hidden shrink-0">
                                <img src={comment.user_avatar || null} alt={comment.user_name} className="w-full h-full object-cover" />
                              </div>
                              <div className="space-y-0.5">
                                <span className="font-bold text-[10px] text-slate-800 block">{comment.user_name}</span>
                                <p className="text-xs text-slate-600 leading-normal">{comment.text}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Infinite scroll indicator / Intersection Sentinel */}
        <div ref={observerTarget} className="h-10 w-full flex items-center justify-center pt-2">
          {isFetchingMore && (
            <div className="flex items-center space-x-2 py-2">
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Loading more updates...</span>
            </div>
          )}
        </div>
      </div>

      {/* Floating Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            id="scroll-to-top-btn"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="fixed bottom-20 md:bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center border border-blue-500 group"
            title="Scroll to Top"
          >
            <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
