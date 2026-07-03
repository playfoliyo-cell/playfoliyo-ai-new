export interface User {
  id: string;
  name: string;
  email: string;
  role: string; // "athlete" | "coach" | "club" | "academy" | "scout" | "sponsor" | "admin"
  is_verified: boolean;
  verification_status: "unverified" | "pending" | "approved" | "rejected";
  created_at: string;
}

export interface Profile {
  user_id: string;
  profile_pic: string;
  cover_pic: string;
  sport: string;
  position: string;
  age: string;
  gender: string;
  location: string;
  bio: string;
  // Role-specific fields
  current_team?: string;
  previous_teams?: string;
  height?: string;
  weight?: string;
  dominant_foot?: string;
  experience?: string;
  rankings?: string;
  coaching_level?: string;
  certifications?: string;
  achievements?: string;
  facilities?: string;
  sports_offered?: string;
  organization?: string;
  region?: string;
  sponsorship_areas?: string;
  budget_range?: string;
  contact_info?: string;
  followers?: string[];
  following?: string[];
  
  // Settings/Preferences
  profile_visibility?: "public" | "private" | "network";
  show_email?: boolean;
  allow_direct_messages?: boolean;
  notifications_email?: boolean;
  notifications_push?: boolean;
  notifications_messages?: boolean;
  notifications_opportunities?: boolean;
  notifications_followers?: boolean;
  preferred_language?: string;
  timezone?: string;
  auto_play_videos?: boolean;
  compact_dashboard_view?: boolean;
  online_status_preference?: "everyone" | "connections" | "nobody";

  // Custom sport-specific metrics
  sport_metrics?: Record<string, string>;
  skills?: string[];
  documents?: SportDocument[];
  photos?: string[];
  instagram_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  connections?: any[];
  highlight_reels?: HighlightReel[];
}

export interface HighlightReel {
  id: string;
  title: string;
  video_url: string;
  sport: string;
  description?: string;
  thumbnail_url?: string;
  duration?: string;
  views?: number;
  likes?: number;
  created_at: string;
}

export interface SportDocument {
  id: string;
  name: string;
  file_url: string;
  file_name: string;
  type: string; // e.g., "Certificate", "Federation License", "Performance Log", "Other"
  uploaded_at: string;
  verified: boolean;
}

export interface SportMetricField {
  id: string;
  name: string; // e.g. "Vertical Jump" or "Spike Touch" or "3-Point Shot %"
  type: "text" | "number" | "select";
  unit?: string; // e.g. "cm", "%", "seconds"
  options?: string[]; // for select dropdown
  required?: boolean;
}

export interface SportMetricTemplate {
  id: string;
  sport: string; // e.g. "Volleyball", "Basketball", "Football (Soccer)"
  fields: SportMetricField[];
}

export interface Post {
  id: string;
  user_id: string;
  author_name: string;
  author_role: string;
  author_avatar: string;
  content: string;
  media_url?: string;
  media_type?: "image" | "video" | "document";
  category: "general" | "achievement" | "tournament_result";
  likes: string[];
  comments: Comment[];
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  text: string;
  created_at: string;
}

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  org_id: string;
  org_avatar: string;
  type: "scholarship" | "trial" | "recruitment" | "sponsorship" | "coaching_job" | "vacancy";
  sport: string;
  location: string;
  description: string;
  requirements: string;
  budget?: string;
  applications: string[];
  created_at: string;
}

export interface BracketMatch {
  id: string;
  roundName: string; // e.g., "Quarterfinals" | "Semifinals" | "Finals"
  team1: { name: string; score?: number; id?: string };
  team2: { name: string; score?: number; id?: string };
  winner_id?: string;
  next_match_id?: string;
  next_match_slot?: "team1" | "team2";
}

export interface TournamentBracket {
  matches: BracketMatch[];
}

export interface Tournament {
  id: string;
  name: string;
  sport: string;
  location: string;
  status: "upcoming" | "ongoing" | "completed";
  dates: string;
  description: string;
  results?: string;
  registrations: string[];
  created_at: string;
  category?: string;
  creator_id?: string;
  bracket?: TournamentBracket;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  created_at: string;
  read: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: "follower" | "profile_view" | "message" | "opportunity_match" | "tournament_update" | "sponsorship_interest" | "verification_update";
  read: boolean;
  created_at: string;
}

export interface VerificationRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  identity_proof: string;
  sports_certificates: string;
  federation_records: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}
