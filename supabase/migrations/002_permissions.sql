-- Grant schema usage permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant table-level read/write permissions on public.cards
GRANT ALL PRIVILEGES ON TABLE public.cards TO postgres, anon, authenticated, service_role;

-- Grant table-level read/write permissions on public.reactions
GRANT ALL PRIVILEGES ON TABLE public.reactions TO postgres, anon, authenticated, service_role;

-- Grant table-level read/write permissions on public.contributions
GRANT ALL PRIVILEGES ON TABLE public.contributions TO postgres, anon, authenticated, service_role;

-- Grant table-level read/write permissions on public.rsvps
GRANT ALL PRIVILEGES ON TABLE public.rsvps TO postgres, anon, authenticated, service_role;

-- Re-enable RLS on all tables (precautionary)
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- Note: Ensure that the RLS policies defined in 001_initial.sql are active. 
-- Specifically, public insert/select permissions are controlled by the corresponding 
-- policy WITH CHECK / USING rules.
