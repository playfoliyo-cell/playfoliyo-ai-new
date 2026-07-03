-- PLAYFOLIYO SUPABASE DATABASE SCHEMA SETUP
-- Copy and execute this SQL block inside your Supabase Project's SQL Editor

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_status TEXT DEFAULT 'unverified',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    user_id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    profile_pic TEXT,
    cover_pic TEXT,
    sport TEXT,
    position TEXT,
    age TEXT,
    gender TEXT,
    location TEXT,
    bio TEXT,
    current_team TEXT,
    previous_teams TEXT,
    height TEXT,
    weight TEXT,
    dominant_foot TEXT,
    experience TEXT,
    rankings TEXT,
    achievements TEXT,
    facilities TEXT,
    sports_offered TEXT,
    organization TEXT,
    region TEXT,
    sponsorship_areas TEXT,
    budget_range TEXT,
    contact_info TEXT,
    followers TEXT[] DEFAULT '{}'::text[],
    following TEXT[] DEFAULT '{}'::text[],
    metrics JSONB DEFAULT '{}'::jsonb
);

-- 3. Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_role TEXT NOT NULL,
    author_avatar TEXT,
    content TEXT,
    media_url TEXT,
    media_type TEXT,
    category TEXT DEFAULT 'general',
    likes TEXT[] DEFAULT '{}'::text[],
    comments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Opportunities Table
CREATE TABLE IF NOT EXISTS public.opportunities (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    organization TEXT NOT NULL,
    org_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    org_avatar TEXT,
    type TEXT NOT NULL,
    sport TEXT,
    location TEXT,
    description TEXT,
    requirements TEXT,
    budget TEXT,
    applications TEXT[] DEFAULT '{}'::text[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Tournaments Table
CREATE TABLE IF NOT EXISTS public.tournaments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sport TEXT,
    location TEXT,
    status TEXT DEFAULT 'upcoming',
    dates TEXT,
    description TEXT,
    results TEXT,
    registrations TEXT[] DEFAULT '{}'::text[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id TEXT PRIMARY KEY,
    sender_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    receiver_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    read BOOLEAN DEFAULT FALSE
);

-- 7. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 8. Verifications Table
CREATE TABLE IF NOT EXISTS public.verifications (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    user_name TEXT,
    user_role TEXT,
    identity_proof TEXT,
    sports_certificates TEXT,
    federation_records TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 9. Sport Metric Templates Table
CREATE TABLE IF NOT EXISTS public.sport_metric_templates (
    id TEXT PRIMARY KEY,
    sport TEXT UNIQUE,
    fields JSONB DEFAULT '[]'::jsonb
);

-- 10. Blocks Table
CREATE TABLE IF NOT EXISTS public.blocks (
    id TEXT PRIMARY KEY,
    blocker_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    blocked_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(blocker_id, blocked_id)
);

-- 11. Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
    id TEXT PRIMARY KEY,
    reporter_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    reported_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 12. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    ip_address TEXT
);

-- Security Indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON public.messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_blocks_blocker_blocked ON public.blocks(blocker_id, blocked_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported ON public.reports(reported_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_timestamp ON public.audit_logs(user_id, timestamp);

-- Enable Row Level Security (RLS) for simple sandbox prototyping or configure public read/write
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sport_metric_templates DISABLE ROW LEVEL SECURITY;

-- Enable Row Level Security on Security-Hardened Tables
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create Proper Row Level Security Policies
-- Messages Policy: Users can only read/write messages they participate in
CREATE POLICY messages_access_policy ON public.messages 
    FOR ALL 
    TO authenticated 
    USING (sender_id = auth.uid() OR receiver_id = auth.uid())
    WITH CHECK (sender_id = auth.uid());

-- Blocks Policy: Users can read/write their own block records
CREATE POLICY blocks_access_policy ON public.blocks
    FOR ALL
    TO authenticated
    USING (blocker_id = auth.uid() OR blocked_id = auth.uid())
    WITH CHECK (blocker_id = auth.uid());

-- Reports Policy: Users can submit reports and read their own reports
CREATE POLICY reports_access_policy ON public.reports
    FOR ALL
    TO authenticated
    USING (reporter_id = auth.uid())
    WITH CHECK (reporter_id = auth.uid());

-- Audit Logs Policy: Users can view their own logs, and admins can view all logs
CREATE POLICY audit_logs_access_policy ON public.audit_logs
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY audit_logs_insert_policy ON public.audit_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());
